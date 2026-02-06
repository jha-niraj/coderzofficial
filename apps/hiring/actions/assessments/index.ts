// Assessments Actions - Server actions for assessment/assignment management
"use server"

import { prisma } from "@repo/prisma"
import { auth } from "@repo/auth"
import { revalidatePath } from "next/cache"
import type { 
    AssessmentStats, 
    AssignmentDetails,
    ScoreAssignmentInput 
} from "@/types"

// Re-export types for consumers
export type { AssessmentStats, AssignmentDetails, ScoreAssignmentInput }

// ============================================
// HELPERS
// ============================================

async function getCompanyMember() {
    const session = await auth()
    if (!session?.user?.id) {
        throw new Error("Unauthorized")
    }

    const member = await prisma.companyMember.findFirst({
        where: { userId: session.user.id },
        include: { company: true }
    })

    if (!member) {
        throw new Error("Not a company member")
    }

    return member
}

// ============================================
// GET ASSESSMENT STATS
// ============================================

export async function getAssessmentStats() {
    try {
        const member = await getCompanyMember()

        // Jobs with assignments enabled
        const jobsWithAssessments = await prisma.job.count({
            where: {
                companyId: member.companyId,
                hasAssignment: true
            }
        })

        // Applications with assignments sent
        const assignmentsSent = await prisma.jobApplication.count({
            where: {
                job: { companyId: member.companyId },
                status: { in: ["ASSIGNMENT_SENT", "ASSIGNMENT_SUBMITTED"] }
            }
        })

        // Submitted assignments
        const submissions = await prisma.jobApplication.count({
            where: {
                job: { companyId: member.companyId },
                status: "ASSIGNMENT_SUBMITTED"
            }
        })

        // Pending review (submitted but not scored)
        const pendingReview = await prisma.jobApplication.count({
            where: {
                job: { companyId: member.companyId },
                status: "ASSIGNMENT_SUBMITTED",
                assignmentScore: null
            }
        })

        // Average score
        const avgScore = await prisma.jobApplication.aggregate({
            where: {
                job: { companyId: member.companyId },
                assignmentScore: { not: null }
            },
            _avg: { assignmentScore: true }
        })

        return {
            success: true,
            data: {
                totalJobsWithAssessments: jobsWithAssessments,
                totalAssignmentsSent: assignmentsSent,
                totalSubmissions: submissions,
                pendingReview,
                averageScore: avgScore._avg.assignmentScore || 0
            } as AssessmentStats
        }
    } catch (error) {
        console.error("Error fetching assessment stats:", error)
        return { success: false, error: "Failed to fetch assessment stats" }
    }
}

// ============================================
// GET JOBS WITH ASSESSMENTS
// ============================================

export async function getJobsWithAssessments() {
    try {
        const member = await getCompanyMember()

        const jobs = await prisma.job.findMany({
            where: {
                companyId: member.companyId,
                hasAssignment: true
            },
            select: {
                id: true,
                title: true,
                slug: true,
                status: true,
                assignmentDetails: true,
                assignmentDeadlineDays: true,
                assignmentInstructions: true,
                _count: {
                    select: {
                        applications: {
                            where: {
                                status: { in: ["ASSIGNMENT_SENT", "ASSIGNMENT_SUBMITTED"] }
                            }
                        }
                    }
                }
            },
            orderBy: { createdAt: "desc" }
        })

        // Get submission stats for each job
        const jobsWithStats = await Promise.all(jobs.map(async (job) => {
            const submissions = await prisma.jobApplication.count({
                where: {
                    jobId: job.id,
                    status: "ASSIGNMENT_SUBMITTED"
                }
            })

            const pending = await prisma.jobApplication.count({
                where: {
                    jobId: job.id,
                    status: "ASSIGNMENT_SENT"
                }
            })

            return {
                ...job,
                assignmentsSent: job._count.applications,
                submissionsReceived: submissions,
                pendingSubmissions: pending
            }
        }))

        return { success: true, data: jobsWithStats }
    } catch (error) {
        console.error("Error fetching jobs with assessments:", error)
        return { success: false, error: "Failed to fetch jobs" }
    }
}

// ============================================
// GET JOB ASSESSMENT DETAILS
// ============================================

