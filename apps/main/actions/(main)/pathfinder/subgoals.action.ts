'use server'

import { auth } from '@repo/auth'
import { prisma } from '@repo/prisma'
import { revalidatePath } from 'next/cache'
import type OpenAI from 'openai'
import { openai } from '@/lib/openai-client'
import { StudioVisibility } from '@repo/prisma/client'
import { 
    generateExplanation, generateVideos, generateDocuments 
} from '@/actions/(main)/studios/ai-generation.actions'
import { canRunPathfinderAI, getGoalUsageSummary } from './usage.action'


// ================================================================================
// TYPES
// ================================================================================

export interface CreateSubGoalInput {
    goalId: string
    title: string
    description?: string
    source?: 'text' | 'voice'
    voiceTranscript?: string
}

export interface QuizQuestion {
    id: string
    question: string
    options: string[]
    correctAnswer: number
    explanation: string
}

export interface CodingProblem {
    title: string
    description: string
    difficulty: 'EASY' | 'MEDIUM' | 'HARD'
    starterCode: string
    hints: string[]
    sampleInput?: string
    sampleOutput?: string
}

// ================================================================================
// GET OR CREATE DAILY SESSION
// ================================================================================

export async function getOrCreateDailySession(goalId: string) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: 'Unauthorized' }
        }

        // Get today's date (without time)
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        // Check if session exists for today
        let dailySession = await prisma.pathfinderDailySession.findUnique({
            where: {
                goalId_date: {
                    goalId,
                    date: today,
                },
            },
            include: {
                subGoals: {
                    orderBy: { order: 'asc' },
                },
            },
        })

        if (!dailySession) {
            // Create new session for today
            dailySession = await prisma.pathfinderDailySession.create({
                data: {
                    goalId,
                    userId: session.user.id,
                    date: today,
                },
                include: {
                    subGoals: {
                        orderBy: { order: 'asc' },
                    },
                },
            })
        }

        return { success: true, session: dailySession }
    } catch (error) {
        console.error('Error getting/creating daily session:', error)
        return { success: false, error: 'Failed to get daily session' }
    }
}

// ================================================================================
// GET DAILY SESSION BY DATE
// ================================================================================

export async function getDailySessionByDate(goalId: string, date: Date) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: 'Unauthorized' }
        }

        // Normalize date
        const normalizedDate = new Date(date)
        normalizedDate.setHours(0, 0, 0, 0)

        const dailySession = await prisma.pathfinderDailySession.findUnique({
            where: {
                goalId_date: {
                    goalId,
                    date: normalizedDate,
                },
            },
            include: {
                subGoals: {
                    orderBy: { order: 'asc' },
                },
            },
        })

        return { success: true, session: dailySession }
    } catch (error) {
        console.error('Error getting daily session:', error)
        return { success: false, error: 'Failed to get daily session' }
    }
}

// ================================================================================
// GET ALL SESSIONS FOR A GOAL
// ================================================================================

export async function getGoalSessions(goalId: string) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: 'Unauthorized', sessions: [] }
        }

        const sessions = await prisma.pathfinderDailySession.findMany({
            where: { goalId },
            orderBy: { date: 'desc' },
            include: {
                subGoals: {
                    orderBy: { order: 'asc' },
                },
            },
        })

        return { success: true, sessions }
    } catch (error) {
        console.error('Error getting goal sessions:', error)
        return { success: false, error: 'Failed to get sessions', sessions: [] }
    }
}

// ================================================================================
// CREATE SUB-GOAL
// ================================================================================

