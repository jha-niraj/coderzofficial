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
