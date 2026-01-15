'use server'

import { prisma } from "@repo/prisma"
import { getServerSession } from '@repo/auth'
import { authOptions } from '@repo/auth'
import { revalidatePath } from "next/cache"
import { CommunityPostType, CommunityRole } from "@repo/prisma/client"

// ==================== TYPES ====================
export interface CreatePostInput {
    communityId: string
    channelId?: string
    officialChannel?: string
    title?: string
    content: string
    type?: CommunityPostType
    attachments?: {
        type: string
        url: string
        name?: string
        description?: string
        code?: string
        language?: string
    }[]
    embeds?: Record<string, unknown>[]
    codeBlocks?: {
        code: string
        language: string
    }[]
    tags?: string[]
}

export interface UpdatePostInput {
    title?: string
    content?: string
    tags?: string[]
}

// ==================== POST CRUD ====================

// Create a new post
export async function createPost(input: CreatePostInput) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" }
        }

        // Official channel posts (global posts without community)
        if (input.officialChannel && !input.communityId) {
            const post = await prisma.communityPost.create({
                data: {
                    communityId: null,
                    channelId: null,
                    authorId: session.user.id,
                    title: input.title,
                    content: input.content,
                    type: input.type || 'DISCUSSION',
                    officialChannel: input.officialChannel,
                    attachments: input.attachments as unknown as object | undefined,
                    embeds: input.embeds as unknown as object | undefined,
                    codeBlocks: input.codeBlocks as unknown as object | undefined,
                    tags: input.tags || []
                },
                include: {
                    author: {
                        select: {
                            id: true,
                            name: true,
                            username: true,
                            image: true
                        }
                    },
                    _count: {
                        select: { likes: true, comments: true }
                    }
                }
            })

            revalidatePath(`/communities/channel/${input.officialChannel}`)
            return { success: true, data: post }
        }

        // Community posts - require membership
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
            return { success: false, error: "You must be a member to post" }
        }

        // If posting to announcements channel, check role
        if (input.channelId) {
            const channel = await prisma.communityChannel.findUnique({
                where: { id: input.channelId }
            })

            if (channel?.type === 'ANNOUNCEMENTS') {
                if (!['OWNER', 'ADMIN'].includes(membership.role)) {
                    return { success: false, error: "Only admins can post announcements" }
                }
            }
        }

        const post = await prisma.communityPost.create({
            data: {
                communityId: input.communityId,
                channelId: input.channelId,
                authorId: session.user.id,
                title: input.title,
                content: input.content,
                type: input.type || 'DISCUSSION',
                attachments: input.attachments as unknown as object | undefined,
                embeds: input.embeds as unknown as object | undefined,
                codeBlocks: input.codeBlocks as unknown as object | undefined,
                tags: input.tags || []
            },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        image: true
                    }
                },
                _count: {
                    select: { likes: true, comments: true }
                }
            }
        })

        // Update counts and leaderboard
        await Promise.all([
            prisma.community.update({
                where: { id: input.communityId },
                data: { postCount: { increment: 1 } }
            }),
            prisma.communityMember.update({
                where: { communityId_userId: { communityId: input.communityId, userId: session.user.id } },
                data: { postCount: { increment: 1 } }
            })
        ])

        // Update leaderboard points (non-blocking)
        updateLeaderboardPoints(input.communityId, session.user.id, 'post', 1).catch(console.error)

        revalidatePath(`/community/${membership.community.slug}`)
        return { success: true, data: post }
    } catch (error) {
        console.error('Error creating post:', error)
        return { success: false, error: "Failed to create post" }
    }
}

