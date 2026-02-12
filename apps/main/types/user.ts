import { SkillCategory } from "@repo/prisma/client"

export type UserProfile = {
    id: string
    username: string | null
    name?: string
    email: string
    emailVerified?: boolean
    image?: string
    role?: string
    hasResume?: boolean
    resume?: string | null
    resumeText?: string | null
    bio?: string
    university?: string
    company?: string
    location?: string
    socials?: {
        instagram?: string
        linkedin?: string
        twitter?: string
        facebook?: string
    }
    xp?: number
    credits?: number
    skills: UserSkill[]
    certifications: UserCertification[]
    contactInfo?: ContactInfo
    website?: string
    createdAt?: Date | string
    occupation?: string
    creditsShared?: number | null
    maxCreditsShared?: number | null
    semester?: string
    careerGoals?: string[]
    targetCompanies?: string[]
    expectedSalary?: string | null
    noticePeriod?: string | null
    workExperience?: string | null
}

export type UserSkill = {
    id?: string
    name: string
    level: string | number
    category?: SkillCategory
    order?: number
}

export type UserCertification = {
    id?: string
    name: string
    issuer: string
    issuedDate?: Date
    link?: string
}

export type ContactInfo = {
    phone: string;
    gender?: string;
    yearofbirth?: string;
}