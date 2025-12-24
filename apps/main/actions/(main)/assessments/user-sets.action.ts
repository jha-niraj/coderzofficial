"use server";

import { auth } from '@repo/auth';
import prisma from "@repo/prisma";
import { revalidatePath } from "next/cache";
import { 
    UserContentStatus, AssessmentLanguage
} from "@prisma/client";

// Import AI generation
import { generateQuestionsWithAI } from "./ai-generation";

// Import types from centralized types file
import {
    type CreatePracticeSetInput,
    type CreateExamSetInput,
    type PracticeSetFilters,
    EXAM_SET_CREDIT_COST,
    PUBLIC_CREDIT_REFUND_PERCENT,
    PRACTICE_SET_CREDIT_COST,
} from "@/types/assessment";
import { slugify } from "@repo/ui/lib/utils";

// Re-export constants for backward compatibility
export { PRACTICE_SET_CREDIT_COST, EXAM_SET_CREDIT_COST, PUBLIC_CREDIT_REFUND_PERCENT };

// Re-export types for backward compatibility
export type { CreatePracticeSetInput, CreateExamSetInput, PracticeSetFilters };

// ==================== PRACTICE SET ACTIONS ====================

/**
 * Create a new practice set with AI-generated questions
 * Cost: 5 credits (50% refunded if made public)
 */
export async function createPracticeSet(input: CreatePracticeSetInput) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" };
        }

        const userId = session.user.id;
        const questionCount = input.questionCount || 10;

        // Check user credits
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { credits: true },
        });

        if (!user) {
            return { success: false, error: "User not found" };
        }

        const creditCost = PRACTICE_SET_CREDIT_COST;
        const effectiveCost = input.isPublic
            ? Math.floor(creditCost * (1 - PUBLIC_CREDIT_REFUND_PERCENT / 100))
            : creditCost;

        if (user.credits < creditCost) {
            return {
                success: false,
                error: `Insufficient credits. You need ${creditCost} credits to create a practice set.`
            };
        }

        // Get topic name for AI generation
        let topicName = "General";
        let subModuleName: string | undefined;

        if (input.topicId) {
            const topic = await prisma.assessmentTopic.findUnique({
                where: { id: input.topicId },
                select: { name: true },
            });
            if (topic) topicName = topic.name;
        }

        if (input.subModuleId) {
            const subModule = await prisma.assessmentSubModule.findUnique({
                where: { id: input.subModuleId },
                select: { name: true },
            });
            if (subModule) subModuleName = subModule.name;
        }

        // Deduct credits
        await prisma.user.update({
            where: { id: userId },
            data: { credits: { decrement: creditCost } },
        });

        // Create the practice set
        const practiceSet = await prisma.userPracticeSet.create({
            data: {
                title: input.title,
                description: input.description,
                slug: slugify(input.title),
                language: input.language,
                mode: input.mode,
                difficulty: input.difficulty,
                topicId: input.topicId,
                subModuleId: input.subModuleId,
                questionCount,
                isPublic: input.isPublic,
                madePublicAt: input.isPublic ? new Date() : null,
                creditsCost: creditCost,
                creatorId: userId,
                status: UserContentStatus.GENERATING,
            },
        });

        // Generate questions with AI (async)
        try {
            const generatedQuestions = await generateQuestionsWithAI({
                language: input.language,
                mode: input.mode,
                difficulty: input.difficulty,
                topicName,
                subModuleName,
                questionCount,
            });

            // Create questions
            await prisma.userPracticeSetQuestion.createMany({
                data: generatedQuestions.map((q, index) => ({
                    practiceSetId: practiceSet.id,
                    question: q.question,
                    type: q.type,
                    difficulty: q.difficulty,
                    orderIndex: index + 1,
                    options: q.options ? JSON.parse(JSON.stringify(q.options)) : null,
                    correctAnswer: q.correctAnswer,
                    answerExplanation: q.answerExplanation,
                    codeSnippet: q.codeSnippet,
                    starterCode: q.starterCode,
                    solutionCode: q.solutionCode,
                    testCases: q.testCases ? JSON.parse(JSON.stringify(q.testCases)) : null,
                    points: q.points,
                })),
            });

            // Update status to ready
            await prisma.userPracticeSet.update({
                where: { id: practiceSet.id },
                data: { status: UserContentStatus.ACTIVE },
            });

            // Refund credits if public
            if (input.isPublic) {
                const refund = Math.floor(creditCost * PUBLIC_CREDIT_REFUND_PERCENT / 100);
                await prisma.user.update({
                    where: { id: userId },
                    data: {
                        credits: { increment: refund },
                    },
                });

                await prisma.userPracticeSet.update({
                    where: { id: practiceSet.id },
                    data: { creditsRefunded: refund },
                });
            }
        } catch (error) {
            // Mark as failed if AI generation fails
            await prisma.userPracticeSet.update({
                where: { id: practiceSet.id },
                data: { status: UserContentStatus.ARCHIVED },
            });

            // Refund credits on failure
            await prisma.user.update({
                where: { id: userId },
                data: { credits: { increment: creditCost } },
            });

            return { success: false, error: "Failed to generate questions" };
        }

        revalidatePath("/assessments/practice");
        revalidatePath("/assessments/community/practice");

        return {
            success: true,
            practiceSetId: practiceSet.id,
            slug: practiceSet.slug,
            creditsUsed: input.isPublic ? effectiveCost : creditCost,
        };
    } catch (error) {
        console.error("Error creating practice set:", error);
        return { success: false, error: "Failed to create practice set" };
    }
}

