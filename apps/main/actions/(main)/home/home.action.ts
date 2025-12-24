"use server";

import prisma from "@repo/prisma";
import { auth } from '@repo/auth';
import { revalidatePath } from "next/cache";
import { GoalType } from "@prisma/client";

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
            weeklyGoals,
            recentActivity,
            activityCalendar,
            achievements,
            leaderboardRank,
            recentTransfers,
            referralStats,
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

            // In-progress projects (limit 6)
            prisma.userProjectProgress.findMany({
                where: {
                    userId,
                    status: "InProgress",
                },
                include: {
                    project: {
                        select: {
                            id: true,
                            name: true,
                            description: true,
                            difficulty: true,
                            category: true,
                            tier: true,
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

            // Weekly goals
            prisma.weeklyGoal.findMany({
                where: {
                    userId,
                    createdAt: {
                        gte: getWeekStart(),
                    },
                },
                orderBy: { createdAt: "asc" },
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

            // Recent achievements (limit 5)
            prisma.userAchievement.findMany({
                where: { userId },
                orderBy: { unlockedAt: "desc" },
                take: 5,
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
        ]);

        // Calculate weekly goal progress
        const weeklyGoalProgress = calculateWeeklyProgress(weeklyGoals);

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

        // Transform achievements (UserAchievement has the fields directly)
        const transformedAchievements = achievements.map((achievement) => ({
            id: achievement.id,
            achievement: {
                id: achievement.id,
                name: achievement.title,
                description: achievement.description,
                icon: achievement.badgeIcon,
                xpReward: achievement.creditsAwarded,
                rarity: achievement.achievementType,
            },
            unlockedAt: achievement.unlockedAt,
        }));

        return {
            success: true,
            data: {
                user: transformedUser,
                inProgressProjects,
                recentStudios,
                weeklyGoals,
                weeklyGoalProgress,
                recentActivity: transformedActivity,
                activityCalendar: transformedCalendar,
                achievements: transformedAchievements,
                leaderboardRank,
                recentTransfers,
                referralStats,
            },
        };
    } catch (error) {
        console.error("Error fetching home data:", error);
        return { success: false, error: "Failed to fetch home data" };
    }
}

// Get week start date (Monday)
function getWeekStart(): Date {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const weekStart = new Date(now.setDate(diff));
    weekStart.setHours(0, 0, 0, 0);
    return weekStart;
}

// Calculate weekly progress
function calculateWeeklyProgress(goals: any[]) {
    if (!goals.length) return { completed: 0, total: 0, percentage: 0 };

    const completed = goals.filter((g) => g.completed).length;
    const total = goals.length;
    const percentage = Math.round((completed / total) * 100);

    return { completed, total, percentage };
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

// Add weekly goal
export async function addWeeklyGoal(data: {
    title: string;
    category?: string;
    type?: GoalType;
}) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Not authenticated" };
        }

        const goal = await prisma.weeklyGoal.create({
            data: {
                userId: session.user.id,
                title: data.title,
                category: data.category || "general",
                type: data.type || GoalType.CUSTOM,
                completed: false,
            },
        });

        revalidatePath("/home");
        return { success: true, goal };
    } catch (error) {
        console.error("Error adding weekly goal:", error);
        return { success: false, error: "Failed to add goal" };
    }
}

// Toggle weekly goal completion
export async function toggleWeeklyGoal(goalId: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Not authenticated" };
        }

        const goal = await prisma.weeklyGoal.findUnique({
            where: { id: goalId },
        });

        if (!goal || goal.userId !== session.user.id) {
            return { success: false, error: "Goal not found" };
        }

        const updatedGoal = await prisma.weeklyGoal.update({
            where: { id: goalId },
            data: {
                completed: !goal.completed,
                completedAt: !goal.completed ? new Date() : null,
            },
        });

        revalidatePath("/home");
        return { success: true, goal: updatedGoal };
    } catch (error) {
        console.error("Error toggling goal:", error);
        return { success: false, error: "Failed to update goal" };
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
