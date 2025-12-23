"use server"

import { auth } from '@repo/auth'
import prisma from "@/lib/prisma"
import OpenAI from "openai"
import { CreditType, Currency } from "@prisma/client"

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})

const MOCK_CREDIT_COST = 30

interface MockKnowledgeBase {
    overview: string
    keyTopics: string[]
    technicalConcepts: string[]
    interviewQuestions: {
        question: string
        expectedPoints: string[]
        difficulty: 'easy' | 'medium' | 'hard'
    }[]
    practicalScenarios: string[]
}

/**
 * Generate mock interview knowledge base from project data
 */
export async function generateProjectMockKnowledgeBase(projectSlug: string) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: "Not authenticated" }
        }

        // Get project with tasks and knowledge base
        const project = await prisma.projectV2.findUnique({
            where: { slug: projectSlug },
            include: {
                tasks: {
                    include: {
                        taskDetail: {
                            select: {
                                subTasks: true
                            }
                        }
                    },
                    orderBy: { orderIndex: 'asc' },
                    take: 10
                },
                knowledge: true
            }
        })

        if (!project) {
            return { success: false, error: "Project not found" }
        }

        if (!project.includeAssessment) {
            return { success: false, error: "This project does not include assessments" }
        }

        // Check if knowledge base already exists (cast to any for dynamic field check)
        const knowledgeData = project.knowledge as any
        if (knowledgeData?.mockKnowledgeBase) {
            return { 
                success: true, 
                mockData: {
                    knowledgeBase: knowledgeData.mockKnowledgeBase as string,
                    hasKnowledgeBase: true
                }
            }
        }

        // Check user credits
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { credits: true, name: true, username: true }
        })

        if (!user || user.credits < MOCK_CREDIT_COST) {
            return { success: false, error: "Insufficient credits", requiredCredits: MOCK_CREDIT_COST }
        }

        // Build project context for AI (concise to save tokens)
        const stacks = project.stacks as any
        const taskSummary = project.tasks.slice(0, 10).map(t => {
            const subtasksData = (t.taskDetail?.subTasks as any[]) || []
            return {
                title: t.title,
                subtasks: subtasksData.slice(0, 3).map((st: any) => st.title || st) 
            }
        })

        const projectContext = `
Project: ${project.title}
Description: ${project.description?.substring(0, 300) || 'N/A'}
Technologies: ${project.technologies.slice(0, 8).join(', ')}
Stack: Frontend: ${stacks?.frontend || 'N/A'}, Backend: ${stacks?.backend || 'N/A'}, Database: ${stacks?.database || 'N/A'}
Key Tasks: ${taskSummary.slice(0, 5).map(t => `${t.title} (${t.subtasks.join(', ')})`).join('; ')}
`

        // Generate knowledge base with OpenAI
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: "You are a technical interviewer. Generate a concise knowledge base for a mock interview. Focus on practical, project-relevant questions. Return valid JSON only."
                },
                {
                    role: "user",
                    content: `Generate a mock interview knowledge base for this project. Include 8-10 technical questions, key concepts, and practical scenarios. Keep it concise.

${projectContext}

Return JSON with structure:
{
    "overview": "Brief project overview for interviewer context",
    "keyTopics": ["topic1", "topic2", ...max 6],
    "technicalConcepts": ["concept1", "concept2", ...max 8],
    "interviewQuestions": [
        {"question": "...", "expectedPoints": ["point1", "point2"], "difficulty": "easy|medium|hard"}
    ],
    "practicalScenarios": ["scenario1", "scenario2", ...max 4]
}`
                }
            ],
            temperature: 0.7,
            max_tokens: 2000,
            response_format: { type: "json_object" }
        })

        const content = completion.choices[0]?.message?.content
        if (!content) {
            return { success: false, error: "Failed to generate knowledge base" }
        }

        let knowledgeBase: MockKnowledgeBase
        try {
            knowledgeBase = JSON.parse(content)
        } catch (e) {
            console.error("Failed to parse knowledge base:", e)
            return { success: false, error: "Invalid response format from AI" }
        }

        // Create the knowledge base string for ElevenLabs
        const knowledgeBaseText = `
PROJECT OVERVIEW: ${knowledgeBase.overview}

KEY TOPICS TO ASSESS:
${knowledgeBase.keyTopics.map(t => `- ${t}`).join('\n')}

TECHNICAL CONCEPTS:
${knowledgeBase.technicalConcepts.map(c => `- ${c}`).join('\n')}

INTERVIEW QUESTIONS:
${knowledgeBase.interviewQuestions.map((q, i) => `
${i + 1}. [${q.difficulty.toUpperCase()}] ${q.question}
   Expected Points: ${q.expectedPoints.join('; ')}
