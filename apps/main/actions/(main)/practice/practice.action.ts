"use server";

import { prisma } from "@repo/prisma";
import { 
    PracticeModule, PracticeSessionStatus 
} from "@repo/prisma/client";
import { auth } from "@repo/auth";
import type {
    PracticeProblemListItem, PracticeProblemDetail, PracticeCategory, 
    PracticeProgressData, PracticeLeaderboardEntry, PracticeUserStats, 
    PracticeRecentSession, PracticeSessionData, PracticeChatMessage,
} from "@/types/practice";
import { MODULE_CONFIG } from "@/types/practice";

// ─────────────────────────────────────────────
// PROBLEMS
// ─────────────────────────────────────────────

export async function getProblemsForModule(
    module: PracticeModule,
    category?: string
): Promise<PracticeProblemListItem[]> {
    const session = await auth();
    const userId = session?.user?.id;

    const problems = await prisma.practiceProblem.findMany({
        where: {
            module,
            isActive: true,
            ...(category ? { category } : {}),
        },
        orderBy: [{ category: "asc" }, { sortOrder: "asc" }],
        select: {
            id: true,
            slug: true,
            title: true,
            module: true,
            category: true,
            difficulty: true,
            tags: true,
            sortOrder: true,
            ...(userId
                ? {
                    sessions: {
                        where: { userId },
                        select: { status: true, bestScore: true },
                        take: 1,
                    },
                }
                : {}),
        },
    });

    return problems.map((p) => {
        const userSession = "sessions" in p && Array.isArray(p.sessions) && p.sessions.length > 0
            ? p.sessions[0]
            : null;
        return {
            id: p.id,
            slug: p.slug,
            title: p.title,
            module: p.module,
            category: p.category,
            difficulty: p.difficulty,
            tags: p.tags,
            sortOrder: p.sortOrder,
            userStatus: (userSession?.status as PracticeSessionStatus) ?? undefined,
            userBestScore: userSession?.bestScore ?? undefined,
        };
    });
}

export async function getProblemBySlug(slug: string): Promise<PracticeProblemDetail | null> {
    const problem = await prisma.practiceProblem.findUnique({
        where: { slug },
        select: {
            id: true,
            slug: true,
            title: true,
            description: true,
            module: true,
            category: true,
            difficulty: true,
            requirements: true,
            hints: true,
            starterCode: true,
            starterCss: true,
            testCases: true,
            tags: true,
        },
    });

    if (!problem) return null;

    return {
        ...problem,
        testCases: problem.testCases as PracticeProblemDetail["testCases"],
    };
}

// ─────────────────────────────────────────────
// CATEGORIES (derived from problems)
// ─────────────────────────────────────────────

export async function getCategoriesForModule(module: PracticeModule): Promise<PracticeCategory[]> {
    const session = await auth();
    const userId = session?.user?.id;

    const problems = await prisma.practiceProblem.findMany({
        where: { module, isActive: true },
        select: {
            category: true,
            ...(userId
                ? {
                    sessions: {
                        where: { userId },
                        select: { status: true },
                        take: 1,
                    },
                }
                : {}),
        },
    });

    const categoryMap = new Map<string, { total: number; completed: number; inProgress: number }>();

    for (const p of problems) {
        const cat = p.category;
        if (!categoryMap.has(cat)) {
            categoryMap.set(cat, { total: 0, completed: 0, inProgress: 0 });
        }
        const entry = categoryMap.get(cat)!;
        entry.total++;

        if ("sessions" in p && Array.isArray(p.sessions) && p.sessions.length > 0) {
            const status = p.sessions[0]?.status;
            if (status === "COMPLETED") entry.completed++;
            else if (status === "IN_PROGRESS") entry.inProgress++;
        }
    }

    const categories = MODULE_CONFIG[module]?.categories ?? {};

    return Array.from(categoryMap.entries()).map(([slug, data]) => ({
        slug,
        name: categories[slug]?.name ?? slug,
        icon: categories[slug]?.icon ?? "📁",
        problemCount: data.total,
        completedCount: data.completed,
        inProgressCount: data.inProgress,
    }));
}

