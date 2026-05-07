"use server"

import { db, studentUniversityLinks, universityMembers, classEnrollments, departments } from "@repo/db"
import { eq, and, desc, count, inArray, sql } from "drizzle-orm"
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
// STUDENT FETCHING ACTIONS
// ============================================

/**
 * Get students list with filters and pagination
 */
export async function getStudents(
    filters?: {
        verificationStatus?: string
        departmentId?: string
        semester?: string
        batchYear?: string
        search?: string
        isActive?: boolean
    },
    page: number = 1,
    pageSize: number = 20
): Promise<{
    success: boolean
    result?: {
        students: Array<{
            id: string
            userId: string
            universityEmail: string
            verificationStatus: string
            rollNumber: string | null
            semester: string | null
            batchYear: string | null
            departmentId: string | null
            departmentName: string | null
            creditsAllocated: number
            creditsUsed: number
            isActive: boolean
            createdAt: Date
        }>
        totalCount: number
        page: number
        pageSize: number
        totalPages: number
    }
    error?: string
}> {
    try {
        const member = await getUserUniversity()
        if (!member) {
            return { success: false, error: "Unauthorized" }
        }

        const skip = (page - 1) * pageSize

        const students = await db.query.studentUniversityLinks.findMany({
            where: (tbl, { and, eq }) => {
                const conditions = [eq(tbl.universityId, member.universityId)]
                if (filters?.verificationStatus) conditions.push(eq(tbl.verificationStatus, filters.verificationStatus as any))
                if (filters?.departmentId) conditions.push(eq(tbl.departmentId, filters.departmentId))
                if (filters?.semester) conditions.push(eq(tbl.semester, filters.semester as any))
                if (filters?.batchYear) conditions.push(eq(tbl.batchYear, filters.batchYear))
                if (filters?.isActive !== undefined) conditions.push(eq(tbl.isActive, filters.isActive))
                return and(...conditions)
            },
            with: {
                department: { columns: { id: true, name: true } },
            },
            orderBy: desc(studentUniversityLinks.createdAt),
            offset: skip,
            limit: pageSize,
        })

        const totalCountResult = await db.select({ count: count() }).from(studentUniversityLinks).where(eq(studentUniversityLinks.universityId, member.universityId))
        const totalCount = totalCountResult[0]?.count ?? 0

        const studentList = students.map(s => ({
            id: s.id,
            userId: s.userId,
            universityEmail: s.universityEmail,
            verificationStatus: s.verificationStatus,
            rollNumber: s.rollNumber,
            semester: s.semester,
            batchYear: s.batchYear,
            departmentId: s.departmentId,
            departmentName: s.department?.name ?? null,
            creditsAllocated: s.creditsAllocated,
            creditsUsed: s.creditsUsed,
            isActive: s.isActive,
            createdAt: s.createdAt,
        }))

        return {
            success: true,
            result: {
                students: studentList,
                totalCount,
                page,
                pageSize,
                totalPages: Math.ceil(totalCount / pageSize),
            }
        }
    } catch (error) {
        console.error("Get students error:", error)
        return { success: false, error: "Failed to fetch students" }
    }
}

/**
 * Get a single student by ID
 */
export async function getStudent(studentId: string): Promise<{
    success: boolean
    student?: {
        id: string
        userId: string
        universityEmail: string
        verificationStatus: string
        verifiedAt: Date | null
        rejectionReason: string | null
        rollNumber: string | null
        semester: string | null
        batchYear: string | null
        departmentId: string | null
        departmentName: string | null
        creditsAllocated: number
        creditsUsed: number
        isActive: boolean
        createdAt: Date
        updatedAt: Date
        enrollmentCount: number
    }
    error?: string
}> {
    try {
        const member = await getUserUniversity()
        if (!member) {
            return { success: false, error: "Unauthorized" }
        }

        const student = await db.query.studentUniversityLinks.findFirst({
            where: and(
                eq(studentUniversityLinks.id, studentId),
                eq(studentUniversityLinks.universityId, member.universityId),
            ),
            with: {
                department: { columns: { id: true, name: true } },
            },
        })

        if (!student) {
            return { success: false, error: "Student not found" }
        }

        const enrollmentCountResult = await db.select({ count: count() }).from(classEnrollments).where(eq(classEnrollments.studentLinkId, studentId))
        const enrollmentCount = enrollmentCountResult[0]?.count ?? 0

        return {
            success: true,
            student: {
                id: student.id,
                userId: student.userId,
                universityEmail: student.universityEmail,
                verificationStatus: student.verificationStatus,
                verifiedAt: student.verifiedAt,
                rejectionReason: student.rejectionReason,
                rollNumber: student.rollNumber,
                semester: student.semester,
                batchYear: student.batchYear,
                departmentId: student.departmentId,
                departmentName: student.department?.name ?? null,
                creditsAllocated: student.creditsAllocated,
                creditsUsed: student.creditsUsed,
                isActive: student.isActive,
                createdAt: student.createdAt,
                updatedAt: student.updatedAt,
                enrollmentCount,
            }
        }
    } catch (error) {
        console.error("Get student error:", error)
        return { success: false, error: "Failed to fetch student" }
    }
}

