"use server"

import { prisma } from "@repo/prisma"

// ============================================
// UNIVERSITY PLATFORM ADMIN SERVER ACTIONS
// ============================================

/**
 * Get university platform dashboard stats
 * Note: StudentUniversityLink is the model that represents students linked to universities
 */
export async function getUniversityDashboardStats() {
    try {
        const [
            totalUniversities,
            verifiedUniversities,
            pendingVerifications,
            rejectedVerifications,
            totalDepartments,
            totalFaculty,
            totalStudents,
            verifiedStudents,
            totalClasses,
        ] = await Promise.all([
            prisma.university.count(),
            prisma.university.count({ where: { verificationStatus: "VERIFIED" } }),
            prisma.university.count({ where: { verificationStatus: "PENDING" } }),
            prisma.university.count({ where: { verificationStatus: "REJECTED" } }),
            prisma.department.count(),
            prisma.universityMember.count(),
            prisma.studentUniversityLink.count(),
            prisma.studentUniversityLink.count({ where: { verificationStatus: "VERIFIED" } }),
            prisma.universityClass.count(),
        ])

        // Calculate total credits allocated (sum of all university credit allocations)
        const creditStats = await prisma.university.aggregate({
            _sum: {
                totalCreditsAllocated: true,
            },
        })

        return {
            success: true,
            data: {
                totalUniversities,
                verifiedUniversities,
                pendingVerifications,
                rejectedVerifications,
                totalDepartments,
                totalFaculty,
                totalStudents,
                verifiedStudents,
                totalClasses,
                totalCreditsAllocated: creditStats?._sum?.totalCreditsAllocated || 0,
            },
        }
    } catch (error) {
        console.error("Error fetching university dashboard stats:", error)
        return { success: false, error: "Failed to fetch university dashboard stats" }
    }
}

/**
 * Get universities list with pagination
 */
export async function getUniversities(page = 1, limit = 20, status?: string) {
    try {
        const skip = (page - 1) * limit

        const where = status && status !== "all"
            ? { verificationStatus: status as "PENDING" | "VERIFIED" | "REJECTED" }
            : {}

        const [universities, total] = await Promise.all([
            prisma.university.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
                include: {
                    _count: {
                        select: {
                            members: true,
                            studentLinks: true,
                            departments: true,
                            classes: true,
                        },
                    },
                },
            }),
            prisma.university.count({ where }),
        ])

        return {
            success: true,
            data: universities,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        }
    } catch (error) {
        console.error("Error fetching universities:", error)
        return { success: false, error: "Failed to fetch universities" }
    }
}

/**
 * Get pending university verifications
 */
export async function getPendingUniversityVerifications() {
    try {
        const universities = await prisma.university.findMany({
            where: {
                verificationStatus: "PENDING",
            },
            orderBy: { createdAt: "asc" },
            include: {
                _count: {
                    select: {
                        members: true,
                        studentLinks: true,
                        departments: true,
                    },
                },
            },
        })

        return { success: true, data: universities }
    } catch (error) {
        console.error("Error fetching pending verifications:", error)
        return { success: false, error: "Failed to fetch pending verifications" }
    }
}

/**
 * Verify a university
 */
export async function verifyUniversity(universityId: string, adminUserId: string) {
    try {
        const university = await prisma.university.update({
            where: { id: universityId },
            data: {
                verificationStatus: "VERIFIED",
                verifiedAt: new Date(),
                verifiedBy: adminUserId,
            },
        })

        return { success: true, data: university }
    } catch (error) {
        console.error("Error verifying university:", error)
        return { success: false, error: "Failed to verify university" }
    }
}

/**
 * Reject a university verification
 */
