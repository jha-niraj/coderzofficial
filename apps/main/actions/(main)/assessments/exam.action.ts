"use server";

import { auth } from '@repo/auth';
import { prisma } from "@repo/prisma";
import { revalidatePath } from "next/cache";
import {
    AssessmentLanguage, AssessmentMode, QuestionDifficulty, AssessmentQuestionType
} from "@prisma/client";

// ==================== TYPES ====================
export type ExamQuestion = {
    id: string;
    type: AssessmentQuestionType;
    difficulty: QuestionDifficulty;
    question: string;
    code: string | null;
    options: string[];
    tags: string[];
    language: AssessmentLanguage;
    mode: AssessmentMode;
    points: number;
};

export type ExamSessionData = {
    attemptId: string;
    examName: string;
    language: AssessmentLanguage;
    difficulty: QuestionDifficulty;
    questions: ExamQuestion[];
    timeLimit: number; // in seconds
    passingScore: number;
    totalPoints: number;
};

export type ExamResult = {
    attemptId: string;
    passed: boolean;
    score: number;
    totalPoints: number;
    percentage: number;
    correctAnswers: number;
    totalQuestions: number;
    timeSpent: number;
    xpEarned: number;
    coinsEarned: number;
    certificateId: string | null;
    breakdown: {
        byDifficulty: {
            easy: { correct: number; total: number };
            intermediate: { correct: number; total: number };
            hard: { correct: number; total: number };
        };
        byType: Record<string, { correct: number; total: number }>;
    };
};

// ==================== AI QUESTION GENERATION ====================

async function generateAIQuestions(params: {
    language: AssessmentLanguage;
    difficulty: QuestionDifficulty;
    mode: AssessmentMode;
    count: number;
}): Promise<ExamQuestion[]> {
    const { language, difficulty, mode, count } = params;

    // For now, fetch from database with random selection
    // In production, this would call OpenAI or similar to generate unique questions
    const questions = await prisma.assessmentQuestion.findMany({
        where: {
            topic: {
                language: language
            },
            difficulty,
            mode,
            isActive: true
        },
        include: {
            topic: {
                select: {
                    language: true
                }
            }
        },
        orderBy: {
            // Randomize by using createdAt as proxy (better would be raw SQL RANDOM())
            createdAt: 'desc'
        }
    });

    // Shuffle for randomness
    const shuffled = questions.sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, count);

    // Assign points based on difficulty and map to ExamQuestion type
    return selected.map(q => ({
        id: q.id,
        type: q.type,
        difficulty: q.difficulty,
        question: q.question,
        code: q.codeSnippet || null,
        options: (q.options as string[]) || [],
        tags: [],
        language: q.topic.language,
        mode: q.mode,
        points: getQuestionPoints(q.difficulty)
    }));
}

function getQuestionPoints(difficulty: QuestionDifficulty): number {
    switch (difficulty) {
        case "EASY": return 5;
        case "INTERMEDIATE": return 10;
        case "HARD": return 15;
        default: return 5;
    }
}

function getExamConfig(difficulty: QuestionDifficulty) {
    switch (difficulty) {
        case "EASY":
            return {
                questionCount: 20,
                timeLimit: 20 * 60, // 20 minutes
                passingScore: 60,
                distribution: { EASY: 15, INTERMEDIATE: 5, HARD: 0 }
            };
        case "INTERMEDIATE":
            return {
                questionCount: 25,
                timeLimit: 30 * 60, // 30 minutes
                passingScore: 65,
                distribution: { EASY: 5, INTERMEDIATE: 15, HARD: 5 }
            };
        case "HARD":
            return {
                questionCount: 30,
                timeLimit: 45 * 60, // 45 minutes
                passingScore: 70,
                distribution: { EASY: 0, INTERMEDIATE: 10, HARD: 20 }
            };
        default:
            return {
                questionCount: 20,
                timeLimit: 20 * 60,
                passingScore: 60,
                distribution: { EASY: 10, INTERMEDIATE: 7, HARD: 3 }
            };
    }
}

