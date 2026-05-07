"use server"

import { db, chatSettings } from "@repo/db"
import { getSession } from "@repo/auth"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { eq } from "drizzle-orm"

/**
 * Get chat settings for the current user
 */
export async function getChatSettings() {
    try {
        const session = await getSession(headers())
        if (!session?.user?.id) {
            return { success: false, error: "Not authenticated", settings: null }
        }

        let settings = await db.query.chatSettings.findFirst({
            where: eq(chatSettings.userId, session.user.id)
        })

        // Create default settings if none exist
        if (!settings) {
            const [created] = await db.insert(chatSettings).values({
                userId: session.user.id,
                messageNotifications: true,
                soundEnabled: true,
                allowMessagesFrom: "followers",
                showOnlineStatus: true,
                showReadReceipts: true
            }).returning()
            settings = created
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
        const session = await getSession(headers())
        if (!session?.user?.id) {
            return { success: false, error: "Not authenticated" }
        }

        // Check if settings exist
        const existingSettings = await db.query.chatSettings.findFirst({
            where: eq(chatSettings.userId, session.user.id)
        })

        let settings
        if (existingSettings) {
            const [updated] = await db.update(chatSettings)
                .set(data)
                .where(eq(chatSettings.userId, session.user.id))
                .returning()
            settings = updated
        } else {
            const [created] = await db.insert(chatSettings).values({
                userId: session.user.id,
                messageNotifications: data.messageNotifications ?? true,
                soundEnabled: data.soundEnabled ?? true,
                allowMessagesFrom: data.allowMessagesFrom ?? "followers",
                showOnlineStatus: data.showOnlineStatus ?? true,
                showReadReceipts: data.showReadReceipts ?? true
            }).returning()
            settings = created
        }

        revalidatePath("/chat/settings")

        return { success: true, message: "Settings updated successfully", settings }
    } catch (error) {
        console.error("Update chat settings error:", error)
        return { success: false, error: "Failed to update chat settings" }
    }
}
