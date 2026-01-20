"use server";

import { auth } from "@repo/auth";
import prisma from "@repo/prisma";
import { revalidatePath } from "next/cache";
import OpenAI from "openai";

// ========================================
// TYPES
// ========================================

interface ActionResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
}

interface QuizQuestion {
    prompt: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
}

interface CodeValidationResult {
    passed: boolean;
    score: number;
    feedback: string;
    suggestions: string[];
}

// ========================================
// HELPER FUNCTIONS
// ========================================

async function getCurrentUser() {
    const session = await auth();
    if (!session?.user?.email) throw new Error("Not authenticated");
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) throw new Error("User not found");
    return user;
}

function getOpenAIClient() {
    return new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });
}

// ========================================
// TASK ASSESSMENT - QUIZ
// ========================================

/**
 * Generate quiz questions for a task using AI
 * Questions are based on the task's concepts and description
 */
export async function generateTaskQuizQuestions(
    taskId: string
): Promise<ActionResponse<QuizQuestion[]>> {
    try {
        const user = await getCurrentUser();

        // Get task with its concepts
        const task = await prisma.projectV2Task.findUnique({
            where: { id: taskId },
            include: {
                sprint: {
                    include: {
                        project: {
                            select: {
                                id: true,
                                title: true,
                                technologies: true,
                            },
                        },
                    },
                },
            },
        });

        if (!task) {
            return { success: false, error: "Task not found" };
        }

        // Check if user already has an assessment for this task
        const existingAssessment = await prisma.userTaskV2Assessment.findUnique({
            where: { userId_taskId: { userId: user.id, taskId } },
        });

        if (existingAssessment?.quizQuestions) {
            // Return existing questions
            return {
                success: true,
                data: existingAssessment.quizQuestions as unknown as QuizQuestion[],
            };
        }

        // Generate new questions using AI
        const openai = getOpenAIClient();

        const concepts = task.concepts as Array<{ title: string; description: string }> | null;
        const conceptsText = concepts
            ? concepts.map(c => `- ${c.title}: ${c.description}`).join("\n")
            : "No specific concepts defined";

        const prompt = `You are an expert coding instructor. Generate 3-5 multiple choice quiz questions to test a developer's understanding after completing this task.

Task Title: ${task.title}
Task Description: ${task.description.join("\n")}
Success Criteria: ${task.criteria.join("\n")}
Technologies: ${task.sprint.project.technologies.join(", ")}

Key Concepts to Test:
${conceptsText}

Generate questions that:
1. Test conceptual understanding, not just memorization
2. Have 4 options each (one correct)
3. Include clear explanations for why the correct answer is right
4. Cover different aspects of the task

Respond in JSON format:
{
  "questions": [
    {
      "prompt": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Explanation of why this is correct"
    }
  ]
}`;

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }],
            response_format: { type: "json_object" },
            temperature: 0.7,
        });

        const content = response.choices[0]?.message?.content;
        if (!content) {
            return { success: false, error: "Failed to generate questions" };
        }

        const parsed = JSON.parse(content);
        const questions: QuizQuestion[] = parsed.questions || [];

        // Create or update assessment record
        // Cast questions to JSON-compatible format for Prisma
        const questionsJson = JSON.parse(JSON.stringify(questions));
        await prisma.userTaskV2Assessment.upsert({
            where: { userId_taskId: { userId: user.id, taskId } },
            create: {
                userId: user.id,
                taskId,
                assessmentType: "QUIZ",
                quizQuestions: questionsJson,
                totalQuestions: questions.length,
            },
            update: {
                quizQuestions: questionsJson,
                totalQuestions: questions.length,
            },
        });

        return { success: true, data: questions };
    } catch (error) {
        console.error("[GENERATE QUIZ ERROR]:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to generate quiz",
        };
    }
}

/**
 * Submit quiz answers and get results
 */
