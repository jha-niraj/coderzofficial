"use server";

import { getSession } from '@repo/auth'
import { headers } from 'next/headers'
import { db, pathfinderGoals, pathfinderSubGoals, studios } from '@repo/db'
import { eq, and } from 'drizzle-orm'
import { revalidatePath } from "next/cache";

// ==========================================
// Create or get a Studio for a Pathfinder Goal (via source/sourceId)
// Note: Each sub-goal has its own studio; this is for legacy goal-level notes.
// ==========================================

export async function createOrGetStudioForGoal(goalId: string) {
    try {
        const session = await getSession(headers());
        if (!session?.user?.id) {
            return { error: "Unauthorized" };
        }

        const goal = await db.query.pathfinderGoals.findFirst({
            where: and(eq(pathfinderGoals.id, goalId), eq(pathfinderGoals.userId, session.user.id)),
            columns: { id: true, title: true, slug: true, category: true },
        });

        if (!goal) {
            return { error: "Goal not found" };
        }

        // Find existing studio by sourceId (goal-level studio)
        const existing = await db.query.studios.findFirst({
            where: and(
                eq(studios.userId, session.user.id),
                eq(studios.source, 'PATHFINDER'),
                eq(studios.sourceId, goalId)
            ),
            columns: { id: true, slug: true },
        });

        if (existing) {
            return {
                studioId: existing.id,
                studioSlug: existing.slug ?? undefined,
                isNew: false,
            };
        }

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

        const studioSlug = `notes-${goal.slug}-${Date.now().toString(36)}`;
        const [studio] = await db.insert(studios).values({
            slug: studioSlug,
            title: `📝 Notes: ${goal.title}`,
            description: `Personal notes for Pathfinder goal: ${goal.title}`,
            category: (categoryMap[goal.category] || "GENERAL") as any,
            tags: ["pathfinder", "notes"],
            visibility: 'PRIVATE',
            userId: session.user.id,
            source: 'PATHFINDER',
            sourceId: goalId,
        }).returning();

        if (!studio) throw new Error("Failed to create studio")

        revalidatePath(`/pathfinder/${goal.slug}`);

        return {
            studioId: studio.id,
            studioSlug: studio.slug ?? undefined,
            isNew: true,
        };
    } catch (error) {
        console.error("Error creating/getting studio for goal:", error);
        return { error: "Failed to create notes" };
    }
}

// ==========================================
// Create or get Studio for a Pathfinder Sub-Goal
// ==========================================

export async function createOrGetStudioForSubGoal(subGoalId: string, subGoalTitle: string) {
    try {
        const session = await getSession(headers());
        if (!session?.user?.id) {
            return { error: "Unauthorized" };
        }

        const subGoal = await db.query.pathfinderSubGoals.findFirst({
            where: eq(pathfinderSubGoals.id, subGoalId),
            with: { goal: { columns: { userId: true } } },
        });

        if (!subGoal || subGoal.goal.userId !== session.user.id) {
            return { error: "Sub-goal not found" };
        }

        if (subGoal.studioId) {
            return { studioId: subGoal.studioId, isNew: false };
        }

        const studioSlug = `subgoal-${subGoalId}-${Date.now().toString(36)}`;
        const [studio] = await db.insert(studios).values({
            slug: studioSlug,
            title: `📝 ${subGoalTitle}`,
            description: `Study notes for: ${subGoalTitle}`,
            source: 'PATHFINDER',
            sourceId: subGoalId,
            visibility: 'PRIVATE',
            userId: session.user.id,
            stepCount: 0,
        }).returning();

        if (!studio) throw new Error("Failed to create studio")

        await db.update(pathfinderSubGoals)
            .set({ studioId: studio.id })
            .where(eq(pathfinderSubGoals.id, subGoalId));

        revalidatePath(`/pathfinder`);
        return { studioId: studio.id, isNew: true };
    } catch (error) {
        console.error("Error creating studio for sub-goal:", error);
        return { error: "Failed to create studio" };
    }
}

// ==========================================
// Get Studio content for a Pathfinder Goal (lightweight)
// Finds studio by source=PATHFINDER, sourceId=goalId
// ==========================================

export async function getGoalStudioContent(goalId: string) {
    try {
        const session = await getSession(headers());
        if (!session?.user?.id) {
            return { error: "Unauthorized" };
        }

        const studio = await db.query.studios.findFirst({
            where: and(
                eq(studios.userId, session.user.id),
                eq(studios.source, 'PATHFINDER'),
                eq(studios.sourceId, goalId)
            ),
            columns: {
                id: true,
                slug: true,
                title: true,
            },
            with: {
                quizzes: {
                    columns: {
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
                    },
                },
                flashcardDecks: {
                    columns: {
                        id: true,
                        blockId: true,
                        title: true,
                        cards: true,
                        studioId: true,
                        createdAt: true,
                        updatedAt: true,
                    },
                },
                codeBlocks: true,
                mediaBlocks: true,
            },
        });

        return { studio };
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
        const session = await getSession(headers());
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
