'use server'

import type OpenAI from 'openai'
import { openai } from '@/lib/openai-client'
import { auth } from '@repo/auth'
import { prisma } from '@repo/prisma'


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

// ================================
// 3-PHASE EXAM TYPES
// ================================

export interface ThreePhaseQuizQuestion {
    id: string
    question: string
    options: string[]
    correctAnswer: number
    explanation: string
    difficulty: 'easy' | 'medium' | 'hard'
    category: string
    points: number
}

export interface ThreePhaseCodingQuestion {
    id: string
    title: string
    scenario: string
    task: string
    expectedCommands: string[]
    hints: string[]
    difficulty: 'easy' | 'medium' | 'hard'
    points: number
}

export interface ThreePhaseExam {
    examId: string
    quizPhase: {
        questions: ThreePhaseQuizQuestion[]
        weight: number // 30%
    }
    codingPhase: {
        questions: ThreePhaseCodingQuestion[]
        weight: number // 35%
    }
    voicePhase: {
        prompt: string
        topics: string[]
        weight: number // 35%
    }
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
- Quiz questions (multiple choice about Git/GitHub Learns)
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

        // Exhaustive check - this should never be reached
        const _exhaustiveCheck: never = question
        return _exhaustiveCheck
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
        // Check learning progress - using OSLearnProgress model
        const learnProgress = await prisma.oSLearnProgress.findMany({
            where: { userId: session.user.id },
            include: { module: { include: { lessons: true } } }
        })

        // Count completed modules
        let completedModules = 0
        learnProgress.forEach(p => {
            if (p.isCompleted) {
                completedModules++
            }
        })

        // Get all active modules
        const modules = await prisma.oSLearnModule.findMany({
            where: { isActive: true },
            include: { lessons: true }
        })

        const totalModules = modules.length || 5

        // Check for recent exam attempts (24 hour cooldown for failed attempts)
        const recentExam = await prisma.oSCertificationExam.findFirst({
            where: {
                userId: session.user.id,
                status: 'FAILED',
                completedAt: {
                    gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
                }
            },
            orderBy: { completedAt: 'desc' }
        })

        if (recentExam && recentExam.completedAt) {
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
        const passedExam = await prisma.oSCertificationExam.findFirst({
            where: {
                userId: session.user.id,
                status: 'PASSED'
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

        // Users can now take the exam without completing all modules
        // We still track their progress but don't block them
        const recommendedModules = Math.ceil(totalModules * 0.8)
        let message = 'You are eligible to take the certification exam!'

        if (completedModules < recommendedModules) {
            message = `You can take the exam now! We recommend completing at least ${recommendedModules} modules first for better preparation.`
        }

        return {
            eligible: true,
            message,
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

// ================================
// 3-PHASE EXAM FUNCTIONS
// ================================

/**
 * Generate 3-phase exam questions
 */
export async function generateThreePhaseExam(): Promise<{
    success: boolean
    exam?: ThreePhaseExam
    error?: string
}> {
    const session = await auth()
    if (!session?.user?.id) {
        return { success: false, error: 'You must be logged in.' }
    }

    try {
        // Generate Quiz Questions (15-20 questions)
        const quizPrompt = `Generate 18 Git/GitHub quiz questions for a certification exam.

Distribution:
- 6 easy questions (5 points each)
- 8 medium questions (7 points each)
- 4 hard questions (10 points each)

Categories to cover:
- Git basics (init, add, commit, status)
- Branching (checkout, branch, merge, rebase)
- Remote operations (push, pull, fetch, clone)
- GitHub workflows (PR, issues, code review)
- Advanced (stash, reset, reflog, cherry-pick)

Respond with JSON: { "questions": [...] }
Each question must have: id, question, options (4 choices), correctAnswer (0-3 index), explanation, difficulty, category, points`

        const quizResponse = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: 'You are an expert Git instructor creating certification exam questions. Return valid JSON only.' },
                { role: 'user', content: quizPrompt }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.7,
            max_tokens: 6000
        })

        const quizContent = quizResponse.choices[0]?.message?.content
        if (!quizContent) throw new Error('Failed to generate quiz questions')
        const quizData = JSON.parse(quizContent)

        // Generate Coding Questions (5 questions)
        const codingPrompt = `Generate 5 practical Git coding questions for a certification exam.

Each question presents a scenario and asks for the correct Git command(s).

Distribution:
- 2 easy (15 points each): basic commands
- 2 medium (20 points each): branching/merging scenarios
- 1 hard (30 points): complex workflow

Respond with JSON: { "questions": [...] }
Each question must have:
- id: unique identifier
- title: short title
- scenario: detailed context
- task: what the user needs to accomplish
- expectedCommands: array of acceptable commands (include alternatives)
- hints: array of 2 helpful hints
- difficulty: easy/medium/hard
- points: based on difficulty`

        const codingResponse = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: 'You are an expert Git instructor creating practical coding exercises. Return valid JSON only.' },
                { role: 'user', content: codingPrompt }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.7,
            max_tokens: 3000
        })

        const codingContent = codingResponse.choices[0]?.message?.content
        if (!codingContent) throw new Error('Failed to generate coding questions')
        const codingData = JSON.parse(codingContent)

        // Create exam in database
        const examId = `exam-${Date.now()}-${Math.random().toString(36).substring(7)}`

        await prisma.oSCertificationExam.create({
            data: {
                userId: session.user.id,
                status: 'IN_PROGRESS',
                quizQuestions: quizData.questions,
                codeExercises: codingData.questions,
                startedAt: new Date(),
                passingScore: 80 // 80% required to pass
            }
        })

        const voicePrompt = `You are an expert interviewer conducting a Git/GitHub certification voice interview.

Key topics to cover:
1. Version control fundamentals
2. Git workflow best practices
3. Collaboration using GitHub
4. Handling merge conflicts
5. Code review process

Ask practical, scenario-based questions. Evaluate the candidate's:
- Technical knowledge accuracy
- Communication clarity
- Problem-solving approach
- Real-world application understanding

Conduct a 5-7 minute interview with 4-5 questions. Be encouraging but thorough.`

        return {
            success: true,
            exam: {
                examId,
                quizPhase: {
                    questions: quizData.questions,
                    weight: 30
                },
                codingPhase: {
                    questions: codingData.questions,
                    weight: 35
                },
                voicePhase: {
                    prompt: voicePrompt,
                    topics: [
                        'Git fundamentals',
                        'Branching strategies',
                        'Collaboration workflows',
                        'Merge conflict resolution',
                        'Code review best practices'
                    ],
                    weight: 35
                }
            }
        }
    } catch (error) {
        console.error('Error generating 3-phase exam:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to generate exam'
        }
    }
}

