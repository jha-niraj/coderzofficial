// Re-export all opensource actions from their respective files
// This maintains backward compatibility while allowing modular imports

// Constants (not server actions - accessible on client)
export {
    PROJECT_TYPES,
    DIFFICULTY_LEVELS,
} from './constants'

export type { ProjectType, DifficultyLevel } from './constants'

// Project actions
export {
    getProjects,
    getProjectBySlug,
    getFeaturedProjects,
    getUserProjects
} from './projects.action'

// Issue actions
export {
    getProjectIssues,
    getIssue,
    getOpenIssues,
    claimIssue,
    unclaimIssue,
    getUserAssignedIssues
} from './issues.action'

// Learning module actions
export {
    getLearnModules,
    getLearnModule,
    getLesson,
    completeLesson,
    getLearningProgress,
    updateLessonProgress,
    getNextLesson
} from './learn.action'

// Certification actions
export {
    canTakeCertificationExam,
    startCertificationExam,
    getActiveExam,
    submitCertificationExam,
    recordExamResult,
    getUserCertificationStatus,
    verifyCertification,
    getExamHistory
} from './certification.action'

// User contribution actions
export {
    getUserOSStats,
    getUserEarnings,
    getUserContributions,
    getUserContributionStats,
    getUserActivityTimeline,
    getContributorsLeaderboard,
    getUserRank
} from './contributions.action'
