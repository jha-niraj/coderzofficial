"use server";

import { auth } from '@repo/auth';
import { prisma } from '@repo/prisma';
import { revalidatePath } from 'next/cache';
import { SpaceActivityType } from '@repo/prisma/client';

// ==========================================
// HELPER FUNCTIONS
// ==========================================

async function checkAuth() {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error('Unauthorized');
    }
    return session.user.id;
}

// ==========================================
// COMMENTS
// ==========================================

export interface CommentData {
    id: string;
    content: string;
    createdAt: Date;
    userId: string;
    user: {
        id: string;
        name: string | null;
        username: string | null;
        image: string | null;
    };
    likeCount: number;
    isLiked?: boolean;
    parentId: string | null;
    replies?: CommentData[];
}

export async function getStepComments(
    spaceId: string,
    stepId: string,
    page: number = 1,
    limit: number = 50
): Promise<{ success: boolean; data?: { comments: CommentData[]; hasMore: boolean }; error?: string }> {
    try {
        const userId = await checkAuth();
        const skip = (page - 1) * limit;

        // Get top-level comments first
        const comments = await prisma.spaceComment.findMany({
            where: {
                spaceId,
                stepId,
                parentId: null, // Only top-level comments
                isHidden: false,
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit + 1, // Get one extra to check if there's more
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        image: true,
                    }
                },
                replies: {
                    where: { isHidden: false },
                    orderBy: { createdAt: 'asc' },
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
                }
            }
        });

        const hasMore = comments.length > limit;
        const displayComments = hasMore ? comments.slice(0, limit) : comments;

        const formattedComments: CommentData[] = displayComments.map(comment => ({
            id: comment.id,
            content: comment.content,
            createdAt: comment.createdAt,
            userId: comment.userId,
            user: {
                id: comment.user.id,
                name: comment.user.name,
                username: comment.user.username,
                image: comment.user.image,
            },
            likeCount: comment.likeCount,
            isLiked: false, // TODO: Check if user liked this comment
            parentId: comment.parentId,
            replies: comment.replies.map(reply => ({
                id: reply.id,
                content: reply.content,
                createdAt: reply.createdAt,
                userId: reply.userId,
                user: {
                    id: reply.user.id,
                    name: reply.user.name,
                    username: reply.user.username,
                    image: reply.user.image,
                },
                likeCount: reply.likeCount,
                isLiked: false,
                parentId: reply.parentId,
            }))
        }));

        return {
            success: true,
            data: {
                comments: formattedComments,
                hasMore,
            }
        };
    } catch (error) {
        console.error('Error fetching comments:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to fetch comments'
        };
    }
}

export async function createComment(
    spaceId: string,
    stepId: string,
    content: string,
    parentId?: string
): Promise<{ success: boolean; data?: CommentData; error?: string }> {
    try {
        const userId = await checkAuth();

        // Verify access
        const space = await prisma.space.findUnique({
            where: { id: spaceId },
            select: { enableComments: true, slug: true }
        });

        if (!space) {
            return { success: false, error: 'Space not found' };
        }

        if (!space.enableComments) {
            return { success: false, error: 'Comments are disabled for this space' };
        }

        // Create comment
        const comment = await prisma.spaceComment.create({
            data: {
                spaceId,
                stepId,
                userId,
                content,
                parentId: parentId || null,
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
        });

        // Create activity
        await prisma.spaceActivity.create({
            data: {
                spaceId,
                userId,
                type: SpaceActivityType.COMMENT_ADDED,
                stepId,
                metadata: { commentId: comment.id }
            }
        });

        revalidatePath(`/space/${space.slug}`);

        return {
            success: true,
            data: {
                id: comment.id,
                content: comment.content,
                createdAt: comment.createdAt,
                userId: comment.userId,
                user: {
                    id: comment.user.id,
                    name: comment.user.name,
                    username: comment.user.username,
                    image: comment.user.image,
                },
                likeCount: 0,
                isLiked: false,
                parentId: comment.parentId,
            }
        };
    } catch (error) {
        console.error('Error creating comment:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to create comment'
        };
    }
}

export async function deleteComment(
    commentId: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const userId = await checkAuth();

        const comment = await prisma.spaceComment.findUnique({
            where: { id: commentId },
            include: { space: { select: { slug: true, creatorId: true } } }
        });

        if (!comment) {
            return { success: false, error: 'Comment not found' };
        }

        // Only comment owner or space creator can delete
        if (comment.userId !== userId && comment.space.creatorId !== userId) {
            return { success: false, error: 'Unauthorized to delete this comment' };
        }

        // Soft delete by hiding
        await prisma.spaceComment.update({
            where: { id: commentId },
            data: { isHidden: true }
        });

        revalidatePath(`/space/${comment.space.slug}`);

        return { success: true };
    } catch (error) {
        console.error('Error deleting comment:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to delete comment'
        };
    }
}

