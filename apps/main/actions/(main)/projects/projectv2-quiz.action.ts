"use server"

import { getSession } from "@repo/auth";
import { headers } from "next/headers";
import {
    db,
    users,
    creditTransactions,
    projectsV2,
    projectV2Quizzes,
    projectV2QuizQuestions,
    projectV2QuizAttempts,
    projectV2QuizAnswers,
} from "@repo/db";
import { eq, and, sql } from "drizzle-orm";
import type OpenAI from 'openai'
import { openai } from '@/lib/openai-client'

const QUIZ_CREDIT_COST = 25

interface QuizQuestion {
    difficulty: "EASY" | "MEDIUM" | "HARD"
    prompt: string
    options: string[]
    correctAnswer: number
    explanation: string
}

/**
 * Generate quiz questions for a project using AI
 */
export async function generateProjectQuiz(projectSlug: string) {
    try {
        const session = await getSession(headers());
        if (!session?.user?.id) {
            return { success: false, error: "Not authenticated" }
        }

        const project = await db.query.projectsV2.findFirst({
            where: eq(projectsV2.slug, projectSlug),
            with: {
                quiz: {
                    with: {
                        questions: {
                            orderBy: (questions: any, { asc }: any) => [asc(questions.orderIndex)]
                        }
                    }
                },
            }
        });

        if (!project) {
            return { success: false, error: "Project not found" }
        }

        if (!project.includeAssessment) {
            return { success: false, error: "This project does not include assessments" }
        }

        if (project.quiz) {
            return {
                success: true,
                quiz: {
                    id: project.quiz.id,
                    totalQuestions: project.quiz.totalQuestions,
                    questions: project.quiz.questions.map((q: any) => ({
                        id: q.id,
                        difficulty: q.difficulty,
                        prompt: q.prompt,
                        options: q.options,
                        correctAnswer: q.correctAnswer,
                        explanation: q.explanation,
                        orderIndex: q.orderIndex
                    }))
                }
            }
        }

        const [user] = await db.select({ credits: users.credits })
            .from(users)
            .where(eq(users.id, session.user.id));

        if (!user || user.credits < QUIZ_CREDIT_COST) {
            return { success: false, error: "Insufficient credits", requiredCredits: QUIZ_CREDIT_COST }
        }

        const stacks = project.stacks as any
        const prompt = `You are an expert technical interviewer. Generate 20 multiple-choice quiz questions for a coding project with the following details:

Project Title: ${project.title}
Description: ${project.description}
Technologies: ${project.technologies.join(', ')}
Tech Stack:
- Frontend: ${stacks?.frontend || 'N/A'}
- Backend: ${stacks?.backend || 'N/A'}
- Database: ${stacks?.database || 'N/A'}

Create questions that test understanding of:
1. Core Learns and best practices
2. Technology-specific knowledge
3. Implementation patterns
4. Problem-solving approaches

Distribute the questions as follows:
- 7 EASY questions (fundamental Learns)
- 8 MEDIUM questions (practical application)
- 5 HARD questions (advanced topics and edge cases)

For each question, provide:
- difficulty: "EASY", "MEDIUM", or "HARD"
- prompt: The question text
- options: Exactly 4 answer options (array of strings)
- correctAnswer: Index of the correct option (0-3)
- explanation: Brief explanation of the correct answer (1-2 sentences)

Return ONLY a valid JSON array with 20 questions following this exact structure:
[
  {
    "difficulty": "EASY",
    "prompt": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "explanation": "Explanation of why this is correct."
  }
]`

        const completion = await openai.chat.completions.create({
            model: "gpt-4-turbo-preview",
            messages: [
                {
                    role: "system",
                    content: "You are an expert technical interviewer who creates high-quality quiz questions. Always return valid JSON arrays."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            temperature: 0.7,
            response_format: { type: "json_object" }
        })

        const content = completion.choices[0]?.message?.content
        if (!content) {
            return { success: false, error: "Failed to generate quiz questions" }
        }

        let questions: QuizQuestion[]
        try {
            const parsed = JSON.parse(content)
            questions = Array.isArray(parsed) ? parsed : parsed.questions || []
        } catch (e) {
            console.error("Failed to parse OpenAI response:", e)
            return { success: false, error: "Invalid response format from AI" }
        }

        if (!Array.isArray(questions) || questions.length !== 20) {
            return { success: false, error: `Expected 20 questions, got ${questions?.length || 0}` }
        }

        for (const q of questions) {
            if (!q.difficulty || !["EASY", "MEDIUM", "HARD"].includes(q.difficulty)) {
                return { success: false, error: "Invalid question difficulty" }
            }
            if (!q.prompt || !Array.isArray(q.options) || q.options.length !== 4) {
                return { success: false, error: "Invalid question structure" }
            }
            if (typeof q.correctAnswer !== 'number' || q.correctAnswer < 0 || q.correctAnswer > 3) {
                return { success: false, error: "Invalid correct answer index" }
            }
        }

        await db.transaction(async (tx) => {
            await tx.update(users)
                .set({ credits: sql`${users.credits} - ${QUIZ_CREDIT_COST}` })
                .where(eq(users.id, session.user.id));

            await tx.insert(creditTransactions).values({
                userId: session.user.id,
                currency: "NA",
                amount: QUIZ_CREDIT_COST,
                type: "SPEND",
                description: `Quiz assessment generated for project: ${project.title}`
            });

            const [quiz] = await tx.insert(projectV2Quizzes).values({
                projectId: project.id,
                totalQuestions: questions.length,
            }).returning();

            await tx.insert(projectV2QuizQuestions).values(
                questions.map((q, index) => ({
                    quizId: quiz!.id,
                    orderIndex: index,
                    difficulty: q.difficulty as any,
                    prompt: q.prompt,
                    options: q.options,
                    correctAnswer: q.correctAnswer,
                    explanation: q.explanation
                }))
            );
        });

        const createdQuiz = await db.query.projectV2Quizzes.findFirst({
            where: eq(projectV2Quizzes.projectId, project.id),
            with: {
                questions: {
                    orderBy: (questions: any, { asc }: any) => [asc(questions.orderIndex)]
                }
            }
        });

        if (!createdQuiz) {
            return { success: false, error: "Quiz created but could not be retrieved" }
        }

        return {
            success: true,
            quiz: {
                id: createdQuiz.id,
                totalQuestions: createdQuiz.totalQuestions,
                questions: createdQuiz.questions.map((q: any) => ({
                    id: q.id,
                    difficulty: q.difficulty,
                    prompt: q.prompt,
                    options: q.options,
                    correctAnswer: q.correctAnswer,
                    explanation: q.explanation,
                    orderIndex: q.orderIndex
                }))
            }
        }

    } catch (error) {
        console.error("Error generating project quiz:", error)
        return { success: false, error: "Failed to generate quiz" }
    }
}

/**
 * Submit quiz answers and calculate score
 */
export async function submitQuizAttempt(
    projectSlug: string,
    answers: Record<string, number>,
    timeSpent: number
) {
    try {
        const session = await getSession(headers());
        if (!session?.user?.id) {
            return { success: false, error: "Not authenticated" }
        }

        const project = await db.query.projectsV2.findFirst({
            where: eq(projectsV2.slug, projectSlug),
            with: {
                quiz: {
                    with: {
                        questions: true
                    }
                }
            }
        });

        if (!project?.quiz) {
            return { success: false, error: "Quiz not found" }
        }

        let correctAnswers = 0
        const questionAnswers: Array<{
            questionId: string
            selectedAnswer: number
            isCorrect: boolean
        }> = []

        for (const question of project.quiz.questions) {
            const selectedAnswer = answers[question.id]
            if (selectedAnswer !== undefined) {
                const isCorrect = selectedAnswer === question.correctAnswer
                if (isCorrect) correctAnswers++

                questionAnswers.push({
                    questionId: question.id,
                    selectedAnswer,
                    isCorrect
                })
            }
        }

        const totalQuestions = project.quiz.questions.length
        const score = Math.round((correctAnswers / totalQuestions) * 100)

        const [attempt] = await db.insert(projectV2QuizAttempts).values({
            userId: session.user.id,
            projectId: project.id,
            quizId: project.quiz.id,
            score,
            totalQuestions,
            correctAnswers,
            timeSpent,
            isCompleted: true,
            completedAt: new Date(),
        }).returning();

        if (questionAnswers.length > 0) {
            await db.insert(projectV2QuizAnswers).values(
                questionAnswers.map(qa => ({
                    attemptId: attempt!.id,
                    questionId: qa.questionId,
                    selectedAnswer: qa.selectedAnswer,
                    isCorrect: qa.isCorrect
                }))
            );
        }

        const attemptWithAnswers = await db.query.projectV2QuizAttempts.findFirst({
            where: eq(projectV2QuizAttempts.id, attempt!.id),
            with: {
                answers: {
                    with: {
                        question: true
                    }
                }
            }
        });

        try {
            const { updateProjectScore } = await import("./leaderboard.action")
            await updateProjectScore(project.id, session.user.id)
        } catch (error) {
            console.error("Failed to update leaderboard scores:", error)
        }

        return {
            success: true,
            attempt: {
                id: attempt!.id,
                score: attempt!.score,
                correctAnswers: attempt!.correctAnswers,
                totalQuestions: attempt!.totalQuestions,
                answers: attemptWithAnswers?.answers.map((a: any) => ({
                    questionId: a.questionId,
                    selectedAnswer: a.selectedAnswer,
                    isCorrect: a.isCorrect,
                    correctAnswer: a.question.correctAnswer,
                    explanation: a.question.explanation
                })) || []
            }
        }

    } catch (error) {
        console.error("Error submitting quiz attempt:", error)
        return { success: false, error: "Failed to submit quiz" }
    }
}

/**
 * Get user's previous quiz attempts for a project
 */
export async function getQuizAttempts(projectSlug: string) {
    try {
        const session = await getSession(headers());
        if (!session?.user?.id) {
            return { success: false, error: "Not authenticated" }
        }

        const project = await db.query.projectsV2.findFirst({
            where: eq(projectsV2.slug, projectSlug),
            columns: { id: true }
        });

        if (!project) {
            return { success: false, error: "Project not found" }
        }

        const attempts = await db.query.projectV2QuizAttempts.findMany({
            where: and(
                eq(projectV2QuizAttempts.userId, session.user.id),
                eq(projectV2QuizAttempts.projectId, project.id)
            ),
            orderBy: (attempts: any, { desc }: any) => [desc(attempts.createdAt)],
            limit: 10,
            columns: {
                id: true,
                score: true,
                correctAnswers: true,
                totalQuestions: true,
                timeSpent: true,
                completedAt: true,
                createdAt: true
            }
        });

        return { success: true, attempts }

    } catch (error) {
        console.error("Error fetching quiz attempts:", error)
        return { success: false, error: "Failed to fetch attempts" }
    }
}
