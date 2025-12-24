"use server"

import { prisma } from "@repo/prisma"
import { getServerSession } from "@repo/auth"
import { authOptions } from "@repo/auth"
import { revalidatePath } from "next/cache"
import { hasPermission } from "@/lib/navigation"

interface Response<T = unknown> {
    success: boolean
    data?: T
    error?: string
}

// Helper to check admin access
async function checkAdminAccess(requiredModule: string, requiredLevel: 'read' | 'write' | 'delete' | 'full') {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
        return { authorized: false, error: "Not authenticated" }
    }

    const adminAccess = await prisma.adminAccess.findUnique({
        where: { userId: session.user.id },
        include: { user: true }
    })

    if (!adminAccess || !hasPermission(adminAccess.permissions, requiredModule, requiredLevel)) {
        return { authorized: false, error: "Not authorized" }
    }

    return { authorized: true, adminAccess }
}

// Get all communities with filters and pagination
export async function getAllCommunities(params?: {
    page?: number
    limit?: number
    search?: string
    status?: string
}): Promise<Response> {
    try {
        const check = await checkAdminAccess('communities', 'read')
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

        const [communities, total] = await Promise.all([
            prisma.community.findMany({
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
                            members: true,
                            posts: true,
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            }),
            prisma.community.count({ where })
        ])

        return {
            success: true,
            data: {
                communities,
                pagination: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit)
                }
            }
        }
    } catch (error) {
        console.error("Get communities error:", error)
        return { success: false, error: "Failed to fetch communities" }
    }
}

// Get community by ID
export async function getCommunityById(id: string): Promise<Response> {
    try {
        const check = await checkAdminAccess('communities', 'read')
        if (!check.authorized) {
            return { success: false, error: check.error }
        }

        const community = await prisma.community.findUnique({
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
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                image: true,
                            }
                        }
                    }
                },
                posts: {
                    include: {
                        author: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            }
                        }
                    },
                    take: 10,
                    orderBy: { createdAt: 'desc' }
                },
                _count: {
                    select: {
                        members: true,
                        posts: true,
                    }
                }
            }
        })

        if (!community) {
            return { success: false, error: "Community not found" }
        }

        return { success: true, data: community }
    } catch (error) {
        console.error("Get community error:", error)
        return { success: false, error: "Failed to fetch community" }
    }
}

// Update community
export async function updateCommunity(id: string, data: {
    name?: string
    description?: string
    status?: string
    isPrivate?: boolean
}): Promise<Response> {
    try {
        const check = await checkAdminAccess('communities', 'write')
        if (!check.authorized) {
            return { success: false, error: check.error }
        }

        const community = await prisma.community.update({
            where: { id },
            data
        })

        await prisma.adminAuditLog.create({
            data: {
                adminId: check.adminAccess!.id,
                action: "UPDATE",
                module: "communities",
                resourceType: "Community",
                resourceId: id,
                description: `Updated community: ${community.name}`
            }
        })

        revalidatePath('/communities')
        revalidatePath(`/communities/${id}`)

        return { success: true, data: community }
    } catch (error) {
        console.error("Update community error:", error)
        return { success: false, error: "Failed to update community" }
    }
}

// Delete community
export async function deleteCommunity(id: string): Promise<Response> {
    try {
        const check = await checkAdminAccess('communities', 'delete')
        if (!check.authorized) {
            return { success: false, error: check.error }
        }

        const community = await prisma.community.findUnique({ where: { id } })
        if (!community) {
            return { success: false, error: "Community not found" }
        }

        await prisma.community.delete({ where: { id } })

        await prisma.adminAuditLog.create({
            data: {
                adminId: check.adminAccess!.id,
                action: "DELETE",
                module: "communities",
                resourceType: "Community",
                resourceId: id,
                description: `Deleted community: ${community.name}`
            }
        })

        revalidatePath('/communities')

        return { success: true, data: null }
    } catch (error) {
        console.error("Delete community error:", error)
        return { success: false, error: "Failed to delete community" }
    }
}

// Bulk delete communities
export async function bulkDeleteCommunities(ids: string[]): Promise<Response> {
    try {
        const check = await checkAdminAccess('communities', 'delete')
        if (!check.authorized) {
            return { success: false, error: check.error }
        }

        await prisma.community.deleteMany({
            where: { id: { in: ids } }
        })

        await prisma.adminAuditLog.create({
            data: {
                adminId: check.adminAccess!.id,
                action: "DELETE",
                module: "communities",
                resourceType: "Community",
                resourceId: ids.join(','),
                description: `Bulk deleted ${ids.length} communities`
            }
        })

        revalidatePath('/communities')

        return { success: true, data: null }
    } catch (error) {
        console.error("Bulk delete communities error:", error)
        return { success: false, error: "Failed to delete communities" }
    }
}

// Get community stats
export async function getCommunityStats(): Promise<Response> {
    try {
        const check = await checkAdminAccess('communities', 'read')
        if (!check.authorized) {
            return { success: false, error: check.error }
        }

        const [total, active, private_, public_] = await Promise.all([
            prisma.community.count(),
            prisma.community.count({ where: { status: 'ACTIVE' } }),
            prisma.community.count({ where: { isPrivate: true } }),
            prisma.community.count({ where: { isPrivate: false } }),
        ])

        // Total members across all communities
        const totalMembers = await prisma.communityMember.count()

        return {
            success: true,
            data: {
                total,
                active,
                private: private_,
                public: public_,
                totalMembers
            }
        }
    } catch (error) {
        console.error("Get community stats error:", error)
        return { success: false, error: "Failed to fetch community stats" }
    }
}

// Remove member from community
export async function removeCommunityMember(communityId: string, userId: string): Promise<Response> {
    try {
        const check = await checkAdminAccess('communities', 'write')
        if (!check.authorized) {
            return { success: false, error: check.error }
        }

        await prisma.communityMember.deleteMany({
            where: {
                communityId,
                userId
            }
        })

        await prisma.adminAuditLog.create({
            data: {
                adminId: check.adminAccess!.id,
                action: "UPDATE",
                module: "communities",
                resourceType: "CommunityMember",
                resourceId: `${communityId}-${userId}`,
                description: `Removed member from community`
            }
        })

        revalidatePath(`/communities/${communityId}`)

        return { success: true, data: null }
    } catch (error) {
        console.error("Remove community member error:", error)
        return { success: false, error: "Failed to remove member" }
    }
}

// Delete community post
export async function deleteCommunityPost(postId: string): Promise<Response> {
    try {
        const check = await checkAdminAccess('communities', 'delete')
        if (!check.authorized) {
            return { success: false, error: check.error }
        }

        const post = await prisma.communityPost.findUnique({ where: { id: postId } })
        if (!post) {
            return { success: false, error: "Post not found" }
        }

        await prisma.communityPost.delete({ where: { id: postId } })

        await prisma.adminAuditLog.create({
            data: {
                adminId: check.adminAccess!.id,
                action: "DELETE",
                module: "communities",
                resourceType: "CommunityPost",
                resourceId: postId,
                description: `Deleted community post`
            }
        })

        revalidatePath(`/communities/${post.communityId}`)

        return { success: true, data: null }
    } catch (error) {
        console.error("Delete community post error:", error)
        return { success: false, error: "Failed to delete post" }
    }
}
