"use server";

import { auth } from '@repo/auth';
import { prisma } from "@repo/prisma";
import OpenAI from "openai";
import Exa from 'exa-js';

// Initialize OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// ==========================================
// TYPES
// ==========================================
export interface GeneratedQuiz {
    question: string;
    options: { id: string; text: string; isCorrect: boolean }[];
    explanation: string;
}

export interface GeneratedChallenge {
    description: string;
    starterCode: string;
    solution: string;
    hints: string[];
    testCases?: { input: string; expectedOutput: string }[];
    language: string;
}

export interface GeneratedSummary {
    keyTakeaways: string[];
    tips: string[];
    assignment?: {
        title: string;
        description: string;
        hints: string[];
    };
}

export interface GeneratedComparison {
    items: {
        title: string;
        description: string;
        pros: string[];
        cons: string[];
        useCase: string;
    }[];
    conclusion: string;
}

export interface ExaVideo {
    url: string;
    title?: string;
    duration?: string;
    description?: string;
}

export interface ExaDoc {
    url: string;
    title?: string;
    type?: string;
    description?: string;
}

export interface GeneratedResources {
    videos: ExaVideo[];
    docs: ExaDoc[];
}

// ==========================================
// HELPER FUNCTIONS
// ==========================================

async function checkIsAdmin() {
    const session = await auth();
    if (!session?.user?.id) {
        return { isAdmin: false, error: "Unauthorized" };
    }

    return { isAdmin: true, userId: session.user.id };
}

// ==========================================
// STEP CONTENT GENERATION (Markdown)
// ==========================================

export async function generateStepContent(
    conceptTitle: string,
    conceptDescription: string,
    stepTitle: string,
    stepType: string,
    language?: string
): Promise<{ content?: string; error?: string }> {
    try {
        const adminCheck = await checkIsAdmin();
        if (!adminCheck.isAdmin) {
            return { error: adminCheck.error };
        }

        let typeSpecificInstructions = "";
        switch (stepType) {
            case "EXPLANATION":
                typeSpecificInstructions = `Write a clear, educational explanation in **Markdown format**. Use:
- **Headers** (## for sections, ### for subsections)
- **Bold** and *italic* for emphasis
- \`inline code\` for technical terms
- Bullet points and numbered lists
- > Blockquotes for important notes
- Code blocks with syntax highlighting where relevant
- Analogies and real-world examples`;
                break;
            case "CODE":
                typeSpecificInstructions = `Write content introducing code concepts in **Markdown format**. Include:
- A brief explanation of the concept
- Why this approach is used
- Key patterns to notice
- Use \`\`\`language code blocks for examples`;
                break;
            case "VISUALIZATION":
                typeSpecificInstructions = "Describe what should be visualized in **Markdown format**. Use mermaid diagram syntax if applicable.";
                break;
            case "COMPARISON":
                typeSpecificInstructions = "Write an introduction to the comparison in **Markdown format**. Explain what we're comparing and why.";
                break;
            case "QUIZ":
                typeSpecificInstructions = "Write a brief introduction to what will be tested in **Markdown format**. Set context for the quiz.";
                break;
            case "CHALLENGE":
                typeSpecificInstructions = "Write an introduction to the challenge in **Markdown format**. Set the context and learning goals.";
                break;
            case "SUMMARY":
                typeSpecificInstructions = "Write a recap of the key concepts in **Markdown format**. Be concise but comprehensive.";
                break;
            case "RESOURCE":
                typeSpecificInstructions = "Write a brief introduction for the resources section in **Markdown format**.";
                break;
        }

        const prompt = `You are an expert programming instructor writing content for a learning step.

Concept: ${conceptTitle}
Description: ${conceptDescription}
Step Title: ${stepTitle}
Step Type: ${stepType}
${language ? `Programming Language: ${language}` : ''}

${typeSpecificInstructions}

IMPORTANT: Write ALL content in **Markdown format**. Use proper headings, code blocks with language tags, bold/italic, lists, and blockquotes. Make it engaging and well-structured.`;

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: "You are a helpful assistant that writes educational content in Markdown format. Always use proper Markdown syntax with headings, code blocks, emphasis, and lists."
                },
                { role: "user", content: prompt }
            ],
            temperature: 0.7,
        });

        const content = response.choices[0]?.message?.content;
        if (!content) {
            return { error: "Failed to generate content" };
        }

        return { content };
    } catch (error) {
        console.error("Error generating step content:", error);
        return { error: "Failed to generate content" };
    }
}

