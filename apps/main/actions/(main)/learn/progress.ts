
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

// ═══════════════════════════════════════════════════════
//  QUIZ — Structured Answer Tracking
// ═══════════════════════════════════════════════════════

/**
 * Submit an answer to a structured LearnQuizQuestion.
 * Records in LearnQuizAnswer and updates quizScorePercent on LearnProgress.
 * Falls back to JSON-based tracking for old stepData quizzes.
 */
export async function submitQuizAnswer(
    learnId: string,
    stepId: string,
    selectedOption: number,
    isCorrect: boolean,
    questionId?: string,
    selectedOptions?: string[],
    timeTaken?: number
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { error: "Unauthorized" };
        }

        const userId = session.user.id;

        // If we have a structured questionId, use the LearnQuizAnswer model
        if (questionId) {
            // Check how many attempts exist for this question
            const existingAttempts = await prisma.learnQuizAnswer.count({
                where: { questionId, userId },
            });

            await prisma.learnQuizAnswer.create({
                data: {
                    questionId,
                    userId,
                    selectedOptions: selectedOptions || [String(selectedOption)],
                    isCorrect,
                    attemptNumber: existingAttempts + 1,
                    timeTaken: timeTaken || null,
                },
            });

            // Recalculate quiz score percent for this learn
            // Get all quiz questions for all steps in this learn
            const allQuizQuestions = await prisma.learnQuizQuestion.findMany({
                where: { step: { learnId } },
                select: { id: true },
            });

            if (allQuizQuestions.length > 0) {
                const questionIds = allQuizQuestions.map(q => q.id);
                // Get the LATEST answer for each question by this user
                const latestAnswers = await prisma.learnQuizAnswer.findMany({
                    where: {
                        questionId: { in: questionIds },
                        userId,
                    },
                    orderBy: { answeredAt: 'desc' },
                    distinct: ['questionId'],
                });

                const correctCount = latestAnswers.filter(a => a.isCorrect).length;
                const answeredCount = latestAnswers.length;
                const quizScorePercent = answeredCount > 0
                    ? (correctCount / allQuizQuestions.length) * 100
                    : 0;

                await prisma.learnProgress.upsert({
                    where: { learnId_userId: { learnId, userId } },
                    update: { quizScorePercent },
                    create: { learnId, userId, quizScorePercent },
                });
            }
        } else {
            // Fallback: Legacy JSON-based tracking for old stepData quizzes
            const existing = await prisma.learnProgress.findUnique({
                where: { learnId_userId: { learnId, userId } },
            });

            const quizAnswers = (existing?.quizAnswers as Record<string, any>) || {};
            quizAnswers[stepId] = { selectedOption, isCorrect };

            await prisma.learnProgress.upsert({
                where: { learnId_userId: { learnId, userId } },
                update: { quizAnswers: quizAnswers as Prisma.InputJsonValue },
                create: { learnId, userId, quizAnswers: quizAnswers as Prisma.InputJsonValue },
            });
        }

        return { success: true };
    } catch (error) {
        console.error("Error submitting quiz answer:", error);
        return { error: "Failed to submit answer" };
    }
}

// ═══════════════════════════════════════════════════════
//  CHALLENGE — Structured Submission Tracking
// ═══════════════════════════════════════════════════════

/**
 * Submit a challenge code attempt.
 * Records in LearnChallengeSubmission and updates LearnProgress.
 */
export async function submitChallengeCode(
    learnId: string,
    stepId: string,
    code: string,
    passed: boolean,
    score?: number,
    feedback?: string,
    suggestions?: string[],
    language?: string
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { error: "Unauthorized" };
        }

        const userId = session.user.id;

        // Count existing attempts
        const existingAttempts = await prisma.learnChallengeSubmission.count({
            where: { stepId, userId },
        });

        // Create structured submission
        await prisma.learnChallengeSubmission.create({
            data: {
                stepId,
                userId,
                code,
                language: language || 'go',
                score: score || (passed ? 100 : 0),
                isCorrect: passed,
                feedback: feedback || null,
                suggestions: suggestions || [],
                attemptNumber: existingAttempts + 1,
            },
        });

        // Update LearnProgress with challenge stats
        const bestSubmission = await prisma.learnChallengeSubmission.findFirst({
            where: { stepId, userId },
            orderBy: { score: 'desc' },
            select: { score: true },
        });

        // Also keep backward-compatible JSON tracking
        const existing = await prisma.learnProgress.findUnique({
            where: { learnId_userId: { learnId, userId } },
        });

        const challengeSubmissions = (existing?.challengeSubmissions as Record<string, any>) || {};
        challengeSubmissions[stepId] = {
            code, passed, score: score || 0,
            attempts: existingAttempts + 1,
            submittedAt: new Date().toISOString(),
        };

        await prisma.learnProgress.upsert({
            where: { learnId_userId: { learnId, userId } },
            update: {
                challengeSubmissions: challengeSubmissions as Prisma.InputJsonValue,
                challengeBestScore: Math.max(
                    existing?.challengeBestScore || 0,
                    bestSubmission?.score || 0
                ),
                challengeAttempts: (existing?.challengeAttempts || 0) + 1,
            },
            create: {
                learnId,
                userId,
                challengeSubmissions: challengeSubmissions as Prisma.InputJsonValue,
                challengeBestScore: bestSubmission?.score || 0,
                challengeAttempts: 1,
            },
        });

        return { success: true, attemptNumber: existingAttempts + 1 };
    } catch (error) {
        console.error("Error submitting challenge:", error);
        return { error: "Failed to submit challenge" };
    }
}

