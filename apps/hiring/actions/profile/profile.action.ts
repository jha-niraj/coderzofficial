"use server"

import { prisma } from "@repo/prisma";
import { auth } from "@repo/auth";
import bcrypt from "bcryptjs";
import type {
    UserProfile, CompanyDetails, UpdateProfilePayload, 
    ChangePasswordPayload, UpdateCompanyPayload, Permission, 
    CompanySocialLinks, CompanyVerificationStatus
} from "../../types";

// ============================================
// PROFILE FETCHING ACTIONS
// ============================================

/**
 * Get the current user's profile along with their company member info
 */
export async function getUserProfile() {
    const session = await auth();

    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: {
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
 * Get the current user's company member info
 */
export async function getCurrentMember() {
    const session = await auth();

    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const member = await prisma.companyMember.findFirst({
            where: { userId: session.user.id },
            select: {
                id: true,
                userId: true,
                companyId: true,
                role: true,
                jobTitle: true,
                jobTitleCustom: true,
                displayName: true,
                email: true,
                phone: true,
                permissions: true,
                isActive: true,
                lastActiveAt: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        if (!member) {
            return { success: false, error: "Member not found" };
        }

        // Parse permissions from JSON
        let permissions: Permission[] = [];
        if (member.permissions) {
            try {
                const parsed = typeof member.permissions === "string"
                    ? JSON.parse(member.permissions)
                    : member.permissions;
                if (Array.isArray(parsed)) {
                    permissions = parsed as Permission[];
                }
            } catch {
                permissions = [];
            }
        }

        return {
            success: true,
            data: {
                ...member,
                permissions,
            },
        };
    } catch (error) {
        console.error("Get current member error:", error);
        return { success: false, error: "Failed to fetch member info" };
    }
}

/**
 * Get company details (accessible to all members)
 */
export async function getCompanyDetails() {
    const session = await auth();

    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const member = await prisma.companyMember.findFirst({
            where: { userId: session.user.id },
            select: { companyId: true, role: true },
        });

        if (!member) {
            return { success: false, error: "Not a member of any company" };
        }

        const company = await prisma.company.findUnique({
            where: { id: member.companyId },
            include: {
                _count: {
                    select: {
                        members: true,
                        jobs: true,
                    },
                },
            },
        });

        if (!company) {
            return { success: false, error: "Company not found" };
        }

        // Parse social links
        let socialLinks: CompanySocialLinks | null = null;
        if (company.socialLinks) {
            try {
                socialLinks = company.socialLinks as CompanySocialLinks;
            } catch {
                socialLinks = null;
            }
        }

        const companyDetails: CompanyDetails = {
            id: company.id,
            name: company.name,
            slug: company.slug,
            logoUrl: company.logoUrl,
            website: company.website,
            description: company.description,
            industry: company.industry,
            companySize: company.companySize,
            foundedYear: company.foundedYear,
            headquarters: company.headquarters,
            socialLinks,
            address: company.address,
            city: company.city,
            state: company.state,
            country: company.country,
            pincode: company.pincode,
            verificationStatus: company.verificationStatus as CompanyVerificationStatus,
            verifiedAt: company.verifiedAt,
            memberCount: company._count.members,
            jobCount: company._count.jobs,
            createdAt: company.createdAt,
            updatedAt: company.updatedAt,
        };

        return {
            success: true,
            data: companyDetails,
            isHead: member.role === "FOUNDER",
        };
    } catch (error) {
        console.error("Get company details error:", error);
        return { success: false, error: "Failed to fetch company details" };
    }
}

// ============================================
// PROFILE UPDATE ACTIONS
// ============================================

/**
 * Update the current user's profile
 */
export async function updateUserProfile(payload: UpdateProfilePayload) {
    const session = await auth();

    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        // Update user info
        const updateData: Record<string, string | undefined> = {};
        if (payload.name !== undefined) updateData.name = payload.name;
        if (payload.phone !== undefined) updateData.phone = payload.phone;
        if (payload.bio !== undefined) updateData.bio = payload.bio;

        if (Object.keys(updateData).length > 0) {
            await prisma.user.update({
                where: { id: session.user.id },
                data: updateData,
            });
        }

        // Update company member info if display name or custom job title changed
        if (payload.displayName !== undefined || payload.jobTitleCustom !== undefined) {
            const memberUpdateData: Record<string, string | undefined> = {};
            if (payload.displayName !== undefined) memberUpdateData.displayName = payload.displayName;
            if (payload.jobTitleCustom !== undefined) memberUpdateData.jobTitleCustom = payload.jobTitleCustom;

            await prisma.companyMember.updateMany({
                where: { userId: session.user.id },
                data: memberUpdateData,
            });
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
    const session = await auth();

    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" };
    }

    // Validate password match
    if (payload.newPassword !== payload.confirmPassword) {
        return { success: false, error: "New passwords do not match" };
    }

    // Validate password strength
    if (payload.newPassword.length < 8) {
        return { success: false, error: "Password must be at least 8 characters" };
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { hashedPassword: true },
        });

        if (!user) {
            return { success: false, error: "User not found" };
        }

        // Check if user has a password (might be OAuth user)
        if (!user.hashedPassword) {
            return { success: false, error: "Cannot change password for OAuth accounts" };
        }

        // Verify current password
        const isValid = await bcrypt.compare(payload.currentPassword, user.hashedPassword);
        if (!isValid) {
            return { success: false, error: "Current password is incorrect" };
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(payload.newPassword, 12);

        // Update password
        await prisma.user.update({
            where: { id: session.user.id },
            data: { hashedPassword },
        });

        return { success: true, message: "Password changed successfully" };
    } catch (error) {
        console.error("Change password error:", error);
        return { success: false, error: "Failed to change password" };
    }
}

/**
 * Update company details (HEAD only)
 */
export async function updateCompanyDetails(payload: UpdateCompanyPayload) {
    const session = await auth();

    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        // Check if user is HEAD
        const member = await prisma.companyMember.findFirst({
            where: { userId: session.user.id },
            select: { companyId: true, role: true },
        });

        if (!member) {
            return { success: false, error: "Not a member of any company" };
        }

        if (member.role !== "FOUNDER") {
            return { success: false, error: "Only HEAD can update company details" };
        }

        // Build update data
        const updateData: Record<string, unknown> = {};
        if (payload.name !== undefined) updateData.name = payload.name;
        if (payload.website !== undefined) updateData.website = payload.website;
        if (payload.description !== undefined) updateData.description = payload.description;
        if (payload.industry !== undefined) updateData.industry = payload.industry;
        if (payload.companySize !== undefined) updateData.companySize = payload.companySize;
        if (payload.foundedYear !== undefined) updateData.foundedYear = payload.foundedYear;
        if (payload.headquarters !== undefined) updateData.headquarters = payload.headquarters;
        if (payload.address !== undefined) updateData.address = payload.address;
        if (payload.city !== undefined) updateData.city = payload.city;
        if (payload.state !== undefined) updateData.state = payload.state;
        if (payload.country !== undefined) updateData.country = payload.country;
        if (payload.pincode !== undefined) updateData.pincode = payload.pincode;
        if (payload.socialLinks !== undefined) updateData.socialLinks = payload.socialLinks;

        if (Object.keys(updateData).length > 0) {
            await prisma.company.update({
                where: { id: member.companyId },
                data: updateData,
            });
        }

        return { success: true, message: "Company details updated successfully" };
    } catch (error) {
        console.error("Update company error:", error);
        return { success: false, error: "Failed to update company details" };
    }
}
