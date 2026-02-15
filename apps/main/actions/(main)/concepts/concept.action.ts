"use server";

import { auth } from '@repo/auth';
import { prisma } from "@repo/prisma";
import { revalidatePath } from "next/cache";
import {
    ConceptCategory, ConceptDifficulty, ConceptStatus, ConceptStepType,
    ConceptRequestStatus, PrismaValue, ConceptPricingType, Module, CreditType, Currency
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
    // New monetization fields
    pricingType?: ConceptPricingType;
    price?: number;
}

export interface ConceptStepFormData {
    order: number;
    title: string;
    type: ConceptStepType;
    content: string;
    // Type-specific JSON data (polymorphic)
    stepData?: Record<string, unknown>;
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

    return { 
        isAdmin: user?.role === "Admin", 
        userId: session.user.id,
        role: user?.role 
    };
}

async function checkIsAuthenticated() {
    const session = await auth();
    if (!session?.user?.id) {
        return { isAuthenticated: false, error: "Unauthorized" };
    }
    return { isAuthenticated: true, userId: session.user.id };
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

        // Only show verified published concepts to non-admins
        const session = await auth();
        const user = session?.user?.id
            ? await prisma.user.findUnique({
                where: { id: session.user.id },
                select: { role: true },
            })
            : null;

        if (user?.role !== "Admin") {
            // For regular users, only show verified published concepts
            where.status = ConceptStatus.PUBLISHED;
            where.verifiedAt = { not: null }; // Must be verified
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

        // Get user role
        const user = userId 
            ? await prisma.user.findUnique({
                where: { id: userId },
                select: { role: true },
            })
            : null;
        const isAdmin = user?.role === "Admin";
        const isCreator = concept.creatorId === userId;

        // Check access based on status
        if (concept.status === ConceptStatus.DRAFT) {
            // Only creator or admin can see drafts
            if (!isAdmin && !isCreator) {
                return { error: "Concept not available" };
            }
        }

        if (concept.status === ConceptStatus.PENDING_VERIFICATION) {
            // Only creator or admin can see pending concepts
            if (!isAdmin && !isCreator) {
                return { error: "This concept is pending verification. Please check back later." };
            }
        }

        if (concept.status === ConceptStatus.PUBLISHED && !concept.verifiedAt) {
            // If published but not verified, only creator or admin can see
            if (!isAdmin && !isCreator) {
                return { error: "This concept is pending verification. Please check back later." };
            }
        }

        // Get user's interaction status
        let isLiked = false;
        let isBookmarked = false;
        let progress = null;
        let hasPurchased = false;

        if (userId) {
            const [like, bookmark, userProgress, purchase] = await Promise.all([
                prisma.conceptLike.findUnique({
                    where: { conceptId_userId: { conceptId: concept.id, userId } },
                }),
                prisma.conceptBookmark.findUnique({
                    where: { conceptId_userId: { conceptId: concept.id, userId } },
                }),
                prisma.conceptProgress.findUnique({
                    where: { conceptId_userId: { conceptId: concept.id, userId } },
                }),
                concept.pricingType === "PAID" 
                    ? prisma.conceptPurchase.findUnique({
                        where: { conceptId_userId: { conceptId: concept.id, userId } },
                    })
                    : null,
            ]);

            isLiked = !!like;
            isBookmarked = !!bookmark;
            progress = userProgress;
            hasPurchased = !!purchase || isCreator || isAdmin;
        }

        // Determine access level
        const hasFullAccess = concept.pricingType === "FREE" || hasPurchased || isCreator || isAdmin;

        return { 
            concept, 
            isLiked, 
            isBookmarked, 
            progress, 
            hasPurchased,
            hasFullAccess,
            isCreator,
            isAdmin,
        };
    } catch (error) {
        console.error("Error fetching concept:", error);
        return { error: "Failed to fetch concept" };
    }
}

