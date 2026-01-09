"use server";

import { auth } from '@repo/auth';
import { prisma } from '@repo/prisma';
import { revalidatePath } from 'next/cache';
import { SpaceMemberRole } from '@repo/prisma/client';
import type { ActionResponse } from '@/types/space';

async function checkAuth() {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error('Unauthorized');
    }
    return session.user.id;
}

async function checkCreatorAccess(spaceId: string, userId: string) {
    const space = await prisma.space.findUnique({
        where: { id: spaceId }
    });

    if (!space) {
        throw new Error('Space not found');
    }

    if (space.creatorId !== userId) {
        const member = await prisma.spaceMember.findUnique({
            where: {
                spaceId_userId: {
                    spaceId,
                    userId
                }
            }
        });

        if (!member || member.role !== SpaceMemberRole.CREATOR) {
            throw new Error('Only the creator can perform this action');
        }
    }

    return space;
}

export async function regenerateAccessCode(spaceId: string): Promise<ActionResponse<{ accessCode: string }>> {
    try {
        const userId = await checkAuth();
        await checkCreatorAccess(spaceId, userId);

        const accessCode = Math.random().toString(36).substring(2, 8).toUpperCase();

        await prisma.space.update({
            where: { id: spaceId },
            data: { accessCode }
        });

        const space = await prisma.space.findUnique({
            where: { id: spaceId },
            select: { slug: true }
        });

        revalidatePath(`/space/${space?.slug}`);
        return {
            success: true,
            data: { accessCode }
        };
    } catch (error) {
        console.error('Error regenerating access code:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to regenerate access code'
        };
    }
}

export async function archiveSpace(spaceId: string): Promise<ActionResponse> {
    try {
        const userId = await checkAuth();
        await checkCreatorAccess(spaceId, userId);

        // Archive all steps
        await prisma.spaceStep.updateMany({
            where: { spaceId },
            data: { status: 'ARCHIVED' as const }
        });

        const space = await prisma.space.findUnique({
            where: { id: spaceId },
            select: { slug: true }
        });

        revalidatePath(`/space/${space?.slug}`);
        return {
            success: true
        };
    } catch (error) {
        console.error('Error archiving space:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to archive space'
        };
    }
}

export async function getSpaceAnalytics(spaceId: string): Promise<ActionResponse<{
    totalMembers: number;
    activeMembers: number;
    totalSteps: number;
    completedSteps: number;
    totalBranches: number;
    averageProgress: number;
    recentActivity: number;
}>> {
    try {
        const userId = await checkAuth();
        await checkCreatorAccess(spaceId, userId);

        const [
            totalMembers,
            activeMembers,
            totalSteps,
            completedSteps,
            totalBranches,
            members
        ] = await Promise.all([
            prisma.spaceMember.count({
                where: { spaceId }
            }),
            prisma.spaceMember.count({
                where: {
                    spaceId,
                    isActive: true,
                    lastActiveAt: {
                        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
                    }
                }
            }),
            prisma.spaceStep.count({
                where: { spaceId }
            }),
            prisma.spaceStepCompletion.count({
                where: { spaceId }
            }),
            prisma.spaceBranch.count({
                where: { spaceId }
            }),
            prisma.spaceMember.findMany({
                where: { spaceId },
                select: { progressPercent: true }
            })
        ]);

        const averageProgress = members.length > 0
            ? members.reduce((sum, m) => sum + m.progressPercent, 0) / members.length
            : 0;

        const recentActivity = await prisma.spaceActivity.count({
            where: {
                spaceId,
                createdAt: {
                    gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
                }
            }
        });

        return {
            success: true,
            data: {
                totalMembers,
                activeMembers,
                totalSteps,
                completedSteps,
                totalBranches,
                averageProgress,
                recentActivity
            }
        };
    } catch (error) {
        console.error('Error fetching analytics:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to fetch analytics'
        };
    }
}

export async function exportSpaceData(spaceId: string): Promise<ActionResponse<{
    space: unknown;
    steps: unknown[];
    members: unknown[];
    activities: unknown[];
}>> {
    try {
        const userId = await checkAuth();
        await checkCreatorAccess(spaceId, userId);

        const [space, steps, members, activities] = await Promise.all([
            prisma.space.findUnique({
                where: { id: spaceId },
                include: {
                    creator: {
                        select: {
                            id: true,
                            name: true,
                            username: true,
                            email: true
                        }
                    }
                }
            }),
            prisma.spaceStep.findMany({
                where: { spaceId },
                orderBy: { order: 'asc' },
                include: {
                    completions: {
                        take: 10,
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                    username: true
                                }
                            }
                        }
                    }
                }
            }),
            prisma.spaceMember.findMany({
                where: { spaceId },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            username: true,
                            email: true
                        }
                    }
                }
            }),
            prisma.spaceActivity.findMany({
                where: { spaceId },
                orderBy: { createdAt: 'desc' },
                take: 100,
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            username: true
                        }
                    }
                }
            })
        ]);

        if (!space) {
            return {
                success: false,
                error: 'Space not found'
            };
        }

        return {
            success: true,
            data: {
                space,
                steps,
                members,
                activities
            }
        };
    } catch (error) {
        console.error('Error exporting data:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to export data'
        };
    }
}





