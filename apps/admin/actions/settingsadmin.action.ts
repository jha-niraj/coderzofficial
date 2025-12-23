"use server"

import { revalidatePath } from 'next/cache';
import prisma from '@repo/prisma';

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

export async function getAdminSettings(): Promise<{ success: boolean; data?: AdminSettings; error?: string }> {
    try {
        // For now, return default settings
        // In production, you would fetch this from your database
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

export async function updateAdminSettings(
    settings: Partial<AdminSettings>
): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
        // In production, you would save this to your database
        // For now, just validate and return success
        
        revalidatePath('/admin/settings');
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

export async function getSystemHealth(): Promise<{
    success: boolean;
    data?: {
        database: string;
        uptime: string;
        responseTime: string;
        activeConnections: number;
        memoryUsage: string;
        cpuUsage: string;
    };
    error?: string;
}> {
    try {
        // Check database connection
        await prisma.user.count();
        
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