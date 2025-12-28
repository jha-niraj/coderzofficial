"use server";

import { auth } from '@repo/auth';
import { prisma } from "@repo/prisma";
import { revalidatePath } from "next/cache";
import {
    AssessmentLanguage, AssessmentMode, QuestionDifficulty, AssessmentQuestionType
} from "@repo/prisma/client";

// ==================== TYPES ====================
export type PracticeQuestion = {
    id: string;
    type: AssessmentQuestionType;
    difficulty: QuestionDifficulty;
    question: string;
    code: string | null;
    options: string[];
    explanation: string | null;
    hints: string[];
    tags: string[];
    language: AssessmentLanguage;
    mode: AssessmentMode;
};

export type SubModuleWithProgress = {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    order: number;
    questionCount: number;
    completedCount: number;
    accuracyRate: number;
    isUnlocked: boolean;
};

export type TopicWithSubModules = {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    language: AssessmentLanguage;
    icon: string | null;
    questionCount: number;
    subModules: SubModuleWithProgress[];
    overallProgress: number;
};

export type PracticeSessionResult = {
    attemptId: string;
    totalQuestions: number;
    correctAnswers: number;
    score: number;
    timeSpent: number;
    accuracy: number;
    xpEarned: number;
    coinsEarned: number;
    streakBonus: number;
};

// ==================== TOPIC QUERIES ====================

export async function getTopicsByLanguage(language: AssessmentLanguage) {
    try {
        const session = await auth();
        const userId = session?.user?.id;

        const topics = await prisma.assessmentTopic.findMany({
            where: { language },
            include: {
                subModules: {
                    orderBy: { orderIndex: "asc" },
                    include: {
                        _count: {
                            select: { questions: true }
                        }
                    }
                },
                _count: {
                    select: { questions: true }
                }
            },
            orderBy: { name: "asc" }
        });

        // Get user progress if logged in
        const userProgress: Record<string, { completed: number; accuracy: number }> = {};

        if (userId) {
            const attempts = await prisma.practiceAttempt.findMany({
                where: { userId },
                include: {
                    answers: true,
                    subModule: true
                }
            });

            // Calculate progress per sub-module
            for (const attempt of attempts) {
                if (!attempt.subModuleId) continue;

                const key = attempt.subModuleId;
                if (!userProgress[key]) {
                    userProgress[key] = { completed: 0, accuracy: 0 };
                }

                userProgress[key].completed += attempt.correctCount;
                userProgress[key].accuracy = attempt.score || 0;
            }
        }

        const topicsWithProgress: TopicWithSubModules[] = topics.map((topic, topicIdx) => {
            let totalCompleted = 0;
            let totalQuestions = 0;

            const subModules: SubModuleWithProgress[] = topic.subModules.map((sub, idx) => {
                const progress = userProgress[sub.id] || { completed: 0, accuracy: 0 };
                totalCompleted += progress.completed;
                totalQuestions += sub._count.questions;

                // Check if previous submodule is completed to determine unlock status
                const prevSubModuleId = idx > 0 ? topic.subModules[idx - 1]?.id : undefined;
                const isPrevCompleted = prevSubModuleId ? (userProgress[prevSubModuleId]?.completed || 0) > 0 : false;

                return {
                    id: sub.id,
                    name: sub.name,
                    slug: sub.slug,
                    description: sub.description,
                    order: sub.orderIndex,
                    questionCount: sub._count.questions,
                    completedCount: progress.completed,
                    accuracyRate: progress.accuracy,
                    // First sub-module is always unlocked, or if previous is completed
                    isUnlocked: idx === 0 || isPrevCompleted
                };
            });

            return {
                id: topic.id,
                name: topic.name,
                slug: topic.slug,
                description: topic.description,
                language: topic.language,
                icon: topic.icon,
                questionCount: topic._count.questions,
                subModules,
                overallProgress: totalQuestions > 0 ? Math.round((totalCompleted / totalQuestions) * 100) : 0
            };
        });

        return { success: true, data: topicsWithProgress };
    } catch (error) {
        console.error("Error fetching topics:", error);
        return { success: false, error: "Failed to fetch topics" };
    }
}

