// Jobs Actions - Server actions for job management (Hiring Platform)
"use server"

import { prisma } from "@repo/prisma"
import { auth } from "@repo/auth"
import { revalidatePath } from "next/cache"

// ============================================
// HELPERS
// ============================================

async function getUserCompany() {
    const session = await auth()
    if (!session?.user?.id) {
        return null
    }

    const member = await prisma.companyMember.findFirst({
        where: { userId: session.user.id },
        include: { company: true }
    })

    return member
}

function generateSlug(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') + '-' + Date.now().toString(36)
}

// ============================================
// JOB CRUD
// ============================================

export interface CreateJobInput {
    title: string
    description: string
    requirements?: string[]
    responsibilities?: string[]
    benefits?: string[]
    location?: string
    locationType: string
    employmentType: string
    experienceMin?: number
    experienceMax?: number
    salaryMin?: number
    salaryMax?: number
    salaryCurrency?: string
    salaryDisclosed?: boolean
    skillsRequired?: string[]
    skillsPreferred?: string[]
    hasAssignment?: boolean
    assignmentDetails?: {
        title: string
        description: string
        requirements: string[]
        resources: string[]
        deliverables: string[]
    }
    assignmentDeadlineDays?: number
    interviewProcessId?: string
    visibility?: string
    status?: string
}

export async function createJob(input: CreateJobInput) {
    try {
        const member = await getUserCompany()
        if (!member) {
            return { success: false, error: "Unauthorized" }
        }

        const slug = generateSlug(input.title)

        const job = await prisma.job.create({
            data: {
                companyId: member.companyId,
                postedById: member.id,
                title: input.title,
                slug,
                description: input.description,
                requirements: input.requirements || [],
                responsibilities: input.responsibilities || [],
                benefits: input.benefits || [],
                location: input.location,
                locationType: input.locationType as any,
                employmentType: input.employmentType as any,
                experienceMin: input.experienceMin,
                experienceMax: input.experienceMax,
                salaryMin: input.salaryMin,
                salaryMax: input.salaryMax,
                salaryCurrency: input.salaryCurrency || "INR",
                salaryDisclosed: input.salaryDisclosed ?? true,
                skillsRequired: input.skillsRequired || [],
                skillsPreferred: input.skillsPreferred || [],
                hasAssignment: input.hasAssignment || false,
                assignmentDetails: input.assignmentDetails,
                assignmentDeadlineDays: input.assignmentDeadlineDays,
                interviewProcessId: input.interviewProcessId,
                visibility: (input.visibility as any) || "PUBLIC",
                status: (input.status as any) || "DRAFT"
            }
        })

        revalidatePath("/jobs")
        return { success: true, data: job }
    } catch (error) {
        console.error("Error creating job:", error)
        return { success: false, error: "Failed to create job" }
    }
}

export async function updateJob(jobId: string, input: Partial<CreateJobInput>) {
    try {
        const member = await getUserCompany()
        if (!member) {
            return { success: false, error: "Unauthorized" }
        }

        // Verify job belongs to company
        const existingJob = await prisma.job.findFirst({
            where: { id: jobId, companyId: member.companyId }
        })

        if (!existingJob) {
            return { success: false, error: "Job not found" }
        }

        const job = await prisma.job.update({
            where: { id: jobId },
            data: {
                title: input.title,
                description: input.description,
                requirements: input.requirements,
                responsibilities: input.responsibilities,
                benefits: input.benefits,
                location: input.location,
                locationType: input.locationType as any,
                employmentType: input.employmentType as any,
                experienceMin: input.experienceMin,
                experienceMax: input.experienceMax,
                salaryMin: input.salaryMin,
                salaryMax: input.salaryMax,
                salaryCurrency: input.salaryCurrency,
                salaryDisclosed: input.salaryDisclosed,
                skillsRequired: input.skillsRequired,
                skillsPreferred: input.skillsPreferred,
                hasAssignment: input.hasAssignment,
                assignmentDetails: input.assignmentDetails,
                assignmentDeadlineDays: input.assignmentDeadlineDays,
                interviewProcessId: input.interviewProcessId,
                visibility: input.visibility as any,
                status: input.status as any
            }
        })

        revalidatePath("/jobs")
        revalidatePath(`/jobs/${job.slug}`)
        return { success: true, data: job }
    } catch (error) {
        console.error("Error updating job:", error)
        return { success: false, error: "Failed to update job" }
    }
}

