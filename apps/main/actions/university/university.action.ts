"use server"

import { prisma } from "@repo/prisma"
import { auth } from "@repo/auth"

// Types
interface SearchUniversitiesResult {
    success: boolean
    data?: {
        id: string
        name: string
        logoUrl: string | null
        isPartner: boolean
    }[]
    error?: string
}

interface SubmitVerificationResult {
    success: boolean
    message?: string
    error?: string
}

interface VerificationStatusResult {
    success: boolean
    status?: "none" | "pending" | "verified" | "rejected"
    universityName?: string
    credits?: number
    error?: string
}

/**
 * Search for universities that are partners with Coderz
 */
export async function searchPartnerUniversities(query: string): Promise<SearchUniversitiesResult> {
    try {
        if (!query || query.length < 2) {
            return { success: true, data: [] }
        }

        const universities = await prisma.university.findMany({
            where: {
                OR: [
                    { name: { contains: query, mode: "insensitive" } },
                    { slug: { contains: query, mode: "insensitive" } },
                ],
                // Only show universities with active subscriptions
                subscription: {
                    status: { in: ["ACTIVE", "TRIALING"] },
                },
            },
            select: {
                id: true,
                name: true,
                logoUrl: true,
            },
            take: 10,
        })

        return {
            success: true,
            data: universities.map(uni => ({
                ...uni,
                isPartner: true,
            })),
        }
    } catch (error) {
        console.error("Search universities error:", error)
        return { success: false, error: "Failed to search universities" }
    }
}

/**
 * Submit a verification request for the current user
 */
export async function submitUniversityVerificationRequest(
    universityId: string,
    enrollmentId: string,
    universityEmail: string
): Promise<SubmitVerificationResult> {
    const session = await auth()

    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" }
    }

    try {
        // Check if university exists and is a partner
        const university = await prisma.university.findUnique({
            where: { id: universityId },
            include: {
                subscription: true,
            },
        })

        if (!university) {
            return { success: false, error: "University not found" }
        }

        if (!university.subscription || !["ACTIVE", "TRIALING"].includes(university.subscription.status)) {
            return { success: false, error: "University is not a partner" }
        }

        // Check if user already has a pending or verified link
        const existingLink = await prisma.studentUniversityLink.findFirst({
            where: {
                userId: session.user.id,
                universityId,
                verificationStatus: { in: ["PENDING", "VERIFIED"] },
            },
        })

        if (existingLink) {
            if (existingLink.verificationStatus === "VERIFIED") {
                return { success: false, error: "You are already verified with this university" }
            }
            return { success: false, error: "You already have a pending verification request" }
        }

        // Create the verification request
        await prisma.studentUniversityLink.create({
            data: {
                userId: session.user.id,
                universityId,
                rollNumber: enrollmentId,
                universityEmail,
                verificationStatus: "PENDING",
            },
        })

        // TODO: Send verification email to universityEmail

        return { 
            success: true, 
            message: "Verification request submitted successfully" 
        }
    } catch (error) {
        console.error("Submit verification error:", error)
        return { success: false, error: "Failed to submit verification request" }
    }
}

/**
 * Get current user's university verification status
 */
export async function getUniversityVerificationStatus(): Promise<VerificationStatusResult> {
    const session = await auth()

    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" }
    }

    try {
        const link = await prisma.studentUniversityLink.findFirst({
            where: { userId: session.user.id },
            include: {
                university: {
                    select: { name: true },
                },
            },
            orderBy: { createdAt: "desc" },
        })

        if (!link) {
            return { success: true, status: "none" }
        }

        return {
            success: true,
            status: link.verificationStatus.toLowerCase() as "pending" | "verified" | "rejected",
            universityName: link.university.name,
            credits: link.creditsAllocated || 0,
        }
    } catch (error) {
        console.error("Get verification status error:", error)
        return { success: false, error: "Failed to get verification status" }
    }
}

/**
 * Get student's allocated credits from university
 */
export async function getUniversityCredits(): Promise<{ success: boolean; credits?: number; error?: string }> {
    const session = await auth()

    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" }
    }

    try {
        const link = await prisma.studentUniversityLink.findFirst({
            where: {
                userId: session.user.id,
                verificationStatus: "VERIFIED",
            },
        })

        if (!link) {
            return { success: true, credits: 0 }
        }

        return {
            success: true,
            credits: link.creditsAllocated || 0,
        }
    } catch (error) {
        console.error("Get university credits error:", error)
        return { success: false, error: "Failed to get credits" }
    }
}

/**
 * Get complete student university link details
 */