/**
 * Validate quiz phase answers
 */
export async function validateQuizPhase(
    questions: ThreePhaseQuizQuestion[],
    answers: Record<string, number>
): Promise<{
    success: boolean
    score: number
    maxScore: number
    percentage: number
    results: { questionId: string; correct: boolean; points: number }[]
}> {
    const session = await auth()
    if (!session?.user?.id) {
        return { success: false, score: 0, maxScore: 0, percentage: 0, results: [] }
    }

    const results: { questionId: string; correct: boolean; points: number }[] = []
    let totalScore = 0
    let maxScore = 0

    for (const question of questions) {
        const userAnswer = answers[question.id]
        const isCorrect = userAnswer === question.correctAnswer
        const pointsEarned = isCorrect ? question.points : 0

        results.push({
            questionId: question.id,
            correct: isCorrect,
            points: pointsEarned
        })

        totalScore += pointsEarned
        maxScore += question.points
    }

    return {
        success: true,
        score: totalScore,
        maxScore,
        percentage: Math.round((totalScore / maxScore) * 100),
        results
    }
}

/**
 * Validate coding phase answers using AI
 */
export async function validateCodingPhase(
    questions: ThreePhaseCodingQuestion[],
    answers: Record<string, string>
): Promise<{
    success: boolean
    score: number
    maxScore: number
    percentage: number
    results: { questionId: string; correct: boolean; points: number; feedback: string }[]
}> {
    const session = await auth()
    if (!session?.user?.id) {
        return { success: false, score: 0, maxScore: 0, percentage: 0, results: [] }
    }

    const results: { questionId: string; correct: boolean; points: number; feedback: string }[] = []
    let totalScore = 0
    let maxScore = 0

    for (const question of questions) {
        const userAnswer = (answers[question.id] || '').trim().toLowerCase()
        maxScore += question.points

        // Check for exact or near match first
        const isExactMatch = question.expectedCommands.some(expected =>
            userAnswer === expected.toLowerCase().trim()
        )

        if (isExactMatch) {
            results.push({
                questionId: question.id,
                correct: true,
                points: question.points,
                feedback: 'Correct!'
            })
            totalScore += question.points
            continue
        }

        // Use AI for nuanced validation
        try {
            const validationResponse = await openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [
                    {
                        role: 'system',
                        content: `You are a Git expert. Evaluate if a user's command achieves the same result as the expected commands. Consider equivalent syntaxes and flag variations.

Respond with JSON: { "correct": boolean, "score": number (0-100), "feedback": string }`
                    },
                    {
                        role: 'user',
                        content: `Task: ${question.task}\nExpected: ${question.expectedCommands.join(' OR ')}\nUser's answer: ${userAnswer}`
                    }
                ],
                response_format: { type: 'json_object' },
                temperature: 0.1,
                max_tokens: 200
            })

            const content = validationResponse.choices[0]?.message?.content
            if (content) {
                const result = JSON.parse(content)
                const earnedPoints = Math.round((result.score / 100) * question.points)
                results.push({
                    questionId: question.id,
                    correct: result.correct,
                    points: earnedPoints,
                    feedback: result.feedback
                })
                totalScore += earnedPoints
            }
        } catch {
            results.push({
                questionId: question.id,
                correct: false,
                points: 0,
                feedback: 'Could not validate answer'
            })
        }
    }

    return {
        success: true,
        score: totalScore,
        maxScore,
        percentage: Math.round((totalScore / maxScore) * 100),
        results
    }
}

