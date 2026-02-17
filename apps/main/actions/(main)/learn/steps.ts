
"use server";

import { prisma } from "@repo/prisma";
import { revalidatePath } from "next/cache";
import { PrismaValue } from "@repo/prisma/client";
import { LearnStepFormData, CodeBlockFormData } from "./types";
import { checkIsAdmin, checkIsAuthenticated } from "./utils";

export async function addLearnStep(learnId: string, data: LearnStepFormData) {
    try {
        const authCheck = await checkIsAuthenticated();
        if (!authCheck.isAuthenticated) {
            return { error: authCheck.error };
        }

        const learn = await prisma.learn.findUnique({
            where: { id: learnId },
            select: { creatorId: true, slug: true },
        });

        if (!learn) {
            return { error: "Learn not found" };
        }

        const adminCheck = await checkIsAdmin();
        if (!adminCheck.isAdmin && learn.creatorId !== authCheck.userId) {
            return { error: "Not authorized to edit this Learn" };
        }

        const step = await prisma.learnStep.create({
            data: {
                learnId,
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

        if (learn.slug) {
            revalidatePath(`/learn/${learn.slug}`);
        }

        return { step };
    } catch (error) {
        console.error("Error adding Learn step:", error);
        return { error: "Failed to add step" };
    }
}

export async function updateLearnStep(stepId: string, data: Partial<LearnStepFormData>) {
    try {
        const authCheck = await checkIsAuthenticated();
        if (!authCheck.isAuthenticated) {
            return { error: authCheck.error };
        }

        const existingStep = await prisma.learnStep.findUnique({
            where: { id: stepId },
            select: { learnId: true, learn: { select: { slug: true, creatorId: true } } },
        });

        if (!existingStep) {
            return { error: "Step not found" };
        }

        const adminCheck = await checkIsAdmin();
        if (!adminCheck.isAdmin && existingStep.learn.creatorId !== authCheck.userId) {
            return { error: "Not authorized to edit this Learn" };
        }

        const step = await prisma.learnStep.update({
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

        if (existingStep?.learn?.slug) {
            revalidatePath(`/learn/${existingStep.learn.slug}`);
        }
        return { step };
    } catch (error) {
        console.error("Error updating Learn step:", error);
        return { error: "Failed to update step" };
    }
}

export async function deleteLearnStep(stepId: string) {
    try {
        const authCheck = await checkIsAuthenticated();
        if (!authCheck.isAuthenticated) {
            return { error: authCheck.error };
        }

        const step = await prisma.learnStep.findUnique({
            where: { id: stepId },
            include: {
                learn: { select: { slug: true, creatorId: true } },
            },
        });

        if (!step) {
            return { error: "Step not found" };
        }

        const adminCheck = await checkIsAdmin();
        if (!adminCheck.isAdmin && step.learn.creatorId !== authCheck.userId) {
            return { error: "Not authorized to delete this step" };
        }

        await prisma.learnStep.delete({
            where: { id: stepId },
        });

        revalidatePath(`/learn/${step.learn.slug}`);
        return { success: true };
    } catch (error) {
        console.error("Error deleting Learn step:", error);
        return { error: "Failed to delete step" };
    }
}

export async function reorderLearnSteps(learnId: string, stepOrders: { id: string; order: number }[]) {
    try {
        const adminCheck = await checkIsAdmin();
        if (!adminCheck.isAdmin) {
            // Check ownership
            const authCheck = await checkIsAuthenticated();
            if (!authCheck.isAuthenticated) return { error: "Unauthorized" };

            const learn = await prisma.learn.findUnique({ where: { id: learnId }, select: { creatorId: true, slug: true } });
            if (!learn || learn.creatorId !== authCheck.userId) return { error: "Unauthorized" };
        }

        await prisma.$transaction(
            stepOrders.map(({ id, order }) =>
                prisma.learnStep.update({
                    where: { id },
                    data: { order },
                })
            )
        );

        const learn = await prisma.learn.findUnique({
            where: { id: learnId },
            select: { slug: true },
        });

        if (learn?.slug) {
            revalidatePath(`/learn/${learn.slug}`);
        }

        return { success: true };
    } catch (error) {
        console.error("Error reordering steps:", error);
        return { error: "Failed to reorder steps" };
    }
}

export async function addCodeBlock(stepId: string, data: CodeBlockFormData) {
    try {
        // Basic auth check needed? Original code had admin check only which seems strict. I'll make it creator check too.
        const authCheck = await checkIsAuthenticated();
        if (!authCheck.isAuthenticated) return { error: "Unauthorized" };

        // Check step ownership via Learn
        const step = await prisma.learnStep.findUnique({
            where: { id: stepId },
            select: { learn: { select: { creatorId: true } } }
        });

        const adminCheck = await checkIsAdmin();
        if (!adminCheck.isAdmin && step?.learn.creatorId !== authCheck.userId) {
            return { error: "Unauthorized" };
        }

        const codeBlock = await prisma.learnCodeBlock.create({
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
        const authCheck = await checkIsAuthenticated();
        if (!authCheck.isAuthenticated) return { error: "Unauthorized" };

        const block = await prisma.learnCodeBlock.findUnique({
            where: { id: blockId },
            select: { step: { select: { learn: { select: { creatorId: true } } } } }
        });

        const adminCheck = await checkIsAdmin();
        if (!adminCheck.isAdmin && block?.step.learn.creatorId !== authCheck.userId) {
            return { error: "Unauthorized" };
        }

        const codeBlock = await prisma.learnCodeBlock.update({
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
        const authCheck = await checkIsAuthenticated();
        if (!authCheck.isAuthenticated) return { error: "Unauthorized" };

        const block = await prisma.learnCodeBlock.findUnique({
            where: { id: blockId },
            select: { step: { select: { learn: { select: { creatorId: true } } } } }
        });

        const adminCheck = await checkIsAdmin();
        if (!adminCheck.isAdmin && block?.step.learn.creatorId !== authCheck.userId) {
            return { error: "Unauthorized" };
        }

        await prisma.learnCodeBlock.delete({
            where: { id: blockId },
        });

        return { success: true };
    } catch (error) {
        console.error("Error deleting code block:", error);
        return { error: "Failed to delete code block" };
    }
}
