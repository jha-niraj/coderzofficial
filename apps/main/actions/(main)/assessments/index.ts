"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
    AssessmentLanguage,
    AssessmentMode,
    QuestionDifficulty,
    AssessmentQuestionType
} from "@prisma/client";

// ==================== RE-EXPORTS ====================
// Export types and functions from practice and exam actions
export * from "./practice.action";
export * from "./exam.action";
export * from "./user-sets.action";

// ==================== COMBINED DASHBOARD STATS ====================

export type DashboardStats = {
    overview: {
        totalPractice: number;
        totalExams: number;
        totalQuestions: number;
        totalCorrect: number;
        overallAccuracy: number;
        totalXP: number;
        totalCoins: number;
        currentStreak: number;
        longestStreak: number;
        certificatesEarned: number;
    };
    recentActivity: Array<{
        type: "practice" | "exam";
        id: string;
        language: AssessmentLanguage;
        mode?: AssessmentMode;
        difficulty?: QuestionDifficulty;
        score: number;
        passed?: boolean;
        completedAt: Date;
    }>;
    languageProgress: Array<{
        language: AssessmentLanguage;
        practiceCompleted: number;
        examsCompleted: number;
        examsPassed: number;
        accuracy: number;
        highestScore: number;
        totalXP: number;
    }>;
    achievements: Array<{
        id: string;
        name: string;
        description: string;
        icon: string;
        unlockedAt: Date | null;
        progress: number;
        target: number;
    }>;
};

export async function getAssessmentDashboard() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Please log in to view dashboard" };
        }

        const userId = session.user.id;

        // Get user stats (one per user now, not per language)
        const stats = await prisma.userAssessmentStats.findUnique({
            where: { userId }
        });

        // Calculate totals
        const totals = stats ? {
            totalPractice: stats.totalPracticeAttempts,
            totalExams: stats.totalExamAttempts,
            totalQuestions: stats.practiceQuestionsAnswered,
            totalCorrect: stats.practiceCorrectAnswers,
            totalXP: 0, // XP stored on user now
            totalCoins: 0, // Coins stored on user now
            examsPassed: stats.examsPassed
        } : { totalPractice: 0, totalExams: 0, totalQuestions: 0, totalCorrect: 0, totalXP: 0, totalCoins: 0, examsPassed: 0 };

        // Get certificates count
        const certificatesCount = await prisma.assessmentCertificate.count({
            where: { userId, isActive: true }
        });

        // Get recent practice attempts
        const recentPractice = await prisma.practiceAttempt.findMany({
            where: { userId, completedAt: { not: null } },
            include: { topic: { select: { language: true } } },
            orderBy: { completedAt: "desc" },
            take: 5
        });

        // Get recent exam attempts
        const recentExams = await prisma.examAttempt.findMany({
            where: { userId, completedAt: { not: null } },
            include: { topic: { select: { language: true } } },
            orderBy: { completedAt: "desc" },
            take: 5
        });

        // Combine and sort recent activity
        const recentActivity = [
            ...recentPractice.map(p => ({
                type: "practice" as const,
                id: p.id,
                language: p.topic.language,
                mode: p.mode,
                difficulty: p.difficulty || undefined,
                score: p.score || 0,
                completedAt: p.completedAt!
            })),
            ...recentExams.map(e => ({
                type: "exam" as const,
                id: e.id,
                language: e.topic.language,
                difficulty: e.difficulty,
                score: e.score || 0,
                passed: e.passed ?? undefined,
                completedAt: e.completedAt!
            }))
        ].sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime()).slice(0, 10);

    // Language progress - now derived from topic progress JSON or exam attempts
    const languageProgress = stats?.topicProgress 
      ? Object.entries(stats.topicProgress as Record<string, any>).map(([_, data]) => ({
          language: data.language,
          practiceCompleted: data.practiced || 0,
          examsCompleted: data.examsTaken || 0,
          examsPassed: data.examsPassed || 0,
          accuracy: data.avgScore || 0,
          highestScore: data.highestScore || 0,
          totalXP: 0
        }))
      : [];        // Define achievements
        const achievements = await calculateAchievements(userId, totals);

        const dashboard: DashboardStats = {
            overview: {
                totalPractice: totals.totalPractice,
                totalExams: totals.totalExams,
                totalQuestions: totals.totalQuestions,
                totalCorrect: totals.totalCorrect,
                overallAccuracy: totals.totalQuestions > 0
                    ? Math.round((totals.totalCorrect / totals.totalQuestions) * 100)
                    : 0,
                totalXP: totals.totalXP,
                totalCoins: totals.totalCoins,
                currentStreak: 0, // TODO: Implement streak tracking
                longestStreak: 0,
                certificatesEarned: certificatesCount
            },
            recentActivity,
            languageProgress,
            achievements
        };

        return { success: true, data: dashboard };
    } catch (error) {
        console.error("Error fetching dashboard:", error);
        return { success: false, error: "Failed to fetch dashboard" };
    }
}

