"use server";

import { auth } from '@repo/auth';
import { prisma } from '@repo/prisma';
import type { ActionResponse } from '@/types/space';

interface SpaceAnalytics {
    overview: {
        totalMembers: number;
        activeMembers: number;
        totalViews: number;
        totalSteps: number;
        totalBranches: number;
        totalComments: number;
        totalLikes: number;
        averageProgress: number;
        averageTimeSpent: number;
        completionRate: number;
    };
    memberProgress: Array<{
        id: string;
        user: {
            id: string;
            name: string | null;
            username: string | null;
            image: string | null;
        };
        progressPercent: number;
        completedSteps: string[];
        totalTimeSpent: number;
        lastActiveAt: Date;
        isActive: boolean;
    }>;
    stepAnalytics: Array<{
        id: string;
        title: string;
        order: number;
        completionCount: number;
        averageTimeSpent: number | null;
        completionRate: number;
    }>;
    recentActivities: Array<{
        id: string;
        type: string;
        user: {
            id: string;
            name: string | null;
            username: string | null;
            image: string | null;
        };
        createdAt: Date;
    }>;
}

export async function getSpaceAnalytics(spaceId: string): Promise<ActionResponse<SpaceAnalytics>> {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return {
                success: false,
                error: 'Unauthorized'
            };
        }

        const space = await prisma.space.findUnique({
            where: { id: spaceId },
            select: {
                id: true,
                creatorId: true,
                viewCount: true,
                memberCount: true,
                totalSteps: true,
                totalBranches: true,
            }
        });

        if (!space) {
            return {
                success: false,
                error: 'Space not found'
            };
        }

        if (space.creatorId !== session.user.id) {
            return {
                success: false,
                error: 'Only the creator can view analytics'
            };
        }

        // Fetch all analytics data in parallel
        const [
            members,
            steps,
            comments,
            likes,
            activities
        ] = await Promise.all([
            // Get all members with their progress
            prisma.spaceMember.findMany({
                where: { spaceId },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            username: true,
                            image: true,
                        }
                    }
                },
                orderBy: { progressPercent: 'desc' }
            }),
            // Get all steps with completion counts
            prisma.spaceStep.findMany({
                where: { spaceId },
                orderBy: { order: 'asc' },
                include: {
                    _count: {
                        select: { completions: true }
                    }
                }
            }),
            // Get comment count
            prisma.spaceComment.count({
                where: { spaceId }
            }),
            // Get like count
            prisma.spaceLike.count({
                where: { spaceId }
            }),
            // Get recent activities
            prisma.spaceActivity.findMany({
                where: { spaceId },
                orderBy: { createdAt: 'desc' },
                take: 20,
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            username: true,
                            image: true,
                        }
                    }
                }
            })
        ]);

        // Calculate analytics
        const activeMembers = members.filter(m => m.isActive).length;
        const totalProgress = members.reduce((sum, m) => sum + m.progressPercent, 0);
        const averageProgress = members.length > 0 ? totalProgress / members.length : 0;
        const totalTimeSpent = members.reduce((sum, m) => sum + m.totalTimeSpent, 0);
        const averageTimeSpent = members.length > 0 ? totalTimeSpent / members.length : 0;
        
        // Calculate completion rate (members who completed all steps)
        const completedMembers = members.filter(m => m.progressPercent >= 100).length;
        const completionRate = members.length > 0 ? (completedMembers / members.length) * 100 : 0;

        // Map step analytics
        const stepAnalytics = steps.map(step => {
            const completionCount = step._count.completions;
            const completionRate = members.length > 0 
                ? (completionCount / members.length) * 100 
                : 0;
            
            return {
                id: step.id,
                title: step.title,
                order: step.order,
                completionCount,
                averageTimeSpent: step.averageTimeSpent,
                completionRate
            };
        });

        // Map member progress
        const memberProgress = members.map(member => ({
            id: member.id,
            user: member.user,
            progressPercent: member.progressPercent,
            completedSteps: member.completedSteps,
            totalTimeSpent: member.totalTimeSpent,
            lastActiveAt: member.lastActiveAt,
            isActive: member.isActive
        }));

        // Map recent activities
        const recentActivities = activities.map(activity => ({
            id: activity.id,
            type: activity.type,
            user: activity.user,
            createdAt: activity.createdAt
        }));

        return {
            success: true,
            data: {
                overview: {
                    totalMembers: space.memberCount,
                    activeMembers,
                    totalViews: space.viewCount,
                    totalSteps: space.totalSteps,
                    totalBranches: space.totalBranches,
                    totalComments: comments,
                    totalLikes: likes,
                    averageProgress,
                    averageTimeSpent: Math.round(averageTimeSpent),
                    completionRate
                },
                memberProgress,
                stepAnalytics,
                recentActivities
            }
        };
    } catch (error) {
        console.error('Error fetching space analytics:', error);
        return {
            success: false,
            error: 'Failed to fetch analytics'
        };
    }
}




