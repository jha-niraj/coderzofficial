
"use server";

import { prisma } from "@repo/prisma";
import { auth } from "@repo/auth";
import { LearnDifficulty } from "@repo/prisma/client";

const DIFFICULTY_POINTS: Record<LearnDifficulty, number> = {
    BEGINNER: 10,
    INTERMEDIATE: 30,
    ADVANCED: 60,
    EXPERT: 100,
};

export interface LeaderboardUser {
    id: string;
    username: string | null;
    name: string | null;
    image: string | null; // avatar
    score: number;
    learnsCompleted: number;
    rank: number;
}

async function calculateLeaderboard(filter: any = {}) {
    // Fetch all completed progress
    // Note: For large scale, this should be optimized or cached
    const progress = await prisma.learnProgress.findMany({
        where: {
            ...filter,
            isCompleted: true,
        },
        include: {
            learn: {
                select: { difficulty: true },
            },
            user: {
                select: {
                    id: true,
                    username: true,
                    name: true,
                    image: true,
                },
            },
        },
    });

    // Aggregate by User
    const userMap = new Map<string, LeaderboardUser>();

    progress.forEach((p) => {
        const user = p.user;
        const difficulty = p.learn?.difficulty as LearnDifficulty | undefined;
        const points = difficulty ? DIFFICULTY_POINTS[difficulty] : 10;

        if (!userMap.has(user.id)) {
            userMap.set(user.id, {
                id: user.id,
                username: user.username,
                name: user.name,
                image: user.image,
                score: 0,
                learnsCompleted: 0,
                rank: 0,
            });
        }

        const stats = userMap.get(user.id)!;
        stats.score += points;
        stats.learnsCompleted += 1;
    });

    // Sort by Score Descending
    const ranking = Array.from(userMap.values()).sort((a, b) => b.score - a.score);

    // Assign Ranks
    ranking.forEach((u, index) => {
        u.rank = index + 1;
    });

    return ranking;
}

export async function getGlobalLeaderboard() {
    try {
        const session = await auth();
        const ranking = await calculateLeaderboard();

        // Top 50
        const top50 = ranking.slice(0, 50);

        // Current User Rank
        let currentUserRank: LeaderboardUser | null = null;
        if (session?.user?.id) {
            currentUserRank = ranking.find((u) => u.id === session.user.id) || null;
            if (!currentUserRank) {
                // Return 0 score entry if not found
                currentUserRank = {
                    id: session.user.id,
                    username: session.user.name || "You", // fallback
                    name: session.user.name,
                    image: session.user.image!,
                    score: 0,
                    learnsCompleted: 0,
                    rank: ranking.length + 1,
                };
            }
        }

        return { ranking: top50, currentUserRank };
    } catch (error) {
        console.error("Error fetching global leaderboard:", error);
        return { error: "Failed to fetch leaderboard" };
    }
}

export async function getCategoryLeaderboard(subcategorySlug: string) {
    try {
        const session = await auth();

        // Verify subcategory exists
        const subCategory = await prisma.learnSubCategory.findUnique({
            where: { slug: subcategorySlug },
        });

        if (!subCategory) {
            return { error: "Category not found" };
        }

        const ranking = await calculateLeaderboard({
            learn: {
                subCategoryId: subCategory.id,
            },
        });

        // Top 50
        const top50 = ranking.slice(0, 50);

        // Current User Rank
        let currentUserRank: LeaderboardUser | null = null;
        if (session?.user?.id) {
            currentUserRank = ranking.find((u) => u.id === session.user.id) || null;
            if (!currentUserRank) {
                currentUserRank = {
                    id: session.user.id,
                    username: session.user.name || "You",
                    name: session.user.name,
                    image: session.user.image!,
                    score: 0,
                    learnsCompleted: 0,
                    rank: ranking.length + 1,
                };
            }
        }

        return { ranking: top50, currentUserRank, categoryName: subCategory.name };
    } catch (error) {
        console.error("Error fetching category leaderboard:", error);
        return { error: "Failed to fetch leaderboard" };
    }
}