export async function submitTaskQuizAnswers(
    taskId: string,
    answers: Array<{
        questionIndex: number;
        selectedAnswer: number
    }>
): Promise<ActionResponse<{
    passed: boolean;
    scorePercentage: number;
    correctAnswers: number
}>> {
    try {
        const user = await getCurrentUser();

        const assessment = await prisma.userTaskV2Assessment.findUnique({
            where: { userId_taskId: { userId: user.id, taskId } },
        });

        if (!assessment || !assessment.quizQuestions) {
            return { success: false, error: "No quiz found for this task" };
        }

        const questions = assessment.quizQuestions as unknown as QuizQuestion[];

        // Grade the answers
        const gradedAnswers = answers.map(answer => {
            const question = questions[answer.questionIndex];
            const isCorrect = question?.correctAnswer === answer.selectedAnswer;
            return {
                questionIndex: answer.questionIndex,
                selectedAnswer: answer.selectedAnswer,
                isCorrect,
            };
        });

        const correctCount = gradedAnswers.filter(a => a.isCorrect).length;
        const score = Math.round((correctCount / questions.length) * 100);
        const passed = score >= 70; // 70% passing threshold

        // Update assessment
        await prisma.userTaskV2Assessment.update({
            where: { id: assessment.id },
            data: {
                quizAnswers: gradedAnswers,
                quizScore: score,
                correctAnswers: correctCount,
                passed,
                completedAt: passed ? new Date() : null,
                attempts: { increment: 1 },
            },
        });

        // Get task for path revalidation
        const task = await prisma.projectV2Task.findUnique({
            where: {
                id: taskId
            },
            include: {
                sprint: {
                    include: {
                        project: {
                            select: {
                                slug: true
                            }
                        }
                    }
                }
            },
        });

        if (task) {
            revalidatePath(`/projects/${task.sprint.project.slug}/sprints`);
        }

        return {
            success: true,
            data: {
                passed,
                scorePercentage: score,
                correctAnswers: correctCount
            }
        };
    } catch (error) {
        console.error("[SUBMIT QUIZ ERROR]:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to submit quiz",
        };
    }
}

// ========================================
// TASK ASSESSMENT - CODE
// ========================================

/**
 * Get code challenge instructions for a task
 */
export async function getCodeChallengeInstructions(
    taskId: string
): Promise<ActionResponse<{ instructions: string; starterCode: string; language: string }>> {
    try {
        const user = await getCurrentUser();

        const task = await prisma.projectV2Task.findUnique({
            where: { id: taskId },
            include: {
                sprint: {
                    include: {
                        project: {
                            select: {
                                technologies: true,
                                primaryLanguageOrFramework: true,
                            },
                        },
                    },
                },
            },
        });

        if (!task) {
            return { success: false, error: "Task not found" };
        }

        // Check for existing assessment
        const existingAssessment = await prisma.userTaskV2Assessment.findUnique({
            where: { userId_taskId: { userId: user.id, taskId } },
        });

        if (existingAssessment?.codeValidation) {
            const validation = existingAssessment.codeValidation as { instructions?: string; starterCode?: string };
            if (validation.instructions) {
                return {
                    success: true,
                    data: {
                        instructions: validation.instructions,
                        starterCode: validation.starterCode || "",
                        language: existingAssessment.codeLanguage || "javascript",
                    },
                };
            }
        }

        // Generate instructions using AI
        const openai = getOpenAIClient();
        const primaryLang = task.sprint.project.primaryLanguageOrFramework || "JavaScript";

        const prompt = `You are an expert coding instructor. Create a code challenge to verify a developer completed this task correctly.

Task Title: ${task.title}
Task Description: ${task.description.join("\n")}
Success Criteria: ${task.criteria.join("\n")}
Primary Language: ${primaryLang}

Create a focused code challenge that:
1. Tests the core implementation from this task
2. Can be completed in 5-10 minutes
3. Has clear success criteria

Respond in JSON format:
{
  "instructions": "Clear instructions for what code to write",
  "starterCode": "// Starter code template with TODO comments",
  "expectedPatterns": ["pattern1", "pattern2"]
}`;

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }],
            response_format: { type: "json_object" },
            temperature: 0.7,
        });

        const content = response.choices[0]?.message?.content;
        if (!content) {
            return { success: false, error: "Failed to generate challenge" };
        }

        const parsed = JSON.parse(content);

        // Create or update assessment record
        await prisma.userTaskV2Assessment.upsert({
            where: { userId_taskId: { userId: user.id, taskId } },
            create: {
                userId: user.id,
                taskId,
                assessmentType: "CODE",
                codeLanguage: primaryLang.toLowerCase(),
                codeValidation: {
                    instructions: parsed.instructions,
                    starterCode: parsed.starterCode,
                    expectedPatterns: parsed.expectedPatterns,
                },
            },
            update: {
                codeValidation: {
                    instructions: parsed.instructions,
                    starterCode: parsed.starterCode,
                    expectedPatterns: parsed.expectedPatterns,
                },
            },
        });

        return {
            success: true,
            data: {
                instructions: parsed.instructions,
                starterCode: parsed.starterCode || "",
                language: primaryLang.toLowerCase(),
            },
        };
    } catch (error) {
        console.error("[GET CODE CHALLENGE ERROR]:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to get code challenge",
        };
    }
}

