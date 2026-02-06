"use server"

import { prisma } from "@repo/prisma"
import { auth } from "@repo/auth"

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

// Get overall job stats for the jobs page
export async function getOverallJobStats() {
    try {
        const member = await getUserCompany()
        if (!member) {
            return { success: false, error: "Unauthorized" }
        }

        const jobs = await prisma.job.findMany({
            where: { companyId: member.companyId },
            select: {
                status: true,
                viewsCount: true,
                applicationsCount: true
            }
        })

        const stats = jobs.reduce((acc, job) => {
            acc.total++
            acc.totalViews += job.viewsCount
            acc.totalApplications += job.applicationsCount

            switch (job.status) {
                case "ACTIVE":
                    acc.active++
                    break
                case "PAUSED":
                    acc.paused++
                    break
                case "DRAFT":
                    acc.draft++
                    break
                case "CLOSED":
                    acc.closed++
                    break
            }

            return acc
        }, {
            total: 0,
            active: 0,
            paused: 0,
            draft: 0,
            closed: 0,
            totalViews: 0,
            totalApplications: 0
        })

        return { success: true, data: stats }
    } catch (error) {
        console.error("Error fetching overall job stats:", error)
        return { success: false, error: "Failed to fetch stats" }
    }
}
