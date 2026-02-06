"use server"

import { prisma } from "@repo/prisma"
import { auth } from "@repo/auth"
import { revalidatePath } from "next/cache"
import type { 
    ApplicationStatus
} from "@/types"

// ============================================
// TYPES
// ============================================

export interface ApplicationStats {
    total: number
    new: number
    underReview: number
    shortlisted: number
    interviewing: number
    offered: number
    hired: number
    rejected: number
    thisWeek: number
}

export interface JobApplicationStats {
    jobId: string
    jobTitle: string
    jobSlug: string
    total: number
    new: number
    underReview: number
    shortlisted: number
    interviewing: number
    offered: number
    hired: number
    rejected: number
}

export interface ApplicationListItem {
    id: string
    jobId: string
    jobTitle: string
    jobSlug: string
    userId: string
    candidateName: string
    candidateEmail: string
    candidateImage: string | null
    candidatePhone: string | null
    status: ApplicationStatus
    appliedAt: Date | null
    matchScore: number | null
    currentStage: number | null
    resumeUrl: string | null
    coverLetter: string | null
    reviewedAt: Date | null
    reviewedBy: {
        id: string
        displayName: string | null
    } | null
}

export interface ApplicationDetail {
    id: string
    jobId: string
    userId: string
    status: ApplicationStatus
    currentStage: number | null
    candidate: {
        id: string
        name: string | null
        email: string
        image: string | null
        phone: string | null
        location: string | null
        bio: string | null
        headline: string | null
        linkedinUrl: string | null
        githubUrl: string | null
        portfolioUrl: string | null
        skills: string[]
    }
    job: {
        id: string
        title: string
        slug: string
        skillsRequired: string[]
        skillsPreferred: string[]
        experienceMin: number | null
        experienceMax: number | null
    }
    coverLetter: string | null
    resumeUrl: string | null
    matchScore: number | null
    appliedAt: Date | null
    assignmentProjectCloneId: string | null
    assignmentStartedAt: Date | null
    assignmentSubmittedAt: Date | null
    assignmentScore: number | null
    assignmentFeedback: string | null
    interviewId: string | null
    interviewScheduledAt: Date | null
    interviewCompletedAt: Date | null
    interviewFeedback: unknown
    reviewedById: string | null
    reviewedAt: Date | null
    rejectionReason: string | null
    hrNotes: string | null
    reviewedBy: {
        id: string
        displayName: string | null
        user: {
            name: string | null
            email: string
        }
    } | null
    createdAt: Date
    updatedAt: Date
}

export interface PaginatedApplications {
    applications: ApplicationListItem[]
    total: number
    page: number
    pageSize: number
    totalPages: number
}

export interface ApplicationFilters {
    search?: string
    status?: ApplicationStatus[]
    jobId?: string
    dateFrom?: Date
    dateTo?: Date
    minMatchScore?: number
    hasResume?: boolean
}

// ============================================
// HELPERS
// ============================================

async function getUserCompany() {
    const session = await auth()
    if (!session?.user?.id) return null

    const member = await prisma.companyMember.findFirst({
        where: { userId: session.user.id },
        include: { company: true }
    })
    return member
}

// ============================================
// GET APPLICATION STATS
// ============================================

export async function getApplicationStats(): Promise<{
    success: boolean
    data?: ApplicationStats
    error?: string
}> {
    try {
        const member = await getUserCompany()
        if (!member) return { success: false, error: "Unauthorized" }

        const companyJobs = await prisma.job.findMany({
            where: { companyId: member.companyId },
            select: { id: true }
        })
        const jobIds = companyJobs.map(j => j.id)

        if (jobIds.length === 0) {
            return {
                success: true,
                data: {
                    total: 0, new: 0, underReview: 0, shortlisted: 0,
                    interviewing: 0, offered: 0, hired: 0, rejected: 0, thisWeek: 0
                }
            }
        }

        const [
            total, newApps, underReview, shortlisted,
            interviewScheduled, interviewed, offered, hired, rejected, thisWeek
        ] = await Promise.all([
            prisma.jobApplication.count({ where: { jobId: { in: jobIds } } }),
            prisma.jobApplication.count({ where: { jobId: { in: jobIds }, status: "APPLIED" } }),
            prisma.jobApplication.count({ where: { jobId: { in: jobIds }, status: "UNDER_REVIEW" } }),
            prisma.jobApplication.count({ where: { jobId: { in: jobIds }, status: "SHORTLISTED" } }),
            prisma.jobApplication.count({ where: { jobId: { in: jobIds }, status: "INTERVIEW_SCHEDULED" } }),
            prisma.jobApplication.count({ where: { jobId: { in: jobIds }, status: "INTERVIEWED" } }),
            prisma.jobApplication.count({ where: { jobId: { in: jobIds }, status: "OFFER_EXTENDED" } }),
            prisma.jobApplication.count({ where: { jobId: { in: jobIds }, status: "HIRED" } }),
            prisma.jobApplication.count({ where: { jobId: { in: jobIds }, status: "REJECTED" } }),
            prisma.jobApplication.count({
                where: {
                    jobId: { in: jobIds },
                    appliedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
                }
            })
        ])

        return {
            success: true,
            data: {
                total,
                new: newApps,
                underReview,
                shortlisted,
                interviewing: interviewScheduled + interviewed,
                offered,
                hired,
                rejected,
                thisWeek
            }
        }
    } catch (error) {
        console.error("Get application stats error:", error)
        return { success: false, error: "Failed to fetch application stats" }
    }
}