/**
 * Get all challenge submissions for a specific step by current user.
 */
export async function getChallengeSubmissions(stepId: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { error: "Unauthorized" };
        }

        const submissions = await prisma.learnChallengeSubmission.findMany({
            where: { stepId, userId: session.user.id },
            orderBy: { submittedAt: 'desc' },
        });

        return { submissions };
    } catch (error) {
        console.error("Error fetching challenge submissions:", error);
        return { error: "Failed to fetch submissions" };
    }
}

// ═══════════════════════════════════════════════════════
//  INTERVIEW CARDS — Progress Tracking
// ═══════════════════════════════════════════════════════

/**
 * Submit interview card review results.
 * Updates interviewCardsReviewed & interviewCardsMastered on LearnProgress.
 */
export async function submitInterviewCardReview(
    learnId: string,
    totalReviewed: number,
    totalMastered: number,
    scorePercent: number
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { error: "Unauthorized" };
        }

        const userId = session.user.id;

        const existing = await prisma.learnProgress.findUnique({
            where: { learnId_userId: { learnId, userId } },
        });

        await prisma.learnProgress.upsert({
            where: { learnId_userId: { learnId, userId } },
            update: {
                interviewCardsReviewed: Math.max(
                    existing?.interviewCardsReviewed || 0,
                    totalReviewed
                ),
                interviewCardsMastered: Math.max(
                    existing?.interviewCardsMastered || 0,
                    totalMastered
                ),
            },
            create: {
                learnId,
                userId,
                interviewCardsReviewed: totalReviewed,
                interviewCardsMastered: totalMastered,
            },
        });

        return { success: true };
    } catch (error) {
        console.error("Error submitting interview card review:", error);
        return { error: "Failed to submit review" };
    }
}

// ═══════════════════════════════════════════════════════
//  LEADERBOARD — Score Updates
// ═══════════════════════════════════════════════════════

/**
 * Update leaderboard scores after quiz/challenge/interview completion.
 * Called internally from other actions when a step is completed.
 */
export async function updateLeaderboardScore(
    learnId: string,
    type: 'quiz' | 'challenge' | 'mock' | 'project',
    pointsEarned: number
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { error: "Unauthorized" };
        }

        const userId = session.user.id;

        // Find the subcategory for this learn
        const learn = await prisma.learn.findUnique({
            where: { id: learnId },
            select: { subCategoryId: true },
        });

        if (!learn?.subCategoryId) return { error: "No subcategory" };

        const subCategoryId = learn.subCategoryId;

        // Build update based on type
        const scoreField = `${type}Score` as const;
        const countField = type === 'quiz' ? 'quizzesCompleted'
            : type === 'challenge' ? 'challengesCompleted'
                : type === 'mock' ? 'mocksCompleted'
                    : 'projectsCompleted';

        const existing = await prisma.learnLeaderboard.findUnique({
            where: { subCategoryId_userId: { subCategoryId, userId } },
        });

        const currentScore = existing ? (existing as any)[scoreField] || 0 : 0;
        const currentCount = existing ? (existing as any)[countField] || 0 : 0;
        const newScore = currentScore + pointsEarned;
        const newTotal = (existing?.totalScore || 0) + pointsEarned;

        await prisma.learnLeaderboard.upsert({
            where: { subCategoryId_userId: { subCategoryId, userId } },
            update: {
                [scoreField]: newScore,
                [countField]: currentCount + 1,
                totalScore: newTotal,
            },
            create: {
                subCategoryId,
                userId,
                learnId,
                [scoreField]: pointsEarned,
                [countField]: 1,
                totalScore: pointsEarned,
            },
        });

        return { success: true };
    } catch (error) {
        console.error("Error updating leaderboard:", error);
        return { error: "Failed to update leaderboard" };
    }
}

// ═══════════════════════════════════════════════════════
//  USER STATS
// ═══════════════════════════════════════════════════════

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
        const totalQuizScore = progress.reduce((acc, curr) => acc + (curr.quizScorePercent || 0), 0);
        const totalInterviewCards = progress.reduce((acc, curr) => acc + (curr.interviewCardsMastered || 0), 0);

        return {
            progress,
            stats: {
                completedCount,
                inProgressCount: progress.filter((p: any) => !p.isCompleted && (p.currentStep || 0) > 0).length,
                totalLearns: progress.length,
                currentStreak: 0, // Placeholder
                totalStepsCompleted,
                avgQuizScore: progress.length > 0 ? totalQuizScore / progress.length : 0,
                totalInterviewCardsMastered: totalInterviewCards,
            },
            recentActivity,
        };
    } catch (error) {
        console.error("Error fetching user progress stats:", error);
        return { error: "Failed to fetch progress stats" };
    }
}