'use server'

import { auth } from '@repo/auth'
import { prisma } from '@repo/prisma'
import { revalidatePath } from 'next/cache'
import { 
    PathfinderCategory, PathfinderLevel, PathfinderStatus, Currency 
} from '@repo/prisma/client'
import { PATHFINDER_CREDITS } from '@/lib/constants/pricing'

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
    /** false = private (5 credits), true = public (free) */
    isPublic?: boolean
    /** If true, AI generates a study plan (5-15 subgoals) after goal creation */
    generateAIPlan?: boolean
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

        const isPublic = input.isPublic ?? true

        // Private goals cost 5 credits
        if (!isPublic) {
            const user = await prisma.user.findUnique({
                where: { id: session.user.id },
                select: { credits: true },
            })
            const required = PATHFINDER_CREDITS.privateGoalCreation
            if (!user || user.credits < required) {
                return {
                    success: false,
                    error: `Insufficient credits. Private goals require ${required} credits.`,
                    code: 'INSUFFICIENT_CREDITS',
                    required,
                    available: user?.credits ?? 0,
                }
            }
        }

        // Create the goal (no OpenAI assistant at creation - verification questions generated on demand)
        const goal = await prisma.$transaction(async (tx) => {
            const g = await tx.pathfinderGoal.create({
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
                    isPublic,
                    status: 'ACTIVE',
                    overview: `Learn ${input.title} - Add daily tasks and practice to build your skills.`,
                    learningObjectives: [],
                    prerequisites: [],
                    startedAt: new Date(),
                },
            })

            if (!isPublic) {
                const required = PATHFINDER_CREDITS.privateGoalCreation
                await tx.user.update({
                    where: { id: session.user.id },
                    data: { credits: { decrement: required } },
                })
                await tx.creditTransaction.create({
                    data: {
                        userId: session.user.id,
                        amount: -required,
                        type: 'SPEND',
                        description: `Pathfinder Private Goal: ${input.title}`,
                        currency: Currency.INR,
                    },
                })
            }

            return g
        })

        // Create verification record (questions generated when user clicks Verify)
        await prisma.pathfinderVerification.create({
            data: {
                goalId: goal.id,
                quizStatus: 'PENDING',
                codingStatus: 'LOCKED',
                mockStatus: 'LOCKED',
                projectStatus: 'PENDING',
            },
        })

        // Generate AI study plan if requested (non-blocking)
        if (input.generateAIPlan) {
            generateAIStudyPlan(
                goal.id,
                session.user.id,
                input.title,
                input.category,
                input.level,
                input.focusAreas
            ).catch((err) => console.error('Failed to generate AI study plan:', err))
        }

        revalidatePath('/pathfinder')
        return { success: true, goalId: goal.id, slug: goal.slug }
    } catch (error) {
        console.error('Error creating goal:', error)
        return { success: false, error: 'Failed to create goal' }
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

// ================================================================================
// AI STUDY PLAN GENERATION
// ================================================================================

import { openai } from '@/lib/openai-client'

interface StudyPlanTopic {
    title: string
    description: string
    order: number
}

async function generateAIStudyPlan(
    goalId: string,
    userId: string,
    title: string,
    category: PathfinderCategory,
    level: PathfinderLevel,
    focusAreas: string[]
) {
    try {
        const topicCount = level === 'BEGINNER' ? '8-12' : level === 'INTERMEDIATE' ? '10-15' : '12-15'

        const prompt = `You are an expert educator creating a structured study plan.

A user wants to learn "${title}" at ${level.toLowerCase()} level.
Category: ${category.replace('_', ' ')}
Focus areas: ${focusAreas.length > 0 ? focusAreas.join(', ') : 'General'}

Generate ${topicCount} study topics/sub-goals that form a logical learning path from basics to advanced.

Rules:
- Topics should be ordered from foundational to advanced
- Each topic should be a discrete learning unit (1-3 hours of study)
- Cover theory, practice, and real-world application
- For ${level.toLowerCase()} level, adjust depth appropriately
- Be specific (not "Learn arrays" but "Arrays: Traversal, Insertion, and Deletion Patterns")
- Include practical/hands-on topics (not just theory)

Return JSON:
{
  "topics": [
    { "title": "Topic title", "description": "Brief 1-2 sentence description of what this covers", "order": 1 }
  ]
}

Return ONLY valid JSON, no markdown.`

        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
            max_tokens: 2000,
            response_format: { type: 'json_object' },
        })

        const content = response.choices[0]?.message?.content
        if (!content) return

        const parsed = JSON.parse(content) as { topics: StudyPlanTopic[] }
        if (!parsed.topics || !Array.isArray(parsed.topics)) return

        // Log usage
        const { logPathfinderUsage } = await import('./usage.action')
        const inputTokens = response.usage?.prompt_tokens ?? 0
        const outputTokens = response.usage?.completion_tokens ?? 0
        if (inputTokens > 0 || outputTokens > 0) {
            await logPathfinderUsage({
                goalId,
                userId,
                action: 'ai_study_plan',
                provider: 'openai',
                inputTokens,
                outputTokens,
            })
        }

        // Create a daily session for the AI-generated plan
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        let dailySession = await prisma.pathfinderDailySession.findUnique({
            where: { goalId_date: { goalId, date: today } },
        })

        if (!dailySession) {
            dailySession = await prisma.pathfinderDailySession.create({
                data: { goalId, userId, date: today },
            })
        }

        // Create sub-goals from AI topics
        for (const topic of parsed.topics) {
            await prisma.pathfinderSubGoal.create({
                data: {
                    goalId,
                    sessionId: dailySession.id,
                    title: topic.title,
                    description: topic.description,
                    source: 'text',
                    order: topic.order,
                    isAIGenerated: true,
                    isContentLoaded: false,
                },
            })
        }

        // Update session and goal stats
        await prisma.pathfinderDailySession.update({
            where: { id: dailySession.id },
            data: { totalSubGoals: { increment: parsed.topics.length } },
        })

        await prisma.pathfinderGoal.update({
            where: { id: goalId },
            data: {
                totalSubGoals: { increment: parsed.topics.length },
                lastActivityAt: new Date(),
            },
        })

        revalidatePath('/pathfinder')
    } catch (error) {
        console.error('Error generating AI study plan:', error)
    }
}

