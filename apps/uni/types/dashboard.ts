/**
 * Dashboard Types
 * Types for dashboard analytics and overview data
 */

// ============================================
// DASHBOARD OVERVIEW
// ============================================

export interface DashboardOverview {
    // Counts
    totalStudents: number;
    verifiedStudents: number;
    pendingStudents: number;
    
    totalFaculty: number;
    activeFaculty: number;
    
    totalDepartments: number;
    
    totalClasses: number;
    activeClasses: number;
    
    totalAssignments: number;
    pendingGrading: number;
    
    // Credits
    creditsAllocated: number;
    creditsUsed: number;
    creditsRemaining: number;
    
    // Quick stats
    recentActivity: ActivityItem[];
    upcomingDeadlines: UpcomingDeadline[];
}

// ============================================
// ACTIVITY TYPES
// ============================================

export type ActivityType = 
    | "STUDENT_VERIFIED"
    | "STUDENT_LINKED"
    | "MEMBER_INVITED"
    | "MEMBER_JOINED"
    | "CLASS_CREATED"
    | "ASSIGNMENT_CREATED"
    | "ASSIGNMENT_PUBLISHED"
    | "SUBMISSION_RECEIVED"
    | "SUBMISSION_GRADED"
    | "DEPARTMENT_CREATED"
    | "CREDITS_ALLOCATED";

export interface ActivityItem {
    id: string;
    type: ActivityType;
    title: string;
    description: string;
    timestamp: Date;
    userId?: string;
    userName?: string;
    entityId?: string;
    entityType?: string;
}

// ============================================
// DEADLINES
// ============================================

export interface UpcomingDeadline {
    id: string;
    type: "ASSIGNMENT_DUE" | "GRADING_DUE";
    title: string;
    className: string;
    classId: string;
    dueDate: Date;
    daysRemaining: number;
    pendingCount?: number;
}

// ============================================
// ANALYTICS TYPES
// ============================================

export interface AnalyticsDateRange {
    startDate: Date;
    endDate: Date;
    period: "day" | "week" | "month" | "year";
}

export interface StudentAnalytics {
    // Growth over time
    studentsOverTime: {
        date: string;
        total: number;
        verified: number;
        newlyLinked: number;
    }[];
    
    // Distribution
    studentsByDepartment: {
        departmentId: string;
        departmentName: string;
        count: number;
        percentage: number;
    }[];
    
    studentsByYear: {
        year: number;
        count: number;
    }[];
    
    studentsBySemester: {
        semester: number;
        count: number;
    }[];
    
    // Status breakdown
    statusBreakdown: {
        status: string;
        count: number;
        percentage: number;
    }[];
}

export interface AssignmentAnalytics {
    // Overview
    totalAssignments: number;
    averageSubmissionRate: number;
    averageScore: number;
    onTimeSubmissionRate: number;
    
    // Submissions over time
    submissionsOverTime: {
        date: string;
        submitted: number;
        graded: number;
    }[];
    
    // By type
    assignmentsByType: {
        type: string;
        count: number;
        avgScore: number;
    }[];
    
    // By class
    performanceByClass: {
        classId: string;
        className: string;
        assignmentCount: number;
        avgScore: number;
        submissionRate: number;
    }[];
    
    // Score distribution
    scoreDistribution: {
        range: string;
        count: number;
        percentage: number;
    }[];
}

export interface ClassAnalytics {
    // Overview
    totalClasses: number;
    activeClasses: number;
    averageClassSize: number;
    
    // Class size distribution
    classSizeDistribution: {
        range: string;
        count: number;
    }[];
    
    // By department
    classesByDepartment: {
        departmentId: string;
        departmentName: string;
        count: number;
        totalStudents: number;
    }[];
    
    // Top performing classes
    topPerformingClasses: {
        classId: string;
        className: string;
        departmentName: string;
        averageScore: number;
        completionRate: number;
    }[];
}

export interface CreditsAnalytics {
    // Overview
    totalAllocated: number;
    totalUsed: number;
    totalRemaining: number;
    utilizationRate: number;
    
    // Usage over time
    usageOverTime: {
        date: string;
        allocated: number;
        used: number;
    }[];
    
    // By department
    creditsByDepartment: {
        departmentId: string;
        departmentName: string;
        allocated: number;
        used: number;
        utilizationRate: number;
    }[];
    
    // Top users
    topCreditUsers: {
        studentLinkId: string;
        studentName: string;
        creditsUsed: number;
    }[];
    
    // Expiring soon
    expiringSoon: {
        studentLinkId: string;
        studentName: string;
        credits: number;
        expiryDate: Date;
    }[];
}

// ============================================
// REPORT TYPES
// ============================================

export type ReportType = 
    | "STUDENT_SUMMARY"
    | "ASSIGNMENT_SUMMARY"
    | "CLASS_PERFORMANCE"
    | "CREDITS_USAGE"
    | "DEPARTMENT_OVERVIEW";

export interface ReportConfig {
    type: ReportType;
    title: string;
    dateRange: AnalyticsDateRange;
    filters?: {
        departmentIds?: string[];
        classIds?: string[];
        semesterIds?: number[];
    };
    format: "PDF" | "CSV" | "XLSX";
}

export interface GeneratedReport {
    id: string;
    type: ReportType;
    title: string;
    generatedAt: Date;
    downloadUrl: string;
    expiresAt: Date;
    generatedBy: string;
}

// ============================================
// WIDGET TYPES (for customizable dashboard)
// ============================================

export type WidgetType = 
    | "STATS_CARD"
    | "CHART_LINE"
    | "CHART_BAR"
    | "CHART_PIE"
    | "ACTIVITY_FEED"
    | "DEADLINES"
    | "QUICK_ACTIONS";

export interface DashboardWidget {
    id: string;
    type: WidgetType;
    title: string;
    dataSource: string;
    position: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    config?: Record<string, unknown>;
}

export interface DashboardLayout {
    widgets: DashboardWidget[];
    updatedAt: Date;
}
