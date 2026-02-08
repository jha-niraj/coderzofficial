/**
 * Assignment Types
 * All assignment-related types for the University platform
 */

// ============================================
// ASSIGNMENT TYPES
// ============================================

export type AssignmentType = 
    | "CODING"
    | "QUIZ"
    | "PROJECT"
    | "DOCUMENT"
    | "PRESENTATION"
    | "OTHER";

export type AssignmentStatus = 
    | "DRAFT"
    | "PUBLISHED"
    | "CLOSED"
    | "ARCHIVED";

export interface UniversityAssignment {
    id: string;
    classId: string;
    title: string;
    description: string | null;
    instructions: string | null;
    type: AssignmentType;
    status: AssignmentStatus;
    dueDate: Date | null;
    publishedAt: Date | null;
    closedAt: Date | null;
    maxScore: number;
    passingScore: number | null;
    allowLateSubmission: boolean;
    latePenaltyPercent: number;
    maxAttempts: number;
    attachments: string[]; // URLs to attached files
    rubric: AssignmentRubric | null;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
    // Relations
    class?: {
        id: string;
        name: string;
        code: string | null;
        department?: {
            id: string;
            name: string;
        };
    };
    creator?: {
        id: string;
        displayName: string | null;
        email: string;
    };
    _count?: {
        submissions: number;
    };
}

// Rubric for grading
export interface AssignmentRubric {
    criteria: RubricCriterion[];
    totalPoints: number;
}

export interface RubricCriterion {
    id: string;
    name: string;
    description: string;
    maxPoints: number;
    levels: RubricLevel[];
}

export interface RubricLevel {
    points: number;
    label: string;
    description: string;
}

// For display in tables/lists
export interface AssignmentListItem {
    id: string;
    title: string;
    type: AssignmentType;
    status: AssignmentStatus;
    dueDate: Date | null;
    maxScore: number;
    classId: string;
    className: string;
    classCode: string | null;
    departmentName: string;
    submissionCount: number;
    totalStudents: number;
    createdAt: Date;
    createdBy: {
        name: string | null;
        email: string;
    };
}

// ============================================
// SUBMISSION TYPES
// ============================================

export type SubmissionStatus = 
    | "SUBMITTED"
    | "LATE"
    | "GRADED"
    | "RETURNED"
    | "RESUBMITTED";

export interface AssignmentSubmission {
    id: string;
    assignmentId: string;
    studentLinkId: string;
    attemptNumber: number;
    content: string | null; // Text content or code
    attachments: string[]; // URLs to submitted files
    status: SubmissionStatus;
    submittedAt: Date;
    isLate: boolean;
    score: number | null;
    feedback: string | null;
    rubricScores: RubricScoreItem[] | null;
    gradedBy: string | null;
    gradedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    // Relations
    assignment?: {
        id: string;
        title: string;
        maxScore: number;
        dueDate: Date | null;
    };
    student?: {
        id: string;
        userId: string;
        enrollmentNumber: string;
        user?: {
            name: string | null;
            email: string;
            image: string | null;
        };
    };
    grader?: {
        id: string;
        displayName: string | null;
        email: string;
    };
}

export interface RubricScoreItem {
    criterionId: string;
    criterionName: string;
    score: number;
    maxScore: number;
    feedback?: string;
}

// For display
export interface SubmissionListItem {
    id: string;
    studentLinkId: string;
    studentName: string | null;
    studentEmail: string;
    studentImage: string | null;
    enrollmentNumber: string;
    attemptNumber: number;
    status: SubmissionStatus;
    submittedAt: Date;
    isLate: boolean;
    score: number | null;
    maxScore: number;
    gradedAt: Date | null;
    gradedBy: string | null;
}

// ============================================
// ASSIGNMENT CRUD PAYLOADS
// ============================================

export interface CreateAssignmentPayload {
    classId: string;
    title: string;
    description?: string;
    instructions?: string;
    type: AssignmentType;
    dueDate?: Date;
    maxScore: number;
    passingScore?: number;
    allowLateSubmission?: boolean;
    latePenaltyPercent?: number;
    maxAttempts?: number;
    attachments?: string[];
    rubric?: AssignmentRubric;
    publishImmediately?: boolean;
}

