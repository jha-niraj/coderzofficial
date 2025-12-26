'use server'

import { prisma } from '@repo/prisma'
import { getServerSession } from '@repo/auth'
import { authOptions } from '@repo/auth'
import { revalidatePath } from 'next/cache'
import {
    ChallengeTrackLevel, ChallengeTrackStatus, Currency, CreditType, StepSubmissionStatus
} from '@repo/prisma/client'

// ===============================================
// GET ACTIONS
// ===============================================

export async function getAllForgeTracks(options?: {
    status?: ChallengeTrackStatus
    level?: ChallengeTrackLevel
    technology?: string
}) {
    try {
        const tracks = await prisma.forgeTrack.findMany({
            where: {
                status: options?.status || 'PUBLISHED',
                ...(options?.level && { level: options.level }),
                ...(options?.technology && { technology: options.technology }),
            },
            include: {
                _count: {
                    select: {
                        steps: true,
                        enrollments: true,
                        completions: true,
                    }
                }
            },
            orderBy: { sortOrder: 'asc' }
        })

        return { success: true, data: tracks }
    } catch (error) {
        console.error('Error fetching forge tracks:', error)
        return { success: false, error: 'Failed to fetch tracks' }
    }
}

export async function getForgeTrackBySlug(slug: string) {
    try {
        const session = await getServerSession(authOptions)

        const track = await prisma.forgeTrack.findUnique({
            where: { slug },
            include: {
                steps: {
                    where: { isPublished: true },
                    orderBy: { stepNumber: 'asc' },
                    include: {
                        learningModules: {
                            orderBy: { sortOrder: 'asc' }
                        }
                    }
                },
                _count: {
                    select: {
                        steps: true,
                        enrollments: true,
                        completions: true,
                    }
                }
            }
        })

        if (!track) {
            return { success: false, error: 'Track not found' }
        }

        // Get user enrollment if logged in
        let enrollment = null
        let stepProgress: Record<string, any> = {}

        if (session?.user?.id) {
            enrollment = await prisma.forgeEnrollment.findUnique({
                where: {
                    userId_trackId: {
                        userId: session.user.id,
                        trackId: track.id
                    }
                }
            })

            // Get user's step submissions
            const submissions = await prisma.forgeStepSubmission.findMany({
                where: {
                    userId: session.user.id,
                    step: { trackId: track.id }
                },
                orderBy: { submittedAt: 'desc' }
            })

            // Group by stepId
            submissions.forEach(sub => {
                if (!stepProgress[sub.stepId] || sub.submittedAt > stepProgress[sub.stepId].submittedAt) {
                    stepProgress[sub.stepId] = sub
                }
            })
        }

        return {
            success: true,
            data: track,
            enrollment,
            stepProgress
        }
    } catch (error) {
        console.error('Error fetching forge track:', error)
        return { success: false, error: 'Failed to fetch track' }
    }
}

export async function getForgeStep(trackSlug: string, stepNumber: number) {
    try {
        const session = await getServerSession(authOptions)

        const track = await prisma.forgeTrack.findUnique({
            where: { slug: trackSlug },
            select: { id: true }
        })

        if (!track) {
            return { success: false, error: 'Track not found' }
        }

        const step = await prisma.forgeStep.findUnique({
            where: {
                trackId_stepNumber: {
                    trackId: track.id,
                    stepNumber
                }
            },
            include: {
                track: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        themeColor: true,
                        creditsRequired: true,
                        isFree: true,
                    }
                },
                learningModules: {
                    orderBy: { sortOrder: 'asc' }
                }
            }
        })

        if (!step) {
            return { success: false, error: 'Step not found' }
        }

        // Get user's submissions for this step
        let submissions: any[] = []
        let enrollment = null

        if (session?.user?.id) {
            enrollment = await prisma.forgeEnrollment.findUnique({
                where: {
                    userId_trackId: {
                        userId: session.user.id,
                        trackId: track.id
                    }
                }
            })

            submissions = await prisma.forgeStepSubmission.findMany({
                where: {
                    userId: session.user.id,
                    stepId: step.id
                },
                orderBy: { submittedAt: 'desc' }
            })
        }

        return {
            success: true,
            data: step,
            submissions,
            enrollment,
            isEnrolled: !!enrollment
        }
    } catch (error) {
        console.error('Error fetching forge step:', error)
        return { success: false, error: 'Failed to fetch step' }
    }
}

