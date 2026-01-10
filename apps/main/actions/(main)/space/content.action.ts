"use server";

import { auth } from '@repo/auth';
import { prisma } from '@repo/prisma';
import { revalidatePath } from 'next/cache';
import { 
    SpaceStepContentType, SpaceStepStatus, SpaceActivityType
} from '@repo/prisma/client';
import type { Prisma } from '@repo/prisma/client';
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

async function checkAuth() {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error('Unauthorized');
    }
    return session.user.id;
}

// ==========================================
// QUIZ GENERATION FOR SPACES
// ==========================================

interface QuizQuestion {
    id: string;
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
}

export async function generateSpaceQuiz(
    spaceId: string,
    title: string,
    topic: string,
    numberOfQuestions: number = 5,
    difficulty: 'easy' | 'medium' | 'hard' = 'medium'
) {
    try {
        const userId = await checkAuth();

        // Check space access
        const space = await prisma.space.findUnique({
            where: { id: spaceId },
            select: { id: true, slug: true, creatorId: true, allowMemberContent: true }
        });

        if (!space) {
            return { success: false, error: 'Space not found' };
        }

        // Check if user can add content
        const member = await prisma.spaceMember.findUnique({
            where: { spaceId_userId: { spaceId, userId } }
        });

        if (space.creatorId !== userId && (!space.allowMemberContent || !member)) {
            return { success: false, error: 'You do not have permission to add content' };
        }

        // Generate questions with OpenAI
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
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
                    role: 'user',
                    content: `Create ${numberOfQuestions} ${difficulty} level quiz questions about: ${topic}`,
                },
            ],
            temperature: 0.7,
        });

        const content = response.choices[0]?.message?.content || '[]';
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        const questions: QuizQuestion[] = jsonMatch ? JSON.parse(jsonMatch[0]) : [];

        // Get max order for steps
        const maxStep = await prisma.spaceStep.findFirst({
            where: { spaceId },
            orderBy: { order: 'desc' }
        });
        const order = maxStep ? maxStep.order + 1 : 1;

        // Create space step with quiz content
        const step = await prisma.spaceStep.create({
            data: {
                spaceId,
                order,
                title,
                description: `Quiz about ${topic} (${numberOfQuestions} questions, ${difficulty} difficulty)`,
                contentType: SpaceStepContentType.QUIZ,
                contentData: {
                    type: 'quiz',
                    topic,
                    difficulty,
                    questions: questions as unknown as Prisma.InputJsonValue,
                    totalQuestions: questions.length
                } as Prisma.InputJsonValue,
                isRequired: false,
                estimatedTime: Math.ceil(numberOfQuestions * 2), // 2 mins per question
                status: SpaceStepStatus.ACTIVE
            }
        });

        // Update space step count
        await prisma.space.update({
            where: { 
                id: spaceId 
            },
            data: { 
                totalSteps: { 
                    increment: 1 
                } 
            }
        });

        // Create activity
        await prisma.spaceActivity.create({
            data: {
                spaceId,
                userId,
                type: SpaceActivityType.CONTENT_ADDED,
                stepId: step.id
            }
        });

        revalidatePath(`/space/${space.slug}`);
        return {
            success: true,
            data: {
                stepId: step.id,
                questions
            }
        };
    } catch (error) {
        console.error('Error generating space quiz:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Failed to generate quiz' };
    }
}

// ==========================================
// FLASHCARD GENERATION FOR SPACES
// ==========================================
interface Flashcard {
    id: string;
    front: string;
    back: string;
    hint?: string;
}

