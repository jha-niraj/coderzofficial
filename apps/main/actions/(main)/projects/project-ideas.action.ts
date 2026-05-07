"use server"

import { getSession } from "@repo/auth";
import { headers } from "next/headers";
import {
    db,
    users,
    xpTransactions,
    projectIdeas,
    projectIdeaUpvotes,
} from "@repo/db";
import { eq, and, or, desc, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache"

// ===============================================
// FETCH PROJECT IDEAS
// ===============================================

export async function getProjectIdeasByTechnology(technology: string) {
    try {
        const projects = await db.query.projectIdeas.findMany({
            where: and(
                eq(projectIdeas.technology, technology),
                eq(projectIdeas.status, 'APPROVED')
            ),
            orderBy: [desc(projectIdeas.views), desc(projectIdeas.createdAt)],
        });

        return { success: true, data: projects }
    } catch (error: any) {
        console.error('Failed to fetch project ideas:', error)
        return { success: false, error: error.message || 'Failed to fetch project ideas' }
    }
}

export async function getProjectIdeaById(id: string) {
    try {
        const project = await db.query.projectIdeas.findFirst({
            where: eq(projectIdeas.id, id),
            with: {
                submittedBy: {
                    columns: {
                        id: true,
                        name: true,
                        username: true,
                        image: true,
                    },
                },
            },
        });

        if (!project) {
            return { success: false, error: 'Project not found' }
        }

        await db.update(projectIdeas)
            .set({ views: sql`${projectIdeas.views} + 1` })
            .where(eq(projectIdeas.id, id));

        return { success: true, data: project }
    } catch (error: any) {
        console.error('Failed to fetch project idea:', error)
        return { success: false, error: error.message || 'Failed to fetch project idea' }
    }
}

export async function searchProjectIdeas(query: string, filters?: {
    technology?: string
    difficulty?: string
    category?: string
}) {
    try {
        const conditions: any[] = [eq(projectIdeas.status, 'APPROVED')];

        if (query) {
            conditions.push(
                or(
                    sql`${projectIdeas.projectTitle} ILIKE ${'%' + query + '%'}`,
                    sql`${projectIdeas.projectDescription} ILIKE ${'%' + query + '%'}`
                )
            );
        }

        if (filters?.technology) {
            conditions.push(eq(projectIdeas.technology, filters.technology));
        }

        if (filters?.difficulty) {
            conditions.push(eq(projectIdeas.difficulty, filters.difficulty));
        }

        if (filters?.category) {
            conditions.push(sql`${projectIdeas.categories} @> ARRAY[${filters.category}]::text[]`);
        }

        const projects = await db.query.projectIdeas.findMany({
            where: conditions.length > 1 ? and(...conditions) : conditions[0],
            orderBy: [desc(projectIdeas.views), desc(projectIdeas.createdAt)],
            limit: 50,
        });

        return { success: true, data: projects }
    } catch (error: any) {
        console.error('Failed to search project ideas:', error)
        return { success: false, error: error.message || 'Failed to search project ideas' }
    }
}

// ===============================================
// USER SUBMISSIONS
// ===============================================

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
        const session = await getSession(headers());
        if (!session?.user?.email) {
            return { success: false, error: 'You must be logged in to submit a project idea' }
        }

        const [user] = await db.select().from(users).where(eq(users.email, session.user.email));

        if (!user) {
            return { success: false, error: 'User not found' }
        }

        const [projectIdea] = await db.insert(projectIdeas).values({
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
        }).returning();

        revalidatePath('/projects/ideas')

        return {
            success: true,
            data: projectIdea,
            message: 'Project idea submitted successfully! It will be reviewed by our team.',
        }
    } catch (error: any) {
        console.error('Failed to submit project idea:', error)
        return { success: false, error: error.message || 'Failed to submit project idea' }
    }
}

export async function getUserSubmittedProjectIdeas() {
    try {
        const session = await getSession(headers());
        if (!session?.user?.email) {
            return { success: false, error: 'Not authenticated' }
        }

        const [user] = await db.select().from(users).where(eq(users.email, session.user.email));

        if (!user) {
            return { success: false, error: 'User not found' }
        }

        const projects = await db.query.projectIdeas.findMany({
            where: eq(projectIdeas.submittedById, user.id),
            orderBy: [desc(projectIdeas.createdAt)],
        });

        return { success: true, data: projects }
    } catch (error: any) {
        console.error('Failed to fetch user project ideas:', error)
        return { success: false, error: error.message || 'Failed to fetch project ideas' }
    }
}

