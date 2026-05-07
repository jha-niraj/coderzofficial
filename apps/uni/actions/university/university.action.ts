"use server"

import { db, universities, universityMembers, departments, universityClasses, studentUniversityLinks, universityAssignments, universitySubmissions } from "@repo/db"
import { eq, and, count } from "drizzle-orm"
import { getSession } from "@repo/auth"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"

// ============================================
// HELPERS
// ============================================

async function getUserUniversity() {
    const session = await getSession(headers())
    if (!session?.user?.id) return null

    const member = await db.query.universityMembers.findFirst({
        where: eq(universityMembers.userId, session.user.id),
    })

    return member
}

// ============================================
// SERVER ACTIONS
// ============================================

/**
 * Get university details
 */
export async function getUniversityDetails(): Promise<{
    success: boolean
    university?: {
        id: string
        name: string
        slug: string
        logoUrl: string | null
        bannerUrl: string | null
        website: string | null
        description: string | null
        email: string | null
        phone: string | null
        universityType: string | null
        affiliatedTo: string | null
        accreditation: string | null
        establishedYear: number | null
        emailDomain: string | null
        address: string | null
        city: string | null
        state: string | null
        country: string | null
        pincode: string | null
        verificationStatus: string
        verifiedAt: Date | null
        totalCreditsAllocated: number
        totalCreditsUsed: number
        creditExpiryDate: Date | null
        memberCount: number
        studentCount: number
        departmentCount: number
        createdAt: Date
        updatedAt: Date
    }
    error?: string
}> {
    try {
        const member = await getUserUniversity()
        if (!member) {
            return { success: false, error: "Unauthorized" }
        }

        const university = await db.query.universities.findFirst({
            where: eq(universities.id, member.universityId),
        })

        if (!university) {
            return { success: false, error: "University not found" }
        }

        const [memberCountResult, studentCountResult, departmentCountResult] = await Promise.all([
            db.select({ count: count() }).from(universityMembers).where(eq(universityMembers.universityId, member.universityId)),
            db.select({ count: count() }).from(studentUniversityLinks).where(eq(studentUniversityLinks.universityId, member.universityId)),
            db.select({ count: count() }).from(departments).where(eq(departments.universityId, member.universityId)),
        ])

        return {
            success: true,
            university: {
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
                verificationStatus: university.verificationStatus,
                verifiedAt: university.verifiedAt,
                totalCreditsAllocated: university.totalCreditsAllocated,
                totalCreditsUsed: university.totalCreditsUsed,
                creditExpiryDate: university.creditExpiryDate,
                memberCount: memberCountResult[0]?.count ?? 0,
                studentCount: studentCountResult[0]?.count ?? 0,
                departmentCount: departmentCountResult[0]?.count ?? 0,
                createdAt: university.createdAt,
                updatedAt: university.updatedAt,
            }
        }
    } catch (error) {
        console.error("Get university details error:", error)
        return { success: false, error: "Failed to fetch university details" }
    }
}

/**
 * Update university details
 */
export async function updateUniversityDetails(data: {
    name?: string
    website?: string
    description?: string
    email?: string
    phone?: string
    universityType?: string
    affiliatedTo?: string
    accreditation?: string
    establishedYear?: number
    address?: string
    city?: string
    state?: string
    country?: string
    pincode?: string
}): Promise<{
    success: boolean
    error?: string
}> {
    try {
        const member = await getUserUniversity()
        if (!member) {
            return { success: false, error: "Unauthorized" }
        }

        // Check permission
        const permissions = member.permissions as string[] | null
        if (member.role !== "HEAD" && !permissions?.includes("MANAGE_UNIVERSITY")) {
            return { success: false, error: "No permission to manage university" }
        }

        await db.update(universities).set(data as Record<string, unknown>).where(eq(universities.id, member.universityId))

        revalidatePath("/dashboard/settings")
        return { success: true }
    } catch (error) {
        console.error("Update university error:", error)
        return { success: false, error: "Failed to update university" }
    }
}

/**
 * Update university logo
 */
export async function updateUniversityLogo(logoUrl: string): Promise<{
    success: boolean
    error?: string
}> {
    try {
        const member = await getUserUniversity()
        if (!member) {
            return { success: false, error: "Unauthorized" }
        }

        const permissions = member.permissions as string[] | null
        if (member.role !== "HEAD" && !permissions?.includes("MANAGE_UNIVERSITY")) {
            return { success: false, error: "No permission to manage university" }
        }

        await db.update(universities).set({ logoUrl }).where(eq(universities.id, member.universityId))

        revalidatePath("/dashboard/settings")
        return { success: true }
    } catch (error) {
        console.error("Update logo error:", error)
        return { success: false, error: "Failed to update logo" }
    }
}

/**
 * Update university banner
 */
