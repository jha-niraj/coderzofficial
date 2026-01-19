'use server'

import { auth } from '@repo/auth'
import prisma from '@repo/prisma'
import { revalidatePath } from 'next/cache'
// import { ActionResult } from '@/types/actions'

type ActionResult = {
    success: boolean
    error?: string
    data?: any
}

export async function updateTaskStatus(
    taskId: string,
    status: 'TO_DO' | 'IN_PROGRESS' | 'COMPLETED',
    path?: string
): Promise<ActionResult> {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: 'Unauthorized' }
        }

        const task = await prisma.projectV2Task.findUnique({
            where: { id: taskId },
            include: { sprint: true }
        })

        if (!task) {
            return { success: false, error: 'Task not found' }
        }

        const projectId = task.sprint.projectId

        // Find user progress
        const progress = await prisma.userProjectV2Progress.findUnique({
            where: {
                userId_projectId: {
                    userId: session.user.id,
                    projectId
                }
            }
        })

        if (!progress) {
            // If progress record doesn't exist, we can't track task status properly linked to progress
            // Optionally create it, but usually it's created on "Start Project"
            return { success: false, error: 'Project progress not found (Please start the project first)' }
        }

        // Upsert user status
        await prisma.userTaskV2Status.upsert({
            where: {
                userId_taskId: {
                    userId: session.user.id,
                    taskId: taskId
                }
            },
            create: {
                userId: session.user.id,
                taskId: taskId,
                projectId: projectId,
                progressId: progress.id,
                status,
                completedAt: status === 'COMPLETED' ? new Date() : null
            },
            update: {
                status,
                completedAt: status === 'COMPLETED' ? new Date() : null
            }
        })

        if (path) revalidatePath(path)
        return { success: true }
    } catch (error) {
        console.error('Error updating task status:', error)
        return { success: false, error: 'Failed to update task status' }
    }
}

export async function addTaskToSprint(
    projectId: string,
    sprintId: string,
    data: {
        title: string
        description: string
        difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
        estimatedTime?: string
        category?: string
    },
    addToSuggestions: boolean = false,
    path?: string
): Promise<ActionResult> {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: 'Unauthorized' }
        }

        // Get max order index
        const lastTask = await prisma.projectV2Task.findFirst({
            where: { sprintId },
            orderBy: { orderIndex: 'desc' },
            select: { orderIndex: true }
        })
        const newOrderIndex = (lastTask?.orderIndex ?? -1) + 1

        const task = await prisma.projectV2Task.create({
            data: {
                sprintId,
                projectV2Id: projectId,
                title: data.title,
                description: [data.description], // Assuming description is a string, wrap in array
                difficulty: data.difficulty,
                orderIndex: newOrderIndex,
                estimatedTime: data.estimatedTime,
                category: data.category
            }
        })

        if (addToSuggestions) {
            await prisma.projectV2FeatureSuggestion.create({
                data: {
                    projectId,
                    userId: session.user.id,
                    title: data.title,
                    description: data.description,
                    type: 'FEATURE', // Default type
                    status: 'APPROVED', // Auto-approve since it's added as task? Or PENDING? Let's say APPROVED/IMPLEMENTED since it's in a sprint? Or just PENDING.
                    // Actually if user adds it to their task list, it's "Added to Tasks".
                    // But here it's "Add to Suggestions List" which implies generic suggestion.
                    suggestedBy: 'ENROLLED_USER', // or Creator
                    tags: data.category ? [data.category] : []
                }
            })
        }

        if (path) revalidatePath(path)
        return { success: true }
    } catch (error) {
        console.error('Error adding task:', error)
        return { success: false, error: 'Failed to add task' }
    }
}
