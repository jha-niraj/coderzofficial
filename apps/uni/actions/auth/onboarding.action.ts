"use server"

import { db, users, universities, universityMembers, universityMemberInvitations } from "@repo/db"
import { eq, and } from "drizzle-orm"
import { getSession } from "@repo/auth"
import { headers } from "next/headers"
import type {
    UniversityMemberRole, UniversityMemberJobTitle,
    UniversityPermission, DEFAULT_HEAD_PERMISSIONS
} from "@/types";

// ============================================
// TYPES
// ============================================

interface UniversityOnboardingData {
    universityName: string;
    website?: string;
    description?: string;
    universityType?: string;
    affiliatedTo?: string;
    accreditation?: string;
    establishedYear?: number;
    emailDomain: string;
    // User info
    userRole: UniversityMemberJobTitle;
    displayName?: string;
    phone?: string;
}

// Default permissions for HEAD role
const HEAD_PERMISSIONS: UniversityPermission[] = [
    "view_classes",
    "create_classes",
    "edit_classes",
    "delete_classes",
    "create_assignments",
    "edit_assignments",
    "delete_assignments",
    "grade_submissions",
    "view_students",
    "verify_students",
    "manage_student_credits",
    "manage_departments",
    "manage_members",
    "invite_members",
    "manage_university",
    "manage_billing",
    "manage_credits",
    "manage_placements",
    "view_job_applications",
    "view_analytics",
    "view_reports",
];

// ============================================
// SERVER ACTIONS
// ============================================

/**
 * Complete onboarding for a new university
 */
export async function completeUniversityOnboarding(data: UniversityOnboardingData) {
    const session = await getSession(headers());

    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" };
    }

    const userId = session.user.id;

    try {
        // Create university slug from name
        const slug = data.universityName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "") +
            "-" + Math.random().toString(36).substring(2, 8);

        // Get user email
        const user = await db.query.users.findFirst({
            where: eq(users.id, userId),
            columns: { email: true, name: true },
        });

        if (!user) {
            return { success: false, error: "User not found" };
        }

        // Create university
        const universityRows = await db.insert(universities).values({
            name: data.universityName,
            slug,
            website: data.website || null,
            description: data.description || null,
            universityType: data.universityType as any || null,
            affiliatedTo: data.affiliatedTo || null,
            accreditation: data.accreditation || null,
            establishedYear: data.establishedYear || null,
            emailDomain: data.emailDomain,
            createdByUserId: userId,
            verificationStatus: "PENDING",
        }).returning();

        const university = universityRows[0];
        if (!university) {
            return { success: false, error: "Failed to create university" };
        }

        // Create university member (the user who registered as HEAD)
        await db.insert(universityMembers).values({
            userId,
            universityId: university.id,
            email: user.email,
            displayName: data.displayName || user.name,
            phone: data.phone || null,
            role: "HEAD",
            jobTitle: data.userRole,
            inviteStatus: "ACCEPTED",
            acceptedAt: new Date(),
            permissions: HEAD_PERMISSIONS,
        });

        // Mark user onboarding as completed and set role to UNI
        await db.update(users).set({
            onboardingCompleted: true,
            role: "UNI",
        }).where(eq(users.id, userId));

        return { success: true, universityId: university.id, slug };
    } catch (error) {
        console.error("University onboarding error:", error);
        return { success: false, error: "Failed to complete onboarding" };
    }
}

/**
 * Get current user's university
 */
export async function getUserUniversity() {
    const session = await getSession(headers());

    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const universityMember = await db.query.universityMembers.findFirst({
            where: eq(universityMembers.userId, session.user.id),
            with: { university: true },
        });

        if (!universityMember) {
            return { success: false, error: "No university found" };
        }

        return {
            success: true,
            data: {
                member: universityMember,
                university: universityMember.university,
            }
        };
    } catch (error) {
        console.error("Get university error:", error);
        return { success: false, error: "Failed to fetch university" };
    }
}

/**
 * Check if user has completed university onboarding
 */
