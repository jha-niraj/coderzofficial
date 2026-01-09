'use server'

import OpenAI from 'openai'
import { auth } from '@repo/auth'
import { prisma } from '@repo/prisma'

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})

// Types for exam questions
export interface QuizQuestion {
    id: string
    type: 'quiz'
    question: string
    options: string[]
    correctAnswer: number
    explanation: string
    category: 'git-basics' | 'github' | 'workflow' | 'best-practices' | 'branching' | 'advanced'
    difficulty: 'easy' | 'medium' | 'hard'
}

export interface CodeQuestion {
    id: string
    type: 'code'
    title: string
    description: string
    scenario: string
    expectedAnswer: string
    hints: string[]
    category: 'commands' | 'workflow' | 'debugging'
    difficulty: 'easy' | 'medium' | 'hard'
}

export interface ScenarioQuestion {
    id: string
    type: 'scenario'
    title: string
    scenario: string
    question: string
    options: string[]
    correctAnswer: number
    explanation: string
    category: 'collaboration' | 'conflict-resolution' | 'code-review' | 'troubleshooting'
    difficulty: 'easy' | 'medium' | 'hard'
}

export type ExamQuestion = QuizQuestion | CodeQuestion | ScenarioQuestion

export interface ExamValidationResult {
    questionId: string
    isCorrect: boolean
    explanation: string
    userAnswer: string | number
    correctAnswer?: string | number
    score: number
}

export interface GeneratedExamResult {
    success: boolean
    questions?: ExamQuestion[]
    error?: string
}

/**
 * Generate exam questions using AI
 */
export async function generateExamQuestions(count: number = 10): Promise<GeneratedExamResult> {
    const session = await auth()
    if (!session?.user?.id) {
        return { success: false, error: 'You must be logged in to take the exam.' }
    }

    try {
        const systemPrompt = `You are an expert Git and GitHub instructor creating exam questions for an open-source contribution certification.

Generate a mix of question types:
- Quiz questions (multiple choice about Git/GitHub concepts)
- Code questions (write specific git commands)
- Scenario questions (real-world collaboration situations)

Each question should be unique, practical, and test real understanding.

IMPORTANT: Generate exactly ${count} questions with this distribution:
- 4 quiz questions (2 easy, 1 medium, 1 hard)
- 3 code questions (1 easy, 1 medium, 1 hard)
- 3 scenario questions (1 easy, 1 medium, 1 hard)

Respond with a JSON array of questions. Each question must have:
- Unique id (q1, q2, c1, c2, s1, s2, etc.)
- type: "quiz", "code", or "scenario"
- difficulty: "easy", "medium", or "hard"
- category: appropriate category string

For quiz questions:
{
    "id": "q1",
    "type": "quiz",
    "question": "The question text",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "explanation": "Why this is correct",
    "category": "git-basics",
    "difficulty": "easy"
}

For code questions:
{
    "id": "c1",
    "type": "code",
    "title": "Short title",
    "description": "What the user needs to do",
    "scenario": "Context/situation",
    "expectedAnswer": "git checkout -b feature/new",
    "hints": ["Hint 1", "Hint 2"],
    "category": "commands",
    "difficulty": "easy"
}

For scenario questions:
{
    "id": "s1",
    "type": "scenario",
    "title": "Short title",
    "scenario": "Detailed situation",
    "question": "What should you do?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 1,
    "explanation": "Why this is the best approach",
    "category": "collaboration",
    "difficulty": "medium"
}

Ensure questions cover: git init, staging, commits, branches, merging, rebasing, remotes, forking, pull requests, code review, conflict resolution, GitHub workflow, and best practices.`

        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: `Generate ${count} unique exam questions for the Git & GitHub certification exam. Return only the JSON array, no markdown.` }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.7,
            max_tokens: 4000
        })

        const content = response.choices[0]?.message?.content
        if (!content) {
            throw new Error('No response from AI')
        }

        const parsed = JSON.parse(content)
        const questions: ExamQuestion[] = parsed.questions || parsed

        // Validate and ensure proper structure
        const validatedQuestions = questions.map((q, index) => ({
            ...q,
            id: q.id || `generated-${index + 1}`
        }))

        return { success: true, questions: validatedQuestions }
    } catch (error) {
        console.error('Error generating exam questions:', error)
        return { 
            success: false, 
            error: error instanceof Error ? error.message : 'Failed to generate questions' 
        }
    }
}

/**
 * Validate a single exam answer using AI
 */
