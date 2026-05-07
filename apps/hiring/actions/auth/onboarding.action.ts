"use server"

import { db, users, companies, companyMembers } from "@repo/db"
import { eq } from "drizzle-orm"
import { getSession } from "@repo/auth"
import { headers } from "next/headers"

/**
 * Get pending company info from user registration
 * This fetches the company name that was entered during registration
 */
export async function getPendingCompanyInfo() {
    const session = await getSession(headers())

    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" }
    }

    try {
        const user = await db.query.users.findFirst({
            where: eq(users.id, session.user.id),
            columns: {
                company: true,
                name: true,
                email: true
            }
        })

        if (!user) {
            return { success: false, error: "User not found" }
        }

        // Generate a suggested website URL from company name
        const suggestedWebsite = user.company
            ? `https://${user.company.toLowerCase().replace(/[^a-z0-9]+/g, "")}.com`
            : null

        return {
            success: true,
            data: {
                companyName: user.company || "",
                userName: user.name || "",
                userEmail: user.email,
                suggestedWebsite
            }
        }
    } catch (error) {
        console.error("Get pending company info error:", error)
        return { success: false, error: "Failed to fetch company info" }
    }
}

interface OnboardingData {
    companyName: string
    slug: string
    website?: string
    industry?: string
    companySize?: string
    description?: string
    userRole: string
    hiringGoals?: string[]
    city?: string
    state?: string
    country?: string
    inviteBy?: string // University slug for referral tracking
}

export async function checkSlugAvailability(slug: string): Promise<{ available: boolean; suggestions?: string[] }> {
    if (!slug || slug.length < 2) {
        return { available: false }
    }

    try {
        const existingCompany = await db.query.companies.findFirst({
            where: eq(companies.slug, slug),
            columns: { id: true }
        })

        if (!existingCompany) {
            return { available: true }
        }

        // Generate suggestions if slug is taken
        const suggestions: string[] = []
        const baseSlugs = [
            `${slug}-hq`,
            `${slug}-team`,
            `${slug}-inc`,
            `${slug}-${Math.floor(Math.random() * 100)}`,
            `${slug}-${new Date().getFullYear()}`
        ]

        for (const suggestion of baseSlugs) {
            const exists = await db.query.companies.findFirst({
                where: eq(companies.slug, suggestion),
                columns: { id: true }
            })
            if (!exists) {
                suggestions.push(suggestion)
            }
            if (suggestions.length >= 3) break
        }

        return { available: false, suggestions }
    } catch {
        return { available: false }
    }
}

export async function completeOnboarding(data: OnboardingData) {
    const session = await getSession(headers())

    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" }
    }

    const userId = session.user.id

    try {
        // Determine if user is HEAD based on role selection
        const headRoles = ["CEO", "CTO", "COFOUNDER", "VP_ENGINEERING", "HR_HEAD"]
        const isHead = headRoles.includes(data.userRole)

        // Verify slug is available
        const existingCompany = await db.query.companies.findFirst({
            where: eq(companies.slug, data.slug),
            columns: { id: true }
        })

        if (existingCompany) {
            return { success: false, error: "This URL is already taken. Please choose a different one." }
        }

        // Create company with provided name and slug
        const insertedCompanies = await db.insert(companies).values({
            name: data.companyName,
            slug: data.slug,
            website: data.website || null,
            industry: data.industry || null,
            companySize: data.companySize || null,
            description: data.description || null,
            city: data.city || null,
            state: data.state || null,
            country: data.country || null,
            createdByUserId: userId,
            verificationStatus: "PENDING"
        }).returning()

        const company = insertedCompanies[0]
        if (!company) {
            return { success: false, error: "Failed to create company" }
        }

        // Get user email
        const user = await db.query.users.findFirst({
            where: eq(users.id, userId),
            columns: { email: true, name: true }
        })

        if (!user) {
            return { success: false, error: "User not found" }
        }

        // Create company member (the user who registered)
        await db.insert(companyMembers).values({
            userId,
            companyId: company.id,
            email: user.email,
            displayName: user.name,
            role: isHead ? "FOUNDER" : "RECRUITER",
            jobTitle: data.userRole as "CEO" | "CTO" | "COFOUNDER" | "VP_ENGINEERING" | "HR_HEAD" | "HR_MANAGER" | "RECRUITER" | "HIRING_MANAGER" | "OTHER",
            inviteStatus: "ACCEPTED",
            acceptedAt: new Date(),
            permissions: isHead
                ? JSON.stringify(["view_jobs", "post_jobs", "view_applications", "review_candidates", "manage_members", "manage_company", "manage_billing"])
                : JSON.stringify(["view_jobs", "post_jobs", "view_applications", "review_candidates"])
        })

        // Mark user onboarding as completed
        await db.update(users)
            .set({ onboardingCompleted: true })
            .where(eq(users.id, userId))

        // Note: University link creation skipped as it requires tables not in @repo/db schema

        return { success: true, companyId: company.id }
    } catch (error) {
        console.error("Onboarding error:", error)
        return { success: false, error: "Failed to complete onboarding" }
    }
}

export async function getUserCompany() {
    const session = await getSession(headers())

    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" }
    }

    try {
        const companyMember = await db.query.companyMembers.findFirst({
            where: eq(companyMembers.userId, session.user.id),
            with: { company: true }
        })

        if (!companyMember) {
            return { success: false, error: "No company found" }
        }

        return { success: true, data: companyMember }
    } catch (error) {
        console.error("Get company error:", error)
        return { success: false, error: "Failed to fetch company" }
    }
}