export async function createConcept(data: ConceptFormData) {
    try {
        // Any authenticated user can create concepts now
        const authCheck = await checkIsAuthenticated();
        if (!authCheck.isAuthenticated) {
            return { error: authCheck.error };
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
                creatorId: authCheck.userId!,
                // Monetization
                pricingType: data.pricingType || ConceptPricingType.FREE,
                price: data.price || 0,
                isPaid: data.pricingType === ConceptPricingType.PAID,
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
        const authCheck = await checkIsAuthenticated();
        if (!authCheck.isAuthenticated) {
            return { error: authCheck.error };
        }

        // Check if user is admin or the creator
        const concept = await prisma.concept.findUnique({
            where: { id: conceptId },
            select: { creatorId: true },
        });

        if (!concept) {
            return { error: "Concept not found" };
        }

        const adminCheck = await checkIsAdmin();
        if (!adminCheck.isAdmin && concept.creatorId !== authCheck.userId) {
            return { error: "Not authorized to edit this concept" };
        }

        const updatedConcept = await prisma.concept.update({
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
                // Monetization updates
                ...(data.pricingType && { 
                    pricingType: data.pricingType,
                    isPaid: data.pricingType === ConceptPricingType.PAID,
                }),
                ...(data.price !== undefined && { price: data.price }),
            },
        });

        revalidatePath("/concepts");
        revalidatePath(`/concepts/${updatedConcept.slug}`);
        return { concept: updatedConcept };
    } catch (error) {
        console.error("Error updating concept:", error);
        return { error: "Failed to update concept" };
    }
}

export async function publishConcept(conceptId: string) {
    try {
        const authCheck = await checkIsAuthenticated();
        if (!authCheck.isAuthenticated) {
            return { error: authCheck.error };
        }

        // Check if user is admin or the creator
        const concept = await prisma.concept.findUnique({
            where: { id: conceptId },
            select: { creatorId: true },
        });

        if (!concept) {
            return { error: "Concept not found" };
        }

        const adminCheck = await checkIsAdmin();
        if (!adminCheck.isAdmin && concept.creatorId !== authCheck.userId) {
            return { error: "Not authorized to publish this concept" };
        }

        // If admin publishes, directly verify
        if (adminCheck.isAdmin) {
            const updatedConcept = await prisma.concept.update({
                where: { id: conceptId },
                data: {
                    status: ConceptStatus.PUBLISHED,
                    publishedAt: new Date(),
                    verifiedAt: new Date(),
                    verifiedBy: adminCheck.userId,
                },
            });
            revalidatePath("/concepts");
            revalidatePath(`/concepts/${updatedConcept.slug}`);
            return { concept: updatedConcept };
        }

        // For regular users, send for verification
        const updatedConcept = await prisma.concept.update({
            where: { id: conceptId },
            data: {
                status: ConceptStatus.PENDING_VERIFICATION,
                publishedAt: new Date(),
            },
        });

        revalidatePath("/concepts");
        revalidatePath(`/concepts/${updatedConcept.slug}`);
        return { concept: updatedConcept, pendingVerification: true };
    } catch (error) {
        console.error("Error publishing concept:", error);
        return { error: "Failed to publish concept" };
    }
}

// Admin-only function to verify concepts
export async function verifyConcept(conceptId: string) {
    try {
        const adminCheck = await checkIsAdmin();
        if (!adminCheck.isAdmin) {
            return { error: "Only admins can verify concepts" };
        }

        const concept = await prisma.concept.update({
            where: { id: conceptId },
            data: {
                status: ConceptStatus.PUBLISHED,
                verifiedAt: new Date(),
                verifiedBy: adminCheck.userId,
            },
        });

        revalidatePath("/concepts");
        revalidatePath(`/concepts/${concept.slug}`);
        return { concept };
    } catch (error) {
        console.error("Error verifying concept:", error);
        return { error: "Failed to verify concept" };
    }
}