// ==========================================
// LIKES
// ==========================================

export async function getStepLikeStatus(
    spaceId: string,
    stepId: string
): Promise<{ success: boolean; data?: { isLiked: boolean; count: number }; error?: string }> {
    try {
        const userId = await checkAuth();

        const [like, step] = await Promise.all([
            prisma.spaceLike.findUnique({
                where: {
                    spaceId_stepId_userId: {
                        spaceId,
                        stepId,
                        userId,
                    }
                }
            }),
            prisma.spaceStep.findUnique({
                where: { id: stepId },
                select: {
                    _count: {
                        select: { likes: true }
                    }
                }
            })
        ]);

        return {
            success: true,
            data: {
                isLiked: !!like,
                count: step?._count.likes || 0
            }
        };
    } catch (error) {
        console.error('Error getting like status:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to get like status'
        };
    }
}

export async function toggleStepLike(
    spaceId: string,
    stepId: string
): Promise<{ success: boolean; data?: { isLiked: boolean; count: number }; error?: string }> {
    try {
        const userId = await checkAuth();

        const space = await prisma.space.findUnique({
            where: { id: spaceId },
            select: { enableLikes: true, slug: true, likeCount: true }
        });

        if (!space) {
            return { success: false, error: 'Space not found' };
        }

        if (!space.enableLikes) {
            return { success: false, error: 'Likes are disabled for this space' };
        }

        // Check if already liked
        const existingLike = await prisma.spaceLike.findUnique({
            where: {
                spaceId_stepId_userId: {
                    spaceId,
                    stepId,
                    userId,
                }
            }
        });

        if (existingLike) {
            // Unlike
            await prisma.$transaction([
                prisma.spaceLike.delete({
                    where: { id: existingLike.id }
                }),
                prisma.space.update({
                    where: { id: spaceId },
                    data: { likeCount: { decrement: 1 } }
                })
            ]);

            const newCount = await prisma.spaceLike.count({
                where: { spaceId, stepId }
            });

            revalidatePath(`/space/${space.slug}`);

            return {
                success: true,
                data: { isLiked: false, count: newCount }
            };
        } else {
            // Like
            await prisma.$transaction([
                prisma.spaceLike.create({
                    data: {
                        spaceId,
                        stepId,
                        userId,
                    }
                }),
                prisma.spaceActivity.create({
                    data: {
                        spaceId,
                        userId,
                        type: SpaceActivityType.LIKE_ADDED,
                        stepId,
                    }
                }),
                prisma.space.update({
                    where: { id: spaceId },
                    data: { likeCount: { increment: 1 } }
                })
            ]);

            const newCount = await prisma.spaceLike.count({
                where: { spaceId, stepId }
            });

            revalidatePath(`/space/${space.slug}`);

            return {
                success: true,
                data: { isLiked: true, count: newCount }
            };
        }
    } catch (error) {
        console.error('Error toggling like:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to toggle like'
        };
    }
}

export async function getSpaceLikeCount(spaceId: string): Promise<{ success: boolean; count?: number; error?: string }> {
    try {
        const space = await prisma.space.findUnique({
            where: { id: spaceId },
            select: { likeCount: true }
        });

        return {
            success: true,
            count: space?.likeCount || 0
        };
    } catch (error) {
        console.error('Error getting space like count:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to get like count'
        };
    }
}

// ==========================================
// ACTIVITIES
// ==========================================

export async function getSpaceActivities(
    spaceId: string,
    page: number = 1,
    limit: number = 20
): Promise<{ success: boolean; data?: { activities: any[]; hasMore: boolean }; error?: string }> {
    try {
        await checkAuth();
        const skip = (page - 1) * limit;

        const activities = await prisma.spaceActivity.findMany({
            where: { spaceId },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit + 1,
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
        });

        const hasMore = activities.length > limit;
        const displayActivities = hasMore ? activities.slice(0, limit) : activities;

        return {
            success: true,
            data: {
                activities: displayActivities,
                hasMore,
            }
        };
    } catch (error) {
        console.error('Error fetching activities:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to fetch activities'
        };
    }
}