/**
 * Submit code for AI validation
 */
export async function submitCodeForValidation(
    taskId: string,
    code: string,
    language: string
): Promise<ActionResponse<CodeValidationResult>> {
    try {
        const user = await getCurrentUser();

        const task = await prisma.projectV2Task.findUnique({
            where: { id: taskId },
            include: {
                sprint: {
                    include: {
                        project: { select: { slug: true, technologies: true } },
                    },
                },
            },
        });

        if (!task) {
            return { success: false, error: "Task not found" };
        }

        const assessment = await prisma.userTaskV2Assessment.findUnique({
            where: { userId_taskId: { userId: user.id, taskId } },
        });

        // Validate code using AI
        const openai = getOpenAIClient();

        const prompt = `You are a code reviewer. Evaluate if this code submission correctly implements the task requirements.

Task: ${task.title}
Requirements: ${task.criteria.join("\n")}

Submitted Code:
\`\`\`${language}
${code}
\`\`\`

Evaluate and respond in JSON:
{
  "passed": true/false,
  "score": 0-100,
  "feedback": "Overall assessment",
  "suggestions": ["Improvement suggestion 1", "Improvement suggestion 2"]
}

Be encouraging but honest. Pass if core requirements are met (score >= 70).`;

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }],
            response_format: { type: "json_object" },
            temperature: 0.3,
        });

        const content = response.choices[0]?.message?.content;
        if (!content) {
            return { success: false, error: "Failed to validate code" };
        }

        const result: CodeValidationResult = JSON.parse(content);

        // Update assessment
        // Cast result to JSON-compatible format for Prisma
        const resultJson = JSON.parse(JSON.stringify(result));
        await prisma.userTaskV2Assessment.update({
            where: { id: assessment?.id },
            data: {
                codeSubmission: code,
                codeLanguage: language,
                codeValidation: resultJson,
                codeScore: result.score,
                passed: result.passed,
                completedAt: result.passed ? new Date() : null,
                attempts: { increment: 1 },
            },
        });

        revalidatePath(`/projects/${task.sprint.project.slug}/sprints`);

        return { success: true, data: result };
    } catch (error) {
        console.error("[SUBMIT CODE ERROR]:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to validate code",
        };
    }
}

// ========================================
// SPRINT MOCK INTERVIEW
// ========================================

/**
 * Prepare knowledge base for sprint mock interview
 * Aggregates data from all tasks in previous sprints up to and including the target sprint
 */
