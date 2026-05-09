'use server'

import { getSession } from '@repo/auth'
import { headers } from 'next/headers'
import { db, pathfinderSubGoals, mockInterviewVoice } from '@repo/db'
import { eq } from 'drizzle-orm'
import { createMockVoiceSession } from '@/actions/(main)/mockvoice/session.action'

export async function createPathfinderPracticeMockAndSession(subGoalId: string) {
    try {
        const session = await getSession(headers())
        if (!session?.user?.id) {
            return { success: false, error: 'Unauthorized' }
        }

        const subGoal = await db.query.pathfinderSubGoals.findFirst({
            where: eq(pathfinderSubGoals.id, subGoalId),
            with: { goal: true },
        })

        if (!subGoal || subGoal.goal.userId !== session.user.id) {
            return { success: false, error: 'Sub-goal not found' }
        }

        // Check if we already have a practice mock for this subgoal
        let mock = await db.query.mockInterviewVoice.findFirst({
            where: eq(mockInterviewVoice.pathfinderSubGoalId, subGoalId),
        })

        if (!mock) {
            const resources = (subGoal as { aiResources?: { content?: string } }).aiResources
            const knowledgeBase = resources?.content
                ? `${resources.content}\n\nTopic: ${subGoal.title}. Ask interview-style questions to test understanding.`
                : `Topic: ${subGoal.title}. Act as a technical interviewer. Ask interview-style questions to test the candidate's understanding. Category: ${subGoal.goal.category}, Level: ${subGoal.goal.level}.`

            const [created] = await db.insert(mockInterviewVoice).values({
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
            }).returning()
            if (!created) return { success: false, error: 'Failed to create practice mock' }
            mock = created
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
