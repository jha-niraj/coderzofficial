"use server";

import { auth } from '@repo/auth';
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import OpenAI from "openai";

interface ActionResponse {
    success: boolean;
    data?: any;
    error?: string;
}

async function getCurrentUser() {
    const session = await auth();
    if (!session?.user?.email) throw new Error("Not authenticated");
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) throw new Error("User not found");
    return user;
}

async function deductCredits(userId: string, amount: number, description: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { credits: true },
    });

    if (!user || user.credits < amount) {
        throw new Error("Insufficient credits");
    }

    await prisma.$transaction([
        prisma.user.update({
            where: { id: userId },
            data: { credits: { decrement: amount } },
        }),
        prisma.creditTransaction.create({
            data: {
                userId,
                amount: -amount,
                type: "SPEND",
                currency: "NA",
                description,
            },
        }),
    ]);
}

// ========================================
// CHECK IF TASK DETAIL EXISTS
// ========================================

export async function checkTaskDetailExists(taskId: string): Promise<ActionResponse> {
    try {
        const user = await getCurrentUser();

        // Check if detail already exists
        const existingDetail = await prisma.projectV2TaskDetail.findUnique({
            where: { taskId },
            select: {
                id: true,
                accessCount: true,
                userAccess: {
                    where: { userId: user.id },
                    select: { id: true },
                },
            },
        });

        if (!existingDetail) {
            return {
                success: true,
                data: {
                    exists: false,
                    hasAccess: false,
                    needsGeneration: true,
                },
            };
        }

        // Detail exists - check if this user has already accessed it
        const userHasAccess = existingDetail.userAccess.length > 0;

        return {
            success: true,
            data: {
                exists: true,
                hasAccess: userHasAccess,
                needsGeneration: false,
                taskDetailId: existingDetail.id,
            },
        };
    } catch (error: any) {
        console.error("[CHECK_TASK_DETAIL]", error);
        return { success: false, error: error.message };
    }
}

// ========================================
// GENERATE TASK DETAIL WITH OPENAI
// ========================================

