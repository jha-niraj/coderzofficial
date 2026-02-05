"use server"

import { prisma } from "@repo/prisma"
import { auth } from "@repo/auth"

export interface JobFilters {
    search?: string
    locationType?: string[]
    employmentType?: string[]
    experienceLevel?: string
    companyId?: string
    skills?: string[]
    salaryMin?: number
    salaryMax?: number
}

export interface JobListResult {
    id: string
    title: string
    slug: string
    company: {
        id: string
        name: string
        logoUrl: string | null
        industry: string | null
    }
    location: string | null
    locationType: string
    employmentType: string
    experienceMin: number | null
    experienceMax: number | null
    salaryMin: number | null
    salaryMax: number | null
    salaryCurrency: string
    salaryDisclosed: boolean
    skillsRequired: string[]
    hasAssignment: boolean
    applicationsCount: number
    publishedAt: Date | null
    interviewProcess: {
        id: string
        name: string
        rounds: Array<{
            id: string
            roundNumber: number
            title: string
            roundType: string
            hasMockInterview: boolean
        }>
    } | null
}

// Browse all active jobs with filters
export async function browseJobs(filters: JobFilters = {}, page = 1, limit = 20) {
    try {
        const skip = (page - 1) * limit

        const where: Record<string, unknown> = {
            status: "ACTIVE",
            visibility: "PUBLIC"
        }

        if (filters.search) {
            where.OR = [
                { title: { contains: filters.search, mode: "insensitive" } },
                { description: { contains: filters.search, mode: "insensitive" } },
                { company: { name: { contains: filters.search, mode: "insensitive" } } }
            ]
        }

        if (filters.locationType && filters.locationType.length > 0) {
            where.locationType = { in: filters.locationType }
        }

        if (filters.employmentType && filters.employmentType.length > 0) {
            where.employmentType = { in: filters.employmentType }
        }

        if (filters.companyId) {
            where.companyId = filters.companyId
        }

        const [jobs, total] = await Promise.all([
            prisma.job.findMany({
                where,
                include: {
                    company: {
                        select: {
                            id: true,
                            name: true,
                            logoUrl: true,
                            industry: true
                        }
                    },
                    interviewProcess: {
                        select: {
                            id: true,
                            name: true,
                            estimatedDurationWeeks: true,
                            rounds: {
                                select: {
                                    id: true,
                                    roundNumber: true,
                                    title: true,
                                    roundType: true,
                                    hasMockInterview: true
                                },
                                orderBy: { roundNumber: "asc" }
                            }
                        }
                    }
                },
                orderBy: [
                    { featured: "desc" },
                    { publishedAt: "desc" }
                ],
                skip,
                take: limit
            }),
            prisma.job.count({ where })
        ])

        const formattedJobs: JobListResult[] = jobs.map(job => ({
            id: job.id,
            title: job.title,
            slug: job.slug,
            company: job.company,
            location: job.location,
            locationType: job.locationType,
            employmentType: job.employmentType,
            experienceMin: job.experienceMin,
            experienceMax: job.experienceMax,
            salaryMin: job.salaryMin,
            salaryMax: job.salaryMax,
            salaryCurrency: job.salaryCurrency,
            salaryDisclosed: job.salaryDisclosed,
            skillsRequired: job.skillsRequired as string[],
            hasAssignment: job.hasAssignment,
            applicationsCount: job.applicationsCount,
            publishedAt: job.publishedAt,
            interviewProcess: job.interviewProcess
        }))

        return {
            success: true,
            data: {
                jobs: formattedJobs,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            }
        }
    } catch (error) {
        console.error("Error browsing jobs:", error)
        return { success: false, error: "Failed to fetch jobs" }
    }
}

