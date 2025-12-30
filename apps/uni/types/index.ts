// Types for the Request Body for the SignUp:
export interface RegisterRequestBody {
    name: string;
    email: string;
    password: string;
    universityName?: string;
}

// Types for API responses
export interface ApiResponse<T = unknown> {
    success: boolean;
    message?: string;
    error?: string;
    data?: T;
}

// User types
export interface UniUser {
    id: string;
    name: string | null;
    email: string;
    emailVerified: boolean;
    onboardingCompleted: boolean;
    image?: string | null;
}

// ============================================
// UNIVERSITY TYPES
// ============================================

export interface University {
    id: string;
    name: string;
    slug: string;
    logoUrl?: string | null;
    bannerUrl?: string | null;
    website?: string | null;
    description?: string | null;
    email?: string | null;
    phone?: string | null;
    universityType?: string | null;
    affiliatedTo?: string | null;
    accreditation?: string | null;
    establishedYear?: number | null;
    emailDomain: string;
    createdAt: Date;
    updatedAt: Date;
}

// University member types
export type UniversityMemberRole =
    | "HEAD"
    | "DEPARTMENT_HEAD"
    | "PLACEMENT_OFFICER"
    | "FINANCE_OFFICER"
    | "FACULTY"
    | "TEACHING_ASSISTANT";

export type UniversityMemberJobTitle =
    | "CHANCELLOR"
    | "PRINCIPAL"
    | "REGISTRAR"
    | "DEAN"
    | "HOD"
    | "PROFESSOR"
    | "ASSOCIATE_PROFESSOR"
    | "ASSISTANT_PROFESSOR"
    | "LECTURER"
    | "PLACEMENT_COORDINATOR"
    | "PLACEMENT_OFFICER"
    | "FINANCE_MANAGER"
    | "ACCOUNTS_OFFICER"
    | "TEACHING_ASSISTANT"
    | "LAB_INSTRUCTOR"
    | "OTHER";

