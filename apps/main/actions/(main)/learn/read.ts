
"use server";

import { prisma } from "@repo/prisma";
import { auth } from '@repo/auth';
import {
    LearnStatus
} from "@repo/prisma/client";
import { LearnFilters } from "./types";
import { checkIsAdmin, checkIsAuthenticated } from "./utils";

// ==========================================
// READ OPERATIONS
// ==========================================

export async function getLearns(filters: LearnFilters = {}) {
    try {
        const {
            search,
            mainCategoryId,
            subCategoryId,
            difficulty,
            status = LearnStatus.PUBLISHED,
            tags,
            sortBy = "latest",
            page = 1,
            limit = 12,
        } = filters;

        const where: any = {};

        const session = await auth();
        const user = session?.user?.id
            ? await prisma.user.findUnique({
                where: { id: session.user.id },
                select: { role: true },
            })
            : null;

        if (user?.role !== "Admin") {
            where.status = LearnStatus.PUBLISHED;
        } else if (status) {
            where.status = status;
        }

        if (search) {
            where.OR = [
                { title: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
                { tags: { hasSome: [search.toLowerCase()] } },
            ];
        }



        if (subCategoryId) {
            where.subCategoryId = subCategoryId;
        } else if (mainCategoryId) {
            where.mainCategoryId = mainCategoryId;
        }

        if (difficulty) {
            where.difficulty = difficulty;
        }

        if (tags && tags.length > 0) {
            where.tags = { hasSome: tags };
        }

        let orderBy: any = { createdAt: "desc" };
        switch (sortBy) {
            case "popular":
                orderBy = { likeCount: "desc" };
                break;
            case "views":
                orderBy = { viewCount: "desc" };
                break;
            case "likes":
                orderBy = { likeCount: "desc" };
                break;
            default:
                orderBy = { createdAt: "desc" };
        }

        const [learns, total] = await Promise.all([
            prisma.learn.findMany({
                where,
                orderBy,
                skip: (page - 1) * limit,
                take: limit,
                include: {
                    creator: {
                        select: {
                            id: true,
                            name: true,
                            username: true,
                            image: true,
                        },
                    },
                    mainCategory: { select: { id: true, name: true, slug: true } },
                    subCategory: { select: { id: true, name: true, slug: true } },
                    _count: {
                        select: {
                            steps: true,
                            likes: true,
                            comments: true,
                        },
                    },
                    prerequisiteOf: {
                        include: {
                            prerequisite: {
                                select: { id: true, title: true, slug: true },
                            },
                        },
                    },
                },
            }),
            prisma.learn.count({ where }),
        ]);

        return {
            learns,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    } catch (error) {
        console.error("Error fetching learns:", error);
        return { error: "Failed to fetch learns" };
    }
}

export async function getLearnBySlug(slug: string) {
    try {
        const session = await auth();
        const userId = session?.user?.id;

        const learn = await prisma.learn.findUnique({
            where: { slug },
            include: {
                creator: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        image: true,
                    },
                },
                steps: {
                    orderBy: { order: "asc" },
                    include: {
                        codeBlocks: {
                            orderBy: { order: "asc" },
                        },
                    },
                },
                mainCategory: { 
                    select: { 
                        id: true, 
                        name: true, 
                        slug: true 
                    } 
                },
                subCategory: { 
                    select: { 
                        id: true, 
                        name: true, 
                        slug: true 
                    } 
                },
                _count: {
                    select: {
                        likes: true,
                        bookmarks: true,
                        comments: true,
                        views: true,
                    },
                },
            },
        });

        if (!learn) {
            return { error: "learn not found" };
        }

        const user = userId
            ? await prisma.user.findUnique({
                where: { id: userId },
                select: { role: true },
            })
            : null;
        const isAdmin = user?.role === "Admin";
        const isCreator = learn.creatorId === userId;

        if (learn.status === LearnStatus.DRAFT) {
            if (!isAdmin && !isCreator) {
                return { error: "learn not available" };
            }
        }



        let isLiked = false;
        let isBookmarked = false;
        let progress = null;

        if (userId) {
            const [like, bookmark, userProgress] = await Promise.all([
                prisma.learnLike.findUnique({
                    where: { learnId_userId: { learnId: learn.id, userId } },
                }),
                prisma.learnBookmark.findUnique({
                    where: { learnId_userId: { learnId: learn.id, userId } },
                }),
                prisma.learnProgress.findUnique({
                    where: { learnId_userId: { learnId: learn.id, userId } },
                }),
            ]);

            isLiked = !!like;
            isBookmarked = !!bookmark;
            progress = userProgress;
        }

        const hasFullAccess = true;

        return {
            learn,
            isLiked,
            isBookmarked,
            progress,
            hasFullAccess,
            isCreator,
            isAdmin,
        };
    } catch (error) {
        console.error("Error fetching learn:", error);
        return { error: "Failed to fetch learn" };
    }
}

