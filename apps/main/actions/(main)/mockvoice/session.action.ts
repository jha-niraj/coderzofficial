'use server'

import { auth } from '@repo/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

interface CreateSessionInput {
    mockId: string
    mockType: 'predefined' | 'custom'
    includesResume?: boolean
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

        // Check if user has enough credits
        if (user.credits < mock.creditsRequired) {
            return {
                success: false,
                error: 'Insufficient credits',
                required: mock.creditsRequired,
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
                    agentId: process.env.NEXT_PUBLIC_ELEVENLABS_MOCKVOICE!,
                    variables: variables as any,
                    creditsUsed: mock.creditsRequired,
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
                        decrement: mock.creditsRequired
                    }
                }
            })

            // Record credit transaction
            await tx.creditTransaction.create({
                data: {
                    userId: userId,
                    amount: -mock.creditsRequired,
                    type: 'SPEND',
                    description: `Mock Voice Interview: ${mock.title}`,
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


