"use server"

import { prisma } from "@repo/prisma"
import { UniversitySubscriptionPlan } from "@prisma/client"
import { auth } from "@repo/auth"
import { revalidatePath } from "next/cache"
import type { CountryCode } from 'dodopayments/resources/misc'
import { 
    dodoClient, UNIVERSITY_SUBSCRIPTION_PLANS, 
    type UniversitySubscriptionPlanType, getDodoProductId,
    getUniversityPlanPrice, getPlanLimits, getPlanFeatures,
    createDodoCheckoutSession, getDodoPayment
} from "@/lib/dodopayments"

// ============================================
// TYPES
// ============================================

interface CreateCheckoutInput {
    plan: UniversitySubscriptionPlanType
    billingCycle: "monthly" | "yearly"
    returnUrl: string
    currency: 'INR' | 'USD'
}

interface CreateCheckoutResult {
    success: boolean
    sessionUrl?: string
    sessionId?: string
    error?: string
}

interface VerifyCheckoutInput {
    sessionId: string
}

interface VerifyCheckoutResult {
    success: boolean
    subscription?: {
        plan: string
        planName: string
        status: string
    }
    error?: string
}

// ============================================
// HELPERS
// ============================================

async function getUserUniversity() {
    const session = await auth()
    if (!session?.user?.id) return null

    const member = await prisma.universityMember.findFirst({
        where: { userId: session.user.id },
        include: { university: true }
    })

    return member
}

// ============================================
// SERVER ACTIONS
// ============================================

/**
 * Create a checkout session for subscription upgrade
 */
export async function createCheckoutSession(input: CreateCheckoutInput): Promise<CreateCheckoutResult> {
    try {
        const member = await getUserUniversity()
        if (!member) {
            return { success: false, error: "Unauthorized - no university found" }
        }

        // Check permission
        const permissions = member.permissions as string[] | null
        if (!permissions || !permissions.includes("manage_billing")) {
            return { success: false, error: "No permission to manage billing" }
        }

        const planConfig = UNIVERSITY_SUBSCRIPTION_PLANS[input.plan]
        if (!planConfig) {
            return { success: false, error: "Invalid plan" }
        }

        if (input.plan === 'ENTERPRISE') {
            return { success: false, error: "Enterprise plan requires contacting sales" }
        }

        // Get product ID and price
        const productId = getDodoProductId(input.plan, input.billingCycle)
        const amount = getUniversityPlanPrice(input.plan, input.currency, input.billingCycle)

        if (!productId) {
            return { success: false, error: "Payment product not configured for this plan" }
        }

        // Create checkout session with Dodo Payments (RECOMMENDED approach per docs)
        // Uses checkoutSessions.create which returns checkout_url
        const countryCode = (member.university.country || "IN") as CountryCode
        const checkoutSession = await createDodoCheckoutSession({
            product_cart: [
                {
                    product_id: productId,
                    quantity: 1,
                },
            ],
            customer: {
                email: member.email || "",
                name: member.displayName || member.university.name,
            },
            return_url: input.returnUrl,
            billing: {
                city: member.university.city || "Unknown",
                country: countryCode,
                state: member.university.state || "Unknown",
                street: member.university.address || "Unknown",
                zipcode: member.university.pincode || "000000",
            },
            metadata: {
                universityId: member.universityId,
                plan: input.plan,
                billingCycle: input.billingCycle,
                currency: input.currency,
            },
        })

        // Store pending payment record
        await prisma.universityPayment.create({
            data: {
                universityId: member.universityId,
                dodoCheckoutSessionId: checkoutSession.session_id,
                amount,
                currency: input.currency,
                status: "PENDING",
                description: `Subscription: ${planConfig.name} (${input.billingCycle})`,
                metadata: {
                    plan: input.plan,
                    billingCycle: input.billingCycle,
                }
            }
        })

        return {
            success: true,
            sessionUrl: checkoutSession.checkout_url ?? undefined,
            sessionId: checkoutSession.session_id ?? undefined,
        }
    } catch (error) {
        console.error("Create checkout error:", error)
        return { success: false, error: "Failed to create checkout session" }
    }
}

/**
 * Verify checkout session after completion (called from return URL)
 */