export async function generateTaskDetail(taskId: string, projectSlug: string): Promise<ActionResponse> {
    const startTime = Date.now();
    console.log('🚀 [TASK DETAIL GENERATION START]', new Date().toISOString());

    try {
        const user = await getCurrentUser();

        // Check user's credits
        if (user.credits < 1) {
            return { success: false, error: "Insufficient credits. You need 1 credit to generate task details." };
        }

        // Get task and project details
        const task = await prisma.projectV2Task.findUnique({
            where: { id: taskId },
            include: {
                project: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        technologies: true,
                        generationType: true,
                        primaryLanguageOrFramework: true,
                        learningObjectives: true,
                        prerequisites: true,
                    },
                },
            },
        });

        if (!task) {
            return { success: false, error: "Task not found" };
        }

        // Check if detail already exists (created by another user)
        const existingDetail = await prisma.projectV2TaskDetail.findUnique({
            where: { taskId },
            include: {
                userAccess: {
                    where: { userId: user.id },
                },
            },
        });

        // If detail exists and user already has access, return it
        if (existingDetail && existingDetail.userAccess.length > 0) {
            return {
                success: true,
                data: existingDetail,
                error: "You already have access to this task detail",
            };
        }

        // If detail exists but user doesn't have access, grant access and charge 1 credit
        if (existingDetail) {
            console.log('📦 [EXISTING_DETAIL] Granting access to existing detail');

            // Deduct credits
            await deductCredits(user.id, 1, `Task Detail Access: ${task.title}`);

            // Grant access
            await prisma.userTaskV2DetailAccess.create({
                data: {
                    userId: user.id,
                    taskDetailId: existingDetail.id,
                    creditsPaid: 1,
                },
            });

            // Update access count
            await prisma.projectV2TaskDetail.update({
                where: { id: existingDetail.id },
                data: { accessCount: { increment: 1 } },
            });

            revalidatePath(`/projects/${projectSlug}/tasks`);

            return {
                success: true,
                data: existingDetail,
            };
        }

        // Detail doesn't exist - generate with OpenAI
        console.log('🤖 [OPENAI] Generating new task detail');

        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });

        const systemPrompt = `You are an expert coding mentor helping students break down complex development tasks into manageable sub-tasks.

Your goal is to provide detailed, actionable guidance WITHOUT giving away the actual code solution. Focus on:
- Clear step-by-step approach
- Terminal commands needed
- Concepts to understand
- Common pitfalls and errors
- How to debug and validate

IMPORTANT: DO NOT provide actual code implementations. Guide the student's learning process instead.`;

        const userPrompt = `Project Context:
Title: ${task.project.title}
Type: ${task.project.generationType}
Tech Stack: ${task.project.technologies.join(', ')}
Primary: ${task.project.primaryLanguageOrFramework || 'N/A'}

Task to Break Down:
Title: ${task.title}
Description Steps:
${task.description.map((step: string, i: number) => `${i + 1}. ${step}`).join('\n')}

Success Criteria:
${task.criteria.map((c: string, i: number) => `- ${c}`).join('\n')}

Existing Hints:
${task.hints.map((h: string, i: number) => `- ${h}`).join('\n')}

Please generate a detailed breakdown with:

1. **SUB-TASKS** (4-8 sub-tasks):
   Each sub-task should have:
   - title: Clear, action-oriented title
   - description: What needs to be done (2-3 sentences, NO CODE)
   - command: Terminal command if applicable (or null)
   - approach: How to think about this step (3-5 bullet points)
   - tips: Practical tips for this specific sub-task (2-3 items)

2. **COMMON ERRORS** (3-5 errors):
   List common mistakes students make when working on this task

3. **ERRORS TO WATCH OUT FOR** (3-5 errors):
   Specific error messages or issues they might encounter and how to identify them (NOT how to fix them)

4. **RELATED PRACTICE TASKS** (2-4 tasks):
   Suggest additional main tasks (not sub-tasks) that would help practice similar concepts:
   - title: Task title
   - description: Brief description (1-2 sentences)
   - difficulty: BEGINNER | INTERMEDIATE | ADVANCED
   - why_related: Why this helps reinforce the concepts (1 sentence)

Format your response as valid JSON with this exact structure:
{
  "subTasks": [
    {
      "title": "string",
      "description": "string",
      "command": "string or null",
      "approach": ["string"],
      "tips": ["string"]
    }
  ],
  "commonErrors": ["string"],
  "errorsToWatchout": ["string"],
  "relatedTasks": [
    {
      "title": "string",
      "description": "string",
      "difficulty": "string",
      "why_related": "string"
    }
  ]
}

Remember: Guide their learning journey, don't give them the solution!`;

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt },
            ],
            temperature: 0.7,
            response_format: { type: "json_object" },
        });

        const generatedContent = completion.choices[0].message.content;
        if (!generatedContent) {
            throw new Error("Failed to generate task detail");
        }

        const parsedContent = JSON.parse(generatedContent);
        console.log('✅ [OPENAI] Task detail generated successfully');

        // Deduct credits BEFORE creating the detail
        await deductCredits(user.id, 1, `Task Detail Generation: ${task.title}`);

        // Create the task detail
        const taskDetail = await prisma.projectV2TaskDetail.create({
            data: {
                taskId,
                subTasks: parsedContent.subTasks,
                commonErrors: parsedContent.commonErrors || [],
                errorsToWatchout: parsedContent.errorsToWatchout || [],
                relatedTasks: parsedContent.relatedTasks || [],
                generatedBy: user.id,
                generationCost: 1,
                accessCount: 1,
                userAccess: {
                    create: {
                        userId: user.id,
                        creditsPaid: 1,
                    },
                },
            },
        });

        const duration = Date.now() - startTime;
        console.log(`✅ [TASK DETAIL COMPLETE] Generated in ${duration}ms`);

        revalidatePath(`/projects/${projectSlug}/tasks`);

        return {
            success: true,
            data: taskDetail,
        };

    } catch (error: any) {
        const duration = Date.now() - startTime;
        console.error(`❌ [TASK DETAIL ERROR] Failed after ${duration}ms:`, error);
        return {
            success: false,
            error: error.message || "Failed to generate task detail",
        };
    }
}

// ========================================
// GET TASK DETAIL
// ========================================

export async function getTaskDetail(taskId: string): Promise<ActionResponse> {
    try {
        const user = await getCurrentUser();

        const taskDetail = await prisma.projectV2TaskDetail.findUnique({
            where: { taskId },
            include: {
                userAccess: {
                    where: { userId: user.id },
                    select: {
                        id: true,
                        accessedAt: true,
                    },
                },
            },
        });

        if (!taskDetail) {
            return { success: false, error: "Task detail not found" };
        }

        // Check if user has access
        if (taskDetail.userAccess.length === 0) {
            return {
                success: false,
                error: "You don't have access to this task detail. Please purchase access first.",
            };
        }

        return {
            success: true,
            data: taskDetail,
        };

    } catch (error: any) {
        console.error("[GET_TASK_DETAIL]", error);
        return { success: false, error: error.message };
    }
}


