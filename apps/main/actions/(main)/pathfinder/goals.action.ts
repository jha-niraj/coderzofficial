'use server'

import { auth } from '@repo/auth'
import { prisma } from '@repo/prisma'
import OpenAI from 'openai'
import { revalidatePath } from 'next/cache'
import { PathfinderCategory, PathfinderLevel, PathfinderStatus } from '@repo/prisma/client'

// ================================================================================
// TYPES
// ================================================================================

export interface CreateGoalInput {
    title: string
    slug?: string
    category: PathfinderCategory
    level: PathfinderLevel
    focusAreas: string[]
    targetDate?: Date
    duration?: 'ONE_WEEK' | 'FORTNIGHT' | 'ONE_MONTH' | 'TWO_MONTHS' | 'THREE_MONTHS' | 'SIX_MONTHS' | 'CUSTOM' | null
    estimatedDays?: number
    groupId?: string | null
}

// ================================================================================
// SLUG UTILITIES
// ================================================================================

function generateSlug(title: string): string {
    return title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Remove multiple hyphens
        .slice(0, 60) // Limit length
}

export async function checkSlugAvailability(slug: string, userId: string): Promise<{ available: boolean; suggestedSlug?: string }> {
    const existing = await prisma.pathfinderGoal.findUnique({
        where: { userId_slug: { userId, slug } },
    })
    
    if (!existing) {
        return { available: true }
    }
    
    // Generate alternative with number suffix
    let suffix = 1
    let newSlug = `${slug}-${suffix}`
    
    while (suffix < 100) {
        const exists = await prisma.pathfinderGoal.findUnique({
            where: { userId_slug: { userId, slug: newSlug } },
        })
        if (!exists) {
            return { available: false, suggestedSlug: newSlug }
        }
        suffix++
        newSlug = `${slug}-${suffix}`
    }
    
    return { available: false, suggestedSlug: `${slug}-${Date.now()}` }
}

export async function generateAndCheckSlug(title: string, userId: string): Promise<string> {
    const baseSlug = generateSlug(title)
    const { available, suggestedSlug } = await checkSlugAvailability(baseSlug, userId)
    return available ? baseSlug : (suggestedSlug || `${baseSlug}-${Date.now()}`)
}

export interface GoalWithRelations {
    id: string
    slug: string
    title: string
    category: PathfinderCategory
    level: PathfinderLevel
    focusAreas: string[]
    targetDate: Date | null
    aiGeneratedPlan: unknown
    overview: string | null
    estimatedDays: number | null
    estimatedHours: number | null
    learningObjectives: string[]
    prerequisites: string[]
    status: PathfinderStatus
    progressPercent: number
    totalSubGoals: number
    completedSubGoals: number
    totalQuizAnswered: number
    totalCodingSolved: number
    streakDays: number
    lastActivityAt: Date | null
    createdAt: Date
    updatedAt: Date
    startedAt: Date | null
    completedAt: Date | null
    studioId: string | null
    mockInterviewId: string | null
    groupId: string | null
}

// ================================================================================
// CREATE GOAL
// ================================================================================

export async function createPathfinderGoal(input: CreateGoalInput) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: 'Unauthorized' }
        }

        // Verify group belongs to user if provided
        if (input.groupId) {
            const group = await prisma.pathfinderGroup.findFirst({
                where: { id: input.groupId, userId: session.user.id },
            })
            if (!group) {
                return { success: false, error: 'Group not found' }
            }
        }

        // Generate or validate slug
        const slug = input.slug 
            ? await generateAndCheckSlug(input.slug, session.user.id)
            : await generateAndCheckSlug(input.title, session.user.id)

        // Map duration to estimatedDays if not custom
        const DURATION_DAYS: Record<string, number> = {
            ONE_WEEK: 7,
            FORTNIGHT: 14,
            ONE_MONTH: 30,
            TWO_MONTHS: 60,
            THREE_MONTHS: 90,
            SIX_MONTHS: 180,
        }
        const estimatedDays = input.duration && input.duration !== 'CUSTOM'
            ? DURATION_DAYS[input.duration] ?? input.estimatedDays
            : input.estimatedDays ?? null

        // Create the goal first
        const goal = await prisma.pathfinderGoal.create({
            data: {
                userId: session.user.id,
                title: input.title,
                slug,
                category: input.category,
                level: input.level,
                focusAreas: input.focusAreas,
                targetDate: input.targetDate,
                duration: input.duration ?? null,
                estimatedDays,
                groupId: input.groupId || null,
                status: 'ACTIVE',
            },
        })

        // Generate AI plan in the background (non-blocking for better UX)
        generateAIPlanForGoal(goal.id, input, session.user.id)

        revalidatePath('/pathfinder')
        return { success: true, goalId: goal.id, slug: goal.slug }
    } catch (error) {
        console.error('Error creating goal:', error)
        return { success: false, error: 'Failed to create goal' }
    }
}