export async function verifyCheckoutSession(input: VerifyCheckoutInput): Promise<VerifyCheckoutResult> {
    try {
        const member = await getUserUniversity()
        if (!member) {
            return { success: false, error: "Unauthorized" }
        }

        // Find the payment record
        const payment = await prisma.universityPayment.findFirst({
            where: {
                universityId: member.universityId,
                dodoCheckoutSessionId: input.sessionId,
            }
        })

        if (!payment) {
            return { success: false, error: "Payment not found" }
        }

        if (payment.status === "SUCCEEDED") {
            // Already processed
            const subscription = await prisma.universitySubscription.findUnique({
                where: { universityId: member.universityId }
            })
            
            const planConfig = subscription 
                ? UNIVERSITY_SUBSCRIPTION_PLANS[subscription.plan as UniversitySubscriptionPlanType]
                : null

            return {
                success: true,
                subscription: {
                    plan: subscription?.plan || "STARTER",
                    planName: planConfig?.name || "Starter",
                    status: subscription?.status || "ACTIVE",
                }
            }
        }

        // If still pending, the webhook hasn't processed it yet
        // Verify with Dodo API using the helper
        try {
            // Verify with Dodo Payments API
            const paymentDetails = await getDodoPayment(input.sessionId)
            
            if (paymentDetails.status === "succeeded") {
                // Process the successful payment
                await processSuccessfulPayment(
                    member.universityId,
                    input.sessionId,
                    payment.metadata as { plan: UniversitySubscriptionPlanType; billingCycle: "monthly" | "yearly" }
                )

                const plan = (payment.metadata as { plan: UniversitySubscriptionPlanType }).plan
                const planConfig = UNIVERSITY_SUBSCRIPTION_PLANS[plan]

                return {
                    success: true,
                    subscription: {
                        plan,
                        planName: planConfig.name,
                        status: "ACTIVE",
                    }
                }
            }

            return { success: false, error: "Payment not yet completed" }
        } catch (verifyError) {
            console.error("Dodo verification error:", verifyError)
            return { success: false, error: "Payment verification failed" }
        }
    } catch (error) {
        console.error("Verify checkout error:", error)
        return { success: false, error: "Failed to verify checkout" }
    }
}

/**
 * Process a successful payment (called from webhook or verification)
 */
export async function processSuccessfulPayment(
    universityId: string,
    paymentSessionId: string,
    metadata: { plan: UniversitySubscriptionPlanType; billingCycle: "monthly" | "yearly" }
): Promise<{ success: boolean; error?: string }> {
    try {
        const { plan, billingCycle } = metadata
        const planConfig = UNIVERSITY_SUBSCRIPTION_PLANS[plan]
        const limits = getPlanLimits(plan)
        const features = getPlanFeatures(plan)

        // Calculate period end
        const periodEnd = new Date()
        if (billingCycle === "monthly") {
            periodEnd.setMonth(periodEnd.getMonth() + 1)
        } else {
            periodEnd.setFullYear(periodEnd.getFullYear() + 1)
        }

        // Calculate amount
        const amount = billingCycle === "monthly" 
            ? planConfig.priceINR 
            : planConfig.yearlyPriceINR

        // Update payment status
        await prisma.universityPayment.updateMany({
            where: {
                universityId,
                dodoCheckoutSessionId: paymentSessionId,
            },
            data: {
                status: "SUCCEEDED",
                paidAt: new Date(),
            }
        })

        // Upsert subscription
        await prisma.universitySubscription.upsert({
            where: { universityId },
            update: {
                plan: plan as UniversitySubscriptionPlan,
                status: "ACTIVE",
                
                // Limits (match Prisma schema fields)
                maxStudents: limits.maxStudents,
                maxFaculty: limits.maxFaculty,
                maxDepartments: limits.maxDepartments,
                maxClassesPerFaculty: limits.maxClassesPerFaculty,
                maxCreditsPerMonth: limits.maxCreditsPerMonth,
                
                // Features (match Prisma schema fields)
                hasAnalytics: features.hasAnalytics,
                hasAdvancedReports: features.hasAdvancedReports,
                hasPlacementModule: features.hasPlacementModule,
                hasCompanyPortal: features.hasCompanyPortal,
                hasAPIAccess: features.hasAPIAccess,
                hasPrioritySupport: features.hasPrioritySupport,
                hasWhiteLabel: features.hasWhiteLabel,
                hasCustomBranding: features.hasCustomBranding,
                
                // Billing
                billingCycle: billingCycle.toUpperCase(),
                amount,
                currentPeriodStart: new Date(),
                currentPeriodEnd: periodEnd,
            },
            create: {
                universityId,
                plan: plan as UniversitySubscriptionPlan,
                status: "ACTIVE",
                
                // Limits (match Prisma schema fields)
                maxStudents: limits.maxStudents,
                maxFaculty: limits.maxFaculty,
                maxDepartments: limits.maxDepartments,
                maxClassesPerFaculty: limits.maxClassesPerFaculty,
                maxCreditsPerMonth: limits.maxCreditsPerMonth,
                
                // Features (match Prisma schema fields)
                hasAnalytics: features.hasAnalytics,
                hasAdvancedReports: features.hasAdvancedReports,
                hasPlacementModule: features.hasPlacementModule,
                hasCompanyPortal: features.hasCompanyPortal,
                hasAPIAccess: features.hasAPIAccess,
                hasPrioritySupport: features.hasPrioritySupport,
                hasWhiteLabel: features.hasWhiteLabel,
                hasCustomBranding: features.hasCustomBranding,
                
                // Billing
                billingCycle: billingCycle.toUpperCase(),
                amount,
                currency: "INR",
                currentPeriodStart: new Date(),
                currentPeriodEnd: periodEnd,
            }
        })

        revalidatePath("/billing")
        return { success: true }
    } catch (error) {
        console.error("Process payment error:", error)
        return { success: false, error: "Failed to process payment" }
    }
}

