"use server";

import { getSession } from "@repo/auth";
import { headers } from "next/headers";
import {
    db,
    users,
    userProjectV2Progress,
    studios,
    pathfinderGoals,
    activityEntries,
    dailyActivities,
    userBadges,
    creditTransfers,
    referrals,
    mockVoiceSession,
    communityPosts,
    userStats,
} from "@repo/db";
import { eq, and, or, gte, desc, asc, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// Get user's home page data
export async function getHomeData() {
    try {
        const session = await getSession(headers());
        if (!session?.user?.id) {
            return { success: false, error: "Not authenticated" };
        }

        const userId = session.user.id;

        // Fetch all data in parallel for performance
        const [
            user,
            userStatsRow,
            inProgressProjects,
            recentStudios,
            pathfinderGoalRows,
            recentActivity,
            activityCalendar,
            achievements,
            leaderboardRank,
            recentTransfers,
            referralStats,
            recentMockSessions,
        ] = await Promise.all([
            // User stats
            db.query.users.findFirst({
                where: eq(users.id, userId),
                columns: {
                    id: true,
                    name: true,
                    image: true,
                    credits: true,
                    currentXp: true,
                    totalXp: true,
                    currentLevel: true,
                },
            }),

            // UserStats (streak info) — separate query
            db.query.userStats.findFirst({
                where: eq(userStats.userId, userId),
                columns: {
                    currentStreak: true,
                    longestStreak: true,
                    lastActivityDate: true,
                },
            }),

            // In-progress projects (limit 6)
            db.query.userProjectV2Progress.findMany({
                where: and(
                    eq(userProjectV2Progress.userId, userId),
                    eq(userProjectV2Progress.status, "IN_PROGRESS")
                ),
                with: {
                    project: {
                        columns: {
                            id: true,
                            slug: true,
                            title: true,
                            description: true,
                            difficulty: true,
                            generationType: true,
                        },
                    },
                },
                orderBy: desc(userProjectV2Progress.startedAt),
                limit: 6,
            }),

            // Recent studios (limit 6)
            db.query.studios.findMany({
                where: eq(studios.userId, userId),
                columns: {
                    id: true,
                    slug: true,
                    title: true,
                    description: true,
                    emoji: true,
                    updatedAt: true,
                },
                with: {
                    quizzes: { columns: { id: true } },
                    flashcardDecks: { columns: { id: true } },
                },
                orderBy: desc(studios.updatedAt),
                limit: 6,
            }),

            // Pathfinder goals
            db.query.pathfinderGoals.findMany({
                where: eq(pathfinderGoals.userId, userId),
                columns: {
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
                orderBy: desc(pathfinderGoals.createdAt),
                limit: 10,
            }),

            // Recent activity from ActivityEntry (limit 10)
            db.query.activityEntries.findMany({
                where: eq(activityEntries.userId, userId),
                orderBy: desc(activityEntries.createdAt),
                limit: 10,
            }),

            // Activity calendar data (last 365 days)
            db.query.dailyActivities.findMany({
                where: and(
                    eq(dailyActivities.userId, userId),
                    gte(dailyActivities.date, new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
                ),
                columns: {
                    date: true,
                    totalXpEarned: true,
                    activitiesCount: true,
                },
                orderBy: asc(dailyActivities.date),
            }),

            // Recent achievements from badges system (limit 5)
            db.query.userBadges.findMany({
                where: and(
                    eq(userBadges.userId, userId),
                    eq(userBadges.status, "CLAIMED")
                ),
                with: {
                    badge: {
                        columns: {
                            id: true,
                            name: true,
                            description: true,
                            icon: true,
                            xpReward: true,
                            rarity: true,
                        },
                    },
                },
                orderBy: desc(userBadges.claimedAt),
                limit: 5,
            }),

            // Leaderboard position
            getLeaderboardPosition(userId),

            // Recent credit transfers
            db.query.creditTransfers.findMany({
                where: or(
                    eq(creditTransfers.senderId, userId),
                    eq(creditTransfers.receiverId, userId)
                ),
                with: {
                    sender: {
                        columns: { id: true, name: true, image: true, username: true },
                    },
                    receiver: {
                        columns: { id: true, name: true, image: true, username: true },
                    },
                },
                orderBy: desc(creditTransfers.createdAt),
                limit: 5,
            }),

            // Referral stats
            getReferralStats(userId),

            // Recent mock voice sessions (limit 6)
            db.query.mockVoiceSession.findMany({
                where: eq(mockVoiceSession.userId, userId),
                with: {
                    mock: {
                        columns: {
                            id: true,
                            title: true,
                            category: true,
                        },
                    },
                },
                orderBy: desc(mockVoiceSession.createdAt),
                limit: 6,
            }),
        ]);

        // Transform pathfinder goals for home
        const pathfinderGoalsForHome = pathfinderGoalRows.map((g) => ({
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
                currentStreak: userStatsRow?.currentStreak || 0,
                longestStreak: userStatsRow?.longestStreak || 0,
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

        // Normalize studios to include _count shape for client compatibility
        const normalizedStudios = recentStudios.map(s => ({
            id: s.id,
            slug: s.slug,
            title: s.title,
            description: s.description,
            emoji: s.emoji,
            updatedAt: s.updatedAt,
            _count: {
                quizzes: s.quizzes.length,
                flashcardDecks: s.flashcardDecks.length,
            },
        }));

        return {
            success: true,
            data: {
                user: transformedUser,
                inProgressProjects,
                recentStudios: normalizedStudios,
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
        const allUsers = await db.query.users.findMany({
            columns: { id: true, totalXp: true },
            orderBy: desc(users.totalXp),
        });

        const position = allUsers.findIndex((u) => u.id === userId) + 1;
        const totalUsers = allUsers.length;
        const percentile = Math.round(((totalUsers - position) / totalUsers) * 100);

        return { position, totalUsers, percentile };
    } catch {
        return { position: 0, totalUsers: 0, percentile: 0 };
    }
}

// Get referral stats
async function getReferralStats(userId: string) {
    try {
        const userReferrals = await db.query.referrals.findMany({
            where: eq(referrals.referrerId, userId),
            with: {
                referredUser: {
                    columns: {
                        id: true,
                        name: true,
                        image: true,
                        createdAt: true,
                    },
                },
            },
            orderBy: desc(referrals.createdAt),
        });

        // Calculate credits earned from referrals (assuming 50 credits per referral)
        const creditsEarned = userReferrals.length * 50;

        return {
            totalReferrals: userReferrals.length,
            creditsEarned,
            recentReferrals: userReferrals.slice(0, 5).map((r) => ({
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
        const session = await getSession(headers());
        if (!session?.user?.id) {
            return { success: false, error: "Not authenticated", data: [] };
        }

        const date = new Date(dateStr);
        date.setHours(0, 0, 0, 0);
        const dateOnly = date.toISOString().split('T')[0];

        const dailyActivity = await db.query.dailyActivities.findFirst({
            where: and(
                eq(dailyActivities.userId, session.user.id),
                eq(dailyActivities.date, dateOnly)
            ),
            columns: { id: true },
        });

        if (!dailyActivity) {
            return { success: true, data: [] };
        }

        const activities = await db.query.activityEntries.findMany({
            where: eq(activityEntries.dailyActivityId, dailyActivity.id),
            orderBy: desc(activityEntries.createdAt),
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
        const posts = await db.query.communityPosts.findMany({
            where: sql`${communityPosts.officialChannel} IS NOT NULL`,
            with: {
                author: {
                    columns: {
                        id: true,
                        name: true,
                        image: true,
                        username: true,
                    },
                },
            },
            orderBy: [desc(communityPosts.likeCount), desc(communityPosts.createdAt)],
            limit: 3,
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
