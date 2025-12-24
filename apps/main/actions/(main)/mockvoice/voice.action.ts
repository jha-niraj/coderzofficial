'use server'

import { auth } from '@repo/auth'
import { prisma } from '@repo/prisma'
import { revalidatePath } from 'next/cache'
import OpenAI from 'openai'
import { MockCategory, MockLevel } from '@prisma/client'

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
})

// ==========================================
// TYPES
// ==========================================

interface CreateCustomMockInput {
    title: string
    description: string
    category: MockCategory
    level: string
    duration: number
    questionsCount: number
    includeResume: boolean
    isPublic: boolean
    knowledgeBase?: string
}

// ==========================================
// MOCK CATEGORY DEFINITIONS (for client)
// ==========================================

export const MOCK_CATEGORIES = [
    { value: 'ALL', label: 'All Categories', icon: '🎯' },
    { value: 'TECHNICAL', label: 'Technical', icon: '💻' },
    { value: 'BEHAVIORAL', label: 'Behavioral', icon: '🤝' },
    { value: 'HR', label: 'HR', icon: '👔' },
    { value: 'SYSTEM_DESIGN', label: 'System Design', icon: '🏗️' },
    { value: 'LEADERSHIP', label: 'Leadership', icon: '👑' },
    { value: 'NEGOTIATION', label: 'Negotiation', icon: '💰' },
    { value: 'CODING', label: 'Coding', icon: '⌨️' },
    { value: 'CASE_STUDY', label: 'Case Study', icon: '📊' },
    { value: 'GENERAL', label: 'General', icon: '📋' },
] as const

export const MOCK_LEVELS = [
    { value: 'ALL', label: 'All Levels' },
    { value: 'BEGINNER', label: 'Beginner' },
    { value: 'INTERMEDIATE', label: 'Intermediate' },
    { value: 'ADVANCED', label: 'Advanced' },
    { value: 'EXPERT', label: 'Expert' },
] as const

// ==========================================
// FETCH ADMIN MOCKS (by category for tabs)
// ==========================================

export async function getAdminMocksByCategory(category?: MockCategory | 'ALL', limit: number = 6) {
    try {
        const where: any = {
            byAdmin: true,
            isPublic: true
        }

        if (category && category !== 'ALL') {
            where.category = category
        }

        const mocks = await prisma.mockInterviewVoice.findMany({
            where,
            take: limit,
            orderBy: [
                { isFeatured: 'desc' },
                { popularity: 'desc' },
                { createdAt: 'desc' }
            ],
            select: {
                id: true,
                title: true,
                description: true,
                category: true,
                level: true,
                duration: true,
                questionsCount: true,
                creditsRequired: true,
                tags: true,
                isFeatured: true,
                byAdmin: true,
                popularity: true,
                totalSessions: true,
                averageRating: true,
                createdAt: true
            }
        })

        return {
            success: true,
            mocks
        }
    } catch (error) {
        console.error('Error fetching admin mocks:', error)
        return {
            success: false,
            error: 'Failed to fetch mocks',
            mocks: []
        }
    }
}

// Get all admin mocks grouped by category
export async function getAllAdminMocksGrouped() {
    try {
        const mocks = await prisma.mockInterviewVoice.findMany({
            where: {
                byAdmin: true,
                isPublic: true
            },
            orderBy: [
                { isFeatured: 'desc' },
                { popularity: 'desc' }
            ],
            select: {
                id: true,
                title: true,
                description: true,
                category: true,
                level: true,
                duration: true,
                questionsCount: true,
                creditsRequired: true,
                tags: true,
                isFeatured: true,
                byAdmin: true,
                popularity: true,
                totalSessions: true,
                averageRating: true
            }
        })

        // Group by category
        const grouped = mocks.reduce((acc, mock) => {
            const cat = mock.category
            if (!acc[cat]) acc[cat] = []
            acc[cat].push(mock)
            return acc
        }, {} as Record<string, typeof mocks>)

        return {
            success: true,
            mocks,
            grouped
        }
    } catch (error) {
        console.error('Error fetching grouped admin mocks:', error)
        return {
            success: false,
            error: 'Failed to fetch mocks',
            mocks: [],
            grouped: {}
        }
    }
}

