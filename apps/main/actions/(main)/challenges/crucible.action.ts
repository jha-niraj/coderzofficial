'use server'

import { prisma } from '@repo/prisma'
import { getServerSession } from '@repo/auth'
import { authOptions } from '@repo/auth'
import { revalidatePath } from 'next/cache'
import { CrucibleEventStatus } from '@repo/prisma/client'
import crypto from 'crypto'

// ===============================================
// GET ACTIONS
// ===============================================

export async function getAllCrucibleEvents(options?: {
    status?: CrucibleEventStatus
    eventType?: string
}) {
    try {
        const events = await prisma.crucibleEvent.findMany({
            where: {
                ...(options?.status && { status: options.status }),
                ...(options?.eventType && { eventType: options.eventType }),
            },
            include: {
                _count: {
                    select: {
                        problems: true,
                        participations: true,
                    }
                }
            },
            orderBy: [
                { status: 'asc' },
                { startsAt: 'desc' }
            ]
        })

        return { success: true, data: events }
    } catch (error) {
        console.error('Error fetching crucible events:', error)
        return { success: false, error: 'Failed to fetch events' }
    }
}

export async function getCrucibleEventBySlug(slug: string) {
    try {
        const session = await getServerSession(authOptions)

        const event = await prisma.crucibleEvent.findUnique({
            where: { slug },
            include: {
                problems: {
                    orderBy: { dayNumber: 'asc' },
                    include: {
                        learningModules: {
                            orderBy: { sortOrder: 'asc' }
                        },
                        _count: {
                            select: {
                                submissions: { where: { isCorrect: true } }
                            }
                        }
                    }
                },
                _count: {
                    select: {
                        participations: true,
                        problems: true,
                    }
                }
            }
        })

        if (!event) {
            return { success: false, error: 'Event not found' }
        }

        // Get user participation if logged in
        let participation = null
        let problemProgress: Record<string, any> = {}

        if (session?.user?.id) {
            participation = await prisma.crucibleParticipation.findUnique({
                where: {
                    userId_eventId: {
                        userId: session.user.id,
                        eventId: event.id
                    }
                }
            })

            // Get user's submissions
            const submissions = await prisma.crucibleSubmission.findMany({
                where: {
                    userId: session.user.id,
                    problem: { eventId: event.id },
                    isCorrect: true
                }
            })

            submissions.forEach(sub => {
                problemProgress[sub.problemId] = { solved: true, xpEarned: sub.xpEarned }
            })
        }

        return {
            success: true,
            data: event,
            participation,
            problemProgress
        }
    } catch (error) {
        console.error('Error fetching crucible event:', error)
        return { success: false, error: 'Failed to fetch event' }
    }
}

export async function getCrucibleProblem(eventSlug: string, dayNumber: number) {
    try {
        const session = await getServerSession(authOptions)

        const event = await prisma.crucibleEvent.findUnique({
            where: { slug: eventSlug },
            select: { id: true, name: true, slug: true, themeColor: true }
        })

        if (!event) {
            return { success: false, error: 'Event not found' }
        }

        const problem = await prisma.crucibleProblem.findUnique({
            where: {
                eventId_dayNumber: {
                    eventId: event.id,
                    dayNumber
                }
            },
            include: {
                learningModules: {
                    orderBy: { sortOrder: 'asc' }
                }
            }
        })

        if (!problem) {
            return { success: false, error: 'Problem not found' }
        }

        // Check if problem is locked
        if (problem.isLocked && problem.unlocksAt && new Date() < problem.unlocksAt) {
            return { success: false, error: 'Problem is locked', unlocksAt: problem.unlocksAt }
        }

        // Get user's input and submissions
        let userInput = null
        let submissions: any[] = []
        let isSolved = false

        if (session?.user?.id) {
            // Check if user has participated
            let participation = await prisma.crucibleParticipation.findUnique({
                where: {
                    userId_eventId: {
                        userId: session.user.id,
                        eventId: event.id
                    }
                }
            })

            // Auto-join if free event
            if (!participation) {
                participation = await prisma.crucibleParticipation.create({
                    data: {
                        userId: session.user.id,
                        eventId: event.id
                    }
                })

                await prisma.crucibleEvent.update({
                    where: { id: event.id },
                    data: { totalParticipants: { increment: 1 } }
                })
            }

            // Get or generate user input
            userInput = await prisma.crucibleUserInput.findUnique({
                where: {
                    userId_problemId: {
                        userId: session.user.id,
                        problemId: problem.id
                    }
                }
            })

            if (!userInput && problem.inputTemplate) {
                // Generate unique input for user
                const { inputData, expectedAnswer } = generateUserInput(
                    problem.inputTemplate,
                    session.user.id,
                    problem.id
                )

                userInput = await prisma.crucibleUserInput.create({
                    data: {
                        userId: session.user.id,
                        problemId: problem.id,
                        inputData,
                        expectedAnswer
                    }
                })
            }

            submissions = await prisma.crucibleSubmission.findMany({
                where: {
                    userId: session.user.id,
                    problemId: problem.id
                },
                orderBy: { submittedAt: 'desc' },
                take: 10
            })

            isSolved = submissions.some(s => s.isCorrect)
        }

        return {
            success: true,
            data: problem,
            event,
            userInput,
            submissions,
            isSolved
        }
    } catch (error) {
        console.error('Error fetching crucible problem:', error)
        return { success: false, error: 'Failed to fetch problem' }
    }
}

