"use server"

import { prisma } from "@repo/prisma"
import { Platform } from "@repo/prisma/client"
import { auth } from "@repo/auth"
import { revalidatePath } from "next/cache"

export async function getNotifications(limit = 10) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" }
        }

        const notifications = await prisma.notification.findMany({
            where: {
                userId: session.user.id,
                platform: { in: [Platform.HIRING, Platform.MAIN] }
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: limit
        })

        const unreadCount = await prisma.notification.count({
            where: {
                userId: session.user.id,
                platform: { in: [Platform.HIRING, Platform.MAIN] },
                read: false
            }
        })

        return { success: true, notifications, unreadCount }
    } catch (error) {
        console.error("Error fetching notifications:", error)
        return { success: false, error: "Failed to fetch notifications" }
    }
}

export async function markNotificationAsRead(id: string) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" }
        }

        await prisma.notification.update({
            where: { id, userId: session.user.id },
            data: { read: true }
        })

        revalidatePath('/hiring') // Refresh relevant paths
        return { success: true }
    } catch (error) {
        console.error("Error mark notification:", error)
        return { success: false, error: "Failed to mark as read" }
    }
}