// ==========================================
// QUIZ GENERATION
// ==========================================

export async function generateQuizQuestion(
    conceptTitle: string,
    conceptDescription: string,
    stepTitle: string,
    stepContent: string,
    language?: string
): Promise<{ quiz?: GeneratedQuiz; error?: string }> {
    try {
        const adminCheck = await checkIsAdmin();
        if (!adminCheck.isAdmin) {
            return { error: adminCheck.error };
        }

        const prompt = `You are an expert programming instructor creating a quiz question.

Concept: ${conceptTitle}
Description: ${conceptDescription}
Current Step: ${stepTitle}
Step Content: ${stepContent}
${language ? `Programming Language: ${language}` : ''}

Generate a single multiple-choice quiz question that tests understanding of this step.
Requirements:
1. Clear and unambiguous question
2. Exactly 4 options with unique string IDs
3. Only one correct answer
4. Detailed explanation in Markdown format

Respond in JSON format:
{
    "question": "The quiz question text",
    "options": [
        { "id": "a", "text": "Option A", "isCorrect": false },
        { "id": "b", "text": "Option B", "isCorrect": true },
        { "id": "c", "text": "Option C", "isCorrect": false },
        { "id": "d", "text": "Option D", "isCorrect": false }
    ],
    "explanation": "Markdown explanation of why the correct answer is right"
}`;

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: "You are a helpful assistant that generates educational quiz questions. Always respond with valid JSON only, no markdown blocks."
                },
                { role: "user", content: prompt }
            ],
            temperature: 0.7,
            response_format: { type: "json_object" }
        });

        const content = response.choices[0]?.message?.content;
        if (!content) {
            return { error: "Failed to generate quiz question" };
        }

        const quiz = JSON.parse(content) as GeneratedQuiz;
        return { quiz };
    } catch (error) {
        console.error("Error generating quiz:", error);
        return { error: "Failed to generate quiz question" };
    }
}

// ==========================================
// CHALLENGE GENERATION
// ==========================================

export async function generateChallenge(
    conceptTitle: string,
    conceptDescription: string,
    stepTitle: string,
    stepContent: string,
    language: string = "javascript"
): Promise<{ challenge?: GeneratedChallenge; error?: string }> {
    try {
        const adminCheck = await checkIsAdmin();
        if (!adminCheck.isAdmin) {
            return { error: adminCheck.error };
        }

        const prompt = `You are an expert programming instructor creating a coding challenge.

Concept: ${conceptTitle}
Description: ${conceptDescription}
Current Step: ${stepTitle}
Step Content: ${stepContent}
Programming Language: ${language}

Generate a practical coding challenge. The challenge should:
1. Be solvable in 5-10 minutes
2. Test practical application
3. Include starter code with TODO comments
4. Provide a complete solution
5. Include 3 progressive hints

Respond in JSON format:
{
    "description": "Clear description in **Markdown format**",
    "starterCode": "// Starter code with TODO comments",
    "solution": "// Complete solution with comments",
    "hints": ["Subtle hint", "More helpful hint", "Direct hint"],
    "testCases": [
        { "input": "example input", "expectedOutput": "expected result" }
    ],
    "language": "${language}"
}`;

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: "You are a helpful assistant that generates coding challenges. Always respond with valid JSON only, no markdown blocks."
                },
                { role: "user", content: prompt }
            ],
            temperature: 0.7,
            response_format: { type: "json_object" }
        });

        const content = response.choices[0]?.message?.content;
        if (!content) {
            return { error: "Failed to generate challenge" };
        }

        const challenge = JSON.parse(content) as GeneratedChallenge;
        return { challenge };
    } catch (error) {
        console.error("Error generating challenge:", error);
        return { error: "Failed to generate challenge" };
    }
}

