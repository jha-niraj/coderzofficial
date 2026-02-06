/**
 * Application management types for the Hiring Platform
 * Types for managing job applications from the HR perspective
 */

import type { ApplicationStatus } from "./job"

// ============================================
// APPLICATION STATS
// ============================================

export interface ApplicationStats {
    total: number
    new: number // APPLIED status
    underReview: number
    shortlisted: number
    interviewing: number // INTERVIEW_SCHEDULED + INTERVIEWED
    offered: number
    hired: number
    rejected: number
    thisWeek: number
}

// Candidate stats for HR view - simpler stats from candidates action
export interface CandidateStats {
    total: number
    new: number
    screening: number
    interviewing: number
    offered: number
    hired: number
    rejected: number
    thisWeek: number
}

// Candidate view item for HR candidates list
export interface CandidateViewItem {
    id: string
    applicationId: string
    userId: string
    name: string
    email: string
    image: string | null
    jobId: string
    jobTitle: string
    jobSlug: string
    status: string
    appliedAt: Date
    matchScore: number | null
    currentStage: number | null
    resumeUrl: string | null
    coverLetter: string | null
}

// Simple job item for candidate filtering
export interface JobFilterItem {
    id: string
    title: string
    status: string
    applicationsCount: number
}

export interface JobApplicationStats {
    jobId: string
    jobTitle: string
    total: number
    new: number
    underReview: number
    shortlisted: number
    interviewing: number
    offered: number
    hired: number
    rejected: number
}

// ============================================
// APPLICATION LIST ITEM
// ============================================

export interface ApplicationListItem {
    id: string
    jobId: string
    jobTitle: string
    jobSlug: string
    userId: string
    candidateName: string
    candidateEmail: string
    candidateImage: string | null
    candidatePhone: string | null
    status: ApplicationStatus
    appliedAt: Date | null
    matchScore: number | null
    currentStage: number | null
    resumeUrl: string | null
    coverLetter: string | null
    reviewedAt: Date | null
    reviewedBy: {
        id: string
        displayName: string | null
    } | null
}

// ============================================
// APPLICATION DETAIL
// ============================================

export interface ApplicationDetail {
    id: string
    jobId: string
    userId: string
    status: ApplicationStatus
    currentStage: number | null
    
    // Candidate Info
    candidate: {
        id: string
        name: string | null
        email: string
        image: string | null
        phone: string | null
        location: string | null
        bio: string | null
        headline: string | null
        linkedinUrl: string | null
        githubUrl: string | null
        portfolioUrl: string | null
        skills: string[]
        experience: CandidateExperience[]
        education: CandidateEducation[]
    }
    
    // Job Info
    job: {
        id: string
        title: string
        slug: string
        skillsRequired: string[]
        skillsPreferred: string[]
        experienceMin: number | null
        experienceMax: number | null
    }
    
    // Application Details
    coverLetter: string | null
    resumeUrl: string | null
    matchScore: number | null
    appliedAt: Date | null
    
    // Assignment
    assignmentProjectCloneId: string | null
    assignmentStartedAt: Date | null
    assignmentSubmittedAt: Date | null
    assignmentScore: number | null
    assignmentFeedback: string | null
    
    // Interview
    interviewId: string | null
    interviewScheduledAt: Date | null
    interviewCompletedAt: Date | null
    interviewFeedback: unknown
    
    // HR Actions
    reviewedById: string | null
    reviewedAt: Date | null
    rejectionReason: string | null
    hrNotes: string | null
    reviewedBy: {
        id: string
        displayName: string | null
        user: {
            name: string | null
            email: string
        }
    } | null
    
    // Timestamps
    createdAt: Date
    updatedAt: Date
    
    // Activities
    activities: ApplicationActivity[]
}

export interface CandidateExperience {
    id: string
    company: string
    title: string
    startDate: Date
    endDate: Date | null
    current: boolean
    description: string | null
}

export interface CandidateEducation {
    id: string
    institution: string
    degree: string
    field: string
    startDate: Date
    endDate: Date | null
    current: boolean
}

export interface ApplicationActivity {
    id: string
    activityType: string
    metadata: unknown
    score: number | null
    completedAt: Date | null
    createdAt: Date
}

// ============================================
// APPLICATION FILTERS
// ============================================

export interface ApplicationFilters {
    search?: string
    status?: ApplicationStatus[]
    jobId?: string
    dateFrom?: Date
    dateTo?: Date
    minMatchScore?: number
    hasResume?: boolean
}

export interface ApplicationSortOptions {
    field: "appliedAt" | "matchScore" | "status" | "candidateName"
    direction: "asc" | "desc"
}

// ============================================
// APPLICATION ACTIONS
// ============================================

export interface UpdateApplicationStatusPayload {
    applicationId: string
    status: ApplicationStatus
    rejectionReason?: string
    hrNotes?: string
}

export interface AddApplicationNotePayload {
    applicationId: string
    note: string
}

export interface ScheduleInterviewPayload {
    applicationId: string
    scheduledAt: Date
    interviewId?: string
    notes?: string
}

// ============================================
// PAGINATION
// ============================================

export interface PaginatedApplications {
    applications: ApplicationListItem[]
    total: number
    page: number
    pageSize: number
    totalPages: number
}

// ============================================
// INTERVIEW LINK
// ============================================

export interface InterviewLink {
    id: string
    applicationId: string
    jobId: string
    userId: string
    link: string
    expiresAt: Date
    createdAt: Date
}
