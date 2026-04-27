'use server'

import type OpenAI from 'openai'
import { openai } from '@/lib/openai-client'
import { auth } from '@repo/auth'


export interface ValidationResult {
    isCorrect: boolean
    score: number // 0-100
    feedback: string
    hints?: string[]
    errors?: string[]
    expectedOutput?: string
    actualOutput?: string
}

export interface CodeValidationInput {
    code: string
    language: string
    expectedOutput?: string
    taskDescription?: string
    validationRules?: string[]
    validationPrompt?: string
}

export interface TerminalValidationInput {
    command: string
    expectedCommand?: string
    taskDescription?: string
    context?: string // Previous commands or context
    validationPrompt?: string
}

export interface QuizValidationInput {
    question: string
    userAnswer: string
    correctAnswer?: string
    options?: string[]
    validationPrompt?: string
}

/**
 * Validate code submission using AI
 */
export async function validateCode(input: CodeValidationInput): Promise<ValidationResult> {
    const session = await auth()
    if (!session?.user?.id) {
        return {
            isCorrect: false,
            score: 0,
            feedback: 'You must be logged in to validate code.',
            errors: ['Authentication required']
        }
    }

    try {
        const systemPrompt = `You are an expert code reviewer and programming instructor. Your job is to validate student code submissions.

You must:
1. Check if the code is syntactically correct
2. Check if it meets the requirements described in the task
3. Provide constructive feedback
4. Score the submission from 0-100
5. If incorrect, provide helpful hints without giving away the solution

Respond in JSON format only:
{
    "isCorrect": boolean,
    "score": number (0-100),
    "feedback": "string with brief feedback",
    "errors": ["array of specific errors if any"],
    "hints": ["array of helpful hints if needed"]
}`

        const userPrompt = `
Language: ${input.language}

Task Description:
${input.taskDescription || 'Complete the code exercise'}

${input.expectedOutput ? `Expected Output/Behavior:\n${input.expectedOutput}` : ''}

${input.validationRules ? `Validation Rules:\n${input.validationRules.join('\n')}` : ''}

${input.validationPrompt ? `Additional Instructions:\n${input.validationPrompt}` : ''}

Student's Code:
\`\`\`${input.language}
${input.code}
\`\`\`

Please validate this code submission and respond with JSON.`

        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.3,
            max_tokens: 1000
        })

        const content = response.choices[0]?.message?.content
        if (!content) {
            throw new Error('No response from AI')
        }

        const result = JSON.parse(content) as ValidationResult
        return {
            isCorrect: result.isCorrect ?? false,
            score: Math.min(100, Math.max(0, result.score ?? 0)),
            feedback: result.feedback || 'Validation complete',
            hints: result.hints || [],
            errors: result.errors || [],
            expectedOutput: input.expectedOutput
        }
    } catch (error) {
        console.error('Code validation error:', error)
        return {
            isCorrect: false,
            score: 0,
            feedback: 'An error occurred during validation. Please try again.',
            errors: [error instanceof Error ? error.message : 'Unknown error']
        }
    }
}

/**
 * Validate terminal/git command using AI
 */
export async function validateTerminalCommand(input: TerminalValidationInput): Promise<{
    isCorrect: boolean
    output: string
    feedback?: string
    nextHint?: string
}> {
    const session = await auth()
    if (!session?.user?.id) {
        return {
            isCorrect: false,
            output: 'Error: You must be logged in to run commands.',
        }
    }

    try {
        const systemPrompt = `You are a terminal/git command simulator for learning. Simulate the output of commands as if they were run in a real terminal.

For git commands, simulate realistic output. For invalid commands, provide helpful error messages.

Respond in JSON format:
{
    "isCorrect": boolean (true if command achieves the task goal),
    "output": "simulated terminal output",
    "feedback": "optional feedback about the command",
    "nextHint": "optional hint for what to do next"
}`

        const userPrompt = `
Task: ${input.taskDescription || 'Execute the command'}

${input.expectedCommand ? `Expected Command Pattern: ${input.expectedCommand}` : ''}

${input.context ? `Previous Commands/Context:\n${input.context}` : ''}

${input.validationPrompt ? `Additional Instructions:\n${input.validationPrompt}` : ''}

User's Command: ${input.command}

Simulate the output of this command and evaluate if it's correct for the task.`

        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.3,
            max_tokens: 500
        })

        const content = response.choices[0]?.message?.content
        if (!content) {
            throw new Error('No response from AI')
        }

        return JSON.parse(content)
    } catch (error) {
        console.error('Terminal validation error:', error)
        return {
            isCorrect: false,
            output: `Error: ${error instanceof Error ? error.message : 'Command simulation failed'}`
        }
    }
}

