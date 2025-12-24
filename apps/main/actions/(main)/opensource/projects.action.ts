'use server'

import { auth } from '@repo/auth'
import { prisma } from '@repo/prisma'
import { 
    OSProjectType, OSProjectStatus,  OSIssueDifficulty
} from '@prisma/client'

// ==========================================
// PROJECT ACTIONS
// ==========================================

// Get all projects with filtering
export async function getProjects(params?: {
    type?: OSProjectType | 'ALL'
    status?: OSProjectStatus
    difficulty?: OSIssueDifficulty | 'ALL'
    search?: string
    technologies?: string[]
    page?: number
    limit?: number
}) {
    try {
        const page = params?.page || 1
        const limit = params?.limit || 12
        const skip = (page - 1) * limit

        const where: any = {
            status: params?.status || 'ACTIVE'
        }

        if (params?.type && params.type !== 'ALL') {
            where.type = params.type
        }

        if (params?.difficulty && params.difficulty !== 'ALL') {
            where.difficulty = params.difficulty
        }

        if (params?.search) {
            where.OR = [
                { title: { contains: params.search, mode: 'insensitive' } },
                { description: { contains: params.search, mode: 'insensitive' } },
            ]
        }

        if (params?.technologies && params.technologies.length > 0) {
            where.technologies = { hasSome: params.technologies }
        }

        const [projects, total] = await Promise.all([
            prisma.openSourceProject.findMany({
                where,
                skip,
                take: limit,
                orderBy: [
                    { type: 'asc' }, // FREE first, then PAID, then EXCLUSIVE
                    { openIssues: 'desc' },
                    { createdAt: 'desc' }
                ],
                include: {
                    maintainer: {
                        select: {
                            id: true,
                            name: true,
                            username: true,
                            image: true
                        }
                    },
                    _count: {
                        select: {
                            issues: true,
                            contributors: true
                        }
                    }
                }
            }),
            prisma.openSourceProject.count({ where })
        ])

        return {
            success: true,
            projects,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: page
        }
    } catch (error) {
        console.error('Error fetching projects:', error)
        return {
            success: false,
            error: 'Failed to fetch projects',
            projects: [],
            total: 0
        }
    }
}

// Get single project by slug
export async function getProjectBySlug(slug: string) {
    try {
        const project = await prisma.openSourceProject.findUnique({
            where: { slug },
            include: {
                maintainer: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        image: true
                    }
                },
                createdBy: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        image: true
                    }
                },
                issues: {
                    where: { status: 'OPEN' },
                    orderBy: [
                        { bountyAmount: 'desc' },
                        { createdAt: 'desc' }
                    ],
                    take: 10
                },
                contributors: {
                    orderBy: { contributionScore: 'desc' },
                    take: 10,
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                username: true,
                                image: true
                            }
                        }
                    }
                },
                _count: {
                    select: {
                        issues: true,
                        contributions: true,
                        contributors: true
                    }
                }
            }
        })

        if (!project) {
            return {
                success: false,
                error: 'Project not found'
            }
        }

        return {
            success: true,
            project
        }
    } catch (error) {
        console.error('Error fetching project:', error)
        return {
            success: false,
            error: 'Failed to fetch project'
        }
    }
}

// Get featured projects for homepage
export async function getFeaturedProjects() {
    try {
        const projects = await prisma.openSourceProject.findMany({
            where: { 
                status: 'ACTIVE',
            },
            take: 6,
            orderBy: [
                { totalContributors: 'desc' },
                { openIssues: 'desc' },
                { createdAt: 'desc' }
            ],
            include: {
                maintainer: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        image: true
                    }
                },
                _count: {
                    select: {
                        issues: true,
                        contributors: true
                    }
                }
            }
        })

        return {
            success: true,
            projects
        }
    } catch (error) {
        console.error('Error fetching featured projects:', error)
        return {
            success: false,
            error: 'Failed to fetch featured projects',
            projects: []
        }
    }
}

// Get projects by user
export async function getUserProjects(userId?: string) {
    try {
        const session = await auth()
        const targetUserId = userId || session?.user?.id

        if (!targetUserId) {
            return { success: false, error: 'User not found', projects: [] }
        }

        // Get projects where user is maintainer or contributor
        const [maintainedProjects, contributedProjects] = await Promise.all([
            prisma.openSourceProject.findMany({
                where: { maintainerId: targetUserId },
                include: {
                    _count: { select: { issues: true, contributors: true } }
                }
            }),
            prisma.oSProjectContributor.findMany({
                where: { userId: targetUserId },
                include: {
                    project: {
                        include: {
                            _count: { select: { issues: true, contributors: true } }
                        }
                    }
                }
            })
        ])

        return {
            success: true,
            maintained: maintainedProjects,
            contributed: contributedProjects.map(c => c.project)
        }
    } catch (error) {
        console.error('Error fetching user projects:', error)
        return { success: false, error: 'Failed to fetch projects', projects: [] }
    }
}