/**
 * Get billing portal URL (for managing subscription)
 */
export async function getBillingPortalUrl(returnUrl: string): Promise<{
    success: boolean
    portalUrl?: string
    error?: string
}> {
    try {
        const member = await getUserUniversity()
        if (!member) {
            return { success: false, error: "Unauthorized" }
        }

        // Check permission with proper type handling
        const permissions = member.permissions as string[] | null
        if (!permissions || !permissions.includes("manage_billing")) {
            return { success: false, error: "No permission to manage billing" }
        }

        const subscription = await prisma.universitySubscription.findUnique({
            where: { universityId: member.universityId }
        })

        if (!subscription) {
            return { success: false, error: "No active subscription found" }
        }

        if (!dodoClient) {
            return { success: false, error: "Payment system not configured" }
        }

        // If we have a Dodo customer ID, create a portal session
        if (subscription.dodoCustomerId) {
            try {
                // Create customer portal session with Dodo Payments
                // The portal session allows customers to manage their subscription
                const portalSession = await dodoClient.customers.customerPortal.create(
                    subscription.dodoCustomerId
                )

                return {
                    success: true,
                    portalUrl: portalSession.link,
                }
            } catch (portalError) {
                console.error("Dodo portal creation error:", portalError)
                // Fall through to return billing page URL
            }
        }

        // Fallback: Return internal billing page URL if no Dodo customer or portal fails
        // This allows users to still manage their subscription through our UI
        return {
            success: true,
            portalUrl: returnUrl || "/billing",
        }
    } catch (error) {
        console.error("Get billing portal error:", error)
        return { success: false, error: "Failed to get billing portal" }
    }
}

// Note: cancelSubscription is defined in subscription.action.ts

/**
 * Get current subscription details with full plan info
 */
export async function getSubscriptionWithPlanDetails(): Promise<{
    success: boolean
    subscription?: {
        plan: string
        planName: string
        status: string
        billingCycle: string
        amount: number
        currency: string
        currentPeriodStart: Date | null
        currentPeriodEnd: Date | null
        features: {
            hasAnalytics: boolean
            hasAdvancedReports: boolean
            hasPlacementModule: boolean
            hasCompanyPortal: boolean
            hasAPIAccess: boolean
            hasPrioritySupport: boolean
            hasWhiteLabel: boolean
            hasCustomBranding: boolean
        }
        limits: {
            maxStudents: number
            maxFaculty: number
            maxDepartments: number
            maxClassesPerFaculty: number
            maxCreditsPerMonth: number
        }
    }
    error?: string
}> {
    try {
        const member = await getUserUniversity()
        if (!member) {
            return { success: false, error: "Unauthorized" }
        }

        const subscription = await prisma.universitySubscription.findUnique({
            where: { universityId: member.universityId }
        })

        if (!subscription) {
            // Return free plan details if no subscription
            const freePlan = UNIVERSITY_SUBSCRIPTION_PLANS.FREE
            const freeLimits = getPlanLimits('FREE')
            const freeFeatures = getPlanFeatures('FREE')
            
            return {
                success: true,
                subscription: {
                    plan: 'FREE',
                    planName: freePlan.name,
                    status: 'ACTIVE',
                    billingCycle: 'N/A',
                    amount: 0,
                    currency: 'INR',
                    currentPeriodStart: null,
                    currentPeriodEnd: null,
                    features: freeFeatures,
                    limits: freeLimits,
                }
            }
        }

        const planConfig = UNIVERSITY_SUBSCRIPTION_PLANS[subscription.plan as UniversitySubscriptionPlanType]

        return {
            success: true,
            subscription: {
                plan: subscription.plan,
                planName: planConfig?.name || subscription.plan,
                status: subscription.status,
                billingCycle: subscription.billingCycle || 'monthly',
                amount: subscription.amount,
                currency: subscription.currency,
                currentPeriodStart: subscription.currentPeriodStart,
                currentPeriodEnd: subscription.currentPeriodEnd,
                features: {
                    hasAnalytics: subscription.hasAnalytics,
                    hasAdvancedReports: subscription.hasAdvancedReports,
                    hasPlacementModule: subscription.hasPlacementModule,
                    hasCompanyPortal: subscription.hasCompanyPortal,
                    hasAPIAccess: subscription.hasAPIAccess,
                    hasPrioritySupport: subscription.hasPrioritySupport,
                    hasWhiteLabel: subscription.hasWhiteLabel,
                    hasCustomBranding: subscription.hasCustomBranding,
                },
                limits: {
                    maxStudents: subscription.maxStudents,
                    maxFaculty: subscription.maxFaculty,
                    maxDepartments: subscription.maxDepartments,
                    maxClassesPerFaculty: subscription.maxClassesPerFaculty,
                    maxCreditsPerMonth: subscription.maxCreditsPerMonth,
                },
            }
        }
    } catch (error) {
        console.error("Get subscription details error:", error)
        return { success: false, error: "Failed to get subscription details" }
    }
}