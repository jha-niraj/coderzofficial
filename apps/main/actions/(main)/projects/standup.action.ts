"use server";

import { auth } from '@repo/auth';
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

interface ActionResponse {
    success: boolean;
    data?: any;
    error?: string;
}

async function getCurrentUser() {
    const session = await auth();
    if (!session?.user?.email) throw new Error("Not authenticated");
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) throw new Error("User not found");
    return user;
}

async function deductCredits(userId: string, amount: number, description: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { credits: true },
    });

    if (!user || user.credits < amount) {
        throw new Error("Insufficient credits");
    }

    await prisma.$transaction([
        prisma.user.update({
            where: { id: userId },
            data: { credits: { decrement: amount } },
        }),
        prisma.creditTransaction.create({
            data: {
                userId,
                amount: -amount,
                type: "SPEND",
                currency: "NA",
                description,
            },
        }),
    ]);
}

// ========================================
// CHECK IF STANDUP CONFIG EXISTS
// ========================================

export async function checkStandupConfig(projectId: string): Promise<ActionResponse> {
    try {
        const user = await getCurrentUser();

        const config = await prisma.projectV2StandupConfig.findUnique({
            where: { userId_projectId: { userId: user.id, projectId } },
        });

        return {
            success: true,
            data: {
                exists: !!config,
                config: config || null,
            },
        };
    } catch (error: any) {
        console.error("[CHECK_STANDUP_CONFIG]", error);
        return { success: false, error: error.message };
    }
}

// ========================================
// CREATE STANDUP CONFIGURATION
// ========================================

interface StandupConfigInput {
    projectId: string;
    projectSlug: string;
    daysPerWeek: number; // 4-7
    standupTime: string; // HH:MM format
    durationMinutes: number; // 5-10
    selectedDays: number[]; // [1,2,3,4,5] for Mon-Fri
}

export async function createStandupConfig(input: StandupConfigInput): Promise<ActionResponse> {
    try {
        const user = await getCurrentUser();

        // Validate input
        if (input.daysPerWeek < 4 || input.daysPerWeek > 7) {
            return { success: false, error: "Days per week must be between 4 and 7" };
        }

        if (input.durationMinutes < 5 || input.durationMinutes > 10) {
            return { success: false, error: "Duration must be between 5 and 10 minutes" };
        }

        if (input.selectedDays.length !== input.daysPerWeek) {
            return { success: false, error: "Selected days must match days per week" };
        }

        // Check if config already exists
        const existing = await prisma.projectV2StandupConfig.findUnique({
            where: { userId_projectId: { userId: user.id, projectId: input.projectId } },
        });

        if (existing) {
            return { success: false, error: "Standup configuration already exists for this project" };
        }

        // Calculate costs
        const creditsPerDay = 5;
        const weeklyCredits = input.daysPerWeek * creditsPerDay;

        // Check if user has enough credits
        if (user.credits < weeklyCredits) {
            return {
                success: false,
                error: `Insufficient credits. You need ${weeklyCredits} credits (${input.daysPerWeek} days × ${creditsPerDay} credits/day)`,
            };
        }

        // Calculate week start and end
        const now = new Date();
        const currentDay = now.getDay();
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - currentDay); // Start of current week (Sunday)
        weekStart.setHours(0, 0, 0, 0);

        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 7); // End of current week

        // Deduct credits
        await deductCredits(
            user.id,
            weeklyCredits,
            `Daily Standup - Week ${weekStart.toISOString().split('T')[0]}`
        );

        // Create configuration
        const config = await prisma.projectV2StandupConfig.create({
            data: {
                userId: user.id,
                projectId: input.projectId,
                daysPerWeek: input.daysPerWeek,
                standupTime: input.standupTime,
                durationMinutes: input.durationMinutes,
                selectedDays: input.selectedDays,
                creditsPerDay,
                weeklyCredits,
                currentWeekStart: weekStart,
                currentWeekEnd: weekEnd,
                isActive: true,
            },
        });

        // Create standup entries for the current week
        const entries = [];
        for (let i = 0; i < 7; i++) {
            const dayOfWeek = i;
            if (input.selectedDays.includes(dayOfWeek)) {
                const scheduledDate = new Date(weekStart);
                scheduledDate.setDate(weekStart.getDate() + i);
                
                // Set the time
                const [hours, minutes] = input.standupTime.split(':');
                scheduledDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

                // Only create entries for future dates
                if (scheduledDate > now) {
                    entries.push({
                        configId: config.id,
                        scheduledFor: scheduledDate,
                        status: "SCHEDULED",
                    });
                }
            }
        }

        if (entries.length > 0) {
            await prisma.projectV2StandupEntry.createMany({
                data: entries,
            });
        }

        // Update config with total standups
        await prisma.projectV2StandupConfig.update({
            where: { id: config.id },
            data: { totalStandups: entries.length },
        });

        revalidatePath(`/projects/${input.projectSlug}`);
        revalidatePath(`/projects/${input.projectSlug}/tasks`);

        return {
            success: true,
            data: config,
        };

    } catch (error: any) {
        console.error("[CREATE_STANDUP_CONFIG]", error);
        return { success: false, error: error.message };
    }
}

// ========================================
// RENEW STANDUP FOR NEXT WEEK
// ========================================

