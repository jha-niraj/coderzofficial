"use server";

import { auth } from '@repo/auth';
import { prisma } from "@repo/prisma";
import { revalidatePath } from "next/cache";
import OpenAI from "openai";
import * as fal from "@fal-ai/serverless-client";
import { StudioVisibility } from "@repo/prisma/client";

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
export interface StudioFormData {
    title: string;
    description?: string;
    category: string;
    tags?: string[];
    visibility?: "PUBLIC" | "PRIVATE";
}

export interface QuizQuestion {
    id: string;
    question: string;
    options: string[];
    correctAnswer: number;
    explanation?: string;
}

export interface FlashCard {
    id: string;
    front: string;
    back: string;
    hint?: string;
}

export interface ChatMessage {
    role: "user" | "assistant";
    content: string;
}

// ==========================================
// STUDIO CRUD OPERATIONS
// ==========================================

// ==========================================
// STUDIO FILTERS INTERFACE
// ==========================================
export interface StudioFilters {
    search?: string;
    category?: string;
    visibility?: "PUBLIC" | "PRIVATE";
    sortBy?: 'latest' | 'popular' | 'views' | 'likes';
    page?: number;
    limit?: number;
}

export async function getStudios() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { error: "Unauthorized" };
        }

        const studios = await prisma.studio.findMany({
            where: { userId: session.user.id },
            orderBy: { updatedAt: "desc" },
            include: {
                _count: {
                    select: {
                        quizzes: true,
                        flashcardDecks: true,
                        codeBlocks: true,
                    },
                },
            },
        });

        return { studios };
    } catch (error) {
        console.error("Error fetching studios:", error);
        return { error: "Failed to fetch studios" };
    }
}

export async function getMyStudios(filters: StudioFilters = {}) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { error: "Unauthorized" };
        }

        const { search, category, sortBy = 'latest', page = 1, limit = 10 } = filters;
        const skip = (page - 1) * limit;

        const where: Record<string, unknown> = { userId: session.user.id };
        
        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } }
            ];
        }
        
        if (category) {
            where.category = category;
        }

        const orderBy: Record<string, string> = {};
        switch (sortBy) {
            case 'popular': orderBy.likes = 'desc'; break;
            case 'views': orderBy.views = 'desc'; break;
            case 'likes': orderBy.likes = 'desc'; break;
            default: orderBy.updatedAt = 'desc';
        }

        const [studios, total] = await Promise.all([
            prisma.studio.findMany({
                where,
                orderBy,
                skip,
                take: limit,
                include: {
                    _count: {
                        select: {
                            quizzes: true,
                            flashcardDecks: true,
                            codeBlocks: true,
                        },
                    },
                    user: {
                        select: {
                            id: true,
                            name: true,
                            username: true,
                            image: true,
                        },
                    },
                },
            }),
            prisma.studio.count({ where }),
        ]);

        return {
            studios,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    } catch (error) {
        console.error("Error fetching my studios:", error);
        return { error: "Failed to fetch studios" };
    }
}

export async function getPublicStudios(filters: StudioFilters = {}) {
    try {
        const { search, category, sortBy = 'popular', page = 1, limit = 10 } = filters;
        const skip = (page - 1) * limit;

        const where: Record<string, unknown> = { 
            visibility: StudioVisibility.PUBLIC 
        };
        
        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } }
            ];
        }
        
        if (category) {
            where.category = category;
        }

        const orderBy: Record<string, string> = {};
        switch (sortBy) {
            case 'latest': orderBy.createdAt = 'desc'; break;
            case 'views': orderBy.views = 'desc'; break;
            case 'likes': orderBy.likes = 'desc'; break;
            default: orderBy.views = 'desc';
        }

        const [studios, total] = await Promise.all([
            prisma.studio.findMany({
                where,
                orderBy,
                skip,
                take: limit,
                include: {
                    _count: {
                        select: {
                            quizzes: true,
                            flashcardDecks: true,
                            codeBlocks: true,
                        },
                    },
                    user: {
                        select: {
                            id: true,
                            name: true,
                            username: true,
                            image: true,
                        },
                    },
                },
            }),
            prisma.studio.count({ where }),
        ]);

        return {
            studios,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    } catch (error) {
        console.error("Error fetching public studios:", error);
        return { error: "Failed to fetch public studios" };
    }
}