export async function getUserForgeProgress() {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return { success: false, error: 'Not authenticated' }
        }

        const enrollments = await prisma.forgeEnrollment.findMany({
            where: { userId: session.user.id },
            include: {
                track: {
                    include: {
                        _count: {
                            select: { steps: true }
                        }
                    }
                }
            },
            orderBy: { lastActivityAt: 'desc' }
        })

        const completions = await prisma.forgeCompletion.findMany({
            where: { userId: session.user.id },
            include: {
                track: true
            }
        })

        return {
            success: true,
            data: { enrollments, completions }
        }
    } catch (error) {
        console.error('Error fetching user forge progress:', error)
        return { success: false, error: 'Failed to fetch progress' }
    }
}

// ===============================================
// ENROLLMENT & PAYMENT
// ===============================================

export async function enrollInForgeTrack(trackId: string) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return { success: false, error: 'Not authenticated' }
        }

        const track = await prisma.forgeTrack.findUnique({
            where: { id: trackId }
        })

        if (!track) {
            return { success: false, error: 'Track not found' }
        }

        // Check if already enrolled
        const existingEnrollment = await prisma.forgeEnrollment.findUnique({
            where: {
                userId_trackId: {
                    userId: session.user.id,
                    trackId
                }
            }
        })

        if (existingEnrollment) {
            return { success: true, data: existingEnrollment, message: 'Already enrolled' }
        }

        // Check credits if not free
        if (!track.isFree) {
            const user = await prisma.user.findUnique({
                where: { id: session.user.id },
                select: { credits: true }
            })

            if (!user || user.credits < track.creditsRequired) {
                return { success: false, error: 'Insufficient credits' }
            }

            // Deduct credits
            await prisma.$transaction([
                prisma.user.update({
                    where: { id: session.user.id },
                    data: { credits: { decrement: track.creditsRequired } }
                }),
                prisma.creditTransaction.create({
                    data: {
                        userId: session.user.id,
                        amount: -track.creditsRequired,
                        type: CreditType.SPEND,
                        currency: Currency.INR,
                        description: `Enrolled in ${track.name}`,
                    }
                })
            ])
        }

        // Create enrollment
        const enrollment = await prisma.forgeEnrollment.create({
            data: {
                userId: session.user.id,
                trackId
            }
        })

        // Update track stats
        await prisma.forgeTrack.update({
            where: { id: trackId },
            data: { enrollmentCount: { increment: 1 } }
        })

        revalidatePath(`/challenges/forge/${track.slug}`)

        return { success: true, data: enrollment }
    } catch (error) {
        console.error('Error enrolling in forge track:', error)
        return { success: false, error: 'Failed to enroll' }
    }
}

// ===============================================
// STEP SUBMISSION
// ===============================================

