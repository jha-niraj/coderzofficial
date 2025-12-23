'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import OpenAI from 'openai'

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})

// Credit cost for certification exam
const EXAM_CREDIT_COST = 25

// ==========================================
// HELPER FUNCTIONS - Credits
// ==========================================

async function deductCredits(userId: string, amount: number, description: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { credits: true },
    })

    if (!user || user.credits < amount) {
        throw new Error('Insufficient credits')
    }

    await prisma.$transaction([
        prisma.user.update({
            where: { id: userId },
            data: { credits: { decrement: amount } },
        }),
        prisma.creditTransaction.create({
            data: {
                userId,
                amount: -amount,
                type: 'SPEND',
                currency: 'NA',
                description,
            },
        }),
    ])
}

async function refundCredits(userId: string, amount: number, description: string) {
    await prisma.$transaction([
        prisma.user.update({
            where: { id: userId },
            data: { credits: { increment: amount } },
        }),
        prisma.creditTransaction.create({
            data: {
                userId,
                amount: amount,
                type: 'REWARD',
                currency: 'NA',
                description,
            },
        }),
    ])
}

// ==========================================
// CERTIFICATION ACTIONS
// ==========================================

// Check if user can take certification exam
export async function canTakeCertificationExam() {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: 'You must be logged in', canTake: false }
        }

        // Get user credits
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { credits: true }
        })

        // Check if all required modules are completed
        const requiredModules = await prisma.oSLearnModule.findMany({
            where: { isRequired: true, isActive: true }
        })

        const completedModules = await prisma.oSLearnProgress.findMany({
            where: {
                userId: session.user.id,
                isCompleted: true,
                moduleId: { in: requiredModules.map(m => m.id) }
            }
        })

        const allModulesComplete = requiredModules.length === 0 || completedModules.length >= requiredModules.length

        // Check for recent failed attempt (cooldown)
        const recentExam = await prisma.oSCertificationExam.findFirst({
            where: {
                userId: session.user.id,
                status: 'FAILED',
                completedAt: {
                    gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // 24 hours
                }
            }
        })

        if (recentExam) {
            return {
                success: true,
                canTake: false,
                reason: 'cooldown',
                cooldownEndsAt: new Date(recentExam.completedAt!.getTime() + 24 * 60 * 60 * 1000),
                creditCost: EXAM_CREDIT_COST,
                userCredits: user?.credits || 0
            }
        }

        // Check if already certified
        const existingCert = await prisma.oSCertification.findFirst({
            where: {
                userId: session.user.id,
                isActive: true,
                expiresAt: { gt: new Date() }
            }
        })

        if (existingCert) {
            return {
                success: true,
                canTake: false,
                reason: 'already_certified',
                certification: existingCert,
                creditCost: EXAM_CREDIT_COST,
                userCredits: user?.credits || 0
            }
        }

        // Check credits
        if (!user || user.credits < EXAM_CREDIT_COST) {
            return {
                success: true,
                canTake: false,
                reason: 'insufficient_credits',
                creditCost: EXAM_CREDIT_COST,
                userCredits: user?.credits || 0,
                requiredModules: requiredModules.length,
                completedModules: completedModules.length
            }
        }

        return {
            success: true,
            canTake: allModulesComplete,
            reason: allModulesComplete ? 'ready' : 'modules_incomplete',
            requiredModules: requiredModules.length,
            completedModules: completedModules.length,
            creditCost: EXAM_CREDIT_COST,
            userCredits: user.credits
        }
    } catch (error) {
        console.error('Error checking certification eligibility:', error)
        return { success: false, error: 'Failed to check eligibility', canTake: false }
    }
}

