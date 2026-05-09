"use server"

import { getSession } from '@repo/auth';
import { headers } from 'next/headers';
import { db, referrals, users } from "@repo/db";
import { eq } from "drizzle-orm";

export async function getReferralStats() {
    try {
        const session = await getSession(headers());
        if (!session?.user?.id) {
            return {
                success: false,
                message: "Authentication required",
                stats: null
            };
        }

        const userId = session.user.id;

        // Get all referrals for this user
        const allReferrals = await db.query.referrals.findMany({
            where: eq(referrals.referrerId, userId),
            with: {
                referredUser: {
                    columns: { onboardingCompleted: true }
                }
            }
        });

        const totalReferrals = allReferrals.length;
        const successfulReferrals = allReferrals.filter(r => r.referredUser.onboardingCompleted).length;
        const pendingReferrals = allReferrals.filter(r => !r.referredUser.onboardingCompleted).length;

        // Calculate total XP earned (300 XP per successful referral)
        const totalXpEarned = successfulReferrals * 300;

        // Get user's referral code
        const user = await db.query.users.findFirst({
            where: eq(users.id, userId),
            columns: { referralCode: true }
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
        const session = await getSession(headers());
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

        // Get all referrals with referred user details
        const allReferrals = await db.query.referrals.findMany({
            where: eq(referrals.referrerId, userId),
            with: {
                referredUser: {
                    columns: {
                        name: true,
                        email: true,
                        image: true,
                        onboardingCompleted: true,
                        createdAt: true
                    }
                }
            },
            orderBy: (referrals, { desc }) => [desc(referrals.createdAt)],
        });

        // Filter by status
        const filtered = status === "successful"
            ? allReferrals.filter(r => r.referredUser.onboardingCompleted)
            : status === "pending"
                ? allReferrals.filter(r => !r.referredUser.onboardingCompleted)
                : allReferrals;

        const total = filtered.length;
        const paginated = filtered.slice(skip, skip + limit);
        const totalPages = Math.ceil(total / limit);

        return {
            success: true,
            referrals: paginated.map(ref => ({
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
