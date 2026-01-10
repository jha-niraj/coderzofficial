'use server'

import { auth } from '@repo/auth'
import { prisma } from '@repo/prisma'
import { revalidatePath } from 'next/cache'

// ==========================================
// GITHUB INTEGRATION ACTIONS
// ==========================================

/**
 * Get the current user's GitHub profile
 */
export async function getGitHubProfile() {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: 'You must be logged in' }
        }

        const githubProfile = await prisma.oSGitHubProfile.findUnique({
            where: { userId: session.user.id },
            select: {
                id: true,
                githubId: true,
                githubUsername: true,
                githubAvatar: true,
                lastSyncedAt: true,
                createdAt: true,
            }
        })

        if (!githubProfile) {
            return { success: true, profile: null }
        }

        // Get contribution summary from OS stats
        const contributionSummary = await getContributionSummary(session.user.id)

        // Transform to expected interface
        const profile = {
            id: githubProfile.id,
            githubId: githubProfile.githubId,
            username: githubProfile.githubUsername,
            avatarUrl: githubProfile.githubAvatar,
            profileUrl: `https://github.com/${githubProfile.githubUsername}`,
            connectedAt: githubProfile.createdAt,
            lastSyncAt: githubProfile.lastSyncedAt,
        }

        return { 
            success: true, 
            profile,
            contributionSummary 
        }
    } catch (error) {
        console.error('Error fetching GitHub profile:', error)
        return { success: false, error: 'Failed to fetch GitHub profile' }
    }
}

/**
 * Get contribution summary for a user
 */
async function getContributionSummary(userId: string) {
    try {
        // Get total PRs from contributions
        const contributions = await prisma.oSContribution.groupBy({
            by: ['status'],
            where: { 
                userId,
                type: { 
                    in: ['PR_SUBMITTED', 'PR_MERGED'] 
                }
            },
            _count: true
        })

        // Get repos contributed to
        const reposContributed = await prisma.oSProjectContributor.count({
            where: { userId }
        })

        // Calculate stats
        const totalPRs = contributions.reduce((acc, c) => acc + c._count, 0)
        const mergedPRs = contributions.find(c => c.status === 'MERGED')?._count || 0
        const openPRs = contributions.find(c => c.status === 'IN_REVIEW')?._count || 0

        // Get OS stats for commits (if tracked)
        const osStats = await prisma.userOSStats.findUnique({
            where: { userId },
            select: { totalContributions: true }
        })

        return {
            totalPRs,
            mergedPRs,
            openPRs,
            totalRepos: reposContributed,
            totalCommits: osStats?.totalContributions || 0
        }
    } catch (error) {
        console.error('Error getting contribution summary:', error)
        return {
            totalPRs: 0,
            mergedPRs: 0,
            openPRs: 0,
            totalRepos: 0,
            totalCommits: 0
        }
    }
}

/**
 * Disconnect GitHub from user account
 */
export async function disconnectGitHub() {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: 'You must be logged in' }
        }

        // Check if user has a GitHub profile
        const githubProfile = await prisma.oSGitHubProfile.findUnique({
            where: { userId: session.user.id }
        })

        if (!githubProfile) {
            return { success: false, error: 'No GitHub account connected' }
        }

        // Delete the GitHub profile
        await prisma.oSGitHubProfile.delete({
            where: { userId: session.user.id }
        })

        // Update user to remove GitHub username
        await prisma.user.update({
            where: { id: session.user.id },
            data: { 
                osGitHubProfile: { 
                    delete: true
                } 
            }
        })

        revalidatePath('/profile')

        return { success: true }
    } catch (error) {
        console.error('Error disconnecting GitHub:', error)
        return { success: false, error: 'Failed to disconnect GitHub' }
    }
}

/**
 * Sync GitHub contributions for the current user
 */
