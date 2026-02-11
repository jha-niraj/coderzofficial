'use server'

import { auth } from '@repo/auth'
import { prisma } from '@repo/prisma'
import { revalidatePath } from 'next/cache'
import { LaunchpadProductStatus, LaunchpadProductType, LaunchpadCategory } from '@prisma/client'

// ============================================
// Types
// ============================================

interface AdminCreateProductInput {
    name: string
    tagline: string
    description: string
    logo?: string
    coverImage?: string
    screenshots?: string[]
    websiteUrl?: string
    demoUrl?: string
    githubUrl?: string
    twitterUrl?: string
    category: string
    tags?: string[]
    features?: string[]
    techStack?: string[]
    pricing?: string
    isFeatured?: boolean
    featuredOrder?: number
}

interface AdminUpdateProductInput extends Partial<AdminCreateProductInput> {
    id: string
    status?: LaunchpadProductStatus
}

// ============================================
// Helper: Generate slug
// ============================================

function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .substring(0, 50) + '-' + Date.now().toString(36)
}

// ============================================
// Check Admin Status
// ============================================

async function checkAdmin() {
    const session = await auth()
    
    if (!session?.user?.id) {
        return { isAdmin: false, error: 'Not authenticated' }
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true }
    })

    if (!user || user.role !== 'Admin') {
        return { isAdmin: false, error: 'Admin access required' }
    }

    return { isAdmin: true, userId: session.user.id }
}

// ============================================
// Admin: Create Coderz Official Product
// ============================================

export async function adminCreateProduct(input: AdminCreateProductInput) {
    try {
        const adminCheck = await checkAdmin()
        
        if (!adminCheck.isAdmin) {
            return { success: false, error: adminCheck.error }
        }

        if (!input.name || !input.tagline || !input.description) {
            return {
                success: false,
                error: 'Name, tagline, and description are required'
            }
        }

        const slug = generateSlug(input.name)

        const product = await prisma.launchpadProduct.create({
            data: {
                slug,
                name: input.name.trim(),
                tagline: input.tagline.trim(),
                description: input.description.trim(),
                logo: input.logo || null,
                coverImage: input.coverImage || null,
                screenshots: input.screenshots || [],
                websiteUrl: input.websiteUrl || null,
                demoUrl: input.demoUrl || null,
                githubUrl: input.githubUrl || null,
                twitterUrl: input.twitterUrl || null,
                category: (input.category as LaunchpadCategory) || 'OTHER',
                tags: input.tags || [],
                features: input.features || undefined,
                techStack: input.techStack || [],
                pricing: input.pricing || null,
                type: 'CODERZ_OFFICIAL',
                status: 'APPROVED', // Auto-approved for admin
                isVerified: true,
                verifiedAt: new Date(),
                verifiedById: adminCheck.userId,
                addedByAdminId: adminCheck.userId,
                isFeatured: input.isFeatured || false,
                featuredOrder: input.featuredOrder || null,
                publishedAt: new Date()
            }
        })

        revalidatePath('/launchpads')
        revalidatePath('/admin/launchpads')

        return {
            success: true,
            data: {
                id: product.id,
                slug: product.slug,
                name: product.name
            }
        }
    } catch (error) {
        console.error('Error creating product:', error)
        return {
            success: false,
            error: 'Failed to create product'
        }
    }
}

// ============================================
// Admin: Update Product
// ============================================

