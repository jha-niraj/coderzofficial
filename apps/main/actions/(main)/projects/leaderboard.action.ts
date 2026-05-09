"use server"

import { getSession } from "@repo/auth";
import { headers } from "next/headers";
import {
    db,
    users,
    projectsV2,
    userProjectV2Progress,
    projectV2QuizAttempts,
    projectV2MockSessions,
    projectV2Leaderboards,
    projectV2GlobalLeaderboards,
} from "@repo/db";
import { eq, and, gt, ne, sql } from "drizzle-orm";
import {
    calculateTotalScore
} from "@/lib/project-scoring"
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
        const session = await getSession(headers());
        const targetUserId = userId || session?.user?.id

        if (!targetUserId) {
            return { success: false, message: "User not authenticated" }
        }

        const progress = await db.query.userProjectV2Progress.findFirst({
            where: and(
                eq(userProjectV2Progress.userId, targetUserId),
                eq(userProjectV2Progress.projectId, projectId)
            ),
            with: {
                taskStatuses: {
                    with: {
                        task: {
                            columns: { id: true, difficulty: true }
                        }
                    }
                },
                project: {
                    with: {
                        sprints: {
                            with: {
                                tasks: {
                                    columns: { id: true, difficulty: true }
                                }
                            }
                        },
                        quiz: {
                            columns: { id: true, totalQuestions: true }
                        }
                    }
                }
            }
        });

        if (!progress) {
            return { success: false, message: "Progress not found" }
        }

        const completedTasks: CompletedTask[] = progress.taskStatuses
            .filter((ts: any) => ts.status === "COMPLETED")
            .map((ts: any) => ({
                taskId: ts.task.id,
                difficulty: ts.task.difficulty
            }))

        const quizAttempt = await db.query.projectV2QuizAttempts.findFirst({
            where: and(
                eq(projectV2QuizAttempts.userId, targetUserId),
                eq(projectV2QuizAttempts.quizId, progress.project.quiz?.id || "")
            )
        });

        const quizCorrect = quizAttempt?.correctAnswers || 0
        const quizTotal = progress.project.quiz?.totalQuestions || 0

        const mockSession = await db.query.projectV2MockSessions.findFirst({
            where: and(
                eq(projectV2MockSessions.userId, targetUserId),
                eq(projectV2MockSessions.projectId, projectId),
                eq(projectV2MockSessions.status, "COMPLETED")
            ),
            orderBy: (sessions: any, { desc }: any) => [desc(sessions.completedAt)]
        });

        const mockScore = mockSession?.score || null

        const projectData = progress.project as any
        const allTasks = projectData.sprints?.flatMap((s: any) => s.tasks) || []

        const scoreCalculation: ScoreCalculation = calculateTotalScore(
            completedTasks,
            allTasks,
            quizCorrect,
            quizTotal,
            mockScore
        )

        await db.update(userProjectV2Progress)
            .set({
                totalScore: scoreCalculation.totalScore,
                tasksScore: scoreCalculation.tasksScore,
                quizScore: scoreCalculation.quizScore,
                mockScore: scoreCalculation.mockScore
            })
            .where(eq(userProjectV2Progress.id, progress.id));

        await updateLeaderboardEntry(projectId, targetUserId)
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
        const progress = await db.query.userProjectV2Progress.findFirst({
            where: and(
                eq(userProjectV2Progress.userId, userId),
                eq(userProjectV2Progress.projectId, projectId)
            )
        });

        if (!progress) return

        const higherScoreRows = await db.select({ count: sql<number>`count(*)` })
            .from(userProjectV2Progress)
            .where(and(
                eq(userProjectV2Progress.projectId, projectId),
                gt(userProjectV2Progress.totalScore, progress.totalScore)
            ));

        const rank = Number(higherScoreRows[0]?.count ?? 0) + 1
        const progressPercent = progress.totalTasks > 0
            ? (progress.tasksCompleted / progress.totalTasks) * 100
            : 0

        const existing = await db.query.projectV2Leaderboards.findFirst({
            where: and(
                eq(projectV2Leaderboards.userId, userId),
                eq(projectV2Leaderboards.projectId, projectId)
            )
        });

        if (existing) {
            await db.update(projectV2Leaderboards)
                .set({
                    rank,
                    score: progress.totalScore,
                    tasksCompleted: progress.tasksCompleted,
                    totalTasks: progress.totalTasks,
                    progressPercent,
                    tasksScore: progress.tasksScore,
                    quizScore: progress.quizScore,
                    mockScore: progress.mockScore,
                    lastUpdated: new Date()
                })
                .where(eq(projectV2Leaderboards.id, existing.id));
        } else {
            await db.insert(projectV2Leaderboards).values({
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
            });
        }
    } catch (error) {
        console.error("Error updating leaderboard entry:", error)
    }
}

/**
 * Update global leaderboard for a user
 */