/**
 * Generate AI content (quiz, coding, resources) for an AI-generated sub-goal
 * that hasn't had content loaded yet. Called when user clicks "Generate Content".
 */
export async function generateContentForAISubGoal(subGoalId: string) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: 'Unauthorized' }
        }

        const subGoal = await prisma.pathfinderSubGoal.findFirst({
            where: { id: subGoalId },
            include: { goal: { select: { id: true, userId: true, category: true, level: true, title: true } } },
        })

        if (!subGoal || subGoal.goal.userId !== session.user.id) {
            return { success: false, error: 'Sub-goal not found' }
        }

        if (subGoal.isContentLoaded) {
            return { success: true, message: 'Content already loaded' }
        }

        // Check usage
        const { canRunPathfinderAI, getGoalUsageSummary } = await import('./usage.action')
        const canRun = await canRunPathfinderAI(subGoal.goalId)
        if (!canRun.allowed) {
            return {
                success: false,
                error: canRun.reason ?? 'AI usage limit reached',
                code: 'USAGE_BLOCKED',
            }
        }

        const { generateExplanation, generateVideos, generateDocuments } = await import('@/actions/(main)/studios/ai-generation.actions')
        const { StudioVisibility } = await import('@repo/prisma/client')

        // Create Studio for this sub-goal
        const studioSlug = `subgoal-${subGoalId}-${Date.now().toString(36)}`
        const studio = await prisma.studio.create({
            data: {
                slug: studioSlug,
                title: `📝 ${subGoal.title}`,
                description: `Study notes for: ${subGoal.title}`,
                source: 'PATHFINDER',
                sourceId: subGoalId,
                visibility: StudioVisibility.PRIVATE,
                userId: session.user.id,
                stepCount: 0,
            },
        })

        await prisma.pathfinderSubGoal.update({
            where: { id: subGoalId },
            data: { studioId: studio.id },
        })

        await generateExplanation(
            studio.id,
            `Provide a detailed explanation of "${subGoal.title}". Include key concepts, practical examples, code snippets where relevant, and best practices. Use clear markdown formatting.`
        )

        Promise.all([
            generateVideos(studio.id, subGoal.title),
            generateDocuments(studio.id, subGoal.title),
        ]).catch((err) => console.error('Failed to add videos/docs:', err))

        await generateQuizAndCoding(subGoalId, subGoal.goalId, session.user.id, subGoal.title, subGoal.goal.category, subGoal.goal.level)

        await prisma.pathfinderSubGoal.update({
            where: { id: subGoalId },
            data: { isContentLoaded: true },
        })

        const usageSummary = await getGoalUsageSummary(subGoal.goalId)

        revalidatePath(`/pathfinder/${subGoal.goalId}`)
        return {
            success: true,
            usageSummary: usageSummary ?? undefined,
        }
    } catch (error) {
        console.error('Error generating content for AI sub-goal:', error)
        return { success: false, error: 'Failed to generate content' }
    }
}

