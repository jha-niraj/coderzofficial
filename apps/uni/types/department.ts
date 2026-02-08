/**
 * Department Types
 * All department-related types for the University platform
 */

// ============================================
// DEPARTMENT TYPES
// ============================================

export interface Department {
    id: string;
    universityId: string;
    name: string;
    code: string | null;
    description: string | null;
    headUserId: string | null;
    createdAt: Date;
    updatedAt: Date;
    // Relations
    head?: {
        id: string;
        userId: string;
        displayName: string | null;
        email: string;
        user?: {
            name: string | null;
            image: string | null;
        };
    } | null;
    _count?: {
        members: number;
        students: number;
        classes: number;
    };
}

// For display in tables/lists
export interface DepartmentListItem {
    id: string;
    name: string;
    code: string | null;
    description: string | null;
    headName: string | null;
    headEmail: string | null;
    headImage: string | null;
    memberCount: number;
    studentCount: number;
    classCount: number;
    createdAt: Date;
}

// ============================================
// DEPARTMENT CRUD PAYLOADS
// ============================================

export interface CreateDepartmentPayload {
    name: string;
    code?: string;
    description?: string;
    headUserId?: string;
}

export interface UpdateDepartmentPayload {
    name?: string;
    code?: string;
    description?: string;
    headUserId?: string | null;
}

// ============================================
// DEPARTMENT FILTERS & SEARCH
// ============================================

export interface DepartmentFilters {
    search?: string;
    hasHead?: boolean;
}

export interface DepartmentSortOptions {
    field: "name" | "code" | "memberCount" | "studentCount" | "createdAt";
    direction: "asc" | "desc";
}

export interface DepartmentListResult {
    departments: DepartmentListItem[];
    totalCount: number;
}

// ============================================
// DEPARTMENT STATS
// ============================================

export interface DepartmentStats {
    totalDepartments: number;
    departmentsWithHead: number;
    departmentsWithoutHead: number;
    totalMembers: number;
    totalStudents: number;
    totalClasses: number;
    largestDepartment: {
        id: string;
        name: string;
        memberCount: number;
    } | null;
}

// ============================================
// DEPARTMENT DETAIL VIEW
// ============================================

export interface DepartmentDetailView extends Department {
    members: {
        id: string;
        userId: string;
        displayName: string | null;
        email: string;
        jobTitle: string;
        role: string;
        isActive: boolean;
        user?: {
            name: string | null;
            image: string | null;
        };
    }[];
    recentClasses: {
        id: string;
        name: string;
        code: string | null;
        semester: number;
        studentCount: number;
        isActive: boolean;
    }[];
    stats: {
        totalMembers: number;
        activeMembers: number;
        totalStudents: number;
        verifiedStudents: number;
        totalClasses: number;
        activeClasses: number;
    };
}