// ==================== EXAM SESSION ====================

export async function startExam(params: {
    language: AssessmentLanguage;
    difficulty: QuestionDifficulty;
    mode?: AssessmentMode;
}) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Please log in to start an exam" };
        }

        const { language, difficulty, mode = "MIXED" } = params;
        const config = getExamConfig(difficulty);

        // Check if user has any ongoing exams
        const ongoingExam = await prisma.examAttempt.findFirst({
            where: {
                userId: session.user.id,
                completedAt: null,
                startedAt: {
                    gte: new Date(Date.now() - 2 * 60 * 60 * 1000) // Within last 2 hours
                }
            }
        });

        if (ongoingExam) {
            return {
                success: false,
                error: "You have an ongoing exam. Please complete or abandon it first.",
                attemptId: ongoingExam.id
            };
        }

        // Generate questions for each difficulty level
        let allQuestions: ExamQuestion[] = [];

        if (mode === "MIXED") {
            // Fetch questions from all modes
            const modes: AssessmentMode[] = ["QUIZ", "CODE"];

            for (const m of modes) {
                for (const [diff, count] of Object.entries(config.distribution)) {
                    if (count > 0) {
                        const questions = await generateAIQuestions({
                            language,
                            difficulty: diff as QuestionDifficulty,
                            mode: m,
                            count: Math.ceil(count / modes.length)
                        });
                        allQuestions.push(...questions);
                    }
                }
            }
        } else {
            for (const [diff, count] of Object.entries(config.distribution)) {
                if (count > 0) {
                    const questions = await generateAIQuestions({
                        language,
                        difficulty: diff as QuestionDifficulty,
                        mode,
                        count
                    });
                    allQuestions.push(...questions);
                }
            }
        }

        // Shuffle all questions
        allQuestions = allQuestions.sort(() => Math.random() - 0.5);

        // Take only required count
        allQuestions = allQuestions.slice(0, config.questionCount);

        if (allQuestions.length < 5) {
            return {
                success: false,
                error: "Not enough questions available for this exam configuration"
            };
        }

        // Calculate total points
        const totalPoints = allQuestions.reduce((sum, q) => sum + q.points, 0);

        // Get the topic for this language
        const topic = await prisma.assessmentTopic.findFirst({
            where: { language }
        });

        if (!topic) {
            return {
                success: false,
                error: "Assessment topic not found for this language"
            };
        }

        // Create exam attempt
        const attempt = await prisma.examAttempt.create({
            data: {
                userId: session.user.id,
                topicId: topic.id,
                difficulty,
                mode,
                totalQuestions: allQuestions.length,
                passingScore: config.passingScore,
                timeLimit: config.timeLimit,
                startedAt: new Date()
            }
        });

        const examData: ExamSessionData = {
            attemptId: attempt.id,
            examName: `${language} ${difficulty} Assessment`,
            language,
            difficulty,
            questions: allQuestions,
            timeLimit: config.timeLimit,
            passingScore: config.passingScore,
            totalPoints
        };

        return { success: true, data: examData };
    } catch (error) {
        console.error("Error starting exam:", error);
        return { success: false, error: "Failed to start exam" };
    }
}