// Get posts for a community
export async function getCommunityPosts(communityId: string, options?: {
    channelId?: string
    type?: CommunityPostType
    isPinned?: boolean
    limit?: number
    cursor?: string
    sortBy?: 'latest' | 'popular' | 'trending'
}) {
    try {
        const { channelId, type, isPinned, limit = 20, cursor, sortBy = 'latest' } = options || {}

        const where = {
            communityId,
            ...(channelId && { channelId }),
            ...(type && { type }),
            ...(isPinned !== undefined && { isPinned })
        }

        const orderBy = sortBy === 'popular'
            ? [{ likeCount: 'desc' as const }, { createdAt: 'desc' as const }]
            : sortBy === 'trending'
                ? [{ commentCount: 'desc' as const }, { likeCount: 'desc' as const }]
                : [{ createdAt: 'desc' as const }]

        const posts = await prisma.communityPost.findMany({
            where,
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        image: true
                    }
                },
                channel: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        icon: true
                    }
                },
                _count: {
                    select: { likes: true, comments: true }
                }
            },
            orderBy,
            take: limit + 1,
            ...(cursor && { cursor: { id: cursor }, skip: 1 })
        })

        const hasMore = posts.length > limit
        const items = hasMore ? posts.slice(0, -1) : posts

        // Check if current user has liked
        const session = await getServerSession(authOptions)
        let userLikes: string[] = []

        if (session?.user?.id) {
            const likes = await prisma.communityPostLike.findMany({
                where: {
                    postId: { in: items.map(p => p.id) },
                    userId: session.user.id
                },
                select: { postId: true }
            })
            userLikes = likes.map(l => l.postId)
        }

        const postsWithUserData = items.map(post => ({
            ...post,
            isLiked: userLikes.includes(post.id)
        }))

        return {
            success: true,
            data: postsWithUserData,
            nextCursor: hasMore ? items[items.length - 1]?.id : undefined
        }
    } catch (error) {
        console.error('Error fetching posts:', error)
        return { success: false, error: "Failed to fetch posts" }
    }
}

// Get single post with comments
export async function getPost(postId: string) {
    try {
        const session = await getServerSession(authOptions)

        const post = await prisma.communityPost.findUnique({
            where: { id: postId },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        image: true,
                        bio: true
                    }
                },
                channel: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        icon: true
                    }
                },
                community: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        logo: true
                    }
                },
                comments: {
                    where: { parentId: null }, // Only top-level comments
                    include: {
                        author: {
                            select: {
                                id: true,
                                name: true,
                                username: true,
                                image: true
                            }
                        },
                        replies: {
                            include: {
                                author: {
                                    select: {
                                        id: true,
                                        name: true,
                                        username: true,
                                        image: true
                                    }
                                },
                                _count: {
                                    select: { likes: true }
                                }
                            },
                            orderBy: { createdAt: 'asc' }
                        },
                        _count: {
                            select: { likes: true, replies: true }
                        }
                    },
                    orderBy: [{ isAccepted: 'desc' }, { likeCount: 'desc' }, { createdAt: 'asc' }],
                    take: 50
                },
                _count: {
                    select: { likes: true, comments: true }
                }
            }
        })

        if (!post) {
            return { success: false, error: "Post not found" }
        }

        // Increment view count
        await prisma.communityPost.update({
            where: { id: postId },
            data: { viewCount: { increment: 1 } }
        })

        // Check if user liked the post
        let isLiked = false
        if (session?.user?.id) {
            const like = await prisma.communityPostLike.findUnique({
                where: {
                    postId_userId: {
                        postId,
                        userId: session.user.id
                    }
                }
            })
            isLiked = !!like
        }

        return { success: true, data: { ...post, isLiked } }
    } catch (error) {
        console.error('Error fetching post:', error)
        return { success: false, error: "Failed to fetch post" }
    }
}

// Update post
export async function updatePost(postId: string, input: UpdatePostInput) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" }
        }

        const post = await prisma.communityPost.findUnique({
            where: { id: postId },
            include: { community: true }
        })

        if (!post) {
            return { success: false, error: "Post not found" }
        }

        // Check if user is author or admin
        if (post.authorId !== session.user.id) {
            const membership = await prisma.communityMember.findUnique({
                where: {
                    communityId_userId: {
                        communityId: post.communityId ?? '',
                        userId: session.user.id
                    }
                }
            })

            if (!membership || !['OWNER', 'ADMIN', 'MODERATOR'].includes(membership.role)) {
                return { success: false, error: "You don't have permission" }
            }
        }

        const updatedPost = await prisma.communityPost.update({
            where: { id: postId },
            data: {
                ...input,
                isEdited: true,
                editedAt: new Date()
            }
        })

        revalidatePath(`/community/${post.community?.slug ?? 'unknown-community'}`)
        return { success: true, data: updatedPost }
    } catch (error) {
        console.error('Error updating post:', error)
        return { success: false, error: "Failed to update post" }
    }
}

