"use server";

import { auth } from '@repo/auth';
import { prisma } from '@repo/prisma';
import { revalidatePath } from 'next/cache';
import { SpaceBranchVisibility, SpaceActivityType } from '@repo/prisma/client';
import type { ActionResponse, SpaceBranchFormData, SpaceBranchFromDB } from '@/types/space';

async function checkAuth() {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error('Unauthorized');
    }
    return session.user.id;
}

export async function createBranch(
    spaceId: string,
    data: SpaceBranchFormData
): Promise<ActionResponse<{ id: string }>> {
    try {
        const userId = await checkAuth();

        // Check if user is a member
        const member = await prisma.spaceMember.findUnique({
            where: {
                spaceId_userId: {
                    spaceId,
                    userId
                }
            }
        });

        if (!member) {
            return {
                success: false,
                error: 'You must be a member of the space to create a branch'
            };
        }

        // Verify parent step exists
        const parentStep = await prisma.spaceStep.findUnique({
            where: { id: data.parentStepId }
        });

        if (!parentStep || parentStep.spaceId !== spaceId) {
            return {
                success: false,
                error: 'Parent step not found'
            };
        }

        const branch = await prisma.spaceBranch.create({
            data: {
                spaceId,
                parentStepId: data.parentStepId,
                creatorId: userId,
                title: data.title,
                description: data.description,
                visibility: data.visibility,
                steps: data.steps as unknown as Record<string, unknown>
            }
        });

        // Update space branch count
        await prisma.space.update({
            where: { id: spaceId },
            data: { totalBranches: { increment: 1 } }
        });

        // Update member's personal branch if private
        if (data.visibility === SpaceBranchVisibility.PRIVATE) {
            await prisma.spaceMember.update({
                where: {
                    spaceId_userId: {
                        spaceId,
                        userId
                    }
                },
                data: { personalBranchId: branch.id }
            });
        }

        // Create activity
        await prisma.spaceActivity.create({
            data: {
                spaceId,
                userId,
                type: SpaceActivityType.BRANCH_CREATED,
                branchId: branch.id
            }
        });

        const space = await prisma.space.findUnique({
            where: { id: spaceId },
            select: { slug: true }
        });

        revalidatePath(`/space/${space?.slug}`);
        return {
            success: true,
            data: { id: branch.id }
        };
    } catch (error) {
        console.error('Error creating branch:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to create branch'
        };
    }
}

export async function joinBranch(branchId: string): Promise<ActionResponse> {
    try {
        const userId = await checkAuth();

        const branch = await prisma.spaceBranch.findUnique({
            where: { id: branchId },
            include: {
                space: true
            }
        });

        if (!branch) {
            return {
                success: false,
                error: 'Branch not found'
            };
        }

        // Check if user is a member of the space
        const member = await prisma.spaceMember.findUnique({
            where: {
                spaceId_userId: {
                    spaceId: branch.spaceId,
                    userId
                }
            }
        });

        if (!member) {
            return {
                success: false,
                error: 'You must be a member of the space to join a branch'
            };
        }

        // Check if already joined
        if (branch.memberIds.includes(userId)) {
            return {
                success: false,
                error: 'You are already a member of this branch'
            };
        }

        // Update branch
        await prisma.spaceBranch.update({
            where: { id: branchId },
            data: {
                memberIds: { push: userId },
                memberCount: { increment: 1 }
            }
        });

        revalidatePath(`/space/${branch.space.slug}`);
        return {
            success: true
        };
    } catch (error) {
        console.error('Error joining branch:', error);
        return {
            success: false,
            error: 'Failed to join branch'
        };
    }
}

