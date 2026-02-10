"use server"

import { auth } from "@repo/auth"
import {
    calculateTaskScoring, calculateQuizScore, calculateMockScore, 
    calculateTotalScore
} from "@/lib/project-scoring"
import prisma from "@repo/prisma"
import type {
    CompletedTask, ScoreCalculation, LeaderboardEntry, GlobalLeaderboardEntry,
    ActionResponse, LeaderboardResponse, GlobalLeaderboardResponse,
    UserProjectProgressDetail
} from "@/types/projectv2"

/**
 * Update user's project score after task completion
 */
export async function updateProjectScore(projectId: string, userId?: string) {
    try {
        const session = await auth()
        const targetUserId = userId || session?.user?.id

        if (!targetUserId) {
            return { success: false, message: "User not authenticated" }
        }

        // Get user's progress with all related data
        const progress = await prisma.userProjectV2Progress.findUnique({
            where: {
                userId_projectId: {
                    userId: targetUserId,
                    projectId
                }
            },
            include: {
                taskStatuses: {
                    include: {
                        task: {
                            select: {
                                id: true,
                                difficulty: true
                            }
                        }
                    }
                },
                project: {
                    include: {
                        sprints: {
                            include: {
                                tasks: {
                                    select: {
                                        id: true,
                                        difficulty: true
                                    }
                                }
                            }
                        },
                        quiz: {
                            select: {
                                id: true,
                                totalQuestions: true
                            }
                        }
                    }
                }
            }
        })

        if (!progress) {
            return { success: false, message: "Progress not found" }
        }

        // Get completed tasks
        const completedTasks: CompletedTask[] = progress.taskStatuses
            .filter((ts: any) => ts.status === "COMPLETED")
            .map((ts: any) => ({
                taskId: ts.task.id,
                difficulty: ts.task.difficulty
            }))

        // Get quiz score
        const quizAttempt = await prisma.projectV2QuizAttempt.findUnique({
            where: {
                userId_quizId: {
                    userId: targetUserId,
                    quizId: progress.project.quiz?.id || ""
                }
            }
        })

        const quizCorrect = quizAttempt?.correctAnswers || 0
        const quizTotal = progress.project.quiz?.totalQuestions || 0

        // Get mock score
        const mockSession = await prisma.projectV2MockSession.findFirst({
            where: {
                userId: targetUserId,
                projectId: projectId,
                status: "COMPLETED"
            },
            orderBy: {
                completedAt: "desc"
            }
        })

        const mockScore = mockSession?.score || null

        // Calculate total score
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const projectData = progress.project as any
        const allTasks = projectData.sprints?.flatMap((s: any) => s.tasks) || []

        const scoreCalculation: ScoreCalculation = calculateTotalScore(
            completedTasks,
            allTasks,
            quizCorrect,
            quizTotal,
            mockScore
        )

        // Update progress with new scores
        await prisma.userProjectV2Progress.update({
            where: { id: progress.id },
            data: {
                totalScore: scoreCalculation.totalScore,
                tasksScore: scoreCalculation.tasksScore,
                quizScore: scoreCalculation.quizScore,
                mockScore: scoreCalculation.mockScore
            }
        })

        // Update or create leaderboard entry
        await updateLeaderboardEntry(projectId, targetUserId)

        // Update global leaderboard
        await updateGlobalLeaderboard(targetUserId)

        return {
            success: true,
            data: scoreCalculation
        }
    } catch (error) {
        console.error("Error updating project score:", error)
        return { success: false, message: "Failed to update score" }
    }
}

/**
 * Update leaderboard entry for a specific project
 */
