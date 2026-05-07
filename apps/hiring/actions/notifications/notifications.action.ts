"use server"

import { db, notifications } from "@repo/db"
import { eq, and, inArray, count, desc } from "drizzle-orm"
import { getSession } from "@repo/auth"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"

export async function getNotifications(limit = 10) {
    try {
        const session = await getSession(headers())
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" }
        }

        const notificationList = await db.query.notifications.findMany({
            where: and(
                eq(notifications.userId, session.user.id),
                inArray(notifications.platform, ["HIRING", "MAIN"])
            ),
            orderBy: [desc(notifications.createdAt)],
            limit
        })

        const unreadCountRows = await db
            .select({ count: count() })
            .from(notifications)
            .where(and(
                eq(notifications.userId, session.user.id),
                inArray(notifications.platform, ["HIRING", "MAIN"]),
                eq(notifications.read, false)
            ))

        return {
            success: true,
            notifications: notificationList,
            unreadCount: unreadCountRows[0]?.count ?? 0
        }
    } catch (error) {
        console.error("Error fetching notifications:", error)
        return { success: false, error: "Failed to fetch notifications" }
    }
}

export async function markNotificationAsRead(id: string) {
    try {
        const session = await getSession(headers())
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" }
        }

        await db.update(notifications)
            .set({ read: true })
            .where(and(
                eq(notifications.id, id),
                eq(notifications.userId, session.user.id)
            ))

        revalidatePath('/hiring') // Refresh relevant paths
        return { success: true }
    } catch (error) {
        console.error("Error mark notification:", error)
        return { success: false, error: "Failed to mark as read" }
    }
}
