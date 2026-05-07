import { db, users, referrals, activityEntries } from "@repo/db";
import { eq, sql } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";

export async function processReferral(
    referralCode: string | null,
    newUserId: string,
    userName: string,
) {
    if (!referralCode) return;

    const [referrer] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.referralCode, referralCode))
        .limit(1);

    if (!referrer) return;

    await db.insert(referrals).values({
        referrerId: referrer.id,
        referredUserId: newUserId,
        referralCode,
    });

    await db
        .update(users)
        .set({ totalXp: sql`${users.totalXp} + 300` })
        .where(eq(users.id, referrer.id));

    const now = new Date();
    const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Note: activityEntries needs a dailyActivityId — for now we create a minimal entry.
    // Full activity tracking will be wired in the main app's activity service.
    // Here we just record the raw entry for the referrer and the new user.
    await db.insert(activityEntries).values([
        {
            id: createId(),
            userId: referrer.id,
            dailyActivityId: `signup-${referrer.id}-${todayDate.getTime()}`,
            activityType: "REFERRAL_BONUS",
            title: "Referral Bonus",
            description: `Earned 300 XP by referring ${userName}`,
            xpEarned: 300,
        },
        {
            id: createId(),
            userId: newUserId,
            dailyActivityId: `signup-${newUserId}-${todayDate.getTime()}`,
            activityType: "SIGNUP",
            title: "Joined BuildrHQ",
            description: "Joined through a referral and earned 250 XP",
            xpEarned: 250,
        },
    ]);
}

export async function generateReferralCode(name: string): Promise<string> {
    const normalized = name.replace(/\s+/g, "").toLowerCase().slice(0, 12);
    const suffixes = ["coderz", "pro123", "devhub", "bytez", "zone", "stacker", "wizkid"];

    for (let attempt = 0; attempt < 10; attempt++) {
        const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
        const code =
            attempt < 5
                ? normalized + suffix
                : normalized + suffix + Math.floor(Math.random() * 1000);

        const [existing] = await db
            .select({ id: users.id })
            .from(users)
            .where(eq(users.referralCode, code))
            .limit(1);

        if (!existing) return code;
    }

    const timestamp = Date.now().toString(36);
    const rand = Math.random().toString(36).slice(2, 8);
    return `ref${timestamp}${rand}`;
}

export async function createSignupActivity(userId: string) {
    const now = new Date();
    const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    await db.insert(activityEntries).values({
        id: createId(),
        userId,
        dailyActivityId: `signup-${userId}-${todayDate.getTime()}`,
        activityType: "SIGNUP",
        title: "Joined BuildrHQ",
        description: "Joined and earned 250 XP",
        xpEarned: 250,
    });
}