// ===============================================
// INPUT GENERATION
// ===============================================

function generateUserInput(template: string, userId: string, problemId: string): {
    inputData: string
    expectedAnswer: string
} {
    // Create deterministic seed from userId and problemId
    const seed = crypto.createHash('md5').update(`${userId}-${problemId}`).digest('hex')
    const seedNum = parseInt(seed.substring(0, 8), 16)

    // Simple seeded random function
    let currentSeed = seedNum
    const seededRandom = () => {
        currentSeed = (currentSeed * 1103515245 + 12345) & 0x7fffffff
        return currentSeed / 0x7fffffff
    }

    // Parse template and generate input
    // Template format: JSON with generation rules
    try {
        const rules = JSON.parse(template)

        if (rules.type === 'dial_rotations') {
            // Generate dial rotation problem (like the example)
            const numRotations = rules.count || 100
            const rotations: string[] = []
            let position = rules.startPosition || 50
            let zeroCount = 0

            for (let i = 0; i < numRotations; i++) {
                const direction = seededRandom() > 0.5 ? 'L' : 'R'
                const distance = Math.floor(seededRandom() * 99) + 1
                rotations.push(`${direction}${distance}`)

                if (direction === 'L') {
                    position = ((position - distance) % 100 + 100) % 100
                } else {
                    position = (position + distance) % 100
                }

                if (position === 0) {
                    zeroCount++
                }
            }

            return {
                inputData: rotations.join('\n'),
                expectedAnswer: zeroCount.toString()
            }
        }

        // Default: return template as-is with a placeholder answer
        return {
            inputData: template,
            expectedAnswer: '0'
        }
    } catch {
        return {
            inputData: template,
            expectedAnswer: '0'
        }
    }
}

export async function getUserCrucibleInput(problemId: string) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return { success: false, error: 'Not authenticated' }
        }

        const userInput = await prisma.crucibleUserInput.findUnique({
            where: {
                userId_problemId: {
                    userId: session.user.id,
                    problemId
                }
            }
        })

        if (!userInput) {
            // Generate input if not exists
            const problem = await prisma.crucibleProblem.findUnique({
                where: { id: problemId }
            })

            if (!problem || !problem.inputTemplate) {
                return { success: false, error: 'Problem not found' }
            }

            const { inputData, expectedAnswer } = generateUserInput(
                problem.inputTemplate,
                session.user.id,
                problemId
            )

            const newInput = await prisma.crucibleUserInput.create({
                data: {
                    userId: session.user.id,
                    problemId,
                    inputData,
                    expectedAnswer
                }
            })

            return { success: true, data: newInput.inputData }
        }

        return { success: true, data: userInput.inputData }
    } catch (error) {
        console.error('Error getting user input:', error)
        return { success: false, error: 'Failed to get input' }
    }
}

// ===============================================
// SUBMISSION
// ===============================================