// Delete post
export async function deletePost(postId: string) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" }
        }

        const post = await prisma.communityPost.findUnique({
            where: { id: postId },
            include: { community: true }
        })

        if (!post) {
            return { success: false, error: "Post not found" }
        }

        // Check if user is author or admin
        if (post.authorId !== session.user.id) {
            const membership = await prisma.communityMember.findUnique({
                where: {
                    communityId_userId: {
                        communityId: post.communityId ?? '',
                        userId: session.user.id
                    }
                }
            })

            if (!membership || !['OWNER', 'ADMIN', 'MODERATOR'].includes(membership.role)) {
                return { success: false, error: "You don't have permission" }
            }
        }

        await prisma.communityPost.delete({
            where: { id: postId }
        })

        // Update counts
        await prisma.community.update({
            where: {
                id: post.communityId ?? ''
            },
            data: { postCount: { decrement: 1 } }
        })

        revalidatePath(`/community/${post.community?.slug ?? 'unknown-community'}`)
        return { success: true }
    } catch (error) {
        console.error('Error deleting post:', error)
        return { success: false, error: "Failed to delete post" }
    }
}

// Pin/Unpin post (admin only)
export async function togglePinPost(postId: string) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" }
        }

        const post = await prisma.communityPost.findUnique({
            where: { id: postId }
        })

        if (!post) {
            return { success: false, error: "Post not found" }
        }

        // Check admin permission
        const membership = await prisma.communityMember.findUnique({
            where: {
                communityId_userId: {
                    communityId: post.communityId ?? '',
                    userId: session.user.id
                }
            }
        })

        if (!membership || !['OWNER', 'ADMIN', 'MODERATOR'].includes(membership.role)) {
            return { success: false, error: "Only admins can pin posts" }
        }

        const updatedPost = await prisma.communityPost.update({
            where: { id: postId },
            data: { isPinned: !post.isPinned }
        })

        return { success: true, data: updatedPost }
    } catch (error) {
        console.error('Error toggling pin:', error)
        return { success: false, error: "Failed to update post" }
    }
}

// ==================== LIKES ====================

// Like/Unlike post
export async function togglePostLike(postId: string) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" }
        }

        const existingLike = await prisma.communityPostLike.findUnique({
            where: {
                postId_userId: {
                    postId,
                    userId: session.user.id
                }
            }
        })

        if (existingLike) {
            // Unlike
            await prisma.communityPostLike.delete({
                where: { id: existingLike.id }
            })
            await prisma.communityPost.update({
                where: { id: postId },
                data: { likeCount: { decrement: 1 } }
            })
            return { success: true, liked: false }
        } else {
            // Like
            await prisma.communityPostLike.create({
                data: {
                    postId,
                    userId: session.user.id
                }
            })
            await prisma.communityPost.update({
                where: { id: postId },
                data: { likeCount: { increment: 1 } }
            })
            return { success: true, liked: true }
        }
    } catch (error) {
        console.error('Error toggling like:', error)
        return { success: false, error: "Failed to update like" }
    }
}

// ==================== COMMENTS ====================

// Create a comment
export async function createComment(postId: string, content: string, parentId?: string) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" }
        }

        const post = await prisma.communityPost.findUnique({
            where: { id: postId },
            include: { community: true }
        })

        if (!post) {
            return { success: false, error: "Post not found" }
        }

        if (post.isLocked) {
            return { success: false, error: "This post is locked" }
        }

        const comment = await prisma.communityComment.create({
            data: {
                postId,
                authorId: session.user.id,
                content,
                parentId
            },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        image: true
                    }
                },
                _count: {
                    select: { likes: true, replies: true }
                }
            }
        })

        // Update comment count
        await prisma.communityPost.update({
            where: { id: postId },
            data: { commentCount: { increment: 1 } }
        })

        // Update leaderboard points if in a community
        if (post.communityId) {
            updateLeaderboardPoints(post.communityId, session.user.id, 'comment', 1).catch(console.error)
        }

        return { success: true, data: comment }
    } catch (error) {
        console.error('Error creating comment:', error)
        return { success: false, error: "Failed to create comment" }
    }
}

