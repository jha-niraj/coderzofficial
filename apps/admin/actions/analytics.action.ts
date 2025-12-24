"use server"

import { prisma } from "@repo/prisma"
import { checkAdminAccess } from "./admin.action"

interface AdminResponse<T = unknown> {
    success: boolean
    data?: T
    error?: string
}

interface DateRange {
    from?: Date
    to?: Date
}

// Get overview statistics
export async function getOverviewStats(dateRange?: DateRange): Promise<AdminResponse<any>> {
    try {
        const { success, error } = await checkAdminAccess()
        if (!success) return { success: false, error }

        const now = new Date()
        const from = dateRange?.from || new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        const to = dateRange?.to || now

        const [
            totalUsers,
            newUsers,
            totalProjects,
            totalCredits,
            totalFeedback,
            activeCommunities,
        ] = await Promise.all([
            prisma.user.count(),
            prisma.user.count({ where: { createdAt: { gte: from, lte: to } } }),
            prisma.projects.count(),
            prisma.user.aggregate({ _sum: { credits: true } }),
            prisma.feedback.count({ where: { createdAt: { gte: from, lte: to } } }),
            prisma.community.count({ where: { createdAt: { lte: to } } }),
        ])

        return {
            success: true,
            data: {
                totalUsers,
                newUsers,
                totalProjects,
                totalCredits: totalCredits._sum.credits || 0,
                totalFeedback,
                activeCommunities,
                period: {
                    from: from.toISOString(),
                    to: to.toISOString(),
                },
            },
        }
    } catch (error) {
        console.error("Get overview stats error:", error)
        return { success: false, error: "Failed to fetch overview statistics" }
    }
}

// Get user growth statistics
export async function getUserGrowthStats(dateRange?: DateRange): Promise<AdminResponse<any>> {
    try {
        const { success, error } = await checkAdminAccess()
        if (!success) return { success: false, error }

        const now = new Date()
        const from = dateRange?.from || new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        const to = dateRange?.to || now

        // Get daily user registrations
        const users = await prisma.user.findMany({
            where: { createdAt: { gte: from, lte: to } },
            select: { createdAt: true },
            orderBy: { createdAt: "asc" },
        })

        // Group by date
        const dailyData: Record<string, number> = {}
        users.forEach(user => {
            const date = user.createdAt.toISOString().split("T")[0]
            dailyData[date] = (dailyData[date] || 0) + 1
        })

        const chartData = Object.entries(dailyData).map(([date, count]) => ({
            date,
            count,
        }))

        return {
            success: true,
            data: {
                chartData,
                total: users.length,
                period: {
                    from: from.toISOString(),
                    to: to.toISOString(),
                },
            },
        }
    } catch (error) {
        console.error("Get user growth stats error:", error)
        return { success: false, error: "Failed to fetch user growth statistics" }
    }
}

// Get engagement statistics
export async function getEngagementStats(dateRange?: DateRange): Promise<AdminResponse<any>> {
    try {
        const { success, error } = await checkAdminAccess()
        if (!success) return { success: false, error }

        const now = new Date()
        const from = dateRange?.from || new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        const to = dateRange?.to || now

        const [
            projectsStarted,
            feedbackSubmitted,
            communitiesJoined,
            mocksCompleted,
        ] = await Promise.all([
            prisma.userProjectProgress.count({
                where: { startedAt: { gte: from, lte: to } },
            }),
            prisma.feedback.count({
                where: { createdAt: { gte: from, lte: to } },
            }),
            prisma.communityMember.count({
                where: { joinedAt: { gte: from, lte: to } },
            }),
            prisma.mockVoiceSession.count({
                where: { createdAt: { gte: from, lte: to } },
            }),
        ])

        return {
            success: true,
            data: {
                projectsStarted,
                feedbackSubmitted,
                communitiesJoined,
                mocksCompleted,
                period: {
                    from: from.toISOString(),
                    to: to.toISOString(),
                },
            },
        }
    } catch (error) {
        console.error("Get engagement stats error:", error)
        return { success: false, error: "Failed to fetch engagement statistics" }
    }
}