export async function getStudiosByCategory(category: string, filters: StudioFilters = {}) {
    try {
        const { search, sortBy = 'popular', page = 1, limit = 10 } = filters;
        const skip = (page - 1) * limit;

        const where: Record<string, unknown> = { 
            visibility: StudioVisibility.PUBLIC,
            category: category.toUpperCase()
        };
        
        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } }
            ];
        }

        const orderBy: Record<string, string> = {};
        switch (sortBy) {
            case 'latest': orderBy.createdAt = 'desc'; break;
            case 'views': orderBy.views = 'desc'; break;
            case 'likes': orderBy.likes = 'desc'; break;
            default: orderBy.views = 'desc';
        }

        const [studios, total] = await Promise.all([
            prisma.studio.findMany({
                where,
                orderBy,
                skip,
                take: limit,
                include: {
                    _count: {
                        select: {
                            quizzes: true,
                            flashcardDecks: true,
                            codeBlocks: true,
                        },
                    },
                    user: {
                        select: {
                            id: true,
                            name: true,
                            username: true,
                            image: true,
                        },
                    },
                },
            }),
            prisma.studio.count({ where }),
        ]);

        return {
            studios,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    } catch (error) {
        console.error("Error fetching studios by category:", error);
        return { error: "Failed to fetch studios" };
    }
}

export async function getStudioStats() {
    try {
        const [totalStudios, totalPublicStudios, totalLearners] = await Promise.all([
            prisma.studio.count(),
            prisma.studio.count({ where: { visibility: StudioVisibility.PUBLIC } }),
            prisma.studio.aggregate({ _sum: { views: true } }),
        ]);

        return {
            totalStudios,
            totalPublicStudios,
            totalLearners: totalLearners._sum.views || 0,
        };
    } catch (error) {
        console.error("Error fetching studio stats:", error);
        return { totalStudios: 0, totalPublicStudios: 0, totalLearners: 0 };
    }
}

export async function getStudio(slugOrId: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { error: "Unauthorized" };
        }

        const studio = await prisma.studio.findFirst({
            where: {
                OR: [
                    { slug: slugOrId },
                    { id: slugOrId },
                ],
                AND: {
                    OR: [
                        { userId: session.user.id },
                        { visibility: StudioVisibility.PUBLIC },
                    ],
                },
            },
            include: {
                quizzes: true,
                flashcardDecks: true,
                codeBlocks: true,
                mediaBlocks: true,
                chatHistory: {
                    orderBy: { createdAt: "asc" },
                },
                user: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        image: true,
                    },
                },
            },
        });

        if (!studio) {
            return { error: "Studio not found" };
        }

        return { studio };
    } catch (error) {
        console.error("Error fetching studio:", error);
        return { error: "Failed to fetch studio" };
    }
}

function generateStudioSlug(title: string): string {
    const base = title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .substring(0, 50);
    const suffix = Math.random().toString(36).substring(2, 8);
    return `${base}-${suffix}`;
}

export async function createStudio(data: StudioFormData) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { error: "Unauthorized" };
        }

        const slug = generateStudioSlug(data.title);

        const studio = await prisma.studio.create({
            data: {
                slug,
                title: data.title,
                description: data.description,
                category: data.category as any,
                tags: data.tags || [],
                visibility: data.visibility === "PUBLIC" ? StudioVisibility.PUBLIC : StudioVisibility.PRIVATE,
                content: { blocks: [] },
                userId: session.user.id,
            },
        });

        revalidatePath("/studio");
        return { studio };
    } catch (error) {
        console.error("Error creating studio:", error);
        return { error: "Failed to create studio" };
    }
}

export async function updateStudio(studioId: string, data: Partial<StudioFormData> & { content?: any }) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { error: "Unauthorized" };
        }

        const studio = await prisma.studio.update({
            where: {
                id: studioId,
                userId: session.user.id,
            },
            data: {
                ...(data.title && { title: data.title }),
                ...(data.description !== undefined && { description: data.description }),
                ...(data.category && { category: data.category as any }),
                ...(data.tags && { tags: data.tags }),
                ...(data.visibility && { visibility: data.visibility === "PUBLIC" ? StudioVisibility.PUBLIC : StudioVisibility.PRIVATE }),
                ...(data.content && { content: data.content }),
                lastEditedAt: new Date(),
            },
        });

        return { studio };
    } catch (error) {
        console.error("Error updating studio:", error);
        return { error: "Failed to update studio" };
    }
}