export async function getLearnForEditing(learnId: string) {
    try {
        const authCheck = await checkIsAuthenticated();
        if (!authCheck.isAuthenticated) {
            return { error: authCheck.error };
        }

        const learn = await prisma.learn.findUnique({
            where: { id: learnId },
            include: {
                steps: {
                    orderBy: { order: "asc" },
                    include: {
                        codeBlocks: { orderBy: { order: "asc" } },
                    },
                },
            },
        });

        if (!learn) {
            return { error: "learn not found" };
        }

        const adminCheck = await checkIsAdmin();
        if (!adminCheck.isAdmin && learn.creatorId !== authCheck.userId) {
            return { error: "Not authorized to edit this learn" };
        }

        return { learn };
    } catch (error) {
        console.error("Error fetching learn for editing:", error);
        return { error: "Failed to fetch learn" };
    }
}

export async function getUserDraftLearns() {
    try {
        const authCheck = await checkIsAuthenticated();
        if (!authCheck.isAuthenticated) {
            return { error: authCheck.error };
        }

        const drafts = await prisma.learn.findMany({
            where: {
                creatorId: authCheck.userId,
                status: LearnStatus.DRAFT,
            },
            orderBy: { updatedAt: "desc" },
            include: {
                _count: {
                    select: { steps: true },
                },
            },
        });

        return { drafts };
    } catch (error) {
        console.error("Error fetching drafts:", error);
        return { error: "Failed to fetch drafts", drafts: [] };
    }
}

export async function searchLearns(query: string, excludeId?: string) {
    try {
        const learns = await prisma.learn.findMany({
            where: {
                AND: [
                    {
                        OR: [
                            { title: { contains: query, mode: "insensitive" } },
                            { tags: { hasSome: [query.toLowerCase()] } },
                        ],
                    },
                    ...(excludeId ? [{ NOT: { id: excludeId } }] : []),
                    // Only search published/verified ones generally, but for linking internally maybe all visible?
                    // Stick to published for search
                    { status: LearnStatus.PUBLISHED },
                ],
            },
            select: {
                id: true,
                slug: true,
                title: true,
                iconEmoji: true,
                difficulty: true,
                mainCategory: { select: { name: true } },
                subCategory: { select: { name: true } },
            },
            take: 10,
        });

        return { learns };
    } catch (error) {
        console.error("Error searching learns:", error);
        return { error: "Failed to search learns" };
    }
}

export async function getLearnChain(learnId: string) {
    try {
        const [prerequisites, prerequisiteFor] = await Promise.all([
            prisma.learnPrerequisite.findMany({
                where: { learnId },
                include: {
                    prerequisite: {
                        select: {
                            id: true,
                            slug: true,
                            title: true,
                            iconEmoji: true,
                            difficulty: true,
                            mainCategory: { select: { name: true } },
                            subCategory: { select: { name: true } },
                            estimatedTime: true,
                            status: true,
                        },
                    },
                },
            }),
            prisma.learnPrerequisite.findMany({
                where: { prerequisiteId: learnId },
                include: {
                    learn: {
                        select: {
                            id: true,
                            slug: true,
                            title: true,
                            iconEmoji: true,
                            difficulty: true,
                            mainCategory: { select: { name: true } },
                            subCategory: { select: { name: true } },
                            estimatedTime: true,
                            status: true,
                        },
                    },
                },
            }),
        ]);

        return {
            previous: prerequisites
                .map(p => p.prerequisite)
                .filter(c => c.status === LearnStatus.PUBLISHED),
            next: prerequisiteFor
                .map(p => p.learn)
                .filter(c => c.status === LearnStatus.PUBLISHED),
        };
    } catch (error) {
        console.error("Error fetching learn chain:", error);
        return { previous: [], next: [] };
    }
}