async function calculateAchievements(userId: string, totals: any) {
    const achievements = [
        {
            id: "first-practice",
            name: "First Steps",
            description: "Complete your first practice session",
            icon: "🎯",
            target: 1,
            check: totals.totalPractice >= 1
        },
        {
            id: "practice-warrior",
            name: "Practice Warrior",
            description: "Complete 50 practice sessions",
            icon: "⚔️",
            target: 50,
            check: totals.totalPractice >= 50
        },
        {
            id: "first-exam",
            name: "Exam Taker",
            description: "Take your first exam",
            icon: "📝",
            target: 1,
            check: totals.totalExams >= 1
        },
        {
            id: "certified",
            name: "Certified Developer",
            description: "Pass an exam and earn a certificate",
            icon: "🏆",
            target: 1,
            check: totals.examsPassed >= 1
        },
        {
            id: "question-master",
            name: "Question Master",
            description: "Answer 500 questions",
            icon: "❓",
            target: 500,
            check: totals.totalQuestions >= 500
        },
        {
            id: "accuracy-king",
            name: "Accuracy King",
            description: "Maintain 90%+ accuracy across 100 questions",
            icon: "🎯",
            target: 100,
            check: totals.totalQuestions >= 100 && (totals.totalCorrect / totals.totalQuestions) >= 0.9
        },
        {
            id: "xp-hunter",
            name: "XP Hunter",
            description: "Earn 5000 XP from assessments",
            icon: "⭐",
            target: 5000,
            check: totals.totalXP >= 5000
        },
        {
            id: "coin-collector",
            name: "Coin Collector",
            description: "Earn 2000 coins from assessments",
            icon: "💰",
            target: 2000,
            check: totals.totalCoins >= 2000
        }
    ];

    return achievements.map(a => ({
        id: a.id,
        name: a.name,
        description: a.description,
        icon: a.icon,
        unlockedAt: a.check ? new Date() : null,
        progress: getAchievementProgress(a.id, totals),
        target: a.target
    }));
}

function getAchievementProgress(achievementId: string, totals: any): number {
    switch (achievementId) {
        case "first-practice":
        case "practice-warrior":
            return Math.min(totals.totalPractice, 50);
        case "first-exam":
            return Math.min(totals.totalExams, 1);
        case "certified":
            return Math.min(totals.examsPassed, 1);
        case "question-master":
            return Math.min(totals.totalQuestions, 500);
        case "accuracy-king":
            return Math.min(totals.totalQuestions, 100);
        case "xp-hunter":
            return Math.min(totals.totalXP, 5000);
        case "coin-collector":
            return Math.min(totals.totalCoins, 2000);
        default:
            return 0;
    }
}

// ==================== SEARCH & FILTERS ====================

