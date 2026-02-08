"use server"

import { prisma } from "@repo/prisma"
import { auth } from "@repo/auth"
import { revalidatePath } from "next/cache"
import type { SemesterType } from "@prisma/client"

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
// CLASS FETCHING ACTIONS
// ============================================

/**
 * Get classes list with filters and pagination
 */
export async function getClasses(
    filters?: {
        departmentId?: string
        semester?: SemesterType
        section?: string
        academicYear?: string
        isActive?: boolean
        search?: string
        facultyId?: string
    },
    page: number = 1,
    pageSize: number = 20
): Promise<{
    success: boolean
    result?: {
        classes: Array<{
            id: string
            name: string
            code: string | null
            departmentId: string | null
            departmentName: string | null
            semester: SemesterType
            section: string | null
            academicYear: string
            isActive: boolean
            studentCount: number
            assignmentCount: number
            facultyName: string | null
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
            departmentId?: string
            semester?: SemesterType
            section?: string
            academicYear?: string
            isActive?: boolean
            facultyId?: string
            OR?: Array<{
                name?: { contains: string; mode: "insensitive" }
                code?: { contains: string; mode: "insensitive" }
            }>
        }

        const where: WhereClause = {
            universityId: member.universityId,
        }

        if (filters?.departmentId) where.departmentId = filters.departmentId
        if (filters?.semester) where.semester = filters.semester
        if (filters?.section) where.section = filters.section
        if (filters?.academicYear) where.academicYear = filters.academicYear
        if (filters?.isActive !== undefined) where.isActive = filters.isActive
        if (filters?.facultyId) where.facultyId = filters.facultyId
        if (filters?.search) {
            where.OR = [
                { name: { contains: filters.search, mode: "insensitive" } },
                { code: { contains: filters.search, mode: "insensitive" } },
            ]
        }

        const skip = (page - 1) * pageSize

        // Get total count
        const totalCount = await prisma.universityClass.count({ where })

        // Get classes with includes
        const classes = await prisma.universityClass.findMany({
            where,
            include: {
                department: true,
                faculty: true,
                _count: {
                    select: {
                        enrollments: true,
                        assignments: true,
                    }
                }
            },
            orderBy: { createdAt: "desc" },
            skip,
            take: pageSize,
        })

        const classList = classes.map(c => ({
            id: c.id,
            name: c.name,
            code: c.code,
            departmentId: c.departmentId,
            departmentName: c.department?.name ?? null,
            semester: c.semester,
            section: c.section,
            academicYear: c.academicYear,
            isActive: c.isActive,
            studentCount: c._count.enrollments,
            assignmentCount: c._count.assignments,
            facultyName: c.faculty?.displayName ?? null,
            createdAt: c.createdAt,
        }))

        return {
            success: true,
            result: {
                classes: classList,
                totalCount,
                page,
                pageSize,
                totalPages: Math.ceil(totalCount / pageSize),
            }
        }
    } catch (error) {
        console.error("Get classes error:", error)
        return { success: false, error: "Failed to fetch classes" }
    }
}

/**
 * Get a single class by ID with full details
 */
