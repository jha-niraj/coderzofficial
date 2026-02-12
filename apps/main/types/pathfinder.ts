// Pathfinder Types - Centralized type definitions for the Pathfinder (AI Learning Goals) feature
import { PathfinderStatus, PathfinderCategory, PathfinderLevel } from '@repo/prisma/client'

// =========================================
// Core Types
// =========================================

export interface PathfinderGoal {
    id: string
    slug: string
    title: string
    category: PathfinderCategory
    level: PathfinderLevel
    focusAreas: string[]
    status: PathfinderStatus
    progressPercent: number
    totalSubGoals: number
    completedSubGoals: number
    totalQuizAnswered: number
    totalCodingSolved: number
    streakDays: number
    lastActivityAt: Date | null
    estimatedDays: number | null
    overview: string | null
    createdAt: Date
    startedAt: Date | null
    completedAt: Date | null
    groupId: string | null
    studioId: string | null
}

export interface PathfinderGroup {
    id: string
    name: string
    emoji: string | null
    color: string | null
    description: string | null
    order: number
    _count: { goals: number }
}

export interface PathfinderSubGoal {
    id: string
    title: string
    description: string | null
    isCompleted: boolean
    completedAt: Date | null
    quizCompleted: boolean
    codingCompleted: boolean
    aiQuizQuestions: QuizQuestion[] | null
    aiCodingProblem: CodingProblem | null
    createdAt: Date
}

export interface PathfinderDailySession {
    id: string
    date: Date
    goalId: string
    subGoals: PathfinderSubGoal[]
    totalQuizAnswered: number
    totalCodingSolved: number
    isCompleted: boolean
}

// =========================================
// Quiz & Coding Types
// =========================================

export interface QuizQuestion {
    question: string
    options: string[]
    correctAnswer: number
    explanation?: string
}

export interface CodingProblem {
    title: string
    description: string
    difficulty: 'EASY' | 'MEDIUM' | 'HARD'
    starterCode?: string
    testCases?: TestCase[]
    hints?: string[]
    solution?: string
}

export interface TestCase {
    input: string
    expectedOutput: string
    isHidden?: boolean
}

export interface QuizAttempt {
    id: string
    subGoalId: string
    answers: number[]
    score: number
    totalQuestions: number
    completedAt: Date
}

export interface CodingSubmission {
    id: string
    subGoalId: string
    code: string
    language: string
    isCorrect: boolean
    feedback: string | null
    submittedAt: Date
}

// =========================================
// Verification Types
// =========================================

export interface PathfinderVerification {
    id: string
    goalId: string
    type: 'QUIZ' | 'CODING' | 'PROJECT' | 'MOCK_INTERVIEW'
    status: 'PENDING' | 'IN_PROGRESS' | 'PASSED' | 'FAILED'
    score: number | null
    maxScore: number | null
    feedback: string | null
    attemptCount: number
    lastAttemptAt: Date | null
    passedAt: Date | null
}

export interface VerificationQuiz {
    questions: QuizQuestion[]
    passingScore: number
    timeLimit?: number
}

export interface VerificationProject {
    title: string
    description: string
    requirements: string[]
    submissionUrl?: string
    feedback?: string
}

// =========================================
// Learning Plan Types (from OpenAI Assistant)
// =========================================

export interface LearningPlan {
    subject: string
    duration: number
    level: 'Beginner' | 'Intermediate' | 'Advanced'
    overview: string
    minorProject: ProjectPlan
    majorProject: ProjectPlan
    verification: VerificationPlan
}

export interface ProjectPlan {
    title: string
    description: string
    requirements?: string[]
}

export interface VerificationPlan {
    quizQuestions: QuizQuestion[]
    codingChallenges: CodingProblem[]
    mockInterviewTopics: string[]
}

// =========================================
// Props Types
// =========================================

export interface PathfinderDashboardProps {
    initialGoals: PathfinderGoal[]
    initialGroups: PathfinderGroup[]
}

export interface GoalDetailsProps {
    goal: PathfinderGoal & {
        verification?: PathfinderVerification | null
        learningPlan?: LearningPlan | null
    }
}

export interface DailyPracticeProps {
    goal: PathfinderGoal
    session: PathfinderDailySession | null
}

export interface CreateGoalSheetProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess?: (goalId: string, slug: string) => void
    groups?: PathfinderGroup[]
    onGroupCreated?: (group: PathfinderGroup) => void
}

export interface CreateGroupSheetProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess?: (group: PathfinderGroup) => void
}

export interface AssignGoalSheetProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    goalId: string | null
    currentGroupId: string | null
    groups: PathfinderGroup[]
    onAssign?: (goalId: string, groupId: string | null) => void
}

// =========================================
// Configuration Types
// =========================================

export interface CategoryConfig {
    emoji: string
    color: string
    bg: string
}

export interface StatusConfig {
    label: string
    icon: React.ReactNode
    color: string
    bg: string
}

export const PATHFINDER_CATEGORIES: Record<PathfinderCategory, CategoryConfig> = {
    DSA: { emoji: '🧮', color: 'text-blue-600', bg: 'bg-blue-500/10' },
    WEB_DEVELOPMENT: { emoji: '🌐', color: 'text-emerald-600', bg: 'bg-emerald-500/10' },
    FRONTEND: { emoji: '🎨', color: 'text-pink-600', bg: 'bg-pink-500/10' },
    BACKEND: { emoji: '⚙️', color: 'text-orange-600', bg: 'bg-orange-500/10' },
    DEVOPS: { emoji: '🚀', color: 'text-violet-600', bg: 'bg-violet-500/10' },
    AI_ML: { emoji: '🤖', color: 'text-cyan-600', bg: 'bg-cyan-500/10' },
    DATABASE: { emoji: '🗄️', color: 'text-yellow-600', bg: 'bg-yellow-500/10' },
    SYSTEM_DESIGN: { emoji: '🏗️', color: 'text-slate-600', bg: 'bg-slate-500/10' },
    MOBILE: { emoji: '📱', color: 'text-teal-600', bg: 'bg-teal-500/10' },
    OTHER: { emoji: '📚', color: 'text-neutral-600', bg: 'bg-neutral-500/10' },
}

// =========================================
// Form Input Types
// =========================================

export interface CreateGoalInput {
    title: string
    slug?: string
    category: PathfinderCategory
    level: PathfinderLevel
    focusAreas: string[]
    estimatedDays?: number
    groupId?: string | null
}

export interface CreateGroupInput {
    name: string
    emoji?: string
    color?: string
    description?: string
}

export interface CreateSubGoalInput {
    sessionId: string
    title: string
    description?: string
}
