'use server'

import { auth } from '@repo/auth'
import { prisma } from '@repo/prisma'
import { revalidatePath } from 'next/cache'
import { LaunchpadProductStatus, LaunchpadProductType, LaunchpadCategory } from '@prisma/client'

// ============================================
// Types
// ============================================

interface CreateProductInput {
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
}

interface UpdateProductInput extends Partial<CreateProductInput> {
    id: string
}

interface GetProductsOptions {
    type?: LaunchpadProductType
    status?: LaunchpadProductStatus
    category?: LaunchpadCategory
    search?: string
    limit?: number
    offset?: number
    sortBy?: 'recent' | 'popular' | 'trending'
    isFeatured?: boolean
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
// Get Products (Public)
// ============================================

export async function getLaunchpadProducts(options: GetProductsOptions = {}) {
    try {
        const {
            type,
            status = 'APPROVED',
            category,
            search,
            limit = 20,
            offset = 0,
            sortBy = 'recent',
            isFeatured
        } = options

        const where: any = {
            status
        }

        if (type) where.type = type
        if (category) where.category = category
        if (isFeatured !== undefined) where.isFeatured = isFeatured

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { tagline: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
                { tags: { has: search.toLowerCase() } }
            ]
        }

        let orderBy: any = { createdAt: 'desc' }
        if (sortBy === 'popular') orderBy = { viewCount: 'desc' }
        if (sortBy === 'trending') orderBy = [{ likeCount: 'desc' }, { viewCount: 'desc' }]

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
                orderBy,
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
        console.error('Error fetching launchpad products:', error)
        return {
            success: false,
            error: 'Failed to fetch products'
        }
    }
}

// ============================================
// Get Single Product by Slug (Public)
// ============================================

export async function getLaunchpadProductBySlug(slug: string) {
    try {
        const product = await prisma.launchpadProduct.findUnique({
            where: { slug },
            include: {
                createdBy: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        image: true,
                        bio: true
                    }
                },
                comments: {
                    where: { parentId: null, isHidden: false },
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                username: true,
                                image: true
                            }
                        },
                        replies: {
                            where: { isHidden: false },
                            include: {
                                user: {
                                    select: {
                                        id: true,
                                        name: true,
                                        username: true,
                                        image: true
                                    }
                                }
                            },
                            orderBy: { createdAt: 'asc' },
                            take: 5
                        }
                    },
                    orderBy: { createdAt: 'desc' },
                    take: 20
                },
                feedbacks: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                username: true,
                                image: true
                            }
                        }
                    },
                    orderBy: { createdAt: 'desc' },
                    take: 10
                }
            }
        })

        if (!product) {
            return {
                success: false,
                error: 'Product not found'
            }
        }

        // Only return approved or own products
        if (product.status !== 'APPROVED') {
            const session = await auth()
            if (!session?.user?.id || (product.createdById !== session.user.id && product.addedByAdminId !== session.user.id)) {
                return {
                    success: false,
                    error: 'Product not found'
                }
            }
        }

        return {
            success: true,
            data: product
        }
    } catch (error) {
        console.error('Error fetching launchpad product:', error)
        return {
            success: false,
            error: 'Failed to fetch product'
        }
    }
}

// ============================================
// Create Product (User Submission)
// ============================================

