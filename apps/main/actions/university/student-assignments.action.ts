"use server"

import { prisma } from "@repo/prisma"
import { auth } from "@repo/auth"

export interface StudentProjectAssignment {
    id: string
    type: "project"
    title: string
    description: string | null
    difficulty: string
    deadline: Date | null
    creditsRequired: number | null
    instructions: string | null
    classNames: string[]
    status: "pending" | "in_progress" | "completed"
    progress?: number
    technologies: string[]
    slug: string
}

export interface StudentMockAssignment {
    id: string
    type: "mock"
    title: string
    description: string | null
    category: string
    level: string
    deadline: Date | null
    creditsRequired: number | null
    instructions: string | null
    classNames: string[]
    status: "pending" | "completed"
    score?: number
    completedAt?: Date
}

export interface StudentQuizAssignment {
    id: string
    type: "quiz"
    title: string
    description: string | null
    difficulty: string
    questionCount: number
    timeLimit: number | null
    deadline: Date | null
    creditsRequired: number | null
    instructions: string | null
    classNames: string[]
    status: "pending" | "completed"
    score?: number
    completedAt?: Date
    isLiveSession: boolean
    liveSessionActive: boolean
}

export type StudentAssignment = StudentProjectAssignment | StudentMockAssignment | StudentQuizAssignment

interface ClassInfo {
    id: string
    name: string
    code: string | null
}

/**
 * Get all university assignments for a student (projects, mocks, quizzes)
 */
export async function getStudentUniversityAssignments() {
    const session = await auth()

    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" }
    }

    try {
        // Get student's verified university link
        const studentLink = await prisma.studentUniversityLink.findFirst({
            where: {
                userId: session.user.id,
                verificationStatus: "VERIFIED",
            },
            select: {
                id: true,
                universityId: true,
            },
        })

        if (!studentLink) {
            return {
                success: false,
                error: "Not verified with any university",
            }
        }

        // Get student's enrolled classes
        const enrollments = await prisma.classEnrollment.findMany({
            where: {
                studentLinkId: studentLink.id,
            },
            select: {
                classId: true,
                class: {
                    select: {
                        id: true,
                        name: true,
                        code: true,
                    },
                },
            },
        })

        const enrolledClassIds = enrollments.map(e => e.classId)
        const classMap = new Map<string, ClassInfo>(
            enrollments.map(e => [e.classId, e.class])
        )

        if (enrolledClassIds.length === 0) {
            return {
                success: true,
                data: {
                    projects: [],
                    mocks: [],
                    quizzes: [],
                    stats: {
                        total: 0,
                        pending: 0,
                        completed: 0,
                        dueSoon: 0,
                    },
                },
            }
        }

        // Fetch all assignment types
        const [projects, mocks, quizzes] = await Promise.all([
            getProjectAssignments(session.user.id, enrolledClassIds, classMap),
            getMockAssignments(session.user.id, enrolledClassIds, classMap),
            getQuizAssignments(session.user.id, enrolledClassIds, classMap),
        ])

        // Calculate stats
        const allAssignments = [...projects, ...mocks, ...quizzes]
        const now = new Date()
        const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)

        const stats = {
            total: allAssignments.length,
            pending: allAssignments.filter(a => a.status === "pending" || a.status === "in_progress").length,
            completed: allAssignments.filter(a => a.status === "completed").length,
            dueSoon: allAssignments.filter(a => {
                if (!a.deadline) return false
                const deadline = new Date(a.deadline)
                return deadline > now && deadline <= threeDaysFromNow && a.status !== "completed"
            }).length,
        }

        return {
            success: true,
            data: {
                projects,
                mocks,
                quizzes,
                stats,
            },
        }
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Failed to fetch assignments"
        console.error("Get student assignments error:", error)
        return { success: false, error: errorMessage }
    }
}

