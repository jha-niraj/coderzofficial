"use server";

import { auth } from '@repo/auth';
import prisma from '@/lib/prisma';
import { ActivityType } from '@prisma/client';

export interface ActivityData {
    type: ActivityType;
    title: string;
    description?: string;
    xpEarned?: number;
    creditsEarned?: number;
    timeSpent?: number; // in minutes
    metadata?: Record<string, any>;
}

export interface DailyActivitySummary {
    date: Date;
    hasActivity: boolean;
    totalXpEarned: number;
    totalCreditsEarned: number;
    totalTimeSpent: number;
    activitiesCount: number;
    isStreakDay: boolean;
    activities: Array<{
        id: string;
        activityType: ActivityType;
        title: string;
        description?: string;
        xpEarned: number;
        creditsEarned: number;
        timeSpent: number;
        metadata?: any;
        createdAt: Date;
    }>;
}

export interface StreakInfo {
    currentStreak: number;
    longestStreak: number;
    lastActivityDate: Date | null;
    streakDates: Date[];
}

// Track a new activity for the current user
export async function trackActivity(activityData: ActivityData) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: 'User not authenticated' };
        }

        // Use local date to avoid timezone issues
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        // Get or create daily activity record
        const dailyActivity = await prisma.dailyActivity.upsert({
            where: {
                userId_date: {
                    userId: session.user.id,
                    date: today,
                },
            },
            update: {
                hasActivity: true,
                totalXpEarned: { increment: activityData.xpEarned || 0 },
                totalCreditsEarned: { increment: activityData.creditsEarned || 0 },
                totalTimeSpent: { increment: activityData.timeSpent || 0 },
                activitiesCount: { increment: 1 },
                isStreakDay: true, // Mark as streak day
                updatedAt: new Date(),
            },
            create: {
                userId: session.user.id,
                date: today,
                hasActivity: true,
                totalXpEarned: activityData.xpEarned || 0,
                totalCreditsEarned: activityData.creditsEarned || 0,
                totalTimeSpent: activityData.timeSpent || 0,
                activitiesCount: 1,
                isStreakDay: true,
            },
        });

        // Create activity entry
        const activityEntry = await prisma.activityEntry.create({
            data: {
                userId: session.user.id,
                dailyActivityId: dailyActivity.id,
                activityType: activityData.type,
                title: activityData.title,
                description: activityData.description,
                xpEarned: activityData.xpEarned || 0,
                creditsEarned: activityData.creditsEarned || 0,
                timeSpent: activityData.timeSpent || 0,
                metadata: activityData.metadata,
            },
        });

        // Update user XP and credits if provided
        if (activityData.xpEarned || activityData.creditsEarned) {
            await prisma.user.update({
                where: { id: session.user.id },
                data: {
                    currentXp: activityData.xpEarned ? { increment: activityData.xpEarned } : undefined,
                    totalXp: activityData.xpEarned ? { increment: activityData.xpEarned } : undefined,
                    credits: activityData.creditsEarned ? { increment: activityData.creditsEarned } : undefined,
                },
            });
        }

        // Update streak information
        await updateUserStreak(session.user.id);

        return { 
            success: true, 
            data: { 
                activityId: activityEntry.id,
                dailyActivityId: dailyActivity.id 
            } 
        };
    } catch (error) {
        console.error('Error tracking activity:', error);
        return { 
            success: false, 
            error: error instanceof Error ? error.message : 'Failed to track activity' 
        };
    }
}

