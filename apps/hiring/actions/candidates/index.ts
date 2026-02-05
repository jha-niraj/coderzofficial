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

        // Fetch user info separately since User is in a different schema
        const userIds = [...new Set(applications.map(app => app.userId))]
        const users = await prisma.user.findMany({
            where: { id: { in: userIds } },
            select: {
                id: true,
                name: true,
                email: true,
                image: true
            }
        })
        const userMap = new Map(users.map(u => [u.id, u]))

        // Format for UI
        const candidates = applications.map(app => {
            const user = userMap.get(app.userId)
            return {
                id: app.id,
                applicationId: app.id,
                userId: app.userId,
                name: user?.name || "Unknown",
                email: user?.email || "",
                image: user?.image,
                jobId: app.jobId,
                jobTitle: app.job.title,
                jobSlug: app.job.slug,
                status: app.status,
                appliedAt: app.appliedAt || app.createdAt,
                matchScore: app.matchScore,
                currentStage: app.currentStage,
                resumeUrl: app.resumeUrl,
                coverLetter: app.coverLetter
            }
        })

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

        // Fetch user info separately
        const user = await prisma.user.findUnique({
            where: { id: application.userId },
            select: {
                id: true,
                name: true,
                email: true,
                image: true
            }
        })

        return { 
            success: true, 
            data: {
                ...application,
                user
            }
        }
    } catch (error) {
        console.error("Error fetching candidate details:", error)
        return { success: false, error: "Failed to fetch candidate details" }
    }
}