// Toggle comment like
export async function toggleCommentLike(commentId: string) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" }
        }

        const existingLike = await prisma.communityCommentLike.findUnique({
            where: {
                commentId_userId: {
                    commentId,
                    userId: session.user.id
                }
            }
        })

        if (existingLike) {
            await prisma.communityCommentLike.delete({
                where: { id: existingLike.id }
            })
            await prisma.communityComment.update({
                where: { id: commentId },
                data: { likeCount: { decrement: 1 } }
            })
            return { success: true, liked: false }
        } else {
            await prisma.communityCommentLike.create({
                data: {
                    commentId,
                    userId: session.user.id
                }
            })
            await prisma.communityComment.update({
                where: { id: commentId },
                data: { likeCount: { increment: 1 } }
            })
            return { success: true, liked: true }
        }
    } catch (error) {
        console.error('Error toggling comment like:', error)
        return { success: false, error: "Failed to update like" }
    }
}

// ==================== Q&A SPECIFIC ====================

// Mark answer as accepted (for Q&A posts)
export async function acceptAnswer(postId: string, commentId: string) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" }
        }

        const post = await prisma.communityPost.findUnique({
            where: { id: postId }
        })

        if (!post) {
            return { success: false, error: "Post not found" }
        }

        // Only post author can accept answers
        if (post.authorId !== session.user.id) {
            return { success: false, error: "Only the question author can accept answers" }
        }

        // Unmark any previously accepted answer
        await prisma.communityComment.updateMany({
            where: { postId, isAccepted: true },
            data: { isAccepted: false }
        })

        // Mark new answer as accepted
        await prisma.communityComment.update({
            where: { id: commentId },
            data: { isAccepted: true }
        })

        // Mark question as answered
        await prisma.communityPost.update({
            where: { id: postId },
            data: { isAnswered: true, acceptedAnswerId: commentId }
        })

        return { success: true }
    } catch (error) {
        console.error('Error accepting answer:', error)
        return { success: false, error: "Failed to accept answer" }
    }
}

// Get trending posts (most engagement)
export async function getTrendingPosts(options?: {
    limit?: number
    cursor?: string
    timeRange?: 'today' | 'week' | 'month' | 'all'
}) {
    try {
        const session = await getServerSession(authOptions)
        const { limit = 20, cursor, timeRange = 'week' } = options || {}

        // Calculate date filter
        const now = new Date()
        let dateFilter: Date | undefined
        switch (timeRange) {
            case 'today':
                dateFilter = new Date(now.setHours(0, 0, 0, 0))
                break
            case 'week':
                dateFilter = new Date(now.setDate(now.getDate() - 7))
                break
            case 'month':
                dateFilter = new Date(now.setMonth(now.getMonth() - 1))
                break
            default:
                dateFilter = undefined
        }

        const where = dateFilter
            ? { createdAt: { gte: dateFilter } }
            : {}

        const posts = await prisma.communityPost.findMany({
            where,
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        image: true
                    }
                },
                community: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        logo: true
                    }
                },
                channel: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        icon: true
                    }
                },
                _count: {
                    select: { likes: true, comments: true }
                }
            },
            orderBy: [
                { likeCount: 'desc' },
                { commentCount: 'desc' },
                { viewCount: 'desc' },
                { createdAt: 'desc' }
            ],
            take: limit + 1,
            ...(cursor && { cursor: { id: cursor }, skip: 1 })
        })

        const hasMore = posts.length > limit
        const items = hasMore ? posts.slice(0, -1) : posts

        // Check if user liked posts
        let userLikes: string[] = []
        if (session?.user?.id) {
            const likes = await prisma.communityPostLike.findMany({
                where: {
                    postId: { in: items.map(p => p.id) },
                    userId: session.user.id
                },
                select: { postId: true }
            })
            userLikes = likes.map(l => l.postId)
        }

        const postsWithUserData = items.map(post => ({
            ...post,
            isLiked: userLikes.includes(post.id)
        }))

        return {
            success: true,
            data: postsWithUserData,
            nextCursor: hasMore ? items[items.length - 1]?.id : undefined
        }
    } catch (error) {
        console.error('Error fetching trending posts:', error)
        return { success: false, error: "Failed to fetch trending posts" }
    }
}

