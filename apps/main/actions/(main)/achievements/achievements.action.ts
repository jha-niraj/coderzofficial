'use server'

import { getSession } from '@repo/auth'
import { headers } from 'next/headers'
import {
    db,
    badges,
    userBadges,
    levels,
    socialConnections,
    users,
    xpTransactions,
    achievementNotifications,
} from '@repo/db'
import { eq, and, asc, desc, sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import type {
    BadgeRequirements, BadgeProgress
} from '@/types/achievements'

// ================================================================================
// TYPES
// ================================================================================

export interface BadgeWithProgress {
    id: string
    slug: string
    name: string
    description: string
    icon: string
    color: string
    bgGradient: string | null
    category: string
    rarity: string
    tier: number
    requirements: BadgeRequirements
    xpReward: number
    creditsReward: number
    isLimited: boolean
    // User progress
    status: 'LOCKED' | 'IN_PROGRESS' | 'READY_TO_CLAIM' | 'CLAIMED'
    progress: BadgeProgress | null
    progressPercent: number
    claimedAt: Date | null
    isPinned: boolean
}

export interface AchievementStats {
    totalBadges: number
    claimedBadges: number
    readyToClaim: number
    inProgress: number
    commonBadges: number
    rareBadges: number
    epicBadges: number
    legendaryBadges: number
    mythicBadges: number
    totalXpFromBadges: number
    totalCreditsFromBadges: number
    totalShares: number
}

export interface LevelInfo {
    level: number
    title: string
    icon: string | null
    color: string | null
    description: string | null
    xpRequired: number
    currentXp: number
    nextLevelXp: number | null
    progressPercent: number
    xpToNext: number
}

// ================================================================================
// GET USER ACHIEVEMENTS DATA
// ================================================================================

export async function getUserAchievements() {
    try {
        const session = await getSession(headers())
        if (!session?.user?.id) {
            return { success: false, error: 'Unauthorized' }
        }

        const userId = session.user.id

        // Get all badges
        const allBadges = await db.query.badges.findMany({
            where: eq(badges.isActive, true),
            orderBy: [asc(badges.category), asc(badges.tier), asc(badges.order)],
        })

        // Get user's badge progress
        const ubRows = await db.query.userBadges.findMany({
            where: eq(userBadges.userId, userId),
            with: { badge: true },
        })

        const userBadgeMap = new Map(ubRows.map(ub => [ub.badgeId, ub]))

        // Combine badges with user progress
        const badgesWithProgress: BadgeWithProgress[] = allBadges.map(badge => {
            const userBadge = userBadgeMap.get(badge.id)
            return {
                id: badge.id,
                slug: badge.slug,
                name: badge.name,
                description: badge.description,
                icon: badge.icon,
                color: badge.color,
                bgGradient: badge.bgGradient,
                category: badge.category,
                rarity: badge.rarity,
                tier: badge.tier,
                requirements: (badge.requirements ?? {}) as unknown as BadgeRequirements,
                xpReward: badge.xpReward,
                creditsReward: badge.creditsReward,
                isLimited: badge.isLimited,
                status: userBadge?.status || 'LOCKED',
                progress: (userBadge?.progress ?? null) as BadgeProgress | null,
                progressPercent: userBadge?.progressPercent || 0,
                claimedAt: userBadge?.claimedAt || null,
                isPinned: userBadge?.isPinned || false,
            }
        })

        // Calculate stats
        const claimedBadges = badgesWithProgress.filter(b => b.status === 'CLAIMED')
        const stats: AchievementStats = {
            totalBadges: allBadges.length,
            claimedBadges: claimedBadges.length,
            readyToClaim: badgesWithProgress.filter(b => b.status === 'READY_TO_CLAIM').length,
            inProgress: badgesWithProgress.filter(b => b.status === 'IN_PROGRESS').length,
            commonBadges: claimedBadges.filter(b => b.rarity === 'COMMON').length,
            rareBadges: claimedBadges.filter(b => b.rarity === 'RARE').length,
            epicBadges: claimedBadges.filter(b => b.rarity === 'EPIC').length,
            legendaryBadges: claimedBadges.filter(b => b.rarity === 'LEGENDARY').length,
            mythicBadges: claimedBadges.filter(b => b.rarity === 'MYTHIC').length,
            totalXpFromBadges: claimedBadges.reduce((sum, b) => sum + b.xpReward, 0),
            totalCreditsFromBadges: claimedBadges.reduce((sum, b) => sum + b.creditsReward, 0),
            totalShares: ubRows.reduce((sum, ub) => sum + ub.shareCount, 0),
        }

        // Get user level info
        const user = await db.query.users.findFirst({
            where: eq(users.id, userId),
            columns: { totalXp: true, currentLevel: true },
        })

        const allLevels = await db.query.levels.findMany({
            orderBy: asc(levels.level),
        })

        const currentLevelConfig = allLevels.find(l => l.level === (user?.currentLevel || 1))
        const nextLevelConfig = allLevels.find(l => l.level === (user?.currentLevel || 1) + 1)

        const levelInfo: LevelInfo = {
            level: user?.currentLevel || 1,
            title: currentLevelConfig?.title || 'Code Seedling',
            icon: currentLevelConfig?.icon || '🌱',
            color: currentLevelConfig?.color || '#4ade80',
            description: currentLevelConfig?.description || null,
            xpRequired: currentLevelConfig?.xpRequired || 0,
            currentXp: user?.totalXp || 0,
            nextLevelXp: nextLevelConfig?.xpRequired || null,
            progressPercent: nextLevelConfig
                ? Math.min(100, Math.round(((user?.totalXp || 0) - (currentLevelConfig?.xpRequired || 0)) /
                    ((nextLevelConfig?.xpRequired || 0) - (currentLevelConfig?.xpRequired || 0)) * 100))
                : 100,
            xpToNext: nextLevelConfig
                ? (nextLevelConfig.xpRequired - (user?.totalXp || 0))
                : 0,
        }

        // Get social connections
        const socialConns = await db.query.socialConnections.findMany({
            where: and(
                eq(socialConnections.userId, userId),
                eq(socialConnections.isActive, true)
            ),
            columns: {
                provider: true,
                accountName: true,
                accountHandle: true,
                accountImage: true,
            },
        })

        return {
            success: true,
            badges: badgesWithProgress,
            stats,
            levelInfo,
            socialConnections: socialConns,
            levels: allLevels,
        }
    } catch (error) {
        console.error('Error fetching achievements:', error)
        return { success: false, error: 'Failed to fetch achievements' }
    }
}

// ================================================================================
// CLAIM BADGE
// ================================================================================

export async function claimBadge(badgeId: string) {
    try {
        const session = await getSession(headers())
        if (!session?.user?.id) {
            return { success: false, error: 'Unauthorized' }
        }

        const userId = session.user.id

        // Get user badge
        const userBadge = await db.query.userBadges.findFirst({
            where: and(eq(userBadges.userId, userId), eq(userBadges.badgeId, badgeId)),
            with: { badge: true },
        })

        if (!userBadge) {
            return { success: false, error: 'Badge not found' }
        }

        if (userBadge.status !== 'READY_TO_CLAIM') {
            return { success: false, error: 'Badge is not ready to claim' }
        }

        const badge = userBadge.badge

        // Update badge status and award rewards
        await db.transaction(async (tx) => {
            await tx.update(userBadges)
                .set({ status: 'CLAIMED', claimedAt: new Date() })
                .where(eq(userBadges.id, userBadge.id))

            await tx.update(users)
                .set({
                    totalXp: sql`${users.totalXp} + ${badge.xpReward}`,
                    credits: sql`${users.credits} + ${badge.creditsReward}`,
                })
                .where(eq(users.id, userId))

            await tx.insert(xpTransactions).values({
                userId,
                amount: badge.xpReward,
                description: `Claimed badge: ${badge.name}`,
                type: 'REWARD',
                source: 'badge',
                sourceId: badgeId,
            })

            await tx.insert(achievementNotifications).values({
                userId,
                type: 'badge_claimed',
                title: 'Badge Claimed!',
                message: `You claimed the "${badge.name}" badge and earned ${badge.xpReward} XP and ${badge.creditsReward} credits!`,
                referenceType: 'badge',
                referenceId: badgeId,
                icon: badge.icon,
                color: badge.color,
            })
        })

        revalidatePath('/achievements')
        return {
            success: true,
            badge,
            xpReward: badge.xpReward,
            creditsReward: badge.creditsReward,
        }
    } catch (error) {
        console.error('Error claiming badge:', error)
        return { success: false, error: 'Failed to claim badge' }
    }
}

// ================================================================================
// TOGGLE PIN BADGE
// ================================================================================

export async function togglePinBadge(badgeId: string) {
    try {
        const session = await getSession(headers())
        if (!session?.user?.id) {
            return { success: false, error: 'Unauthorized' }
        }

        const userId = session.user.id

        const userBadge = await db.query.userBadges.findFirst({
            where: and(eq(userBadges.userId, userId), eq(userBadges.badgeId, badgeId)),
        })

        if (!userBadge || userBadge.status !== 'CLAIMED') {
            return { success: false, error: 'Badge not found or not claimed' }
        }

        // Check if already pinned 5 badges
        if (!userBadge.isPinned) {
            const pinnedRows = await db.query.userBadges.findMany({
                where: and(eq(userBadges.userId, userId), eq(userBadges.isPinned, true)),
                columns: { id: true },
            })
            if (pinnedRows.length >= 5) {
                return { success: false, error: 'You can only pin up to 5 badges' }
            }
        }

        await db.update(userBadges)
            .set({ isPinned: !userBadge.isPinned })
            .where(eq(userBadges.id, userBadge.id))

        revalidatePath('/achievements')
        revalidatePath('/profile')
        return { success: true, isPinned: !userBadge.isPinned }
    } catch (error) {
        console.error('Error toggling pin:', error)
        return { success: false, error: 'Failed to toggle pin' }
    }
}

// ================================================================================
// GET PINNED BADGES (for profile)
// ================================================================================

export async function getPinnedBadges(userId?: string) {
    try {
        const session = await getSession(headers())
        const targetUserId = userId || session?.user?.id

        if (!targetUserId) {
            return { success: false, error: 'User not found' }
        }

        const pinnedBadges = await db.query.userBadges.findMany({
            where: and(
                eq(userBadges.userId, targetUserId),
                eq(userBadges.isPinned, true),
                eq(userBadges.status, 'CLAIMED')
            ),
            with: { badge: true },
            orderBy: asc(userBadges.displayOrder),
            limit: 5,
        })

        return {
            success: true,
            badges: pinnedBadges.map(ub => ({
                id: ub.badge.id,
                slug: ub.badge.slug,
                name: ub.badge.name,
                icon: ub.badge.icon,
                color: ub.badge.color,
                bgGradient: ub.badge.bgGradient,
                rarity: ub.badge.rarity,
                claimedAt: ub.claimedAt,
            })),
        }
    } catch (error) {
        console.error('Error fetching pinned badges:', error)
        return { success: false, error: 'Failed to fetch pinned badges' }
    }
}

// ================================================================================
// GET RECENT ACHIEVEMENTS (for profile)
// ================================================================================

export async function getRecentAchievements(userId?: string, limit = 5) {
    try {
        const session = await getSession(headers())
        const targetUserId = userId || session?.user?.id

        if (!targetUserId) {
            return { success: false, error: 'User not found' }
        }

        const recentBadges = await db.query.userBadges.findMany({
            where: and(
                eq(userBadges.userId, targetUserId),
                eq(userBadges.status, 'CLAIMED')
            ),
            with: { badge: true },
            orderBy: desc(userBadges.claimedAt),
            limit,
        })

        return {
            success: true,
            achievements: recentBadges.map(ub => ({
                id: ub.badge.id,
                slug: ub.badge.slug,
                name: ub.badge.name,
                description: ub.badge.description,
                icon: ub.badge.icon,
                color: ub.badge.color,
                bgGradient: ub.badge.bgGradient,
                rarity: ub.badge.rarity,
                xpReward: ub.badge.xpReward,
                creditsReward: ub.badge.creditsReward,
                claimedAt: ub.claimedAt,
            })),
        }
    } catch (error) {
        console.error('Error fetching recent achievements:', error)
        return { success: false, error: 'Failed to fetch recent achievements' }
    }
}

// ================================================================================
// GET BADGES BY CATEGORY
// ================================================================================

export async function getBadgesByCategory(category: string) {
    try {
        const session = await getSession(headers())
        if (!session?.user?.id) {
            return { success: false, error: 'Unauthorized' }
        }

        const userId = session.user.id

        const badgeRows = await db.query.badges.findMany({
            where: and(
                eq(badges.category, category as typeof badges.$inferSelect['category']),
                eq(badges.isActive, true)
            ),
            orderBy: [asc(badges.tier), asc(badges.order)],
        })

        const ubRows = await db.query.userBadges.findMany({
            where: and(
                eq(userBadges.userId, userId),
            ),
            columns: {
                badgeId: true,
                status: true,
                progress: true,
                progressPercent: true,
                claimedAt: true,
                isPinned: true,
            },
        })

        const userBadgeMap = new Map(ubRows.map(ub => [ub.badgeId, ub]))

        return {
            success: true,
            badges: badgeRows.map(badge => ({
                ...badge,
                status: userBadgeMap.get(badge.id)?.status || 'LOCKED',
                progress: userBadgeMap.get(badge.id)?.progress || null,
                progressPercent: userBadgeMap.get(badge.id)?.progressPercent || 0,
                claimedAt: userBadgeMap.get(badge.id)?.claimedAt || null,
                isPinned: userBadgeMap.get(badge.id)?.isPinned || false,
            })),
        }
    } catch (error) {
        console.error('Error fetching badges by category:', error)
        return { success: false, error: 'Failed to fetch badges' }
    }
}

// ================================================================================
// GET ACHIEVEMENT NOTIFICATIONS
// ================================================================================

export async function getAchievementNotifications() {
    try {
        const session = await getSession(headers())
        if (!session?.user?.id) {
            return { success: false, error: 'Unauthorized' }
        }

        const notifications = await db.query.achievementNotifications.findMany({
            where: and(
                eq(achievementNotifications.userId, session.user.id),
                eq(achievementNotifications.isDismissed, false)
            ),
            orderBy: desc(achievementNotifications.createdAt),
            limit: 20,
        })

        return { success: true, notifications }
    } catch (error) {
        console.error('Error fetching notifications:', error)
        return { success: false, error: 'Failed to fetch notifications' }
    }
}

// ================================================================================
// MARK NOTIFICATION AS READ
// ================================================================================

export async function markNotificationRead(notificationId: string) {
    try {
        const session = await getSession(headers())
        if (!session?.user?.id) {
            return { success: false, error: 'Unauthorized' }
        }

        await db.update(achievementNotifications)
            .set({ isRead: true, readAt: new Date() })
            .where(and(
                eq(achievementNotifications.id, notificationId),
                eq(achievementNotifications.userId, session.user.id)
            ))

        return { success: true }
    } catch (error) {
        console.error('Error marking notification read:', error)
        return { success: false, error: 'Failed to mark notification read' }
    }
}

// ================================================================================
// DISMISS NOTIFICATION
// ================================================================================

export async function dismissNotification(notificationId: string) {
    try {
        const session = await getSession(headers())
        if (!session?.user?.id) {
            return { success: false, error: 'Unauthorized' }
        }

        await db.update(achievementNotifications)
            .set({ isDismissed: true })
            .where(and(
                eq(achievementNotifications.id, notificationId),
                eq(achievementNotifications.userId, session.user.id)
            ))

        return { success: true }
    } catch (error) {
        console.error('Error dismissing notification:', error)
        return { success: false, error: 'Failed to dismiss notification' }
    }
}
