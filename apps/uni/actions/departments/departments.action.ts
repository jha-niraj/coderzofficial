"use server"

import { prisma } from "@repo/prisma"
import { auth } from "@repo/auth"
import { revalidatePath } from "next/cache"

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
// DEPARTMENT FETCHING ACTIONS
// ============================================

/**
 * Get all departments
 */
export async function getDepartments(): Promise<{
    success: boolean
    departments?: Array<{
        id: string
        name: string
        code: string | null
        description: string | null
        headUserId: string | null
        headName: string | null
        memberCount: number
        studentCount: number
        classCount: number
        createdAt: Date
    }>
    error?: string
}> {
    try {
        const member = await getUserUniversity()
        if (!member) {
            return { success: false, error: "Unauthorized" }
        }

        const departments = await prisma.department.findMany({
            where: { universityId: member.universityId },
            include: {
                _count: {
                    select: {
                        members: true,
                        studentLinks: true,
                        classes: true,
                    }
                }
            },
            orderBy: { name: "asc" }
        })

        // Get head user info for departments with headUserId
        const headUserIds = departments
            .filter(d => d.headUserId)
            .map(d => d.headUserId as string)

        const headMembers = headUserIds.length > 0
            ? await prisma.universityMember.findMany({
                where: { id: { in: headUserIds } },
                select: { id: true, displayName: true }
            })
            : []

        const headMap = new Map(headMembers.map(m => [m.id, m.displayName]))

        const deptList = departments.map(dept => ({
            id: dept.id,
            name: dept.name,
            code: dept.code,
            description: dept.description,
            headUserId: dept.headUserId,
            headName: dept.headUserId ? (headMap.get(dept.headUserId) ?? null) : null,
            memberCount: dept._count.members,
            studentCount: dept._count.studentLinks,
            classCount: dept._count.classes,
            createdAt: dept.createdAt,
        }))

        return { success: true, departments: deptList }
    } catch (error) {
        console.error("Get departments error:", error)
        return { success: false, error: "Failed to fetch departments" }
    }
}

/**
 * Get a single department by ID
 */
export async function getDepartment(departmentId: string): Promise<{
    success: boolean
    department?: {
        id: string
        name: string
        code: string | null
        description: string | null
        headUserId: string | null
        headName: string | null
        headEmail: string | null
        memberCount: number
        studentCount: number
        classCount: number
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

        const department = await prisma.department.findFirst({
            where: {
                id: departmentId,
                universityId: member.universityId,
            },
            include: {
                _count: {
                    select: {
                        members: true,
                        studentLinks: true,
                        classes: true,
                    }
                }
            }
        })

        if (!department) {
            return { success: false, error: "Department not found" }
        }

        // Get head member info if exists
        let headName: string | null = null
        let headEmail: string | null = null
        if (department.headUserId) {
            const headMember = await prisma.universityMember.findUnique({
                where: { id: department.headUserId },
                select: { displayName: true, email: true }
            })
            headName = headMember?.displayName ?? null
            headEmail = headMember?.email ?? null
        }

        return {
            success: true,
            department: {
                id: department.id,
                name: department.name,
                code: department.code,
                description: department.description,
                headUserId: department.headUserId,
                headName,
                headEmail,
                memberCount: department._count.members,
                studentCount: department._count.studentLinks,
                classCount: department._count.classes,
                createdAt: department.createdAt,
                updatedAt: department.updatedAt,
            }
        }
    } catch (error) {
        console.error("Get department error:", error)
        return { success: false, error: "Failed to fetch department" }
    }
}

/**
 * Get department stats
 */
export async function getDepartmentStats(): Promise<{
    success: boolean
    stats?: {
        totalDepartments: number
        totalMembers: number
        totalStudents: number
        totalClasses: number
    }
    error?: string
}> {
    try {
        const member = await getUserUniversity()
        if (!member) {
            return { success: false, error: "Unauthorized" }
        }

        const [totalDepartments, totalMembers, totalStudents, totalClasses] = await Promise.all([
            prisma.department.count({ where: { universityId: member.universityId } }),
            prisma.universityMember.count({ where: { universityId: member.universityId } }),
            prisma.studentUniversityLink.count({ where: { universityId: member.universityId } }),
            prisma.universityClass.count({ where: { universityId: member.universityId } }),
        ])

        return {
            success: true,
            stats: {
                totalDepartments,
                totalMembers,
                totalStudents,
                totalClasses,
            }
        }
    } catch (error) {
        console.error("Get department stats error:", error)
        return { success: false, error: "Failed to fetch department stats" }
    }
}