export async function createSubGoal(input: CreateSubGoalInput) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: 'Unauthorized' }
        }

        // Verify goal belongs to user
        const goal = await prisma.pathfinderGoal.findFirst({
            where: { id: input.goalId, userId: session.user.id },
        })

        if (!goal) {
            return { success: false, error: 'Goal not found' }
        }

        // Check if user can run AI (usage limit)
        const canRun = await canRunPathfinderAI(input.goalId)
        if (!canRun.allowed) {
            return {
                success: false,
                error: canRun.reason ?? 'AI usage limit reached',
                code: 'USAGE_BLOCKED',
                pendingCredits: canRun.pendingCredits,
            }
        }

        // Get or create today's session
        const sessionResult = await getOrCreateDailySession(input.goalId)
        if (!sessionResult.success || !sessionResult.session) {
            return { success: false, error: 'Failed to get daily session' }
        }

        const dailySession = sessionResult.session

        // Get max order for this session
        const maxOrder = await prisma.pathfinderSubGoal.aggregate({
            where: { sessionId: dailySession.id },
            _max: { order: true },
        })

        // Create sub-goal
        const subGoal = await prisma.pathfinderSubGoal.create({
            data: {
                goalId: input.goalId,
                sessionId: dailySession.id,
                title: input.title,
                description: input.description,
                source: input.source || 'text',
                voiceTranscript: input.voiceTranscript,
                order: (maxOrder._max.order || 0) + 1,
            },
        })

        // Update session stats
        await prisma.pathfinderDailySession.update({
            where: { id: dailySession.id },
            data: {
                totalSubGoals: { increment: 1 },
            },
        })

        // Update goal stats
        await prisma.pathfinderGoal.update({
            where: { id: input.goalId },
            data: {
                totalSubGoals: { increment: 1 },
                lastActivityAt: new Date(),
            },
        })

        // Create Studio for this sub-goal (notes, quiz, flashcards, videos, docs)
        const studioSlug = `subgoal-${subGoal.id}-${Date.now().toString(36)}`
        const studio = await prisma.studio.create({
            data: {
                slug: studioSlug,
                title: `📝 ${input.title}`,
                description: `Study notes for: ${input.title}`,
                source: 'PATHFINDER',
                sourceId: subGoal.id,
                visibility: StudioVisibility.PRIVATE,
                userId: session.user.id,
                stepCount: 0,
            },
        })

        await prisma.pathfinderSubGoal.update({
            where: { id: subGoal.id },
            data: { studioId: studio.id },
        })

        // Generate explanation via Studio's generateExplanation (consistent with Studio flow)
        const explanationResult = await generateExplanation(
            studio.id,
            `Provide a detailed explanation of "${input.title}". Include key concepts, practical examples, code snippets where relevant, and best practices. Use clear markdown formatting.`
        )

        // Add videos (2) and docs (5) via Exa - non-blocking, best effort
        Promise.all([
            generateVideos(studio.id, input.title),
            generateDocuments(studio.id, input.title),
        ]).catch((err) => console.error('Failed to add videos/docs to studio:', err))

        // Generate coding problems only (quiz lives in Studio)
        await generateAIContentForSubGoal(
            subGoal.id,
            input.goalId,
            session.user.id,
            input.title,
            goal.category,
            goal.level
        )

        // Refetch sub-goal with studio and coding content
        const updatedSubGoal = await prisma.pathfinderSubGoal.findUnique({
            where: { id: subGoal.id },
            include: { goal: true, studio: true },
        })

        const usageSummary = await getGoalUsageSummary(input.goalId)

        revalidatePath(`/pathfinder/${input.goalId}`)
        return {
            success: true,
            subGoal: updatedSubGoal ?? subGoal,
            usageCost: explanationResult.success ? 1 : 0,
            usageSummary: usageSummary ?? undefined,
        }
    } catch (error) {
        console.error('Error creating sub-goal:', error)
        return { success: false, error: 'Failed to create sub-goal' }
    }
}

// ================================================================================
// GENERATE AI CONTENT FOR SUB-GOAL (Quiz + Optional Coding)
// ================================================================================

