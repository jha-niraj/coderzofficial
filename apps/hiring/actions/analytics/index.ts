// Analytics Actions - Server actions for analytics/reporting
"use server"

import { prisma } from "@repo/prisma"
import { auth } from "@repo/auth"

async function getUserCompany() {
    const session = await auth()
    if (!session?.user?.id) return null

    const member = await prisma.companyMember.findFirst({
        where: { userId: session.user.id },
        include: { company: true }
    })
    return member
}

// Get comprehensive analytics data
export async function getAnalyticsOverview() {
    try {
        const member = await getUserCompany()
        if (!member) return { success: false, error: "Unauthorized" }

        const now = new Date()
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)

        const [
            totalJobs,
            activeJobs,
            totalApplications,
            recentApplications,
            previousPeriodApplications,
            hiredCount,
            rejectedCount,
            viewsSum,
            interviewsScheduled
        ] = await Promise.all([
            prisma.job.count({ where: { companyId: member.companyId } }),
            prisma.job.count({ where: { companyId: member.companyId, status: "ACTIVE" } }),
            prisma.jobApplication.count({ where: { job: { companyId: member.companyId } } }),
            prisma.jobApplication.count({
                where: {
                    job: { companyId: member.companyId },
                    createdAt: { gte: thirtyDaysAgo }
                }
            }),
            prisma.jobApplication.count({
                where: {
                    job: { companyId: member.companyId },
                    createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo }
                }
            }),
            prisma.jobApplication.count({
                where: { job: { companyId: member.companyId }, status: "HIRED" }
            }),
            prisma.jobApplication.count({
                where: { job: { companyId: member.companyId }, status: "REJECTED" }
            }),
            prisma.job.aggregate({
                where: { companyId: member.companyId },
                _sum: { viewsCount: true }
            }),
            prisma.jobApplication.count({
                where: {
                    job: { companyId: member.companyId },
                    status: { in: ["INTERVIEW_SCHEDULED", "INTERVIEWED"] }
                }
            })
        ])

        const applicationChange = previousPeriodApplications > 0
            ? Math.round(((recentApplications - previousPeriodApplications) / previousPeriodApplications) * 100)
            : recentApplications > 0 ? 100 : 0

        const pipelineData = await prisma.jobApplication.groupBy({
            by: ["status"],
            where: { job: { companyId: member.companyId } },
            _count: true
        })

        const pipeline = {
            applied: pipelineData.find(p => p.status === "APPLIED")?._count || 0,
            reviewing: pipelineData.find(p => p.status === "UNDER_REVIEW")?._count || 0,
            shortlisted: pipelineData.find(p => p.status === "SHORTLISTED")?._count || 0,
            interviewing: pipelineData.filter(p => ["INTERVIEW_SCHEDULED", "INTERVIEWED"].includes(p.status)).reduce((a, b) => a + b._count, 0),
            offered: pipelineData.find(p => p.status === "OFFER_EXTENDED")?._count || 0,
            hired: hiredCount,
            rejected: rejectedCount
        }

        const topJobs = await prisma.job.findMany({
            where: { companyId: member.companyId },
            select: {
                id: true,
                title: true,
                slug: true,
                viewsCount: true,
                applicationsCount: true,
                status: true,
                createdAt: true
            },
            orderBy: { applicationsCount: "desc" },
            take: 5
        })

        const hiredApplications = await prisma.jobApplication.findMany({
            where: {
                job: { companyId: member.companyId },
                status: "HIRED",
                appliedAt: { not: null }
            },
            select: { appliedAt: true, updatedAt: true }
        })

        let avgTimeToHire = 0
        if (hiredApplications.length > 0) {
            const totalDays = hiredApplications.reduce((sum, app) => {
                if (app.appliedAt) {
                    const days = Math.ceil((app.updatedAt.getTime() - app.appliedAt.getTime()) / (1000 * 60 * 60 * 24))
                    return sum + days
                }
                return sum
            }, 0)
            avgTimeToHire = Math.round(totalDays / hiredApplications.length)
        }

        return {
            success: true,
            data: {
                overview: {
                    totalJobs,
                    activeJobs,
                    totalApplications,
                    recentApplications,
                    applicationChange,
                    totalViews: viewsSum._sum.viewsCount || 0,
                    hiredCount,
                    interviewsScheduled,
                    avgTimeToHire: `${avgTimeToHire}d`,
                    conversionRate: totalApplications > 0 
                        ? Math.round((hiredCount / totalApplications) * 100) 
                        : 0
                },
                pipeline,
                topJobs
            }
        }
    } catch (error) {
        console.error("Error fetching analytics:", error)
        return { success: false, error: "Failed to fetch analytics" }
    }
}

// Get recruiter performance
export async function getRecruiterPerformance() {
    try {
        const member = await getUserCompany()
        if (!member) return { success: false, error: "Unauthorized" }

        const members = await prisma.companyMember.findMany({
            where: { companyId: member.companyId },
            include: {
                _count: {
                    select: {
                        postedJobs: true,
                        reviewedApplications: true
                    }
                }
            }
        })

        const performance = members.map(m => ({
            id: m.id,
            name: m.displayName || m.email.split("@")[0] || "Unknown",
            image: null, // CompanyMember doesn't store image, would need separate User lookup
            role: m.role,
            jobsPosted: m._count.postedJobs,
            applicationsReviewed: m._count.reviewedApplications
        }))

        return { success: true, data: performance }
    } catch (error) {
        console.error("Error fetching recruiter performance:", error)
        return { success: false, error: "Failed to fetch performance data" }
    }
}