export async function getAllLanguagesOverview() {
    try {
        const session = await auth();
        const userId = session?.user?.id;

        const languages = Object.values(AssessmentLanguage);
        const overview = await Promise.all(
            languages.map(async (language) => {
                const topicCount = await prisma.assessmentTopic.count({
                    where: { language }
                });

                const questionCount = await prisma.assessmentQuestion.count({
                    where: { topic: { language } }
                });

                let completedCount = 0;
                let accuracy = 0;

                if (userId) {
                    const stats = await prisma.userAssessmentStats.findUnique({
                        where: { userId }
                    });

                    if (stats) {
                        completedCount = stats.totalPracticeAttempts;
                        accuracy = stats.avgPracticeScore;
                    }
                }

                return {
                    language,
                    topicCount,
                    questionCount,
                    completedCount,
                    accuracy,
                    progress: questionCount > 0 ? Math.round((completedCount / questionCount) * 100) : 0
                };
            })
        );

        return { success: true, data: overview };
    } catch (error) {
        console.error("Error fetching languages overview:", error);
        return { success: false, error: "Failed to fetch overview" };
    }
}

// ==================== PRACTICE SESSION ====================

export async function startPracticeSession(params: {
    language: AssessmentLanguage;
    mode: AssessmentMode;
    difficulty?: QuestionDifficulty;
    subModuleId?: string;
    questionCount?: number;
}) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Please log in to start practice" };
        }

        const { language, mode, difficulty, subModuleId, questionCount = 10 } = params;

        // Get topic for this language
        const topic = await prisma.assessmentTopic.findFirst({
            where: { language }
        });

        if (!topic) {
            return { success: false, error: "No topic found for this language" };
        }

        // Build query conditions
        const whereConditions: any = {
            topic: { language },
            mode,
            isActive: true
        };

        if (difficulty) {
            whereConditions.difficulty = difficulty;
        }

        if (subModuleId) {
            whereConditions.subModuleId = subModuleId;
        }

        // Fetch random questions
        const allQuestions = await prisma.assessmentQuestion.findMany({
            where: whereConditions,
            select: {
                id: true,
                type: true,
                difficulty: true,
                question: true,
                codeSnippet: true,
                options: true,
                answerExplanation: true,
                hints: true,
                mode: true,
                topic: { select: { language: true } }
            }
        });

        // Shuffle and take required count
        const shuffled = allQuestions.sort(() => Math.random() - 0.5);
        const questions = shuffled.slice(0, Math.min(questionCount, shuffled.length));

        if (questions.length === 0) {
            return { success: false, error: "No questions available for this selection" };
        }

        // Create practice attempt record
        const attempt = await prisma.practiceAttempt.create({
            data: {
                userId: session.user.id,
                topicId: topic.id,
                mode,
                difficulty: difficulty || null,
                subModuleId: subModuleId || null,
                totalQuestions: questions.length
            }
        });

        // Format questions (hide correct answer)
        const formattedQuestions: PracticeQuestion[] = questions.map(q => ({
            id: q.id,
            type: q.type,
            difficulty: q.difficulty,
            question: q.question,
            code: q.codeSnippet,
            options: (q.options as string[]) || [],
            explanation: null, // Hidden until answered
            hints: (q.hints as string[]) || [],
            tags: [],
            language: q.topic.language,
            mode: q.mode
        }));

        return {
            success: true,
            data: {
                attemptId: attempt.id,
                questions: formattedQuestions
            }
        };
    } catch (error) {
        console.error("Error starting practice:", error);
        return { success: false, error: "Failed to start practice session" };
    }
}

