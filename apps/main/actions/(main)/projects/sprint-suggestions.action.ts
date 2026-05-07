'use server'

import { getSession } from '@repo/auth'
import { headers } from 'next/headers'
import {
    db, projectV2SprintSuggestions, projectsV2, projectV2Sprints, projectV2Tasks,
    userProjectV2Progress
} from '@repo/db'
import { eq, and, desc } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

interface ActionResponse {
    success: boolean
    data?: unknown
    error?: string
}

async function getCurrentUser() {
    const session = await getSession(headers())
    if (!session?.user?.id) throw new Error('Not authenticated')
    return { id: session.user.id }
}

// ========================================
// SPRINT / TASK SUGGESTIONS
// ========================================

/**
 * Submit a sprint suggestion with tasks.
 * Any enrolled user can suggest tasks for any project (platform-seeded or AI-generated).
 * Suggestions go into a "Suggestions" tab for the project creator/admin to review.
 */
export async function submitSprintSuggestion({
    projectId,
    sprintNumber,
    name,
    goal,
    duration,
    suggestedTasks,
}: {
    projectId: string
    sprintNumber: number
    name: string
    goal: string
    duration: string
    suggestedTasks: Array<{
        title: string
        description: string
        criteria?: string[]
        hints?: string[]
        difficulty?: string
        estimatedTime?: string
        category?: string
    }>
}): Promise<ActionResponse> {
    try {
        const user = await getCurrentUser()

        const [project] = await db
            .select({ id: projectsV2.id, slug: projectsV2.slug, createdBy: projectsV2.createdBy })
            .from(projectsV2)
            .where(eq(projectsV2.id, projectId))
            .limit(1)

        if (!project) {
            return { success: false, error: 'Project not found' }
        }

        const enrollment = await db.query.userProjectV2Progress.findFirst({
            where: and(
                eq(userProjectV2Progress.userId, user.id),
                eq(userProjectV2Progress.projectId, projectId)
            )
        })

        if (!enrollment && project.createdBy !== user.id) {
            return { success: false, error: 'You must be enrolled in this project to suggest tasks' }
        }

        const [suggestion] = await db
            .insert(projectV2SprintSuggestions)
            .values({
                projectId,
                suggestedById: user.id,
                sprintNumber,
                name,
                goal,
                duration,
                suggestedTasks: JSON.parse(JSON.stringify(suggestedTasks)),
            })
            .returning()

        revalidatePath(`/projects/${project.slug}`)

        return { success: true, data: suggestion }
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to submit suggestion'
        return { success: false, error: message }
    }
}

/**
 * Get all sprint suggestions for a project.
 * Visible to: project creator, enrolled users.
 */
export async function getSprintSuggestions(
    projectId: string,
    status?: 'PENDING' | 'APPROVED' | 'REJECTED'
): Promise<ActionResponse> {
    try {
        const user = await getCurrentUser()

        const [project] = await db
            .select({ id: projectsV2.id, createdBy: projectsV2.createdBy })
            .from(projectsV2)
            .where(eq(projectsV2.id, projectId))
            .limit(1)

        if (!project) {
            return { success: false, error: 'Project not found' }
        }

        const conditions: any[] = [eq(projectV2SprintSuggestions.projectId, projectId)]
        if (status) {
            conditions.push(eq(projectV2SprintSuggestions.status, status))
        }

        const suggestions = await db.query.projectV2SprintSuggestions.findMany({
            where: and(...conditions),
            orderBy: [desc(projectV2SprintSuggestions.createdAt)],
            with: {
                suggestedBy: {
                    columns: { id: true, name: true, image: true }
                },
                reviewedBy: {
                    columns: { id: true, name: true }
                }
            }
        })

        return { success: true, data: { suggestions, isCreator: project.createdBy === user.id } }
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to fetch suggestions'
        return { success: false, error: message }
    }
}

/**
 * Review (approve/reject) a sprint suggestion.
 * Only the project creator can approve/reject.
 * If approved, creates a real sprint with the suggested tasks.
 */
export async function reviewSprintSuggestion({
    suggestionId,
    action,
    reviewNote,
}: {
    suggestionId: string
    action: 'APPROVED' | 'REJECTED'
    reviewNote?: string
}): Promise<ActionResponse> {
    try {
        const user = await getCurrentUser()

        const suggestion = await db.query.projectV2SprintSuggestions.findFirst({
            where: eq(projectV2SprintSuggestions.id, suggestionId),
            with: {
                project: {
                    columns: { id: true, slug: true, createdBy: true }
                }
            }
        })

        if (!suggestion) {
            return { success: false, error: 'Suggestion not found' }
        }

        if (suggestion.project.createdBy !== user.id) {
            return { success: false, error: 'Only the project creator can review suggestions' }
        }

        if (suggestion.status !== 'PENDING') {
            return { success: false, error: 'This suggestion has already been reviewed' }
        }

        if (action === 'APPROVED') {
            const result = await db.transaction(async (tx) => {
                const [sprint] = await tx
                    .insert(projectV2Sprints)
                    .values({
                        projectId: suggestion.projectId,
                        sprintNumber: suggestion.sprintNumber,
                        name: suggestion.name,
                        goal: suggestion.goal,
                        duration: suggestion.duration,
                        orderIndex: suggestion.sprintNumber - 1,
                    })
                    .returning()

                const suggestedTasks = (suggestion.suggestedTasks as unknown as Array<{
                    title: string; description: string; criteria?: string[];
                    hints?: string[]; difficulty?: string; estimatedTime?: string; category?: string;
                }>) || []

                const validDifficulties = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'] as const

                for (let i = 0; i < suggestedTasks.length; i++) {
                    const task = suggestedTasks[i]
                    if (!task) continue

                    const taskDifficulty = validDifficulties.includes(task.difficulty as any)
                        ? (task.difficulty as typeof validDifficulties[number])
                        : 'INTERMEDIATE'

                    await tx.insert(projectV2Tasks).values({
                        sprintId: sprint.id,
                        title: task.title,
                        description: [task.description],
                        criteria: task.criteria || [],
                        hints: task.hints || [],
                        difficulty: taskDifficulty,
                        estimatedTime: task.estimatedTime || '30 min',
                        category: task.category || 'FEATURE',
                        orderIndex: i,
                    })
                }

                await tx
                    .update(projectV2SprintSuggestions)
                    .set({
                        status: 'APPROVED',
                        reviewedById: user.id,
                        reviewedAt: new Date(),
                        reviewNote,
                        createdSprintId: sprint.id,
                    })
                    .where(eq(projectV2SprintSuggestions.id, suggestionId))

                return sprint
            })

            revalidatePath(`/projects/${suggestion.project.slug}`)
            return { success: true, data: { sprint: result } }
        } else {
            await db
                .update(projectV2SprintSuggestions)
                .set({
                    status: 'REJECTED',
                    reviewedById: user.id,
                    reviewedAt: new Date(),
                    reviewNote,
                })
                .where(eq(projectV2SprintSuggestions.id, suggestionId))

            revalidatePath(`/projects/${suggestion.project.slug}`)
            return { success: true }
        }
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to review suggestion'
        return { success: false, error: message }
    }
}