// Get posts from users the current user follows
export async function getFollowingFeed(options?: {
    limit?: number
    cursor?: string
}) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" }
        }

        const { limit = 20, cursor } = options || {}

        // Get users the current user follows
        const following = await prisma.userFollow.findMany({
            where: { followerId: session.user.id },
            select: { followingId: true }
        })

        const followingIds = following.map(f => f.followingId)

        if (followingIds.length === 0) {
            return { success: true, data: [], nextCursor: undefined }
        }

        const posts = await prisma.communityPost.findMany({
            where: {
                authorId: { in: followingIds }
            },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        image: true
                    }
                },
                community: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        logo: true
                    }
                },
                channel: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        icon: true
                    }
                },
                _count: {
                    select: { likes: true, comments: true }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: limit + 1,
            ...(cursor && { cursor: { id: cursor }, skip: 1 })
        })

        const hasMore = posts.length > limit
        const items = hasMore ? posts.slice(0, -1) : posts

        // Check if user liked posts
        const likes = await prisma.communityPostLike.findMany({
            where: {
                postId: { in: items.map(p => p.id) },
                userId: session.user.id
            },
            select: { postId: true }
        })
        const userLikes = likes.map(l => l.postId)

        const postsWithUserData = items.map(post => ({
            ...post,
            isLiked: userLikes.includes(post.id)
        }))

        return {
            success: true,
            data: postsWithUserData,
            nextCursor: hasMore ? items[items.length - 1]?.id : undefined
        }
    } catch (error) {
        console.error('Error fetching following feed:', error)
        return { success: false, error: "Failed to fetch following feed" }
    }
}

// Get global feed (all communities user has joined)
export async function getGlobalFeed(options?: {
    limit?: number
    cursor?: string
}) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" }
        }

        const { limit = 20, cursor } = options || {}

        // Get user's communities
        const memberships = await prisma.communityMember.findMany({
            where: {
                userId: session.user.id,
                isApproved: true
            },
            select: { communityId: true }
        })

        const communityIds = memberships.map(m => m.communityId)

        if (communityIds.length === 0) {
            return { success: true, data: [], nextCursor: undefined }
        }

        const posts = await prisma.communityPost.findMany({
            where: {
                communityId: { in: communityIds }
            },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        image: true
                    }
                },
                community: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        logo: true
                    }
                },
                channel: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        icon: true
                    }
                },
                _count: {
                    select: { likes: true, comments: true }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: limit + 1,
            ...(cursor && { cursor: { id: cursor }, skip: 1 })
        })

        const hasMore = posts.length > limit
        const items = hasMore ? posts.slice(0, -1) : posts

        // Check if user liked posts
        const likes = await prisma.communityPostLike.findMany({
            where: {
                postId: { in: items.map(p => p.id) },
                userId: session.user.id
            },
            select: { postId: true }
        })
        const userLikes = likes.map(l => l.postId)

        const postsWithUserData = items.map(post => ({
            ...post,
            isLiked: userLikes.includes(post.id)
        }))

        return {
            success: true,
            data: postsWithUserData,
            nextCursor: hasMore ? items[items.length - 1]?.id : undefined
        }
    } catch (error) {
        console.error('Error fetching global feed:', error)
        return { success: false, error: "Failed to fetch feed" }
    }
}

// ==================== QUIZ GENERATION ====================
interface GenerateQuizInput {
    title: string
    description?: string
    questionCount: number
    level: 'EASY' | 'MEDIUM' | 'HARD'
}

interface QuizQuestion {
    id: string
    text: string
    type: 'single' | 'multiple'
    options: Array<{
        id: string
        text: string
        isCorrect: boolean
    }>
    explanation?: string
    difficulty: string
}

