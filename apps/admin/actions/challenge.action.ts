"use server"

import { prisma } from "@repo/prisma"
import { getServerSession } from "@repo/auth"
import { authOptions } from "@repo/auth"
import { revalidatePath } from "next/cache"
import { hasPermission, type AdminPermissions, type AdminPermission, type PermissionLevel } from "@/lib/navigation"

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

// Get all Forge tracks with filters and pagination
export async function getAllForgeTracks(params?: {
    page?: number
    limit?: number
    search?: string
    status?: string
}): Promise<Response> {
    try {
        const check = await checkAdminAccess('challenges', 'read')
        if (!check.authorized) {
            return { success: false, error: check.error }
        }

        const page = params?.page || 1
        const limit = params?.limit || 20
        const skip = (page - 1) * limit

        const where: any = {}

        if (params?.search) {
            where.OR = [
                { name: { contains: params.search, mode: 'insensitive' } },
                { description: { contains: params.search, mode: 'insensitive' } },
            ]
        }

        if (params?.status) {
            where.status = params.status
        }

        const [tracks, total] = await Promise.all([
            prisma.forgeTrack.findMany({
                where,
                skip,
                take: limit,
                include: {
                    _count: {
                        select: {
                            steps: true,
                            enrollments: true,
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            }),
            prisma.forgeTrack.count({ where })
        ])

        return {
            success: true,
            data: {
                tracks,
                pagination: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit)
                }
            }
        }
    } catch (error) {
        console.error("Get forge tracks error:", error)
        return { success: false, error: "Failed to fetch forge tracks" }
    }
}

// Get all Crucible events with filters and pagination
export async function getAllCrucibleEvents(params?: {
    page?: number
    limit?: number
    search?: string
    status?: string
}): Promise<Response> {
    try {
        const check = await checkAdminAccess('challenges', 'read')
        if (!check.authorized) {
            return { success: false, error: check.error }
        }

        const page = params?.page || 1
        const limit = params?.limit || 20
        const skip = (page - 1) * limit

        const where: any = {}

        if (params?.search) {
            where.OR = [
                { name: { contains: params.search, mode: 'insensitive' } },
                { description: { contains: params.search, mode: 'insensitive' } },
            ]
        }

        if (params?.status) {
            where.status = params.status
        }

        const [events, total] = await Promise.all([
            prisma.crucibleEvent.findMany({
                where,
                skip,
                take: limit,
                include: {
                    _count: {
                        select: {
                            participations: true,
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            }),
            prisma.crucibleEvent.count({ where })
        ])

        return {
            success: true,
            data: {
                events,
                pagination: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit)
                }
            }
        }
    } catch (error) {
        console.error("Get crucible events error:", error)
        return { success: false, error: "Failed to fetch crucible events" }
    }
}

// Create Forge track
export async function createForgeTrack(data: {
    name: string
    slug: string
    description: string
    technology: string
    level?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
}): Promise<Response> {
    try {
        const check = await checkAdminAccess('challenges', 'write')
        if (!check.authorized) {
            return { success: false, error: check.error }
        }

        const track = await prisma.forgeTrack.create({
            data
        })

        await prisma.adminAuditLog.create({
            data: {
                adminId: check.adminAccess!.id,
                action: "CREATE",
                module: "challenges",
                resourceType: "ForgeTrack",
                resourceId: track.id,
                description: `Created forge track: ${track.name}`
            }
        })

        revalidatePath('/challenges')

        return { success: true, data: track }
    } catch (error) {
        console.error("Create forge track error:", error)
        return { success: false, error: "Failed to create forge track" }
    }
}

// Create Crucible event
export async function createCrucibleEvent(data: {
    name: string
    slug: string
    description: string
    eventType: string
    startTime: Date
    endTime: Date
    maxParticipants?: number
}): Promise<Response> {
    try {
        const check = await checkAdminAccess('challenges', 'write')
        if (!check.authorized) {
            return { success: false, error: check.error }
        }

        const event = await prisma.crucibleEvent.create({
            data
        })

        await prisma.adminAuditLog.create({
            data: {
                adminId: check.adminAccess!.id,
                action: "CREATE",
                module: "challenges",
                resourceType: "CrucibleEvent",
                resourceId: event.id,
                description: `Created crucible event: ${event.name}`
            }
        })

        revalidatePath('/challenges')

        return { success: true, data: event }
    } catch (error) {
        console.error("Create crucible event error:", error)
        return { success: false, error: "Failed to create crucible event" }
    }
}

// Update Forge track
export async function updateForgeTrack(id: string, data: {
    name?: string
    description?: string
    status?: string
    level?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
}): Promise<Response> {
    try {
        const check = await checkAdminAccess('challenges', 'write')
        if (!check.authorized) {
            return { success: false, error: check.error }
        }

        const updateData: any = {}
        if (data.name) {
            updateData.name = data.name
            updateData.slug = data.name.toLowerCase().replace(/ /g, '-')
        }
        if (data.description) updateData.description = data.description
        if (data.status) updateData.status = data.status
        if (data.level) updateData.level = data.level

        const track = await prisma.forgeTrack.update({
            where: { id },
            data: updateData
        })

        await prisma.adminAuditLog.create({
            data: {
                adminId: check.adminAccess!.id,
                action: "UPDATE",
                module: "challenges",
                resourceType: "ForgeTrack",
                resourceId: id,
                description: `Updated forge track: ${track.name}`
            }
        })

        revalidatePath('/challenges')

        return { success: true, data: track }
    } catch (error) {
        console.error("Update forge track error:", error)
        return { success: false, error: "Failed to update forge track" }
    }
}

// Update Crucible event
export async function updateCrucibleEvent(id: string, data: {
    name?: string
    description?: string
    status?: 'UPCOMING' | 'ACTIVE' | 'ENDED' | 'ARCHIVED'
    startTime?: Date
    endTime?: Date
}): Promise<Response> {
    try {
        const check = await checkAdminAccess('challenges', 'write')
        if (!check.authorized) {
            return { success: false, error: check.error }
        }

        const event = await prisma.crucibleEvent.update({
            where: { id },
            data
        })

        await prisma.adminAuditLog.create({
            data: {
                adminId: check.adminAccess!.id,
                action: "UPDATE",
                module: "challenges",
                resourceType: "CrucibleEvent",
                resourceId: id,
                description: `Updated crucible event: ${event.name}`
            }
        })

        revalidatePath('/challenges')

        return { success: true, data: event }
    } catch (error) {
        console.error("Update crucible event error:", error)
        return { success: false, error: "Failed to update crucible event" }
    }
}

// Delete Forge track
export async function deleteForgeTrack(id: string): Promise<Response> {
    try {
        const check = await checkAdminAccess('challenges', 'delete')
        if (!check.authorized) {
            return { success: false, error: check.error }
        }

        const track = await prisma.forgeTrack.findUnique({ where: { id } })
        if (!track) {
            return { success: false, error: "Track not found" }
        }

        await prisma.forgeTrack.delete({ where: { id } })

        await prisma.adminAuditLog.create({
            data: {
                adminId: check.adminAccess!.id,
                action: "DELETE",
                module: "challenges",
                resourceType: "ForgeTrack",
                resourceId: id,
                description: `Deleted forge track: ${track.name}`
            }
        })

        revalidatePath('/challenges')

        return { success: true, data: null }
    } catch (error) {
        console.error("Delete forge track error:", error)
        return { success: false, error: "Failed to delete forge track" }
    }
}

// Delete Crucible event
export async function deleteCrucibleEvent(id: string): Promise<Response> {
    try {
        const check = await checkAdminAccess('challenges', 'delete')
        if (!check.authorized) {
            return { success: false, error: check.error }
        }

        const event = await prisma.crucibleEvent.findUnique({ where: { id } })
        if (!event) {
            return { success: false, error: "Event not found" }
        }

        await prisma.crucibleEvent.delete({ where: { id } })

        await prisma.adminAuditLog.create({
            data: {
                adminId: check.adminAccess!.id,
                action: "DELETE",
                module: "challenges",
                resourceType: "CrucibleEvent",
                resourceId: id,
                description: `Deleted crucible event: ${event.name}`
            }
        })

        revalidatePath('/challenges')

        return { success: true, data: null }
    } catch (error) {
        console.error("Delete crucible event error:", error)
        return { success: false, error: "Failed to delete crucible event" }
    }
}

// Get challenge stats
export async function getChallengeStats(): Promise<Response> {
    try {
        const check = await checkAdminAccess('challenges', 'read')
        if (!check.authorized) {
            return { success: false, error: check.error }
        }

        const [forgeTracks, crucibleEvents, totalEnrollments, totalParticipants] = await Promise.all([
            prisma.forgeTrack.count(),
            prisma.crucibleEvent.count(),
            prisma.forgeEnrollment.count(),
            prisma.crucibleParticipation.count(),
        ])

        return {
            success: true,
            data: {
                forgeTracks,
                crucibleEvents,
                totalEnrollments,
                totalParticipants
            }
        }
    } catch (error) {
        console.error("Get challenge stats error:", error)
        return { success: false, error: "Failed to fetch challenge stats" }
    }
}
