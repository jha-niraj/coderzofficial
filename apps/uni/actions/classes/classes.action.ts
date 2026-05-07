"use server"

import { db, universityClasses, universityMembers, classEnrollments, studentUniversityLinks } from "@repo/db"
import { eq, and, desc, count, inArray } from "drizzle-orm"
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
// CLASS FETCHING ACTIONS
// ============================================

/**
 * Get classes list with filters and pagination
 */
export async function getClasses(
    filters?: {
        departmentId?: string
        semester?: string
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
            semester: string
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

        const skip = (page - 1) * pageSize

        // Fetch classes with relations
        const classes = await db.query.universityClasses.findMany({
            where: (tbl, { and, eq }) => {
                const conditions = [eq(tbl.universityId, member.universityId)]
                if (filters?.departmentId) conditions.push(eq(tbl.departmentId, filters.departmentId))
                if (filters?.semester) conditions.push(eq(tbl.semester, filters.semester as "SEMESTER_1" | "SEMESTER_2" | "SEMESTER_3" | "SEMESTER_4" | "SEMESTER_5" | "SEMESTER_6" | "SEMESTER_7" | "SEMESTER_8"))
                if (filters?.section) conditions.push(eq(tbl.section, filters.section))
                if (filters?.academicYear) conditions.push(eq(tbl.academicYear, filters.academicYear))
                if (filters?.isActive !== undefined) conditions.push(eq(tbl.isActive, filters.isActive))
                if (filters?.facultyId) conditions.push(eq(tbl.facultyId, filters.facultyId))
                return and(...conditions)
            },
            with: {
                department: { columns: { id: true, name: true, code: true } },
                faculty: { columns: { id: true, displayName: true, email: true } },
            },
            orderBy: desc(universityClasses.createdAt),
            offset: skip,
            limit: pageSize,
        })

        const totalCountResult = await db.select({ count: count() }).from(universityClasses).where(eq(universityClasses.universityId, member.universityId))
        const totalCount = totalCountResult[0]?.count ?? 0

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
            studentCount: c.studentCount,
            assignmentCount: 0, // computed separately if needed
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
        semester: string
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

        const classData = await db.query.universityClasses.findFirst({
            where: and(
                eq(universityClasses.id, classId),
                eq(universityClasses.universityId, member.universityId),
            ),
            with: {
                department: { columns: { id: true, name: true, code: true } },
                faculty: { columns: { id: true, displayName: true, email: true } },
            },
        })

        if (!classData) {
            return { success: false, error: "Class not found" }
        }

        const enrollmentCountResult = await db.select({ count: count() }).from(classEnrollments).where(eq(classEnrollments.classId, classId))
        const enrollmentCount = enrollmentCountResult[0]?.count ?? 0

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
                enrollmentCount,
                assignmentCount: 0,
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
        const classData = await db.query.universityClasses.findFirst({
            where: and(
                eq(universityClasses.id, classId),
                eq(universityClasses.universityId, member.universityId),
            ),
        })

        if (!classData) {
            return { success: false, error: "Class not found" }
        }

        const enrollments = await db.query.classEnrollments.findMany({
            where: eq(classEnrollments.classId, classId),
            with: {
                studentLink: { columns: { id: true, rollNumber: true } },
            },
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

        const [totalResult, activeResult, enrollmentsResult] = await Promise.all([
            db.select({ count: count() }).from(universityClasses).where(eq(universityClasses.universityId, member.universityId)),
            db.select({ count: count() }).from(universityClasses).where(and(eq(universityClasses.universityId, member.universityId), eq(universityClasses.isActive, true))),
            db.select({ count: count() }).from(classEnrollments).where(
                inArray(classEnrollments.classId,
                    db.select({ id: universityClasses.id }).from(universityClasses).where(eq(universityClasses.universityId, member.universityId))
                )
            ),
        ])

        const total = totalResult[0]?.count ?? 0
        const active = activeResult[0]?.count ?? 0
        const totalEnrollments = enrollmentsResult[0]?.count ?? 0

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
    semester: string
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

        const newClassRows = await db.insert(universityClasses).values({
            universityId: member.universityId,
            departmentId: payload.departmentId ?? null,
            name: payload.name,
            code: payload.code ?? null,
            description: payload.description ?? null,
            semester: payload.semester as "SEMESTER_1" | "SEMESTER_2" | "SEMESTER_3" | "SEMESTER_4" | "SEMESTER_5" | "SEMESTER_6" | "SEMESTER_7" | "SEMESTER_8",
            academicYear: payload.academicYear,
            section: payload.section ?? null,
            facultyId: payload.facultyId ?? null,
            isActive: true,
        }).returning()

        const newClass = newClassRows[0];
        if (!newClass) {
            return { success: false, error: "Failed to create class" }
        }

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
        semester?: string
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
        const existingClass = await db.query.universityClasses.findFirst({
            where: and(
                eq(universityClasses.id, classId),
                eq(universityClasses.universityId, member.universityId),
            ),
        })

        if (!existingClass) {
            return { success: false, error: "Class not found" }
        }

        await db.update(universityClasses).set(payload as Record<string, unknown>).where(eq(universityClasses.id, classId))

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
        const existingClass = await db.query.universityClasses.findFirst({
            where: and(
                eq(universityClasses.id, classId),
                eq(universityClasses.universityId, member.universityId),
            ),
        })

        if (!existingClass) {
            return { success: false, error: "Class not found" }
        }

        await db.delete(universityClasses).where(eq(universityClasses.id, classId))

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
        const classData = await db.query.universityClasses.findFirst({
            where: and(
                eq(universityClasses.id, classId),
                eq(universityClasses.universityId, member.universityId),
            ),
        })

        if (!classData) {
            return { success: false, error: "Class not found" }
        }

        // Verify all student links exist
        const validStudents = await db.query.studentUniversityLinks.findMany({
            where: and(
                inArray(studentUniversityLinks.id, studentLinkIds),
                eq(studentUniversityLinks.universityId, member.universityId),
            ),
            columns: { id: true },
        })

        const validIds = new Set(validStudents.map(s => s.id))

        // Create enrollments (skip duplicates via onConflictDoNothing)
        const enrollmentValues = studentLinkIds
            .filter(id => validIds.has(id))
            .map(studentLinkId => ({ classId, studentLinkId }))

        if (enrollmentValues.length > 0) {
            await db.insert(classEnrollments).values(enrollmentValues).onConflictDoNothing()
        }

        // Update student count
        const newCountResult = await db.select({ count: count() }).from(classEnrollments).where(eq(classEnrollments.classId, classId))
        const newCount = newCountResult[0]?.count ?? 0
        await db.update(universityClasses).set({ studentCount: newCount }).where(eq(universityClasses.id, classId))

        revalidatePath(`/dashboard/classes/${classId}`)
        return { success: true, enrolledCount: enrollmentValues.length }
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
        const classData = await db.query.universityClasses.findFirst({
            where: and(
                eq(universityClasses.id, classId),
                eq(universityClasses.universityId, member.universityId),
            ),
        })

        if (!classData) {
            return { success: false, error: "Class not found" }
        }

        await db.delete(classEnrollments).where(
            and(
                eq(classEnrollments.classId, classId),
                eq(classEnrollments.studentLinkId, studentLinkId),
            )
        )

        // Update student count
        const newCountResult = await db.select({ count: count() }).from(classEnrollments).where(eq(classEnrollments.classId, classId))
        const newCount = newCountResult[0]?.count ?? 0
        await db.update(universityClasses).set({ studentCount: newCount }).where(eq(universityClasses.id, classId))

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
        const classData = await db.query.universityClasses.findFirst({
            where: and(
                eq(universityClasses.id, classId),
                eq(universityClasses.universityId, member.universityId),
            ),
        })

        if (!classData) {
            return { success: false, error: "Class not found" }
        }

        // Verify faculty exists
        const faculty = await db.query.universityMembers.findFirst({
            where: and(
                eq(universityMembers.id, facultyId),
                eq(universityMembers.universityId, member.universityId),
            ),
        })

        if (!faculty) {
            return { success: false, error: "Faculty not found" }
        }

        await db.update(universityClasses).set({ facultyId }).where(eq(universityClasses.id, classId))

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
        const classData = await db.query.universityClasses.findFirst({
            where: and(
                eq(universityClasses.id, classId),
                eq(universityClasses.universityId, member.universityId),
            ),
        })

        if (!classData) {
            return { success: false, error: "Class not found" }
        }

        await db.update(universityClasses).set({ facultyId: null }).where(eq(universityClasses.id, classId))

        revalidatePath(`/dashboard/classes/${classId}`)
        return { success: true }
    } catch (error) {
        console.error("Remove faculty error:", error)
        return { success: false, error: "Failed to remove faculty" }
    }
}
