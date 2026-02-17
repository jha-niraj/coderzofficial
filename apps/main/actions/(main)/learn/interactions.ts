
"use server";

import { prisma } from "@repo/prisma";
import { auth } from '@repo/auth';
import { LearnStatus } from "@repo/prisma/client";
import { 
    checkIsAdmin, checkIsAuthenticated 
} from "./utils";

export async function toggleLearnLike(learnId: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { error: "Unauthorized" };
        }

        const existing = await prisma.learnLike.findUnique({
            where: {
                learnId_userId: { learnId, userId: session.user.id },
            },
        });

        if (existing) {
            await prisma.$transaction([
                prisma.learnLike.delete({
                    where: { id: existing.id },
                }),
                prisma.learn.update({
                    where: { id: learnId },
                    data: { likeCount: { decrement: 1 } },
                }),
            ]);
            return { liked: false };
        } else {
            await prisma.$transaction([
                prisma.learnLike.create({
                    data: { learnId, userId: session.user.id },
                }),
                prisma.learn.update({
                    where: { id: learnId },
                    data: { likeCount: { increment: 1 } },
                }),
            ]);
            return { liked: true };
        }
    } catch (error) {
        console.error("Error toggling like:", error);
        return { error: "Failed to toggle like" };
    }
}

export async function toggleLearnBookmark(learnId: string, folder?: string, notes?: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) return { error: "Unauthorized" };

        const existing = await prisma.learnBookmark.findUnique({
            where: { learnId_userId: { learnId, userId: session.user.id } },
        });

        if (existing) {
            await prisma.$transaction([
                prisma.learnBookmark.delete({ where: { id: existing.id } }),
                prisma.learn.update({ where: { id: learnId }, data: { bookmarkCount: { decrement: 1 } } }),
            ]);
            return { bookmarked: false };
        } else {
            await prisma.$transaction([
                prisma.learnBookmark.create({
                    data: { learnId, userId: session.user.id, folder: folder || "Saved", notes },
                }),
                prisma.learn.update({ where: { id: learnId }, data: { bookmarkCount: { increment: 1 } } }),
            ]);
            return { bookmarked: true };
        }
    } catch (error) {
        console.error("Error toggling bookmark:", error);
        return { error: "Failed to toggle bookmark" };
    }
}

export async function recordLearnView(learnId: string, source?: string) {
    try {
        const session = await auth();
        const userId = session?.user?.id;

        await prisma.$transaction([
            prisma.learnView.create({
                data: { learnId, userId, source: source || "direct" },
            }),
            prisma.learn.update({
                where: { id: learnId },
                data: { viewCount: { increment: 1 } },
            }),
        ]);

        return { success: true };
    } catch (error) {
        console.error("Error recording view:", error);
        return { error: "Failed to record view" };
    }
}

export async function getUserBookmarks(folder?: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) return { error: "Unauthorized" };

        const where: any = { userId: session.user.id };
        if (folder) where.folder = folder;

        const bookmarks = await prisma.learnBookmark.findMany({
            where,
            include: {
                learn: {
                    select: {
                        id: true, slug: true, title: true, description: true, thumbnail: true,
                        iconEmoji: true, difficulty: true, estimatedTime: true,
                        likeCount: true, viewCount: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        const folders = await prisma.learnBookmark.groupBy({
            by: ["folder"],
            where: { userId: session.user.id },
            _count: true,
        });

        return { bookmarks, folders };
    } catch (error) {
        console.error("Error fetching bookmarks:", error);
        return { error: "Failed to fetch bookmarks" };
    }
}

export async function updateBookmark(learnId: string, folder?: string, notes?: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) return { error: "Unauthorized" };

        const bookmark = await prisma.learnBookmark.update({
            where: { learnId_userId: { learnId, userId: session.user.id } },
            data: { ...(folder && { folder }), ...(notes !== undefined && { notes }) },
        });

        return { bookmark };
    } catch (error) {
        console.error("Error updating bookmark:", error);
        return { error: "Failed to update bookmark" };
    }
}

export async function getLearnComments(learnId: string, page = 1, limit = 20) {
    try {
        const [comments, total] = await Promise.all([
            prisma.learnComment.findMany({
                where: { learnId, parentId: null, isHidden: false },
                include: {
                    user: { select: { id: true, name: true, username: true, image: true } },
                    replies: {
                        where: { isHidden: false },
                        include: { user: { select: { id: true, name: true, username: true, image: true } } },
                        orderBy: { createdAt: "asc" },
                    },
                },
                orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.learnComment.count({ where: { learnId, parentId: null, isHidden: false } }),
        ]);

        return { comments, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
    } catch (error) {
        console.error("Error fetching comments:", error);
        return { error: "Failed to fetch comments" };
    }
}

export async function addComment(learnId: string, content: string, parentId?: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) return { error: "Unauthorized" };

        const comment = await prisma.learnComment.create({
            data: { learnId, userId: session.user.id, content, parentId },
            include: { user: { select: { id: true, name: true, username: true, image: true } } },
        });

        await prisma.learn.update({
            where: { id: learnId },
            data: { commentCount: { increment: 1 } },
        });

        return { comment };
    } catch (error) {
        console.error("Error adding comment:", error);
        return { error: "Failed to add comment" };
    }
}

export async function editComment(commentId: string, content: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) return { error: "Unauthorized" };

        const comment = await prisma.learnComment.update({
            where: { id: commentId, userId: session.user.id },
            data: { content, isEdited: true },
        });

        return { comment };
    } catch (error) {
        console.error("Error editing comment:", error);
        return { error: "Failed to edit comment" };
    }
}