export async function leaveBranch(branchId: string): Promise<ActionResponse> {
    try {
        const userId = await checkAuth();

        const branch = await prisma.spaceBranch.findUnique({
            where: { id: branchId },
            include: {
                space: true
            }
        });

        if (!branch) {
            return {
                success: false,
                error: 'Branch not found'
            };
        }

        // Creator cannot leave their own branch
        if (branch.creatorId === userId) {
            return {
                success: false,
                error: 'Creator cannot leave their own branch'
            };
        }

        // Remove from memberIds
        const updatedMemberIds = branch.memberIds.filter(id => id !== userId);

        await prisma.spaceBranch.update({
            where: { id: branchId },
            data: {
                memberIds: updatedMemberIds,
                memberCount: { decrement: 1 }
            }
        });

        revalidatePath(`/space/${branch.space.slug}`);
        return {
            success: true
        };
    } catch (error) {
        console.error('Error leaving branch:', error);
        return {
            success: false,
            error: 'Failed to leave branch'
        };
    }
}

export async function getBranch(branchId: string): Promise<ActionResponse<SpaceBranchFromDB>> {
    try {
        const userId = await checkAuth();

        const branch = await prisma.spaceBranch.findUnique({
            where: { id: branchId },
            include: {
                creator: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        image: true
                    }
                },
                space: true,
                parentStep: true
            }
        });

        if (!branch) {
            return {
                success: false,
                error: 'Branch not found'
            };
        }

        // Check access
        const member = await prisma.spaceMember.findUnique({
            where: {
                spaceId_userId: {
                    spaceId: branch.spaceId,
                    userId
                }
            }
        });

        if (!member) {
            return {
                success: false,
                error: 'You do not have access to this branch'
            };
        }

        // Check visibility
        if (branch.visibility === SpaceBranchVisibility.PRIVATE && branch.creatorId !== userId) {
            return {
                success: false,
                error: 'This branch is private'
            };
        }

        return {
            success: true,
            data: branch as unknown as SpaceBranchFromDB
        };
    } catch (error) {
        console.error('Error fetching branch:', error);
        return {
            success: false,
            error: 'Failed to fetch branch'
        };
    }
}

export async function updateBranch(
    branchId: string,
    data: Partial<SpaceBranchFormData>
): Promise<ActionResponse> {
    try {
        const userId = await checkAuth();

        const branch = await prisma.spaceBranch.findUnique({
            where: { id: branchId },
            include: {
                space: true
            }
        });

        if (!branch) {
            return {
                success: false,
                error: 'Branch not found'
            };
        }

        // Only creator can update
        if (branch.creatorId !== userId) {
            return {
                success: false,
                error: 'Only the creator can update this branch'
            };
        }

        const updateData: Parameters<typeof prisma.spaceBranch.update>[0]['data'] = {};

        if (data.title !== undefined) updateData.title = data.title;
        if (data.description !== undefined) updateData.description = data.description;
        if (data.visibility !== undefined) updateData.visibility = data.visibility;
        if (data.steps !== undefined) updateData.steps = data.steps as unknown as Record<string, unknown>;

        await prisma.spaceBranch.update({
            where: { id: branchId },
            data: updateData
        });

        revalidatePath(`/space/${branch.space.slug}`);
        return {
            success: true
        };
    } catch (error) {
        console.error('Error updating branch:', error);
        return {
            success: false,
            error: 'Failed to update branch'
        };
    }
}

export async function deleteBranch(branchId: string): Promise<ActionResponse> {
    try {
        const userId = await checkAuth();

        const branch = await prisma.spaceBranch.findUnique({
            where: { id: branchId },
            include: {
                space: true
            }
        });

        if (!branch) {
            return {
                success: false,
                error: 'Branch not found'
            };
        }

        // Only creator can delete
        if (branch.creatorId !== userId) {
            return {
                success: false,
                error: 'Only the creator can delete this branch'
            };
        }

        await prisma.spaceBranch.delete({
            where: { id: branchId }
        });

        // Update space branch count
        await prisma.space.update({
            where: { id: branch.spaceId },
            data: { totalBranches: { decrement: 1 } }
        });

        revalidatePath(`/space/${branch.space.slug}`);
        return {
            success: true
        };
    } catch (error) {
        console.error('Error deleting branch:', error);
        return {
            success: false,
            error: 'Failed to delete branch'
        };
    }
}