/**
 * Get student stats
 */
export async function getStudentStats(): Promise<{
    success: boolean
    stats?: {
        totalStudents: number
        verifiedStudents: number
        pendingStudents: number
        rejectedStudents: number
        activeStudents: number
    }
    error?: string
}> {
    try {
        const member = await getUserUniversity()
        if (!member) {
            return { success: false, error: "Unauthorized" }
        }

        const uniId = member.universityId
        const [total, verified, pending, rejected, active] = await Promise.all([
            db.select({ count: count() }).from(studentUniversityLinks).where(eq(studentUniversityLinks.universityId, uniId)),
            db.select({ count: count() }).from(studentUniversityLinks).where(and(eq(studentUniversityLinks.universityId, uniId), eq(studentUniversityLinks.verificationStatus, "VERIFIED"))),
            db.select({ count: count() }).from(studentUniversityLinks).where(and(eq(studentUniversityLinks.universityId, uniId), eq(studentUniversityLinks.verificationStatus, "PENDING"))),
            db.select({ count: count() }).from(studentUniversityLinks).where(and(eq(studentUniversityLinks.universityId, uniId), eq(studentUniversityLinks.verificationStatus, "REJECTED"))),
            db.select({ count: count() }).from(studentUniversityLinks).where(and(eq(studentUniversityLinks.universityId, uniId), eq(studentUniversityLinks.isActive, true))),
        ])

        return {
            success: true,
            stats: {
                totalStudents: total[0]?.count ?? 0,
                verifiedStudents: verified[0]?.count ?? 0,
                pendingStudents: pending[0]?.count ?? 0,
                rejectedStudents: rejected[0]?.count ?? 0,
                activeStudents: active[0]?.count ?? 0,
            }
        }
    } catch (error) {
        console.error("Get student stats error:", error)
        return { success: false, error: "Failed to fetch student stats" }
    }
}

/**
 * Get students by department
 */
export async function getStudentsByDepartment(): Promise<{
    success: boolean
    data?: Array<{
        departmentId: string | null
        departmentName: string
        count: number
    }>
    error?: string
}> {
    try {
        const member = await getUserUniversity()
        if (!member) {
            return { success: false, error: "Unauthorized" }
        }

        // Group by departmentId using sql
        const byDepartment = await db
            .select({
                departmentId: studentUniversityLinks.departmentId,
                count: count(),
            })
            .from(studentUniversityLinks)
            .where(eq(studentUniversityLinks.universityId, member.universityId))
            .groupBy(studentUniversityLinks.departmentId)

        const deptRows = await db.query.departments.findMany({
            where: eq(departments.universityId, member.universityId),
            columns: { id: true, name: true },
        })
        const deptMap = new Map(deptRows.map(d => [d.id, d.name]))

        return {
            success: true,
            data: byDepartment.map(d => ({
                departmentId: d.departmentId,
                departmentName: d.departmentId ? (deptMap.get(d.departmentId) ?? "Unknown") : "No Department",
                count: d.count,
            }))
        }
    } catch (error) {
        console.error("Get students by department error:", error)
        return { success: false, error: "Failed to fetch students by department" }
    }
}

// ============================================
// STUDENT VERIFICATION ACTIONS
// ============================================

/**
 * Verify a student
 */
