
"use server";

import { prisma } from "@repo/prisma";
import { auth } from '@repo/auth';
import { Prisma } from "@repo/prisma/client";

export async function getUserProgress() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { error: "Unauthorized" };
        }

        const progress = await prisma.learnProgress.findMany({
            where: { userId: session.user.id },
            include: {
                learn: {
                    select: {
                        id: true,
                        slug: true,
                        title: true,
                        thumbnail: true,
                        iconEmoji: true,
                        difficulty: true,
                        estimatedTime: true,
                        mainCategory: { select: { id: true, name: true } },
                        subCategory: { select: { id: true, name: true } },
                        _count: {
                            select: { steps: true },
                        },
                    },
                },
            },
            orderBy: { lastAccessedAt: "desc" },
        });

        const inProgress = progress.filter((p) => !p.isCompleted);
        const completed = progress.filter((p) => p.isCompleted);

        return { inProgress, completed };
    } catch (error) {
        console.error("Error fetching progress:", error);
        return { error: "Failed to fetch progress" };
    }
}

export async function updateLearnProgress(
    learnId: string,
    currentStep: number,
    completedStep?: number
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { error: "Unauthorized" };
        }

        const learn = await prisma.learn.findUnique({
            where: { id: learnId },
            include: { _count: { select: { steps: true } } },
        });

        if (!learn) {
            return { error: "Learn not found" };
        }

        const existing = await prisma.learnProgress.findUnique({
            where: {
                learnId_userId: { learnId, userId: session.user.id },
            },
        });

        let completedSteps = existing?.completedSteps || [];
        if (completedStep !== undefined && !completedSteps.includes(completedStep)) {
            completedSteps = [...completedSteps, completedStep].sort((a, b) => a - b);

        }

        const totalSteps = learn._count.steps;
        const progressPercent = totalSteps > 0 ? (completedSteps.length / totalSteps) * 100 : 0;
        const isCompleted = completedSteps.length >= totalSteps;

        const progress = await prisma.learnProgress.upsert({
            where: {
                learnId_userId: { learnId, userId: session.user.id },
            },
            update: {
                currentStep,
                completedSteps,
                totalSteps,
                progressPercent,
                isCompleted,
                completedAt: isCompleted && !existing?.isCompleted ? new Date() : undefined,
                lastAccessedAt: new Date(),
            },
            create: {
                learnId,
                userId: session.user.id,
                currentStep,
                completedSteps,
                totalSteps,
                progressPercent,
                isCompleted,
                completedAt: isCompleted ? new Date() : null,
                lastAccessedAt: new Date(),
            },
        });

        return { progress };
    } catch (error) {
        console.error("Error updating progress:", error);
        return { error: "Failed to update progress" };
    }
}

export async function submitQuizAnswer(
    learnId: string,
    stepId: string,
    selectedOption: number,
    isCorrect: boolean
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { error: "Unauthorized" };
        }

        const existing = await prisma.learnProgress.findUnique({
            where: {
                learnId_userId: { learnId, userId: session.user.id },
            },
        });

        const quizAnswers = (existing?.quizAnswers as Record<string, any>) || {};
        quizAnswers[stepId] = { selectedOption, isCorrect };

        await prisma.learnProgress.upsert({
            where: {
                learnId_userId: { learnId, userId: session.user.id },
            },
            update: {
                quizAnswers: quizAnswers as Prisma.InputJsonValue,
            },
            create: {
                learnId,
                userId: session.user.id,
                quizAnswers: quizAnswers as Prisma.InputJsonValue,
            },
        });

        return { success: true };
    } catch (error) {
        console.error("Error submitting quiz answer:", error);
        return { error: "Failed to submit answer" };
    }
}

export async function submitChallengeCode(
    learnId: string,
    stepId: string,
    code: string,
    passed: boolean
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { error: "Unauthorized" };
        }

        const existing = await prisma.learnProgress.findUnique({
            where: {
                learnId_userId: { learnId, userId: session.user.id },
            },
        });

        const challengeSubmissions = (existing?.challengeSubmissions as Record<string, any>) || {};
        challengeSubmissions[stepId] = { code, passed, submittedAt: new Date().toISOString() };

        await prisma.learnProgress.upsert({
            where: {
                learnId_userId: { learnId, userId: session.user.id },
            },
            update: {
                challengeSubmissions: challengeSubmissions as Prisma.InputJsonValue,
            },
            create: {
                learnId,
                userId: session.user.id,
                challengeSubmissions: challengeSubmissions as Prisma.InputJsonValue,
            },
        });

        return { success: true };
    } catch (error) {
        console.error("Error submitting challenge:", error);
        return { error: "Failed to submit challenge" };
    }
}

export async function getUserProgressStats() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { error: "Unauthorized" };
        }

        const userId = session.user.id;

        const [progress, completedCount, streakData, recentActivity] = await Promise.all([
            prisma.learnProgress.findMany({
                where: { userId },
                include: {
                    learn: {
                        select: {
                            id: true,
                            title: true,
                            slug: true,
                            description: true,
                            difficulty: true,
                            estimatedTime: true,
                            iconEmoji: true,
                            mainCategory: { select: { id: true, name: true } },
                            subCategory: { select: { id: true, name: true } },
                            _count: { select: { steps: true } },
                            prerequisiteOf: {
                                include: {
                                    prerequisite: {
                                        select: { id: true, title: true, slug: true },
                                    },
                                },
                            },
                        },
                    },
                },
                orderBy: { updatedAt: "desc" },
            }),
            prisma.learnProgress.count({
                where: { userId, isCompleted: true },
            }),
            // Streak data - last 30 days
            prisma.learnProgress.findMany({
                where: {
                    userId,
                    updatedAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
                },
                select: { updatedAt: true },
            }),
            // Recent activity
            prisma.learnProgress.findMany({
                where: { userId },
                orderBy: { lastAccessedAt: "desc" },
                take: 5,
                include: {
                    learn: {
                        select: {
                            id: true, title: true, slug: true, iconEmoji: true,
                            _count: { select: { steps: true } },
                        },
                    },
                },
            }),
        ]);

        const totalStepsCompleted = progress.reduce((acc, curr) => acc + (curr.completedSteps?.length || 0), 0);

        return {
            progress,
            stats: {
                completedCount,
                inProgressCount: progress.filter((p: any) => !p.isCompleted && (p.currentStep || 0) > 0).length,
                totalLearns: progress.length,
                currentStreak: 0, // Placeholder
                totalStepsCompleted,
            },
            recentActivity,
        };
    } catch (error) {
        console.error("Error fetching user progress stats:", error);
        return { error: "Failed to fetch progress stats" };
    }
}