async function getProjectAssignments(
    userId: string,
    enrolledClassIds: string[],
    classMap: Map<string, ClassInfo>
): Promise<StudentProjectAssignment[]> {
    // Find projects that have any of the student's enrolled class IDs
    const projects = await prisma.projectV2.findMany({
        where: {
            isUniversityProject: true,
            classIds: {
                hasSome: enrolledClassIds,
            },
        },
        select: {
            id: true,
            title: true,
            shortDescription: true,
            difficulty: true,
            technologies: true,
            slug: true,
            classIds: true,
            assignmentDeadline: true,
            assignmentCredits: true,
            assignmentInstructions: true,
        },
    })

    // Get student's progress on these projects (using UserProjectV2Progress)
    const projectProgress = await prisma.userProjectV2Progress.findMany({
        where: {
            userId: userId,
            projectId: { in: projects.map(p => p.id) },
        },
        select: {
            projectId: true,
            progressPercentage: true,
            status: true,
        },
    })

    type ProgressRecord = { projectId: string; progressPercentage: number; status: string }
    const progressMap = new Map<string, ProgressRecord>(
        projectProgress.map(p => [p.projectId, p])
    )

    return projects.map((project): StudentProjectAssignment => {
        const progress = progressMap.get(project.id)
        const matchingClassIds = project.classIds.filter(cid => enrolledClassIds.includes(cid))
        const classNames = matchingClassIds.map(cid => classMap.get(cid)?.name || "Unknown")

        let status: "pending" | "in_progress" | "completed" = "pending"
        if (progress) {
            if (progress.status === "COMPLETED") {
                status = "completed"
            } else if (progress.progressPercentage > 0) {
                status = "in_progress"
            }
        }

        return {
            id: project.id,
            type: "project",
            title: project.title,
            description: project.shortDescription,
            difficulty: project.difficulty,
            deadline: project.assignmentDeadline,
            creditsRequired: project.assignmentCredits,
            instructions: project.assignmentInstructions,
            classNames,
            status,
            progress: progress?.progressPercentage ?? 0,
            technologies: project.technologies,
            slug: project.slug,
        }
    })
}

async function getMockAssignments(
    userId: string,
    enrolledClassIds: string[],
    classMap: Map<string, ClassInfo>
): Promise<StudentMockAssignment[]> {
    // Find mock interviews that have any of the student's enrolled class IDs
    const mocks = await prisma.mockInterviewVoice.findMany({
        where: {
            isUniversityMock: true,
            classIds: {
                hasSome: enrolledClassIds,
            },
        },
        select: {
            id: true,
            title: true,
            description: true,
            category: true,
            level: true,
            classIds: true,
            assignmentDeadline: true,
            assignmentCredits: true,
            assignmentInstructions: true,
        },
    })

    // Get student's sessions for these mocks (using MockVoiceSession)
    const mockSessions = await prisma.mockVoiceSession.findMany({
        where: {
            userId: userId,
            mockId: { in: mocks.map(m => m.id) },
        },
        select: {
            mockId: true,
            status: true,
            // Note: MockVoiceSession doesn't have overallScore, we use aiAnalysis instead
            completedAt: true,
        },
    })

    type SessionRecord = { mockId: string; status: string; completedAt: Date | null }
    const sessionMap = new Map<string, SessionRecord>(
        mockSessions.map(s => [s.mockId, s])
    )

    return mocks.map((mock): StudentMockAssignment => {
        const session = sessionMap.get(mock.id)
        const matchingClassIds = mock.classIds.filter(cid => enrolledClassIds.includes(cid))
        const classNames = matchingClassIds.map(cid => classMap.get(cid)?.name || "Unknown")

        const status: "pending" | "completed" = session?.status === "COMPLETED" ? "completed" : "pending"

        return {
            id: mock.id,
            type: "mock",
            title: mock.title,
            description: mock.description,
            category: mock.category,
            level: mock.level,
            deadline: mock.assignmentDeadline,
            creditsRequired: mock.assignmentCredits,
            instructions: mock.assignmentInstructions,
            classNames,
            status,
            score: undefined, // Score would need to be extracted from aiAnalysis
            completedAt: session?.completedAt ?? undefined,
        }
    })
}

