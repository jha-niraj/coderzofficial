"use server"
/* eslint-disable @typescript-eslint/no-explicit-any */

import { db, adminAccess, adminAuditLogs, projectsV2, userProjectV2Progress } from "@repo/db"
import { eq, and, ilike, or, count, inArray } from "drizzle-orm"
import { getSession } from "@repo/auth"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import {
    hasPermission, type AdminPermissions, type AdminPermission, type PermissionLevel
} from "@/lib/navigation"

interface Response<T = unknown> {
    success: boolean
    data?: T
    error?: string
}

// Helper to check admin access
async function checkAdminAccess(requiredModule: AdminPermission, requiredLevel: PermissionLevel) {
    const session = await getSession(headers())
    if (!session?.user?.id) {
        return { authorized: false, error: "Not authenticated" }
    }

    const adminRecord = await db.query.adminAccess.findFirst({
        where: eq(adminAccess.userId, session.user.id),
        with: { user: true }
    })

    if (!adminRecord || !hasPermission(adminRecord.permissions as AdminPermissions, requiredModule, requiredLevel)) {
        return { authorized: false, error: "Not authorized" }
    }

    return { authorized: true, adminAccess: adminRecord }
}

// Get all projects with filters and pagination
export async function getAllProjects(params?: {
    page?: number
    limit?: number
    search?: string
    status?: string
    type?: string
    visibility?: string
}): Promise<Response> {
    try {
        const check = await checkAdminAccess("projects", "read")
        if (!check.authorized) {
            return { success: false, error: check.error }
        }

        const page = params?.page || 1
        const limit = params?.limit || 20
        const offset = (page - 1) * limit

        const whereConditions = []

        if (params?.search) {
            whereConditions.push(
                or(
                    ilike(projectsV2.title, `%${params.search}%`),
                    ilike(projectsV2.description, `%${params.search}%`)
                )
            )
        }

        if (params?.visibility) {
            whereConditions.push(eq(projectsV2.visibility, params.visibility as any))
        }

        const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined

        const [projects, totalResult] = await Promise.all([
            db.query.projectsV2.findMany({
                where: whereClause,
                with: {
                    creator: {
                        columns: { id: true, name: true, email: true, image: true }
                    }
                },
                orderBy: (t, { desc }) => [desc(t.createdAt)],
                limit,
                offset
            }),
            db.select({ total: count() }).from(projectsV2).where(whereClause)
        ])
        const total = totalResult[0]?.total ?? 0

        return {
            success: true,
            data: {
                projects,
                pagination: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit)
                }
            }
        }
    } catch (error) {
        console.error("Get projects error:", error)
        return { success: false, error: "Failed to fetch projects" }
    }
}

// Get project by ID
export async function getProjectById(id: string): Promise<Response> {
    try {
        const check = await checkAdminAccess("projects", "read")
        if (!check.authorized) {
            return { success: false, error: check.error }
        }

        const project = await db.query.projectsV2.findFirst({
            where: eq(projectsV2.id, id),
            with: {
                creator: {
                    columns: { id: true, name: true, email: true, image: true }
                },
                sprints: {
                    with: { tasks: true }
                },
                userProgress: true,
                submissions: true,
            }
        })

        if (!project) {
            return { success: false, error: "Project not found" }
        }

        return { success: true, data: project }
    } catch (error) {
        console.error("Get project error:", error)
        return { success: false, error: "Failed to fetch project" }
    }
}

// Update project
export async function updateProject(id: string, data: {
    title?: string
    description?: string
    visibility?: "PRIVATE" | "PUBLIC"
    difficulty?: "BEGINNER" | "INTERMEDIATE" | "ADVANCED"
}): Promise<Response> {
    try {
        const check = await checkAdminAccess("projects", "write")
        if (!check.authorized) {
            return { success: false, error: check.error }
        }

        const projectRows = await db.update(projectsV2)
            .set(data)
            .where(eq(projectsV2.id, id))
            .returning()
        const project = projectRows[0]
        if (!project) return { success: false, error: "Project not found" }

        await db.insert(adminAuditLogs).values({
            adminId: check.adminAccess!.id,
            action: "UPDATE",
            module: "projects",
            resourceType: "Project",
            resourceId: id,
            description: `Updated project: ${project.title}`
        })

        revalidatePath("/projects")
        revalidatePath(`/projects/${id}`)

        return { success: true, data: project }
    } catch (error) {
        console.error("Update project error:", error)
        return { success: false, error: "Failed to update project" }
    }
}

