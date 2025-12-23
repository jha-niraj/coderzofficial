"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import OpenAI from "openai";
import * as fal from "@fal-ai/serverless-client";

// Initialize OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Initialize fal.ai
fal.config({
    credentials: process.env.FAL_KEY,
});

// ==========================================
// TYPES
// ==========================================

export interface GeneratedQuiz {
    question: string;
    options: { id: number; text: string; isCorrect: boolean }[];
    explanation: string;
}

export interface GeneratedChallenge {
    description: string;
    starterCode: string;
    solution: string;
    hints: string[];
    testCases?: { input: string; expectedOutput: string }[];
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

// ==========================================
// HELPER FUNCTIONS
// ==========================================

async function checkIsAdmin() {
    const session = await auth();
    if (!session?.user?.id) {
        return { isAdmin: false, error: "Unauthorized" };
    }
    
    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true },
    });
    
    if (user?.role !== "Admin") {
        return { isAdmin: false, error: "Admin access required" };
    }
    
    return { isAdmin: true, userId: session.user.id };
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

        const prompt = `You are an expert programming instructor creating a quiz question for a learning concept.

Concept: ${conceptTitle}
Description: ${conceptDescription}
Current Step: ${stepTitle}
Step Content: ${stepContent}
${language ? `Programming Language: ${language}` : ''}

Generate a single multiple-choice quiz question that tests the learner's understanding of this step's content.
The question should:
1. Be clear and unambiguous
2. Have exactly 4 options
3. Have only one correct answer
4. Include a detailed explanation for why the correct answer is right

Respond in JSON format:
{
    "question": "The quiz question text",
    "options": [
        { "id": 0, "text": "Option A", "isCorrect": false },
        { "id": 1, "text": "Option B", "isCorrect": true },
        { "id": 2, "text": "Option C", "isCorrect": false },
        { "id": 3, "text": "Option D", "isCorrect": false }
    ],
    "explanation": "Detailed explanation of why the correct answer is right and why other options are wrong"
}`;

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: "You are a helpful assistant that generates educational quiz questions. Always respond with valid JSON only, no markdown."
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

Generate a practical coding challenge that reinforces the concepts from this step.
The challenge should:
1. Be solvable in 5-10 minutes
2. Test practical application of the concept
3. Include helpful starter code
4. Provide a complete solution with comments
5. Include progressive hints (3 hints, from subtle to more direct)

Respond in JSON format:
{
    "description": "Clear description of what the learner needs to build or solve",
    "starterCode": "// Starter code with TODO comments and structure",
    "solution": "// Complete solution with explanatory comments",
    "hints": ["Subtle hint", "More helpful hint", "Direct hint"],
    "testCases": [
        { "input": "example input", "expectedOutput": "expected result" }
    ]
}`;

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: "You are a helpful assistant that generates coding challenges. Always respond with valid JSON only, no markdown."
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

        const prompt = `You are an expert programming instructor creating a summary and take-home assignment.

Concept: ${conceptTitle}
Description: ${conceptDescription}

All Steps:
${stepsOverview}

Generate:
1. Key takeaways (5-7 important points the learner should remember)
2. Pro tips (3-5 practical tips for applying this knowledge)
3. A take-home assignment that reinforces all the concepts covered

Respond in JSON format:
{
    "keyTakeaways": ["Point 1", "Point 2", "Point 3", "Point 4", "Point 5"],
    "tips": ["Tip 1", "Tip 2", "Tip 3"],
    "assignment": {
        "title": "Assignment title",
        "description": "Detailed description of what to build/practice",
        "hints": ["Hint 1", "Hint 2", "Hint 3"]
    }
}`;

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: "You are a helpful assistant that generates educational summaries and assignments. Always respond with valid JSON only, no markdown."
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
    comparisonTopics: string[] // e.g., ["React", "Vue", "Angular"]
): Promise<{ comparison?: GeneratedComparison; error?: string }> {
    try {
        const adminCheck = await checkIsAdmin();
        if (!adminCheck.isAdmin) {
            return { error: adminCheck.error };
        }

        const prompt = `You are an expert programming instructor creating a comparison for learning.

