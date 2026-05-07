'use server'

import { getSession } from '@repo/auth'
import { headers } from 'next/headers'
import {
    db,
    pathfinderGoals,
    pathfinderVerifications,
    pathfinderQuizAttempts,
    pathfinderCodingSubmissions,
    mockInterviewVoice,
    users,
    creditTransactions,
} from '@repo/db'
import { eq, and, sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import OpenAI from 'openai'
import type { VerificationAIPlan } from '@/types/pathfinder'
import { PATHFINDER_CREDITS } from '@/lib/constants/pricing'

// ================================================================================
// TYPES
// ================================================================================

export type VerificationSectionStatus = 'LOCKED' | 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED'

export interface VerificationQuizSubmission {
    goalId: string
    answers: {
        questionId: string
        selectedAnswer: number
        isCorrect: boolean
        timeTaken: number
    }[]
    totalTime: number
}

export interface VerificationCodingSubmission {
    goalId: string
    problemId: string
    code: string
    language: string
    passed: boolean
    testsPassed: number
    totalTests: number
    testResults?: {
        testId: string
        passed: boolean
        input: string
        expected: string
        actual: string
        error?: string
    }[]
}

// ================================================================================
// START VERIFICATION
// ================================================================================

export async function startVerification(goalId: string) {
    try {
        const session = await getSession(headers())
        if (!session?.user?.id) {
            return { success: false, error: 'Unauthorized' }
        }

        const goal = await db.query.pathfinderGoals.findFirst({
            where: and(eq(pathfinderGoals.id, goalId), eq(pathfinderGoals.userId, session.user.id)),
            with: { verification: true },
        })

        if (!goal) {
            return { success: false, error: 'Goal not found' }
        }

        if (goal.status !== 'ACTIVE') {
            return { success: false, error: 'Goal is not in active status' }
        }

        await db.update(pathfinderGoals)
            .set({
                status: 'VERIFICATION',
                verificationStartedAt: new Date(),
            })
            .where(eq(pathfinderGoals.id, goalId))

        revalidatePath(`/pathfinder/${goalId}`)
        return { success: true }
    } catch (error) {
        console.error('Error starting verification:', error)
        return { success: false, error: 'Failed to start verification' }
    }
}

// ================================================================================
// GET VERIFICATION STATUS
// ================================================================================

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const CUID_REGEX = /^c[a-z0-9]{24}$/i

export async function getVerificationStatus(slugOrId: string) {
    try {
        const session = await getSession(headers())
        if (!session?.user?.id) {
            return { success: false, error: 'Unauthorized', verification: null }
        }

        const isId = UUID_REGEX.test(slugOrId) || CUID_REGEX.test(slugOrId)
        const goal = await db.query.pathfinderGoals.findFirst({
            where: isId
                ? and(eq(pathfinderGoals.id, slugOrId), eq(pathfinderGoals.userId, session.user.id))
                : and(eq(pathfinderGoals.userId, session.user.id), eq(pathfinderGoals.slug, slugOrId)),
            with: { verification: true },
        })

        if (!goal) {
            return { success: false, error: 'Goal not found', verification: null }
        }

        const verification = goal.verification ?? null
        return { success: true, verification }
    } catch (error) {
        console.error('Error fetching verification status:', error)
        return { success: false, error: 'Failed to fetch status', verification: null }
    }
}

// ================================================================================
// GENERATE VERIFICATION CONTENT (on-demand with user learning context)
// ================================================================================

export async function generateVerificationContent(goalId: string) {
    try {
        const session = await getSession(headers())
        if (!session?.user?.id) {
            return { success: false, error: 'Unauthorized', plan: null }
        }

        const goal = await db.query.pathfinderGoals.findFirst({
            where: and(eq(pathfinderGoals.id, goalId), eq(pathfinderGoals.userId, session.user.id)),
            with: {
                dailySessions: {
                    orderBy: (ds: any, { desc }: any) => [desc(ds.date)],
                    limit: 14,
                    with: {
                        subGoals: {
                            columns: { title: true, quizCompleted: true, codingCompleted: true },
                            orderBy: (sg: any, { asc }: any) => [asc(sg.order)],
                        },
                    },
                },
            },
        })

        if (!goal) {
            return { success: false, error: 'Goal not found', plan: null }
        }

        const fee = PATHFINDER_CREDITS.verificationFee
        const [user] = await db.select({ credits: users.credits }).from(users).where(eq(users.id, session.user.id))
        if (!user || user.credits < fee) {
            return {
                success: false,
                error: `Insufficient credits. Verification requires ${fee} credits.`,
                plan: null,
                code: 'INSUFFICIENT_CREDITS',
                required: fee,
                available: user?.credits ?? 0,
            }
        }

        await db.update(users)
            .set({ credits: sql`${users.credits} - ${fee}` })
            .where(eq(users.id, session.user.id))
        await db.insert(creditTransactions).values({
            userId: session.user.id,
            amount: -fee,
            type: 'SPEND',
            description: `Pathfinder Verification: ${goal.title}`,
            currency: 'INR',
        })
        await db.update(pathfinderVerifications)
            .set({ verificationCreditsCharged: fee })
            .where(eq(pathfinderVerifications.goalId, goalId))

        const assistantId = process.env.PATHFINDER_ASSISTANT_ID
        if (!assistantId) {
            return { success: false, error: 'Verification generation not configured', plan: null }
        }

        // Build condensed user learning context
        const dailySessions = (goal as any).dailySessions ?? []
        const subGoalTitles = dailySessions.flatMap((s: any) => s.subGoals.map((sg: any) => sg.title))
        const uniqueTopics = [...new Set(subGoalTitles)].slice(0, 15) as string[]
        const completedCount = dailySessions.reduce((sum: number, s: any) => sum + s.completedSubGoals, 0)
        const quizTotal = dailySessions.reduce((sum: number, s: any) => sum + s.correctQuizAnswers, 0)
        const codingTotal = dailySessions.reduce((sum: number, s: any) => sum + s.solvedCodingProblems, 0)

        const userContext = {
            goal: {
                title: goal.title,
                category: goal.category,
                level: goal.level,
                focusAreas: goal.focusAreas,
                overview: goal.overview ?? undefined,
            },
            userLearningProgress: {
                topicsLearned: uniqueTopics,
                tasksCompleted: completedCount,
                totalSubGoals: goal.totalSubGoals,
                quizAnswered: goal.totalQuizAnswered,
                codingSolved: goal.totalCodingSolved,
            },
            instruction: 'Generate verification quiz and coding questions tailored to what this user has actually learned. Focus on the topics they practiced. Return the full pathfinder_learning_plan schema with quizQuestions (20-25), codingQuestions (3-8), mockInterview, minorProject, majorProject.',
        }

        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
        const thread = await openai.beta.threads.create({
            messages: [{ role: 'user', content: JSON.stringify(userContext) }],
        })

        const run = await openai.beta.threads.runs.create(thread.id, { assistant_id: assistantId })

        let runStatus = await openai.beta.threads.runs.retrieve(run.id, { thread_id: thread.id })
        let attempts = 0
        const maxAttempts = 90

        while (runStatus.status !== 'completed' && attempts < maxAttempts) {
            await new Promise((r) => setTimeout(r, 1000))
            runStatus = await openai.beta.threads.runs.retrieve(run.id, { thread_id: thread.id })
            attempts++
            if (runStatus.status === 'failed' || runStatus.status === 'cancelled') {
                return { success: false, error: 'Generation failed', plan: null }
            }
        }

        if (runStatus.status !== 'completed') {
            return { success: false, error: 'Generation timed out', plan: null }
        }

        const messages = await openai.beta.threads.messages.list(thread.id)
        const assistantMessage = messages.data.find((m) => m.role === 'assistant')
        const content = assistantMessage?.content?.[0]
        if (!content || content.type !== 'text') {
            return { success: false, error: 'No response from assistant', plan: null }
        }

        const aiPlan = JSON.parse(content.text.value) as VerificationAIPlan

        // Create mock interview for verification
        const mockConfig = aiPlan.mockInterview
        let mockId: string | null = null
        if (mockConfig) {
            const [mock] = await db.insert(mockInterviewVoice).values({
                title: mockConfig.title || `Verification: ${goal.title}`,
                description: mockConfig.description || `Mock interview for ${goal.title} verification`,
                category: 'TECHNICAL',
                level: (goal.level as 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED') ?? 'INTERMEDIATE',
                duration: mockConfig.duration || 15,
                questionsCount: mockConfig.questionsCount || 5,
                knowledgeBase: mockConfig.knowledgeBase || `Verification interview for: ${goal.title}. Category: ${goal.category}. Level: ${goal.level}.`,
                isPublic: false,
                isPredefined: false,
                createdById: session.user.id,
                includesResume: false,
                baseCredits: 0,
                creditsRequired: 0,
                tags: ['pathfinder', 'verification'],
            }).returning()
            mockId = mock.id
        }

        await db.update(pathfinderGoals)
            .set({
                overview: aiPlan.overview ?? goal.overview,
                learningObjectives: aiPlan.learningObjectives ?? goal.learningObjectives,
                prerequisites: aiPlan.prerequisites ?? goal.prerequisites,
            })
            .where(eq(pathfinderGoals.id, goalId))

        await db.update(pathfinderVerifications)
            .set({
                generatedPlan: aiPlan as object,
                mockInterviewId: mockId,
                codingStatus: 'PENDING',
                mockStatus: 'PENDING',
            })
            .where(eq(pathfinderVerifications.goalId, goalId))

        revalidatePath(`/pathfinder/${goal.slug}/verify`)
        return { success: true, plan: aiPlan }
    } catch (error) {
        console.error('generateVerificationContent error:', error)
        return { success: false, error: 'Failed to generate verification content', plan: null }
    }
}

// ================================================================================
// SUBMIT VERIFICATION QUIZ
// ================================================================================

export async function submitVerificationQuiz(submission: VerificationQuizSubmission) {
    try {
        const session = await getSession(headers())
        if (!session?.user?.id) {
            return { success: false, error: 'Unauthorized' }
        }

        const goal = await db.query.pathfinderGoals.findFirst({
            where: and(eq(pathfinderGoals.id, submission.goalId), eq(pathfinderGoals.userId, session.user.id)),
            with: { verification: true },
        })

        if (!goal || !goal.verification) {
            return { success: false, error: 'Goal not found' }
        }

        const correctCount = submission.answers.filter((a) => a.isCorrect).length
        const score = Math.round((correctCount / submission.answers.length) * 100)

        await db.insert(pathfinderQuizAttempts).values({
            goalId: submission.goalId,
            userId: session.user.id,
            quizType: 'VERIFICATION',
            score,
            correctCount,
            totalQuestions: submission.answers.length,
            timeTaken: submission.totalTime,
            answers: submission.answers,
            startedAt: new Date(Date.now() - submission.totalTime * 1000),
        })

        const passed = score >= 70
        const newStatus: VerificationSectionStatus = passed ? 'COMPLETED' : 'FAILED'

        await db.update(pathfinderVerifications)
            .set({
                quizStatus: newStatus,
                quizScore: score,
                quizAttempts: goal.verification.quizAttempts + 1,
                quizCompletedAt: passed ? new Date() : undefined,
                ...(passed ? { codingStatus: 'PENDING' as VerificationSectionStatus } : {}),
            })
            .where(eq(pathfinderVerifications.id, goal.verification.id))

        if (passed) {
            await checkVerificationCompletion(goal.verification.id)
        }

        revalidatePath(`/pathfinder/${submission.goalId}/verify`)
        return { success: true, score, passed }
    } catch (error) {
        console.error('Error submitting verification quiz:', error)
        return { success: false, error: 'Failed to submit quiz' }
    }
}

// ================================================================================
// SUBMIT VERIFICATION CODING
// ================================================================================

export async function submitVerificationCoding(submission: VerificationCodingSubmission) {
    try {
        const session = await getSession(headers())
        if (!session?.user?.id) {
            return { success: false, error: 'Unauthorized' }
        }

        const goal = await db.query.pathfinderGoals.findFirst({
            where: and(eq(pathfinderGoals.id, submission.goalId), eq(pathfinderGoals.userId, session.user.id)),
            with: { verification: true },
        })

        if (!goal || !goal.verification) {
            return { success: false, error: 'Goal not found' }
        }

        await db.insert(pathfinderCodingSubmissions).values({
            goalId: submission.goalId,
            userId: session.user.id,
            submissionType: 'VERIFICATION',
            problemId: submission.problemId,
            code: submission.code,
            language: submission.language,
            passed: submission.passed,
            testsPassed: submission.testsPassed,
            totalTests: submission.totalTests,
            testResults: submission.testResults,
        })

        const allSubmissions = await db.query.pathfinderCodingSubmissions.findMany({
            where: and(
                eq(pathfinderCodingSubmissions.goalId, submission.goalId),
                eq(pathfinderCodingSubmissions.submissionType, 'VERIFICATION')
            ),
        })

        const passedProblems = new Set(
            allSubmissions.filter((s) => s.passed).map((s) => s.problemId)
        )

        const aiPlan = (goal.verification as { generatedPlan?: { codingQuestions?: unknown[] } } | null)?.generatedPlan as { codingQuestions?: unknown[] } | null
        const totalProblems = aiPlan?.codingQuestions?.length || 5

        const score = Math.round((passedProblems.size / totalProblems) * 100)
        const allPassed = passedProblems.size >= totalProblems

        await db.update(pathfinderVerifications)
            .set({
                codingScore: score,
                codingAttempts: goal.verification.codingAttempts + 1,
                ...(allPassed
                    ? {
                        codingStatus: 'COMPLETED' as VerificationSectionStatus,
                        codingCompletedAt: new Date(),
                        mockStatus: 'PENDING' as VerificationSectionStatus,
                    }
                    : {}),
            })
            .where(eq(pathfinderVerifications.id, goal.verification.id))

        if (allPassed) {
            await checkVerificationCompletion(goal.verification.id)
        }

        revalidatePath(`/pathfinder/${submission.goalId}/verify`)
        return { success: true, passed: submission.passed, overallPassed: allPassed }
    } catch (error) {
        console.error('Error submitting verification coding:', error)
        return { success: false, error: 'Failed to submit coding' }
    }
}

// ================================================================================
// COMPLETE MOCK INTERVIEW
// ================================================================================

export async function completeMockInterview(
    goalId: string,
    mockSessionId: string,
    score: number
) {
    try {
        const session = await getSession(headers())
        if (!session?.user?.id) {
            return { success: false, error: 'Unauthorized' }
        }

        const goal = await db.query.pathfinderGoals.findFirst({
            where: and(eq(pathfinderGoals.id, goalId), eq(pathfinderGoals.userId, session.user.id)),
            with: { verification: true },
        })

        if (!goal || !goal.verification) {
            return { success: false, error: 'Goal not found' }
        }

        const passed = score >= 70
        const newStatus: VerificationSectionStatus = passed ? 'COMPLETED' : 'FAILED'

        const aiPlan = (goal.verification as { generatedPlan?: { minorProject?: unknown; majorProject?: unknown } } | null)?.generatedPlan as { minorProject?: unknown; majorProject?: unknown } | null
        const hasProject = !!(aiPlan?.minorProject || aiPlan?.majorProject)

        await db.update(pathfinderVerifications)
            .set({
                mockStatus: newStatus,
                mockScore: score,
                mockAttempts: goal.verification.mockAttempts + 1,
                mockSessionId,
                mockCompletedAt: passed ? new Date() : undefined,
                ...(passed && hasProject ? { projectStatus: 'PENDING' as VerificationSectionStatus } : {}),
            })
            .where(eq(pathfinderVerifications.id, goal.verification.id))

        if (passed) {
            await checkVerificationCompletion(goal.verification.id)
        }

        revalidatePath(`/pathfinder/${goalId}/verify`)
        return { success: true, passed }
    } catch (error) {
        console.error('Error completing mock interview:', error)
        return { success: false, error: 'Failed to complete mock interview' }
    }
}

// ================================================================================
// SUBMIT PROJECT
// ================================================================================

export async function submitProject(
    goalId: string,
    projectType: 'CODERZ' | 'PORTFOLIO',
    projectId: string
) {
    try {
        const session = await getSession(headers())
        if (!session?.user?.id) {
            return { success: false, error: 'Unauthorized' }
        }

        const goal = await db.query.pathfinderGoals.findFirst({
            where: and(eq(pathfinderGoals.id, goalId), eq(pathfinderGoals.userId, session.user.id)),
            with: { verification: true },
        })

        if (!goal || !goal.verification) {
            return { success: false, error: 'Goal not found' }
        }

        await db.update(pathfinderVerifications)
            .set({
                projectStatus: 'COMPLETED',
                projectComplete: true,
                projectType,
                projectId,
                projectCompletedAt: new Date(),
            })
            .where(eq(pathfinderVerifications.id, goal.verification.id))

        await checkVerificationCompletion(goal.verification.id)

        revalidatePath(`/pathfinder/${goalId}/verify`)
        return { success: true }
    } catch (error) {
        console.error('Error submitting project:', error)
        return { success: false, error: 'Failed to submit project' }
    }
}

// ================================================================================
// RETRY SECTION
// ================================================================================

export async function retryVerificationSection(
    goalId: string,
    section: 'quiz' | 'coding' | 'mock' | 'project'
) {
    try {
        const session = await getSession(headers())
        if (!session?.user?.id) {
            return { success: false, error: 'Unauthorized' }
        }

        const goal = await db.query.pathfinderGoals.findFirst({
            where: and(eq(pathfinderGoals.id, goalId), eq(pathfinderGoals.userId, session.user.id)),
            with: { verification: true },
        })

        if (!goal || !goal.verification) {
            return { success: false, error: 'Goal not found' }
        }

        const statusField = `${section}Status` as const
        await db.update(pathfinderVerifications)
            .set({ [statusField]: 'PENDING' as VerificationSectionStatus })
            .where(eq(pathfinderVerifications.id, goal.verification.id))

        revalidatePath(`/pathfinder/${goalId}/verify`)
        return { success: true }
    } catch (error) {
        console.error('Error retrying section:', error)
        return { success: false, error: 'Failed to retry section' }
    }
}

// ================================================================================
// HELPER: CHECK VERIFICATION COMPLETION
// ================================================================================

async function checkVerificationCompletion(verificationId: string) {
    const verification = await db.query.pathfinderVerifications.findFirst({
        where: eq(pathfinderVerifications.id, verificationId),
        with: { goal: true },
    })

    if (!verification) return

    const aiPlan = verification.generatedPlan as {
        minorProject?: unknown
        majorProject?: unknown
    } | null
    const projectRequired = !!(aiPlan?.minorProject || aiPlan?.majorProject)

    const quizComplete = verification.quizStatus === 'COMPLETED'
    const codingComplete = verification.codingStatus === 'COMPLETED'
    const mockComplete = verification.mockStatus === 'COMPLETED'
    const projectComplete = projectRequired
        ? verification.projectStatus === 'COMPLETED'
        : true

    if (quizComplete && codingComplete && mockComplete && projectComplete) {
        const w = PATHFINDER_CREDITS.verificationWeights
        const weightedScore = Math.round(
            (verification.quizScore || 0) * w.quiz +
            (verification.codingScore || 0) * w.coding +
            (verification.mockScore || 0) * w.mock
        )
        const overallScore = weightedScore

        const refundCredits = Math.floor(
            (verification.verificationCreditsCharged || 0) * (weightedScore / 100)
        )

        await db.update(pathfinderVerifications)
            .set({
                passed: true,
                overallScore,
                completedAt: new Date(),
            })
            .where(eq(pathfinderVerifications.id, verificationId))

        await db.update(pathfinderGoals)
            .set({
                status: 'COMPLETED',
                completedAt: new Date(),
                progressPercent: 100,
            })
            .where(eq(pathfinderGoals.id, verification.goalId))

        if (refundCredits > 0) {
            const goal = (verification as any).goal
            await db.update(users)
                .set({ credits: sql`${users.credits} + ${refundCredits}` })
                .where(eq(users.id, goal.userId))
            await db.insert(creditTransactions).values({
                userId: goal.userId,
                amount: refundCredits,
                type: 'REWARD',
                description: `Pathfinder Verification Refund: ${weightedScore}% score (${refundCredits} credits)`,
                currency: 'INR',
            })
        }

        // TODO: Award XP, achievements, etc.
    }
}