/**
 * Create a new exam set with AI-generated questions
 * Cost: 10 credits (50% refunded if made public)
 */
export async function createExamSet(input: CreateExamSetInput) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" };
        }

        // Validate difficulty for exam (only INTERMEDIATE and HARD)
        if (input.difficulty === "EASY") {
            return {
                success: false,
                error: "Exam sets must be Intermediate or Hard difficulty"
            };
        }

        const userId = session.user.id;
        const questionCount = input.questionCount || 15;

        // Check user credits
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { credits: true },
        });

        if (!user) {
            return { success: false, error: "User not found" };
        }

        const creditCost = EXAM_SET_CREDIT_COST;
        const effectiveCost = input.isPublic
            ? Math.floor(creditCost * (1 - PUBLIC_CREDIT_REFUND_PERCENT / 100))
            : creditCost;

        if (user.credits < creditCost) {
            return {
                success: false,
                error: `Insufficient credits. You need ${creditCost} credits to create an exam set.`
            };
        }

        // Get topic name for AI generation
        let topicName = "General";
        const subModuleName: string | undefined = undefined; // ExamSets don't have subModules

        if (input.topicId) {
            const topic = await prisma.assessmentTopic.findUnique({
                where: { id: input.topicId },
                select: { name: true },
            });
            if (topic) topicName = topic.name;
        }

        // Deduct credits
        await prisma.user.update({
            where: { id: userId },
            data: { credits: { decrement: creditCost } },
        });

        // Create the exam set
        const examSet = await prisma.userExamSet.create({
            data: {
                title: input.title,
                description: input.description,
                slug: slugify(input.title),
                language: input.language,
                mode: input.mode,
                difficulty: input.difficulty,
                topicId: input.topicId,
                questionCount,
                timeLimit: questionCount * 120, // 2 minutes per question
                isPublic: input.isPublic,
                madePublicAt: input.isPublic ? new Date() : null,
                creditsCost: creditCost,
                creatorId: userId,
                status: UserContentStatus.GENERATING,
            },
        });

        // Generate questions with AI
        try {
            const generatedQuestions = await generateQuestionsWithAI({
                language: input.language,
                mode: input.mode,
                difficulty: input.difficulty,
                topicName,
                subModuleName,
                questionCount,
            });

            // Create questions
            await prisma.userExamSetQuestion.createMany({
                data: generatedQuestions.map((q, index) => ({
                    examSetId: examSet.id,
                    question: q.question,
                    type: q.type,
                    difficulty: q.difficulty,
                    orderIndex: index + 1,
                    options: q.options ? JSON.parse(JSON.stringify(q.options)) : null,
                    correctAnswer: q.correctAnswer,
                    answerExplanation: q.answerExplanation,
                    codeSnippet: q.codeSnippet,
                    starterCode: q.starterCode,
                    solutionCode: q.solutionCode,
                    testCases: q.testCases ? JSON.parse(JSON.stringify(q.testCases)) : null,
                    points: q.points,
                })),
            });

            // Update status to ready
            await prisma.userExamSet.update({
                where: { id: examSet.id },
                data: { status: UserContentStatus.ACTIVE },
            });

            // Refund credits if public
            if (input.isPublic) {
                const refund = Math.floor(creditCost * PUBLIC_CREDIT_REFUND_PERCENT / 100);
                await prisma.user.update({
                    where: { id: userId },
                    data: { credits: { increment: refund } },
                });

                await prisma.userExamSet.update({
                    where: { id: examSet.id },
                    data: { creditsRefunded: refund },
                });
            }
        } catch (error) {
            await prisma.userExamSet.update({
                where: { id: examSet.id },
                data: { status: UserContentStatus.ARCHIVED },
            });

            await prisma.user.update({
                where: { id: userId },
                data: { credits: { increment: creditCost } },
            });

            return { success: false, error: "Failed to generate questions" };
        }

        revalidatePath("/assessments/exam");
        revalidatePath("/assessments/community/exam");

        return {
            success: true,
            examSetId: examSet.id,
            slug: examSet.slug,
            creditsUsed: input.isPublic ? effectiveCost : creditCost,
        };
    } catch (error) {
        console.error("Error creating exam set:", error);
        return { success: false, error: "Failed to create exam set" };
    }
}