// Get revenue statistics (from credit purchases)
export async function getRevenueStats(dateRange?: DateRange): Promise<AdminResponse<any>> {
    try {
        const { success, error } = await checkAdminAccess()
        if (!success) return { success: false, error }

        const now = new Date()
        const from = dateRange?.from || new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        const to = dateRange?.to || now

        const payments = await prisma.payment.findMany({
            where: {
                createdAt: { gte: from, lte: to },
                status: "COMPLETED",
            },
            select: {
                amount: true,
                currency: true,
                createdAt: true,
            },
        })

        // Group by date
        const dailyRevenue: Record<string, number> = {}
        let totalRevenue = 0

        payments.forEach(payment => {
            const date = payment.createdAt.toISOString().split("T")[0]
            const amount = payment.amount || 0
            dailyRevenue[date] = (dailyRevenue[date] || 0) + amount
            totalRevenue += amount
        })

        const chartData = Object.entries(dailyRevenue).map(([date, amount]) => ({
            date,
            amount,
        }))

        return {
            success: true,
            data: {
                chartData,
                totalRevenue,
                transactionCount: payments.length,
                averageValue: payments.length > 0 ? totalRevenue / payments.length : 0,
                period: {
                    from: from.toISOString(),
                    to: to.toISOString(),
                },
            },
        }
    } catch (error) {
        console.error("Get revenue stats error:", error)
        return { success: false, error: "Failed to fetch revenue statistics" }
    }
}

// Get module usage statistics
export async function getModuleUsageStats(dateRange?: DateRange): Promise<AdminResponse<any>> {
    try {
        const { success, error } = await checkAdminAccess()
        if (!success) return { success: false, error }

        const now = new Date()
        const from = dateRange?.from || new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        const to = dateRange?.to || now

        const [
            projectsCount,
            mocksCount,
            assessmentsCount,
            challengesCount,
            communitiesCount,
            conceptsCount,
        ] = await Promise.all([
            prisma.userProjectProgress.count({
                where: { startedAt: { gte: from, lte: to } },
            }),
            prisma.mockVoiceSession.count({
                where: { createdAt: { gte: from, lte: to } },
            }),
            prisma.practiceAttempt.count({
                where: { startedAt: { gte: from, lte: to } },
            }),
            prisma.forgeEnrollment.count({
                where: { enrolledAt: { gte: from, lte: to } },
            }),
            prisma.communityMember.count({
                where: { joinedAt: { gte: from, lte: to } },
            }),
            prisma.conceptProgress.count({
                where: { startedAt: { gte: from, lte: to } },
            }),
        ])

        return {
            success: true,
            data: {
                modules: [
                    { name: "Projects", count: projectsCount },
                    { name: "Mock Interviews", count: mocksCount },
                    { name: "Assessments", count: assessmentsCount },
                    { name: "Challenges", count: challengesCount },
                    { name: "Communities", count: communitiesCount },
                    { name: "Concepts", count: conceptsCount },
                ],
                period: {
                    from: from.toISOString(),
                    to: to.toISOString(),
                },
            },
        }
    } catch (error) {
        console.error("Get module usage stats error:", error)
        return { success: false, error: "Failed to fetch module usage statistics" }
    }
}

// Export analytics data
export async function exportAnalytics(
    type: "users" | "revenue" | "engagement",
    dateRange?: DateRange
): Promise<AdminResponse<string>> {
    try {
        const { success, error } = await checkAdminAccess()
        if (!success) return { success: false, error }

        let csv = ""

        switch (type) {
            case "users": {
                const stats = await getUserGrowthStats(dateRange)
                if (stats.success && stats.data) {
                    csv = "Date,New Users\n"
                    stats.data.chartData.forEach((row: any) => {
                        csv += `${row.date},${row.count}\n`
                    })
                }
                break
            }
            case "revenue": {
                const stats = await getRevenueStats(dateRange)
                if (stats.success && stats.data) {
                    csv = "Date,Revenue\n"
                    stats.data.chartData.forEach((row: any) => {
                        csv += `${row.date},${row.amount}\n`
                    })
                }
                break
            }
            case "engagement": {
                const stats = await getEngagementStats(dateRange)
                if (stats.success && stats.data) {
                    csv = "Metric,Count\n"
                    csv += `Projects Started,${stats.data.projectsStarted}\n`
                    csv += `Feedback Submitted,${stats.data.feedbackSubmitted}\n`
                    csv += `Communities Joined,${stats.data.communitiesJoined}\n`
                    csv += `Mocks Completed,${stats.data.mocksCompleted}\n`
                }
                break
            }
        }

        return { success: true, data: csv }
    } catch (error) {
        console.error("Export analytics error:", error)
        return { success: false, error: "Failed to export analytics" }
    }
}