export async function submitCrucibleAnswer(problemId: string, answer: string) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return { success: false, error: 'Not authenticated' }
        }

        const problem = await prisma.crucibleProblem.findUnique({
            where: { id: problemId },
            include: { event: true }
        })

        if (!problem) {
            return { success: false, error: 'Problem not found' }
        }

        // Get user's expected answer
        const userInput = await prisma.crucibleUserInput.findUnique({
            where: {
                userId_problemId: {
                    userId: session.user.id,
                    problemId
                }
            }
        })

        if (!userInput) {
            return { success: false, error: 'No input generated for this problem' }
        }

        // Check if already solved
        const existingSolve = await prisma.crucibleSubmission.findFirst({
            where: {
                userId: session.user.id,
                problemId,
                isCorrect: true
            }
        })

        if (existingSolve) {
            return { success: false, error: 'Already solved!', alreadySolved: true }
        }

        // Get attempt count
        const attemptCount = await prisma.crucibleSubmission.count({
            where: {
                userId: session.user.id,
                problemId
            }
        })

        // Check answer
        const isCorrect = answer.trim() === userInput.expectedAnswer.trim()
        const xpEarned = isCorrect ? problem.xpReward : 0

        // Create submission
        const submission = await prisma.crucibleSubmission.create({
            data: {
                userId: session.user.id,
                problemId,
                answer: answer.trim(),
                isCorrect,
                attemptNumber: attemptCount + 1,
                xpEarned
            }
        })

        if (isCorrect) {
            // Update problem stats
            await prisma.crucibleProblem.update({
                where: { id: problemId },
                data: {
                    solveCount: { increment: 1 },
                    attemptCount: { increment: 1 }
                }
            })

            // Update participation
            await prisma.crucibleParticipation.update({
                where: {
                    userId_eventId: {
                        userId: session.user.id,
                        eventId: problem.eventId
                    }
                },
                data: {
                    problemsSolved: { increment: 1 },
                    totalXpEarned: { increment: xpEarned },
                    currentStreak: { increment: 1 },
                    lastActivityAt: new Date()
                }
            })

            // Update user XP
            await prisma.user.update({
                where: { id: session.user.id },
                data: {
                    currentXp: { increment: xpEarned },
                    totalXp: { increment: xpEarned }
                }
            })

            // Update leaderboard
            await prisma.crucibleLeaderboard.upsert({
                where: {
                    userId_eventId: {
                        userId: session.user.id,
                        eventId: problem.eventId
                    }
                },
                create: {
                    userId: session.user.id,
                    eventId: problem.eventId,
                    problemsSolved: 1,
                    totalXp: xpEarned
                },
                update: {
                    problemsSolved: { increment: 1 },
                    totalXp: { increment: xpEarned }
                }
            })
        } else {
            // Just increment attempt count
            await prisma.crucibleProblem.update({
                where: { id: problemId },
                data: { attemptCount: { increment: 1 } }
            })
        }

        revalidatePath(`/challenges/crucible/${problem.event.slug}`)

        return {
            success: true,
            data: submission,
            isCorrect,
            xpEarned,
            message: isCorrect ? '🎉 Correct! Well done!' : 'Incorrect. Try again!'
        }
    } catch (error) {
        console.error('Error submitting crucible answer:', error)
        return { success: false, error: 'Failed to submit answer' }
    }
}

// ===============================================
// LEADERBOARD
// ===============================================

export async function getCrucibleLeaderboard(eventId: string, limit: number = 50) {
    try {
        const leaderboard = await prisma.crucibleLeaderboard.findMany({
            where: { eventId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        image: true
                    }
                }
            },
            orderBy: [
                { problemsSolved: 'desc' },
                { totalXp: 'desc' },
                { totalSolveTime: 'asc' }
            ],
            take: limit
        })

        // Add ranks
        const rankedLeaderboard = leaderboard.map((entry, index) => ({
            ...entry,
            rank: index + 1
        }))

        return { success: true, data: rankedLeaderboard }
    } catch (error) {
        console.error('Error fetching leaderboard:', error)
        return { success: false, error: 'Failed to fetch leaderboard' }
    }
}

// ===============================================
// HINTS
// ===============================================

export async function revealCrucibleHint(problemId: string, hintIndex: number) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return { success: false, error: 'Not authenticated' }
        }

        const problem = await prisma.crucibleProblem.findUnique({
            where: { id: problemId }
        })

        if (!problem || !problem.hints) {
            return { success: false, error: 'Problem or hints not found' }
        }

        const hints = problem.hints as Array<{ text: string; xpCost?: number }>
        if (hintIndex >= hints.length) {
            return { success: false, error: 'Invalid hint index' }
        }

        const hint = hints[hintIndex]

        // Deduct XP if hint has cost
        if (hint?.xpCost && hint.xpCost > 0) {
            await prisma.user.update({
                where: { id: session.user.id },
                data: {
                    currentXp: { decrement: hint.xpCost }
                }
            })
        }

        return {
            success: true,
            data: { text: hint?.text, xpCost: hint?.xpCost || 0 }
        }
    } catch (error) {
        console.error('Error using crucible hint:', error)
        return { success: false, error: 'Failed to get hint' }
    }
}


