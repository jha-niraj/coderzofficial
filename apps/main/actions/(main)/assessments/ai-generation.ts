'use server'

import OpenAI from 'openai'
import {
    AssessmentMode, QuestionDifficulty, AssessmentQuestionType,
} from '@repo/prisma/client'
import type {
    GeneratedQuestion, AIGenerationConfig, MockInterviewConfig
} from '@/types/assessment'

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})

// ==================== SYSTEM PROMPTS ====================

const QUIZ_SYSTEM_PROMPT = `You are an expert programming instructor creating quiz questions.
Generate high-quality multiple-choice questions that test understanding of programming concepts.
Each question should have 4 options with exactly one correct answer.
Include clear explanations for why the correct answer is right.
Questions should be practical and test real-world understanding.`

const CODE_SYSTEM_PROMPT = `You are an expert programming instructor creating coding challenges.
Generate practical coding problems that test programming skills.
Include clear problem statements, starter code templates, and comprehensive test cases.
Solutions should be well-commented and demonstrate best practices.
Problems should be solvable within 10-15 minutes.`

const MOCK_INTERVIEW_SYSTEM_PROMPT = `You are an expert technical interviewer at a top tech company.
Generate realistic interview questions that assess both technical knowledge and problem-solving ability.
Questions should simulate real interview scenarios including:
- Technical deep-dives
- System design concepts (for appropriate levels)
- Behavioral aspects of technical decisions
- Code review and debugging scenarios
Include model answers that would impress interviewers.`

const MIXED_SYSTEM_PROMPT = `You are an expert programming instructor creating a comprehensive assessment.
Generate a balanced mix of question types including:
- Multiple choice theory questions
- Code output prediction questions
- Coding challenges
- Scenario-based questions
Ensure variety in question types while maintaining consistent difficulty.`

// ==================== QUESTION TYPE MAPPINGS ====================

function getQuestionTypesForMode(mode: AssessmentMode): AssessmentQuestionType[] {
    switch (mode) {
        case 'QUIZ':
            return ['MCQ', 'MULTIPLE_SELECT', 'TRUE_FALSE', 'CODE_OUTPUT']
        case 'CODE':
            return ['CODE_WRITE', 'CODE_DEBUG', 'CODE_COMPLETE']
        case 'MOCK':
            return ['SCENARIO', 'CODE_WRITE', 'CODE_DEBUG']
        case 'MIXED':
            return ['MCQ', 'CODE_WRITE', 'CODE_OUTPUT', 'SCENARIO', 'CODE_DEBUG']
        default:
            return ['MCQ']
    }
}

function getSystemPromptForMode(mode: AssessmentMode): string {
    switch (mode) {
        case 'QUIZ':
            return QUIZ_SYSTEM_PROMPT
        case 'CODE':
            return CODE_SYSTEM_PROMPT
        case 'MOCK':
            return MOCK_INTERVIEW_SYSTEM_PROMPT
        case 'MIXED':
            return MIXED_SYSTEM_PROMPT
        default:
            return QUIZ_SYSTEM_PROMPT
    }
}

function getDifficultyDescription(difficulty: QuestionDifficulty): string {
    switch (difficulty) {
        case 'EASY':
            return 'beginner-friendly concepts, basic syntax, and fundamental principles'
        case 'INTERMEDIATE':
            return 'intermediate concepts, common patterns, and practical applications'
        case 'HARD':
            return 'advanced concepts, edge cases, optimization, and complex problem-solving'
        default:
            return 'intermediate concepts'
    }
}

function getPointsForDifficulty(difficulty: QuestionDifficulty, questionType: AssessmentQuestionType): number {
    const basePoints: Record<AssessmentQuestionType, number> = {
        MCQ: 10,
        MULTIPLE_SELECT: 15,
        TRUE_FALSE: 5,
        CODE_OUTPUT: 15,
        CODE_WRITE: 25,
        CODE_DEBUG: 20,
        CODE_COMPLETE: 20,
        SCENARIO: 25,
    }

    const multipliers: Record<QuestionDifficulty, number> = {
        EASY: 1,
        INTERMEDIATE: 1.5,
        HARD: 2,
    }

    return Math.round(basePoints[questionType] * multipliers[difficulty])
}

// ==================== AI GENERATION FUNCTIONS ====================

/**
 * Generate questions using AI based on the configuration
 */
