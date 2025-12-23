'use server'

import { auth } from '@repo/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { OSIssueStatus, OSIssueDifficulty } from '@prisma/client'
import * as github from '@/lib/github'

// ==========================================
// ISSUE ACTIONS
// ==========================================

// Get project issues
export async function getProjectIssues(projectId: string, params?: {
    status?: OSIssueStatus | 'ALL'
    difficulty?: OSIssueDifficulty | 'ALL'
    page?: number
    limit?: number
}) {
    try {
        const page = params?.page || 1
        const limit = params?.limit || 20
        const skip = (page - 1) * limit

        const where: any = { projectId }

        if (params?.status && params.status !== 'ALL') {
            where.status = params.status
        }

        if (params?.difficulty && params.difficulty !== 'ALL') {
            where.difficulty = params.difficulty
        }

        const [issues, total] = await Promise.all([
            prisma.oSIssue.findMany({
                where,
                skip,
                take: limit,
                orderBy: [
                    { bountyAmount: 'desc' },
                    { createdAt: 'desc' }
                ],
                include: {
                    assignedTo: {
                        select: {
                            id: true,
                            name: true,
                            username: true,
                            image: true
                        }
                    }
                }
            }),
            prisma.oSIssue.count({ where })
        ])

        return {
            success: true,
            issues,
            total,
            totalPages: Math.ceil(total / limit)
        }
    } catch (error) {
        console.error('Error fetching issues:', error)
        return {
            success: false,
            error: 'Failed to fetch issues',
            issues: []
        }
    }
}

// Get single issue
export async function getIssue(issueId: string) {
    try {
        const issue = await prisma.oSIssue.findUnique({
            where: { id: issueId },
            include: {
                project: {
                    select: {
                        id: true,
                        title: true,
                        slug: true,
                        githubOwner: true,
                        githubRepo: true,
                        type: true
                    }
                },
                assignedTo: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        image: true
                    }
                }
            }
        })

        if (!issue) {
            return { success: false, error: 'Issue not found' }
        }

        return { success: true, issue }
    } catch (error) {
        console.error('Error fetching issue:', error)
        return { success: false, error: 'Failed to fetch issue' }
    }
}

// Get all open issues across projects (for discover page)
export async function getOpenIssues(params?: {
    difficulty?: OSIssueDifficulty | 'ALL'
    technologies?: string[]
    search?: string
    page?: number
    limit?: number
}) {
    try {
        const page = params?.page || 1
        const limit = params?.limit || 20
        const skip = (page - 1) * limit

        const where: any = {
            status: 'OPEN',
            project: { status: 'ACTIVE' }
        }

        if (params?.difficulty && params.difficulty !== 'ALL') {
            where.difficulty = params.difficulty
        }

        if (params?.technologies && params.technologies.length > 0) {
            where.labels = { hasSome: params.technologies }
        }

        if (params?.search) {
            where.OR = [
                { title: { contains: params.search, mode: 'insensitive' } },
                { description: { contains: params.search, mode: 'insensitive' } },
            ]
        }

        const [issues, total] = await Promise.all([
            prisma.oSIssue.findMany({
                where,
                skip,
                take: limit,
                orderBy: [
                    { bountyAmount: 'desc' },
                    { createdAt: 'desc' }
                ],
                include: {
                    project: {
                        select: {
                            id: true,
                            title: true,
                            slug: true,
                            type: true,
                            technologies: true
                        }
                    }
                }
            }),
            prisma.oSIssue.count({ where })
        ])

        return {
            success: true,
            issues,
            total,
            totalPages: Math.ceil(total / limit)
        }
    } catch (error) {
        console.error('Error fetching open issues:', error)
        return {
            success: false,
            error: 'Failed to fetch issues',
            issues: []
        }
    }
}

// ==========================================
// ISSUE CLAIMING
// ==========================================

