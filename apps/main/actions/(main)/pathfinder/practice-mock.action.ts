'use server'

import { auth } from '@repo/auth'
import { prisma } from '@repo/prisma'
import { createMockVoiceSession } from '@/actions/(main)/mockvoice/session.action'

export async function createPathfinderPracticeMockAndSession(subGoalId: string) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: 'Unauthorized' }
        }

        const subGoal = await prisma.pathfinderSubGoal.findFirst({
            where: { id: subGoalId },
            include: { goal: true },
        })

        if (!subGoal || subGoal.goal.userId !== session.user.id) {
            return { success: false, error: 'Sub-goal not found' }
        }

        // Check if we already have a practice mock for this subgoal
        let mock = await prisma.mockInterviewVoice.findUnique({
            where: { pathfinderSubGoalId: subGoalId },
        })

        if (!mock) {
            const resources = subGoal.aiResources as {
                content?: string
                videos?: unknown[]
                documentations?: unknown[]
            } | null

            const knowledgeBase = resources?.content
                ? `${resources.content}\n\nTopic: ${subGoal.title}. Ask interview-style questions to test understanding.`
                : `Topic: ${subGoal.title}. Act as a technical interviewer. Ask interview-style questions to test the candidate's understanding. Category: ${subGoal.goal.category}, Level: ${subGoal.goal.level}.`

            mock = await prisma.mockInterviewVoice.create({
                data: {
                    title: `Practice: ${subGoal.title}`,
                    description: `Mock interview for "${subGoal.title}" - Pathfinder practice`,
                    category: 'TECHNICAL',
                    level: subGoal.goal.level as 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED',
                    duration: 10,
                    questionsCount: 5,
                    knowledgeBase,
                    isPublic: false,
                    isPredefined: false,
                    createdById: session.user.id,
                    includesResume: false,
                    baseCredits: 0,
                    creditsRequired: 0,
                    tags: ['pathfinder', 'practice'],
                    pathfinderSubGoalId: subGoalId,
                },
            })
        }

        const sessionResult = await createMockVoiceSession({
            mockId: mock.id,
            mockType: 'custom',
            includesResume: false,
        })

        if (!sessionResult.success || !sessionResult.sessionId) {
            return { success: false, error: sessionResult.error ?? 'Failed to create session' }
        }

        return { success: true, sessionId: sessionResult.sessionId }
    } catch (error) {
        console.error('createPathfinderPracticeMockAndSession error:', error)
        return { success: false, error: 'Failed to start practice mock' }
    }
}
