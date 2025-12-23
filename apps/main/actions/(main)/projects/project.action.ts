"use server";

import { auth } from '@repo/auth';
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

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

// Helper functions for credits and XP
async function deductCredits(userId: string, amount: number, description: string) {
    // Check if user has enough credits
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { credits: true },
    });

    if (!user || user.credits < amount) {
        throw new Error("Insufficient credits");
    }

    // Deduct credits and create transaction
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

async function refundCredits(userId: string, amount: number, description: string) {
    await prisma.$transaction([
        prisma.user.update({
            where: { id: userId },
            data: { credits: { increment: amount } },
        }),
        prisma.creditTransaction.create({
            data: {
                userId,
                amount,
                type: "REWARD",
                currency: "NA",
                description,
            },
        }),
    ]);
}

function generateSlug(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
        .substring(0, 50);
}

export async function getProjectBySlug(slug: string): Promise<ActionResponse> {
    try {
        const user = await getCurrentUser();

        const project = await prisma.projectV2.findUnique({
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
                pages: {
                    orderBy: { orderIndex: 'asc' },
                },
                tasks: {
                    orderBy: { orderIndex: 'asc' },
                    select: {
                        id: true,
                        title: true,
                        difficulty: true,
                        badges: true,
                        tags: true,
                    },
                },
                quiz: {
                    include: {
                        questions: {
                            orderBy: { orderIndex: 'asc' },
                            select: {
                                id: true,
                                difficulty: true,
                            },
                        },
                    },
                },
                knowledge: true,
                progress: {
                    where: { userId: user.id },
                    include: {
                        taskStatuses: {
                            select: {
                                taskId: true,
                                status: true,
                            },
                        },
                    },
                },
            },
        });

        if (!project) {
            return { success: false, error: "Project not found" };
        }

        return { success: true, data: project };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function startProject(projectId: string): Promise<ActionResponse> {
    try {
        const user = await getCurrentUser();

        const project = await prisma.projectV2.findUnique({ 
            where: { id: projectId },
            include: { tasks: true },
        });

        if (!project) {
            return { success: false, error: "Project not found" };
        }

        // Check if already started
        const existing = await prisma.userProjectV2Progress.findUnique({
            where: { userId_projectId: { userId: user.id, projectId } }
        });

        if (existing) {
            return { success: true, data: existing };
        }

        // Create progress record
        const progress = await prisma.userProjectV2Progress.create({
            data: {
                userId: user.id,
                projectId,
                status: "IN_PROGRESS",
                totalTasks: project.tasks.length,
                startedAt: new Date(),
            }
        });

        // Create task statuses (all TO_DO initially)
        const taskStatuses = project.tasks.map((task: any) => ({
            userId: user.id,
            projectId,
            taskId: task.id,
            progressId: progress.id,
            status: "TO_DO" as const,
        }));

        await prisma.userTaskV2Status.createMany({
            data: taskStatuses,
        });

        // Increment project started count
        await prisma.projectV2.update({
            where: { id: projectId },
            data: { totalStarted: { increment: 1 } }
        });

        revalidatePath(`/projects/${project.slug}`);

        return { success: true, data: progress };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// ========================================
// TASK MANAGEMENT
// ========================================

export async function getProjectTasks(slug: string): Promise<ActionResponse> {
    try {
        const user = await getCurrentUser();

        const project = await prisma.projectV2.findUnique({ 
            where: { slug },
            select: { id: true, title: true },
        });

        if (!project) {
            return { success: false, error: "Project not found" };
        }

        // Get progress
        const progress = await prisma.userProjectV2Progress.findUnique({
            where: { userId_projectId: { userId: user.id, projectId: project.id } }
        });

        if (!progress) {
            return { success: false, error: "Project not started. Please start the project first." };
        }

        // Get all tasks with user status
        const tasks = await prisma.projectV2Task.findMany({
            where: { projectId: project.id },
            orderBy: { orderIndex: 'asc' },
            include: {
                UserTaskV2Status: {
                    where: { userId: user.id },
                },
            },
        });

        // Map to kanban format
        const tasksWithStatus = tasks.map((task: any) => ({
            id: task.id,
            title: task.title,
            description: task.description,
            criteria: task.criteria,
            hints: task.hints,
            badges: task.badges,
            tags: task.tags,
            difficulty: task.difficulty,
            terminalCommand: task.terminalCommand,
            status: task.UserTaskV2Status[0]?.status || "TO_DO",
            completedAt: task.UserTaskV2Status[0]?.completedAt,
            notes: task.UserTaskV2Status[0]?.notes,
        }));

        // Group by status for kanban
        const columns = {
            todo: tasksWithStatus.filter((t: any) => t.status === "TO_DO"),
            inProgress: tasksWithStatus.filter((t: any) => t.status === "IN_PROGRESS"),
            completed: tasksWithStatus.filter((t: any) => t.status === "COMPLETED"),
        };

        return { 
            success: true, 
            data: { 
                columns,
                progress: {
                    totalTasks: progress.totalTasks,
                    completedTasks: progress.tasksCompleted,
                    progressPercentage: progress.progressPercentage,
                },
                projectTitle: project.title,
            } 
        };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateTaskStatus(
    taskId: string, 
    newStatus: "TO_DO" | "IN_PROGRESS" | "COMPLETED"
): Promise<ActionResponse> {
    try {
        const user = await getCurrentUser();

        const task = await prisma.projectV2Task.findUnique({
            where: { id: taskId },
            select: { id: true, projectId: true },
        });

        if (!task) {
            return { success: false, error: "Task not found" };
        }

        const progress = await prisma.userProjectV2Progress.findUnique({
            where: { userId_projectId: { userId: user.id, projectId: task.projectId } }
        });

        if (!progress) {
            return { success: false, error: "Progress not found" };
        }

        // Update or create task status
        await prisma.userTaskV2Status.upsert({
            where: { userId_taskId: { userId: user.id, taskId } },
            update: {
                status: newStatus,
                completedAt: newStatus === "COMPLETED" ? new Date() : null,
            },
            create: {
                userId: user.id,
                projectId: task.projectId,
                taskId,
                progressId: progress.id,
                status: newStatus,
                completedAt: newStatus === "COMPLETED" ? new Date() : null,
            },
        });

        // Recalculate progress
        const completedCount = await prisma.userTaskV2Status.count({
            where: {
                userId: user.id,
                projectId: task.projectId,
                status: "COMPLETED",
            },
        });

        const totalTasks = await prisma.projectV2Task.count({
            where: { projectId: task.projectId },
        });

        const progressPercentage = totalTasks > 0 ? (completedCount / totalTasks) * 100 : 0;

        // Update progress
        await prisma.userProjectV2Progress.update({
            where: { id: progress.id },
            data: {
                tasksCompleted: completedCount,
                totalTasks,
                progressPercentage,
                status: completedCount === totalTasks ? "COMPLETED" : "IN_PROGRESS",
                completedAt: completedCount === totalTasks ? new Date() : null,
            },
        });

        // If project completed, increment counter
        if (completedCount === totalTasks) {
            await prisma.projectV2.update({
                where: { id: task.projectId },
                data: { totalCompleted: { increment: 1 } },
            });
        }

        // Update score if task was completed
        if (newStatus === "COMPLETED") {
            // Import at top of file: import { updateProjectScore } from "./projects/leaderboard.action"
            const { updateProjectScore } = await import("./leaderboard.action");
            await updateProjectScore(task.projectId);
        }

        return { success: true, data: { completedCount, totalTasks, progressPercentage } };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateTaskNotes(taskId: string, notes: string): Promise<ActionResponse> {
    try {
        const user = await getCurrentUser();

        const taskStatus = await prisma.userTaskV2Status.findUnique({
            where: { userId_taskId: { userId: user.id, taskId } },
        });

        if (!taskStatus) {
            return { success: false, error: "Task status not found" };
        }

        await prisma.userTaskV2Status.update({
            where: { id: taskStatus.id },
            data: { notes },
        });

        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// ========================================
// QUIZ ACTIONS
// ========================================

export async function startQuiz(projectId: string): Promise<ActionResponse> {
    try {
        const user = await getCurrentUser();

        const quiz = await prisma.projectV2Quiz.findUnique({
            where: { projectId },
            include: {
                questions: {
                    orderBy: { orderIndex: 'asc' },
                    select: {
                        id: true,
                        prompt: true,
                        options: true,
                        difficulty: true,
                        orderIndex: true,
                    },
                },
            },
        });

        if (!quiz) {
            return { success: false, error: "Quiz not found for this project" };
        }

        // Check if already attempted
        const existingAttempt = await prisma.projectV2QuizAttempt.findUnique({
            where: { userId_quizId: { userId: user.id, quizId: quiz.id } },
        });

        if (existingAttempt && existingAttempt.isCompleted) {
            return { success: false, error: "You have already completed this quiz" };
        }

        if (existingAttempt) {
            return { success: true, data: { attemptId: existingAttempt.id, questions: quiz.questions } };
        }

        // Create new attempt
        const attempt = await prisma.projectV2QuizAttempt.create({
            data: {
                userId: user.id,
                projectId,
                quizId: quiz.id,
                totalQuestions: quiz.questions.length,
            },
        });

        return { success: true, data: { attemptId: attempt.id, questions: quiz.questions } };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function submitQuizAnswer(
    attemptId: string,
    questionId: string,
    selectedAnswer: number
): Promise<ActionResponse> {
    try {
        const user = await getCurrentUser();

        const attempt = await prisma.projectV2QuizAttempt.findUnique({
            where: { id: attemptId },
        });

        if (!attempt || attempt.userId !== user.id) {
            return { success: false, error: "Invalid attempt" };
        }

        if (attempt.isCompleted) {
            return { success: false, error: "Quiz already completed" };
        }

        const question = await prisma.projectV2QuizQuestion.findUnique({
            where: { id: questionId },
        });

        if (!question) {
            return { success: false, error: "Question not found" };
        }

        const isCorrect = question.correctAnswer === selectedAnswer;

        // Upsert answer
        await prisma.projectV2QuizAnswer.upsert({
            where: { attemptId_questionId: { attemptId, questionId } },
            update: {
                selectedAnswer,
                isCorrect,
            },
            create: {
                attemptId,
                questionId,
                selectedAnswer,
                isCorrect,
            },
        });

        return { success: true, data: { isCorrect, explanation: question.explanation } };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function completeQuiz(attemptId: string): Promise<ActionResponse> {
    try {
        const user = await getCurrentUser();

        const attempt = await prisma.projectV2QuizAttempt.findUnique({
            where: { id: attemptId },
            include: {
                answers: true,
            },
        });

        if (!attempt || attempt.userId !== user.id) {
            return { success: false, error: "Invalid attempt" };
        }

        const correctAnswers = attempt.answers.filter((a: any) => a.isCorrect).length;
        const totalQuestions = attempt.totalQuestions;
        const score = Math.round((correctAnswers / totalQuestions) * 100);

        await prisma.projectV2QuizAttempt.update({
            where: { id: attemptId },
            data: {
                correctAnswers,
                score,
                isCompleted: true,
                completedAt: new Date(),
            },
        });

        return { success: true, data: { score, correctAnswers, totalQuestions } };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// ========================================
// PROJECT SUBMISSION
// ========================================

export async function submitProject(
    projectId: string,
    data: { githubUrl: string; liveUrl?: string; notes?: string }
): Promise<ActionResponse> {
    try {
        const user = await getCurrentUser();

        // Check if project is completed
        const progress = await prisma.userProjectV2Progress.findUnique({
            where: { userId_projectId: { userId: user.id, projectId } },
        });

        if (!progress) {
            return { success: false, error: "Project not started" };
        }

        if (progress.status !== "COMPLETED") {
            return { success: false, error: "Please complete all tasks before submitting" };
        }

        // Create submission
        const submission = await prisma.projectV2Submission.create({
            data: {
                userId: user.id,
                projectId,
                githubUrl: data.githubUrl,
                liveUrl: data.liveUrl,
                notes: data.notes,
            },
        });

        // Update progress
        await prisma.userProjectV2Progress.update({
            where: { id: progress.id },
            data: {
                status: "SUBMITTED",
                submittedAt: new Date(),
            },
        });

        // Increment project submissions
        await prisma.projectV2.update({
            where: { id: projectId },
            data: { totalSubmissions: { increment: 1 } },
        });

        return { success: true, data: submission };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// ========================================
// UTILITY ACTIONS
// ========================================

export async function getUserProjects(page: number = 1, limit: number = 20): Promise<ActionResponse> {
    try {
        const user = await getCurrentUser();

        const [projects, total] = await Promise.all([
            prisma.projectV2.findMany({
                where: { createdBy: user.id },
                include: {
                    progress: {
                        where: { userId: user.id },
                        select: {
                            status: true,
                            progressPercentage: true,
                            tasksCompleted: true,
                            totalTasks: true,
                        },
                    },
                    submissions: {
                        where: { userId: user.id },
                        take: 1,
                        orderBy: { createdAt: 'desc' },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.projectV2.count({
                where: { createdBy: user.id },
            }),
        ]);

        const totalPages = Math.ceil(total / limit);
        const hasNext = page < totalPages;
        const hasPrevious = page > 1;

        return {
            success: true,
            data: {
                projects,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages,
                    hasNext,
                    hasPrevious,
                },
            },
        };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteProject(projectId: string): Promise<ActionResponse> {
    try {
        const user = await getCurrentUser();

        const project = await prisma.projectV2.findUnique({
            where: { id: projectId },
        });

        if (!project) {
            return { success: false, error: "Project not found" };
        }

        if (project.createdBy !== user.id) {
            return { success: false, error: "Unauthorized" };
        }

        await prisma.projectV2.delete({
            where: { id: projectId },
        });

        revalidatePath('/projects/myprojects');

        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getPublicProjects(limit: number = 9): Promise<ActionResponse> {
    try {
        const projects = await prisma.projectV2.findMany({
            where: {
                visibility: 'PUBLIC',
            },
            select: {
                id: true,
                slug: true,
                title: true,
                shortDescription: true,
                description: true,
                technologies: true,
                difficulty: true,
                estimatedHours: true,
                totalViews: true,
                includeAssessment: true,
                createdAt: true,
                creator: {
                    select: {
                        name: true,
                        username: true,
                        image: true,
                    },
                },
                _count: {
                    select: {
                        submissions: true,
                        progress: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
            take: limit,
        });

        return { success: true, data: projects };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getAllPublicProjects(options?: {
    page?: number;
    limit?: number;
    difficulty?: string;
    technologies?: string[];
    search?: string;
    sortBy?: 'popular' | 'recent' | 'rating';
}): Promise<ActionResponse> {
    try {
        const {
            page = 1,
            limit = 30,
            difficulty,
            technologies,
            search,
            sortBy = 'recent'
        } = options || {};

        const skip = (page - 1) * limit;

        const where: any = {
            visibility: 'PUBLIC',
        };

        if (difficulty && difficulty !== 'ALL') {
            where.difficulty = difficulty;
        }

        if (technologies && technologies.length > 0) {
            where.technologies = {
                hasSome: technologies,
            };
        }

        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
                { shortDescription: { contains: search, mode: 'insensitive' } },
            ];
        }

        let orderBy: any = { createdAt: 'desc' };

        if (sortBy === 'popular') {
            orderBy = { totalViews: 'desc' };
        } else if (sortBy === 'rating') {
            orderBy = { totalSubmissions: 'desc' };
        }

        const [projects, total] = await Promise.all([
            prisma.projectV2.findMany({
                where,
                select: {
                    id: true,
                    slug: true,
                    title: true,
                    shortDescription: true,
                    description: true,
                    technologies: true,
                    difficulty: true,
                    estimatedHours: true,
                    totalViews: true,
                    includeAssessment: true,
                    createdAt: true,
                    creator: {
                        select: {
                            name: true,
                            username: true,
                            image: true,
                        },
                    },
                    _count: {
                        select: {
                            submissions: true,
                            progress: true,
                        },
                    },
                },
                orderBy,
                skip,
                take: limit,
            }),
            prisma.projectV2.count({ where }),
        ]);

        const totalPages = Math.ceil(total / limit);
        const hasNext = page < totalPages;
        const hasPrevious = page > 1;

        return {
            success: true,
            data: {
                projects,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages,
                    hasNext,
                    hasPrevious,
                },
            },
        };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getRecentSubmissions(limit: number = 9): Promise<ActionResponse> {
    try {
        const submissions = await prisma.projectV2Submission.findMany({
            where: {
                project: {
                    visibility: 'PUBLIC',
                },
            },
            select: {
                id: true,
                githubUrl: true,
                liveUrl: true,
                createdAt: true,
                project: {
                    select: {
                        id: true,
                        slug: true,
                        title: true,
                        technologies: true,
                        difficulty: true,
                    },
                },
                user: {
                    select: {
                        name: true,
                        username: true,
                        image: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
            take: limit,
        });

        return { success: true, data: submissions };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// ========================================
// SEARCH SIMILAR PROJECTS
// ========================================

/**
 * Search for similar public projects based on title and technologies
 */
export async function searchSimilarProjects({
    title,
    technologies,
    limit = 6
}: {
    title: string;
    technologies: string[];
    limit?: number;
}): Promise<ActionResponse> {
    try {
        if (!title || !technologies || !Array.isArray(technologies)) {
            return {
                success: false,
                error: "Invalid search parameters",
            };
        }

        // Get all public projects using the existing function
        const result = await getAllPublicProjects({ limit: 100 }); // Get more projects for better matching
        
        if (!result.success || !result.data) {
            return {
                success: false,
                error: "Failed to fetch projects",
            };
        }

        const projects = result.data.projects || [];

        // Search and score projects based on similarity
        const scoredProjects = projects.map((project: any) => {
            let score = 0;
            
            // Title similarity (case insensitive, partial matches)
            const titleWords = title.toLowerCase().split(' ');
            const projectTitleWords = project.title.toLowerCase().split(' ');
            
            titleWords.forEach(word => {
                if (word.length > 2) { // Ignore very short words
                    projectTitleWords.forEach((projectWord: string) => {
                        if (projectWord.includes(word) || word.includes(projectWord)) {
                            score += 3; // Higher weight for title matches
                        }
                    });
                }
            });

            // Description similarity
            if (project.description) {
                const descWords = project.description.toLowerCase().split(' ');
                titleWords.forEach(word => {
                    if (word.length > 2) {
                        descWords.forEach((descWord: string) => {
                            if (descWord.includes(word) || word.includes(descWord)) {
                                score += 1;
                            }
                        });
                    }
                });
            }

            // Technology overlap
            const projectTechs = Array.isArray(project.technologies) ? project.technologies : [];
            const commonTechs = technologies.filter(tech => 
                projectTechs.some((projectTech: string) => 
                    projectTech.toLowerCase() === tech.toLowerCase()
                )
            );
            score += commonTechs.length * 2; // Weight for each matching technology

            return {
                ...project,
                similarityScore: score
            };
        });

        // Filter projects with score > 0 and sort by score
        const similarProjects = scoredProjects
            .filter((project: any) => project.similarityScore > 0)
            .sort((a: any, b: any) => b.similarityScore - a.similarityScore)
            .slice(0, limit)
            .map((project: any) => ({
                id: project.id,
                slug: project.slug,
                title: project.title,
                description: project.description || project.shortDescription || '',
                shortDescription: project.shortDescription || '',
                difficulty: project.difficulty || 'INTERMEDIATE',
                technologies: Array.isArray(project.technologies) ? project.technologies : [],
                estimatedHours: project.estimatedHours || 20,
                totalViews: project.totalViews || 0,
                includeAssessment: project.includeAssessment || false,
                createdAt: project.createdAt,
                creator: project.creator || { name: 'Anonymous', username: null, image: null },
                _count: project._count || { submissions: 0, progress: 0 },
                similarityScore: project.similarityScore
            }));

        return {
            success: true,
            data: similarProjects,
        };
    } catch (error) {
        console.error("Error searching similar projects:", error);
        return {
            success: false,
            error: "Failed to search similar projects",
        };
    }
}

// ========================================
// PROJECT ENROLLMENT (PURCHASE)
// ========================================

/**
 * Enroll a user in a public project (purchase/enroll)
 * - Deducts credits
 * - Creates user progress
 * - Creates task progress for all tasks
 * - Tracks activity
 */
export async function enrollInProject(projectId: string): Promise<ActionResponse> {
    try {
        const user = await getCurrentUser();

        // Get the project with tasks
        const project = await prisma.projectV2.findUnique({
            where: { id: projectId },
            include: {
                tasks: {
                    orderBy: { orderIndex: 'asc' }
                },
                creator: {
                    select: { id: true, name: true }
                }
            }
        });

        if (!project) {
            return { success: false, error: "Project not found" };
        }

        // Check if user is the creator
        if (project.createdBy === user.id) {
            return { success: false, error: "You cannot enroll in your own project" };
        }

        // Check if already enrolled
        const existingProgress = await prisma.userProjectV2Progress.findUnique({
            where: {
                userId_projectId: {
                    userId: user.id,
                    projectId
                }
            }
        });

        if (existingProgress) {
            return { success: false, error: "You are already enrolled in this project" };
        }

        // Check if project is public
        if (project.visibility !== 'PUBLIC') {
            return { success: false, error: "This project is not available for enrollment" };
        }

        // Calculate cost (13 credits for public projects)
        const enrollmentCost = 13;

        // Check user credits
        if (user.credits < enrollmentCost) {
            return { 
                success: false, 
                error: `Insufficient credits. You need ${enrollmentCost} credits to enroll.` 
            };
        }

        // Perform enrollment in a transaction
        const result = await prisma.$transaction(async (tx: any) => {
            // 1. Deduct credits
            await tx.user.update({
                where: { id: user.id },
                data: { credits: { decrement: enrollmentCost } }
            });

            // 2. Create credit transaction
            await tx.creditTransaction.create({
                data: {
                    userId: user.id,
                    amount: -enrollmentCost,
                    type: "SPEND",
                    currency: "NA",
                    description: `Enrolled in: ${project.title}`,
                }
            });

            // 3. Create user progress
            const progress = await tx.userProjectV2Progress.create({
                data: {
                    userId: user.id,
                    projectId,
                    status: "IN_PROGRESS",
                    totalTasks: project.tasks.length,
                    startedAt: new Date(),
                }
            });

            // 4. Create task progress for all tasks (snapshot)
            const taskStatuses = project.tasks.map((task: any) => ({
                userId: user.id,
                projectId,
                taskId: task.id,
                progressId: progress.id,
                status: "TO_DO" as const,
            }));

            await tx.userTaskV2Status.createMany({
                data: taskStatuses,
            });

            // 5. Increment project started count
            await tx.projectV2.update({
                where: { id: projectId },
                data: { totalStarted: { increment: 1 } }
            });

            return progress;
        });

        revalidatePath('/projects');
        revalidatePath('/projects/myprojects');
        revalidatePath(`/projects/${project.slug}`);

        return {
            success: true,
            data: {
                progress: result,
                creditsSpent: enrollmentCost,
                tasksCount: project.tasks.length,
                projectTitle: project.title,
                projectSlug: project.slug
            }
        };

    } catch (error: any) {
        console.error("[ENROLL PROJECT ERROR]:", error);
        return {
            success: false,
            error: error.message || "Failed to enroll in project"
        };
    }
}