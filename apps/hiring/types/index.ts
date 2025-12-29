// Types for the Request Body for the SignUp:
export interface RegisterRequestBody {
    name: string;
    email: string;
    password: string;
    companyName?: string;
}

// Types for API responses
export interface ApiResponse<T = unknown> {
    success: boolean;
    message?: string;
    error?: string;
    data?: T;
}

// User types
export interface HiringUser {
    id: string;
    name: string | null;
    email: string;
    emailVerified: boolean;
    onboardingCompleted: boolean;
    image?: string | null;
}

// Company types
export interface Company {
    id: string;
    name: string;
    slug: string;
    logoUrl?: string | null;
    website?: string | null;
    description?: string | null;
    industry?: string | null;
    companySize?: string | null;
    createdAt: Date;
    updatedAt: Date;
}

// Company member types
export type CompanyMemberRole = "HEAD" | "RECRUITER";
export type CompanyMemberJobTitle =
    | "CEO"
    | "CTO"
    | "COFOUNDER"
    | "VP_ENGINEERING"
    | "HR_HEAD"
    | "HR_MANAGER"
    | "RECRUITER"
    | "HIRING_MANAGER"
    | "OTHER";

export interface CompanyMember {
    id: string;
    userId: string;
    companyId: string;
    role: CompanyMemberRole;
    jobTitle: CompanyMemberJobTitle;
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
export interface HiringSession {
    user: HiringUser;
    companyMember?: CompanyMember;
    company?: Company;
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
// COMPANY DETAILS TYPES
// ============================================

// Extended company details with location
export interface CompanyDetails {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
    website: string | null;
    description: string | null;
    industry: string | null;
    companySize: string | null;
    foundedYear: number | null;
    headquarters: string | null;
    socialLinks: CompanySocialLinks | null;
    // Location details
    address: string | null;
    city: string | null;
    state: string | null;
    country: string | null;
    pincode: string | null;
    // Verification
    verificationStatus: CompanyVerificationStatus;
    verifiedAt: Date | null;
    // Stats
    memberCount?: number;
    jobCount?: number;
    createdAt: Date;
    updatedAt: Date;
}

export type CompanyVerificationStatus = "PENDING" | "VERIFIED" | "REJECTED";

export interface CompanySocialLinks {
    linkedin?: string;
    twitter?: string;
    github?: string;
}

// Update company details payload
export interface UpdateCompanyPayload {
    name?: string;
    website?: string;
    description?: string;
    industry?: string;
    companySize?: string;
    foundedYear?: number;
    headquarters?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    pincode?: string;
    socialLinks?: CompanySocialLinks;
}

// ============================================
// PERMISSIONS & ROLES TYPES
// ============================================

// Available permissions in the system
export type Permission =
    | "view_jobs"
    | "post_jobs"
    | "edit_jobs"
    | "delete_jobs"
    | "view_applications"
    | "review_candidates"
    | "manage_assessments"
    | "manage_members"
    | "manage_company"
    | "manage_billing"
    | "view_analytics";

// Permission group for UI display
export interface PermissionGroup {
    name: string;
    description: string;
    permissions: PermissionItem[];
}

export interface PermissionItem {
    key: Permission;
    label: string;
    description: string;
}

// Default role permissions
export const DEFAULT_HEAD_PERMISSIONS: Permission[] = [
    "view_jobs",
    "post_jobs",
    "edit_jobs",
    "delete_jobs",
    "view_applications",
    "review_candidates",
    "manage_assessments",
    "manage_members",
    "manage_company",
    "manage_billing",
    "view_analytics",
];

export const DEFAULT_RECRUITER_PERMISSIONS: Permission[] = [
    "view_jobs",
    "post_jobs",
    "view_applications",
    "review_candidates",
];

// ============================================
// TEAM MEMBER TYPES
// ============================================

// Extended team member with user info
export interface TeamMember {
    id: string;
    userId: string;
    companyId: string;
    role: CompanyMemberRole;
    jobTitle: CompanyMemberJobTitle;
    jobTitleCustom: string | null;
    displayName: string | null;
    email: string;
    phone: string | null;
    permissions: Permission[];
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
}

export type MemberInviteStatus = "PENDING" | "ACCEPTED" | "REVOKED" | "EXPIRED";

// Update team member payload
export interface UpdateTeamMemberPayload {
    role?: CompanyMemberRole;
    jobTitle?: CompanyMemberJobTitle;
    jobTitleCustom?: string;
    permissions?: Permission[];
    isActive?: boolean;
}

// Invite team member payload
export interface InviteTeamMemberPayload {
    email: string;
    name?: string;
    role: CompanyMemberRole;
    jobTitle: CompanyMemberJobTitle;
    permissions?: Permission[];
    message?: string;
}
