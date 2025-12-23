"use server"

import { prisma } from "@/lib/prisma";
import { 
    ActivityType, CreditType, Currency, FeedbackCategory, FeedbackStatus, Role 
} from "@prisma/client";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { addXpToUser } from "./level.action";

interface FormData {
    title: string;
    description: string;
    category: FeedbackCategory;
}
interface RewardData {
    type: string;
    amount: number;
    description: string;
}
export async function submitFeedback({
    title,
    description,
    category,
    imageUrl,
}: {
    title: string;
    description: string;
    category: FeedbackCategory;
    imageUrl?: string;
}) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return null
        }

        const feedback = await prisma.feedback.create({
            data: {
                title,
                description,
                category,
                userId: session.user.id,
                status: FeedbackStatus.UNDER_REVIEW,
                ...(imageUrl && { imageUrl }),
            },
        })

        await prisma.recentActivity.create({
            data: {
                userId: session.user.id,
                activityType: ActivityType.FEEDBACK_SUBMITTED,
                description: `Submitted feedback: ${title}`,
            },
        })

        // Use the new level system for XP rewards
        await addXpToUser(
            session.user.id,
            25,
            `Submitted feedback: ${title}`,
            'REWARD'
        );

        revalidatePath("/feedback")
        return feedback
    } catch (error) {
        console.error("Error submitting feedback:", error)
        return null
    }
}

export async function getFeedbackByStatus(status: FeedbackStatus) {
    console.log("status: ", status);

    try {
        const feedback = await prisma.feedback.findMany({
            where: { status },
            orderBy: { createdAt: "desc" },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                    },
                },
                rewards: true,
            },
        })

        return feedback;
    } catch (error) {
        console.error("Error fetching feedback:", error)
        throw error
    }
}

// Update feedback status
export async function updateFeedbackStatus(id: string, status: FeedbackStatus) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            throw new Error("Not authenticated")
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { role: true },
        })

        if (user?.role !== Role.Admin) {
            throw new Error("Not authorized")
        }

        const feedback = await prisma.feedback.update({
            where: { id },
            data: { status },
        })

        revalidatePath("/feedback")
        return feedback
    } catch (error) {
        console.error("Error updating feedback status:", error)
        throw error
    }
}

// Upvote feedback
export async function upvoteFeedback(id: string) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            throw new Error("Not authenticated")
        }

        // In a real app, you would check if user has already upvoted
        // and store upvote relationship in a separate table

        const feedback = await prisma.feedback.update({
            where: { id },
            data: { upvotes: { increment: 1 } },
        })

        revalidatePath("/feedback")
        return feedback
    } catch (error) {
        console.error("Error upvoting feedback:", error)
        throw error
    }
}

// Assign reward to feedback
export async function assignReward(feedbackId: string, rewardData: any) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("You must be logged in to assign rewards");
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true }
    });

    if (user?.role !== "Admin") {
        throw new Error("Only admins can assign rewards");
    }

    try {
        const existingReward = await prisma.reward.findUnique({
            where: { feedbackId }
        });

        if (existingReward) {
            throw new Error("Reward already assigned to this feedback");
        }

        const feedback = await prisma.feedback.findUnique({
            where: { id: feedbackId },
            include: { user: true }
        });

        if (!feedback) {
            throw new Error("Feedback not found");
        }

        // Create reward record
        const reward = await prisma.reward.create({
            data: {
                feedbackId,
                type: rewardData.type,
                credits: rewardData.type === "credits" ? rewardData.credits : 0,
                xp: rewardData.type === "xp" ? rewardData.xp : 0,
                description: `Received ${rewardData.type === "credits" ? rewardData.credits + " credits" : rewardData.xp + " XP"} for feedback`,
            }
        });

        // Update user's rewards
        if (rewardData.type === "credits") {
            await prisma.user.update({
                where: { id: feedback.userId },
                data: { credits: { increment: rewardData.credits } },
            });

            await prisma.creditTransaction.create({
                data: {
                    userId: feedback.userId,
                    amount: rewardData.credits,
                    type: CreditType.REWARD,
                    currency: Currency.INR,
                    description: `Received ${rewardData.type === "credits" ? rewardData.credits + " credits" : rewardData.xp + " XP"} for feedback`,
                }
            });
        } else if (rewardData.type === "xp") {
            // Use the new level system for XP rewards
            await addXpToUser(
                feedback.userId, 
                rewardData.xp, 
                `Received ${rewardData.xp} XP for feedback`,
                'REWARD'
            );
        }

        return { success: true, reward };
    } catch (error) {
        console.error("Error assigning reward:", error);
        throw error;
    }
}

// Verify feedback (for the isVerified field)
export async function verifyFeedback(id: string, isVerified: boolean) {
    const session = await auth();

    if (!session) {
        throw new Error("You must be logged in to verify feedback.");
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id }
    });

    if (!user || user.role !== Role.Admin) {
        throw new Error("Only admins can verify feedback.");
    }

    try {
        const updatedFeedback = await prisma.feedback.update({
            where: { id },
            data: { isVerified }
        });

        revalidatePath('/feedback');
        return updatedFeedback;
    } catch (error) {
        console.error("Error verifying feedback:", error);
        throw error;
    }
}