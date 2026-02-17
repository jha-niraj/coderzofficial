'use server'

import Exa from 'exa-js'
import OpenAI from 'openai'
import { prisma } from '@repo/prisma'
import { logPathfinderUsage } from './usage.action'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

// ================================================================================
// TYPES (from Exa schema)
// ================================================================================

export interface ExaVideo {
    url: string
    duration: string
    description?: string
}

export interface ExaDocumentation {
    url: string
    type: string
    description?: string
}

export interface ExaResourcesResult {
    videos: ExaVideo[]
    documentations: ExaDocumentation[]
}

export interface CodeExample {
    title: string
    language: string
    code: string
    explanation?: string
}

export interface DosDonts {
    dos: string[]
    donts: string[]
}

export interface Flashcard {
    id: string
    front: string
    back: string
    hint?: string
}

export interface OpenAIResourcesResult {
    content: string
    codeExamples: CodeExample[]
    dosDonts: DosDonts
    flashcards: Flashcard[]
}

export interface SubGoalResources {
    videos: ExaVideo[]
    documentations: ExaDocumentation[]
    content: string
    codeExamples: CodeExample[]
    dosDonts: DosDonts
    flashcards: Flashcard[]
}

// ================================================================================
// EXA - Fetch videos and documentation
// ================================================================================

async function fetchExaResources(title: string, category: string, level: string): Promise<ExaResourcesResult> {
    const apiKey = process.env.EXA_API_KEY
    if (!apiKey) {
        console.warn('EXA_API_KEY not set, skipping Exa fetch')
        return { videos: [], documentations: [] }
    }

    try {
        const exa = new Exa(apiKey)
        const query = `Tell me all the things about ${title} including YouTube videos I can watch to learn that with resources, code examples and practice. Include do's and don'ts. Category: ${category}, level: ${level}.`
        const { answer } = await exa.answer(query, {
            outputSchema: {
                description: 'Schema describing a collection of videos and documentation resources',
                type: 'object',
                required: ['videos', 'documentations'],
                additionalProperties: false,
                properties: {
                    videos: {
                        type: 'array',
                        description: 'List of video resources',
                        items: {
                            type: 'object',
                            required: ['url', 'duration'],
                            properties: {
                                url: {
                                    type: 'string',
                                    description: 'Video URL or file path'
                                },
                                duration: {
                                    type: 'string',
                                    description: 'Video duration'
                                },
                                description: {
                                    type: 'string',
                                    description: 'Brief description of video content'
                                }
                            },
                            additionalProperties: false
                        }
                    },
                    documentations: {
                        type: 'array',
                        description: 'List of documentation resources',
                        items: {
                            type: 'object',
                            required: ['url', 'type'],
                            properties: {
                                url: {
                                    type: 'string',
                                    description: 'Documentation URL or file path'
                                },
                                type: {
                                    type: 'string',
                                    description: 'Type of documentation (PDF, HTML, etc.)'
                                },
                                description: {
                                    type: 'string',
                                    description: 'Brief description of documentation content'
                                }
                            },
                            additionalProperties: false
                        }
                    }
                }
            }
        })

        const parsed = (typeof answer === 'object' ? answer : {}) as { videos?: ExaVideo[]; documentations?: ExaDocumentation[] }
        return {
            videos: parsed.videos || [],
            documentations: parsed.documentations || []
        }
    } catch (error) {
        console.error('Exa fetch error:', error)
        return { videos: [], documentations: [] }
    }
}

// ================================================================================
// OPENAI - Generate content, code examples, do's/don'ts, flashcards
// ================================================================================

