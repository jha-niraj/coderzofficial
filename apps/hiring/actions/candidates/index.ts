// Candidates Actions - Server actions for candidate management
"use server"

import { prisma } from "@repo/prisma"
import { auth } from "@repo/auth"
import { revalidatePath } from "next/cache"

// Get current user's company
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

export interface CandidateFilters {
    search?: string
    jobId?: string
    status?: string[]
    skills?: string[]
}

// Get all candidates (applicants) for the company
export async function getCandidates(filters: CandidateFilters = {}) {
    try {
        const member = await getUserCompany()
        if (!member) {
            return { success: false, error: "Unauthorized" }
        }

        const where: Record<string, unknown> = {
            job: {
                companyId: member.companyId
            }
        }

        if (filters.jobId) {
            where.jobId = filters.jobId
        }

        if (filters.status && filters.status.length > 0) {
            where.status = { in: filters.status }
        }

        const applications = await prisma.jobApplication.findMany({
            where,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true
                    }
                },
                job: {
                    select: {
                        id: true,
                        title: true,
                        slug: true
                    }
                }
            },
            orderBy: { createdAt: "desc" }
        })

        // Format for UI
        const candidates = applications.map(app => ({
            id: app.id,
            applicationId: app.id,
            userId: app.userId,
            name: app.user.name || "Unknown",
            email: app.user.email || "",
            image: app.user.image,
            jobId: app.jobId,
            jobTitle: app.job.title,
            jobSlug: app.job.slug,
            status: app.status,
            appliedAt: app.appliedAt || app.createdAt,
            matchScore: app.matchScore,
            currentStage: app.currentStage,
            resumeUrl: app.resumeUrl,
            coverLetter: app.coverLetter
        }))

        return { success: true, data: candidates }
    } catch (error) {
        console.error("Error fetching candidates:", error)
        return { success: false, error: "Failed to fetch candidates" }
    }
}

// Get single candidate details
export async function getCandidateDetails(applicationId: string) {
    try {
        const member = await getUserCompany()
        if (!member) {
            return { success: false, error: "Unauthorized" }
        }

        const application = await prisma.jobApplication.findFirst({
            where: {
                id: applicationId,
                job: {
                    companyId: member.companyId
                }
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true
                    }
                },
                job: {
                    include: {
                        interviewProcess: {
                            include: {
                                rounds: {
                                    orderBy: { roundNumber: "asc" }
                                }
                            }
                        }
                    }
                },
                activities: {
                    orderBy: { createdAt: "desc" },
                    take: 10
                }
            }
        })

        if (!application) {
            return { success: false, error: "Candidate not found" }
        }

        return { success: true, data: application }
    } catch (error) {
        console.error("Error fetching candidate details:", error)
        return { success: false, error: "Failed to fetch candidate details" }
    }
}

// Update candidate status
export async function updateCandidateStatus(applicationId: string, newStatus: string, notes?: string) {
    try {
        const member = await getUserCompany()
        if (!member) {
            return { success: false, error: "Unauthorized" }
        }

        // Verify this application belongs to our company
        const application = await prisma.jobApplication.findFirst({
            where: {
                id: applicationId,
                job: {
                    companyId: member.companyId
                }
            }
        })

        if (!application) {
            return { success: false, error: "Application not found" }
        }

        // Update application status
        const updated = await prisma.jobApplication.update({
            where: { id: applicationId },
            data: {
                status: newStatus,
                // Create activity log
                activities: {
                    create: {
                        action: "STATUS_CHANGED",
                        description: `Status changed to ${newStatus}`,
                        performedById: member.id,
                        metadata: notes ? { notes } : undefined
                    }
                }
            }
        })

        revalidatePath("/candidates")
        revalidatePath("/applications")

        return { success: true, data: updated }
    } catch (error) {
        console.error("Error updating candidate status:", error)
        return { success: false, error: "Failed to update status" }
    }
}