export async function deleteStudio(studioId: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { error: "Unauthorized" };
        }

        await prisma.studio.delete({
            where: {
                id: studioId,
                userId: session.user.id,
            },
        });

        revalidatePath("/studio");
        return { success: true };
    } catch (error) {
        console.error("Error deleting studio:", error);
        return { error: "Failed to delete studio" };
    }
}

// ==========================================
// AI GENERATION
// ==========================================

export async function generateQuiz(
    studioId: string,
    blockId: string,
    topic: string,
    numberOfQuestions: number = 5,
    difficulty: "easy" | "medium" | "hard" = "medium"
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { error: "Unauthorized" };
        }

        // Verify studio ownership
        const studio = await prisma.studio.findFirst({
            where: { id: studioId, userId: session.user.id },
        });

        if (!studio) {
            return { error: "Studio not found" };
        }

        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: `You are an expert educator creating quiz questions. Generate exactly ${numberOfQuestions} multiple choice questions about the given topic at ${difficulty} difficulty level. 
          
Return ONLY a valid JSON array with this exact structure:
[
  {
    "id": "q1",
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "explanation": "Brief explanation of why this is correct"
  }
]

The correctAnswer is the index (0-3) of the correct option.`,
                },
                {
                    role: "user",
                    content: `Create ${numberOfQuestions} ${difficulty} level quiz questions about: ${topic}`,
                },
            ],
            temperature: 0.7,
        });

        const content = response.choices[0]?.message?.content || "[]";
        // Extract JSON from response (in case there's markdown formatting)
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        const questions = jsonMatch ? JSON.parse(jsonMatch[0]) : [];

        // Save quiz to database
        const quiz = await prisma.studioQuiz.create({
            data: {
                blockId,
                title: `Quiz: ${topic}`,
                questions: questions as any,
                studioId,
            },
        });

        return { quiz, questions };
    } catch (error) {
        console.error("Error generating quiz:", error);
        return { error: "Failed to generate quiz" };
    }
}

export async function generateFlashcards(
    studioId: string,
    blockId: string,
    topic: string,
    numberOfCards: number = 10
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { error: "Unauthorized" };
        }

        // Verify studio ownership
        const studio = await prisma.studio.findFirst({
            where: { id: studioId, userId: session.user.id },
        });

        if (!studio) {
            return { error: "Studio not found" };
        }

        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: `You are an expert educator creating flashcards for studying. Generate exactly ${numberOfCards} flashcards about the given topic.
          
Return ONLY a valid JSON array with this exact structure:
[
  {
    "id": "card1",
    "front": "Question or term on the front",
    "back": "Answer or definition on the back",
    "hint": "Optional hint to help remember"
  }
]`,
                },
                {
                    role: "user",
                    content: `Create ${numberOfCards} flashcards about: ${topic}`,
                },
            ],
            temperature: 0.7,
        });

        const content = response.choices[0]?.message?.content || "[]";
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        const cards = jsonMatch ? JSON.parse(jsonMatch[0]) : [];

        // Save flashcard deck to database
        const deck = await prisma.studioFlashcardDeck.create({
            data: {
                blockId,
                title: `Flashcards: ${topic}`,
                cards: cards as any,
                studioId,
            },
        });

        return { deck, cards };
    } catch (error) {
        console.error("Error generating flashcards:", error);
        return { error: "Failed to generate flashcards" };
    }
}