// ============================================
// DEPARTMENT CRUD ACTIONS
// ============================================

/**
 * Create a new department
 */
export async function createDepartment(payload: {
    name: string
    code?: string
    description?: string
    headUserId?: string
}): Promise<{
    success: boolean
    departmentId?: string
    error?: string
}> {
    try {
        const member = await getUserUniversity()
        if (!member) {
            return { success: false, error: "Unauthorized" }
        }

        // Check permission
        const permissions = member.permissions as string[] | null
        if (member.role !== "HEAD" && !permissions?.includes("MANAGE_DEPARTMENTS")) {
            return { success: false, error: "No permission to create departments" }
        }

        const department = await prisma.department.create({
            data: {
                universityId: member.universityId,
                name: payload.name,
                code: payload.code ?? null,
                description: payload.description ?? null,
                headUserId: payload.headUserId ?? null,
            }
        })

        revalidatePath("/dashboard/departments")
        return { success: true, departmentId: department.id }
    } catch (error) {
        console.error("Create department error:", error)
        return { success: false, error: "Failed to create department" }
    }
}

/**
 * Update a department
 */
export async function updateDepartment(
    departmentId: string,
    payload: {
        name?: string
        code?: string
        description?: string
        headUserId?: string | null
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
        if (member.role !== "HEAD" && !permissions?.includes("MANAGE_DEPARTMENTS")) {
            return { success: false, error: "No permission to update departments" }
        }

        // Verify department exists
        const existingDept = await prisma.department.findFirst({
            where: {
                id: departmentId,
                universityId: member.universityId,
            }
        })

        if (!existingDept) {
            return { success: false, error: "Department not found" }
        }

        await prisma.department.update({
            where: { id: departmentId },
            data: payload,
        })

        revalidatePath("/dashboard/departments")
        revalidatePath(`/dashboard/departments/${departmentId}`)
        return { success: true }
    } catch (error) {
        console.error("Update department error:", error)
        return { success: false, error: "Failed to update department" }
    }
}

/**
 * Delete a department
 */
export async function deleteDepartment(departmentId: string): Promise<{
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
        if (member.role !== "HEAD" && !permissions?.includes("MANAGE_DEPARTMENTS")) {
            return { success: false, error: "No permission to delete departments" }
        }

        // Verify department exists
        const existingDept = await prisma.department.findFirst({
            where: {
                id: departmentId,
                universityId: member.universityId,
            }
        })

        if (!existingDept) {
            return { success: false, error: "Department not found" }
        }

        await prisma.department.delete({
            where: { id: departmentId },
        })

        revalidatePath("/dashboard/departments")
        return { success: true }
    } catch (error) {
        console.error("Delete department error:", error)
        return { success: false, error: "Failed to delete department" }
    }
}

/**
 * Assign a head to a department
 */
export async function assignDepartmentHead(
    departmentId: string,
    headUserId: string
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
        if (member.role !== "HEAD" && !permissions?.includes("MANAGE_DEPARTMENTS")) {
            return { success: false, error: "No permission to manage departments" }
        }

        // Verify department exists
        const existingDept = await prisma.department.findFirst({
            where: {
                id: departmentId,
                universityId: member.universityId,
            }
        })

        if (!existingDept) {
            return { success: false, error: "Department not found" }
        }

        // Verify head member exists
        const headMember = await prisma.universityMember.findFirst({
            where: {
                id: headUserId,
                universityId: member.universityId,
            }
        })

        if (!headMember) {
            return { success: false, error: "Member not found" }
        }

        await prisma.department.update({
            where: { id: departmentId },
            data: { headUserId },
        })

        // Update the member's role to DEPARTMENT_HEAD
        await prisma.universityMember.update({
            where: { id: headUserId },
            data: { 
                role: "DEPARTMENT_HEAD",
                departmentId,
            },
        })

        revalidatePath("/dashboard/departments")
        revalidatePath(`/dashboard/departments/${departmentId}`)
        return { success: true }
    } catch (error) {
        console.error("Assign department head error:", error)
        return { success: false, error: "Failed to assign department head" }
    }
}

/**
 * Remove head from a department
 */
