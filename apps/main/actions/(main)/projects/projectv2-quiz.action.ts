"use server"

import { auth } from "@repo/auth";
import prisma from "@repo/prisma";
import OpenAI from "openai"
import { QuizV2Difficulty, CreditType, Currency } from "@repo/prisma/client"

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})

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
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: "Not authenticated" }
        }

        // Get project with existing quiz
        const project = await prisma.projectV2.findUnique({
            where: { slug: projectSlug },
            include: {
                quiz: {
                    include: {
                        questions: {
                            orderBy: { orderIndex: 'asc' }
                        }
                    }
                },
            }
        })

        if (!project) {
            return { success: false, error: "Project not found" }
        }

        if (!project.includeAssessment) {
            return { success: false, error: "This project does not include assessments" }
        }

        // Check if quiz already exists
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

        // Check user credits
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { credits: true }
        })

        if (!user || user.credits < QUIZ_CREDIT_COST) {
            return { success: false, error: "Insufficient credits", requiredCredits: QUIZ_CREDIT_COST }
        }

        // Generate quiz questions with OpenAI
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
1. Core concepts and best practices
2. Technology-specific knowledge
3. Implementation patterns
4. Problem-solving approaches

Distribute the questions as follows:
- 7 EASY questions (fundamental concepts)
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

        // Parse the response
        let questions: QuizQuestion[]
        try {
            const parsed = JSON.parse(content)
            // Handle both direct array and object with questions property
            questions = Array.isArray(parsed) ? parsed : parsed.questions || []
        } catch (e) {
            console.error("Failed to parse OpenAI response:", e)
            return { success: false, error: "Invalid response format from AI" }
        }

        if (!Array.isArray(questions) || questions.length !== 20) {
            return { success: false, error: `Expected 20 questions, got ${questions?.length || 0}` }
        }

        // Validate question structure
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

        // Deduct credits and create transaction
        await prisma.$transaction(async (tx: any) => {
            // Update user credits
            await tx.user.update({
                where: { id: session.user.id },
                data: { credits: { decrement: QUIZ_CREDIT_COST } }
            })

            // Create credit transaction
            await tx.creditTransaction.create({
                data: {
                    userId: session.user.id,
                    currency: Currency.NA,
                    amount: QUIZ_CREDIT_COST,
                    type: CreditType.SPEND,
                    description: `Quiz assessment generated for project: ${project.title}`
                }
            })

            // Create quiz and questions
            await tx.projectV2Quiz.create({
                data: {
                    projectId: project.id,
                    totalQuestions: questions.length,
                    questions: {
                        create: questions.map((q, index) => ({
                            orderIndex: index,
                            difficulty: q.difficulty as QuizV2Difficulty,
                            prompt: q.prompt,
                            options: q.options,
                            correctAnswer: q.correctAnswer,
                            explanation: q.explanation
                        }))
                    }
                }
            })
        })

        // Fetch the created quiz
        const createdQuiz = await prisma.projectV2Quiz.findUnique({
            where: { projectId: project.id },
            include: {
                questions: {
                    orderBy: { orderIndex: 'asc' }
                }
            }
        })

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
    answers: Record<string, number>, // questionId -> selectedAnswer index
    timeSpent: number
) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: "Not authenticated" }
        }

        const project = await prisma.projectV2.findUnique({
            where: { slug: projectSlug },
            include: {
                quiz: {
                    include: {
                        questions: true
                    }
                }
            }
        })

        if (!project?.quiz) {
            return { success: false, error: "Quiz not found" }
        }

        // Calculate score
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

        // Save attempt
        const attempt = await prisma.projectV2QuizAttempt.create({
            data: {
                userId: session.user.id,
                projectId: project.id,
                quizId: project.quiz.id,
                score,
                totalQuestions,
                correctAnswers,
                timeSpent,
                isCompleted: true,
                completedAt: new Date(),
                answers: {
                    create: questionAnswers.map(qa => ({
                        questionId: qa.questionId,
                        selectedAnswer: qa.selectedAnswer,
                        isCorrect: qa.isCorrect
                    }))
                }
            },
            include: {
                answers: {
                    include: {
                        question: true
                    }
                }
            }
        })

        // Update leaderboard scores after quiz completion
        try {
            const { updateProjectScore } = await import("./leaderboard.action")
            await updateProjectScore(project.id, session.user.id)
        } catch (error) {
            console.error("Failed to update leaderboard scores:", error)
            // Don't fail the quiz submission if leaderboard update fails
        }

        return {
            success: true,
            attempt: {
                id: attempt.id,
                score: attempt.score,
                correctAnswers: attempt.correctAnswers,
                totalQuestions: attempt.totalQuestions,
                answers: attempt.answers.map((a: any) => ({
                    questionId: a.questionId,
                    selectedAnswer: a.selectedAnswer,
                    isCorrect: a.isCorrect,
                    correctAnswer: a.question.correctAnswer,
                    explanation: a.question.explanation
                }))
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

        const attempts = await prisma.projectV2QuizAttempt.findMany({
            where: {
                userId: session.user.id,
                projectId: project.id
            },
            orderBy: { createdAt: 'desc' },
            take: 10,
            select: {
                id: true,
                score: true,
                correctAnswers: true,
                totalQuestions: true,
                timeSpent: true,
                completedAt: true,
                createdAt: true
            }
        })

        return { success: true, attempts }

    } catch (error) {
        console.error("Error fetching quiz attempts:", error)
        return { success: false, error: "Failed to fetch attempts" }
    }
}