// ─────────────────────────────────────────────
// SESSIONS
// ─────────────────────────────────────────────

export async function getOrCreateSession(
    problemSlug: string,
    mode: "EXAM" | "ASSIST"
): Promise<PracticeSessionData | null> {
    const session = await auth();
    if (!session?.user?.id) return null;

    const userId = session.user.id;
    const problem = await prisma.practiceProblem.findUnique({ where: { slug: problemSlug } });
    if (!problem) return null;

    const existing = await prisma.practiceUserSession.findUnique({
        where: {
            userId_problemId_mode: {
                userId,
                problemId: problem.id,
                mode,
            },
        },
    });

    if (existing) {
        return {
            id: existing.id,
            userId: existing.userId,
            problemId: existing.problemId,
            module: existing.module,
            mode: existing.mode,
            status: existing.status,
            code: existing.code,
            cssCode: existing.cssCode,
            canvasData: existing.canvasData,
            language: existing.language,
            attempts: existing.attempts,
            bestScore: existing.bestScore,
            lastFeedback: existing.lastFeedback,
            requirementsMet: existing.requirementsMet as Record<string, boolean> | null,
            totalTimeSeconds: existing.totalTimeSeconds,
            startedAt: existing.startedAt,
            completedAt: existing.completedAt,
            voiceUsed: existing.voiceUsed,
            chatHistory: existing.chatHistory as PracticeChatMessage[] | null,
            xpAwarded: existing.xpAwarded,
        };
    }

    const created = await prisma.practiceUserSession.create({
        data: {
            userId,
            problemId: problem.id,
            module: problem.module,
            mode,
            code: problem.starterCode ?? "",
            cssCode: problem.starterCss ?? "",
            language: "javascript",
        },
    });

    return {
        id: created.id,
        userId: created.userId,
        problemId: created.problemId,
        module: created.module,
        mode: created.mode,
        status: created.status,
        code: created.code,
        cssCode: created.cssCode,
        canvasData: created.canvasData,
        language: created.language,
        attempts: created.attempts,
        bestScore: created.bestScore,
        lastFeedback: created.lastFeedback,
        requirementsMet: null,
        totalTimeSeconds: created.totalTimeSeconds,
        startedAt: created.startedAt,
        completedAt: created.completedAt,
        voiceUsed: created.voiceUsed,
        chatHistory: null,
        xpAwarded: created.xpAwarded,
    };
}

export async function saveSessionProgress(
    sessionId: string,
    data: {
        code?: string;
        cssCode?: string;
        canvasData?: unknown;
        language?: string;
        chatHistory?: PracticeChatMessage[];
        totalTimeSeconds?: number;
    }
): Promise<boolean> {
    const session = await auth();
    if (!session?.user?.id) return false;

    try {
        await prisma.practiceUserSession.update({
            where: { id: sessionId, userId: session.user.id },
            data: {
                ...(data.code !== undefined ? { code: data.code } : {}),
                ...(data.cssCode !== undefined ? { cssCode: data.cssCode } : {}),
                ...(data.canvasData !== undefined ? { canvasData: data.canvasData as object } : {}),
                ...(data.language !== undefined ? { language: data.language } : {}),
                ...(data.chatHistory !== undefined ? { chatHistory: data.chatHistory as object[] } : {}),
                ...(data.totalTimeSeconds !== undefined ? { totalTimeSeconds: data.totalTimeSeconds } : {}),
            },
        });
        return true;
    } catch {
        return false;
    }
}

