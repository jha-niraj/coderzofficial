"use server"
/* eslint-disable @typescript-eslint/no-explicit-any */

import { db, adminAccess, adminAuditLogs, adminSystemSettings, adminNotifications, users, feedbacks, mockInterviewVoice, creditTransactions } from "@repo/db"
import { eq, and, count, sql } from "drizzle-orm"
import { getSession } from "@repo/auth"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { hasPermission, type AdminPermissions, type AdminPermission, type PermissionLevel } from "@/lib/navigation"

interface Response<T = unknown> {
    success: boolean
    data?: T
    error?: string
}

// Helper to check admin access
async function checkAdminAccess(requiredModule: AdminPermission, requiredLevel: PermissionLevel) {
    const session = await getSession(headers())
    if (!session?.user?.id) {
        return { authorized: false, error: "Not authenticated" }
    }

    const adminRecord = await db.query.adminAccess.findFirst({
        where: eq(adminAccess.userId, session.user.id),
        with: { user: true }
    })

    if (!adminRecord || !hasPermission(adminRecord.permissions as AdminPermissions, requiredModule, requiredLevel)) {
        return { authorized: false, error: "Not authorized" }
    }

    return { authorized: true, adminAccess: adminRecord }
}

// Get all system settings
export async function getSystemSettings(): Promise<Response> {
    try {
        const check = await checkAdminAccess("system", "read")
        if (!check.authorized) {
            return { success: false, error: check.error }
        }

        const settings = await db.query.adminSystemSettings.findMany({
            orderBy: (t, { desc }) => [desc(t.updatedAt)]
        })

        return { success: true, data: settings }
    } catch (error) {
        console.error("Get system settings error:", error)
        return { success: false, error: "Failed to fetch system settings" }
    }
}

// Get system setting by key
export async function getSystemSetting(key: string): Promise<Response> {
    try {
        const check = await checkAdminAccess("system", "read")
        if (!check.authorized) {
            return { success: false, error: check.error }
        }

        const setting = await db.query.adminSystemSettings.findFirst({
            where: eq(adminSystemSettings.key, key)
        })

        if (!setting) {
            return { success: false, error: "Setting not found" }
        }

        return { success: true, data: setting }
    } catch (error) {
        console.error("Get system setting error:", error)
        return { success: false, error: "Failed to fetch system setting" }
    }
}

// Update system setting
export async function updateSystemSetting(key: string, data: {
    value: any
    description?: string
}): Promise<Response> {
    try {
        const check = await checkAdminAccess("system", "write")
        if (!check.authorized) {
            return { success: false, error: check.error }
        }

        // Upsert: try update first, then insert
        const existing = await db.query.adminSystemSettings.findFirst({
            where: eq(adminSystemSettings.key, key)
        })

        let setting
        if (existing) {
            const [updated] = await db.update(adminSystemSettings)
                .set({ value: data.value, description: data.description })
                .where(eq(adminSystemSettings.key, key))
                .returning()
            setting = updated
        } else {
            const [inserted] = await db.insert(adminSystemSettings)
                .values({ key, value: data.value, description: data.description })
                .returning()
            setting = inserted
        }

        await db.insert(adminAuditLogs).values({
            adminId: check.adminAccess!.id,
            action: "UPDATE",
            module: "system",
            resourceType: "SystemSettings",
            resourceId: key,
            description: `Updated system setting: ${key}`
        })

        revalidatePath("/system")

        return { success: true, data: setting }
    } catch (error) {
        console.error("Update system setting error:", error)
        return { success: false, error: "Failed to update system setting" }
    }
}

// Get database stats
export async function getDatabaseStats(): Promise<Response> {
    try {
        const check = await checkAdminAccess("system", "read")
        if (!check.authorized) {
            return { success: false, error: check.error }
        }

        const [
            totalUsersResult,
            totalMockInterviewsResult,
            totalFeedbackResult,
            totalCreditTransactionsResult,
        ] = await Promise.all([
            db.select({ totalUsers: count() }).from(users),
            db.select({ totalMockInterviews: count() }).from(mockInterviewVoice),
            db.select({ totalFeedback: count() }).from(feedbacks),
            db.select({ totalCreditTransactions: count() }).from(creditTransactions),
        ])
        const totalUsers = totalUsersResult[0]?.totalUsers ?? 0
        const totalMockInterviews = totalMockInterviewsResult[0]?.totalMockInterviews ?? 0
        const totalFeedback = totalFeedbackResult[0]?.totalFeedback ?? 0
        const totalCreditTransactions = totalCreditTransactionsResult[0]?.totalCreditTransactions ?? 0

        return {
            success: true,
            data: {
                users: totalUsers,
                projects: 0,
                communities: 0,
                mockInterviews: totalMockInterviews,
                feedback: totalFeedback,
                creditTransactions: totalCreditTransactions,
                assessmentQuestions: 0,
                forgeTracks: 0,
                crucibleEvents: 0,
            }
        }
    } catch (error) {
        console.error("Get database stats error:", error)
        return { success: false, error: "Failed to fetch database stats" }
    }
}