export async function adminUpdateProduct(input: AdminUpdateProductInput) {
    try {
        const adminCheck = await checkAdmin()
        
        if (!adminCheck.isAdmin) {
            return { success: false, error: adminCheck.error }
        }

        const { id, ...updateData } = input

        const product = await prisma.launchpadProduct.update({
            where: { id },
            data: {
                ...(updateData.name && { name: updateData.name.trim() }),
                ...(updateData.tagline && { tagline: updateData.tagline.trim() }),
                ...(updateData.description && { description: updateData.description.trim() }),
                ...(updateData.logo !== undefined && { logo: updateData.logo || null }),
                ...(updateData.coverImage !== undefined && { coverImage: updateData.coverImage || null }),
                ...(updateData.screenshots !== undefined && { screenshots: updateData.screenshots || [] }),
                ...(updateData.websiteUrl !== undefined && { websiteUrl: updateData.websiteUrl || null }),
                ...(updateData.demoUrl !== undefined && { demoUrl: updateData.demoUrl || null }),
                ...(updateData.githubUrl !== undefined && { githubUrl: updateData.githubUrl || null }),
                ...(updateData.twitterUrl !== undefined && { twitterUrl: updateData.twitterUrl || null }),
                ...(updateData.category && { category: updateData.category as LaunchpadCategory }),
                ...(updateData.tags !== undefined && { tags: updateData.tags || [] }),
                ...(updateData.features !== undefined && { features: updateData.features || undefined }),
                ...(updateData.techStack !== undefined && { techStack: updateData.techStack || [] }),
                ...(updateData.pricing !== undefined && { pricing: updateData.pricing || null }),
                ...(updateData.status && { status: updateData.status }),
                ...(updateData.isFeatured !== undefined && { isFeatured: updateData.isFeatured }),
                ...(updateData.featuredOrder !== undefined && { featuredOrder: updateData.featuredOrder })
            }
        })

        revalidatePath('/launchpads')
        revalidatePath('/admin/launchpads')
        revalidatePath(`/launchpads/${product.slug}`)

        return { success: true, data: product }
    } catch (error) {
        console.error('Error updating product:', error)
        return { success: false, error: 'Failed to update product' }
    }
}

// ============================================
// Admin: Delete Product
// ============================================

export async function adminDeleteProduct(productId: string) {
    try {
        const adminCheck = await checkAdmin()
        
        if (!adminCheck.isAdmin) {
            return { success: false, error: adminCheck.error }
        }

        await prisma.launchpadProduct.delete({
            where: { id: productId }
        })

        revalidatePath('/launchpads')
        revalidatePath('/admin/launchpads')

        return { success: true }
    } catch (error) {
        console.error('Error deleting product:', error)
        return { success: false, error: 'Failed to delete product' }
    }
}

// ============================================
// Admin: Verify/Approve Product
// ============================================

export async function adminVerifyProduct(productId: string) {
    try {
        const adminCheck = await checkAdmin()
        
        if (!adminCheck.isAdmin) {
            return { success: false, error: adminCheck.error }
        }

        const product = await prisma.launchpadProduct.update({
            where: { id: productId },
            data: {
                status: 'APPROVED',
                isVerified: true,
                verifiedAt: new Date(),
                verifiedById: adminCheck.userId,
                publishedAt: new Date()
            }
        })

        revalidatePath('/launchpads')
        revalidatePath('/admin/launchpads')
        revalidatePath(`/launchpads/${product.slug}`)

        return { success: true, data: product }
    } catch (error) {
        console.error('Error verifying product:', error)
        return { success: false, error: 'Failed to verify product' }
    }
}

// ============================================
// Admin: Reject Product
// ============================================

export async function adminRejectProduct(productId: string, reason: string) {
    try {
        const adminCheck = await checkAdmin()
        
        if (!adminCheck.isAdmin) {
            return { success: false, error: adminCheck.error }
        }

        const product = await prisma.launchpadProduct.update({
            where: { id: productId },
            data: {
                status: 'REJECTED',
                rejectionReason: reason
            }
        })

        revalidatePath('/admin/launchpads')

        return { success: true, data: product }
    } catch (error) {
        console.error('Error rejecting product:', error)
        return { success: false, error: 'Failed to reject product' }
    }
}

// ============================================
// Admin: Get Pending Products
// ============================================

