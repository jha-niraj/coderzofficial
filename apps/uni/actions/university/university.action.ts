"use server"

import { prisma } from "@repo/prisma"
import { auth } from "@repo/auth"
import { revalidatePath } from "next/cache"
import type { 
    UniversityVerificationStatus 
} from "@repo/prisma/client"

// ============================================
// HELPERS
// ============================================

async function getUserUniversity() {
    const session = await auth()
    if (!session?.user?.id) return null

    const member = await prisma.universityMember.findFirst({
        where: { userId: session.user.id },
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
        verificationStatus: UniversityVerificationStatus
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

        const university = await prisma.university.findUnique({
            where: { id: member.universityId },
            include: {
                _count: {
                    select: {
                        members: true,
                        studentLinks: true,
                        departments: true,
                    }
                }
            }
        })

        if (!university) {
            return { success: false, error: "University not found" }
        }

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
                memberCount: university._count.members,
                studentCount: university._count.studentLinks,
                departmentCount: university._count.departments,
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

        await prisma.university.update({
            where: { id: member.universityId },
            data,
        })

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

        await prisma.university.update({
            where: { id: member.universityId },
            data: { logoUrl }
        })

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

        await prisma.university.update({
            where: { id: member.universityId },
            data: { bannerUrl }
        })

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

        // Get various counts
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
            prisma.studentUniversityLink.count({ where: { universityId: member.universityId } }),
            prisma.studentUniversityLink.count({ where: { universityId: member.universityId, verificationStatus: "VERIFIED" } }),
            prisma.studentUniversityLink.count({ where: { universityId: member.universityId, verificationStatus: "PENDING" } }),
            prisma.universityMember.count({ where: { universityId: member.universityId } }),
            prisma.universityMember.count({ where: { universityId: member.universityId, isActive: true } }),
            prisma.department.count({ where: { universityId: member.universityId } }),
            prisma.universityClass.count({ where: { universityId: member.universityId } }),
            prisma.universityClass.count({ where: { universityId: member.universityId, isActive: true } }),
            prisma.universityAssignment.count({ where: { class: { universityId: member.universityId } } }),
            prisma.universitySubmission.count({ 
                where: { 
                    assignment: { class: { universityId: member.universityId } },
                    status: "SUBMITTED",
                } 
            }),
            prisma.university.findUnique({
                where: { id: member.universityId },
                select: { totalCreditsAllocated: true, totalCreditsUsed: true }
            })
        ])

        return {
            success: true,
            stats: {
                totalStudents,
                verifiedStudents,
                pendingStudents,
                totalFaculty,
                activeFaculty,
                totalDepartments,
                totalClasses,
                activeClasses,
                totalAssignments,
                pendingGrading: pendingSubmissions,
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

        const members = await prisma.universityMember.findMany({
            where: { universityId: member.universityId },
            orderBy: { createdAt: "desc" },
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
