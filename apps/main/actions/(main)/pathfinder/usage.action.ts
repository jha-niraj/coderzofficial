'use server'

import { auth } from '@repo/auth'
import { prisma } from '@repo/prisma'
import {
    openaiTokensToCredits,
    exaCallToCredits,
    PATHFINDER_CREDITS,
} from '@/lib/constants/pricing'

export interface GoalUsageSummary {
    goalId: string
    pendingCredits: number
    totalInputTokens: number
    totalOutputTokens: number
    exaCalls: number
    isBlocked: boolean
    ledgerCount: number
}

/**
 * Log AI usage for a goal and return the cost in credits.
 * Does NOT deduct - we accumulate. Deduction happens when user settles or at threshold.
 */
export async function logPathfinderUsage(params: {
    goalId: string
    userId: string
    action: string
    provider: 'openai' | 'exa'
    inputTokens?: number
    outputTokens?: number
}) {
    const { goalId, userId, action, provider, inputTokens = 0, outputTokens = 0 } = params

    let creditsCost = 0
    if (provider === 'openai') {
        creditsCost = openaiTokensToCredits(inputTokens, outputTokens)
    } else if (provider === 'exa') {
        creditsCost = exaCallToCredits()
    }

    await prisma.pathfinderUsageLedger.create({
        data: {
            goalId,
            userId,
            action,
            provider,
            inputTokens,
            outputTokens,
            creditsCost,
            deducted: false,
        },
    })

    return { creditsCost, inputTokens, outputTokens }
}

/**
 * Get pending (undeducted) usage for a goal.
 */
export async function getGoalUsageSummary(goalId: string): Promise<GoalUsageSummary | null> {
    const session = await auth()
    if (!session?.user?.id) return null

    const goal = await prisma.pathfinderGoal.findFirst({
        where: { id: goalId, userId: session.user.id },
    })
    if (!goal) return null

    const ledger = await prisma.pathfinderUsageLedger.findMany({
        where: { goalId, deducted: false },
    })

    const totalInputTokens = ledger.reduce((s, l) => s + l.inputTokens, 0)
    const totalOutputTokens = ledger.reduce((s, l) => s + l.outputTokens, 0)
    const exaCalls = ledger.filter((l) => l.provider === 'exa').length
    const pendingCredits = ledger.reduce((s, l) => s + l.creditsCost, 0)
    const isBlocked = pendingCredits >= PATHFINDER_CREDITS.usageBlockThreshold

    return {
        goalId,
        pendingCredits,
        totalInputTokens,
        totalOutputTokens,
        exaCalls,
        isBlocked,
        ledgerCount: ledger.length,
    }
}

/**
 * Check if user can run AI (not blocked by usage threshold).
 */
export async function canRunPathfinderAI(goalId: string): Promise<{
    allowed: boolean
    pendingCredits: number
    reason?: string
}> {
    const summary = await getGoalUsageSummary(goalId)
    if (!summary) {
        return { allowed: false, pendingCredits: 0, reason: 'Goal not found' }
    }

    if (summary.isBlocked) {
        return {
            allowed: false,
            pendingCredits: summary.pendingCredits,
            reason: `Usage limit reached (${summary.pendingCredits} credits pending). Add credits to continue.`,
        }
    }

    return {
        allowed: true,
        pendingCredits: summary.pendingCredits,
    }
}
