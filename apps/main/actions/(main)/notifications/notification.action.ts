"use server"

import { auth } from '@repo/auth'
import prisma from "@repo/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

// Types matching Prisma Enum (or import from client if possible, but hard in server actions sometimes)
type NotificationType = 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR'
type Platform = 'MAIN' | 'HIRING' | 'UNI' | 'ADMIN'

interface NotificationResponse {
    success: boolean
    data?: any
    error?: string
}

async function getCurrentUser() {
    const session = await auth()
    if (!session?.user?.email) throw new Error("Not authenticated")
    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user) throw new Error("User not found")
    return user
}

export async function getNotifications(page = 1, limit = 20) {
    try {
        const user = await getCurrentUser()
        const skip = (page - 1) * limit

        const notifications = await prisma.notification.findMany({
            where: {
                userId: user.id
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: limit,
            skip: skip
        })

        const totalUnread = await prisma.notification.count({
            where: {
                userId: user.id,
                read: false
            }
        })

        return {
            success: true,
            data: {
                notifications,
                totalUnread,
                hasMore: notifications.length === limit
            }
        }
    } catch (error: any) {
        console.error("Failed to fetch notifications:", error)
        return {
            success: false,
            error: error.message || "Failed to fetch notifications"
        }
    }
}

export async function markAsRead(notificationId: string) {
    try {
        const user = await getCurrentUser()

        await prisma.notification.update({
            where: {
                id: notificationId,
                userId: user.id // Ensure ownership
            },
            data: {
                read: true
            }
        })

        revalidatePath('/')
        return { success: true }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

export async function markAllAsRead() {
    try {
        const user = await getCurrentUser()

        await prisma.notification.updateMany({
            where: {
                userId: user.id,
                read: false
            },
            data: {
                read: true
            }
        })

        revalidatePath('/')
        return { success: true }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}