export async function rejectUniversityVerification(universityId: string, adminUserId: string, reason?: string) {
    try {
        const university = await prisma.university.update({
            where: { id: universityId },
            data: {
                verificationStatus: "REJECTED",
                verifiedBy: adminUserId,
                rejectionReason: reason,
            },
        })

        return { success: true, data: university }
    } catch (error) {
        console.error("Error rejecting university:", error)
        return { success: false, error: "Failed to reject university" }
    }
}

/**
 * Get university details by ID
 */
export async function getUniversityById(universityId: string) {
    try {
        const university = await prisma.university.findUnique({
            where: { id: universityId },
            include: {
                members: true,
                departments: {
                    include: {
                        _count: {
                            select: {
                                members: true,
                                classes: true,
                            },
                        },
                    },
                },
                _count: {
                    select: {
                        members: true,
                        studentLinks: true,
                        departments: true,
                        classes: true,
                    },
                },
            },
        })

        if (!university) {
            return { success: false, error: "University not found" }
        }

        return { success: true, data: university }
    } catch (error) {
        console.error("Error fetching university:", error)
        return { success: false, error: "Failed to fetch university" }
    }
}

/**
 * Get university faculty members
 */
export async function getUniversityFaculty(universityId?: string) {
    try {
        const where = universityId ? { universityId } : {}

        const faculty = await prisma.universityMember.findMany({
            where,
            orderBy: { createdAt: "desc" },
            include: {
                department: {
                    select: {
                        id: true,
                        name: true,
                        code: true,
                    },
                },
                university: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        })

        return { success: true, data: faculty }
    } catch (error) {
        console.error("Error fetching faculty:", error)
        return { success: false, error: "Failed to fetch faculty" }
    }
}

/**
 * Get university students (StudentUniversityLink) with pagination
 */
export async function getUniversityStudents(page = 1, limit = 20, universityId?: string, status?: string) {
    try {
        const skip = (page - 1) * limit

        const where: Record<string, unknown> = {}
        if (universityId) where.universityId = universityId
        if (status && status !== "all") {
            where.verificationStatus = status as "PENDING" | "UNDER_REVIEW" | "VERIFIED" | "REJECTED" | "EXPIRED"
        }

        const [students, total] = await Promise.all([
            prisma.studentUniversityLink.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
                include: {
                    university: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                    department: {
                        select: {
                            id: true,
                            name: true,
                            code: true,
                        },
                    },
                },
            }),
            prisma.studentUniversityLink.count({ where }),
        ])

        return {
            success: true,
            data: students,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        }
    } catch (error) {
        console.error("Error fetching students:", error)
        return { success: false, error: "Failed to fetch students" }
    }
}

/**
 * Get departments with pagination
 */
export async function getDepartments(page = 1, limit = 20, universityId?: string) {
    try {
        const skip = (page - 1) * limit

        const where = universityId ? { universityId } : {}

        const [departments, total] = await Promise.all([
            prisma.department.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
                include: {
                    university: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                    _count: {
                        select: {
                            members: true,
                            studentLinks: true,
                            classes: true,
                        },
                    },
                },
            }),
            prisma.department.count({ where }),
        ])

        return {
            success: true,
            data: departments,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        }
    } catch (error) {
        console.error("Error fetching departments:", error)
        return { success: false, error: "Failed to fetch departments" }
    }
}

/**
 * Get university classes with pagination
 */
export async function getUniversityClasses(page = 1, limit = 20, universityId?: string) {
    try {
        const skip = (page - 1) * limit

        const where = universityId ? { universityId } : {}

        const [classes, total] = await Promise.all([
            prisma.universityClass.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
                include: {
                    university: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                    department: {
                        select: {
                            id: true,
                            name: true,
                            code: true,
                        },
                    },
                    _count: {
                        select: {
                            enrollments: true,
                            assignments: true,
                        },
                    },
                },
            }),
            prisma.universityClass.count({ where }),
        ])

        return {
            success: true,
            data: classes,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        }
    } catch (error) {
        console.error("Error fetching classes:", error)
        return { success: false, error: "Failed to fetch classes" }
    }
}