export async function checkUniversityOnboardingStatus() {
    const session = await getSession(headers());

    if (!session?.user?.id) {
        return {
            success: false,
            isOnboarded: false,
            error: "Unauthorized"
        };
    }

    try {
        const user = await db.query.users.findFirst({
            where: eq(users.id, session.user.id),
            columns: { onboardingCompleted: true, role: true },
        });

        if (!user) {
            return { success: false, isOnboarded: false, error: "User not found" };
        }

        const universityMember = await db.query.universityMembers.findFirst({
            where: eq(universityMembers.userId, session.user.id),
        });

        const isOnboarded = user.onboardingCompleted && !!universityMember;

        return {
            success: true,
            isOnboarded,
            role: user.role,
        };
    } catch (error) {
        console.error("Check onboarding status error:", error);
        return { success: false, isOnboarded: false, error: "Failed to check status" };
    }
}

/**
 * Join an existing university via invite
 */
export async function joinUniversityViaInvite(inviteCode: string) {
    const session = await getSession(headers());

    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        // Find the invite
        const invite = await db.query.universityMemberInvitations.findFirst({
            where: and(
                eq(universityMemberInvitations.inviteCode, inviteCode),
                eq(universityMemberInvitations.status, "PENDING"),
            ),
            with: { university: true },
        });

        if (!invite || (invite.expiresAt && invite.expiresAt < new Date())) {
            return { success: false, error: "Invalid or expired invite" };
        }

        // Get user
        const user = await db.query.users.findFirst({
            where: eq(users.id, session.user.id),
            columns: { email: true, name: true },
        });

        if (!user) {
            return { success: false, error: "User not found" };
        }

        // Create the university member from the invite
        const memberRows = await db.insert(universityMembers).values({
            userId: session.user.id,
            universityId: invite.universityId,
            departmentId: invite.departmentId,
            email: user.email,
            displayName: invite.name || user.name,
            role: invite.role,
            jobTitle: invite.jobTitle,
            inviteStatus: "ACCEPTED",
            invitedById: invite.invitedById,
            invitedAt: invite.createdAt,
            acceptedAt: new Date(),
            permissions: getDefaultPermissionsForRole(invite.role),
        }).returning();

        const member = memberRows[0];
        if (!member) {
            return { success: false, error: "Failed to create university member" };
        }

        // Update the invitation status
        await db.update(universityMemberInvitations).set({
            status: "ACCEPTED",
            acceptedAt: new Date(),
            resultingMemberId: member.id,
        }).where(eq(universityMemberInvitations.id, invite.id));

        // Update user role if not already UNI
        await db.update(users).set({
            onboardingCompleted: true,
            role: "UNI",
        }).where(eq(users.id, session.user.id));

        return {
            success: true,
            universityId: invite.universityId,
            universityName: invite.university.name,
        };
    } catch (error) {
        console.error("Join university via invite error:", error);
        return { success: false, error: "Failed to join university" };
    }
}

// Helper function to get default permissions based on role
function getDefaultPermissionsForRole(role: string): string[] {
    switch (role) {
        case "HEAD":
            return HEAD_PERMISSIONS;
        case "DEPARTMENT_HEAD":
            return ["view_classes", "create_classes", "edit_classes", "create_assignments", "edit_assignments", "grade_submissions", "view_students", "manage_departments"];
        case "PLACEMENT_OFFICER":
            return ["view_students", "manage_placements", "view_job_applications", "view_analytics"];
        case "FINANCE_OFFICER":
            return ["manage_billing", "manage_credits", "view_reports"];
        case "FACULTY":
            return ["view_classes", "create_assignments", "edit_assignments", "grade_submissions", "view_students"];
        case "TEACHING_ASSISTANT":
            return ["view_classes", "grade_submissions", "view_students"];
        default:
            return ["view_classes", "view_students"];
    }
}

/**
 * Get current user's university member details
 */
export async function getCurrentMemberDetails() {
    const session = await getSession(headers());

    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const member = await db.query.universityMembers.findFirst({
            where: and(
                eq(universityMembers.userId, session.user.id),
                eq(universityMembers.isActive, true),
            ),
            with: {
                university: { columns: { id: true, name: true } },
                department: { columns: { id: true, name: true } },
            },
        });

        if (!member) {
            return { success: false, error: "Member not found" };
        }

        return {
            success: true,
            member: {
                id: member.id,
                role: member.role,
                jobTitle: member.jobTitle,
                displayName: member.displayName,
                permissions: member.permissions,
                university: member.university,
                department: member.department,
            },
        };
    } catch (error) {
        console.error("Get current member details error:", error);
        return { success: false, error: "Failed to fetch member details" };
    }
}

// Export alias for backward compatibility with onboarding page
export const completeOnboarding = completeUniversityOnboarding;
