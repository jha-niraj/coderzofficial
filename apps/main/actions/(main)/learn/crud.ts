
"use server";

import { prisma } from "@repo/prisma";
import { revalidatePath } from "next/cache";
import { LearnStatus } from "@repo/prisma/client";
import { LearnFormData } from "./types";
import { generateSlug, checkIsAuthenticated, checkIsAdmin } from "./utils";

export async function createLearn(data: LearnFormData) {
    try {
        const authCheck = await checkIsAuthenticated();
        if (!authCheck.isAuthenticated) {
            return { error: authCheck.error };
        }

        let slug = generateSlug(data.title);
        const existingSlug = await prisma.learn.findUnique({ where: { slug } });
        if (existingSlug) {
            slug = `${slug}-${Date.now().toString(36)}`;
        }

        const learn = await prisma.learn.create({
            data: {
                slug,
                title: data.title,
                description: data.description,
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
                status: LearnStatus.DRAFT,
                creatorId: authCheck.userId!,
                // Hierarchical categories
                ...(data.mainCategoryId && { mainCategoryId: data.mainCategoryId }),
                ...(data.subCategoryId && { subCategoryId: data.subCategoryId }),
            },
        });

        revalidatePath("/learn");
        return { learn };
    } catch (error) {
        console.error("Error creating learn:", error);
        return { error: "Failed to create Learn" };
    }
}

export async function updateLearn(learnId: string, data: Partial<LearnFormData>) {
    try {
        const authCheck = await checkIsAuthenticated();
        if (!authCheck.isAuthenticated) {
            return { error: authCheck.error };
        }

        const learn = await prisma.learn.findUnique({
            where: { id: learnId },
            select: { creatorId: true },
        });

        if (!learn) {
            return { error: "Learn not found" };
        }

        const adminCheck = await checkIsAdmin();
        if (!adminCheck.isAdmin && learn.creatorId !== authCheck.userId) {
            return { error: "Not authorized to edit this Learn" };
        }

        const updatedLearn = await prisma.learn.update({
            where: { id: learnId },
            data: {
                ...(data.title && { title: data.title }),
                ...(data.description && { description: data.description }),
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
                ...(data.mainCategoryId !== undefined && { mainCategoryId: data.mainCategoryId || null }),
                ...(data.subCategoryId !== undefined && { subCategoryId: data.subCategoryId || null }),
            },
        });

        revalidatePath("/learn");
        revalidatePath(`/learn/${updatedLearn.slug}`);
        return { learn: updatedLearn };
    } catch (error) {
        console.error("Error updating learn:", error);
        return { error: "Failed to update Learn" };
    }
}

export async function publishLearn(learnId: string) {
    try {
        const authCheck = await checkIsAuthenticated();
        if (!authCheck.isAuthenticated) {
            return { error: authCheck.error };
        }

        const learn = await prisma.learn.findUnique({
            where: { id: learnId },
            select: { creatorId: true },
        });

        if (!learn) {
            return { error: "Learn not found" };
        }

        const adminCheck = await checkIsAdmin();
        if (!adminCheck.isAdmin && learn.creatorId !== authCheck.userId) {
            return { error: "Not authorized to publish this Learn" };
        }

        const updatedLearn = await prisma.learn.update({
            where: { id: learnId },
            data: {
                status: LearnStatus.PUBLISHED,
                publishedAt: new Date(),
            },
        });

        revalidatePath("/learn");
        revalidatePath(`/learn/${updatedLearn.slug}`);
        return { learn: updatedLearn };
    } catch (error) {
        console.error("Error publishing learn:", error);
        return { error: "Failed to publish Learn" };
    }
}



export async function unpublishLearn(learnId: string) {
    try {
        const adminCheck = await checkIsAdmin();
        if (!adminCheck.isAdmin) {
            return { error: adminCheck.error };
        }

        const learn = await prisma.learn.update({
            where: { id: learnId },
            data: {
                status: LearnStatus.DRAFT,
            },
        });

        revalidatePath("/learn");
        revalidatePath(`/learn/${learn.slug}`);
        return { learn };
    } catch (error) {
        console.error("Error unpublishing learn:", error);
        return { error: "Failed to unpublish Learn" };
    }
}

export async function archiveLearn(learnId: string) {
    try {
        const adminCheck = await checkIsAdmin();
        if (!adminCheck.isAdmin) {
            return { error: adminCheck.error };
        }

        const learn = await prisma.learn.update({
            where: { id: learnId },
            data: {
                status: LearnStatus.ARCHIVED,
            },
        });

        revalidatePath("/learn");
        return { learn };
    } catch (error) {
        console.error("Error archiving learn:", error);
        return { error: "Failed to archive Learn" };
    }
}

export async function deleteLearn(learnId: string) {
    try {
        const adminCheck = await checkIsAdmin();
        if (!adminCheck.isAdmin) {
            return { error: adminCheck.error };
        }

        await prisma.learn.delete({
            where: { id: learnId },
        });

        revalidatePath("/learn");
        return { success: true };
    } catch (error) {
        console.error("Error deleting learn:", error);
        return { error: "Failed to delete Learn" };
    }
}