async function generateAIContentForSubGoal(
    subGoalId: string,
    goalId: string,
    userId: string,
    title: string,
    category: string,
    level: string
) {
    try {
        const codingCount = level === 'BEGINNER' ? 2 : level === 'INTERMEDIATE' ? 2 : 3
        const prompt = `You are an expert educator creating learning content.

A user is learning about "${title}" as part of their ${category} studies at ${level} level.

Generate:
1. 3-5 quiz questions to test understanding of this topic
2. ${codingCount} coding problems if this topic involves practical coding skills. Pick appropriate difficulty for each (EASY, MEDIUM, or HARD) - vary them based on complexity. For theory-only topics, use empty array.

Return JSON in this exact format:
{
  "quizQuestions": [
    {
      "id": "q1",
      "question": "The question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Why this is correct"
    }
  ],
  "codingProblems": [
    {
      "id": "cp1",
      "title": "Problem title",
      "description": "Detailed problem description",
      "difficulty": "EASY" | "MEDIUM" | "HARD",
      "starterCode": "function solve() {\\n  // Your code here\\n}",
      "hints": ["Hint 1", "Hint 2"],
      "sampleInput": "Example input",
      "sampleOutput": "Expected output"
    }
  ]
}

Rules:
- For topics like "Learn about X API" or "Understand Y Learn", codingProblems can be []
- For topics like "Practice X", "Implement Y", "Build Z", include ${codingCount} coding problems
- Vary difficulty: include at least one EASY, one MEDIUM, and optionally HARD for advanced
- All content should match the ${level} level

Return ONLY valid JSON, no markdown or code blocks.`

        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
            max_tokens: 2000,
            response_format: { type: 'json_object' },
        })

        const content = response.choices[0]?.message?.content
        if (!content) {
            console.error('No content from OpenAI')
            return
        }

        // Log usage
        const { logPathfinderUsage } = await import('./usage.action')
        const inputTokens = response.usage?.prompt_tokens ?? 0
        const outputTokens = response.usage?.completion_tokens ?? 0
        if (inputTokens > 0 || outputTokens > 0) {
            await logPathfinderUsage({
                goalId,
                userId,
                action: 'subgoal_quiz_coding',
                provider: 'openai',
                inputTokens,
                outputTokens,
            })
        }

        const aiContent = JSON.parse(content)
        const codingProblems = Array.isArray(aiContent.codingProblems)
            ? aiContent.codingProblems
            : aiContent.codingProblem
                ? [aiContent.codingProblem]
                : []
        const hasCoding = codingProblems.length > 0

        // Update sub-goal with coding only (quiz lives in Studio)
        await prisma.pathfinderSubGoal.update({
            where: { id: subGoalId },
            data: {
                aiCodingProblem: codingProblems.length > 0 ? codingProblems : null,
                hasCoding,
            },
        })

        const subGoal = await prisma.pathfinderSubGoal.findUnique({
            where: { id: subGoalId },
            select: { sessionId: true },
        })

        if (subGoal) {
            await prisma.pathfinderDailySession.update({
                where: { id: subGoal.sessionId },
                data: {
                    totalCodingProblems: { increment: codingProblems.length },
                },
            })
        }
    } catch (error) {
        console.error('Error generating AI content for sub-goal:', error)
    }
}

// ================================================================================
// GET SUB-GOAL WITH AI CONTENT
// ================================================================================

export async function getSubGoalWithContent(subGoalId: string) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: 'Unauthorized' }
        }

        const subGoal = await prisma.pathfinderSubGoal.findFirst({
            where: { id: subGoalId },
            include: {
                goal: {
                    select: { userId: true },
                },
            },
        })

        if (!subGoal || subGoal.goal.userId !== session.user.id) {
            return { success: false, error: 'Sub-goal not found' }
        }

        return { success: true, subGoal }
    } catch (error) {
        console.error('Error getting sub-goal:', error)
        return { success: false, error: 'Failed to get sub-goal' }
    }
}

// ================================================================================
// UPDATE SUB-GOAL STATUS
// ================================================================================

export async function updateSubGoalStatus(
    subGoalId: string,
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED'
) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: 'Unauthorized' }
        }

        const subGoal = await prisma.pathfinderSubGoal.findFirst({
            where: { id: subGoalId },
            include: {
                goal: {
                    select: { id: true, userId: true },
                },
            },
        })

        if (!subGoal || subGoal.goal.userId !== session.user.id) {
            return { success: false, error: 'Sub-goal not found' }
        }

        const wasCompleted = subGoal.status === 'COMPLETED'
        const isNowCompleted = status === 'COMPLETED'

        await prisma.pathfinderSubGoal.update({
            where: { id: subGoalId },
            data: {
                status,
                completedAt: isNowCompleted ? new Date() : null,
            },
        })

        // Update counters
        if (!wasCompleted && isNowCompleted) {
            await prisma.pathfinderDailySession.update({
                where: { id: subGoal.sessionId },
                data: { completedSubGoals: { increment: 1 } },
            })
            await prisma.pathfinderGoal.update({
                where: { id: subGoal.goalId },
                data: {
                    completedSubGoals: { increment: 1 },
                    lastActivityAt: new Date(),
                },
            })
        } else if (wasCompleted && !isNowCompleted) {
            await prisma.pathfinderDailySession.update({
                where: { id: subGoal.sessionId },
                data: { completedSubGoals: { decrement: 1 } },
            })
            await prisma.pathfinderGoal.update({
                where: { id: subGoal.goalId },
                data: { completedSubGoals: { decrement: 1 } },
            })
        }

        revalidatePath(`/pathfinder/${subGoal.goal.id}`)
        return { success: true }
    } catch (error) {
        console.error('Error updating sub-goal status:', error)
        return { success: false, error: 'Failed to update status' }
    }
}