// Get featured mocks (for hero section)
export async function getFeaturedAdminMocks(limit: number = 6) {
    try {
        const mocks = await prisma.mockInterviewVoice.findMany({
            where: {
                byAdmin: true,
                isFeatured: true,
                isPublic: true
            },
            take: limit,
            orderBy: [
                { popularity: 'desc' }
            ],
            select: {
                id: true,
                title: true,
                description: true,
                category: true,
                level: true,
                duration: true,
                questionsCount: true,
                creditsRequired: true,
                tags: true,
                isFeatured: true,
                byAdmin: true,
                popularity: true,
                averageRating: true
            }
        })

        return {
            success: true,
            mocks
        }
    } catch (error) {
        console.error('Error fetching featured mocks:', error)
        return {
            success: false,
            error: 'Failed to fetch featured mocks',
            mocks: []
        }
    }
}

// Get a single mock by ID
export async function getMockById(mockId: string) {
    try {
        const mock = await prisma.mockInterviewVoice.findUnique({
            where: { id: mockId },
            include: {
                createdBy: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        image: true
                    }
                }
            }
        })

        if (!mock) {
            return {
                success: false,
                error: 'Mock not found'
            }
        }

        return {
            success: true,
            mock
        }
    } catch (error) {
        console.error('Error fetching mock:', error)
        return {
            success: false,
            error: 'Failed to fetch mock'
        }
    }
}

