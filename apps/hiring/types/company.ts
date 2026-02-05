/**
 * Company-related types for the Hiring Platform
 * These types handle company profiles, members, and settings
 */

// ============================================
// ENUMS (Mirror Prisma enums)
// ============================================

export type CompanyMemberRole = 
    | "FOUNDER"
    | "ADMIN"
    | "HIRING_MANAGER"
    | "RECRUITER"
    | "INTERVIEWER"

export type CompanyMemberJobTitle =
    | "CEO"
    | "CTO"
    | "COFOUNDER"
    | "VP_ENGINEERING"
    | "HR_HEAD"
    | "HR_MANAGER"
    | "RECRUITER"
    | "HIRING_MANAGER"
    | "OTHER"

export type CompanyVerificationStatus = "PENDING" | "VERIFIED" | "REJECTED"

export type MemberInviteStatus = "PENDING" | "ACCEPTED" | "REVOKED" | "EXPIRED"

export type CompanyInvitationStatus = "PENDING" | "ACCEPTED" | "EXPIRED" | "CANCELLED"

// ============================================
// COMPANY INTERFACES
// ============================================

export interface CompanySocialLinks {
    linkedin?: string
    twitter?: string
    github?: string
    website?: string
}

export interface CompanyCulture {
    values?: string[]
    workStyle?: string
    teamSize?: string
    description?: string
}

export interface MediaItem {
    id: string
    type: "image" | "video"
    url: string
    title?: string
    description?: string
}

export interface CompanyProfile {
    id: string
    name: string
    slug: string
    logo: string | null
    coverImage: string | null
    tagline: string | null
    description: string | null
    website: string | null
    industry: string | null
    size: string | null
    founded: number | null
    headquarters: string | null
    locations: string[]
    techStack: string[]
    benefits: string[]
    culture: CompanyCulture | null
    mediaGallery: MediaItem[]
    socialLinks: CompanySocialLinks | null
    isVerified: boolean
    jobsCount?: number
    membersCount?: number
}

export interface UpdateCompanyProfileData {
    name?: string
    tagline?: string
    description?: string
    website?: string
    industry?: string
    size?: string
    founded?: number
    headquarters?: string
    locations?: string[]
    techStack?: string[]
    benefits?: string[]
    culture?: CompanyCulture
    socialLinks?: CompanySocialLinks
}

export interface CompanyStats {
    activeJobs: number
    totalHires: number
    avgTimeToHireDays: number
}

// ============================================
// TEAM MEMBER INTERFACES
// ============================================

export interface TeamMember {
    id: string
    userId: string
    companyId: string
    role: CompanyMemberRole
    status: string
    user: {
        id: string
        name: string | null
        email: string
        image: string | null
    }
    createdAt: Date
    jobsPosted?: number
}

export interface PendingInvite {
    id: string
    email: string
    role: CompanyMemberRole
    status: string
    createdAt: Date
    expiresAt: Date
    invitedBy: {
        name: string | null
    }
}

export interface TeamStats {
    totalMembers: number
    pendingInvites: number
    jobsPosted: number
}

// ============================================
// MEDIA GALLERY INTERFACES
// ============================================

export interface AddMediaInput {
    type: "image" | "video"
    url: string
    title?: string
    description?: string
}
