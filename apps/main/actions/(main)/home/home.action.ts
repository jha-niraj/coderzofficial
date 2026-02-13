"use server";

import prisma from "@repo/prisma";
import { auth } from '@repo/auth';
import { revalidatePath } from "next/cache";

// Get user's home page data
export async function getHomeData() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Not authenticated" };
        }

        const userId = session.user.id;

        // Fetch all data in parallel for performance
        const [
            user,
            inProgressProjects,
            recentStudios,
            pathfinderGoals,
            recentActivity,
            activityCalendar,
            achievements,
            leaderboardRank,
            recentTransfers,
            referralStats,
            recentMockSessions,
        ] = await Promise.all([
            // User stats with UserStats relation for streaks
            prisma.user.findUnique({
                where: { id: userId },
                select: {
                    id: true,
                    name: true,
                    image: true,
                    credits: true,
                    currentXp: true,
                    totalXp: true,
                    currentLevel: true,
                    userStats: {
                        select: {
                            currentStreak: true,
                            longestStreak: true,
                            lastActivityDate: true,
                        },
                    },
                    _count: {
                        select: {
                            followers: true,
                            following: true,
                        },
                    },
                },
            }),

            // In-progress projects (limit 6) - using ProjectV2
            prisma.userProjectV2Progress.findMany({
                where: {
                    userId,
                    status: "IN_PROGRESS",
                },
                include: {
                    project: {
                        select: {
                            id: true,
                            slug: true,
                            title: true,
                            description: true,
                            difficulty: true,
                            generationType: true,
                        },
                    },
                },
                orderBy: { startedAt: "desc" },
                take: 6,
            }),

            // Recent studios (limit 6)
            prisma.studio.findMany({
                where: { userId },
                select: {
                    id: true,
                    slug: true,
                    title: true,
                    description: true,
                    emoji: true,
                    updatedAt: true,
                    _count: {
                        select: {
                            quizzes: true,
                            flashcardDecks: true,
                        },
                    },
                },
                orderBy: { updatedAt: "desc" },
                take: 6,
            }),

            // Pathfinder goals (replaces weekly goals)
            prisma.pathfinderGoal.findMany({
                where: { userId },
                orderBy: { createdAt: "desc" },
                take: 10,
                select: {
                    id: true,
                    slug: true,
                    title: true,
                    category: true,
                    status: true,
                    progressPercent: true,
                    estimatedDays: true,
                    duration: true,
                    totalSubGoals: true,
                    completedSubGoals: true,
                },
            }),

            // Recent activity from ActivityEntry (limit 10)
            prisma.activityEntry.findMany({
                where: { userId },
                orderBy: { createdAt: "desc" },
                take: 10,
            }),

            // Activity calendar data (last 365 days)
            prisma.dailyActivity.findMany({
                where: {
                    userId,
                    date: {
                        gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
                    },
                },
                select: {
                    date: true,
                    totalXpEarned: true,
                    activitiesCount: true,
                },
                orderBy: { date: "asc" },
            }),

            // Recent achievements from new badges system (limit 5)
            prisma.userBadge.findMany({
                where: { userId, status: "CLAIMED" },
                orderBy: { claimedAt: "desc" },
                take: 5,
                include: {
                    badge: {
                        select: {
                            id: true,
                            name: true,
                            description: true,
                            icon: true,
                            xpReward: true,
                            rarity: true,
                        },
                    },
                },
            }),

            // Leaderboard position
            getLeaderboardPosition(userId),

            // Recent credit transfers (sent and received)
            prisma.creditTransfer.findMany({
                where: {
                    OR: [{ senderId: userId }, { receiverId: userId }],
                },
                include: {
                    sender: {
                        select: { id: true, name: true, image: true, username: true },
                    },
                    receiver: {
                        select: { id: true, name: true, image: true, username: true },
                    },
                },
                orderBy: { createdAt: "desc" },
                take: 5,
            }),

            // Referral stats
            getReferralStats(userId),

            // Recent mock voice sessions (limit 6)
            prisma.mockVoiceSession.findMany({
                where: { userId },
                include: {
                    mock: {
                        select: {
                            id: true,
                            title: true,
                            category: true,
                        },
                    },
                },
                orderBy: { createdAt: "desc" },
                take: 6,
            }),
        ]);

        // Transform pathfinder goals for home
        const pathfinderGoalsForHome = pathfinderGoals.map((g) => ({
            id: g.id,
            slug: g.slug,
            title: g.title,
            category: g.category,
            status: g.status,
            progressPercent: g.progressPercent,
            estimatedDays: g.estimatedDays,
            duration: g.duration,
            totalSubGoals: g.totalSubGoals,
            completedSubGoals: g.completedSubGoals,
            lastActivityAt: null as Date | null,
            streakDays: 0,
            overview: null as string | null,
            createdAt: new Date(),
            startedAt: null as Date | null,
            completedAt: null as Date | null,
            groupId: null as string | null,
            studioId: null as string | null,
            focusAreas: [] as string[],
        }));

        // Transform data for client
        const transformedUser = user
            ? {
                ...user,
                currentStreak: user.userStats?.currentStreak || 0,
                longestStreak: user.userStats?.longestStreak || 0,
            }
            : null;

        // Transform activity calendar data
        const transformedCalendar = activityCalendar.map((day) => ({
            date: day.date,
            totalXp: day.totalXpEarned,
            activitiesCount: day.activitiesCount,
        }));

        // Transform activities for the client
        const transformedActivity = recentActivity.map((activity) => ({
            id: activity.id,
            type: activity.activityType,
            title: activity.title,
            description: activity.description,
            xpEarned: activity.xpEarned,
            createdAt: activity.createdAt,
        }));

        // Transform achievements from new badges system
        const transformedAchievementsFromBadges = achievements.map((ub) => ({
            id: ub.id,
            achievement: {
                id: ub.badge.id,
                name: ub.badge.name,
                description: ub.badge.description,
                icon: ub.badge.icon,
                xpReward: ub.badge.xpReward,
                rarity: ub.badge.rarity,
            },
            unlockedAt: ub.claimedAt ?? ub.completedAt ?? ub.unlockedAt ?? new Date(),
        }));

        return {
            success: true,
            data: {
                user: transformedUser,
                inProgressProjects,
                recentStudios,
                pathfinderGoals: pathfinderGoalsForHome,
                recentActivity: transformedActivity,
                activityCalendar: transformedCalendar,
                achievements: transformedAchievementsFromBadges,
                leaderboardRank,
                recentTransfers,
                referralStats,
                recentMockSessions: recentMockSessions || [],
            },
        };
    } catch (error) {
        console.error("Error fetching home data:", error);
        return { success: false, error: "Failed to fetch home data" };
    }
}