/**
 * Get recent activity for university platform
 */
export async function getUniversityRecentActivity(limit = 10) {
    try {
        const [recentUniversities, recentStudents, recentClasses] = await Promise.all([
            prisma.university.findMany({
                take: limit,
                orderBy: { createdAt: "desc" },
                select: {
                    id: true,
                    name: true,
                    verificationStatus: true,
                    createdAt: true,
                },
            }),
            prisma.studentUniversityLink.findMany({
                take: limit,
                orderBy: { createdAt: "desc" },
                select: {
                    id: true,
                    verificationStatus: true,
                    createdAt: true,
                    university: {
                        select: {
                            name: true,
                        },
                    },
                },
            }),
            prisma.universityClass.findMany({
                take: limit,
                orderBy: { createdAt: "desc" },
                select: {
                    id: true,
                    name: true,
                    createdAt: true,
                    university: {
                        select: {
                            name: true,
                        },
                    },
                },
            }),
        ])

        return {
            success: true,
            data: {
                recentUniversities,
                recentStudents,
                recentClasses,
            },
        }
    } catch (error) {
        console.error("Error fetching recent activity:", error)
        return { success: false, error: "Failed to fetch recent activity" }
    }
}

/**
 * Update university credits
 */
export async function updateUniversityCredits(universityId: string, credits: number, operation: "add" | "set") {
    try {
        const university = await prisma.university.update({
            where: { id: universityId },
            data: {
                totalCreditsAllocated: operation === "add"
                    ? { increment: credits }
                    : credits,
            },
        })

        return { success: true, data: university }
    } catch (error) {
        console.error("Error updating university credits:", error)
        return { success: false, error: "Failed to update university credits" }
    }
}

/**
 * Verify a student (update StudentUniversityLink verification status)
 */
export async function verifyStudent(studentLinkId: string) {
    try {
        const studentLink = await prisma.studentUniversityLink.update({
            where: { id: studentLinkId },
            data: {
                verificationStatus: "VERIFIED",
                verifiedAt: new Date(),
            },
        })

        return { success: true, data: studentLink }
    } catch (error) {
        console.error("Error verifying student:", error)
        return { success: false, error: "Failed to verify student" }
    }
}

/**
 * Reject a student verification
 */
export async function rejectStudentVerification(studentLinkId: string, reason?: string) {
    try {
        const studentLink = await prisma.studentUniversityLink.update({
            where: { id: studentLinkId },
            data: {
                verificationStatus: "REJECTED",
                rejectionReason: reason,
            },
        })

        return { success: true, data: studentLink }
    } catch (error) {
        console.error("Error rejecting student:", error)
        return { success: false, error: "Failed to reject student" }
    }
}

/**
 * Bulk import students for a university
 * Creates StudentUniversityLink records with PENDING verification status
 */
export async function bulkImportStudents(
    universityId: string,
    students: Array<{
        userId: string
        universityEmail: string
        departmentId?: string
        rollNumber?: string
        semester?: string
        batchYear?: string
    }>
) {
    try {
        const createdLinks = await prisma.studentUniversityLink.createMany({
            data: students.map(student => ({
                userId: student.userId,
                universityId,
                universityEmail: student.universityEmail,
                departmentId: student.departmentId,
                rollNumber: student.rollNumber,
                semester: student.semester as "SEMESTER_1" | "SEMESTER_2" | "SEMESTER_3" | "SEMESTER_4" | "SEMESTER_5" | "SEMESTER_6" | "SEMESTER_7" | "SEMESTER_8" | undefined,
                batchYear: student.batchYear,
                verificationStatus: "PENDING",
            })),
            skipDuplicates: true,
        })

        return { success: true, data: { count: createdLinks.count } }
    } catch (error) {
        console.error("Error bulk importing students:", error)
        return { success: false, error: "Failed to bulk import students" }
    }
}