export async function submitPracticeAnswer(params: {
    attemptId: string;
    questionId: string;
    answer: string;
    timeTaken: number;
}) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Please log in to submit answer" };
        }

        const { attemptId, questionId, answer, timeTaken } = params;

        // Verify attempt belongs to user
        const attempt = await prisma.practiceAttempt.findFirst({
            where: { id: attemptId, userId: session.user.id }
        });

        if (!attempt) {
            return { success: false, error: "Invalid practice attempt" };
        }

        // Get the question with correct answer
        const question = await prisma.assessmentQuestion.findUnique({
            where: { id: questionId }
        });

        if (!question) {
            return { success: false, error: "Question not found" };
        }

        // Check if answer is correct (handle null correctAnswer)
        const correctAns = question.correctAnswer || "";
        const isCorrect = correctAns.toLowerCase().trim() === answer.toLowerCase().trim();

        // Save the answer
        await prisma.practiceAnswer.create({
            data: {
                attemptId,
                questionId,
                selectedOption: answer,
                isCorrect,
                timeSpent: timeTaken
            }
        });

        // Update attempt stats
        await prisma.practiceAttempt.update({
            where: { id: attemptId },
            data: {
                correctCount: { increment: isCorrect ? 1 : 0 },
                answeredCount: { increment: 1 }
            }
        });

        return {
            success: true,
            data: {
                isCorrect,
                correctAnswer: question.correctAnswer,
                explanation: question.answerExplanation
            }
        };
    } catch (error) {
        console.error("Error submitting answer:", error);
        return { success: false, error: "Failed to submit answer" };
    }
}

export async function completePracticeSession(params: {
    attemptId: string;
    totalTimeSpent: number;
}) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Please log in to complete practice" };
        }

        const { attemptId, totalTimeSpent } = params;

        // Get the attempt
        const attempt = await prisma.practiceAttempt.findFirst({
            where: { id: attemptId, userId: session.user.id },
            include: { answers: true, topic: true }
        });

        if (!attempt) {
            return { success: false, error: "Invalid practice attempt" };
        }

        // Calculate results
        const accuracy = attempt.totalQuestions > 0
            ? Math.round((attempt.correctCount / attempt.totalQuestions) * 100)
            : 0;

        const totalScore = Math.round(
            (attempt.correctCount * 10) +
            (accuracy >= 80 ? 20 : accuracy >= 60 ? 10 : 0) +
            Math.max(0, 30 - Math.floor(totalTimeSpent / 60)) // Time bonus
        );

        // Calculate XP and coins
        const xpEarned = Math.round(
            (attempt.correctCount * 5) +
            (accuracy >= 90 ? 50 : accuracy >= 70 ? 25 : 10)
        );

        const coinsEarned = Math.round(
            (attempt.correctCount * 2) +
            (accuracy >= 90 ? 20 : accuracy >= 70 ? 10 : 5)
        );

        // Update attempt with final results
        await prisma.practiceAttempt.update({
            where: { id: attemptId },
            data: {
                completedAt: new Date(),
                score: accuracy,
                timeSpent: totalTimeSpent,
                status: 'COMPLETED'
            }
        });

        // Update user stats
        await updateUserAssessmentStats(session.user.id, attempt.topic.language, {
            practiceCompleted: 1,
            totalQuestions: attempt.totalQuestions,
            correctAnswers: attempt.correctCount,
            accuracy,
            xpEarned,
            coinsEarned
        });

        revalidatePath("/assessments");

        const result: PracticeSessionResult = {
            attemptId,
            totalQuestions: attempt.totalQuestions,
            correctAnswers: attempt.correctCount,
            score: totalScore,
            timeSpent: totalTimeSpent,
            accuracy,
            xpEarned,
            coinsEarned,
            streakBonus: 0
        };

        return { success: true, data: result };
    } catch (error) {
        console.error("Error completing practice:", error);
        return { success: false, error: "Failed to complete practice session" };
    }
}

// ==================== HELPER FUNCTIONS ====================

