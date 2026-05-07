"use server"

import { db, follow, conversation, chatMessage } from "@repo/db"
import { getSession } from "@repo/auth"
import { headers } from "next/headers"
import { eq, and, or, ilike, inArray } from "drizzle-orm"

/**
 * Get or create a conversation between two users
 */
export async function getOrCreateConversation(participantId: string) {
    try {
        const session = await getSession(headers())
        if (!session?.user?.id) {
            return { success: false, error: "Not authenticated", conversation: null }
        }

        if (session.user.id === participantId) {
            return { success: false, error: "Cannot create conversation with yourself", conversation: null }
        }

        // Check if users are following each other
        const isFollowing = await db.query.follow.findFirst({
            where: and(
                eq(follow.followerId, session.user.id),
                eq(follow.followingId, participantId)
            )
        })

        const isFollower = await db.query.follow.findFirst({
            where: and(
                eq(follow.followerId, participantId),
                eq(follow.followingId, session.user.id)
            )
        })

        if (!isFollowing && !isFollower) {
            return {
                success: false,
                error: "You need to follow each other to start a conversation",
                conversation: null
            }
        }

        // Find existing conversation (either direction)
        let conv = await db.query.conversation.findFirst({
            where: or(
                and(
                    eq(conversation.participant1Id, session.user.id),
                    eq(conversation.participant2Id, participantId)
                ),
                and(
                    eq(conversation.participant1Id, participantId),
                    eq(conversation.participant2Id, session.user.id)
                )
            ),
            with: { participant1: true, participant2: true }
        })

        // Create if doesn't exist
        if (!conv) {
            const [newConv] = await db.insert(conversation).values({
                participant1Id: session.user.id,
                participant2Id: participantId
            }).returning()

            conv = await db.query.conversation.findFirst({
                where: eq(conversation.id, newConv.id),
                with: { participant1: true, participant2: true }
            })
        }

        return { success: true, conversation: conv }
    } catch (error) {
        console.error("Get or create conversation error:", error)
        return { success: false, error: "Failed to create conversation", conversation: null }
    }
}

/**
 * Get all conversations for the current user
 */
export async function getConversations() {
    try {
        const session = await getSession(headers())
        if (!session?.user?.id) {
            return { success: false, error: "Not authenticated", conversations: [] }
        }

        const conversations = await db.query.conversation.findMany({
            where: or(
                eq(conversation.participant1Id, session.user.id),
                eq(conversation.participant2Id, session.user.id)
            ),
            with: {
                participant1: true,
                participant2: true,
                messages: {
                    limit: 1,
                    orderBy: (t, { desc }) => [desc(t.createdAt)]
                }
            },
            orderBy: (t, { desc }) => [desc(t.lastMessageAt)]
        })

        // Map conversations to include the "other" participant
        const mappedConversations = conversations.map(conv => {
            const otherParticipant = conv.participant1Id === session.user.id
                ? conv.participant2
                : conv.participant1

            const lastMessage = conv.messages[0] || null
            const unreadCount = 0 // Will be calculated in message.action.ts

            return {
                id: conv.id,
                otherParticipant,
                lastMessage,
                lastMessageAt: conv.lastMessageAt,
                unreadCount
            }
        })

        return { success: true, conversations: mappedConversations }
    } catch (error) {
        console.error("Get conversations error:", error)
        return { success: false, error: "Failed to fetch conversations", conversations: [] }
    }
}

/**
 * Delete a conversation
 */
export async function deleteConversation(conversationId: string) {
    try {
        const session = await getSession(headers())
        if (!session?.user?.id) {
            return { success: false, error: "Not authenticated" }
        }

        const conv = await db.query.conversation.findFirst({
            where: eq(conversation.id, conversationId)
        })

        if (!conv) {
            return { success: false, error: "Conversation not found" }
        }

        if (conv.participant1Id !== session.user.id &&
            conv.participant2Id !== session.user.id) {
            return { success: false, error: "Not authorized" }
        }

        // Delete all messages first, then the conversation
        await db.delete(chatMessage).where(eq(chatMessage.conversationId, conversationId))
        await db.delete(conversation).where(eq(conversation.id, conversationId))

        return { success: true, message: "Conversation deleted" }
    } catch (error) {
        console.error("Delete conversation error:", error)
        return { success: false, error: "Failed to delete conversation" }
    }
}

/**
 * Search users to start a conversation with (followers/following only)
 */
export async function searchUsersForChat(query: string) {
    try {
        const session = await getSession(headers())
        if (!session?.user?.id) {
            return { success: false, error: "Not authenticated", users: [] }
        }

        // Get users that the current user follows or is followed by
        const following = await db.query.follow.findMany({
            where: eq(follow.followerId, session.user.id)
        })

        const followers = await db.query.follow.findMany({
            where: eq(follow.followingId, session.user.id)
        })

        const connectedUserIds = [
            ...following.map(f => f.followingId),
            ...followers.map(f => f.followerId)
        ]

        if (connectedUserIds.length === 0) {
            return { success: true, users: [] }
        }

        const { users } = await import("@repo/db")
        const results = await db.query.users.findMany({
            where: and(
                inArray(users.id, connectedUserIds),
                or(
                    ilike(users.name ?? '', `%${query}%`),
                    ilike(users.username ?? '', `%${query}%`)
                )
            ),
            limit: 20
        })

        return { success: true, users: results }
    } catch (error) {
        console.error("Search users for chat error:", error)
        return { success: false, error: "Failed to search users", users: [] }
    }
}
