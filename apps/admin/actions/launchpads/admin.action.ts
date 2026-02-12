'use server'

import { auth } from '@repo/auth'
import { prisma } from '@repo/prisma'
import { revalidatePath } from 'next/cache'
import { LaunchpadProductStatus, LaunchpadProductType, LaunchpadCategory } from '@prisma/client'
import cloudinary from '@/utils/cloudinary'

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
// Admin: Upload Image
// ============================================

interface CloudinaryUploadResult {
    secure_url: string;
    public_id: string;
}

export async function adminUploadImage(formData: FormData) {
    try {
        const adminCheck = await checkAdmin()
        
        if (!adminCheck.isAdmin) {
            return { success: false, message: adminCheck.error, url: null }
        }

        const file = formData.get('file') as File
        if (!file) {
            return { success: false, message: 'No file provided', url: null }
        }

        // Validate file type
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
        if (!validTypes.includes(file.type)) {
            return { 
                success: false, 
                message: 'Invalid file type. Please upload JPG, PNG, or WebP images.', 
                url: null 
            }
        }

        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024
        if (file.size > maxSize) {
            return { 
                success: false, 
                message: 'File size too large. Please upload images smaller than 5MB.', 
                url: null 
            }
        }

        // Convert file to buffer
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        // Upload to Cloudinary
        const uploadPromise = new Promise<CloudinaryUploadResult>((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: 'thecoderz/launchpads',
                    transformation: [
                        { width: 512, height: 512, crop: 'fill' },
                        { quality: 'auto:good' },
                        { format: 'auto' }
                    ],
                    timeout: 60000
                },
                (error: Error | undefined, result: CloudinaryUploadResult | undefined) => {
                    if (error) {
                        console.error('Cloudinary upload error:', error)
                        reject(error)
                    } else if (result) {
                        resolve(result as CloudinaryUploadResult)
                    } else {
                        reject(new Error('Upload failed - no result returned'))
                    }
                }
            )
            uploadStream.end(buffer)
        })

        const timeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(() => reject(new Error('Upload timeout')), 90000)
        })

        const result = await Promise.race([uploadPromise, timeoutPromise])

        return {
            success: true,
            message: 'Image uploaded successfully',
            url: result.secure_url,
            publicId: result.public_id
        }
    } catch (error) {
        console.error('Error uploading image:', error)
        return {
            success: false,
            message: 'Failed to upload image. Please try again.',
            url: null
        }
    }
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
