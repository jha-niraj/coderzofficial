"use server"

import { auth } from "@repo/auth";
import prisma from "@repo/prisma";
import { ResourceType } from "@prisma/client"
import { revalidatePath } from "next/cache"

/**
 * Add a new resource to a project
 */
export async function addProjectResource(data: {
    projectId: string
    title: string
    link: string
    type: ResourceType
    description?: string
}) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: "Not authenticated" }
        }

        // Validate inputs
        if (!data.title || data.title.length > 200) {
            return { success: false, error: "Title must be 1-200 characters" }
        }

        if (!data.link) {
            return { success: false, error: "Link is required" }
        }

        // Check if project exists
        const project = await prisma.projectV2.findUnique({
            where: { id: data.projectId },
            select: { id: true, createdBy: true }
        })

        if (!project) {
            return { success: false, error: "Project not found" }
        }

        // Check if user is creator (for marking as official)
        const isCreator = project.createdBy === session.user.id

        // Create resource
        const resource = await prisma.projectV2Resource.create({
            data: {
                userId: session.user.id,
                projectId: data.projectId,
                title: data.title,
                link: data.link,
                type: data.type,
                description: data.description,
                isOfficial: isCreator, // Auto-mark as official if creator adds it
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        image: true,
                    }
                }
            }
        })

        revalidatePath(`/projects/[slug]`, 'page')

        return { success: true, resource }

    } catch (error) {
        console.error("Error adding resource:", error)
        return { success: false, error: "Failed to add resource" }
    }
}

/**
 * Get all resources for a project
 */
export async function getProjectResources(params: {
    projectId: string
    type?: ResourceType
}) {
    try {
        const where: any = {
            projectId: params.projectId
        }

        if (params.type) {
            where.type = params.type
        }

        const resources = await prisma.projectV2Resource.findMany({
            where,
            orderBy: [
                { isOfficial: 'desc' }, // Official resources first
                { helpfulCount: 'desc' }, // Then by helpful count
                { createdAt: 'desc' } // Then by recency
            ],
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        image: true,
                    }
                }
            }
        })

        return { success: true, resources }

    } catch (error) {
        console.error("Error fetching resources:", error)
        return { success: false, error: "Failed to fetch resources", resources: [] }
    }
}

/**
 * Mark a resource as helpful
 */
export async function toggleResourceHelpful(resourceId: string) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: "Not authenticated" }
        }

        const resource = await prisma.projectV2Resource.findUnique({
            where: { id: resourceId },
            select: { markedHelpfulBy: true, helpfulCount: true }
        })

        if (!resource) {
            return { success: false, error: "Resource not found" }
        }

        const hasMarked = resource.markedHelpfulBy.includes(session.user.id)

        if (hasMarked) {
            // Remove mark
            await prisma.projectV2Resource.update({
                where: { id: resourceId },
                data: {
                    markedHelpfulBy: {
                        set: resource.markedHelpfulBy.filter((id: string) => id !== session.user.id)
                    },
                    helpfulCount: { decrement: 1 }
                }
            })
            return { success: true, marked: false }
        } else {
            // Add mark
            await prisma.projectV2Resource.update({
                where: { id: resourceId },
                data: {
                    markedHelpfulBy: {
                        push: session.user.id
                    },
                    helpfulCount: { increment: 1 }
                }
            })
            return { success: true, marked: true }
        }

    } catch (error) {
        console.error("Error toggling helpful:", error)
        return { success: false, error: "Failed to update resource" }
    }
}

/**
 * Increment resource view count
 */
export async function incrementResourceView(resourceId: string) {
    try {
        await prisma.projectV2Resource.update({
            where: { id: resourceId },
            data: { views: { increment: 1 } }
        })
        return { success: true }
    } catch (error) {
        return { success: false, error: "Failed to increment view" }
    }
}

/**
 * Delete a resource (only by creator or resource author)
 */
export async function deleteProjectResource(resourceId: string) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: "Not authenticated" }
        }

        const resource = await prisma.projectV2Resource.findUnique({
            where: { id: resourceId },
            include: {
                project: {
                    select: { createdBy: true }
                }
            }
        })

        if (!resource) {
            return { success: false, error: "Resource not found" }
        }

        // Check if user is resource author or project creator
        const canDelete = resource.userId === session.user.id || resource.project.createdBy === session.user.id

        if (!canDelete) {
            return { success: false, error: "Not authorized to delete this resource" }
        }

        await prisma.projectV2Resource.delete({
            where: { id: resourceId }
        })

        revalidatePath(`/projects/[slug]`, 'page')

        return { success: true }

    } catch (error) {
        console.error("Error deleting resource:", error)
        return { success: false, error: "Failed to delete resource" }
    }
}