/**
 * Get public practice sets with filtering and pagination
 */
export async function getPublicPracticeSets(filters: PracticeSetFilters = {}) {
    try {
        const {
            language,
            mode,
            difficulty,
            topic,
            sortBy = "newest",
            page = 1,
            limit = 12
        } = filters;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const where: any = {
            isPublic: true,
            status: UserContentStatus.ACTIVE,
        };

        if (language) where.language = language;
        if (mode) where.mode = mode;
        if (difficulty) where.difficulty = difficulty;
        if (topic) {
            where.topic = { name: { contains: topic, mode: "insensitive" } };
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const orderBy: any = {};
        if (sortBy === "newest") orderBy.createdAt = "desc";
        else if (sortBy === "popular") orderBy.views = "desc";
        else if (sortBy === "rating") orderBy.avgScore = "desc";

        const [sets, total] = await Promise.all([
            prisma.userPracticeSet.findMany({
                where,
                orderBy,
                skip: (page - 1) * limit,
                take: limit,
                include: {
                    creator: {
                        select: {
                            id: true,
                            name: true,
                            image: true,
                        },
                    },
                    topic: {
                        select: { id: true, name: true },
                    },
                    _count: {
                        select: {
                            questions: true,
                            likedBy: true,
                            attempts: true,
                        },
                    },
                },
            }),
            prisma.userPracticeSet.count({ where }),
        ]);

        return {
            success: true,
            data: sets,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    } catch (error) {
        console.error("Error fetching public practice sets:", error);
        return { success: false, error: "Failed to fetch practice sets", data: [] };
    }
}

/**
 * Get public exam sets with filtering and pagination
 */
export async function getPublicExamSets(filters: PracticeSetFilters = {}) {
    try {
        const {
            language,
            mode,
            difficulty,
            topic,
            sortBy = "newest",
            page = 1,
            limit = 12
        } = filters;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const where: any = {
            isPublic: true,
            status: UserContentStatus.ACTIVE,
        };

        if (language) where.language = language;
        if (mode) where.mode = mode;
        if (difficulty) where.difficulty = difficulty;
        if (topic) {
            where.topic = { name: { contains: topic, mode: "insensitive" } };
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const orderBy: any = {};
        if (sortBy === "newest") orderBy.createdAt = "desc";
        else if (sortBy === "popular") orderBy.views = "desc";
        else if (sortBy === "rating") orderBy.avgScore = "desc";

        const [sets, total] = await Promise.all([
            prisma.userExamSet.findMany({
                where,
                orderBy,
                skip: (page - 1) * limit,
                take: limit,
                include: {
                    creator: {
                        select: {
                            id: true,
                            name: true,
                            image: true,
                        },
                    },
                    topic: {
                        select: { id: true, name: true },
                    },
                    _count: {
                        select: {
                            questions: true,
                            likedBy: true,
                            attempts: true,
                        },
                    },
                },
            }),
            prisma.userExamSet.count({ where }),
        ]);

        return {
            success: true,
            data: sets,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    } catch (error) {
        console.error("Error fetching public exam sets:", error);
        return { success: false, error: "Failed to fetch exam sets", data: [] };
    }
}

/**
 * Get user's own practice sets
 */
export async function getUserPracticeSets() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized", data: [] };
        }

        const sets = await prisma.userPracticeSet.findMany({
            where: { creatorId: session.user.id },
            orderBy: { createdAt: "desc" },
            include: {
                topic: { select: { id: true, name: true } },
                _count: {
                    select: {
                        questions: true,
                        likedBy: true,
                        attempts: true,
                    },
                },
            },
        });

        return { success: true, data: sets };
    } catch (error) {
        console.error("Error fetching user practice sets:", error);
        return { success: false, error: "Failed to fetch practice sets", data: [] };
    }
}

/**
 * Get user's own exam sets
 */
export async function getUserExamSets() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized", data: [] };
        }

        const sets = await prisma.userExamSet.findMany({
            where: { creatorId: session.user.id },
            orderBy: { createdAt: "desc" },
            include: {
                topic: { select: { id: true, name: true } },
                _count: {
                    select: {
                        questions: true,
                        likedBy: true,
                        attempts: true,
                    },
                },
            },
        });

        return { success: true, data: sets };
    } catch (error) {
        console.error("Error fetching user exam sets:", error);
        return { success: false, error: "Failed to fetch exam sets", data: [] };
    }
}

/**
 * Get practice set details by ID
 */