async function fetchOpenAIResources(
    title: string,
    category: string,
    level: string
): Promise<OpenAIResourcesResult & { inputTokens: number; outputTokens: number }> {
    const prompt = `You are an expert educator. Generate comprehensive learning content for "${title}".
Category: ${category}, Level: ${level}.

Return JSON in this EXACT format:
{
  "content": "A detailed overview/explanation of ${title} (2-4 paragraphs, markdown supported)",
  "codeExamples": [
    {
      "title": "Example name",
      "language": "javascript",
      "code": "// Well-formatted code with proper indentation\\nfunction example() {\\n  // ...\\n}",
      "explanation": "Brief explanation"
    }
  ],
  "dosDonts": {
    "dos": ["Do 1", "Do 2", "Do 3", "Do 4", "Do 5"],
    "donts": ["Don't 1", "Don't 2", "Don't 3", "Don't 4", "Don't 5"]
  },
  "flashcards": [
    {
      "id": "fc1",
      "front": "Question or term",
      "back": "Answer or definition",
      "hint": "Optional hint"
    }
  ]
}

Rules:
- content: Clear, educational, use markdown for formatting
- codeExamples: 2-4 examples, properly indented, different languages if relevant
- dosDonts: 4-6 items each, practical and specific
- flashcards: 5-8 cards covering key Learns
- Return ONLY valid JSON, no markdown blocks`

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
            max_tokens: 4000,
            response_format: { type: 'json_object' }
        })

        const raw = response.choices[0]?.message?.content
        if (!raw) throw new Error('No content from OpenAI')

        const parsed = JSON.parse(raw) as OpenAIResourcesResult
        const inputTokens = response.usage?.prompt_tokens ?? 0
        const outputTokens = response.usage?.completion_tokens ?? 0

        return {
            content: parsed.content || '',
            codeExamples: parsed.codeExamples || [],
            dosDonts: parsed.dosDonts || { dos: [], donts: [] },
            flashcards: (parsed.flashcards || []).map((f, i) => ({
                ...f,
                id: f.id || `fc-${i}`
            })),
            inputTokens,
            outputTokens,
        }
    } catch (error) {
        console.error('OpenAI resources error:', error)
        return {
            content: '',
            codeExamples: [],
            dosDonts: { dos: [], donts: [] },
            flashcards: [],
            inputTokens: 0,
            outputTokens: 0,
        }
    }
}

// ================================================================================
// COMBINED - Run Exa and OpenAI in parallel
// ================================================================================

export interface GenerateSubGoalResourcesResult {
    resources: SubGoalResources | null
    usageCost: number
    inputTokens: number
    outputTokens: number
}

export async function generateSubGoalResources(
    subGoalId: string,
    goalId: string,
    userId: string,
    title: string,
    category: string,
    level: string
): Promise<GenerateSubGoalResourcesResult> {
    try {
        const [exaResult, openaiResult] = await Promise.all([
            fetchExaResources(title, category, level),
            fetchOpenAIResources(title, category, level)
        ])

        const resources: SubGoalResources = {
            videos: exaResult.videos,
            documentations: exaResult.documentations,
            content: openaiResult.content,
            codeExamples: openaiResult.codeExamples,
            dosDonts: openaiResult.dosDonts,
            flashcards: openaiResult.flashcards
        }

        await prisma.pathfinderSubGoal.update({
            where: { id: subGoalId },
            data: { aiResources: resources as unknown as object }
        })

        // Log usage
        let totalCost = 0
        if (openaiResult.inputTokens > 0 || openaiResult.outputTokens > 0) {
            const openaiLog = await logPathfinderUsage({
                goalId,
                userId,
                action: 'subgoal_content',
                provider: 'openai',
                inputTokens: openaiResult.inputTokens,
                outputTokens: openaiResult.outputTokens,
            })
            totalCost += openaiLog.creditsCost
        }
        if (exaResult.videos.length > 0 || exaResult.documentations.length > 0) {
            const exaLog = await logPathfinderUsage({
                goalId,
                userId,
                action: 'subgoal_content',
                provider: 'exa',
            })
            totalCost += exaLog.creditsCost
        }

        return {
            resources,
            usageCost: totalCost,
            inputTokens: openaiResult.inputTokens,
            outputTokens: openaiResult.outputTokens,
        }
    } catch (error) {
        console.error('generateSubGoalResources error:', error)
        return {
            resources: null,
            usageCost: 0,
            inputTokens: 0,
            outputTokens: 0,
        }
    }
}