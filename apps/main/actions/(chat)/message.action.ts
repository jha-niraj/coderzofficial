"use server"

import { auth } from '@repo/auth'
import prisma from "@repo/prisma"
import { revalidatePath } from "next/cache"

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
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: "Not authenticated", message: null }
        }

        // Verify user is part of the conversation
        const conversation = await prisma.conversation.findUnique({
            where: { id: conversationId }
        })

        if (!conversation) {
            return { success: false, error: "Conversation not found", message: null }
        }

        if (conversation.participant1Id !== session.user.id && 
            conversation.participant2Id !== session.user.id) {
            return { success: false, error: "Not authorized", message: null }
        }

        // Create message
        const message = await prisma.chatMessage.create({
            data: {
                conversationId,
                senderId: session.user.id,
                content,
                type,
                imageUrl,
                status: "SENT"
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        image: true
                    }
                }
            }
        })

        // Update conversation's last message
        await prisma.conversation.update({
            where: { id: conversationId },
            data: {
                lastMessageAt: new Date(),
                lastMessageText: type === "TEXT" ? content : "Sent an image"
            }
        })

        revalidatePath("/chat")

        return { success: true, message }
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
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: "Not authenticated", messages: [], hasMore: false }
        }

        // Verify user is part of the conversation
        const conversation = await prisma.conversation.findUnique({
            where: { id: conversationId }
        })

        if (!conversation) {
            return { success: false, error: "Conversation not found", messages: [], hasMore: false }
        }

        if (conversation.participant1Id !== session.user.id && 
            conversation.participant2Id !== session.user.id) {
            return { success: false, error: "Not authorized", messages: [], hasMore: false }
        }

        const messages = await prisma.chatMessage.findMany({
            where: {
                conversationId,
                ...(cursor ? { id: { lt: cursor } } : {})
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        image: true
                    }
                }
            },
            orderBy: { createdAt: "desc" },
            take: limit + 1
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
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: "Not authenticated" }
        }

        // Update all unread messages in the conversation that were sent by the other user
        await prisma.chatMessage.updateMany({
            where: {
                conversationId,
                senderId: { not: session.user.id },
                status: { in: ["SENT", "DELIVERED"] }
            },
            data: {
                status: "READ",
                readAt: new Date()
            }
        })

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
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: "Not authenticated", count: 0 }
        }

        const count = await prisma.chatMessage.count({
            where: {
                conversationId,
                senderId: { not: session.user.id },
                status: { in: ["SENT", "DELIVERED"] }
            }
        })

        return { success: true, count }
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
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: "Not authenticated" }
        }

        const message = await prisma.chatMessage.findUnique({
            where: { id: messageId }
        })

        if (!message) {
            return { success: false, error: "Message not found" }
        }

        if (message.senderId !== session.user.id) {
            return { success: false, error: "Not authorized" }
        }

        await prisma.chatMessage.update({
            where: { id: messageId },
            data: {
                content: "Message deleted",
                imageUrl: null,
                type: "TEXT"
            }
        })

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
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: "Not authenticated", count: 0 }
        }

        // Get all conversations user is part of
        const conversations = await prisma.conversation.findMany({
            where: {
                OR: [
                    { participant1Id: session.user.id },
                    { participant2Id: session.user.id }
                ]
            },
            select: { id: true }
        })

        const conversationIds = conversations.map(c => c.id)

        const count = await prisma.chatMessage.count({
            where: {
                conversationId: { in: conversationIds },
                senderId: { not: session.user.id },
                status: { in: ["SENT", "DELIVERED"] }
            }
        })

        return { success: true, count }
    } catch (error) {
        console.error("Get total unread count error:", error)
        return { success: false, error: "Failed to get unread count", count: 0 }
    }
}
