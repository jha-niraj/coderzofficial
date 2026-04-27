'use server'

import { auth } from '@repo/auth'
import { prisma } from '@repo/prisma'
import { revalidatePath } from 'next/cache'

interface CreateSessionInput {
    mockId: string
    mockType: 'predefined' | 'custom'
    includesResume?: boolean
    /** When set, charge this amount instead of mock.creditsRequired (e.g. half for retake) */
    retakeCredits?: number
}

interface SessionVariables {
    username: string
    position: string
    level: string
    description: string
    knowledge_base: string
    resume_content?: string | null
}

export async function createMockVoiceSession(input: CreateSessionInput) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: 'Unauthorized' }
        }

        const agentId = process.env.NEXT_PUBLIC_MOCK_VOICE_AI_ASSISTANT
        if (!agentId) {
            return { success: false, error: 'Voice interview service is not configured. Please contact support.' }
        }

        const userId = session.user.id

        // Get user and mock details
        const [user, mock] = await Promise.all([
            prisma.user.findUnique({
                where: { id: userId },
                select: {
                    id: true,
                    name: true,
                    username: true,
                    credits: true,
                    resumeText: true,
                    hasResume: true
                }
            }),
            prisma.mockInterviewVoice.findUnique({
                where: { id: input.mockId },
                select: {
                    id: true,
                    title: true,
                    description: true,
                    level: true,
                    category: true,
                    knowledgeBase: true,
                    creditsRequired: true,
                    includesResume: true,
                    duration: true
                }
            })
        ])

        if (!user) {
            return { success: false, error: 'User not found' }
        }

        if (!mock) {
            return { success: false, error: 'Mock interview not found' }
        }

        const creditsToCharge = input.retakeCredits ?? mock.creditsRequired

        // Check if user has enough credits
        if (user.credits < creditsToCharge) {
            return {
                success: false,
                error: 'Insufficient credits',
                required: creditsToCharge,
                available: user.credits
            }
        }

        // Create session and deduct credits in a transaction
        const result = await prisma.$transaction(async (tx) => {
            // Prepare variables for ElevenLabs
            // Resume text is already formatted when stored in database
            const resumeContent = (input.includesResume && user.hasResume && user.resumeText)
                ? user.resumeText
                : null

            const variables: SessionVariables = {
                username: user.name?.split(' ')[0] || user.username || 'there',
                position: mock.title,
                level: mock.level,
                description: mock.description,
                knowledge_base: mock.knowledgeBase,
                resume_content: resumeContent
            }

            // Create session FIRST
            const mockSession = await tx.mockVoiceSession.create({
                data: {
                    mockId: input.mockId,
                    userId: userId,
                    status: 'SCHEDULED',
                    agentId: agentId,
                    variables: variables as any,
                    creditsUsed: creditsToCharge,
                    scheduledFor: new Date()
                },
                select: {
                    id: true,
                    variables: true,
                    agentId: true
                }
            })

            // Deduct credits ONLY AFTER successful session creation
            await tx.user.update({
                where: { id: userId },
                data: {
                    credits: {
                        decrement: creditsToCharge
                    }
                }
            })

            // Record credit transaction
            await tx.creditTransaction.create({
                data: {
                    userId: userId,
                    amount: -creditsToCharge,
                    type: 'SPEND',
                    description: input.retakeCredits ? `Mock Voice Retake: ${mock.title}` : `Mock Voice Interview: ${mock.title}`,
                    currency: "INR"
                }
            })

            return mockSession
        })

        revalidatePath('/mockinterview')

        return {
            success: true,
            sessionId: result.id,
            agentId: result.agentId,
            variables: result.variables as unknown as SessionVariables
        }

    } catch (error) {
        console.error('Error creating mock voice session:', error)
        return {
            success: false,
            error: 'Failed to create session. Please try again.'
        }
    }
}

export async function updateSessionStatus(sessionId: string, status: 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED') {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: 'Unauthorized' }
        }

        await prisma.mockVoiceSession.update({
            where: {
                id: sessionId,
                userId: session.user.id
            },
            data: {
                status,
                startedAt: status === 'IN_PROGRESS' ? new Date() : undefined,
                completedAt: status === 'COMPLETED' ? new Date() : undefined
            }
        })

        return { success: true }
    } catch (error) {
        console.error('Error updating session status:', error)
        return { success: false, error: 'Failed to update status' }
    }
}