export async function getPracticeSetDetails(id: string) {
    try {
        const session = await auth();
        const userId = session?.user?.id;

        const set = await prisma.userPracticeSet.findUnique({
            where: { id },
            include: {
                creator: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                    },
                },
                topic: { select: { id: true, name: true } },
                subModule: { select: { id: true, name: true } },
                questions: {
                    orderBy: { orderIndex: "asc" },
                },
                _count: {
                    select: {
                        likedBy: true,
                        attempts: true,
                    },
                },
            },
        });

        if (!set) {
            return { success: false, error: "Practice set not found" };
        }

        // Check access
        if (!set.isPublic && set.creatorId !== userId) {
            // Check if user purchased it
            if (userId) {
                const purchase = await prisma.userPracticeSetPurchase.findUnique({
                    where: {
                        userId_practiceSetId: {
                            userId,
                            practiceSetId: id,
                        },
                    },
                });

                if (!purchase) {
                    return { success: false, error: "Access denied" };
                }
            } else {
                return { success: false, error: "Access denied" };
            }
        }

        // Increment view count
        await prisma.userPracticeSet.update({
            where: { id },
            data: { views: { increment: 1 } },
        });

        // Check if user liked this set
        let isLiked = false;
        if (userId) {
            const like = await prisma.userPracticeSetLike.findUnique({
                where: {
                    userId_practiceSetId: {
                        userId,
                        practiceSetId: id,
                    },
                },
            });
            isLiked = !!like;
        }

        return {
            success: true,
            data: {
                ...set,
                isLiked,
                isOwner: set.creatorId === userId,
            },
        };
    } catch (error) {
        console.error("Error fetching practice set details:", error);
        return { success: false, error: "Failed to fetch practice set" };
    }
}

/**
 * Get exam set details by ID
 */
export async function getExamSetDetails(id: string) {
    try {
        const session = await auth();
        const userId = session?.user?.id;

        const set = await prisma.userExamSet.findUnique({
            where: { id },
            include: {
                creator: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                    },
                },
                topic: { select: { id: true, name: true } },
                questions: {
                    orderBy: { orderIndex: "asc" },
                },
                _count: {
                    select: {
                        likedBy: true,
                        attempts: true,
                    },
                },
            },
        });

        if (!set) {
            return { success: false, error: "Exam set not found" };
        }

        // Check access
        if (!set.isPublic && set.creatorId !== userId) {
            if (userId) {
                const purchase = await prisma.userExamSetPurchase.findUnique({
                    where: {
                        userId_examSetId: {
                            userId,
                            examSetId: id,
                        },
                    },
                });

                if (!purchase) {
                    return { success: false, error: "Access denied" };
                }
            } else {
                return { success: false, error: "Access denied" };
            }
        }

        // Increment view count
        await prisma.userExamSet.update({
            where: { id },
            data: { views: { increment: 1 } },
        });

        // Check if user liked this set
        let isLiked = false;
        if (userId) {
            const like = await prisma.userExamSetLike.findUnique({
                where: {
                    userId_examSetId: {
                        userId,
                        examSetId: id,
                    },
                },
            });
            isLiked = !!like;
        }

        return {
            success: true,
            data: {
                ...set,
                isLiked,
                isOwner: set.creatorId === userId,
            },
        };
    } catch (error) {
        console.error("Error fetching exam set details:", error);
        return { success: false, error: "Failed to fetch exam set" };
    }
}

/**
 * Start a practice set attempt
 */
export async function startPracticeSetAttempt(practiceSetId: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" };
        }

        const userId = session.user.id;

        // Check if set exists and is accessible
        const set = await prisma.userPracticeSet.findUnique({
            where: { id: practiceSetId },
            include: {
                questions: {
                    orderBy: { orderIndex: "asc" },
                    select: {
                        id: true,
                        question: true,
                        type: true,
                        options: true,
                        codeSnippet: true,
                        starterCode: true,
                        orderIndex: true,
                        points: true,
                    },
                },
            },
        });

        if (!set) {
            return { success: false, error: "Practice set not found" };
        }

        if (set.status !== UserContentStatus.ACTIVE) {
            return { success: false, error: "Practice set is not ready" };
        }

        // Create attempt
        const attempt = await prisma.userPracticeSetAttempt.create({
            data: {
                userId,
                practiceSetId,
                mode: set.mode,
                totalQuestions: set.questions.length,
                startedAt: new Date(),
            },
        });

        // Update total attempts on set
        await prisma.userPracticeSet.update({
            where: { id: practiceSetId },
            data: { totalAttempts: { increment: 1 } },
        });

        return {
            success: true,
            attemptId: attempt.id,
            questions: set.questions,
            timeLimit: set.timeLimit,
        };
    } catch (error) {
        console.error("Error starting practice attempt:", error);
        return { success: false, error: "Failed to start practice attempt" };
    }
}

/**
 * Start an exam set attempt
 */