// ===============================================
// ADMIN ACTIONS
// ===============================================

export async function approveProjectIdea(id: string) {
    try {
        const session = await getSession(headers());
        if (!session?.user?.email) {
            return { success: false, error: 'Not authenticated' }
        }

        const [user] = await db.select().from(users).where(eq(users.email, session.user.email));

        if (!user || user.role !== 'Admin') {
            return { success: false, error: 'Unauthorized' }
        }

        const projectIdea = await db.query.projectIdeas.findFirst({
            where: eq(projectIdeas.id, id),
            with: { submittedBy: true },
        });

        if (!projectIdea) {
            return { success: false, error: 'Project idea not found' }
        }

        await db.update(projectIdeas)
            .set({
                status: 'APPROVED',
                approvedAt: new Date(),
            })
            .where(eq(projectIdeas.id, id));

        if (projectIdea.isUserSubmitted && projectIdea.submittedById) {
            await db.transaction(async (tx) => {
                await tx.update(users)
                    .set({
                        currentXp: sql`${users.currentXp} + 20`,
                        totalXp: sql`${users.totalXp} + 20`,
                    })
                    .where(eq(users.id, projectIdea.submittedById!));

                await tx.insert(xpTransactions).values({
                    userId: projectIdea.submittedById!,
                    amount: 20,
                    type: 'REWARD',
                    description: `Project idea approved: ${projectIdea.projectTitle}`,
                });
            });
        }

        revalidatePath('/projects/ideas')

        return { success: true, message: 'Project idea approved successfully' }
    } catch (error: any) {
        console.error('Failed to approve project idea:', error)
        return { success: false, error: error.message || 'Failed to approve project idea' }
    }
}

export async function rejectProjectIdea(id: string, reason?: string) {
    try {
        const session = await getSession(headers());
        if (!session?.user?.email) {
            return { success: false, error: 'Not authenticated' }
        }

        const [user] = await db.select().from(users).where(eq(users.email, session.user.email));

        if (!user || user.role !== 'Admin') {
            return { success: false, error: 'Unauthorized' }
        }

        await db.update(projectIdeas)
            .set({ status: 'REJECTED' })
            .where(eq(projectIdeas.id, id));

        revalidatePath('/projects/ideas')

        return { success: true, message: 'Project idea rejected' }
    } catch (error: any) {
        console.error('Failed to reject project idea:', error)
        return { success: false, error: error.message || 'Failed to reject project idea' }
    }
}

// ===============================================
// ENGAGEMENT ACTIONS (UPVOTE & VIEWS)
// ===============================================

export async function incrementProjectView(projectId: string) {
    try {
        await db.update(projectIdeas)
            .set({ views: sql`${projectIdeas.views} + 1` })
            .where(eq(projectIdeas.id, projectId));

        return { success: true }
    } catch (error: any) {
        console.error('Failed to increment view:', error)
        return { success: false, error: error.message || 'Failed to increment view' }
    }
}

export async function toggleProjectUpvote(projectId: string) {
    try {
        const session = await getSession(headers());
        if (!session?.user?.email) {
            return { success: false, error: 'You must be logged in to upvote' }
        }

        const [user] = await db.select().from(users).where(eq(users.email, session.user.email));

        if (!user) {
            return { success: false, error: 'User not found' }
        }

        const existingUpvote = await db.query.projectIdeaUpvotes.findFirst({
            where: and(
                eq(projectIdeaUpvotes.projectIdeaId, projectId),
                eq(projectIdeaUpvotes.userId, user.id)
            ),
        });

        if (existingUpvote) {
            await db.transaction(async (tx) => {
                await tx.delete(projectIdeaUpvotes).where(eq(projectIdeaUpvotes.id, existingUpvote.id));
                await tx.update(projectIdeas)
                    .set({ upvotes: sql`${projectIdeas.upvotes} - 1` })
                    .where(eq(projectIdeas.id, projectId));
            });

            return { success: true, upvoted: false, message: 'Upvote removed' }
        } else {
            await db.transaction(async (tx) => {
                await tx.insert(projectIdeaUpvotes).values({
                    projectIdeaId: projectId,
                    userId: user.id,
                });
                await tx.update(projectIdeas)
                    .set({ upvotes: sql`${projectIdeas.upvotes} + 1` })
                    .where(eq(projectIdeas.id, projectId));
            });

            return { success: true, upvoted: true, message: 'Upvoted successfully' }
        }
    } catch (error: any) {
        console.error('Failed to toggle upvote:', error)
        return { success: false, error: error.message || 'Failed to toggle upvote' }
    }
}

