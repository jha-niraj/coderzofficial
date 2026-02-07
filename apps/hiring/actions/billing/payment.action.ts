"use server"

import { prisma } from "@repo/prisma"
import { auth } from "@repo/auth"
import { revalidatePath } from "next/cache"
import { 
    dodoClient, HIRING_SUBSCRIPTION_PLANS, type HiringSubscriptionPlanType 
} from "@/lib/dodopayments"
import type { PaymentRecord, WebhookPaymentData } from "@/types"

// Re-export types for backward compatibility
export type { PaymentRecord, WebhookPaymentData }

// ============================================
// HELPERS
// ============================================

async function getUserCompany() {
    const session = await auth()
    if (!session?.user?.id) return null

    const member = await prisma.companyMember.findFirst({
        where: { userId: session.user.id },
        include: { company: true }
    })

    return member
}

// ============================================
// SERVER ACTIONS
// ============================================

/**
 * Get payment history for the company
 */
export async function getPaymentHistory(limit: number = 10): Promise<{
    success: boolean
    payments: PaymentRecord[]
    error?: string
}> {
    try {
        const member = await getUserCompany()
        if (!member) {
            return { success: false, payments: [], error: "Unauthorized" }
        }

        const payments = await prisma.companyPayment.findMany({
            where: { companyId: member.companyId },
            orderBy: { createdAt: "desc" },
            take: limit,
        })

        return {
            success: true,
            payments: payments.map(p => ({
                id: p.id,
                amount: p.amount,
                currency: p.currency,
                status: p.status,
                createdAt: p.createdAt,
                description: p.description,
                paidAt: p.paidAt,
            }))
        }
    } catch (error) {
        console.error("Get payment history error:", error)
        return { success: false, payments: [], error: "Failed to fetch payment history" }
    }
}

/**
 * Verify a payment and activate subscription
 */
export async function verifyPayment(paymentId: string): Promise<{
    success: boolean
    error?: string
}> {
    try {
        const member = await getUserCompany()
        if (!member) {
            return { success: false, error: "Unauthorized" }
        }

        // Get payment record from database
        const payment = await prisma.companyPayment.findFirst({
            where: {
                dodoPaymentId: paymentId,
                companyId: member.companyId,
            },
            include: {
                subscription: true,
            }
        })

        if (!payment) {
            return { success: false, error: "Payment not found" }
        }

        // If already succeeded, return success
        if (payment.status === "SUCCEEDED") {
            return { success: true }
        }

        // Verify payment with DodoPayments
        if (!dodoClient) {
            return { success: false, error: "Payment system not configured" }
        }

        const paymentDetails = await dodoClient.payments.retrieve(paymentId)

        if (paymentDetails.status === "succeeded") {
            // Update payment status
            await prisma.companyPayment.update({
                where: { id: payment.id },
                data: { status: "SUCCEEDED", paidAt: new Date() }
            })

            // Activate or update subscription if metadata contains plan info
            const metadata = payment.metadata as { plan?: HiringSubscriptionPlanType; billingCycle?: string } | null
            const plan = metadata?.plan || "PRO"
            const billingCycle = metadata?.billingCycle || "monthly"
            const planConfig = HIRING_SUBSCRIPTION_PLANS[plan]
            
            if (planConfig) {
                const periodEnd = new Date()
                periodEnd.setMonth(periodEnd.getMonth() + (billingCycle === "annual" ? 12 : 1))

                await prisma.companySubscription.upsert({
                    where: { companyId: member.companyId },
                    update: {
                        plan: plan,
                        status: "ACTIVE",
                        amount: payment.amount,
                        currency: payment.currency,
                        billingCycle: billingCycle,
                        currentPeriodStart: new Date(),
                        currentPeriodEnd: periodEnd,
                        maxJobPosts: planConfig.maxJobPosts,
                        maxApplications: planConfig.maxApplications,
                        maxInterviewTemplates: planConfig.maxInterviewTemplates,
                        maxTeamMembers: planConfig.maxTeamMembers,
                        hasAIScreening: planConfig.hasAIScreening,
                        hasCustomAssignments: planConfig.hasCustomAssignments,
                        hasPrioritySupport: planConfig.hasPrioritySupport,
                        hasAPIAccess: planConfig.hasAPIAccess,
                        hasSSO: planConfig.hasSSO,
                        hasWhiteLabel: planConfig.hasWhiteLabel,
                    },
                    create: {
                        companyId: member.companyId,
                        plan: plan,
                        status: "ACTIVE",
                        amount: payment.amount,
                        currency: payment.currency,
                        billingCycle: billingCycle,
                        currentPeriodStart: new Date(),
                        currentPeriodEnd: periodEnd,
                        maxJobPosts: planConfig.maxJobPosts,
                        maxApplications: planConfig.maxApplications,
                        maxInterviewTemplates: planConfig.maxInterviewTemplates,
                        maxTeamMembers: planConfig.maxTeamMembers,
                        hasAIScreening: planConfig.hasAIScreening,
                        hasCustomAssignments: planConfig.hasCustomAssignments,
                        hasPrioritySupport: planConfig.hasPrioritySupport,
                        hasAPIAccess: planConfig.hasAPIAccess,
                        hasSSO: planConfig.hasSSO,
                        hasWhiteLabel: planConfig.hasWhiteLabel,
                    }
                })
            }

            // Create invoice for the payment
            const { createInvoiceForPayment } = await import("./invoice.action")
            await createInvoiceForPayment(payment.id)

            revalidatePath("/billing")
            return { success: true }
        }

        if (paymentDetails.status === "failed") {
            await prisma.companyPayment.update({
                where: { id: payment.id },
                data: { status: "FAILED", failedAt: new Date() }
            })
            return { success: false, error: "Payment failed" }
        }

        // Still pending
        return { success: false, error: "Payment is still processing" }
    } catch (error) {
        console.error("Verify payment error:", error)
        return { success: false, error: "Failed to verify payment" }
    }
}