export async function startExamSetAttempt(examSetId: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" };
        }

        const userId = session.user.id;

        const set = await prisma.userExamSet.findUnique({
            where: { id: examSetId },
            include: {
                questions: {
                    orderBy: { orderIndex: "asc" },
                    select: {
                        id: true,
                        question: true,
                        type: true,
                        options: true,
                        codeSnippet: true,
                        starterCode: true,
                        orderIndex: true,
                        points: true,
                    },
                },
            },
        });

        if (!set) {
            return { success: false, error: "Exam set not found" };
        }

        if (set.status !== UserContentStatus.ACTIVE) {
            return { success: false, error: "Exam set is not ready" };
        }

        const attempt = await prisma.userExamSetAttempt.create({
            data: {
                userId,
                examSetId,
                mode: set.mode,
                totalQuestions: set.questions.length,
                timeLimit: set.timeLimit,
                startedAt: new Date(),
            },
        });

        // Update total attempts on set
        await prisma.userExamSet.update({
            where: { id: examSetId },
            data: { totalAttempts: { increment: 1 } },
        });

        return {
            success: true,
            attemptId: attempt.id,
            questions: set.questions,
            timeLimit: set.timeLimit,
        };
    } catch (error) {
        console.error("Error starting exam attempt:", error);
        return { success: false, error: "Failed to start exam attempt" };
    }
}

/**
 * Submit an answer for a practice set question
 */
export async function submitPracticeSetAnswer(
    attemptId: string,
    questionId: string,
    selectedOption?: string,
    codeAnswer?: string,
    textAnswer?: string
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" };
        }

        // Get the question to check the correct answer
        const question = await prisma.userPracticeSetQuestion.findUnique({
            where: { id: questionId },
        });

        if (!question) {
            return { success: false, error: "Question not found" };
        }

        // Determine if correct (simplified - in production use AI for code/text evaluation)
        let isCorrect = false;
        if (question.type === "MCQ" && selectedOption) {
            isCorrect = selectedOption === question.correctAnswer;
        } else if (question.type === "CODE_WRITE" && codeAnswer) {
            // TODO: Run code against test cases
            isCorrect = false;
        } else if (question.type === "SCENARIO" && textAnswer) {
            // TODO: AI evaluation
            isCorrect = false;
        }

        const pointsEarned = isCorrect ? question.points : 0;

        // Create or update answer
        const existingAnswer = await prisma.userPracticeSetAnswer.findUnique({
            where: {
                attemptId_questionId: {
                    attemptId,
                    questionId,
                },
            },
        });

        if (existingAnswer) {
            await prisma.userPracticeSetAnswer.update({
                where: { id: existingAnswer.id },
                data: {
                    selectedOption,
                    codeAnswer,
                    textAnswer,
                    isCorrect,
                    pointsEarned,
                },
            });
        } else {
            await prisma.userPracticeSetAnswer.create({
                data: {
                    attemptId,
                    questionId,
                    selectedOption,
                    codeAnswer,
                    textAnswer,
                    isCorrect,
                    pointsEarned,
                },
            });

            // Update answered count
            await prisma.userPracticeSetAttempt.update({
                where: { id: attemptId },
                data: {
                    answeredCount: { increment: 1 },
                    correctCount: isCorrect ? { increment: 1 } : undefined,
                },
            });
        }

        return {
            success: true,
            isCorrect,
            pointsEarned,
            correctAnswer: question.correctAnswer,
            explanation: question.answerExplanation,
        };
    } catch (error) {
        console.error("Error submitting answer:", error);
        return { success: false, error: "Failed to submit answer" };
    }
}

/**
 * Submit an answer for an exam set question
 */
export async function submitExamSetAnswer(
    attemptId: string,
    questionId: string,
    selectedOption?: string,
    codeAnswer?: string,
    textAnswer?: string
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" };
        }

        const question = await prisma.userExamSetQuestion.findUnique({
            where: { id: questionId },
        });

        if (!question) {
            return { success: false, error: "Question not found" };
        }

        let isCorrect = false;
        if (question.type === "MCQ" && selectedOption) {
            isCorrect = selectedOption === question.correctAnswer;
        }

        const pointsEarned = isCorrect ? question.points : 0;

        const existingAnswer = await prisma.userExamSetAnswer.findUnique({
            where: {
                attemptId_questionId: {
                    attemptId,
                    questionId,
                },
            },
        });

        if (existingAnswer) {
            await prisma.userExamSetAnswer.update({
                where: { id: existingAnswer.id },
                data: {
                    selectedOption,
                    codeAnswer,
                    textAnswer,
                    isCorrect,
                    pointsEarned,
                },
            });
        } else {
            await prisma.userExamSetAnswer.create({
                data: {
                    attemptId,
                    questionId,
                    selectedOption,
                    codeAnswer,
                    textAnswer,
                    isCorrect,
                    pointsEarned,
                },
            });

            await prisma.userExamSetAttempt.update({
                where: { id: attemptId },
                data: {
                    answeredCount: { increment: 1 },
                    correctCount: isCorrect ? { increment: 1 } : undefined,
                },
            });
        }

        // For exams, don't reveal answer immediately
        return {
            success: true,
            submitted: true,
        };
    } catch (error) {
        console.error("Error submitting answer:", error);
        return { success: false, error: "Failed to submit answer" };
    }
}