export async function updateUniversityBanner(bannerUrl: string): Promise<{
    success: boolean
    error?: string
}> {
    try {
        const member = await getUserUniversity()
        if (!member) {
            return { success: false, error: "Unauthorized" }
        }

        const permissions = member.permissions as string[] | null
        if (member.role !== "HEAD" && !permissions?.includes("MANAGE_UNIVERSITY")) {
            return { success: false, error: "No permission to manage university" }
        }

        await db.update(universities).set({ bannerUrl }).where(eq(universities.id, member.universityId))

        revalidatePath("/dashboard/settings")
        return { success: true }
    } catch (error) {
        console.error("Update banner error:", error)
        return { success: false, error: "Failed to update banner" }
    }
}

/**
 * Get university stats
 */
export async function getUniversityStats(): Promise<{
    success: boolean
    stats?: {
        totalStudents: number
        verifiedStudents: number
        pendingStudents: number
        totalFaculty: number
        activeFaculty: number
        totalDepartments: number
        totalClasses: number
        activeClasses: number
        totalAssignments: number
        pendingGrading: number
        creditsAllocated: number
        creditsUsed: number
    }
    error?: string
}> {
    try {
        const member = await getUserUniversity()
        if (!member) {
            return { success: false, error: "Unauthorized" }
        }

        const uniId = member.universityId

        const [
            totalStudents,
            verifiedStudents,
            pendingStudents,
            totalFaculty,
            activeFaculty,
            totalDepartments,
            totalClasses,
            activeClasses,
            totalAssignments,
            pendingSubmissions,
            university,
        ] = await Promise.all([
            db.select({ count: count() }).from(studentUniversityLinks).where(eq(studentUniversityLinks.universityId, uniId)),
            db.select({ count: count() }).from(studentUniversityLinks).where(and(eq(studentUniversityLinks.universityId, uniId), eq(studentUniversityLinks.verificationStatus, "VERIFIED"))),
            db.select({ count: count() }).from(studentUniversityLinks).where(and(eq(studentUniversityLinks.universityId, uniId), eq(studentUniversityLinks.verificationStatus, "PENDING"))),
            db.select({ count: count() }).from(universityMembers).where(eq(universityMembers.universityId, uniId)),
            db.select({ count: count() }).from(universityMembers).where(and(eq(universityMembers.universityId, uniId), eq(universityMembers.isActive, true))),
            db.select({ count: count() }).from(departments).where(eq(departments.universityId, uniId)),
            db.select({ count: count() }).from(universityClasses).where(eq(universityClasses.universityId, uniId)),
            db.select({ count: count() }).from(universityClasses).where(and(eq(universityClasses.universityId, uniId), eq(universityClasses.isActive, true))),
            db.select({ count: count() }).from(universityAssignments).innerJoin(universityClasses, eq(universityAssignments.classId, universityClasses.id)).where(eq(universityClasses.universityId, uniId)),
            db.select({ count: count() }).from(universitySubmissions).where(eq(universitySubmissions.status, "SUBMITTED")),
            db.query.universities.findFirst({
                where: eq(universities.id, uniId),
                columns: { totalCreditsAllocated: true, totalCreditsUsed: true },
            }),
        ])

        return {
            success: true,
            stats: {
                totalStudents: totalStudents[0]?.count ?? 0,
                verifiedStudents: verifiedStudents[0]?.count ?? 0,
                pendingStudents: pendingStudents[0]?.count ?? 0,
                totalFaculty: totalFaculty[0]?.count ?? 0,
                activeFaculty: activeFaculty[0]?.count ?? 0,
                totalDepartments: totalDepartments[0]?.count ?? 0,
                totalClasses: totalClasses[0]?.count ?? 0,
                activeClasses: activeClasses[0]?.count ?? 0,
                totalAssignments: totalAssignments[0]?.count ?? 0,
                pendingGrading: pendingSubmissions[0]?.count ?? 0,
                creditsAllocated: university?.totalCreditsAllocated ?? 0,
                creditsUsed: university?.totalCreditsUsed ?? 0,
            }
        }
    } catch (error) {
        console.error("Get university stats error:", error)
        return { success: false, error: "Failed to fetch stats" }
    }
}

/**
 * Get university members
 */
export async function getUniversityMembers(): Promise<{
    success: boolean
    members?: Array<{
        id: string
        userId: string
        displayName: string | null
        email: string
        role: string
        jobTitle: string
        isActive: boolean
        departmentId: string | null
        createdAt: Date
    }>
    error?: string
}> {
    try {
        const member = await getUserUniversity()
        if (!member) {
            return { success: false, error: "Unauthorized" }
        }

        const members = await db.query.universityMembers.findMany({
            where: eq(universityMembers.universityId, member.universityId),
            orderBy: (universityMembers, { desc }) => [desc(universityMembers.createdAt)],
        })

        return {
            success: true,
            members: members.map(m => ({
                id: m.id,
                userId: m.userId,
                displayName: m.displayName,
                email: m.email,
                role: m.role,
                jobTitle: m.jobTitle,
                isActive: m.isActive,
                departmentId: m.departmentId,
                createdAt: m.createdAt,
            }))
        }
    } catch (error) {
        console.error("Get university members error:", error)
        return { success: false, error: "Failed to fetch members" }
    }
}
