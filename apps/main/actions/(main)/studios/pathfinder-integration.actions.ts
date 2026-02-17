"use server";

import { auth } from "@repo/auth";
import { prisma } from "@repo/prisma";
import { revalidatePath } from "next/cache";

// Create studio for a Pathfinder goal
export async function createStudioForGoal(
    goalId: string,
    goalTitle: string,
    goalDescription?: string
): Promise<{
    success: boolean;
    studioId?: string;
    error?: string;
}> {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" };
        }

        // Check if studio already exists for this goal
        const existingStudio = await prisma.studio.findFirst({
            where: {
                source: "PATHFINDER",
                sourceId: goalId,
                userId: session.user.id,
            },
        });

        if (existingStudio) {
            return { success: true, studioId: existingStudio.id };
        }

        // Create new studio
        const studio = await prisma.studio.create({
            data: {
                title: goalTitle,
                description: goalDescription,
                source: "PATHFINDER",
                sourceId: goalId,
                userId: session.user.id,
                stepCount: 0,
            },
        });

        // Link studio to goal
        await prisma.pathfinderGoal.update({
            where: { id: goalId },
            data: { studioId: studio.id },
        });

        revalidatePath(`/pathfinder/${goalId}`);
        return { success: true, studioId: studio.id };
    } catch (error) {
        console.error("Error creating studio for goal:", error);
        return { success: false, error: "Failed to create studio" };
    }
}

// Add subgoal content to studio
export async function addSubgoalContentToStudio(
    studioId: string,
    subgoalTitle: string,
    explanation?: string,
    code?: string,
    language?: string
): Promise<{
    success: boolean;
    error?: string;
}> {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" };
        }

        // Verify studio ownership
        const studio = await prisma.studio.findUnique({
            where: { id: studioId, userId: session.user.id },
        });

        if (!studio) {
            return { success: false, error: "Studio not found" };
        }

        // Get next order number
        const maxOrder = await prisma.studioStep.findFirst({
            where: { studioId },
            orderBy: { orderNumber: "desc" },
            select: { orderNumber: true },
        });

        let nextOrder = (maxOrder?.orderNumber ?? 0) + 1;

        // Add explanation step if provided
        if (explanation) {
            await prisma.studioStep.create({
                data: {
                    studioId,
                    type: "EXPLANATION",
                    content: `# ${subgoalTitle}\n\n${explanation}`,
                    metadata: {
                        prompt: `Subgoal: ${subgoalTitle}`,
                        model: "pathfinder",
                    },
                    source: "AI",
                    orderNumber: nextOrder,
                    status: "COMPLETED",
                },
            });
            nextOrder++;
        }

        // Add code step if provided
        if (code) {
            await prisma.studioStep.create({
                data: {
                    studioId,
                    type: "CODE",
                    content: code,
                    metadata: {
                        language: language || "javascript",
                        problemTitle: subgoalTitle,
                        isPractice: true,
                    },
                    source: "USER",
                    orderNumber: nextOrder,
                    status: "COMPLETED",
                },
            });
            nextOrder++;
        }

        // Update studio step count
        const stepCount = explanation ? (code ? 2 : 1) : (code ? 1 : 0);
        await prisma.studio.update({
            where: { id: studioId },
            data: {
                stepCount: { increment: stepCount },
                lastEditedAt: new Date(),
            },
        });

        revalidatePath(`/pathfinder`);
        return { success: true };
    } catch (error) {
        console.error("Error adding subgoal content:", error);
        return { success: false, error: "Failed to add content" };
    }
}

// Get studio for a goal
export async function getStudioForGoal(
    goalId: string
): Promise<{
    success: boolean;
    studioId?: string;
    error?: string;
}> {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" };
        }

        const studio = await prisma.studio.findFirst({
            where: {
                source: "PATHFINDER",
                sourceId: goalId,
                userId: session.user.id,
            },
            select: { id: true },
        });

        if (!studio) {
            return { success: false, error: "Studio not found" };
        }

        return { success: true, studioId: studio.id };
    } catch (error) {
        console.error("Error getting studio for goal:", error);
        return { success: false, error: "Failed to get studio" };
    }
}
