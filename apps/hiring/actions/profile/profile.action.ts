"use server"

import { db, users, companyMembers, companies } from "@repo/db"
import { eq } from "drizzle-orm"
import { getSession } from "@repo/auth"
import { headers } from "next/headers"
import bcrypt from "bcryptjs"
import type {
    UserProfile, CompanyDetails, UpdateProfilePayload,
    ChangePasswordPayload, UpdateCompanyPayload, Permission,
    CompanySocialLinks, CompanyVerificationStatus
} from "../../types"

// ============================================
// PROFILE FETCHING ACTIONS
// ============================================

/**
 * Get the current user's profile along with their company member info
 */
export async function getUserProfile() {
    const session = await getSession(headers())

    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" }
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
                createdAt: true
            }
        })

        if (!user) {
            return { success: false, error: "User not found" }
        }

        const profile: UserProfile = {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image ?? null,
            phone: user.phone ?? null,
            bio: user.bio ?? null,
            createdAt: user.createdAt
        }

        return { success: true, data: profile }
    } catch (error) {
        console.error("Get user profile error:", error)
        return { success: false, error: "Failed to fetch user profile" }
    }
}

/**
 * Get the current user's company member info
 */
export async function getCurrentMember() {
    const session = await getSession(headers())

    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" }
    }

    try {
        const member = await db.query.companyMembers.findFirst({
            where: eq(companyMembers.userId, session.user.id),
            columns: {
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
                updatedAt: true
            }
        })

        if (!member) {
            return { success: false, error: "Member not found" }
        }

        // Parse permissions from JSON
        let permissions: Permission[] = []
        if (member.permissions) {
            try {
                const parsed = typeof member.permissions === "string"
                    ? JSON.parse(member.permissions)
                    : member.permissions
                if (Array.isArray(parsed)) {
                    permissions = parsed as Permission[]
                }
            } catch {
                permissions = []
            }
        }

        return {
            success: true,
            data: {
                ...member,
                permissions
            }
        }
    } catch (error) {
        console.error("Get current member error:", error)
        return { success: false, error: "Failed to fetch member info" }
    }
}

/**
 * Get company details (accessible to all members)
 */
export async function getCompanyDetails() {
    const session = await getSession(headers())

    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" }
    }

    try {
        const member = await db.query.companyMembers.findFirst({
            where: eq(companyMembers.userId, session.user.id),
            columns: { companyId: true, role: true }
        })

        if (!member) {
            return { success: false, error: "Not a member of any company" }
        }

        const company = await db.query.companies.findFirst({
            where: eq(companies.id, member.companyId)
        })

        if (!company) {
            return { success: false, error: "Company not found" }
        }

        // Fetch member count and job count separately
        const { jobs } = await import("@repo/db")
        const { count: countFn } = await import("drizzle-orm")
        const memberCountRows = await db
            .select({ count: countFn() })
            .from(companyMembers)
            .where(eq(companyMembers.companyId, member.companyId))
        const jobCountRows = await db
            .select({ count: countFn() })
            .from(jobs)
            .where(eq(jobs.companyId, member.companyId))

        // Parse social links
        let socialLinks: CompanySocialLinks | null = null
        if (company.socialLinks) {
            try {
                socialLinks = company.socialLinks as CompanySocialLinks
            } catch {
                socialLinks = null
            }
        }

        const companyDetails: CompanyDetails = {
            id: company.id,
            name: company.name,
            slug: company.slug,
            logoUrl: company.logoUrl ?? null,
            website: company.website ?? null,
            description: company.description ?? null,
            industry: company.industry ?? null,
            companySize: company.companySize ?? null,
            foundedYear: company.foundedYear ?? null,
            headquarters: company.headquarters ?? null,
            socialLinks,
            address: company.address ?? null,
            city: company.city ?? null,
            state: company.state ?? null,
            country: company.country ?? null,
            pincode: company.pincode ?? null,
            verificationStatus: company.verificationStatus as CompanyVerificationStatus,
            verifiedAt: company.verifiedAt ?? null,
            memberCount: memberCountRows[0]?.count ?? 0,
            jobCount: jobCountRows[0]?.count ?? 0,
            createdAt: company.createdAt,
            updatedAt: company.updatedAt
        }

        return {
            success: true,
            data: companyDetails,
            isHead: member.role === "FOUNDER"
        }
    } catch (error) {
        console.error("Get company details error:", error)
        return { success: false, error: "Failed to fetch company details" }
    }
}