export interface UniversityMember {
    id: string;
    userId: string;
    universityId: string;
    departmentId?: string | null;
    role: UniversityMemberRole;
    jobTitle: UniversityMemberJobTitle;
    jobTitleCustom?: string | null;
    displayName?: string | null;
    email: string;
    phone?: string | null;
    permissions: string[];
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

// Session types for middleware
export interface UniSession {
    user: UniUser;
    universityMember?: UniversityMember;
    university?: University;
}

// ============================================
// PROFILE & USER MANAGEMENT TYPES
// ============================================

// Extended user profile for display purposes
export interface UserProfile {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
    phone: string | null;
    bio: string | null;
    createdAt: Date;
}

// Profile update payload
export interface UpdateProfilePayload {
    name?: string;
    phone?: string;
    bio?: string;
    displayName?: string;
    jobTitleCustom?: string;
}

// Password change payload
export interface ChangePasswordPayload {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

// ============================================
// UNIVERSITY DETAILS TYPES
// ============================================

// Extended university details with location
export interface UniversityDetails {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
    bannerUrl: string | null;
    website: string | null;
    description: string | null;
    email: string | null;
    phone: string | null;
    universityType: string | null;
    affiliatedTo: string | null;
    accreditation: string | null;
    establishedYear: number | null;
    emailDomain: string;
    // Location details
    address: string | null;
    city: string | null;
    state: string | null;
    country: string;
    pincode: string | null;
    // Verification
    verificationStatus: UniversityVerificationStatus;
    verifiedAt: Date | null;
    // Credits
    totalCreditsAllocated: number;
    totalCreditsUsed: number;
    creditExpiryDate: Date | null;
    // Stats
    memberCount?: number;
    studentCount?: number;
    departmentCount?: number;
    createdAt: Date;
    updatedAt: Date;
}

export type UniversityVerificationStatus = "PENDING" | "UNDER_REVIEW" | "VERIFIED" | "REJECTED" | "SUSPENDED";

// Update university details payload
export interface UpdateUniversityPayload {
    name?: string;
    website?: string;
    description?: string;
    email?: string;
    phone?: string;
    universityType?: string;
    affiliatedTo?: string;
    accreditation?: string;
    establishedYear?: number;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    pincode?: string;
}

// ============================================
// PERMISSIONS & ROLES TYPES
// ============================================

// Available permissions in the university system
export type UniversityPermission =
    // Class & Teaching
    | "view_classes"
    | "create_classes"
    | "edit_classes"
    | "delete_classes"
    // Assignments
    | "create_assignments"
    | "edit_assignments"
    | "delete_assignments"
    | "grade_submissions"
    // Students
    | "view_students"
    | "verify_students"
    | "manage_student_credits"
    // Departments
    | "manage_departments"
    // Members
    | "manage_members"
    | "invite_members"
    // University Admin
    | "manage_university"
    | "manage_billing"
    | "manage_credits"
    // Placements
    | "manage_placements"
    | "view_job_applications"
    // Analytics
    | "view_analytics"
    | "view_reports";

// Permission group for UI display
export interface PermissionGroup {
    name: string;
    description: string;
    permissions: PermissionItem[];
}

export interface PermissionItem {
    key: UniversityPermission;
    label: string;
    description: string;
}

// Default role permissions
export const DEFAULT_HEAD_PERMISSIONS: UniversityPermission[] = [
    "view_classes",
    "create_classes",
    "edit_classes",
    "delete_classes",
    "create_assignments",
    "edit_assignments",
    "delete_assignments",
    "grade_submissions",
    "view_students",
    "verify_students",
    "manage_student_credits",
    "manage_departments",
    "manage_members",
    "invite_members",
    "manage_university",
    "manage_billing",
    "manage_credits",
    "manage_placements",
    "view_job_applications",
    "view_analytics",
    "view_reports",
];

export const DEFAULT_DEPARTMENT_HEAD_PERMISSIONS: UniversityPermission[] = [
    "view_classes",
    "create_classes",
    "edit_classes",
    "create_assignments",
    "edit_assignments",
    "delete_assignments",
    "grade_submissions",
    "view_students",
    "invite_members",
    "view_analytics",
];

export const DEFAULT_FACULTY_PERMISSIONS: UniversityPermission[] = [
    "view_classes",
    "create_assignments",
    "edit_assignments",
    "grade_submissions",
    "view_students",
];

export const DEFAULT_PLACEMENT_OFFICER_PERMISSIONS: UniversityPermission[] = [
    "view_students",
    "manage_placements",
    "view_job_applications",
    "view_analytics",
];

export const DEFAULT_FINANCE_OFFICER_PERMISSIONS: UniversityPermission[] = [
    "manage_billing",
    "manage_credits",
    "manage_student_credits",
    "view_analytics",
    "view_reports",
];

export const DEFAULT_TA_PERMISSIONS: UniversityPermission[] = [
    "view_classes",
    "grade_submissions",
    "view_students",
];

// ============================================
// TEAM MEMBER TYPES
// ============================================

// Extended team member with user info
export interface TeamMember {
    id: string;
    userId: string;
    universityId: string;
    departmentId: string | null;
    role: UniversityMemberRole;
    jobTitle: UniversityMemberJobTitle;
    jobTitleCustom: string | null;
    displayName: string | null;
    email: string;
    phone: string | null;
    permissions: UniversityPermission[];
    inviteStatus: MemberInviteStatus;
    isActive: boolean;
    lastActiveAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    // User info
    user?: {
        name: string | null;
        image: string | null;
    };
    // Department info
    department?: {
        id: string;
        name: string;
        code: string | null;
    } | null;
}

export type MemberInviteStatus = "PENDING" | "ACCEPTED" | "REVOKED" | "EXPIRED";

// Update team member payload
export interface UpdateTeamMemberPayload {
    role?: UniversityMemberRole;
    jobTitle?: UniversityMemberJobTitle;
    jobTitleCustom?: string;
    departmentId?: string | null;
    permissions?: UniversityPermission[];
    isActive?: boolean;
}

// Invite team member payload
export interface InviteTeamMemberPayload {
    email: string;
    name?: string;
    role: UniversityMemberRole;
    jobTitle: UniversityMemberJobTitle;
    departmentId?: string;
    permissions?: UniversityPermission[];
    message?: string;
}

// Department type
export interface Department {
    id: string;
    universityId: string;
    name: string;
    code: string | null;
    description: string | null;
    headUserId: string | null;
    createdAt: Date;
    updatedAt: Date;
}
