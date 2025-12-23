"use server";

import { auth } from "@/auth";
import { prisma } from "@repo/prisma";
import { revalidatePath } from "next/cache";
import {
    ConceptCategory,
    ConceptDifficulty,
    ConceptStatus,
    ConceptStepType,
    ConceptRequestStatus,
} from "@repo/prisma/client";

// ==========================================
// TYPES
// ==========================================
export interface ConceptFormData {
    title: string;
    description: string;
    category: ConceptCategory;
    customCategory?: string;
    difficulty: ConceptDifficulty;
    tags?: string[];
    thumbnail?: string;
    coverImage?: string;
    iconEmoji?: string;
    accentColor?: string;
    estimatedTime?: number;
    prerequisites?: string[];
    metaTitle?: string;
    metaDescription?: string;
}

export interface ConceptStepFormData {
    order: number;
    title: string;
    type: ConceptStepType;
    content: string;
    language?: string;
    visualizationType?: string;
    visualizationData?: any;
    comparisonItems?: any;
    quizQuestion?: string;
    quizOptions?: any;
    quizExplanation?: string;
    challengeDescription?: string;
    challengeStarterCode?: string;
    challengeSolution?: string;
    challengeHints?: string[];
    challengeTestCases?: any;
    tips?: string[];
}

export interface CodeBlockFormData {
    order: number;
    title?: string;
    language: string;
    code: string;
    explanation?: string;
    highlightLines?: number[];
    showLineNumbers?: boolean;
    isRunnable?: boolean;
}

export interface ConceptFilters {
    search?: string;
    category?: ConceptCategory;
    difficulty?: ConceptDifficulty;
    status?: ConceptStatus;
    tags?: string[];
    sortBy?: "latest" | "popular" | "views" | "likes";
    page?: number;
    limit?: number;
}

// ==========================================
// HELPER FUNCTIONS
// ==========================================
function generateSlug(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
}

async function checkIsAdmin() {
    const session = await auth();
    if (!session?.user?.id) {
        return { isAdmin: false, error: "Unauthorized" };
    }
    
    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true },
    });
    
    if (user?.role !== "Admin") {
        return { isAdmin: false, error: "Admin access required" };
    }
    
    return { isAdmin: true, userId: session.user.id };
}

// ==========================================
// CONCEPT CRUD OPERATIONS
// ==========================================

