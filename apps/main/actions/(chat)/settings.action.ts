"use server"

import { auth } from '@repo/auth'
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

/**
 * Get chat settings for the current user
 */
export async function getChatSettings() {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: "Not authenticated", settings: null }
        }

        let settings = await prisma.chatSettings.findUnique({
            where: { userId: session.user.id }
        })

        // Create default settings if none exist
        if (!settings) {
            settings = await prisma.chatSettings.create({
                data: {
                    userId: session.user.id,
                    messageNotifications: true,
                    soundEnabled: true,
                    allowMessagesFrom: "followers",
                    showOnlineStatus: true,
                    showReadReceipts: true
                }
            })
        }

        // Cast to proper type with allowMessagesFrom as union type
        const typedSettings = settings ? {
            ...settings,
            allowMessagesFrom: settings.allowMessagesFrom as "everyone" | "followers" | "none"
        } : null

        return { success: true, settings: typedSettings }
    } catch (error) {
        console.error("Get chat settings error:", error)
        return { success: false, error: "Failed to fetch chat settings", settings: null }
    }
}

/**
 * Update chat settings
 */
export async function updateChatSettings(data: {
    messageNotifications?: boolean
    soundEnabled?: boolean
    allowMessagesFrom?: "everyone" | "followers" | "none"
    showOnlineStatus?: boolean
    showReadReceipts?: boolean
}) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: "Not authenticated" }
        }

        // Check if settings exist
        const existingSettings = await prisma.chatSettings.findUnique({
            where: { userId: session.user.id }
        })

        let settings
        if (existingSettings) {
            settings = await prisma.chatSettings.update({
                where: { userId: session.user.id },
                data
            })
        } else {
            settings = await prisma.chatSettings.create({
                data: {
                    userId: session.user.id,
                    messageNotifications: data.messageNotifications ?? true,
                    soundEnabled: data.soundEnabled ?? true,
                    allowMessagesFrom: data.allowMessagesFrom ?? "followers",
                    showOnlineStatus: data.showOnlineStatus ?? true,
                    showReadReceipts: data.showReadReceipts ?? true
                }
            })
        }

        revalidatePath("/chat/settings")

        return { success: true, message: "Settings updated successfully", settings }
    } catch (error) {
        console.error("Update chat settings error:", error)
        return { success: false, error: "Failed to update chat settings" }
    }
}
