"use server"

import { db, universityMembers, universityPayments } from "@repo/db"
import { eq, and, or, count } from "drizzle-orm"
import { getSession } from "@repo/auth"
import { headers } from "next/headers"
import type { PaymentRecord, PaymentStatus } from "@/types"

// ============================================
// HELPERS
// ============================================

async function getUserUniversity() {
    const session = await getSession(headers())
    if (!session?.user?.id) return null

    const member = await db.query.universityMembers.findFirst({
        where: eq(universityMembers.userId, session.user.id),
        with: { university: true },
    })

    return member
}

// ============================================
// SERVER ACTIONS
// ============================================

/**
 * Get payment history for the university
 */
export async function getPaymentHistory(options?: {
    page?: number
    pageSize?: number
    status?: PaymentStatus
}): Promise<{
    success: boolean
    payments: PaymentRecord[]
    totalCount: number
    error?: string
}> {
    try {
        const member = await getUserUniversity()
        if (!member) {
            return { success: false, payments: [], totalCount: 0, error: "Unauthorized" }
        }

        const page = options?.page || 1
        const pageSize = options?.pageSize || 10
        const skip = (page - 1) * pageSize

        const totalCountResult = await db.select({ count: count() }).from(universityPayments).where(eq(universityPayments.universityId, member.universityId))
        const totalCount = totalCountResult[0]?.count ?? 0

        const payments = await db.query.universityPayments.findMany({
            where: eq(universityPayments.universityId, member.universityId),
            orderBy: (tbl, { desc }) => desc(tbl.createdAt),
            offset: skip,
            limit: pageSize,
        })

        return {
            success: true,
            payments: payments.map(p => ({
                id: p.id,
                amount: p.amount,
                currency: p.currency,
                status: p.status as PaymentStatus,
                createdAt: p.createdAt,
                description: p.description,
                paidAt: p.paidAt,
            })),
            totalCount,
        }
    } catch (error) {
        console.error("Get payment history error:", error)
        return { success: false, payments: [], totalCount: 0, error: "Failed to fetch payments" }
    }
}

/**
 * Get a specific payment by ID
 */
export async function getPayment(paymentId: string): Promise<{
    success: boolean
    payment?: PaymentRecord & {
        dodoCheckoutSessionId: string | null
        dodoPaymentId: string | null
        metadata: unknown
    }
    error?: string
}> {
    try {
        const member = await getUserUniversity()
        if (!member) {
            return { success: false, error: "Unauthorized" }
        }

        const payment = await db.query.universityPayments.findFirst({
            where: and(
                eq(universityPayments.id, paymentId),
                eq(universityPayments.universityId, member.universityId),
            ),
        })

        if (!payment) {
            return { success: false, error: "Payment not found" }
        }

        return {
            success: true,
            payment: {
                id: payment.id,
                amount: payment.amount,
                currency: payment.currency,
                status: payment.status as PaymentStatus,
                createdAt: payment.createdAt,
                description: payment.description,
                paidAt: payment.paidAt,
                dodoCheckoutSessionId: payment.dodoCheckoutSessionId,
                dodoPaymentId: payment.dodoPaymentId,
                metadata: payment.metadata,
            }
        }
    } catch (error) {
        console.error("Get payment error:", error)
        return { success: false, error: "Failed to fetch payment" }
    }
}

/**
 * Get payment summary/overview
 */
export async function getPaymentSummary(): Promise<{
    success: boolean
    summary?: {
        totalSpent: number
        totalPayments: number
        successfulPayments: number
        failedPayments: number
        pendingPayments: number
        lastPaymentDate: Date | null
        lastPaymentAmount: number | null
    }
    error?: string
}> {
    try {
        const member = await getUserUniversity()
        if (!member) {
            return { success: false, error: "Unauthorized" }
        }

        const payments = await db.query.universityPayments.findMany({
            where: eq(universityPayments.universityId, member.universityId),
            orderBy: (tbl, { desc }) => desc(tbl.createdAt),
        })

        const successfulPayments = payments.filter(p => p.status === "SUCCEEDED")
        const totalSpent = successfulPayments.reduce((sum, p) => sum + p.amount, 0)
        const lastSuccessful = successfulPayments[0]

        return {
            success: true,
            summary: {
                totalSpent,
                totalPayments: payments.length,
                successfulPayments: successfulPayments.length,
                failedPayments: payments.filter(p => p.status === "FAILED").length,
                pendingPayments: payments.filter(p => p.status === "PENDING").length,
                lastPaymentDate: lastSuccessful?.paidAt || lastSuccessful?.createdAt || null,
                lastPaymentAmount: lastSuccessful?.amount || null,
            }
        }
    } catch (error) {
        console.error("Get payment summary error:", error)
        return { success: false, error: "Failed to fetch payment summary" }
    }
}

/**
 * Update payment status (internal use / webhook)
 */
export async function updatePaymentStatus(
    dodoPaymentId: string,
    status: PaymentStatus,
    paidAt?: Date
): Promise<{
    success: boolean
    error?: string
}> {
    try {
        await db.update(universityPayments).set({
            status,
            paidAt: paidAt || (status === "SUCCEEDED" ? new Date() : undefined),
        }).where(
            or(
                eq(universityPayments.dodoCheckoutSessionId, dodoPaymentId),
                eq(universityPayments.dodoPaymentId, dodoPaymentId),
            )
        )

        return { success: true }
    } catch (error) {
        console.error("Update payment status error:", error)
        return { success: false, error: "Failed to update payment status" }
    }
}

/**
 * Request refund for a payment
 */
export async function requestRefund(paymentId: string, reason: string): Promise<{
    success: boolean
    error?: string
}> {
    try {
        const member = await getUserUniversity()
        if (!member) {
            return { success: false, error: "Unauthorized" }
        }

        const permissions = member.permissions as string[] | null
        if (!permissions || !permissions.includes("manage_billing")) {
            return { success: false, error: "No permission to manage billing" }
        }

        const payment = await db.query.universityPayments.findFirst({
            where: and(
                eq(universityPayments.id, paymentId),
                eq(universityPayments.universityId, member.universityId),
                eq(universityPayments.status, "SUCCEEDED"),
            ),
        })

        if (!payment) {
            return { success: false, error: "Payment not found or not eligible for refund" }
        }

        await db.update(universityPayments).set({
            metadata: {
                ...(payment.metadata as object || {}),
                refundRequested: true,
                refundReason: reason,
                refundRequestedAt: new Date().toISOString(),
            }
        }).where(eq(universityPayments.id, paymentId))

        return { success: true }
    } catch (error) {
        console.error("Request refund error:", error)
        return { success: false, error: "Failed to request refund" }
    }
}