export async function submitExamAnswers(params: {
    attemptId: string;
    answers: Array<{
        questionId: string;
        answer: string;
        timeTaken: number;
    }>;
    totalTimeSpent: number;
}) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Please log in to submit exam" };
        }

        const { attemptId, answers, totalTimeSpent } = params;

        // Verify attempt belongs to user and include topic for language
        const attempt = await prisma.examAttempt.findFirst({
            where: {
                id: attemptId,
                userId: session.user.id,
                completedAt: null
            },
            include: {
                topic: {
                    select: {
                        language: true,
                        name: true
                    }
                }
            }
        });

        if (!attempt) {
            return { success: false, error: "Invalid or already completed exam" };
        }

        // Check time limit (with 30 second grace period)
        const elapsed = (Date.now() - attempt.startedAt.getTime()) / 1000;
        if (elapsed > attempt.timeLimit + 30) {
            // Auto-submit with current answers
            console.log("Exam time exceeded, auto-submitting");
        }

        // Get all questions with correct answers
        const questionIds = answers.map(a => a.questionId);
        const questions = await prisma.assessmentQuestion.findMany({
            where: { id: { in: questionIds } }
        });

        const questionMap = new Map(questions.map(q => [q.id, q]));

        // Grade each answer
        let totalScore = 0;
        let correctCount = 0;
        const breakdown = {
            byDifficulty: {
                easy: { correct: 0, total: 0 },
                intermediate: { correct: 0, total: 0 },
                hard: { correct: 0, total: 0 }
            },
            byType: {} as Record<string, { correct: number; total: number }>
        };

        const answersToCreate = answers.map(ans => {
            const question = questionMap.get(ans.questionId);
            if (!question) return null;

            const correctAnswer = question.correctAnswer || '';
            const isCorrect = correctAnswer.toLowerCase().trim() === ans.answer.toLowerCase().trim();
            const points = isCorrect ? getQuestionPoints(question.difficulty) : 0;

            if (isCorrect) {
                correctCount++;
                totalScore += points;
            }

            // Update breakdown
            const diffKey = question.difficulty.toLowerCase() as 'easy' | 'intermediate' | 'hard';
            breakdown.byDifficulty[diffKey].total++;
            if (isCorrect) breakdown.byDifficulty[diffKey].correct++;

            if (!breakdown.byType[question.type]) {
                breakdown.byType[question.type] = { correct: 0, total: 0 };
            }
            breakdown && breakdown.byType[question.type].total++;
            if (isCorrect) breakdown.byType[question.type]?.correct++;

            return {
                attemptId,
                questionId: ans.questionId,
                answer: ans.answer,
                isCorrect,
                pointsEarned: points,
                timeTaken: ans.timeTaken
            };
        }).filter(Boolean);

        // Save all answers
        await prisma.examAnswer.createMany({
            data: answersToCreate as any
        });

        // Calculate total points based on questions
        const totalPoints = questions.reduce((sum, q) => sum + getQuestionPoints(q.difficulty), 0);
        
        // Calculate final results
        const percentage = totalPoints > 0 ? Math.round((totalScore / totalPoints) * 100) : 0;
        const passed = percentage >= attempt.passingScore;

        // Calculate rewards
        const baseXP = passed ? 200 : 50;
        const bonusXP = passed ? Math.round(percentage * 2) : 0;
        const xpEarned = baseXP + bonusXP;

        const baseCoins = passed ? 100 : 20;
        const bonusCoins = passed ? Math.round(percentage) : 0;
        const coinsEarned = baseCoins + bonusCoins;

        // Create certificate if passed
        let certificateId: string | null = null;
        const language = attempt.topic.language;
        
        if (passed) {
            const certNumber = `CERT-${language}-${Date.now().toString(36).toUpperCase()}`;
            const certificate = await prisma.assessmentCertificate.create({
                data: {
                    certificateId: certNumber,
                    userId: session.user.id,
                    topicName: attempt.topic.name,
                    language: language,
                    difficulty: attempt.difficulty,
                    mode: attempt.mode,
                    score: percentage,
                    passingScore: attempt.passingScore,
                    expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year validity
                }
            });
            certificateId = certificate.id;
        }

        // Update attempt with results
        await prisma.examAttempt.update({
            where: { id: attemptId },
            data: {
                completedAt: new Date(),
                score: percentage,
                correctCount: correctCount,
                answeredCount: answers.length,
                passed,
                timeSpent: totalTimeSpent,
                status: 'COMPLETED',
                certificateId
            }
        });

        // Update user stats
        await updateUserExamStats(session.user.id, language, {
            passed,
            percentage,
            xpEarned,
            coinsEarned
        });

        // Update user credits
        await prisma.user.update({
            where: { id: session.user.id },
            data: {
                currentXp: { 
                    increment: coinsEarned 
                },
                totalXp: {
                    increment: coinsEarned
                }
            }
        });

        revalidatePath("/assessments");

        const result: ExamResult = {
            attemptId,
            passed,
            score: totalScore,
            totalPoints: totalPoints,
            percentage,
            correctAnswers: correctCount,
            totalQuestions: attempt.totalQuestions,
            timeSpent: totalTimeSpent,
            xpEarned,
            coinsEarned,
            certificateId,
            breakdown
        };

        return { success: true, data: result };
    } catch (error) {
        console.error("Error submitting exam:", error);
        return { success: false, error: "Failed to submit exam" };
    }
}