/**
 * Complete a practice set attempt and calculate score-based credit refund
 */
export async function completePracticeSetAttempt(attemptId: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" };
        }

        const attempt = await prisma.userPracticeSetAttempt.findUnique({
            where: { id: attemptId },
            include: {
                practiceSet: true,
                answers: true,
            },
        });

        if (!attempt) {
            return { success: false, error: "Attempt not found" };
        }

        const correctCount = attempt.answers.filter(a => a.isCorrect).length;
        const totalCount = attempt.totalQuestions;
        const score = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;

        // Calculate credit refund based on score
        // Score >= 80%: 100% refund, >= 60%: 75%, >= 40%: 50%, < 40%: 25%
        let refundPercent = 25;
        if (score >= 80) refundPercent = 100;
        else if (score >= 60) refundPercent = 75;
        else if (score >= 40) refundPercent = 50;

        const creditsEarned = Math.floor(attempt.practiceSet.creditsCost * (refundPercent / 100));

        // Update attempt
        await prisma.userPracticeSetAttempt.update({
            where: { id: attemptId },
            data: {
                completedAt: new Date(),
                score,
                correctCount,
                status: "COMPLETED",
                creditsEarned,
            },
        });

        // Update practice set stats
        const allAttempts = await prisma.userPracticeSetAttempt.findMany({
            where: {
                practiceSetId: attempt.practiceSetId,
                status: "COMPLETED",
            },
            select: { score: true },
        });

        const avgScore = allAttempts.length > 0
            ? allAttempts.reduce((sum, a) => sum + a.score, 0) / allAttempts.length
            : 0;

        await prisma.userPracticeSet.update({
            where: { id: attempt.practiceSetId },
            data: {
                completions: { increment: 1 },
                avgScore,
            },
        });

        // Refund credits to user
        if (creditsEarned > 0) {
            await prisma.user.update({
                where: { id: session.user.id },
                data: { credits: { increment: creditsEarned } },
            });
        }

        return {
            success: true,
            score,
            correctCount,
            totalCount,
            creditsEarned,
            refundPercent,
        };
    } catch (error) {
        console.error("Error completing attempt:", error);
        return { success: false, error: "Failed to complete attempt" };
    }
}

/**
 * Complete an exam set attempt
 */
export async function completeExamSetAttempt(attemptId: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" };
        }

        const attempt = await prisma.userExamSetAttempt.findUnique({
            where: { id: attemptId },
            include: {
                examSet: true,
                answers: true,
            },
        });

        if (!attempt) {
            return { success: false, error: "Attempt not found" };
        }

        const correctCount = attempt.answers.filter(a => a.isCorrect).length;
        const totalCount = attempt.totalQuestions;
        const score = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;

        // Determine pass/fail
        const passed = score >= 60;

        // Calculate credit refund based on score (same as practice but higher stakes)
        let refundPercent = 25;
        if (score >= 80) refundPercent = 100;
        else if (score >= 60) refundPercent = 75;
        else if (score >= 40) refundPercent = 50;

        const creditsEarned = Math.floor(attempt.examSet.creditsCost * (refundPercent / 100));

        await prisma.userExamSetAttempt.update({
            where: { id: attemptId },
            data: {
                completedAt: new Date(),
                score,
                correctCount,
                status: "COMPLETED",
                passed,
                creditsEarned,
            },
        });

        // Update exam set stats
        const allAttempts = await prisma.userExamSetAttempt.findMany({
            where: {
                examSetId: attempt.examSetId,
                status: "COMPLETED",
            },
            select: { score: true, passed: true },
        });

        const avgScore = allAttempts.length > 0
            ? allAttempts.reduce((sum, a) => sum + (a.score ?? 0), 0) / allAttempts.length
            : 0;

        await prisma.userExamSet.update({
            where: { id: attempt.examSetId },
            data: {
                avgScore,
                passCount: passed ? { increment: 1 } : undefined,
                failCount: !passed ? { increment: 1 } : undefined,
            },
        });

        // Refund credits to user
        if (creditsEarned > 0) {
            await prisma.user.update({
                where: { id: session.user.id },
                data: { credits: { increment: creditsEarned } },
            });
        }

        return {
            success: true,
            score,
            correctCount,
            totalCount,
            passed,
            creditsEarned,
            refundPercent,
        };
    } catch (error) {
        console.error("Error completing attempt:", error);
        return { success: false, error: "Failed to complete attempt" };
    }
}

/**
 * Get latest public practice sets for homepage display
 */