// Generate exam questions using OpenAI
async function generateExamQuestions() {
    const prompt = `Generate 10 multiple-choice questions about Git and open source contribution. 
    
    Include a mix of:
    - 4 basic Git commands questions
    - 3 GitHub workflow questions
    - 3 scenario-based questions about collaboration
    
    Return as JSON array with this exact structure:
    {
        "questions": [
            {
                "id": "q1",
                "type": "quiz",
                "category": "git-basics" | "github" | "workflow" | "scenario",
                "difficulty": "easy" | "medium" | "hard",
                "question": "...",
                "options": ["A", "B", "C", "D"],
                "correctAnswer": 0-3,
                "explanation": "..."
            }
        ]
    }
    
    Make questions practical and useful for real-world open source contribution.
    Include at least 2 hard questions about rebasing, merge conflicts, or advanced workflows.`

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: 'You are an expert Git and open source educator. Generate high-quality exam questions.'
                },
                { role: 'user', content: prompt }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.7
        })

        const content = response.choices[0]?.message?.content
        if (!content) throw new Error('No response from AI')

        const parsed = JSON.parse(content)
        return parsed.questions
    } catch (error) {
        console.error('Error generating questions:', error)
        throw new Error('Failed to generate exam questions. Please try again later.')
    }
}

// Start certification exam
export async function startCertificationExam() {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: 'You must be logged in' }
        }

        const eligibility = await canTakeCertificationExam()
        if (!eligibility.canTake) {
            return { success: false, error: eligibility.reason }
        }

        // Deduct credits
        try {
            await deductCredits(
                session.user.id, 
                EXAM_CREDIT_COST, 
                'Open Source Certification Exam'
            )
        } catch (error) {
            return { success: false, error: 'Insufficient credits' }
        }

        // Generate AI questions
        const questions = await generateExamQuestions()

        // Get attempt number
        const previousAttempts = await prisma.oSCertificationExam.count({
            where: { userId: session.user.id }
        })

        // Create exam
        const exam = await prisma.oSCertificationExam.create({
            data: {
                userId: session.user.id,
                status: 'IN_PROGRESS',
                quizQuestions: questions,
                attemptNumber: previousAttempts + 1,
                startedAt: new Date()
            }
        })

        return {
            success: true,
            examId: exam.id,
            questions,
            timeLimit: exam.timeLimit,
            creditCost: EXAM_CREDIT_COST
        }
    } catch (error) {
        console.error('Error starting exam:', error)
        return { success: false, error: 'Failed to start exam' }
    }
}

// Get active exam
export async function getActiveExam() {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: 'You must be logged in' }
        }

        const exam = await prisma.oSCertificationExam.findFirst({
            where: {
                userId: session.user.id,
                status: 'IN_PROGRESS'
            }
        })

        return { success: true, exam }
    } catch (error) {
        console.error('Error fetching active exam:', error)
        return { success: false, error: 'Failed to fetch exam' }
    }
}