async function updateLeaderboardEntry(projectId: string, userId: string) {
    try {
        const progress = await prisma.userProjectV2Progress.findUnique({
            where: {
                userId_projectId: {
                    userId,
                    projectId
                }
            }
        })

        if (!progress) return

        // Calculate rank
        const higherScores = await prisma.userProjectV2Progress.count({
            where: {
                projectId,
                totalScore: {
                    gt: progress.totalScore
                }
            }
        })

        const rank = higherScores + 1
        const progressPercent = progress.totalTasks > 0
            ? (progress.tasksCompleted / progress.totalTasks) * 100
            : 0

        // Upsert leaderboard entry
        await prisma.projectV2Leaderboard.upsert({
            where: {
                userId_projectId: {
                    userId,
                    projectId
                }
            },
            create: {
                userId,
                projectId,
                rank,
                score: progress.totalScore,
                tasksCompleted: progress.tasksCompleted,
                totalTasks: progress.totalTasks,
                progressPercent,
                tasksScore: progress.tasksScore,
                quizScore: progress.quizScore,
                mockScore: progress.mockScore
            },
            update: {
                rank,
                score: progress.totalScore,
                tasksCompleted: progress.tasksCompleted,
                totalTasks: progress.totalTasks,
                progressPercent,
                tasksScore: progress.tasksScore,
                quizScore: progress.quizScore,
                mockScore: progress.mockScore,
                lastUpdated: new Date()
            }
        })
    } catch (error) {
        console.error("Error updating leaderboard entry:", error)
    }
}

/**
 * Update global leaderboard for a user
 */
async function updateGlobalLeaderboard(userId: string) {
    try {
        // Get all user's project scores
        const allProgress = await prisma.userProjectV2Progress.findMany({
            where: {
                userId,
                status: {
                    not: "NOT_STARTED"
                }
            }
        })

        const totalScore = allProgress.reduce((sum: number, p: any) => sum + p.totalScore, 0)
        const projectsStarted = allProgress.length
        const projectsCompleted = allProgress.filter((p: any) => p.status === "COMPLETED").length
        const averageScore = projectsStarted > 0 ? totalScore / projectsStarted : 0

        // Get component counts
        const quizAttempts = await prisma.projectV2QuizAttempt.count({
            where: {
                userId,
                isCompleted: true
            }
        })

        const mockSessions = await prisma.projectV2MockSession.count({
            where: {
                userId,
                status: "COMPLETED"
            }
        })

        const totalTasksCompleted = allProgress.reduce((sum: number, p: any) => sum + p.tasksCompleted, 0)

        // Calculate rank
        const higherScores = await prisma.projectV2GlobalLeaderboard.count({
            where: {
                totalScore: {
                    gt: totalScore
                }
            }
        })

        const rank = higherScores + 1

        // Upsert global leaderboard entry
        await prisma.projectV2GlobalLeaderboard.upsert({
            where: { userId },
            create: {
                userId,
                rank,
                totalScore,
                projectsStarted,
                projectsCompleted,
                averageScore,
                totalTasksCompleted,
                totalQuizzesCompleted: quizAttempts,
                totalMocksCompleted: mockSessions
            },
            update: {
                rank,
                totalScore,
                projectsStarted,
                projectsCompleted,
                averageScore,
                totalTasksCompleted,
                totalQuizzesCompleted: quizAttempts,
                totalMocksCompleted: mockSessions,
                lastUpdated: new Date()
            }
        })
    } catch (error) {
        console.error("Error updating global leaderboard:", error)
    }
}

/**
 * Get project leaderboard with pagination
 */
export async function getProjectLeaderboard(
    projectSlug: string,
    page: number = 1,
    limit: number = 20
): Promise<ActionResponse<LeaderboardResponse>> {
    try {
        const project = await prisma.projectV2.findUnique({
            where: { slug: projectSlug },
            select: { id: true, title: true, visibility: true, slug: true, createdBy: true }
        })

        if (!project) {
            return { success: false, message: "Project not found" }
        }

        const skip = (page - 1) * limit

        const [leaderboard, total] = await Promise.all([
            prisma.projectV2Leaderboard.findMany({
                where: { projectId: project.id },
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                            name: true,
                            image: true
                        }
                    }
                },
                orderBy: [
                    { score: "desc" },
                    { lastUpdated: "asc" }
                ],
                skip,
                take: limit
            }),
            prisma.projectV2Leaderboard.count({
                where: { projectId: project.id }
            })
        ])

        // Update ranks if needed (real-time ranking)
        const leaderboardWithRanks: LeaderboardEntry[] = leaderboard.map((entry: any, index: number) => ({
            ...entry,
            rank: skip + index + 1
        }))

        return {
            success: true,
            data: {
                project,
                leaderboard: leaderboardWithRanks,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            }
        }
    } catch (error) {
        console.error("Error getting project leaderboard:", error)
        return { success: false, message: "Failed to fetch leaderboard" }
    }
}

