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
                requirements: originalJob.requirements as string[],
                responsibilities: originalJob.responsibilities as string[],
                benefits: originalJob.benefits as string[],
                location: originalJob.location,
                locationType: originalJob.locationType,
                employmentType: originalJob.employmentType,
                experienceMin: originalJob.experienceMin,
                experienceMax: originalJob.experienceMax,
                salaryMin: originalJob.salaryMin,
                salaryMax: originalJob.salaryMax,
                salaryCurrency: originalJob.salaryCurrency,
                salaryDisclosed: originalJob.salaryDisclosed,
                skillsRequired: originalJob.skillsRequired as string[],
                skillsPreferred: originalJob.skillsPreferred as string[],
                hasAssignment: originalJob.hasAssignment,
                assignmentDetails: originalJob.assignmentDetails ?? undefined,
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
