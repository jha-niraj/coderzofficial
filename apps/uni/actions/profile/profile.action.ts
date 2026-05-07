"use server"

import { db, users, universities, universityMembers, studentUniversityLinks, departments } from "@repo/db"
import { eq, and, count } from "drizzle-orm"
import { getSession } from "@repo/auth"
import { headers } from "next/headers"
import bcrypt from "bcryptjs";
import type {
    UserProfile,
    UniversityDetails,
    UpdateProfilePayload,
    ChangePasswordPayload,
    UpdateUniversityPayload,
    UniversityPermission,
    UniversityVerificationStatus,
} from "../../types";

// ============================================
// PROFILE FETCHING ACTIONS
// ============================================

/**
 * Check if user needs to change their password
 */
export async function checkMustChangePassword() {
    const session = await getSession(headers());

    if (!session?.user?.id) {
        return { success: false, mustChangePassword: false };
    }

    try {
        const user = await db.query.users.findFirst({
            where: eq(users.id, session.user.id),
            columns: { mustChangePassword: true },
        });

        return {
            success: true,
            mustChangePassword: user?.mustChangePassword || false,
        };
    } catch (error) {
        console.error("Check must change password error:", error);
        return { success: false, mustChangePassword: false };
    }
}

/**
 * Get the current user's profile
 */
export async function getUserProfile() {
    const session = await getSession(headers());

    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const user = await db.query.users.findFirst({
            where: eq(users.id, session.user.id),
            columns: {
                id: true,
                name: true,
                email: true,
                image: true,
                phone: true,
                bio: true,
                createdAt: true,
            },
        });

        if (!user) {
            return { success: false, error: "User not found" };
        }

        const profile: UserProfile = {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
            phone: user.phone,
            bio: user.bio,
            createdAt: user.createdAt,
        };

        return { success: true, data: profile };
    } catch (error) {
        console.error("Get user profile error:", error);
        return { success: false, error: "Failed to fetch user profile" };
    }
}

/**
 * Get the current user's university member info
 */
export async function getCurrentMember() {
    const session = await getSession(headers());

    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const member = await db.query.universityMembers.findFirst({
            where: eq(universityMembers.userId, session.user.id),
            with: {
                department: { columns: { id: true, name: true, code: true } },
            },
        });

        if (!member) {
            return { success: false, error: "Member not found" };
        }

        // Parse permissions from JSON
        let permissions: UniversityPermission[] = [];
        if (member.permissions) {
            try {
                const parsed = typeof member.permissions === "string"
                    ? JSON.parse(member.permissions)
                    : member.permissions;
                if (Array.isArray(parsed)) {
                    permissions = parsed as UniversityPermission[];
                }
            } catch {
                permissions = [];
            }
        }

        return {
            success: true,
            data: {
                id: member.id,
                userId: member.userId,
                universityId: member.universityId,
                departmentId: member.departmentId,
                role: member.role,
                jobTitle: member.jobTitle,
                jobTitleCustom: member.jobTitleCustom,
                displayName: member.displayName,
                email: member.email,
                phone: member.phone,
                permissions,
                isActive: member.isActive,
                lastActiveAt: member.lastActiveAt,
                createdAt: member.createdAt,
                updatedAt: member.updatedAt,
                department: member.department,
            },
        };
    } catch (error) {
        console.error("Get current member error:", error);
        return { success: false, error: "Failed to fetch member info" };
    }
}

/**
 * Get university details (accessible to all members)
 */
export async function getUniversityDetails() {
    const session = await getSession(headers());

    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const member = await db.query.universityMembers.findFirst({
            where: eq(universityMembers.userId, session.user.id),
            columns: { universityId: true, role: true },
        });

        if (!member) {
            return { success: false, error: "Not a member of any university" };
        }

        const university = await db.query.universities.findFirst({
            where: eq(universities.id, member.universityId),
        });

        if (!university) {
            return { success: false, error: "University not found" };
        }

        // Get counts
        const [memberCountResult, studentCountResult, departmentCountResult] = await Promise.all([
            db.select({ count: count() }).from(universityMembers).where(eq(universityMembers.universityId, member.universityId)),
            db.select({ count: count() }).from(studentUniversityLinks).where(eq(studentUniversityLinks.universityId, member.universityId)),
            db.select({ count: count() }).from(departments).where(eq(departments.universityId, member.universityId)),
        ])

        const universityDetails: UniversityDetails = {
            id: university.id,
            name: university.name,
            slug: university.slug,
            logoUrl: university.logoUrl,
            bannerUrl: university.bannerUrl,
            website: university.website,
            description: university.description,
            email: university.email,
            phone: university.phone,
            universityType: university.universityType,
            affiliatedTo: university.affiliatedTo,
            accreditation: university.accreditation,
            establishedYear: university.establishedYear,
            emailDomain: university.emailDomain,
            address: university.address,
            city: university.city,
            state: university.state,
            country: university.country,
            pincode: university.pincode,
            verificationStatus: university.verificationStatus as UniversityVerificationStatus,
            verifiedAt: university.verifiedAt,
            totalCreditsAllocated: university.totalCreditsAllocated,
            totalCreditsUsed: university.totalCreditsUsed,
            creditExpiryDate: university.creditExpiryDate,
            memberCount: memberCountResult[0]?.count ?? 0,
            studentCount: studentCountResult[0]?.count ?? 0,
            departmentCount: departmentCountResult[0]?.count ?? 0,
            createdAt: university.createdAt,
            updatedAt: university.updatedAt,
        };

        return {
            success: true,
            data: universityDetails,
            isHead: member.role === "HEAD",
        };
    } catch (error) {
        console.error("Get university details error:", error);
        return { success: false, error: "Failed to fetch university details" };
    }
}

