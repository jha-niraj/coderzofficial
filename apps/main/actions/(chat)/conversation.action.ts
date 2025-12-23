"use server"

import { auth } from '@repo/auth'
import prisma from "@repo/prisma"

/**
 * Get or create a conversation between two users
 */
export async function getOrCreateConversation(participantId: string) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: "Not authenticated", conversation: null }
        }

        if (session.user.id === participantId) {
            return { success: false, error: "Cannot create conversation with yourself", conversation: null }
        }

        // Check if users are following each other
        const isFollowing = await prisma.follow.findUnique({
            where: {
                followerId_followingId: {
                    followerId: session.user.id,
                    followingId: participantId
                }
            }
        })

        const isFollower = await prisma.follow.findUnique({
            where: {
                followerId_followingId: {
                    followerId: participantId,
                    followingId: session.user.id
                }
            }
        })

        if (!isFollowing && !isFollower) {
            return { 
                success: false, 
                error: "You need to follow each other to start a conversation", 
                conversation: null 
            }
        }

        // Find existing conversation (either direction)
        let conversation = await prisma.conversation.findFirst({
            where: {
                OR: [
                    {
                        participant1Id: session.user.id,
                        participant2Id: participantId
                    },
                    {
                        participant1Id: participantId,
                        participant2Id: session.user.id
                    }
                ]
            },
            include: {
                participant1: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        image: true
                    }
                },
                participant2: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        image: true
                    }
                }
            }
        })

        // Create if doesn't exist
        if (!conversation) {
            conversation = await prisma.conversation.create({
                data: {
                    participant1Id: session.user.id,
                    participant2Id: participantId
                },
                include: {
                    participant1: {
                        select: {
                            id: true,
                            name: true,
                            username: true,
                            image: true
                        }
                    },
                    participant2: {
                        select: {
                            id: true,
                            name: true,
                            username: true,
                            image: true
                        }
                    }
                }
            })
        }

        return { success: true, conversation }
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
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: "Not authenticated", conversations: [] }
        }

        const conversations = await prisma.conversation.findMany({
            where: {
                OR: [
                    { participant1Id: session.user.id },
                    { participant2Id: session.user.id }
                ]
            },
            include: {
                participant1: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        image: true
                    }
                },
                participant2: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        image: true
                    }
                },
                messages: {
                    take: 1,
                    orderBy: { createdAt: "desc" },
                    select: {
                        content: true,
                        type: true,
                        createdAt: true,
                        senderId: true,
                        status: true
                    }
                }
            },
            orderBy: { lastMessageAt: "desc" }
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
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: "Not authenticated" }
        }

        const conversation = await prisma.conversation.findUnique({
            where: { id: conversationId }
        })

        if (!conversation) {
            return { success: false, error: "Conversation not found" }
        }

        if (conversation.participant1Id !== session.user.id && 
            conversation.participant2Id !== session.user.id) {
            return { success: false, error: "Not authorized" }
        }

        // Delete all messages and the conversation
        await prisma.$transaction([
            prisma.chatMessage.deleteMany({
                where: { conversationId }
            }),
            prisma.conversation.delete({
                where: { id: conversationId }
            })
        ])

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
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: "Not authenticated", users: [] }
        }

        // Get users that the current user follows or is followed by
        const following = await prisma.follow.findMany({
            where: { followerId: session.user.id },
            select: { followingId: true }
        })

        const followers = await prisma.follow.findMany({
            where: { followingId: session.user.id },
            select: { followerId: true }
        })

        const connectedUserIds = [
            ...following.map(f => f.followingId),
            ...followers.map(f => f.followerId)
        ]

        if (connectedUserIds.length === 0) {
            return { success: true, users: [] }
        }

        const users = await prisma.user.findMany({
            where: {
                AND: [
                    { id: { in: connectedUserIds } },
                    { id: { not: session.user.id } },
                    {
                        OR: [
                            { name: { contains: query, mode: "insensitive" } },
                            { username: { contains: query, mode: "insensitive" } }
                        ]
                    }
                ]
            },
            select: {
                id: true,
                name: true,
                username: true,
                image: true,
                bio: true
            },
            take: 20
        })

        return { success: true, users }
    } catch (error) {
        console.error("Search users for chat error:", error)
        return { success: false, error: "Failed to search users", users: [] }
    }
}