// Create a custom mock interview
export async function createCustomMockVoice(input: CreateCustomMockInput) {
    try {
        const session = await auth()
        
        if (!session?.user?.id) {
            return {
                success: false,
                error: 'You must be logged in to create a mock interview'
            }
        }

        // Validate input
        if (!input.title.trim() || !input.description.trim()) {
            return {
                success: false,
                error: 'Title and description are required'
            }
        }

        // Calculate credits
        const baseCredits = input.duration
        const questionCredits = input.questionsCount * 2
        const subtotal = (baseCredits + questionCredits) * (input.isPublic ? 0.5 : 1)
        const resumeCredits = input.includeResume ? 5 : 0
        const creditsRequired = Math.ceil(subtotal + resumeCredits)

        // Check user credits
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { credits: true, resume: true }
        })

        if (!user) {
            return {
                success: false,
                error: 'User not found'
            }
        }

        if (user.credits < creditsRequired) {
            return {
                success: false,
                error: `Insufficient credits. You need ${creditsRequired} credits but have ${user.credits}`
            }
        }

        if (input.includeResume && !user.resume) {
            return {
                success: false,
                error: 'Resume is required but not found. Please upload your resume first.'
            }
        }

        // Generate or use provided knowledge base
        let knowledgeBase: string
        
        // If user provided their own knowledge base/syllabus, use it with enhancements
        if (input.knowledgeBase && input.knowledgeBase.trim().length > 50) {
            try {
                const completion = await openai.chat.completions.create({
                    model: "gpt-4o-mini",
                    messages: [
                        {
                            role: "system",
                            content: "You are an expert interviewer. Enhance the provided syllabus/study materials into a structured interview knowledge base while preserving all the original content and topics."
                        },
                        {
                            role: "user",
                            content: `Create an interview knowledge base for: "${input.title}" (${input.level} level)

The user has provided their syllabus/study materials:
---
${input.knowledgeBase}
---

Interview Parameters:
- Questions: ${input.questionsCount}
- Duration: ${input.duration} minutes
- Level: ${input.level}
${input.includeResume ? '- Include resume-based questions' : ''}

Create a structured knowledge base that:
1. Covers ALL topics from the provided syllabus
2. Includes question suggestions for each topic
3. Defines expected answer depth for ${input.level} level
4. Adds follow-up question strategies

Preserve the user's content structure and priorities.`
                        }
                    ],
                    temperature: 0.5,
                    max_tokens: 2500
                })

                knowledgeBase = completion.choices[0]?.message?.content || input.knowledgeBase
            } catch (error) {
                console.error('Error enhancing knowledge base:', error)
                // Use the user's content directly as fallback
                knowledgeBase = `You are conducting a ${input.level.toLowerCase()} level interview for: ${input.title}

STUDY MATERIALS/SYLLABUS PROVIDED BY USER:
${input.knowledgeBase}

Interview Parameters:
- Questions: ${input.questionsCount}
- Duration: ${input.duration} minutes
- Level: ${input.level}

Ask questions directly from the topics above. Focus on the user's provided content.
${input.includeResume ? 'Also personalize questions based on their resume.' : ''}`
            }
        } else {
            // Generate knowledge base from scratch using AI
            try {
                const completion = await openai.chat.completions.create({
                    model: "gpt-4o-mini",
                    messages: [
                        {
                            role: "system",
                            content: "You are an expert technical interviewer and career coach. Generate comprehensive, detailed knowledge bases for mock interviews that will guide an AI interviewer."
                        },
                        {
                            role: "user",
                            content: `Generate a comprehensive knowledge base for conducting a ${input.level.toLowerCase()} level interview for the position: "${input.title}".

Job Description/Focus Areas:
${input.description}

Interview Parameters:
- Number of Questions: ${input.questionsCount}
- Duration: ${input.duration} minutes
- Experience Level: ${input.level}
${input.includeResume ? '- The candidate will provide their resume for personalized questions' : ''}

Create a detailed knowledge base that includes:
1. Key technical skills and concepts to assess
2. Specific question types (technical, behavioral, scenario-based)
3. Expected depth of answers for ${input.level} level
4. Red flags to watch for
5. Positive indicators of strong candidates
6. Follow-up question strategies
7. Industry-specific best practices

Make it specific, actionable, and comprehensive enough for an AI to conduct a professional interview.`
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 2000
                })

                knowledgeBase = completion.choices[0]?.message?.content || `You are conducting a ${input.level.toLowerCase()} level interview for ${input.title}. ${input.description}`
            } catch (error) {
                console.error('Error generating knowledge base:', error)
                // Fallback to basic knowledge base if OpenAI fails
                knowledgeBase = `You are conducting a ${input.level.toLowerCase()} level interview for the position of ${input.title}.

Description: ${input.description}

Interview Structure:
- Total Questions: ${input.questionsCount}
- Duration: ${input.duration} minutes
- Level: ${input.level}

Ask relevant questions based on the description and level. Focus on assessing the candidate's:
- Technical knowledge and skills
- Problem-solving abilities
- Communication clarity
- Experience and understanding

${input.includeResume ? 'The candidate has provided their resume. Use this context to ask personalized questions about their experience.' : ''}

Be professional, supportive, and constructive in your approach.`
            }
        }

        // Create mock in transaction (AFTER successful knowledge base generation)
        const result = await prisma.$transaction(async (tx) => {
            // Create mock first
            const mock = await tx.mockInterviewVoice.create({
                data: {
                    title: input.title.trim(),
                    description: input.description.trim(),
                    category: input.category || 'TECHNICAL',
                    level: input.level as MockLevel,
                    duration: input.duration,
                    questionsCount: input.questionsCount,
                    isPublic: input.isPublic,
                    isPredefined: false,
                    byAdmin: false,
                    knowledgeBase,
                    createdById: session.user.id,
                    includesResume: input.includeResume,
                    baseCredits: baseCredits + questionCredits,
                    creditsRequired,
                    tags: []
                },
                select: {
                    id: true
                }
            })

            // Deduct credits ONLY AFTER successful mock creation
            await tx.user.update({
                where: { id: session.user.id },
                data: {
                    credits: {
                        decrement: creditsRequired
                    }
                }
            })

            // Record credit transaction
            await tx.creditTransaction.create({
                data: {
                    userId: session.user.id,
                    amount: -creditsRequired,
                    type: 'SPEND',
                    description: `Custom Mock Interview: ${input.title}`,
                    currency: 'INR'
                }
            })

            return mock
        })

        revalidatePath('/mockinterview/voice')
        revalidatePath('/mockinterview/voice/publicmocks')
        revalidatePath('/mockinterview/voice/mymocks')

        return {
            success: true,
            mockId: result.id
        }
    } catch (error) {
        console.error('Error creating custom mock:', error)
        return {
            success: false,
            error: 'Failed to create mock interview. Please try again.'
        }
    }
}

