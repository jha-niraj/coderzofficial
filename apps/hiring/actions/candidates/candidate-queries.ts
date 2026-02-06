"use server"

import { prisma } from "@repo/prisma"
import { auth } from "@repo/auth"
import type { CandidateFilters } from "@/types"

// Re-export for backwards compatibility
export type { CandidateFilters } from "@/types"

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

// ============================================
// CANDIDATE QUERIES
// ============================================

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
                image: user?.image ?? null,
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
