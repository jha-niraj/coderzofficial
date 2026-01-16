"use server"

import { prisma } from "@repo/prisma"
import { getServerSession } from "@repo/auth"
import { authOptions } from "@repo/auth"
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
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
        return { authorized: false, error: "Not authenticated" }
    }

    const adminAccess = await prisma.adminAccess.findUnique({
        where: { userId: session.user.id },
        include: { user: true }
    })

    if (!adminAccess || !hasPermission(adminAccess.permissions as AdminPermissions, requiredModule, requiredLevel)) {
        return { authorized: false, error: "Not authorized" }
    }

    return { authorized: true, adminAccess }
}

// Get all projects with filters and pagination
export async function getAllProjects(params?: {
    page?: number
    limit?: number
    search?: string
    status?: string
    type?: string
}): Promise<Response> {
    try {
        const check = await checkAdminAccess('projects', 'read')
        if (!check.authorized) {
            return { success: false, error: check.error }
        }

        const page = params?.page || 1
        const limit = params?.limit || 20
        const skip = (page - 1) * limit

        const where: any = {}

        if (params?.search) {
            where.OR = [
                { title: { contains: params.search, mode: 'insensitive' } },
                { description: { contains: params.search, mode: 'insensitive' } },
            ]
        }

        if (params?.status) {
            where.status = params.status
        }

        if (params?.type) {
            where.type = params.type
        }

        const [projects, total] = await Promise.all([
            prisma.projectV2.findMany({
                where,
                skip,
                take: limit,
                include: {
                    creator: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            image: true,
                        }
                    },
                    _count: {
                        select: {
                            progress: true,
                            submissions: true,
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            }),
            prisma.projectV2.count({ where })
        ])

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
        const check = await checkAdminAccess('projects', 'read')
        if (!check.authorized) {
            return { success: false, error: check.error }
        }

        const project = await prisma.projectV2.findUnique({
            where: { id },
            include: {
                creator: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                    }
                },
                sprints: {
                    include: {
                        tasks: true
                    }
                },
                progress: true,
                submissions: true,
                _count: {
                    select: {
                        progress: true,
                        submissions: true,
                    }
                }
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
    visibility?: 'PRIVATE' | 'PUBLIC'
    difficulty?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
}): Promise<Response> {
    try {
        const check = await checkAdminAccess('projects', 'write')
        if (!check.authorized) {
            return { success: false, error: check.error }
        }

        const project = await prisma.projectV2.update({
            where: { id },
            data
        })

        await prisma.adminAuditLog.create({
            data: {
                adminId: check.adminAccess!.id,
                action: "UPDATE",
                module: "projects",
                resourceType: "Project",
                resourceId: id,
                description: `Updated project: ${project.title}`
            }
        })

        revalidatePath('/projects')
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
        const check = await checkAdminAccess('projects', 'delete')
        if (!check.authorized) {
            return { success: false, error: check.error }
        }

        const project = await prisma.projectV2.findUnique({ where: { id } })
        if (!project) {
            return { success: false, error: "Project not found" }
        }

        await prisma.projectV2.delete({ where: { id } })

        await prisma.adminAuditLog.create({
            data: {
                adminId: check.adminAccess!.id,
                action: "DELETE",
                module: "projects",
                resourceType: "Project",
                resourceId: id,
                description: `Deleted project: ${project.title}`
            }
        })

        revalidatePath('/projects')

        return { success: true, data: null }
    } catch (error) {
        console.error("Delete project error:", error)
        return { success: false, error: "Failed to delete project" }
    }
}

// Bulk update projects
export async function bulkUpdateProjects(ids: string[], data: {
    visibility?: 'PRIVATE' | 'PUBLIC'
    difficulty?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
}): Promise<Response> {
    try {
        const check = await checkAdminAccess('projects', 'write')
        if (!check.authorized) {
            return { success: false, error: check.error }
        }

        await prisma.projectV2.updateMany({
            where: { id: { in: ids } },
            data
        })

        await prisma.adminAuditLog.create({
            data: {
                adminId: check.adminAccess!.id,
                action: "UPDATE",
                module: "projects",
                resourceType: "Project",
                resourceId: ids.join(','),
                description: `Bulk updated ${ids.length} projects`
            }
        })

        revalidatePath('/projects')

        return { success: true, data: null }
    } catch (error) {
        console.error("Bulk update projects error:", error)
        return { success: false, error: "Failed to update projects" }
    }
}

// Bulk delete projects
export async function bulkDeleteProjects(ids: string[]): Promise<Response> {
    try {
        const check = await checkAdminAccess('projects', 'delete')
        if (!check.authorized) {
            return { success: false, error: check.error }
        }

        await prisma.projectV2.deleteMany({
            where: { id: { in: ids } }
        })

        await prisma.adminAuditLog.create({
            data: {
                adminId: check.adminAccess!.id,
                action: "DELETE",
                module: "projects",
                resourceType: "Project",
                resourceId: ids.join(','),
                description: `Bulk deleted ${ids.length} projects`
            }
        })

        revalidatePath('/projects')

        return { success: true, data: null }
    } catch (error) {
        console.error("Bulk delete projects error:", error)
        return { success: false, error: "Failed to delete projects" }
    }
}

// Get project stats
export async function getProjectStats(): Promise<Response> {
    try {
        const check = await checkAdminAccess('projects', 'read')
        if (!check.authorized) {
            return { success: false, error: check.error }
        }

        const [total, public_, private_, totalStarted, totalCompleted] = await Promise.all([
            prisma.projectV2.count(),
            prisma.projectV2.count({ where: { visibility: 'PUBLIC' } }),
            prisma.projectV2.count({ where: { visibility: 'PRIVATE' } }),
            prisma.userProjectV2Progress.count({ where: { status: 'IN_PROGRESS' } }),
            prisma.userProjectV2Progress.count({ where: { status: 'COMPLETED' } }),
        ])

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
