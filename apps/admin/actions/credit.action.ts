"use server"

import { prisma } from "@repo/prisma"
import { CreditType, Currency } from "@repo/prisma/client"
import { revalidatePath } from "next/cache"
import { checkAdminAccess } from "./admin.action"

interface AdminResponse<T = unknown> {
    success: boolean
    data?: T
    error?: string
}

// Get all credit transactions
export async function getAllTransactions(filters?: any, pagination?: any): Promise<AdminResponse<any>> {
    try {
        const { success, error } = await checkAdminAccess()
        if (!success) return { success: false, error }

        const page = pagination?.page || 1
        const limit = pagination?.limit || 20
        const skip = (page - 1) * limit

        const where: any = {}
        if (filters?.type && filters.type !== "all") {
            where.type = filters.type
        }

        const [transactions, total] = await Promise.all([
            prisma.creditTransaction.findMany({
                where,
                include: {
                    user: {
                        select: { id: true, name: true, email: true, image: true },
                    },
                },
                orderBy: { createdAt: "desc" },
                skip,
                take: limit,
            }),
            prisma.creditTransaction.count({ where }),
        ])

        return {
            success: true,
            data: { transactions, total, pages: Math.ceil(total / limit) },
        }
    } catch (error) {
        console.error("Get transactions error:", error)
        return { success: false, error: "Failed to fetch transactions" }
    }
}

// Get credit requests
export async function getCreditRequests(status?: string, pagination?: any): Promise<AdminResponse<any>> {
    try {
        const { success, error } = await checkAdminAccess()
        if (!success) return { success: false, error }

        const page = pagination?.page || 1
        const limit = pagination?.limit || 20
        const skip = (page - 1) * limit

        const where: any = {}
        if (status && status !== "all") {
            where.status = status
        }

        const [requests, total] = await Promise.all([
            prisma.creditRequest.findMany({
                where,
                include: {
                    user: {
                        select: { id: true, name: true, email: true, image: true },
                    },
                },
                orderBy: { createdAt: "desc" },
                skip,
                take: limit,
            }),
            prisma.creditRequest.count({ where }),
        ])

        return {
            success: true,
            data: { requests, total, pages: Math.ceil(total / limit) },
        }
    } catch (error) {
        console.error("Get credit requests error:", error)
        return { success: false, error: "Failed to fetch credit requests" }
    }
}

// Approve credit request
export async function approveCreditRequest(requestId: string, amount: number): Promise<AdminResponse> {
    try {
        const accessCheck = await checkAdminAccess()
        if (!accessCheck.success) return { success: false, error: accessCheck.error }

        const adminAccess = accessCheck.data?.adminAccess

        const request = await prisma.creditRequest.findUnique({
            where: { id: requestId },
            include: { user: true },
        })

        if (!request) {
            return { success: false, error: "Request not found" }
        }

        // Update user credits
        await prisma.user.update({
            where: { id: request.userId },
            data: { credits: { increment: amount } },
        })

        // Update request status
        await prisma.creditRequest.update({
            where: { id: requestId },
            data: { status: "APPROVED" },
        })

        // Create transaction
        await prisma.creditTransaction.create({
            data: {
                userId: request.userId,
                amount,
                currency: Currency.INR,
                type: "BONUS",
                description: "Admin approved credit request",
            },
        })

        await prisma.adminAuditLog.create({
            data: {
                adminId: adminAccess.id,
                action: "UPDATE",
                module: "credits",
                resourceType: "CreditRequest",
                resourceId: requestId,
                description: `Approved credit request: ${amount} credits`,
            },
        })

        revalidatePath("/credits/requests")

        return { success: true }
    } catch (error) {
        console.error("Approve credit request error:", error)
        return { success: false, error: "Failed to approve request" }
    }
}

// Reject credit request
export async function rejectCreditRequest(requestId: string, reason: string): Promise<AdminResponse> {
    try {
        const accessCheck = await checkAdminAccess()
        if (!accessCheck.success) return { success: false, error: accessCheck.error }

        const adminAccess = accessCheck.data?.adminAccess

        await prisma.creditRequest.update({
            where: { id: requestId },
            data: { status: "REJECTED" },
        })

        await prisma.adminAuditLog.create({
            data: {
                adminId: adminAccess.id,
                action: "UPDATE",
                module: "credits",
                resourceType: "CreditRequest",
                resourceId: requestId,
                description: `Rejected credit request: ${reason}`,
            },
        })

        revalidatePath("/credits/requests")

        return { success: true }
    } catch (error) {
        console.error("Reject credit request error:", error)
        return { success: false, error: "Failed to reject request" }
    }
}