export async function getLatestPublicPracticeSets(limit = 6) {
    try {
        const sets = await prisma.userPracticeSet.findMany({
            where: {
                isPublic: true,
                status: UserContentStatus.ACTIVE,
            },
            orderBy: { createdAt: "desc" },
            take: limit,
            include: {
                creator: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                    },
                },
                topic: { select: { id: true, name: true } },
                _count: {
                    select: {
                        questions: true,
                        likedBy: true,
                    },
                },
            },
        });

        return { success: true, data: sets };
    } catch (error) {
        console.error("Error fetching latest practice sets:", error);
        return { success: false, error: "Failed to fetch practice sets", data: [] };
    }
}

/**
 * Get latest public exam sets for homepage display
 */
export async function getLatestPublicExamSets(limit = 6) {
    try {
        const sets = await prisma.userExamSet.findMany({
            where: {
                isPublic: true,
                status: UserContentStatus.ACTIVE,
            },
            orderBy: { createdAt: "desc" },
            take: limit,
            include: {
                creator: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                    },
                },
                topic: { select: { id: true, name: true } },
                _count: {
                    select: {
                        questions: true,
                        likedBy: true,
                    },
                },
            },
        });

        return { success: true, data: sets };
    } catch (error) {
        console.error("Error fetching latest exam sets:", error);
        return { success: false, error: "Failed to fetch exam sets", data: [] };
    }
}

/**
 * Toggle like on a practice set
 */
export async function togglePracticeSetLike(practiceSetId: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" };
        }

        const userId = session.user.id;

        const existingLike = await prisma.userPracticeSetLike.findUnique({
            where: {
                userId_practiceSetId: {
                    userId,
                    practiceSetId,
                },
            },
        });

        if (existingLike) {
            await prisma.userPracticeSetLike.delete({
                where: { id: existingLike.id },
            });
            await prisma.userPracticeSet.update({
                where: { id: practiceSetId },
                data: { likes: { decrement: 1 } },
            });
            return { success: true, liked: false };
        } else {
            await prisma.userPracticeSetLike.create({
                data: {
                    userId,
                    practiceSetId,
                },
            });
            await prisma.userPracticeSet.update({
                where: { id: practiceSetId },
                data: { likes: { increment: 1 } },
            });
            return { success: true, liked: true };
        }
    } catch (error) {
        console.error("Error toggling like:", error);
        return { success: false, error: "Failed to toggle like" };
    }
}

/**
 * Toggle like on an exam set
 */
export async function toggleExamSetLike(examSetId: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" };
        }

        const userId = session.user.id;

        const existingLike = await prisma.userExamSetLike.findUnique({
            where: {
                userId_examSetId: {
                    userId,
                    examSetId,
                },
            },
        });

        if (existingLike) {
            await prisma.userExamSetLike.delete({
                where: { id: existingLike.id },
            });
            await prisma.userExamSet.update({
                where: { id: examSetId },
                data: { likes: { decrement: 1 } },
            });
            return { success: true, liked: false };
        } else {
            await prisma.userExamSetLike.create({
                data: {
                    userId,
                    examSetId,
                },
            });
            await prisma.userExamSet.update({
                where: { id: examSetId },
                data: { likes: { increment: 1 } },
            });
            return { success: true, liked: true };
        }
    } catch (error) {
        console.error("Error toggling like:", error);
        return { success: false, error: "Failed to toggle like" };
    }
}

/**
 * Get user's practice attempt history
 */
export async function getUserPracticeAttempts(page = 1, limit = 10) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized", data: [] };
        }

        const [attempts, total] = await Promise.all([
            prisma.userPracticeSetAttempt.findMany({
                where: { userId: session.user.id },
                orderBy: { startedAt: "desc" },
                skip: (page - 1) * limit,
                take: limit,
                include: {
                    practiceSet: {
                        select: {
                            id: true,
                            title: true,
                            language: true,
                            mode: true,
                            difficulty: true,
                            slug: true,
                        },
                    },
                },
            }),
            prisma.userPracticeSetAttempt.count({
                where: { userId: session.user.id },
            }),
        ]);

        return {
            success: true,
            data: attempts,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    } catch (error) {
        console.error("Error fetching user practice attempts:", error);
        return { success: false, error: "Failed to fetch attempts", data: [] };
    }
}

/**
 * Get user's exam attempt history
 */
export async function getUserExamAttempts(page = 1, limit = 10) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized", data: [] };
        }

        const [attempts, total] = await Promise.all([
            prisma.userExamSetAttempt.findMany({
                where: { userId: session.user.id },
                orderBy: { startedAt: "desc" },
                skip: (page - 1) * limit,
                take: limit,
                include: {
                    examSet: {
                        select: {
                            id: true,
                            title: true,
                            language: true,
                            mode: true,
                            difficulty: true,
                            slug: true,
                        },
                    },
                },
            }),
            prisma.userExamSetAttempt.count({
                where: { userId: session.user.id },
            }),
        ]);

        return {
            success: true,
            data: attempts,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    } catch (error) {
        console.error("Error fetching user exam attempts:", error);
        return { success: false, error: "Failed to fetch attempts", data: [] };
    }
}