export async function generateImage(
    studioId: string,
    blockId: string,
    prompt: string
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { error: "Unauthorized" };
        }

        // Verify studio ownership
        const studio = await prisma.studio.findFirst({
            where: { id: studioId, userId: session.user.id },
        });

        if (!studio) {
            return { error: "Studio not found" };
        }

        // Generate image using fal.ai
        const result = await fal.subscribe("fal-ai/flux/schnell", {
            input: {
                prompt: prompt,
                image_size: "landscape_4_3",
                num_images: 1,
            },
        }) as { images: { url: string; width: number; height: number }[] };

        if (!result.images || result.images.length === 0) {
            return { error: "Failed to generate image" };
        }

        const imageData = result.images[0];

        // Save media block to database
        const mediaBlock = await prisma.studioMediaBlock.create({
            data: {
                blockId,
                type: "IMAGE",
                url: imageData?.url || "",
                prompt,
                width: imageData?.width,
                height: imageData?.height,
                studioId,
            },
        });

        return {
            mediaBlock, imageUrl: imageData?.url
        };
    } catch (error) {
        console.error("Error generating image:", error);
        return { error: "Failed to generate image" };
    }
}

// ==========================================
// AI CHAT
// ==========================================

export async function sendChatMessage(
    studioId: string,
    message: string,
    context?: string
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { error: "Unauthorized" };
        }

        // Verify studio access
        const studio = await prisma.studio.findFirst({
            where: {
                id: studioId,
                OR: [
                    { userId: session.user.id },
                    { visibility: StudioVisibility.PUBLIC },
                ],
            },
            include: {
                chatHistory: {
                    orderBy: { createdAt: "desc" },
                    take: 10,
                },
            },
        });

        if (!studio) {
            return { error: "Studio not found" };
        }

        // Save user message
        await prisma.studioChatMessage.create({
            data: {
                studioId,
                role: "user",
                content: message,
            },
        });

        // Build conversation history
        const history = studio.chatHistory.reverse().map((msg: { role: string; content: string }) => ({
            role: msg.role as "user" | "assistant",
            content: msg.content,
        }));

        const systemPrompt = `You are an intelligent AI learning assistant for a study workspace called "Studio". Your role is to help users learn and understand topics effectively.

${context ? `Current context from the studio:\n${context}\n` : ""}

Guidelines:
- Be helpful, encouraging, and educational
- Explain concepts clearly with examples when appropriate
- If asked to generate content (quiz, flashcards, etc.), explain that users should use slash commands in the editor
- Support code explanations and debugging
- Keep responses concise but comprehensive`;

        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: systemPrompt },
                ...history,
                { role: "user", content: message },
            ],
            temperature: 0.7,
            max_tokens: 1000,
        });

        const assistantMessage = response.choices[0]?.message?.content || "I apologize, but I couldn't generate a response. Please try again.";

        // Save assistant message
        const savedMessage = await prisma.studioChatMessage.create({
            data: {
                studioId,
                role: "assistant",
                content: assistantMessage,
            },
        });

        return { message: savedMessage };
    } catch (error) {
        console.error("Error sending chat message:", error);
        return { error: "Failed to send message" };
    }
}

export async function getChatHistory(studioId: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { error: "Unauthorized" };
        }

        const messages = await prisma.studioChatMessage.findMany({
            where: { studioId },
            orderBy: { createdAt: "asc" },
        });

        return { messages };
    } catch (error) {
        console.error("Error fetching chat history:", error);
        return { error: "Failed to fetch chat history" };
    }
}

export async function clearChatHistory(studioId: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { error: "Unauthorized" };
        }

        // Verify ownership
        const studio = await prisma.studio.findFirst({
            where: { id: studioId, userId: session.user.id },
        });

        if (!studio) {
            return { error: "Studio not found" };
        }

        await prisma.studioChatMessage.deleteMany({
            where: { studioId },
        });

        return { success: true };
    } catch (error) {
        console.error("Error clearing chat history:", error);
        return { error: "Failed to clear chat history" };
    }
}

// ==========================================
// CODE BLOCKS
// ==========================================

