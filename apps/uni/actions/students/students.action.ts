"use server"

import { prisma } from "@repo/prisma"
import { auth } from "@repo/auth"
import { revalidatePath } from "next/cache"
import type { 
    SemesterType, StudentVerificationStatus 
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
// STUDENT FETCHING ACTIONS
// ============================================

/**
 * Get students list with filters and pagination
 */
export async function getStudents(
    filters?: {
        verificationStatus?: StudentVerificationStatus
        departmentId?: string
        semester?: SemesterType
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
            verificationStatus: StudentVerificationStatus
            rollNumber: string | null
            semester: SemesterType | null
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

        // Build where clause
        type WhereClause = {
            universityId: string
            verificationStatus?: StudentVerificationStatus
            departmentId?: string
            semester?: SemesterType
            batchYear?: string
            isActive?: boolean
            OR?: Array<{
                universityEmail?: { contains: string; mode: "insensitive" }
                rollNumber?: { contains: string; mode: "insensitive" }
            }>
        }

        const where: WhereClause = {
            universityId: member.universityId,
        }

        if (filters?.verificationStatus) where.verificationStatus = filters.verificationStatus
        if (filters?.departmentId) where.departmentId = filters.departmentId
        if (filters?.semester) where.semester = filters.semester
        if (filters?.batchYear) where.batchYear = filters.batchYear
        if (filters?.isActive !== undefined) where.isActive = filters.isActive
        if (filters?.search) {
            where.OR = [
                { universityEmail: { contains: filters.search, mode: "insensitive" } },
                { rollNumber: { contains: filters.search, mode: "insensitive" } },
            ]
        }

        const skip = (page - 1) * pageSize

        // Get total count
        const totalCount = await prisma.studentUniversityLink.count({ where })

        // Get students
        const students = await prisma.studentUniversityLink.findMany({
            where,
            include: {
                department: {
                    select: {
                        id: true,
                        name: true,
                    }
                }
            },
            orderBy: { createdAt: "desc" },
            skip,
            take: pageSize,
        })

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
        verificationStatus: StudentVerificationStatus
        verifiedAt: Date | null
        rejectionReason: string | null
        rollNumber: string | null
        semester: SemesterType | null
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

        const student = await prisma.studentUniversityLink.findFirst({
            where: {
                id: studentId,
                universityId: member.universityId,
            },
            include: {
                department: {
                    select: {
                        id: true,
                        name: true,
                    }
                },
                _count: {
                    select: {
                        enrollments: true,
                    }
                }
            }
        })

        if (!student) {
            return { success: false, error: "Student not found" }
        }

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
                enrollmentCount: student._count.enrollments,
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

        const [total, verified, pending, rejected, active] = await Promise.all([
            prisma.studentUniversityLink.count({ where: { universityId: member.universityId } }),
            prisma.studentUniversityLink.count({ where: { universityId: member.universityId, verificationStatus: "VERIFIED" } }),
            prisma.studentUniversityLink.count({ where: { universityId: member.universityId, verificationStatus: "PENDING" } }),
            prisma.studentUniversityLink.count({ where: { universityId: member.universityId, verificationStatus: "REJECTED" } }),
            prisma.studentUniversityLink.count({ where: { universityId: member.universityId, isActive: true } }),
        ])

        return {
            success: true,
            stats: {
                totalStudents: total,
                verifiedStudents: verified,
                pendingStudents: pending,
                rejectedStudents: rejected,
                activeStudents: active,
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

        const byDepartment = await prisma.studentUniversityLink.groupBy({
            by: ["departmentId"],
            where: { universityId: member.universityId },
            _count: true,
        })

        const departments = await prisma.department.findMany({
            where: { universityId: member.universityId },
            select: { id: true, name: true },
        })
        const deptMap = new Map(departments.map(d => [d.id, d.name]))

        return {
            success: true,
            data: byDepartment.map(d => ({
                departmentId: d.departmentId,
                departmentName: d.departmentId ? (deptMap.get(d.departmentId) ?? "Unknown") : "No Department",
                count: d._count,
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
        semester?: SemesterType
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
        const student = await prisma.studentUniversityLink.findFirst({
            where: {
                id: studentId,
                universityId: member.universityId,
            }
        })

        if (!student) {
            return { success: false, error: "Student not found" }
        }

        await prisma.studentUniversityLink.update({
            where: { id: studentId },
            data: {
                verificationStatus: payload.status,
                verifiedAt: payload.status === "VERIFIED" ? new Date() : null,
                rollNumber: payload.rollNumber,
                semester: payload.semester,
                batchYear: payload.batchYear,
                departmentId: payload.departmentId,
                rejectionReason: payload.status === "REJECTED" ? payload.rejectionReason : null,
            },
        })

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

        const result = await prisma.studentUniversityLink.updateMany({
            where: {
                id: { in: studentIds },
                universityId: member.universityId,
            },
            data: {
                verificationStatus: status,
                verifiedAt: status === "VERIFIED" ? new Date() : null,
                rejectionReason: status === "REJECTED" ? rejectionReason : null,
            },
        })

        revalidatePath("/dashboard/students")
        return { success: true, count: result.count }
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
        const student = await prisma.studentUniversityLink.findFirst({
            where: {
                id: studentId,
                universityId: member.universityId,
            }
        })

        if (!student) {
            return { success: false, error: "Student not found" }
        }

        await prisma.studentUniversityLink.update({
            where: { id: studentId },
            data: {
                creditsAllocated: { increment: credits },
            },
        })

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

        const result = await prisma.studentUniversityLink.updateMany({
            where: {
                id: { in: studentIds },
                universityId: member.universityId,
            },
            data: {
                creditsAllocated: { increment: credits },
            },
        })

        revalidatePath("/dashboard/students")
        return { success: true, count: result.count }
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
        semester?: SemesterType
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
        const student = await prisma.studentUniversityLink.findFirst({
            where: {
                id: studentId,
                universityId: member.universityId,
            }
        })

        if (!student) {
            return { success: false, error: "Student not found" }
        }

        await prisma.studentUniversityLink.update({
            where: { id: studentId },
            data: payload,
        })

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
        const student = await prisma.studentUniversityLink.findFirst({
            where: {
                id: studentId,
                universityId: member.universityId,
            }
        })

        if (!student) {
            return { success: false, error: "Student not found" }
        }

        await prisma.studentUniversityLink.update({
            where: { id: studentId },
            data: { isActive: false },
        })

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
        const student = await prisma.studentUniversityLink.findFirst({
            where: {
                id: studentId,
                universityId: member.universityId,
            }
        })

        if (!student) {
            return { success: false, error: "Student not found" }
        }

        await prisma.studentUniversityLink.update({
            where: { id: studentId },
            data: { isActive: true },
        })

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
        const student = await prisma.studentUniversityLink.findFirst({
            where: {
                id: studentId,
                universityId: member.universityId,
            }
        })

        if (!student) {
            return { success: false, error: "Student not found" }
        }

        const enrollments = await prisma.classEnrollment.findMany({
            where: { studentLinkId: studentId },
            include: {
                class: {
                    select: {
                        id: true,
                        name: true,
                        code: true,
                        semester: true,
                        academicYear: true,
                    }
                }
            },
            orderBy: { enrolledAt: "desc" },
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