export async function prepareSprintMockKnowledge(
    projectId: string,
    sprintId: string
): Promise<ActionResponse<{ knowledgeBase: string; topics: string[] }>> {
    try {
        // Get the sprint and all previous sprints
        const targetSprint = await prisma.projectV2Sprint.findUnique({
            where: { id: sprintId },
            select: { sprintNumber: true, name: true },
        });

        if (!targetSprint) {
            return { success: false, error: "Sprint not found" };
        }

        // Get all sprints up to and including this one
        const sprints = await prisma.projectV2Sprint.findMany({
            where: {
                projectId,
                sprintNumber: { lte: targetSprint.sprintNumber },
            },
            orderBy: { sprintNumber: "asc" },
            include: {
                tasks: {
                    orderBy: { orderIndex: "asc" },
                    select: {
                        title: true,
                        description: true,
                        criteria: true,
                        hints: true,
                        concepts: true,
                        category: true,
                        tags: true,
                    },
                },
            },
        });

        // Get project info
        const project = await prisma.projectV2.findUnique({
            where: { id: projectId },
            select: {
                title: true,
                technologies: true,
                targetAudience: true,
                vision: true,
            },
        });

        // Build knowledge base for the mock interview
        const topics: string[] = [];
        let knowledgeBase = `# Project: ${project?.title}\n`;
        knowledgeBase += `Technologies: ${project?.technologies.join(", ")}\n\n`;
        knowledgeBase += `## Sprint Review: ${targetSprint.name}\n\n`;
        knowledgeBase += `This mock interview covers the following sprints:\n\n`;

        for (const sprint of sprints) {
            knowledgeBase += `### ${sprint.name}\n`;
            knowledgeBase += `Goal: ${sprint.goal}\n\n`;

            for (const task of sprint.tasks) {
                knowledgeBase += `**${task.title}**\n`;
                knowledgeBase += `- Description: ${task.description.join(" ")}\n`;
                knowledgeBase += `- Success Criteria: ${task.criteria.join("; ")}\n`;

                if (task.concepts) {
                    const concepts = task.concepts as Array<{ title: string; description: string }>;
                    concepts.forEach(c => {
                        knowledgeBase += `- Concept: ${c.title} - ${c.description}\n`;
                        if (!topics.includes(c.title)) {
                            topics.push(c.title);
                        }
                    });
                }

                if (task.tags.length > 0) {
                    task.tags.forEach(tag => {
                        if (!topics.includes(tag)) {
                            topics.push(tag);
                        }
                    });
                }

                knowledgeBase += "\n";
            }
        }

        knowledgeBase += `\n## Interview Guidelines\n`;
        knowledgeBase += `Ask questions about:\n`;
        knowledgeBase += `1. Implementation decisions made during these sprints\n`;
        knowledgeBase += `2. Technical concepts that were applied\n`;
        knowledgeBase += `3. Challenges faced and how they were solved\n`;
        knowledgeBase += `4. Alternative approaches that could have been taken\n`;

        return {
            success: true,
            data: { knowledgeBase, topics },
        };
    } catch (error) {
        console.error("[PREPARE MOCK KNOWLEDGE ERROR]:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to prepare knowledge base",
        };
    }
}

/**
 * Start a sprint mock interview session
 */
export async function startSprintMockSession(
    projectId: string,
    sprintId: string
): Promise<ActionResponse<{ sessionId: string; knowledgeBase: string }>> {
    try {
        const user = await getCurrentUser();

        // Check if there's an incomplete session
        const existingSession = await prisma.projectV2MockSession.findFirst({
            where: {
                userId: user.id,
                projectId,
                sprintId,
                status: { in: ["SCHEDULED", "IN_PROGRESS"] },
            },
        });

        if (existingSession) {
            // Return existing session
            const knowledge = await prepareSprintMockKnowledge(projectId, sprintId);
            return {
                success: true,
                data: {
                    sessionId: existingSession.id,
                    knowledgeBase: knowledge.data?.knowledgeBase || "",
                },
            };
        }

        // Prepare knowledge base
        const knowledge = await prepareSprintMockKnowledge(projectId, sprintId);
        if (!knowledge.success) {
            return { success: false, error: knowledge.error };
        }

        // Create new session
        const session = await prisma.projectV2MockSession.create({
            data: {
                userId: user.id,
                projectId,
                sprintId,
                sessionType: "SPRINT_REVIEW",
                status: "SCHEDULED",
            },
        });

        return {
            success: true,
            data: {
                sessionId: session.id,
                knowledgeBase: knowledge.data!.knowledgeBase,
            },
        };
    } catch (error) {
        console.error("[START SPRINT MOCK ERROR]:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to start mock session",
        };
    }
}

/**
 * Complete a sprint mock interview and record score
 */
export async function completeSprintMockSession(
    sessionId: string,
    data: {
        conversationId?: string;
        duration?: number;
        transcript?: string;
        score?: number;
        feedback?: string;
        strengths?: string[];
        improvements?: string[];
    }
): Promise<ActionResponse<{ score: number }>> {
    try {
        const user = await getCurrentUser();

        const session = await prisma.projectV2MockSession.findUnique({
            where: { id: sessionId },
            include: {
                sprint: { select: { projectId: true } },
                project: { select: { id: true, slug: true } },
            },
        });

        if (!session || session.userId !== user.id) {
            return { success: false, error: "Session not found" };
        }

        // Update session with completion data
        await prisma.projectV2MockSession.update({
            where: { id: sessionId },
            data: {
                conversationId: data.conversationId,
                duration: data.duration,
                transcript: data.transcript,
                score: data.score,
                feedback: data.feedback,
                strengths: data.strengths || [],
                improvements: data.improvements || [],
                status: "COMPLETED",
                completedAt: new Date(),
            },
        });

        // Update user's project progress mock score
        if (data.score !== undefined && session.sprintId) {
            await prisma.userProjectV2Progress.updateMany({
                where: {
                    userId: user.id,
                    projectId: session.project.id,
                },
                data: {
                    mockScore: data.score,
                },
            });
        }

        revalidatePath(`/projects/${session.project.slug}/sprints`);

        return {
            success: true,
            data: { score: data.score || 0 },
        };
    } catch (error) {
        console.error("[COMPLETE MOCK ERROR]:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to complete mock session",
        };
    }
}

