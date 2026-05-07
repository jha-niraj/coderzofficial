"use server";

import {
    db,
    projectV2Bookmark,
    communityPostBookmark,
    mockInterviewBookmark,
    projectsV2,
    communityPosts,
    communities,
    mockVoiceSession,
    mockInterviewVoice,
    users,
} from "@repo/db"
import { getSession } from "@repo/auth"
import { headers } from "next/headers"
import { eq, and, count, inArray } from "drizzle-orm"

// ==========================================
// HELPER FUNCTIONS
// ==========================================
async function getCurrentUser() {
    const session = await getSession(headers());
    if (!session?.user?.id) {
        return null;
    }
    return session.user;
}

// ==========================================
// SUMMARY & STATS
// ==========================================
export async function getBookmarksSummary() {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return { success: false, error: "Unauthorized" };
        }

        // Fetch all bookmarks in parallel
        const [
            projectV2BMs,
            communityPostBMs,
            mockBMs,
        ] = await Promise.all([
            db.query.projectV2Bookmark.findMany({
                where: eq(projectV2Bookmark.userId, user.id),
                orderBy: (t, { desc }) => [desc(t.createdAt)],
                limit: 10,
            }),
            db.query.communityPostBookmark.findMany({
                where: eq(communityPostBookmark.userId, user.id),
                orderBy: (t, { desc }) => [desc(t.createdAt)],
                limit: 10,
            }),
            db.query.mockInterviewBookmark.findMany({
                where: eq(mockInterviewBookmark.userId, user.id),
                orderBy: (t, { desc }) => [desc(t.createdAt)],
                limit: 10,
            }),
        ]);

        // Fetch joined data for bookmarks that lack relations
        const projectIds = projectV2BMs.map(b => b.projectId)
        const postIds = communityPostBMs.map(b => b.postId)
        const sessionIds = mockBMs.map(b => b.sessionId)

        const [projectsData, postsData, sessionsData] = await Promise.all([
            projectIds.length > 0
                ? db.query.projectsV2.findMany({ where: inArray(projectsV2.id, projectIds) })
                : Promise.resolve([]),
            postIds.length > 0
                ? db.query.communityPosts.findMany({
                    where: inArray(communityPosts.id, postIds),
                    with: { community: true, author: true }
                  })
                : Promise.resolve([]),
            sessionIds.length > 0
                ? db.query.mockVoiceSession.findMany({
                    where: inArray(mockVoiceSession.id, sessionIds),
                    with: { mock: true }
                  })
                : Promise.resolve([]),
        ])

        const projectMap = Object.fromEntries(projectsData.map(p => [p.id, p]))
        const postMap = Object.fromEntries(postsData.map(p => [p.id, p]))
        const sessionMap = Object.fromEntries(sessionsData.map(s => [s.id, s]))

        type BookmarkType = 'project' | 'projectV2' | 'community' | 'mock' | 'v1' | 'v2';
        const recentSaves: Array<{
            type: BookmarkType;
            id: string;
            title: string | null;
            slug?: string;
            category?: string;
            thumbnail?: string | null;
            communityName?: string;
            communitySlug?: string;
            savedAt: Date;
        }> = [];

        projectV2BMs.forEach(b => {
            const project = projectMap[b.projectId]
            if (project) {
                recentSaves.push({
                    type: "projectV2" as const,
                    id: project.id,
                    title: project.title,
                    slug: project.slug,
                    savedAt: b.createdAt,
                });
            }
        });

        communityPostBMs.forEach(b => {
            const post = postMap[b.postId]
            if (post) {
                recentSaves.push({
                    type: "community" as const,
                    id: post.id,
                    title: post.title || post.content?.substring(0, 50) + "...",
                    slug: post.slug ?? undefined,
                    communityName: post.community?.name,
                    communitySlug: post.community?.slug,
                    savedAt: b.createdAt,
                });
            }
        });

        mockBMs.forEach(b => {
            const session = sessionMap[b.sessionId]
            if (session) {
                recentSaves.push({
                    type: "mock" as const,
                    id: session.id,
                    title: session.mock.title || session.mock.description,
                    savedAt: b.createdAt,
                });
            }
        });

        recentSaves.sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime());

        const totalProjects = projectV2BMs.length;

        return {
            success: true,
            data: {
                total: totalProjects + communityPostBMs.length + mockBMs.length,
                totalBookmarks: totalProjects + communityPostBMs.length + mockBMs.length,
                projects: totalProjects,
                community: communityPostBMs.length,
                mock: mockBMs.length,
                studio: 0,
                byModule: {
                    projects: {
                        count: totalProjects,
                        recent: projectV2BMs.slice(0, 5).map(b => {
                            const project = projectMap[b.projectId]
                            return {
                                id: b.projectId,
                                title: project?.title ?? null,
                                slug: project?.slug ?? '',
                                type: "v2" as const,
                                savedAt: b.createdAt,
                            }
                        }),
                    },
                    community: {
                        count: communityPostBMs.length,
                        recent: communityPostBMs.slice(0, 5).map(b => {
                            const post = postMap[b.postId]
                            return {
                                id: b.postId,
                                title: post?.title ?? null,
                                slug: post?.slug ?? null,
                                communityName: post?.community?.name,
                                communitySlug: post?.community?.slug,
                                savedAt: b.createdAt,
                            }
                        }),
                    },
                    mock: {
                        count: mockBMs.length,
                        recent: mockBMs.slice(0, 5).map(b => {
                            const session = sessionMap[b.sessionId]
                            return {
                                id: b.sessionId,
                                title: session?.mock.title || session?.mock.description,
                                savedAt: b.createdAt,
                            }
                        }),
                    },
                    collectives: {
                        count: 0,
                        recent: [],
                    },
                },
                recentSaves: recentSaves.slice(0, 10),
            },
        };
    } catch (error) {
        console.error("Error fetching bookmarks summary:", error);
        return { success: false, error: "Failed to fetch bookmarks" };
    }
}

