"use server"

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { ActivityType, CreditType, Currency } from "@prisma/client";
import { revalidatePath } from "next/cache";
import cuid from "cuid"

export async function fetchXpAndCredit() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            throw new Error('User not authenticated');
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: {
                currentXp: true,
                totalXp: true,
                credits: true,
                currentLevel: true
            }
        });

        if (!user) {
            throw new Error('User not found');
        }

        return {
            xp: user.currentXp,
            currentXp: user.currentXp,
            totalXp: user.totalXp,
            credits: user.credits,
            currentLevel: user.currentLevel
        };
    } catch (error) {
        console.error('Error fetching XP and credits:', error);
        return null;
    }
}

export async function convertXpToCredits(xpToConvert: number) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            throw new Error('User not authenticated');
        }

        if (xpToConvert <= 0) {
            throw new Error('XP amount must be positive');
        }

        const result = await prisma.$transaction(async (tx) => {
            const user = await tx.user.findUnique({
                where: { id: session.user.id },
                select: { currentXp: true, credits: true, totalXp: true }
            });

            if (!user) {
                throw new Error('User not found');
            }

            if (user.currentXp < xpToConvert) {
                throw new Error('Insufficient current XP');
            }

            const creditsToAdd = Math.floor(xpToConvert / 100);

            if (creditsToAdd === 0) {
                throw new Error('Need at least 100 XP to convert to credits');
            }

            const updatedUser = await tx.user.update({
                where: { id: session.user.id },
                data: {
                    currentXp: { decrement: xpToConvert },
                    credits: { increment: creditsToAdd }
                }
            });

            await tx.creditTransaction.create({
                data: {
                    userId: session.user.id,
                    amount: creditsToAdd,
                    type: CreditType.BONUS,
                    currency: Currency.INR,
                    description: `Converted ${xpToConvert} XP to ${creditsToAdd} credits`
                }
            });

            return {
                newXp: updatedUser.currentXp,
                newCredits: updatedUser.credits,
                creditsGained: creditsToAdd,
                totalXp: user.totalXp
            };
        });

        return result;
    } catch (error) {
        console.error('Error converting XP to credits:', error);
        throw error;
    }
}

export async function transferCredits(senderId: string, receiverId: string, amount: number) {
    if (senderId === receiverId) throw new Error("Cannot transfer credits to yourself")
    console.log("Amount: " + amount);

    const sender = await prisma.user.findUnique({
        where: { id: senderId },
    })
    const receiver = await prisma.user.findUnique({
        where: { id: receiverId },
    })

    if (!sender || !receiver) throw new Error("Sender or receiver not found")
    if (sender.credits < amount) throw new Error("Insufficient credits")

    const result = await prisma.$transaction(async (tx) => {
        await tx.user.update({
            where: { id: senderId },
            data: { credits: { decrement: amount }, creditsShared: { increment: amount } },
        })
        await tx.user.update({
            where: { id: receiverId },
            data: { credits: { increment: amount } },
        })
        await tx.creditTransfer.create({
            data: {
                senderId,
                receiverId,
                amount,
                transferReference: cuid(),
            },
        })
        await tx.recentActivity.create({
            data: {
                userId: senderId,
                activityType: ActivityType.CREDIT_SHARED,
                description: `Transferred ${amount} credits to ${receiver.username}`,
            },
        })
        await tx.recentActivity.create({
            data: {
                userId: receiverId,
                activityType: ActivityType.CREDIT_RECEIVED,
                description: `Received ${amount} credits from ${sender.username}`,
            },
        })
    })

    revalidatePath("/sharecredits")
    return result
}

export async function getTransferHistory(userId: string) {
    const [sent, received] = await prisma.$transaction([
        prisma.creditTransfer.findMany({
            where: { senderId: userId },
            include: { receiver: { select: { username: true, name: true } } },
            orderBy: { createdAt: "desc" },
        }),
        prisma.creditTransfer.findMany({
            where: { receiverId: userId },
            include: { sender: { select: { username: true, name: true } } },
            orderBy: { createdAt: "desc" },
        }),
    ])

    const history = [
        ...sent.map(transfer => ({
            type: "sent",
            amount: transfer.amount,
            recipientName: transfer.receiver.name || transfer.receiver.username,
            createdAt: transfer.createdAt,
        })),
        ...received.map(transfer => ({
            type: "received",
            amount: transfer.amount,
            senderName: transfer.sender.name || transfer.sender.username,
            createdAt: transfer.createdAt,
        })),
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return history
}