// ============================================
// PROFILE UPDATE ACTIONS
// ============================================

/**
 * Update the current user's profile
 */
export async function updateUserProfile(payload: UpdateProfilePayload) {
    const session = await getSession(headers())

    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" }
    }

    try {
        // Update user info
        const updateData: Record<string, string | undefined> = {}
        if (payload.name !== undefined) updateData.name = payload.name
        if (payload.phone !== undefined) updateData.phone = payload.phone
        if (payload.bio !== undefined) updateData.bio = payload.bio

        if (Object.keys(updateData).length > 0) {
            await db.update(users)
                .set(updateData)
                .where(eq(users.id, session.user.id))
        }

        // Update company member info if display name or custom job title changed
        if (payload.displayName !== undefined || payload.jobTitleCustom !== undefined) {
            const memberUpdateData: Record<string, string | undefined> = {}
            if (payload.displayName !== undefined) memberUpdateData.displayName = payload.displayName
            if (payload.jobTitleCustom !== undefined) memberUpdateData.jobTitleCustom = payload.jobTitleCustom

            await db.update(companyMembers)
                .set(memberUpdateData)
                .where(eq(companyMembers.userId, session.user.id))
        }

        return { success: true, message: "Profile updated successfully" }
    } catch (error) {
        console.error("Update profile error:", error)
        return { success: false, error: "Failed to update profile" }
    }
}

/**
 * Change the current user's password
 */
export async function changePassword(payload: ChangePasswordPayload) {
    const session = await getSession(headers())

    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" }
    }

    // Validate password match
    if (payload.newPassword !== payload.confirmPassword) {
        return { success: false, error: "New passwords do not match" }
    }

    // Validate password strength
    if (payload.newPassword.length < 8) {
        return { success: false, error: "Password must be at least 8 characters" }
    }

    try {
        const user = await db.query.users.findFirst({
            where: eq(users.id, session.user.id),
            columns: { hashedPassword: true }
        })

        if (!user) {
            return { success: false, error: "User not found" }
        }

        // Check if user has a password (might be OAuth user)
        if (!user.hashedPassword) {
            return { success: false, error: "Cannot change password for OAuth accounts" }
        }

        // Verify current password
        const isValid = await bcrypt.compare(payload.currentPassword, user.hashedPassword)
        if (!isValid) {
            return { success: false, error: "Current password is incorrect" }
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(payload.newPassword, 12)

        // Update password
        await db.update(users)
            .set({ hashedPassword })
            .where(eq(users.id, session.user.id))

        return { success: true, message: "Password changed successfully" }
    } catch (error) {
        console.error("Change password error:", error)
        return { success: false, error: "Failed to change password" }
    }
}

/**
 * Update company details (HEAD only)
 */
export async function updateCompanyDetails(payload: UpdateCompanyPayload) {
    const session = await getSession(headers())

    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" }
    }

    try {
        // Check if user is HEAD
        const member = await db.query.companyMembers.findFirst({
            where: eq(companyMembers.userId, session.user.id),
            columns: { companyId: true, role: true }
        })

        if (!member) {
            return { success: false, error: "Not a member of any company" }
        }

        if (member.role !== "FOUNDER") {
            return { success: false, error: "Only HEAD can update company details" }
        }

        // Build update data
        const updateData: Record<string, unknown> = {}
        if (payload.name !== undefined) updateData.name = payload.name
        if (payload.website !== undefined) updateData.website = payload.website
        if (payload.description !== undefined) updateData.description = payload.description
        if (payload.industry !== undefined) updateData.industry = payload.industry
        if (payload.companySize !== undefined) updateData.companySize = payload.companySize
        if (payload.foundedYear !== undefined) updateData.foundedYear = payload.foundedYear
        if (payload.headquarters !== undefined) updateData.headquarters = payload.headquarters
        if (payload.address !== undefined) updateData.address = payload.address
        if (payload.city !== undefined) updateData.city = payload.city
        if (payload.state !== undefined) updateData.state = payload.state
        if (payload.country !== undefined) updateData.country = payload.country
        if (payload.pincode !== undefined) updateData.pincode = payload.pincode
        if (payload.socialLinks !== undefined) updateData.socialLinks = payload.socialLinks

        if (Object.keys(updateData).length > 0) {
            await db.update(companies)
                .set(updateData)
                .where(eq(companies.id, member.companyId))
        }

        return { success: true, message: "Company details updated successfully" }
    } catch (error) {
        console.error("Update company error:", error)
        return { success: false, error: "Failed to update company details" }
    }
}
