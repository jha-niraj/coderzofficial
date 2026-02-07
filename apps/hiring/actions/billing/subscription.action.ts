"use server"

import { prisma } from "@repo/prisma"
import { auth } from "@repo/auth"
import { revalidatePath } from "next/cache"
import { 
    HIRING_SUBSCRIPTION_PLANS, type HiringSubscriptionPlanType 
} from "@/lib/dodopayments"
import type { SubscriptionDetails, UsageStats } from "@/types"

// Re-export types for backward compatibility
export type { SubscriptionDetails, UsageStats }

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
 * Get current subscription for the company
 */
export async function getCurrentSubscription(): Promise<{
    success: boolean
    subscription: SubscriptionDetails | null
    error?: string
}> {
    try {
        const member = await getUserCompany()
        if (!member) {
            return { success: false, subscription: null, error: "Unauthorized" }
        }

        const subscription = await prisma.companySubscription.findUnique({
            where: { companyId: member.companyId }
        })

        if (!subscription) {
            // Return free plan defaults
            const freePlan = HIRING_SUBSCRIPTION_PLANS.FREE
            return {
                success: true,
                subscription: {
                    id: "free",
                    plan: "FREE",
                    planName: freePlan.name,
                    status: "ACTIVE",
                    maxJobPosts: freePlan.maxJobPosts,
                    maxApplications: freePlan.maxApplications,
                    maxInterviewTemplates: freePlan.maxInterviewTemplates,
                    maxTeamMembers: freePlan.maxTeamMembers,
                    hasAIScreening: freePlan.hasAIScreening,
                    hasCustomAssignments: freePlan.hasCustomAssignments,
                    hasPrioritySupport: freePlan.hasPrioritySupport,
                    hasAPIAccess: freePlan.hasAPIAccess,
                    hasSSO: freePlan.hasSSO,
                    hasWhiteLabel: freePlan.hasWhiteLabel,
                    currentPeriodStart: new Date(),
                    currentPeriodEnd: null,
                    amount: 0,
                    currency: "INR",
                    billingCycle: "monthly",
                }
            }
        }

        const planConfig = HIRING_SUBSCRIPTION_PLANS[subscription.plan as HiringSubscriptionPlanType]

        return {
            success: true,
            subscription: {
                id: subscription.id,
                plan: subscription.plan as HiringSubscriptionPlanType,
                planName: planConfig?.name || subscription.plan,
                status: subscription.status,
                maxJobPosts: subscription.maxJobPosts,
                maxApplications: subscription.maxApplications,
                maxInterviewTemplates: subscription.maxInterviewTemplates,
                maxTeamMembers: subscription.maxTeamMembers,
                hasAIScreening: subscription.hasAIScreening,
                hasCustomAssignments: subscription.hasCustomAssignments,
                hasPrioritySupport: subscription.hasPrioritySupport,
                hasAPIAccess: subscription.hasAPIAccess,
                hasSSO: subscription.hasSSO,
                hasWhiteLabel: subscription.hasWhiteLabel,
                currentPeriodStart: subscription.currentPeriodStart,
                currentPeriodEnd: subscription.currentPeriodEnd,
                amount: subscription.amount,
                currency: subscription.currency,
                billingCycle: subscription.billingCycle,
            }
        }
    } catch (error) {
        console.error("Get subscription error:", error)
        return { success: false, subscription: null, error: "Failed to fetch subscription" }
    }
}

/**
 * Get usage statistics for the company
 */