export async function updateSessionAfterAssess(
    sessionId: string,
    data: {
        score: number;
        feedback: string;
        requirementsMet: Record<string, boolean>;
        xpAwarded: number;
    }
): Promise<boolean> {
    const session = await auth();
    if (!session?.user?.id) return false;

    try {
        const current = await prisma.practiceUserSession.findUnique({
            where: { id: sessionId, userId: session.user.id },
        });
        if (!current) return false;

        const newBestScore = Math.max(current.bestScore, data.score);
        const allMet = Object.values(data.requirementsMet).every(Boolean);
        const newStatus: PracticeSessionStatus = allMet && data.score >= 80 ? "COMPLETED" : "IN_PROGRESS";

        await prisma.practiceUserSession.update({
            where: { id: sessionId },
            data: {
                attempts: { increment: 1 },
                bestScore: newBestScore,
                lastFeedback: data.feedback,
                requirementsMet: data.requirementsMet,
                status: newStatus,
                xpAwarded: { increment: data.xpAwarded },
                ...(newStatus === "COMPLETED" ? { completedAt: new Date() } : {}),
            },
        });

        // Update module progress
        if (newStatus === "COMPLETED" && current.status !== "COMPLETED") {
            await updateModuleProgress(session.user.id, current.module, current.problemId);
        }

        return true;
    } catch {
        return false;
    }
}

// ─────────────────────────────────────────────
// PROGRESS
// ─────────────────────────────────────────────

async function updateModuleProgress(userId: string, module: PracticeModule, completedProblemId: string) {
    const problem = await prisma.practiceProblem.findUnique({ where: { id: completedProblemId } });
    if (!problem) return;

    const difficultyXP = { EASY: 25, MEDIUM: 50, HARD: 100 };
    const xp = difficultyXP[problem.difficulty] ?? 25;

    await prisma.practiceModuleProgress.upsert({
        where: { userId_module: { userId, module } },
        create: {
            userId,
            module,
            completed: 1,
            totalXP: xp,
            lastPracticedAt: new Date(),
            currentStreak: 1,
            longestStreak: 1,
            [`${problem.difficulty.toLowerCase()}Completed`]: 1,
        },
        update: {
            completed: { increment: 1 },
            totalXP: { increment: xp },
            lastPracticedAt: new Date(),
            [`${problem.difficulty.toLowerCase()}Completed`]: { increment: 1 },
        },
    });

    // Update leaderboard
    const progress = await prisma.practiceModuleProgress.findUnique({
        where: { userId_module: { userId, module } },
    });
    if (progress) {
        await prisma.practiceLeaderboard.upsert({
            where: { userId_module: { userId, module } },
            create: {
                userId,
                module,
                totalXP: progress.totalXP,
                completed: progress.completed,
                averageScore: progress.averageScore,
                streak: progress.currentStreak,
            },
            update: {
                totalXP: progress.totalXP,
                completed: progress.completed,
                averageScore: progress.averageScore,
                streak: progress.currentStreak,
            },
        });
    }

    // Award XP to user
    await prisma.user.update({
        where: { id: userId },
        data: {
            currentXp: { increment: xp },
            totalXp: { increment: xp },
        },
    });
}

export async function getModuleProgress(module: PracticeModule): Promise<PracticeProgressData | null> {
    const session = await auth();
    if (!session?.user?.id) return null;

    const progress = await prisma.practiceModuleProgress.findUnique({
        where: { userId_module: { userId: session.user.id, module } },
    });

    const totalProblems = await prisma.practiceProblem.count({ where: { module, isActive: true } });

    if (!progress) {
        return {
            module,
            totalProblems,
            completed: 0,
            inProgress: 0,
            totalXP: 0,
            currentStreak: 0,
            longestStreak: 0,
            lastPracticedAt: null,
            easyCompleted: 0,
            mediumCompleted: 0,
            hardCompleted: 0,
            averageScore: 0,
        };
    }

    const inProgress = await prisma.practiceUserSession.count({
        where: { userId: session.user.id, module, status: "IN_PROGRESS" },
    });

    return {
        module,
        totalProblems,
        completed: progress.completed,
        inProgress,
        totalXP: progress.totalXP,
        currentStreak: progress.currentStreak,
        longestStreak: progress.longestStreak,
        lastPracticedAt: progress.lastPracticedAt,
        easyCompleted: progress.easyCompleted,
        mediumCompleted: progress.mediumCompleted,
        hardCompleted: progress.hardCompleted,
        averageScore: progress.averageScore,
    };
}

// ─────────────────────────────────────────────
// LEADERBOARD
// ─────────────────────────────────────────────