export async function validateExamAnswer(
    question: ExamQuestion,
    userAnswer: string | number
): Promise<ExamValidationResult> {
    const session = await auth()
    if (!session?.user?.id) {
        return {
            questionId: question.id,
            isCorrect: false,
            explanation: 'You must be logged in.',
            userAnswer,
            score: 0
        }
    }

    try {
        if (question.type === 'quiz' || question.type === 'scenario') {
            // Simple comparison for multiple choice
            const isCorrect = Number(userAnswer) === question.correctAnswer
            return {
                questionId: question.id,
                isCorrect,
                explanation: question.explanation,
                userAnswer,
                correctAnswer: question.correctAnswer,
                score: isCorrect ? 100 : 0
            }
        }

        // For code questions, use AI validation
        if (question.type === 'code') {
            const userAnswerStr = String(userAnswer).trim().toLowerCase()
            const expectedStr = question.expectedAnswer.toLowerCase().trim()

            // Check for exact or equivalent match
            const normalizedUser = userAnswerStr.replace(/\s+/g, ' ')
            const normalizedExpected = expectedStr.replace(/\s+/g, ' ')

            // Quick check for common equivalents
            if (
                normalizedUser === normalizedExpected ||
                (normalizedExpected.includes('checkout -b') && normalizedUser.includes('switch -c')) ||
                (normalizedExpected.includes('switch -c') && normalizedUser.includes('checkout -b'))
            ) {
                return {
                    questionId: question.id,
                    isCorrect: true,
                    explanation: 'Correct! Your command achieves the intended goal.',
                    userAnswer,
                    correctAnswer: question.expectedAnswer,
                    score: 100
                }
            }

            // Use AI for more nuanced validation
            const systemPrompt = `You are a Git expert validating command answers. Determine if the user's command achieves the same result as the expected command.

Consider:
- Alternative syntaxes (checkout -b vs switch -c)
- Flag order variations
- Equivalent commands

Respond in JSON:
{
    "isCorrect": boolean,
    "score": number (0-100),
    "explanation": "Brief explanation"
}`

            const response = await openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: `Task: ${question.description}\nExpected: ${question.expectedAnswer}\nUser's answer: ${userAnswer}\n\nIs this correct?` }
                ],
                response_format: { type: 'json_object' },
                temperature: 0.1,
                max_tokens: 300
            })

            const content = response.choices[0]?.message?.content
            if (!content) {
                throw new Error('No response from AI')
            }

            const result = JSON.parse(content)
            return {
                questionId: question.id,
                isCorrect: result.isCorrect,
                explanation: result.explanation || `Expected: ${question.expectedAnswer}`,
                userAnswer,
                correctAnswer: question.expectedAnswer,
                score: result.score || (result.isCorrect ? 100 : 0)
            }
        }

        return {
            questionId: question.id,
            isCorrect: false,
            explanation: 'Unknown question type',
            userAnswer,
            score: 0
        }
    } catch (error) {
        console.error('Error validating answer:', error)
        return {
            questionId: question.id,
            isCorrect: false,
            explanation: 'Validation error occurred',
            userAnswer,
            score: 0
        }
    }
}

/**
 * Validate all exam answers and calculate final score
 */
export async function validateExamSubmission(
    questions: ExamQuestion[],
    answers: Record<string, string | number>
): Promise<{
    success: boolean
    score: number
    passed: boolean
    results: ExamValidationResult[]
    error?: string
}> {
    const session = await auth()
    if (!session?.user?.id) {
        return {
            success: false,
            score: 0,
            passed: false,
            results: [],
            error: 'You must be logged in.'
        }
    }

    try {
        const results: ExamValidationResult[] = []

        // Validate each answer
        for (const question of questions) {
            const userAnswer = answers[question.id]
            if (userAnswer === undefined) {
                results.push({
                    questionId: question.id,
                    isCorrect: false,
                    explanation: 'Question not answered',
                    userAnswer: '',
                    score: 0
                })
                continue
            }

            const result = await validateExamAnswer(question, userAnswer)
            results.push(result)
        }

        // Calculate overall score
        const totalScore = results.reduce((sum, r) => sum + r.score, 0)
        const averageScore = Math.round(totalScore / questions.length)
        const passed = averageScore >= 70

        return {
            success: true,
            score: averageScore,
            passed,
            results
        }
    } catch (error) {
        console.error('Error validating exam:', error)
        return {
            success: false,
            score: 0,
            passed: false,
            results: [],
            error: error instanceof Error ? error.message : 'Validation failed'
        }
    }
}

/**
 * Check if user is eligible to take exam
 */