async function updateUserExamStats(
    userId: string,
    language: AssessmentLanguage,
    updates: {
        passed: boolean;
        percentage: number;
        xpEarned: number;
        coinsEarned: number;
    }
) {
    const existingStats = await prisma.userAssessmentStats.findFirst({
        where: { userId }
    });

    if (existingStats) {
        // Calculate new average score
        const totalAttempts = existingStats.totalExamAttempts + 1;
        const newAvgScore = ((existingStats.avgExamScore * existingStats.totalExamAttempts) + updates.percentage) / totalAttempts;
        
        await prisma.userAssessmentStats.update({
            where: { id: existingStats.id },
            data: {
                totalExamAttempts: { increment: 1 },
                examsPassed: { increment: updates.passed ? 1 : 0 },
                examsFailed: { increment: updates.passed ? 0 : 1 },
                avgExamScore: newAvgScore,
                certificates: { increment: updates.passed ? 1 : 0 },
                lastActivityAt: new Date()
            }
        });
    } else {
        await prisma.userAssessmentStats.create({
            data: {
                userId,
                totalExamAttempts: 1,
                examsPassed: updates.passed ? 1 : 0,
                examsFailed: updates.passed ? 0 : 1,
                avgExamScore: updates.percentage,
                certificates: updates.passed ? 1 : 0,
                lastActivityAt: new Date()
            }
        });
    }
}

// ==================== EXAM HISTORY & CERTIFICATES ====================

export async function getExamHistory(params?: {
    language?: AssessmentLanguage;
    limit?: number;
}) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Please log in to view history" };
        }

        const { language, limit = 20 } = params || {};

        const whereConditions: any = {
            userId: session.user.id,
            completedAt: { not: null }
        };

        if (language) whereConditions.language = language;

        const attempts = await prisma.examAttempt.findMany({
            where: whereConditions,
            orderBy: { completedAt: "desc" },
            take: limit
        });

        return { success: true, data: attempts };
    } catch (error) {
        console.error("Error fetching exam history:", error);
        return { success: false, error: "Failed to fetch history" };
    }
}

export async function getUserCertificates() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Please log in to view certificates" };
        }

        const certificates = await prisma.assessmentCertificate.findMany({
            where: {
                userId: session.user.id,
                isActive: true
            },
            orderBy: { issuedAt: "desc" }
        });

        return { success: true, data: certificates };
    } catch (error) {
        console.error("Error fetching certificates:", error);
        return { success: false, error: "Failed to fetch certificates" };
    }
}

export async function getCertificateById(certificateId: string) {
    try {
        const certificate = await prisma.assessmentCertificate.findUnique({
            where: { id: certificateId },
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
        });

        if (!certificate) {
            return { success: false, error: "Certificate not found" };
        }

        return { success: true, data: certificate };
    } catch (error) {
        console.error("Error fetching certificate:", error);
        return { success: false, error: "Failed to fetch certificate" };
    }
}

