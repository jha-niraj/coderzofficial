
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

export async function updateLeaderboardScore(
    subCategoryId: string,
    userId: string,
    scoreUpdate: {
        quizScore?: number;
        challengeScore?: number;
        mockScore?: number;
        projectScore?: number;
        quizzesCompleted?: number;
        challengesCompleted?: number;
        mocksCompleted?: number;
        projectsCompleted?: number;
        learnsCompleted?: number;
    }
) {
    try {
        const existing = await prisma.learnLeaderboard.findUnique({
            where: { subCategoryId_userId: { subCategoryId, userId } },
        });

        const newQuizScore = (existing?.quizScore || 0) + (scoreUpdate.quizScore || 0);
        const newChallengeScore = (existing?.challengeScore || 0) + (scoreUpdate.challengeScore || 0);
        const newMockScore = (existing?.mockScore || 0) + (scoreUpdate.mockScore || 0);
        const newProjectScore = (existing?.projectScore || 0) + (scoreUpdate.projectScore || 0);
        const totalScore = newQuizScore + newChallengeScore + newMockScore + newProjectScore;

        await prisma.learnLeaderboard.upsert({
            where: { subCategoryId_userId: { subCategoryId, userId } },
            update: {
                quizScore: newQuizScore,
                challengeScore: newChallengeScore,
                mockScore: newMockScore,
                projectScore: newProjectScore,
                totalScore,
                quizzesCompleted: { increment: scoreUpdate.quizzesCompleted || 0 },
                challengesCompleted: { increment: scoreUpdate.challengesCompleted || 0 },
                mocksCompleted: { increment: scoreUpdate.mocksCompleted || 0 },
                projectsCompleted: { increment: scoreUpdate.projectsCompleted || 0 },
                learnsCompleted: { increment: scoreUpdate.learnsCompleted || 0 },
            },
            create: {
                subCategoryId,
                userId,
                quizScore: scoreUpdate.quizScore || 0,
                challengeScore: scoreUpdate.challengeScore || 0,
                mockScore: scoreUpdate.mockScore || 0,
                projectScore: scoreUpdate.projectScore || 0,
                totalScore: (scoreUpdate.quizScore || 0) + (scoreUpdate.challengeScore || 0) + (scoreUpdate.mockScore || 0) + (scoreUpdate.projectScore || 0),
                quizzesCompleted: scoreUpdate.quizzesCompleted || 0,
                challengesCompleted: scoreUpdate.challengesCompleted || 0,
                mocksCompleted: scoreUpdate.mocksCompleted || 0,
                projectsCompleted: scoreUpdate.projectsCompleted || 0,
                learnsCompleted: scoreUpdate.learnsCompleted || 0,
            },
        });

        return { success: true };
    } catch (error) {
        console.error("Error updating leaderboard:", error);
        return { error: "Failed to update leaderboard" };
    }
}
