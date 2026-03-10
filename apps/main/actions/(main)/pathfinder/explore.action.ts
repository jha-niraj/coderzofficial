'use server'

import { auth } from '@repo/auth'
import { prisma } from '@repo/prisma'
import { revalidatePath } from 'next/cache'
import { Currency, Module } from '@repo/prisma/client'

// ================================================================================
// GET PUBLIC GOALS (for explore page)
// ================================================================================

export async function getPublicPathfinderGoals() {
    try {
        const goals = await prisma.pathfinderGoal.findMany({
            where: { isPublic: true },
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        image: true,
                    },
                },
                _count: {
                    select: {
                        dailySessions: true,
                        subGoals: true,
                    },
                },
            },
        })

        return { success: true, goals }
    } catch (error) {
        console.error('Error fetching public goals:', error)
        return { success: false, goals: [] }
    }
}

// ================================================================================
// GET PUBLIC GOAL BY ID/SLUG (for preview - no auth required)
// ================================================================================

export async function getPublicPathfinderGoalById(goalId: string) {
    try {
        const goal = await prisma.pathfinderGoal.findFirst({
            where: {
                id: goalId,
                isPublic: true,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        image: true,
                    },
                },
                dailySessions: {
                    orderBy: { date: 'asc' },
                    include: {
                        subGoals: {
                            orderBy: { order: 'asc' },
                            select: {
                                id: true,
                                title: true,
                                description: true,
                                status: true,
                                hasCoding: true,
                            },
                        },
                    },
                },
            },
        })

        if (!goal) return { success: false, goal: null }

        const subGoals = goal.dailySessions.flatMap((s) => s.subGoals)
        return {
            success: true,
            goal: {
                ...goal,
                subGoals,
            },
        }
    } catch (error) {
        console.error('Error fetching public goal:', error)
        return { success: false, goal: null }
    }
}

/** Fetch a public goal by slug (for explore URL). If multiple creators have same slug, returns first match. */
export async function getPublicPathfinderGoalBySlugOnly(slug: string) {
    try {
        const goal = await prisma.pathfinderGoal.findFirst({
            where: {
                slug,
                isPublic: true,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        image: true,
                    },
                },
                dailySessions: {
                    orderBy: { date: 'asc' },
                    include: {
                        subGoals: {
                            orderBy: { order: 'asc' },
                            select: {
                                id: true,
                                title: true,
                                description: true,
                                status: true,
                                hasCoding: true,
                                isAIGenerated: true,
                            },
                        },
                    },
                },
            },
        })

        if (!goal) return { success: false, goal: null }

        const subGoals = goal.dailySessions.flatMap((s) => s.subGoals)
        return {
            success: true,
            goal: {
                ...goal,
                subGoals,
            },
        }
    } catch (error) {
        console.error('Error fetching public goal by slug:', error)
        return { success: false, goal: null }
    }
}

export async function getPublicPathfinderGoalBySlug(slug: string, creatorId: string) {
    try {
        const goal = await prisma.pathfinderGoal.findFirst({
            where: {
                slug,
                userId: creatorId,
                isPublic: true,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        image: true,
                    },
                },
                dailySessions: {
                    orderBy: { date: 'asc' },
                    include: {
                        subGoals: {
                            orderBy: { order: 'asc' },
                            select: {
                                id: true,
                                title: true,
                                description: true,
                                status: true,
                                hasCoding: true,
                            },
                        },
                    },
                },
            },
        })

        if (!goal) return { success: false, goal: null }

        const subGoals = goal.dailySessions.flatMap((s) => s.subGoals)
        return {
            success: true,
            goal: {
                ...goal,
                subGoals,
            },
        }
    } catch (error) {
        console.error('Error fetching public goal:', error)
        return { success: false, goal: null }
    }
}

// ================================================================================
// COPY/FORK GOAL (free or paid)
// ================================================================================

