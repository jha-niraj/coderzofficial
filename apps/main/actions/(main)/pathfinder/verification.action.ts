'use server'

import { auth } from '@repo/auth'
import { prisma } from '@repo/prisma'
import { revalidatePath } from 'next/cache'
import { VerificationSectionStatus } from '@repo/prisma/client'

// ================================================================================
// TYPES
// ================================================================================

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
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: 'Unauthorized' }
        }

        const goal = await prisma.pathfinderGoal.findFirst({
            where: { id: goalId, userId: session.user.id },
            include: { verification: true },
        })

        if (!goal) {
            return { success: false, error: 'Goal not found' }
        }

        if (goal.status !== 'ACTIVE') {
            return { success: false, error: 'Goal is not in active status' }
        }

        // Update goal status
        await prisma.pathfinderGoal.update({
            where: { id: goalId },
            data: {
                status: 'VERIFICATION',
                verificationStartedAt: new Date(),
            },
        })

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

export async function getVerificationStatus(goalId: string) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: 'Unauthorized', verification: null }
        }

        const goal = await prisma.pathfinderGoal.findFirst({
            where: { id: goalId, userId: session.user.id },
            include: { verification: true },
        })

        if (!goal) {
            return { success: false, error: 'Goal not found', verification: null }
        }

        return { success: true, verification: goal.verification }
    } catch (error) {
        console.error('Error fetching verification status:', error)
        return { success: false, error: 'Failed to fetch status', verification: null }
    }
}

// ================================================================================
// SUBMIT VERIFICATION QUIZ
// ================================================================================