// ==========================================
// SUMMARY & ASSIGNMENT GENERATION
// ==========================================

export async function generateSummaryAndAssignment(
    conceptTitle: string,
    conceptDescription: string,
    allStepsContent: { title: string; content: string; type: string }[]
): Promise<{ summary?: GeneratedSummary; error?: string }> {
    try {
        const adminCheck = await checkIsAdmin();
        if (!adminCheck.isAdmin) {
            return { error: adminCheck.error };
        }

        const stepsOverview = allStepsContent
            .map((s, i) => `Step ${i + 1} (${s.type}): ${s.title}\n${s.content.substring(0, 500)}...`)
            .join("\n\n");

        const prompt = `You are an expert programming instructor creating a summary and assignment.

Concept: ${conceptTitle}
Description: ${conceptDescription}

All Steps:
${stepsOverview}

Generate:
1. Key takeaways (5-7 points) in Markdown format
2. Pro tips (3-5 practical tips) in Markdown format
3. A take-home assignment

Respond in JSON format:
{
    "keyTakeaways": ["**Point 1** — explanation", "**Point 2** — explanation"],
    "tips": ["Tip 1 in markdown", "Tip 2 in markdown"],
    "assignment": {
        "title": "Assignment title",
        "description": "Detailed description in **Markdown format**",
        "hints": ["Hint 1", "Hint 2", "Hint 3"]
    }
}`;

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: "You are a helpful assistant that generates educational summaries. Respond with valid JSON only."
                },
                { role: "user", content: prompt }
            ],
            temperature: 0.7,
            response_format: { type: "json_object" }
        });

        const content = response.choices[0]?.message?.content;
        if (!content) {
            return { error: "Failed to generate summary" };
        }

        const summary = JSON.parse(content) as GeneratedSummary;
        return { summary };
    } catch (error) {
        console.error("Error generating summary:", error);
        return { error: "Failed to generate summary" };
    }
}

// ==========================================
// COMPARISON GENERATION
// ==========================================

export async function generateComparison(
    conceptTitle: string,
    conceptDescription: string,
    stepTitle: string,
    comparisonTopics: string[]
): Promise<{ comparison?: GeneratedComparison; error?: string }> {
    try {
        const adminCheck = await checkIsAdmin();
        if (!adminCheck.isAdmin) {
            return { error: adminCheck.error };
        }

        const prompt = `You are an expert programming instructor creating a comparison.

Concept: ${conceptTitle}
Description: ${conceptDescription}
Comparison Step: ${stepTitle}
Topics to Compare: ${comparisonTopics.join(", ")}

Generate a detailed comparison. For each item provide:
1. Brief description
2. Key pros (3-4 points) 
3. Key cons (2-3 points)
4. Best use case

Respond in JSON format:
{
    "items": [
        {
            "title": "Topic Name",
            "description": "Brief description",
            "pros": ["Pro 1", "Pro 2", "Pro 3"],
            "cons": ["Con 1", "Con 2"],
            "useCase": "Best used when..."
        }
    ],
    "conclusion": "Summary in **Markdown format** of when to use which approach"
}`;

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: "You are a helpful assistant that generates educational comparisons. Respond with valid JSON only."
                },
                { role: "user", content: prompt }
            ],
            temperature: 0.7,
            response_format: { type: "json_object" }
        });

        const content = response.choices[0]?.message?.content;
        if (!content) {
            return { error: "Failed to generate comparison" };
        }

        const comparison = JSON.parse(content) as GeneratedComparison;
        return { comparison };
    } catch (error) {
        console.error("Error generating comparison:", error);
        return { error: "Failed to generate comparison" };
    }
}