// ================================================================================
// GENERATE AI PLAN
// ================================================================================

async function generateAIPlanForGoal(
    goalId: string,
    input: CreateGoalInput,
    userId: string
) {
    try {
        const assistantId = process.env.PATHFINDER_ASSISTANT_ID
        if (!assistantId) {
            console.error('PATHFINDER_ASSISTANT_ID not configured')
            return
        }

        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        })

        // Create a thread with the user's goal input
        const thread = await openai.beta.threads.create({
            messages: [
                {
                    role: 'user',
                    content: JSON.stringify({
                        goal: {
                            title: input.title,
                            category: input.category,
                            level: input.level,
                            focusAreas: input.focusAreas,
                            targetDuration: 20, // Default hours
                        },
                    }),
                },
            ],
        })

        // Run the assistant
        const run = await openai.beta.threads.runs.create(thread.id, {
            assistant_id: assistantId,
        })

        // Poll for completion
        let runStatus = await openai.beta.threads.runs.retrieve(run.id, { thread_id: thread.id })
        let attempts = 0
        const maxAttempts = 60 // 60 seconds max

        while (runStatus.status !== 'completed' && attempts < maxAttempts) {
            await new Promise((resolve) => setTimeout(resolve, 1000))
            runStatus = await openai.beta.threads.runs.retrieve(run.id, { thread_id: thread.id })
            attempts++

            if (runStatus.status === 'failed' || runStatus.status === 'cancelled') {
                throw new Error(`Assistant run ${runStatus.status}`)
            }
        }

        if (runStatus.status !== 'completed') {
            throw new Error('Assistant run timed out')
        }

        // Get the assistant's response
        const messages = await openai.beta.threads.messages.list(thread.id)
        const assistantMessage = messages.data.find((m) => m.role === 'assistant')

        if (!assistantMessage?.content?.[0]) {
            throw new Error('No response from assistant')
        }

        const content = assistantMessage.content[0]
        if (content.type !== 'text') {
            throw new Error('Unexpected response type')
        }

        // Parse the AI-generated plan
        const aiPlan = JSON.parse(content.text.value)

        // Create a Studio for this goal
        const studio = await prisma.studio.create({
            data: {
                userId,
                title: `${input.title} - Learning Notes`,
                description: aiPlan.overview || `Notes and practice for ${input.title}`,
                emoji: getCategoryEmoji(input.category),
                category: 'INTERVIEW_PREP',
                visibility: 'PRIVATE',
                content: [],
            },
        })

        // Create a Mock Interview for this goal (if applicable)
        let mockInterview = null
        if (aiPlan.mockInterview) {
            mockInterview = await prisma.mockInterviewVoice.create({
                data: {
                    title: aiPlan.mockInterview.title,
                    description: aiPlan.mockInterview.description,
                    category: mapToMockCategory(input.category),
                    level: mapToMockLevel(input.level),
                    duration: aiPlan.mockInterview.duration || 15,
                    questionsCount: aiPlan.mockInterview.questionsCount || 5,
                    knowledgeBase: aiPlan.mockInterview.knowledgeBase,
                    isPublic: false,
                    isPredefined: false,
                    createdById: userId,
                    includesResume: false,
                },
            })
        }

        // Create verification record
        // Projects are optional - only for non-DSA categories
        const hasProjects = aiPlan.minorProject || aiPlan.majorProject
        await prisma.pathfinderVerification.create({
            data: {
                goalId,
                quizStatus: 'PENDING',
                codingStatus: 'LOCKED',
                mockStatus: 'LOCKED',
                projectStatus: hasProjects ? 'LOCKED' : 'PENDING', // PENDING means N/A for DSA
            },
        })

        // NOTE: Daily tasks are NOT generated by AI anymore.
        // Users create their own daily sub-goals, and we generate quiz/coding dynamically.

        // Update the goal with AI plan and relations
        await prisma.pathfinderGoal.update({
            where: { id: goalId },
            data: {
                aiGeneratedPlan: aiPlan,
                overview: aiPlan.overview,
                estimatedDays: aiPlan.estimatedDays,
                estimatedHours: aiPlan.duration,
                learningObjectives: aiPlan.learningObjectives || [],
                prerequisites: aiPlan.prerequisites || [],
                studioId: studio.id,
                mockInterviewId: mockInterview?.id,
                startedAt: new Date(),
            },
        })

        console.log(`AI plan generated for goal ${goalId}`)
    } catch (error) {
        console.error('Error generating AI plan:', error)

        // Update goal to indicate plan generation failed
        await prisma.pathfinderGoal.update({
            where: { id: goalId },
            data: {
                overview: 'AI plan generation is in progress. Please refresh in a moment.',
            },
        })
    }
}

// ================================================================================
// GET GOALS
// ================================================================================

