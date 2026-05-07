'use server'

import { getSession } from '@repo/auth'
import { headers } from 'next/headers'
import {
    db,
    socialConnections,
    socialShares,
    userBadges,
} from '@repo/db'
import { eq, and, desc } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

// ================================================================================
// TYPES
// ================================================================================

export interface ShareContentInput {
    title: string
    message: string
    imageUrl?: string
    badgeId?: string
    levelUp?: number
    achievementType: 'badge' | 'level_up' | 'milestone' | 'project'
}

// ================================================================================
// GET SOCIAL CONNECTIONS
// ================================================================================

export async function getSocialConnections() {
    try {
        const session = await getSession(headers())
        if (!session?.user?.id) {
            return { success: false, error: 'Unauthorized' }
        }

        const connections = await db.query.socialConnections.findMany({
            where: eq(socialConnections.userId, session.user.id),
            columns: {
                id: true,
                provider: true,
                accountName: true,
                accountHandle: true,
                accountImage: true,
                isActive: true,
                connectedAt: true,
            },
        })

        return { success: true, connections }
    } catch (error) {
        console.error('Error fetching social connections:', error)
        return { success: false, error: 'Failed to fetch connections' }
    }
}

// ================================================================================
// DISCONNECT SOCIAL ACCOUNT
// ================================================================================

export async function disconnectSocialAccount(provider: 'TWITTER' | 'LINKEDIN') {
    try {
        const session = await getSession(headers())
        if (!session?.user?.id) {
            return { success: false, error: 'Unauthorized' }
        }

        await db.delete(socialConnections)
            .where(and(
                eq(socialConnections.userId, session.user.id),
                eq(socialConnections.provider, provider)
            ))

        revalidatePath('/settings/integrations')
        return { success: true }
    } catch (error) {
        console.error('Error disconnecting social account:', error)
        return { success: false, error: 'Failed to disconnect account' }
    }
}

// ================================================================================
// GENERATE SHARE CONTENT
// ================================================================================

export async function generateShareContent(badgeId: string) {
    try {
        const session = await getSession(headers())
        if (!session?.user?.id) {
            return { success: false, error: 'Unauthorized' }
        }

        const userBadge = await db.query.userBadges.findFirst({
            where: and(
                eq(userBadges.userId, session.user.id),
                eq(userBadges.badgeId, badgeId)
            ),
            with: { badge: true },
        })

        if (!userBadge || userBadge.status !== 'CLAIMED') {
            return { success: false, error: 'Badge not found or not claimed' }
        }

        const badge = userBadge.badge
        const rarityEmoji = {
            COMMON: '🥉',
            RARE: '🥈',
            EPIC: '🥇',
            LEGENDARY: '👑',
            MYTHIC: '🌟',
        }[badge.rarity] || '🏆'

        // Generate share templates
        const templates = [
            {
                twitter: `${badge.icon} Just earned the "${badge.name}" badge on @CoderzHQ! ${rarityEmoji}\n\n${badge.description}\n\n#Coding #Achievement #Developer`,
                linkedin: `🎉 Achievement Unlocked!\n\nI just earned the "${badge.name}" badge on Coderz - ${badge.description}\n\nIt's a ${badge.rarity.toLowerCase()} achievement worth ${badge.xpReward} XP!\n\n#Developer #Coding #Achievement #Learning`,
            },
            {
                twitter: `${rarityEmoji} New achievement unlocked: ${badge.name}! ${badge.icon}\n\n${badge.description}\n\nBuilding my coding skills with @CoderzHQ\n\n#DevLife #Coding`,
                linkedin: `${badge.icon} Proud to share that I've achieved the "${badge.name}" badge!\n\n${badge.description}\n\nContinuing my coding journey and loving every step of it.\n\n#Developer #Growth #Achievement`,
            },
        ]

        const selected = templates[Math.floor(Math.random() * templates.length)]

        return {
            success: true,
            badge: {
                name: badge.name,
                icon: badge.icon,
                color: badge.color,
                rarity: badge.rarity,
            },
            content: selected,
        }
    } catch (error) {
        console.error('Error generating share content:', error)
        return { success: false, error: 'Failed to generate content' }
    }
}

// ================================================================================
// IMPROVE CONTENT WITH AI
// ================================================================================