export async function saveConversationData(
    sessionId: string,
    conversationId: string,
    startedAt?: Date
) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: 'Unauthorized' }
        }

        await prisma.mockVoiceSession.update({
            where: {
                id: sessionId,
                userId: session.user.id
            },
            data: {
                conversationId,
                status: 'IN_PROGRESS',
                startedAt: startedAt || new Date()
            }
        })

        return { success: true }
    } catch (error) {
        console.error('Error saving conversation data:', error)
        return { success: false, error: 'Failed to save conversation data' }
    }
}

export async function getSessionDetails(sessionId: string) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: 'Unauthorized' }
        }

        const mockSession = await prisma.mockVoiceSession.findUnique({
            where: {
                id: sessionId,
                userId: session.user.id
            },
            include: {
                mock: {
                    select: {
                        title: true,
                        description: true,
                        level: true,
                        category: true,
                        duration: true
                    }
                }
            }
        })

        if (!mockSession) {
            return { success: false, error: 'Session not found' }
        }

        return {
            success: true,
            session: mockSession
        }
    } catch (error) {
        console.error('Error getting session details:', error)
        return { success: false, error: 'Failed to get session details' }
    }
}

/**
 * Get session count for a user on a specific mock, plus whether they are the creator.
 * Used by purchase-mock-sheet to determine pricing (free retakes vs half price vs full).
 */
export async function getMockSessionInfo(mockId: string) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: 'Unauthorized' }
        }

        const [sessionCount, mock] = await Promise.all([
            prisma.mockVoiceSession.count({
                where: {
                    mockId,
                    userId: session.user.id,
                    status: { in: ['COMPLETED', 'IN_PROGRESS', 'SCHEDULED'] }
                }
            }),
            prisma.mockInterviewVoice.findUnique({
                where: { id: mockId },
                select: {
                    createdById: true,
                    creditsRequired: true
                }
            })
        ])

        if (!mock) {
            return { success: false, error: 'Mock not found' }
        }

        const isCreator = mock.createdById === session.user.id
        // First 3 sessions are included (free) if the user created this mock
        // After 3: creator pays half, non-creator pays full
        const freeSessionsUsed = isCreator ? Math.min(sessionCount, 3) : 0
        const freeSessionsRemaining = isCreator ? Math.max(0, 3 - sessionCount) : 0
        const needsPayment = isCreator ? sessionCount >= 3 : true
        const creditsToCharge = needsPayment
            ? (isCreator ? Math.ceil(mock.creditsRequired / 2) : mock.creditsRequired)
            : 0

        return {
            success: true,
            data: {
                sessionCount,
                isCreator,
                freeSessionsRemaining,
                needsPayment,
                creditsToCharge,
                fullPrice: mock.creditsRequired
            }
        }
    } catch (error) {
        console.error('Error getting mock session info:', error)
        return { success: false, error: 'Failed to get session info' }
    }
}

export async function getElevenLabsToken(agentId?: string | null) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: 'Unauthorized' }
        }

        const resolvedAgentId = agentId || process.env.NEXT_PUBLIC_MOCK_VOICE_AI_ASSISTANT
        if (!resolvedAgentId) {
            return { success: false, error: 'Voice interview agent is not configured. Please contact support.' }
        }

        const response = await fetch(
            `https://api.elevenlabs.io/v1/convai/conversation/token?agent_id=${resolvedAgentId}`,
            {
                method: 'GET',
                headers: {
                    "xi-api-key": process.env.ELEVENLABS_API_KEY as string,
                },
                cache: 'no-store'
            }
        )

        if (!response.ok) {
            console.error('Failed to get conversation token:', response.statusText)
            return { success: false, error: 'Failed to get conversation token' }
        }

        const data = await response.json()
        return { success: true, token: data.token }
    } catch (error) {
        console.error('Error getting elevenlabs token:', error)
        return { success: false, error: 'Failed to get elevenlabs token' }
    }
}