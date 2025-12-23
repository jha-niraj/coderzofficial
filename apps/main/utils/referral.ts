import { prisma } from "@/lib/prisma";
import { ActivityType } from "@prisma/client";

export async function processReferral(referralCode: string | null, newUserId: string, userName: string) {
    if (!referralCode) return;

    const referrer = await prisma.user.findFirst({
        where: { referralCode },
    });

    if (!referrer) return;

    await prisma.referral.create({
        data: {
            referrerId: referrer.id,
            referredUserId: newUserId,
            referralCode,
        },
    });

    await prisma.user.update({
        where:
        {
            id: referrer.id
        },
        data: {
            currentXp: {
                increment: 300
            },
            totalXp: {
                increment: 300
            },
            referralCount: {
                increment: 1
            },
        },
    });

    await prisma.recentActivity.create({
        data: {
            userId: referrer.id,
            activityType: ActivityType.REFERRAL_BONUS,
            description: `Earned 300 XP by referring ${userName}`,
        },
    });

    await prisma.recentActivity.create({
        data: {
            userId: newUserId,
            activityType: ActivityType.SIGNUP,
            description: `Joined through a referral and earned 250 XP`,
        },
    });
}

export async function generateReferralCode(name: string): Promise<string> {
    const normalized = name.replace(/\s+/g, '').toLowerCase();
    const suffixes = ['coderz', 'pro123', 'devhub', 'bytez', 'zone', 'stacker', 'wizkid'];
    
    // Try up to 10 times to generate a unique code
    for (let attempt = 0; attempt < 10; attempt++) {
        const randomSuffix = suffixes[Math.floor(Math.random() * suffixes.length)];
        const referralCode = normalized + randomSuffix;
        
        // Check if this referral code already exists
        const existingUser = await prisma.user.findUnique({
            where: { referralCode },
            select: { id: true }
        });
        
        if (!existingUser) {
            return referralCode;
        }
        
        // If code exists, try with a random number
        const referralCodeWithNumber = referralCode + Math.floor(Math.random() * 1000);
        const existingUserWithNumber = await prisma.user.findUnique({
            where: { referralCode: referralCodeWithNumber },
            select: { id: true }
        });
        
        if (!existingUserWithNumber) {
            return referralCodeWithNumber;
        }
    }
    
    // If all attempts fail, generate a completely random code
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substring(2, 8);
    return `ref${timestamp}${randomPart}`;
}

export async function createSignupActivity(userId: string) {
    await prisma.recentActivity.create({
        data: {
            userId,
            activityType: ActivityType.SIGNUP,
            description: `Joined and earned 250 XP`,
        },
    });
}