export async function getJobs(filters: {
    status?: string[]
    search?: string
} = {}) {
    try {
        const member = await getUserCompany()
        if (!member) {
            return { success: false, error: "Unauthorized" }
        }

        const where: Record<string, unknown> = {
            companyId: member.companyId
        }

        if (filters.status && filters.status.length > 0) {
            where.status = { in: filters.status }
        }

        if (filters.search) {
            where.OR = [
                { title: { contains: filters.search, mode: "insensitive" } },
                { description: { contains: filters.search, mode: "insensitive" } }
            ]
        }

        const jobs = await prisma.job.findMany({
            where,
            include: {
                interviewProcess: {
                    include: {
                        rounds: {
                            orderBy: { roundNumber: "asc" }
                        }
                    }
                },
                postedBy: {
                    select: {
                        displayName: true,
                        email: true
                    }
                },
                _count: {
                    select: {
                        applications: true
                    }
                }
            },
            orderBy: { createdAt: "desc" }
        })

        return { success: true, data: jobs }
    } catch (error) {
        console.error("Error fetching jobs:", error)
        return { success: false, error: "Failed to fetch jobs" }
    }
}

export async function getJobById(jobId: string) {
    try {
        const member = await getUserCompany()
        if (!member) {
            return { success: false, error: "Unauthorized" }
        }

        const job = await prisma.job.findFirst({
            where: { id: jobId, companyId: member.companyId },
            include: {
                interviewProcess: {
                    include: {
                        rounds: {
                            orderBy: { roundNumber: "asc" }
                        }
                    }
                },
                postedBy: {
                    select: {
                        displayName: true,
                        email: true
                    }
                },
                _count: {
                    select: {
                        applications: true
                    }
                }
            }
        })

        if (!job) {
            return { success: false, error: "Job not found" }
        }

        return { success: true, data: job }
    } catch (error) {
        console.error("Error fetching job:", error)
        return { success: false, error: "Failed to fetch job" }
    }
}

export async function getJobBySlug(slug: string) {
    try {
        const member = await getUserCompany()
        if (!member) {
            return { success: false, error: "Unauthorized" }
        }

        const job = await prisma.job.findFirst({
            where: { slug, companyId: member.companyId },
            include: {
                interviewProcess: {
                    include: {
                        rounds: {
                            orderBy: { roundNumber: "asc" }
                        }
                    }
                },
                postedBy: {
                    select: {
                        displayName: true,
                        email: true
                    }
                },
                _count: {
                    select: {
                        applications: true
                    }
                }
            }
        })

        if (!job) {
            return { success: false, error: "Job not found" }
        }

        return { success: true, data: job }
    } catch (error) {
        console.error("Error fetching job:", error)
        return { success: false, error: "Failed to fetch job" }
    }
}

// ============================================
// JOB STATUS MANAGEMENT
// ============================================

export async function publishJob(jobId: string) {
    try {
        const member = await getUserCompany()
        if (!member) {
            return { success: false, error: "Unauthorized" }
        }

        await prisma.job.updateMany({
            where: { id: jobId, companyId: member.companyId },
            data: {
                status: "ACTIVE",
                publishedAt: new Date()
            }
        })

        revalidatePath("/jobs")
        return { success: true }
    } catch (error) {
        console.error("Error publishing job:", error)
        return { success: false, error: "Failed to publish job" }
    }
}

export async function pauseJob(jobId: string) {
    try {
        const member = await getUserCompany()
        if (!member) {
            return { success: false, error: "Unauthorized" }
        }

        await prisma.job.updateMany({
            where: { id: jobId, companyId: member.companyId },
            data: { status: "PAUSED" }
        })

        revalidatePath("/jobs")
        return { success: true }
    } catch (error) {
        console.error("Error pausing job:", error)
        return { success: false, error: "Failed to pause job" }
    }
}

export async function closeJob(jobId: string) {
    try {
        const member = await getUserCompany()
        if (!member) {
            return { success: false, error: "Unauthorized" }
        }

        await prisma.job.updateMany({
            where: { id: jobId, companyId: member.companyId },
            data: { status: "CLOSED" }
        })

        revalidatePath("/jobs")
        return { success: true }
    } catch (error) {
        console.error("Error closing job:", error)
        return { success: false, error: "Failed to close job" }
    }
}

