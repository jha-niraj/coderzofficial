"use server"

import { auth } from "@/auth";
import { 
    ConceptCategory, ConceptDifficulty, ConceptStatus, ConceptStepType
} from "@repo/prisma/client";
import { revalidatePath } from "next/cache";
import { prisma } from "@repo/prisma";
import { slugify } from "@repo/ui/lib/utils";

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

export async function createConcept(data: ConceptFormData) {
    try {
        const adminCheck = await checkIsAdmin();
        if (!adminCheck.isAdmin) {
            return { error: adminCheck.error };
        }

        // Generate unique slug
        let slug = slugify(data.title);
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