// Get featured public voice mocks for the main page (4+ stars)
export async function getFeaturedPublicMocks(limit: number = 6) {
    try {
        const mocks = await prisma.mockInterviewVoice.findMany({
            where: {
                isPublic: true,
                isPredefined: false,
                averageRating: {
                    gte: 4.0
                }
            },
            take: limit,
            orderBy: [
                { averageRating: 'desc' },
                { totalSessions: 'desc' }
            ],
            include: {
                createdBy: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        image: true
                    }
                },
                _count: {
                    select: {
                        sessions: true
                    }
                }
            }
        })

        return {
            success: true,
            mocks
        }
    } catch (error) {
        console.error('Error fetching featured mocks:', error)
        return {
            success: false,
            error: 'Failed to fetch featured mocks',
            mocks: []
        }
    }
}

// Get user's created mocks
export async function getCreatedVoiceMocks(category?: MockCategory, limit: number = 50) {
    try {
        const session = await auth()
        
        if (!session?.user?.id) {
            return {
                success: false,
                error: 'You must be logged in',
                mocks: []
            }
        }

        const where: any = {
            createdById: session.user.id
        }

        if (category) {
            where.category = category
        }

        const mocks = await prisma.mockInterviewVoice.findMany({
            where,
            take: limit,
            orderBy: [
                { createdAt: 'desc' }
            ],
            select: {
                id: true,
                title: true,
                description: true,
                category: true,
                level: true,
                duration: true,
                questionsCount: true,
                creditsRequired: true,
                tags: true,
                isPublic: true,
                byAdmin: true,
                popularity: true,
                totalSessions: true,
                averageRating: true,
                createdAt: true
            }
        })

        return {
            success: true,
            mocks
        }
    } catch (error) {
        console.error('Error fetching user mocks:', error)
        return {
            success: false,
            error: 'Failed to fetch mocks',
            mocks: []
        }
    }
}

// Get public voice mocks with pagination and filtering
export async function getPublicVoiceMocks(params?: {
    page?: number
    limit?: number
    level?: string
    category?: string
    search?: string
    includeAdmin?: boolean
}) {
    try {
        const page = params?.page || 1
        const limit = params?.limit || 20
        const skip = (page - 1) * limit

        const where: any = {
            isPublic: true
        }

        // By default, exclude admin mocks unless specifically requested
        if (!params?.includeAdmin) {
            where.byAdmin = false
        }

        if (params?.level && params.level !== 'ALL') {
            where.level = params.level
        }

        if (params?.category && params.category !== 'ALL') {
            where.category = params.category
        }

        if (params?.search) {
            where.OR = [
                { title: { contains: params.search, mode: 'insensitive' } },
                { description: { contains: params.search, mode: 'insensitive' } }
            ]
        }

        const [mocks, total] = await Promise.all([
            prisma.mockInterviewVoice.findMany({
                where,
                skip,
                take: limit,
                orderBy: [
                    { byAdmin: 'desc' },
                    { popularity: 'desc' },
                    { createdAt: 'desc' }
                ],
                include: {
                    createdBy: {
                        select: {
                            id: true,
                            name: true,
                            username: true,
                            image: true
                        }
                    }
                }
            }),
            prisma.mockInterviewVoice.count({ where })
        ])

        return {
            success: true,
            mocks,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: page
        }
    } catch (error) {
        console.error('Error fetching public mocks:', error)
        return {
            success: false,
            error: 'Failed to fetch public mocks'
        }
    }
}