Concept: ${conceptTitle}
Description: ${conceptDescription}
Comparison Step: ${stepTitle}
Topics to Compare: ${comparisonTopics.join(", ")}

Generate a detailed comparison of these topics/approaches.
For each item, provide:
1. A brief description
2. Key pros (3-4 points)
3. Key cons (2-3 points)
4. Best use case

Respond in JSON format:
{
    "items": [
        {
            "title": "Topic Name",
            "description": "Brief description of this topic/approach",
            "pros": ["Pro 1", "Pro 2", "Pro 3"],
            "cons": ["Con 1", "Con 2"],
            "useCase": "Best used when..."
        }
    ],
    "conclusion": "Summary of when to use which approach"
}`;

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: "You are a helpful assistant that generates educational comparisons. Always respond with valid JSON only, no markdown."
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
// VISUALIZATION IMAGE GENERATION (FAL.AI)
// Coming Soon - Prepared for future use
// ==========================================

export async function generateVisualizationImage(
    conceptTitle: string,
    visualizationDescription: string
): Promise<{ imageUrl?: string; error?: string }> {
    try {
        const adminCheck = await checkIsAdmin();
        if (!adminCheck.isAdmin) {
            return { error: adminCheck.error };
        }

        // FAL.AI image generation - prepared for future use
        const prompt = `Educational diagram for programming concept: ${conceptTitle}. ${visualizationDescription}. Clean, professional, minimalist style with clear labels. Technical illustration suitable for learning.`;

        const result = await fal.subscribe("fal-ai/flux/schnell", {
            input: {
                prompt,
                image_size: "landscape_16_9",
                num_inference_steps: 4,
                num_images: 1,
                enable_safety_checker: true,
            },
            logs: true,
        }) as { images: { url: string }[] };

        if (result.images && result.images.length > 0) {
            return { imageUrl: result.images[0].url };
        }

        return { error: "Failed to generate image" };
    } catch (error) {
        console.error("Error generating visualization image:", error);
        return { error: "Image generation is coming soon" };
    }
}

// ==========================================
// AUTO-GENERATE STEP CONTENT
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
                typeSpecificInstructions = "Write a clear, educational explanation. Use analogies where helpful. Structure with headings if appropriate.";
                break;
            case "CODE":
                typeSpecificInstructions = "Write content that introduces and explains code concepts. Focus on the 'why' before the 'how'.";
                break;
            case "VISUALIZATION":
                typeSpecificInstructions = "Describe what should be visualized and why it helps understanding. Be descriptive about the visual elements.";
                break;
            case "COMPARISON":
                typeSpecificInstructions = "Write an introduction to the comparison. Explain what we're comparing and why.";
                break;
            case "QUIZ":
                typeSpecificInstructions = "Write a brief introduction to what will be tested in this quiz.";
                break;
            case "CHALLENGE":
                typeSpecificInstructions = "Write an introduction to the challenge. Set the context and learning goals.";
                break;
            case "SUMMARY":
                typeSpecificInstructions = "Write a recap of the key concepts covered. Be concise but comprehensive.";
                break;
        }

        const prompt = `You are an expert programming instructor writing content for a learning step.

Concept: ${conceptTitle}
Description: ${conceptDescription}
Step Title: ${stepTitle}
Step Type: ${stepType}
${language ? `Programming Language: ${language}` : ''}

${typeSpecificInstructions}

Write the content for this step. Keep it:
- Clear and easy to understand
- Engaging but professional
- Practical with real-world relevance
- Appropriately detailed for the step type

Write in plain text or HTML format. Do not use markdown.`;

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: "You are a helpful assistant that writes educational content. Write clear, engaging content suitable for learners."
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
