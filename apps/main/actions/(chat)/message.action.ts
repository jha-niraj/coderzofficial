"use server"

import { db, conversation, chatMessage } from "@repo/db"
import { getSession } from "@repo/auth"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { eq, and, or, inArray, not, count, lt, desc } from "drizzle-orm"

/**
 * Send a message in a conversation
 */
export async function sendMessage(
    conversationId: string,
    content: string,
    type: "TEXT" | "IMAGE" = "TEXT",
    imageUrl?: string
) {
    try {
        const session = await getSession(headers())
        if (!session?.user?.id) {
            return { success: false, error: "Not authenticated", message: null }
        }

        // Verify user is part of the conversation
        const conv = await db.query.conversation.findFirst({
            where: eq(conversation.id, conversationId)
        })

        if (!conv) {
            return { success: false, error: "Conversation not found", message: null }
        }

        if (conv.participant1Id !== session.user.id &&
            conv.participant2Id !== session.user.id) {
            return { success: false, error: "Not authorized", message: null }
        }

        // Create message
        const [msg] = await db.insert(chatMessage).values({
            conversationId,
            senderId: session.user.id,
            content,
            type,
            imageUrl,
            status: "SENT"
        }).returning()

        const fullMessage = await db.query.chatMessage.findFirst({
            where: eq(chatMessage.id, msg.id),
            with: { sender: true }
        })

        // Update conversation's last message
        await db.update(conversation)
            .set({
                lastMessageAt: new Date(),
                lastMessageText: type === "TEXT" ? content : "Sent an image"
            })
            .where(eq(conversation.id, conversationId))

        revalidatePath("/chat")

        return { success: true, message: fullMessage }
    } catch (error) {
        console.error("Send message error:", error)
        return { success: false, error: "Failed to send message", message: null }
    }
}

/**
 * Get messages for a conversation
 */
export async function getMessages(conversationId: string, limit: number = 50, cursor?: string) {
    try {
        const session = await getSession(headers())
        if (!session?.user?.id) {
            return { success: false, error: "Not authenticated", messages: [], hasMore: false }
        }

        // Verify user is part of the conversation
        const conv = await db.query.conversation.findFirst({
            where: eq(conversation.id, conversationId)
        })

        if (!conv) {
            return { success: false, error: "Conversation not found", messages: [], hasMore: false }
        }

        if (conv.participant1Id !== session.user.id &&
            conv.participant2Id !== session.user.id) {
            return { success: false, error: "Not authorized", messages: [], hasMore: false }
        }

        const conditions = [eq(chatMessage.conversationId, conversationId)]
        if (cursor) conditions.push(lt(chatMessage.id, cursor))

        const messages = await db.query.chatMessage.findMany({
            where: and(...conditions),
            with: { sender: true },
            orderBy: [desc(chatMessage.createdAt)],
            limit: limit + 1,
        })

        const hasMore = messages.length > limit
        const messagesData = hasMore ? messages.slice(0, -1) : messages

        return {
            success: true,
            messages: messagesData.reverse(), // Reverse to show oldest first
            hasMore,
            nextCursor: hasMore ? messages[limit - 1]?.id || null : null
        }
    } catch (error) {
        console.error("Get messages error:", error)
        return { success: false, error: "Failed to fetch messages", messages: [], hasMore: false }
    }
}

/**
 * Mark messages as read
 */
export async function markMessagesAsRead(conversationId: string) {
    try {
        const session = await getSession(headers())
        if (!session?.user?.id) {
            return { success: false, error: "Not authenticated" }
        }

        // Update all unread messages in the conversation that were sent by the other user
        await db.update(chatMessage)
            .set({ status: "READ", readAt: new Date() })
            .where(and(
                eq(chatMessage.conversationId, conversationId),
                not(eq(chatMessage.senderId, session.user.id)),
                inArray(chatMessage.status, ["SENT", "DELIVERED"])
            ))

        revalidatePath("/chat")

        return { success: true, message: "Messages marked as read" }
    } catch (error) {
        console.error("Mark messages as read error:", error)
        return { success: false, error: "Failed to mark messages as read" }
    }
}

/**
 * Get unread message count for a conversation
 */
export async function getUnreadCount(conversationId: string) {
    try {
        const session = await getSession(headers())
        if (!session?.user?.id) {
            return { success: false, error: "Not authenticated", count: 0 }
        }

        const [{ value }] = await db.select({ value: count() })
            .from(chatMessage)
            .where(and(
                eq(chatMessage.conversationId, conversationId),
                not(eq(chatMessage.senderId, session.user.id)),
                inArray(chatMessage.status, ["SENT", "DELIVERED"])
            ))

        return { success: true, count: value }
    } catch (error) {
        console.error("Get unread count error:", error)
        return { success: false, error: "Failed to get unread count", count: 0 }
    }
}

/**
 * Delete a message (soft delete by setting content to "Message deleted")
 */
export async function deleteMessage(messageId: string) {
    try {
        const session = await getSession(headers())
        if (!session?.user?.id) {
            return { success: false, error: "Not authenticated" }
        }

        const msg = await db.query.chatMessage.findFirst({
            where: eq(chatMessage.id, messageId)
        })

        if (!msg) {
            return { success: false, error: "Message not found" }
        }

        if (msg.senderId !== session.user.id) {
            return { success: false, error: "Not authorized" }
        }

        await db.update(chatMessage)
            .set({ content: "Message deleted", imageUrl: null, type: "TEXT" })
            .where(eq(chatMessage.id, messageId))

        revalidatePath("/chat")

        return { success: true, message: "Message deleted" }
    } catch (error) {
        console.error("Delete message error:", error)
        return { success: false, error: "Failed to delete message" }
    }
}

/**
 * Get total unread messages count across all conversations
 */
export async function getTotalUnreadCount() {
    try {
        const session = await getSession(headers())
        if (!session?.user?.id) {
            return { success: false, error: "Not authenticated", count: 0 }
        }

        // Get all conversations user is part of
        const conversations = await db.query.conversation.findMany({
            where: or(
                eq(conversation.participant1Id, session.user.id),
                eq(conversation.participant2Id, session.user.id)
            )
        })

        const conversationIds = conversations.map(c => c.id)

        if (conversationIds.length === 0) {
            return { success: true, count: 0 }
        }

        const [{ value }] = await db.select({ value: count() })
            .from(chatMessage)
            .where(and(
                inArray(chatMessage.conversationId, conversationIds),
                not(eq(chatMessage.senderId, session.user.id)),
                inArray(chatMessage.status, ["SENT", "DELIVERED"])
            ))

        return { success: true, count: value }
    } catch (error) {
        console.error("Get total unread count error:", error)
        return { success: false, error: "Failed to get unread count", count: 0 }
    }
}
