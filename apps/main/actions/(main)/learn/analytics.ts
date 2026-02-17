
"use server";

import { prisma } from "@repo/prisma";
import {
    LearnStatus, LearnRequestStatus,
    LearnDifficulty, Module
} from "@repo/prisma/client";
import { checkIsAdmin, checkIsAuthenticated } from "./utils";
import { auth } from '@repo/auth';

// ==========================================
// ANALYTICS & STATS
// ==========================================

export async function getLearnStats() {
    try {
        const adminCheck = await checkIsAdmin();
        if (!adminCheck.isAdmin) {
            return { error: adminCheck.error };
        }

        const [
            totalLearns,
            publishedLearns,
            draftLearns,
            totalViews,
            totalLikes,
            totalComments,
            categoryStats,
            recentViews,
        ] = await Promise.all([
            prisma.learn.count(),
            prisma.learn.count({ where: { status: LearnStatus.PUBLISHED } }),
            prisma.learn.count({ where: { status: LearnStatus.DRAFT } }),
            prisma.learn.aggregate({ _sum: { viewCount: true } }),
            prisma.learn.aggregate({ _sum: { likeCount: true } }),
            prisma.learn.aggregate({ _sum: { commentCount: true } }),
            prisma.learn.groupBy({
                by: ["mainCategoryId"],
                _count: true,
            }),
            prisma.learnView.count({
                where: {
                    viewedAt: {
                        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
                    },
                },
            }),
        ]);

        return {
            totalLearns,
            publishedLearns,
            draftLearns,
            totalViews: totalViews._sum.viewCount || 0,
            totalLikes: totalLikes._sum.likeCount || 0,
            totalComments: totalComments._sum.commentCount || 0,
            categoryStats,
            recentViews,
        };
    } catch (error) {
        console.error("Error fetching stats:", error);
        return { error: "Failed to fetch stats" };
    }
}

export async function getCreatorLearnStats(userId?: string) {
    try {
        const authCheck = await checkIsAuthenticated();
        if (!authCheck.isAuthenticated) {
            return { error: authCheck.error };
        }

        const creatorId = userId || authCheck.userId;

        // Get all learns by this creator
        const learns = await prisma.learn.findMany({
            where: { creatorId: creatorId! },
            select: {
                id: true,
                slug: true,
                title: true,
                iconEmoji: true,
                status: true,
                viewCount: true,
                likeCount: true,
                bookmarkCount: true,
                commentCount: true,
                createdAt: true,
                updatedAt: true,
                _count: {
                    select: {
                        steps: true,
                        progress: true,
                    },
                },
            },
            orderBy: { updatedAt: "desc" },
        });

        // Get total stats
        const totalStats = await prisma.learn.aggregate({
            where: { creatorId: creatorId! },
            _sum: {
                viewCount: true,
                likeCount: true,
                bookmarkCount: true,
                commentCount: true,
            },
        });

        const recentViews = await prisma.learnView.groupBy({
            by: ["learnId"],
            where: {
                learn: { creatorId: creatorId! },
                viewedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
            },
            _count: true,
        });

        // Count by status
        const statusCounts = {
            draft: learns.filter(c => c.status === LearnStatus.DRAFT).length,
            // pending: removed
            published: learns.filter(c => c.status === LearnStatus.PUBLISHED).length, // verifiedAt removed
            archived: learns.filter(c => c.status === LearnStatus.ARCHIVED).length,
        };

        return {
            learns,
            totalStats: {
                totalLearns: learns.length,
                totalViews: totalStats._sum.viewCount || 0,
                totalLikes: totalStats._sum.likeCount || 0,
                totalBookmarks: totalStats._sum.bookmarkCount || 0,
                totalComments: totalStats._sum.commentCount || 0,
                totalLearners: learns.reduce((sum, c) => sum + c._count.progress, 0),
            },
            statusCounts,
            recentViews,
        };
    } catch (error) {
        console.error("Error fetching creator stats:", error);
        return { error: "Failed to fetch creator stats" };
    }
}

export async function getLearnDetailedStats(learnId: string) {
    try {
        const authCheck = await checkIsAuthenticated();
        if (!authCheck.isAuthenticated) {
            return { error: authCheck.error };
        }

        const learn = await prisma.learn.findUnique({
            where: { id: learnId },
            select: { creatorId: true },
        });

        if (!learn) {
            return { error: "Learn not found" };
        }

        const adminCheck = await checkIsAdmin();
        if (!adminCheck.isAdmin && learn.creatorId !== authCheck.userId) {
            return { error: "Not authorized to view stats" };
        }

        // Get detailed views
        const viewsByDay = await prisma.$queryRaw`
            SELECT DATE(viewed_at) as date, COUNT(*) as count
            FROM "LearnView"
            WHERE learn_id = ${learnId}
            AND viewed_at >= NOW() - INTERVAL '30 days'
            GROUP BY DATE(viewed_at)
            ORDER BY date DESC
        ` as { date: Date; count: bigint }[];

        // Get unique visitors
        const uniqueVisitors = await prisma.learnView.groupBy({
            by: ["userId"],
            where: {
                learnId,
                userId: { not: null },
            },
            _count: true,
        });

        // Get progress completion stats
        const progressStats = await prisma.learnProgress.aggregate({
            where: { learnId },
            _avg: { progressPercent: true },
            _count: true,
        });

        const completedCount = await prisma.learnProgress.count({
            where: { learnId, isCompleted: true },
        });

        return {
            viewsByDay: viewsByDay.map(v => ({ date: v.date, count: Number(v.count) })),
            uniqueVisitors: uniqueVisitors.length,
            totalLearners: progressStats._count,
            averageProgress: progressStats._avg?.progressPercent || 0,
            completedCount,
        };
    } catch (error) {
        console.error("Error fetching Learn detailed stats:", error);
        return { error: "Failed to fetch detailed stats" };
    }
}

