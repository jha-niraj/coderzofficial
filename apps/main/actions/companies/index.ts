"use server"

import { prisma } from "@repo/prisma"
import { auth } from "@repo/auth"
import { revalidatePath } from "next/cache"

export interface CompanyFilters {
    search?: string
    industry?: string[]
    companySize?: string[]
    hasTransparentProcess?: boolean
}

export interface CompanyListResult {
    id: string
    name: string
    slug: string
    logoUrl: string | null
    website: string | null
    industry: string | null
    companySize: string | null
    description: string | null
    verificationStatus: string
    headquarters: string | null
    activeJobsCount: number
    hasTransparentProcess: boolean
}

// Browse all companies with filters
export async function browseCompanies(filters: CompanyFilters = {}, page = 1, limit = 20) {
    try {
        const skip = (page - 1) * limit

        const where: Record<string, unknown> = {}

        if (filters.search) {
            where.OR = [
                { name: { contains: filters.search, mode: "insensitive" } },
                { industry: { contains: filters.search, mode: "insensitive" } },
                { description: { contains: filters.search, mode: "insensitive" } }
            ]
        }

        if (filters.industry && filters.industry.length > 0) {
            where.industry = { in: filters.industry }
        }

        if (filters.companySize && filters.companySize.length > 0) {
            where.companySize = { in: filters.companySize }
        }

        const [companies, total] = await Promise.all([
            prisma.company.findMany({
                where,
                include: {
                    jobs: {
                        where: { status: "ACTIVE" },
                        select: { id: true }
                    },
                    interviewProcesses: {
                        where: { isActive: true },
                        select: { id: true }
                    }
                },
                orderBy: [
                    { verificationStatus: "asc" },
                    { name: "asc" }
                ],
                skip,
                take: limit
            }),
            prisma.company.count({ where })
        ])

        const formattedCompanies: CompanyListResult[] = companies.map(company => ({
            id: company.id,
            name: company.name,
            slug: company.slug,
            logoUrl: company.logoUrl,
            website: company.website,
            industry: company.industry,
            companySize: company.companySize,
            description: company.description,
            verificationStatus: company.verificationStatus,
            headquarters: company.headquarters,
            activeJobsCount: company.jobs.length,
            hasTransparentProcess: company.interviewProcesses.length > 0
        }))

        return {
            success: true,
            data: {
                companies: formattedCompanies,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            }
        }
    } catch (error) {
        console.error("Error browsing companies:", error)
        return { success: false, error: "Failed to fetch companies" }
    }
}

// Get a single company by slug
export async function getCompanyBySlug(slug: string) {
    try {
        const company = await prisma.company.findUnique({
            where: { slug }
        })

        if (!company) {
            return { success: false, error: "Company not found" }
        }

        // Parse social links from JSON
        const socialLinks = (company.socialLinks as Record<string, string> | null) || {}

        return {
            success: true,
            data: {
                id: company.id,
                name: company.name,
                slug: company.slug,
                logoUrl: company.logoUrl,
                website: company.website,
                industry: company.industry,
                companySize: company.companySize,
                description: company.description,
                verificationStatus: company.verificationStatus,
                headquarters: company.headquarters,
                foundedYear: company.foundedYear,
                linkedIn: socialLinks.linkedin || null,
                twitter: socialLinks.twitter || null,
                techStack: [],
                benefits: []
            }
        }
    } catch (error) {
        console.error("Error fetching company:", error)
        return { success: false, error: "Failed to fetch company" }
    }
}

// Get company interview processes
export async function getCompanyInterviewProcesses(slug: string) {
    try {
        const company = await prisma.company.findUnique({
            where: { slug },
            select: { id: true }
        })

        if (!company) {
            return { success: false, error: "Company not found" }
        }

        const processes = await prisma.interviewProcess.findMany({
            where: {
                companyId: company.id,
                isActive: true
            },
            include: {
                rounds: {
                    orderBy: { roundNumber: "asc" }
                }
            },
            orderBy: [
                { isDefault: "desc" },
                { createdAt: "asc" }
            ]
        })

        return {
            success: true,
            data: processes.map(process => ({
                id: process.id,
                name: process.name,
                description: process.description,
                estimatedDurationWeeks: process.estimatedDurationWeeks,
                isDefault: process.isDefault,
                rounds: process.rounds.map(round => ({
                    id: round.id,
                    roundNumber: round.roundNumber,
                    title: round.title,
                    roundType: round.roundType,
                    description: round.description,
                    duration: round.durationMinutes,
                    format: round.format,
                    hasMockInterview: round.hasMockInterview,
                    tipsForCandidates: round.tipsForCandidates
                }))
            }))
        }
    } catch (error) {
        console.error("Error fetching company interview processes:", error)
        return { success: false, error: "Failed to fetch interview processes" }
    }
}

