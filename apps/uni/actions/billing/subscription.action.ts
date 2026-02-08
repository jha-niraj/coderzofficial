"use server";

import { auth } from "@repo/auth";
import { prisma } from "@repo/prisma";
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
    const session = await auth();
    if (!session?.user?.id) {
        return null;
    }

    const member = await prisma.universityMember.findFirst({
        where: {
            userId: session.user.id,
        },
        include: {
            university: {
                include: {
                    subscription: true,
                },
            },
        },
    });

    if (!member?.university?.subscription) {
        return null;
    }

    return member.university.subscription;
}

export async function getSubscriptionDetails() {
    const session = await auth();
    if (!session?.user?.id) {
        return null;
    }

    const member = await prisma.universityMember.findFirst({
        where: {
            userId: session.user.id,
        },
        include: {
            university: {
                include: {
                    subscription: true,
                },
            },
        },
    });

    if (!member?.university?.subscription) {
        return null;
    }

    const subscription = member.university.subscription;

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
        // Limits
        maxStudents: subscription.maxStudents,
        maxFaculty: subscription.maxFaculty,
        maxDepartments: subscription.maxDepartments,
        maxClassesPerFaculty: subscription.maxClassesPerFaculty,
        maxCreditsPerMonth: subscription.maxCreditsPerMonth,
        // Features
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
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    const member = await prisma.universityMember.findFirst({
        where: {
            userId: session.user.id,
            role: "HEAD",
        },
        include: {
            university: {
                include: {
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

    if (!member.university.subscription) {
        // Create new subscription
        await prisma.universitySubscription.create({
            data: {
                universityId: member.universityId,
                plan,
                status: "ACTIVE",
                currentPeriodStart: new Date(),
                currentPeriodEnd: new Date(
                    Date.now() + 30 * 24 * 60 * 60 * 1000
                ),
                ...limits,
                ...features,
            },
        });
    } else {
        // Update existing subscription
        await prisma.universitySubscription.update({
            where: { id: member.university.subscription.id },
            data: {
                plan,
                ...limits,
                ...features,
            },
        });
    }

    revalidatePath("/dashboard/billing");
    return { success: true };
}

export async function cancelSubscription() {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    const member = await prisma.universityMember.findFirst({
        where: {
            userId: session.user.id,
            role: "HEAD",
        },
        include: {
            university: {
                include: {
                    subscription: true,
                },
            },
        },
    });

    if (!member?.university?.subscription) {
        throw new Error("No subscription to cancel");
    }

    // Mark subscription as cancelled (will remain active until period ends)
    await prisma.universitySubscription.update({
        where: { id: member.university.subscription.id },
        data: {
            status: "CANCELLED",
        },
    });

    revalidatePath("/dashboard/billing");
    return { success: true };
}

export async function reactivateSubscription() {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    const member = await prisma.universityMember.findFirst({
        where: {
            userId: session.user.id,
            role: "HEAD",
        },
        include: {
            university: {
                include: {
                    subscription: true,
                },
            },
        },
    });

    if (!member?.university?.subscription) {
        throw new Error("No subscription to reactivate");
    }

    await prisma.universitySubscription.update({
        where: { id: member.university.subscription.id },
        data: {
            status: "ACTIVE",
        },
    });

    revalidatePath("/dashboard/billing");
    return { success: true };
}

// ============================================================================
// Usage Statistics
// ============================================================================

export async function getUsageStats() {
    const session = await auth();
    if (!session?.user?.id) {
        return null;
    }

    const member = await prisma.universityMember.findFirst({
        where: {
            userId: session.user.id,
        },
        include: {
            university: {
                include: {
                    subscription: true,
                },
            },
        },
    });

    if (!member?.university) {
        return null;
    }

    const universityId = member.universityId;

    // Get counts
    const [studentCount, facultyCount, departmentCount, classCount] =
        await Promise.all([
            prisma.studentUniversityLink.count({
                where: { universityId },
            }),
            prisma.universityMember.count({
                where: {
                    universityId,
                    role: { in: ["FACULTY", "HEAD", "DEPARTMENT_HEAD"] },
                },
            }),
            prisma.department.count({
                where: { universityId },
            }),
            prisma.universityClass.count({
                where: { universityId },
            }),
        ]);

    const subscription = member.university.subscription;
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
                    ? Math.round(
                        (classCount / (limits.maxClassesPerFaculty * facultyCount)) * 100
                    )
                    : 0,
        },
        credits: {
            current: 0, // TODO: Implement credit tracking
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
        // Return free plan feature defaults
        const freeFeatures = getPlanFeatures("FREE");
        return freeFeatures[feature] ?? false;
    }

    return subscription[feature] ?? false;
}

export async function checkSubscriptionLimit(
    type: "students" | "faculty" | "departments" | "classes"
): Promise<{
    allowed: boolean;
    current: number;
    limit: number;
    message?: string;
}> {
    const session = await auth();
    if (!session?.user?.id) {
        return {
            allowed: false,
            current: 0,
            limit: 0,
            message: "Unauthorized",
        };
    }

    const member = await prisma.universityMember.findFirst({
        where: {
            userId: session.user.id,
        },
        include: {
            university: {
                include: {
                    subscription: true,
                },
            },
        },
    });

    if (!member?.university) {
        return {
            allowed: false,
            current: 0,
            limit: 0,
            message: "University not found",
        };
    }

    const universityId = member.universityId;
    const subscription = member.university.subscription;
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
            current = await prisma.studentUniversityLink.count({
                where: { universityId },
            });
            limit = limits.maxStudents;
            break;
        case "faculty":
            current = await prisma.universityMember.count({
                where: {
                    universityId,
                    role: { in: ["FACULTY", "HEAD", "DEPARTMENT_HEAD"] },
                },
            });
            limit = limits.maxFaculty;
            break;
        case "departments":
            current = await prisma.department.count({
                where: { universityId },
            });
            limit = limits.maxDepartments;
            break;
        case "classes":
            const facultyCount = await prisma.universityMember.count({
                where: {
                    universityId,
                    role: { in: ["FACULTY", "HEAD", "DEPARTMENT_HEAD"] },
                },
            });
            current = await prisma.universityClass.count({
                where: { universityId },
            });
            limit = limits.maxClassesPerFaculty * facultyCount;
            break;
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
    const session = await auth();
    if (!session?.user?.id) {
        return false;
    }

    const member = await prisma.universityMember.findFirst({
        where: {
            userId: session.user.id,
        },
    });

    if (!member) {
        return false;
    }

    // HEAD and FINANCE_OFFICER can manage billing
    if (member.role === "HEAD" || member.role === "FINANCE_OFFICER") {
        return true;
    }

    // Check if user has billing permission
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

    const existingSubscription = await prisma.universitySubscription.findUnique({
        where: { universityId },
    });

    if (existingSubscription) {
        await prisma.universitySubscription.update({
            where: { universityId },
            data: {
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
            },
        });
    } else {
        await prisma.universitySubscription.create({
            data: {
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
            },
        });
    }

    revalidatePath("/dashboard/billing");
}