// ==========================================
// RESOURCE FETCHING (Exa.ai + AI)
// ==========================================

export async function generateResources(
    conceptTitle: string,
    stepTitle: string,
    category: string,
    difficulty: string
): Promise<{ resources?: GeneratedResources; error?: string }> {
    try {
        const adminCheck = await checkIsAdmin();
        if (!adminCheck.isAdmin) {
            return { error: adminCheck.error };
        }

        const apiKey = process.env.EXA_API_KEY;
        if (!apiKey) {
            return { error: "EXA_API_KEY not configured" };
        }

        const exa = new Exa(apiKey);
        const query = `Find the best YouTube tutorials and official documentation for learning "${stepTitle}" in the context of ${conceptTitle}. Category: ${category}, difficulty level: ${difficulty}. Include high-quality, up-to-date resources.`;

        const { answer } = await exa.answer(query, {
            outputSchema: {
                description: 'Videos and documentation resources for learning',
                type: 'object',
                required: ['videos', 'docs'],
                additionalProperties: false,
                properties: {
                    videos: {
                        type: 'array',
                        description: 'YouTube video resources',
                        items: {
                            type: 'object',
                            required: ['url'],
                            properties: {
                                url: { type: 'string', description: 'YouTube video URL' },
                                title: { type: 'string', description: 'Video title' },
                                duration: { type: 'string', description: 'Video duration' },
                                description: { type: 'string', description: 'Brief description' }
                            },
                            additionalProperties: false
                        }
                    },
                    docs: {
                        type: 'array',
                        description: 'Documentation resources',
                        items: {
                            type: 'object',
                            required: ['url'],
                            properties: {
                                url: { type: 'string', description: 'Documentation URL' },
                                title: { type: 'string', description: 'Documentation title' },
                                type: { type: 'string', description: 'Type (Official Docs, Article, Tutorial, Blog)' },
                                description: { type: 'string', description: 'Brief description' }
                            },
                            additionalProperties: false
                        }
                    }
                }
            }
        });

        const parsed = (typeof answer === 'object' ? answer : {}) as { videos?: ExaVideo[]; docs?: ExaDoc[] };
        return {
            resources: {
                videos: parsed.videos || [],
                docs: parsed.docs || [],
            }
        };
    } catch (error) {
        console.error("Error generating resources:", error);
        return { error: "Failed to fetch resources" };
    }
}

// ==========================================
// AI ASSISTANT (Real OpenAI)
// ==========================================

export async function askConceptAssistant(
    conceptTitle: string,
    conceptDescription: string,
    currentStepTitle: string,
    currentStepContent: string,
    question: string,
    conversationHistory: { role: "user" | "assistant"; content: string }[]
): Promise<{ answer?: string; error?: string }> {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { error: "Please login to use AI assistant" };
        }

        const messages: { role: "system" | "user" | "assistant"; content: string }[] = [
            {
                role: "system",
                content: `You are an expert programming tutor helping a student learn about "${conceptTitle}".

Context:
- Concept: ${conceptTitle}
- Description: ${conceptDescription}
- Current Step: ${currentStepTitle}
- Step Content: ${currentStepContent.substring(0, 2000)}

Instructions:
- Answer questions clearly and concisely
- Use **Markdown formatting** in your responses
- Include code examples when relevant (use \`\`\`language blocks)
- Relate answers back to the current concept and step
- Be encouraging and supportive
- If the student is confused, try explaining from a different angle`
            },
            ...conversationHistory.map(msg => ({
                role: msg.role as "user" | "assistant",
                content: msg.content
            })),
            { role: "user", content: question }
        ];

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages,
            temperature: 0.7,
            max_tokens: 1500,
        });

        const answer = response.choices[0]?.message?.content;
        if (!answer) {
            return { error: "Failed to get response" };
        }

        return { answer };
    } catch (error) {
        console.error("Error with AI assistant:", error);
        return { error: "Failed to get AI response" };
    }
}