async function generateQuizAndCoding(
    subGoalId: string,
    goalId: string,
    userId: string,
    title: string,
    category: string,
    level: string
) {
    try {
        const codingCount = level === 'BEGINNER' ? 2 : level === 'INTERMEDIATE' ? 2 : 3
        const prompt = `You are an expert educator creating coding practice.

A user is learning about "${title}" as part of their ${category} studies at ${level} level.

Generate ${codingCount} coding problems if this topic involves practical coding skills. Pick appropriate difficulty (EASY, MEDIUM, HARD) for each - vary them. For theory-only topics, use [].

Return JSON in this exact format:
{
  "codingProblems": [
    {
      "id": "cp1",
      "title": "Problem title",
      "description": "Detailed problem description",
      "difficulty": "EASY" | "MEDIUM" | "HARD",
      "starterCode": "function solve() {\\n  // Your code here\\n}",
      "hints": ["Hint 1", "Hint 2"],
      "sampleInput": "Example input",
      "sampleOutput": "Expected output"
    }
  ]
}

Rules: Vary difficulty. Return ONLY valid JSON, no markdown.`

        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
            max_tokens: 2000,
            response_format: { type: 'json_object' },
        })

        const content = response.choices[0]?.message?.content
        if (!content) return

        const { logPathfinderUsage } = await import('./usage.action')
        const inputTokens = response.usage?.prompt_tokens ?? 0
        const outputTokens = response.usage?.completion_tokens ?? 0
        if (inputTokens > 0 || outputTokens > 0) {
            await logPathfinderUsage({ goalId, userId, action: 'subgoal_quiz_coding', provider: 'openai', inputTokens, outputTokens })
        }

        const aiContent = JSON.parse(content)
        const codingProblems = Array.isArray(aiContent.codingProblems)
            ? aiContent.codingProblems
            : aiContent.codingProblem
                ? [aiContent.codingProblem]
                : []
        const hasCoding = codingProblems.length > 0

        await prisma.pathfinderSubGoal.update({
            where: { id: subGoalId },
            data: {
                aiCodingProblem: hasCoding ? codingProblems : null,
                hasCoding,
            },
        })

        const subGoal = await prisma.pathfinderSubGoal.findUnique({
            where: { id: subGoalId },
            select: { sessionId: true },
        })

        if (subGoal) {
            await prisma.pathfinderDailySession.update({
                where: { id: subGoal.sessionId },
                data: {
                    totalCodingProblems: { increment: codingProblems.length },
                },
            })
        }
    } catch (error) {
        console.error('Error generating quiz/coding for AI sub-goal:', error)
    }
}

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
