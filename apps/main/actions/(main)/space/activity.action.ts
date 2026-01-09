"use server";

import { auth } from '@repo/auth';
import { prisma } from '@repo/prisma';
import type { ActionResponse, SpaceActivitiesResponse } from '@/types/space';

async function checkAuth() {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error('Unauthorized');
    }
    return session.user.id;
}

export async function getSpaceActivities(
    spaceId: string,
    page: number = 1,
    limit: number = 20
): Promise<ActionResponse<SpaceActivitiesResponse>> {
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

        const space = await prisma.space.findUnique({
            where: { id: spaceId }
        });

        if (!space) {
            return {
                success: false,
                error: 'Space not found'
            };
        }

        if (space.creatorId !== userId && !member) {
            return {
                success: false,
                error: 'You do not have access to view activities'
            };
        }

        const skip = (page - 1) * limit;

        const [activities, total] = await Promise.all([
            prisma.spaceActivity.findMany({
                where: { spaceId },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            username: true,
                            image: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit
            }),
            prisma.spaceActivity.count({
                where: { spaceId }
            })
        ]);

        const totalPages = Math.ceil(total / limit);

        return {
            success: true,
            data: {
                activities: activities as unknown as SpaceActivitiesResponse['activities'],
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages
                }
            }
        };
    } catch (error) {
        console.error('Error fetching activities:', error);
        return {
            success: false,
            error: 'Failed to fetch activities'
        };
    }
}





