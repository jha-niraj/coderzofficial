"use server";

import { auth } from '@repo/auth';
import { prisma } from "@repo/prisma";

// ==========================================
// HELPER FUNCTIONS
// ==========================================
async function getCurrentUser() {
    const session = await auth();
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

        // Fetch all bookmark counts and recent items in parallel
        const [
            conceptBookmarks,
            projectV2Bookmarks,
            communityPostBookmarks,
            mockInterviewBookmarks,
        ] = await Promise.all([
            prisma.conceptBookmark.findMany({
                where: { userId: user.id },
                include: {
                    concept: {
                        select: {
                            id: true,
                            title: true,
                            slug: true,
                            category: true,
                            difficulty: true,
                            thumbnail: true,
                            estimatedTime: true,
                        },
                    },
                },
                orderBy: { createdAt: "desc" },
                take: 10,
            }),
            prisma.projectV2Bookmark.findMany({
                where: { userId: user.id },
                include: {
                    project: {
                        select: {
                            id: true,
                            title: true,
                            slug: true,
                            shortDescription: true,
                            difficulty: true,
                            technologies: true,
                        },
                    },
                },
                orderBy: { createdAt: "desc" },
                take: 10,
            }),
            prisma.communityPostBookmark.findMany({
                where: { userId: user.id },
                include: {
                    post: {
                        select: {
                            id: true,
                            title: true,
                            content: true,
                            slug: true,
                            community: {
                                select: {
                                    name: true,
                                    slug: true,
                                },
                            },
                            author: {
                                select: {
                                    name: true,
                                    image: true,
                                },
                            },
                        },
                    },
                },
                orderBy: { createdAt: "desc" },
                take: 10,
            }),
            prisma.mockInterviewBookmark.findMany({
                where: { userId: user.id },
                include: {
                    session: {
                        select: {
                            id: true,
                            status: true,
                            createdAt: true,
                            mock: {
                                select: {
                                    title: true,
                                    description: true,
                                },
                            },
                        },
                    },
                },
                orderBy: { createdAt: "desc" },
                take: 10,
            }),
        ]);

        // Build combined recent saves
        type BookmarkType = 'concept' | 'project' | 'projectV2' | 'community' | 'mock' | 'v1' | 'v2';
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

        conceptBookmarks.forEach(b => {
            recentSaves.push({
                type: "concept" as const,
                id: b.concept.id,
                title: b.concept.title,
                slug: b.concept.slug,
                category: b.concept.category,
                thumbnail: b.concept.thumbnail,
                savedAt: b.createdAt,
            });
        });

        projectV2Bookmarks.forEach(b => {
            recentSaves.push({
                type: "projectV2" as const,
                id: b.project.id,
                title: b.project.title,
                slug: b.project.slug,
                savedAt: b.createdAt,
            });
        });

        communityPostBookmarks.forEach(b => {
            recentSaves.push({
                type: "community" as const,
                id: b.post.id,
                title: b.post.title || b.post.content?.substring(0, 50) + "...",
                slug: b.post.slug ?? undefined,
                communityName: b.post.community?.name,
                communitySlug: b.post.community?.slug,
                savedAt: b.createdAt,
            });
        });

        mockInterviewBookmarks.forEach(b => {
            recentSaves.push({
                type: "mock" as const,
                id: b.session.id,
                title: b.session.mock.title || b.session.mock.description,
                savedAt: b.createdAt,
            });
        });

        // Sort by saved date
        recentSaves.sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime());

        const totalProjects = projectV2Bookmarks.length;

        return {
            success: true,
            data: {
                total: conceptBookmarks.length + totalProjects + communityPostBookmarks.length + mockInterviewBookmarks.length,
                totalBookmarks: conceptBookmarks.length + totalProjects + communityPostBookmarks.length + mockInterviewBookmarks.length,
                concepts: conceptBookmarks.length,
                projects: totalProjects,
                community: communityPostBookmarks.length,
                mock: mockInterviewBookmarks.length,
                studio: 0, // Coming soon
                byModule: {
                    concepts: {
                        count: conceptBookmarks.length,
                        recent: conceptBookmarks.slice(0, 5).map(b => ({
                            id: b.concept.id,
                            title: b.concept.title,
                            slug: b.concept.slug,
                            category: b.concept.category,
                            difficulty: b.concept.difficulty,
                            thumbnail: b.concept.thumbnail,
                            savedAt: b.createdAt,
                        })),
                    },
                    projects: {
                        count: totalProjects,
                        recent: projectV2Bookmarks.slice(0, 5).map(b => ({
                            id: b.project.id,
                            title: b.project.title,
                            slug: b.project.slug,
                            type: "v2" as const,
                            savedAt: b.createdAt,
                        })),
                    },
                    community: {
                        count: communityPostBookmarks.length,
                        recent: communityPostBookmarks.slice(0, 5).map(b => ({
                            id: b.post.id,
                            title: b.post.title,
                            slug: b.post.slug,
                            communityName: b.post.community?.name,
                            communitySlug: b.post.community?.slug,
                            savedAt: b.createdAt,
                        })),
                    },
                    mock: {
                        count: mockInterviewBookmarks.length,
                        recent: mockInterviewBookmarks.slice(0, 5).map(b => ({
                            id: b.session.id,
                            title: b.session.mock.title || b.session.mock.description,
                            savedAt: b.createdAt,
                        })),
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
// CONCEPT BOOKMARKS
// ==========================================

export async function getConceptBookmarks() {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return { success: false, error: "Unauthorized" };
        }

        const bookmarks = await prisma.conceptBookmark.findMany({
            where: { userId: user.id },
            include: {
                concept: {
                    include: {
                        _count: {
                            select: {
                                steps: true,
                                likes: true,
                            },
                        },
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        return {
            success: true,
            data: bookmarks.map(b => ({
                id: b.concept.id,
                title: b.concept.title,
                slug: b.concept.slug,
                description: b.concept.description,
                category: b.concept.category,
                difficulty: b.concept.difficulty,
                thumbnail: b.concept.thumbnail,
                estimatedTime: b.concept.estimatedTime,
                stepCount: b.concept._count.steps,
                likeCount: b.concept._count.likes,
                savedAt: b.createdAt,
                folder: b.folder,
                notes: b.notes,
            })),
        };
    } catch (error) {
        console.error("Error fetching concept bookmarks:", error);
        return { success: false, error: "Failed to fetch bookmarks" };
    }
}

export async function toggleConceptBookmark(conceptId: string) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return { success: false, error: "Unauthorized" };
        }

        const existing = await prisma.conceptBookmark.findUnique({
            where: {
                conceptId_userId: {
                    conceptId,
                    userId: user.id,
                },
            },
        });

        if (existing) {
            await prisma.conceptBookmark.delete({
                where: { id: existing.id },
            });
            return { success: true, bookmarked: false };
        } else {
            await prisma.conceptBookmark.create({
                data: {
                    conceptId,
                    userId: user.id,
                },
            });
            return { success: true, bookmarked: true };
        }
    } catch (error) {
        console.error("Error toggling concept bookmark:", error);
        return { success: false, error: "Failed to toggle bookmark" };
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

        const bookmarks = await prisma.projectV2Bookmark.findMany({
            where: { userId: user.id },
            include: {
                project: {
                    include: {
                        _count: {
                            select: {
                                pages: true,
                            },
                        },
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        return {
            success: true,
            data: bookmarks.map(b => ({
                id: b.project.id,
                title: b.project.title,
                slug: b.project.slug,
                description: b.project.shortDescription,
                difficulty: b.project.difficulty,
                technologies: b.project.technologies,
                estimatedHours: b.project.estimatedHours,
                taskCount: 0, // Tasks are now in sprints, counting them requires deep query
                pageCount: b.project._count.pages,
                savedAt: b.createdAt,
                folder: b.folder,
                notes: b.notes,
                type: "v2",
            })),
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

        const existing = await prisma.projectV2Bookmark.findUnique({
            where: {
                projectId_userId: {
                    projectId,
                    userId: user.id,
                },
            },
        });

        if (existing) {
            await prisma.projectV2Bookmark.delete({
                where: { id: existing.id },
            });
            return { success: true, bookmarked: false };
        } else {
            await prisma.projectV2Bookmark.create({
                data: {
                    projectId,
                    userId: user.id,
                },
            });
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

        const bookmarks = await prisma.communityPostBookmark.findMany({
            where: { userId: user.id },
            include: {
                post: {
                    include: {
                        community: {
                            select: {
                                id: true,
                                name: true,
                                slug: true,
                                logo: true,
                            },
                        },
                        author: {
                            select: {
                                id: true,
                                name: true,
                                image: true,
                                username: true,
                            },
                        },
                        _count: {
                            select: {
                                comments: true,
                                likes: true,
                            },
                        },
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        return {
            success: true,
            data: bookmarks.map(b => ({
                id: b.post.id,
                title: b.post.title,
                content: b.post.content?.substring(0, 200),
                slug: b.post.slug,
                community: b.post.community,
                author: b.post.author,
                commentCount: b.post._count.comments,
                likeCount: b.post._count.likes,
                savedAt: b.createdAt,
                folder: b.folder,
                notes: b.notes,
            })),
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

        const existing = await prisma.communityPostBookmark.findUnique({
            where: {
                postId_userId: {
                    postId,
                    userId: user.id,
                },
            },
        });

        if (existing) {
            await prisma.communityPostBookmark.delete({
                where: { id: existing.id },
            });
            return { success: true, bookmarked: false };
        } else {
            await prisma.communityPostBookmark.create({
                data: {
                    postId,
                    userId: user.id,
                },
            });
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

        const bookmarks = await prisma.mockInterviewBookmark.findMany({
            where: { userId: user.id },
            include: {
                session: {
                    include: {
                        mock: {
                            select: {
                                id: true,
                                title: true,
                                description: true,
                                level: true,
                            },
                        },
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        return {
            success: true,
            data: bookmarks.map(b => ({
                id: b.session.id,
                mockTitle: b.session.mock.title,
                topic: b.session.mock.description,
                level: b.session.mock.level,
                status: b.session.status,
                sessionDate: b.session.createdAt,
                savedAt: b.createdAt,
                folder: b.folder,
                notes: b.notes,
            })),
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

        const existing = await prisma.mockInterviewBookmark.findUnique({
            where: {
                sessionId_userId: {
                    sessionId,
                    userId: user.id,
                },
            },
        });

        if (existing) {
            await prisma.mockInterviewBookmark.delete({
                where: { id: existing.id },
            });
            return { success: true, bookmarked: false };
        } else {
            await prisma.mockInterviewBookmark.create({
                data: {
                    sessionId,
                    userId: user.id,
                },
            });
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

export async function isConceptBookmarked(conceptId: string) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return { success: true, bookmarked: false };
        }

        const bookmark = await prisma.conceptBookmark.findUnique({
            where: {
                conceptId_userId: {
                    conceptId,
                    userId: user.id,
                },
            },
        });

        return { success: true, bookmarked: !!bookmark };
    } catch (error) {
        console.error("Error checking concept bookmark:", error);
        return { success: false, bookmarked: false };
    }
}

export async function isProjectBookmarked(projectId: string, version: "v1" | "v2" = "v2") {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return { success: true, bookmarked: false };
        }

        // All project bookmarks now use ProjectV2Bookmark
        const bookmark = await prisma.projectV2Bookmark.findUnique({
            where: {
                projectId_userId: {
                    projectId,
                    userId: user.id,
                },
            },
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

        const bookmark = await prisma.communityPostBookmark.findUnique({
            where: {
                postId_userId: {
                    postId,
                    userId: user.id,
                },
            },
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

        const [conceptCount, projectV2Count, communityCount, mockCount] = await Promise.all([
            prisma.conceptBookmark.count({ where: { userId: user.id } }),
            prisma.projectV2Bookmark.count({ where: { userId: user.id } }),
            prisma.communityPostBookmark.count({ where: { userId: user.id } }),
            prisma.mockInterviewBookmark.count({ where: { userId: user.id } }),
        ]);

        return {
            success: true,
            data: {
                concepts: conceptCount,
                projects: projectV2Count,
                community: communityCount,
                mock: mockCount,
                total: conceptCount + projectV2Count + communityCount + mockCount,
            },
        };
    } catch (error) {
        console.error("Error fetching bookmark stats:", error);
        return { success: false, error: "Failed to fetch stats" };
    }
}