export async function deleteComment(commentId: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) return { error: "Unauthorized" };

        const comment = await prisma.learnComment.findUnique({
            where: { id: commentId },
            select: { userId: true, learnId: true },
        });

        if (!comment) return { error: "Comment not found" };

        const adminCheck = await checkIsAdmin();
        if (comment.userId !== session.user.id && !adminCheck.isAdmin) {
            return { error: "Not authorized" };
        }

        await prisma.$transaction([
            prisma.learnComment.delete({ where: { id: commentId } }),
            prisma.learn.update({ where: { id: comment.learnId }, data: { commentCount: { decrement: 1 } } }),
        ]);

        return { success: true };
    } catch (error) {
        console.error("Error deleting comment:", error);
        return { error: "Failed to delete comment" };
    }
}

export async function pinComment(commentId: string) {
    try {
        const adminCheck = await checkIsAdmin();
        if (!adminCheck.isAdmin) return { error: adminCheck.error };

        const comment = await prisma.learnComment.update({
            where: { id: commentId },
            data: { isPinned: true },
        });

        return { comment };
    } catch (error) {
        console.error("Error pinning comment:", error);
        return { error: "Failed to pin comment" };
    }
}

export async function shareLearnToCommunity(
    learnId: string,
    communityId: string,
    message?: string
) {
    try {
        const authCheck = await checkIsAuthenticated();
        if (!authCheck.isAuthenticated) {
            return { error: authCheck.error };
        }

        // Check if learn exists and is published
        const learn = await prisma.learn.findUnique({
            where: { id: learnId },
            select: {
                id: true,
                slug: true,
                title: true,
                description: true,
                iconEmoji: true,
                status: true,
            },
        });

        if (!learn) {
            return { error: "Learn not found" };
        }

        if (learn.status !== LearnStatus.PUBLISHED) {
            return { error: "Only published learns can be shared" };
        }

        // Check if user is member of the community
        const membership = await prisma.communityMember.findUnique({
            where: {
                communityId_userId: {
                    communityId,
                    userId: authCheck.userId!,
                },
            },
        });

        if (!membership || !membership.isApproved) {
            return { error: "You must be a member of this community to share" };
        }

        // Create a community post with the linked learn
        const content = message ||
            `🚀 Check out this learn: **${learn.title}**\n\n${learn.description.slice(0, 200)}${learn.description.length > 200 ? '...' : ''}\n\n[View Learn](/learns/${learn.slug})`;

        const post = await prisma.communityPost.create({
            data: {
                communityId,
                authorId: authCheck.userId!,
                title: `${learn.iconEmoji || "📚"} ${learn.title}`,
                content,
                type: "RESOURCE",
                linkedLearnId: learnId,
                tags: ["learn", "learning"],
            },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        image: true,
                    },
                },
            },
        });

        return { success: true, post };
    } catch (error) {
        console.error("Error sharing learn to community:", error);
        return { error: "Failed to share learn" };
    }
}

export async function getUserCommunities() {
    try {
        const authCheck = await checkIsAuthenticated();
        if (!authCheck.isAuthenticated) {
            return { communities: [] };
        }

        const memberships = await prisma.communityMember.findMany({
            where: {
                userId: authCheck.userId,
                isApproved: true,
            },
            include: {
                community: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        logo: true,
                    },
                },
            },
        });

        return {
            communities: memberships.map(m => m.community).filter(Boolean),
        };
    } catch (error) {
        console.error("Error fetching user communities:", error);
        return { communities: [] };
    }
}
