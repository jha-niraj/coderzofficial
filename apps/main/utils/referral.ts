import { db, users, referrals, recentActivities } from "@repo/db";
import { eq, sql } from "drizzle-orm";

export async function processReferral(referralCode: string | null, newUserId: string, userName: string) {
    if (!referralCode) return;

    const referrer = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.referralCode, referralCode))
        .limit(1);

    if (!referrer[0]) return;

    const referrerId = referrer[0].id;

    await db.insert(referrals).values({
        referrerId,
        referredUserId: newUserId,
        referralCode,
    });

    await db
        .update(users)
        .set({
            currentXp: sql`${users.currentXp} + 300`,
            totalXp: sql`${users.totalXp} + 300`,
            referralCount: sql`${users.referralCount} + 1`,
        })
        .where(eq(users.id, referrerId));

    await db.insert(recentActivities).values({
        userId: referrerId,
        activityType: "REFERRAL_BONUS",
        description: `Earned 300 XP by referring ${userName}`,
    });

    await db.insert(recentActivities).values({
        userId: newUserId,
        activityType: "SIGNUP",
        description: `Joined through a referral and earned 250 XP`,
    });
}

export async function generateReferralCode(name: string): Promise<string> {
    const normalized = name.replace(/\s+/g, '').toLowerCase();
    const suffixes = ['coderz', 'pro123', 'devhub', 'bytez', 'zone', 'stacker', 'wizkid'];

    for (let attempt = 0; attempt < 10; attempt++) {
        const randomSuffix = suffixes[Math.floor(Math.random() * suffixes.length)];
        const referralCode = normalized + randomSuffix;

        const existing = await db
            .select({ id: users.id })
            .from(users)
            .where(eq(users.referralCode, referralCode))
            .limit(1);

        if (existing.length === 0) {
            return referralCode;
        }

        const referralCodeWithNumber = referralCode + Math.floor(Math.random() * 1000);
        const existingWithNumber = await db
            .select({ id: users.id })
            .from(users)
            .where(eq(users.referralCode, referralCodeWithNumber))
            .limit(1);

        if (existingWithNumber.length === 0) {
            return referralCodeWithNumber;
        }
    }

    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substring(2, 8);
    return `ref${timestamp}${randomPart}`;
}

export async function createSignupActivity(userId: string) {
    await db.insert(recentActivities).values({
        userId,
        activityType: "SIGNUP",
        description: `Joined and earned 250 XP`,
    });
}