export async function getLeaderboard(
    module: PracticeModule,
    limit: number = 25
): Promise<PracticeLeaderboardEntry[]> {
    const entries = await prisma.practiceLeaderboard.findMany({
        where: { module },
        orderBy: { totalXP: "desc" },
        take: limit,
        include: {
            user: {
                select: { name: true, image: true },
            },
        },
    });

    return entries.map((e, i) => ({
        rank: i + 1,
        userId: e.userId,
        userName: e.user.name,
        userImage: e.user.image,
        totalXP: e.totalXP,
        completed: e.completed,
        averageScore: e.averageScore,
        streak: e.streak,
    }));
}

// ─────────────────────────────────────────────
// USER STATS (Dashboard)
// ─────────────────────────────────────────────

export async function getUserPracticeStats(): Promise<PracticeUserStats | null> {
    const session = await auth();
    if (!session?.user?.id) return null;

    const userId = session.user.id;

    const [modules, sessions, totalProblems] = await Promise.all([
        prisma.practiceModuleProgress.findMany({ where: { userId } }),
        prisma.practiceUserSession.findMany({
            where: { userId },
            orderBy: { updatedAt: "desc" },
            take: 10,
            include: {
                problem: {
                    select: { title: true, slug: true, category: true, difficulty: true, module: true },
                },
            },
        }),
        prisma.practiceProblem.count({ where: { isActive: true } }),
    ]);

    const totalSolved = modules.reduce((acc, m) => acc + m.completed, 0);
    const totalXP = modules.reduce((acc, m) => acc + m.totalXP, 0);
    const longestStreak = Math.max(0, ...modules.map((m) => m.longestStreak));
    const currentStreak = Math.max(0, ...modules.map((m) => m.currentStreak));
    const avgScore = modules.length > 0
        ? Math.round(modules.reduce((acc, m) => acc + m.averageScore, 0) / modules.length)
        : 0;

    // Difficulty breakdown
    const easyTotal = await prisma.practiceProblem.count({ where: { isActive: true, difficulty: "EASY" } });
    const mediumTotal = await prisma.practiceProblem.count({ where: { isActive: true, difficulty: "MEDIUM" } });
    const hardTotal = await prisma.practiceProblem.count({ where: { isActive: true, difficulty: "HARD" } });
    const easyCompleted = modules.reduce((acc, m) => acc + m.easyCompleted, 0);
    const mediumCompleted = modules.reduce((acc, m) => acc + m.mediumCompleted, 0);
    const hardCompleted = modules.reduce((acc, m) => acc + m.hardCompleted, 0);

    const moduleBreakdown: PracticeProgressData[] = (["DSA", "SYSTEM_DESIGN", "WEB_FRONTEND", "WEB_BACKEND"] as PracticeModule[]).map((mod) => {
        const m = modules.find((mp) => mp.module === mod);
        return {
            module: mod,
            totalProblems: 0,
            completed: m?.completed ?? 0,
            inProgress: m?.inProgress ?? 0,
            totalXP: m?.totalXP ?? 0,
            currentStreak: m?.currentStreak ?? 0,
            longestStreak: m?.longestStreak ?? 0,
            lastPracticedAt: m?.lastPracticedAt ?? null,
            easyCompleted: m?.easyCompleted ?? 0,
            mediumCompleted: m?.mediumCompleted ?? 0,
            hardCompleted: m?.hardCompleted ?? 0,
            averageScore: m?.averageScore ?? 0,
        };
    });

    const recentSessions: PracticeRecentSession[] = sessions.map((s) => ({
        problemTitle: s.problem.title,
        problemSlug: s.problem.slug,
        module: s.problem.module,
        category: s.problem.category,
        difficulty: s.problem.difficulty,
        bestScore: s.bestScore,
        status: s.status,
        updatedAt: s.updatedAt,
    }));

    return {
        totalSolved,
        totalAttempted: sessions.length,
        totalXP,
        currentStreak,
        longestStreak,
        averageScore: avgScore,
        moduleBreakdown,
        recentSessions,
        difficultyBreakdown: {
            easy: { total: easyTotal, completed: easyCompleted },
            medium: { total: mediumTotal, completed: mediumCompleted },
            hard: { total: hardTotal, completed: hardCompleted },
        },
    };
}