// ================================================================================
// SUBMIT SUB-GOAL QUIZ ANSWERS
// ================================================================================

export async function submitSubGoalQuiz(
    subGoalId: string,
    answers: { questionId: string; selectedAnswer: number }[]
) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: 'Unauthorized' }
        }

        const subGoal = await prisma.pathfinderSubGoal.findFirst({
            where: { id: subGoalId },
            include: {
                goal: {
                    select: { id: true, userId: true },
                },
            },
        })

        if (!subGoal || subGoal.goal.userId !== session.user.id) {
            return { success: false, error: 'Sub-goal not found' }
        }

        // Quiz now lives in Studio - for legacy sub-goals we no longer have aiQuizQuestions
        const quizQuestions = ((subGoal as { aiQuizQuestions?: unknown }).aiQuizQuestions as QuizQuestion[] | undefined) || []

        if (quizQuestions.length === 0) {
            return { success: false, error: 'Quiz is in the Studio. Complete it in the Notes tab.' }
        }

        // Calculate score
        let correctCount = 0
        for (const answer of answers) {
            const question = quizQuestions.find((q) => q.id === answer.questionId)
            if (question && question.correctAnswer === answer.selectedAnswer) {
                correctCount++
            }
        }

        const score = Math.round((correctCount / quizQuestions.length) * 100)

        // Update sub-goal
        await prisma.pathfinderSubGoal.update({
            where: { id: subGoalId },
            data: {
                quizCompleted: true,
                quizScore: score,
            },
        })

        // Update session stats
        await prisma.pathfinderDailySession.update({
            where: { id: subGoal.sessionId },
            data: {
                correctQuizAnswers: { increment: correctCount },
            },
        })

        // Update goal stats
        await prisma.pathfinderGoal.update({
            where: { id: subGoal.goalId },
            data: {
                totalQuizAnswered: { increment: quizQuestions.length },
                lastActivityAt: new Date(),
            },
        })

        revalidatePath(`/pathfinder/${subGoal.goal.id}`)
        return { success: true, score, correctCount, total: quizQuestions.length }
    } catch (error) {
        console.error('Error submitting quiz:', error)
        return { success: false, error: 'Failed to submit quiz' }
    }
}

// ================================================================================
// SUBMIT SUB-GOAL CODING SOLUTION
// ================================================================================

export async function submitSubGoalCoding(
    subGoalId: string,
    code: string,
    language: string,
    problemId?: string
) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: 'Unauthorized' }
        }

        const subGoal = await prisma.pathfinderSubGoal.findFirst({
            where: { id: subGoalId },
            include: {
                goal: {
                    select: { id: true, userId: true },
                },
            },
        })

        if (!subGoal || subGoal.goal.userId !== session.user.id) {
            return { success: false, error: 'Sub-goal not found' }
        }

        const rawCoding = subGoal.aiCodingProblem
        const problems: Array<Record<string, unknown> | undefined> = Array.isArray(rawCoding)
            ? rawCoding.map((p, i) => ({ ...(p as Record<string, unknown>), id: (p as Record<string, unknown>).id ?? `cp${i}` }))
            : rawCoding
                ? [{ ...(rawCoding as Record<string, unknown>), id: 'cp0' }]
                : []
        const codingProblem = problemId
            ? problems.find((p) => p?.id === problemId)
            : problems[0]
        if (!codingProblem) {
            return { success: false, error: 'No coding problem for this sub-goal' }
        }

        // Evaluate code using OpenAI
        const evaluationPrompt = `You are a code evaluator. Evaluate this solution:

Problem: ${codingProblem.title}
Description: ${codingProblem.description}
Expected sample input: ${codingProblem.sampleInput || 'N/A'}
Expected sample output: ${codingProblem.sampleOutput || 'N/A'}

User's solution (${language}):
\`\`\`${language}
${code}
\`\`\`

Evaluate and return JSON:
{
  "passed": true/false,
  "feedback": "Detailed feedback about the solution",
  "suggestions": ["Improvement suggestion 1", "Suggestion 2"],
  "score": 0-100
}

Be lenient - if the logic is mostly correct, pass it. Focus on:
1. Does it solve the problem?
2. Is the approach reasonable?
3. Any major issues?

Return ONLY valid JSON.`

        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: evaluationPrompt }],
            temperature: 0.3,
            max_tokens: 1000,
            response_format: { type: 'json_object' },
        })

        const content = response.choices[0]?.message?.content
        if (!content) {
            return { success: false, error: 'Failed to evaluate code' }
        }

        const evaluation = JSON.parse(content)
        const pid = codingProblem.id ?? 'cp0'

        // Update coding progress for multiple problems
        const currentProgress = (subGoal.codingProgress as Record<string, boolean>) ?? {}
        const newProgress = { ...currentProgress, [pid as string]: evaluation.passed }
        const allPassed = problems.every((p) => newProgress[(p?.id ?? 'cp0') as string] === true)
        const allAttempted = problems.every((p) => (p?.id ?? 'cp0') as string in newProgress)

        await prisma.pathfinderSubGoal.update({
            where: { id: subGoalId },
            data: {
                codingProgress: newProgress,
                codingCompleted: allAttempted,
                codingPassed: allPassed,
            },
        })

        // Update session stats
        if (evaluation.passed) {
            await prisma.pathfinderDailySession.update({
                where: { id: subGoal.sessionId },
                data: { solvedCodingProblems: { increment: 1 } },
            })
        }

        // Update goal stats
        await prisma.pathfinderGoal.update({
            where: { id: subGoal.goalId },
            data: {
                totalCodingSolved: { increment: evaluation.passed ? 1 : 0 },
                lastActivityAt: new Date(),
            },
        })

        revalidatePath(`/pathfinder/${subGoal.goal.id}`)
        return {
            success: true,
            passed: evaluation.passed,
            feedback: evaluation.feedback,
            suggestions: evaluation.suggestions,
            score: evaluation.score,
            allPassed,
        }
    } catch (error) {
        console.error('Error submitting coding:', error)
        return { success: false, error: 'Failed to submit coding solution' }
    }
}