// Get daily activity summary for a specific date
export async function getDailyActivitySummary(date: Date): Promise<DailyActivitySummary | null> {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            throw new Error('User not authenticated');
        }

        // Use local date to avoid timezone issues
        const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

        const dailyActivity = await prisma.dailyActivity.findUnique({
            where: {
                userId_date: {
                    userId: session.user.id,
                    date: targetDate,
                },
            },
            include: {
                activities: {
                    orderBy: { createdAt: 'desc' },
                },
            },
        });

        if (!dailyActivity) {
            return {
                date: targetDate,
                hasActivity: false,
                totalXpEarned: 0,
                totalCreditsEarned: 0,
                totalTimeSpent: 0,
                activitiesCount: 0,
                isStreakDay: false,
                activities: [],
            };
        }

        return {
            date: dailyActivity.date,
            hasActivity: dailyActivity.hasActivity,
            totalXpEarned: dailyActivity.totalXpEarned,
            totalCreditsEarned: dailyActivity.totalCreditsEarned,
            totalTimeSpent: dailyActivity.totalTimeSpent,
            activitiesCount: dailyActivity.activitiesCount,
            isStreakDay: dailyActivity.isStreakDay,
            activities: dailyActivity.activities.map((activity: any) => ({
                id: activity.id,
                activityType: activity.activityType,
                title: activity.title,
                description: activity.description || undefined,
                xpEarned: activity.xpEarned,
                creditsEarned: activity.creditsEarned,
                timeSpent: activity.timeSpent,
                metadata: activity.metadata,
                createdAt: activity.createdAt,
            })),
        };
    } catch (error) {
        console.error('Error getting daily activity summary:', error);
        return null;
    }
}

// Get activity calendar data for a date range
export async function getActivityCalendar(startDate: Date, endDate: Date) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: 'User not authenticated' };
        }

        const activities = await prisma.dailyActivity.findMany({
            where: {
                userId: session.user.id,
                date: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            include: {
                activities: {
                    select: {
                        activityType: true,
                        title: true,
                        xpEarned: true,
                        creditsEarned: true,
                    },
                },
            },
            orderBy: { date: 'asc' },
        });

        const calendarData = activities.map((activity: any) => ({
            date: activity.date,
            hasActivity: activity.hasActivity,
            totalXpEarned: activity.totalXpEarned,
            totalCreditsEarned: activity.totalCreditsEarned,
            totalTimeSpent: activity.totalTimeSpent,
            activitiesCount: activity.activitiesCount,
            isStreakDay: activity.isStreakDay,
            activities: activity.activities,
        }));

        return { success: true, data: calendarData };
    } catch (error) {
        console.error('Error getting activity calendar:', error);
        return { 
            success: false, 
            error: error instanceof Error ? error.message : 'Failed to get activity calendar' 
        };
    }
}

// Get user's current and longest streak information
export async function getUserStreak(): Promise<{ success: boolean; data?: StreakInfo; error?: string }> {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: 'User not authenticated' };
        }

        // Get all activity dates for the user, ordered by date descending
        const activities = await prisma.dailyActivity.findMany({
            where: {
                userId: session.user.id,
                hasActivity: true,
                isStreakDay: true,
            },
            orderBy: { date: 'desc' },
            select: { date: true },
        });

        if (activities.length === 0) {
            return {
                success: true,
                data: {
                    currentStreak: 0,
                    longestStreak: 0,
                    lastActivityDate: null,
                    streakDates: [],
                }
            };
        }

        const dates = activities.map((a: any) => new Date(a.date.getFullYear(), a.date.getMonth(), a.date.getDate()));
        const today = new Date();
        const todayLocal = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const yesterday = new Date(todayLocal);
        yesterday.setDate(yesterday.getDate() - 1);

        let currentStreak = 0;
        
        // Check if there's activity today or yesterday
        const todayActivity = dates.find((date: Date) => date.getTime() === todayLocal.getTime());
        const yesterdayActivity = dates.find((date: Date) => date.getTime() === yesterday.getTime());
        
        if (todayActivity) {
            // Start counting from today
            currentStreak = 1;
            let checkDate = new Date(todayLocal);
            checkDate.setDate(checkDate.getDate() - 1);
            
            // Count consecutive days backwards
            for (let i = 1; i < dates.length; i++) {
                if (dates[i].getTime() === checkDate.getTime()) {
                    currentStreak++;
                    checkDate.setDate(checkDate.getDate() - 1);
                } else {
                    break;
                }
            }
        } else if (yesterdayActivity) {
            // Start counting from yesterday
            currentStreak = 1;
            let checkDate = new Date(yesterday);
            checkDate.setDate(checkDate.getDate() - 1);
            
            // Count consecutive days backwards
            for (let i = dates.findIndex((d: Date) => d.getTime() === yesterday.getTime()) + 1; i < dates.length; i++) {
                if (dates[i].getTime() === checkDate.getTime()) {
                    currentStreak++;
                    checkDate.setDate(checkDate.getDate() - 1);
                } else {
                    break;
                }
            }
        } else {
            // No recent activity, current streak is 0
            currentStreak = 0;
        }

        // Calculate longest streak
        const longestStreak = calculateLongestStreak(dates);

        return {
            success: true,
            data: {
                currentStreak,
                longestStreak: Math.max(currentStreak, longestStreak),
                lastActivityDate: dates[0] || null,
                streakDates: dates,
            }
        };
    } catch (error) {
        console.error('Error getting user streak:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to get streak data'
        };
    }
}