export async function generateSpaceFlashcards(
    spaceId: string,
    title: string,
    topic: string,
    numberOfCards: number = 10
) {
    try {
        const userId = await checkAuth();

        // Check space access
        const space = await prisma.space.findUnique({
            where: { id: spaceId },
            select: { id: true, slug: true, creatorId: true, allowMemberContent: true }
        });

        if (!space) {
            return { success: false, error: 'Space not found' };
        }

        // Check if user can add content
        const member = await prisma.spaceMember.findUnique({
            where: { spaceId_userId: { spaceId, userId } }
        });

        if (space.creatorId !== userId && (!space.allowMemberContent || !member)) {
            return { success: false, error: 'You do not have permission to add content' };
        }

        // Generate flashcards with OpenAI
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
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
                    role: 'user',
                    content: `Create ${numberOfCards} flashcards about: ${topic}`,
                },
            ],
            temperature: 0.7,
        });

        const content = response.choices[0]?.message?.content || '[]';
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        const cards: Flashcard[] = jsonMatch ? JSON.parse(jsonMatch[0]) : [];

        // Get max order for steps
        const maxStep = await prisma.spaceStep.findFirst({
            where: { spaceId },
            orderBy: { order: 'desc' }
        });
        const order = maxStep ? maxStep.order + 1 : 1;

        // Create space step with flashcard content
        const step = await prisma.spaceStep.create({
            data: {
                spaceId,
                order,
                title,
                description: `${numberOfCards} flashcards about ${topic}`,
                contentType: SpaceStepContentType.FLASHCARD,
                contentData: {
                    type: 'flashcard',
                    topic,
                    cards: cards as unknown as Prisma.InputJsonValue,
                    totalCards: cards.length
                } as Prisma.InputJsonValue,
                isRequired: false,
                estimatedTime: Math.ceil(numberOfCards * 0.5), // 30 seconds per card
                status: SpaceStepStatus.ACTIVE
            }
        });

        // Update space step count
        await prisma.space.update({
            where: { id: spaceId },
            data: { totalSteps: { increment: 1 } }
        });

        // Create activity
        await prisma.spaceActivity.create({
            data: {
                spaceId,
                userId,
                type: SpaceActivityType.CONTENT_ADDED,
                stepId: step.id
            }
        });

        revalidatePath(`/space/${space.slug}`);
        return {
            success: true,
            data: {
                stepId: step.id,
                cards
            }
        };
    } catch (error) {
        console.error('Error generating space flashcards:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Failed to generate flashcards' };
    }
}

// ==========================================
// ADD LINK TO SPACE
// ==========================================

export async function addSpaceLink(
    spaceId: string,
    title: string,
    url: string,
    description?: string
) {
    try {
        const userId = await checkAuth();

        const space = await prisma.space.findUnique({
            where: { id: spaceId },
            select: { id: true, slug: true, creatorId: true, allowMemberContent: true }
        });

        if (!space) {
            return { success: false, error: 'Space not found' };
        }

        const member = await prisma.spaceMember.findUnique({
            where: { spaceId_userId: { spaceId, userId } }
        });

        if (space.creatorId !== userId && (!space.allowMemberContent || !member)) {
            return { success: false, error: 'You do not have permission to add content' };
        }

        const maxStep = await prisma.spaceStep.findFirst({
            where: { spaceId },
            orderBy: { order: 'desc' }
        });
        const order = maxStep ? maxStep.order + 1 : 1;

        const step = await prisma.spaceStep.create({
            data: {
                spaceId,
                order,
                title,
                description,
                contentType: SpaceStepContentType.LINK,
                contentData: { url, type: 'link' },
                isRequired: false,
                status: SpaceStepStatus.ACTIVE
            }
        });

        await prisma.space.update({
            where: { id: spaceId },
            data: { totalSteps: { increment: 1 } }
        });

        await prisma.spaceActivity.create({
            data: {
                spaceId,
                userId,
                type: SpaceActivityType.CONTENT_ADDED,
                stepId: step.id
            }
        });

        revalidatePath(`/space/${space.slug}`);
        return { success: true, data: { stepId: step.id } };
    } catch (error) {
        console.error('Error adding space link:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Failed to add link' };
    }
}

// ==========================================
// ADD VIDEO TO SPACE
// ==========================================

export async function addSpaceVideo(
    spaceId: string,
    title: string,
    url: string,
    description?: string
) {
    try {
        const userId = await checkAuth();

        const space = await prisma.space.findUnique({
            where: { id: spaceId },
            select: { id: true, slug: true, creatorId: true, allowMemberContent: true }
        });

        if (!space) {
            return { success: false, error: 'Space not found' };
        }

        const member = await prisma.spaceMember.findUnique({
            where: { spaceId_userId: { spaceId, userId } }
        });

        if (space.creatorId !== userId && (!space.allowMemberContent || !member)) {
            return { success: false, error: 'You do not have permission to add content' };
        }

        // Extract video ID for embedding
        let embedUrl = url;
        const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
        if (youtubeMatch) {
            embedUrl = `https://www.youtube.com/embed/${youtubeMatch[1]}`;
        }

        const maxStep = await prisma.spaceStep.findFirst({
            where: { spaceId },
            orderBy: { order: 'desc' }
        });
        const order = maxStep ? maxStep.order + 1 : 1;

        const step = await prisma.spaceStep.create({
            data: {
                spaceId,
                order,
                title,
                description,
                contentType: SpaceStepContentType.VIDEO,
                contentData: { url, embedUrl, type: 'video' },
                isRequired: false,
                estimatedTime: 10, // Default 10 mins
                status: SpaceStepStatus.ACTIVE
            }
        });

        await prisma.space.update({
            where: { id: spaceId },
            data: { totalSteps: { increment: 1 } }
        });

        await prisma.spaceActivity.create({
            data: {
                spaceId,
                userId,
                type: SpaceActivityType.CONTENT_ADDED,
                stepId: step.id
            }
        });

        revalidatePath(`/space/${space.slug}`);
        return { success: true, data: { stepId: step.id } };
    } catch (error) {
        console.error('Error adding space video:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Failed to add video' };
    }
}

