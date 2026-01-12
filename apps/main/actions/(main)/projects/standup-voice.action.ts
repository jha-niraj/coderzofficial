'use server'

import { auth } from '@repo/auth'
import { prisma } from '@repo/prisma'
import { revalidatePath } from 'next/cache'

interface StandupSessionVariables {
    user_name: string
    project_name: string
    project_id: string
    current_date: string
    time_of_day: 'morning' | 'afternoon' | 'evening'
    previous_standup?: {
        date: string
        completed_tasks: string[]
        planned_tasks: string[]
    }
}

interface ConversationDetails {
    agent_id: string
    conversation_id: string
    status: 'initiated' | 'in-progress' | 'processing' | 'done' | 'failed'
    transcript: Array<{
        role: string
        time_in_call_secs: number
        message: string
    }>
    metadata: {
        start_time_unix_secs: number
        call_duration_secs: number
    }
    has_audio: boolean
    analysis?: {
        call_successful: string
        transcript_summary: string
    }
}

/**
 * Create a new standup session for a project
 * Uses ProjectV2StandupEntry model for storage
 */
export async function createStandupSession(projectId: string, projectSlug: string) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: 'Unauthorized' }
        }

        const userId = session.user.id

        // Get user and project details
        const [user, project] = await Promise.all([
            prisma.user.findUnique({
                where: { id: userId },
                select: {
                    id: true,
                    name: true,
                    username: true,
                    credits: true
                }
            }),
            prisma.projectV2.findUnique({
                where: { id: projectId },
                include: {
                    standupConfigs: {
                        where: { userId }
                    }
                }
            })
        ])

        if (!user) {
            return { success: false, error: 'User not found' }
        }

        if (!project) {
            return { success: false, error: 'Project not found' }
        }

        // Check credits (5 credits per standup)
        const creditsRequired = 5
        if (user.credits < creditsRequired) {
            return {
                success: false,
                error: 'Insufficient credits',
                required: creditsRequired,
                available: user.credits
            }
        }

        // Get or create standup config
        let standupConfig = project.standupConfigs[0]
        if (!standupConfig) {
            // Create a default config
            const now = new Date()
            const weekEnd = new Date(now)
            weekEnd.setDate(weekEnd.getDate() + 7)

            standupConfig = await prisma.projectV2StandupConfig.create({
                data: {
                    userId,
                    projectId: project.id,
                    daysPerWeek: 5,
                    standupTime: '09:00',
                    durationMinutes: 10,
                    selectedDays: [1, 2, 3, 4, 5],
                    creditsPerDay: 5,
                    weeklyCredits: 25,
                    isActive: true,
                    currentWeekStart: now,
                    currentWeekEnd: weekEnd
                }
            })
        }

        // Get the previous standup for context
        const previousEntry = await prisma.projectV2StandupEntry.findFirst({
            where: {
                configId: standupConfig.id,
                status: 'SUBMITTED'
            },
            orderBy: { submittedAt: 'desc' }
        })

        // Generate time-based greeting
        const now = new Date()
        const hour = now.getHours()
        let timeOfDay: 'morning' | 'afternoon' | 'evening'
        if (hour < 12) timeOfDay = 'morning'
        else if (hour < 17) timeOfDay = 'afternoon'
        else timeOfDay = 'evening'

        // Create session variables
        const variables: StandupSessionVariables = {
            user_name: user.name?.split(' ')[0] || user.username || 'there',
            project_name: project.title,
            project_id: project.id,
            current_date: now.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }),
            time_of_day: timeOfDay,
            ...(previousEntry && {
                previous_standup: {
                    date: previousEntry.submittedAt?.toLocaleDateString() || '',
                    completed_tasks: previousEntry.whatDidYesterday ? [previousEntry.whatDidYesterday] : [],
                    planned_tasks: previousEntry.whatDoingToday ? [previousEntry.whatDoingToday] : []
                }
            })
        }

        // Create the standup entry and deduct credits
        const result = await prisma.$transaction(async (tx) => {
            // Create standup entry
            const standupEntry = await tx.projectV2StandupEntry.create({
                data: {
                    configId: standupConfig.id,
                    scheduledFor: now,
                    status: 'SCHEDULED'
                }
            })

            // Deduct credits
            await tx.user.update({
                where: { id: userId },
                data: {
                    credits: { decrement: creditsRequired }
                }
            })

            // Record credit transaction
            await tx.creditTransaction.create({
                data: {
                    userId,
                    amount: -creditsRequired,
                    type: 'SPEND',
                    description: `Daily Standup: ${project.title}`,
                    currency: 'NA'
                }
            })

            return standupEntry
        })

        revalidatePath(`/projects/${projectSlug}`)

        const agentId = process.env.NEXT_PUBLIC_STANDUP_AGENT_ID || process.env.NEXT_PUBLIC_ELEVENLABS_MOCKVOICE || ''

        return {
            success: true,
            sessionId: result.id,
            agentId,
            variables
        }

    } catch (error) {
        console.error('Error creating standup session:', error)
        return {
            success: false,
            error: 'Failed to create standup session'
        }
    }
}