export async function removeDepartmentHead(departmentId: string): Promise<{
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
        if (member.role !== "HEAD" && !permissions?.includes("MANAGE_DEPARTMENTS")) {
            return { success: false, error: "No permission to manage departments" }
        }

        // Verify department exists
        const existingDept = await prisma.department.findFirst({
            where: {
                id: departmentId,
                universityId: member.universityId,
            }
        })

        if (!existingDept) {
            return { success: false, error: "Department not found" }
        }

        // If there was a head, update their role back to FACULTY
        if (existingDept.headUserId) {
            await prisma.universityMember.update({
                where: { id: existingDept.headUserId },
                data: { role: "FACULTY" },
            })
        }

        await prisma.department.update({
            where: { id: departmentId },
            data: { headUserId: null },
        })

        revalidatePath("/dashboard/departments")
        revalidatePath(`/dashboard/departments/${departmentId}`)
        return { success: true }
    } catch (error) {
        console.error("Remove department head error:", error)
        return { success: false, error: "Failed to remove department head" }
    }
}

/**
 * Get department members
 */
export async function getDepartmentMembers(departmentId: string): Promise<{
    success: boolean
    members?: Array<{
        id: string
        userId: string
        displayName: string | null
        email: string
        role: string
        jobTitle: string
        isActive: boolean
    }>
    error?: string
}> {
    try {
        const member = await getUserUniversity()
        if (!member) {
            return { success: false, error: "Unauthorized" }
        }

        // Verify department exists
        const dept = await prisma.department.findFirst({
            where: {
                id: departmentId,
                universityId: member.universityId,
            }
        })

        if (!dept) {
            return { success: false, error: "Department not found" }
        }

        const members = await prisma.universityMember.findMany({
            where: { departmentId },
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
            }))
        }
    } catch (error) {
        console.error("Get department members error:", error)
        return { success: false, error: "Failed to fetch department members" }
    }
}

/**
 * Get department classes
 */
export async function getDepartmentClasses(departmentId: string): Promise<{
    success: boolean
    classes?: Array<{
        id: string
        name: string
        code: string | null
        semester: string
        academicYear: string
        isActive: boolean
        studentCount: number
    }>
    error?: string
}> {
    try {
        const member = await getUserUniversity()
        if (!member) {
            return { success: false, error: "Unauthorized" }
        }

        // Verify department exists
        const dept = await prisma.department.findFirst({
            where: {
                id: departmentId,
                universityId: member.universityId,
            }
        })

        if (!dept) {
            return { success: false, error: "Department not found" }
        }

        const classes = await prisma.universityClass.findMany({
            where: { departmentId },
            orderBy: { createdAt: "desc" },
        })

        return {
            success: true,
            classes: classes.map(c => ({
                id: c.id,
                name: c.name,
                code: c.code,
                semester: c.semester,
                academicYear: c.academicYear,
                isActive: c.isActive,
                studentCount: c.studentCount,
            }))
        }
    } catch (error) {
        console.error("Get department classes error:", error)
        return { success: false, error: "Failed to fetch department classes" }
    }
}

/**
 * Get department students
 */
export async function getDepartmentStudents(departmentId: string): Promise<{
    success: boolean
    students?: Array<{
        id: string
        userId: string
        universityEmail: string
        rollNumber: string | null
        semester: string | null
        batchYear: string | null
        verificationStatus: string
        isActive: boolean
    }>
    error?: string
}> {
    try {
        const member = await getUserUniversity()
        if (!member) {
            return { success: false, error: "Unauthorized" }
        }

        // Verify department exists
        const dept = await prisma.department.findFirst({
            where: {
                id: departmentId,
                universityId: member.universityId,
            }
        })

        if (!dept) {
            return { success: false, error: "Department not found" }
        }

        const students = await prisma.studentUniversityLink.findMany({
            where: { departmentId },
            orderBy: { createdAt: "desc" },
        })

        return {
            success: true,
            students: students.map(s => ({
                id: s.id,
                userId: s.userId,
                universityEmail: s.universityEmail,
                rollNumber: s.rollNumber,
                semester: s.semester,
                batchYear: s.batchYear,
                verificationStatus: s.verificationStatus,
                isActive: s.isActive,
            }))
        }
    } catch (error) {
        console.error("Get department students error:", error)
        return { success: false, error: "Failed to fetch department students" }
    }
}
