/*
    * Assessment-related types for the Hiring Platform
    * Types for managing job assignments and assessment submissions
*/

import type { ApplicationStatus } from "./job"

// ============================================
// ASSESSMENT STATS
// ============================================
export interface AssessmentStats {
    totalJobsWithAssessments: number
    totalAssignmentsSent: number
    totalSubmissions: number
    pendingReview: number
    averageScore: number
}

// ============================================
// JOB WITH ASSESSMENT
// ============================================
export interface JobWithAssessment {
    id: string
    title: string
    slug: string
    status: string
    assignmentDetails: unknown
    assignmentDeadlineDays: number | null
    assignmentInstructions: string | null
    assignmentsSent: number
    submissionsReceived: number
    pendingSubmissions: number
}

// ============================================
// ASSESSMENT APPLICATION
// ============================================
export interface AssessmentApplication {
    id: string
    status: ApplicationStatus
    assignmentStartedAt: Date | null
    assignmentSubmittedAt: Date | null
    assignmentScore: number | null
    assignmentFeedback: string | null
    assignmentSubmission?: unknown
    createdAt: Date
    user: {
        id: string
        name: string | null
        email: string
        image: string | null
    }
}

// ============================================
// JOB WITH ASSESSMENT DETAILS
// ============================================
export interface JobWithAssessmentDetails {
    id: string
    title: string
    slug: string
    status: string
    hasAssignment: boolean
    assignmentDetails: unknown
    assignmentInstructions: string | null
    assignmentDeadlineDays: number | null
    applications: AssessmentApplication[]
}

// ============================================
// ASSIGNMENT SUBMISSION
// ============================================

export interface AssignmentSubmissionItem {
    id: string
    status: ApplicationStatus
    assignmentStartedAt: Date | null
    assignmentSubmittedAt: Date | null
    assignmentScore: number | null
    assignmentFeedback: string | null
    assignmentSubmission?: unknown
    user: {
        id: string
        name: string | null
        email: string
        image: string | null
    }
    job: {
        id: string
        title: string
        slug: string
        assignmentDetails: unknown
        assignmentDeadlineDays: number | null
    }
}

// ============================================
// SCORE ASSIGNMENT INPUT
// ============================================

export interface ScoreAssignmentInput {
    score: number
    feedback: string
}