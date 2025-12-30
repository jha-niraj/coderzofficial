"use server"

import { prisma } from "@repo/prisma"
import { revalidatePath } from "next/cache"
import { checkAdminAccess } from "../admin.action"

interface FeedbackFilters {
    search?: string
    category?: "all" | "BUG" | "FEATURE" | "UI" | "OTHER"
    status?: "all" | "UNDER_REVIEW" | "PLANNED" | "COMPLETED"
}

interface PaginationParams {
    page?: number
    limit?: number
}

interface AdminResponse<T = unknown> {
    success: boolean
    data?: T
    error?: string
}

// Get all feedback with filters and pagination
export async function getAllFeedback(
    filters?: FeedbackFilters,
    pagination?: PaginationParams
): Promise<AdminResponse<{ feedback: any[]; total: number; pages: number }>> {
    try {
        const { success, error } = await checkAdminAccess()
        if (!success) return { success: false, error }

        const page = pagination?.page || 1
        const limit = pagination?.limit || 20
        const skip = (page - 1) * limit

        const where: any = {}

        if (filters?.search) {
            where.OR = [
                { title: { contains: filters.search, mode: "insensitive" } },
                { description: { contains: filters.search, mode: "insensitive" } },
            ]
        }

        if (filters?.category && filters.category !== "all") {
            where.category = filters.category
        }

        if (filters?.status && filters.status !== "all") {
            where.status = filters.status
        }

        const [feedback, total] = await Promise.all([
            prisma.feedback.findMany({
                where,
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            image: true,
                        },
                    },
                    rewards: true,
                },
                orderBy: { createdAt: "desc" },
                skip,
                take: limit,
            }),
            prisma.feedback.count({ where }),
        ])

        return {
            success: true,
            data: {
                feedback,
                total,
                pages: Math.ceil(total / limit),
            },
        }
    } catch (error) {
        console.error("Get all feedback error:", error)
        return { success: false, error: "Failed to fetch feedback" }
    }
}

// Update feedback status
export async function updateFeedbackStatus(
    feedbackId: string,
    status: "UNDER_REVIEW" | "PLANNED" | "COMPLETED"
): Promise<AdminResponse> {
    try {
        const accessCheck = await checkAdminAccess()
        if (!accessCheck.success) return { success: false, error: accessCheck.error }

        const adminAccess = accessCheck.data?.adminAccess

        const feedback = await prisma.feedback.update({
            where: { id: feedbackId },
            data: { status },
        })

        await prisma.adminAuditLog.create({
            data: {
                adminId: adminAccess.id,
                action: "UPDATE",
                module: "feedback",
                resourceType: "Feedback",
                resourceId: feedbackId,
                description: `Updated feedback status to ${status}`,
            },
        })

        revalidatePath("/feedback")

        return { success: true, data: feedback }
    } catch (error) {
        console.error("Update feedback status error:", error)
        return { success: false, error: "Failed to update feedback status" }
    }
}

// Assign reward to feedback
export async function assignReward(
    feedbackId: string,
    credits: number,
    xp?: number,
    description?: string
): Promise<AdminResponse> {
    try {
        const accessCheck = await checkAdminAccess()
        if (!accessCheck.success) return { success: false, error: accessCheck.error }

        const adminAccess = accessCheck.data?.adminAccess

        const feedback = await prisma.feedback.findUnique({
            where: { id: feedbackId },
            include: { user: true },
        })

        if (!feedback) {
            return { success: false, error: "Feedback not found" }
        }

        // Check if reward already exists
        const existingReward = await prisma.reward.findUnique({
            where: { feedbackId },
        })

        if (existingReward) {
            return { success: false, error: "Reward already assigned" }
        }

        // Create reward
        const reward = await prisma.reward.create({
            data: {
                feedbackId,
                type: "FEEDBACK",
                credits,
                xp: xp || 0,
                description: description || `Reward for feedback: ${feedback.user.name}`,
            },
        })

        // Update user credits
        await prisma.user.update({
            where: { id: feedback.userId },
            data: {
                credits: { increment: credits },
                currentXp: { increment: xp || 0 },
            },
        })

        // Mark feedback as verified
        await prisma.feedback.update({
            where: { id: feedbackId },
            data: { isVerified: true },
        })

        await prisma.adminAuditLog.create({
            data: {
                adminId: adminAccess.id,
                action: "CREATE",
                module: "feedback",
                resourceType: "Reward",
                resourceId: reward.id,
                description: `Assigned reward: ${credits} credits${xp ? `, ${xp} XP` : ""} for feedback "${feedback.user.name}"`,
            },
        })

        revalidatePath("/feedback")

        return { success: true, data: reward }
    } catch (error) {
        console.error("Assign reward error:", error)
        return { success: false, error: "Failed to assign reward" }
    }
}

// Delete feedback
export async function deleteFeedback(feedbackId: string): Promise<AdminResponse> {
    try {
        const accessCheck = await checkAdminAccess()
        if (!accessCheck.success) return { success: false, error: accessCheck.error }

        const adminAccess = accessCheck.data?.adminAccess

        const feedback = await prisma.feedback.findUnique({
            where: { id: feedbackId },
            select: { user: { select: { name: true } } },
        })

        await prisma.feedback.delete({
            where: { id: feedbackId },
        })

        await prisma.adminAuditLog.create({
            data: {
                adminId: adminAccess.id,
                action: "DELETE",
                module: "feedback",
                resourceType: "Feedback",
                resourceId: feedbackId,
                description: `Deleted feedback: ${feedback?.user?.name}`,
            },
        })

        revalidatePath("/feedback")

        return { success: true }
    } catch (error) {
        console.error("Delete feedback error:", error)
        return { success: false, error: "Failed to delete feedback" }
    }
}

// Get feedback statistics
export async function getFeedbackStats(): Promise<AdminResponse<any>> {
    try {
        const { success, error } = await checkAdminAccess()
        if (!success) return { success: false, error }

        const [
            total,
            underReview,
            planned,
            completed,
            bugs,
            features,
            verified,
        ] = await Promise.all([
            prisma.feedback.count(),
            prisma.feedback.count({ where: { status: "UNDER_REVIEW" } }),
            prisma.feedback.count({ where: { status: "PLANNED" } }),
            prisma.feedback.count({ where: { status: "COMPLETED" } }),
            prisma.feedback.count({ where: { category: "BUG" } }),
            prisma.feedback.count({ where: { category: "FEATURE" } }),
            prisma.feedback.count({ where: { isVerified: true } }),
        ])

        return {
            success: true,
            data: {
                total,
                underReview,
                planned,
                completed,
                bugs,
                features,
                verified,
            },
        }
    } catch (error) {
        console.error("Get feedback stats error:", error)
        return { success: false, error: "Failed to fetch feedback statistics" }
    }
}
