"use server"

import { prisma } from "@repo/prisma"

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