export async function getTrendingLearns(limit = 6) {
    try {
        const learns = await prisma.learn.findMany({
            where: { status: LearnStatus.PUBLISHED },
            orderBy: [
                { likeCount: "desc" },
                { viewCount: "desc" },
            ],
            take: limit,
            include: {
                creator: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        image: true,
                    },
                },
                _count: {
                    select: {
                        steps: true,
                    },
                },
            },
        });

        return { learns };
    } catch (error) {
        console.error("Error fetching trending learns:", error);
        return { error: "Failed to fetch trending learns" };
    }
}

export async function getRecentLearns(hours: number = 24, limit: number = 8) {
    try {
        const since = new Date(Date.now() - hours * 60 * 60 * 1000);

        const learns = await prisma.learn.findMany({
            where: {
                status: LearnStatus.PUBLISHED,
                createdAt: { gte: since }
            },
            take: limit,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                slug: true,
                title: true,
                description: true,
                thumbnail: true,
                iconEmoji: true,
                mainCategory: { select: { name: true } },
                difficulty: true,
                estimatedTime: true,
                viewCount: true,
                likeCount: true,
                createdAt: true,
                creator: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        image: true
                    },
                },
                _count: {
                    select: {
                        steps: true,
                        likes: true,
                        comments: true
                    }
                },
            },
        });

        return { learns };
    } catch (error) {
        console.error("Error fetching recent learns:", error);
        return { error: "Failed to fetch recent learns", learns: [] };
    }
}

export async function getCategories() {
    try {
        const categories = await prisma.learn.groupBy({
            by: ["mainCategoryId"],
            where: { status: LearnStatus.PUBLISHED },
            _count: true,
        });

        return { categories };
    } catch (error) {
        console.error("Error fetching categories:", error);
        return { error: "Failed to fetch categories" };
    }
}

export async function getPublicLearnStats() {
    try {
        const [totalLearns, totalSteps, categories] = await Promise.all([
            prisma.learn.count({ where: { status: LearnStatus.PUBLISHED } }),
            prisma.learnStep.count({
                where: { learn: { status: LearnStatus.PUBLISHED } },
            }),
            prisma.learn.groupBy({
                by: ["mainCategoryId"],
                where: { status: LearnStatus.PUBLISHED },
                _count: true,
            }),
        ]);

        return {
            totalLearns,
            totalSteps,
            totalCategories: categories.length,
        };
    } catch (error) {
        console.error("Error fetching Learn stats:", error);
        return { totalLearns: 0, totalSteps: 0, totalCategories: 0 };
    }
}

// ==========================================
// Learn REQUESTS
// ==========================================

export async function submitLearnRequest(
    title: string,
    description: string,
    category?: string,
    difficulty?: LearnDifficulty
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { error: "Unauthorized" };
        }

        const request = await prisma.learnRequest.create({
            data: {
                userId: session.user.id,
                title,
                description,
                difficulty,
            },
        });

        return { request };
    } catch (error) {
        console.error("Error submitting request:", error);
        return { error: "Failed to submit request" };
    }
}

export async function getLearnRequests(status?: LearnRequestStatus) {
    try {
        const adminCheck = await checkIsAdmin();
        if (!adminCheck.isAdmin) {
            return { error: adminCheck.error };
        }

        const where: any = {};
        if (status) {
            where.status = status;
        }

        const requests = await prisma.learnRequest.findMany({
            where,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        image: true,
                    },
                },
            },
            orderBy: [{ upvotes: "desc" }, { createdAt: "desc" }],
        });

        return { requests };
    } catch (error) {
        console.error("Error fetching requests:", error);
        return { error: "Failed to fetch requests" };
    }
}

export async function updateLearnRequestStatus(
    requestId: string,
    status: LearnRequestStatus,
    adminNotes?: string,
    resultLearnId?: string
) {
    try {
        const adminCheck = await checkIsAdmin();
        if (!adminCheck.isAdmin) {
            return { error: adminCheck.error };
        }

        const request = await prisma.learnRequest.update({
            where: { id: requestId },
            data: {
                status,
                adminNotes,
                assignedTo: adminCheck.userId,
                resultLearnId,
                resolvedAt: status === LearnRequestStatus.COMPLETED || status === LearnRequestStatus.REJECTED
                    ? new Date()
                    : null,
            },
        });

        return { request };
    } catch (error) {
        console.error("Error updating request:", error);
        return { error: "Failed to update request" };
    }
}