export async function checkExamEligibility(): Promise<{
    eligible: boolean
    message: string
    modulesCompleted: number
    totalModules: number
    lastAttemptAt?: Date
    canRetakeAt?: Date
}> {
    const session = await auth()
    if (!session?.user?.id) {
        return {
            eligible: false,
            message: 'You must be logged in.',
            modulesCompleted: 0,
            totalModules: 5
        }
    }

    try {
        // Check learning progress
        const progress = await prisma.oSUserLessonProgress.findMany({
            where: { userId: session.user.id },
            include: { lesson: { include: { module: true } } }
        })

        // Count completed modules
        const moduleProgress: Record<string, { total: number; completed: number }> = {}
        
        progress.forEach(p => {
            const moduleId = p.lesson.moduleId
            if (!moduleProgress[moduleId]) {
                moduleProgress[moduleId] = { total: 0, completed: 0 }
            }
            moduleProgress[moduleId].total++
            if (p.status === 'COMPLETED') {
                moduleProgress[moduleId].completed++
            }
        })

        // A module is complete if all lessons are done
        const modules = await prisma.oSLearningModule.findMany({
            where: { isActive: true },
            include: { lessons: true }
        })

        let completedModules = 0
        modules.forEach(m => {
            const mp = moduleProgress[m.id]
            if (mp && mp.completed >= m.lessons.length) {
                completedModules++
            }
        })

        const totalModules = modules.length || 5

        // Check for recent exam attempts (24 hour cooldown for failed attempts)
        const recentExam = await prisma.oSExamResult.findFirst({
            where: {
                userId: session.user.id,
                passed: false,
                completedAt: {
                    gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
                }
            },
            orderBy: { completedAt: 'desc' }
        })

        if (recentExam) {
            const canRetakeAt = new Date(recentExam.completedAt.getTime() + 24 * 60 * 60 * 1000)
            return {
                eligible: false,
                message: 'You must wait 24 hours between exam attempts.',
                modulesCompleted: completedModules,
                totalModules,
                lastAttemptAt: recentExam.completedAt,
                canRetakeAt
            }
        }

        // Check if already passed
        const passedExam = await prisma.oSExamResult.findFirst({
            where: {
                userId: session.user.id,
                passed: true
            }
        })

        if (passedExam) {
            return {
                eligible: true,
                message: 'You have already passed the certification exam! You can retake to improve your score.',
                modulesCompleted: completedModules,
                totalModules
            }
        }

        // Must complete at least 4 modules (80% of content)
        const requiredModules = Math.ceil(totalModules * 0.8)
        if (completedModules < requiredModules) {
            return {
                eligible: false,
                message: `Complete at least ${requiredModules} learning modules first.`,
                modulesCompleted: completedModules,
                totalModules
            }
        }

        return {
            eligible: true,
            message: 'You are eligible to take the certification exam!',
            modulesCompleted: completedModules,
            totalModules
        }
    } catch (error) {
        console.error('Error checking exam eligibility:', error)
        return {
            eligible: false,
            message: 'Error checking eligibility. Please try again.',
            modulesCompleted: 0,
            totalModules: 5
        }
    }
}

/**
 * Save exam result to database
 */
export async function saveExamResult(data: {
    score: number
    passed: boolean
    timeTaken: number
    answers: { questionId: string; answer: string; isCorrect: boolean }[]
}): Promise<{ success: boolean; error?: string; certificateId?: string }> {
    const session = await auth()
    if (!session?.user?.id) {
        return { success: false, error: 'You must be logged in.' }
    }

    try {
        const result = await prisma.oSExamResult.create({
            data: {
                userId: session.user.id,
                score: data.score,
                passed: data.passed,
                timeTaken: data.timeTaken,
                answers: data.answers,
                completedAt: new Date()
            }
        })

        // If passed, update user stats and create certificate
        if (data.passed) {
            await prisma.userOSStats.upsert({
                where: { userId: session.user.id },
                update: {
                    isCertified: true,
                    certifiedAt: new Date()
                },
                create: {
                    userId: session.user.id,
                    isCertified: true,
                    certifiedAt: new Date()
                }
            })

            // Create certificate
            const certificate = await prisma.oSCertificate.create({
                data: {
                    userId: session.user.id,
                    examId: result.id,
                    type: 'CONTRIBUTION',
                    certificateId: `OSC-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`
                }
            })

            return { success: true, certificateId: certificate.certificateId }
        }

        return { success: true }
    } catch (error) {
        console.error('Error saving exam result:', error)
        return { 
            success: false, 
            error: error instanceof Error ? error.message : 'Failed to save result' 
        }
    }
}