// ============================================
// PROFILE UPDATE ACTIONS
// ============================================

/**
 * Update the current user's profile
 */
export async function updateUserProfile(payload: UpdateProfilePayload) {
    const session = await getSession(headers());

    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const updateData: Record<string, string | undefined> = {};
        if (payload.name !== undefined) updateData.name = payload.name;
        if (payload.phone !== undefined) updateData.phone = payload.phone;
        if (payload.bio !== undefined) updateData.bio = payload.bio;

        if (Object.keys(updateData).length > 0) {
            await db.update(users).set(updateData).where(eq(users.id, session.user.id));
        }

        if (payload.displayName !== undefined || payload.jobTitleCustom !== undefined) {
            const memberUpdateData: Record<string, string | undefined> = {};
            if (payload.displayName !== undefined) memberUpdateData.displayName = payload.displayName;
            if (payload.jobTitleCustom !== undefined) memberUpdateData.jobTitleCustom = payload.jobTitleCustom;

            await db.update(universityMembers).set(memberUpdateData).where(eq(universityMembers.userId, session.user.id));
        }

        return { success: true, message: "Profile updated successfully" };
    } catch (error) {
        console.error("Update profile error:", error);
        return { success: false, error: "Failed to update profile" };
    }
}

/**
 * Change the current user's password
 */
export async function changePassword(payload: ChangePasswordPayload) {
    const session = await getSession(headers());

    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" };
    }

    if (payload.newPassword !== payload.confirmPassword) {
        return { success: false, error: "New passwords do not match" };
    }

    if (payload.newPassword.length < 8) {
        return { success: false, error: "Password must be at least 8 characters" };
    }

    try {
        const user = await db.query.users.findFirst({
            where: eq(users.id, session.user.id),
            columns: { hashedPassword: true },
        });

        if (!user) {
            return { success: false, error: "User not found" };
        }

        if (!user.hashedPassword) {
            return { success: false, error: "Cannot change password for OAuth accounts" };
        }

        const isValid = await bcrypt.compare(payload.currentPassword, user.hashedPassword);
        if (!isValid) {
            return { success: false, error: "Current password is incorrect" };
        }

        const hashedPassword = await bcrypt.hash(payload.newPassword, 12);

        await db.update(users).set({
            hashedPassword,
            mustChangePassword: false,
        }).where(eq(users.id, session.user.id));

        return { success: true, message: "Password changed successfully" };
    } catch (error) {
        console.error("Change password error:", error);
        return { success: false, error: "Failed to change password" };
    }
}

/**
 * Update university details (HEAD only)
 */
export async function updateUniversityDetails(payload: UpdateUniversityPayload) {
    const session = await getSession(headers());

    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const member = await db.query.universityMembers.findFirst({
            where: eq(universityMembers.userId, session.user.id),
            columns: { universityId: true, role: true },
        });

        if (!member) {
            return { success: false, error: "Not a member of any university" };
        }

        if (member.role !== "HEAD") {
            return { success: false, error: "Only HEAD can update university details" };
        }

        const updateData: Record<string, unknown> = {};
        if (payload.name !== undefined) updateData.name = payload.name;
        if (payload.website !== undefined) updateData.website = payload.website;
        if (payload.description !== undefined) updateData.description = payload.description;
        if (payload.email !== undefined) updateData.email = payload.email;
        if (payload.phone !== undefined) updateData.phone = payload.phone;
        if (payload.universityType !== undefined) updateData.universityType = payload.universityType;
        if (payload.affiliatedTo !== undefined) updateData.affiliatedTo = payload.affiliatedTo;
        if (payload.accreditation !== undefined) updateData.accreditation = payload.accreditation;
        if (payload.establishedYear !== undefined) updateData.establishedYear = payload.establishedYear;
        if (payload.address !== undefined) updateData.address = payload.address;
        if (payload.city !== undefined) updateData.city = payload.city;
        if (payload.state !== undefined) updateData.state = payload.state;
        if (payload.country !== undefined) updateData.country = payload.country;
        if (payload.pincode !== undefined) updateData.pincode = payload.pincode;

        if (Object.keys(updateData).length > 0) {
            await db.update(universities).set(updateData).where(eq(universities.id, member.universityId));
        }

        return { success: true, message: "University details updated successfully" };
    } catch (error) {
        console.error("Update university error:", error);
        return { success: false, error: "Failed to update university details" };
    }
}
