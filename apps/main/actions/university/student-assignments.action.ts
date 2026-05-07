"use server"

import {
    db,
    studentUniversityLinks,
    classEnrollments,
    universityClasses,
    projectsV2,
    userProjectV2Progress,
    projectV2Sprints,
    projectV2Tasks,
    mockInterviewVoice,
    mockVoiceSession,
    userPracticeSets,
    userPracticeSetQuestions,
    userPracticeSetAttempts,
} from "@repo/db"
import { eq, and, inArray, count } from "drizzle-orm"
import { getSession } from "@repo/auth"
import { headers } from "next/headers"

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
    const session = await getSession(headers())

    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" }
    }

    try {
        // Get student's verified university link
        const studentLinkRows = await db
            .select({ id: studentUniversityLinks.id, universityId: studentUniversityLinks.universityId })
            .from(studentUniversityLinks)
            .where(and(
                eq(studentUniversityLinks.userId, session.user.id),
                eq(studentUniversityLinks.verificationStatus, "VERIFIED")
            ))
            .limit(1)

        if (!studentLinkRows[0]) {
            return {
                success: false,
                error: "Not verified with any university",
            }
        }

        const studentLink = studentLinkRows[0]

        // Get student's enrolled classes
        const enrollmentRows = await db
            .select({
                classId: classEnrollments.classId,
                className: universityClasses.name,
                classCode: universityClasses.code,
            })
            .from(classEnrollments)
            .innerJoin(universityClasses, eq(classEnrollments.classId, universityClasses.id))
            .where(eq(classEnrollments.studentLinkId, studentLink.id))

        const enrolledClassIds = enrollmentRows.map(e => e.classId)
        const classMap = new Map<string, ClassInfo>(
            enrollmentRows.map(e => [e.classId, { id: e.classId, name: e.className, code: e.classCode }])
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

        const [projects, mocks, quizzes] = await Promise.all([
            getProjectAssignments(session.user.id, enrolledClassIds, classMap),
            getMockAssignments(session.user.id, enrolledClassIds, classMap),
            getQuizAssignments(session.user.id, enrolledClassIds, classMap),
        ])

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
    // Find projects that are university projects
    const allProjects = await db
        .select({
            id: projectsV2.id,
            title: projectsV2.title,
            shortDescription: projectsV2.shortDescription,
            difficulty: projectsV2.difficulty,
            technologies: projectsV2.technologies,
            slug: projectsV2.slug,
            classIds: projectsV2.classIds,
            assignmentDeadline: projectsV2.assignmentDeadline,
            assignmentCredits: projectsV2.assignmentCredits,
            assignmentInstructions: projectsV2.assignmentInstructions,
        })
        .from(projectsV2)
        .where(eq(projectsV2.isUniversityProject, true))

    // Filter by enrolled class IDs (classIds is an array column)
    const projects = allProjects.filter(p =>
        p.classIds.some(cid => enrolledClassIds.includes(cid))
    )

    if (projects.length === 0) return []

    const projectIds = projects.map(p => p.id)

    const progressRows = await db
        .select({
            projectId: userProjectV2Progress.projectId,
            progressPercentage: userProjectV2Progress.progressPercentage,
            status: userProjectV2Progress.status,
        })
        .from(userProjectV2Progress)
        .where(and(
            eq(userProjectV2Progress.userId, userId),
            inArray(userProjectV2Progress.projectId, projectIds)
        ))

    const progressMap = new Map(progressRows.map(p => [p.projectId, p]))

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
            description: project.shortDescription ?? null,
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
    const allMocks = await db
        .select({
            id: mockInterviewVoice.id,
            title: mockInterviewVoice.title,
            description: mockInterviewVoice.description,
            category: mockInterviewVoice.category,
            level: mockInterviewVoice.level,
            classIds: mockInterviewVoice.classIds,
            assignmentDeadline: mockInterviewVoice.assignmentDeadline,
            assignmentCredits: mockInterviewVoice.assignmentCredits,
            assignmentInstructions: mockInterviewVoice.assignmentInstructions,
        })
        .from(mockInterviewVoice)
        .where(eq(mockInterviewVoice.isUniversityMock, true))

    const mocks = allMocks.filter(m =>
        m.classIds.some(cid => enrolledClassIds.includes(cid))
    )

    if (mocks.length === 0) return []

    const mockIds = mocks.map(m => m.id)

    const sessionRows = await db
        .select({
            mockId: mockVoiceSession.mockId,
            status: mockVoiceSession.status,
            completedAt: mockVoiceSession.completedAt,
        })
        .from(mockVoiceSession)
        .where(and(
            eq(mockVoiceSession.userId, userId),
            inArray(mockVoiceSession.mockId, mockIds)
        ))

    const sessionMap = new Map(sessionRows.map(s => [s.mockId, s]))

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
            score: undefined,
            completedAt: session?.completedAt ?? undefined,
        }
    })
}

