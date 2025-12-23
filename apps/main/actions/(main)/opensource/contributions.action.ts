'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { OSContributionType, OSContributionStatus } from '@prisma/client'

// ==========================================
// USER CONTRIBUTION ACTIONS
// ==========================================

// Get user's contribution stats
export async function getUserOSStats() {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: 'You must be logged in' }
        }

        const stats = await prisma.userOSStats.findUnique({
            where: { userId: session.user.id }
        })

        const recentContributions = await prisma.oSContribution.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: 'desc' },
            take: 10,
            include: {
                project: {
                    select: {
                        title: true,
                        slug: true
                    }
                },
                issue: {
                    select: {
                        title: true
                    }
                }
            }
        })

        const activeIssues = await prisma.oSIssue.findMany({
            where: {
                assignedToId: session.user.id,
                status: { in: ['ASSIGNED', 'IN_REVIEW'] }
            },
            include: {
                project: {
                    select: {
                        title: true,
                        slug: true
                    }
                }
            }
        })

        const certification = await prisma.oSCertification.findFirst({
            where: {
                userId: session.user.id,
                isActive: true
            }
        })

        return {
            success: true,
            stats: stats || {
                modulesCompleted: 0,
                lessonsCompleted: 0,
                isCertified: false,
                totalContributions: 0,
                prsMerged: 0,
                totalBountyEarned: 0
            },
            recentContributions,
            activeIssues,
            certification
        }
    } catch (error) {
        console.error('Error fetching user stats:', error)
        return { success: false, error: 'Failed to fetch stats' }
    }
}

// Get user's earnings
export async function getUserEarnings() {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: 'You must be logged in' }
        }

        const transactions = await prisma.oSEarningsTransaction.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: 'desc' },
            take: 50
        })

        const stats = await prisma.userOSStats.findUnique({
            where: { userId: session.user.id },
            select: {
                totalBountyEarned: true,
                pendingBounty: true
            }
        })

        return {
            success: true,
            transactions,
            totalEarned: stats?.totalBountyEarned || 0,
            pendingAmount: stats?.pendingBounty || 0
        }
    } catch (error) {
        console.error('Error fetching earnings:', error)
        return { success: false, error: 'Failed to fetch earnings' }
    }
}

// Get user contributions with filtering
export async function getUserContributions(params?: {
    type?: OSContributionType
    status?: OSContributionStatus
    limit?: number
}) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: 'You must be logged in', contributions: [] }
        }

        const contributions = await prisma.oSContribution.findMany({
            where: {
                userId: session.user.id,
                type: params?.type,
                status: params?.status
            },
            include: {
                project: {
                    select: {
                        title: true,
                        slug: true,
                        type: true
                    }
                },
                issue: {
                    select: {
                        title: true,
                        difficulty: true,
                        bountyAmount: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: params?.limit || 50
        })

        return { success: true, contributions }
    } catch (error) {
        console.error('Error fetching contributions:', error)
        return { success: false, error: 'Failed to fetch contributions', contributions: [] }
    }
}

// Get user contribution stats (dashboard summary)
export async function getUserContributionStats() {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: 'You must be logged in' }
        }

        const stats = await prisma.userOSStats.findUnique({
            where: { userId: session.user.id }
        })

        // Get contribution counts by status
        const contributionCounts = await prisma.oSContribution.groupBy({
            by: ['status'],
            where: { userId: session.user.id },
            _count: true
        })

        // Get recent activity
        const recentActivity = await prisma.oSContribution.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: 'desc' },
            take: 5,
            include: {
                project: { select: { title: true, slug: true } }
            }
        })

        return {
            success: true,
            stats: stats || {
                totalContributions: 0,
                prsMerged: 0,
                issuesSolved: 0,
                codeReviews: 0,
                totalBountyEarned: 0,
                pendingBounty: 0,
                reputation: 0
            },
            contributionCounts: contributionCounts.reduce((acc, c) => {
                acc[c.status] = c._count
                return acc
            }, {} as Record<string, number>),
            recentActivity
        }
    } catch (error) {
        console.error('Error fetching contribution stats:', error)
        return { success: false, error: 'Failed to fetch stats' }
    }
}

// Get user's activity timeline
export async function getUserActivityTimeline(params?: {
    page?: number
    limit?: number
}) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: 'You must be logged in', activities: [] }
        }

        const page = params?.page || 1
        const limit = params?.limit || 20
        const skip = (page - 1) * limit

        const contributions = await prisma.oSContribution.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit,
            include: {
                project: {
                    select: {
                        title: true,
                        slug: true,
                        type: true
                    }
                },
                issue: {
                    select: {
                        title: true,
                        difficulty: true
                    }
                }
            }
        })

        const total = await prisma.oSContribution.count({
            where: { userId: session.user.id }
        })

        return {
            success: true,
            activities: contributions,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: page
        }
    } catch (error) {
        console.error('Error fetching activity timeline:', error)
        return { success: false, error: 'Failed to fetch activities', activities: [] }
    }
}

// Get leaderboard
export async function getContributorsLeaderboard(params?: {
    period?: 'all' | 'month' | 'week'
    limit?: number
}) {
    try {
        const limit = params?.limit || 50

        // For period filtering, we'd need to aggregate contributions by date
        // For now, we'll use the overall stats
        const leaderboard = await prisma.userOSStats.findMany({
            where: {
                totalContributions: { gt: 0 }
            },
            orderBy: [
                { osXp: 'desc' },
                { prsMerged: 'desc' },
                { totalContributions: 'desc' }
            ],
            take: limit,
            select: {
                id: true,
                userId: true,
                totalContributions: true,
                prsMerged: true,
                issuesSolved: true,
                osXp: true,
                totalBountyEarned: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        image: true
                    }
                }
            }
        })

        return {
            success: true,
            leaderboard: leaderboard.map((entry, index) => ({
                rank: index + 1,
                user: entry.user,
                stats: {
                    contributions: entry.totalContributions,
                    prsMerged: entry.prsMerged,
                    issuesSolved: entry.issuesSolved,
                    xp: entry.osXp,
                    bountyEarned: entry.totalBountyEarned
                }
            }))
        }
    } catch (error) {
        console.error('Error fetching leaderboard:', error)
        return { success: false, error: 'Failed to fetch leaderboard', leaderboard: [] }
    }
}

// Get user's rank
export async function getUserRank() {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: 'You must be logged in' }
        }

        const userStats = await prisma.userOSStats.findUnique({
            where: { userId: session.user.id }
        })

        if (!userStats) {
            return { success: true, rank: null, totalContributors: 0 }
        }

        // Count users with higher XP
        const higherRanked = await prisma.userOSStats.count({
            where: {
                osXp: { gt: userStats.osXp }
            }
        })

        const totalContributors = await prisma.userOSStats.count({
            where: { totalContributions: { gt: 0 } }
        })

        return {
            success: true,
            rank: higherRanked + 1,
            totalContributors,
            percentile: totalContributors > 0 
                ? Math.round(((totalContributors - higherRanked) / totalContributors) * 100)
                : 0
        }
    } catch (error) {
        console.error('Error fetching user rank:', error)
        return { success: false, error: 'Failed to fetch rank' }
    }
}