export async function searchQuestions(params: {
    query: string;
    language?: AssessmentLanguage;
    mode?: AssessmentMode;
    difficulty?: QuestionDifficulty;
    type?: AssessmentQuestionType;
    limit?: number;
}) {
    try {
        const { query, language, mode, difficulty, type, limit = 20 } = params;

        const whereConditions: any = {
            isActive: true,
            OR: [
                { question: { contains: query, mode: "insensitive" } },
                { tags: { has: query.toLowerCase() } }
            ]
        };

        if (language) whereConditions.language = language;
        if (mode) whereConditions.mode = mode;
        if (difficulty) whereConditions.difficulty = difficulty;
        if (type) whereConditions.type = type;

        const questions = await prisma.assessmentQuestion.findMany({
            where: whereConditions,
            select: {
                id: true,
                type: true,
                difficulty: true,
                question: true,
                mode: true,
                topic: { select: { name: true, language: true } },
                subModule: { select: { name: true } }
            },
            take: limit
        });

        return { success: true, data: questions };
    } catch (error) {
        console.error("Error searching questions:", error);
        return { success: false, error: "Failed to search questions" };
    }
}

// ==================== STATISTICS ====================

export async function getGlobalStats() {
    try {
        const [
            totalUsers,
            totalQuestions,
            totalAttempts,
            totalCertificates
        ] = await Promise.all([
            prisma.userAssessmentStats.count(),
            prisma.assessmentQuestion.count({ where: { isActive: true } }),
            prisma.examAttempt.count({ where: { completedAt: { not: null } } }),
            prisma.assessmentCertificate.count({ where: { isActive: true } })
        ]);

        // Get language distribution from topics
        const topicStats = await prisma.assessmentTopic.findMany({
            select: {
                language: true,
                _count: { select: { questions: true } }
            }
        });

        // Get mode distribution
        const modeStats = await prisma.assessmentQuestion.groupBy({
            by: ["mode"],
            _count: { id: true }
        });

        return {
            success: true,
            data: {
                totalUsers,
                totalQuestions,
                totalAttempts,
                totalCertificates,
                languageDistribution: topicStats.map(s => ({
                    language: s.language,
                    count: s._count.questions
                })),
                modeDistribution: modeStats.map(s => ({
                    mode: s.mode,
                    count: s._count?.id || 0
                }))
            }
        };
    } catch (error) {
        console.error("Error fetching global stats:", error);
        return { success: false, error: "Failed to fetch stats" };
    }
}

// ==================== LANGUAGE HELPERS ====================

export function getLanguageIcon(language: AssessmentLanguage): string {
    const icons: Record<AssessmentLanguage, string> = {
        JAVASCRIPT: "🟨",
        PYTHON: "🐍",
        C: "🔷",
        CPP: "🔶",
        REACTJS: "⚛️",
        TYPESCRIPT: "�",
        JAVA: "☕",
        GO: "🐹",
        RUST: "🦀"
    };
    return icons[language] || "📚";
}

export function getLanguageColor(language: AssessmentLanguage): string {
    const colors: Record<AssessmentLanguage, string> = {
        JAVASCRIPT: "#f7df1e",
        PYTHON: "#3776ab",
        C: "#00599c",
        CPP: "#f34b7d",
        REACTJS: "#61dafb",
        TYPESCRIPT: "#3178c6",
        JAVA: "#007396",
        GO: "#00add8",
        RUST: "#dea584"
    };
    return colors[language] || "#6b7280";
}

export function getModeIcon(mode: AssessmentMode): string {
    const icons: Record<AssessmentMode, string> = {
        QUIZ: "📝",
        CODE: "💻",
        MOCK: "🎭",
        MIXED: "🎯"
    };
    return icons[mode] || "📚";
}

export function getDifficultyColor(difficulty: QuestionDifficulty): string {
    const colors: Record<QuestionDifficulty, string> = {
        EASY: "#22c55e",
        INTERMEDIATE: "#f59e0b",
        HARD: "#ef4444"
    };
    return colors[difficulty] || "#6b7280";
}