export async function copyPathfinderGoal(goalId: string) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: 'Unauthorized', slug: null }
        }

        const source = await prisma.pathfinderGoal.findFirst({
            where: { id: goalId, isPublic: true },
            include: {
                dailySessions: {
                    orderBy: { date: 'asc' },
                    include: {
                        subGoals: {
                            orderBy: { order: 'asc' },
                        },
                    },
                },
            },
        })

        if (!source) {
            return { success: false, error: 'Goal not found or not public', slug: null }
        }

        if (source.userId === session.user.id) {
            return { success: false, error: "You can't copy your own goal", slug: null }
        }

        const price = source.creditPrice ?? 0

        if (price > 0) {
            const user = await prisma.user.findUnique({
                where: { id: session.user.id },
                select: { credits: true },
            })
            if (!user || user.credits < price) {
                return {
                    success: false,
                    error: `Insufficient credits. This goal costs ${price} credits.`,
                    code: 'INSUFFICIENT_CREDITS',
                    required: price,
                    available: user?.credits ?? 0,
                    slug: null,
                }
            }
        }

        const slug = await (async () => {
            const base = source.slug
            let s = base
            let i = 0
            while (true) {
                const exists = await prisma.pathfinderGoal.findUnique({
                    where: {
                        userId_slug: { userId: session.user!.id!, slug: s },
                    },
                })
                if (!exists) return s
                i++
                s = `${base}-${i}`
            }
        })()

        const result = await prisma.$transaction(async (tx) => {
            const newGoal = await tx.pathfinderGoal.create({
                data: {
                    userId: session.user!.id!,
                    title: source.title,
                    slug,
                    category: source.category,
                    level: source.level,
                    focusAreas: source.focusAreas,
                    targetDate: source.targetDate,
                    duration: source.duration,
                    estimatedDays: source.estimatedDays,
                    overview: source.overview,
                    learningObjectives: source.learningObjectives,
                    prerequisites: source.prerequisites,
                    isPublic: false,
                    forkedFromId: source.id,
                    status: 'ACTIVE',
                    startedAt: new Date(),
                },
            })

            await tx.pathfinderVerification.create({
                data: {
                    goalId: newGoal.id,
                    quizStatus: 'PENDING',
                    codingStatus: 'LOCKED',
                    mockStatus: 'LOCKED',
                    projectStatus: 'PENDING',
                },
            })

            for (const ds of source.dailySessions) {
                const newSession = await tx.pathfinderDailySession.create({
                    data: {
                        goalId: newGoal.id,
                        userId: session.user!.id!,
                        date: ds.date,
                        totalSubGoals: ds.totalSubGoals,
                        totalQuizQuestions: ds.totalQuizQuestions,
                        totalCodingProblems: ds.totalCodingProblems,
                    },
                })
                for (const sg of ds.subGoals) {
                    await tx.pathfinderSubGoal.create({
                        data: {
                            goalId: newGoal.id,
                            sessionId: newSession.id,
                            title: sg.title,
                            description: sg.description,
                            source: sg.source,
                            order: sg.order,
                            hasCoding: sg.hasCoding,
                            status: 'PENDING',
                        },
                    })
                }
            }

            if (price > 0) {
                await tx.user.update({
                    where: { id: session.user!.id! },
                    data: { credits: { decrement: price } },
                })
                const buyerTx = await tx.creditTransaction.create({
                    data: {
                        userId: session.user!.id!,
                        amount: -price,
                        type: 'SPEND',
                        description: `Pathfinder: Copy "${source.title}" from creator`,
                        currency: Currency.INR,
                    },
                })
                await tx.subTransaction.create({
                    data: {
                        creditTransactionId: buyerTx.id,
                        module: Module.PATHFINDER,
                        referenceId: source.id,
                        metadata: {
                            goalTitle: source.title,
                            creatorId: source.userId,
                            buyerId: session.user!.id!,
                        },
                    },
                })

                await tx.user.update({
                    where: { id: source.userId },
                    data: { credits: { increment: price } },
                })
                const creatorTx = await tx.creditTransaction.create({
                    data: {
                        userId: source.userId,
                        amount: price,
                        type: 'REWARD',
                        description: `Pathfinder: Sale of goal "${source.title}"`,
                        currency: Currency.INR,
                    },
                })
                await tx.subTransaction.create({
                    data: {
                        creditTransactionId: creatorTx.id,
                        module: Module.PATHFINDER,
                        referenceId: source.id,
                        metadata: {
                            goalTitle: source.title,
                            buyerId: session.user!.id!,
                        },
                    },
                })

                await tx.earning.create({
                    data: {
                        userId: source.userId,
                        module: Module.PATHFINDER,
                        referenceId: source.id,
                        amount: price,
                        sourceUserId: session.user!.id!,
                    },
                })

                await tx.pathfinderGoalPurchase.create({
                    data: {
                        goalId: source.id,
                        buyerId: session.user!.id!,
                        creditsPaid: price,
                    },
                })
            }

            return newGoal
        })

        revalidatePath('/pathfinder')
        revalidatePath('/pathfinder/explore')
        return { success: true, slug: result.slug, goalId: result.id }
    } catch (error) {
        console.error('Error copying goal:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to copy goal',
            slug: null,
        }
    }
}