/**
 * Handle webhook payment event from DodoPayments
 * This should be called from a webhook API route
 */
export async function handlePaymentWebhook(data: WebhookPaymentData): Promise<{
    success: boolean
    error?: string
}> {
    try {
        const { paymentId, amount, currency, status, metadata } = data

        // Find company by payment checkout session
        const payment = await prisma.companyPayment.findFirst({
            where: { 
                OR: [
                    { dodoPaymentId: paymentId },
                    { dodoCheckoutSessionId: paymentId }
                ]
            }
        })

        if (!payment) {
            console.error("Webhook: Payment not found:", paymentId)
            return { success: false, error: "Payment not found" }
        }

        const plan = (metadata?.plan || "PRO") as HiringSubscriptionPlanType
        const billingCycle = metadata?.billingCycle || "monthly"

        const paymentStatus = status === "succeeded" ? "SUCCEEDED" : 
                             status === "failed" ? "FAILED" : "PENDING"

        // Update payment record
        await prisma.companyPayment.update({
            where: { id: payment.id },
            data: { 
                status: paymentStatus,
                dodoPaymentId: paymentId,
                paidAt: status === "succeeded" ? new Date() : undefined,
                failedAt: status === "failed" ? new Date() : undefined,
            }
        })

        // If payment succeeded, update subscription
        if (status === "succeeded") {
            const planConfig = HIRING_SUBSCRIPTION_PLANS[plan]
            if (planConfig) {
                const periodEnd = new Date()
                periodEnd.setMonth(periodEnd.getMonth() + (billingCycle === "annual" ? 12 : 1))

                await prisma.companySubscription.upsert({
                    where: { companyId: payment.companyId },
                    update: {
                        plan,
                        status: "ACTIVE",
                        amount,
                        currency,
                        billingCycle,
                        currentPeriodStart: new Date(),
                        currentPeriodEnd: periodEnd,
                        maxJobPosts: planConfig.maxJobPosts,
                        maxApplications: planConfig.maxApplications,
                        maxInterviewTemplates: planConfig.maxInterviewTemplates,
                        maxTeamMembers: planConfig.maxTeamMembers,
                        hasAIScreening: planConfig.hasAIScreening,
                        hasCustomAssignments: planConfig.hasCustomAssignments,
                        hasPrioritySupport: planConfig.hasPrioritySupport,
                        hasAPIAccess: planConfig.hasAPIAccess,
                        hasSSO: planConfig.hasSSO,
                        hasWhiteLabel: planConfig.hasWhiteLabel,
                    },
                    create: {
                        companyId: payment.companyId,
                        plan,
                        status: "ACTIVE",
                        amount,
                        currency,
                        billingCycle,
                        currentPeriodStart: new Date(),
                        currentPeriodEnd: periodEnd,
                        maxJobPosts: planConfig.maxJobPosts,
                        maxApplications: planConfig.maxApplications,
                        maxInterviewTemplates: planConfig.maxInterviewTemplates,
                        maxTeamMembers: planConfig.maxTeamMembers,
                        hasAIScreening: planConfig.hasAIScreening,
                        hasCustomAssignments: planConfig.hasCustomAssignments,
                        hasPrioritySupport: planConfig.hasPrioritySupport,
                        hasAPIAccess: planConfig.hasAPIAccess,
                        hasSSO: planConfig.hasSSO,
                        hasWhiteLabel: planConfig.hasWhiteLabel,
                    }
                })
            }
        }

        return { success: true }
    } catch (error) {
        console.error("Payment webhook error:", error)
        return { success: false, error: "Webhook processing failed" }
    }
}