export async function createLaunchpadProduct(input: CreateProductInput) {
    try {
        const session = await auth()
        
        if (!session?.user?.id) {
            return {
                success: false,
                error: 'You must be logged in to submit a product'
            }
        }

        // Validate required fields
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
                type: 'COMMUNITY',
                status: 'PENDING_REVIEW',
                createdById: session.user.id
            },
            include: {
                createdBy: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        image: true
                    }
                }
            }
        })

        revalidatePath('/launchpads')

        return {
            success: true,
            product: {
                id: product.id,
                slug: product.slug,
                name: product.name,
                tagline: product.tagline,
                description: product.description,
                logo: product.logo,
                coverImage: product.coverImage,
                category: product.category,
                tags: product.tags,
                techStack: product.techStack,
                websiteUrl: product.websiteUrl,
                demoUrl: product.demoUrl,
                githubUrl: product.githubUrl,
                viewCount: product.viewCount,
                likeCount: product.likeCount,
                commentCount: product.commentCount,
                isFeatured: product.isFeatured,
                type: product.type,
                createdBy: product.createdBy
            },
            data: {
                id: product.id,
                slug: product.slug,
                name: product.name
            }
        }
    } catch (error) {
        console.error('Error creating launchpad product:', error)
        return {
            success: false,
            error: 'Failed to create product'
        }
    }
}

// ============================================
// Track View
// ============================================

export async function trackProductView(productSlug: string, source?: string) {
    try {
        const session = await auth()
        
        const product = await prisma.launchpadProduct.findUnique({
            where: { slug: productSlug },
            select: { id: true }
        })

        if (!product) return { success: false }

        // Create view record
        await prisma.launchpadProductView.create({
            data: {
                productId: product.id,
                viewerId: session?.user?.id || null,
                source: source || 'direct'
            }
        })

        // Increment view count
        await prisma.launchpadProduct.update({
            where: { id: product.id },
            data: { viewCount: { increment: 1 } }
        })

        return { success: true }
    } catch (error) {
        console.error('Error tracking view:', error)
        return { success: false }
    }
}

// ============================================
// Track Link Click
// ============================================

export async function trackProductClick(productSlug: string, linkType: string, targetUrl: string) {
    try {
        const session = await auth()
        
        const product = await prisma.launchpadProduct.findUnique({
            where: { slug: productSlug },
            select: { id: true }
        })

        if (!product) return { success: false }

        // Create click record
        await prisma.launchpadProductClick.create({
            data: {
                productId: product.id,
                clickerId: session?.user?.id || null,
                linkType,
                targetUrl
            }
        })

        // Increment click count
        await prisma.launchpadProduct.update({
            where: { id: product.id },
            data: { linkClickCount: { increment: 1 } }
        })

        return { success: true }
    } catch (error) {
        console.error('Error tracking click:', error)
        return { success: false }
    }
}

// ============================================
// Like Product
// ============================================

export async function likeProduct(productSlug: string) {
    try {
        const session = await auth()
        
        if (!session?.user?.id) {
            return {
                success: false,
                error: 'You must be logged in to like a product'
            }
        }

        const product = await prisma.launchpadProduct.findUnique({
            where: { slug: productSlug },
            select: { id: true }
        })

        if (!product) {
            return { success: false, error: 'Product not found' }
        }

        // Check if already liked
        const existingLike = await prisma.launchpadProductLike.findUnique({
            where: {
                productId_userId: {
                    productId: product.id,
                    userId: session.user.id
                }
            }
        })

        if (existingLike) {
            // Unlike
            await prisma.launchpadProductLike.delete({
                where: { id: existingLike.id }
            })

            await prisma.launchpadProduct.update({
                where: { id: product.id },
                data: { likeCount: { decrement: 1 } }
            })

            return { success: true, liked: false }
        }

        // Remove dislike if exists
        const existingDislike = await prisma.launchpadProductDislike.findUnique({
            where: {
                productId_userId: {
                    productId: product.id,
                    userId: session.user.id
                }
            }
        })

        if (existingDislike) {
            await prisma.launchpadProductDislike.delete({
                where: { id: existingDislike.id }
            })

            await prisma.launchpadProduct.update({
                where: { id: product.id },
                data: { dislikeCount: { decrement: 1 } }
            })
        }

        // Create like
        await prisma.launchpadProductLike.create({
            data: {
                productId: product.id,
                userId: session.user.id
            }
        })

        await prisma.launchpadProduct.update({
            where: { id: product.id },
            data: { likeCount: { increment: 1 } }
        })

        revalidatePath(`/launchpads/${productSlug}`)

        return { success: true, liked: true }
    } catch (error) {
        console.error('Error liking product:', error)
        return { success: false, error: 'Failed to like product' }
    }
}