export async function getClass(classId: string): Promise<{
    success: boolean
    classData?: {
        id: string
        universityId: string
        departmentId: string | null
        name: string
        code: string | null
        description: string | null
        semester: SemesterType
        section: string | null
        academicYear: string
        isActive: boolean
        studentCount: number
        createdAt: Date
        updatedAt: Date
        department: { id: string; name: string; code: string | null } | null
        faculty: { id: string; displayName: string | null; email: string } | null
        enrollmentCount: number
        assignmentCount: number
    }
    error?: string
}> {
    try {
        const member = await getUserUniversity()
        if (!member) {
            return { success: false, error: "Unauthorized" }
        }

        const classData = await prisma.universityClass.findFirst({
            where: {
                id: classId,
                universityId: member.universityId,
            },
            include: {
                department: true,
                faculty: true,
                _count: {
                    select: {
                        enrollments: true,
                        assignments: true,
                    }
                }
            }
        })

        if (!classData) {
            return { success: false, error: "Class not found" }
        }

        return {
            success: true,
            classData: {
                id: classData.id,
                universityId: classData.universityId,
                departmentId: classData.departmentId,
                name: classData.name,
                code: classData.code,
                description: classData.description,
                semester: classData.semester,
                section: classData.section,
                academicYear: classData.academicYear,
                isActive: classData.isActive,
                studentCount: classData.studentCount,
                createdAt: classData.createdAt,
                updatedAt: classData.updatedAt,
                department: classData.department ? {
                    id: classData.department.id,
                    name: classData.department.name,
                    code: classData.department.code,
                } : null,
                faculty: classData.faculty ? {
                    id: classData.faculty.id,
                    displayName: classData.faculty.displayName,
                    email: classData.faculty.email,
                } : null,
                enrollmentCount: classData._count.enrollments,
                assignmentCount: classData._count.assignments,
            }
        }
    } catch (error) {
        console.error("Get class error:", error)
        return { success: false, error: "Failed to fetch class" }
    }
}

/**
 * Get class enrollments
 */
export async function getClassEnrollments(classId: string): Promise<{
    success: boolean
    enrollments?: Array<{
        id: string
        studentLinkId: string
        isActive: boolean
        enrolledAt: Date
        rollNumber: string | null
    }>
    error?: string
}> {
    try {
        const member = await getUserUniversity()
        if (!member) {
            return { success: false, error: "Unauthorized" }
        }

        // Verify class belongs to university
        const classData = await prisma.universityClass.findFirst({
            where: {
                id: classId,
                universityId: member.universityId,
            }
        })

        if (!classData) {
            return { success: false, error: "Class not found" }
        }

        const enrollments = await prisma.classEnrollment.findMany({
            where: { classId },
            include: {
                studentLink: {
                    select: {
                        id: true,
                        rollNumber: true,
                    }
                }
            }
        })

        return {
            success: true,
            enrollments: enrollments.map(e => ({
                id: e.id,
                studentLinkId: e.studentLinkId,
                isActive: e.isActive,
                enrolledAt: e.enrolledAt,
                rollNumber: e.studentLink.rollNumber,
            }))
        }
    } catch (error) {
        console.error("Get class enrollments error:", error)
        return { success: false, error: "Failed to fetch enrollments" }
    }
}

/**
 * Get class stats
 */
export async function getClassStats(): Promise<{
    success: boolean
    stats?: {
        totalClasses: number
        activeClasses: number
        totalEnrollments: number
        averageStudentsPerClass: number
    }
    error?: string
}> {
    try {
        const member = await getUserUniversity()
        if (!member) {
            return { success: false, error: "Unauthorized" }
        }

        const [total, active, totalEnrollments] = await Promise.all([
            prisma.universityClass.count({ where: { universityId: member.universityId } }),
            prisma.universityClass.count({ where: { universityId: member.universityId, isActive: true } }),
            prisma.classEnrollment.count({
                where: { class: { universityId: member.universityId } }
            }),
        ])

        return {
            success: true,
            stats: {
                totalClasses: total,
                activeClasses: active,
                totalEnrollments,
                averageStudentsPerClass: total > 0 ? Math.round(totalEnrollments / total) : 0,
            }
        }
    } catch (error) {
        console.error("Get class stats error:", error)
        return { success: false, error: "Failed to fetch class stats" }
    }
}

// ============================================
// CLASS CRUD ACTIONS
// ============================================

/**
 * Create a new class
 */
