'use server'

import { auth } from '@repo/auth'
import { prisma } from '@repo/prisma'
import { BadgeCategory } from '@repo/prisma/client'
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
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: 'Unauthorized' }
        }

        const userId = session.user.id

        // Get all badges
        const allBadges = await prisma.badge.findMany({
            where: { isActive: true },
            orderBy: [{ category: 'asc' }, { tier: 'asc' }, { order: 'asc' }],
        })

        // Get user's badge progress
        const userBadges = await prisma.userBadge.findMany({
            where: { userId },
            include: { badge: true },
        })

        const userBadgeMap = new Map(userBadges.map(ub => [ub.badgeId, ub]))

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
            totalShares: userBadges.reduce((sum, ub) => sum + ub.shareCount, 0),
        }

        // Get user level info
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { totalXp: true, currentLevel: true },
        })

        const levels = await prisma.level.findMany({
            orderBy: { level: 'asc' },
        })

        const currentLevelConfig = levels.find(l => l.level === (user?.currentLevel || 1))
        const nextLevelConfig = levels.find(l => l.level === (user?.currentLevel || 1) + 1)

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
        const socialConnections = await prisma.socialConnection.findMany({
            where: { userId, isActive: true },
            select: {
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
            socialConnections,
            levels,
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
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: 'Unauthorized' }
        }

        const userId = session.user.id

        // Get user badge
        const userBadge = await prisma.userBadge.findUnique({
            where: { userId_badgeId: { userId, badgeId } },
            include: { badge: true },
        })

        if (!userBadge) {
            return { success: false, error: 'Badge not found' }
        }

        if (userBadge.status !== 'READY_TO_CLAIM') {
            return { success: false, error: 'Badge is not ready to claim' }
        }

        // Update badge status and award rewards
        await prisma.$transaction([
            // Update user badge
            prisma.userBadge.update({
                where: { id: userBadge.id },
                data: {
                    status: 'CLAIMED',
                    claimedAt: new Date(),
                },
            }),
            // Award XP
            prisma.user.update({
                where: { id: userId },
                data: {
                    totalXp: { increment: userBadge.badge.xpReward },
                    credits: { increment: userBadge.badge.creditsReward },
                },
            }),
            // Create XP transaction
            prisma.xpTransaction.create({
                data: {
                    userId,
                    amount: userBadge.badge.xpReward,
                    description: `Claimed badge: ${userBadge.badge.name}`,
                    type: 'REWARD',
                    source: 'badge',
                    sourceId: badgeId,
                },
            }),
            // Create notification
            prisma.achievementNotification.create({
                data: {
                    userId,
                    type: 'badge_claimed',
                    title: 'Badge Claimed!',
                    message: `You claimed the "${userBadge.badge.name}" badge and earned ${userBadge.badge.xpReward} XP and ${userBadge.badge.creditsReward} credits!`,
                    referenceType: 'badge',
                    referenceId: badgeId,
                    icon: userBadge.badge.icon,
                    color: userBadge.badge.color,
                },
            }),
        ])

        revalidatePath('/achievements')
        return {
            success: true,
            badge: userBadge.badge,
            xpReward: userBadge.badge.xpReward,
            creditsReward: userBadge.badge.creditsReward,
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
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: 'Unauthorized' }
        }

        const userId = session.user.id

        const userBadge = await prisma.userBadge.findUnique({
            where: { userId_badgeId: { userId, badgeId } },
        })

        if (!userBadge || userBadge.status !== 'CLAIMED') {
            return { success: false, error: 'Badge not found or not claimed' }
        }

        // Check if already pinned 5 badges
        if (!userBadge.isPinned) {
            const pinnedCount = await prisma.userBadge.count({
                where: { userId, isPinned: true },
            })
            if (pinnedCount >= 5) {
                return { success: false, error: 'You can only pin up to 5 badges' }
            }
        }

        await prisma.userBadge.update({
            where: { id: userBadge.id },
            data: { isPinned: !userBadge.isPinned },
        })

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
        const session = await auth()
        const targetUserId = userId || session?.user?.id
        
        if (!targetUserId) {
            return { success: false, error: 'User not found' }
        }

        const pinnedBadges = await prisma.userBadge.findMany({
            where: { userId: targetUserId, isPinned: true, status: 'CLAIMED' },
            include: { badge: true },
            orderBy: { displayOrder: 'asc' },
            take: 5,
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
        const session = await auth()
        const targetUserId = userId || session?.user?.id
        
        if (!targetUserId) {
            return { success: false, error: 'User not found' }
        }

        const recentBadges = await prisma.userBadge.findMany({
            where: { userId: targetUserId, status: 'CLAIMED' },
            include: { badge: true },
            orderBy: { claimedAt: 'desc' },
            take: limit,
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
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: 'Unauthorized' }
        }

        const userId = session.user.id

        const badges = await prisma.badge.findMany({
            where: { category: category as BadgeCategory, isActive: true },
            orderBy: [{ tier: 'asc' }, { order: 'asc' }],
        })

        const userBadges = await prisma.userBadge.findMany({
            where: { userId, badgeId: { in: badges.map(b => b.id) } },
        })

        const userBadgeMap = new Map(userBadges.map(ub => [ub.badgeId, ub]))

        return {
            success: true,
            badges: badges.map(badge => ({
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
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: 'Unauthorized' }
        }

        const notifications = await prisma.achievementNotification.findMany({
            where: { userId: session.user.id, isDismissed: false },
            orderBy: { createdAt: 'desc' },
            take: 20,
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
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: 'Unauthorized' }
        }

        await prisma.achievementNotification.update({
            where: { id: notificationId, userId: session.user.id },
            data: { isRead: true, readAt: new Date() },
        })

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
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: 'Unauthorized' }
        }

        await prisma.achievementNotification.update({
            where: { id: notificationId, userId: session.user.id },
            data: { isDismissed: true },
        })

        return { success: true }
    } catch (error) {
        console.error('Error dismissing notification:', error)
        return { success: false, error: 'Failed to dismiss notification' }
    }
}