`).join('')}

PRACTICAL SCENARIOS:
${knowledgeBase.practicalScenarios.map((s, i) => `${i + 1}. ${s}`).join('\n')}
`

        // Deduct credits and save knowledge base
        await prisma.$transaction(async (tx: any) => {
            // Update user credits
            await tx.user.update({
                where: { id: session.user.id },
                data: { credits: { decrement: MOCK_CREDIT_COST } }
            })

            // Create credit transaction
            await tx.creditTransaction.create({
                data: {
                    userId: session.user.id,
                    currency: Currency.NA,
                    amount: MOCK_CREDIT_COST,
                    type: CreditType.SPEND,
                    description: `Mock Interview generated for project: ${project.title}`
                }
            })

            // Upsert knowledge base with mock data
            await tx.projectV2KnowledgeBase.upsert({
                where: { projectId: project.id },
                create: {
                    projectId: project.id,
                    mockKnowledgeBase: knowledgeBaseText,
                    mockQuestionsData: knowledgeBase as any
                },
                update: {
                    mockKnowledgeBase: knowledgeBaseText,
                    mockQuestionsData: knowledgeBase as any
                }
            })
        })

        return {
            success: true,
            mockData: {
                knowledgeBase: knowledgeBaseText,
                hasKnowledgeBase: true
            }
        }

    } catch (error) {
        console.error("Error generating mock knowledge base:", error)
        return { success: false, error: "Failed to generate mock interview" }
    }
}

/**
 * Create a project mock interview session
 */
export async function createProjectMockSession(projectSlug: string) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: "Not authenticated" }
        }

        const project = await prisma.projectV2.findUnique({
            where: { slug: projectSlug },
            include: {
                knowledge: true
            }
        })

        if (!project) {
            return { success: false, error: "Project not found" }
        }

        const knowledgeData = project.knowledge as any
        if (!knowledgeData?.mockKnowledgeBase) {
            return { success: false, error: "Mock interview knowledge base not generated yet" }
        }

        // Get user info
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { name: true, username: true }
        })

        // Create session using existing model
        const mockSession = await prisma.projectV2MockSession.create({
            data: {
                userId: session.user.id,
                projectId: project.id,
                agentId: process.env.NEXT_PUBLIC_ELEVENLABS_MOCKVOICE!,
                status: 'SCHEDULED',
                scheduledAt: new Date()
            }
        })

        const mockKnowledgeBase = knowledgeData.mockKnowledgeBase as string

        return {
            success: true,
            sessionId: mockSession.id,
            agentId: mockSession.agentId,
            knowledgeBase: mockKnowledgeBase,
            variables: {
                username: user?.name?.split(' ')[0] || user?.username || 'there',
                position: `${project.title} Developer`,
                level: project.difficulty || 'INTERMEDIATE',
                description: project.description?.substring(0, 200) || '',
                knowledge_base: mockKnowledgeBase
            }
        }
    } catch (error) {
        console.error("Error creating mock session:", error)
        return { success: false, error: "Failed to create session" }
    }
}

/**
 * Update mock session status
 */
export async function updateProjectMockSessionStatus(
    sessionId: string, 
    status: 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED',
    conversationId?: string
) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: "Not authenticated" }
        }

        await prisma.projectV2MockSession.update({
            where: {
                id: sessionId,
                userId: session.user.id
            },
            data: {
                status,
                conversationId,
                startedAt: status === 'IN_PROGRESS' ? new Date() : undefined,
                completedAt: status === 'COMPLETED' ? new Date() : undefined
            }
        })

        return { success: true }
    } catch (error) {
        console.error("Error updating mock session:", error)
        return { success: false, error: "Failed to update session" }
    }
}

/**
 * Get project mock session details
 */
export async function getProjectMockSession(sessionId: string) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: "Not authenticated" }
        }

        const mockSession = await prisma.projectV2MockSession.findUnique({
            where: {
                id: sessionId,
                userId: session.user.id
            },
            include: {
                project: {
                    select: {
                        title: true,
                        slug: true,
                        description: true,
                        difficulty: true
                    }
                }
            }
        })

        if (!mockSession) {
            return { success: false, error: "Session not found" }
        }

        return { success: true, session: mockSession }
    } catch (error) {
        console.error("Error getting mock session:", error)
        return { success: false, error: "Failed to get session" }
    }
}

/**
 * Save conversation transcript and generate AI feedback
 */