export interface UpdateAssignmentPayload {
    title?: string;
    description?: string;
    instructions?: string;
    type?: AssignmentType;
    dueDate?: Date;
    maxScore?: number;
    passingScore?: number;
    allowLateSubmission?: boolean;
    latePenaltyPercent?: number;
    maxAttempts?: number;
    attachments?: string[];
    rubric?: AssignmentRubric;
}

export interface PublishAssignmentPayload {
    assignmentId: string;
    publishAt?: Date; // for scheduling
}

export interface CloseAssignmentPayload {
    assignmentId: string;
    allowLateSubmissions?: boolean;
}

// ============================================
// GRADING PAYLOADS
// ============================================

export interface GradeSubmissionPayload {
    submissionId: string;
    score: number;
    feedback?: string;
    rubricScores?: RubricScoreItem[];
    returnToStudent?: boolean;
}

export interface BulkGradePayload {
    grades: {
        submissionId: string;
        score: number;
        feedback?: string;
    }[];
    returnToStudents?: boolean;
}

// ============================================
// ASSIGNMENT FILTERS & SEARCH
// ============================================

export interface AssignmentFilters {
    search?: string;
    classId?: string;
    departmentId?: string;
    type?: AssignmentType;
    status?: AssignmentStatus;
    dueDateFrom?: Date;
    dueDateTo?: Date;
    createdBy?: string;
}

export interface AssignmentSortOptions {
    field: "title" | "dueDate" | "createdAt" | "submissionCount" | "type";
    direction: "asc" | "desc";
}

export interface AssignmentPaginationOptions {
    page: number;
    pageSize: number;
}

export interface AssignmentListResult {
    assignments: AssignmentListItem[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

// ============================================
// SUBMISSION FILTERS
// ============================================

export interface SubmissionFilters {
    assignmentId: string;
    status?: SubmissionStatus;
    isLate?: boolean;
    gradedBy?: string;
    search?: string; // search by student name/email
}

export interface SubmissionListResult {
    submissions: SubmissionListItem[];
    totalCount: number;
    gradedCount: number;
    pendingCount: number;
    lateCount: number;
    averageScore: number | null;
}

// ============================================
// ASSIGNMENT STATS
// ============================================

export interface AssignmentStats {
    totalAssignments: number;
    publishedAssignments: number;
    draftAssignments: number;
    closedAssignments: number;
    totalSubmissions: number;
    gradedSubmissions: number;
    averageScore: number | null;
    assignmentsByType: {
        type: AssignmentType;
        count: number;
    }[];
    assignmentsByClass: {
        classId: string;
        className: string;
        count: number;
    }[];
    upcomingDueDates: {
        assignmentId: string;
        title: string;
        className: string;
        dueDate: Date;
        pendingSubmissions: number;
    }[];
}

// ============================================
// ASSIGNMENT DETAIL VIEW
// ============================================

export interface AssignmentDetailView extends UniversityAssignment {
    submissions: SubmissionListItem[];
    stats: {
        totalStudents: number;
        submittedCount: number;
        notSubmittedCount: number;
        gradedCount: number;
        lateCount: number;
        averageScore: number | null;
        highestScore: number | null;
        lowestScore: number | null;
        passRate: number | null;
    };
    scoreDistribution: {
        range: string;
        count: number;
    }[];
}

// ============================================
// CODING ASSIGNMENT TYPES (for integration)
// ============================================

export interface CodingAssignmentConfig {
    language: string;
    starterCode?: string;
    testCases: TestCase[];
    timeLimit?: number; // seconds
    memoryLimit?: number; // MB
    allowedLanguages?: string[];
}

export interface TestCase {
    id: string;
    input: string;
    expectedOutput: string;
    isHidden: boolean;
    points: number;
}

export interface CodingSubmissionResult {
    passed: boolean;
    totalTests: number;
    passedTests: number;
    results: TestCaseResult[];
    executionTime?: number;
    memoryUsed?: number;
}

export interface TestCaseResult {
    testCaseId: string;
    passed: boolean;
    actualOutput?: string;
    error?: string;
    executionTime?: number;
}