async function getQuizAssignments(
    userId: string,
    enrolledClassIds: string[],
    classMap: Map<string, ClassInfo>
): Promise<StudentQuizAssignment[]> {
    const allAssessments = await db
        .select({
            id: userPracticeSets.id,
            title: userPracticeSets.title,
            description: userPracticeSets.description,
            difficulty: userPracticeSets.difficulty,
            timeLimit: userPracticeSets.timeLimit,
            classIds: userPracticeSets.classIds,
            assignmentDeadline: userPracticeSets.assignmentDeadline,
            assignmentCredits: userPracticeSets.assignmentCredits,
            assignmentInstructions: userPracticeSets.assignmentInstructions,
            isLiveSession: userPracticeSets.isLiveSession,
            liveSessionActive: userPracticeSets.liveSessionActive,
            questionCount: userPracticeSets.questionCount,
        })
        .from(userPracticeSets)
        .where(eq(userPracticeSets.isUniversityAssessment, true))

    const assessments = allAssessments.filter(a =>
        a.classIds.some(cid => enrolledClassIds.includes(cid))
    )

    if (assessments.length === 0) return []

    const assessmentIds = assessments.map(a => a.id)

    const attemptRows = await db
        .select({
            practiceSetId: userPracticeSetAttempts.practiceSetId,
            status: userPracticeSetAttempts.status,
            score: userPracticeSetAttempts.score,
            completedAt: userPracticeSetAttempts.completedAt,
        })
        .from(userPracticeSetAttempts)
        .where(and(
            eq(userPracticeSetAttempts.userId, userId),
            inArray(userPracticeSetAttempts.practiceSetId, assessmentIds)
        ))

    const attemptMap = new Map(attemptRows.map(a => [a.practiceSetId, a]))

    return assessments.map((assessment): StudentQuizAssignment => {
        const attempt = attemptMap.get(assessment.id)
        const matchingClassIds = assessment.classIds.filter(cid => enrolledClassIds.includes(cid))
        const classNames = matchingClassIds.map(cid => classMap.get(cid)?.name || "Unknown")

        const status: "pending" | "completed" = attempt?.status === "COMPLETED" ? "completed" : "pending"

        return {
            id: assessment.id,
            type: "quiz",
            title: assessment.title,
            description: assessment.description ?? null,
            difficulty: assessment.difficulty,
            questionCount: assessment.questionCount,
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
    const session = await getSession(headers())

    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" }
    }

    try {
        switch (type) {
            case "project": {
                const projectRows = await db
                    .select({
                        id: projectsV2.id,
                        title: projectsV2.title,
                        shortDescription: projectsV2.shortDescription,
                        description: projectsV2.description,
                        difficulty: projectsV2.difficulty,
                        technologies: projectsV2.technologies,
                        slug: projectsV2.slug,
                        assignmentDeadline: projectsV2.assignmentDeadline,
                        assignmentCredits: projectsV2.assignmentCredits,
                        assignmentInstructions: projectsV2.assignmentInstructions,
                    })
                    .from(projectsV2)
                    .where(eq(projectsV2.id, assignmentId))
                    .limit(1)

                if (!projectRows[0]) {
                    return { success: false, error: "Project not found" }
                }

                const project = projectRows[0]

                // Get sprints with tasks
                const sprintRows = await db
                    .select({
                        id: projectV2Sprints.id,
                        name: projectV2Sprints.name,
                        orderIndex: projectV2Sprints.orderIndex,
                    })
                    .from(projectV2Sprints)
                    .where(eq(projectV2Sprints.projectId, assignmentId))
                    .orderBy(projectV2Sprints.orderIndex)

                const sprintIds = sprintRows.map(s => s.id)
                const taskRows = sprintIds.length > 0
                    ? await db
                        .select({
                            id: projectV2Tasks.id,
                            sprintId: projectV2Tasks.sprintId,
                            title: projectV2Tasks.title,
                            description: projectV2Tasks.description,
                            orderIndex: projectV2Tasks.orderIndex,
                        })
                        .from(projectV2Tasks)
                        .where(inArray(projectV2Tasks.sprintId, sprintIds))
                        .orderBy(projectV2Tasks.orderIndex)
                    : []

                const tasksBySprintId = new Map<string, typeof taskRows>()
                for (const task of taskRows) {
                    const existing = tasksBySprintId.get(task.sprintId) || []
                    existing.push(task)
                    tasksBySprintId.set(task.sprintId, existing)
                }

                const sprints = sprintRows.map(s => ({
                    id: s.id,
                    name: s.name,
                    tasks: tasksBySprintId.get(s.id) || [],
                }))

                const progressRows = await db
                    .select({
                        progressPercentage: userProjectV2Progress.progressPercentage,
                        status: userProjectV2Progress.status,
                        tasksCompleted: userProjectV2Progress.tasksCompleted,
                    })
                    .from(userProjectV2Progress)
                    .where(and(
                        eq(userProjectV2Progress.userId, session.user.id),
                        eq(userProjectV2Progress.projectId, assignmentId)
                    ))
                    .limit(1)

                return {
                    success: true,
                    data: {
                        ...project,
                        sprints,
                        progress: progressRows[0] ?? null,
                    },
                }
            }

            case "mock": {
                const mockRows = await db
                    .select({
                        id: mockInterviewVoice.id,
                        title: mockInterviewVoice.title,
                        description: mockInterviewVoice.description,
                        category: mockInterviewVoice.category,
                        level: mockInterviewVoice.level,
                        questionsCount: mockInterviewVoice.questionsCount,
                        duration: mockInterviewVoice.duration,
                        assignmentDeadline: mockInterviewVoice.assignmentDeadline,
                        assignmentCredits: mockInterviewVoice.assignmentCredits,
                        assignmentInstructions: mockInterviewVoice.assignmentInstructions,
                    })
                    .from(mockInterviewVoice)
                    .where(eq(mockInterviewVoice.id, assignmentId))
                    .limit(1)

                if (!mockRows[0]) {
                    return { success: false, error: "Mock interview not found" }
                }

                const sessionRows = await db
                    .select({
                        id: mockVoiceSession.id,
                        status: mockVoiceSession.status,
                        completedAt: mockVoiceSession.completedAt,
                    })
                    .from(mockVoiceSession)
                    .where(and(
                        eq(mockVoiceSession.userId, session.user.id),
                        eq(mockVoiceSession.mockId, assignmentId)
                    ))
                    .orderBy(mockVoiceSession.createdAt)
                    .limit(1)

                return {
                    success: true,
                    data: {
                        ...mockRows[0],
                        session: sessionRows[0] ?? null,
                    },
                }
            }

            case "quiz": {
                const quizRows = await db
                    .select({
                        id: userPracticeSets.id,
                        title: userPracticeSets.title,
                        description: userPracticeSets.description,
                        difficulty: userPracticeSets.difficulty,
                        timeLimit: userPracticeSets.timeLimit,
                        isLiveSession: userPracticeSets.isLiveSession,
                        liveSessionActive: userPracticeSets.liveSessionActive,
                        assignmentDeadline: userPracticeSets.assignmentDeadline,
                        assignmentCredits: userPracticeSets.assignmentCredits,
                        assignmentInstructions: userPracticeSets.assignmentInstructions,
                        questionCount: userPracticeSets.questionCount,
                    })
                    .from(userPracticeSets)
                    .where(eq(userPracticeSets.id, assignmentId))
                    .limit(1)

                if (!quizRows[0]) {
                    return { success: false, error: "Quiz not found" }
                }

                const attemptRows = await db
                    .select({
                        id: userPracticeSetAttempts.id,
                        status: userPracticeSetAttempts.status,
                        score: userPracticeSetAttempts.score,
                        correctCount: userPracticeSetAttempts.correctCount,
                        totalQuestions: userPracticeSetAttempts.totalQuestions,
                        completedAt: userPracticeSetAttempts.completedAt,
                    })
                    .from(userPracticeSetAttempts)
                    .where(and(
                        eq(userPracticeSetAttempts.userId, session.user.id),
                        eq(userPracticeSetAttempts.practiceSetId, assignmentId)
                    ))
                    .orderBy(userPracticeSetAttempts.createdAt)
                    .limit(1)

                return {
                    success: true,
                    data: {
                        ...quizRows[0],
                        attempt: attemptRows[0] ?? null,
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
    const session = await getSession(headers())

    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" }
    }

    try {
        switch (type) {
            case "project": {
                const projectRows = await db
                    .select({
                        id: projectsV2.id,
                        slug: projectsV2.slug,
                        isUniversityProject: projectsV2.isUniversityProject,
                    })
                    .from(projectsV2)
                    .where(eq(projectsV2.id, assignmentId))
                    .limit(1)

                if (!projectRows[0] || !projectRows[0].isUniversityProject) {
                    return { success: false, error: "Project not found" }
                }

                // Count total tasks for this project
                const sprintRows = await db
                    .select({ id: projectV2Sprints.id })
                    .from(projectV2Sprints)
                    .where(eq(projectV2Sprints.projectId, assignmentId))

                const sprintIds = sprintRows.map(s => s.id)
                const taskCountRows = sprintIds.length > 0
                    ? await db
                        .select({ taskCount: count(projectV2Tasks.id) })
                        .from(projectV2Tasks)
                        .where(inArray(projectV2Tasks.sprintId, sprintIds))
                    : [{ taskCount: 0 }]

                const taskCount = taskCountRows[0]?.taskCount || 0

                // Check if progress record exists
                const existingProgressRows = await db
                    .select({ id: userProjectV2Progress.id })
                    .from(userProjectV2Progress)
                    .where(and(
                        eq(userProjectV2Progress.userId, session.user.id),
                        eq(userProjectV2Progress.projectId, assignmentId)
                    ))
                    .limit(1)

                if (existingProgressRows[0]) {
                    // Already started, just redirect
                } else {
                    await db.insert(userProjectV2Progress).values({
                        userId: session.user.id,
                        projectId: assignmentId,
                        status: "IN_PROGRESS",
                        progressPercentage: 0,
                        tasksCompleted: 0,
                        totalTasks: taskCount,
                    })
                }

                return {
                    success: true,
                    redirectUrl: `/projects/${projectRows[0].slug}`,
                }
            }

            case "mock": {
                const mockRows = await db
                    .select({
                        id: mockInterviewVoice.id,
                        isUniversityMock: mockInterviewVoice.isUniversityMock,
                    })
                    .from(mockInterviewVoice)
                    .where(eq(mockInterviewVoice.id, assignmentId))
                    .limit(1)

                if (!mockRows[0] || !mockRows[0].isUniversityMock) {
                    return { success: false, error: "Mock interview not found" }
                }

                return {
                    success: true,
                    redirectUrl: `/mock-interview/${assignmentId}`,
                }
            }

            case "quiz": {
                const quizRows = await db
                    .select({
                        id: userPracticeSets.id,
                        isUniversityAssessment: userPracticeSets.isUniversityAssessment,
                        isLiveSession: userPracticeSets.isLiveSession,
                        liveSessionActive: userPracticeSets.liveSessionActive,
                    })
                    .from(userPracticeSets)
                    .where(eq(userPracticeSets.id, assignmentId))
                    .limit(1)

                if (!quizRows[0] || !quizRows[0].isUniversityAssessment) {
                    return { success: false, error: "Quiz not found" }
                }

                if (quizRows[0].isLiveSession && !quizRows[0].liveSessionActive) {
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
    const session = await getSession(headers())

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