/**
 * Save voice phase score (called after ElevenLabs evaluation)
 */
export async function saveVoicePhaseScore(
    examId: string,
    score: number
): Promise<{ success: boolean; error?: string }> {
    const session = await auth()
    if (!session?.user?.id) {
        return { success: false, error: 'Not authenticated' }
    }

    try {
        await prisma.oSCertificationExam.updateMany({
            where: {
                userId: session.user.id,
                status: 'IN_PROGRESS'
            },
            data: {
                scenarioScore: score
            }
        })

        return { success: true }
    } catch (error) {
        console.error('Error saving voice score:', error)
        return { success: false, error: 'Failed to save score' }
    }
}

/**
 * Complete 3-phase exam and calculate final score
 */
export async function completeThreePhaseExam(data: {
    quizScore: number
    quizMaxScore: number
    codingScore: number
    codingMaxScore: number
    voiceScore: number // 0-100
}): Promise<{
    success: boolean
    totalScore: number
    passed: boolean
    certificateId?: string
    breakdown: {
        quiz: { score: number; weighted: number }
        coding: { score: number; weighted: number }
        voice: { score: number; weighted: number }
    }
    error?: string
}> {
    const session = await auth()
    if (!session?.user?.id) {
        return { success: false, totalScore: 0, passed: false, breakdown: { quiz: { score: 0, weighted: 0 }, coding: { score: 0, weighted: 0 }, voice: { score: 0, weighted: 0 } }, error: 'Not authenticated' }
    }

    try {
        // Calculate weighted scores
        const quizPercentage = data.quizMaxScore > 0 ? (data.quizScore / data.quizMaxScore) * 100 : 0
        const codingPercentage = data.codingMaxScore > 0 ? (data.codingScore / data.codingMaxScore) * 100 : 0
        const voicePercentage = data.voiceScore

        const quizWeighted = quizPercentage * 0.30
        const codingWeighted = codingPercentage * 0.35
        const voiceWeighted = voicePercentage * 0.35

        const totalScore = Math.round(quizWeighted + codingWeighted + voiceWeighted)
        const passed = totalScore >= 80 // 80% pass threshold

        // Update exam record
        const exam = await prisma.oSCertificationExam.findFirst({
            where: {
                userId: session.user.id,
                status: 'IN_PROGRESS'
            },
            orderBy: { createdAt: 'desc' }
        })

        if (exam) {
            await prisma.oSCertificationExam.update({
                where: { id: exam.id },
                data: {
                    quizScore: Math.round(quizPercentage),
                    codeScore: Math.round(codingPercentage),
                    scenarioScore: Math.round(voicePercentage),
                    totalScore,
                    status: passed ? 'PASSED' : 'FAILED',
                    completedAt: new Date()
                }
            })
        }

        let certificateId: string | undefined

        // If passed, create certificate
        if (passed) {
            await prisma.userOSStats.upsert({
                where: { userId: session.user.id },
                update: {
                    isCertified: true,
                    certificationScore: totalScore,
                    certifiedAt: new Date()
                },
                create: {
                    userId: session.user.id,
                    isCertified: true,
                    certificationScore: totalScore,
                    certifiedAt: new Date()
                }
            })

            const certificate = await prisma.oSCertification.create({
                data: {
                    userId: session.user.id,
                    score: totalScore,
                    certificateId: `GIT-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
                    expiresAt: new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000)
                }
            })

            certificateId = certificate.certificateId
        }

        return {
            success: true,
            totalScore,
            passed,
            certificateId,
            breakdown: {
                quiz: { score: Math.round(quizPercentage), weighted: Math.round(quizWeighted) },
                coding: { score: Math.round(codingPercentage), weighted: Math.round(codingWeighted) },
                voice: { score: Math.round(voicePercentage), weighted: Math.round(voiceWeighted) }
            }
        }
    } catch (error) {
        console.error('Error completing exam:', error)
        return {
            success: false,
            totalScore: 0,
            passed: false,
            breakdown: { quiz: { score: 0, weighted: 0 }, coding: { score: 0, weighted: 0 }, voice: { score: 0, weighted: 0 } },
            error: error instanceof Error ? error.message : 'Failed to complete exam'
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
        const result = await prisma.oSCertificationExam.create({
            data: {
                userId: session.user.id,
                totalScore: data.score,
                status: data.passed ? 'PASSED' : 'FAILED',
                quizAnswers: data.answers,
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
            const certificate = await prisma.oSCertification.create({
                data: {
                    userId: session.user.id,
                    score: data.score,
                    certificateId: `OSC-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`,
                    expiresAt: new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000) // 2 years from now
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

/**
 * Get user's exam history and best score
 */
export async function getUserExamHistory(): Promise<{
    success: boolean
    history?: {
        id: string
        status: string
        totalScore: number | null
        quizScore: number | null
        codeScore: number | null
        scenarioScore: number | null
        completedAt: Date | null
        attemptNumber: number
    }[]
    bestScore?: number
    lastAttempt?: Date | null
    isCertified?: boolean
    certificateId?: string | null
    error?: string
}> {
    const session = await auth()
    if (!session?.user?.id) {
        return { success: false, error: 'Not authenticated' }
    }

    try {
        const exams = await prisma.oSCertificationExam.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: 'desc' },
            take: 10
        })

        const certification = await prisma.oSCertification.findFirst({
            where: {
                userId: session.user.id,
                isActive: true
            },
            orderBy: { issuedAt: 'desc' }
        })

        const passedExam = exams.find(e => e.status === 'PASSED')
        const bestScore = passedExam?.totalScore || (exams.length > 0 ? Math.max(...exams.map(e => e.totalScore || 0)) : undefined)

        return {
            success: true,
            history: exams.map(e => ({
                id: e.id,
                status: e.status,
                totalScore: e.totalScore,
                quizScore: e.quizScore,
                codeScore: e.codeScore,
                scenarioScore: e.scenarioScore,
                completedAt: e.completedAt,
                attemptNumber: e.attemptNumber
            })),
            bestScore,
            lastAttempt: exams[0]?.completedAt,
            isCertified: !!certification,
            certificateId: certification?.certificateId
        }
    } catch (error) {
        console.error('Error fetching exam history:', error)
        return { success: false, error: 'Failed to fetch history' }
    }
}

/**
 * Get exam leaderboard
 */
export async function getExamLeaderboard(): Promise<{
    success: boolean
    leaderboard?: {
        rank: number
        userId: string
        username: string | null
        name: string | null
        image: string | null
        score: number
        certifiedAt: Date
    }[]
    currentUserRank?: number
    error?: string
}> {
    const session = await auth()

    try {
        // Get top certified users by score
        const certifications = await prisma.oSCertification.findMany({
            where: { isActive: true },
            orderBy: { score: 'desc' },
            take: 50,
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        name: true,
                        image: true
                    }
                }
            }
        })

        const leaderboard = certifications.map((cert, index) => ({
            rank: index + 1,
            userId: cert.userId,
            username: cert.user.username,
            name: cert.user.name,
            image: cert.user.image,
            score: cert.score,
            certifiedAt: cert.issuedAt
        }))

        // Find current user's rank if authenticated
        let currentUserRank: number | undefined
        if (session?.user?.id) {
            const userIndex = leaderboard.findIndex(l => l.userId === session.user.id)
            if (userIndex !== -1) {
                currentUserRank = userIndex + 1
            } else {
                // Check if user has a certification but not in top 50
                const userCert = await prisma.oSCertification.findFirst({
                    where: {
                        userId: session.user.id,
                        isActive: true
                    }
                })
                if (userCert) {
                    const higherScores = await prisma.oSCertification.count({
                        where: {
                            isActive: true,
                            score: { gt: userCert.score }
                        }
                    })
                    currentUserRank = higherScores + 1
                }
            }
        }

        return {
            success: true,
            leaderboard,
            currentUserRank
        }
    } catch (error) {
        console.error('Error fetching leaderboard:', error)
        return { success: false, error: 'Failed to fetch leaderboard' }
    }
}
