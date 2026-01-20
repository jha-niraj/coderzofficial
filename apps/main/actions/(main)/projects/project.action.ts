"use server";

import { auth } from "@repo/auth";
import prisma from "@repo/prisma";
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
                // Tasks are now fetched THROUGH sprints
                sprints: {
                    orderBy: { orderIndex: 'asc' },
                    include: {
                        tasks: {
                            orderBy: { orderIndex: 'asc' },
                            include: {
                                taskDetail: true, // Include task details for resources/links
                            },
                        },
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
        console.log(error);
        return { success: false, error: error.message };
    }
}

export async function startProject(projectId: string): Promise<ActionResponse> {
    try {
        const user = await getCurrentUser();

        // Fetch project with sprints and their tasks
        const project = await prisma.projectV2.findUnique({
            where: { id: projectId },
            include: {
                sprints: {
                    include: {
                        tasks: true,
                    },
                },
            },
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

        // Flatten tasks from all sprints
        const allTasks = project.sprints.flatMap(sprint => sprint.tasks);

        // Create progress record
        const progress = await prisma.userProjectV2Progress.create({
            data: {
                userId: user.id,
                projectId,
                status: "IN_PROGRESS",
                totalTasks: allTasks.length,
                startedAt: new Date(),
            }
        });

        // Create task statuses (all TO_DO initially)
        if (allTasks.length > 0) {
            const taskStatuses = allTasks.map((task) => ({
                userId: user.id,
                projectId,
                taskId: task.id,
                progressId: progress.id,
                status: "TO_DO" as const,
            }));

            await prisma.userTaskV2Status.createMany({
                data: taskStatuses,
            });
        }

        // Increment project started count
        await prisma.projectV2.update({
            where: { id: projectId },
            data: { totalStarted: { increment: 1 } }
        });

        revalidatePath(`/projects/${project.slug}`);

        return { success: true, data: progress };
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return { success: false, error: errorMessage };
    }
}

// ========================================
// TASK MANAGEMENT
// ========================================

export async function getProjectTasks(slug: string): Promise<ActionResponse> {
    try {
        const user = await getCurrentUser();

        // Get project with sprints and tasks
        const project = await prisma.projectV2.findUnique({
            where: { slug },
            select: {
                id: true,
                title: true,
                sprints: {
                    orderBy: { orderIndex: 'asc' },
                    include: {
                        tasks: {
                            orderBy: { orderIndex: 'asc' },
                            include: {
                                UserTaskV2Status: {
                                    where: { userId: user.id },
                                },
                                taskDetail: true,
                            },
                        },
                    },
                },
            },
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

        // Flatten tasks from all sprints and add status
        const allTasksWithStatus = project.sprints.flatMap(sprint =>
            sprint.tasks.map((task) => ({
                id: task.id,
                title: task.title,
                description: task.description,
                criteria: task.criteria,
                hints: task.hints,
                badges: task.badges,
                tags: task.tags,
                difficulty: task.difficulty,
                terminalCommand: task.terminalCommand,
                category: task.category,
                estimatedTime: task.estimatedTime,
                checkpoints: task.checkpoints,
                relatedPages: task.relatedPages,
                dependencies: task.dependencies,
                sprintId: task.sprintId,
                sprintName: sprint.name,
                sprintNumber: sprint.sprintNumber,
                taskDetail: task.taskDetail,
                status: task.UserTaskV2Status[0]?.status || "TO_DO",
                completedAt: task.UserTaskV2Status[0]?.completedAt,
                notes: task.UserTaskV2Status[0]?.notes,
            }))
        );

        // Group by status for kanban
        const columns = {
            todo: allTasksWithStatus.filter((t) => t.status === "TO_DO"),
            inProgress: allTasksWithStatus.filter((t) => t.status === "IN_PROGRESS"),
            completed: allTasksWithStatus.filter((t) => t.status === "COMPLETED"),
        };

        // Also return sprint-organized structure
        const sprintsWithTasks = project.sprints.map(sprint => ({
            id: sprint.id,
            sprintNumber: sprint.sprintNumber,
            name: sprint.name,
            goal: sprint.goal,
            duration: sprint.duration,
            tasks: sprint.tasks.map(task => ({
                id: task.id,
                title: task.title,
                description: task.description,
                criteria: task.criteria,
                hints: task.hints,
                badges: task.badges,
                tags: task.tags,
                difficulty: task.difficulty,
                terminalCommand: task.terminalCommand,
                category: task.category,
                estimatedTime: task.estimatedTime,
                checkpoints: task.checkpoints,
                relatedPages: task.relatedPages,
                dependencies: task.dependencies,
                taskDetail: task.taskDetail,
                status: task.UserTaskV2Status[0]?.status || "TO_DO",
                completedAt: task.UserTaskV2Status[0]?.completedAt,
            })),
            completedTasks: sprint.tasks.filter(t => t.UserTaskV2Status[0]?.status === "COMPLETED").length,
            totalTasks: sprint.tasks.length,
        }));

        return {
            success: true,
            data: {
                columns,
                sprints: sprintsWithTasks,
                progress: {
                    totalTasks: progress.totalTasks,
                    completedTasks: progress.tasksCompleted,
                    progressPercentage: progress.progressPercentage,
                },
                projectTitle: project.title,
            }
        };
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return { success: false, error: errorMessage };
    }
}

export async function updateTaskStatus(
    taskId: string,
    newStatus: "TO_DO" | "IN_PROGRESS" | "COMPLETED"
): Promise<ActionResponse> {
    try {
        const user = await getCurrentUser();

        // Task now belongs to Sprint, so we get projectId through sprint
        const task = await prisma.projectV2Task.findUnique({
            where: { id: taskId },
            include: {
                sprint: {
                    select: { projectId: true },
                },
            },
        });

        if (!task || !task.sprint) {
            return { success: false, error: "Task not found" };
        }

        const projectId = task.sprint.projectId;

        const progress = await prisma.userProjectV2Progress.findUnique({
            where: { userId_projectId: { userId: user.id, projectId } }
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
                projectId,
                taskId,
                progressId: progress.id,
                status: newStatus,
                completedAt: newStatus === "COMPLETED" ? new Date() : null,
            },
        });

        // Recalculate progress - count completed tasks for this user in this project
        const completedCount = await prisma.userTaskV2Status.count({
            where: {
                userId: user.id,
                projectId,
                status: "COMPLETED",
            },
        });

        // Get total tasks through sprints
        const project = await prisma.projectV2.findUnique({
            where: { id: projectId },
            include: {
                sprints: {
                    include: {
                        tasks: { select: { id: true } },
                    },
                },
            },
        });

        const totalTasks = project?.sprints.reduce((acc, sprint) => acc + sprint.tasks.length, 0) || 0;
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
        if (completedCount === totalTasks && totalTasks > 0) {
            await prisma.projectV2.update({
                where: { id: projectId },
                data: { totalCompleted: { increment: 1 } },
            });
        }

        // Update score if task was completed
        if (newStatus === "COMPLETED") {
            const { updateProjectScore } = await import("./leaderboard.action");
            await updateProjectScore(projectId);
        }

        return { success: true, data: { completedCount, totalTasks, progressPercentage } };
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return { success: false, error: errorMessage };
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
                sprints: {
                    select: {
                        tasks: {
                            orderBy: { orderIndex: 'asc' }
                        },
                    }
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

            // Flatten tasks from all sprints
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const allTasks = project.sprints.flatMap((s: any) => s.tasks)

            // 3. Create user progress
            const progress = await tx.userProjectV2Progress.create({
                data: {
                    userId: user.id,
                    projectId,
                    status: "IN_PROGRESS",
                    totalTasks: allTasks.length,
                    startedAt: new Date(),
                }
            });

            // 4. Create task progress for all tasks (snapshot)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const taskStatuses = allTasks.map((task: any) => ({
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
                // We don't have allTasks here in scope but we can get it from result if we return it or just use similar logic
                // But for simplicity, we assume result is the progress object which has totalTasks
                tasksCount: result.totalTasks,
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

// ========================================
// PROJECT FORKING
// ========================================

/**
 * Fork a public project
 * - Creates a complete copy of the project for the new user
 * - Copies ALL current tasks (including any added by the owner)
 * - Copies pages
 * - Links to original project via forkedFromId
 * - User starts with 0% progress
 */
export async function forkProject(
    projectId: string,
    options?: { customTitle?: string }
): Promise<ActionResponse> {
    try {
        const user = await getCurrentUser();

        // Get the source project with ALL related data (tasks through sprints)
        const sourceProject = await prisma.projectV2.findUnique({
            where: { id: projectId },
            include: {
                sprints: {
                    orderBy: { orderIndex: 'asc' },
                    include: {
                        tasks: {
                            orderBy: { orderIndex: 'asc' },
                        },
                    },
                },
                pages: {
                    orderBy: { orderIndex: 'asc' }
                },
                creator: {
                    select: { id: true, name: true, username: true }
                }
            }
        });

        if (!sourceProject) {
            return { success: false, error: "Project not found" };
        }

        // Check if project is public (only public projects can be forked)
        if (sourceProject.visibility !== 'PUBLIC') {
            return { success: false, error: "Only public projects can be forked" };
        }

        // Check if user is trying to fork their own project
        if (sourceProject.createdBy === user.id) {
            return { success: false, error: "You cannot fork your own project" };
        }

        // Generate unique slug for the forked project
        const baseTitle = options?.customTitle || `${sourceProject.title}`;
        const baseSlug = generateSlug(baseTitle);
        let finalSlug = baseSlug;
        let slugCounter = 1;

        // Ensure unique slug
        while (await prisma.projectV2.findUnique({ where: { slug: finalSlug } })) {
            finalSlug = `${baseSlug}-${slugCounter}`;
            slugCounter++;
        }

        // Create the forked project in a transaction
        const result = await prisma.$transaction(async (tx) => {
            // 1. Create the forked project with new fields
            const forkedProject = await tx.projectV2.create({
                data: {
                    slug: finalSlug,
                    title: baseTitle,
                    shortDescription: sourceProject.shortDescription,
                    description: sourceProject.description,
                    technologies: sourceProject.technologies,
                    generationType: sourceProject.generationType,
                    primaryLanguageOrFramework: sourceProject.primaryLanguageOrFramework,
                    difficulty: sourceProject.difficulty,
                    visibility: 'PRIVATE', // Forked projects start as private
                    estimatedHours: sourceProject.estimatedHours,
                    includeAssessment: sourceProject.includeAssessment,
                    // New fields
                    blueprintOverview: sourceProject.blueprintOverview,
                    vision: sourceProject.vision,
                    targetAudience: sourceProject.targetAudience,
                    problemSolution: sourceProject.problemSolution,
                    estimatedDuration: sourceProject.estimatedDuration,
                    keyOutcomes: sourceProject.keyOutcomes,
                    features: sourceProject.features ?? undefined,
                    technicalRequirements: sourceProject.technicalRequirements ?? undefined,
                    dataArchitecture: sourceProject.dataArchitecture ?? undefined,
                    projectStructure: sourceProject.projectStructure ?? undefined,
                    setupGuide: sourceProject.setupGuide ?? undefined,
                    stacks: sourceProject.stacks ?? {},
                    assistantEcho: sourceProject.assistantEcho ?? {},
                    assistantRaw: sourceProject.assistantRaw ?? {},
                    createdBy: user.id,
                    // Fork tracking
                    isFork: true,
                    forkedFromId: sourceProject.id,
                }
            });

            // 2. Copy all pages with new fields
            if (sourceProject.pages.length > 0) {
                await tx.projectV2Page.createMany({
                    data: sourceProject.pages.map((page) => ({
                        projectId: forkedProject.id,
                        name: page.name,
                        difficulty: page.difficulty,
                        coreFeatures: page.coreFeatures,
                        recommendedComponents: page.recommendedComponents,
                        orderIndex: page.orderIndex,
                        // New fields
                        route: page.route,
                        purpose: page.purpose,
                        estimatedTime: page.estimatedTime,
                        layout: page.layout ?? undefined,
                        components: page.components ?? undefined,
                        userInteractions: page.userInteractions,
                        dataNeeded: page.dataNeeded,
                    }))
                });
            }

            // 3. Copy all sprints first (to get new IDs for task mapping)
            const sprintIdMap: Record<string, string> = {};
            if (sourceProject.sprints.length > 0) {
                for (const sprint of sourceProject.sprints) {
                    const newSprint = await tx.projectV2Sprint.create({
                        data: {
                            projectId: forkedProject.id,
                            sprintNumber: sprint.sprintNumber,
                            name: sprint.name,
                            goal: sprint.goal,
                            duration: sprint.duration,
                            orderIndex: sprint.orderIndex,
                        }
                    });
                    sprintIdMap[sprint.id] = newSprint.id;
                }
            }

            // 4. Copy all tasks through sprints (tasks now belong to sprints)
            const newTasks: { id: string }[] = [];
            for (const sprint of sourceProject.sprints) {
                const newSprintId = sprintIdMap[sprint.id];
                if (!newSprintId) continue;

                for (const task of sprint.tasks) {
                    const newTask = await tx.projectV2Task.create({
                        data: {
                            sprintId: newSprintId, // Tasks belong to sprints now
                            title: task.title,
                            description: task.description,
                            criteria: task.criteria,
                            hints: task.hints,
                            badges: task.badges,
                            tags: task.tags,
                            difficulty: task.difficulty,
                            terminalCommand: task.terminalCommand,
                            orderIndex: task.orderIndex,
                            category: task.category,
                            estimatedTime: task.estimatedTime,
                            checkpoints: task.checkpoints,
                            relatedPages: task.relatedPages,
                            dependencies: task.dependencies,
                        }
                    });
                    newTasks.push(newTask);
                }
            }

            // 4. Create user progress (starting at 0%)
            const progress = await tx.userProjectV2Progress.create({
                data: {
                    userId: user.id,
                    projectId: forkedProject.id,
                    status: "IN_PROGRESS",
                    totalTasks: newTasks.length,
                    tasksCompleted: 0,
                    progressPercentage: 0,
                    startedAt: new Date(),
                }
            });

            // 5. Create task statuses for all new tasks
            if (newTasks.length > 0) {
                await tx.userTaskV2Status.createMany({
                    data: newTasks.map((task: any) => ({
                        userId: user.id,
                        projectId: forkedProject.id,
                        taskId: task.id,
                        progressId: progress.id,
                        status: "TO_DO" as const,
                    }))
                });
            }

            // 6. Increment fork count on original project
            await tx.projectV2.update({
                where: { id: sourceProject.id },
                data: { forkCount: { increment: 1 } }
            });

            return {
                forkedProject,
                progress,
                tasksCount: newTasks.length
            };
        });

        revalidatePath('/projects');
        revalidatePath('/projects/myprojects');
        revalidatePath(`/projects/${sourceProject.slug}`);

        return {
            success: true,
            data: {
                projectId: result.forkedProject.id,
                projectSlug: result.forkedProject.slug,
                projectTitle: result.forkedProject.title,
                tasksCount: result.tasksCount,
                forkedFrom: {
                    id: sourceProject.id,
                    title: sourceProject.title,
                    creatorName: sourceProject.creator.name || sourceProject.creator.username
                }
            }
        };

    } catch (error: any) {
        console.error("[FORK PROJECT ERROR]:", error);
        return {
            success: false,
            error: error.message || "Failed to fork project"
        };
    }
}