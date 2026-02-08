/**
 * Class Types
 * All class-related types for the University platform
 */

// ============================================
// CLASS TYPES
// ============================================

export interface UniversityClass {
    id: string;
    universityId: string;
    departmentId: string;
    name: string;
    code: string | null;
    description: string | null;
    semester: number;
    section: string | null;
    academicYear: string;
    startDate: Date | null;
    endDate: Date | null;
    isActive: boolean;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
    // Relations
    department?: {
        id: string;
        name: string;
        code: string | null;
    };
    creator?: {
        id: string;
        displayName: string | null;
        email: string;
    };
    _count?: {
        enrollments: number;
        assignments: number;
        faculty: number;
    };
}

// For display in tables/lists
export interface ClassListItem {
    id: string;
    name: string;
    code: string | null;
    departmentId: string;
    departmentName: string;
    departmentCode: string | null;
    semester: number;
    section: string | null;
    academicYear: string;
    isActive: boolean;
    studentCount: number;
    assignmentCount: number;
    facultyCount: number;
    createdAt: Date;
}

// ============================================
// CLASS ENROLLMENT TYPES
// ============================================

export type EnrollmentStatus = "ENROLLED" | "DROPPED" | "COMPLETED";

export interface ClassEnrollment {
    id: string;
    classId: string;
    studentLinkId: string;
    status: EnrollmentStatus;
    enrolledAt: Date;
    droppedAt: Date | null;
    completedAt: Date | null;
    grade: string | null;
    gradePoints: number | null;
    // Relations
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
    class?: {
        id: string;
        name: string;
        code: string | null;
    };
}

// For display
export interface EnrolledStudent {
    enrollmentId: string;
    studentLinkId: string;
    userId: string;
    studentName: string | null;
    studentEmail: string;
    studentImage: string | null;
    enrollmentNumber: string;
    status: EnrollmentStatus;
    enrolledAt: Date;
    grade: string | null;
    gradePoints: number | null;
    assignmentsSubmitted: number;
    assignmentsTotal: number;
    averageScore: number | null;
}

// ============================================
// CLASS FACULTY TYPES
// ============================================

export type ClassFacultyRole = "PRIMARY" | "SECONDARY" | "TA";

export interface ClassFaculty {
    id: string;
    classId: string;
    memberId: string;
    role: ClassFacultyRole;
    assignedAt: Date;
    // Relations
    member?: {
        id: string;
        userId: string;
        displayName: string | null;
        email: string;
        jobTitle: string;
        user?: {
            name: string | null;
            image: string | null;
        };
    };
}

// For display
export interface ClassFacultyItem {
    id: string;
    memberId: string;
    memberName: string | null;
    memberEmail: string;
    memberImage: string | null;
    jobTitle: string;
    role: ClassFacultyRole;
    assignedAt: Date;
}

// ============================================
// CLASS CRUD PAYLOADS
// ============================================

export interface CreateClassPayload {
    name: string;
    code?: string;
    description?: string;
    departmentId: string;
    semester: number;
    section?: string;
    academicYear: string;
    startDate?: Date;
    endDate?: Date;
    facultyIds?: string[]; // member IDs to assign
}

export interface UpdateClassPayload {
    name?: string;
    code?: string;
    description?: string;
    departmentId?: string;
    semester?: number;
    section?: string;
    academicYear?: string;
    startDate?: Date;
    endDate?: Date;
    isActive?: boolean;
}

// ============================================
// ENROLLMENT PAYLOADS
// ============================================

export interface EnrollStudentsPayload {
    classId: string;
    studentLinkIds: string[];
}

export interface UnenrollStudentPayload {
    classId: string;
    studentLinkId: string;
    markAsDropped?: boolean;
}

export interface BulkEnrollPayload {
    classId: string;
    filters: {
        departmentId?: string;
        semester?: number;
        section?: string;
        enrollmentYear?: number;
    };
}

// ============================================
// FACULTY ASSIGNMENT PAYLOADS
// ============================================

export interface AssignFacultyPayload {
    classId: string;
    memberId: string;
    role: ClassFacultyRole;
}

export interface RemoveFacultyPayload {
    classId: string;
    memberId: string;
}

// ============================================
// CLASS FILTERS & SEARCH
// ============================================

export interface ClassFilters {
    search?: string;
    departmentId?: string;
    semester?: number;
    section?: string;
    academicYear?: string;
    isActive?: boolean;
    facultyId?: string;
}

export interface ClassSortOptions {
    field: "name" | "code" | "semester" | "studentCount" | "createdAt";
    direction: "asc" | "desc";
}

export interface ClassPaginationOptions {
    page: number;
    pageSize: number;
}

export interface ClassListResult {
    classes: ClassListItem[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

// ============================================
// CLASS STATS
// ============================================

export interface ClassStats {
    totalClasses: number;
    activeClasses: number;
    totalEnrollments: number;
    averageStudentsPerClass: number;
    classesByDepartment: {
        departmentId: string;
        departmentName: string;
        count: number;
    }[];
    classesBySemester: {
        semester: number;
        count: number;
    }[];
}

// ============================================
// CLASS DETAIL VIEW
// ============================================

export interface ClassDetailView extends UniversityClass {
    students: EnrolledStudent[];
    faculty: ClassFacultyItem[];
    recentAssignments: {
        id: string;
        title: string;
        dueDate: Date | null;
        submissionCount: number;
        totalStudents: number;
    }[];
    stats: {
        totalStudents: number;
        activeStudents: number;
        completedStudents: number;
        droppedStudents: number;
        averageGrade: number | null;
        assignmentCount: number;
        completedAssignments: number;
    };
}
