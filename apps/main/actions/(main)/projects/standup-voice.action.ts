'use server'

import { getSession } from '@repo/auth'
import { headers } from 'next/headers'
import {
    db, projectV2StandupConfigs, projectV2StandupEntries, projectsV2, users, creditTransactions
} from '@repo/db'
import { eq, and, desc, sql } from 'drizzle-orm'
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
 */
export async function createStandupSession(projectId: string, projectSlug: string) {
    try {
        const session = await getSession(headers())
        if (!session?.user?.id) {
            return { success: false, error: 'Unauthorized' }
        }

        const userId = session.user.id

        const [[user], project] = await Promise.all([
            db
                .select({ id: users.id, name: users.name, credits: users.credits })
                .from(users)
                .where(eq(users.id, userId))
                .limit(1),
            db.query.projectsV2.findFirst({
                where: eq(projectsV2.id, projectId),
                with: {
                    standupConfigs: {
                        where: (configs, { eq }) => eq(configs.userId, userId)
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

        const creditsRequired = 5
        if (user.credits < creditsRequired) {
            return {
                success: false,
                error: 'Insufficient credits',
                required: creditsRequired,
                available: user.credits
            }
        }

        let standupConfig = project.standupConfigs[0]
        if (!standupConfig) {
            const now = new Date()
            const weekEnd = new Date(now)
            weekEnd.setDate(weekEnd.getDate() + 7)

            const [created] = await db
                .insert(projectV2StandupConfigs)
                .values({
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
                })
                .returning()

            if (!created) throw new Error("Failed to create standup config")
            standupConfig = created
        }

        const previousEntry = await db.query.projectV2StandupEntries.findFirst({
            where: and(
                eq(projectV2StandupEntries.configId, standupConfig.id),
                eq(projectV2StandupEntries.status, 'SUBMITTED')
            ),
            orderBy: [desc(projectV2StandupEntries.submittedAt)]
        })

        const now = new Date()
        const hour = now.getHours()
        let timeOfDay: 'morning' | 'afternoon' | 'evening'
        if (hour < 12) timeOfDay = 'morning'
        else if (hour < 17) timeOfDay = 'afternoon'
        else timeOfDay = 'evening'

        const variables: StandupSessionVariables = {
            user_name: user.name?.split(' ')[0] || 'there',
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

        const result = await db.transaction(async (tx) => {
            const [standupEntry] = await tx
                .insert(projectV2StandupEntries)
                .values({
                    configId: standupConfig.id,
                    scheduledFor: now,
                    status: 'SCHEDULED'
                })
                .returning()

            await tx
                .update(users)
                .set({ credits: sql`${users.credits} - ${creditsRequired}` })
                .where(eq(users.id, userId))

            await tx.insert(creditTransactions).values({
                userId,
                amount: -creditsRequired,
                type: 'SPEND',
                description: `Daily Standup: ${project.title}`,
                currency: 'INR'
            })

            return standupEntry
        })

        revalidatePath(`/projects/${projectSlug}`)

        const agentId = process.env.NEXT_PUBLIC_STANDUP_AGENT_ID || process.env.NEXT_PUBLIC_ELEVENLABS_MOCKVOICE || ''

        if (!result) throw new Error("Failed to create standup entry")

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
        const session = await getSession(headers())
        if (!session?.user?.id) {
            return { success: false, error: 'Unauthorized' }
        }

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
            await db
                .update(projectV2StandupEntries)
                .set({
                    status: 'SUBMITTED',
                    submittedAt: new Date(),
                    recordingUrl: conversationId
                })
                .where(eq(projectV2StandupEntries.id, sessionId))

            return { success: true, sessionId }
        }

        const transcriptText = conversationData.transcript
            .map(t => `[${t.role.toUpperCase()}] (${t.time_in_call_secs}s): ${t.message}`)
            .join('\n\n')

        const duration = conversationData.metadata.call_duration_secs
        const extractedData = await extractStandupItemsFromTranscript(transcriptText)

        await db
            .update(projectV2StandupEntries)
            .set({
                status: 'SUBMITTED',
                submittedAt: new Date(),
                durationSeconds: Math.round(duration),
                recordingUrl: conversationId,
                whatDidYesterday: extractedData.completedTasks.join('; '),
                whatDoingToday: extractedData.plannedTasks.join('; '),
                anyBlockers: extractedData.blockers.join('; '),
                aiSummary: conversationData.analysis?.transcript_summary || null,
                aiSuggestions: []
            })
            .where(eq(projectV2StandupEntries.id, sessionId))

        const [standupEntry] = await db
            .select({ configId: projectV2StandupEntries.configId })
            .from(projectV2StandupEntries)
            .where(eq(projectV2StandupEntries.id, sessionId))
            .limit(1)

        if (standupEntry?.configId) {
            await db
                .update(projectV2StandupConfigs)
                .set({
                    completedStandups: sql`${projectV2StandupConfigs.completedStandups} + 1`,
                    totalStandups: sql`${projectV2StandupConfigs.totalStandups} + 1`,
                })
                .where(eq(projectV2StandupConfigs.id, standupEntry.configId))
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
        const session = await getSession(headers())
        if (!session?.user?.id) {
            return { success: false, error: 'Unauthorized' }
        }

        const [standupConfig] = await db
            .select({ id: projectV2StandupConfigs.id })
            .from(projectV2StandupConfigs)
            .where(
                and(
                    eq(projectV2StandupConfigs.userId, session.user.id),
                    eq(projectV2StandupConfigs.projectId, projectId)
                )
            )
            .limit(1)

        if (!standupConfig) {
            return { success: true, standups: [] }
        }

        const standups = await db
            .select()
            .from(projectV2StandupEntries)
            .where(
                and(
                    eq(projectV2StandupEntries.configId, standupConfig.id),
                    eq(projectV2StandupEntries.status, 'SUBMITTED')
                )
            )
            .orderBy(desc(projectV2StandupEntries.submittedAt))
            .limit(limit)

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
        const session = await getSession(headers())
        if (!session?.user?.id) {
            return { success: false, error: 'Unauthorized' }
        }

        const [standupConfig] = await db
            .select({ id: projectV2StandupConfigs.id })
            .from(projectV2StandupConfigs)
            .where(
                and(
                    eq(projectV2StandupConfigs.userId, session.user.id),
                    eq(projectV2StandupConfigs.projectId, projectId)
                )
            )
            .limit(1)

        if (!standupConfig) {
            return { success: true, standup: null }
        }

        const [standup] = await db
            .select()
            .from(projectV2StandupEntries)
            .where(
                and(
                    eq(projectV2StandupEntries.configId, standupConfig.id),
                    eq(projectV2StandupEntries.status, 'SUBMITTED')
                )
            )
            .orderBy(desc(projectV2StandupEntries.submittedAt))
            .limit(1)

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
