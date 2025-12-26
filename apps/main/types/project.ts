// ProjectV2 Types for TheCoderz Platform
// This file contains all type definitions for the ProjectV2 system

import {
    ProjectV2Visibility,
    ProjectV2Difficulty,
    UserProjectV2Status,
    TaskKanbanStatus,
    QuizV2Difficulty,
} from "@repo/prisma/client";

// ============================================================================
// Core Project Types
// ============================================================================

export interface ProjectV2Stack {
    frontend?: string | null
    backend?: string | null
    database?: string | null
    deployment?: string | null
}

export interface ProjectV2Page {
    id: string
    name: string
    difficulty: string
    coreFeatures: string[]
    recommendedComponents: string[]
}

export interface ProjectV2Creator {
    id: string
    name: string | null
    username: string | null
    email: string | null
}

export interface ProjectV2Progress {
    id: string
    userId: string
    projectId: string
    status: UserProjectV2Status
    progressPercentage: number
    tasksCompleted: number
    totalTasks: number
    startedAt: Date
    completedAt: Date | null
    lastAccessedAt: Date
    taskStatuses?: Array<{
        taskId: string
        status: 'TO_DO' | 'IN_PROGRESS' | 'COMPLETED'
        completedAt?: Date | null
        notes?: string | null
    }>
}

export interface ProjectV2Basic {
    id: string
    slug: string
    title: string
    description: string
    shortDescription: string | null
    difficulty: ProjectV2Difficulty
    generationType: string // FULL_STACK | FRONTEND | PROGRAMS | AI_AGENT | OTHER
    visibility: ProjectV2Visibility
    estimatedHours: number
    technologies: string[]
    stacks: ProjectV2Stack | null
    includeAssessment: boolean
    totalViews: number
    totalStarted: number
    totalSubmissions: number
    createdAt: Date
    updatedAt: Date
}

export interface ProjectV2Full extends ProjectV2Basic {
    blueprintOverview: string
    learningObjectives: string[]
    prerequisites: string[]
    coreFeatures: string[]
    advancedFeatures: string[]
    pages: ProjectV2Page[]
    creator: ProjectV2Creator
    progress?: ProjectV2Progress[]
    tasks: ProjectV2Task[]
}

// ============================================================================
// Task Types
// ============================================================================

export type TaskStatus = 'TO_DO' | 'IN_PROGRESS' | 'COMPLETED'

export interface ProjectV2TaskProgress {
    status: TaskStatus
    notes: string | null
    completedAt: Date | null
}

export interface ProjectV2Task {
    id: string
    title: string
    description: string[]
    successCriteria: string[]
    hints: string[]
    estimatedMinutes: number
    difficulty: string
    order: number
    userProgress?: ProjectV2TaskProgress
}

export interface TasksColumns {
    todo: ProjectV2Task[]
    inProgress: ProjectV2Task[]
    completed: ProjectV2Task[]
}

export interface TasksPageData {
    projectTitle: string
    progress: ProjectV2Progress
    columns: TasksColumns
}

// ============================================================================
// Quiz Types
// ============================================================================

export interface QuizQuestion {
    id: string
    difficulty: QuizV2Difficulty
    prompt: string
    options: string[]
    correctAnswer: number
    explanation: string
    orderIndex: number
}

export interface Quiz {
    id: string
    totalQuestions: number
    questions: QuizQuestion[]
}

export interface QuizAttempt {
    id: string
    score: number
    correctAnswers: number
    totalQuestions: number
    timeSpent: number | null
    completedAt: Date | null
    createdAt: Date
}

export interface QuizAnswer {
    questionId: string
    selectedAnswer: number
    isCorrect: boolean
    correctAnswer: number
    explanation: string
}

export interface QuizResult {
    id: string
    score: number
    correctAnswers: number
    totalQuestions: number
    answers: QuizAnswer[]
}

// ============================================================================
// Component Props Types
// ============================================================================

export interface ProjectDetailsClientProps {
    project: ProjectV2Full
}

export interface TasksPageClientProps {
    project: {
        title: string
        slug: string
    }
    tasks: TasksColumns
    userProgress?: ProjectV2Progress
}

export interface QuizClientProps {
    project: {
        id: string
        slug: string
        title: string
        description: string
    }
    existingQuiz: Quiz | null
    userCredits: number
    previousAttempts: QuizAttempt[]
}

// ============================================================================
// Form Types
// ============================================================================

export interface ProjectGenerationFormData {
    projectTitle?: string
    projectDescription?: string
    generationType?: string
    technologies?: string[]
    conceptsFocus?: string[]
    stacks?: {
        frontend?: string
        backend?: string
        database?: string
        deployment?: string
        aiProvider?: string
    }
    preferences?: {
        generateNow?: boolean
        pagesPreset?: string
    }
    visibility?: string
    includeAssessment?: boolean
}

export interface ProjectSubmission {
    id: string
    userId: string
    projectId: string
    githubUrl: string
    liveUrl: string | null
    notes: string | null
    status: string // PENDING | APPROVED | REJECTED
    scores: Record<string, unknown> | null
    createdAt: Date
    updatedAt: Date
    submittedAt?: Date
    upvotes?: number
    project?: {
        id: string
        title: string
        slug: string
        difficulty: ProjectV2Difficulty
        technologies?: string[]
    }
    user?: {
        id: string
        name: string | null
        username: string | null
        image: string | null
    }
}

// ============================================================================
// Utility Types
// ============================================================================

export interface StatusColumn {
    title: string
    status: TaskStatus
    tasks: ProjectV2Task[]
    color: string
    icon: React.ComponentType<{ className?: string }>
}

export interface DifficultyColor {
    BEGINNER: string
    INTERMEDIATE: string
    ADVANCED: string
}

export interface QuizDifficultyColor {
    EASY: string
    MEDIUM: string
    HARD: string
}

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiResponse<T> {
    success: boolean
    data?: T
    error?: string
}

export interface ProjectApiResponse extends ApiResponse<ProjectV2Full> { }
export interface TasksApiResponse extends ApiResponse<TasksPageData> { }
export interface QuizApiResponse extends ApiResponse<Quiz> { }
export interface QuizAttemptApiResponse extends ApiResponse<QuizResult> { }