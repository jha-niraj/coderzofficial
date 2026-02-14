'use server'

import { auth } from '@repo/auth'
import { prisma } from '@repo/prisma'
import { revalidatePath } from 'next/cache'
import { Module } from '@repo/prisma/client'

// ================================================================================
// SET CREDIT PRICE (creator only)
// ================================================================================

export async function setGoalCreditPrice(goalId: string, creditPrice: number | null) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: 'Unauthorized' }
        }

        const goal = await prisma.pathfinderGoal.findFirst({
            where: { id: goalId, userId: session.user.id, isPublic: true },
        })

        if (!goal) {
            return { success: false, error: 'Goal not found or you cannot set price for this goal' }
        }

        if (creditPrice !== null && (creditPrice < 0 || creditPrice > 9999)) {
            return { success: false, error: 'Price must be between 0 and 9999 credits' }
        }

        await prisma.pathfinderGoal.update({
            where: { id: goalId },
            data: { creditPrice },
        })

        revalidatePath('/pathfinder')
        revalidatePath('/pathfinder/explore')
        revalidatePath(`/pathfinder/${goal.slug}`)
        return { success: true }
    } catch (error) {
        console.error('Error setting credit price:', error)
        return { success: false, error: 'Failed to set price' }
    }
}

// ================================================================================
// GET GOAL EARNINGS & TRANSACTIONS (creator only)
// ================================================================================

export async function getGoalEarnings(goalId: string) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: 'Unauthorized', earnings: [], totalEarned: 0 }
        }

        const goal = await prisma.pathfinderGoal.findFirst({
            where: { id: goalId, userId: session.user.id },
        })

        if (!goal) {
            return { success: false, error: 'Goal not found', earnings: [], totalEarned: 0 }
        }

        const earnings = await prisma.earning.findMany({
            where: {
                userId: session.user.id,
                module: Module.PATHFINDER,
                referenceId: goalId,
            },
            orderBy: { createdAt: 'desc' },
        })

        const totalEarned = earnings.reduce((s, e) => s + e.amount, 0)

        return {
            success: true,
            earnings,
            totalEarned,
            creditPrice: goal.creditPrice,
        }
    } catch (error) {
        console.error('Error fetching earnings:', error)
        return { success: false, earnings: [], totalEarned: 0 }
    }
}

// ================================================================================
// GET GOAL PURCHASES - WHO BOUGHT (creator only)
// ================================================================================

export async function getGoalPurchases(goalId: string) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: 'Unauthorized', purchases: [] }
        }

        const goal = await prisma.pathfinderGoal.findFirst({
            where: { id: goalId, userId: session.user.id },
        })

        if (!goal) {
            return { success: false, error: 'Goal not found', purchases: [] }
        }

        const purchases = await prisma.pathfinderGoalPurchase.findMany({
            where: { goalId },
            orderBy: { createdAt: 'desc' },
            include: {
                buyer: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        image: true,
                        email: true,
                    },
                },
            },
        })

        return { success: true, purchases }
    } catch (error) {
        console.error('Error fetching purchases:', error)
        return { success: false, purchases: [] }
    }
}