export async function getUsageStats(): Promise<{
    success: boolean
    usage: UsageStats | null
    error?: string
}> {
    try {
        const member = await getUserCompany()
        if (!member) {
            return { success: false, usage: null, error: "Unauthorized" }
        }

        // Get subscription limits
        const subscription = await prisma.companySubscription.findUnique({
            where: { companyId: member.companyId }
        })

        const limits = subscription || {
            maxJobPosts: HIRING_SUBSCRIPTION_PLANS.FREE.maxJobPosts,
            maxApplications: HIRING_SUBSCRIPTION_PLANS.FREE.maxApplications,
            maxInterviewTemplates: HIRING_SUBSCRIPTION_PLANS.FREE.maxInterviewTemplates,
            maxTeamMembers: HIRING_SUBSCRIPTION_PLANS.FREE.maxTeamMembers,
        }

        // Get current month usage
        const startOfMonth = new Date()
        startOfMonth.setDate(1)
        startOfMonth.setHours(0, 0, 0, 0)

        // Count active jobs
        const activeJobs = await prisma.job.count({
            where: {
                companyId: member.companyId,
                status: "ACTIVE",
            }
        })

        // Count applications this month
        const applicationsThisMonth = await prisma.jobApplication.count({
            where: {
                job: { companyId: member.companyId },
                appliedAt: { gte: startOfMonth }
            }
        })

        // Count interview templates
        const interviewTemplates = await prisma.interviewProcess.count({
            where: { companyId: member.companyId }
        })

        // Count team members
        const teamMembers = await prisma.companyMember.count({
            where: { companyId: member.companyId }
        })

        return {
            success: true,
            usage: {
                jobsUsed: activeJobs,
                jobsLimit: limits.maxJobPosts,
                applicationsUsed: applicationsThisMonth,
                applicationsLimit: limits.maxApplications,
                templatesUsed: interviewTemplates,
                templatesLimit: limits.maxInterviewTemplates,
                teamMembers: teamMembers,
                teamLimit: limits.maxTeamMembers,
            }
        }
    } catch (error) {
        console.error("Get usage stats error:", error)
        return { success: false, usage: null, error: "Failed to fetch usage stats" }
    }
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(): Promise<{
    success: boolean
    error?: string
}> {
    try {
        const member = await getUserCompany()
        if (!member) {
            return { success: false, error: "Unauthorized" }
        }

        const subscription = await prisma.companySubscription.findUnique({
            where: { companyId: member.companyId }
        })

        if (!subscription) {
            return { success: false, error: "No active subscription found" }
        }

        if (subscription.plan === "FREE") {
            return { success: false, error: "Cannot cancel free plan" }
        }

        // Mark subscription as cancelled (will remain active until period end)
        await prisma.companySubscription.update({
            where: { id: subscription.id },
            data: {
                status: "CANCELLED",
                cancelledAt: new Date(),
            }
        })

        revalidatePath("/billing")

        return { success: true }
    } catch (error) {
        console.error("Cancel subscription error:", error)
        return { success: false, error: "Failed to cancel subscription" }
    }
}

/**
 * Check if company can perform action based on subscription limits
 */
export async function checkSubscriptionLimit(action: 'job' | 'application' | 'template' | 'member'): Promise<{
    allowed: boolean
    message?: string
    currentUsage?: number
    limit?: number
}> {
    try {
        const usageResult = await getUsageStats()
        if (!usageResult.success || !usageResult.usage) {
            return { allowed: false, message: "Failed to check limits" }
        }

        const usage = usageResult.usage

        switch (action) {
            case 'job':
                if (usage.jobsUsed >= usage.jobsLimit) {
                    return {
                        allowed: false,
                        message: `Job post limit reached (${usage.jobsLimit}). Please upgrade your plan.`,
                        currentUsage: usage.jobsUsed,
                        limit: usage.jobsLimit,
                    }
                }
                break
            case 'application':
                if (usage.applicationsUsed >= usage.applicationsLimit) {
                    return {
                        allowed: false,
                        message: `Monthly application limit reached (${usage.applicationsLimit}). Please upgrade your plan.`,
                        currentUsage: usage.applicationsUsed,
                        limit: usage.applicationsLimit,
                    }
                }
                break
            case 'template':
                if (usage.templatesUsed >= usage.templatesLimit) {
                    return {
                        allowed: false,
                        message: `Interview template limit reached (${usage.templatesLimit}). Please upgrade your plan.`,
                        currentUsage: usage.templatesUsed,
                        limit: usage.templatesLimit,
                    }
                }
                break
            case 'member':
                if (usage.teamMembers >= usage.teamLimit) {
                    return {
                        allowed: false,
                        message: `Team member limit reached (${usage.teamLimit}). Please upgrade your plan.`,
                        currentUsage: usage.teamMembers,
                        limit: usage.teamLimit,
                    }
                }
                break
        }

        return { allowed: true }
    } catch (error) {
        console.error("Check subscription limit error:", error)
        return { allowed: false, message: "Failed to check subscription limits" }
    }
}