// Get a single job by slug
export async function getJobBySlug(slug: string) {
    try {
        const session = await auth()
        const userId = session?.user?.id

        const job = await prisma.job.findUnique({
            where: { slug },
            include: {
                company: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        logoUrl: true,
                        industry: true,
                        description: true,
                        website: true,
                        companySize: true,
                        headquarters: true,
                        verificationStatus: true
                    }
                },
                interviewProcess: {
                    include: {
                        rounds: {
                            orderBy: { roundNumber: "asc" }
                        }
                    }
                }
            }
        })

        if (!job || job.status !== "ACTIVE") {
            return { success: false, error: "Job not found" }
        }

        // Check if user has already applied
        let application = null
        let isSaved = false
        if (userId) {
            const [app, savedJob] = await Promise.all([
                prisma.jobApplication.findUnique({
                    where: {
                        jobId_userId: {
                            jobId: job.id,
                            userId
                        }
                    }
                }),
                prisma.savedJob.findUnique({
                    where: {
                        userId_jobId: {
                            userId,
                            jobId: job.id
                        }
                    }
                })
            ])
            application = app
            isSaved = !!savedJob
        }

        // Increment view count
        await prisma.job.update({
            where: { id: job.id },
            data: { viewsCount: { increment: 1 } }
        })

        // Parse JSON fields as arrays
        const parseJsonArray = (value: unknown): string[] => {
            if (!value) return []
            if (Array.isArray(value)) return value as string[]
            if (typeof value === "object") {
                // If it's an object with items array
                const obj = value as Record<string, unknown>
                if (Array.isArray(obj.items)) return obj.items as string[]
            }
            return []
        }

        // Format interview process to match expected interface
        const formattedInterviewProcess = job.interviewProcess ? {
            id: job.interviewProcess.id,
            name: job.interviewProcess.name,
            description: job.interviewProcess.description,
            estimatedDurationWeeks: job.interviewProcess.estimatedDurationWeeks,
            rounds: job.interviewProcess.rounds.map(round => ({
                id: round.id,
                roundNumber: round.roundNumber,
                title: round.title,
                roundType: round.roundType as string,
                description: round.description,
                durationMinutes: round.durationMinutes,
                format: round.format as string,
                hasMockInterview: round.hasMockInterview,
                tipsForCandidates: round.tipsForCandidates as string[] | null
            }))
        } : null

        return {
            success: true,
            data: {
                id: job.id,
                title: job.title,
                slug: job.slug,
                description: job.description,
                responsibilities: parseJsonArray(job.responsibilities),
                requirements: parseJsonArray(job.requirements),
                niceToHave: [],
                benefits: parseJsonArray(job.benefits),
                company: job.company,
                location: job.location,
                locationType: job.locationType,
                employmentType: job.employmentType,
                experienceMin: job.experienceMin,
                experienceMax: job.experienceMax,
                salaryMin: job.salaryMin,
                salaryMax: job.salaryMax,
                salaryCurrency: job.salaryCurrency,
                salaryDisclosed: job.salaryDisclosed,
                skillsRequired: job.skillsRequired as string[],
                hasAssignment: job.hasAssignment,
                applicationsCount: job.applicationsCount,
                publishedAt: job.publishedAt,
                interviewProcess: formattedInterviewProcess,
                isSaved,
                hasApplied: !!application,
                applicationStatus: application?.status || null
            }
        }
    } catch (error) {
        console.error("Error fetching job:", error)
        return { success: false, error: "Failed to fetch job" }
    }
}

// Get recommended jobs for the user
export async function getRecommendedJobs(limit = 10) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            // Return general featured jobs for unauthenticated users
            const jobs = await prisma.job.findMany({
                where: {
                    status: "ACTIVE",
                    visibility: "PUBLIC",
                    featured: true
                },
                include: {
                    company: {
                        select: {
                            id: true,
                            name: true,
                            logoUrl: true,
                            industry: true
                        }
                    },
                    interviewProcess: {
                        select: {
                            id: true,
                            name: true,
                            rounds: {
                                select: {
                                    id: true,
                                    roundNumber: true,
                                    title: true,
                                    roundType: true,
                                    hasMockInterview: true
                                },
                                orderBy: { roundNumber: "asc" }
                            }
                        }
                    }
                },
                take: limit
            })

            return { success: true, data: jobs }
        }

        // Get user's recommendations
        const recommendations = await prisma.jobRecommendation.findMany({
            where: {
                userId: session.user.id,
                isDismissed: false
            },
            include: {
                job: {
                    include: {
                        company: {
                            select: {
                                id: true,
                                name: true,
                                logoUrl: true,
                                industry: true
                            }
                        },
                        interviewProcess: {
                            select: {
                                id: true,
                                name: true,
                                rounds: {
                                    select: {
                                        id: true,
                                        roundNumber: true,
                                        title: true,
                                        roundType: true,
                                        hasMockInterview: true
                                    },
                                    orderBy: { roundNumber: "asc" }
                                }
                            }
                        }
                    }
                }
            },
            orderBy: { matchScore: "desc" },
            take: limit
        })

        const jobs = recommendations.map(r => ({
            ...r.job,
            matchScore: r.matchScore,
            matchReasons: r.matchReasons
        }))

        return { success: true, data: jobs }
    } catch (error) {
        console.error("Error fetching recommendations:", error)
        return { success: false, error: "Failed to fetch recommendations" }
    }
}