export async function createClass(payload: {
    name: string
    code?: string
    description?: string
    departmentId?: string
    semester: SemesterType
    academicYear: string
    section?: string
    facultyId?: string
}): Promise<{
    success: boolean
    classId?: string
    error?: string
}> {
    try {
        const member = await getUserUniversity()
        if (!member) {
            return { success: false, error: "Unauthorized" }
        }

        // Check permission
        const permissions = member.permissions as string[] | null
        if (member.role !== "HEAD" && member.role !== "DEPARTMENT_HEAD" && !permissions?.includes("CREATE_CLASSES")) {
            return { success: false, error: "No permission to create classes" }
        }

        // Create class
        const newClass = await prisma.universityClass.create({
            data: {
                universityId: member.universityId,
                departmentId: payload.departmentId ?? null,
                name: payload.name,
                code: payload.code ?? null,
                description: payload.description ?? null,
                semester: payload.semester,
                academicYear: payload.academicYear,
                section: payload.section ?? null,
                facultyId: payload.facultyId ?? null,
                isActive: true,
            }
        })

        revalidatePath("/dashboard/classes")
        return { success: true, classId: newClass.id }
    } catch (error) {
        console.error("Create class error:", error)
        return { success: false, error: "Failed to create class" }
    }
}

/**
 * Update a class
 */
export async function updateClass(
    classId: string,
    payload: {
        name?: string
        code?: string
        description?: string
        departmentId?: string
        semester?: SemesterType
        academicYear?: string
        section?: string
        facultyId?: string
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
        if (member.role !== "HEAD" && member.role !== "DEPARTMENT_HEAD" && !permissions?.includes("EDIT_CLASSES")) {
            return { success: false, error: "No permission to edit classes" }
        }

        // Verify class exists
        const existingClass = await prisma.universityClass.findFirst({
            where: {
                id: classId,
                universityId: member.universityId,
            }
        })

        if (!existingClass) {
            return { success: false, error: "Class not found" }
        }

        await prisma.universityClass.update({
            where: { id: classId },
            data: payload,
        })

        revalidatePath("/dashboard/classes")
        revalidatePath(`/dashboard/classes/${classId}`)
        return { success: true }
    } catch (error) {
        console.error("Update class error:", error)
        return { success: false, error: "Failed to update class" }
    }
}

/**
 * Delete a class
 */
export async function deleteClass(classId: string): Promise<{
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
        if (member.role !== "HEAD" && !permissions?.includes("DELETE_CLASSES")) {
            return { success: false, error: "No permission to delete classes" }
        }

        // Verify class exists
        const existingClass = await prisma.universityClass.findFirst({
            where: {
                id: classId,
                universityId: member.universityId,
            }
        })

        if (!existingClass) {
            return { success: false, error: "Class not found" }
        }

        await prisma.universityClass.delete({
            where: { id: classId },
        })

        revalidatePath("/dashboard/classes")
        return { success: true }
    } catch (error) {
        console.error("Delete class error:", error)
        return { success: false, error: "Failed to delete class" }
    }
}

// ============================================
// ENROLLMENT ACTIONS
// ============================================

/**
 * Enroll students in a class
 */
export async function enrollStudents(
    classId: string,
    studentLinkIds: string[]
): Promise<{
    success: boolean
    enrolledCount?: number
    error?: string
}> {
    try {
        const member = await getUserUniversity()
        if (!member) {
            return { success: false, error: "Unauthorized" }
        }

        // Check permission
        const permissions = member.permissions as string[] | null
        if (member.role !== "HEAD" && member.role !== "DEPARTMENT_HEAD" && !permissions?.includes("MANAGE_ENROLLMENTS")) {
            return { success: false, error: "No permission to manage enrollments" }
        }

        // Verify class exists
        const classData = await prisma.universityClass.findFirst({
            where: {
                id: classId,
                universityId: member.universityId,
            }
        })

        if (!classData) {
            return { success: false, error: "Class not found" }
        }

        // Verify all student links exist
        const validStudents = await prisma.studentUniversityLink.findMany({
            where: {
                id: { in: studentLinkIds },
                universityId: member.universityId,
            },
            select: { id: true }
        })

        const validIds = new Set(validStudents.map(s => s.id))

        // Create enrollments (skip duplicates)
        const enrollments = studentLinkIds
            .filter(id => validIds.has(id))
            .map(studentLinkId => ({
                classId,
                studentLinkId,
            }))

        const result = await prisma.classEnrollment.createMany({
            data: enrollments,
            skipDuplicates: true,
        })

        // Update student count
        const newCount = await prisma.classEnrollment.count({
            where: { classId }
        })
        await prisma.universityClass.update({
            where: { id: classId },
            data: { studentCount: newCount }
        })

        revalidatePath(`/dashboard/classes/${classId}`)
        return { success: true, enrolledCount: result.count }
    } catch (error) {
        console.error("Enroll students error:", error)
        return { success: false, error: "Failed to enroll students" }
    }
}

