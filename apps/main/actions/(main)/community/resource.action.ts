'use server'

import { prisma } from "@repo/prisma"
import { getServerSession } from '@repo/auth'
import { authOptions } from '@repo/auth'
import { revalidatePath } from "next/cache"
import { CommunityResourceType } from "@repo/prisma/client"

// ==================== TYPES ====================
export interface CreateResourceInput {
    communityId: string
    title: string
    description?: string
    type: CommunityResourceType
    url: string
    thumbnailUrl?: string
    fileSize?: number
    mimeType?: string
    folder?: string
    tags?: string[]
}

// ==================== RESOURCE CRUD ====================

// Upload/Add resource
export async function createResource(input: CreateResourceInput) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" }
        }

        // Check if user is a member
        const membership = await prisma.communityMember.findUnique({
            where: {
                communityId_userId: {
                    communityId: input.communityId,
                    userId: session.user.id
                }
            },
            include: { community: true }
        })

        if (!membership || !membership.isApproved) {
            return { success: false, error: "You must be a member to share resources" }
        }

        const resource = await prisma.communityResource.create({
            data: {
                communityId: input.communityId,
                uploaderId: session.user.id,
                title: input.title,
                description: input.description,
                type: input.type,
                url: input.url,
                thumbnailUrl: input.thumbnailUrl,
                fileSize: input.fileSize,
                mimeType: input.mimeType,
                folder: input.folder,
                tags: input.tags || []
            },
            include: {
                uploader: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        image: true
                    }
                }
            }
        })

        revalidatePath(`/community/${membership.community.slug}/resources`)
        return { success: true, data: resource }
    } catch (error) {
        console.error('Error creating resource:', error)
        return { success: false, error: "Failed to upload resource" }
    }
}

// Get resources for a community
export async function getCommunityResources(communityId: string, options?: {
    type?: CommunityResourceType
    folder?: string
    search?: string
    limit?: number
    offset?: number
    sortBy?: 'latest' | 'popular' | 'name'
}) {
    try {
        const { type, folder, search, limit = 30, offset = 0, sortBy = 'latest' } = options || {}

        const where = {
            communityId,
            ...(type && { type }),
            ...(folder && { folder }),
            ...(search && {
                OR: [
                    { title: { contains: search, mode: 'insensitive' as const } },
                    { description: { contains: search, mode: 'insensitive' as const } },
                    { tags: { has: search } }
                ]
            })
        }

        const orderBy = sortBy === 'popular'
            ? [{ downloadCount: 'desc' as const }]
            : sortBy === 'name'
                ? [{ title: 'asc' as const }]
                : [{ createdAt: 'desc' as const }]

        const [resources, total] = await Promise.all([
            prisma.communityResource.findMany({
                where,
                include: {
                    uploader: {
                        select: {
                            id: true,
                            name: true,
                            username: true,
                            image: true
                        }
                    }
                },
                orderBy,
                take: limit,
                skip: offset
            }),
            prisma.communityResource.count({ where })
        ])

        return { success: true, data: resources, total }
    } catch (error) {
        console.error('Error fetching resources:', error)
        return { success: false, error: "Failed to fetch resources" }
    }
}

// Get folders in a community
export async function getResourceFolders(communityId: string) {
    try {
        const resources = await prisma.communityResource.groupBy({
            by: ['folder'],
            where: {
                communityId,
                folder: { not: null }
            },
            _count: { id: true }
        })

        const folders = resources
            .filter(r => r.folder)
            .map(r => ({
                name: r.folder!,
                count: r._count.id
            }))

        return { success: true, data: folders }
    } catch (error) {
        console.error('Error fetching folders:', error)
        return { success: false, error: "Failed to fetch folders" }
    }
}

// Increment download count
export async function trackResourceDownload(resourceId: string) {
    try {
        await prisma.communityResource.update({
            where: { id: resourceId },
            data: { downloadCount: { increment: 1 } }
        })
        return { success: true }
    } catch (error) {
        console.error('Error tracking download:', error)
        return { success: false }
    }
}

// Delete resource
export async function deleteResource(resourceId: string) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" }
        }

        const resource = await prisma.communityResource.findUnique({
            where: { id: resourceId },
            include: { community: true }
        })

        if (!resource) {
            return { success: false, error: "Resource not found" }
        }

        // Check if user is uploader or admin
        if (resource.uploaderId !== session.user.id) {
            const membership = await prisma.communityMember.findUnique({
                where: {
                    communityId_userId: {
                        communityId: resource.communityId,
                        userId: session.user.id
                    }
                }
            })

            if (!membership || !['OWNER', 'ADMIN', 'MODERATOR'].includes(membership.role)) {
                return { success: false, error: "You don't have permission" }
            }
        }

        await prisma.communityResource.delete({
            where: { id: resourceId }
        })

        revalidatePath(`/community/${resource.community.slug}/resources`)
        return { success: true }
    } catch (error) {
        console.error('Error deleting resource:', error)
        return { success: false, error: "Failed to delete resource" }
    }
}

// Pin/Unpin resource (admin only)
export async function togglePinResource(resourceId: string) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" }
        }

        const resource = await prisma.communityResource.findUnique({
            where: { id: resourceId }
        })

        if (!resource) {
            return { success: false, error: "Resource not found" }
        }

        // Check admin permission
        const membership = await prisma.communityMember.findUnique({
            where: {
                communityId_userId: {
                    communityId: resource.communityId,
                    userId: session.user.id
                }
            }
        })

        if (!membership || !['OWNER', 'ADMIN', 'MODERATOR'].includes(membership.role)) {
            return { success: false, error: "Only admins can pin resources" }
        }

        const updatedResource = await prisma.communityResource.update({
            where: { id: resourceId },
            data: { isPinned: !resource.isPinned }
        })

        return { success: true, data: updatedResource }
    } catch (error) {
        console.error('Error toggling pin:', error)
        return { success: false, error: "Failed to update resource" }
    }
}
