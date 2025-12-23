'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
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
        const session = await auth()
        const userId = session?.user?.id

        if (!userId) {
            return { success: false, error: 'Unauthorized' }
        }

        // Validate rating
        if (input.rating < 1 || input.rating > 5) {
            return { success: false, error: 'Invalid rating. Must be between 1 and 5.' }
        }

        // Fetch session to verify ownership
        const mockSession = await prisma.mockVoiceSession.findUnique({
            where: { id: input.sessionId },
            include: { mock: true }
        })

        if (!mockSession) {
            return { success: false, error: 'Session not found' }
        }

        if (mockSession.userId !== userId) {
            return { success: false, error: 'Unauthorized to review this session' }
        }

        // Determine if there are issues
        const hasIssues = (input.issues && input.issues.length > 0) || false

        // Update session with review
        await prisma.mockVoiceSession.update({
            where: { id: input.sessionId },
            data: {
                userRating: input.rating,
                userFeedback: input.feedback || null,
                reviewedAt: new Date(),
                hasIssues: hasIssues,
                reportedIssues: input.issues || [],
                issueDetails: input.issueDetails || null,
                issueReportedAt: hasIssues ? new Date() : null
            }
        })

        // Update mock interview average rating
        const allRatings = await prisma.mockVoiceSession.findMany({
            where: {
                mockId: mockSession.mockId,
                userRating: { not: null }
            },
            select: { userRating: true }
        })

        if (allRatings.length > 0) {
            const avgRating = allRatings.reduce((sum, r) => sum + (r.userRating || 0), 0) / allRatings.length
            await prisma.mockInterviewVoice.update({
                where: { id: mockSession.mockId },
                data: { averageRating: avgRating }
            })
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
        const session = await auth()
        const user = session?.user

        if (!user || user.role !== 'Admin') {
            return { success: false, error: 'Unauthorized' }
        }

        const sessionsWithIssues = await prisma.mockVoiceSession.findMany({
            where: {
                hasIssues: true
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        username: true
                    }
                },
                mock: {
                    select: {
                        id: true,
                        title: true,
                        level: true,
                        category: true
                    }
                }
            },
            orderBy: {
                issueReportedAt: 'desc'
            }
        })

        return { success: true, sessions: sessionsWithIssues }
    } catch (error) {
        console.error('Error fetching sessions with issues:', error)
        return { success: false, error: 'Failed to fetch sessions with issues' }
    }
}

export async function markIssueResolved(sessionId: string) {
    try {
        const session = await auth()
        const user = session?.user

        if (!user || user.role !== 'Admin') {
            return { success: false, error: 'Unauthorized' }
        }

        await prisma.mockVoiceSession.update({
            where: { id: sessionId },
            data: {
                hasIssues: false
            }
        })

        revalidatePath('/admin/mock-issues')

        return { success: true, message: 'Issue marked as resolved' }
    } catch (error) {
        console.error('Error marking issue as resolved:', error)
        return { success: false, error: 'Failed to mark issue as resolved' }
    }
}