// Update user streak (called after tracking activity)
async function updateUserStreak(userId: string) {
    try {
        // This is handled by the trackActivity function
        // The streak calculation is done in getUserStreak
        console.log('Streak updated for user:', userId);
    } catch (error) {
        console.error('Error updating user streak:', error);
    }
}

// Calculate longest streak from dates array
function calculateLongestStreak(dates: Date[]): number {
    if (dates.length === 0) return 0;
    
    let longestStreak = 1;
    let currentStreak = 1;
    
    for (let i = 1; i < dates.length; i++) {
        const currentDate = new Date(dates[i-1]);
        const nextDate = new Date(dates[i]);
        
        // Check if dates are consecutive (previous day)
        currentDate.setDate(currentDate.getDate() - 1);
        
        if (currentDate.getTime() === nextDate.getTime()) {
            currentStreak++;
            longestStreak = Math.max(longestStreak, currentStreak);
        } else {
            currentStreak = 1;
        }
    }
    
    return longestStreak;
}

// Get recent activities for dashboard
export async function getRecentActivities(limit: number = 10) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: 'User not authenticated' };
        }

        const activities = await prisma.activityEntry.findMany({
            where: {
                userId: session.user.id,
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });

        return { success: true, data: activities };
    } catch (error) {
        console.error('Error getting recent activities:', error);
        return { 
            success: false, 
            error: error instanceof Error ? error.message : 'Failed to get recent activities' 
        };
    }
}

// Get activity stats for dashboard
export async function getActivityStats() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: 'User not authenticated' };
        }

        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        
        const [totalActivities, last30Days, streakInfo] = await Promise.all([
            prisma.activityEntry.count({
                where: { userId: session.user.id }
            }),
            prisma.dailyActivity.findMany({
                where: {
                    userId: session.user.id,
                    date: { gte: thirtyDaysAgo }
                },
                select: {
                    totalXpEarned: true,
                    totalCreditsEarned: true,
                    totalTimeSpent: true,
                    activitiesCount: true,
                }
            }),
            getUserStreak()
        ]);

        const last30DaysStats = last30Days.reduce(
            (acc: any, day: any) => ({
                totalXp: acc.totalXp + day.totalXpEarned,
                totalCredits: acc.totalCredits + day.totalCreditsEarned,
                totalTime: acc.totalTime + day.totalTimeSpent,
                totalActivities: acc.totalActivities + day.activitiesCount,
            }),
            { totalXp: 0, totalCredits: 0, totalTime: 0, totalActivities: 0 }
        );

        return {
            success: true,
            data: {
                totalActivitiesAllTime: totalActivities,
                last30Days: last30DaysStats,
                streak: streakInfo,
            }
        };
    } catch (error) {
        console.error('Error getting activity stats:', error);
        return { 
            success: false, 
            error: error instanceof Error ? error.message : 'Failed to get activity stats' 
        };
    }
} 