export async function saveCodeBlock(
    studioId: string,
    blockId: string,
    data: {
        language: string;
        code: string;
        isPractice?: boolean;
        problemTitle?: string;
        problemDescription?: string;
        testCases?: { input: string; expectedOutput: string }[];
        hints?: string[];
        solution?: string;
    }
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { error: "Unauthorized" };
        }

        // Verify ownership
        const studio = await prisma.studio.findFirst({
            where: { id: studioId, userId: session.user.id },
        });

        if (!studio) {
            return { error: "Studio not found" };
        }

        // Check if code block exists
        const existingBlock = await prisma.studioCodeBlock.findFirst({
            where: { blockId, studioId },
        });

        let codeBlock;
        if (existingBlock) {
            codeBlock = await prisma.studioCodeBlock.update({
                where: { id: existingBlock.id },
                data: {
                    language: data.language,
                    code: data.code,
                    isPractice: data.isPractice ?? false,
                    problemTitle: data.problemTitle,
                    problemDescription: data.problemDescription,
                    testCases: data.testCases as any,
                    hints: data.hints || [],
                    solution: data.solution,
                },
            });
        } else {
            codeBlock = await prisma.studioCodeBlock.create({
                data: {
                    blockId,
                    language: data.language,
                    code: data.code,
                    isPractice: data.isPractice ?? false,
                    problemTitle: data.problemTitle,
                    problemDescription: data.problemDescription,
                    testCases: data.testCases as any,
                    hints: data.hints || [],
                    solution: data.solution,
                    studioId,
                },
            });
        }

        return { codeBlock };
    } catch (error) {
        console.error("Error saving code block:", error);
        return { error: "Failed to save code block" };
    }
}

// ==========================================
// QUIZ ATTEMPTS
// ==========================================

export async function submitQuizAttempt(
    quizId: string,
    answers: { questionId: string; selectedAnswer: number }[],
    timeTaken?: number
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { error: "Unauthorized" };
        }

        const quiz = await prisma.studioQuiz.findUnique({
            where: { id: quizId },
        });

        if (!quiz) {
            return { error: "Quiz not found" };
        }

        const questions = quiz.questions as unknown as QuizQuestion[];
        let score = 0;
        const maxScore = questions.length;

        // Calculate score
        for (const answer of answers) {
            const question = questions.find((q) => q.id === answer.questionId);
            if (question && question.correctAnswer === answer.selectedAnswer) {
                score++;
            }
        }

        const attempt = await prisma.studioQuizAttempt.create({
            data: {
                quizId,
                userId: session.user.id,
                score,
                maxScore,
                answers: answers as any,
                timeTaken,
            },
        });

        return { attempt, score, maxScore };
    } catch (error) {
        console.error("Error submitting quiz attempt:", error);
        return { error: "Failed to submit quiz attempt" };
    }
}

// ==========================================
// FLASHCARD SESSIONS
// ==========================================

export async function saveFlashcardSession(
    deckId: string,
    data: {
        cardsStudied: number;
        correctCount: number;
        studyTime: number;
        cardProgress: Record<string, { correct: number; incorrect: number; lastSeen: Date }>;
    }
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { error: "Unauthorized" };
        }

        const deck = await prisma.studioFlashcardDeck.findUnique({
            where: { id: deckId },
        });

        if (!deck) {
            return { error: "Deck not found" };
        }

        const studySession = await prisma.studioFlashcardSession.create({
            data: {
                deckId,
                userId: session.user.id,
                cardsStudied: data.cardsStudied,
                correctCount: data.correctCount,
                studyTime: data.studyTime,
                cardProgress: data.cardProgress as any,
            },
        });

        return { studySession };
    } catch (error) {
        console.error("Error saving flashcard session:", error);
        return { error: "Failed to save flashcard session" };
    }
}

// ==========================================
// AI CONTENT EXPLANATION
// ==========================================

export async function explainContent(content: string, type: "code" | "concept" | "error") {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { error: "Unauthorized" };
        }

        const prompts = {
            code: `Explain this code in a clear, educational way. Break down what each part does and explain any complex concepts:\n\n${content}`,
            concept: `Explain this concept in a clear, educational way with examples:\n\n${content}`,
            error: `Explain this error and how to fix it:\n\n${content}`,
        };

        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: "You are an expert programming tutor. Explain concepts clearly with examples when appropriate. Use markdown formatting for better readability.",
                },
                {
                    role: "user",
                    content: prompts[type],
                },
            ],
            temperature: 0.7,
            max_tokens: 1500,
        });

        const explanation = response.choices[0]?.message?.content || "Unable to generate explanation.";

        return { explanation };
    } catch (error) {
        console.error("Error explaining content:", error);
        return { error: "Failed to explain content" };
    }
}