export async function generateQuestionsWithAI(config: AIGenerationConfig): Promise<GeneratedQuestion[]> {
    const {
        language,
        mode,
        difficulty,
        topicName,
        subModuleName,
        questionCount,
        customPrompt,
    } = config

    const questionTypes = getQuestionTypesForMode(mode)
    const systemPrompt = getSystemPromptForMode(mode)
    const difficultyDesc = getDifficultyDescription(difficulty)

    const userPrompt = `Generate ${questionCount} ${difficulty.toLowerCase()} level questions about ${topicName}${subModuleName ? ` focusing on ${subModuleName}` : ''} in ${language}.

Requirements:
- Difficulty level: ${difficultyDesc}
- Question types to include: ${questionTypes.join(', ')}
- Language/Technology: ${language}
${customPrompt ? `- Additional context: ${customPrompt}` : ''}

For each question, provide:
1. The question text
2. Question type (one of: ${questionTypes.join(', ')})
3. For MCQ/MULTIPLE_SELECT/TRUE_FALSE: 4 options with exactly one correct answer (or multiple for MULTIPLE_SELECT)
4. The correct answer
5. A detailed explanation of why the answer is correct
6. For coding questions: starter code template and solution code
7. For coding questions: at least 3 test cases (1-2 visible, 1-2 hidden)
8. 2-3 helpful hints (without giving away the answer)

Return as a JSON array with the following structure:
[
  {
    "question": "Question text here",
    "type": "MCQ",
    "options": [
      {"id": "a", "text": "Option A", "isCorrect": false},
      {"id": "b", "text": "Option B", "isCorrect": true},
      {"id": "c", "text": "Option C", "isCorrect": false},
      {"id": "d", "text": "Option D", "isCorrect": false}
    ],
    "correctAnswer": "b",
    "answerExplanation": "Explanation here",
    "codeSnippet": null,
    "starterCode": null,
    "solutionCode": null,
    "testCases": null,
    "hints": ["Hint 1", "Hint 2"]
  }
]`

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt },
            ],
            response_format: { type: 'json_object' },
            temperature: 0.7,
            max_tokens: 4000,
        })

        const content = response.choices[0]?.message?.content
        if (!content) {
            throw new Error('No content in AI response')
        }

        const parsed = JSON.parse(content)
        const questions: GeneratedQuestion[] = (parsed.questions || parsed).map(
            (q: any, index: number) => ({
                question: q.question,
                type: validateQuestionType(q.type, questionTypes),
                difficulty,
                options: q.options || undefined,
                correctAnswer: q.correctAnswer,
                answerExplanation: q.answerExplanation || null,
                codeSnippet: q.codeSnippet || null,
                starterCode: q.starterCode || null,
                solutionCode: q.solutionCode || null,
                testCases: q.testCases || undefined,
                points: getPointsForDifficulty(difficulty, q.type as AssessmentQuestionType),
                hints: q.hints || [],
            })
        )

        return questions
    } catch (error) {
        console.error('Error generating questions with AI:', error)
        // Fall back to placeholder questions if AI fails
        return generatePlaceholderQuestions(config)
    }
}

/**
 * Generate mock interview questions with additional context
 */
export async function generateMockInterviewQuestions(
    config: MockInterviewConfig
): Promise<GeneratedQuestion[]> {
    const {
        language,
        difficulty,
        topicName,
        subModuleName,
        questionCount,
        role = 'Software Developer',
        experienceLevel = 'mid',
        companyType = 'tech company',
        customPrompt,
    } = config

    const experienceDescriptions = {
        junior: '0-2 years of experience, focus on fundamentals and learning potential',
        mid: '2-5 years of experience, practical problem-solving and code quality',
        senior: '5+ years of experience, system design, leadership, and architectural decisions',
    }

    const userPrompt = `Generate ${questionCount} realistic technical interview questions for a ${role} position at a ${companyType}.

Candidate Profile:
- Experience Level: ${experienceLevel} (${experienceDescriptions[experienceLevel]})
- Technology Focus: ${language}, ${topicName}${subModuleName ? ` - ${subModuleName}` : ''}
- Difficulty: ${difficulty}

${customPrompt ? `Additional context: ${customPrompt}` : ''}

Generate questions that:
1. Test practical knowledge and problem-solving ability
2. Include follow-up questions an interviewer might ask
3. Have comprehensive model answers with key points to hit
4. Reflect real interview scenarios at ${companyType}

For each question provide:
- The main question
- 2-3 potential follow-up questions
- A model answer that would score well
- Key points the interviewer is looking for
- Common mistakes candidates make

Return as a JSON array.`

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: MOCK_INTERVIEW_SYSTEM_PROMPT },
                { role: 'user', content: userPrompt },
            ],
            response_format: { type: 'json_object' },
            temperature: 0.7,
            max_tokens: 4000,
        })

        const content = response.choices[0]?.message?.content
        if (!content) {
            throw new Error('No content in AI response')
        }

        const parsed = JSON.parse(content)
        const questions: GeneratedQuestion[] = (parsed.questions || parsed).map(
            (q: any) => ({
                question: formatMockQuestion(q),
                type: 'SCENARIO' as AssessmentQuestionType,
                difficulty,
                correctAnswer: q.modelAnswer || q.correctAnswer,
                answerExplanation: formatInterviewExplanation(q),
                codeSnippet: q.codeSnippet || null,
                starterCode: q.starterCode || null,
                solutionCode: q.solutionCode || null,
                points: getPointsForDifficulty(difficulty, 'SCENARIO'),
                hints: q.hints || q.keyPoints || [],
            })
        )

        return questions
    } catch (error) {
        console.error('Error generating mock interview questions:', error)
        return generatePlaceholderQuestions({ ...config, mode: 'MOCK' })
    }
}