export async function checkUserUpvote(projectId: string) {
    try {
        const session = await getSession(headers());
        if (!session?.user?.email) {
            return { success: true, upvoted: false }
        }

        const [user] = await db.select().from(users).where(eq(users.email, session.user.email));

        if (!user) {
            return { success: true, upvoted: false }
        }

        const upvote = await db.query.projectIdeaUpvotes.findFirst({
            where: and(
                eq(projectIdeaUpvotes.projectIdeaId, projectId),
                eq(projectIdeaUpvotes.userId, user.id)
            ),
        });

        return { success: true, upvoted: !!upvote }
    } catch (error: any) {
        console.error('Failed to check upvote:', error)
        return { success: true, upvoted: false }
    }
}

export async function getTopUpvotedProjects(technology: string, limit: number = 3) {
    try {
        const projects = await db.query.projectIdeas.findMany({
            where: and(
                eq(projectIdeas.technology, technology),
                eq(projectIdeas.status, 'APPROVED')
            ),
            orderBy: [desc(projectIdeas.upvotes)],
            limit,
        });

        return { success: true, data: projects }
    } catch (error: any) {
        console.error('Failed to fetch top projects:', error)
        return { success: false, error: error.message || 'Failed to fetch top projects' }
    }
}

// ===============================================
// PROBLEM STATEMENTS
// ===============================================

export async function getProblemStatements(options?: {
    limit?: number
    difficulty?: string
    search?: string
}) {
    try {
        const { limit = 50, difficulty, search } = options || {}

        const conditions: any[] = [
            eq(projectIdeas.ideaType, 'PROBLEM_STATEMENT'),
            eq(projectIdeas.status, 'APPROVED'),
        ];

        if (difficulty && difficulty !== 'all') {
            conditions.push(eq(projectIdeas.difficulty, difficulty));
        }

        if (search) {
            conditions.push(
                or(
                    sql`${projectIdeas.projectTitle} ILIKE ${'%' + search + '%'}`,
                    sql`${projectIdeas.projectDescription} ILIKE ${'%' + search + '%'}`,
                    sql`${projectIdeas.overview} ILIKE ${'%' + search + '%'}`
                )
            );
        }

        const ideas = await db.query.projectIdeas.findMany({
            where: and(...conditions),
            orderBy: [desc(projectIdeas.upvotes), desc(projectIdeas.createdAt)],
            limit,
            with: {
                submittedBy: {
                    columns: {
                        id: true,
                        name: true,
                        username: true,
                        image: true,
                    },
                },
            },
        });

        return { success: true, data: ideas }
    } catch (error: any) {
        console.error('Failed to fetch problem statements:', error)
        return { success: false, error: error.message || 'Failed to fetch problem statements' }
    }
}

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
        const session = await getSession(headers());
        if (!session?.user?.id) {
            return { success: false, error: 'You must be logged in to submit a problem statement' }
        }

        const [idea] = await db.insert(projectIdeas).values({
            projectTitle: data.projectTitle,
            projectDescription: data.projectDescription,
            generationType: 'FULL_STACK',
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
        }).returning();

        revalidatePath('/projects/ideas')

        return {
            success: true,
            data: idea,
            message: 'Problem statement submitted successfully! It will be reviewed by our team.',
        }
    } catch (error: any) {
        console.error('Failed to submit problem statement:', error)
        return { success: false, error: error.message || 'Failed to submit problem statement' }
    }
}