// Get system health
export async function getSystemHealth(): Promise<Response> {
    try {
        const check = await checkAdminAccess("system", "read")
        if (!check.authorized) {
            return { success: false, error: check.error }
        }

        // Check database connection
        await db.execute(sql`SELECT 1`)

        // Get recent errors from audit log
        const recentErrorsResult = await db.select({ recentErrors: count() })
            .from(adminAuditLogs)
            .where(
                and(
                    eq(adminAuditLogs.action, "ERROR"),
                    sql`${adminAuditLogs.createdAt} >= NOW() - INTERVAL '24 hours'`
                )
            )
        const recentErrors = recentErrorsResult[0]?.recentErrors ?? 0

        return {
            success: true,
            data: {
                databaseStatus: "healthy",
                recentErrors,
                recentActivitiesLast24h: 0,
                timestamp: new Date()
            }
        }
    } catch (error) {
        console.error("Get system health error:", error)
        return {
            success: false,
            data: {
                databaseStatus: "unhealthy",
                error: "Failed to check system health"
            }
        }
    }
}

// Clear cache
export async function clearCache(cacheKeys?: string[]): Promise<Response> {
    try {
        const check = await checkAdminAccess("system", "write")
        if (!check.authorized) {
            return { success: false, error: check.error }
        }

        // Revalidate paths
        if (cacheKeys && cacheKeys.length > 0) {
            cacheKeys.forEach(key => revalidatePath(key))
        } else {
            // Clear all common paths
            revalidatePath("/")
            revalidatePath("/dashboard")
            revalidatePath("/users")
            revalidatePath("/projects")
            revalidatePath("/communities")
            revalidatePath("/feedback")
            revalidatePath("/analytics")
        }

        await db.insert(adminAuditLogs).values({
            adminId: check.adminAccess!.id,
            action: "UPDATE",
            module: "system",
            resourceType: "Cache",
            resourceId: "cache",
            description: `Cleared cache: ${cacheKeys?.join(", ") || "all"}`
        })

        return { success: true, data: { cleared: cacheKeys || ["all"] } }
    } catch (error) {
        console.error("Clear cache error:", error)
        return { success: false, error: "Failed to clear cache" }
    }
}

// Get admin notifications
export async function getAdminNotifications(params?: {
    page?: number
    limit?: number
    unreadOnly?: boolean
}): Promise<Response> {
    try {
        const check = await checkAdminAccess("system", "read")
        if (!check.authorized) {
            return { success: false, error: check.error }
        }

        const page = params?.page || 1
        const limit = params?.limit || 20
        const offset = (page - 1) * limit

        const whereConditions = [eq(adminNotifications.adminId, check.adminAccess!.id)]

        if (params?.unreadOnly) {
            whereConditions.push(eq(adminNotifications.isRead, false))
        }

        const whereClause = and(...whereConditions)

        const [notificationList, totalResult] = await Promise.all([
            db.query.adminNotifications.findMany({
                where: whereClause,
                orderBy: (t, { desc }) => [desc(t.createdAt)],
                limit,
                offset
            }),
            db.select({ total: count() }).from(adminNotifications).where(whereClause)
        ])
        const total = totalResult[0]?.total ?? 0

        return {
            success: true,
            data: {
                notifications: notificationList,
                pagination: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit)
                }
            }
        }
    } catch (error) {
        console.error("Get admin notifications error:", error)
        return { success: false, error: "Failed to fetch notifications" }
    }
}

// Mark notification as read
export async function markNotificationAsRead(id: string): Promise<Response> {
    try {
        const check = await checkAdminAccess("system", "write")
        if (!check.authorized) {
            return { success: false, error: check.error }
        }

        await db.update(adminNotifications)
            .set({ isRead: true })
            .where(eq(adminNotifications.id, id))

        return { success: true, data: null }
    } catch (error) {
        console.error("Mark notification as read error:", error)
        return { success: false, error: "Failed to mark notification as read" }
    }
}

// Mark all notifications as read
export async function markAllNotificationsAsRead(): Promise<Response> {
    try {
        const check = await checkAdminAccess("system", "write")
        if (!check.authorized) {
            return { success: false, error: check.error }
        }

        await db.update(adminNotifications)
            .set({ isRead: true })
            .where(
                and(
                    eq(adminNotifications.adminId, check.adminAccess!.id),
                    eq(adminNotifications.isRead, false)
                )
            )

        return { success: true, data: null }
    } catch (error) {
        console.error("Mark all notifications as read error:", error)
        return { success: false, error: "Failed to mark all notifications as read" }
    }
}
