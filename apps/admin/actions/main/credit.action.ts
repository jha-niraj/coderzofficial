"use server"

import { db, users, creditTransactions, creditRequests, creditTransfers, payments, adminAuditLogs } from "@repo/db"
import { eq, and, count, sql } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { checkAdminAccess } from "../admin.action"

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
        const offset = (page - 1) * limit

        const whereConditions = []
        if (filters?.type && filters.type !== "all") {
            whereConditions.push(eq(creditTransactions.type, filters.type))
        }

        const [transactions, totalResult] = await Promise.all([
            db.query.creditTransactions.findMany({
                where: whereConditions.length > 0 ? and(...whereConditions) : undefined,
                with: {
                    user: {
                        columns: { id: true, name: true, email: true, image: true }
                    }
                },
                orderBy: (t, { desc }) => [desc(t.createdAt)],
                limit,
                offset
            }),
            db.select({ total: count() }).from(creditTransactions).where(
                whereConditions.length > 0 ? and(...whereConditions) : undefined
            )
        ])
        const total = totalResult[0]?.total ?? 0

        return {
            success: true,
            data: {
                transactions,
                total,
                pages: Math.ceil(total / limit)
            },
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
        const offset = (page - 1) * limit

        const whereConditions = []
        if (status && status !== "all") {
            whereConditions.push(eq(creditRequests.status, status as any))
        }

        const [requests, totalResult] = await Promise.all([
            db.query.creditRequests.findMany({
                where: whereConditions.length > 0 ? and(...whereConditions) : undefined,
                with: {
                    user: {
                        columns: { id: true, name: true, email: true, image: true }
                    }
                },
                orderBy: (t, { desc }) => [desc(t.createdAt)],
                limit,
                offset
            }),
            db.select({ total: count() }).from(creditRequests).where(
                whereConditions.length > 0 ? and(...whereConditions) : undefined
            )
        ])
        const total = totalResult[0]?.total ?? 0

        return {
            success: true,
            data: {
                requests,
                total,
                pages: Math.ceil(total / limit)
            },
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

        const adminRecord = accessCheck.data?.adminAccess
        if (!adminRecord) return { success: false, error: "Admin record not found" }

        const request = await db.query.creditRequests.findFirst({
            where: eq(creditRequests.id, requestId),
            with: { user: true }
        })

        if (!request) {
            return { success: false, error: "Request not found" }
        }

        // Update user credits
        await db.update(users)
            .set({ credits: sql`${users.credits} + ${amount}` })
            .where(eq(users.id, request.userId))

        // Update request status
        await db.update(creditRequests)
            .set({ status: "APPROVED" })
            .where(eq(creditRequests.id, requestId))

        // Create transaction
        await db.insert(creditTransactions).values({
            userId: request.userId,
            amount,
            currency: "INR",
            type: "BONUS",
            description: "Admin approved credit request",
        })

        await db.insert(adminAuditLogs).values({
            adminId: adminRecord.id,
            action: "UPDATE",
            module: "credits",
            resourceType: "CreditRequest",
            resourceId: requestId,
            description: `Approved credit request: ${amount} credits`,
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

        const adminRecord = accessCheck.data?.adminAccess
        if (!adminRecord) return { success: false, error: "Admin record not found" }

        await db.update(creditRequests)
            .set({ status: "REJECTED" })
            .where(eq(creditRequests.id, requestId))

        await db.insert(adminAuditLogs).values({
            adminId: adminRecord.id,
            action: "UPDATE",
            module: "credits",
            resourceType: "CreditRequest",
            resourceId: requestId,
            description: `Rejected credit request: ${reason}`,
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
        const offset = (page - 1) * limit

        const [transfers, totalResult] = await Promise.all([
            db.query.creditTransfers.findMany({
                with: {
                    sender: { columns: { id: true, name: true, email: true } },
                    receiver: { columns: { id: true, name: true, email: true } },
                },
                orderBy: (t, { desc }) => [desc(t.createdAt)],
                limit,
                offset
            }),
            db.select({ total: count() }).from(creditTransfers)
        ])
        const total = totalResult[0]?.total ?? 0

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

        const [fromUser, toUser] = await Promise.all([
            db.query.users.findFirst({ where: eq(users.id, fromUserId) }),
            db.query.users.findFirst({ where: eq(users.id, toUserId) })
        ])
        if (!fromUser || !toUser) return { success: false, error: "Invalid users" }

        if (typeof fromUser.credits === "number" && fromUser.credits < amount) {
            return { success: false, error: "Insufficient balance" }
        }

        // Execute in sequence (no native transaction needed since each is atomic)
        await db.update(users).set({ credits: sql`${users.credits} - ${amount}` }).where(eq(users.id, fromUserId))
        await db.update(users).set({ credits: sql`${users.credits} + ${amount}` }).where(eq(users.id, toUserId))

        await db.insert(creditTransfers).values({
            senderId: fromUserId,
            receiverId: toUserId,
            amount
        })

        await db.insert(creditTransactions).values({
            userId: fromUserId,
            amount: -amount,
            type: "REWARD",
            description: description || `Transfer to ${toUser.email}`,
            currency: "INR",
        })
        await db.insert(creditTransactions).values({
            userId: toUserId,
            amount,
            type: "REWARD",
            description: description || `Transfer from ${fromUser.email}`,
            currency: "INR",
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
        const offset = (page - 1) * limit

        const whereConditions = []
        if (filters?.status && filters.status !== "all") {
            whereConditions.push(eq(payments.status, filters.status))
        }

        const [paymentList, totalResult] = await Promise.all([
            db.query.payments.findMany({
                where: whereConditions.length > 0 ? and(...whereConditions) : undefined,
                with: {
                    user: { columns: { id: true, name: true, email: true } }
                },
                orderBy: (t, { desc }) => [desc(t.createdAt)],
                limit,
                offset
            }),
            db.select({ total: count() }).from(payments).where(
                whereConditions.length > 0 ? and(...whereConditions) : undefined
            )
        ])
        const total = totalResult[0]?.total ?? 0

        return {
            success: true,
            data: {
                payments: paymentList,
                total,
                pages: Math.ceil(total / limit)
            },
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
            allUsers,
            pendingRequestsResult,
            totalTransactionsResult,
            totalPaymentsResult,
        ] = await Promise.all([
            db.query.users.findMany({ columns: { credits: true } }),
            db.select({ pendingRequests: count() }).from(creditRequests).where(eq(creditRequests.status, "PENDING")),
            db.select({ totalTransactions: count() }).from(creditTransactions),
            db.select({ totalPayments: count() }).from(payments).where(eq(payments.status, "COMPLETED")),
        ])
        const pendingRequests = pendingRequestsResult[0]?.pendingRequests ?? 0
        const totalTransactions = totalTransactionsResult[0]?.totalTransactions ?? 0
        const totalPayments = totalPaymentsResult[0]?.totalPayments ?? 0

        const totalCredits = allUsers.reduce((sum, u) => sum + (u.credits || 0), 0)

        return {
            success: true,
            data: {
                totalCredits,
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
