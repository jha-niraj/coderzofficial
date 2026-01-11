"use server"

import { auth } from "@repo/auth"
import prisma from "@repo/prisma"
import { revalidatePath } from "next/cache"

// ===============================================
// FETCH PROJECT IDEAS
// ===============================================

/**
 * Get all approved project ideas for a specific technology
 */
export async function getProjectIdeasByTechnology(technology: string) {
    try {
        const projects = await prisma.projectIdea.findMany({
            where: {
                technology,
                status: 'APPROVED',
            },
            orderBy: [
                { views: 'desc' },
                { createdAt: 'desc' },
            ],
        })

        return {
            success: true,
            data: projects,
        }
    } catch (error: any) {
        console.error('Failed to fetch project ideas:', error)
        return {
            success: false,
            error: error.message || 'Failed to fetch project ideas',
        }
    }
}

/**
 * Get a single project idea by ID
 */
export async function getProjectIdeaById(id: string) {
    try {
        const project = await prisma.projectIdea.findUnique({
            where: { id },
            include: {
                submittedBy: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        image: true,
                    },
                },
            },
        })

        if (!project) {
            return {
                success: false,
                error: 'Project not found',
            }
        }

        // Increment view count
        await prisma.projectIdea.update({
            where: { id },
            data: { views: { increment: 1 } },
        })

        return {
            success: true,
            data: project,
        }
    } catch (error: any) {
        console.error('Failed to fetch project idea:', error)
        return {
            success: false,
            error: error.message || 'Failed to fetch project idea',
        }
    }
}

/**
 * Search project ideas
 */
export async function searchProjectIdeas(query: string, filters?: {
    technology?: string
    difficulty?: string
    category?: string
}) {
    try {
        const projects = await prisma.projectIdea.findMany({
            where: {
                status: 'APPROVED',
                ...(query && {
                    OR: [
                        { projectTitle: { contains: query, mode: 'insensitive' } },
                        { projectDescription: { contains: query, mode: 'insensitive' } },
                    ],
                }),
                ...(filters?.technology && { technology: filters.technology }),
                ...(filters?.difficulty && { difficulty: filters.difficulty }),
                ...(filters?.category && { categories: { has: filters.category } }),
            },
            orderBy: [
                { views: 'desc' },
                { createdAt: 'desc' },
            ],
            take: 50,
        })

        return {
            success: true,
            data: projects,
        }
    } catch (error: any) {
        console.error('Failed to search project ideas:', error)
        return {
            success: false,
            error: error.message || 'Failed to search project ideas',
        }
    }
}

// ===============================================
// USER SUBMISSIONS
// ===============================================

/**
 * Submit a new project idea
 */
export async function submitProjectIdea(data: {
    projectTitle: string
    projectDescription: string
    generationType: string
    difficulty: string
    primaryLanguageOrFramework: string
    technologies: string[]
    categories: string[]
    technology: string
    stacks?: any
    images?: string[]
    figmaLinks?: string[]
    resourceLinks?: string[]
}) {
    try {
        const session = await auth()
        if (!session?.user?.email) {
            return {
                success: false,
                error: 'You must be logged in to submit a project idea',
            }
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        })

        if (!user) {
            return {
                success: false,
                error: 'User not found',
            }
        }

        // Create project idea
        const projectIdea = await prisma.projectIdea.create({
            data: {
                projectTitle: data.projectTitle,
                projectDescription: data.projectDescription,
                generationType: data.generationType,
                difficulty: data.difficulty,
                primaryLanguageOrFramework: data.primaryLanguageOrFramework,
                technologies: data.technologies,
                categories: data.categories,
                technology: data.technology,
                stacks: data.stacks || {},
                images: data.images || [],
                figmaLinks: data.figmaLinks || [],
                resourceLinks: data.resourceLinks || [],
                status: 'PENDING',
                isUserSubmitted: true,
                submittedById: user.id,
            },
        })

        revalidatePath('/projects/ideas')

        return {
            success: true,
            data: projectIdea,
            message: 'Project idea submitted successfully! It will be reviewed by our team.',
        }
    } catch (error: any) {
        console.error('Failed to submit project idea:', error)
        return {
            success: false,
            error: error.message || 'Failed to submit project idea',
        }
    }
}

/**
 * Get user's submitted project ideas
 */