export async function syncGitHubContributions() {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: 'You must be logged in' }
        }

        // Get user's GitHub profile
        const githubProfile = await prisma.oSGitHubProfile.findUnique({
            where: { userId: session.user.id }
        })

        if (!githubProfile) {
            return { success: false, error: 'No GitHub account connected' }
        }

        // Get all projects the user is contributing to
        const contributorRecords = await prisma.oSProjectContributor.findMany({
            where: { userId: session.user.id },
            include: {
                project: {
                    select: {
                        id: true,
                        githubOwner: true,
                        githubRepo: true
                    }
                }
            }
        })

        // Import GitHub functions dynamically to avoid circular deps
        const { getPullRequestsByUser, syncContributionFromGitHub } = await import('@/lib/github/github-service')

        // Sync contributions from each project
        for (const record of contributorRecords) {
            const { project } = record
            
            // Get user's PRs for this project
            const prs = await getPullRequestsByUser(
                project.githubOwner,
                project.githubRepo,
                githubProfile.githubUsername
            )

            // Process each PR
            for (const pr of prs) {
                // Check if we have this contribution tracked
                const existingContribution = await prisma.oSContribution.findFirst({
                    where: {
                        userId: session.user.id,
                        projectId: project.id,
                        githubPrNumber: pr.number
                    }
                })

                if (existingContribution) {
                    // Sync the existing contribution
                    await syncContributionFromGitHub(existingContribution.id)
                } else {
                    // Create new contribution record
                    await prisma.oSContribution.create({
                        data: {
                            userId: session.user.id,
                            projectId: project.id,
                            type: pr.merged ? 'PR_MERGED' : 'PR_SUBMITTED',
                            title: pr.title,
                            description: pr.body || '',
                            status: pr.merged ? 'MERGED' : (pr.state === 'closed' ? 'REJECTED' : 'IN_REVIEW'),
                            githubPrNumber: pr.number,
                            githubPrUrl: pr.html_url,
                            linesAdded: pr.additions,
                            linesRemoved: pr.deletions,
                            filesChanged: pr.changed_files,
                            commitsCount: pr.commits,
                            isMerged: pr.merged,
                            mergedAt: pr.merged_at ? new Date(pr.merged_at) : null,
                            mergedBy: pr.merged_by?.login,
                            closedAt: pr.closed_at ? new Date(pr.closed_at) : null,
                            lastSyncedAt: new Date()
                        }
                    })
                }
            }
        }

        // Update last sync time
        await prisma.oSGitHubProfile.update({
            where: { 
                userId: session.user.id 
            },
            data: { 
                lastSyncedAt: new Date() 
            }
        })

        // Update user's OS stats
        await updateUserOSStats(session.user.id)

        revalidatePath('/profile')
        revalidatePath('/opensource')

        return { success: true }
    } catch (error) {
        console.error('Error syncing GitHub contributions:', error)
        return { success: false, error: 'Failed to sync contributions' }
    }
}

/**
 * Update user's open source statistics
 */
async function updateUserOSStats(userId: string) {
    try {
        // Get contribution counts
        const [totalContributions, prStats, issuesSolved] = await Promise.all([
            prisma.oSContribution.count({
                where: { userId }
            }),
            prisma.oSContribution.groupBy({
                by: ['status'],
                where: { 
                    userId,
                    type: {
                        in: ['PR_SUBMITTED', 'PR_MERGED']
                    }
                },
                _count: true
            }),
            prisma.oSIssue.count({
                where: {
                    contributions: {
                        some: {
                            userId,
                            status: 'MERGED'
                        }
                    }
                }
            })
        ])

        const prsMerged = prStats.find(s => s.status === 'MERGED')?._count || 0

        // Upsert user OS stats
        await prisma.userOSStats.upsert({
            where: { userId },
            update: {
                totalContributions,
                prsMerged: prsMerged as number,
                issuesSolved,
                lastContributionAt: new Date()
            },
            create: {
                userId,
                totalContributions,
                prsMerged: prsMerged as number,
                issuesSolved,
                lastContributionAt: new Date()
            }
        })
    } catch (error) {
        console.error('Error updating user OS stats:', error)
    }
}

/**
 * Link GitHub account to user (called after OAuth)
 */
export async function linkGitHubAccount(data: {
    githubId: string
    username: string
    accessToken: string
    refreshToken?: string
    avatarUrl?: string
    profileUrl?: string
    email?: string
    scope?: string
}) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: 'You must be logged in' }
        }

        // Check if this GitHub account is already linked to another user
        const existingProfile = await prisma.oSGitHubProfile.findUnique({
            where: { githubId: data.githubId }
        })

        if (existingProfile && existingProfile.userId !== session.user.id) {
            return { 
                success: false, 
                error: 'This GitHub account is already linked to another user' 
            }
        }

        // Upsert the GitHub profile
        const githubProfile = await prisma.oSGitHubProfile.upsert({
            where: { userId: session.user.id },
            update: {
                githubId: data.githubId,
                githubUsername: data.username,
                accessToken: data.accessToken,
                refreshToken: data.refreshToken,
                githubAvatar: data.avatarUrl,
                scopes: data.scope ? [data.scope] : [],
                lastSyncedAt: new Date()
            },
            create: {
                userId: session.user.id,
                githubId: data.githubId,
                githubUsername: data.username,
                accessToken: data.accessToken,
                refreshToken: data.refreshToken,
                githubAvatar: data.avatarUrl,
                scopes: data.scope ? [data.scope] : [],
            }
        })

        // Update user with GitHub username
        await prisma.user.update({
            where: { id: session.user.id },
            data: { 
                osGitHubProfile: { 
                    update: { 
                        githubUsername: data.username 
                    } 
                } 
            }
        })

        revalidatePath('/profile')

        return { success: true, profile: githubProfile }
    } catch (error) {
        console.error('Error linking GitHub account:', error)
        return { success: false, error: 'Failed to link GitHub account' }
    }
}