export async function adminGetPendingProducts() {
    try {
        const adminCheck = await checkAdmin()
        
        if (!adminCheck.isAdmin) {
            return { success: false, error: adminCheck.error }
        }

        const products = await prisma.launchpadProduct.findMany({
            where: {
                status: 'PENDING_REVIEW'
            },
            include: {
                createdBy: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        image: true,
                        email: true
                    }
                }
            },
            orderBy: { createdAt: 'asc' }
        })

        return { success: true, data: products }
    } catch (error) {
        console.error('Error fetching pending products:', error)
        return { success: false, error: 'Failed to fetch pending products' }
    }
}

// ============================================
// Admin: Get All Products (with filters)
// ============================================

export async function adminGetAllProducts(options: {
    type?: LaunchpadProductType
    status?: LaunchpadProductStatus
    search?: string
    limit?: number
    offset?: number
} = {}) {
    try {
        const adminCheck = await checkAdmin()
        
        if (!adminCheck.isAdmin) {
            return { success: false, error: adminCheck.error }
        }

        const { type, status, search, limit = 50, offset = 0 } = options

        const where: any = {}
        if (type) where.type = type
        if (status) where.status = status
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { tagline: { contains: search, mode: 'insensitive' } }
            ]
        }

        const [products, total] = await Promise.all([
            prisma.launchpadProduct.findMany({
                where,
                include: {
                    createdBy: {
                        select: {
                            id: true,
                            name: true,
                            username: true,
                            image: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                take: limit,
                skip: offset
            }),
            prisma.launchpadProduct.count({ where })
        ])

        return { 
            success: true, 
            data: products, 
            total,
            hasMore: offset + products.length < total
        }
    } catch (error) {
        console.error('Error fetching products:', error)
        return { success: false, error: 'Failed to fetch products' }
    }
}

// ============================================
// Admin: Toggle Featured
// ============================================

export async function adminToggleFeatured(productId: string, isFeatured: boolean, featuredOrder?: number) {
    try {
        const adminCheck = await checkAdmin()
        
        if (!adminCheck.isAdmin) {
            return { success: false, error: adminCheck.error }
        }

        const product = await prisma.launchpadProduct.update({
            where: { id: productId },
            data: {
                isFeatured,
                featuredAt: isFeatured ? new Date() : null,
                featuredOrder: isFeatured ? (featuredOrder || 0) : null
            }
        })

        revalidatePath('/launchpads')
        revalidatePath('/admin/launchpads')

        return { success: true, data: product }
    } catch (error) {
        console.error('Error toggling featured:', error)
        return { success: false, error: 'Failed to update featured status' }
    }
}

// ============================================
// Admin: Get Analytics
// ============================================

export async function adminGetLaunchpadAnalytics() {
    try {
        const adminCheck = await checkAdmin()
        
        if (!adminCheck.isAdmin) {
            return { success: false, error: adminCheck.error }
        }

        const [
            totalProducts,
            coderzProducts,
            communityProducts,
            pendingProducts,
            totalViews,
            totalLikes,
            totalComments
        ] = await Promise.all([
            prisma.launchpadProduct.count(),
            prisma.launchpadProduct.count({ where: { type: 'CODERZ_OFFICIAL' } }),
            prisma.launchpadProduct.count({ where: { type: 'COMMUNITY' } }),
            prisma.launchpadProduct.count({ where: { status: 'PENDING_REVIEW' } }),
            prisma.launchpadProduct.aggregate({ _sum: { viewCount: true } }),
            prisma.launchpadProduct.aggregate({ _sum: { likeCount: true } }),
            prisma.launchpadProduct.aggregate({ _sum: { commentCount: true } })
        ])

        return {
            success: true,
            data: {
                totalProducts,
                coderzProducts,
                communityProducts,
                pendingProducts,
                totalViews: totalViews._sum.viewCount || 0,
                totalLikes: totalLikes._sum.likeCount || 0,
                totalComments: totalComments._sum.commentCount || 0
            }
        }
    } catch (error) {
        console.error('Error fetching analytics:', error)
        return { success: false, error: 'Failed to fetch analytics' }
    }
}