/**
 * Remove student from class
 */
export async function removeStudentFromClass(
    classId: string,
    studentLinkId: string
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
        if (member.role !== "HEAD" && member.role !== "DEPARTMENT_HEAD" && !permissions?.includes("MANAGE_ENROLLMENTS")) {
            return { success: false, error: "No permission to manage enrollments" }
        }

        // Verify class exists
        const classData = await prisma.universityClass.findFirst({
            where: {
                id: classId,
                universityId: member.universityId,
            }
        })

        if (!classData) {
            return { success: false, error: "Class not found" }
        }

        await prisma.classEnrollment.delete({
            where: {
                classId_studentLinkId: {
                    classId,
                    studentLinkId,
                }
            }
        })

        // Update student count
        const newCount = await prisma.classEnrollment.count({
            where: { classId }
        })
        await prisma.universityClass.update({
            where: { id: classId },
            data: { studentCount: newCount }
        })

        revalidatePath(`/dashboard/classes/${classId}`)
        return { success: true }
    } catch (error) {
        console.error("Remove student error:", error)
        return { success: false, error: "Failed to remove student" }
    }
}

/**
 * Assign faculty to a class
 */
export async function assignFacultyToClass(
    classId: string,
    facultyId: string
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
        if (member.role !== "HEAD" && member.role !== "DEPARTMENT_HEAD" && !permissions?.includes("ASSIGN_FACULTY")) {
            return { success: false, error: "No permission to assign faculty" }
        }

        // Verify class exists
        const classData = await prisma.universityClass.findFirst({
            where: {
                id: classId,
                universityId: member.universityId,
            }
        })

        if (!classData) {
            return { success: false, error: "Class not found" }
        }

        // Verify faculty exists
        const faculty = await prisma.universityMember.findFirst({
            where: {
                id: facultyId,
                universityId: member.universityId,
            }
        })

        if (!faculty) {
            return { success: false, error: "Faculty not found" }
        }

        await prisma.universityClass.update({
            where: { id: classId },
            data: { facultyId }
        })

        revalidatePath(`/dashboard/classes/${classId}`)
        return { success: true }
    } catch (error) {
        console.error("Assign faculty error:", error)
        return { success: false, error: "Failed to assign faculty" }
    }
}

/**
 * Remove faculty from a class
 */
export async function removeFacultyFromClass(classId: string): Promise<{
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
        if (member.role !== "HEAD" && member.role !== "DEPARTMENT_HEAD" && !permissions?.includes("ASSIGN_FACULTY")) {
            return { success: false, error: "No permission to manage faculty" }
        }

        // Verify class exists
        const classData = await prisma.universityClass.findFirst({
            where: {
                id: classId,
                universityId: member.universityId,
            }
        })

        if (!classData) {
            return { success: false, error: "Class not found" }
        }

        await prisma.universityClass.update({
            where: { id: classId },
            data: { facultyId: null }
        })

        revalidatePath(`/dashboard/classes/${classId}`)
        return { success: true }
    } catch (error) {
        console.error("Remove faculty error:", error)
        return { success: false, error: "Failed to remove faculty" }
    }
}
