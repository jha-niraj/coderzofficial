"use server";

import { auth } from '@repo/auth';
import { prisma } from '@repo/prisma';
import { revalidatePath } from 'next/cache';
import { SpaceStepStatus, SpaceStepContentType, SpaceActivityType } from '@repo/prisma/client';
import type { ActionResponse, SpaceStepFormData, SpaceStepWithDetails } from '@/types/space';

async function checkAuth() {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error('Unauthorized');
    }
    return session.user.id;
}

async function checkStepAccess(spaceId: string, userId: string) {
    const member = await prisma.spaceMember.findUnique({
        where: {
            spaceId_userId: {
                spaceId,
                userId
            }
        }
    });

    const space = await prisma.space.findUnique({
        where: { id: spaceId }
    });

    if (!space) {
        throw new Error('Space not found');
    }

    // Creator always has access
    if (space.creatorId === userId) {
        return { hasAccess: true, canModify: true };
    }

    // Members can add content if allowed
    if (space.allowMemberContent && member) {
        return { hasAccess: true, canModify: true };
    }

    // Regular members can view but not modify
    if (member) {
        return { hasAccess: true, canModify: false };
    }

    return { hasAccess: false, canModify: false };
}

export async function createStep(
    spaceId: string,
    data: SpaceStepFormData
): Promise<ActionResponse<{ id: string }>> {
    try {
        const userId = await checkAuth();
        const access = await checkStepAccess(spaceId, userId);

        if (!access.hasAccess || !access.canModify) {
            return {
                success: false,
                error: 'You do not have permission to add steps to this space'
            };
        }

        // Get max order
        const maxStep = await prisma.spaceStep.findFirst({
            where: { spaceId },
            orderBy: { order: 'desc' }
        });

        const order = maxStep ? maxStep.order + 1 : 1;

        const step = await prisma.spaceStep.create({
            data: {
                spaceId,
                order,
                title: data.title,
                description: data.description,
                contentType: data.contentType,
                contentId: data.contentId,
                contentData: data.contentData as unknown as Record<string, unknown>,
                isRequired: data.isRequired,
                estimatedTime: data.estimatedTime,
                dueDate: data.dueDate,
                status: SpaceStepStatus.ACTIVE
            }
        });

        // Update space step count
        await prisma.space.update({
            where: { id: spaceId },
            data: { totalSteps: { increment: 1 } }
        });

        // Create activity
        await prisma.spaceActivity.create({
            data: {
                spaceId,
                userId,
                type: SpaceActivityType.CONTENT_ADDED,
                stepId: step.id
            }
        });

        const space = await prisma.space.findUnique({
            where: { id: spaceId },
            select: { slug: true }
        });

        revalidatePath(`/space/${space?.slug}`);
        return {
            success: true,
            data: { id: step.id }
        };
    } catch (error) {
        console.error('Error creating step:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to create step'
        };
    }
}

export async function updateStep(
    stepId: string,
    data: Partial<SpaceStepFormData>
): Promise<ActionResponse> {
    try {
        const userId = await checkAuth();

        const step = await prisma.spaceStep.findUnique({
            where: { id: stepId },
            include: {
                space: true
            }
        });

        if (!step) {
            return {
                success: false,
                error: 'Step not found'
            };
        }

        const access = await checkStepAccess(step.spaceId, userId);
        if (!access.hasAccess || !access.canModify) {
            return {
                success: false,
                error: 'You do not have permission to modify this step'
            };
        }

        const updateData: Parameters<typeof prisma.spaceStep.update>[0]['data'] = {};

        if (data.title !== undefined) updateData.title = data.title;
        if (data.description !== undefined) updateData.description = data.description;
        if (data.contentType !== undefined) updateData.contentType = data.contentType;
        if (data.contentId !== undefined) updateData.contentId = data.contentId;
        if (data.contentData !== undefined) updateData.contentData = data.contentData as unknown as Record<string, unknown>;
        if (data.isRequired !== undefined) updateData.isRequired = data.isRequired;
        if (data.estimatedTime !== undefined) updateData.estimatedTime = data.estimatedTime;
        if (data.dueDate !== undefined) updateData.dueDate = data.dueDate;

        await prisma.spaceStep.update({
            where: { id: stepId },
            data: updateData
        });

        revalidatePath(`/space/${step.space.slug}`);
        return {
            success: true
        };
    } catch (error) {
        console.error('Error updating step:', error);
        return {
            success: false,
            error: 'Failed to update step'
        };
    }
}

export async function deleteStep(stepId: string): Promise<ActionResponse> {
    try {
        const userId = await checkAuth();

        const step = await prisma.spaceStep.findUnique({
            where: { id: stepId },
            include: {
                space: true
            }
        });

        if (!step) {
            return {
                success: false,
                error: 'Step not found'
            };
        }

        const access = await checkStepAccess(step.spaceId, userId);
        if (!access.hasAccess || !access.canModify) {
            return {
                success: false,
                error: 'You do not have permission to delete this step'
            };
        }

        await prisma.spaceStep.delete({
            where: { id: stepId }
        });

        // Update step count
        await prisma.space.update({
            where: { id: step.spaceId },
            data: { totalSteps: { decrement: 1 } }
        });

        // Reorder remaining steps
        const remainingSteps = await prisma.spaceStep.findMany({
            where: {
                spaceId: step.spaceId,
                order: { gt: step.order }
            },
            orderBy: { order: 'asc' }
        });

        for (let i = 0; i < remainingSteps.length; i++) {
            await prisma.spaceStep.update({
                where: { id: remainingSteps[i].id },
                data: { order: step.order + i }
            });
        }

        revalidatePath(`/space/${step.space.slug}`);
        return {
            success: true
        };
    } catch (error) {
        console.error('Error deleting step:', error);
        return {
            success: false,
            error: 'Failed to delete step'
        };
    }
}

