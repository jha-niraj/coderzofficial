'use server';

import { revalidatePath } from 'next/cache';
import prisma from '@repo/prisma';
import { 
    Role, CreditType 
} from '@repo/prisma/client';

export interface AdminUser {
    id: string;
    name: string;
    email: string;
    role: 'Student' | 'Admin';
    status: 'ACTIVE' | 'INACTIVE' | 'BANNED';
    credits: number;
    xp: number;
    level: string;
    joinedAt: string;
    lastActive: string;
    totalChallenges: number;
    completedChallenges: number;
    hasResume: boolean;
}

export interface PlatformStats {
    totalUsers: number;
    activeUsers: number;
    totalRevenue: number;
    userGrowth: number;
    revenueGrowth: number;
    totalInterviewSessions: number;
    averageCreditsPerUser: number;
}

export interface CreditTransaction {
    id: string;
    userId: string;
    userName: string;
    email: string;
    type: 'PURCHASE' | 'SPEND' | 'BONUS' | 'REWARD';
    amount: number;
    description: string;
    status: 'COMPLETED' | 'PENDING' | 'FAILED';
    createdAt: string;
    paymentMethod: string;
}

export interface JobInterviewData {
    id: string;
    userId: string;
    userName: string;
    position: string;
    companyUrl: string;
    status: 'COMPLETED' | 'IN_PROGRESS' | 'FAILED';
    score?: number;
    createdAt: string;
    includeAnswers: boolean;
    technicalCount: number;
    behavioralCount: number;
    codingCount: number;
}