export async function getUserPathfinderGoals() {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: 'Unauthorized', goals: [], groups: [] }
        }

        // Fetch goals
        const goals = await prisma.pathfinderGoal.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: 'desc' },
            include: {
                verification: true,
                group: true,
                dailySessions: {
                    orderBy: { date: 'desc' },
                    take: 7, // Last 7 days of sessions
                    include: {
                        _count: {
                            select: {
                                subGoals: true,
                            },
                        },
                    },
                },
            },
        })

        // Fetch groups
        const groups = await prisma.pathfinderGroup.findMany({
            where: { userId: session.user.id },
            orderBy: { order: 'asc' },
            include: {
                _count: {
                    select: { goals: true },
                },
            },
        })

        return { success: true, goals, groups }
    } catch (error) {
        console.error('Error fetching goals:', error)
        return { success: false, error: 'Failed to fetch goals', goals: [], groups: [] }
    }
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function getPathfinderGoal(slugOrId: string) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: 'Unauthorized', goal: null }
        }

        const isUuid = UUID_REGEX.test(slugOrId)
        const goal = await prisma.pathfinderGoal.findFirst({
            where: isUuid
                ? { id: slugOrId, userId: session.user.id }
                : { userId: session.user.id, slug: slugOrId },
            include: {
                verification: true,
                group: true,
                dailySessions: {
                    orderBy: { date: 'desc' },
                    include: {
                        subGoals: {
                            orderBy: { order: 'asc' },
                        },
                    },
                },
                studio: true,
                mockInterview: true,
            },
        })

        if (!goal) {
            return { success: false, error: 'Goal not found', goal: null }
        }

        return { success: true, goal }
    } catch (error) {
        console.error('Error fetching goal:', error)
        return { success: false, error: 'Failed to fetch goal', goal: null }
    }
}

// ================================================================================
// UPDATE GOAL STATUS
// ================================================================================

export async function updateGoalStatus(goalId: string, status: PathfinderStatus) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: 'Unauthorized' }
        }

        const goal = await prisma.pathfinderGoal.findFirst({
            where: { id: goalId, userId: session.user.id },
        })

        if (!goal) {
            return { success: false, error: 'Goal not found' }
        }

        await prisma.pathfinderGoal.update({
            where: { id: goalId },
            data: {
                status,
                ...(status === 'VERIFICATION' ? { verificationStartedAt: new Date() } : {}),
                ...(status === 'COMPLETED' ? { completedAt: new Date() } : {}),
            },
        })

        revalidatePath('/pathfinder')
        return { success: true }
    } catch (error) {
        console.error('Error updating goal status:', error)
        return { success: false, error: 'Failed to update goal status' }
    }
}

// ================================================================================
// DELETE GOAL
// ================================================================================

export async function deletePathfinderGoal(goalId: string) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: 'Unauthorized' }
        }

        const goal = await prisma.pathfinderGoal.findFirst({
            where: { id: goalId, userId: session.user.id },
        })

        if (!goal) {
            return { success: false, error: 'Goal not found' }
        }

        await prisma.pathfinderGoal.delete({
            where: { id: goalId },
        })

        revalidatePath('/pathfinder')
        return { success: true }
    } catch (error) {
        console.error('Error deleting goal:', error)
        return { success: false, error: 'Failed to delete goal' }
    }
}

// ================================================================================
// HELPER FUNCTIONS
// ================================================================================

function getCategoryEmoji(category: PathfinderCategory): string {
    const emojis: Record<PathfinderCategory, string> = {
        DSA: '🧮',
        WEB_DEVELOPMENT: '🌐',
        FRONTEND: '🎨',
        BACKEND: '⚙️',
        DEVOPS: '🚀',
        AI_ML: '🤖',
        DATABASE: '🗄️',
        SYSTEM_DESIGN: '🏗️',
        MOBILE: '📱',
        OTHER: '📚',
    }
    return emojis[category] || '📚'
}

function mapToMockCategory(category: PathfinderCategory): 'TECHNICAL' | 'CODING' | 'SYSTEM_DESIGN' | 'GENERAL' {
    const mapping: Record<PathfinderCategory, 'TECHNICAL' | 'CODING' | 'SYSTEM_DESIGN' | 'GENERAL'> = {
        DSA: 'CODING',
        WEB_DEVELOPMENT: 'TECHNICAL',
        FRONTEND: 'TECHNICAL',
        BACKEND: 'TECHNICAL',
        DEVOPS: 'TECHNICAL',
        AI_ML: 'TECHNICAL',
        DATABASE: 'TECHNICAL',
        SYSTEM_DESIGN: 'SYSTEM_DESIGN',
        MOBILE: 'TECHNICAL',
        OTHER: 'GENERAL',
    }
    return mapping[category]
}

function mapToMockLevel(level: PathfinderLevel): 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT' {
    return level
}