export async function reorderSteps(
    spaceId: string,
    stepOrders: Array<{ stepId: string; order: number }>
): Promise<ActionResponse> {
    try {
        const userId = await checkAuth();
        const access = await checkStepAccess(spaceId, userId);

        if (!access.hasAccess || !access.canModify) {
            return {
                success: false,
                error: 'You do not have permission to reorder steps'
            };
        }

        await Promise.all(
            stepOrders.map(({ stepId, order }) =>
                prisma.spaceStep.update({
                    where: { id: stepId },
                    data: { order }
                })
            )
        );

        const space = await prisma.space.findUnique({
            where: { id: spaceId },
            select: { slug: true }
        });

        revalidatePath(`/space/${space?.slug}`);
        return {
            success: true
        };
    } catch (error) {
        console.error('Error reordering steps:', error);
        return {
            success: false,
            error: 'Failed to reorder steps'
        };
    }
}

export async function getStep(stepId: string): Promise<ActionResponse<SpaceStepWithDetails>> {
    try {
        const userId = await checkAuth();

        const step = await prisma.spaceStep.findUnique({
            where: { id: stepId },
            include: {
                space: true,
                completions: {
                    take: 10,
                    orderBy: { completedAt: 'desc' },
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
                comments: {
                    take: 20,
                    orderBy: { createdAt: 'desc' },
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
                likes: {
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
                branches: {
                    take: 10,
                    include: {
                        creator: {
                            select: {
                                id: true,
                                name: true,
                                username: true,
                                image: true
                            }
                        }
                    }
                }
            }
        });

        if (!step) {
            return {
                success: false,
                error: 'Step not found'
            };
        }

        // Check access
        const access = await checkStepAccess(step.spaceId, userId);
        if (!access.hasAccess) {
            return {
                success: false,
                error: 'You do not have access to this step'
            };
        }

        // Get user's completion
        const userCompletion = await prisma.spaceStepCompletion.findUnique({
            where: {
                stepId_userId: {
                    stepId,
                    userId
                }
            }
        });

        return {
            success: true,
            data: {
                ...step,
                userCompletion: userCompletion || undefined
            } as unknown as SpaceStepWithDetails
        };
    } catch (error) {
        console.error('Error fetching step:', error);
        return {
            success: false,
            error: 'Failed to fetch step'
        };
    }
}

export async function completeStep(
    stepId: string,
    data?: {
        timeSpent?: number;
        isShared?: boolean;
        notes?: string;
        attachments?: unknown;
    }
): Promise<ActionResponse<{ id: string }>> {
    try {
        const userId = await checkAuth();

        const step = await prisma.spaceStep.findUnique({
            where: { id: stepId },
            include: {
                space: true
            }
        });

        if (!step) {
            return {
                success: false,
                error: 'Step not found'
            };
        }

        // Check if already completed
        const existingCompletion = await prisma.spaceStepCompletion.findUnique({
            where: {
                stepId_userId: {
                    stepId,
                    userId
                }
            }
        });

        if (existingCompletion) {
            return {
                success: false,
                error: 'Step already completed'
            };
        }

        // Create completion
        const completion = await prisma.spaceStepCompletion.create({
            data: {
                stepId,
                userId,
                spaceId: step.spaceId,
                timeSpent: data?.timeSpent || 0,
                isShared: data?.isShared || false,
                notes: data?.notes,
                attachments: data?.attachments as unknown as Record<string, unknown>
            }
        });

        // Update step stats
        const completionCount = await prisma.spaceStepCompletion.count({
            where: { stepId }
        });

        const avgTime = await prisma.spaceStepCompletion.aggregate({
            where: { stepId },
            _avg: { timeSpent: true }
        });

        await prisma.spaceStep.update({
            where: { id: stepId },
            data: {
                completionCount,
                averageTimeSpent: avgTime._avg.timeSpent ? Math.round(avgTime._avg.timeSpent) : null
            }
        });

        // Update member progress
        const member = await prisma.spaceMember.findUnique({
            where: {
                spaceId_userId: {
                    spaceId: step.spaceId,
                    userId
                }
            }
        });

        if (member) {
            const completedSteps = [...member.completedSteps, stepId];
            const totalSteps = await prisma.spaceStep.count({
                where: { spaceId: step.spaceId }
            });
            const progressPercent = totalSteps > 0 ? (completedSteps.length / totalSteps) * 100 : 0;

            await prisma.spaceMember.update({
                where: {
                    spaceId_userId: {
                        spaceId: step.spaceId,
                        userId
                    }
                },
                data: {
                    completedSteps,
                    progressPercent,
                    currentStepId: stepId, // Move to next step if needed
                    totalTimeSpent: { increment: data?.timeSpent || 0 }
                }
            });
        }

        // Create activity if shared
        if (data?.isShared) {
            await prisma.spaceActivity.create({
                data: {
                    spaceId: step.spaceId,
                    userId,
                    type: SpaceActivityType.STEP_COMPLETED,
                    stepId
                }
            });
        }

        revalidatePath(`/space/${step.space.slug}`);
        return {
            success: true,
            data: { id: completion.id }
        };
    } catch (error) {
        console.error('Error completing step:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to complete step'
        };
    }
}