export async function getConcepts(filters: ConceptFilters = {}) {
    try {
        const {
            search,
            category,
            difficulty,
            status = ConceptStatus.PUBLISHED,
            tags,
            sortBy = "latest",
            page = 1,
            limit = 12,
        } = filters;

        const where: any = {};

        // Only show published concepts to non-admins
        const session = await auth();
        const user = session?.user?.id
            ? await prisma.user.findUnique({
                  where: { id: session.user.id },
                  select: { role: true },
              })
            : null;

        if (user?.role !== "Admin") {
            where.status = ConceptStatus.PUBLISHED;
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

        if (category) {
            where.category = category;
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

        const [concepts, total] = await Promise.all([
            prisma.concept.findMany({
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
                    _count: {
                        select: {
                            steps: true,
                            likes: true,
                            comments: true,
                        },
                    },
                },
            }),
            prisma.concept.count({ where }),
        ]);

        return {
            concepts,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    } catch (error) {
        console.error("Error fetching concepts:", error);
        return { error: "Failed to fetch concepts" };
    }
}

export async function getConceptBySlug(slug: string) {
    try {
        const session = await auth();
        const userId = session?.user?.id;

        const concept = await prisma.concept.findUnique({
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

        if (!concept) {
            return { error: "Concept not found" };
        }

        // Check access
        if (concept.status !== ConceptStatus.PUBLISHED) {
            const adminCheck = await checkIsAdmin();
            if (!adminCheck.isAdmin && concept.creatorId !== userId) {
                return { error: "Concept not available" };
            }
        }

        // Get user's interaction status
        let isLiked = false;
        let isBookmarked = false;
        let progress = null;

        if (userId) {
            const [like, bookmark, userProgress] = await Promise.all([
                prisma.conceptLike.findUnique({
                    where: { conceptId_userId: { conceptId: concept.id, userId } },
                }),
                prisma.conceptBookmark.findUnique({
                    where: { conceptId_userId: { conceptId: concept.id, userId } },
                }),
                prisma.conceptProgress.findUnique({
                    where: { conceptId_userId: { conceptId: concept.id, userId } },
                }),
            ]);

            isLiked = !!like;
            isBookmarked = !!bookmark;
            progress = userProgress;
        }

        return { concept, isLiked, isBookmarked, progress };
    } catch (error) {
        console.error("Error fetching concept:", error);
        return { error: "Failed to fetch concept" };
    }
}

export async function createConcept(data: ConceptFormData) {
    try {
        const adminCheck = await checkIsAdmin();
        if (!adminCheck.isAdmin) {
            return { error: adminCheck.error };
        }

        // Generate unique slug
        let slug = generateSlug(data.title);
        const existingSlug = await prisma.concept.findUnique({ where: { slug } });
        if (existingSlug) {
            slug = `${slug}-${Date.now().toString(36)}`;
        }

        const concept = await prisma.concept.create({
            data: {
                slug,
                title: data.title,
                description: data.description,
                category: data.category,
                customCategory: data.customCategory,
                difficulty: data.difficulty,
                tags: data.tags || [],
                thumbnail: data.thumbnail,
                coverImage: data.coverImage,
                iconEmoji: data.iconEmoji || "📚",
                accentColor: data.accentColor || "#3B82F6",
                estimatedTime: data.estimatedTime || 10,
                prerequisites: data.prerequisites || [],
                metaTitle: data.metaTitle,
                metaDescription: data.metaDescription,
                status: ConceptStatus.DRAFT,
                creatorId: adminCheck.userId!,
            },
        });

        revalidatePath("/concepts");
        return { concept };
    } catch (error) {
        console.error("Error creating concept:", error);
        return { error: "Failed to create concept" };
    }
}

export async function updateConcept(conceptId: string, data: Partial<ConceptFormData>) {
    try {
        const adminCheck = await checkIsAdmin();
        if (!adminCheck.isAdmin) {
            return { error: adminCheck.error };
        }

        const concept = await prisma.concept.update({
            where: { id: conceptId },
            data: {
                ...(data.title && { title: data.title }),
                ...(data.description && { description: data.description }),
                ...(data.category && { category: data.category }),
                ...(data.customCategory !== undefined && { customCategory: data.customCategory }),
                ...(data.difficulty && { difficulty: data.difficulty }),
                ...(data.tags && { tags: data.tags }),
                ...(data.thumbnail !== undefined && { thumbnail: data.thumbnail }),
                ...(data.coverImage !== undefined && { coverImage: data.coverImage }),
                ...(data.iconEmoji && { iconEmoji: data.iconEmoji }),
                ...(data.accentColor && { accentColor: data.accentColor }),
                ...(data.estimatedTime && { estimatedTime: data.estimatedTime }),
                ...(data.prerequisites && { prerequisites: data.prerequisites }),
                ...(data.metaTitle !== undefined && { metaTitle: data.metaTitle }),
                ...(data.metaDescription !== undefined && { metaDescription: data.metaDescription }),
            },
        });

        revalidatePath("/concepts");
        revalidatePath(`/concepts/${concept.slug}`);
        return { concept };
    } catch (error) {
        console.error("Error updating concept:", error);
        return { error: "Failed to update concept" };
    }
}

export async function publishConcept(conceptId: string) {
    try {
        const adminCheck = await checkIsAdmin();
        if (!adminCheck.isAdmin) {
            return { error: adminCheck.error };
        }

        const concept = await prisma.concept.update({
            where: { id: conceptId },
            data: {
                status: ConceptStatus.PUBLISHED,
                publishedAt: new Date(),
            },
        });

        revalidatePath("/concepts");
        revalidatePath(`/concepts/${concept.slug}`);
        return { concept };
    } catch (error) {
        console.error("Error publishing concept:", error);
        return { error: "Failed to publish concept" };
    }
}

export async function unpublishConcept(conceptId: string) {
    try {
        const adminCheck = await checkIsAdmin();
        if (!adminCheck.isAdmin) {
            return { error: adminCheck.error };
        }

        const concept = await prisma.concept.update({
            where: { id: conceptId },
            data: {
                status: ConceptStatus.DRAFT,
            },
        });

        revalidatePath("/concepts");
        revalidatePath(`/concepts/${concept.slug}`);
        return { concept };
    } catch (error) {
        console.error("Error unpublishing concept:", error);
        return { error: "Failed to unpublish concept" };
    }
}

export async function archiveConcept(conceptId: string) {
    try {
        const adminCheck = await checkIsAdmin();
        if (!adminCheck.isAdmin) {
            return { error: adminCheck.error };
        }

        const concept = await prisma.concept.update({
            where: { id: conceptId },
            data: {
                status: ConceptStatus.ARCHIVED,
            },
        });

        revalidatePath("/concepts");
        return { concept };
    } catch (error) {
        console.error("Error archiving concept:", error);
        return { error: "Failed to archive concept" };
    }
}

export async function deleteConcept(conceptId: string) {
    try {
        const adminCheck = await checkIsAdmin();
        if (!adminCheck.isAdmin) {
            return { error: adminCheck.error };
        }

        await prisma.concept.delete({
            where: { id: conceptId },
        });

        revalidatePath("/concepts");
        return { success: true };
    } catch (error) {
        console.error("Error deleting concept:", error);
        return { error: "Failed to delete concept" };
    }
}

// ==========================================
// CONCEPT STEPS
// ==========================================

export async function addConceptStep(conceptId: string, data: ConceptStepFormData) {
    try {
        const adminCheck = await checkIsAdmin();
        if (!adminCheck.isAdmin) {
            return { error: adminCheck.error };
        }

        const step = await prisma.conceptStep.create({
            data: {
                conceptId,
                order: data.order,
                title: data.title,
                type: data.type,
                content: data.content,
                language: data.language,
                visualizationType: data.visualizationType,
                visualizationData: data.visualizationData,
                comparisonItems: data.comparisonItems,
                quizQuestion: data.quizQuestion,
                quizOptions: data.quizOptions,
                quizExplanation: data.quizExplanation,
                challengeDescription: data.challengeDescription,
                challengeStarterCode: data.challengeStarterCode,
                challengeSolution: data.challengeSolution,
                challengeHints: data.challengeHints || [],
                challengeTestCases: data.challengeTestCases,
                tips: data.tips || [],
            },
        });

        const concept = await prisma.concept.findUnique({
            where: { id: conceptId },
            select: { slug: true },
        });

        if (concept) {
            revalidatePath(`/concepts/${concept.slug}`);
        }

        return { step };
    } catch (error) {
        console.error("Error adding concept step:", error);
        return { error: "Failed to add step" };
    }
}

export async function updateConceptStep(stepId: string, data: Partial<ConceptStepFormData>) {
    try {
        const adminCheck = await checkIsAdmin();
        if (!adminCheck.isAdmin) {
            return { error: adminCheck.error };
        }

        const step = await prisma.conceptStep.update({
            where: { id: stepId },
            data: {
                ...(data.order !== undefined && { order: data.order }),
                ...(data.title && { title: data.title }),
                ...(data.type && { type: data.type }),
                ...(data.content && { content: data.content }),
                ...(data.language !== undefined && { language: data.language }),
                ...(data.visualizationType !== undefined && { visualizationType: data.visualizationType }),
                ...(data.visualizationData !== undefined && { visualizationData: data.visualizationData }),
                ...(data.comparisonItems !== undefined && { comparisonItems: data.comparisonItems }),
                ...(data.quizQuestion !== undefined && { quizQuestion: data.quizQuestion }),
                ...(data.quizOptions !== undefined && { quizOptions: data.quizOptions }),
                ...(data.quizExplanation !== undefined && { quizExplanation: data.quizExplanation }),
                ...(data.challengeDescription !== undefined && { challengeDescription: data.challengeDescription }),
                ...(data.challengeStarterCode !== undefined && { challengeStarterCode: data.challengeStarterCode }),
                ...(data.challengeSolution !== undefined && { challengeSolution: data.challengeSolution }),
                ...(data.challengeHints && { challengeHints: data.challengeHints }),
                ...(data.challengeTestCases !== undefined && { challengeTestCases: data.challengeTestCases }),
                ...(data.tips && { tips: data.tips }),
            },
            include: {
                concept: { select: { slug: true } },
            },
        });

        revalidatePath(`/concepts/${step.concept.slug}`);
        return { step };
    } catch (error) {
        console.error("Error updating concept step:", error);
        return { error: "Failed to update step" };
    }
}

export async function deleteConceptStep(stepId: string) {
    try {
        const adminCheck = await checkIsAdmin();
        if (!adminCheck.isAdmin) {
            return { error: adminCheck.error };
        }

        const step = await prisma.conceptStep.delete({
            where: { id: stepId },
            include: {
                concept: { select: { slug: true } },
            },
        });

        revalidatePath(`/concepts/${step.concept.slug}`);
        return { success: true };
    } catch (error) {
        console.error("Error deleting concept step:", error);
        return { error: "Failed to delete step" };
    }
}

export async function reorderConceptSteps(conceptId: string, stepOrders: { id: string; order: number }[]) {
    try {
        const adminCheck = await checkIsAdmin();
        if (!adminCheck.isAdmin) {
            return { error: adminCheck.error };
        }

        await prisma.$transaction(
            stepOrders.map(({ id, order }) =>
                prisma.conceptStep.update({
                    where: { id },
                    data: { order },
                })
            )
        );

        const concept = await prisma.concept.findUnique({
            where: { id: conceptId },
            select: { slug: true },
        });

        if (concept) {
            revalidatePath(`/concepts/${concept.slug}`);
        }

        return { success: true };
    } catch (error) {
        console.error("Error reordering steps:", error);
        return { error: "Failed to reorder steps" };
    }
}

// ==========================================
// CODE BLOCKS
// ==========================================

export async function addCodeBlock(stepId: string, data: CodeBlockFormData) {
    try {
        const adminCheck = await checkIsAdmin();
        if (!adminCheck.isAdmin) {
            return { error: adminCheck.error };
        }

        const codeBlock = await prisma.conceptCodeBlock.create({
            data: {
                stepId,
                order: data.order,
                title: data.title,
                language: data.language,
                code: data.code,
                explanation: data.explanation,
                highlightLines: data.highlightLines || [],
                showLineNumbers: data.showLineNumbers ?? true,
                isRunnable: data.isRunnable ?? false,
            },
        });

        return { codeBlock };
    } catch (error) {
        console.error("Error adding code block:", error);
        return { error: "Failed to add code block" };
    }
}

export async function updateCodeBlock(blockId: string, data: Partial<CodeBlockFormData>) {
    try {
        const adminCheck = await checkIsAdmin();
        if (!adminCheck.isAdmin) {
            return { error: adminCheck.error };
        }

        const codeBlock = await prisma.conceptCodeBlock.update({
            where: { id: blockId },
            data: {
                ...(data.order !== undefined && { order: data.order }),
                ...(data.title !== undefined && { title: data.title }),
                ...(data.language && { language: data.language }),
                ...(data.code && { code: data.code }),
                ...(data.explanation !== undefined && { explanation: data.explanation }),
                ...(data.highlightLines && { highlightLines: data.highlightLines }),
                ...(data.showLineNumbers !== undefined && { showLineNumbers: data.showLineNumbers }),
                ...(data.isRunnable !== undefined && { isRunnable: data.isRunnable }),
            },
        });

        return { codeBlock };
    } catch (error) {
        console.error("Error updating code block:", error);
        return { error: "Failed to update code block" };
    }
}

export async function deleteCodeBlock(blockId: string) {
    try {
        const adminCheck = await checkIsAdmin();
        if (!adminCheck.isAdmin) {
            return { error: adminCheck.error };
        }

        await prisma.conceptCodeBlock.delete({
            where: { id: blockId },
        });

        return { success: true };
    } catch (error) {
        console.error("Error deleting code block:", error);
        return { error: "Failed to delete code block" };
    }
}

// ==========================================
// USER INTERACTIONS
// ==========================================

export async function toggleConceptLike(conceptId: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { error: "Unauthorized" };
        }

        const existing = await prisma.conceptLike.findUnique({
            where: {
                conceptId_userId: { conceptId, userId: session.user.id },
            },
        });

        if (existing) {
            await prisma.$transaction([
                prisma.conceptLike.delete({
                    where: { id: existing.id },
                }),
                prisma.concept.update({
                    where: { id: conceptId },
                    data: { likeCount: { decrement: 1 } },
                }),
            ]);
            return { liked: false };
        } else {
            await prisma.$transaction([
                prisma.conceptLike.create({
                    data: { conceptId, userId: session.user.id },
                }),
                prisma.concept.update({
                    where: { id: conceptId },
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

export async function toggleConceptBookmark(conceptId: string, folder?: string, notes?: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { error: "Unauthorized" };
        }

        const existing = await prisma.conceptBookmark.findUnique({
            where: {
                conceptId_userId: { conceptId, userId: session.user.id },
            },
        });

        if (existing) {
            await prisma.$transaction([
                prisma.conceptBookmark.delete({
                    where: { id: existing.id },
                }),
                prisma.concept.update({
                    where: { id: conceptId },
                    data: { bookmarkCount: { decrement: 1 } },
                }),
            ]);
            return { bookmarked: false };
        } else {
            await prisma.$transaction([
                prisma.conceptBookmark.create({
                    data: {
                        conceptId,
                        userId: session.user.id,
                        folder: folder || "Saved",
                        notes,
                    },
                }),
                prisma.concept.update({
                    where: { id: conceptId },
                    data: { bookmarkCount: { increment: 1 } },
                }),
            ]);
            return { bookmarked: true };
        }
    } catch (error) {
        console.error("Error toggling bookmark:", error);
        return { error: "Failed to toggle bookmark" };
    }
}

export async function recordConceptView(conceptId: string, source?: string) {
    try {
        const session = await auth();
        const userId = session?.user?.id;

        await prisma.$transaction([
            prisma.conceptView.create({
                data: {
                    conceptId,
                    userId,
                    source: source || "direct",
                },
            }),
            prisma.concept.update({
                where: { id: conceptId },
                data: { viewCount: { increment: 1 } },
            }),
        ]);

        return { success: true };
    } catch (error) {
        console.error("Error recording view:", error);
        return { error: "Failed to record view" };
    }
}

// ==========================================
// PROGRESS TRACKING
// ==========================================

export async function updateConceptProgress(
    conceptId: string,
    currentStep: number,
    completedStep?: number
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { error: "Unauthorized" };
        }

        const concept = await prisma.concept.findUnique({
            where: { id: conceptId },
            include: { _count: { select: { steps: true } } },
        });

        if (!concept) {
            return { error: "Concept not found" };
        }

        const existing = await prisma.conceptProgress.findUnique({
            where: {
                conceptId_userId: { conceptId, userId: session.user.id },
            },
        });

        let completedSteps = existing?.completedSteps || [];
        if (completedStep !== undefined && !completedSteps.includes(completedStep)) {
            completedSteps = [...completedSteps, completedStep].sort((a, b) => a - b);
        }

        const totalSteps = concept._count.steps;
        const progressPercent = totalSteps > 0 ? (completedSteps.length / totalSteps) * 100 : 0;
        const isCompleted = completedSteps.length >= totalSteps;

        const progress = await prisma.conceptProgress.upsert({
            where: {
                conceptId_userId: { conceptId, userId: session.user.id },
            },
            update: {
                currentStep,
                completedSteps,
                totalSteps,
                progressPercent,
                isCompleted,
                completedAt: isCompleted ? new Date() : null,
                lastAccessedAt: new Date(),
            },
            create: {
                conceptId,
                userId: session.user.id,
                currentStep,
                completedSteps,
                totalSteps,
                progressPercent,
                isCompleted,
                completedAt: isCompleted ? new Date() : null,
            },
        });

        return { progress };
    } catch (error) {
        console.error("Error updating progress:", error);
        return { error: "Failed to update progress" };
    }
}

export async function submitQuizAnswer(
    conceptId: string,
    stepId: string,
    selectedOption: number,
    isCorrect: boolean
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { error: "Unauthorized" };
        }

        const existing = await prisma.conceptProgress.findUnique({
            where: {
                conceptId_userId: { conceptId, userId: session.user.id },
            },
        });

        const quizAnswers = (existing?.quizAnswers as Record<string, any>) || {};
        quizAnswers[stepId] = { selectedOption, isCorrect };

        await prisma.conceptProgress.upsert({
            where: {
                conceptId_userId: { conceptId, userId: session.user.id },
            },
            update: {
                quizAnswers,
            },
            create: {
                conceptId,
                userId: session.user.id,
                quizAnswers,
            },
        });

        return { success: true };
    } catch (error) {
        console.error("Error submitting quiz answer:", error);
        return { error: "Failed to submit answer" };
    }
}

export async function submitChallengeCode(
    conceptId: string,
    stepId: string,
    code: string,
    passed: boolean
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { error: "Unauthorized" };
        }

        const existing = await prisma.conceptProgress.findUnique({
            where: {
                conceptId_userId: { conceptId, userId: session.user.id },
            },
        });

        const challengeSubmissions = (existing?.challengeSubmissions as Record<string, any>) || {};
        challengeSubmissions[stepId] = { code, passed, submittedAt: new Date().toISOString() };

        await prisma.conceptProgress.upsert({
            where: {
                conceptId_userId: { conceptId, userId: session.user.id },
            },
            update: {
                challengeSubmissions,
            },
            create: {
                conceptId,
                userId: session.user.id,
                challengeSubmissions,
            },
        });

        return { success: true };
    } catch (error) {
        console.error("Error submitting challenge:", error);
        return { error: "Failed to submit challenge" };
    }
}

export async function getUserProgress() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { error: "Unauthorized" };
        }

        const progress = await prisma.conceptProgress.findMany({
            where: { userId: session.user.id },
            include: {
                concept: {
                    select: {
                        id: true,
                        slug: true,
                        title: true,
                        thumbnail: true,
                        iconEmoji: true,
                        category: true,
                        difficulty: true,
                        estimatedTime: true,
                    },
                },
            },
            orderBy: { lastAccessedAt: "desc" },
        });

        const inProgress = progress.filter((p) => !p.isCompleted);
        const completed = progress.filter((p) => p.isCompleted);

        return { inProgress, completed };
    } catch (error) {
        console.error("Error fetching progress:", error);
        return { error: "Failed to fetch progress" };
    }
}