export async function processProjectMockCompletion(
    sessionId: string,
    conversationId: string
) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: "Not authenticated" }
        }

        const ELEVENLABS_API_KEY = process.env.ELEVENLABS_AI_KEY

        if (!ELEVENLABS_API_KEY) {
            return { success: false, error: "ElevenLabs API not configured" }
        }

        // Get conversation from ElevenLabs
        const response = await fetch(`https://api.elevenlabs.io/v1/convai/conversations/${conversationId}`, {
            method: 'GET',
            headers: {
                'xi-api-key': ELEVENLABS_API_KEY,
                'Content-Type': 'application/json',
            },
        })

        let transcript: any[] = []
        let duration = 0

        if (response.ok) {
            const data = await response.json()
            transcript = data.transcript || []
            duration = Math.floor((data.metadata?.duration || 0) / 1000)
        }

        // Update session with transcript
        await prisma.projectV2MockSession.update({
            where: { id: sessionId },
            data: {
                status: 'COMPLETED',
                completedAt: new Date(),
                conversationId,
                transcript: JSON.stringify(transcript),
                duration
            }
        })

        // Generate AI feedback if we have transcript
        if (transcript.length > 0) {
            const transcriptText = transcript
                .map((t: any) => `${t.role}: ${t.message}`)
                .join('\n')

            const feedbackCompletion = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    {
                        role: "system",
                        content: "Analyze this mock interview transcript and provide concise feedback. Return JSON only."
                    },
                    {
                        role: "user",
                        content: `Analyze this interview transcript and provide feedback:

${transcriptText.substring(0, 3000)}

Return JSON: {"overallScore": 0-100, "communication": {"score": 0-100, "feedback": "..."}, "technical": {"score": 0-100, "feedback": "..."}, "problemSolving": {"score": 0-100, "feedback": "..."}, "strengths": ["..."], "improvements": ["..."], "detailedFeedback": "..."}`
                    }
                ],
                temperature: 0.7,
                max_tokens: 1000,
                response_format: { type: "json_object" }
            })

            const feedbackContent = feedbackCompletion.choices[0]?.message?.content
            if (feedbackContent) {
                try {
                    const feedback = JSON.parse(feedbackContent)
                    await prisma.projectV2MockSession.update({
                        where: { id: sessionId },
                        data: {
                            score: feedback.overallScore,
                            technicalScore: feedback.technical?.score,
                            communicationScore: feedback.communication?.score,
                            conceptualScore: feedback.problemSolving?.score,
                            feedback: feedback.detailedFeedback,
                            strengths: feedback.strengths || [],
                            improvements: feedback.improvements || []
                        }
                    })

                    // Update leaderboard
                    try {
                        const mockSession = await prisma.projectV2MockSession.findUnique({
                            where: { id: sessionId },
                            select: { projectId: true }
                        })
                        if (mockSession) {
                            const { updateProjectScore } = await import("./leaderboard.action")
                            await updateProjectScore(mockSession.projectId, session.user.id)
                        }
                    } catch (e) {
                        console.error("Failed to update leaderboard:", e)
                    }

                    return { success: true, analysis: feedback }
                } catch (e) {
                    console.error("Failed to parse feedback:", e)
                }
            }
        }

        return { success: true }
    } catch (error) {
        console.error("Error processing mock completion:", error)
        return { success: false, error: "Failed to process interview" }
    }
}

/**
 * Get user's mock interview attempts for a project
 */
export async function getProjectMockAttempts(projectSlug: string) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: "Not authenticated" }
        }

        const project = await prisma.projectV2.findUnique({
            where: { slug: projectSlug },
            select: { id: true }
        })

        if (!project) {
            return { success: false, error: "Project not found" }
        }

        const attempts = await prisma.projectV2MockSession.findMany({
            where: {
                userId: session.user.id,
                projectId: project.id,
                status: 'COMPLETED'
            },
            orderBy: { createdAt: 'desc' },
            take: 10,
            select: {
                id: true,
                score: true,
                duration: true,
                completedAt: true,
                createdAt: true
            }
        })

        return { success: true, attempts }
    } catch (error) {
        console.error("Error fetching mock attempts:", error)
        return { success: false, error: "Failed to fetch attempts" }
    }
}

/**
 * Check if project has mock knowledge base
 */
export async function hasProjectMockKnowledgeBase(projectSlug: string) {
    try {
        const project = await prisma.projectV2.findUnique({
            where: { slug: projectSlug },
            include: {
                knowledge: true
            }
        })

        if (!project) {
            return { success: false, error: "Project not found" }
        }

        const knowledgeData = project.knowledge as any

        return { 
            success: true, 
            hasKnowledgeBase: !!knowledgeData?.mockKnowledgeBase,
            knowledgeBase: (knowledgeData?.mockKnowledgeBase as string) || null
        }
    } catch (error) {
        console.error("Error checking mock knowledge base:", error)
        return { success: false, error: "Failed to check knowledge base" }
    }
}
