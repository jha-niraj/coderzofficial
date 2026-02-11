"use server"

import { prisma } from "@repo/prisma"
import { auth } from "@repo/auth"
import { revalidatePath } from "next/cache"
import type { CreateJobInput } from "@/types"

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
                locationType: input.locationType,
                employmentType: input.employmentType,
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
                customQuestions: JSON.parse(JSON.stringify(input.customQuestions || [])),
                visibility: input.visibility || "PUBLIC",
                status: input.status || "DRAFT"
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
                locationType: input.locationType,
                employmentType: input.employmentType,
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
                customQuestions: input.customQuestions ? JSON.parse(JSON.stringify(input.customQuestions)) : undefined,
                visibility: input.visibility,
                status: input.status
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