// ========================================
// GET ASSESSMENT STATUS
// ========================================

/**
 * Get assessment status for a task
 */
export async function getTaskAssessmentStatus(
    taskId: string
): Promise<ActionResponse<{
    hasAssessment: boolean;
    assessmentType: string;
    passed: boolean;
    attempts: number;
    score: number | null;
}>> {
    try {
        const user = await getCurrentUser();

        const task = await prisma.projectV2Task.findUnique({
            where: { id: taskId },
            select: { assessmentType: true },
        });

        if (!task) {
            return { success: false, error: "Task not found" };
        }

        const assessment = await prisma.userTaskV2Assessment.findUnique({
            where: { userId_taskId: { userId: user.id, taskId } },
        });

        return {
            success: true,
            data: {
                hasAssessment: task.assessmentType !== "NONE",
                assessmentType: task.assessmentType,
                passed: assessment?.passed || false,
                attempts: assessment?.attempts || 0,
                score: assessment?.quizScore || assessment?.codeScore || null,
            },
        };
    } catch (error) {
        console.error("[GET ASSESSMENT STATUS ERROR]:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to get assessment status",
        };
    }
}

/**
 * Get sprint mock session status
 */
export async function getSprintMockStatus(
    projectId: string,
    sprintId: string
): Promise<ActionResponse<{
    hasCompleted: boolean;
    score: number | null;
    lastAttempt: Date | null;
}>> {
    try {
        const user = await getCurrentUser();

        const session = await prisma.projectV2MockSession.findFirst({
            where: {
                userId: user.id,
                projectId,
                sprintId,
                status: "COMPLETED",
            },
            orderBy: { completedAt: "desc" },
        });

        return {
            success: true,
            data: {
                hasCompleted: !!session,
                score: session?.score || null,
                lastAttempt: session?.completedAt || null,
            },
        };
    } catch (error) {
        console.error("[GET MOCK STATUS ERROR]:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to get mock status",
        };
    }
}

/**
 * Save sprint mock interview result after Voice session ends
 * Called when the ElevenLabs conversation ends
 */
export async function saveSprintMockResult(
    projectId: string,
    sprintId: string,
    conversationId: string
): Promise<ActionResponse<{ score: number }>> {
    try {
        const user = await getCurrentUser();

        // Find the existing session
        const session = await prisma.projectV2MockSession.findFirst({
            where: {
                userId: user.id,
                projectId,
                sprintId,
                status: { in: ["SCHEDULED", "IN_PROGRESS"] },
            },
            include: {
                project: { select: { slug: true } },
            },
        });

        if (!session) {
            // Create a new session if none exists
            const newSession = await prisma.projectV2MockSession.create({
                data: {
                    userId: user.id,
                    projectId,
                    sprintId,
                    conversationId,
                    sessionType: "SPRINT_REVIEW",
                    status: "COMPLETED",
                    completedAt: new Date(),
                    // Default score - will be updated by AI analysis webhook
                    score: 75,
                },
                include: {
                    project: { select: { slug: true } },
                },
            });

            revalidatePath(`/projects/${newSession.project.slug}/sprints`);

            return {
                success: true,
                data: { score: 75 },
            };
        }

        // Update the existing session
        const updatedSession = await prisma.projectV2MockSession.update({
            where: { id: session.id },
            data: {
                conversationId,
                status: "COMPLETED",
                completedAt: new Date(),
                // Default score - will be updated by AI analysis webhook
                score: 80,
            },
        });

        // Update user's project progress
        await prisma.userProjectV2Progress.updateMany({
            where: {
                userId: user.id,
                projectId,
            },
            data: {
                mockScore: 80,
            },
        });

        revalidatePath(`/projects/${session.project.slug}/sprints`);

        return {
            success: true,
            data: { score: updatedSession.score || 80 },
        };
    } catch (error) {
        console.error("[SAVE MOCK RESULT ERROR]:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to save mock result",
        };
    }
}

