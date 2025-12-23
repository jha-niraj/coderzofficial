'use server'

import { auth } from '@repo/auth'
import prisma from '@/lib/prisma'
import { AssessmentLanguage } from '@prisma/client'

/**
 * Get authenticated user ID or throw error
 */
export async function getAuthenticatedUserId(): Promise<string | null> {
    const session = await auth()
    return session?.user?.id || null
}

/**
 * Check if user has sufficient credits
 */
export async function checkUserCredits(userId: string, requiredCredits: number): Promise<{
    hasCredits: boolean
    currentCredits: number
}> {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { credits: true },
    })

    if (!user) {
        return { hasCredits: false, currentCredits: 0 }
    }

    return {
        hasCredits: user.credits >= requiredCredits,
        currentCredits: user.credits,
    }
}

/**
 * Deduct credits from user
 */
export async function deductCredits(userId: string, amount: number): Promise<void> {
    await prisma.user.update({
        where: { id: userId },
        data: { credits: { decrement: amount } },
    })
}

/**
 * Add credits to user
 */
export async function addCredits(userId: string, amount: number): Promise<void> {
    await prisma.user.update({
        where: { id: userId },
        data: { credits: { increment: amount } },
    })
}

// ==================== TOPIC ACTIONS ====================

/**
 * Get assessment topics for a language
 */
export async function getAssessmentTopics(language: AssessmentLanguage) {
    try {
        const topics = await prisma.assessmentTopic.findMany({
            where: {
                language,
                isActive: true,
            },
            orderBy: { orderIndex: 'asc' },
            include: {
                subModules: {
                    where: { isActive: true },
                    orderBy: { orderIndex: 'asc' },
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        description: true,
                    },
                },
            },
        })

        return {
            success: true,
            data: topics,
        }
    } catch (error) {
        console.error('Error fetching assessment topics:', error)
        return { success: false, error: 'Failed to fetch topics', data: [] }
    }
}

/**
 * Get topic by ID with submodules
 */
export async function getTopicById(topicId: string) {
    try {
        const topic = await prisma.assessmentTopic.findUnique({
            where: { id: topicId },
            include: {
                subModules: {
                    where: { isActive: true },
                    orderBy: { orderIndex: 'asc' },
                },
            },
        })

        return {
            success: true,
            data: topic,
        }
    } catch (error) {
        console.error('Error fetching topic:', error)
        return { success: false, error: 'Failed to fetch topic' }
    }
}