export async function generateQuiz(input: GenerateQuizInput) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" }
        }

        const { title, description, questionCount, level } = input

        if (!title) {
            return { success: false, error: "Title is required" }
        }

        // Import OpenAI dynamically
        const OpenAI = (await import('openai')).default
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        })

        const prompt = `Generate a quiz about "${title}"${description ? ` (${description})` : ''}.
        
Requirements:
- Generate exactly ${questionCount || 5} multiple choice questions
- Difficulty level: ${level || 'MEDIUM'}
- Each question should have 4 options with exactly 1 correct answer
- Include a brief explanation for each answer

Return the response as a JSON array with the following structure for each question:
{
    "id": "q1",
    "text": "Question text here?",
    "type": "single",
    "options": [
        { "id": "a", "text": "Option A", "isCorrect": false },
        { "id": "b", "text": "Option B", "isCorrect": true },
        { "id": "c", "text": "Option C", "isCorrect": false },
        { "id": "d", "text": "Option D", "isCorrect": false }
    ],
    "explanation": "Brief explanation of why the correct answer is correct",
    "difficulty": "${level}"
}

Only return the JSON array, no additional text.`

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: 'You are a helpful assistant that generates quiz questions. Always return valid JSON arrays.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature: 0.7,
            max_tokens: 4000
        })

        const content = completion.choices[0]?.message?.content || '[]'

        // Parse the response
        let questions: QuizQuestion[]
        try {
            const cleanedContent = content
                .replace(/```json\n?/g, '')
                .replace(/```\n?/g, '')
                .trim()
            questions = JSON.parse(cleanedContent)
        } catch {
            return { success: false, error: "Failed to parse quiz questions" }
        }

        if (!Array.isArray(questions) || questions.length === 0) {
            return { success: false, error: "No questions generated" }
        }

        // Add IDs if missing
        questions = questions.map((q, index) => ({
            ...q,
            id: q.id || `q${index + 1}`,
            difficulty: q.difficulty || level
        }))

        return { success: true, data: { questions } }
    } catch (error) {
        console.error('Quiz generation error:', error)
        return { success: false, error: "Failed to generate quiz" }
    }
}

// ==================== LEADERBOARD ====================

// Point values for different activities
const POINT_VALUES = {
    POST: 1,
    COMMENT: 1,
    QUIZ_BASE: 0, // Quizzes give points based on correct answers
    QUIZ_CORRECT_ANSWER: 1,
    PEER_MOCK: 2,
    HELP_RESOLVED: 2
}

// Helper function to update or create leaderboard entry
async function updateLeaderboardPoints(
    communityId: string,
    userId: string,
    pointType: 'post' | 'comment' | 'quiz' | 'peer_mock' | 'help',
    points: number = 1,
    extraData?: { questionsCorrect?: number, quizzesCompleted?: number }
) {
    try {
        const existing = await prisma.communityLeaderboard.findUnique({
            where: {
                communityId_userId: {
                    communityId,
                    userId
                }
            }
        })

        if (existing) {
            // Update existing entry
            const updateData: Record<string, unknown> = {
                totalPoints: { increment: points }
            }

            switch (pointType) {
                case 'post':
                    updateData.postPoints = { increment: points }
                    updateData.postsCount = { increment: 1 }
                    break
                case 'comment':
                    updateData.commentPoints = { increment: points }
                    updateData.commentsCount = { increment: 1 }
                    break
                case 'quiz':
                    updateData.quizPoints = { increment: points }
                    if (extraData?.quizzesCompleted) {
                        updateData.quizzesCompleted = { increment: extraData.quizzesCompleted }
                    }
                    if (extraData?.questionsCorrect) {
                        updateData.questionsCorrect = { increment: extraData.questionsCorrect }
                    }
                    break
                case 'peer_mock':
                    updateData.peerMockPoints = { increment: points }
                    updateData.peerSessionsCount = { increment: 1 }
                    break
                case 'help':
                    updateData.helpPoints = { increment: points }
                    updateData.helpRequestsSolved = { increment: 1 }
                    break
            }

            await prisma.communityLeaderboard.update({
                where: { id: existing.id },
                data: updateData
            })
        } else {
            // Create new entry
            const createData: Record<string, unknown> = {
                communityId,
                userId,
                totalPoints: points
            }

            switch (pointType) {
                case 'post':
                    createData.postPoints = points
                    createData.postsCount = 1
                    break
                case 'comment':
                    createData.commentPoints = points
                    createData.commentsCount = 1
                    break
                case 'quiz':
                    createData.quizPoints = points
                    createData.quizzesCompleted = extraData?.quizzesCompleted || 1
                    createData.questionsCorrect = extraData?.questionsCorrect || 0
                    break
                case 'peer_mock':
                    createData.peerMockPoints = points
                    createData.peerSessionsCount = 1
                    break
                case 'help':
                    createData.helpPoints = points
                    createData.helpRequestsSolved = 1
                    break
            }

            await prisma.communityLeaderboard.create({
                data: createData as {
                    communityId: string
                    userId: string
                    totalPoints: number
                    postPoints?: number
                    commentPoints?: number
                    quizPoints?: number
                    peerMockPoints?: number
                    helpPoints?: number
                    postsCount?: number
                    commentsCount?: number
                    quizzesCompleted?: number
                    questionsCorrect?: number
                    peerSessionsCount?: number
                    helpRequestsSolved?: number
                }
            })
        }
    } catch (error) {
        console.error('Error updating leaderboard points:', error)
    }
}

