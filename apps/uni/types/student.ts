/**
 * Student Types
 * All student-related types for the University platform
 */

// ============================================
// STUDENT LINK TYPES
// ============================================

export type StudentLinkStatus = 
    | "PENDING"
    | "VERIFIED"
    | "REJECTED"
    | "SUSPENDED";

export interface StudentLink {
    id: string;
    userId: string;
    universityId: string;
    departmentId: string | null;
    enrollmentNumber: string;
    enrollmentYear: number;
    graduationYear: number | null;
    programName: string;
    semester: number | null;
    section: string | null;
    status: StudentLinkStatus;
    verifiedAt: Date | null;
    verifiedBy: string | null;
    creditsAllocated: number;
    creditsUsed: number;
    creditExpiryDate: Date | null;
    createdAt: Date;
    updatedAt: Date;
    // Relations
    user?: {
        id: string;
        name: string | null;
        email: string;
        image: string | null;
    };
    university?: {
        id: string;
        name: string;
        slug: string;
    };
    department?: {
        id: string;
        name: string;
        code: string | null;
    } | null;
}

// For display in tables/lists
export interface StudentListItem {
    id: string;
    userId: string;
    userName: string | null;
    userEmail: string;
    userImage: string | null;
    enrollmentNumber: string;
    enrollmentYear: number;
    programName: string;
    semester: number | null;
    section: string | null;
    departmentName: string | null;
    departmentCode: string | null;
    status: StudentLinkStatus;
    verifiedAt: Date | null;
    creditsRemaining: number;
    createdAt: Date;
}

// ============================================
// STUDENT VERIFICATION TYPES
// ============================================

export interface VerifyStudentPayload {
    studentLinkId: string;
    action: "VERIFY" | "REJECT";
    rejectionReason?: string;
}

export interface BulkVerifyStudentsPayload {
    studentLinkIds: string[];
    action: "VERIFY" | "REJECT";
    rejectionReason?: string;
}

// ============================================
// STUDENT CREDITS TYPES
// ============================================

export interface AllocateCreditsPayload {
    studentLinkId: string;
    credits: number;
    expiryDate?: Date;
    reason?: string;
}

export interface BulkAllocateCreditsPayload {
    studentLinkIds: string[];
    creditsPerStudent: number;
    expiryDate?: Date;
    reason?: string;
}

export interface StudentCreditsHistory {
    id: string;
    studentLinkId: string;
    amount: number;
    type: "ALLOCATED" | "USED" | "EXPIRED" | "REFUNDED";
    reason: string | null;
    performedBy: string | null;
    createdAt: Date;
}

// ============================================
// STUDENT FILTERS & SEARCH
// ============================================

export interface StudentFilters {
    search?: string;
    departmentId?: string;
    enrollmentYear?: number;
    semester?: number;
    section?: string;
    status?: StudentLinkStatus;
    programName?: string;
}

export interface StudentSortOptions {
    field: "name" | "enrollmentNumber" | "enrollmentYear" | "createdAt" | "credits";
    direction: "asc" | "desc";
}

export interface StudentPaginationOptions {
    page: number;
    pageSize: number;
}

export interface StudentListResult {
    students: StudentListItem[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

// ============================================
// STUDENT STATS
// ============================================

export interface StudentStats {
    totalStudents: number;
    verifiedStudents: number;
    pendingStudents: number;
    rejectedStudents: number;
    studentsByDepartment: {
        departmentId: string;
        departmentName: string;
        count: number;
    }[];
    studentsByYear: {
        year: number;
        count: number;
    }[];
    creditsAllocated: number;
    creditsUsed: number;
}

// ============================================
// STUDENT IMPORT TYPES
// ============================================

export interface StudentImportRow {
    name: string;
    email: string;
    enrollmentNumber: string;
    enrollmentYear: number;
    graduationYear?: number;
    programName: string;
    semester?: number;
    section?: string;
    departmentCode?: string;
}

export interface StudentImportResult {
    success: boolean;
    totalRows: number;
    imported: number;
    failed: number;
    errors: {
        row: number;
        email: string;
        error: string;
    }[];
}

export interface StudentImportPayload {
    students: StudentImportRow[];
    autoVerify?: boolean;
    sendInvites?: boolean;
}
