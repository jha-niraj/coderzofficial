'use server'

import { prisma } from "@/lib/prisma"
import { getServerSession } from '@repo/auth'
import { authOptions } from '@repo/auth'
import { revalidatePath } from "next/cache"

// ==================== TYPES ====================
export interface CreateCommentInput {
    postId: string
    content: string
    parentId?: string // For replies
}

// ==================== COMMENT CRUD ====================

// Create a comment
export async function createComment(input: CreateCommentInput) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" }
        }

        const post = await prisma.communityPost.findUnique({
            where: { id: input.postId },
            include: { community: true }
        })

        if (!post) {
            return { success: false, error: "Post not found" }
        }

        if (post.isLocked) {
            return { success: false, error: "Comments are locked on this post" }
        }

        // Check if user is a member (skip for official channel posts)
        if (post.communityId) {
            const membership = await prisma.communityMember.findUnique({
                where: {
                    communityId_userId: {
                        communityId: post.communityId,
                        userId: session.user.id
                    }
                }
            })

            if (!membership || !membership.isApproved) {
                return { success: false, error: "You must be a member to comment" }
            }
        }

        // If reply, verify parent exists
        if (input.parentId) {
            const parentComment = await prisma.communityComment.findUnique({
                where: { id: input.parentId }
            })
            if (!parentComment || parentComment.postId !== input.postId) {
                return { success: false, error: "Invalid parent comment" }
            }
        }

        const comment = await prisma.communityComment.create({
            data: {
                postId: input.postId,
                authorId: session.user.id,
                content: input.content,
                parentId: input.parentId
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

        // Update post comment count
        await prisma.communityPost.update({
            where: { id: input.postId },
            data: { commentCount: { increment: 1 } }
        })

        // Update member helpful count for Q&A posts
        if (post.type === 'QUESTION') {
            await prisma.communityMember.update({
                where: {
                    communityId_userId: {
                        communityId: post.communityId ?? '',
                        userId: session.user.id
                    }
                },
                data: { helpfulCount: { increment: 1 } }
            })
        }

        return { success: true, data: comment }
    } catch (error) {
        console.error('Error creating comment:', error)
        return { success: false, error: "Failed to create comment" }
    }
}

// Get comments for a post
export async function getComments(postId: string, options?: {
    limit?: number
    cursor?: string
    sortBy?: 'latest' | 'popular' | 'oldest'
}) {
    try {
        const session = await getServerSession(authOptions)
        const { limit = 30, cursor, sortBy = 'latest' } = options || {}

        const orderBy = sortBy === 'popular'
            ? [{ isAccepted: 'desc' as const }, { likeCount: 'desc' as const }]
            : sortBy === 'oldest'
            ? [{ createdAt: 'asc' as const }]
            : [{ createdAt: 'desc' as const }]

        const comments = await prisma.communityComment.findMany({
            where: {
                postId,
                parentId: null // Only top-level comments
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
                    orderBy: { createdAt: 'asc' },
                    take: 5 // Show first 5 replies
                },
                _count: {
                    select: { likes: true, replies: true }
                }
            },
            orderBy,
            take: limit + 1,
            ...(cursor && { cursor: { id: cursor }, skip: 1 })
        })

        const hasMore = comments.length > limit
        const items = hasMore ? comments.slice(0, -1) : comments

        // Check if user has liked comments
        let userLikes: string[] = []
        if (session?.user?.id) {
            const likes = await prisma.communityCommentLike.findMany({
                where: {
                    commentId: { in: items.map(c => c.id) },
                    userId: session.user.id
                },
                select: { commentId: true }
            })
            userLikes = likes.map(l => l.commentId)
        }

        const commentsWithUserData = items.map(comment => ({
            ...comment,
            isLiked: userLikes.includes(comment.id)
        }))

        return {
            success: true,
            data: commentsWithUserData,
            nextCursor: hasMore ? items[items.length - 1].id : undefined
        }
    } catch (error) {
        console.error('Error fetching comments:', error)
        return { success: false, error: "Failed to fetch comments" }
    }
}

// Get replies for a comment
export async function getReplies(commentId: string, options?: {
    limit?: number
    cursor?: string
}) {
    try {
        const { limit = 20, cursor } = options || {}

        const replies = await prisma.communityComment.findMany({
            where: {
                parentId: commentId
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
                    select: { likes: true }
                }
            },
            orderBy: { createdAt: 'asc' },
            take: limit + 1,
            ...(cursor && { cursor: { id: cursor }, skip: 1 })
        })

        const hasMore = replies.length > limit
        const items = hasMore ? replies.slice(0, -1) : replies

        return {
            success: true,
            data: items,
            nextCursor: hasMore ? items[items.length - 1].id : undefined
        }
    } catch (error) {
        console.error('Error fetching replies:', error)
        return { success: false, error: "Failed to fetch replies" }
    }
}

// Update comment
export async function updateComment(commentId: string, content: string) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" }
        }

        const comment = await prisma.communityComment.findUnique({
            where: { id: commentId },
            include: {
                post: {
                    include: { community: true }
                }
            }
        })

        if (!comment) {
            return { success: false, error: "Comment not found" }
        }

        // Check if user is author or admin
        if (comment.authorId !== session.user.id) {
            const membership = await prisma.communityMember.findUnique({
                where: {
                    communityId_userId: {
                        communityId: comment.post.communityId ?? '',
                        userId: session.user.id
                    }
                }
            })
            
            if (!membership || !['OWNER', 'ADMIN', 'MODERATOR'].includes(membership.role)) {
                return { success: false, error: "You don't have permission" }
            }
        }

        const updatedComment = await prisma.communityComment.update({
            where: { id: commentId },
            data: {
                content,
                isEdited: true,
                editedAt: new Date()
            }
        })

        return { success: true, data: updatedComment }
    } catch (error) {
        console.error('Error updating comment:', error)
        return { success: false, error: "Failed to update comment" }
    }
}

// Delete comment
export async function deleteComment(commentId: string) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" }
        }

        const comment = await prisma.communityComment.findUnique({
            where: { id: commentId },
            include: {
                post: true,
                _count: {
                    select: { replies: true }
                }
            }
        })

        if (!comment) {
            return { success: false, error: "Comment not found" }
        }

        // Check if user is author or admin
        if (comment.authorId !== session.user.id) {
            const membership = await prisma.communityMember.findUnique({
                where: {
                    communityId_userId: {
                        communityId: comment.post.communityId ?? '',
                        userId: session.user.id
                    }
                }
            })
            
            if (!membership || !['OWNER', 'ADMIN', 'MODERATOR'].includes(membership.role)) {
                return { success: false, error: "You don't have permission" }
            }
        }

        // Count total comments being deleted (including replies)
        const totalDeleted = 1 + comment._count.replies

        await prisma.communityComment.delete({
            where: { id: commentId }
        })

        // Update post comment count
        await prisma.communityPost.update({
            where: { id: comment.postId },
            data: { commentCount: { decrement: totalDeleted } }
        })

        return { success: true }
    } catch (error) {
        console.error('Error deleting comment:', error)
        return { success: false, error: "Failed to delete comment" }
    }
}

// ==================== LIKES ====================

// Like/Unlike comment
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
            // Unlike
            await prisma.communityCommentLike.delete({
                where: { id: existingLike.id }
            })
            await prisma.communityComment.update({
                where: { id: commentId },
                data: { likeCount: { decrement: 1 } }
            })
            return { success: true, liked: false }
        } else {
            // Like
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

