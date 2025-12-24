"use server"

import { auth } from '@repo/auth';
import { prisma } from "@repo/prisma";

export async function getReferralStats() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return {
                success: false,
                message: "Authentication required",
                stats: null
            };
        }

        const userId = session.user.id;

        // Get total referrals
        const totalReferrals = await prisma.referral.count({
            where: { referrerId: userId }
        });

        // Get successful referrals (those who completed onboarding)
        const successfulReferrals = await prisma.referral.count({
            where: {
                referrerId: userId,
                referredUser: {
                    onboardingCompleted: true
                }
            }
        });

        // Get pending referrals (those who haven't completed onboarding)
        const pendingReferrals = await prisma.referral.count({
            where: {
                referrerId: userId,
                referredUser: {
                    onboardingCompleted: false
                }
            }
        });

        // Calculate total XP earned (300 XP per successful referral)
        const totalXpEarned = successfulReferrals * 300;

        // Get user's referral code
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { referralCode: true }
        });

        return {
            success: true,
            stats: {
                totalReferrals,
                successfulReferrals,
                pendingReferrals,
                totalXpEarned,
                referralCode: user?.referralCode || ""
            }
        };
    } catch (error) {
        console.error("Error fetching referral stats:", error);
        return {
            success: false,
            message: "Failed to fetch referral stats",
            stats: null
        };
    }
}

export async function getReferrals(page: number = 1, limit: number = 10, status: string = "all") {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return {
                success: false,
                message: "Authentication required",
                referrals: [],
                total: 0,
                totalPages: 0
            };
        }

        const userId = session.user.id;
        const skip = (page - 1) * limit;

        // Build where clause based on status filter
        let whereClause: any = { referrerId: userId };
        
        if (status === "successful") {
            whereClause.referredUser = { onboardingCompleted: true };
        } else if (status === "pending") {
            whereClause.referredUser = { onboardingCompleted: false };
        }

        // Get total count
        const total = await prisma.referral.count({ where: whereClause });

        // Get referrals with pagination
        const referrals = await prisma.referral.findMany({
            where: whereClause,
            include: {
                referredUser: {
                    select: {
                        name: true,
                        email: true,
                        image: true,
                        onboardingCompleted: true,
                        createdAt: true
                    }
                }
            },
            orderBy: { createdAt: "desc" },
            skip,
            take: limit
        });

        const totalPages = Math.ceil(total / limit);

        return {
            success: true,
            referrals: referrals.map(ref => ({
                id: ref.id,
                referralCode: ref.referralCode,
                pointsAwarded: ref.pointsAwarded,
                createdAt: ref.createdAt.toISOString(),
                referredUser: {
                    name: ref.referredUser.name,
                    email: ref.referredUser.email,
                    image: ref.referredUser.image,
                    onboardingCompleted: ref.referredUser.onboardingCompleted,
                    createdAt: ref.referredUser.createdAt.toISOString()
                }
            })),
            total,
            totalPages,
            currentPage: page
        };
    } catch (error) {
        console.error("Error fetching referrals:", error);
        return {
            success: false,
            message: "Failed to fetch referrals",
            referrals: [],
            total: 0,
            totalPages: 0
        };
    }
}


