'use server'

import { auth } from '@repo/auth'
import { prisma } from '@repo/prisma'
import { revalidatePath } from 'next/cache'

// ================================================================================
// TYPES
// ================================================================================

export interface CreateGroupInput {
    name: string
    emoji?: string
    color?: string
    description?: string
}

export interface UpdateGroupInput {
    id: string
    name?: string
    emoji?: string
    color?: string
    description?: string
}

// ================================================================================
// CREATE GROUP
// ================================================================================

export async function createPathfinderGroup(input: CreateGroupInput) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: 'Unauthorized' }
        }

        // Check if group with same name exists
        const existing = await prisma.pathfinderGroup.findUnique({
            where: {
                userId_name: {
                    userId: session.user.id,
                    name: input.name,
                },
            },
        })

        if (existing) {
            return { success: false, error: 'A group with this name already exists' }
        }

        // Get max order
        const maxOrder = await prisma.pathfinderGroup.aggregate({
            where: { userId: session.user.id },
            _max: { order: true },
        })

        const group = await prisma.pathfinderGroup.create({
            data: {
                userId: session.user.id,
                name: input.name,
                emoji: input.emoji || '📁',
                color: input.color || '#7c3aed',
                description: input.description,
                order: (maxOrder._max.order || 0) + 1,
            },
        })

        revalidatePath('/pathfinder')
        return { success: true, group }
    } catch (error) {
        console.error('Error creating group:', error)
        return { success: false, error: 'Failed to create group' }
    }
}

// ================================================================================
// GET USER GROUPS
// ================================================================================

export async function getUserPathfinderGroups() {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: 'Unauthorized', groups: [] }
        }

        const groups = await prisma.pathfinderGroup.findMany({
            where: { userId: session.user.id },
            orderBy: { order: 'asc' },
            include: {
                goals: {
                    select: {
                        id: true,
                        title: true,
                        status: true,
                        progressPercent: true,
                    },
                },
                _count: {
                    select: { goals: true },
                },
            },
        })

        return { success: true, groups }
    } catch (error) {
        console.error('Error fetching groups:', error)
        return { success: false, error: 'Failed to fetch groups', groups: [] }
    }
}

// ================================================================================
// UPDATE GROUP
// ================================================================================

export async function updatePathfinderGroup(input: UpdateGroupInput) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: 'Unauthorized' }
        }

        const group = await prisma.pathfinderGroup.findFirst({
            where: { id: input.id, userId: session.user.id },
        })

        if (!group) {
            return { success: false, error: 'Group not found' }
        }

        // Check name uniqueness if changing name
        if (input.name && input.name !== group.name) {
            const existing = await prisma.pathfinderGroup.findUnique({
                where: {
                    userId_name: {
                        userId: session.user.id,
                        name: input.name,
                    },
                },
            })

            if (existing) {
                return { success: false, error: 'A group with this name already exists' }
            }
        }

        const updated = await prisma.pathfinderGroup.update({
            where: { id: input.id },
            data: {
                name: input.name,
                emoji: input.emoji,
                color: input.color,
                description: input.description,
            },
        })

        revalidatePath('/pathfinder')
        return { success: true, group: updated }
    } catch (error) {
        console.error('Error updating group:', error)
        return { success: false, error: 'Failed to update group' }
    }
}

// ================================================================================
// DELETE GROUP
// ================================================================================

export async function deletePathfinderGroup(groupId: string) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: 'Unauthorized' }
        }

        const group = await prisma.pathfinderGroup.findFirst({
            where: { id: groupId, userId: session.user.id },
        })

        if (!group) {
            return { success: false, error: 'Group not found' }
        }

        // Move all goals in this group to ungrouped (set groupId to null)
        await prisma.pathfinderGoal.updateMany({
            where: { groupId },
            data: { groupId: null },
        })

        await prisma.pathfinderGroup.delete({
            where: { id: groupId },
        })

        revalidatePath('/pathfinder')
        return { success: true }
    } catch (error) {
        console.error('Error deleting group:', error)
        return { success: false, error: 'Failed to delete group' }
    }
}

// ================================================================================
// ASSIGN GOAL TO GROUP
// ================================================================================

export async function assignGoalToGroup(goalId: string, groupId: string | null) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: 'Unauthorized' }
        }

        const goal = await prisma.pathfinderGoal.findFirst({
            where: { id: goalId, userId: session.user.id },
        })

        if (!goal) {
            return { success: false, error: 'Goal not found' }
        }

        // Verify group belongs to user if not null
        if (groupId) {
            const group = await prisma.pathfinderGroup.findFirst({
                where: { id: groupId, userId: session.user.id },
            })

            if (!group) {
                return { success: false, error: 'Group not found' }
            }
        }

        await prisma.pathfinderGoal.update({
            where: { id: goalId },
            data: { groupId },
        })

        revalidatePath('/pathfinder')
        return { success: true }
    } catch (error) {
        console.error('Error assigning goal to group:', error)
        return { success: false, error: 'Failed to assign goal' }
    }
}

// ================================================================================
// REORDER GROUPS
// ================================================================================

export async function reorderPathfinderGroups(groupIds: string[]) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: 'Unauthorized' }
        }

        // Update order for each group
        await Promise.all(
            groupIds.map((id, index) =>
                prisma.pathfinderGroup.updateMany({
                    where: { id, userId: session.user.id },
                    data: { order: index },
                })
            )
        )

        revalidatePath('/pathfinder')
        return { success: true }
    } catch (error) {
        console.error('Error reordering groups:', error)
        return { success: false, error: 'Failed to reorder groups' }
    }
}
