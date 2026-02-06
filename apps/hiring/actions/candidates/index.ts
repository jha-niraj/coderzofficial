/**
 * Candidates Actions Module
 * 
 * Re-exports all candidate-related server actions.
 * 
 * Usage:
 * import { getCandidates, updateCandidateStatus } from "@/actions/candidates"
 */

// Re-export types
export type { CandidateFilters } from "@/types"

// Candidate queries
export {
    getCandidates, getCandidateDetails, getCompanyJobsForFilter, 
    getCandidateStats
} from "./candidate-queries"

// Candidate status management
export {
    updateCandidateStatus, addCandidateNote,rejectCandidate
} from "./candidate-status"

// Assignment and prep progress
export {
    submitAssignment, updateAssignmentProgress, getPrepProgress, 
    upsertPrepProgress
} from "./candidate-assignments"