/**
 * Process standup conversation completion
 */
export async function processStandupConversation(sessionId: string, conversationId: string) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: 'Unauthorized' }
        }

        // Poll ElevenLabs API for conversation details
        let attempts = 0
        const maxAttempts = 30
        let conversationData: ConversationDetails | null = null

        while (attempts < maxAttempts) {
            const response = await fetch(
                `https://api.elevenlabs.io/v1/convai/conversations/${conversationId}`,
                {
                    method: 'GET',
                    headers: {
                        'xi-api-key': process.env.ELEVENLABS_API_KEY || process.env.ELEVENLABS_AI_KEY || '',
                    },
                    cache: 'no-store'
                }
            )

            if (response.ok) {
                conversationData = await response.json()

                if (conversationData?.status === 'done') {
                    break
                } else if (conversationData?.status === 'failed') {
                    throw new Error('Conversation processing failed')
                }
            }

            await new Promise(resolve => setTimeout(resolve, 1000))
            attempts++
        }

        if (!conversationData || conversationData.status !== 'done') {
            // Even if we timeout, still mark as submitted with available data
            await prisma.projectV2StandupEntry.update({
                where: { id: sessionId },
                data: {
                    status: 'SUBMITTED',
                    submittedAt: new Date(),
                    recordingUrl: conversationId
                }
            })
            return { success: true, sessionId }
        }

        // Build transcript
        const transcriptText = conversationData.transcript
            .map(t => `[${t.role.toUpperCase()}] (${t.time_in_call_secs}s): ${t.message}`)
            .join('\n\n')

        const duration = conversationData.metadata.call_duration_secs

        // Extract standup items using AI
        const extractedData = await extractStandupItemsFromTranscript(transcriptText)

        // Update standup entry with data
        await prisma.projectV2StandupEntry.update({
            where: { id: sessionId },
            data: {
                status: 'SUBMITTED',
                submittedAt: new Date(),
                durationSeconds: Math.round(duration),
                recordingUrl: conversationId,
                whatDidYesterday: extractedData.completedTasks.join('; '),
                whatDoingToday: extractedData.plannedTasks.join('; '),
                anyBlockers: extractedData.blockers.join('; '),
                aiSummary: conversationData.analysis?.transcript_summary || null,
                aiSuggestions: []
            }
        })

        // Update standup config stats
        const standupEntry = await prisma.projectV2StandupEntry.findUnique({
            where: { id: sessionId },
            include: { config: true }
        })

        if (standupEntry?.configId) {
            await prisma.projectV2StandupConfig.update({
                where: { id: standupEntry.configId },
                data: {
                    completedStandups: { increment: 1 },
                    totalStandups: { increment: 1 }
                }
            })
        }

        return {
            success: true,
            sessionId,
            transcript: transcriptText,
            duration,
            summary: conversationData.analysis?.transcript_summary,
            extractedData
        }

    } catch (error) {
        console.error('Error processing standup conversation:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to process standup'
        }
    }
}