// Admin-only function to reject concepts
export async function rejectConcept(conceptId: string, reason?: string) {
    try {
        const adminCheck = await checkIsAdmin();
        if (!adminCheck.isAdmin) {
            return { error: "Only admins can reject concepts" };
        }

        const concept = await prisma.concept.update({
            where: { id: conceptId },
            data: {
                status: ConceptStatus.DRAFT,
            },
        });

        // TODO: Send notification to creator with rejection reason

        revalidatePath("/concepts");
        revalidatePath(`/concepts/${concept.slug}`);
        return { concept };
    } catch (error) {
        console.error("Error rejecting concept:", error);
        return { error: "Failed to reject concept" };
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
        const authCheck = await checkIsAuthenticated();
        if (!authCheck.isAuthenticated) {
            return { error: authCheck.error };
        }

        // Check ownership
        const concept = await prisma.concept.findUnique({
            where: { id: conceptId },
            select: { creatorId: true, slug: true },
        });

        if (!concept) {
            return { error: "Concept not found" };
        }

        const adminCheck = await checkIsAdmin();
        if (!adminCheck.isAdmin && concept.creatorId !== authCheck.userId) {
            return { error: "Not authorized to edit this concept" };
        }

        const step = await prisma.conceptStep.create({
            data: {
                conceptId,
                order: data.order,
                title: data.title,
                type: data.type,
                content: data.content,
                stepData: data.stepData ? (data.stepData as PrismaValue.InputJsonValue) : PrismaValue.JsonNull,
                tips: data.tips || [],
            },
            include: {
                codeBlocks: { orderBy: { order: "asc" } },
            },
        });

        if (concept.slug) {
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
        const authCheck = await checkIsAuthenticated();
        if (!authCheck.isAuthenticated) {
            return { error: authCheck.error };
        }

        // Get the concept slug first for revalidation and authorization check
        const existingStep = await prisma.conceptStep.findUnique({
            where: { id: stepId },
            select: { conceptId: true, concept: { select: { slug: true, creatorId: true } } },
        });

        if (!existingStep) {
            return { error: "Step not found" };
        }

        const adminCheck = await checkIsAdmin();
        if (!adminCheck.isAdmin && existingStep.concept.creatorId !== authCheck.userId) {
            return { error: "Not authorized to edit this concept" };
        }

        const step = await prisma.conceptStep.update({
            where: { id: stepId },
            data: {
                ...(data.order !== undefined && { order: data.order }),
                ...(data.title && { title: data.title }),
                ...(data.type && { type: data.type }),
                ...(data.content !== undefined && { content: data.content }),
                ...(data.stepData !== undefined && { stepData: data.stepData as PrismaValue.InputJsonValue }),
                ...(data.tips && { tips: data.tips }),
            },
            include: {
                codeBlocks: { orderBy: { order: "asc" } },
            },
        });

        if (existingStep?.concept?.slug) {
            revalidatePath(`/concepts/${existingStep.concept.slug}`);
        }
        return { step };
    } catch (error) {
        console.error("Error updating concept step:", error);
        return { error: "Failed to update step" };
    }
}

export async function deleteConceptStep(stepId: string) {
    try {
        const authCheck = await checkIsAuthenticated();
        if (!authCheck.isAuthenticated) {
            return { error: authCheck.error };
        }

        // Check ownership
        const step = await prisma.conceptStep.findUnique({
            where: { id: stepId },
            include: {
                concept: { select: { slug: true, creatorId: true } },
            },
        });

        if (!step) {
            return { error: "Step not found" };
        }

        const adminCheck = await checkIsAdmin();
        if (!adminCheck.isAdmin && step.concept.creatorId !== authCheck.userId) {
            return { error: "Not authorized to delete this step" };
        }

        await prisma.conceptStep.delete({
            where: { id: stepId },
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

// ==========================================
// PUBLIC CONCEPT STATS (for hero section)
// ==========================================

export async function getPublicConceptStats() {
    try {
        const [totalConcepts, totalSteps, categories] = await Promise.all([
            prisma.concept.count({ where: { status: ConceptStatus.PUBLISHED } }),
            prisma.conceptStep.count({
                where: { concept: { status: ConceptStatus.PUBLISHED } },
            }),
            prisma.concept.groupBy({
                by: ["category"],
                where: { status: ConceptStatus.PUBLISHED },
                _count: true,
            }),
        ]);

        return {
            totalConcepts,
            totalSteps,
            totalCategories: categories.length,
        };
    } catch (error) {
        console.error("Error fetching concept stats:", error);
        return { totalConcepts: 0, totalSteps: 0, totalCategories: 0 };
    }
}

// ==========================================
// CONCEPT RELATIONS (Related & Prerequisites)
// ==========================================

export async function addRelatedConcept(fromConceptId: string, toConceptId: string) {
    try {
        const adminCheck = await checkIsAdmin();
        if (!adminCheck.isAdmin) {
            return { error: adminCheck.error };
        }

        // Create bidirectional relation
        await prisma.$transaction([
            prisma.conceptRelation.create({
                data: { fromConceptId, toConceptId },
            }),
            prisma.conceptRelation.create({
                data: { fromConceptId: toConceptId, toConceptId: fromConceptId },
            }),
        ]);

        revalidatePath("/concepts");
        return { success: true };
    } catch (error) {
        console.error("Error adding related concept:", error);
        return { error: "Failed to add related concept" };
    }
}

export async function removeRelatedConcept(fromConceptId: string, toConceptId: string) {
    try {
        const adminCheck = await checkIsAdmin();
        if (!adminCheck.isAdmin) {
            return { error: adminCheck.error };
        }

        await prisma.$transaction([
            prisma.conceptRelation.deleteMany({
                where: { fromConceptId, toConceptId },
            }),
            prisma.conceptRelation.deleteMany({
                where: { fromConceptId: toConceptId, toConceptId: fromConceptId },
            }),
        ]);

        revalidatePath("/concepts");
        return { success: true };
    } catch (error) {
        console.error("Error removing related concept:", error);
        return { error: "Failed to remove related concept" };
    }
}

export async function addPrerequisiteConcept(conceptId: string, prerequisiteId: string) {
    try {
        const adminCheck = await checkIsAdmin();
        if (!adminCheck.isAdmin) {
            return { error: adminCheck.error };
        }

        await prisma.conceptPrerequisite.create({
            data: { conceptId, prerequisiteId },
        });

        revalidatePath("/concepts");
        return { success: true };
    } catch (error) {
        console.error("Error adding prerequisite:", error);
        return { error: "Failed to add prerequisite" };
    }
}

export async function removePrerequisiteConcept(conceptId: string, prerequisiteId: string) {
    try {
        const adminCheck = await checkIsAdmin();
        if (!adminCheck.isAdmin) {
            return { error: adminCheck.error };
        }

        await prisma.conceptPrerequisite.deleteMany({
            where: { conceptId, prerequisiteId },
        });

        revalidatePath("/concepts");
        return { success: true };
    } catch (error) {
        console.error("Error removing prerequisite:", error);
        return { error: "Failed to remove prerequisite" };
    }
}

export async function getConceptRelations(conceptId: string) {
    try {
        const [relatedConcepts, prerequisites, prerequisiteFor] = await Promise.all([
            prisma.conceptRelation.findMany({
                where: { fromConceptId: conceptId },
                include: {
                    toConcept: {
                        select: {
                            id: true,
                            slug: true,
                            title: true,
                            iconEmoji: true,
                            difficulty: true,
                            category: true,
                            estimatedTime: true,
                        },
                    },
                },
            }),
            prisma.conceptPrerequisite.findMany({
                where: { conceptId },
                include: {
                    prerequisite: {
                        select: {
                            id: true,
                            slug: true,
                            title: true,
                            iconEmoji: true,
                            difficulty: true,
                            category: true,
                            estimatedTime: true,
                        },
                    },
                },
            }),
            prisma.conceptPrerequisite.findMany({
                where: { prerequisiteId: conceptId },
                include: {
                    concept: {
                        select: {
                            id: true,
                            slug: true,
                            title: true,
                            iconEmoji: true,
                            difficulty: true,
                            category: true,
                            estimatedTime: true,
                        },
                    },
                },
            }),
        ]);

        return {
            related: relatedConcepts.map(r => r.toConcept),
            prerequisites: prerequisites.map(p => p.prerequisite),
            prerequisiteFor: prerequisiteFor.map(p => p.concept),
        };
    } catch (error) {
        console.error("Error fetching concept relations:", error);
        return { error: "Failed to fetch concept relations" };
    }
}

export async function searchConcepts(query: string, excludeId?: string) {
    try {
        const concepts = await prisma.concept.findMany({
            where: {
                AND: [
                    {
                        OR: [
                            { title: { contains: query, mode: "insensitive" } },
                            { tags: { hasSome: [query.toLowerCase()] } },
                        ],
                    },
                    ...(excludeId ? [{ NOT: { id: excludeId } }] : []),
                ],
            },
            select: {
                id: true,
                slug: true,
                title: true,
                iconEmoji: true,
                difficulty: true,
                category: true,
            },
            take: 10,
        });

        return { concepts };
    } catch (error) {
        console.error("Error searching concepts:", error);
        return { error: "Failed to search concepts" };
    }
}

// ==========================================
// CONCEPT CHAIN (Previous / Next navigation)
// ==========================================

export async function getConceptChain(conceptId: string) {
    try {
        const [prerequisites, prerequisiteFor] = await Promise.all([
            // Previous concepts (what this concept requires)
            prisma.conceptPrerequisite.findMany({
                where: { conceptId },
                include: {
                    prerequisite: {
                        select: {
                            id: true,
                            slug: true,
                            title: true,
                            iconEmoji: true,
                            difficulty: true,
                            category: true,
                            estimatedTime: true,
                            status: true,
                        },
                    },
                },
            }),
            // Next concepts (what requires this concept)
            prisma.conceptPrerequisite.findMany({
                where: { prerequisiteId: conceptId },
                include: {
                    concept: {
                        select: {
                            id: true,
                            slug: true,
                            title: true,
                            iconEmoji: true,
                            difficulty: true,
                            category: true,
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
                .filter(c => c.status === ConceptStatus.PUBLISHED),
            next: prerequisiteFor
                .map(p => p.concept)
                .filter(c => c.status === ConceptStatus.PUBLISHED),
        };
    } catch (error) {
        console.error("Error fetching concept chain:", error);
        return { previous: [], next: [] };
    }
}

// ==========================================
// USER'S DRAFT CONCEPTS (For Continue Editing)
// ==========================================

export async function getUserDraftConcepts() {
    try {
        const authCheck = await checkIsAuthenticated();
        if (!authCheck.isAuthenticated) {
            return { error: authCheck.error };
        }

        const drafts = await prisma.concept.findMany({
            where: {
                creatorId: authCheck.userId,
                status: {
                    in: [ConceptStatus.DRAFT, ConceptStatus.PENDING_VERIFICATION],
                },
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
        console.error("Error fetching user drafts:", error);
        return { error: "Failed to fetch drafts" };
    }
}

export async function getConceptForEditing(conceptId: string) {
    try {
        const authCheck = await checkIsAuthenticated();
        if (!authCheck.isAuthenticated) {
            return { error: authCheck.error };
        }

        const concept = await prisma.concept.findUnique({
            where: { id: conceptId },
            include: {
                steps: {
                    orderBy: { order: "asc" },
                    include: {
                        codeBlocks: { orderBy: { order: "asc" } },
                    },
                },
            },
        });

        if (!concept) {
            return { error: "Concept not found" };
        }

        const adminCheck = await checkIsAdmin();
        if (!adminCheck.isAdmin && concept.creatorId !== authCheck.userId) {
            return { error: "Not authorized to edit this concept" };
        }

        return { concept };
    } catch (error) {
        console.error("Error fetching concept for editing:", error);
        return { error: "Failed to fetch concept" };
    }
}

// ==========================================
// CONCEPT PURCHASE & CREDITS
// ==========================================

export async function purchaseConcept(conceptId: string) {
    try {
        const authCheck = await checkIsAuthenticated();
        if (!authCheck.isAuthenticated) {
            return { error: authCheck.error };
        }

        const concept = await prisma.concept.findUnique({
            where: { id: conceptId },
            select: {
                id: true,
                title: true,
                price: true,
                pricingType: true,
                platformFeePercent: true,
                creatorId: true,
                status: true,
                verifiedAt: true,
            },
        });

        if (!concept) {
            return { error: "Concept not found" };
        }

        if (concept.pricingType !== "PAID") {
            return { error: "This concept is free" };
        }

        if (concept.status !== ConceptStatus.PUBLISHED || !concept.verifiedAt) {
            return { error: "This concept is not available for purchase" };
        }

        // Check if already purchased
        const existingPurchase = await prisma.conceptPurchase.findUnique({
            where: {
                conceptId_userId: { conceptId, userId: authCheck.userId! },
            },
        });

        if (existingPurchase) {
            return { error: "You have already purchased this concept" };
        }

        // Get user's credit balance
        const user = await prisma.user.findUnique({
            where: { id: authCheck.userId },
            select: { id: true },
        });

        if (!user) {
            return { error: "User not found" };
        }

        // Calculate credits (sum of all credit transactions)
        const creditBalance = await prisma.creditTransaction.aggregate({
            where: { userId: authCheck.userId },
            _sum: { amount: true },
        });

        const balance = creditBalance._sum.amount || 0;
        const price = concept.price;

        if (balance < price) {
            return { error: "Insufficient credits", requiredCredits: price, currentBalance: balance };
        }

        // Calculate platform fee and creator earnings
        const platformFee = Math.floor((price * concept.platformFeePercent) / 100);
        const creatorEarnings = price - platformFee;

        // Execute purchase in transaction
        await prisma.$transaction(async (tx) => {
            // 1. Create purchase record
            await tx.conceptPurchase.create({
                data: {
                    conceptId,
                    userId: authCheck.userId!,
                    pricePaid: price,
                    platformFee,
                    creatorEarnings,
                },
            });

            // 2. Deduct credits from buyer
            const buyerTransaction = await tx.creditTransaction.create({
                data: {
                    userId: authCheck.userId!,
                    amount: -price,
                    type: CreditType.SPEND,
                    currency: Currency.NA,
                    description: `Purchased concept: ${concept.title}`,
                },
            });

            // 3. Create sub-transaction for tracking
            await tx.subTransaction.create({
                data: {
                    creditTransactionId: buyerTransaction.id,
                    module: Module.CONCEPTS,
                    referenceId: conceptId,
                    metadata: {
                        type: "purchase",
                        conceptTitle: concept.title,
                        creatorId: concept.creatorId,
                    },
                },
            });

            // 4. Credit earnings to creator
            const creatorTransaction = await tx.creditTransaction.create({
                data: {
                    userId: concept.creatorId,
                    amount: creatorEarnings,
                    type: CreditType.REWARD,
                    currency: Currency.NA,
                    description: `Earnings from concept: ${concept.title}`,
                },
            });

            // 5. Create sub-transaction for creator earning
            await tx.subTransaction.create({
                data: {
                    creditTransactionId: creatorTransaction.id,
                    module: Module.CONCEPTS,
                    referenceId: conceptId,
                    metadata: {
                        type: "earning",
                        conceptTitle: concept.title,
                        buyerId: authCheck.userId,
                        platformFee,
                    },
                },
            });

            // 6. Record earning
            await tx.earning.create({
                data: {
                    userId: concept.creatorId,
                    module: Module.CONCEPTS,
                    referenceId: conceptId,
                    amount: creatorEarnings,
                    sourceUserId: authCheck.userId,
                },
            });
        });

        revalidatePath(`/concepts`);
        return { success: true, message: "Concept purchased successfully!" };
    } catch (error) {
        console.error("Error purchasing concept:", error);
        return { error: "Failed to purchase concept" };
    }
}

// ==========================================
// CREATOR HOME - ANALYTICS & EARNINGS
// ==========================================

export async function getCreatorConceptStats(userId?: string) {
    try {
        const authCheck = await checkIsAuthenticated();
        if (!authCheck.isAuthenticated) {
            return { error: authCheck.error };
        }

        const creatorId = userId || authCheck.userId;

        // Get all concepts by this creator
        const concepts = await prisma.concept.findMany({
            where: { creatorId: creatorId! },
            select: {
                id: true,
                slug: true,
                title: true,
                iconEmoji: true,
                status: true,
                pricingType: true,
                price: true,
                viewCount: true,
                likeCount: true,
                bookmarkCount: true,
                commentCount: true,
                verifiedAt: true,
                createdAt: true,
                updatedAt: true,
                _count: {
                    select: {
                        steps: true,
                        purchases: true,
                        progress: true,
                    },
                },
            },
            orderBy: { updatedAt: "desc" },
        });

        // Get total stats
        const totalStats = await prisma.concept.aggregate({
            where: { creatorId: creatorId! },
            _sum: {
                viewCount: true,
                likeCount: true,
                bookmarkCount: true,
                commentCount: true,
            },
        });

        // Get earnings
        const earnings = await prisma.earning.aggregate({
            where: { 
                userId: creatorId!,
                module: Module.CONCEPTS,
            },
            _sum: { amount: true },
        });

        // Get recent purchases (last 30 days)
        const recentPurchases = await prisma.conceptPurchase.findMany({
            where: {
                concept: { creatorId: creatorId! },
                createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
            },
            include: {
                user: { select: { id: true, name: true, username: true, image: true } },
                concept: { select: { title: true, slug: true, iconEmoji: true } },
            },
            orderBy: { createdAt: "desc" },
            take: 10,
        });

        // Get view statistics (last 7 days)
        const recentViews = await prisma.conceptView.groupBy({
            by: ["conceptId"],
            where: {
                concept: { creatorId: creatorId! },
                viewedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
            },
            _count: true,
        });

        // Count by status
        const statusCounts = {
            draft: concepts.filter(c => c.status === ConceptStatus.DRAFT).length,
            pending: concepts.filter(c => c.status === ConceptStatus.PENDING_VERIFICATION).length,
            published: concepts.filter(c => c.status === ConceptStatus.PUBLISHED && c.verifiedAt).length,
            archived: concepts.filter(c => c.status === ConceptStatus.ARCHIVED).length,
        };

        return {
            concepts,
            totalStats: {
                totalConcepts: concepts.length,
                totalViews: totalStats._sum.viewCount || 0,
                totalLikes: totalStats._sum.likeCount || 0,
                totalBookmarks: totalStats._sum.bookmarkCount || 0,
                totalComments: totalStats._sum.commentCount || 0,
                totalEarnings: earnings._sum.amount || 0,
                totalPurchases: concepts.reduce((sum, c) => sum + c._count.purchases, 0),
                totalLearners: concepts.reduce((sum, c) => sum + c._count.progress, 0),
            },
            statusCounts,
            recentPurchases,
            recentViews,
        };
    } catch (error) {
        console.error("Error fetching creator stats:", error);
        return { error: "Failed to fetch creator stats" };
    }
}

export async function getConceptDetailedStats(conceptId: string) {
    try {
        const authCheck = await checkIsAuthenticated();
        if (!authCheck.isAuthenticated) {
            return { error: authCheck.error };
        }

        const concept = await prisma.concept.findUnique({
            where: { id: conceptId },
            select: { creatorId: true },
        });

        if (!concept) {
            return { error: "Concept not found" };
        }

        const adminCheck = await checkIsAdmin();
        if (!adminCheck.isAdmin && concept.creatorId !== authCheck.userId) {
            return { error: "Not authorized to view stats" };
        }

        // Get detailed views
        const viewsByDay = await prisma.$queryRaw`
            SELECT DATE(viewed_at) as date, COUNT(*) as count
            FROM "ConceptView"
            WHERE concept_id = ${conceptId}
            AND viewed_at >= NOW() - INTERVAL '30 days'
            GROUP BY DATE(viewed_at)
            ORDER BY date DESC
        ` as { date: Date; count: bigint }[];

        // Get unique visitors
        const uniqueVisitors = await prisma.conceptView.groupBy({
            by: ["userId"],
            where: {
                conceptId,
                userId: { not: null },
            },
            _count: true,
        });

        // Get purchases
        const purchases = await prisma.conceptPurchase.findMany({
            where: { conceptId },
            include: {
                user: { select: { id: true, name: true, username: true, image: true } },
            },
            orderBy: { createdAt: "desc" },
        });

        // Get earnings
        const earnings = await prisma.earning.aggregate({
            where: {
                referenceId: conceptId,
                module: Module.CONCEPTS,
            },
            _sum: { amount: true },
        });

        // Get progress completion stats
        const progressStats = await prisma.conceptProgress.aggregate({
            where: { conceptId },
            _avg: { progressPercent: true },
            _count: true,
        });

        const completedCount = await prisma.conceptProgress.count({
            where: { conceptId, isCompleted: true },
        });

        return {
            viewsByDay: viewsByDay.map(v => ({ date: v.date, count: Number(v.count) })),
            uniqueVisitors: uniqueVisitors.length,
            purchases,
            totalEarnings: earnings._sum.amount || 0,
            totalLearners: progressStats._count,
            averageProgress: progressStats._avg.progressPercent || 0,
            completedCount,
        };
    } catch (error) {
        console.error("Error fetching concept detailed stats:", error);
        return { error: "Failed to fetch detailed stats" };
    }
}

// ==========================================
// ADMIN - PENDING VERIFICATION
// ==========================================

export async function getPendingVerificationConcepts() {
    try {
        const adminCheck = await checkIsAdmin();
        if (!adminCheck.isAdmin) {
            return { error: "Only admins can view pending concepts" };
        }

        const concepts = await prisma.concept.findMany({
            where: {
                status: ConceptStatus.PENDING_VERIFICATION,
            },
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
                    select: { steps: true },
                },
            },
            orderBy: { publishedAt: "asc" },
        });

        return { concepts };
    } catch (error) {
        console.error("Error fetching pending concepts:", error);
        return { error: "Failed to fetch pending concepts" };
    }
}

// ==========================================
// SHARE TO COMMUNITY
// ==========================================

export async function shareConceptToCommunity(
    conceptId: string,
    communityId: string,
    message?: string
) {
    try {
        const authCheck = await checkIsAuthenticated();
        if (!authCheck.isAuthenticated) {
            return { error: authCheck.error };
        }

        // Check if concept exists and is published
        const concept = await prisma.concept.findUnique({
            where: { id: conceptId },
            select: {
                id: true,
                slug: true,
                title: true,
                description: true,
                iconEmoji: true,
                status: true,
                verifiedAt: true,
            },
        });

        if (!concept) {
            return { error: "Concept not found" };
        }

        if (concept.status !== ConceptStatus.PUBLISHED || !concept.verifiedAt) {
            return { error: "Only verified published concepts can be shared" };
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

        // Create a community post with the linked concept
        const content = message || 
            `🚀 Check out this concept: **${concept.title}**\n\n${concept.description.slice(0, 200)}${concept.description.length > 200 ? '...' : ''}\n\n[View Concept](/concepts/${concept.slug})`;

        const post = await prisma.communityPost.create({
            data: {
                communityId,
                authorId: authCheck.userId!,
                title: `${concept.iconEmoji || "📚"} ${concept.title}`,
                content,
                type: "RESOURCE",
                linkedConceptId: conceptId,
                tags: ["concept", "learning"],
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

        // Update share count on concept
        await prisma.concept.update({
            where: { id: conceptId },
            data: {
                // If you have a shareCount field, increment it
                // shareCount: { increment: 1 },
            },
        });

        return { success: true, post };
    } catch (error) {
        console.error("Error sharing concept to community:", error);
        return { error: "Failed to share concept" };
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