// ================================================================================
// DELETE SUB-GOAL
// ================================================================================

export async function deleteSubGoal(subGoalId: string) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: 'Unauthorized' }
        }

        const subGoal = await prisma.pathfinderSubGoal.findFirst({
            where: { id: subGoalId },
            include: {
                goal: {
                    select: { id: true, userId: true },
                },
            },
        })

        if (!subGoal || subGoal.goal.userId !== session.user.id) {
            return { success: false, error: 'Sub-goal not found' }
        }

        // Update counters before deletion
        const wasCompleted = subGoal.status === 'COMPLETED'

        await prisma.pathfinderSubGoal.delete({
            where: { id: subGoalId },
        })

        // Update session stats
        await prisma.pathfinderDailySession.update({
            where: { id: subGoal.sessionId },
            data: {
                totalSubGoals: { decrement: 1 },
                completedSubGoals: wasCompleted ? { decrement: 1 } : undefined,
            },
        })

        // Update goal stats
        await prisma.pathfinderGoal.update({
            where: { id: subGoal.goalId },
            data: {
                totalSubGoals: { decrement: 1 },
                completedSubGoals: wasCompleted ? { decrement: 1 } : undefined,
            },
        })

        revalidatePath(`/pathfinder/${subGoal.goal.id}`)
        return { success: true }
    } catch (error) {
        console.error('Error deleting sub-goal:', error)
        return { success: false, error: 'Failed to delete sub-goal' }
    }
}

// ================================================================================
// TRANSCRIBE VOICE RECORDING
// ================================================================================

export async function transcribeVoiceRecording(audioBlob: Blob) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: 'Unauthorized' }
        }

        // Convert blob to file for OpenAI Whisper
        const file = new File([audioBlob], 'recording.webm', { type: 'audio/webm' })

        const response = await openai.audio.transcriptions.create({
            file: file,
            model: 'whisper-1',
            language: 'en',
        })

        return { success: true, transcript: response.text }
    } catch (error) {
        console.error('Error transcribing voice:', error)
        return { success: false, error: 'Failed to transcribe voice' }
    }
}

// ================================================================================
// SAVE SESSION NOTES
// ================================================================================

export async function saveSessionNotes(sessionId: string, notes: string) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: 'Unauthorized' }
        }

        const dailySession = await prisma.pathfinderDailySession.findFirst({
            where: { id: sessionId, userId: session.user.id },
        })

        if (!dailySession) {
            return { success: false, error: 'Session not found' }
        }

        await prisma.pathfinderDailySession.update({
            where: { id: sessionId },
            data: { notes },
        })

        return { success: true }
    } catch (error) {
        console.error('Error saving notes:', error)
        return { success: false, error: 'Failed to save notes' }
    }
}

