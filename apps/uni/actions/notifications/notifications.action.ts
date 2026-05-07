"use server"

import { db, notifications } from "@repo/db"
import { eq, and, inArray } from "drizzle-orm"
import { getSession } from "@repo/auth"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"

export async function getNotifications(limit = 10) {
    try {
        const session = await getSession(headers())
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" }
        }

        const notificationRows = await db.query.notifications.findMany({
            where: and(
                eq(notifications.userId, session.user.id),
                inArray(notifications.platform, ["UNI", "MAIN"]),
            ),
            orderBy: (tbl, { desc }) => desc(tbl.createdAt),
            limit,
        })

        const unreadRows = await db.query.notifications.findMany({
            where: and(
                eq(notifications.userId, session.user.id),
                inArray(notifications.platform, ["UNI", "MAIN"]),
                eq(notifications.read, false),
            ),
        })

        return { success: true, notifications: notificationRows, unreadCount: unreadRows.length }
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

        await db.update(notifications).set({ read: true }).where(
            and(
                eq(notifications.id, id),
                eq(notifications.userId, session.user.id),
            )
        )

        revalidatePath('/uni')
        return { success: true }
    } catch (error) {
        console.error("Error mark notification:", error)
        return { success: false, error: "Failed to mark as read" }
    }
}