// ==================== HELPER FUNCTIONS ====================

function validateQuestionType(
    type: string,
    allowedTypes: AssessmentQuestionType[]
): AssessmentQuestionType {
    if (allowedTypes.includes(type as AssessmentQuestionType)) {
        return type as AssessmentQuestionType
    }
    return allowedTypes[0] as AssessmentQuestionType
}

function formatMockQuestion(q: any): string {
    let question = q.question || q.mainQuestion

    if (q.followUpQuestions && Array.isArray(q.followUpQuestions)) {
        question += '\n\nFollow-up questions the interviewer might ask:\n'
        q.followUpQuestions.forEach((fq: string, i: number) => {
            question += `${i + 1}. ${fq}\n`
        })
    }

    return question
}

function formatInterviewExplanation(q: any): string {
    let explanation = ''

    if (q.keyPoints && Array.isArray(q.keyPoints)) {
        explanation += 'Key Points to Cover:\n'
        q.keyPoints.forEach((point: string, i: number) => {
            explanation += `• ${point}\n`
        })
        explanation += '\n'
    }

    if (q.commonMistakes && Array.isArray(q.commonMistakes)) {
        explanation += 'Common Mistakes to Avoid:\n'
        q.commonMistakes.forEach((mistake: string, i: number) => {
            explanation += `• ${mistake}\n`
        })
    }

    return explanation || q.answerExplanation || 'Discuss the key concepts thoroughly.'
}

/**
 * Generate placeholder questions when AI fails
 * This ensures the user still gets something even if the API is down
 */
function generatePlaceholderQuestions(config: AIGenerationConfig): GeneratedQuestion[] {
    const { language, mode, difficulty, topicName, subModuleName, questionCount } = config
    const questions: GeneratedQuestion[] = []
    const questionTypes = getQuestionTypesForMode(mode)

    for (let i = 0; i < questionCount; i++) {
        const type = questionTypes[i % questionTypes.length]
        const points = getPointsForDifficulty(difficulty, type as AssessmentQuestionType)

        if (type === 'MCQ' || type === 'MULTIPLE_SELECT' || type === 'TRUE_FALSE') {
            questions.push({
                question: `[${language}] ${topicName}${subModuleName ? ` - ${subModuleName}` : ''} Question ${i + 1}: What is the correct approach?`,
                type,
                difficulty,
                options: [
                    { id: 'a', text: 'Option A - Correct approach', isCorrect: true },
                    { id: 'b', text: 'Option B - Incorrect approach', isCorrect: false },
                    { id: 'c', text: 'Option C - Partially correct', isCorrect: false },
                    { id: 'd', text: 'Option D - Common misconception', isCorrect: false },
                ],
                correctAnswer: 'a',
                answerExplanation: `This is the explanation for question ${i + 1}. Option A is correct because it follows best practices.`,
                codeSnippet: null,
                starterCode: null,
                solutionCode: null,
                points,
                hints: ['Think about best practices', 'Consider edge cases'],
            })
        } else if (type === 'CODE_WRITE' || type === 'CODE_DEBUG' || type === 'CODE_COMPLETE') {
            questions.push({
                question: `Write a ${language} function to solve: ${topicName} - ${subModuleName || 'basic problem'} #${i + 1}`,
                type,
                difficulty,
                correctAnswer: `// Solution for problem ${i + 1}\nfunction solution() {\n  // Implementation\n  return result;\n}`,
                answerExplanation: `This solution demonstrates the correct approach to solving the problem.`,
                codeSnippet: `// Problem: Implement the solution\n// Input: ...\n// Output: ...`,
                starterCode: `function solution() {\n  // Your code here\n}`,
                solutionCode: `function solution() {\n  // Correct implementation\n  return result;\n}`,
                testCases: [
                    { input: 'test input 1', expectedOutput: 'expected output 1', isHidden: false },
                    { input: 'test input 2', expectedOutput: 'expected output 2', isHidden: true },
                ],
                points,
                hints: ['Break down the problem', 'Consider time complexity'],
            })
        } else {
            questions.push({
                question: `${topicName} Interview Question ${i + 1}: Explain ${subModuleName || topicName} and provide a detailed implementation.`,
                type: 'SCENARIO',
                difficulty,
                correctAnswer: 'A comprehensive answer covering all key points...',
                answerExplanation: 'Key points to cover: 1) Definition, 2) Use cases, 3) Implementation details',
                codeSnippet: null,
                starterCode: null,
                solutionCode: null,
                points,
                hints: ['Start with the basics', 'Provide examples', 'Discuss trade-offs'],
            })
        }
    }

    return questions
}