// ============================================
// Dislike Product
// ============================================

export async function dislikeProduct(productSlug: string) {
    try {
        const session = await auth()
        
        if (!session?.user?.id) {
            return {
                success: false,
                error: 'You must be logged in to dislike a product'
            }
        }

        const product = await prisma.launchpadProduct.findUnique({
            where: { slug: productSlug },
            select: { id: true }
        })

        if (!product) {
            return { success: false, error: 'Product not found' }
        }

        // Check if already disliked
        const existingDislike = await prisma.launchpadProductDislike.findUnique({
            where: {
                productId_userId: {
                    productId: product.id,
                    userId: session.user.id
                }
            }
        })

        if (existingDislike) {
            // Remove dislike
            await prisma.launchpadProductDislike.delete({
                where: { id: existingDislike.id }
            })

            await prisma.launchpadProduct.update({
                where: { id: product.id },
                data: { dislikeCount: { decrement: 1 } }
            })

            return { success: true, disliked: false }
        }

        // Remove like if exists
        const existingLike = await prisma.launchpadProductLike.findUnique({
            where: {
                productId_userId: {
                    productId: product.id,
                    userId: session.user.id
                }
            }
        })

        if (existingLike) {
            await prisma.launchpadProductLike.delete({
                where: { id: existingLike.id }
            })

            await prisma.launchpadProduct.update({
                where: { id: product.id },
                data: { likeCount: { decrement: 1 } }
            })
        }

        // Create dislike
        await prisma.launchpadProductDislike.create({
            data: {
                productId: product.id,
                userId: session.user.id
            }
        })

        await prisma.launchpadProduct.update({
            where: { id: product.id },
            data: { dislikeCount: { increment: 1 } }
        })

        revalidatePath(`/launchpads/${productSlug}`)

        return { success: true, disliked: true }
    } catch (error) {
        console.error('Error disliking product:', error)
        return { success: false, error: 'Failed to dislike product' }
    }
}

// ============================================
// Get User Reaction Status
// ============================================

export async function getUserProductReaction(productSlug: string) {
    try {
        const session = await auth()
        
        if (!session?.user?.id) {
            return { success: true, liked: false, disliked: false }
        }

        const product = await prisma.launchpadProduct.findUnique({
            where: { slug: productSlug },
            select: { id: true }
        })

        if (!product) {
            return { success: false, error: 'Product not found' }
        }

        const [like, dislike] = await Promise.all([
            prisma.launchpadProductLike.findUnique({
                where: {
                    productId_userId: {
                        productId: product.id,
                        userId: session.user.id
                    }
                }
            }),
            prisma.launchpadProductDislike.findUnique({
                where: {
                    productId_userId: {
                        productId: product.id,
                        userId: session.user.id
                    }
                }
            })
        ])

        return {
            success: true,
            liked: !!like,
            disliked: !!dislike
        }
    } catch (error) {
        console.error('Error getting user reaction:', error)
        return { success: false, error: 'Failed to get reaction status' }
    }
}

// ============================================
// Add Comment
// ============================================

