
"use server";

import { prisma } from "@repo/prisma";
import { auth } from '@repo/auth';
import { LearnStatus } from "@repo/prisma/client";

// ==========================================
// SUBCATEGORY LEARNS PAGE
// ==========================================

export async function getSubCategoryLearns(subcategorySlug: string) {
    try {
        const session = await auth();
        const userId = session?.user?.id;

        const subCategory = await prisma.learnSubCategory.findUnique({
            where: { slug: subcategorySlug },
            include: {
                mainCategory: { select: { name: true, slug: true } },
            },
        });

        if (!subCategory) {
            return { error: "Subcategory not found", learns: [], stats: { totalLearns: 0, totalSteps: 0, usersEnrolled: 0, avgCompletion: 0 } };
        }

        // Fetch topics for this subcategory
        const topics = await prisma.learnTopic.findMany({
            where: { subCategoryId: subCategory.id },
            orderBy: { order: "asc" },
            select: {
                id: true,
                name: true,
                slug: true,
                description: true,
                icon: true,
                order: true,
                learnCount: true,
            },
        });

        const learns = await prisma.learn.findMany({
            where: {
                subCategoryId: subCategory.id,
                status: LearnStatus.PUBLISHED,
            },
            orderBy: [
                { unitNumber: "asc" },
                { createdAt: "asc" },
            ],
            select: {
                id: true,
                slug: true,
                title: true,
                description: true,
                difficulty: true,
                estimatedTime: true,
                iconEmoji: true,
                unitNumber: true,
                unitTitle: true,
                tags: true,
                topicId: true,
                topic: { select: { name: true, slug: true, icon: true, order: true } },
                _count: { select: { steps: true } },
            },
        });

        // Fetch user progress if logged in
        let learnsWithProgress = learns.map(l => ({ ...l, progress: null as { progressPercent: number; isCompleted: boolean } | null }));

        if (userId) {
            const progressRecords = await prisma.learnProgress.findMany({
                where: {
                    userId,
                    learnId: { in: learns.map(l => l.id) },
                },
                select: {
                    learnId: true,
                    progressPercent: true,
                    isCompleted: true,
                },
            });

            const progressMap = new Map(progressRecords.map(p => [p.learnId, p]));
            learnsWithProgress = learns.map(l => ({
                ...l,
                progress: progressMap.get(l.id) || null,
            }));
        }

        // Compute stats
        const totalSteps = learns.reduce((acc, l) => acc + l._count.steps, 0);
        const usersEnrolled = await prisma.learnProgress.findMany({
            where: { learnId: { in: learns.map(l => l.id) } },
            distinct: ['userId'],
            select: { userId: true },
        });

        const allProgress = await prisma.learnProgress.findMany({
            where: { learnId: { in: learns.map(l => l.id) } },
            select: { progressPercent: true },
        });

        const avgCompletion = allProgress.length > 0
            ? Math.round(allProgress.reduce((acc, p) => acc + p.progressPercent, 0) / allProgress.length)
            : 0;

        return {
            subCategory: {
                id: subCategory.id,
                name: subCategory.name,
                slug: subCategory.slug,
                description: subCategory.description,
                icon: subCategory.icon,
                color: subCategory.color,
                mainCategory: subCategory.mainCategory ? {
                    name: subCategory.mainCategory.name,
                    slug: subCategory.mainCategory.slug,
                } : null,
            },
            topics,
            learns: learnsWithProgress,
            stats: {
                totalLearns: learns.length,
                totalSteps,
                usersEnrolled: usersEnrolled.length,
                avgCompletion,
            },
        };
    } catch (error) {
        console.error("Error fetching subcategory learns:", error);
        return { error: "Failed to fetch learns", learns: [], stats: { totalLearns: 0, totalSteps: 0, usersEnrolled: 0, avgCompletion: 0 } };
    }
}

// ==========================================
// LEADERBOARD
// ==========================================

export async function getSubCategoryLeaderboard(subcategorySlug: string) {
    try {
        const subCategory = await prisma.learnSubCategory.findUnique({
            where: { slug: subcategorySlug },
        });

        if (!subCategory) {
            return { leaderboard: [] };
        }

        const leaderboard = await prisma.learnLeaderboard.findMany({
            where: { subCategoryId: subCategory.id },
            orderBy: { totalScore: "desc" },
            take: 50,
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
        });

        // Add rank
        const rankedLeaderboard = leaderboard.map((entry, idx) => ({
            ...entry,
            rank: idx + 1,
            quizzesCompleted: entry.quizzesCompleted,
        }));

        return { leaderboard: rankedLeaderboard };
    } catch (error) {
        console.error("Error fetching leaderboard:", error);
        return { leaderboard: [] };
    }
}