// ==========================================
// BOOKMARKS
// ==========================================

export async function getUserBookmarks(folder?: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { error: "Unauthorized" };
        }

        const where: any = { userId: session.user.id };
        if (folder) {
            where.folder = folder;
        }

        const bookmarks = await prisma.conceptBookmark.findMany({
            where,
            include: {
                concept: {
                    select: {
                        id: true,
                        slug: true,
                        title: true,
                        description: true,
                        thumbnail: true,
                        iconEmoji: true,
                        category: true,
                        difficulty: true,
                        estimatedTime: true,
                        likeCount: true,
                        viewCount: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        // Get unique folders
        const folders = await prisma.conceptBookmark.groupBy({
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

export async function updateBookmark(conceptId: string, folder?: string, notes?: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { error: "Unauthorized" };
        }

        const bookmark = await prisma.conceptBookmark.update({
            where: {
                conceptId_userId: { conceptId, userId: session.user.id },
            },
            data: {
                ...(folder && { folder }),
                ...(notes !== undefined && { notes }),
            },
        });

        return { bookmark };
    } catch (error) {
        console.error("Error updating bookmark:", error);
        return { error: "Failed to update bookmark" };
    }
}

// ==========================================
// COMMENTS
// ==========================================

export async function getConceptComments(conceptId: string, page = 1, limit = 20) {
    try {
        const [comments, total] = await Promise.all([
            prisma.conceptComment.findMany({
                where: {
                    conceptId,
                    parentId: null, // Top-level comments only
                    isHidden: false,
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            username: true,
                            image: true,
                        },
                    },
                    replies: {
                        where: { isHidden: false },
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                    username: true,
                                    image: true,
                                },
                            },
                        },
                        orderBy: { createdAt: "asc" },
                    },
                },
                orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.conceptComment.count({
                where: { conceptId, parentId: null, isHidden: false },
            }),
        ]);

        return {
            comments,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    } catch (error) {
        console.error("Error fetching comments:", error);
        return { error: "Failed to fetch comments" };
    }
}

export async function addComment(conceptId: string, content: string, parentId?: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { error: "Unauthorized" };
        }

        const comment = await prisma.conceptComment.create({
            data: {
                conceptId,
                userId: session.user.id,
                content,
                parentId,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        image: true,
                    },
                },
            },
        });

        await prisma.concept.update({
            where: { id: conceptId },
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
        if (!session?.user?.id) {
            return { error: "Unauthorized" };
        }

        const comment = await prisma.conceptComment.update({
            where: {
                id: commentId,
                userId: session.user.id,
            },
            data: {
                content,
                isEdited: true,
            },
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
        if (!session?.user?.id) {
            return { error: "Unauthorized" };
        }

        const comment = await prisma.conceptComment.findUnique({
            where: { id: commentId },
            select: { userId: true, conceptId: true },
        });

        if (!comment) {
            return { error: "Comment not found" };
        }

        const adminCheck = await checkIsAdmin();
        if (comment.userId !== session.user.id && !adminCheck.isAdmin) {
            return { error: "Not authorized to delete this comment" };
        }

        await prisma.$transaction([
            prisma.conceptComment.delete({ where: { id: commentId } }),
            prisma.concept.update({
                where: { id: comment.conceptId },
                data: { commentCount: { decrement: 1 } },
            }),
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
        if (!adminCheck.isAdmin) {
            return { error: adminCheck.error };
        }

        const comment = await prisma.conceptComment.update({
            where: { id: commentId },
            data: { isPinned: true },
        });

        return { comment };
    } catch (error) {
        console.error("Error pinning comment:", error);
        return { error: "Failed to pin comment" };
    }
}

// ==========================================
// CONCEPT REQUESTS
// ==========================================

export async function submitConceptRequest(
    title: string,
    description: string,
    category?: ConceptCategory,
    difficulty?: ConceptDifficulty
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { error: "Unauthorized" };
        }

        const request = await prisma.conceptRequest.create({
            data: {
                userId: session.user.id,
                title,
                description,
                category,
                difficulty,
            },
        });

        return { request };
    } catch (error) {
        console.error("Error submitting request:", error);
        return { error: "Failed to submit request" };
    }
}

export async function getConceptRequests(status?: ConceptRequestStatus) {
    try {
        const adminCheck = await checkIsAdmin();
        if (!adminCheck.isAdmin) {
            return { error: adminCheck.error };
        }

        const where: any = {};
        if (status) {
            where.status = status;
        }

        const requests = await prisma.conceptRequest.findMany({
            where,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        image: true,
                    },
                },
            },
            orderBy: [{ upvotes: "desc" }, { createdAt: "desc" }],
        });

        return { requests };
    } catch (error) {
        console.error("Error fetching requests:", error);
        return { error: "Failed to fetch requests" };
    }
}

