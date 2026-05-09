'use server'

import { getSession } from '@repo/auth'
import { headers } from 'next/headers'
import { db, osGitHubProfiles, osContributions, osProjectContributors, userOSStats, openSourceProjects } from '@repo/db'
import { eq, and, inArray, count, sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

// ==========================================
// GITHUB INTEGRATION ACTIONS
// ==========================================

/**
 * Get the current user's GitHub profile
 */
export async function getGitHubProfile() {
    try {
        const session = await getSession(await headers())
        if (!session?.user?.id) {
            return { success: false, error: 'You must be logged in' }
        }

        const [githubProfile] = await db
            .select({
                id: osGitHubProfiles.id,
                githubId: osGitHubProfiles.githubId,
                githubUsername: osGitHubProfiles.githubUsername,
                githubAvatar: osGitHubProfiles.githubAvatar,
                lastSyncedAt: osGitHubProfiles.lastSyncedAt,
                createdAt: osGitHubProfiles.createdAt,
            })
            .from(osGitHubProfiles)
            .where(eq(osGitHubProfiles.userId, session.user.id))
            .limit(1)

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
        // Get total PRs from contributions grouped by status
        const contributions = await db
            .select({
                status: osContributions.status,
                count: count(),
            })
            .from(osContributions)
            .where(
                and(
                    eq(osContributions.userId, userId),
                    inArray(osContributions.type, ['PR_SUBMITTED', 'PR_MERGED'])
                )
            )
            .groupBy(osContributions.status)

        // Get repos contributed to
        const [reposRow] = await db
            .select({ count: count() })
            .from(osProjectContributors)
            .where(eq(osProjectContributors.userId, userId))

        // Calculate stats
        const totalPRs = contributions.reduce((acc, c) => acc + Number(c.count), 0)
        const mergedPRs = Number(contributions.find(c => c.status === 'MERGED')?.count ?? 0)
        const openPRs = Number(contributions.find(c => c.status === 'IN_REVIEW')?.count ?? 0)
        const reposContributed = Number(reposRow?.count ?? 0)

        // Get OS stats for commits (if tracked)
        const [osStats] = await db
            .select({ totalContributions: userOSStats.totalContributions })
            .from(userOSStats)
            .where(eq(userOSStats.userId, userId))
            .limit(1)

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
        const session = await getSession(await headers())
        if (!session?.user?.id) {
            return { success: false, error: 'You must be logged in' }
        }

        // Check if user has a GitHub profile
        const [githubProfile] = await db
            .select()
            .from(osGitHubProfiles)
            .where(eq(osGitHubProfiles.userId, session.user.id))
            .limit(1)

        if (!githubProfile) {
            return { success: false, error: 'No GitHub account connected' }
        }

        // Delete the GitHub profile (cascades on userId)
        await db
            .delete(osGitHubProfiles)
            .where(eq(osGitHubProfiles.userId, session.user.id))

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
        const session = await getSession(await headers())
        if (!session?.user?.id) {
            return { success: false, error: 'You must be logged in' }
        }

        // Get user's GitHub profile
        const [githubProfile] = await db
            .select()
            .from(osGitHubProfiles)
            .where(eq(osGitHubProfiles.userId, session.user.id))
            .limit(1)

        if (!githubProfile) {
            return { success: false, error: 'No GitHub account connected' }
        }

        // Get all projects the user is contributing to
        const contributorRecords = await db
            .select()
            .from(osProjectContributors)
            .where(eq(osProjectContributors.userId, session.user.id))

        // Import GitHub functions dynamically to avoid circular deps
        const { getPullRequestsByUser, syncContributionFromGitHub } = await import('@/lib/github/github-service')

        // Sync contributions from each project
        for (const record of contributorRecords) {
            // Fetch project details separately
            const [project] = await db
                .select({
                    id: openSourceProjects.id,
                    githubOwner: openSourceProjects.githubOwner,
                    githubRepo: openSourceProjects.githubRepo,
                })
                .from(openSourceProjects)
                .where(eq(openSourceProjects.id, record.projectId))
                .limit(1)

            if (!project) continue

            // Get user's PRs for this project
            const prs = await getPullRequestsByUser(
                project.githubOwner,
                project.githubRepo,
                githubProfile.githubUsername
            )

            // Process each PR
            for (const pr of prs) {
                // Check if we have this contribution tracked
                const [existingContribution] = await db
                    .select()
                    .from(osContributions)
                    .where(
                        and(
                            eq(osContributions.userId, session.user.id),
                            eq(osContributions.projectId, project.id),
                            eq(osContributions.githubPrNumber, pr.number)
                        )
                    )
                    .limit(1)

                if (existingContribution) {
                    // Sync the existing contribution
                    await syncContributionFromGitHub(existingContribution.id)
                } else {
                    // Create new contribution record
                    await db.insert(osContributions).values({
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
                    })
                }
            }
        }

        // Update last sync time
        await db
            .update(osGitHubProfiles)
            .set({ lastSyncedAt: new Date() })
            .where(eq(osGitHubProfiles.userId, session.user.id))

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
        // Get total contribution count
        const [totalContributionsRow] = await db
            .select({ count: count() })
            .from(osContributions)
            .where(eq(osContributions.userId, userId))

        // Get PR stats grouped by status
        const prStats = await db
            .select({
                status: osContributions.status,
                count: count(),
            })
            .from(osContributions)
            .where(
                and(
                    eq(osContributions.userId, userId),
                    inArray(osContributions.type, ['PR_SUBMITTED', 'PR_MERGED'])
                )
            )
            .groupBy(osContributions.status)

        // Get issues solved count (contributions with MERGED status linked to issues)
        const [issuesSolvedRow] = await db
            .select({ count: count() })
            .from(osContributions)
            .where(
                and(
                    eq(osContributions.userId, userId),
                    eq(osContributions.status, 'MERGED'),
                    sql`${osContributions.issueId} IS NOT NULL`
                )
            )

        const totalContributions = Number(totalContributionsRow?.count ?? 0)
        const prsMerged = Number(prStats.find(s => s.status === 'MERGED')?.count ?? 0)
        const issuesSolved = Number(issuesSolvedRow?.count ?? 0)

        // Upsert user OS stats
        await db
            .insert(userOSStats)
            .values({
                userId,
                totalContributions,
                prsMerged,
                issuesSolved,
                lastContributionAt: new Date()
            })
            .onConflictDoUpdate({
                target: userOSStats.userId,
                set: {
                    totalContributions,
                    prsMerged,
                    issuesSolved,
                    lastContributionAt: new Date(),
                    updatedAt: new Date(),
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
        const session = await getSession(await headers())
        if (!session?.user?.id) {
            return { success: false, error: 'You must be logged in' }
        }

        // Check if this GitHub account is already linked to another user
        const [existingProfile] = await db
            .select()
            .from(osGitHubProfiles)
            .where(eq(osGitHubProfiles.githubId, data.githubId))
            .limit(1)

        if (existingProfile && existingProfile.userId !== session.user.id) {
            return {
                success: false,
                error: 'This GitHub account is already linked to another user'
            }
        }

        // Upsert the GitHub profile
        const [githubProfile] = await db
            .insert(osGitHubProfiles)
            .values({
                userId: session.user.id,
                githubId: data.githubId,
                githubUsername: data.username,
                accessToken: data.accessToken,
                refreshToken: data.refreshToken,
                githubAvatar: data.avatarUrl,
                scopes: data.scope ? [data.scope] : [],
                lastSyncedAt: new Date()
            })
            .onConflictDoUpdate({
                target: osGitHubProfiles.userId,
                set: {
                    githubId: data.githubId,
                    githubUsername: data.username,
                    accessToken: data.accessToken,
                    refreshToken: data.refreshToken,
                    githubAvatar: data.avatarUrl,
                    scopes: data.scope ? [data.scope] : [],
                    lastSyncedAt: new Date(),
                    updatedAt: new Date(),
                }
            })
            .returning()

        revalidatePath('/profile')

        return { success: true, profile: githubProfile }
    } catch (error) {
        console.error('Error linking GitHub account:', error)
        return { success: false, error: 'Failed to link GitHub account' }
    }
}