export async function getJobAssessmentDetails(jobSlug: string) {
    try {
        const member = await getCompanyMember()

        const job = await prisma.job.findFirst({
            where: {
                slug: jobSlug,
                companyId: member.companyId
            },
            include: {
                applications: {
                    where: {
                        status: { in: ["ASSIGNMENT_SENT", "ASSIGNMENT_SUBMITTED", "SHORTLISTED"] }
                    },
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                image: true
                            }
                        }
                    },
                    orderBy: { createdAt: "desc" }
                }
            }
        })

        if (!job) {
            return { success: false, error: "Job not found" }
        }

        return { success: true, data: job }
    } catch (error) {
        console.error("Error fetching job assessment details:", error)
        return { success: false, error: "Failed to fetch job details" }
    }
}

// ============================================
// UPDATE JOB ASSIGNMENT
// ============================================

export async function updateJobAssignment(
    jobId: string,
    data: {
        assignmentDetails?: AssignmentDetails
        assignmentInstructions?: string
        assignmentDeadlineDays?: number
    }
) {
    try {
        const member = await getCompanyMember()

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
                hasAssignment: true,
                assignmentDetails: data.assignmentDetails as unknown as undefined,
                assignmentInstructions: data.assignmentInstructions,
                assignmentDeadlineDays: data.assignmentDeadlineDays
            }
        })

        revalidatePath("/assessments")
        revalidatePath(`/assessments/${job.slug}`)
        return { success: true, data: job }
    } catch (error) {
        console.error("Error updating job assignment:", error)
        return { success: false, error: "Failed to update assignment" }
    }
}

// ============================================
// SEND ASSIGNMENT TO CANDIDATE
// ============================================

export async function sendAssignmentToCandidate(applicationId: string) {
    try {
        const member = await getCompanyMember()

        // Verify application belongs to company's job
        const application = await prisma.jobApplication.findFirst({
            where: {
                id: applicationId,
                job: { companyId: member.companyId }
            },
            include: {
                job: true,
                user: true
            }
        })

        if (!application) {
            return { success: false, error: "Application not found" }
        }

        if (!application.job.hasAssignment) {
            return { success: false, error: "Job does not have an assignment" }
        }

        // Update application status
        const updated = await prisma.jobApplication.update({
            where: { id: applicationId },
            data: {
                status: "ASSIGNMENT_SENT",
                assignmentStartedAt: new Date()
            }
        })

        // TODO: Send email notification to candidate

        revalidatePath("/assessments")
        revalidatePath("/applications")
        return { success: true, data: updated }
    } catch (error) {
        console.error("Error sending assignment:", error)
        return { success: false, error: "Failed to send assignment" }
    }
}

// ============================================
// SCORE ASSIGNMENT SUBMISSION
// ============================================

export async function scoreAssignment(
    applicationId: string,
    data: {
        score: number
        feedback: string
    }
) {
    try {
        const member = await getCompanyMember()

        // Verify application belongs to company's job
        const application = await prisma.jobApplication.findFirst({
            where: {
                id: applicationId,
                job: { companyId: member.companyId },
                status: "ASSIGNMENT_SUBMITTED"
            }
        })

        if (!application) {
            return { success: false, error: "Application not found or not submitted" }
        }

        const updated = await prisma.jobApplication.update({
            where: { id: applicationId },
            data: {
                assignmentScore: data.score,
                assignmentFeedback: data.feedback
            }
        })

        // TODO: Send email notification to candidate with results

        revalidatePath("/assessments")
        revalidatePath("/applications")
        return { success: true, data: updated }
    } catch (error) {
        console.error("Error scoring assignment:", error)
        return { success: false, error: "Failed to score assignment" }
    }
}

// ============================================
// GET ASSIGNMENT SUBMISSIONS
// ============================================

export async function getAssignmentSubmissions(jobSlug?: string) {
    try {
        const member = await getCompanyMember()

        const where: Record<string, unknown> = {
            job: { companyId: member.companyId },
            status: "ASSIGNMENT_SUBMITTED"
        }

        if (jobSlug) {
            where.job = { ...where.job as object, slug: jobSlug }
        }

        const submissions = await prisma.jobApplication.findMany({
            where,
            include: {
                job: {
                    select: {
                        id: true,
                        title: true,
                        slug: true,
                        assignmentDetails: true,
                        assignmentDeadlineDays: true
                    }
                },
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true
                    }
                }
            },
            orderBy: { assignmentSubmittedAt: "desc" }
        })

        return { success: true, data: submissions }
    } catch (error) {
        console.error("Error fetching submissions:", error)
        return { success: false, error: "Failed to fetch submissions" }
    }
}