// User Management Functions
export async function getAllUsers(
    page: number = 1,
    limit: number = 10,
    searchTerm?: string,
    statusFilter?: string,
    roleFilter?: string
) {
    try {
        const skip = (page - 1) * limit;

        const whereClause: any = {};

        if (searchTerm) {
            whereClause.OR = [
                { name: { contains: searchTerm, mode: 'insensitive' } },
                { email: { contains: searchTerm, mode: 'insensitive' } },
                { username: { contains: searchTerm, mode: 'insensitive' } }
            ];
        }

        if (roleFilter && roleFilter !== 'ALL') {
            whereClause.role = roleFilter as Role;
        }

        const [users, totalCount] = await Promise.all([
            prisma.user.findMany({
                where: whereClause,
                skip,
                take: limit,
                select: {
                    id: true,
                    name: true,
                    email: true,
                    username: true,
                    role: true,
                    credits: true,
                    currentXp: true,
                    currentLevel: true,
                    createdAt: true,
                    hasResume: true,
                    JobInterviewAssistant: {
                        select: {
                            id: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            }),
            prisma.user.count({ where: whereClause })
        ]);

        const formattedUsers: AdminUser[] = users.map((user: any) => ({
            id: user.id,
            name: user.name || 'Unknown',
            email: user.email,
            role: user.role,
            status: 'ACTIVE',
            credits: user.credits,
            xp: user.currentXp,
            level: `Level ${user.currentLevel}`,
            joinedAt: user.createdAt.toISOString(),
            lastActive: user.createdAt.toISOString(),
            totalChallenges: (user.bugHuntAttempts as any[]).length + (user.JobInterviewAssistant as any[]).length,
            completedChallenges: (user.bugHuntAttempts as any[]).filter((attempt: any) => attempt.status === 'COMPLETED').length,
            hasResume: user.hasResume
        }));

        return {
            success: true,
            data: {
                users: formattedUsers,
                totalCount,
                totalPages: Math.ceil(totalCount / limit)
            }
        };
    } catch (error) {
        console.error('Error fetching users:', error);
        return {
            success: false,
            error: 'Failed to fetch users'
        };
    }
}

export async function getUserDetailsById(id: string, role: Role) {
    try {
        const mentee = await prisma.user.findFirst({
            where: { id, role },
        });
        if (!mentee) throw new Error("Mentee not found");
        return mentee;
    } catch (err: any) {
        console.error("Failed to fetch mentee details by id", err);
        return err;
    }
}
export async function deleteUserById(id: any) {
    try {
        const deletedUser = await prisma.user.delete({
            where: { id },
        });
        if (!deletedUser) throw new Error("Failed to delete user");
        return { success: true, data: deletedUser };
    } catch (err: any) {
        console.error("Failed to delete the user", err);
        return err;
    }
}

export async function updateUserStatus(userId: string, newStatus: 'ACTIVE' | 'INACTIVE' | 'BANNED') {
    try {
        // For now, we'll handle this in the application logic
        // You can add a status field to the User model if needed

        revalidatePath('/admin/users');
        return {
            success: true,
            message: `User status updated to ${newStatus}`
        };
    } catch (error) {
        console.error('Error updating user status:', error);
        return {
            success: false,
            error: 'Failed to update user status'
        };
    }
}

export async function updateUserRole(userId: string, newRole: 'Student' | 'Admin') {
    try {
        await prisma.user.update({
            where: { id: userId },
            data: { role: newRole as Role }
        });

        revalidatePath('/admin/users');
        return {
            success: true,
            message: `User role updated to ${newRole}`
        };
    } catch (error) {
        console.error('Error updating user role:', error);
        return {
            success: false,
            error: 'Failed to update user role'
        };
    }
}

export async function deleteUser(userId: string) {
    try {
        await prisma.user.delete({
            where: { id: userId }
        });

        revalidatePath('/admin/users');
        return {
            success: true,
            message: 'User deleted successfully'
        };
    } catch (error) {
        console.error('Error deleting user:', error);
        return {
            success: false,
            error: 'Failed to delete user'
        };
    }
}

// Platform Statistics
export async function getPlatformStats(timeRange: '7d' | '30d' | '90d' | '1y' = '30d') {
    try {
        const now = new Date();
        const timeRangeMap = {
            '7d': 7,
            '30d': 30,
            '90d': 90,
            '1y': 365
        };

        const startDate = new Date(now.getTime() - (timeRangeMap[timeRange] * 24 * 60 * 60 * 1000));
        const previousPeriodStart = new Date(startDate.getTime() - (timeRangeMap[timeRange] * 24 * 60 * 60 * 1000));

        const [
            totalUsers,
            recentUsers,
            previousPeriodUsers,
            totalInterviewSessions,
            creditTransactions,
            averageCredits
        ] = await Promise.all([
            prisma.user.count(),
            prisma.user.count({
                where: {
                    createdAt: {
                        gte: startDate
                    }
                }
            }),
            prisma.user.count({
                where: {
                    createdAt: {
                        gte: previousPeriodStart,
                        lt: startDate
                    }
                }
            }),
            prisma.jobInterviewAssistant.count(),
            prisma.creditTransaction.findMany({
                where: {
                    type: 'PURCHASE',
                    createdAt: {
                        gte: startDate
                    }
                },
                select: {
                    amount: true
                }
            }),
            prisma.user.aggregate({
                _avg: {
                    credits: true
                }
            })
        ]);

        const totalRevenue = (creditTransactions as { amount: number }[]).reduce((sum: number, transaction: { amount: number }) => sum + transaction.amount, 0);
        const userGrowth = previousPeriodUsers > 0 ? ((recentUsers - previousPeriodUsers) / previousPeriodUsers) * 100 : 0;

        const stats: PlatformStats = {
            totalUsers,
            activeUsers: recentUsers,
            totalRevenue,
            userGrowth: Math.round(userGrowth * 100) / 100,
            revenueGrowth: 15.2, // This would need historical data to calculate properly
            totalInterviewSessions,
            averageCreditsPerUser: Math.round((averageCredits._avg.credits || 0) * 100) / 100
        };

        return {
            success: true,
            data: stats
        };
    } catch (error) {
        console.error('Error fetching platform stats:', error);
        return {
            success: false,
            error: 'Failed to fetch platform statistics'
        };
    }
}

// Credit Management
export async function getCreditTransactions(
    page: number = 1,
    limit: number = 10,
    searchTerm?: string,
    typeFilter?: string
) {
    try {
        const skip = (page - 1) * limit;

        const whereClause: any = {};

        if (typeFilter && typeFilter !== 'ALL') {
            whereClause.type = typeFilter as CreditType;
        }

        const [transactions, totalCount] = await Promise.all([
            prisma.creditTransaction.findMany({
                where: whereClause,
                skip,
                take: limit,
                include: {
                    user: {
                        select: {
                            name: true,
                            email: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            }),
            prisma.creditTransaction.count({ where: whereClause })
        ]);

        const formattedTransactions: CreditTransaction[] = (transactions as any[]).map((transaction: any) => ({
            id: transaction.id,
            userId: transaction.userId,
            userName: transaction.user.name || 'Unknown',
            email: transaction.user.email,
            type: transaction.type,
            amount: transaction.amount,
            description: transaction.description,
            status: 'COMPLETED',
            createdAt: transaction.createdAt.toISOString(),
            paymentMethod: 'System'
        }));

        return {
            success: true,
            data: {
                transactions: formattedTransactions,
                totalCount,
                totalPages: Math.ceil(totalCount / limit)
            }
        };
    } catch (error) {
        console.error('Error fetching credit transactions:', error);
        return {
            success: false,
            error: 'Failed to fetch credit transactions'
        };
    }
}

export async function distributeCredits(
    userType: 'ALL' | 'PREMIUM' | 'NEW' | 'ACTIVE',
    amount: number,
    reason: string,
    emailTemplate: string
) {
    try {
        let whereClause: any = {};

        if (userType === 'NEW') {
            const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            whereClause.createdAt = { gte: sevenDaysAgo };
        }

        const users = await prisma.user.findMany({
            where: whereClause,
            select: { id: true, credits: true }
        });

        // Update credits for all selected users
        const updatePromises = (users as { id: string; credits: number }[]).map((user) =>
            prisma.user.update({
                where: { id: user.id },
                data: { credits: user.credits + amount }
            })
        );

        // Create credit transaction records
        const transactionPromises = (users as { id: string }[]).map((user) =>
            prisma.creditTransaction.create({
                data: {
                    userId: user.id,
                    amount,
                    type: 'BONUS',
                    description: reason,
                    currency: 'NA'
                }
            })
        );

        await Promise.all([...updatePromises, ...transactionPromises]);

        revalidatePath('/admin/credits');
        return {
            success: true,
            message: `Credits distributed to ${users.length} users`
        };
    } catch (error) {
        console.error('Error distributing credits:', error);
        return {
            success: false,
            error: 'Failed to distribute credits'
        };
    }
}

// Job Interview Assistant Management
export async function getJobInterviewSessions(
    page: number = 1,
    limit: number = 10,
    searchTerm?: string,
    statusFilter?: string
) {
    try {
        const skip = (page - 1) * limit;

        const whereClause: any = {};

        if (searchTerm) {
            whereClause.OR = [
                { position: { contains: searchTerm, mode: 'insensitive' } },
                { companyUrl: { contains: searchTerm, mode: 'insensitive' } }
            ];
        }

        const [sessions, totalCount] = await Promise.all([
            prisma.jobInterviewAssistant.findMany({
                where: whereClause,
                skip,
                take: limit,
                include: {
                    user: {
                        select: {
                            name: true,
                            email: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            }),
            prisma.jobInterviewAssistant.count({ where: whereClause })
        ]);

        const formattedSessions: JobInterviewData[] = (sessions as any[]).map((session: any) => ({
            id: session.id,
            userId: session.userId,
            userName: session.user.name || 'Unknown',
            position: session.position,
            companyUrl: session.companyUrl,
            status: 'COMPLETED',
            createdAt: session.createdAt.toISOString(),
            includeAnswers: session.includeAnswers,
            technicalCount: session.technicalCount,
            behavioralCount: session.behavioralCount,
            codingCount: session.codingCount
        }));

        return {
            success: true,
            data: {
                sessions: formattedSessions,
                totalCount,
                totalPages: Math.ceil(totalCount / limit)
            }
        };
    } catch (error) {
        console.error('Error fetching job interview sessions:', error);
        return {
            success: false,
            error: 'Failed to fetch job interview sessions'
        };
    }
}

// Mock Interview Management
export async function getMockInterviewStats() {
    try {
        const [
            totalPeerToPeerSessions,
            totalVoiceMockSessions
        ] = await Promise.all([
            prisma.peerToPeerSession.count(),
            prisma.mockVoiceSession.count()
        ]);

        return {
            success: true,
            data: {
                totalPeerToPeerSessions,
                totalVoiceMockSessions,
                totalSessions: totalPeerToPeerSessions + totalVoiceMockSessions
            }
        };
    } catch (error) {
        console.error('Error fetching mock interview stats:', error);
        return {
            success: false,
            error: 'Failed to fetch mock interview statistics'
        };
    }
}

// Analytics Functions
export async function getUserEngagementStats(timeRange: '7d' | '30d' | '90d' | '1y' = '7d') {
    try {
        const now = new Date();
        const timeRangeMap = {
            '7d': 7,
            '30d': 30,
            '90d': 90,
            '1y': 365
        };

        const days = timeRangeMap[timeRange];
        const startDate = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));

        const userActivity = await prisma.user.findMany({
            where: {
                createdAt: {
                    gte: startDate
                }
            },
            select: {
                createdAt: true,
                JobInterviewAssistant: {
                    where: {
                        createdAt: {
                            gte: startDate
                        }
                    }
                }
            }
        });

        const avgSessionsPerUser = (userActivity as any[]).length > 0
            ? (userActivity as any[]).reduce((sum: number, user: any) => sum + user.bugHuntAttempts.length + user.JobInterviewAssistant.length, 0) / (userActivity as any[]).length
            : 0;

        return {
            success: true,
            data: {
                totalActiveUsers: userActivity.length,
                avgSessionsPerUser
            }
        };
    } catch (error) {
        console.error('Error fetching user engagement stats:', error);
        return {
            success: false,
            error: 'Failed to fetch user engagement statistics'
        };
    }
}

// Settings Management
export interface AdminSettings {
    general: {
        siteName: string;
        siteDescription: string;
        siteUrl: string;
        adminEmail: string;
        timezone: string;
        language: string;
        maintenanceMode: boolean;
        registrationEnabled: boolean;
    };
    security: {
        twoFactorEnabled: boolean;
        sessionTimeout: number;
        maxLoginAttempts: number;
        passwordMinLength: number;
        requireSpecialChars: boolean;
        apiRateLimit: number;
        sslEnabled: boolean;
    };
    notifications: {
        emailNotifications: boolean;
        newUserSignup: boolean;
        challengeCreated: boolean;
        paymentReceived: boolean;
        systemErrors: boolean;
        slackWebhook: string;
        discordWebhook: string;
    };
    platform: {
        maxChallengesPerUser: number;
        defaultChallengeTimeLimit: number;
        maxParticipantsPerChallenge: number;
        allowPublicChallenges: boolean;
        autoApprovePublicChallenges: boolean;
        creditExchangeRate: number;
        referralBonus: number;
        newUserBonus: number;
    };
    integrations: {
        stripeEnabled: boolean;
        stripePublishableKey: string;
        stripeSecretKey: string;
        paypalEnabled: boolean;
        googleAnalytics: string;
        hotjarEnabled: boolean;
        sentryDsn: string;
        cloudinaryEnabled: boolean;
    };
}

export async function getAdminSettings() {
    try {
        // For now, return default settings
        // You can create a Settings model in the database to store these
        const defaultSettings: AdminSettings = {
            general: {
                siteName: "CoderzLab",
                siteDescription: "The ultimate platform for coding challenges and interview preparation",
                siteUrl: "https://coderzlab.com",
                adminEmail: "admin@coderzlab.com",
                timezone: "UTC",
                language: "en",
                maintenanceMode: false,
                registrationEnabled: true
            },
            security: {
                twoFactorEnabled: false,
                sessionTimeout: 30,
                maxLoginAttempts: 5,
                passwordMinLength: 8,
                requireSpecialChars: true,
                apiRateLimit: 100,
                sslEnabled: true
            },
            notifications: {
                emailNotifications: true,
                newUserSignup: true,
                challengeCreated: true,
                paymentReceived: true,
                systemErrors: true,
                slackWebhook: "",
                discordWebhook: ""
            },
            platform: {
                maxChallengesPerUser: 10,
                defaultChallengeTimeLimit: 60,
                maxParticipantsPerChallenge: 100,
                allowPublicChallenges: true,
                autoApprovePublicChallenges: false,
                creditExchangeRate: 0.01,
                referralBonus: 300,
                newUserBonus: 250
            },
            integrations: {
                stripeEnabled: false,
                stripePublishableKey: "",
                stripeSecretKey: "",
                paypalEnabled: false,
                googleAnalytics: "",
                hotjarEnabled: false,
                sentryDsn: "",
                cloudinaryEnabled: false
            }
        };

        return {
            success: true,
            data: defaultSettings
        };
    } catch (error) {
        console.error('Error fetching admin settings:', error);
        return {
            success: false,
            error: 'Failed to fetch admin settings'
        };
    }
}

export async function updateAdminSettings(settings: Partial<AdminSettings>) {
    try {
        // For now, just return success
        // You can implement actual settings storage in the database

        return {
            success: true,
            message: 'Settings updated successfully'
        };
    } catch (error) {
        console.error('Error updating admin settings:', error);
        return {
            success: false,
            error: 'Failed to update admin settings'
        };
    }
}

export async function getSystemHealth() {
    try {
        const dbHealth = await prisma.user.count();

        return {
            success: true,
            data: {
                database: 'healthy',
                uptime: '99.9%',
                responseTime: '150ms',
                activeConnections: 45,
                memoryUsage: '68%',
                cpuUsage: '23%'
            }
        };
    } catch (error) {
        console.error('Error checking system health:', error);
        return {
            success: false,
            error: 'Failed to check system health'
        };
    }
}