// Get leaderboard position
async function getLeaderboardPosition(userId: string) {
    try {
        const users = await prisma.user.findMany({
            select: { id: true, totalXp: true },
            orderBy: { totalXp: "desc" },
        });

        const position = users.findIndex((u) => u.id === userId) + 1;
        const totalUsers = users.length;
        const percentile = Math.round(((totalUsers - position) / totalUsers) * 100);

        return { position, totalUsers, percentile };
    } catch {
        return { position: 0, totalUsers: 0, percentile: 0 };
    }
}

// Get referral stats
async function getReferralStats(userId: string) {
    try {
        const referrals = await prisma.referral.findMany({
            where: { referrerId: userId },
            include: {
                referredUser: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                        createdAt: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        // Calculate credits earned from referrals (assuming 50 credits per referral)
        const creditsEarned = referrals.length * 50;

        return {
            totalReferrals: referrals.length,
            creditsEarned,
            recentReferrals: referrals.slice(0, 5).map((r) => ({
                id: r.referredUser.id,
                name: r.referredUser.name,
                image: r.referredUser.image,
                createdAt: r.referredUser.createdAt,
            })),
        };
    } catch {
        return { totalReferrals: 0, creditsEarned: 0, recentReferrals: [] };
    }
}

// Get activities for a specific date (for activity day detail sheet)
export async function getActivitiesByDate(dateStr: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Not authenticated", data: [] };
        }

        const date = new Date(dateStr);
        date.setHours(0, 0, 0, 0);
        const nextDay = new Date(date);
        nextDay.setDate(nextDay.getDate() + 1);

        const dailyActivity = await prisma.dailyActivity.findFirst({
            where: {
                userId: session.user.id,
                date: {
                    gte: date,
                    lt: nextDay,
                },
            },
            select: { id: true },
        });

        if (!dailyActivity) {
            return { success: true, data: [] };
        }

        const activities = await prisma.activityEntry.findMany({
            where: {
                dailyActivityId: dailyActivity.id,
            },
            orderBy: { createdAt: "desc" },
        });

        const transformed = activities.map((a) => ({
            id: a.id,
            type: a.activityType,
            title: a.title,
            description: a.description,
            xpEarned: a.xpEarned,
            createdAt: a.createdAt,
        }));

        return { success: true, data: transformed };
    } catch (error) {
        console.error("Error fetching activities by date:", error);
        return { success: false, error: "Failed to fetch activities", data: [] };
    }
}

// Get community highlights
export async function getCommunityHighlights() {
    try {
        const posts = await prisma.communityPost.findMany({
            where: {
                officialChannel: { not: null },
            },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                        username: true,
                    },
                },
            },
            orderBy: [{ likeCount: "desc" }, { createdAt: "desc" }],
            take: 3,
        });

        // Transform to match expected format
        const transformedPosts = posts.map((post) => ({
            id: post.id,
            content: post.content,
            createdAt: post.createdAt,
            author: post.author,
            _count: {
                likes: post.likeCount,
                comments: post.commentCount,
            },
        }));

        return { success: true, posts: transformedPosts };
    } catch (error) {
        console.error("Error fetching community highlights:", error);
        return { success: false, posts: [] };
    }
}