// Update candidate status
export async function updateCandidateStatus(
    applicationId: string, 
    newStatus: "INTERESTED" | "PREPARING" | "APPLIED" | "UNDER_REVIEW" | "SHORTLISTED" | "ASSIGNMENT_SENT" | "ASSIGNMENT_SUBMITTED" | "INTERVIEW_SCHEDULED" | "INTERVIEWED" | "OFFER_EXTENDED" | "HIRED" | "REJECTED" | "WITHDRAWN", 
    notes?: string
) {
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
                reviewedById: member.id,
                reviewedAt: new Date(),
                hrNotes: notes || undefined
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

// Submit assignment for an application
export async function submitAssignment(applicationId: string, submission: {
    codeSubmission?: string
    codeLanguage?: string
    submissionUrl?: string
    score?: number
    feedback?: string
}) {
    try {
        const member = await getUserCompany()
        if (!member) {
            return { success: false, error: "Unauthorized" }
        }

        const application = await prisma.jobApplication.findFirst({
            where: {
                id: applicationId,
                job: { companyId: member.companyId }
            }
        })

        if (!application) {
            return { success: false, error: "Application not found" }
        }

        const updated = await prisma.jobApplication.update({
            where: { id: applicationId },
            data: {
                assignmentSubmittedAt: new Date(),
                assignmentScore: submission.score ?? undefined,
                assignmentFeedback: submission.feedback ?? undefined,
                status: "ASSIGNMENT_SUBMITTED",
                activities: {
                    create: {
                        action: "ASSIGNMENT_SUBMISSION",
                        activityType: "ASSIGNMENT_SUBMISSION" as any,
                        description: "Candidate submitted assignment",
                        userId: application.userId,
                        metadata: {
                            submissionUrl: submission.submissionUrl,
                            codeLanguage: submission.codeLanguage
                        }
                    }
                }
            }
        })

        revalidatePath("/candidates")
        revalidatePath("/applications")

        return { success: true, data: updated }
    } catch (error) {
        console.error("Error submitting assignment:", error)
        return { success: false, error: "Failed to submit assignment" }
    }
}

// Update assignment progress (e.g., save incremental progress or studio link)
export async function updateAssignmentProgress(applicationId: string, progress: { notes?: string; percentComplete?: number; timeSpentMinutes?: number; submissionUrl?: string }) {
    try {
        const member = await getUserCompany()
        if (!member) return { success: false, error: "Unauthorized" }

        const application = await prisma.jobApplication.findFirst({ where: { id: applicationId, job: { companyId: member.companyId } } })
        if (!application) return { success: false, error: "Application not found" }

        await prisma.applicationActivity.create({
            data: {
                applicationId,
                userId: application.userId,
                activityType: "ASSIGNMENT_PROGRESS",
                description: progress.notes ?? "Assignment progress update",
                metadata: {
                    percentComplete: progress.percentComplete,
                    timeSpentMinutes: progress.timeSpentMinutes,
                    submissionUrl: progress.submissionUrl
                },
                completedAt: null
            }
        })

        revalidatePath("/candidates")

        return { success: true }
    } catch (error) {
        console.error("Error updating assignment progress:", error)
        return { success: false, error: "Failed to update assignment progress" }
    }
}

// Get interview preparation progress for an application
export async function getPrepProgress(applicationId: string) {
    try {
        const member = await getUserCompany()
        if (!member) return { success: false, error: "Unauthorized" }

        const progress = await prisma.interviewPrepProgress.findFirst({ where: { applicationId } })
        if (!progress) return { success: false, data: null }

        return { success: true, data: progress }
    } catch (error) {
        console.error("Error fetching prep progress:", error)
        return { success: false, error: "Failed to fetch prep progress" }
    }
}

// Upsert interview preparation progress
export async function upsertPrepProgress(applicationId: string, data: Partial<{
    overallReadinessScore: number
    roundsCompleted: number
    totalRounds: number
    lastPracticedAt: Date
    totalPracticeSessionsIncrement: number
    totalPracticeMinutesIncrement: number
    bestScores: any
    nextRecommendedRound: string
    recommendedResources: any
}>) {
    try {
        const member = await getUserCompany()
        if (!member) return { success: false, error: "Unauthorized" }

        const application = await prisma.jobApplication.findFirst({ where: { id: applicationId, job: { companyId: member.companyId } } })
        if (!application) return { success: false, error: "Application not found" }

        // Try to find existing
        const existing = await prisma.interviewPrepProgress.findFirst({ where: { applicationId } })
        if (existing) {
            const updated = await prisma.interviewPrepProgress.update({
                where: { id: existing.id },
                data: {
                    overallReadinessScore: data.overallReadinessScore ?? existing.overallReadinessScore,
                    roundsCompleted: data.roundsCompleted ?? existing.roundsCompleted,
                    totalRounds: data.totalRounds ?? existing.totalRounds,
                    lastPracticedAt: data.lastPracticedAt ?? existing.lastPracticedAt,
                    totalPracticeSessions: data.totalPracticeSessionsIncrement ? { increment: data.totalPracticeSessionsIncrement } : undefined,
                    totalPracticeMinutes: data.totalPracticeMinutesIncrement ? { increment: data.totalPracticeMinutesIncrement } : undefined,
                    bestScores: data.bestScores ?? existing.bestScores,
                    nextRecommendedRound: data.nextRecommendedRound ?? existing.nextRecommendedRound,
                    recommendedResources: data.recommendedResources ?? existing.recommendedResources
                }
            })

            return { success: true, data: updated }
        }

        // Create new
        const created = await prisma.interviewPrepProgress.create({
            data: {
                applicationId,
                userId: application.userId,
                overallReadinessScore: data.overallReadinessScore ?? 0,
                targetReadinessScore: 80,
                roundsCompleted: data.roundsCompleted ?? 0,
                totalRounds: data.totalRounds ?? 0,
                lastPracticedAt: data.lastPracticedAt,
                totalPracticeSessions: data.totalPracticeSessionsIncrement ?? 0,
                totalPracticeMinutes: data.totalPracticeMinutesIncrement ?? 0,
                bestScores: data.bestScores ?? undefined,
                nextRecommendedRound: data.nextRecommendedRound ?? undefined,
                recommendedResources: data.recommendedResources ?? undefined
            }
        })

        return { success: true, data: created }
    } catch (error) {
        console.error("Error upserting prep progress:", error)
        return { success: false, error: "Failed to upsert prep progress" }
    }
}