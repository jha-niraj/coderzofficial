'use server'

import { getSession } from "@repo/auth"
import { headers } from "next/headers"
import { db, mockVoiceSession, mockInterviewVoice } from "@repo/db"
import { eq, and, sql } from "drizzle-orm"
import { openai } from '@/lib/openai-client'


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
        evaluation_criteria_results?: Record<string, any>
    }
}

export async function getConversationDetails(conversationId: string) {
    try {
        const response = await fetch(
            `https://api.elevenlabs.io/v1/convai/conversations/${conversationId}`,
            {
                method: 'GET',
                headers: {
                    'xi-api-key': process.env.ELEVENLABS_API_KEY!,
                },
                cache: 'no-store'
            }
        )

        if (!response.ok) {
            throw new Error(`Failed to fetch conversation: ${response.statusText}`)
        }

        const data: ConversationDetails = await response.json()

        return {
            success: true,
            data
        }
    } catch (error) {
        console.error('Error fetching conversation details:', error)
        return {
            success: false,
            error: 'Failed to fetch conversation details'
        }
    }
}

export async function processConversationCompletion(sessionId: string, conversationId: string) {
    try {
        const session = await getSession(headers())
        if (!session?.user?.id) {
            return { success: false, error: 'Unauthorized' }
        }

        let attempts = 0
        const maxAttempts = 30
        let conversationData: ConversationDetails | null = null

        while (attempts < maxAttempts) {
            const result = await getConversationDetails(conversationId)

            if (result.success && result.data) {
                conversationData = result.data

                if (conversationData.status === 'done') {
                    break
                } else if (conversationData.status === 'failed') {
                    const meta = conversationData.metadata as any
                    const reason = meta?.termination_reason ?? meta?.error?.reason ?? 'Unknown reason'
                    console.error('ElevenLabs conversation failed', {
                        conversationId,
                        reason,
                        metadata: conversationData.metadata,
                        analysis: conversationData.analysis
                    })
                    await db
                        .update(mockVoiceSession)
                        .set({ status: 'FAILED' })
                        .where(eq(mockVoiceSession.id, sessionId))
                        .catch(() => { /* best-effort */ })
                    return {
                        success: false,
                        error: `Interview session ended unexpectedly: ${reason}`
                    }
                }
            }

            await new Promise(resolve => setTimeout(resolve, 1000))
            attempts++
        }

        if (!conversationData || conversationData.status !== 'done') {
            throw new Error('Conversation processing timeout')
        }

        const transcriptText = conversationData.transcript
            .map(t => `[${t.role.toUpperCase()}] (${t.time_in_call_secs}s): ${t.message}`)
            .join('\n\n')

        const duration = conversationData.metadata.call_duration_secs

        await db
            .update(mockVoiceSession)
            .set({
                conversationId,
                status: 'COMPLETED',
                completedAt: new Date(),
                duration,
                transcript: transcriptText,
                metadata: conversationData.metadata as any,
            })
            .where(
                and(
                    eq(mockVoiceSession.id, sessionId),
                    eq(mockVoiceSession.userId, session.user.id)
                )
            )

        // Update mock popularity
        const sessionRow = await db.query.mockVoiceSession.findFirst({
            where: eq(mockVoiceSession.id, sessionId),
            columns: { mockId: true },
        })

        if (sessionRow) {
            await db
                .update(mockInterviewVoice)
                .set({
                    totalSessions: sql`${mockInterviewVoice.totalSessions} + 1`,
                    popularity: sql`${mockInterviewVoice.popularity} + 1`,
                })
                .where(eq(mockInterviewVoice.id, sessionRow.mockId))
        }

        return {
            success: true,
            sessionId,
            transcript: transcriptText,
            duration,
            summary: conversationData.analysis?.transcript_summary
        }

    } catch (error) {
        console.error('Error processing conversation completion:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to process conversation'
        }
    }
}

export async function generateAIFeedback(sessionId: string) {
    try {
        const session = await getSession(headers())
        if (!session?.user?.id) {
            return { success: false, error: 'Unauthorized' }
        }

        const mockSession = await db.query.mockVoiceSession.findFirst({
            where: and(
                eq(mockVoiceSession.id, sessionId),
                eq(mockVoiceSession.userId, session.user.id)
            ),
            with: { mock: true },
        })

        if (!mockSession || !mockSession.transcript) {
            return { success: false, error: 'Session or transcript not found' }
        }

        const response = await openai.chat.completions.create({
            model: 'gpt-4.1',
            messages: [
                {
                    role: 'system',
                    content: `You are an expert interview coach and hiring manager. Analyze mock interview transcripts with fairness and constructiveness.
                        - Consider the role level (${mockSession.mock.level}) and category (${mockSession.mock.category})
                        - Score fairly: 1-100 scale. 70-85 = solid performance, 85+ = strong, 50-69 = needs improvement, <50 = significant gaps
                        - Be specific: reference actual quotes or moments from the transcript when giving feedback
                        - Balance praise with actionable improvement areas
                        - Format your response as valid JSON only, no additional text`
                },
                {
                    role: 'user',
                    content: `Analyze this mock interview for "${mockSession.mock.title}" (${mockSession.mock.level} level) and provide structured feedback.

                        TRANSCRIPT:
                        ${mockSession.transcript}

                        Respond with ONLY valid JSON in this exact format (no markdown, no code blocks):
                        {
                            "overallScore": <number 1-100>,
                            "communication": { "score": <number 1-100>, "feedback": "<2-3 sentences on clarity, articulation, structure>" },
                            "technical": { "score": <number 1-100>, "feedback": "<2-3 sentences on technical depth, accuracy, relevance>" },
                            "problemSolving": { "score": <number 1-100>, "feedback": "<2-3 sentences on approach, logic, examples>" },
                            "strengths": ["<specific strength 1>", "<specific strength 2>", "<specific strength 3>"],
                            "improvements": ["<actionable improvement 1>", "<actionable improvement 2>", "<actionable improvement 3>"],
                            "detailedFeedback": "<2-3 paragraph comprehensive summary: how the interview went, key moments, overall assessment, and top priorities for improvement>"
                        }`
                }
            ],
            response_format: { type: 'json_object' }
        })

        const assistantMessage = response.choices[0]?.message
        if (!assistantMessage?.content) {
            throw new Error("No response from assistant")
        }

        const analysis = JSON.parse(assistantMessage.content)

        await db
            .update(mockVoiceSession)
            .set({ aiAnalysis: analysis })
            .where(eq(mockVoiceSession.id, sessionId))

        return {
            success: true,
            analysis
        }

    } catch (error) {
        console.error('Error generating AI feedback:', error)
        return {
            success: false,
            error: 'Failed to generate feedback'
        }
    }
}
