'use server'

import { getSession } from "@repo/auth"
import { headers } from "next/headers"
import { db, mockVoiceSession, mockInterviewVoice } from "@repo/db"
import { eq, and, isNotNull } from "drizzle-orm"
import { revalidatePath } from 'next/cache'

interface SubmitReviewInput {
    sessionId: string
    rating: number // 1-5
    feedback?: string
    issues?: string[] // ["AUDIO_QUALITY", "AI_RESPONSES", etc.]
    issueDetails?: string
}

export async function submitReview(input: SubmitReviewInput) {
    try {
        const session = await getSession(headers())
        const userId = session?.user?.id

        if (!userId) {
            return { success: false, error: 'Unauthorized' }
        }

        if (input.rating < 1 || input.rating > 5) {
            return { success: false, error: 'Invalid rating. Must be between 1 and 5.' }
        }

        const mockSession = await db.query.mockVoiceSession.findFirst({
            where: eq(mockVoiceSession.id, input.sessionId),
            with: { mock: true },
        })

        if (!mockSession) {
            return { success: false, error: 'Session not found' }
        }

        if (mockSession.userId !== userId) {
            return { success: false, error: 'Unauthorized to review this session' }
        }

        const hasIssues = (input.issues && input.issues.length > 0) || false

        await db
            .update(mockVoiceSession)
            .set({
                userRating: input.rating,
                userFeedback: input.feedback || null,
                reviewedAt: new Date(),
                hasIssues,
                reportedIssues: input.issues || [],
                issueDetails: input.issueDetails || null,
                issueReportedAt: hasIssues ? new Date() : null,
            })
            .where(eq(mockVoiceSession.id, input.sessionId))

        // Update mock interview average rating
        const allRatings = await db
            .select({ userRating: mockVoiceSession.userRating })
            .from(mockVoiceSession)
            .where(
                and(
                    eq(mockVoiceSession.mockId, mockSession.mockId),
                    isNotNull(mockVoiceSession.userRating)
                )
            )

        if (allRatings.length > 0) {
            const avgRating =
                allRatings.reduce((sum, r) => sum + (r.userRating || 0), 0) / allRatings.length
            await db
                .update(mockInterviewVoice)
                .set({ averageRating: avgRating })
                .where(eq(mockInterviewVoice.id, mockSession.mockId))
        }

        revalidatePath('/mockinterview')
        revalidatePath(`/mockinterview/voice/results/${input.sessionId}`)

        return { success: true, message: 'Thank you for your feedback!' }
    } catch (error) {
        console.error('Error submitting review:', error)
        return { success: false, error: 'Failed to submit review' }
    }
}

export async function getSessionsWithIssues() {
    try {
        const session = await getSession(headers())
        const user = session?.user

        if (!user || (user as any).role !== 'Admin') {
            return { success: false, error: 'Unauthorized' }
        }

        const sessionsWithIssues = await db.query.mockVoiceSession.findMany({
            where: eq(mockVoiceSession.hasIssues, true),
            with: {
                user: true,
                mock: true,
            },
            orderBy: (table, { desc }) => [desc(table.issueReportedAt)],
        })

        return { success: true, sessions: sessionsWithIssues }
    } catch (error) {
        console.error('Error fetching sessions with issues:', error)
        return { success: false, error: 'Failed to fetch sessions with issues' }
    }
}

export async function markIssueResolved(sessionId: string) {
    try {
        const session = await getSession(headers())
        const user = session?.user

        if (!user || (user as any).role !== 'Admin') {
            return { success: false, error: 'Unauthorized' }
        }

        await db
            .update(mockVoiceSession)
            .set({ hasIssues: false })
            .where(eq(mockVoiceSession.id, sessionId))

        revalidatePath('/admin/mock-issues')

        return { success: true, message: 'Issue marked as resolved' }
    } catch (error) {
        console.error('Error marking issue as resolved:', error)
        return { success: false, error: 'Failed to mark issue as resolved' }
    }
}