// ==========================================
// PROJECT V2 BOOKMARKS (Primary project bookmarks)
// ==========================================

// Alias for backward compatibility - redirects to ProjectV2Bookmarks
export async function getProjectBookmarks() {
    return getProjectV2Bookmarks();
}

// Alias for backward compatibility - redirects to ProjectV2Bookmark toggle
export async function toggleProjectBookmark(projectId: string) {
    return toggleProjectV2Bookmark(projectId);
}

export async function getProjectV2Bookmarks() {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return { success: false, error: "Unauthorized" };
        }

        const bookmarks = await db.query.projectV2Bookmark.findMany({
            where: eq(projectV2Bookmark.userId, user.id),
            orderBy: (t, { desc }) => [desc(t.createdAt)],
        });

        const projectIds = bookmarks.map(b => b.projectId)
        const projects = projectIds.length > 0
            ? await db.query.projectsV2.findMany({ where: inArray(projectsV2.id, projectIds) })
            : []
        const projectMap = Object.fromEntries(projects.map(p => [p.id, p]))

        return {
            success: true,
            data: bookmarks.map(b => {
                const project = projectMap[b.projectId]
                return {
                    id: b.projectId,
                    title: project?.title ?? null,
                    slug: project?.slug ?? '',
                    description: project?.shortDescription,
                    difficulty: project?.difficulty,
                    technologies: project?.technologies ?? [],
                    estimatedHours: project?.estimatedHours,
                    taskCount: 0,
                    savedAt: b.createdAt,
                    folder: b.folder,
                    notes: b.notes,
                    type: "v2",
                }
            }),
        };
    } catch (error) {
        console.error("Error fetching projectV2 bookmarks:", error);
        return { success: false, error: "Failed to fetch bookmarks" };
    }
}

export async function toggleProjectV2Bookmark(projectId: string) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return { success: false, error: "Unauthorized" };
        }

        const existing = await db.query.projectV2Bookmark.findFirst({
            where: and(
                eq(projectV2Bookmark.projectId, projectId),
                eq(projectV2Bookmark.userId, user.id)
            ),
        });

        if (existing) {
            await db.delete(projectV2Bookmark).where(eq(projectV2Bookmark.id, existing.id));
            return { success: true, bookmarked: false };
        } else {
            await db.insert(projectV2Bookmark).values({ projectId, userId: user.id });
            return { success: true, bookmarked: true };
        }
    } catch (error) {
        console.error("Error toggling projectV2 bookmark:", error);
        return { success: false, error: "Failed to toggle bookmark" };
    }
}

// ==========================================
// COMMUNITY POST BOOKMARKS
// ==========================================

export async function getCommunityBookmarks() {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return { success: false, error: "Unauthorized" };
        }

        const bookmarks = await db.query.communityPostBookmark.findMany({
            where: eq(communityPostBookmark.userId, user.id),
            orderBy: (t, { desc }) => [desc(t.createdAt)],
        });

        const postIds = bookmarks.map(b => b.postId)
        const posts = postIds.length > 0
            ? await db.query.communityPosts.findMany({
                where: inArray(communityPosts.id, postIds),
                with: { community: true, author: true, likes: true, comments: true }
              })
            : []
        const postMap = Object.fromEntries(posts.map(p => [p.id, p]))

        return {
            success: true,
            data: bookmarks.map(b => {
                const post = postMap[b.postId]
                return {
                    id: b.postId,
                    title: post?.title ?? null,
                    content: post?.content?.substring(0, 200),
                    slug: post?.slug,
                    community: post?.community,
                    author: post?.author,
                    commentCount: post?._count?.comments ?? post?.comments?.length ?? 0,
                    likeCount: post?._count?.likes ?? post?.likes?.length ?? 0,
                    savedAt: b.createdAt,
                    folder: b.folder,
                    notes: b.notes,
                }
            }),
        };
    } catch (error) {
        console.error("Error fetching community bookmarks:", error);
        return { success: false, error: "Failed to fetch bookmarks" };
    }
}