export async function getUserSubmittedProjectIdeas() {
    try {
        const session = await auth()
        if (!session?.user?.email) {
            return {
                success: false,
                error: 'Not authenticated',
            }
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        })

        if (!user) {
            return {
                success: false,
                error: 'User not found',
            }
        }

        const projects = await prisma.projectIdea.findMany({
            where: {
                submittedById: user.id,
            },
            orderBy: {
                createdAt: 'desc',
            },
        })

        return {
            success: true,
            data: projects,
        }
    } catch (error: any) {
        console.error('Failed to fetch user project ideas:', error)
        return {
            success: false,
            error: error.message || 'Failed to fetch project ideas',
        }
    }
}

// ===============================================
// ADMIN ACTIONS
// ===============================================

/**
 * Approve a project idea (Admin only)
 */
export async function approveProjectIdea(id: string) {
    try {
        const session = await auth()
        if (!session?.user?.email) {
            return {
                success: false,
                error: 'Not authenticated',
            }
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        })

        if (!user || user.role !== 'Admin') {
            return {
                success: false,
                error: 'Unauthorized',
            }
        }

        const projectIdea = await prisma.projectIdea.findUnique({
            where: { id },
            include: { submittedBy: true },
        })

        if (!projectIdea) {
            return {
                success: false,
                error: 'Project idea not found',
            }
        }

        // Update project status
        await prisma.projectIdea.update({
            where: { id },
            data: {
                status: 'APPROVED',
                approvedAt: new Date(),
            },
        })

        // Reward user with XP if it's a user submission
        if (projectIdea.isUserSubmitted && projectIdea.submittedById) {
            await prisma.$transaction([
                prisma.user.update({
                    where: { id: projectIdea.submittedById },
                    data: {
                        currentXp: { increment: 20 },
                        totalXp: { increment: 20 },
                    },
                }),
                prisma.xpTransaction.create({
                    data: {
                        userId: projectIdea.submittedById,
                        amount: 20,
                        type: 'REWARD',
                        description: `Project idea approved: ${projectIdea.projectTitle}`,
                    },
                }),
            ])
        }

        revalidatePath('/projects/ideas')

        return {
            success: true,
            message: 'Project idea approved successfully',
        }
    } catch (error: any) {
        console.error('Failed to approve project idea:', error)
        return {
            success: false,
            error: error.message || 'Failed to approve project idea',
        }
    }
}

/**
 * Reject a project idea (Admin only)
 */
export async function rejectProjectIdea(id: string, reason?: string) {
    try {
        const session = await auth()
        if (!session?.user?.email) {
            return {
                success: false,
                error: 'Not authenticated',
            }
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        })

        if (!user || user.role !== 'Admin') {
            return {
                success: false,
                error: 'Unauthorized',
            }
        }

        await prisma.projectIdea.update({
            where: { id },
            data: {
                status: 'REJECTED',
            },
        })

        revalidatePath('/projects/ideas')

        return {
            success: true,
            message: 'Project idea rejected',
        }
    } catch (error: any) {
        console.error('Failed to reject project idea:', error)
        return {
            success: false,
            error: error.message || 'Failed to reject project idea',
        }
    }
}

// ===============================================
// ENGAGEMENT ACTIONS (UPVOTE & VIEWS)
// ===============================================

/**
 * Increment view count for a project idea
 */
export async function incrementProjectView(projectId: string) {
    try {
        await prisma.projectIdea.update({
            where: { id: projectId },
            data: {
                views: { increment: 1 },
            },
        })

        return {
            success: true,
        }
    } catch (error: any) {
        console.error('Failed to increment view:', error)
        return {
            success: false,
            error: error.message || 'Failed to increment view',
        }
    }
}

/**
 * Toggle upvote for a project idea
 */
export async function toggleProjectUpvote(projectId: string) {
    try {
        const session = await auth()
        if (!session?.user?.email) {
            return {
                success: false,
                error: 'You must be logged in to upvote',
            }
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        })

        if (!user) {
            return {
                success: false,
                error: 'User not found',
            }
        }

        // Check if user already upvoted
        const existingUpvote = await prisma.projectIdeaUpvote.findUnique({
            where: {
                projectIdeaId_userId: {
                    projectIdeaId: projectId,
                    userId: user.id,
                },
            },
        })

        if (existingUpvote) {
            // Remove upvote
            await prisma.$transaction([
                prisma.projectIdeaUpvote.delete({
                    where: { id: existingUpvote.id },
                }),
                prisma.projectIdea.update({
                    where: { id: projectId },
                    data: {
                        upvotes: { decrement: 1 },
                    },
                }),
            ])

            return {
                success: true,
                upvoted: false,
                message: 'Upvote removed',
            }
        } else {
            // Add upvote
            await prisma.$transaction([
                prisma.projectIdeaUpvote.create({
                    data: {
                        projectIdeaId: projectId,
                        userId: user.id,
                    },
                }),
                prisma.projectIdea.update({
                    where: { id: projectId },
                    data: {
                        upvotes: { increment: 1 },
                    },
                }),
            ])

            return {
                success: true,
                upvoted: true,
                message: 'Upvoted successfully',
            }
        }
    } catch (error: any) {
        console.error('Failed to toggle upvote:', error)
        return {
            success: false,
            error: error.message || 'Failed to toggle upvote',
        }
    }
}