export async function verifyStudent(
    studentId: string,
    payload: {
        status: "VERIFIED" | "REJECTED"
        rollNumber?: string
        semester?: string
        batchYear?: string
        departmentId?: string
        rejectionReason?: string
    }
): Promise<{
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
        if (member.role !== "HEAD" && member.role !== "DEPARTMENT_HEAD" && !permissions?.includes("VERIFY_STUDENTS")) {
            return { success: false, error: "No permission to verify students" }
        }

        // Verify student exists
        const student = await db.query.studentUniversityLinks.findFirst({
            where: and(
                eq(studentUniversityLinks.id, studentId),
                eq(studentUniversityLinks.universityId, member.universityId),
            ),
        })

        if (!student) {
            return { success: false, error: "Student not found" }
        }

        await db.update(studentUniversityLinks).set({
            verificationStatus: payload.status,
            verifiedAt: payload.status === "VERIFIED" ? new Date() : null,
            rollNumber: payload.rollNumber,
            semester: payload.semester as any,
            batchYear: payload.batchYear,
            departmentId: payload.departmentId,
            rejectionReason: payload.status === "REJECTED" ? payload.rejectionReason : null,
        }).where(eq(studentUniversityLinks.id, studentId))

        revalidatePath("/dashboard/students")
        revalidatePath(`/dashboard/students/${studentId}`)
        return { success: true }
    } catch (error) {
        console.error("Verify student error:", error)
        return { success: false, error: "Failed to verify student" }
    }
}

/**
 * Bulk verify students
 */
export async function bulkVerifyStudents(
    studentIds: string[],
    status: "VERIFIED" | "REJECTED",
    rejectionReason?: string
): Promise<{
    success: boolean
    count?: number
    error?: string
}> {
    try {
        const member = await getUserUniversity()
        if (!member) {
            return { success: false, error: "Unauthorized" }
        }

        // Check permission
        const permissions = member.permissions as string[] | null
        if (member.role !== "HEAD" && member.role !== "DEPARTMENT_HEAD" && !permissions?.includes("VERIFY_STUDENTS")) {
            return { success: false, error: "No permission to verify students" }
        }

        await db.update(studentUniversityLinks).set({
            verificationStatus: status,
            verifiedAt: status === "VERIFIED" ? new Date() : null,
            rejectionReason: status === "REJECTED" ? rejectionReason : null,
        }).where(
            and(
                inArray(studentUniversityLinks.id, studentIds),
                eq(studentUniversityLinks.universityId, member.universityId),
            )
        )

        revalidatePath("/dashboard/students")
        return { success: true, count: studentIds.length }
    } catch (error) {
        console.error("Bulk verify students error:", error)
        return { success: false, error: "Failed to bulk verify students" }
    }
}

// ============================================
// STUDENT CREDITS ACTIONS
// ============================================

/**
 * Allocate credits to a student
 */
export async function allocateCredits(
    studentId: string,
    credits: number
): Promise<{
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
        if (member.role !== "HEAD" && member.role !== "FINANCE_OFFICER" && !permissions?.includes("MANAGE_CREDITS")) {
            return { success: false, error: "No permission to manage credits" }
        }

        // Verify student exists
        const student = await db.query.studentUniversityLinks.findFirst({
            where: and(
                eq(studentUniversityLinks.id, studentId),
                eq(studentUniversityLinks.universityId, member.universityId),
            ),
        })

        if (!student) {
            return { success: false, error: "Student not found" }
        }

        await db.update(studentUniversityLinks).set({
            creditsAllocated: sql`${studentUniversityLinks.creditsAllocated} + ${credits}`,
        }).where(eq(studentUniversityLinks.id, studentId))

        revalidatePath(`/dashboard/students/${studentId}`)
        return { success: true }
    } catch (error) {
        console.error("Allocate credits error:", error)
        return { success: false, error: "Failed to allocate credits" }
    }
}

/**
 * Bulk allocate credits to students
 */
export async function bulkAllocateCredits(
    studentIds: string[],
    credits: number
): Promise<{
    success: boolean
    count?: number
    error?: string
}> {
    try {
        const member = await getUserUniversity()
        if (!member) {
            return { success: false, error: "Unauthorized" }
        }

        // Check permission
        const permissions = member.permissions as string[] | null
        if (member.role !== "HEAD" && member.role !== "FINANCE_OFFICER" && !permissions?.includes("MANAGE_CREDITS")) {
            return { success: false, error: "No permission to manage credits" }
        }

        await db.update(studentUniversityLinks).set({
            creditsAllocated: sql`${studentUniversityLinks.creditsAllocated} + ${credits}`,
        }).where(
            and(
                inArray(studentUniversityLinks.id, studentIds),
                eq(studentUniversityLinks.universityId, member.universityId),
            )
        )

        revalidatePath("/dashboard/students")
        return { success: true, count: studentIds.length }
    } catch (error) {
        console.error("Bulk allocate credits error:", error)
        return { success: false, error: "Failed to bulk allocate credits" }
    }
}

// ============================================
// STUDENT MANAGEMENT ACTIONS
// ============================================

/**
 * Update student info
 */