/**
 * Make a practice set public (and get 50% credit refund)
 */
export async function makePracticeSetPublic(practiceSetId: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" };
        }

        const set = await prisma.userPracticeSet.findUnique({
            where: { id: practiceSetId },
        });

        if (!set) {
            return { success: false, error: "Practice set not found" };
        }

        if (set.creatorId !== session.user.id) {
            return { success: false, error: "Not authorized to modify this set" };
        }

        if (set.isPublic) {
            return { success: false, error: "Already public" };
        }

        const refund = Math.floor(set.creditsCost * PUBLIC_CREDIT_REFUND_PERCENT / 100);

        await prisma.userPracticeSet.update({
            where: { id: practiceSetId },
            data: {
                isPublic: true,
                madePublicAt: new Date(),
                creditsRefunded: refund,
            },
        });

        await prisma.user.update({
            where: { id: session.user.id },
            data: { credits: { increment: refund } },
        });

        revalidatePath("/assessments/community/practice");

        return { success: true, creditsRefunded: refund };
    } catch (error) {
        console.error("Error making practice set public:", error);
        return { success: false, error: "Failed to make public" };
    }
}

/**
 * Make an exam set public (and get 50% credit refund)
 */
export async function makeExamSetPublic(examSetId: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" };
        }

        const set = await prisma.userExamSet.findUnique({
            where: { id: examSetId },
        });

        if (!set) {
            return { success: false, error: "Exam set not found" };
        }

        if (set.creatorId !== session.user.id) {
            return { success: false, error: "Not authorized to modify this set" };
        }

        if (set.isPublic) {
            return { success: false, error: "Already public" };
        }

        const refund = Math.floor(set.creditsCost * PUBLIC_CREDIT_REFUND_PERCENT / 100);

        await prisma.userExamSet.update({
            where: { id: examSetId },
            data: {
                isPublic: true,
                madePublicAt: new Date(),
                creditsRefunded: refund,
            },
        });

        await prisma.user.update({
            where: { id: session.user.id },
            data: { credits: { increment: refund } },
        });

        revalidatePath("/assessments/community/exam");

        return { success: true, creditsRefunded: refund };
    } catch (error) {
        console.error("Error making exam set public:", error);
        return { success: false, error: "Failed to make public" };
    }
}

/**
 * Get assessment topics for a language
 */
export async function getAssessmentTopics(language: AssessmentLanguage) {
    try {
        const topics = await prisma.assessmentTopic.findMany({
            where: { language },
            orderBy: { orderIndex: "asc" },
            include: {
                subModules: {
                    orderBy: { orderIndex: "asc" },
                    select: {
                        id: true,
                        name: true,
                        description: true,
                    },
                },
            },
        });

        return { success: true, data: topics };
    } catch (error) {
        console.error("Error fetching topics:", error);
        return { success: false, error: "Failed to fetch topics", data: [] };
    }
}

/**
 * Get practice attempt results with answers
 */
export async function getPracticeAttemptResults(attemptId: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" };
        }

        const attempt = await prisma.userPracticeSetAttempt.findUnique({
            where: { id: attemptId },
            include: {
                practiceSet: {
                    include: {
                        topic: { select: { name: true } },
                        subModule: { select: { name: true } },
                    },
                },
                answers: {
                    include: {
                        question: true,
                    },
                    orderBy: {
                        question: { orderIndex: "asc" },
                    },
                },
            },
        });

        if (!attempt) {
            return { success: false, error: "Attempt not found" };
        }

        if (attempt.userId !== session.user.id) {
            return { success: false, error: "Not authorized" };
        }

        return { success: true, data: attempt };
    } catch (error) {
        console.error("Error fetching attempt results:", error);
        return { success: false, error: "Failed to fetch results" };
    }
}

/**
 * Get exam attempt results with answers
 */
export async function getExamAttemptResults(attemptId: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" };
        }

        const attempt = await prisma.userExamSetAttempt.findUnique({
            where: { id: attemptId },
            include: {
                examSet: {
                    include: {
                        topic: { select: { name: true } },
                    },
                },
                answers: {
                    include: {
                        question: true,
                    },
                    orderBy: {
                        question: { orderIndex: "asc" },
                    },
                },
            },
        });

        if (!attempt) {
            return { success: false, error: "Attempt not found" };
        }

        if (attempt.userId !== session.user.id) {
            return { success: false, error: "Not authorized" };
        }

        return { success: true, data: attempt };
    } catch (error) {
        console.error("Error fetching attempt results:", error);
        return { success: false, error: "Failed to fetch results" };
    }
}