// Get all public mocks (admin + user) with category filter
export async function getAllPublicMocks(params?: {
    page?: number
    limit?: number
    level?: string
    category?: string
    search?: string
}) {
    try {
        const page = params?.page || 1
        const limit = params?.limit || 20
        const skip = (page - 1) * limit

        const where: any = {
            isPublic: true
        }

        if (params?.level && params.level !== 'ALL') {
            where.level = params.level
        }

        if (params?.category && params.category !== 'ALL') {
            where.category = params.category
        }

        if (params?.search) {
            where.OR = [
                { title: { contains: params.search, mode: 'insensitive' } },
                { description: { contains: params.search, mode: 'insensitive' } }
            ]
        }

        const [mocks, total] = await Promise.all([
            prisma.mockInterviewVoice.findMany({
                where,
                skip,
                take: limit,
                orderBy: [
                    { byAdmin: 'desc' },
                    { isFeatured: 'desc' },
                    { popularity: 'desc' },
                    { createdAt: 'desc' }
                ],
                include: {
                    createdBy: {
                        select: {
                            id: true,
                            name: true,
                            username: true,
                            image: true
                        }
                    }
                }
            }),
            prisma.mockInterviewVoice.count({ where })
        ])

        return {
            success: true,
            mocks,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: page
        }
    } catch (error) {
        console.error('Error fetching all public mocks:', error)
        return {
            success: false,
            error: 'Failed to fetch mocks'
        }
    }
}

// Get user's created mocks
export async function getUserCreatedMocks(userId?: string) {
    try {
        const session = await auth()
        
        if (!session?.user?.id) {
            return {
                success: false,
                error: 'Authentication required'
            }
        }

        const targetUserId = userId || session.user.id

        const mocks = await prisma.mockInterviewVoice.findMany({
            where: {
                createdById: targetUserId,
                isPredefined: false
            },
            orderBy: {
                createdAt: 'desc'
            },
            include: {
                _count: {
                    select: {
                        sessions: true
                    }
                }
            }
        })

        return {
            success: true,
            mocks
        }
    } catch (error) {
        console.error('Error fetching user created mocks:', error)
        return {
            success: false,
            error: 'Failed to fetch your mocks'
        }
    }
}

// Get user's taken mock sessions
export async function getUserMockSessions(userId?: string) {
    try {
        const session = await auth()
        
        if (!session?.user?.id) {
            return {
                success: false,
                error: 'Authentication required'
            }
        }

        const targetUserId = userId || session.user.id

        const sessions = await prisma.mockVoiceSession.findMany({
            where: {
                userId: targetUserId
            },
            orderBy: {
                createdAt: 'desc'
            },
            include: {
                mock: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        level: true,
                        category: true,
                        duration: true,
                        creditsRequired: true
                    }
                }
            }
        })

        return {
            success: true,
            sessions
        }
    } catch (error) {
        console.error('Error fetching user sessions:', error)
        return {
            success: false,
            error: 'Failed to fetch your sessions'
        }
    }
}

// Delete a user's custom mock
export async function deleteCustomMock(mockId: string) {
    try {
        const session = await auth()
        
        if (!session?.user?.id) {
            return {
                success: false,
                error: 'Authentication required'
            }
        }

        // Verify ownership
        const mock = await prisma.mockInterviewVoice.findUnique({
            where: { id: mockId },
            select: { createdById: true, isPredefined: true }
        })

        if (!mock) {
            return {
                success: false,
                error: 'Mock not found'
            }
        }

        if (mock.isPredefined) {
            return {
                success: false,
                error: 'Cannot delete predefined mocks'
            }
        }

        if (mock.createdById !== session.user.id) {
            return {
                success: false,
                error: 'You can only delete your own mocks'
            }
        }

        await prisma.mockInterviewVoice.delete({
            where: { id: mockId }
        })

        revalidatePath('/mockinterview/voice/mymocks')
        revalidatePath('/mockinterview/voice/publicmocks')

        return {
            success: true
        }
    } catch (error) {
        console.error('Error deleting mock:', error)
        return {
            success: false,
            error: 'Failed to delete mock'
        }
    }
}


