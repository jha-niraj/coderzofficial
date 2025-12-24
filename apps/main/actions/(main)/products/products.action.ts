'use server'

import { auth } from '@repo/auth'
import { prisma } from '@repo/prisma'
import { revalidatePath } from 'next/cache'

interface ProductIdeaInput {
    title: string
    description: string
    helpDescription: string
    link?: string
    category: string
}

export async function submitProductIdea(input: ProductIdeaInput) {
    try {
        const session = await auth()
        
        if (!session?.user?.id) {
            return {
                success: false,
                error: 'You must be logged in to submit a product idea'
            }
        }

        // Validate input
        if (!input.title || !input.description || !input.helpDescription) {
            return {
                success: false,
                error: 'Please fill in all required fields'
            }
        }

        // Create product idea
        const productIdea = await prisma.productIdea.create({
            data: {
                title: input.title.trim(),
                description: input.description.trim(),
                helpDescription: input.helpDescription.trim(),
                link: input.link?.trim() || null,
                category: input.category,
                submittedById: session.user.id,
                status: 'PENDING'
            }
        })

        revalidatePath('/products')
        
        return {
            success: true,
            data: {
                id: productIdea.id,
                title: productIdea.title
            }
        }
    } catch (error) {
        console.error('Error submitting product idea:', error)
        return {
            success: false,
            error: 'Failed to submit product idea. Please try again later.'
        }
    }
}

export async function getProductIdeas(status?: string) {
    try {
        const session = await auth()
        
        if (!session?.user?.id) {
            return {
                success: false,
                error: 'Authentication required'
            }
        }

        const where = status ? { status } : {}
        
        const productIdeas = await prisma.productIdea.findMany({
            where,
            include: {
                submittedBy: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        image: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        return {
            success: true,
            data: productIdeas
        }
    } catch (error) {
        console.error('Error fetching product ideas:', error)
        return {
            success: false,
            error: 'Failed to fetch product ideas'
        }
    }
}

export async function getUserProductIdeas(userId: string) {
    try {
        const session = await auth()
        
        if (!session?.user?.id) {
            return {
                success: false,
                error: 'Authentication required'
            }
        }

        const productIdeas = await prisma.productIdea.findMany({
            where: {
                submittedById: userId
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        return {
            success: true,
            data: productIdeas
        }
    } catch (error) {
        console.error('Error fetching user product ideas:', error)
        return {
            success: false,
            error: 'Failed to fetch product ideas'
        }
    }
}

export async function updateProductIdeaStatus(
    ideaId: string, 
    status: string, 
    adminNotes?: string
) {
    try {
        const session = await auth()
        
        if (!session?.user?.id) {
            return {
                success: false,
                error: 'Authentication required'
            }
        }

        // TODO: Add admin role check here
        // For now, any authenticated user can update (you should restrict this)

        const updated = await prisma.productIdea.update({
            where: {
                id: ideaId
            },
            data: {
                status,
                adminNotes,
                reviewedAt: new Date()
            }
        })

        revalidatePath('/products')
        revalidatePath('/admin/products')
        
        return {
            success: true,
            data: updated
        }
    } catch (error) {
        console.error('Error updating product idea status:', error)
        return {
            success: false,
            error: 'Failed to update product idea status'
        }
    }
}