async function updateGlobalLeaderboard(userId: string) {
    try {
        const allProgress = await db.query.userProjectV2Progress.findMany({
            where: and(
                eq(userProjectV2Progress.userId, userId),
                ne(userProjectV2Progress.status, "NOT_STARTED")
            )
        });

        const totalScore = allProgress.reduce((sum: number, p: any) => sum + p.totalScore, 0)
        const projectsStarted = allProgress.length
        const projectsCompleted = allProgress.filter((p: any) => p.status === "COMPLETED").length
        const averageScore = projectsStarted > 0 ? totalScore / projectsStarted : 0

        const [quizCountArr, mockCountArr] = await Promise.all([
            db.select({ count: sql<number>`count(*)` }).from(projectV2QuizAttempts).where(and(
                eq(projectV2QuizAttempts.userId, userId),
                eq(projectV2QuizAttempts.isCompleted, true)
            )),
            db.select({ count: sql<number>`count(*)` }).from(projectV2MockSessions).where(and(
                eq(projectV2MockSessions.userId, userId),
                eq(projectV2MockSessions.status, "COMPLETED")
            )),
        ]);

        const quizAttempts = Number(quizCountArr[0]?.count ?? 0)
        const mockSessions = Number(mockCountArr[0]?.count ?? 0)
        const totalTasksCompleted = allProgress.reduce((sum: number, p: any) => sum + p.tasksCompleted, 0)

        const higherScoreRows = await db.select({ count: sql<number>`count(*)` })
            .from(projectV2GlobalLeaderboards)
            .where(gt(projectV2GlobalLeaderboards.totalScore, totalScore));

        const rank = Number(higherScoreRows[0]?.count ?? 0) + 1

        const existing = await db.query.projectV2GlobalLeaderboards.findFirst({
            where: eq(projectV2GlobalLeaderboards.userId, userId)
        });

        if (existing) {
            await db.update(projectV2GlobalLeaderboards)
                .set({
                    rank,
                    totalScore,
                    projectsStarted,
                    projectsCompleted,
                    averageScore,
                    totalTasksCompleted,
                    totalQuizzesCompleted: quizAttempts,
                    totalMocksCompleted: mockSessions,
                    lastUpdated: new Date()
                })
                .where(eq(projectV2GlobalLeaderboards.id, existing.id));
        } else {
            await db.insert(projectV2GlobalLeaderboards).values({
                userId,
                rank,
                totalScore,
                projectsStarted,
                projectsCompleted,
                averageScore,
                totalTasksCompleted,
                totalQuizzesCompleted: quizAttempts,
                totalMocksCompleted: mockSessions
            });
        }
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
        const project = await db.query.projectsV2.findFirst({
            where: eq(projectsV2.slug, projectSlug),
            columns: { id: true, title: true, visibility: true, slug: true, createdBy: true }
        });

        if (!project) {
            return { success: false, message: "Project not found" }
        }

        const skip = (page - 1) * limit

        const [leaderboard, totalArr] = await Promise.all([
            db.query.projectV2Leaderboards.findMany({
                where: eq(projectV2Leaderboards.projectId, project.id),
                with: {
                    user: {
                        columns: { id: true, username: true, name: true, image: true }
                    }
                },
                orderBy: (lb: any, { desc, asc }: any) => [desc(lb.score), asc(lb.lastUpdated)],
                offset: skip,
                limit
            }),
            db.select({ count: sql<number>`count(*)` })
                .from(projectV2Leaderboards)
                .where(eq(projectV2Leaderboards.projectId, project.id))
        ]);

        const total = Number(totalArr[0]?.count ?? 0)

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

        const [leaderboard, totalArr] = await Promise.all([
            db.query.projectV2GlobalLeaderboards.findMany({
                with: {
                    user: {
                        columns: { id: true, username: true, name: true, image: true }
                    }
                },
                orderBy: (lb: any, { desc, asc }: any) => [desc(lb.totalScore), desc(lb.averageScore), asc(lb.lastUpdated)],
                offset: skip,
                limit
            }),
            db.select({ count: sql<number>`count(*)` }).from(projectV2GlobalLeaderboards)
        ]);

        const total = Number(totalArr[0]?.count ?? 0)

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
 * Get user's detailed progress for a project
 */
export async function getUserProjectProgress(projectSlug: string, username: string): Promise<ActionResponse<UserProjectProgressDetail>> {
    try {
        const user = await db.query.users.findFirst({
            where: eq(users.username, username),
            columns: { id: true, username: true, name: true, image: true }
        });

        if (!user) {
            return { success: false, message: "User not found" }
        }

        const project = await db.query.projectsV2.findFirst({
            where: eq(projectsV2.slug, projectSlug)
        });

        if (!project) {
            return { success: false, message: "Project not found" }
        }

        const progress = await db.query.userProjectV2Progress.findFirst({
            where: and(
                eq(userProjectV2Progress.userId, user.id),
                eq(userProjectV2Progress.projectId, project.id)
            ),
            with: {
                taskStatuses: {
                    with: {
                        task: {
                            columns: { id: true, title: true, description: true, difficulty: true, badges: true }
                        }
                    },
                    orderBy: (ts: any, { asc }: any) => [asc(ts.task?.orderIndex)]
                }
            }
        });

        if (!progress) {
            return { success: false, message: "No progress found for this user" }
        }

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
