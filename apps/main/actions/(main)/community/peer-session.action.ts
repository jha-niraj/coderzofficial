'use server'

import { prisma } from "@/lib/prisma"
import { getServerSession } from '@repo/auth'
import { authOptions } from '@repo/auth'
import { revalidatePath } from "next/cache"
import { PeerSessionType, PeerSessionStatus } from "@prisma/client"

// ==================== TYPES ====================
export interface CreatePeerSessionInput {
    type: PeerSessionType
    topic: string
    description?: string
    duration: number // minutes
    tags?: string[]
    skillLevel?: string
    scheduledFor?: Date
    sharedInCommunityId?: string
}

// ==================== PEER SESSIONS ====================

// Create a peer session
export async function createPeerSession(input: CreatePeerSessionInput) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" }
        }

        // Generate a unique room URL (can be integrated with your preferred video solution)
        const roomId = `peer-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        const roomUrl = `/peer-session/${roomId}`

        const peerSession = await prisma.communityPeerSession.create({
            data: {
                type: input.type,
                topic: input.topic,
                description: input.description,
                duration: input.duration,
                tags: input.tags || [],
                skillLevel: input.skillLevel,
                scheduledFor: input.scheduledFor,
                sharedInCommunityId: input.sharedInCommunityId,
                creatorId: session.user.id,
                roomUrl,
                status: PeerSessionStatus.WAITING
            },
            include: {
                creator: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        image: true
                    }
                }
            }
        })

        // If shared in a community, create a post about it
        if (input.sharedInCommunityId) {
            await prisma.communityPost.create({
                data: {
                    communityId: input.sharedInCommunityId,
                    authorId: session.user.id,
                    title: `${getSessionTypeLabel(input.type)}: ${input.topic}`,
                    content: input.description || `Looking for someone to join a ${getSessionTypeLabel(input.type).toLowerCase()} session on "${input.topic}"!\n\nDuration: ${input.duration} minutes\n${input.skillLevel ? `Level: ${input.skillLevel}` : ''}`,
                    type: 'HELP_REQUEST',
                    tags: input.tags || [],
                    embeds: {
                        peerSessionId: peerSession.id,
                        roomUrl: peerSession.roomUrl
                    }
                }
            })
            revalidatePath('/community')
        }

        return { success: true, data: peerSession }
    } catch (error) {
        console.error('Error creating peer session:', error)
        return { success: false, error: "Failed to create session" }
    }
}

// Get available peer sessions
export async function getAvailablePeerSessions(options?: {
    type?: PeerSessionType
    skillLevel?: string
    limit?: number
}) {
    try {
        const session = await getServerSession(authOptions)
        const { type, skillLevel, limit = 20 } = options || {}

        const sessions = await prisma.communityPeerSession.findMany({
            where: {
                status: PeerSessionStatus.WAITING,
                participantId: null,
                ...(type && { type }),
                ...(skillLevel && { skillLevel }),
                // Exclude own sessions
                ...(session?.user?.id && { creatorId: { not: session.user.id } })
            },
            include: {
                creator: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        image: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: limit
        })

        return { success: true, data: sessions }
    } catch (error) {
        console.error('Error fetching peer sessions:', error)
        return { success: false, error: "Failed to fetch sessions" }
    }
}

// Join a peer session
export async function joinPeerSession(sessionId: string) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" }
        }

        const peerSession = await prisma.communityPeerSession.findUnique({
            where: { id: sessionId }
        })

        if (!peerSession) {
            return { success: false, error: "Session not found" }
        }

        if (peerSession.creatorId === session.user.id) {
            return { success: false, error: "You can't join your own session" }
        }

        if (peerSession.participantId) {
            return { success: false, error: "Session already has a participant" }
        }

        if (peerSession.status !== PeerSessionStatus.WAITING) {
            return { success: false, error: "Session is not available" }
        }

        const updatedSession = await prisma.communityPeerSession.update({
            where: { id: sessionId },
            data: {
                participantId: session.user.id,
                status: PeerSessionStatus.IN_PROGRESS,
                startedAt: new Date()
            },
            include: {
                creator: {
                    select: { id: true, name: true, username: true, image: true }
                },
                participant: {
                    select: { id: true, name: true, username: true, image: true }
                }
            }
        })

        return { success: true, data: updatedSession }
    } catch (error) {
        console.error('Error joining peer session:', error)
        return { success: false, error: "Failed to join session" }
    }
}

// Complete a peer session
export async function completePeerSession(sessionId: string) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" }
        }

        const peerSession = await prisma.communityPeerSession.findUnique({
            where: { id: sessionId }
        })

        if (!peerSession) {
            return { success: false, error: "Session not found" }
        }

        // Only creator or participant can complete
        if (peerSession.creatorId !== session.user.id && peerSession.participantId !== session.user.id) {
            return { success: false, error: "You're not part of this session" }
        }

        const updatedSession = await prisma.communityPeerSession.update({
            where: { id: sessionId },
            data: {
                status: PeerSessionStatus.COMPLETED,
                endedAt: new Date()
            }
        })

        return { success: true, data: updatedSession }
    } catch (error) {
        console.error('Error completing peer session:', error)
        return { success: false, error: "Failed to complete session" }
    }
}

// Cancel a peer session
export async function cancelPeerSession(sessionId: string) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" }
        }

        const peerSession = await prisma.communityPeerSession.findUnique({
            where: { id: sessionId }
        })

        if (!peerSession) {
            return { success: false, error: "Session not found" }
        }

        if (peerSession.creatorId !== session.user.id) {
            return { success: false, error: "Only the creator can cancel" }
        }

        const updatedSession = await prisma.communityPeerSession.update({
            where: { id: sessionId },
            data: { status: PeerSessionStatus.CANCELLED }
        })

        return { success: true, data: updatedSession }
    } catch (error) {
        console.error('Error cancelling peer session:', error)
        return { success: false, error: "Failed to cancel session" }
    }
}

// Get user's peer sessions
export async function getUserPeerSessions(options?: {
    status?: PeerSessionStatus
    asCreator?: boolean
    limit?: number
}) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" }
        }

        const { status, asCreator, limit = 20 } = options || {}

        const sessions = await prisma.communityPeerSession.findMany({
            where: {
                ...(status && { status }),
                ...(asCreator === true 
                    ? { creatorId: session.user.id }
                    : asCreator === false
                        ? { participantId: session.user.id }
                        : {
                            OR: [
                                { creatorId: session.user.id },
                                { participantId: session.user.id }
                            ]
                        }
                )
            },
            include: {
                creator: {
                    select: { id: true, name: true, username: true, image: true }
                },
                participant: {
                    select: { id: true, name: true, username: true, image: true }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: limit
        })

        return { success: true, data: sessions }
    } catch (error) {
        console.error('Error fetching user peer sessions:', error)
        return { success: false, error: "Failed to fetch sessions" }
    }
}

// Get peer session by ID
export async function getPeerSession(sessionId: string) {
    try {
        const peerSession = await prisma.communityPeerSession.findUnique({
            where: { id: sessionId },
            include: {
                creator: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        image: true,
                        bio: true
                    }
                },
                participant: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        image: true,
                        bio: true
                    }
                }
            }
        })

        if (!peerSession) {
            return { success: false, error: "Session not found" }
        }

        return { success: true, data: peerSession }
    } catch (error) {
        console.error('Error fetching peer session:', error)
        return { success: false, error: "Failed to fetch session" }
    }
}

// Helper function to get session type label
function getSessionTypeLabel(type: PeerSessionType): string {
    const labels: Record<PeerSessionType, string> = {
        MOCK_INTERVIEW: 'Mock Interview',
        PAIR_PROGRAMMING: 'Pair Programming',
        CODE_REVIEW: 'Code Review',
        STUDY_SESSION: 'Study Session',
        HELP_SESSION: 'Help Session'
    }
    return labels[type] || type
}

// Get session type options
export async function getPeerSessionTypes() {
    return [
        { value: 'MOCK_INTERVIEW', label: 'Mock Interview', icon: '🎤', description: 'Practice technical or behavioral interviews' },
        { value: 'PAIR_PROGRAMMING', label: 'Pair Programming', icon: '👥', description: 'Code together on a problem or project' },
        { value: 'CODE_REVIEW', label: 'Code Review', icon: '👀', description: 'Get your code reviewed by a peer' },
        { value: 'STUDY_SESSION', label: 'Study Session', icon: '📚', description: 'Study a topic together' },
        { value: 'HELP_SESSION', label: 'Help Session', icon: '🆘', description: 'Get help with a specific problem' }
    ]
}