// Delete project
export async function deleteProject(id: string): Promise<Response> {
    try {
        const check = await checkAdminAccess("projects", "delete")
        if (!check.authorized) {
            return { success: false, error: check.error }
        }

        const project = await db.query.projectsV2.findFirst({ where: eq(projectsV2.id, id) })
        if (!project) {
            return { success: false, error: "Project not found" }
        }

        await db.delete(projectsV2).where(eq(projectsV2.id, id))

        await db.insert(adminAuditLogs).values({
            adminId: check.adminAccess!.id,
            action: "DELETE",
            module: "projects",
            resourceType: "Project",
            resourceId: id,
            description: `Deleted project: ${project.title}`
        })

        revalidatePath("/projects")

        return { success: true, data: null }
    } catch (error) {
        console.error("Delete project error:", error)
        return { success: false, error: "Failed to delete project" }
    }
}

// Bulk update projects
export async function bulkUpdateProjects(ids: string[], data: {
    visibility?: "PRIVATE" | "PUBLIC"
    difficulty?: "BEGINNER" | "INTERMEDIATE" | "ADVANCED"
}): Promise<Response> {
    try {
        const check = await checkAdminAccess("projects", "write")
        if (!check.authorized) {
            return { success: false, error: check.error }
        }

        await db.update(projectsV2)
            .set(data)
            .where(inArray(projectsV2.id, ids))

        await db.insert(adminAuditLogs).values({
            adminId: check.adminAccess!.id,
            action: "UPDATE",
            module: "projects",
            resourceType: "Project",
            resourceId: ids.join(","),
            description: `Bulk updated ${ids.length} projects`
        })

        revalidatePath("/projects")

        return { success: true, data: null }
    } catch (error) {
        console.error("Bulk update projects error:", error)
        return { success: false, error: "Failed to update projects" }
    }
}

// Bulk delete projects
export async function bulkDeleteProjects(ids: string[]): Promise<Response> {
    try {
        const check = await checkAdminAccess("projects", "delete")
        if (!check.authorized) {
            return { success: false, error: check.error }
        }

        await db.delete(projectsV2).where(inArray(projectsV2.id, ids))

        await db.insert(adminAuditLogs).values({
            adminId: check.adminAccess!.id,
            action: "DELETE",
            module: "projects",
            resourceType: "Project",
            resourceId: ids.join(","),
            description: `Bulk deleted ${ids.length} projects`
        })

        revalidatePath("/projects")

        return { success: true, data: null }
    } catch (error) {
        console.error("Bulk delete projects error:", error)
        return { success: false, error: "Failed to delete projects" }
    }
}

// Get project stats
export async function getProjectStats(): Promise<Response> {
    try {
        const check = await checkAdminAccess("projects", "read")
        if (!check.authorized) {
            return { success: false, error: check.error }
        }

        const [
            totalResult,
            publicResult,
            privateResult,
            totalStartedResult,
            totalCompletedResult,
        ] = await Promise.all([
            db.select({ total: count() }).from(projectsV2),
            db.select({ public_: count() }).from(projectsV2).where(eq(projectsV2.visibility, "PUBLIC")),
            db.select({ private_: count() }).from(projectsV2).where(eq(projectsV2.visibility, "PRIVATE")),
            db.select({ totalStarted: count() }).from(userProjectV2Progress).where(eq(userProjectV2Progress.status, "IN_PROGRESS")),
            db.select({ totalCompleted: count() }).from(userProjectV2Progress).where(eq(userProjectV2Progress.status, "COMPLETED")),
        ])
        const total = totalResult[0]?.total ?? 0
        const public_ = publicResult[0]?.public_ ?? 0
        const private_ = privateResult[0]?.private_ ?? 0
        const totalStarted = totalStartedResult[0]?.totalStarted ?? 0
        const totalCompleted = totalCompletedResult[0]?.totalCompleted ?? 0

        return {
            success: true,
            data: {
                total,
                public: public_,
                private: private_,
                totalStarted,
                totalCompleted
            }
        }
    } catch (error) {
        console.error("Get project stats error:", error)
        return { success: false, error: "Failed to fetch project stats" }
    }
}