// Submit certification exam
export async function submitCertificationExam(examId: string, answers: Record<string, number>) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: 'You must be logged in' }
        }

        const exam = await prisma.oSCertificationExam.findUnique({
            where: { id: examId }
        })

        if (!exam || exam.userId !== session.user.id) {
            return { success: false, error: 'Exam not found' }
        }

        if (exam.status !== 'IN_PROGRESS') {
            return { success: false, error: 'Exam already completed' }
        }

        // Score the exam
        const questions = exam.quizQuestions as any[]
        let correct = 0
        const feedback: Record<string, { correct: boolean; explanation: string }> = {}

        questions.forEach((q) => {
            const userAnswer = answers[q.id]
            const isCorrect = userAnswer === q.correctAnswer
            if (isCorrect) correct++
            feedback[q.id] = {
                correct: isCorrect,
                explanation: q.explanation
            }
        })

        const totalScore = Math.round((correct / questions.length) * 100)
        const passed = totalScore >= exam.passingScore

        // Calculate credit refund based on score
        const refundAmount = Math.floor((totalScore / 100) * EXAM_CREDIT_COST)

        // Update exam
        await prisma.oSCertificationExam.update({
            where: { id: examId },
            data: {
                status: passed ? 'PASSED' : 'FAILED',
                totalScore,
                quizAnswers: answers,
                completedAt: new Date()
            }
        })

        // Refund credits based on score percentage
        if (refundAmount > 0) {
            await refundCredits(
                session.user.id,
                refundAmount,
                `Certification Exam Credit Return (${totalScore}% score)`
            )
        }

        // If passed, create certification
        let certificateId: string | null = null
        if (passed) {
            certificateId = `OS-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
            const expiresAt = new Date()
            expiresAt.setFullYear(expiresAt.getFullYear() + 2)

            await prisma.oSCertification.create({
                data: {
                    certificateId,
                    userId: session.user.id,
                    score: totalScore,
                    expiresAt,
                    verificationUrl: `/opensource/verify/${certificateId}`
                }
            })

            // Update user stats
            await prisma.userOSStats.upsert({
                where: { userId: session.user.id },
                create: {
                    userId: session.user.id,
                    isCertified: true,
                    certificationScore: totalScore,
                    certifiedAt: new Date()
                },
                update: {
                    isCertified: true,
                    certificationScore: totalScore,
                    certifiedAt: new Date()
                }
            })

            revalidatePath('/opensource')
            revalidatePath('/opensource/learn')
        }

        return {
            success: true,
            passed,
            score: totalScore,
            correctAnswers: correct,
            totalQuestions: questions.length,
            feedback,
            certificateId,
            creditsRefunded: refundAmount,
            creditCost: EXAM_CREDIT_COST
        }
    } catch (error) {
        console.error('Error submitting exam:', error)
        return { success: false, error: 'Failed to submit exam' }
    }
}

// Record exam result (for client-side scored exams - legacy support)
export async function recordExamResult(data: {
    score: number
    passed: boolean
    timeTaken: number
    answers: Array<{ questionId: string; answer: string; isCorrect: boolean }>
}) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: 'You must be logged in' }
        }

        // Check if passed
        if (data.passed) {
            // Check if already certified
            const existingCert = await prisma.oSCertification.findFirst({
                where: {
                    userId: session.user.id,
                    isActive: true
                }
            })

            if (existingCert) {
                return { success: true, alreadyCertified: true }
            }

            // Create certification
            const certificateId = `OS-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
            const expiresAt = new Date()
            expiresAt.setFullYear(expiresAt.getFullYear() + 2)

            await prisma.oSCertification.create({
                data: {
                    certificateId,
                    userId: session.user.id,
                    score: data.score,
                    expiresAt,
                    verificationUrl: `/opensource/verify/${certificateId}`
                }
            })

            // Update user stats
            await prisma.userOSStats.upsert({
                where: { userId: session.user.id },
                update: { isCertified: true },
                create: {
                    userId: session.user.id,
                    isCertified: true
                }
            })

            revalidatePath('/opensource')
            revalidatePath('/opensource/learn')
            
            return { success: true, passed: true, certificateId }
        }

        // Not passed - record attempt
        return { success: true, passed: false }
    } catch (error) {
        console.error('Error recording exam result:', error)
        return { success: false, error: 'Failed to record result' }
    }
}

// Get user certification status
export async function getUserCertificationStatus() {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: 'You must be logged in', isCertified: false }
        }

        const certification = await prisma.oSCertification.findFirst({
            where: {
                userId: session.user.id,
                isActive: true
            }
        })

        return { 
            success: true, 
            isCertified: !!certification,
            certification: certification || null
        }
    } catch (error) {
        console.error('Error fetching certification status:', error)
        return { success: false, error: 'Failed to fetch status', isCertified: false }
    }
}

// Verify certification
export async function verifyCertification(certificateId: string) {
    try {
        const certification = await prisma.oSCertification.findUnique({
            where: { certificateId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        image: true
                    }
                }
            }
        })

        if (!certification) {
            return { success: false, error: 'Certificate not found', isValid: false }
        }

        const isValid = certification.isActive && certification.expiresAt > new Date()

        return {
            success: true,
            isValid,
            certification: {
                ...certification,
                isExpired: certification.expiresAt < new Date()
            }
        }
    } catch (error) {
        console.error('Error verifying certification:', error)
        return { success: false, error: 'Failed to verify', isValid: false }
    }
}

// Get user's exam history
export async function getExamHistory() {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: 'You must be logged in', exams: [] }
        }

        const exams = await prisma.oSCertificationExam.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                status: true,
                totalScore: true,
                attemptNumber: true,
                startedAt: true,
                completedAt: true
            }
        })

        return { success: true, exams }
    } catch (error) {
        console.error('Error fetching exam history:', error)
        return { success: false, error: 'Failed to fetch history', exams: [] }
    }
}

// Get exam credit info
export async function getExamCreditInfo() {
    return {
        creditCost: EXAM_CREDIT_COST,
        refundInfo: 'Your score percentage will be returned as credits. E.g., 80% score = 20 credits returned.'
    }
}