// Get featured companies
export async function getFeaturedCompanies(limit = 6) {
    try {
        const companies = await prisma.company.findMany({
            where: {
                verificationStatus: "VERIFIED"
            },
            include: {
                jobs: {
                    where: { status: "ACTIVE" },
                    select: { id: true }
                },
                interviewProcesses: {
                    where: { isActive: true },
                    select: { id: true }
                }
            },
            orderBy: {
                createdAt: "desc"
            },
            take: limit
        })

        return {
            success: true,
            data: companies.map(company => ({
                id: company.id,
                name: company.name,
                slug: company.slug,
                logoUrl: company.logoUrl,
                website: company.website,
                industry: company.industry,
                companySize: company.companySize,
                description: company.description,
                verificationStatus: company.verificationStatus,
                headquarters: company.headquarters,
                activeJobsCount: company.jobs.length,
                hasTransparentProcess: company.interviewProcesses.length > 0
            }))
        }
    } catch (error) {
        console.error("Error fetching featured companies:", error)
        return { success: false, error: "Failed to fetch featured companies" }
    }
}

// Get company jobs
export async function getCompanyJobs(slug: string) {
    try {
        const company = await prisma.company.findUnique({
            where: { slug },
            select: { id: true }
        })

        if (!company) {
            return { success: false, error: "Company not found" }
        }

        const jobs = await prisma.job.findMany({
            where: {
                companyId: company.id,
                status: "ACTIVE",
                visibility: "PUBLIC"
            },
            select: {
                id: true,
                title: true,
                slug: true,
                location: true,
                locationType: true,
                employmentType: true,
                experienceMin: true,
                experienceMax: true,
                salaryMin: true,
                salaryMax: true,
                salaryCurrency: true,
                salaryDisclosed: true,
                skillsRequired: true,
                applicationsCount: true,
                publishedAt: true
            },
            orderBy: [
                { featured: "desc" },
                { publishedAt: "desc" }
            ]
        })

        return {
            success: true,
            data: jobs.map(job => ({
                ...job,
                skillsRequired: job.skillsRequired as string[]
            }))
        }
    } catch (error) {
        console.error("Error fetching company jobs:", error)
        return { success: false, error: "Failed to fetch company jobs" }
    }
}

// Follow a company
export async function followCompany(companyId: string) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: "Please sign in to follow companies" }
        }

        // Check if already following
        const existing = await prisma.companyFollower.findUnique({
            where: {
                userId_companyId: {
                    userId: session.user.id,
                    companyId
                }
            }
        })

        if (existing) {
            return { success: true, data: existing }
        }

        const follow = await prisma.companyFollower.create({
            data: {
                userId: session.user.id,
                companyId
            }
        })

        revalidatePath("/companies")
        return { success: true, data: follow }
    } catch (error) {
        console.error("Error following company:", error)
        return { success: false, error: "Failed to follow company" }
    }
}

// Unfollow a company
export async function unfollowCompany(companyId: string) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" }
        }

        await prisma.companyFollower.deleteMany({
            where: {
                userId: session.user.id,
                companyId
            }
        })

        revalidatePath("/companies")
        return { success: true }
    } catch (error) {
        console.error("Error unfollowing company:", error)
        return { success: false, error: "Failed to unfollow company" }
    }
}

// Get followed companies for current user
export async function getFollowedCompanies() {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" }
        }

        const follows = await prisma.companyFollower.findMany({
            where: { userId: session.user.id },
            include: {
                company: {
                    include: {
                        jobs: {
                            where: { status: "ACTIVE" },
                            select: { id: true }
                        },
                        interviewProcesses: {
                            where: { isActive: true },
                            select: { id: true }
                        }
                    }
                }
            },
            orderBy: { createdAt: "desc" }
        })

        return {
            success: true,
            data: follows.map(f => ({
                id: f.company.id,
                name: f.company.name,
                slug: f.company.slug,
                logoUrl: f.company.logoUrl,
                website: f.company.website,
                industry: f.company.industry,
                companySize: f.company.companySize,
                description: f.company.description,
                verificationStatus: f.company.verificationStatus,
                headquarters: f.company.headquarters,
                activeJobsCount: f.company.jobs.length,
                hasTransparentProcess: f.company.interviewProcesses.length > 0,
                followedAt: f.createdAt
            }))
        }
    } catch (error) {
        console.error("Error fetching followed companies:", error)
        return { success: false, error: "Failed to fetch followed companies" }
    }
}

// Check if user follows a company
export async function checkFollowStatus(companyId: string) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: true, data: { isFollowing: false } }
        }

        const follow = await prisma.companyFollower.findUnique({
            where: {
                userId_companyId: {
                    userId: session.user.id,
                    companyId
                }
            }
        })

        return { success: true, data: { isFollowing: !!follow } }
    } catch (error) {
        console.error("Error checking follow status:", error)
        return { success: false, error: "Failed to check follow status" }
    }
}

// Get followed company IDs for current user (for bulk checking)
export async function getFollowedCompanyIds() {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: true, data: [] }
        }

        const follows = await prisma.companyFollower.findMany({
            where: { userId: session.user.id },
            select: { companyId: true }
        })

        return { success: true, data: follows.map(f => f.companyId) }
    } catch (error) {
        console.error("Error fetching followed company IDs:", error)
        return { success: false, error: "Failed to fetch followed company IDs" }
    }
}