export async function duplicateJob(jobId: string) {
    try {
        const member = await getUserCompany()
        if (!member) {
            return { success: false, error: "Unauthorized" }
        }

        const originalJob = await prisma.job.findFirst({
            where: { id: jobId, companyId: member.companyId }
        })

        if (!originalJob) {
            return { success: false, error: "Job not found" }
        }

        const newSlug = generateSlug(originalJob.title + " Copy")

        const newJob = await prisma.job.create({
            data: {
                companyId: member.companyId,
                postedById: member.id,
                title: originalJob.title + " (Copy)",
                slug: newSlug,
                description: originalJob.description,
                requirements: originalJob.requirements as any,
                responsibilities: originalJob.responsibilities as any,
                benefits: originalJob.benefits as any,
                location: originalJob.location,
                locationType: originalJob.locationType,
                employmentType: originalJob.employmentType,
                experienceMin: originalJob.experienceMin,
                experienceMax: originalJob.experienceMax,
                salaryMin: originalJob.salaryMin,
                salaryMax: originalJob.salaryMax,
                salaryCurrency: originalJob.salaryCurrency,
                salaryDisclosed: originalJob.salaryDisclosed,
                skillsRequired: originalJob.skillsRequired as any,
                skillsPreferred: originalJob.skillsPreferred as any,
                hasAssignment: originalJob.hasAssignment,
                assignmentDetails: originalJob.assignmentDetails as any,
                assignmentDeadlineDays: originalJob.assignmentDeadlineDays,
                interviewProcessId: originalJob.interviewProcessId,
                visibility: originalJob.visibility,
                status: "DRAFT"
            }
        })

        revalidatePath("/jobs")
        return { success: true, data: newJob }
    } catch (error) {
        console.error("Error duplicating job:", error)
        return { success: false, error: "Failed to duplicate job" }
    }
}

export async function deleteJob(jobId: string) {
    try {
        const member = await getUserCompany()
        if (!member) {
            return { success: false, error: "Unauthorized" }
        }

        await prisma.job.deleteMany({
            where: { id: jobId, companyId: member.companyId }
        })

        revalidatePath("/jobs")
        return { success: true }
    } catch (error) {
        console.error("Error deleting job:", error)
        return { success: false, error: "Failed to delete job" }
    }
}

// ============================================
// JOB ANALYTICS
// ============================================

export async function getJobStats(jobId: string) {
    try {
        const member = await getUserCompany()
        if (!member) {
            return { success: false, error: "Unauthorized" }
        }

        const job = await prisma.job.findFirst({
            where: { id: jobId, companyId: member.companyId },
            select: {
                id: true,
                title: true,
                viewsCount: true,
                applicationsCount: true,
                applications: {
                    select: {
                        status: true
                    }
                }
            }
        })

        if (!job) {
            return { success: false, error: "Job not found" }
        }

        // Calculate status breakdown
        const statusCounts = job.applications.reduce((acc, app) => {
            acc[app.status] = (acc[app.status] || 0) + 1
            return acc
        }, {} as Record<string, number>)

        return {
            success: true,
            data: {
                views: job.viewsCount,
                totalApplications: job.applications.length,
                conversionRate: job.viewsCount > 0 
                    ? ((job.applications.length / job.viewsCount) * 100).toFixed(1)
                    : 0,
                statusBreakdown: statusCounts
            }
        }
    } catch (error) {
        console.error("Error fetching job stats:", error)
        return { success: false, error: "Failed to fetch job stats" }
    }
}

export async function getJobsOverview() {
    try {
        const member = await getUserCompany()
        if (!member) {
            return { success: false, error: "Unauthorized" }
        }

        const [totalJobs, activeJobs, totalApplications, recentApplications] = await Promise.all([
            prisma.job.count({ where: { companyId: member.companyId } }),
            prisma.job.count({ where: { companyId: member.companyId, status: "ACTIVE" } }),
            prisma.jobApplication.count({
                where: { job: { companyId: member.companyId } }
            }),
            prisma.jobApplication.count({
                where: {
                    job: { companyId: member.companyId },
                    createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
                }
            })
        ])

        return {
            success: true,
            data: {
                totalJobs,
                activeJobs,
                totalApplications,
                recentApplications
            }
        }
    } catch (error) {
        console.error("Error fetching jobs overview:", error)
        return { success: false, error: "Failed to fetch overview" }
    }
}