// ============================================
// GET APPLICATIONS BY JOB (STATS)
// ============================================

export async function getJobApplicationStats(): Promise<{
    success: boolean
    data?: JobApplicationStats[]
    error?: string
}> {
    try {
        const member = await getUserCompany()
        if (!member) return { success: false, error: "Unauthorized" }

        const jobs = await prisma.job.findMany({
            where: { companyId: member.companyId },
            select: {
                id: true,
                title: true,
                slug: true,
                _count: { select: { applications: true } },
                applications: { select: { status: true } }
            },
            orderBy: { createdAt: "desc" }
        })

        const stats: JobApplicationStats[] = jobs.map(job => {
            const statuses = job.applications.map(a => a.status)
            return {
                jobId: job.id,
                jobTitle: job.title,
                jobSlug: job.slug,
                total: job._count.applications,
                new: statuses.filter(s => s === "APPLIED").length,
                underReview: statuses.filter(s => s === "UNDER_REVIEW").length,
                shortlisted: statuses.filter(s => s === "SHORTLISTED").length,
                interviewing: statuses.filter(s => s === "INTERVIEW_SCHEDULED" || s === "INTERVIEWED").length,
                offered: statuses.filter(s => s === "OFFER_EXTENDED").length,
                hired: statuses.filter(s => s === "HIRED").length,
                rejected: statuses.filter(s => s === "REJECTED").length
            }
        })

        return { success: true, data: stats }
    } catch (error) {
        console.error("Get job application stats error:", error)
        return { success: false, error: "Failed to fetch job application stats" }
    }
}

// ============================================
// GET APPLICATIONS (PAGINATED)
// ============================================

export async function getApplications(
    jobSlug?: string,
    page: number = 1,
    pageSize: number = 20,
    filters?: ApplicationFilters
): Promise<{
    success: boolean
    data?: PaginatedApplications
    error?: string
}> {
    try {
        const member = await getUserCompany()
        if (!member) return { success: false, error: "Unauthorized" }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const where: any = {
            job: { companyId: member.companyId }
        }

        if (jobSlug) {
            where.job.slug = jobSlug
        }

        if (filters?.status && filters.status.length > 0) {
            where.status = { in: filters.status }
        }

        if (filters?.jobId) {
            where.jobId = filters.jobId
        }

        if (filters?.search) {
            where.user = {
                OR: [
                    { name: { contains: filters.search, mode: "insensitive" } },
                    { email: { contains: filters.search, mode: "insensitive" } }
                ]
            }
        }

        if (filters?.dateFrom || filters?.dateTo) {
            where.appliedAt = {}
            if (filters.dateFrom) where.appliedAt.gte = filters.dateFrom
            if (filters.dateTo) where.appliedAt.lte = filters.dateTo
        }

        if (filters?.minMatchScore) {
            where.matchScore = { gte: filters.minMatchScore }
        }

        if (filters?.hasResume !== undefined) {
            where.resumeUrl = filters.hasResume ? { not: null } : null
        }

        const total = await prisma.jobApplication.count({ where })

        const applications = await prisma.jobApplication.findMany({
            where,
            include: {
                job: { select: { id: true, title: true, slug: true } },
                reviewedBy: { select: { id: true, displayName: true } }
            },
            orderBy: { appliedAt: "desc" },
            skip: (page - 1) * pageSize,
            take: pageSize
        })

        // Fetch users separately
        const userIds = [...new Set(applications.map(app => app.userId))]
        const users = await prisma.user.findMany({
            where: { id: { in: userIds } },
            select: { id: true, name: true, email: true, image: true, phone: true }
        })
        const userMap = new Map(users.map(u => [u.id, u]))

        const formattedApplications: ApplicationListItem[] = applications.map(app => {
            const user = userMap.get(app.userId)
            return {
                id: app.id,
                jobId: app.jobId,
                jobTitle: app.job.title,
                jobSlug: app.job.slug,
                userId: app.userId,
                candidateName: user?.name || "Unknown",
                candidateEmail: user?.email || "",
                candidateImage: user?.image ?? null,
                candidatePhone: user?.phone ?? null,
                status: app.status as ApplicationStatus,
                appliedAt: app.appliedAt,
                matchScore: app.matchScore,
                currentStage: app.currentStage,
                resumeUrl: app.resumeUrl,
                coverLetter: app.coverLetter,
                reviewedAt: app.reviewedAt,
                reviewedBy: app.reviewedBy
            }
        })

        return {
            success: true,
            data: {
                applications: formattedApplications,
                total,
                page,
                pageSize,
                totalPages: Math.ceil(total / pageSize)
            }
        }
    } catch (error) {
        console.error("Get applications error:", error)
        return { success: false, error: "Failed to fetch applications" }
    }
}

