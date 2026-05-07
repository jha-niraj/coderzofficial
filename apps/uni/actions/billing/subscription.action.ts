"use server";

import { db, universityMembers, universitySubscriptions, studentUniversityLinks, departments, universityClasses } from "@repo/db"
import { eq, and, inArray, count } from "drizzle-orm"
import { getSession } from "@repo/auth"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
    getPlanLimits,
    getPlanFeatures,
    UNIVERSITY_SUBSCRIPTION_PLANS,
} from "@/lib/dodopayments";

// ============================================================================
// Subscription Management
// ============================================================================

export async function getSubscription() {
    const session = await getSession(headers());
    if (!session?.user?.id) {
        return null;
    }

    const member = await db.query.universityMembers.findFirst({
        where: eq(universityMembers.userId, session.user.id),
        with: {
            university: {
                with: {
                    subscription: true,
                },
            },
        },
    });

    const subscription = member?.university?.subscription?.[0] ?? null;
    if (!subscription) {
        return null;
    }

    return subscription;
}

export async function getSubscriptionDetails() {
    const session = await getSession(headers());
    if (!session?.user?.id) {
        return null;
    }

    const member = await db.query.universityMembers.findFirst({
        where: eq(universityMembers.userId, session.user.id),
        with: {
            university: {
                with: {
                    subscription: true,
                },
            },
        },
    });

    const subscription = member?.university?.subscription?.[0] ?? null;
    if (!subscription) {
        return null;
    }

    return {
        id: subscription.id,
        plan: subscription.plan,
        status: subscription.status,
        currentPeriodStart: subscription.currentPeriodStart,
        currentPeriodEnd: subscription.currentPeriodEnd,
        dodoSubscriptionId: subscription.dodoSubscriptionId,
        dodoCustomerId: subscription.dodoCustomerId,
        billingCycle: subscription.billingCycle,
        amount: subscription.amount,
        currency: subscription.currency,
        maxStudents: subscription.maxStudents,
        maxFaculty: subscription.maxFaculty,
        maxDepartments: subscription.maxDepartments,
        maxClassesPerFaculty: subscription.maxClassesPerFaculty,
        maxCreditsPerMonth: subscription.maxCreditsPerMonth,
        hasAnalytics: subscription.hasAnalytics,
        hasAdvancedReports: subscription.hasAdvancedReports,
        hasPlacementModule: subscription.hasPlacementModule,
        hasCompanyPortal: subscription.hasCompanyPortal,
        hasAPIAccess: subscription.hasAPIAccess,
        hasPrioritySupport: subscription.hasPrioritySupport,
        hasWhiteLabel: subscription.hasWhiteLabel,
        hasCustomBranding: subscription.hasCustomBranding,
    };
}

export async function updateSubscriptionPlan(
    plan: "FREE" | "STARTER" | "GROWTH" | "ENTERPRISE"
) {
    const session = await getSession(headers());
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    const member = await db.query.universityMembers.findFirst({
        where: and(
            eq(universityMembers.userId, session.user.id),
            eq(universityMembers.role, "HEAD"),
        ),
        with: {
            university: {
                with: {
                    subscription: true,
                },
            },
        },
    });

    if (!member) {
        throw new Error("Not authorized to update subscription");
    }

    const limits = getPlanLimits(plan);
    const features = getPlanFeatures(plan);
    const existingSub = member.university.subscription?.[0] ?? null;

    if (!existingSub) {
        await db.insert(universitySubscriptions).values({
            universityId: member.universityId,
            plan,
            status: "ACTIVE",
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            ...limits,
            ...features,
        });
    } else {
        await db.update(universitySubscriptions).set({
            plan,
            ...limits,
            ...features,
        }).where(eq(universitySubscriptions.id, existingSub.id));
    }

    revalidatePath("/dashboard/billing");
    return { success: true };
}

export async function cancelSubscription() {
    const session = await getSession(headers());
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    const member = await db.query.universityMembers.findFirst({
        where: and(
            eq(universityMembers.userId, session.user.id),
            eq(universityMembers.role, "HEAD"),
        ),
        with: {
            university: {
                with: {
                    subscription: true,
                },
            },
        },
    });

    const cancelSub = member?.university?.subscription?.[0] ?? null;
    if (!cancelSub) {
        throw new Error("No subscription to cancel");
    }

    await db.update(universitySubscriptions).set({
        status: "CANCELLED",
    }).where(eq(universitySubscriptions.id, cancelSub.id));

    revalidatePath("/dashboard/billing");
    return { success: true };
}

export async function reactivateSubscription() {
    const session = await getSession(headers());
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    const member = await db.query.universityMembers.findFirst({
        where: and(
            eq(universityMembers.userId, session.user.id),
            eq(universityMembers.role, "HEAD"),
        ),
        with: {
            university: {
                with: {
                    subscription: true,
                },
            },
        },
    });

    const reactivateSub = member?.university?.subscription?.[0] ?? null;
    if (!reactivateSub) {
        throw new Error("No subscription to reactivate");
    }

    await db.update(universitySubscriptions).set({
        status: "ACTIVE",
    }).where(eq(universitySubscriptions.id, reactivateSub.id));

    revalidatePath("/dashboard/billing");
    return { success: true };
}