/**
 * Check if user has upvoted a project
 */
export async function checkUserUpvote(projectId: string) {
    try {
        const session = await auth()
        if (!session?.user?.email) {
            return {
                success: true,
                upvoted: false,
            }
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        })

        if (!user) {
            return {
                success: true,
                upvoted: false,
            }
        }

        const upvote = await prisma.projectIdeaUpvote.findUnique({
            where: {
                projectIdeaId_userId: {
                    projectIdeaId: projectId,
                    userId: user.id,
                },
            },
        })

        return {
            success: true,
            upvoted: !!upvote,
        }
    } catch (error: any) {
        console.error('Failed to check upvote:', error)
        return {
            success: true,
            upvoted: false,
        }
    }
}

/**
 * Get top upvoted projects for a technology
 */
export async function getTopUpvotedProjects(technology: string, limit: number = 3) {
    try {
        const projects = await prisma.projectIdea.findMany({
            where: {
                technology,
                status: 'APPROVED',
            },
            orderBy: {
                upvotes: 'desc',
            },
            take: limit,
        })

        return {
            success: true,
            data: projects,
        }
    } catch (error: any) {
        console.error('Failed to fetch top projects:', error)
        return {
            success: false,
            error: error.message || 'Failed to fetch top projects',
        }
    }
}

// ===============================================
// PROBLEM STATEMENTS
// ===============================================

/**
 * Get all approved problem statements (technology-agnostic ideas)
 */
export async function getProblemStatements(options?: {
    limit?: number
    difficulty?: string
    search?: string
}) {
    try {
        const { limit = 50, difficulty, search } = options || {}

        const where: any = {
            ideaType: 'PROBLEM_STATEMENT',
            status: 'APPROVED',
        }

        if (difficulty && difficulty !== 'all') {
            where.difficulty = difficulty
        }

        if (search) {
            where.OR = [
                { projectTitle: { contains: search, mode: 'insensitive' } },
                { projectDescription: { contains: search, mode: 'insensitive' } },
                { overview: { contains: search, mode: 'insensitive' } },
            ]
        }

        const ideas = await prisma.projectIdea.findMany({
            where,
            orderBy: [
                { upvotes: 'desc' },
                { createdAt: 'desc' },
            ],
            take: limit,
            include: {
                submittedBy: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        image: true,
                    },
                },
            },
        })

        return {
            success: true,
            data: ideas,
        }
    } catch (error: any) {
        console.error('Failed to fetch problem statements:', error)
        return {
            success: false,
            error: error.message || 'Failed to fetch problem statements',
        }
    }
}

/**
 * Submit a problem statement (technology-agnostic idea)
 */
export async function submitProblemStatement(data: {
    projectTitle: string
    projectDescription: string
    difficulty: string
    overview?: string
    coreRequirements?: string[]
    engineeringConstraints?: string[]
    suggestedStacks?: any
    recruiterSignal?: string
    categories?: string[]
}) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return {
                success: false,
                error: 'You must be logged in to submit a problem statement',
            }
        }

        const idea = await prisma.projectIdea.create({
            data: {
                projectTitle: data.projectTitle,
                projectDescription: data.projectDescription,
                generationType: 'FULL_STACK', // Default for problem statements
                difficulty: data.difficulty,
                ideaType: 'PROBLEM_STATEMENT',
                overview: data.overview || data.projectDescription,
                coreRequirements: data.coreRequirements || [],
                engineeringConstraints: data.engineeringConstraints || [],
                suggestedStacks: data.suggestedStacks || null,
                recruiterSignal: data.recruiterSignal || null,
                categories: data.categories || [],
                technologies: [],
                status: 'PENDING',
                submittedById: session.user.id,
                isUserSubmitted: true,
            },
        })

        revalidatePath('/projects/ideas')

        return {
            success: true,
            data: idea,
            message: 'Problem statement submitted successfully! It will be reviewed by our team.',
        }
    } catch (error: any) {
        console.error('Failed to submit problem statement:', error)
        return {
            success: false,
            error: error.message || 'Failed to submit problem statement',
        }
    }
}