async function getQuizAssignments(
    userId: string,
    enrolledClassIds: string[],
    classMap: Map<string, ClassInfo>
): Promise<StudentQuizAssignment[]> {
    // Find assessments/quizzes that have any of the student's enrolled class IDs
    const assessments = await prisma.userPracticeSet.findMany({
        where: {
            isUniversityAssessment: true,
            classIds: {
                hasSome: enrolledClassIds,
            },
        },
        select: {
            id: true,
            title: true,
            description: true,
            difficulty: true,
            timeLimit: true,
            classIds: true,
            assignmentDeadline: true,
            assignmentCredits: true,
            assignmentInstructions: true,
            isLiveSession: true,
            liveSessionActive: true,
            _count: {
                select: { questions: true },
            },
        },
    })

    // Get student's attempts for these assessments
    const attempts = await prisma.userPracticeSetAttempt.findMany({
        where: {
            userId: userId,
            practiceSetId: { in: assessments.map(a => a.id) },
        },
        select: {
            practiceSetId: true,
            status: true,
            score: true,
            completedAt: true,
        },
    })

    type AttemptRecord = { practiceSetId: string; status: string; score: number | null; completedAt: Date | null }
    const attemptMap = new Map<string, AttemptRecord>(
        attempts.map(a => [a.practiceSetId, a])
    )

    return assessments.map((assessment): StudentQuizAssignment => {
        const attempt = attemptMap.get(assessment.id)
        const matchingClassIds = assessment.classIds.filter(cid => enrolledClassIds.includes(cid))
        const classNames = matchingClassIds.map(cid => classMap.get(cid)?.name || "Unknown")

        const status: "pending" | "completed" = attempt?.status === "COMPLETED" ? "completed" : "pending"

        return {
            id: assessment.id,
            type: "quiz",
            title: assessment.title,
            description: assessment.description,
            difficulty: assessment.difficulty,
            questionCount: assessment._count.questions,
            timeLimit: assessment.timeLimit,
            deadline: assessment.assignmentDeadline,
            creditsRequired: assessment.assignmentCredits,
            instructions: assessment.assignmentInstructions,
            classNames,
            status,
            score: attempt?.score ?? undefined,
            completedAt: attempt?.completedAt ?? undefined,
            isLiveSession: assessment.isLiveSession ?? false,
            liveSessionActive: assessment.liveSessionActive ?? false,
        }
    })
}

/**
 * Get details of a specific assignment
 */
export async function getAssignmentDetails(
    assignmentId: string,
    type: "project" | "mock" | "quiz"
) {
    const session = await auth()

    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" }
    }

    try {
        switch (type) {
            case "project": {
                const project = await prisma.projectV2.findUnique({
                    where: { id: assignmentId },
                    select: {
                        id: true,
                        title: true,
                        shortDescription: true,
                        description: true,
                        difficulty: true,
                        technologies: true,
                        slug: true,
                        assignmentDeadline: true,
                        assignmentCredits: true,
                        assignmentInstructions: true,
                    },
                })

                if (!project) {
                    return { success: false, error: "Project not found" }
                }

                // Get tasks through sprints
                const sprints = await prisma.projectV2Sprint.findMany({
                    where: { projectId: assignmentId },
                    select: {
                        id: true,
                        name: true,
                        tasks: {
                            select: {
                                id: true,
                                title: true,
                                description: true,
                                orderIndex: true,
                            },
                            orderBy: { orderIndex: "asc" },
                        },
                    },
                    orderBy: { orderIndex: "asc" },
                })

                const projectProgress = await prisma.userProjectV2Progress.findUnique({
                    where: {
                        userId_projectId: {
                            userId: session.user.id,
                            projectId: assignmentId,
                        },
                    },
                    select: {
                        progressPercentage: true,
                        status: true,
                        tasksCompleted: true,
                    },
                })

                return {
                    success: true,
                    data: {
                        ...project,
                        sprints,
                        progress: projectProgress,
                    },
                }
            }

            case "mock": {
                const mock = await prisma.mockInterviewVoice.findUnique({
                    where: { id: assignmentId },
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        category: true,
                        level: true,
                        questionsCount: true,
                        duration: true,
                        assignmentDeadline: true,
                        assignmentCredits: true,
                        assignmentInstructions: true,
                    },
                })

                if (!mock) {
                    return { success: false, error: "Mock interview not found" }
                }

                const mockSession = await prisma.mockVoiceSession.findFirst({
                    where: {
                        userId: session.user.id,
                        mockId: assignmentId,
                    },
                    orderBy: { createdAt: "desc" },
                    select: {
                        id: true,
                        status: true,
                        completedAt: true,
                    },
                })

                return {
                    success: true,
                    data: {
                        ...mock,
                        session: mockSession,
                    },
                }
            }

            case "quiz": {
                const quiz = await prisma.userPracticeSet.findUnique({
                    where: { id: assignmentId },
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        difficulty: true,
                        timeLimit: true,
                        isLiveSession: true,
                        liveSessionActive: true,
                        assignmentDeadline: true,
                        assignmentCredits: true,
                        assignmentInstructions: true,
                        _count: {
                            select: { questions: true },
                        },
                    },
                })

                if (!quiz) {
                    return { success: false, error: "Quiz not found" }
                }

                const quizAttempt = await prisma.userPracticeSetAttempt.findFirst({
                    where: {
                        userId: session.user.id,
                        practiceSetId: assignmentId,
                    },
                    orderBy: { createdAt: "desc" },
                    select: {
                        id: true,
                        status: true,
                        score: true,
                        correctCount: true,
                        totalQuestions: true,
                        completedAt: true,
                    },
                })

                return {
                    success: true,
                    data: {
                        ...quiz,
                        questionCount: quiz._count.questions,
                        attempt: quizAttempt,
                    },
                }
            }

            default:
                return { success: false, error: "Invalid assignment type" }
        }
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Failed to fetch assignment details"
        console.error("Get assignment details error:", error)
        return { success: false, error: errorMessage }
    }
}