export async function toggleCommunityPostBookmark(postId: string) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return { success: false, error: "Unauthorized" };
        }

        const existing = await db.query.communityPostBookmark.findFirst({
            where: and(
                eq(communityPostBookmark.postId, postId),
                eq(communityPostBookmark.userId, user.id)
            ),
        });

        if (existing) {
            await db.delete(communityPostBookmark).where(eq(communityPostBookmark.id, existing.id));
            return { success: true, bookmarked: false };
        } else {
            await db.insert(communityPostBookmark).values({ postId, userId: user.id });
            return { success: true, bookmarked: true };
        }
    } catch (error) {
        console.error("Error toggling community post bookmark:", error);
        return { success: false, error: "Failed to toggle bookmark" };
    }
}

// ==========================================
// MOCK INTERVIEW BOOKMARKS
// ==========================================

export async function getMockBookmarks() {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return { success: false, error: "Unauthorized" };
        }

        const bookmarks = await db.query.mockInterviewBookmark.findMany({
            where: eq(mockInterviewBookmark.userId, user.id),
            orderBy: (t, { desc }) => [desc(t.createdAt)],
        });

        const sessionIds = bookmarks.map(b => b.sessionId)
        const sessions = sessionIds.length > 0
            ? await db.query.mockVoiceSession.findMany({
                where: inArray(mockVoiceSession.id, sessionIds),
                with: { mock: true }
              })
            : []
        const sessionMap = Object.fromEntries(sessions.map(s => [s.id, s]))

        return {
            success: true,
            data: bookmarks.map(b => {
                const session = sessionMap[b.sessionId]
                return {
                    id: b.sessionId,
                    mockTitle: session?.mock.title ?? null,
                    topic: session?.mock.description ?? null,
                    level: session?.mock.level ?? null,
                    status: session?.status ?? null,
                    sessionDate: session?.createdAt ?? null,
                    savedAt: b.createdAt,
                    folder: b.folder,
                    notes: b.notes,
                }
            }),
        };
    } catch (error) {
        console.error("Error fetching mock bookmarks:", error);
        return { success: false, error: "Failed to fetch bookmarks" };
    }
}

export async function toggleMockBookmark(sessionId: string) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return { success: false, error: "Unauthorized" };
        }

        const existing = await db.query.mockInterviewBookmark.findFirst({
            where: and(
                eq(mockInterviewBookmark.sessionId, sessionId),
                eq(mockInterviewBookmark.userId, user.id)
            ),
        });

        if (existing) {
            await db.delete(mockInterviewBookmark).where(eq(mockInterviewBookmark.id, existing.id));
            return { success: true, bookmarked: false };
        } else {
            await db.insert(mockInterviewBookmark).values({ sessionId, userId: user.id });
            return { success: true, bookmarked: true };
        }
    } catch (error) {
        console.error("Error toggling mock bookmark:", error);
        return { success: false, error: "Failed to toggle bookmark" };
    }
}

// ==========================================
// CHECK BOOKMARK STATUS
// ==========================================

export async function isProjectBookmarked(projectId: string, version: "v1" | "v2" = "v2") {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return { success: true, bookmarked: false };
        }

        // All project bookmarks now use ProjectV2Bookmark
        const bookmark = await db.query.projectV2Bookmark.findFirst({
            where: and(
                eq(projectV2Bookmark.projectId, projectId),
                eq(projectV2Bookmark.userId, user.id)
            ),
        });

        return { success: true, bookmarked: !!bookmark };
    } catch (error) {
        console.error("Error checking project bookmark:", error);
        return { success: false, bookmarked: false };
    }
}

export async function isCommunityPostBookmarked(postId: string) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return { success: true, bookmarked: false };
        }

        const bookmark = await db.query.communityPostBookmark.findFirst({
            where: and(
                eq(communityPostBookmark.postId, postId),
                eq(communityPostBookmark.userId, user.id)
            ),
        });

        return { success: true, bookmarked: !!bookmark };
    } catch (error) {
        console.error("Error checking community post bookmark:", error);
        return { success: false, bookmarked: false };
    }
}

// ==========================================
// BOOKMARK STATS
// ==========================================

export async function getBookmarkStats() {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return { success: false, error: "Unauthorized" };
        }

        const [[{ value: projectV2Count }], [{ value: communityCount }], [{ value: mockCount }]] = await Promise.all([
            db.select({ value: count() }).from(projectV2Bookmark).where(eq(projectV2Bookmark.userId, user.id)),
            db.select({ value: count() }).from(communityPostBookmark).where(eq(communityPostBookmark.userId, user.id)),
            db.select({ value: count() }).from(mockInterviewBookmark).where(eq(mockInterviewBookmark.userId, user.id)),
        ]);

        return {
            success: true,
            data: {
                projects: projectV2Count,
                community: communityCount,
                mock: mockCount,
                total: projectV2Count + communityCount + mockCount,
            },
        };
    } catch (error) {
        console.error("Error fetching bookmark stats:", error);
        return { success: false, error: "Failed to fetch stats" };
    }
}