/**
 * Extract standup items from transcript using AI
 */
async function extractStandupItemsFromTranscript(transcript: string): Promise<{
    completedTasks: string[]
    plannedTasks: string[]
    blockers: string[]
}> {
    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                    {
                        role: 'system',
                        content: 'You are an assistant that extracts structured information from standup meeting transcripts. Extract the tasks that were completed (yesterday), tasks planned (for today), and any blockers mentioned.'
                    },
                    {
                        role: 'user',
                        content: `Extract the standup items from this transcript:\n\n${transcript}\n\nProvide your response in this JSON format:
{
  "completedTasks": ["task 1", "task 2"],
  "plannedTasks": ["task 1", "task 2"],
  "blockers": ["blocker 1", "blocker 2"]
}

If no items are found for a category, return an empty array.`
                    }
                ],
                response_format: { type: 'json_object' },
                temperature: 0.3
            })
        })

        if (!response.ok) {
            console.error('Failed to extract standup items')
            return { completedTasks: [], plannedTasks: [], blockers: [] }
        }

        const aiResponse = await response.json()
        const extracted = JSON.parse(aiResponse.choices[0].message.content)

        return {
            completedTasks: extracted.completedTasks || [],
            plannedTasks: extracted.plannedTasks || [],
            blockers: extracted.blockers || []
        }

    } catch (error) {
        console.error('Error extracting standup items:', error)
        return { completedTasks: [], plannedTasks: [], blockers: [] }
    }
}

/**
 * Get standup history for a project
 */
export async function getStandupHistory(projectId: string, limit: number = 10) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: 'Unauthorized' }
        }

        // Get the user's standup config for this project
        const standupConfig = await prisma.projectV2StandupConfig.findUnique({
            where: {
                userId_projectId: {
                    userId: session.user.id,
                    projectId
                }
            }
        })

        if (!standupConfig) {
            return { success: true, standups: [] }
        }

        const standups = await prisma.projectV2StandupEntry.findMany({
            where: {
                configId: standupConfig.id,
                status: 'SUBMITTED'
            },
            orderBy: { submittedAt: 'desc' },
            take: limit
        })

        return {
            success: true,
            standups: standups.map(s => ({
                id: s.id,
                date: s.submittedAt?.toLocaleDateString() || '',
                completedTasks: s.whatDidYesterday ? [s.whatDidYesterday] : [],
                plannedTasks: s.whatDoingToday ? [s.whatDoingToday] : [],
                blockers: s.anyBlockers ? [s.anyBlockers] : [],
                duration: s.durationSeconds
            }))
        }

    } catch (error) {
        console.error('Error fetching standup history:', error)
        return { success: false, error: 'Failed to fetch history' }
    }
}

/**
 * Get previous standup for context
 */
export async function getPreviousStandup(projectId: string) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: 'Unauthorized' }
        }

        const standupConfig = await prisma.projectV2StandupConfig.findUnique({
            where: {
                userId_projectId: {
                    userId: session.user.id,
                    projectId
                }
            }
        })

        if (!standupConfig) {
            return { success: true, standup: null }
        }

        const standup = await prisma.projectV2StandupEntry.findFirst({
            where: {
                configId: standupConfig.id,
                status: 'SUBMITTED'
            },
            orderBy: { submittedAt: 'desc' }
        })

        if (!standup) {
            return { success: true, standup: null }
        }

        return {
            success: true,
            standup: {
                date: standup.submittedAt?.toLocaleDateString() || standup.scheduledFor.toLocaleDateString(),
                completedTasks: standup.whatDidYesterday ? [standup.whatDidYesterday] : [],
                plannedTasks: standup.whatDoingToday ? [standup.whatDoingToday] : []
            }
        }

    } catch (error) {
        console.error('Error fetching previous standup:', error)
        return { success: false, error: 'Failed to fetch previous standup' }
    }
}
