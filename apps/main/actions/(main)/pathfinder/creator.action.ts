'use server'

import { getSession } from '@repo/auth'
import { headers } from 'next/headers'
import { db, pathfinderGoals, pathfinderGoalPurchases, earnings } from '@repo/db'
import { eq, and, desc } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

// ================================================================================
// SET CREDIT PRICE (creator only)
// ================================================================================

export async function setGoalCreditPrice(goalId: string, creditPrice: number | null) {
    try {
        const session = await getSession(headers())
        if (!session?.user?.id) {
            return { success: false, error: 'Unauthorized' }
        }

        const goal = await db.query.pathfinderGoals.findFirst({
            where: and(
                eq(pathfinderGoals.id, goalId),
                eq(pathfinderGoals.userId, session.user.id),
                eq(pathfinderGoals.isPublic, true)
            ),
        })

        if (!goal) {
            return { success: false, error: 'Goal not found or you cannot set price for this goal' }
        }

        if (creditPrice !== null && (creditPrice < 0 || creditPrice > 9999)) {
            return { success: false, error: 'Price must be between 0 and 9999 credits' }
        }

        await db.update(pathfinderGoals)
            .set({ creditPrice })
            .where(eq(pathfinderGoals.id, goalId))

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
        const session = await getSession(headers())
        if (!session?.user?.id) {
            return { success: false, error: 'Unauthorized', earnings: [], totalEarned: 0 }
        }

        const goal = await db.query.pathfinderGoals.findFirst({
            where: and(eq(pathfinderGoals.id, goalId), eq(pathfinderGoals.userId, session.user.id)),
        })

        if (!goal) {
            return { success: false, error: 'Goal not found', earnings: [], totalEarned: 0 }
        }

        const earningRows = await db.query.earnings.findMany({
            where: and(
                eq(earnings.userId, session.user.id),
                eq(earnings.module, 'PATHFINDER'),
                eq(earnings.referenceId, goalId)
            ),
            orderBy: [desc(earnings.createdAt)],
        })

        const totalEarned = earningRows.reduce((s, e) => s + e.amount, 0)

        return {
            success: true,
            earnings: earningRows,
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
        const session = await getSession(headers())
        if (!session?.user?.id) {
            return { success: false, error: 'Unauthorized', purchases: [] }
        }

        const goal = await db.query.pathfinderGoals.findFirst({
            where: and(eq(pathfinderGoals.id, goalId), eq(pathfinderGoals.userId, session.user.id)),
        })

        if (!goal) {
            return { success: false, error: 'Goal not found', purchases: [] }
        }

        const purchases = await db.query.pathfinderGoalPurchases.findMany({
            where: eq(pathfinderGoalPurchases.goalId, goalId),
            orderBy: [desc(pathfinderGoalPurchases.createdAt)],
            with: {
                buyer: {
                    columns: {
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
