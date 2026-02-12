import type { ResumePublicViewUser } from "@/components/resume/resume-public-view"

/** Work experience from getOwnProfile / Prisma */
export interface ResumeExperience {
    id: string
    companyName: string
    roleTitle: string
    companyWebsite?: string | null
    description?: string | null
    bulletPoints?: string[]
    startDate: Date
    endDate?: Date | null
    isCurrentlyWorking: boolean
}

/** Portfolio project from getOwnProfile */
export interface ResumePortfolioProject {
    id: string
    projectName: string
    projectType: string
    description?: string | null
    bulletPoints?: string[]
    status: string
    visibility: string
    technologies: string[]
    startDate: Date
    endDate?: Date | null
    projectLinks?: Array<{ linkType: string; url: string; description?: string | null }>
    projectMedia?: Array<{ mediaUrl: string; mediaType: string; caption?: string | null }>
}

/** User education entry */
export interface ResumeEducation {
    id: string
    degree?: string | null
    institution: string
    startDate: Date
    endDate?: Date | null
}

/** User skill */
export interface ResumeSkill {
    id: string
    name: string
    category?: string
}

/** Certification */
export interface ResumeCertification {
    id: string
    name: string
    issuer: string
    issuedDate: Date
    link: string
}

/** Social link */
export interface ResumeSocialLink {
    id: string
    platform: string
    url: string
}

/** Full profile from getOwnProfile - used in resume creator */
export interface ResumeCreatorProfile {
    id: string
    name: string | null
    username: string | null
    image: string | null
    bio?: string | null
    occupation?: string | null
    location?: string | null
    company?: string | null
    website?: string | null
    experiences: ResumeExperience[]
    portfolioProjects: ResumePortfolioProject[]
    skills: ResumeSkill[]
    educations: ResumeEducation[]
    certifications: ResumeCertification[]
    socialLinks: ResumeSocialLink[]
    userProfile?: {
        coverGradient: string | null
        tagline: string | null
        theme: string
    } | null
    careerGoals?: string[]
    targetCompanies?: string[]
    expectedSalary?: string | null
    noticePeriod?: string | null
    workExperience?: string | null
    semester?: string | null
    university?: string | null
}

/** Map profile to ResumePublicViewUser shape */
export function toResumePublicViewUser(profile: ResumeCreatorProfile): ResumePublicViewUser {
    return {
        name: profile.name,
        username: profile.username,
        occupation: profile.occupation,
        location: profile.location,
        image: profile.image,
        experiences: profile.experiences ?? [],
        portfolioProjects: profile.portfolioProjects ?? [],
        skills: profile.skills ?? [],
        educations: profile.educations ?? [],
        certifications: profile.certifications ?? [],
        socialLinks: profile.socialLinks ?? [],
    }
}

/** Normalize getOwnProfile user to ResumeCreatorProfile */
export function normalizeToResumeProfile(user: {
    id: string
    name: string | null
    username: string | null
    image: string | null
    bio?: string | null
    occupation?: string | null
    location?: string | null
    company?: string | null
    website?: string | null
    userProfile?: { coverGradient: string | null; tagline: string | null; theme: string } | null
    careerGoals?: string[]
    targetCompanies?: string[]
    expectedSalary?: string | null
    noticePeriod?: string | null
    workExperience?: string | null
    semester?: string | null
    university?: string | null
    experiences?: ResumeExperience[]
    portfolioProjects?: ResumePortfolioProject[]
    skills?: ResumeSkill[]
    educations?: ResumeEducation[]
    certifications?: ResumeCertification[]
    socialLinks?: ResumeSocialLink[]
}): ResumeCreatorProfile {
    return {
        id: user.id,
        name: user.name,
        username: user.username,
        image: user.image,
        bio: user.bio,
        occupation: user.occupation,
        location: user.location,
        company: user.company,
        website: user.website,
        userProfile: user.userProfile,
        careerGoals: user.careerGoals,
        targetCompanies: user.targetCompanies,
        expectedSalary: user.expectedSalary,
        noticePeriod: user.noticePeriod,
        workExperience: user.workExperience,
        semester: user.semester,
        university: user.university,
        experiences: user.experiences ?? [],
        portfolioProjects: (user.portfolioProjects ?? []).map((p) => ({
            ...p,
            projectType: p.projectType ?? "PERSONAL",
            status: p.status ?? "IN_PROGRESS",
            visibility: p.visibility ?? "PUBLIC",
            technologies: p.technologies ?? [],
        })),
        skills: user.skills ?? [],
        educations: user.educations ?? [],
        certifications: user.certifications ?? [],
        socialLinks: user.socialLinks ?? [],
    }
}