// Get jobs by company
export async function getJobsByCompany(companyId: string) {
    try {
        const jobs = await prisma.job.findMany({
            where: {
                companyId,
                status: "ACTIVE",
                visibility: "PUBLIC"
            },
            include: {
                interviewProcess: {
                    select: {
                        id: true,
                        name: true,
                        estimatedDurationWeeks: true,
                        rounds: {
                            select: {
                                id: true,
                                roundNumber: true,
                                title: true,
                                roundType: true,
                                hasMockInterview: true
                            },
                            orderBy: { roundNumber: "asc" }
                        }
                    }
                }
            },
            orderBy: { publishedAt: "desc" }
        })

        return { success: true, data: jobs }
    } catch (error) {
        console.error("Error fetching company jobs:", error)
        return { success: false, error: "Failed to fetch jobs" }
    }
}

// Save/unsave a job
export async function toggleSaveJob(jobId: string) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" }
        }

        const existingSave = await prisma.savedJob.findUnique({
            where: {
                userId_jobId: {
                    userId: session.user.id,
                    jobId
                }
            }
        })

        if (existingSave) {
            await prisma.savedJob.delete({
                where: { id: existingSave.id }
            })
            return { success: true, saved: false }
        } else {
            await prisma.savedJob.create({
                data: {
                    userId: session.user.id,
                    jobId
                }
            })
            return { success: true, saved: true }
        }
    } catch (error) {
        console.error("Error toggling save:", error)
        return { success: false, error: "Failed to save job" }
    }
}

// Get saved jobs
export async function getSavedJobs() {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" }
        }

        const savedJobs = await prisma.savedJob.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: "desc" }
        })

        if (savedJobs.length === 0) {
            return { success: true, data: [] }
        }

        // Get the jobs separately
        const jobIds = savedJobs.map(s => s.jobId)
        const jobs = await prisma.job.findMany({
            where: {
                id: { in: jobIds },
                status: "ACTIVE"
            },
            include: {
                company: {
                    select: {
                        id: true,
                        name: true,
                        logoUrl: true,
                        industry: true
                    }
                }
            }
        })

        // Match jobs with saved data
        const result = savedJobs
            .map(saved => {
                const job = jobs.find(j => j.id === saved.jobId)
                if (!job) return null
                return {
                    ...job,
                    savedAt: saved.createdAt,
                    notes: saved.notes
                }
            })
            .filter((job): job is NonNullable<typeof job> => job !== null)

        return { success: true, data: result }
    } catch (error) {
        console.error("Error fetching saved jobs:", error)
        return { success: false, error: "Failed to fetch saved jobs" }
    }
}

// Save a job
export async function saveJob(jobId: string) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" }
        }

        const existingSave = await prisma.savedJob.findUnique({
            where: {
                userId_jobId: {
                    userId: session.user.id,
                    jobId
                }
            }
        })

        if (existingSave) {
            return { success: true, message: "Already saved" }
        }

        await prisma.savedJob.create({
            data: {
                userId: session.user.id,
                jobId
            }
        })
        
        return { success: true }
    } catch (error) {
        console.error("Error saving job:", error)
        return { success: false, error: "Failed to save job" }
    }
}

// Unsave a job
export async function unsaveJob(jobId: string) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" }
        }

        await prisma.savedJob.deleteMany({
            where: {
                userId: session.user.id,
                jobId
            }
        })
        
        return { success: true }
    } catch (error) {
        console.error("Error unsaving job:", error)
        return { success: false, error: "Failed to unsave job" }
    }
}