/**
 * Get global leaderboard with pagination
 */
export async function getGlobalLeaderboard(
    page: number = 1,
    limit: number = 20
): Promise<ActionResponse<GlobalLeaderboardResponse>> {
    try {
        const skip = (page - 1) * limit

        const [leaderboard, total] = await Promise.all([
            prisma.projectV2GlobalLeaderboard.findMany({
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                            name: true,
                            image: true
                        }
                    }
                },
                orderBy: [
                    { totalScore: "desc" },
                    { averageScore: "desc" },
                    { lastUpdated: "asc" }
                ],
                skip,
                take: limit
            }),
            prisma.projectV2GlobalLeaderboard.count()
        ])

        // Update ranks (real-time ranking)
        const leaderboardWithRanks: GlobalLeaderboardEntry[] = leaderboard.map((entry: any, index: number) => ({
            ...entry,
            rank: skip + index + 1
        }))

        return {
            success: true,
            data: {
                leaderboard: leaderboardWithRanks,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            }
        }
    } catch (error) {
        console.error("Error getting global leaderboard:", error)
        return { success: false, message: "Failed to fetch leaderboard" }
    }
}

/**
 * Get user's detailed progress for a project (for the sheet)
 */
export async function getUserProjectProgress(projectSlug: string, username: string): Promise<ActionResponse<UserProjectProgressDetail>> {
    try {
        const user = await prisma.user.findUnique({
            where: { username },
            select: {
                id: true,
                username: true,
                name: true,
                image: true
            }
        })

        if (!user) {
            return { success: false, message: "User not found" }
        }

        const project = await prisma.projectV2.findUnique({
            where: { slug: projectSlug }
        })

        if (!project) {
            return { success: false, message: "Project not found" }
        }

        const progress = await prisma.userProjectV2Progress.findUnique({
            where: {
                userId_projectId: {
                    userId: user.id,
                    projectId: project.id
                }
            },
            include: {
                taskStatuses: {
                    include: {
                        task: {
                            select: {
                                id: true,
                                title: true,
                                description: true,
                                difficulty: true,
                                badges: true
                            }
                        }
                    },
                    orderBy: {
                        task: {
                            orderIndex: "asc"
                        }
                    }
                }
            }
        })

        if (!progress) {
            return { success: false, message: "No progress found for this user" }
        }

        // Separate tasks by status
        const completedTasks = progress.taskStatuses.filter((ts: any) => ts.status === "COMPLETED")
        const inProgressTasks = progress.taskStatuses.filter((ts: any) => ts.status === "IN_PROGRESS")
        const todoTasks = progress.taskStatuses.filter((ts: any) => ts.status === "TO_DO")

        return {
            success: true,
            data: {
                user,
                project: {
                    title: project.title,
                    slug: project.slug
                },
                progress: {
                    id: progress.id,
                    status: progress.status,
                    startedAt: progress.startedAt,
                    completedAt: progress.completedAt,
                    totalScore: progress.totalScore,
                    tasksScore: progress.tasksScore,
                    quizScore: progress.quizScore,
                    mockScore: progress.mockScore,
                    tasksCompleted: progress.tasksCompleted,
                    totalTasks: progress.totalTasks,
                    progressPercentage: progress.progressPercentage
                },
                tasks: {
                    completed: completedTasks.map((ts: any) => ({
                        ...ts.task,
                        completedAt: ts.completedAt
                    })),
                    inProgress: inProgressTasks.map((ts: any) => ts.task),
                    todo: todoTasks.map((ts: any) => ts.task)
                }
            }
        }
    } catch (error) {
        console.error("Error getting user project progress:", error)
        return { success: false, message: "Failed to fetch progress" }
    }
}