async function updateUserAssessmentStats(
    userId: string,
    language: AssessmentLanguage,
    updates: {
        practiceCompleted?: number;
        totalQuestions?: number;
        correctAnswers?: number;
        accuracy?: number;
        xpEarned?: number;
        coinsEarned?: number;
    }
) {
    const existingStats = await prisma.userAssessmentStats.findUnique({
        where: { userId }
    });

    if (existingStats) {
        // Update existing stats
        const newTotalQuestions = existingStats.practiceQuestionsAnswered + (updates.totalQuestions || 0);
        const newCorrectAnswers = existingStats.practiceCorrectAnswers + (updates.correctAnswers || 0);
        const newAccuracy = newTotalQuestions > 0
            ? Math.round((newCorrectAnswers / newTotalQuestions) * 100)
            : 0;

        await prisma.userAssessmentStats.update({
            where: { id: existingStats.id },
            data: {
                totalPracticeAttempts: { increment: updates.practiceCompleted || 0 },
                practiceQuestionsAnswered: newTotalQuestions,
                practiceCorrectAnswers: newCorrectAnswers,
                avgPracticeScore: newAccuracy,
                lastActivityAt: new Date()
            }
        });
    } else {
        // Create new stats
        await prisma.userAssessmentStats.create({
            data: {
                userId,
                totalPracticeAttempts: updates.practiceCompleted || 0,
                practiceQuestionsAnswered: updates.totalQuestions || 0,
                practiceCorrectAnswers: updates.correctAnswers || 0,
                avgPracticeScore: updates.accuracy || 0,
                lastActivityAt: new Date()
            }
        });
    }
}

// ==================== QUESTION MANAGEMENT ====================

export async function getQuestionsBySubModule(subModuleId: string, mode: AssessmentMode) {
    try {
        const questions = await prisma.assessmentQuestion.findMany({
            where: {
                subModuleId,
                mode,
                isActive: true
            },
            select: {
                id: true,
                type: true,
                difficulty: true,
                question: true,
                codeSnippet: true,
                options: true,
                hints: true,
                mode: true,
                topic: { select: { language: true } }
            },
            orderBy: [
                { difficulty: "asc" },
                { createdAt: "desc" }
            ]
        });

        return { success: true, data: questions };
    } catch (error) {
        console.error("Error fetching questions:", error);
        return { success: false, error: "Failed to fetch questions" };
    }
}

export async function getPracticeHistory(params?: {
    language?: AssessmentLanguage;
    mode?: AssessmentMode;
    limit?: number;
}) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Please log in to view history" };
        }

        const { language, mode, limit = 20 } = params || {};

        const whereConditions: any = {
            userId: session.user.id,
            completedAt: { not: null }
        };

        if (language) whereConditions.language = language;
        if (mode) whereConditions.mode = mode;

        const attempts = await prisma.practiceAttempt.findMany({
            where: whereConditions,
            include: {
                subModule: {
                    select: { name: true, slug: true }
                }
            },
            orderBy: { completedAt: "desc" },
            take: limit
        });

        return { success: true, data: attempts };
    } catch (error) {
        console.error("Error fetching practice history:", error);
        return { success: false, error: "Failed to fetch history" };
    }
}

export async function getUserAssessmentStats() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Please log in to view stats" };
        }

        const stats = await prisma.userAssessmentStats.findUnique({
            where: { userId: session.user.id }
        });

        if (!stats) {
            return {
                success: true,
                data: {
                    totals: {
                        totalPractice: 0,
                        totalExams: 0,
                        totalQuestions: 0,
                        totalCorrect: 0,
                        overallAccuracy: 0
                    }
                }
            };
        }

        const overallAccuracy = stats.practiceQuestionsAnswered > 0
            ? Math.round((stats.practiceCorrectAnswers / stats.practiceQuestionsAnswered) * 100)
            : 0;

        return {
            success: true,
            data: {
                totals: {
                    totalPractice: stats.totalPracticeAttempts,
                    totalExams: stats.totalExamAttempts,
                    totalQuestions: stats.practiceQuestionsAnswered,
                    totalCorrect: stats.practiceCorrectAnswers,
                    overallAccuracy
                }
            }
        };
    } catch (error) {
        console.error("Error fetching user stats:", error);
        return { success: false, error: "Failed to fetch stats" };
    }
}