export async function getStudentUniversityLink() {
    const session = await auth()

    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" }
    }

    try {
        const link = await prisma.studentUniversityLink.findFirst({
            where: {
                userId: session.user.id,
            },
            include: {
                university: {
                    select: {
                        id: true,
                        name: true,
                        logoUrl: true,
                        slug: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        })

        if (!link) {
            return {
                success: true,
                data: null,
            }
        }

        return {
            success: true,
            data: {
                id: link.id,
                universityId: link.universityId,
                university: {
                    id: link.university.id,
                    name: link.university.name,
                    logoUrl: link.university.logoUrl,
                    code: link.university.slug, // Using slug as code
                },
                rollNumber: link.rollNumber,
                universityEmail: link.universityEmail,
                semester: link.semester,
                creditsAllocated: link.creditsAllocated,
                creditsUsed: link.creditsUsed,
                verificationStatus: link.verificationStatus,
                verifiedAt: link.verifiedAt,
                createdAt: link.createdAt,
            },
        }
    } catch (error) {
        console.error("Get student university link error:", error)
        return { success: false, error: "Failed to get university link" }
    }
}

/**
 * Search for a university by its unique code
 */
export async function searchUniversityByCode(code: string) {
    try {
        if (!code || code.length < 2) {
            return { success: false, error: "Invalid university code" }
        }

        const university = await prisma.university.findFirst({
            where: {
                slug: {
                    equals: code,
                    mode: "insensitive",
                },
                // Only show universities with active subscriptions
                subscription: {
                    status: { in: ["ACTIVE", "TRIALING"] },
                },
            },
            select: {
                id: true,
                name: true,
                logoUrl: true,
                slug: true,
                universityType: true,
            },
        })

        if (!university) {
            return { success: false, error: "University not found" }
        }

        return {
            success: true,
            data: {
                ...university,
                code: university.slug, // Map slug to code for consistency
                type: university.universityType,
            },
        }
    } catch (error) {
        console.error("Search university by code error:", error)
        return { success: false, error: "Failed to search university" }
    }
}

/**
 * Request university verification (simplified version for students)
 */
export async function requestUniversityVerification(data: {
    universityId: string
    rollNumber: string
}) {
    const session = await auth()

    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" }
    }

    try {
        const { universityId, rollNumber } = data

        // Check if university exists and is a partner
        const university = await prisma.university.findUnique({
            where: { id: universityId },
            include: {
                subscription: true,
            },
        })

        if (!university) {
            return { success: false, error: "University not found" }
        }

        if (!university.subscription || !["ACTIVE", "TRIALING"].includes(university.subscription.status)) {
            return { success: false, error: "University is not a partner" }
        }

        // Check if user already has any link with this university
        const existingLink = await prisma.studentUniversityLink.findFirst({
            where: {
                userId: session.user.id,
                universityId,
            },
        })

        if (existingLink) {
            if (existingLink.verificationStatus === "VERIFIED") {
                return { success: false, message: "You are already verified with this university" }
            }
            if (existingLink.verificationStatus === "PENDING") {
                return { success: false, message: "You already have a pending verification request" }
            }
            // If rejected, update the existing link
            await prisma.studentUniversityLink.update({
                where: { id: existingLink.id },
                data: {
                    rollNumber,
                    verificationStatus: "PENDING",
                    verifiedAt: null,
                },
            })
            return {
                success: true,
                message: "Verification request resubmitted successfully",
            }
        }

        // Create new verification request - use user's email as university email
        await prisma.studentUniversityLink.create({
            data: {
                userId: session.user.id,
                universityId,
                rollNumber,
                universityEmail: session.user.email || "", // Required field
                verificationStatus: "PENDING",
            },
        })

        return {
            success: true,
            message: "Verification request submitted successfully",
        }
    } catch (error) {
        console.error("Request verification error:", error)
        return { success: false, error: "Failed to submit verification request" }
    }
}

/**
 * Get student's university dashboard data
 */
export async function getStudentUniversityDashboard() {
    const session = await auth()

    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" }
    }

    try {
        const link = await prisma.studentUniversityLink.findFirst({
            where: {
                userId: session.user.id,
                verificationStatus: "VERIFIED",
            },
            include: {
                university: {
                    select: {
                        id: true,
                        name: true,
                        logoUrl: true,
                    },
                },
            },
        })

        if (!link) {
            return {
                success: false,
                error: "Not verified with any university",
            }
        }

        // Get student's classes
        const enrollments = await prisma.classEnrollment.findMany({
            where: {
                studentLinkId: link.id,
            },
            include: {
                class: {
                    select: {
                        id: true,
                        name: true,
                        code: true,
                        semester: true,
                    },
                },
            },
        })

        // Get pending assignments for enrolled classes
        const classIds = enrollments.map(e => e.classId)
        
        const assignments = classIds.length > 0 ? await prisma.universityAssignment.findMany({
            where: {
                classId: { in: classIds },
                status: "PUBLISHED",
                deadline: {
                    gte: new Date(),
                },
            },
            select: {
                id: true,
                title: true,
                type: true,
                deadline: true,
                creditsRequired: true,
            },
            orderBy: {
                deadline: "asc",
            },
            take: 5,
        }) : []

        return {
            success: true,
            data: {
                university: {
                    id: link.university.id,
                    name: link.university.name,
                    logoUrl: link.university.logoUrl,
                },
                credits: {
                    allocated: link.creditsAllocated,
                    used: link.creditsUsed,
                    remaining: link.creditsAllocated - link.creditsUsed,
                },
                classes: enrollments.map((e: { class: { id: string; name: string; code: string | null; semester: string | null } }) => ({
                    id: e.class.id,
                    name: e.class.name,
                    code: e.class.code,
                    semester: e.class.semester,
                })),
                pendingAssignments: assignments,
                stats: {
                    totalClasses: enrollments.length,
                    pendingAssignments: assignments.length,
                },
            },
        }
    } catch (error) {
        console.error("Get student dashboard error:", error)
        return { success: false, error: "Failed to get dashboard data" }
    }
}