// ============================================================================
// Usage Statistics
// ============================================================================

export async function getUsageStats() {
    const session = await getSession(headers());
    if (!session?.user?.id) {
        return null;
    }

    const member = await db.query.universityMembers.findFirst({
        where: eq(universityMembers.userId, session.user.id),
        with: {
            university: {
                with: {
                    subscription: true,
                },
            },
        },
    });

    if (!member?.university) {
        return null;
    }

    const universityId = member.universityId;

    const [studentCountResult, facultyCountResult, departmentCountResult, classCountResult] = await Promise.all([
        db.select({ count: count() }).from(studentUniversityLinks).where(eq(studentUniversityLinks.universityId, universityId)),
        db.select({ count: count() }).from(universityMembers).where(
            and(
                eq(universityMembers.universityId, universityId),
                inArray(universityMembers.role, ["FACULTY", "HEAD", "DEPARTMENT_HEAD"]),
            )
        ),
        db.select({ count: count() }).from(departments).where(eq(departments.universityId, universityId)),
        db.select({ count: count() }).from(universityClasses).where(eq(universityClasses.universityId, universityId)),
    ]);

    const studentCount = studentCountResult[0]?.count ?? 0;
    const facultyCount = facultyCountResult[0]?.count ?? 0;
    const departmentCount = departmentCountResult[0]?.count ?? 0;
    const classCount = classCountResult[0]?.count ?? 0;

    const subscription = member.university.subscription?.[0] ?? null;
    const limits = subscription
        ? {
            maxStudents: subscription.maxStudents,
            maxFaculty: subscription.maxFaculty,
            maxDepartments: subscription.maxDepartments,
            maxClassesPerFaculty: subscription.maxClassesPerFaculty,
            maxCreditsPerMonth: subscription.maxCreditsPerMonth,
        }
        : getPlanLimits("FREE");

    return {
        students: {
            current: studentCount,
            limit: limits.maxStudents,
            percentage: Math.round((studentCount / limits.maxStudents) * 100),
        },
        faculty: {
            current: facultyCount,
            limit: limits.maxFaculty,
            percentage: Math.round((facultyCount / limits.maxFaculty) * 100),
        },
        departments: {
            current: departmentCount,
            limit: limits.maxDepartments,
            percentage: Math.round((departmentCount / limits.maxDepartments) * 100),
        },
        classes: {
            current: classCount,
            limit: limits.maxClassesPerFaculty * facultyCount,
            percentage:
                facultyCount > 0
                    ? Math.round((classCount / (limits.maxClassesPerFaculty * facultyCount)) * 100)
                    : 0,
        },
        credits: {
            current: 0,
            limit: limits.maxCreditsPerMonth,
            percentage: 0,
        },
    };
}

// ============================================================================
// Feature Checks
// ============================================================================

export async function hasFeature(
    feature:
        | "hasAnalytics"
        | "hasAdvancedReports"
        | "hasPlacementModule"
        | "hasCompanyPortal"
        | "hasAPIAccess"
        | "hasPrioritySupport"
        | "hasWhiteLabel"
        | "hasCustomBranding"
): Promise<boolean> {
    const subscription = await getSubscription();

    if (!subscription) {
        const freeFeatures = getPlanFeatures("FREE") as Record<string, boolean>;
        return freeFeatures[feature] ?? false;
    }

    return (subscription as Record<string, unknown>)[feature] as boolean ?? false;
}

export async function checkSubscriptionLimit(
    type: "students" | "faculty" | "departments" | "classes"
): Promise<{
    allowed: boolean;
    current: number;
    limit: number;
    message?: string;
}> {
    const session = await getSession(headers());
    if (!session?.user?.id) {
        return { allowed: false, current: 0, limit: 0, message: "Unauthorized" };
    }

    const member = await db.query.universityMembers.findFirst({
        where: eq(universityMembers.userId, session.user.id),
        with: {
            university: {
                with: {
                    subscription: true,
                },
            },
        },
    });

    if (!member?.university) {
        return { allowed: false, current: 0, limit: 0, message: "University not found" };
    }

    const universityId = member.universityId;
    const subscription = member.university.subscription?.[0] ?? null;
    const limits = subscription
        ? {
            maxStudents: subscription.maxStudents,
            maxFaculty: subscription.maxFaculty,
            maxDepartments: subscription.maxDepartments,
            maxClassesPerFaculty: subscription.maxClassesPerFaculty,
        }
        : getPlanLimits("FREE");

    let current: number;
    let limit: number;

    switch (type) {
        case "students":
            current = (await db.select({ count: count() }).from(studentUniversityLinks).where(eq(studentUniversityLinks.universityId, universityId)))[0]?.count ?? 0;
            limit = limits.maxStudents;
            break;
        case "faculty":
            current = (await db.select({ count: count() }).from(universityMembers).where(
                and(eq(universityMembers.universityId, universityId), inArray(universityMembers.role, ["FACULTY", "HEAD", "DEPARTMENT_HEAD"]))
            ))[0]?.count ?? 0;
            limit = limits.maxFaculty;
            break;
        case "departments":
            current = (await db.select({ count: count() }).from(departments).where(eq(departments.universityId, universityId)))[0]?.count ?? 0;
            limit = limits.maxDepartments;
            break;
        case "classes": {
            const facultyCount = (await db.select({ count: count() }).from(universityMembers).where(
                and(eq(universityMembers.universityId, universityId), inArray(universityMembers.role, ["FACULTY", "HEAD", "DEPARTMENT_HEAD"]))
            ))[0]?.count ?? 0;
            current = (await db.select({ count: count() }).from(universityClasses).where(eq(universityClasses.universityId, universityId)))[0]?.count ?? 0;
            limit = limits.maxClassesPerFaculty * facultyCount;
            break;
        }
    }

    const allowed = current < limit;

    return {
        allowed,
        current,
        limit,
        message: allowed
            ? undefined
            : `You have reached your ${type} limit. Please upgrade your plan to add more.`,
    };
}