/**
 * Validate quiz answer using AI
 */
export async function validateQuizAnswer(input: QuizValidationInput): Promise<ValidationResult> {
    const session = await auth()
    if (!session?.user?.id) {
        return {
            isCorrect: false,
            score: 0,
            feedback: 'You must be logged in to submit answers.',
            errors: ['Authentication required']
        }
    }

    try {
        // If correct answer is provided, do simple comparison
        if (input.correctAnswer) {
            const userAnswerNormalized = input.userAnswer.toLowerCase().trim()
            const correctAnswerNormalized = input.correctAnswer.toLowerCase().trim()
            const isCorrect = userAnswerNormalized === correctAnswerNormalized

            return {
                isCorrect,
                score: isCorrect ? 100 : 0,
                feedback: isCorrect 
                    ? 'Correct! Great job!' 
                    : `Incorrect. The correct answer was: ${input.correctAnswer}`,
                expectedOutput: input.correctAnswer
            }
        }

        // Use AI for more complex validation
        const systemPrompt = `You are an expert quiz evaluator. Evaluate the student's answer to the question.

Respond in JSON format:
{
    "isCorrect": boolean,
    "score": number (0-100, can be partial credit),
    "feedback": "brief explanation of why the answer is correct or incorrect",
    "hints": ["helpful hints if incorrect"]
}`

        const userPrompt = `
Question: ${input.question}

${input.options ? `Options:\n${input.options.map((o, i) => `${i + 1}. ${o}`).join('\n')}` : ''}

${input.validationPrompt ? `Validation Instructions:\n${input.validationPrompt}` : ''}

Student's Answer: ${input.userAnswer}

Evaluate this answer and respond with JSON.`

        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.2,
            max_tokens: 500
        })

        const content = response.choices[0]?.message?.content
        if (!content) {
            throw new Error('No response from AI')
        }

        const result = JSON.parse(content) as ValidationResult
        return {
            isCorrect: result.isCorrect ?? false,
            score: Math.min(100, Math.max(0, result.score ?? 0)),
            feedback: result.feedback || 'Answer evaluated',
            hints: result.hints || []
        }
    } catch (error) {
        console.error('Quiz validation error:', error)
        return {
            isCorrect: false,
            score: 0,
            feedback: 'An error occurred during validation. Please try again.',
            errors: [error instanceof Error ? error.message : 'Unknown error']
        }
    }
}

/**
 * Generate a simulated terminal session for git learning
 */
export async function simulateGitSession(commands: string[]): Promise<{
    outputs: string[]
    isComplete: boolean
    feedback?: string
}> {
    const session = await auth()
    if (!session?.user?.id) {
        return {
            outputs: ['Error: You must be logged in.'],
            isComplete: false
        }
    }

    try {
        const systemPrompt = `You are a git terminal simulator for learning. Given a sequence of git commands, simulate their outputs as if they were run in a real git repository.

Assume a clean repository state at the start. Maintain state between commands.

Respond in JSON format:
{
    "outputs": ["array of outputs for each command in order"],
    "isComplete": boolean (true if all commands were valid),
    "feedback": "optional summary feedback"
}`

        const userPrompt = `
Simulate these git commands in sequence:
${commands.map((cmd, i) => `${i + 1}. ${cmd}`).join('\n')}

Provide realistic terminal output for each command.`

        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.3,
            max_tokens: 1000
        })

        const content = response.choices[0]?.message?.content
        if (!content) {
            throw new Error('No response from AI')
        }

        return JSON.parse(content)
    } catch (error) {
        console.error('Git simulation error:', error)
        return {
            outputs: [`Error: ${error instanceof Error ? error.message : 'Simulation failed'}`],
            isComplete: false
        }
    }
}