// ==========================================
// ADD PROJECT TO SPACE
// ==========================================

export async function addProjectToSpace(
    spaceId: string,
    projectId: string,
    projectSlug: string,
    title: string
) {
    try {
        const userId = await checkAuth();

        const space = await prisma.space.findUnique({
            where: { id: spaceId },
            select: { id: true, slug: true, creatorId: true, allowMemberContent: true }
        });

        if (!space) {
            return { success: false, error: 'Space not found' };
        }

        const member = await prisma.spaceMember.findUnique({
            where: { spaceId_userId: { spaceId, userId } }
        });

        if (space.creatorId !== userId && (!space.allowMemberContent || !member)) {
            return { success: false, error: 'You do not have permission to add content' };
        }

        const maxStep = await prisma.spaceStep.findFirst({
            where: { spaceId },
            orderBy: { order: 'desc' }
        });
        const order = maxStep ? maxStep.order + 1 : 1;

        const step = await prisma.spaceStep.create({
            data: {
                spaceId,
                order,
                title,
                contentType: SpaceStepContentType.PROJECT,
                contentId: projectId,
                contentData: { projectSlug, type: 'project' },
                isRequired: false,
                status: SpaceStepStatus.ACTIVE
            }
        });

        await prisma.space.update({
            where: { id: spaceId },
            data: { totalSteps: { increment: 1 } }
        });

        await prisma.spaceActivity.create({
            data: {
                spaceId,
                userId,
                type: SpaceActivityType.CONTENT_ADDED,
                stepId: step.id
            }
        });

        revalidatePath(`/space/${space.slug}`);
        return { success: true, data: { stepId: step.id } };
    } catch (error) {
        console.error('Error adding project to space:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Failed to add project' };
    }
}

// ==========================================
// ADD STUDIO TO SPACE
// ==========================================

export async function addStudioToSpace(
    spaceId: string,
    studioId: string,
    studioSlug: string,
    title: string
) {
    try {
        const userId = await checkAuth();

        const space = await prisma.space.findUnique({
            where: { id: spaceId },
            select: { id: true, slug: true, creatorId: true, allowMemberContent: true }
        });

        if (!space) {
            return { success: false, error: 'Space not found' };
        }

        const member = await prisma.spaceMember.findUnique({
            where: { spaceId_userId: { spaceId, userId } }
        });

        if (space.creatorId !== userId && (!space.allowMemberContent || !member)) {
            return { success: false, error: 'You do not have permission to add content' };
        }

        const maxStep = await prisma.spaceStep.findFirst({
            where: { spaceId },
            orderBy: { order: 'desc' }
        });
        const order = maxStep ? maxStep.order + 1 : 1;

        const step = await prisma.spaceStep.create({
            data: {
                spaceId,
                order,
                title,
                contentType: SpaceStepContentType.STUDIO,
                contentId: studioId,
                contentData: { studioSlug, type: 'studio' },
                isRequired: false,
                status: SpaceStepStatus.ACTIVE
            }
        });

        await prisma.space.update({
            where: { id: spaceId },
            data: { totalSteps: { increment: 1 } }
        });

        await prisma.spaceActivity.create({
            data: {
                spaceId,
                userId,
                type: SpaceActivityType.CONTENT_ADDED,
                stepId: step.id
            }
        });

        revalidatePath(`/space/${space.slug}`);
        return { success: true, data: { stepId: step.id } };
    } catch (error) {
        console.error('Error adding studio to space:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Failed to add studio' };
    }
}