/**
 * Start working on an assignment
 */
export async function startAssignment(
    assignmentId: string,
    type: "project" | "mock" | "quiz"
) {
    const session = await auth()

    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" }
    }

    try {
        switch (type) {
            case "project": {
                // Check if project exists and is a university project
                const project = await prisma.projectV2.findUnique({
                    where: { id: assignmentId },
                    select: { id: true, slug: true, isUniversityProject: true },
                })

                if (!project || !project.isUniversityProject) {
                    return { success: false, error: "Project not found" }
                }

                // Count total tasks for this project
                const taskCount = await prisma.projectV2Task.count({
                    where: {
                        sprint: {
                            projectId: assignmentId,
                        },
                    },
                })

                // Create or get progress record (using UserProjectV2Progress)
                await prisma.userProjectV2Progress.upsert({
                    where: {
                        userId_projectId: {
                            userId: session.user.id,
                            projectId: assignmentId,
                        },
                    },
                    update: {},
                    create: {
                        userId: session.user.id,
                        projectId: assignmentId,
                        status: "IN_PROGRESS",
                        progressPercentage: 0,
                        tasksCompleted: 0,
                        totalTasks: taskCount,
                    },
                })

                return {
                    success: true,
                    redirectUrl: `/projects/${project.slug}`,
                }
            }

            case "mock": {
                // Check if mock exists and is a university mock
                const mock = await prisma.mockInterviewVoice.findUnique({
                    where: { id: assignmentId },
                    select: { id: true, isUniversityMock: true },
                })

                if (!mock || !mock.isUniversityMock) {
                    return { success: false, error: "Mock interview not found" }
                }

                return {
                    success: true,
                    redirectUrl: `/mock-interview/${assignmentId}`,
                }
            }

            case "quiz": {
                // Check if quiz exists, is a university assessment, and if live session is required
                const quiz = await prisma.userPracticeSet.findUnique({
                    where: { id: assignmentId },
                    select: {
                        id: true,
                        isUniversityAssessment: true,
                        isLiveSession: true,
                        liveSessionActive: true,
                    },
                })

                if (!quiz || !quiz.isUniversityAssessment) {
                    return { success: false, error: "Quiz not found" }
                }

                // If it's a live session quiz, check if session is active
                if (quiz.isLiveSession && !quiz.liveSessionActive) {
                    return {
                        success: false,
                        error: "This quiz is a live session quiz. Please wait for your teacher to start the session.",
                    }
                }

                return {
                    success: true,
                    redirectUrl: `/practice/${assignmentId}`,
                }
            }

            default:
                return { success: false, error: "Invalid assignment type" }
        }
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Failed to start assignment"
        console.error("Start assignment error:", error)
        return { success: false, error: errorMessage }
    }
}

/**
 * Get upcoming deadlines for a student
 */
export async function getUpcomingDeadlines(limit: number = 5) {
    const session = await auth()

    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" }
    }

    try {
        const result = await getStudentUniversityAssignments()
        if (!result.success || !result.data) {
            return result
        }

        const now = new Date()
        const allAssignments = [
            ...result.data.projects,
            ...result.data.mocks,
            ...result.data.quizzes,
        ]

        // Filter and sort by deadline
        const upcomingDeadlines = allAssignments
            .filter(a => a.deadline && new Date(a.deadline) > now && a.status !== "completed")
            .sort((a, b) => {
                const dateA = a.deadline ? new Date(a.deadline).getTime() : Infinity
                const dateB = b.deadline ? new Date(b.deadline).getTime() : Infinity
                return dateA - dateB
            })
            .slice(0, limit)

        return {
            success: true,
            data: upcomingDeadlines,
        }
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Failed to fetch upcoming deadlines"
        console.error("Get upcoming deadlines error:", error)
        return { success: false, error: errorMessage }
    }
}