// ============================================
// GET APPLICATION DETAIL
// ============================================

export async function getApplicationDetail(applicationId: string): Promise<{
    success: boolean
    data?: ApplicationDetail
    error?: string
}> {
    try {
        const member = await getUserCompany()
        if (!member) return { success: false, error: "Unauthorized" }

        const application = await prisma.jobApplication.findFirst({
            where: {
                id: applicationId,
                job: { companyId: member.companyId }
            },
            include: {
                job: {
                    select: {
                        id: true, title: true, slug: true,
                        skillsRequired: true, skillsPreferred: true,
                        experienceMin: true, experienceMax: true
                    }
                },
                reviewedBy: {
                    select: {
                        id: true,
                        displayName: true,
                        user: { select: { name: true, email: true } }
                    }
                }
            }
        })

        if (!application) {
            return { success: false, error: "Application not found" }
        }

        // Fetch user with profile fields (User model has profile fields directly)
        const user = await prisma.user.findUnique({
            where: { id: application.userId },
            select: {
                id: true, 
                name: true, 
                email: true, 
                image: true, 
                phone: true,
                bio: true,
                location: true,
                website: true,
                socials: true,
                skills: {
                    select: {
                        name: true
                    }
                }
            }
        })

        if (!user) {
            return { success: false, error: "User not found" }
        }

        // Extract social links
        const socials = user.socials as { linkedinUrl?: string; githubUrl?: string; portfolioUrl?: string } | null

        const detail: ApplicationDetail = {
            id: application.id,
            jobId: application.jobId,
            userId: application.userId,
            status: application.status as ApplicationStatus,
            currentStage: application.currentStage,
            candidate: {
                id: user.id,
                name: user.name,
                email: user.email,
                image: user.image,
                phone: user.phone,
                location: user.location || null,
                bio: user.bio || null,
                headline: null, // User model doesn't have headline
                linkedinUrl: socials?.linkedinUrl || null,
                githubUrl: socials?.githubUrl || null,
                portfolioUrl: user.website || socials?.portfolioUrl || null,
                skills: user.skills?.map(s => s.name) || []
            },
            job: {
                id: application.job.id,
                title: application.job.title,
                slug: application.job.slug,
                skillsRequired: (application.job.skillsRequired as string[]) || [],
                skillsPreferred: (application.job.skillsPreferred as string[]) || [],
                experienceMin: application.job.experienceMin,
                experienceMax: application.job.experienceMax
            },
            coverLetter: application.coverLetter,
            resumeUrl: application.resumeUrl,
            matchScore: application.matchScore,
            appliedAt: application.appliedAt,
            assignmentProjectCloneId: application.assignmentProjectCloneId,
            assignmentStartedAt: application.assignmentStartedAt,
            assignmentSubmittedAt: application.assignmentSubmittedAt,
            assignmentScore: application.assignmentScore,
            assignmentFeedback: application.assignmentFeedback,
            interviewId: application.interviewId,
            interviewScheduledAt: application.interviewScheduledAt,
            interviewCompletedAt: application.interviewCompletedAt,
            interviewFeedback: application.interviewFeedback,
            reviewedById: application.reviewedById,
            reviewedAt: application.reviewedAt,
            rejectionReason: application.rejectionReason,
            hrNotes: application.hrNotes,
            reviewedBy: application.reviewedBy,
            createdAt: application.createdAt,
            updatedAt: application.updatedAt
        }

        return { success: true, data: detail }
    } catch (error) {
        console.error("Get application detail error:", error)
        return { success: false, error: "Failed to fetch application detail" }
    }
}

// ============================================
// UPDATE APPLICATION STATUS
// ============================================