// Get credit transfers
export async function getCreditTransfers(filters?: any, pagination?: any): Promise<AdminResponse<any>> {
    try {
        const { success, error } = await checkAdminAccess()
        if (!success) return { success: false, error }

        const page = pagination?.page || 1
        const limit = pagination?.limit || 20
        const skip = (page - 1) * limit

        const [transfers, total] = await Promise.all([
            prisma.creditTransfer.findMany({
                include: {
                    sender: {
                        select: { id: true, name: true, email: true },
                    },
                    receiver: {
                        select: { id: true, name: true, email: true },
                    },
                },
                orderBy: { createdAt: "desc" },
                skip,
                take: limit,
            }),
            prisma.creditTransfer.count(),
        ])

        return {
            success: true,
            data: { transfers, total, pages: Math.ceil(total / limit) },
        }
    } catch (error) {
        console.error("Get transfers error:", error)
        return { success: false, error: "Failed to fetch transfers" }
    }
}

// Transfer credits between users (admin-initiated)
export async function transferCredits(fromUserId: string, toUserId: string, amount: number, description?: string): Promise<AdminResponse> {
    try {
        const accessCheck = await checkAdminAccess()
        if (!accessCheck.success) return { success: false, error: accessCheck.error }

        if (amount <= 0) return { success: false, error: "Amount must be positive" }
        if (fromUserId === toUserId) return { success: false, error: "Cannot transfer to the same user" }

        // Ensure from user has enough credits (if you enforce it)
        const fromUser = await prisma.user.findUnique({ where: { id: fromUserId } })
        const toUser = await prisma.user.findUnique({ where: { id: toUserId } })
        if (!fromUser || !toUser) return { success: false, error: "Invalid users" }

        // Optional balance check if you track credits as a balance
        if (typeof fromUser.credits === 'number' && fromUser.credits < amount) {
            return { success: false, error: "Insufficient balance" }
        }

        // Execute transfer in a transaction
        await prisma.$transaction(async (tx) => {
            // decrement/increment user credits if present
            await tx.user.update({ where: { id: fromUserId }, data: { credits: { decrement: amount } } })
            await tx.user.update({ where: { id: toUserId }, data: { credits: { increment: amount } } })

            // record transfer entity if the model exists
            await tx.creditTransfer.create({
                data: {
                    senderId: fromUserId,
                    receiverId: toUserId,
                    amount
                }
            })

            // record two transactions for auditability
            await tx.creditTransaction.create({
                data: {
                    userId: fromUserId,
                    amount: -amount,
                    type: CreditType.REWARD,
                    description: description || `Transfer to ${toUser.email}`,
                    currency: Currency.INR,
                }
            })
            await tx.creditTransaction.create({
                data: {
                    userId: toUserId,
                    amount: amount,
                    type: CreditType.REWARD,
                    description: description || `Transfer from ${fromUser.email}`,
                    currency: Currency.INR,
                }
            })
        })

        return { success: true }
    } catch (error) {
        console.error("Transfer credits error:", error)
        return { success: false, error: "Failed to transfer credits" }
    }
}

// Get payments
export async function getPayments(filters?: any, pagination?: any): Promise<AdminResponse<any>> {
    try {
        const { success, error } = await checkAdminAccess()
        if (!success) return { success: false, error }

        const page = pagination?.page || 1
        const limit = pagination?.limit || 20
        const skip = (page - 1) * limit

        const where: any = {}
        if (filters?.status && filters.status !== "all") {
            where.status = filters.status
        }

        const [payments, total] = await Promise.all([
            prisma.payment.findMany({
                where,
                include: {
                    user: {
                        select: { id: true, name: true, email: true },
                    },
                },
                orderBy: { createdAt: "desc" },
                skip,
                take: limit,
            }),
            prisma.payment.count({ where }),
        ])

        return {
            success: true,
            data: { payments, total, pages: Math.ceil(total / limit) },
        }
    } catch (error) {
        console.error("Get payments error:", error)
        return { success: false, error: "Failed to fetch payments" }
    }
}

// Get credit stats
export async function getCreditStats(): Promise<AdminResponse<any>> {
    try {
        const { success, error } = await checkAdminAccess()
        if (!success) return { success: false, error }

        const [
            totalCreditsInSystem,
            pendingRequests,
            totalTransactions,
            totalPayments,
        ] = await Promise.all([
            prisma.user.aggregate({ _sum: { credits: true } }),
            prisma.creditRequest.count({ where: { status: "PENDING" } }),
            prisma.creditTransaction.count(),
            prisma.payment.count({ where: { status: "COMPLETED" } }),
        ])

        return {
            success: true,
            data: {
                totalCredits: totalCreditsInSystem._sum.credits || 0,
                pendingRequests,
                totalTransactions,
                totalPayments,
            },
        }
    } catch (error) {
        console.error("Get credit stats error:", error)
        return { success: false, error: "Failed to fetch credit statistics" }
    }
}