// ========================================
// SPRINT COMPLETION STATUS (FOR LOCKING)
// ========================================

interface SprintCompletionStatus {
    isFullyCompleted: boolean;
    tasksCompleted: boolean;
    allAssessmentsPassed: boolean;
    mockInterviewCompleted: boolean;
    taskStats: {
        total: number;
        completed: number;
    };
    assessmentStats: {
        total: number;
        passed: number;
    };
    mockStatus: {
        required: boolean;
        completed: boolean;
        score: number | null;
    };
}

/**
 * Get comprehensive sprint completion status for determining if next sprint should be unlocked.
 * A sprint is fully completed when:
 * 1. All tasks are marked as COMPLETED
 * 2. All task assessments (QUIZ/CODE) are passed
 * 3. Sprint mock interview is completed (if not the last sprint)
 */
export async function getSprintCompletionStatus(
    projectId: string,
    sprintId: string,
    isLastSprint: boolean = false
): Promise<ActionResponse<SprintCompletionStatus>> {
    try {
        const user = await getCurrentUser();

        // Get sprint with all its tasks
        const sprint = await prisma.projectV2Sprint.findUnique({
            where: { id: sprintId },
            include: {
                tasks: {
                    select: {
                        id: true,
                        assessmentType: true,
                    },
                },
            },
        });

        if (!sprint) {
            return { success: false, error: "Sprint not found" };
        }

        // Get user's progress for this project
        const userProgress = await prisma.userProjectV2Progress.findFirst({
            where: {
                userId: user.id,
                projectId,
            },
            select: {
                taskStatuses: true,
            },
        });

        // Parse task statuses
        const taskStatuses = (userProgress?.taskStatuses as Array<{ taskId: string; status: string }>) || [];
        const taskStatusMap = new Map(taskStatuses.map(ts => [ts.taskId, ts.status]));

        // Check task completion
        const totalTasks = sprint.tasks.length;
        const completedTasks = sprint.tasks.filter(t => taskStatusMap.get(t.id) === 'COMPLETED').length;
        const tasksCompleted = totalTasks === 0 || completedTasks === totalTasks;

        // Get task assessments that require completion (QUIZ or CODE type)
        const tasksWithAssessments = sprint.tasks.filter(t => t.assessmentType !== 'NONE');

        // Get user's assessment results for these tasks
        const userAssessments = await prisma.userTaskV2Assessment.findMany({
            where: {
                userId: user.id,
                taskId: { in: tasksWithAssessments.map(t => t.id) },
            },
            select: {
                taskId: true,
                passed: true,
            },
        });

        const assessmentMap = new Map(userAssessments.map(a => [a.taskId, a.passed]));
        const totalAssessments = tasksWithAssessments.length;
        const passedAssessments = tasksWithAssessments.filter(t => assessmentMap.get(t.id) === true).length;
        const allAssessmentsPassed = totalAssessments === 0 || passedAssessments === totalAssessments;

        // Check mock interview completion (not required for last sprint)
        let mockInterviewCompleted = true;
        let mockScore: number | null = null;
        const mockRequired = !isLastSprint;

        if (mockRequired) {
            const mockSession = await prisma.projectV2MockSession.findFirst({
                where: {
                    userId: user.id,
                    projectId,
                    sprintId,
                    status: "COMPLETED",
                },
                orderBy: { completedAt: "desc" },
                select: {
                    score: true,
                },
            });

            mockInterviewCompleted = !!mockSession;
            mockScore = mockSession?.score || null;
        }

        const isFullyCompleted = tasksCompleted && allAssessmentsPassed && mockInterviewCompleted;

        return {
            success: true,
            data: {
                isFullyCompleted,
                tasksCompleted,
                allAssessmentsPassed,
                mockInterviewCompleted,
                taskStats: {
                    total: totalTasks,
                    completed: completedTasks,
                },
                assessmentStats: {
                    total: totalAssessments,
                    passed: passedAssessments,
                },
                mockStatus: {
                    required: mockRequired,
                    completed: mockInterviewCompleted,
                    score: mockScore,
                },
            },
        };
    } catch (error) {
        console.error("[GET SPRINT COMPLETION STATUS ERROR]:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to get sprint completion status",
        };
    }
}