export async function submitForgeStep(stepId: string, submission: string) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return { success: false, error: 'Not authenticated' }
        }

        const step = await prisma.forgeStep.findUnique({
            where: { id: stepId },
            include: { track: true }
        })

        if (!step) {
            return { success: false, error: 'Step not found' }
        }

        // Check enrollment
        const enrollment = await prisma.forgeEnrollment.findUnique({
            where: {
                userId_trackId: {
                    userId: session.user.id,
                    trackId: step.trackId
                }
            }
        })

        if (!enrollment) {
            return { success: false, error: 'Not enrolled in this track' }
        }

        // Get attempt count
        const previousAttempts = await prisma.forgeStepSubmission.count({
            where: {
                userId: session.user.id,
                stepId
            }
        })

        // Validate submission based on type
        let isCorrect = false
        let feedback = ''
        let validationDetails: any = {}

        if (step.deliverableType === 'TEXT' && step.expectedAnswer) {
            isCorrect = submission.trim().toLowerCase() === step.expectedAnswer.trim().toLowerCase()
            feedback = isCorrect ? 'Correct answer!' : 'Incorrect answer. Try again.'
        } else if (step.deliverableType === 'URL') {
            // For URLs, we'll mark as pending for manual/automated review
            isCorrect = true // Auto-accept URLs for now
            feedback = 'URL submitted successfully!'
            validationDetails = { url: submission }
        } else if (step.deliverableType === 'CODE') {
            // Code submissions would need more complex validation
            isCorrect = true
            feedback = 'Code submitted for review.'
        }

        const status: StepSubmissionStatus = isCorrect ? 'CORRECT' : 'INCORRECT'
        const xpEarned = isCorrect ? step.xpReward : 0

        // Create submission
        const submissionRecord = await prisma.forgeStepSubmission.create({
            data: {
                userId: session.user.id,
                stepId,
                submission,
                status,
                feedback,
                validationDetails,
                xpEarned,
                attemptNumber: previousAttempts + 1
            }
        })

        // If correct, update enrollment progress
        if (isCorrect) {
            const totalSteps = await prisma.forgeStep.count({
                where: { trackId: step.trackId, isPublished: true }
            })

            const completedSteps = await prisma.forgeStepSubmission.findMany({
                where: {
                    userId: session.user.id,
                    step: { trackId: step.trackId },
                    status: 'CORRECT'
                },
                distinct: ['stepId']
            })

            const isTrackComplete = completedSteps.length >= totalSteps

            await prisma.forgeEnrollment.update({
                where: {
                    userId_trackId: {
                        userId: session.user.id,
                        trackId: step.trackId
                    }
                },
                data: {
                    currentStepNumber: Math.max(enrollment.currentStepNumber, step.stepNumber + 1),
                    completedSteps: completedSteps.length,
                    totalXpEarned: { increment: xpEarned },
                    lastActivityAt: new Date(),
                    ...(isTrackComplete && { isCompleted: true, completedAt: new Date() })
                }
            })

            // Add XP to user
            await prisma.user.update({
                where: { id: session.user.id },
                data: {
                    currentXp: { increment: xpEarned },
                    totalXp: { increment: xpEarned }
                }
            })

            // If track complete, create completion record
            if (isTrackComplete) {
                const existingCompletion = await prisma.forgeCompletion.findUnique({
                    where: {
                        userId_trackId: {
                            userId: session.user.id,
                            trackId: step.trackId
                        }
                    }
                })

                if (!existingCompletion) {
                    await prisma.forgeCompletion.create({
                        data: {
                            userId: session.user.id,
                            trackId: step.trackId,
                            totalXpEarned: enrollment.totalXpEarned + xpEarned
                        }
                    })

                    await prisma.forgeTrack.update({
                        where: { id: step.trackId },
                        data: { completionCount: { increment: 1 } }
                    })
                }
            }
        }

        revalidatePath(`/challenges/forge/${step.track.slug}`)

        return {
            success: true,
            data: submissionRecord,
            isCorrect,
            feedback,
            xpEarned
        }
    } catch (error) {
        console.error('Error submitting forge step:', error)
        return { success: false, error: 'Failed to submit' }
    }
}

// ===============================================
// HINTS
// ===============================================

export async function revealForgeHint(stepId: string, hintIndex: number) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return { success: false, error: 'Not authenticated' }
        }

        const step = await prisma.forgeStep.findUnique({
            where: { id: stepId }
        })

        if (!step || !step.hints) {
            return { success: false, error: 'Step or hints not found' }
        }

        const hints = step.hints as Array<{ text: string; xpCost: number }>
        if (hintIndex >= hints.length) {
            return { success: false, error: 'Invalid hint index' }
        }

        const hint = hints[hintIndex]

        // Deduct XP if hint has cost
        if (hint?.xpCost && hint.xpCost > 0) {
            await prisma.user.update({
                where: { id: session.user.id },
                data: {
                    currentXp: { decrement: hint?.xpCost || 0 }
                }
            })
        }

        return {
            success: true,
            data: { text: hint?.text, xpCost: hint?.xpCost || 0 }
        }
    } catch (error) {
        console.error('Error using forge hint:', error)
        return { success: false, error: 'Failed to get hint' }
    }
}