export async function updateConceptRequestStatus(
    requestId: string,
    status: ConceptRequestStatus,
    adminNotes?: string,
    resultConceptId?: string
) {
    try {
        const adminCheck = await checkIsAdmin();
        if (!adminCheck.isAdmin) {
            return { error: adminCheck.error };
        }

        const request = await prisma.conceptRequest.update({
            where: { id: requestId },
            data: {
                status,
                adminNotes,
                assignedTo: adminCheck.userId,
                resultConceptId,
                resolvedAt: status === ConceptRequestStatus.COMPLETED || status === ConceptRequestStatus.REJECTED
                    ? new Date()
                    : null,
            },
        });

        return { request };
    } catch (error) {
        console.error("Error updating request:", error);
        return { error: "Failed to update request" };
    }
}

// ==========================================
// ANALYTICS & STATS
// ==========================================

export async function getConceptStats() {
    try {
        const adminCheck = await checkIsAdmin();
        if (!adminCheck.isAdmin) {
            return { error: adminCheck.error };
        }

        const [
            totalConcepts,
            publishedConcepts,
            draftConcepts,
            totalViews,
            totalLikes,
            totalComments,
            categoryStats,
            recentViews,
        ] = await Promise.all([
            prisma.concept.count(),
            prisma.concept.count({ where: { status: ConceptStatus.PUBLISHED } }),
            prisma.concept.count({ where: { status: ConceptStatus.DRAFT } }),
            prisma.concept.aggregate({ _sum: { viewCount: true } }),
            prisma.concept.aggregate({ _sum: { likeCount: true } }),
            prisma.concept.aggregate({ _sum: { commentCount: true } }),
            prisma.concept.groupBy({
                by: ["category"],
                _count: true,
            }),
            prisma.conceptView.count({
                where: {
                    viewedAt: {
                        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
                    },
                },
            }),
        ]);

        return {
            totalConcepts,
            publishedConcepts,
            draftConcepts,
            totalViews: totalViews._sum.viewCount || 0,
            totalLikes: totalLikes._sum.likeCount || 0,
            totalComments: totalComments._sum.commentCount || 0,
            categoryStats,
            recentViews,
        };
    } catch (error) {
        console.error("Error fetching stats:", error);
        return { error: "Failed to fetch stats" };
    }
}

export async function getTrendingConcepts(limit = 6) {
    try {
        const concepts = await prisma.concept.findMany({
            where: { status: ConceptStatus.PUBLISHED },
            orderBy: [
                { likeCount: "desc" },
                { viewCount: "desc" },
            ],
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
                _count: {
                    select: {
                        steps: true,
                    },
                },
            },
        });

        return { concepts };
    } catch (error) {
        console.error("Error fetching trending concepts:", error);
        return { error: "Failed to fetch trending concepts" };
    }
}

export async function getCategories() {
    try {
        const categories = await prisma.concept.groupBy({
            by: ["category"],
            where: { status: ConceptStatus.PUBLISHED },
            _count: true,
        });

        return { categories };
    } catch (error) {
        console.error("Error fetching categories:", error);
        return { error: "Failed to fetch categories" };
    }
}
