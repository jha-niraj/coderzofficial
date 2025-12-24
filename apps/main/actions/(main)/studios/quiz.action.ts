"use server";

import { auth } from '@repo/auth';
import { z } from "zod";
import prisma from "@repo/prisma";
import { QuizStatus } from "@repo/prisma/client";

const QuizInputSchema = z.object({
    topic: z.string().min(1),
    category: z.enum([
        "DATA_STRUCTURES",
        "SYSTEM_DESIGN",
        "FULL_STACK",
        "DATABASE",
        "OPERATING_SYSTEMS",
        "NETWORKING",
        "ALGORITHMS",
        "MACHINE_LEARNING",
        "WEB_DEVELOPMENT",
        "MOBILE_DEVELOPMENT",
        "CLOUD_COMPUTING",
        "DEVOPS",
        "SECURITY",
        "BLOCKCHAIN",
        "GAME_DEVELOPMENT",
        "SOFTWARE_ENGINEERING",
        "FRONTEND_DEVELOPMENT",
        "BACKEND_DEVELOPMENT",
        "UI_UX_DESIGN",
        "DATA_ANALYSIS"
    ]),
    num_questions: z.number().min(1).max(50),
    difficulty: z.enum(["easy", "medium", "hard"]),
    is_public: z.boolean(),
});

const mockQuizData = {
    title: "Generated Quiz",
    questions: [
        {
            text: "What does REST stand for?",
            type: "single",
            options: [
                { text: "Representational State Transfer", is_correct: true },
                { text: "Remote System Test", is_correct: false },
                { text: "Responsive Server Technology", is_correct: false },
                { text: "Resource Sharing Tool", is_correct: false },
            ],
            explanation: "REST is an architectural style for networked applications.",
            category: "Full-Stack",
        },
        {
            text: "Which are frontend frameworks?",
            type: "multiple",
            options: [
                { text: "React", is_correct: true },
                { text: "Django", is_correct: false },
                { text: "Vue", is_correct: true },
                { text: "Express", is_correct: false },
                { text: "Angular", is_correct: true },
            ],
            explanation: "React, Vue, and Angular are frontend frameworks.",
            category: "Full-Stack",
        },
        {
            text: "What is a load balancer?",
            type: "single",
            options: [
                { text: "Distributes traffic across servers", is_correct: true },
                { text: "Stores data for quick access", is_correct: false },
                { text: "Processes user requests", is_correct: false },
                { text: "Encrypts network traffic", is_correct: false },
            ],
            explanation: "A load balancer distributes network traffic for scalability.",
            category: "System Design",
        },
        {
            text: "Which are benefits of caching?",
            type: "multiple",
            options: [
                { text: "Faster response times", is_correct: true },
                { text: "Higher latency", is_correct: false },
                { text: "Reduced database load", is_correct: true },
                { text: "Increased system complexity", is_correct: false },
            ],
            explanation: "Caching improves performance by reducing database load.",
            category: "System Design",
        },
        {
            text: "What is sharding?",
            type: "single",
            options: [
                { text: "A data partitioning strategy", is_correct: true },
                { text: "A method for encrypting data", is_correct: false },
                { text: "A technique for compressing tables", is_correct: false },
                { text: "A process for backing up systems", is_correct: false },
            ],
            explanation: "Sharding splits a database into smaller, manageable pieces.",
            category: "System Design",
        },
    ],
    time_limit: 3600,
};

export async function generateQuiz(input: {
    topic: string;
    quiz_type: string;
    num_questions: number;
    difficulty: string;
    is_public: boolean;
}) {
    try {
        const validatedInput = QuizInputSchema.parse(input);

        const session = await auth();
        if (!session?.user?.id) {
            throw new Error("User not authenticated");
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
        });
        if (!user) {
            throw new Error("User not found");
        }

        const creditCost = validatedInput.is_public ? 5 : 10;

        if (user.credits < creditCost) {
            throw new Error("Insufficient credits");
        }

        await prisma.user.update({
            where: { id: user.id },
            data: { credits: user.credits - creditCost },
        });

        let quiz;
        if (!validatedInput.is_public) {
            // Generate new quiz
            // Replace with: const openAIResponse = await callOpenAI(validatedInput);
            const openAIResponse = mockQuizData;

            if (!openAIResponse.title || !Array.isArray(openAIResponse.questions) || openAIResponse.questions.length !== 5) {
                throw new Error("Invalid quiz data");
            }

            quiz = await prisma.quizzes.create({
                data: {
                    title: openAIResponse.title,
                    category: validatedInput.category,
                    time_limit: openAIResponse.time_limit,
                    is_public: validatedInput.is_public,
                    creator_id: user.id,
                    questions: {
                        create: openAIResponse.questions.map((q: any) => ({
                            id: q.id,
                            text: q.text,
                            type: q.type,
                            category: q.category,
                            explanation: q.explanation,
                            options: {
                                create: q.options.map((o: any) => ({
                                    id: o.id,
                                    text: o.text,
                                    is_correct: o.is_correct,
                                })),
                            },
                        })),
                    },
                },
                include: {
                    questions: {
                        include: {
                            options: true,
                        },
                    },
                },
            });
        } else {
            quiz = await prisma.quizzes.findFirst({
                where: {
                    is_public: true,
                },
                include: {
                    questions: {
                        include: {
                            options: true,
                        },
                    },
                },
            });

            if (!quiz) {
                // Generate new public quiz
                const openAIResponse = mockQuizData;
                quiz = await prisma.quizzes.create({
                    data: {
                        title: openAIResponse.title,
                        category: validatedInput.category,
                        time_limit: openAIResponse.time_limit,
                        is_public: true,
                        creator_id: user.id,
                        questions: {
                            create: openAIResponse.questions.map((q: any) => ({
                                id: q.id,
                                text: q.text,
                                type: q.type,
                                category: q.category,
                                explanation: q.explanation,
                                options: {
                                    create: q.options.map((o: any) => ({
                                        id: o.id,
                                        text: o.text,
                                        is_correct: o.is_correct,
                                    })),
                                },
                            })),
                        },
                    },
                    include: {
                        questions: {
                            include: {
                                options: true,
                            },
                        },
                    },
                });
            }
        }

        return {
            quizId: quiz.id,
            quizTitle: quiz.title,
            questions: quiz.questions.map((q) => ({
                id: q.id,
                text: q.text,
                type: q.type as "single" | "multiple",
                options: q.options.map((o) => ({
                    id: o.id,
                    text: o.text,
                    isCorrect: o.is_correct,
                })),
                explanation: q.explanation || undefined,
                category: q.category || undefined,
            })),
            timeLimit: quiz.time_limit || undefined,
        };
    } catch (err) {
        const error = err as Error;
        console.log("Error occurred while generating quiz: " + error);
        return { error: error.message };
    }
}
export async function saveQuizAttempt(
    userId: string,
    quizId: string,
    userAnswers: Record<string, string[]>,
    score: number
) {
    try {
        const attempt = await prisma.userQuizAttempts.create({
            data: {
                user_id: userId,
                quiz_id: quizId,
                started_at: new Date(),
                completed_at: new Date(),
                score,
                status: QuizStatus.COMPLETED,
                answers: {
                    create: Object.entries(userAnswers).map(([questionId, selectedOptionIds]) => ({
                        question_id: questionId,
                        selected_option_ids: selectedOptionIds,
                    })),
                },
            },
        });
        if (!attempt) {
            return null;
        }

        return attempt;
    } catch (err) {
        const error = err as Error;
        console.log("Error occurred while saving the quiz answer: " + error);
    }
}