export async function renewStandupConfig(projectId: string, projectSlug: string): Promise<ActionResponse> {
    try {
        const user = await getCurrentUser();

        const config = await prisma.projectV2StandupConfig.findUnique({
            where: { userId_projectId: { userId: user.id, projectId } },
        });

        if (!config) {
            return { success: false, error: "Standup configuration not found" };
        }

        if (!config.isActive) {
            return { success: false, error: "Standup configuration is not active" };
        }

        // Check if user has enough credits
        if (user.credits < config.weeklyCredits) {
            return {
                success: false,
                error: `Insufficient credits. You need ${config.weeklyCredits} credits for next week`,
            };
        }

        // Deduct credits
        const nextWeekStart = new Date(config.currentWeekEnd);
        await deductCredits(
            user.id,
            config.weeklyCredits,
            `Daily Standup - Week ${nextWeekStart.toISOString().split('T')[0]}`
        );

        // Update config for next week
        const nextWeekEnd = new Date(nextWeekStart);
        nextWeekEnd.setDate(nextWeekStart.getDate() + 7);

        await prisma.projectV2StandupConfig.update({
            where: { id: config.id },
            data: {
                currentWeekStart: nextWeekStart,
                currentWeekEnd: nextWeekEnd,
            },
        });

        // Create standup entries for next week
        const entries = [];
        for (let i = 0; i < 7; i++) {
            const dayOfWeek = i;
            if (config.selectedDays.includes(dayOfWeek)) {
                const scheduledDate = new Date(nextWeekStart);
                scheduledDate.setDate(nextWeekStart.getDate() + i);
                
                const [hours, minutes] = config.standupTime.split(':');
                scheduledDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

                entries.push({
                    configId: config.id,
                    scheduledFor: scheduledDate,
                    status: "SCHEDULED",
                });
            }
        }

        await prisma.projectV2StandupEntry.createMany({
            data: entries,
        });

        // Update total standups count
        await prisma.projectV2StandupConfig.update({
            where: { id: config.id },
            data: { totalStandups: { increment: entries.length } },
        });

        revalidatePath(`/projects/${projectSlug}`);

        return {
            success: true,
            data: { message: "Standup renewed for next week", config },
        };

    } catch (error: any) {
        console.error("[RENEW_STANDUP_CONFIG]", error);
        return { success: false, error: error.message };
    }
}

// ========================================
// GET UPCOMING STANDUPS
// ========================================

export async function getUpcomingStandups(projectId: string): Promise<ActionResponse> {
    try {
        const user = await getCurrentUser();

        const config = await prisma.projectV2StandupConfig.findUnique({
            where: { userId_projectId: { userId: user.id, projectId } },
            include: {
                standupEntries: {
                    where: {
                        scheduledFor: { gte: new Date() },
                        status: { in: ["SCHEDULED", "SUBMITTED"] },
                    },
                    orderBy: { scheduledFor: 'asc' },
                    take: 10,
                },
            },
        });

        if (!config) {
            return { success: false, error: "No standup configuration found" };
        }

        return {
            success: true,
            data: {
                config,
                upcomingStandups: config.standupEntries,
            },
        };

    } catch (error: any) {
        console.error("[GET_UPCOMING_STANDUPS]", error);
        return { success: false, error: error.message };
    }
}

// ========================================
// SUBMIT STANDUP ENTRY
// ========================================

interface StandupSubmission {
    entryId: string;
    whatDidYesterday: string;
    whatDoingToday: string;
    anyBlockers: string;
    recordingUrl?: string;
    durationSeconds?: number;
}

export async function submitStandup(input: StandupSubmission, projectSlug: string): Promise<ActionResponse> {
    try {
        const user = await getCurrentUser();

        const entry = await prisma.projectV2StandupEntry.findUnique({
            where: { id: input.entryId },
            include: { config: true },
        });

        if (!entry) {
            return { success: false, error: "Standup entry not found" };
        }

        if (entry.config.userId !== user.id) {
            return { success: false, error: "Unauthorized" };
        }

        if (entry.status === "SUBMITTED") {
            return { success: false, error: "Standup already submitted" };
        }

        // Update entry
        await prisma.projectV2StandupEntry.update({
            where: { id: input.entryId },
            data: {
                whatDidYesterday: input.whatDidYesterday,
                whatDoingToday: input.whatDoingToday,
                anyBlockers: input.anyBlockers,
                recordingUrl: input.recordingUrl,
                durationSeconds: input.durationSeconds,
                status: "SUBMITTED",
                submittedAt: new Date(),
            },
        });

        // Update config stats
        await prisma.projectV2StandupConfig.update({
            where: { id: entry.configId },
            data: { completedStandups: { increment: 1 } },
        });

        revalidatePath(`/projects/${projectSlug}`);

        return {
            success: true,
            data: { message: "Standup submitted successfully" },
        };

    } catch (error: any) {
        console.error("[SUBMIT_STANDUP]", error);
        return { success: false, error: error.message };
    }
}

// ========================================
// DEACTIVATE STANDUP CONFIG
// ========================================

export async function deactivateStandupConfig(projectId: string, projectSlug: string): Promise<ActionResponse> {
    try {
        const user = await getCurrentUser();

        const config = await prisma.projectV2StandupConfig.findUnique({
            where: { userId_projectId: { userId: user.id, projectId } },
        });

        if (!config) {
            return { success: false, error: "Standup configuration not found" };
        }

        await prisma.projectV2StandupConfig.update({
            where: { id: config.id },
            data: { isActive: false },
        });

        // Mark all future scheduled standups as missed
        await prisma.projectV2StandupEntry.updateMany({
            where: {
                configId: config.id,
                scheduledFor: { gte: new Date() },
                status: "SCHEDULED",
            },
            data: { status: "MISSED" },
        });

        revalidatePath(`/projects/${projectSlug}`);

        return {
            success: true,
            data: { message: "Standup configuration deactivated" },
        };

    } catch (error: any) {
        console.error("[DEACTIVATE_STANDUP_CONFIG]", error);
        return { success: false, error: error.message };
    }
}