export async function improveContentWithAI(content: string, platform: 'twitter' | 'linkedin') {
    try {
        const session = await getSession(headers())
        if (!session?.user?.id) {
            return { success: false, error: 'Unauthorized' }
        }

        // In production, this would call OpenAI to improve the content
        // For now, return a slightly modified version
        const improved = platform === 'twitter'
            ? content.length > 280
                ? content.substring(0, 277) + '...'
                : content
            : content

        return { success: true, content: improved }
    } catch (error) {
        console.error('Error improving content:', error)
        return { success: false, error: 'Failed to improve content' }
    }
}

// ================================================================================
// SHARE TO SOCIAL (Records the share, actual posting handled client-side via OAuth)
// ================================================================================

export async function recordSocialShare(data: {
    provider: 'TWITTER' | 'LINKEDIN'
    shareType: string
    referenceId?: string
    content: string
    externalPostId?: string
    externalUrl?: string
    wasSuccessful: boolean
    errorMessage?: string
}) {
    try {
        const session = await getSession(headers())
        if (!session?.user?.id) {
            return { success: false, error: 'Unauthorized' }
        }

        const [share] = await db.insert(socialShares).values({
            userId: session.user.id,
            provider: data.provider,
            shareType: data.shareType,
            referenceId: data.referenceId,
            content: data.content,
            externalPostId: data.externalPostId,
            externalUrl: data.externalUrl,
            wasSuccessful: data.wasSuccessful,
            errorMessage: data.errorMessage,
        }).returning()

        // Update badge share count if applicable
        if (data.wasSuccessful && data.referenceId && data.shareType === 'badge') {
            const ubRow = await db.query.userBadges.findFirst({
                where: and(
                    eq(userBadges.userId, session.user.id),
                    eq(userBadges.badgeId, data.referenceId)
                ),
                columns: { id: true, shareCount: true },
            })

            if (ubRow) {
                await db.update(userBadges)
                    .set({
                        shareCount: ubRow.shareCount + 1,
                        ...(data.provider === 'TWITTER' ? { sharedToTwitter: true } : {}),
                        ...(data.provider === 'LINKEDIN' ? { sharedToLinkedIn: true } : {}),
                    })
                    .where(eq(userBadges.id, ubRow.id))
            }
        }

        // Update social connection last used
        if (data.wasSuccessful) {
            await db.update(socialConnections)
                .set({ lastUsedAt: new Date() })
                .where(and(
                    eq(socialConnections.userId, session.user.id),
                    eq(socialConnections.provider, data.provider)
                ))
        }

        return { success: true, share }
    } catch (error) {
        console.error('Error recording social share:', error)
        return { success: false, error: 'Failed to record share' }
    }
}

// ================================================================================
// GET SHARE HISTORY
// ================================================================================

export async function getShareHistory(limit = 20) {
    try {
        const session = await getSession(headers())
        if (!session?.user?.id) {
            return { success: false, error: 'Unauthorized' }
        }

        const shares = await db.query.socialShares.findMany({
            where: eq(socialShares.userId, session.user.id),
            orderBy: desc(socialShares.sharedAt),
            limit,
        })

        return { success: true, shares }
    } catch (error) {
        console.error('Error fetching share history:', error)
        return { success: false, error: 'Failed to fetch history' }
    }
}

// ================================================================================
// GENERATE LEVEL UP SHARE CONTENT
// ================================================================================

export async function generateLevelUpShareContent(level: number, title: string) {
    try {
        const session = await getSession(headers())
        if (!session?.user?.id) {
            return { success: false, error: 'Unauthorized' }
        }

        const templates = {
            twitter: `🚀 Level Up! I just reached Level ${level}: "${title}" on @CoderzHQ!\n\nThe coding journey continues! 💪\n\n#Developer #Coding #LevelUp`,
            linkedin: `🎉 Milestone Achieved!\n\nI've just reached Level ${level}: "${title}" on Coderz!\n\nEvery level represents hours of learning, coding, and growth. Excited to continue this journey!\n\n#Developer #ContinuousLearning #Coding`,
        }

        return { success: true, content: templates }
    } catch (error) {
        console.error('Error generating level up content:', error)
        return { success: false, error: 'Failed to generate content' }
    }
}