export async function updateApplicationStatus(
    applicationId: string,
    status: ApplicationStatus,
    rejectionReason?: string,
    hrNotes?: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const member = await getUserCompany()
        if (!member) return { success: false, error: "Unauthorized" }

        const application = await prisma.jobApplication.findFirst({
            where: {
                id: applicationId,
                job: { companyId: member.companyId }
            }
        })

        if (!application) {
            return { success: false, error: "Application not found" }
        }

        await prisma.jobApplication.update({
            where: { id: applicationId },
            data: {
                status,
                rejectionReason: status === "REJECTED" ? rejectionReason : null,
                hrNotes: hrNotes || application.hrNotes,
                reviewedById: member.id,
                reviewedAt: new Date()
            }
        })

        revalidatePath("/applications")
        return { success: true }
    } catch (error) {
        console.error("Update application status error:", error)
        return { success: false, error: "Failed to update application status" }
    }
}

// ============================================
// REJECT APPLICATION
// ============================================

export async function rejectApplication(
    applicationId: string,
    rejectionReason: string
): Promise<{ success: boolean; error?: string }> {
    return updateApplicationStatus(applicationId, "REJECTED", rejectionReason)
}

// ============================================
// SHORTLIST APPLICATION
// ============================================

export async function shortlistApplication(
    applicationId: string,
    notes?: string
): Promise<{ success: boolean; error?: string }> {
    return updateApplicationStatus(applicationId, "SHORTLISTED", undefined, notes)
}

// ============================================
// SCHEDULE INTERVIEW
// ============================================

export async function scheduleInterview(
    applicationId: string,
    scheduledAt: Date,
    notes?: string
): Promise<{ success: boolean; interviewLink?: string; error?: string }> {
    try {
        const member = await getUserCompany()
        if (!member) return { success: false, error: "Unauthorized" }

        const application = await prisma.jobApplication.findFirst({
            where: {
                id: applicationId,
                job: { companyId: member.companyId }
            },
            include: { job: true }
        })

        if (!application) {
            return { success: false, error: "Application not found" }
        }

        const interviewId = `interview_${applicationId}_${Date.now()}`
        const interviewLink = `/interview/${interviewId}`

        await prisma.jobApplication.update({
            where: { id: applicationId },
            data: {
                status: "INTERVIEW_SCHEDULED",
                interviewId,
                interviewScheduledAt: scheduledAt,
                hrNotes: notes || application.hrNotes,
                reviewedById: member.id,
                reviewedAt: new Date()
            }
        })

        revalidatePath("/applications")
        return { success: true, interviewLink }
    } catch (error) {
        console.error("Schedule interview error:", error)
        return { success: false, error: "Failed to schedule interview" }
    }
}

// ============================================
// ADD HR NOTE
// ============================================

export async function addApplicationNote(
    applicationId: string,
    note: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const member = await getUserCompany()
        if (!member) return { success: false, error: "Unauthorized" }

        const application = await prisma.jobApplication.findFirst({
            where: {
                id: applicationId,
                job: { companyId: member.companyId }
            }
        })

        if (!application) {
            return { success: false, error: "Application not found" }
        }

        const timestamp = new Date().toISOString()
        const existingNotes = application.hrNotes || ""
        const newNote = `[${timestamp}] ${note}\n\n${existingNotes}`

        await prisma.jobApplication.update({
            where: { id: applicationId },
            data: {
                hrNotes: newNote,
                reviewedById: member.id,
                reviewedAt: new Date()
            }
        })

        revalidatePath("/applications")
        return { success: true }
    } catch (error) {
        console.error("Add application note error:", error)
        return { success: false, error: "Failed to add note" }
    }
}

// ============================================
// GET JOB BY SLUG
// ============================================

export async function getJobBySlug(slug: string): Promise<{
    success: boolean
    data?: {
        id: string
        title: string
        slug: string
        status: string
        applicationsCount: number
    }
    error?: string
}> {
    try {
        const member = await getUserCompany()
        if (!member) return { success: false, error: "Unauthorized" }

        const job = await prisma.job.findFirst({
            where: { slug, companyId: member.companyId },
            select: { id: true, title: true, slug: true, status: true, applicationsCount: true }
        })

        if (!job) {
            return { success: false, error: "Job not found" }
        }

        return { success: true, data: job }
    } catch (error) {
        console.error("Get job by slug error:", error)
        return { success: false, error: "Failed to fetch job" }
    }
}

// ============================================
// MAKE MESSAGE PROFESSIONAL (AI)
// ============================================

export async function makeMessageProfessional(
    message: string
): Promise<{ success: boolean; data?: string; error?: string }> {
    try {
        // For now, return a formatted version
        // TODO: Integrate with OpenAI
        const professional = `Dear Applicant,

Thank you for your interest in this position and for taking the time to apply.

${message}

We appreciate your understanding and wish you the best in your future endeavors.

Best regards,
The Hiring Team`

        return { success: true, data: professional }
    } catch (error) {
        console.error("Make message professional error:", error)
        return { success: false, error: "Failed to process message" }
    }
}