// Claim an issue
export async function claimIssue(issueId: string) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: 'You must be logged in' }
        }

        // Check if user is certified
        const userStats = await prisma.userOSStats.findUnique({
            where: { userId: session.user.id }
        })

        if (!userStats?.isCertified) {
            return { 
                success: false, 
                error: 'You must complete the Open Source certification first' 
            }
        }

        // Get the issue
        const issue = await prisma.oSIssue.findUnique({
            where: { id: issueId },
            include: {
                project: true
            }
        })

        if (!issue) {
            return { success: false, error: 'Issue not found' }
        }

        if (issue.status !== 'OPEN') {
            return { success: false, error: 'This issue is not available' }
        }

        // Check user's active issues
        const activeIssues = await prisma.oSIssue.count({
            where: {
                assignedToId: session.user.id,
                status: { in: ['ASSIGNED', 'IN_REVIEW'] }
            }
        })

        if (activeIssues >= issue.project.maxActiveIssues) {
            return { 
                success: false, 
                error: `You can only work on ${issue.project.maxActiveIssues} issues at a time` 
            }
        }

        // Calculate deadline
        const deadlineAt = new Date()
        deadlineAt.setHours(deadlineAt.getHours() + issue.project.prDeadlineHours)

        // Assign the issue
        await prisma.oSIssue.update({
            where: { id: issueId },
            data: {
                status: 'ASSIGNED',
                assignedToId: session.user.id,
                assignedAt: new Date(),
                deadlineAt,
                totalAttempts: { increment: 1 }
            }
        })

        // Add user as contributor if not already
        await prisma.oSProjectContributor.upsert({
            where: {
                projectId_userId: {
                    projectId: issue.projectId,
                    userId: session.user.id
                }
            },
            create: {
                projectId: issue.projectId,
                userId: session.user.id
            },
            update: {
                lastActiveAt: new Date()
            }
        })

        // Assign on GitHub if we have the issue number
        if (issue.githubIssueNumber) {
            const user = await prisma.user.findUnique({
                where: { id: session.user.id },
                select: { githubUsername: true }
            })

            if (user?.githubUsername) {
                await github.assignIssue(
                    issue.project.githubOwner,
                    issue.project.githubRepo,
                    issue.githubIssueNumber,
                    [user.githubUsername]
                )
            }
        }

        revalidatePath(`/opensource/${issue.project.slug}`)

        return { success: true }
    } catch (error) {
        console.error('Error claiming issue:', error)
        return { success: false, error: 'Failed to claim issue' }
    }
}

// Unclaim an issue
export async function unclaimIssue(issueId: string) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: 'You must be logged in' }
        }

        const issue = await prisma.oSIssue.findUnique({
            where: { id: issueId },
            include: { project: true }
        })

        if (!issue) {
            return { success: false, error: 'Issue not found' }
        }

        if (issue.assignedToId !== session.user.id) {
            return { success: false, error: 'You are not assigned to this issue' }
        }

        // Unassign the issue
        await prisma.oSIssue.update({
            where: { id: issueId },
            data: {
                status: 'OPEN',
                assignedToId: null,
                assignedAt: null,
                deadlineAt: null
            }
        })

        // Unassign on GitHub
        if (issue.githubIssueNumber) {
            const user = await prisma.user.findUnique({
                where: { id: session.user.id },
                select: { githubUsername: true }
            })

            if (user?.githubUsername) {
                await github.unassignIssue(
                    issue.project.githubOwner,
                    issue.project.githubRepo,
                    issue.githubIssueNumber,
                    [user.githubUsername]
                )
            }
        }

        revalidatePath(`/opensource/${issue.project.slug}`)

        return { success: true }
    } catch (error) {
        console.error('Error unclaiming issue:', error)
        return { success: false, error: 'Failed to unclaim issue' }
    }
}

// Get user's assigned issues
export async function getUserAssignedIssues() {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: 'You must be logged in', issues: [] }
        }

        const issues = await prisma.oSIssue.findMany({
            where: {
                assignedToId: session.user.id,
                status: { in: ['ASSIGNED', 'IN_REVIEW'] }
            },
            include: {
                project: {
                    select: {
                        id: true,
                        title: true,
                        slug: true,
                        type: true
                    }
                }
            },
            orderBy: { deadlineAt: 'asc' }
        })

        return { success: true, issues }
    } catch (error) {
        console.error('Error fetching assigned issues:', error)
        return { success: false, error: 'Failed to fetch issues', issues: [] }
    }
}