export async function addProductComment(productSlug: string, content: string, parentId?: string) {
    try {
        const session = await auth()
        
        if (!session?.user?.id) {
            return {
                success: false,
                error: 'You must be logged in to comment'
            }
        }

        if (!content || content.trim().length < 2) {
            return {
                success: false,
                error: 'Comment must be at least 2 characters'
            }
        }

        const product = await prisma.launchpadProduct.findUnique({
            where: { slug: productSlug },
            select: { id: true }
        })

        if (!product) {
            return { success: false, error: 'Product not found' }
        }

        const comment = await prisma.launchpadProductComment.create({
            data: {
                productId: product.id,
                userId: session.user.id,
                content: content.trim(),
                parentId: parentId || null
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        image: true
                    }
                }
            }
        })

        // Update comment count
        await prisma.launchpadProduct.update({
            where: { id: product.id },
            data: { commentCount: { increment: 1 } }
        })

        revalidatePath(`/launchpads/${productSlug}`)

        return { success: true, data: comment }
    } catch (error) {
        console.error('Error adding comment:', error)
        return { success: false, error: 'Failed to add comment' }
    }
}

// ============================================
// Add Feedback
// ============================================

export async function addProductFeedback(
    productSlug: string, 
    data: { rating: number; title?: string; content?: string; pros?: string[]; cons?: string[] }
) {
    try {
        const session = await auth()
        
        if (!session?.user?.id) {
            return {
                success: false,
                error: 'You must be logged in to submit feedback'
            }
        }

        if (!data.rating || data.rating < 1 || data.rating > 5) {
            return {
                success: false,
                error: 'Rating must be between 1 and 5'
            }
        }

        const product = await prisma.launchpadProduct.findUnique({
            where: { slug: productSlug },
            select: { id: true }
        })

        if (!product) {
            return { success: false, error: 'Product not found' }
        }

        // Upsert feedback (one per user per product)
        const feedback = await prisma.launchpadProductFeedback.upsert({
            where: {
                productId_userId: {
                    productId: product.id,
                    userId: session.user.id
                }
            },
            update: {
                rating: data.rating,
                title: data.title || null,
                content: data.content || null,
                pros: data.pros || [],
                cons: data.cons || []
            },
            create: {
                productId: product.id,
                userId: session.user.id,
                rating: data.rating,
                title: data.title || null,
                content: data.content || null,
                pros: data.pros || [],
                cons: data.cons || []
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        image: true
                    }
                }
            }
        })

        revalidatePath(`/launchpads/${productSlug}`)

        return { success: true, data: feedback }
    } catch (error) {
        console.error('Error adding feedback:', error)
        return { success: false, error: 'Failed to add feedback' }
    }
}

// ============================================
// Get Featured Products
// ============================================

export async function getFeaturedProducts(limit: number = 5) {
    try {
        const products = await prisma.launchpadProduct.findMany({
            where: {
                status: 'APPROVED',
                isFeatured: true
            },
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
            orderBy: { featuredOrder: 'asc' },
            take: limit
        })

        return { success: true, data: products }
    } catch (error) {
        console.error('Error fetching featured products:', error)
        return { success: false, error: 'Failed to fetch featured products' }
    }
}

// ============================================
// Get Coderz Official Products
// ============================================

export async function getCoderzProducts(limit: number = 10) {
    try {
        const products = await prisma.launchpadProduct.findMany({
            where: {
                type: 'CODERZ_OFFICIAL',
                status: 'APPROVED'
            },
            orderBy: { featuredOrder: 'asc' },
            take: limit
        })

        return { success: true, data: products }
    } catch (error) {
        console.error('Error fetching Coderz products:', error)
        return { success: false, error: 'Failed to fetch products' }
    }
}

// ============================================
// Get Community Products
// ============================================

export async function getCommunityProducts(limit: number = 10, offset: number = 0) {
    try {
        const [products, total] = await Promise.all([
            prisma.launchpadProduct.findMany({
                where: {
                    type: 'COMMUNITY',
                    status: 'APPROVED'
                },
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
            prisma.launchpadProduct.count({
                where: {
                    type: 'COMMUNITY',
                    status: 'APPROVED'
                }
            })
        ])

        return { 
            success: true, 
            data: products, 
            total,
            hasMore: offset + products.length < total
        }
    } catch (error) {
        console.error('Error fetching community products:', error)
        return { success: false, error: 'Failed to fetch products' }
    }
}