// ============================================================================
// Billing Permission Checks
// ============================================================================

export async function canManageBilling(): Promise<boolean> {
    const session = await getSession(headers());
    if (!session?.user?.id) {
        return false;
    }

    const member = await db.query.universityMembers.findFirst({
        where: eq(universityMembers.userId, session.user.id),
    });

    if (!member) {
        return false;
    }

    if (member.role === "HEAD" || member.role === "FINANCE_OFFICER") {
        return true;
    }

    const permissions = member.permissions as string[] | null;
    return permissions?.includes("MANAGE_BILLING") ?? false;
}

export async function requireBillingPermission() {
    const canManage = await canManageBilling();
    if (!canManage) {
        redirect("/dashboard?error=unauthorized");
    }
}

// ============================================================================
// Plan Information
// ============================================================================

export async function getAvailablePlans() {
    return UNIVERSITY_SUBSCRIPTION_PLANS;
}

export async function getCurrentPlanInfo() {
    const subscription = await getSubscription();

    if (!subscription) {
        return {
            plan: "FREE" as const,
            ...getPlanLimits("FREE"),
            ...getPlanFeatures("FREE"),
        };
    }

    return {
        plan: subscription.plan,
        maxStudents: subscription.maxStudents,
        maxFaculty: subscription.maxFaculty,
        maxDepartments: subscription.maxDepartments,
        maxClassesPerFaculty: subscription.maxClassesPerFaculty,
        maxCreditsPerMonth: subscription.maxCreditsPerMonth,
        hasAnalytics: subscription.hasAnalytics,
        hasAdvancedReports: subscription.hasAdvancedReports,
        hasPlacementModule: subscription.hasPlacementModule,
        hasCompanyPortal: subscription.hasCompanyPortal,
        hasAPIAccess: subscription.hasAPIAccess,
        hasPrioritySupport: subscription.hasPrioritySupport,
        hasWhiteLabel: subscription.hasWhiteLabel,
        hasCustomBranding: subscription.hasCustomBranding,
    };
}

// ============================================================================
// Subscription Sync (for webhook handlers)
// ============================================================================

export async function syncSubscriptionFromPayment(
    universityId: string,
    paymentData: {
        dodoSubscriptionId?: string;
        dodoCustomerId?: string;
        plan: "FREE" | "STARTER" | "GROWTH" | "ENTERPRISE";
        status: "ACTIVE" | "CANCELLED" | "PAST_DUE";
        periodStart: Date;
        periodEnd: Date;
        amount?: number;
        currency?: string;
        billingCycle?: string;
    }
) {
    const limits = getPlanLimits(paymentData.plan);
    const features = getPlanFeatures(paymentData.plan);

    const existingSubscription = await db.query.universitySubscriptions.findFirst({
        where: eq(universitySubscriptions.universityId, universityId),
    });

    if (existingSubscription) {
        await db.update(universitySubscriptions).set({
            plan: paymentData.plan,
            status: paymentData.status,
            dodoSubscriptionId: paymentData.dodoSubscriptionId,
            dodoCustomerId: paymentData.dodoCustomerId,
            currentPeriodStart: paymentData.periodStart,
            currentPeriodEnd: paymentData.periodEnd,
            amount: paymentData.amount ?? 0,
            currency: paymentData.currency ?? "INR",
            billingCycle: paymentData.billingCycle ?? "monthly",
            ...limits,
            ...features,
        }).where(eq(universitySubscriptions.universityId, universityId));
    } else {
        await db.insert(universitySubscriptions).values({
            universityId,
            plan: paymentData.plan,
            status: paymentData.status,
            dodoSubscriptionId: paymentData.dodoSubscriptionId,
            dodoCustomerId: paymentData.dodoCustomerId,
            currentPeriodStart: paymentData.periodStart,
            currentPeriodEnd: paymentData.periodEnd,
            amount: paymentData.amount ?? 0,
            currency: paymentData.currency ?? "INR",
            billingCycle: paymentData.billingCycle ?? "monthly",
            ...limits,
            ...features,
        });
    }

    revalidatePath("/dashboard/billing");
}