// Get community leaderboard
export async function getCommunityLeaderboard(
    communityId: string,
    options?: {
        limit?: number
        page?: number
    }
) {
    try {
        const session = await getServerSession(authOptions)
        const { limit = 100, page = 1 } = options || {}

        const [leaderboard, total] = await Promise.all([
            prisma.communityLeaderboard.findMany({
                where: { communityId },
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
                orderBy: { totalPoints: 'desc' },
                take: limit,
                skip: (page - 1) * limit
            }),
            prisma.communityLeaderboard.count({ where: { communityId } })
        ])

        // Add rank to each entry
        const rankedLeaderboard = leaderboard.map((entry, index) => ({
            ...entry,
            rank: (page - 1) * limit + index + 1
        }))

        // Get current user's position if logged in
        let currentUserEntry = null
        if (session?.user?.id) {
            const userEntry = await prisma.communityLeaderboard.findUnique({
                where: {
                    communityId_userId: {
                        communityId,
                        userId: session.user.id
                    }
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

            if (userEntry) {
                // Calculate rank
                const rank = await prisma.communityLeaderboard.count({
                    where: {
                        communityId,
                        totalPoints: { gt: userEntry.totalPoints }
                    }
                })
                currentUserEntry = { ...userEntry, rank: rank + 1 }
            }
        }

        return {
            success: true,
            data: {
                leaderboard: rankedLeaderboard,
                total,
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                currentUser: currentUserEntry
            }
        }
    } catch (error) {
        console.error('Error fetching leaderboard:', error)
        return { success: false, error: "Failed to fetch leaderboard" }
    }
}

// Submit quiz attempt and award points
export async function submitQuizAttempt(
    postId: string,
    answers: { questionId: string, answer: string | string[], isCorrect: boolean }[],
    totalTimeTaken: number
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" }
        }

        // Get the post to find community
        const post = await prisma.communityPost.findUnique({
            where: { id: postId },
            select: { communityId: true }
        })

        if (!post) {
            return { success: false, error: "Post not found" }
        }

        // Check if already attempted
        const existingAttempt = await prisma.communityQuizAttempt.findUnique({
            where: {
                postId_userId: {
                    postId,
                    userId: session.user.id
                }
            }
        })

        if (existingAttempt) {
            return { success: false, error: "You have already attempted this quiz" }
        }

        // Calculate results
        const totalQuestions = answers.length
        const correctAnswers = answers.filter(a => a.isCorrect).length
        const scorePercentage = Math.round((correctAnswers / totalQuestions) * 100)
        const pointsEarned = correctAnswers * POINT_VALUES.QUIZ_CORRECT_ANSWER

        // Create quiz attempt
        const attempt = await prisma.communityQuizAttempt.create({
            data: {
                postId,
                userId: session.user.id,
                totalQuestions,
                correctAnswers,
                scorePercentage,
                pointsEarned,
                timeTakenSeconds: totalTimeTaken,
                answers: answers as unknown as object
            }
        })

        // Update leaderboard if in a community
        if (post.communityId) {
            await updateLeaderboardPoints(
                post.communityId,
                session.user.id,
                'quiz',
                pointsEarned,
                { questionsCorrect: correctAnswers, quizzesCompleted: 1 }
            )
        }

        return {
            success: true,
            data: {
                attempt,
                pointsEarned,
                correctAnswers,
                totalQuestions,
                scorePercentage
            }
        }
    } catch (error) {
        console.error('Error submitting quiz attempt:', error)
        return { success: false, error: "Failed to submit quiz" }
    }
}

// Get quiz attempt for a post
export async function getQuizAttempt(postId: string) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" }
        }

        const attempt = await prisma.communityQuizAttempt.findUnique({
            where: {
                postId_userId: {
                    postId,
                    userId: session.user.id
                }
            }
        })

        return { success: true, data: attempt }
    } catch (error) {
        console.error('Error getting quiz attempt:', error)
        return { success: false, error: "Failed to get quiz attempt" }
    }
}

// Note: updateLeaderboardPoints is an internal helper function, not exported
// POINT_VALUES is also internal - 'use server' files can only export async functions