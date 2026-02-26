'use server'

import { auth } from '@repo/auth'
import prisma from '@repo/prisma'
import { revalidatePath } from 'next/cache'
import { ProjectV2Difficulty } from '@prisma/client'

interface ActionResponse {
    success: boolean
    data?: unknown
    error?: string
}

async function getCurrentUser() {
    const session = await auth()
    if (!session?.user?.email) throw new Error('Not authenticated')
    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user) throw new Error('User not found')
    return user
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

        // Check the project exists
        const project = await prisma.projectV2.findUnique({
            where: { id: projectId },
            select: { id: true, slug: true, createdBy: true }
        })

        if (!project) {
            return { success: false, error: 'Project not found' }
        }

        // Check if user is enrolled
        const enrollment = await prisma.userProjectV2Progress.findUnique({
            where: { userId_projectId: { userId: user.id, projectId } }
        })

        // Allow creators and enrolled users to suggest
        if (!enrollment && project.createdBy !== user.id) {
            return { success: false, error: 'You must be enrolled in this project to suggest tasks' }
        }

        const suggestion = await prisma.projectV2SprintSuggestion.create({
            data: {
                projectId,
                suggestedById: user.id,
                sprintNumber,
                name,
                goal,
                duration,
                suggestedTasks: JSON.parse(JSON.stringify(suggestedTasks)),
            }
        })

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

        const project = await prisma.projectV2.findUnique({
            where: { id: projectId },
            select: { id: true, createdBy: true }
        })

        if (!project) {
            return { success: false, error: 'Project not found' }
        }

        const suggestions = await prisma.projectV2SprintSuggestion.findMany({
            where: {
                projectId,
                ...(status ? { status } : {}),
            },
            include: {
                suggestedBy: {
                    select: { id: true, name: true, username: true, image: true }
                },
                reviewedBy: {
                    select: { id: true, name: true, username: true }
                }
            },
            orderBy: { createdAt: 'desc' },
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

        const suggestion = await prisma.projectV2SprintSuggestion.findUnique({
            where: { id: suggestionId },
            include: {
                project: { select: { id: true, slug: true, createdBy: true } }
            }
        })

        if (!suggestion) {
            return { success: false, error: 'Suggestion not found' }
        }

        // Only project creator can review
        if (suggestion.project.createdBy !== user.id) {
            return { success: false, error: 'Only the project creator can review suggestions' }
        }

        if (suggestion.status !== 'PENDING') {
            return { success: false, error: 'This suggestion has already been reviewed' }
        }

        if (action === 'APPROVED') {
            // Create actual sprint + tasks from the suggestion
            const result = await prisma.$transaction(async (tx) => {
                const sprint = await tx.projectV2Sprint.create({
                    data: {
                        projectId: suggestion.projectId,
                        sprintNumber: suggestion.sprintNumber,
                        name: suggestion.name,
                        goal: suggestion.goal,
                        duration: suggestion.duration,
                        orderIndex: suggestion.sprintNumber - 1,
                    }
                })

                // Create tasks from suggested tasks
                const suggestedTasks = (suggestion.suggestedTasks as unknown as Array<{
                    title: string; description: string; criteria?: string[];
                    hints?: string[]; difficulty?: string; estimatedTime?: string; category?: string;
                }>) || []

                for (let i = 0; i < suggestedTasks.length; i++) {
                    const task = suggestedTasks[i]
                    if (!task) continue

                    // Validate difficulty as enum
                    const validDifficulties: ProjectV2Difficulty[] = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED']
                    const taskDifficulty = validDifficulties.includes(task.difficulty as ProjectV2Difficulty)
                        ? (task.difficulty as ProjectV2Difficulty)
                        : ('INTERMEDIATE' as ProjectV2Difficulty)

                    await tx.projectV2Task.create({
                        data: {
                            sprintId: sprint.id,
                            title: task.title,
                            description: [task.description],
                            criteria: task.criteria || [],
                            hints: task.hints || [],
                            difficulty: taskDifficulty,
                            estimatedTime: task.estimatedTime || '30 min',
                            category: task.category || 'FEATURE',
                            orderIndex: i,
                        }
                    })
                }

                // Update suggestion record
                await tx.projectV2SprintSuggestion.update({
                    where: { id: suggestionId },
                    data: {
                        status: 'APPROVED',
                        reviewedById: user.id,
                        reviewedAt: new Date(),
                        reviewNote,
                        createdSprintId: sprint.id,
                    }
                })

                return sprint
            })

            revalidatePath(`/projects/${suggestion.project.slug}`)
            return { success: true, data: { sprint: result } }
        } else {
            // Reject
            await prisma.projectV2SprintSuggestion.update({
                where: { id: suggestionId },
                data: {
                    status: 'REJECTED',
                    reviewedById: user.id,
                    reviewedAt: new Date(),
                    reviewNote,
                }
            })

            revalidatePath(`/projects/${suggestion.project.slug}`)
            return { success: true }
        }
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to review suggestion'
        return { success: false, error: message }
    }
}