export async function updateStudent(
    studentId: string,
    payload: {
        rollNumber?: string
        semester?: string
        batchYear?: string
        departmentId?: string | null
        isActive?: boolean
    }
): Promise<{
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
        if (member.role !== "HEAD" && member.role !== "DEPARTMENT_HEAD" && !permissions?.includes("MANAGE_STUDENTS")) {
            return { success: false, error: "No permission to manage students" }
        }

        // Verify student exists
        const student = await db.query.studentUniversityLinks.findFirst({
            where: and(
                eq(studentUniversityLinks.id, studentId),
                eq(studentUniversityLinks.universityId, member.universityId),
            ),
        })

        if (!student) {
            return { success: false, error: "Student not found" }
        }

        await db.update(studentUniversityLinks).set(payload as any).where(eq(studentUniversityLinks.id, studentId))

        revalidatePath("/dashboard/students")
        revalidatePath(`/dashboard/students/${studentId}`)
        return { success: true }
    } catch (error) {
        console.error("Update student error:", error)
        return { success: false, error: "Failed to update student" }
    }
}

/**
 * Deactivate a student
 */
export async function deactivateStudent(studentId: string): Promise<{
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
        if (member.role !== "HEAD" && member.role !== "DEPARTMENT_HEAD" && !permissions?.includes("MANAGE_STUDENTS")) {
            return { success: false, error: "No permission to manage students" }
        }

        // Verify student exists
        const student = await db.query.studentUniversityLinks.findFirst({
            where: and(
                eq(studentUniversityLinks.id, studentId),
                eq(studentUniversityLinks.universityId, member.universityId),
            ),
        })

        if (!student) {
            return { success: false, error: "Student not found" }
        }

        await db.update(studentUniversityLinks).set({ isActive: false }).where(eq(studentUniversityLinks.id, studentId))

        revalidatePath("/dashboard/students")
        revalidatePath(`/dashboard/students/${studentId}`)
        return { success: true }
    } catch (error) {
        console.error("Deactivate student error:", error)
        return { success: false, error: "Failed to deactivate student" }
    }
}

/**
 * Reactivate a student
 */
export async function reactivateStudent(studentId: string): Promise<{
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
        if (member.role !== "HEAD" && member.role !== "DEPARTMENT_HEAD" && !permissions?.includes("MANAGE_STUDENTS")) {
            return { success: false, error: "No permission to manage students" }
        }

        // Verify student exists
        const student = await db.query.studentUniversityLinks.findFirst({
            where: and(
                eq(studentUniversityLinks.id, studentId),
                eq(studentUniversityLinks.universityId, member.universityId),
            ),
        })

        if (!student) {
            return { success: false, error: "Student not found" }
        }

        await db.update(studentUniversityLinks).set({ isActive: true }).where(eq(studentUniversityLinks.id, studentId))

        revalidatePath("/dashboard/students")
        revalidatePath(`/dashboard/students/${studentId}`)
        return { success: true }
    } catch (error) {
        console.error("Reactivate student error:", error)
        return { success: false, error: "Failed to reactivate student" }
    }
}

/**
 * Get student enrollments
 */
export async function getStudentEnrollments(studentId: string): Promise<{
    success: boolean
    enrollments?: Array<{
        id: string
        classId: string
        className: string
        classCode: string | null
        semester: string
        academicYear: string
        isActive: boolean
        enrolledAt: Date
    }>
    error?: string
}> {
    try {
        const member = await getUserUniversity()
        if (!member) {
            return { success: false, error: "Unauthorized" }
        }

        // Verify student exists
        const student = await db.query.studentUniversityLinks.findFirst({
            where: and(
                eq(studentUniversityLinks.id, studentId),
                eq(studentUniversityLinks.universityId, member.universityId),
            ),
        })

        if (!student) {
            return { success: false, error: "Student not found" }
        }

        const enrollments = await db.query.classEnrollments.findMany({
            where: eq(classEnrollments.studentLinkId, studentId),
            with: {
                class: {
                    columns: { id: true, name: true, code: true, semester: true, academicYear: true },
                },
            },
            orderBy: desc(classEnrollments.enrolledAt),
        })

        return {
            success: true,
            enrollments: enrollments.map(e => ({
                id: e.id,
                classId: e.classId,
                className: e.class.name,
                classCode: e.class.code,
                semester: e.class.semester,
                academicYear: e.class.academicYear,
                isActive: e.isActive,
                enrolledAt: e.enrolledAt,
            }))
        }
    } catch (error) {
        console.error("Get student enrollments error:", error)
        return { success: false, error: "Failed to fetch student enrollments" }
    }
}