// Add note to candidate
export async function addCandidateNote(applicationId: string, note: string) {
    try {
        const member = await getUserCompany()
        if (!member) {
            return { success: false, error: "Unauthorized" }
        }

        // Verify this application belongs to our company
        const application = await prisma.jobApplication.findFirst({
            where: {
                id: applicationId,
                job: {
                    companyId: member.companyId
                }
            }
        })

        if (!application) {
            return { success: false, error: "Application not found" }
        }

        // Add note as activity
        await prisma.applicationActivity.create({
            data: {
                applicationId,
                action: "NOTE_ADDED",
                description: note,
                performedById: member.id
            }
        })

        revalidatePath("/candidates")

        return { success: true }
    } catch (error) {
        console.error("Error adding note:", error)
        return { success: false, error: "Failed to add note" }
    }
}

// Reject candidate with mandatory feedback
export async function rejectCandidate(applicationId: string, feedback: string, reason: string) {
    try {
        const member = await getUserCompany()
        if (!member) {
            return { success: false, error: "Unauthorized" }
        }

        if (!feedback || feedback.trim().length < 20) {
            return { success: false, error: "Feedback must be at least 20 characters" }
        }

        // Verify this application belongs to our company
        const application = await prisma.jobApplication.findFirst({
            where: {
                id: applicationId,
                job: {
                    companyId: member.companyId
                }
            }
        })

        if (!application) {
            return { success: false, error: "Application not found" }
        }

        // Update application with rejection
        const updated = await prisma.jobApplication.update({
            where: { id: applicationId },
            data: {
                status: "REJECTED",
                rejectionFeedback: feedback,
                rejectionReason: reason,
                rejectedAt: new Date(),
                activities: {
                    create: {
                        action: "REJECTED",
                        description: `Candidate rejected. Reason: ${reason}`,
                        performedById: member.id,
                        metadata: { feedback, reason }
                    }
                }
            }
        })

        revalidatePath("/candidates")
        revalidatePath("/applications")

        return { success: true, data: updated }
    } catch (error) {
        console.error("Error rejecting candidate:", error)
        return { success: false, error: "Failed to reject candidate" }
    }
}

// Get company's jobs for filter dropdown
export async function getCompanyJobsForFilter() {
    try {
        const member = await getUserCompany()
        if (!member) {
            return { success: false, error: "Unauthorized" }
        }

        const jobs = await prisma.job.findMany({
            where: { companyId: member.companyId },
            select: {
                id: true,
                title: true,
                status: true,
                applicationsCount: true
            },
            orderBy: { createdAt: "desc" }
        })

        return { success: true, data: jobs }
    } catch (error) {
        console.error("Error fetching jobs:", error)
        return { success: false, error: "Failed to fetch jobs" }
    }
}

// Get candidate statistics
export async function getCandidateStats() {
    try {
        const member = await getUserCompany()
        if (!member) {
            return { success: false, error: "Unauthorized" }
        }

        const applications = await prisma.jobApplication.findMany({
            where: {
                job: {
                    companyId: member.companyId
                }
            },
            select: {
                status: true,
                appliedAt: true,
                createdAt: true
            }
        })

        const now = new Date()
        const thisWeekStart = new Date(now.setDate(now.getDate() - now.getDay()))

        const stats = {
            total: applications.length,
            new: applications.filter(a => ["INTERESTED", "PREPARING", "APPLIED"].includes(a.status)).length,
            screening: applications.filter(a => ["UNDER_REVIEW", "SHORTLISTED"].includes(a.status)).length,
            interviewing: applications.filter(a => ["INTERVIEW_SCHEDULED", "INTERVIEWED"].includes(a.status)).length,
            offered: applications.filter(a => ["OFFER_EXTENDED"].includes(a.status)).length,
            hired: applications.filter(a => ["HIRED"].includes(a.status)).length,
            rejected: applications.filter(a => ["REJECTED"].includes(a.status)).length,
            thisWeek: applications.filter(a => {
                const date = a.appliedAt || a.createdAt
                return date >= thisWeekStart
            }).length
        }

        return { success: true, data: stats }
    } catch (error) {
        console.error("Error fetching stats:", error)
        return { success: false, error: "Failed to fetch stats" }
    }
}