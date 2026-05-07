"use server"

import { db, universities, universityMembers, studentUniversityLinks, departments, universityClasses } from "@repo/db"
import { eq, and, count, sql } from "drizzle-orm"

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
            totalUniversitiesResult,
            verifiedUniversitiesResult,
            pendingVerificationsResult,
            rejectedVerificationsResult,
            totalDepartmentsResult,
            totalFacultyResult,
            totalStudentsResult,
            verifiedStudentsResult,
            totalClassesResult,
        ] = await Promise.all([
            db.select({ totalUniversities: count() }).from(universities),
            db.select({ verifiedUniversities: count() }).from(universities).where(eq(universities.verificationStatus, "VERIFIED")),
            db.select({ pendingVerifications: count() }).from(universities).where(eq(universities.verificationStatus, "PENDING")),
            db.select({ rejectedVerifications: count() }).from(universities).where(eq(universities.verificationStatus, "REJECTED")),
            db.select({ totalDepartments: count() }).from(departments),
            db.select({ totalFaculty: count() }).from(universityMembers),
            db.select({ totalStudents: count() }).from(studentUniversityLinks),
            db.select({ verifiedStudents: count() }).from(studentUniversityLinks).where(eq(studentUniversityLinks.verificationStatus, "VERIFIED")),
            db.select({ totalClasses: count() }).from(universityClasses),
        ])
        const totalUniversities = totalUniversitiesResult[0]?.totalUniversities ?? 0
        const verifiedUniversities = verifiedUniversitiesResult[0]?.verifiedUniversities ?? 0
        const pendingVerifications = pendingVerificationsResult[0]?.pendingVerifications ?? 0
        const rejectedVerifications = rejectedVerificationsResult[0]?.rejectedVerifications ?? 0
        const totalDepartments = totalDepartmentsResult[0]?.totalDepartments ?? 0
        const totalFaculty = totalFacultyResult[0]?.totalFaculty ?? 0
        const totalStudents = totalStudentsResult[0]?.totalStudents ?? 0
        const verifiedStudents = verifiedStudentsResult[0]?.verifiedStudents ?? 0
        const totalClasses = totalClassesResult[0]?.totalClasses ?? 0

        // Calculate total credits allocated
        const allUnis = await db.query.universities.findMany({
            columns: { totalCreditsAllocated: true }
        })
        const totalCreditsAllocated = allUnis.reduce((sum, u) => sum + (u.totalCreditsAllocated || 0), 0)

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
                totalCreditsAllocated,
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
        const offset = (page - 1) * limit

        const whereClause = status && status !== "all"
            ? eq(universities.verificationStatus, status as "PENDING" | "VERIFIED" | "REJECTED")
            : undefined

        const [universityList, uniTotalResult] = await Promise.all([
            db.query.universities.findMany({
                where: whereClause,
                offset,
                limit,
                orderBy: (t, { desc }) => [desc(t.createdAt)],
                with: {
                    members: true,
                    studentLinks: true,
                    departments: true,
                    classes: true,
                }
            }),
            db.select({ total: count() }).from(universities).where(whereClause)
        ])
        const total = uniTotalResult[0]?.total ?? 0

        return {
            success: true,
            data: universityList,
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
        const pendingUniversities = await db.query.universities.findMany({
            where: eq(universities.verificationStatus, "PENDING"),
            orderBy: (t, { asc }) => [asc(t.createdAt)],
            with: {
                members: true,
                studentLinks: true,
                departments: true,
            }
        })

        return { success: true, data: pendingUniversities }
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
        const [university] = await db.update(universities)
            .set({
                verificationStatus: "VERIFIED",
                verifiedAt: new Date(),
                verifiedBy: adminUserId,
            })
            .where(eq(universities.id, universityId))
            .returning()

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
        const [university] = await db.update(universities)
            .set({
                verificationStatus: "REJECTED",
                verifiedBy: adminUserId,
                rejectionReason: reason,
            })
            .where(eq(universities.id, universityId))
            .returning()

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
        const university = await db.query.universities.findFirst({
            where: eq(universities.id, universityId),
            with: {
                members: true,
                departments: true,
                classes: true,
                studentLinks: true,
            }
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
        const whereClause = universityId
            ? eq(universityMembers.universityId, universityId)
            : undefined

        const faculty = await db.query.universityMembers.findMany({
            where: whereClause,
            orderBy: (t, { desc }) => [desc(t.createdAt)],
            with: {
                department: {
                    columns: { id: true, name: true, code: true }
                },
                university: {
                    columns: { id: true, name: true }
                }
            }
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
        const offset = (page - 1) * limit

        const whereConditions = []
        if (universityId) whereConditions.push(eq(studentUniversityLinks.universityId, universityId))
        if (status && status !== "all") {
            whereConditions.push(eq(studentUniversityLinks.verificationStatus, status as any))
        }

        const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined

        const [students, studentTotalResult] = await Promise.all([
            db.query.studentUniversityLinks.findMany({
                where: whereClause,
                offset,
                limit,
                orderBy: (t, { desc }) => [desc(t.createdAt)],
                with: {
                    university: { columns: { id: true, name: true } },
                    department: { columns: { id: true, name: true, code: true } }
                }
            }),
            db.select({ total: count() }).from(studentUniversityLinks).where(whereClause)
        ])
        const total = studentTotalResult[0]?.total ?? 0

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
        const offset = (page - 1) * limit

        const whereClause = universityId
            ? eq(departments.universityId, universityId)
            : undefined

        const [departmentList, deptTotalResult] = await Promise.all([
            db.query.departments.findMany({
                where: whereClause,
                offset,
                limit,
                orderBy: (t, { desc }) => [desc(t.createdAt)],
                with: {
                    university: { columns: { id: true, name: true } },
                    members: true,
                    studentLinks: true,
                    classes: true,
                }
            }),
            db.select({ total: count() }).from(departments).where(whereClause)
        ])
        const total = deptTotalResult[0]?.total ?? 0

        return {
            success: true,
            data: departmentList,
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
        const offset = (page - 1) * limit

        const whereClause = universityId
            ? eq(universityClasses.universityId, universityId)
            : undefined

        const [classList, classTotalResult] = await Promise.all([
            db.query.universityClasses.findMany({
                where: whereClause,
                offset,
                limit,
                orderBy: (t, { desc }) => [desc(t.createdAt)],
                with: {
                    university: { columns: { id: true, name: true } },
                    department: { columns: { id: true, name: true, code: true } },
                    enrollments: true,
                    assignments: true,
                }
            }),
            db.select({ total: count() }).from(universityClasses).where(whereClause)
        ])
        const total = classTotalResult[0]?.total ?? 0

        return {
            success: true,
            data: classList,
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
            db.query.universities.findMany({
                limit,
                orderBy: (t, { desc }) => [desc(t.createdAt)],
                columns: { id: true, name: true, verificationStatus: true, createdAt: true }
            }),
            db.query.studentUniversityLinks.findMany({
                limit,
                orderBy: (t, { desc }) => [desc(t.createdAt)],
                columns: { id: true, verificationStatus: true, createdAt: true },
                with: {
                    university: { columns: { name: true } }
                }
            }),
            db.query.universityClasses.findMany({
                limit,
                orderBy: (t, { desc }) => [desc(t.createdAt)],
                columns: { id: true, name: true, createdAt: true },
                with: {
                    university: { columns: { name: true } }
                }
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
        const [university] = await db.update(universities)
            .set({
                totalCreditsAllocated: operation === "add"
                    ? sql`${universities.totalCreditsAllocated} + ${credits}`
                    : credits,
            })
            .where(eq(universities.id, universityId))
            .returning()

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
        const [studentLink] = await db.update(studentUniversityLinks)
            .set({
                verificationStatus: "VERIFIED",
                verifiedAt: new Date(),
            })
            .where(eq(studentUniversityLinks.id, studentLinkId))
            .returning()

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
        const [studentLink] = await db.update(studentUniversityLinks)
            .set({
                verificationStatus: "REJECTED",
                rejectionReason: reason,
            })
            .where(eq(studentUniversityLinks.id, studentLinkId))
            .returning()

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
        const inserted = await db.insert(studentUniversityLinks)
            .values(
                students.map(student => ({
                    userId: student.userId,
                    universityId,
                    universityEmail: student.universityEmail,
                    departmentId: student.departmentId,
                    rollNumber: student.rollNumber,
                    semester: student.semester as any,
                    batchYear: student.batchYear,
                    verificationStatus: "PENDING" as const,
                }))
            )
            .onConflictDoNothing()
            .returning()

        return { success: true, data: { count: inserted.length } }
    } catch (error) {
        console.error("Error bulk importing students:", error)
        return { success: false, error: "Failed to bulk import students" }
    }
}
