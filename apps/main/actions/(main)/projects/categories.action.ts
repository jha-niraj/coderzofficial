'use server'

import prisma from '@repo/prisma'

export async function getProjectCategories() {
    try {
        const categories = await prisma.projectCategory.findMany({
            where: { isActive: true },
            include: {
                technologies: {
                    where: { isActive: true },
                    orderBy: { orderIndex: 'asc' },
                },
            },
            orderBy: { orderIndex: 'asc' },
        })
        return { success: true as const, data: categories }
    } catch (error) {
        console.error('Error fetching categories:', error)
        return { success: false as const, error: 'Failed to fetch categories' }
    }
}

export async function getProjectTechnologies(categorySlug?: string) {
    try {
        const technologies = await prisma.projectTechnology.findMany({
            where: {
                isActive: true,
                ...(categorySlug ? { category: { slug: categorySlug } } : {}),
            },
            include: { category: { select: { name: true, slug: true, icon: true, color: true } } },
            orderBy: { orderIndex: 'asc' },
        })
        return { success: true as const, data: technologies }
    } catch (error) {
        console.error('Error fetching technologies:', error)
        return { success: false as const, error: 'Failed to fetch technologies' }
    }
}

export async function getPlatformProjects(options?: {
    technology?: string
    category?: string
    difficulty?: string
    limit?: number
    offset?: number
}) {
    try {
        const where: Record<string, unknown> = {
            isPlatformSeeded: true,
            visibility: 'PUBLIC',
        }
        if (options?.technology) {
            where.technologies = { has: options.technology }
        }
        if (options?.difficulty) {
            where.difficulty = options.difficulty
        }

        const [projects, total] = await Promise.all([
            prisma.projectV2.findMany({
                where,
                select: {
                    id: true, slug: true, title: true, shortDescription: true, description: true,
                    technologies: true, difficulty: true, estimatedHours: true, totalViews: true,
                    totalStarted: true, includeAssessment: true, isPlatformSeeded: true, projectSource: true,
                    recruiterSignal: true, generationType: true, guidedModeEnabled: true,
                    creator: { select: { name: true, username: true, image: true } },
                    _count: { select: { progress: true, submissions: true } },
                },
                orderBy: { totalStarted: 'desc' },
                take: options?.limit || 20,
                skip: options?.offset || 0,
            }),
            prisma.projectV2.count({ where }),
        ])

        return { success: true as const, data: projects, total }
    } catch (error) {
        console.error('Error fetching platform projects:', error)
        return { success: false as const, error: 'Failed to fetch platform projects' }
    }
}

export async function getCategoryWithIdeas(categorySlug: string) {
    try {
        const category = await prisma.projectCategory.findUnique({
            where: { slug: categorySlug },
            include: {
                technologies: {
                    where: { isActive: true },
                    orderBy: { orderIndex: 'asc' },
                },
            },
        })

        if (!category) {
            return { success: false as const, error: 'Category not found' }
        }

        // Also fetch platform projects for this category's technologies
        const techNames = category.technologies.map(t => t.name)
        const platformProjects = await prisma.projectV2.findMany({
            where: {
                isPlatformSeeded: true,
                visibility: 'PUBLIC',
                technologies: { hasSome: techNames },
            },
            select: {
                id: true, slug: true, title: true, shortDescription: true, description: true,
                technologies: true, difficulty: true, estimatedHours: true, totalViews: true,
                totalStarted: true, includeAssessment: true, isPlatformSeeded: true, projectSource: true,
                recruiterSignal: true, guidedModeEnabled: true,
                creator: { select: { name: true, username: true, image: true } },
                _count: { select: { progress: true, submissions: true } },
            },
            orderBy: { totalStarted: 'desc' },
        })

        // Fetch community ideas for this category
        const ideas = await prisma.projectIdea.findMany({
            where: {
                status: 'APPROVED',
                OR: [
                    { categories: { hasSome: [categorySlug] } },
                    { technologies: { hasSome: techNames } },
                ],
            },
            orderBy: { upvotes: 'desc' },
            take: 20,
        })

        return { success: true as const, data: { category, platformProjects, ideas } }
    } catch (error) {
        console.error('Error fetching category:', error)
        return { success: false as const, error: 'Failed to fetch category data' }
    }
}
