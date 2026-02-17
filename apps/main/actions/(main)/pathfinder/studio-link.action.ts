"use server";

import { auth } from '@repo/auth';
import { prisma } from "@repo/prisma";
import { StudioVisibility } from "@repo/prisma/client";
import { revalidatePath } from "next/cache";

// ==========================================
// Create or get a Studio linked to a Pathfinder Goal
// ==========================================

export async function createOrGetStudioForGoal(goalId: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { error: "Unauthorized" };
        }

        // Check if goal exists and belongs to user
        const goal = await prisma.pathfinderGoal.findFirst({
            where: { id: goalId, userId: session.user.id },
            select: {
                id: true,
                title: true,
                slug: true,
                studioId: true,
                category: true,
                studio: {
                    select: {
                        id: true,
                        slug: true,
                        title: true,
                        content: true,
                    }
                }
            }
        });

        if (!goal) {
            return { error: "Goal not found" };
        }

        // If studio already exists, return it
        if (goal.studioId && goal.studio) {
            return {
                studioId: goal.studio.id,
                studioSlug: goal.studio.slug,
                isNew: false,
            };
        }

        // Map PathfinderCategory to StudioCategory
        const categoryMap: Record<string, string> = {
            DSA: "PROGRAMMING",
            WEB_DEVELOPMENT: "WEB_DEVELOPMENT",
            FRONTEND: "WEB_DEVELOPMENT",
            BACKEND: "PROGRAMMING",
            DEVOPS: "DEVOPS",
            AI_ML: "DATA_SCIENCE",
            DATABASE: "PROGRAMMING",
            SYSTEM_DESIGN: "SYSTEM_DESIGN",
            MOBILE: "MOBILE_DEVELOPMENT",
            OTHER: "GENERAL",
        };

        // Create a new studio linked to this goal
        const studioSlug = `notes-${goal.slug}-${Date.now().toString(36)}`;

        const studio = await prisma.studio.create({
            data: {
                slug: studioSlug,
                title: `📝 Notes: ${goal.title}`,
                description: `Personal notes for Pathfinder goal: ${goal.title}`,
                category: (categoryMap[goal.category] || "GENERAL") as any,
                tags: ["pathfinder", "notes"],
                visibility: StudioVisibility.PRIVATE,
                content: { blocks: [] },
                userId: session.user.id,
            },
        });

        // Link studio to goal
        await prisma.pathfinderGoal.update({
            where: { id: goalId },
            data: { studioId: studio.id },
        });

        revalidatePath(`/pathfinder/${goal.slug}`);

        return {
            studioId: studio.id,
            studioSlug: studio.slug,
            isNew: true,
        };
    } catch (error) {
        console.error("Error creating/getting studio for goal:", error);
        return { error: "Failed to create notes" };
    }
}

// ==========================================
// Get Studio content for a Pathfinder Goal (lightweight)
// ==========================================

export async function getGoalStudioContent(goalId: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { error: "Unauthorized" };
        }

        const goal = await prisma.pathfinderGoal.findFirst({
            where: { id: goalId, userId: session.user.id },
            select: {
                studioId: true,
                studio: {
                    select: {
                        id: true,
                        slug: true,
                        title: true,
                        content: true,
                        quizzes: {
                            select: {
                                id: true,
                                blockId: true,
                                title: true,
                                questions: true,
                                timeLimit: true,
                                shuffleQuestions: true,
                                showCorrectAnswers: true,
                                studioId: true,
                                createdAt: true,
                                updatedAt: true,
                            }
                        },
                        flashcardDecks: {
                            select: {
                                id: true,
                                blockId: true,
                                title: true,
                                cards: true,
                                studioId: true,
                                createdAt: true,
                                updatedAt: true,
                            }
                        },
                        codeBlocks: true,
                        mediaBlocks: true,
                    }
                }
            }
        });

        if (!goal) {
            return { error: "Goal not found" };
        }

        return { studio: goal.studio };
    } catch (error) {
        console.error("Error getting goal studio content:", error);
        return { error: "Failed to get notes" };
    }
}

// ==========================================
// Generate AI content and add to goal's studio
// ==========================================

export async function generateNotesContent(
    goalId: string,
    subGoalTitle: string,
    contentType: "explanation" | "summary" | "examples" | "custom",
    customPrompt?: string
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { error: "Unauthorized" };
        }

        // Ensure goal has a studio
        const studioResult = await createOrGetStudioForGoal(goalId);
        if (studioResult.error || !studioResult.studioId) {
            return { error: studioResult.error || "Failed to create notes" };
        }

        // Build the prompt based on content type
        let prompt = "";
        switch (contentType) {
            case "explanation":
                prompt = `Provide a detailed explanation of "${subGoalTitle}". Include key concepts, important points, and practical examples. Use clear markdown formatting with headers, bullet points, and code blocks where appropriate.`;
                break;
            case "summary":
                prompt = `Create a concise summary of "${subGoalTitle}". Include the most important points, key takeaways, and core concepts in a brief format using markdown.`;
                break;
            case "examples":
                prompt = `Provide practical code examples and use cases for "${subGoalTitle}". Include well-commented code blocks, explanations, and real-world applications using markdown formatting.`;
                break;
            case "custom":
                prompt = customPrompt || `Generate study notes about "${subGoalTitle}"`;
                break;
        }

        // Import OpenAI
        const OpenAI = (await import("openai")).default;
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: "You are a knowledgeable tutor. Generate clear, well-structured study notes in Markdown format. Use headers (##, ###), bullet points, code blocks with language tags, bold text for key terms, and numbered lists where appropriate. Keep the content educational and easy to understand."
                },
                { role: "user", content: prompt }
            ],
            temperature: 0.7,
            max_tokens: 2000,
        });

        const generatedContent = completion.choices[0]?.message?.content || "";

        return {
            content: generatedContent,
            studioId: studioResult.studioId,
        };
    } catch (error) {
        console.error("Error generating notes content:", error);
        return { error: "Failed to generate content" };
    }
}