export async function submitVerificationQuiz(submission: VerificationQuizSubmission) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: 'Unauthorized' }
        }

        const goal = await prisma.pathfinderGoal.findFirst({
            where: { id: submission.goalId, userId: session.user.id },
            include: { verification: true },
        })

        if (!goal || !goal.verification) {
            return { success: false, error: 'Goal not found' }
        }

        // Calculate score
        const correctCount = submission.answers.filter((a) => a.isCorrect).length
        const score = Math.round((correctCount / submission.answers.length) * 100)

        // Create quiz attempt record
        await prisma.pathfinderQuizAttempt.create({
            data: {
                goalId: submission.goalId,
                userId: session.user.id,
                quizType: 'VERIFICATION',
                score,
                correctCount,
                totalQuestions: submission.answers.length,
                timeTaken: submission.totalTime,
                answers: submission.answers,
                startedAt: new Date(Date.now() - submission.totalTime * 1000),
            },
        })

        // Determine pass/fail (need 70% to pass)
        const passed = score >= 70
        const newStatus: VerificationSectionStatus = passed ? 'COMPLETED' : 'FAILED'

        // Update verification
        await prisma.pathfinderVerification.update({
            where: { id: goal.verification.id },
            data: {
                quizStatus: newStatus,
                quizScore: score,
                quizAttempts: goal.verification.quizAttempts + 1,
                quizCompletedAt: passed ? new Date() : undefined,
                // Unlock next section if passed
                ...(passed ? { codingStatus: 'PENDING' } : {}),
            },
        })

        // Check if all sections complete
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
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: 'Unauthorized' }
        }

        const goal = await prisma.pathfinderGoal.findFirst({
            where: { id: submission.goalId, userId: session.user.id },
            include: { verification: true },
        })

        if (!goal || !goal.verification) {
            return { success: false, error: 'Goal not found' }
        }

        // Create coding submission record
        await prisma.pathfinderCodingSubmission.create({
            data: {
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
            },
        })

        // Calculate overall coding score
        const allSubmissions = await prisma.pathfinderCodingSubmission.findMany({
            where: {
                goalId: submission.goalId,
                submissionType: 'VERIFICATION',
            },
        })

        // Get unique problems passed
        const passedProblems = new Set(
            allSubmissions.filter((s: { passed: boolean }) => s.passed).map((s: { problemId: string }) => s.problemId)
        )

        // Get total problems from AI plan
        const aiPlan = goal.aiGeneratedPlan as { codingQuestions?: unknown[] } | null
        const totalProblems = aiPlan?.codingQuestions?.length || 5

        const score = Math.round((passedProblems.size / totalProblems) * 100)
        const allPassed = passedProblems.size >= totalProblems

        // Update verification (need to pass all problems)
        await prisma.pathfinderVerification.update({
            where: { id: goal.verification.id },
            data: {
                codingScore: score,
                codingAttempts: goal.verification.codingAttempts + 1,
                ...(allPassed
                    ? {
                          codingStatus: 'COMPLETED',
                          codingCompletedAt: new Date(),
                          mockStatus: 'PENDING', // Unlock mock interview
                      }
                    : {}),
            },
        })

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
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: 'Unauthorized' }
        }

        const goal = await prisma.pathfinderGoal.findFirst({
            where: { id: goalId, userId: session.user.id },
            include: { verification: true },
        })

        if (!goal || !goal.verification) {
            return { success: false, error: 'Goal not found' }
        }

        const passed = score >= 70
        const newStatus: VerificationSectionStatus = passed ? 'COMPLETED' : 'FAILED'

        // Get AI plan to check if project is required
        const aiPlan = goal.aiGeneratedPlan as { minorProject?: unknown; majorProject?: unknown } | null
        const hasProject = !!(aiPlan?.minorProject || aiPlan?.majorProject)

        await prisma.pathfinderVerification.update({
            where: { id: goal.verification.id },
            data: {
                mockStatus: newStatus,
                mockScore: score,
                mockAttempts: goal.verification.mockAttempts + 1,
                mockSessionId,
                mockCompletedAt: passed ? new Date() : undefined,
                // Unlock project if passed and project exists
                ...(passed && hasProject ? { projectStatus: 'PENDING' } : {}),
            },
        })

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
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: 'Unauthorized' }
        }

        const goal = await prisma.pathfinderGoal.findFirst({
            where: { id: goalId, userId: session.user.id },
            include: { verification: true },
        })

        if (!goal || !goal.verification) {
            return { success: false, error: 'Goal not found' }
        }

        await prisma.pathfinderVerification.update({
            where: { id: goal.verification.id },
            data: {
                projectStatus: 'COMPLETED',
                projectComplete: true,
                projectType,
                projectId,
                projectCompletedAt: new Date(),
            },
        })

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
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: 'Unauthorized' }
        }

        const goal = await prisma.pathfinderGoal.findFirst({
            where: { id: goalId, userId: session.user.id },
            include: { verification: true },
        })

        if (!goal || !goal.verification) {
            return { success: false, error: 'Goal not found' }
        }

        const statusField = `${section}Status` as const
        const updateData: Record<string, VerificationSectionStatus> = {
            [statusField]: 'PENDING',
        }

        await prisma.pathfinderVerification.update({
            where: { id: goal.verification.id },
            data: updateData,
        })

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
    const verification = await prisma.pathfinderVerification.findUnique({
        where: { id: verificationId },
        include: { goal: true },
    })

    if (!verification) return

    // Check which sections are required
    const aiPlan = verification.goal.aiGeneratedPlan as {
        minorProject?: unknown
        majorProject?: unknown
    } | null
    const projectRequired = !!(aiPlan?.minorProject || aiPlan?.majorProject)

    // Check all required sections are complete
    const quizComplete = verification.quizStatus === 'COMPLETED'
    const codingComplete = verification.codingStatus === 'COMPLETED'
    const mockComplete = verification.mockStatus === 'COMPLETED'
    const projectComplete = projectRequired
        ? verification.projectStatus === 'COMPLETED'
        : true

    if (quizComplete && codingComplete && mockComplete && projectComplete) {
        // Calculate overall score
        const scores = [
            verification.quizScore || 0,
            verification.codingScore || 0,
            verification.mockScore || 0,
        ]
        if (projectRequired && verification.projectComplete) {
            scores.push(100) // Project is binary pass/fail
        }

        const overallScore = Math.round(
            scores.reduce((a, b) => a + b, 0) / scores.length
        )

        // Update verification and goal
        await prisma.$transaction([
            prisma.pathfinderVerification.update({
                where: { id: verificationId },
                data: {
                    passed: true,
                    overallScore,
                    completedAt: new Date(),
                },
            }),
            prisma.pathfinderGoal.update({
                where: { id: verification.goalId },
                data: {
                    status: 'COMPLETED',
                    completedAt: new Date(),
                    progressPercent: 100,
                },
            }),
        ])

        // TODO: Award XP, achievements, etc.
    }
}