export async function verifyCertificate(certNumber: string) {
    try {
        const certificate = await prisma.assessmentCertificate.findUnique({
            where: { certificateId: certNumber },
            include: {
                user: {
                    select: {
                        name: true,
                        username: true
                    }
                }
            }
        });

        if (!certificate) {
            return {
                success: false,
                verified: false,
                error: "Certificate not found"
            };
        }

        if (!certificate.isActive) {
            return {
                success: true,
                verified: false,
                error: "This certificate has been revoked"
            };
        }

        if (certificate.expiresAt && certificate.expiresAt < new Date()) {
            return {
                success: true,
                verified: false,
                error: "This certificate has expired"
            };
        }

        return {
            success: true,
            verified: true,
            data: {
                holderName: certificate.user.name,
                holderUsername: certificate.user.username,
                language: certificate.language,
                difficulty: certificate.difficulty,
                score: certificate.score,
                issuedAt: certificate.issuedAt,
                expiresAt: certificate.expiresAt
            }
        };
    } catch (error) {
        console.error("Error verifying certificate:", error);
        return { success: false, verified: false, error: "Failed to verify certificate" };
    }
}

// ==================== LEADERBOARD ====================

export async function getExamLeaderboard(params?: {
    language?: AssessmentLanguage;
    difficulty?: QuestionDifficulty;
    limit?: number;
}) {
    try {
        const { language, difficulty, limit = 50 } = params || {};

        const whereConditions: any = {
            passed: true,
            completedAt: { not: null }
        };

        if (language) whereConditions.topic = { language };
        if (difficulty) whereConditions.difficulty = difficulty;

        const topAttempts = await prisma.examAttempt.findMany({
            where: whereConditions,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        image: true
                    }
                },
                topic: {
                    select: {
                        language: true,
                        name: true
                    }
                }
            },
            orderBy: [
                { score: "desc" },
                { timeSpent: "asc" }
            ],
            take: limit,
            distinct: ["userId"] // One entry per user (best score)
        });

        return {
            success: true,
            data: topAttempts.map((attempt, index) => ({
                rank: index + 1,
                user: attempt.user,
                language: attempt.topic.language,
                difficulty: attempt.difficulty,
                score: attempt.score,
                timeSpent: attempt.timeSpent,
                completedAt: attempt.completedAt
            }))
        };
    } catch (error) {
        console.error("Error fetching leaderboard:", error);
        return { success: false, error: "Failed to fetch leaderboard" };
    }
}

// ==================== EXAM RECOVERY ====================

export async function getOngoingExam() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Not authenticated" };
        }

        const ongoingExam = await prisma.examAttempt.findFirst({
            where: {
                userId: session.user.id,
                completedAt: null,
                startedAt: {
                    gte: new Date(Date.now() - 2 * 60 * 60 * 1000)
                }
            }
        });

        if (!ongoingExam) {
            return { success: true, data: null };
        }

        // Get saved answers
        const savedAnswers = await prisma.examAnswer.findMany({
            where: { attemptId: ongoingExam.id }
        });

        // Check if time has expired
        const elapsed = (Date.now() - ongoingExam.startedAt.getTime()) / 1000;
        if (elapsed > ongoingExam.timeLimit) {
            return {
                success: true,
                data: {
                    expired: true,
                    attemptId: ongoingExam.id,
                    savedAnswers
                }
            };
        }

        return {
            success: true,
            data: {
                expired: false,
                attempt: ongoingExam,
                savedAnswers,
                timeRemaining: Math.max(0, ongoingExam.timeLimit - elapsed)
            }
        };
    } catch (error) {
        console.error("Error getting ongoing exam:", error);
        return { success: false, error: "Failed to get ongoing exam" };
    }
}

export async function abandonExam(attemptId: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Not authenticated" };
        }

        const attempt = await prisma.examAttempt.findFirst({
            where: {
                id: attemptId,
                userId: session.user.id,
                completedAt: null
            }
        });

        if (!attempt) {
            return { success: false, error: "No ongoing exam found" };
        }

        await prisma.examAttempt.update({
            where: { id: attemptId },
            data: {
                completedAt: new Date(),
                status: 'ABANDONED',
                score: 0,
                passed: false
            }
        });

        revalidatePath("/assessments");

        return { success: true };
    } catch (error) {
        console.error("Error abandoning exam:", error);
        return { success: false, error: "Failed to abandon exam" };
    }
}
