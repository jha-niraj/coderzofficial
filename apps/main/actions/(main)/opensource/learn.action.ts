'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

// ==========================================
// LEARNING MODULE ACTIONS
// ==========================================

// Get all learning modules
export async function getLearnModules() {
    try {
        const session = await auth()
        
        const modules = await prisma.oSLearnModule.findMany({
            where: { isActive: true },
            orderBy: { orderIndex: 'asc' },
            include: {
                lessons: {
                    orderBy: { orderIndex: 'asc' },
                    select: {
                        id: true,
                        title: true,
                        type: true,
                        estimatedMinutes: true
                    }
                },
                _count: {
                    select: { lessons: true }
                }
            }
        })

        // Ensure modules is always an array
        if (!modules || !Array.isArray(modules)) {
            return {
                success: true,
                modules: []
            }
        }

        // Get user progress if logged in
        let userProgress: Record<string, any> = {}
        if (session?.user?.id) {
            const progress = await prisma.oSLearnProgress.findMany({
                where: { userId: session.user.id }
            })
            if (progress && Array.isArray(progress)) {
                userProgress = progress.reduce((acc, p) => {
                    acc[p.moduleId] = p
                    return acc
                }, {} as Record<string, any>)
            }
        }

        return {
            success: true,
            modules: modules.map(m => ({
                ...m,
                userProgress: userProgress[m.id] || null
            }))
        }
    } catch (error) {
        console.error('Error fetching learn modules:', error)
        return {
            success: false,
            error: 'Failed to fetch modules',
            modules: []
        }
    }
}

// Get single module with lessons
export async function getLearnModule(slug: string) {
    try {
        const session = await auth()

        const module = await prisma.oSLearnModule.findUnique({
            where: { slug },
            include: {
                lessons: {
                    orderBy: { orderIndex: 'asc' }
                }
            }
        })

        if (!module) {
            return { success: false, error: 'Module not found' }
        }

        // Get user progress
        let userProgress = null
        let lessonCompletions: Record<string, any> = {}
        
        if (session?.user?.id) {
            userProgress = await prisma.oSLearnProgress.findUnique({
                where: {
                    userId_moduleId: {
                        userId: session.user.id,
                        moduleId: module.id
                    }
                }
            })

            const completions = await prisma.oSLessonCompletion.findMany({
                where: {
                    userId: session.user.id,
                    lessonId: { in: module.lessons.map(l => l.id) }
                }
            })

            lessonCompletions = completions.reduce((acc, c) => {
                acc[c.lessonId] = c
                return acc
            }, {} as Record<string, any>)
        }

        return {
            success: true,
            module: {
                ...module,
                userProgress,
                lessons: module.lessons.map(l => ({
                    ...l,
                    completion: lessonCompletions[l.id] || null
                }))
            }
        }
    } catch (error) {
        console.error('Error fetching module:', error)
        return { success: false, error: 'Failed to fetch module' }
    }
}

// Get single lesson
export async function getLesson(lessonId: string) {
    try {
        const session = await auth()

        const lesson = await prisma.oSLearnLesson.findUnique({
            where: { id: lessonId },
            include: {
                module: {
                    select: {
                        id: true,
                        slug: true,
                        title: true
                    }
                }
            }
        })

        if (!lesson) {
            return { success: false, error: 'Lesson not found' }
        }

        // Get user completion status
        let completion = null
        if (session?.user?.id) {
            completion = await prisma.oSLessonCompletion.findUnique({
                where: {
                    userId_lessonId: {
                        userId: session.user.id,
                        lessonId
                    }
                }
            })
        }

        return {
            success: true,
            lesson: { ...lesson, completion }
        }
    } catch (error) {
        console.error('Error fetching lesson:', error)
        return { success: false, error: 'Failed to fetch lesson' }
    }
}

// Complete a lesson
export async function completeLesson(lessonId: string, data?: {
    score?: number
    timeSpent?: number
    commandsRun?: any
}) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: 'You must be logged in' }
        }

        const lesson = await prisma.oSLearnLesson.findUnique({
            where: { id: lessonId },
            include: { module: true }
        })

        if (!lesson) {
            return { success: false, error: 'Lesson not found' }
        }

        // For quiz lessons, check if passing score
        if (lesson.type === 'QUIZ' && data?.score !== undefined) {
            if (data.score < lesson.passingScore) {
                return { 
                    success: false, 
                    error: `You need ${lesson.passingScore}% to pass`,
                    score: data.score 
                }
            }
        }

        // Record lesson completion
        await prisma.oSLessonCompletion.upsert({
            where: {
                userId_lessonId: {
                    userId: session.user.id,
                    lessonId
                }
            },
            create: {
                userId: session.user.id,
                lessonId,
                score: data?.score,
                timeSpent: data?.timeSpent || 0,
                commandsRun: data?.commandsRun,
                isCompleted: true,
                completedAt: new Date()
            },
            update: {
                score: data?.score,
                timeSpent: data?.timeSpent || 0,
                commandsRun: data?.commandsRun,
                isCompleted: true,
                completedAt: new Date()
            }
        })

        // Update module progress
        const totalLessons = await prisma.oSLearnLesson.count({
            where: { moduleId: lesson.moduleId }
        })

        const completedLessons = await prisma.oSLessonCompletion.count({
            where: {
                userId: session.user.id,
                isCompleted: true,
                lesson: { moduleId: lesson.moduleId }
            }
        })

        const progressPercent = (completedLessons / totalLessons) * 100
        const isCompleted = completedLessons >= totalLessons

        await prisma.oSLearnProgress.upsert({
            where: {
                userId_moduleId: {
                    userId: session.user.id,
                    moduleId: lesson.moduleId
                }
            },
            create: {
                userId: session.user.id,
                moduleId: lesson.moduleId,
                lessonsCompleted: completedLessons,
                totalLessons,
                progressPercent,
                isCompleted,
                completedAt: isCompleted ? new Date() : null
            },
            update: {
                lessonsCompleted: completedLessons,
                totalLessons,
                progressPercent,
                isCompleted,
                completedAt: isCompleted ? new Date() : null
            }
        })

        // Update user OS stats
        if (isCompleted) {
            await prisma.userOSStats.upsert({
                where: { userId: session.user.id },
                create: {
                    userId: session.user.id,
                    modulesCompleted: 1,
                    lessonsCompleted: completedLessons
                },
                update: {
                    modulesCompleted: { increment: 1 },
                    lessonsCompleted: { increment: 1 }
                }
            })
        }

        revalidatePath(`/opensource/learn/${lesson.module.slug}`)

        return { 
            success: true, 
            isModuleComplete: isCompleted,
            progressPercent 
        }
    } catch (error) {
        console.error('Error completing lesson:', error)
        return { success: false, error: 'Failed to complete lesson' }
    }
}

// Get user's learning progress for all modules
export async function getLearningProgress() {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: 'You must be logged in', data: [] }
        }

        // Get module progress
        const moduleProgress = await prisma.oSLearnProgress.findMany({
            where: { userId: session.user.id },
            include: {
                module: {
                    select: {
                        id: true,
                        slug: true,
                        title: true,
                        _count: {
                            select: { lessons: true }
                        }
                    }
                }
            },
            orderBy: { updatedAt: 'desc' }
        })

        // Get lesson completions
        const lessonCompletions = await prisma.oSLessonCompletion.findMany({
            where: { userId: session.user.id },
            select: {
                lessonId: true,
                isCompleted: true,
                score: true
            }
        })

        // Transform to expected format
        const progress = moduleProgress.map(p => ({
            moduleId: p.module.slug,
            completedLessons: p.lessonsCompleted,
            totalLessons: p.totalLessons || p.module._count.lessons,
            status: p.isCompleted ? 'COMPLETED' : p.lessonsCompleted > 0 ? 'IN_PROGRESS' : 'NOT_STARTED',
            progressPercent: p.progressPercent,
            quizScore: p.quizScore
        }))

        return { 
            success: true, 
            data: progress,
            rawProgress: moduleProgress,
            lessonCompletions
        }
    } catch (error) {
        console.error('Error fetching learning progress:', error)
        return { success: false, error: 'Failed to fetch progress', data: [] }
    }
}

// Update lesson progress
export async function updateLessonProgress(lessonId: string, data: {
    completed?: boolean
    quizScore?: number
    timeSpent?: number
}) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: 'You must be logged in' }
        }

        // Upsert lesson completion
        const completion = await prisma.oSLessonCompletion.upsert({
            where: {
                userId_lessonId: {
                    lessonId,
                    userId: session.user.id
                }
            },
            update: {
                isCompleted: data.completed ?? undefined,
                score: data.quizScore ?? undefined,
                timeSpent: data.timeSpent ? { increment: data.timeSpent } : undefined,
                completedAt: data.completed ? new Date() : undefined
            },
            create: {
                lessonId,
                userId: session.user.id,
                isCompleted: data.completed ?? false,
                score: data.quizScore ?? null,
                timeSpent: data.timeSpent ?? 0
            }
        })

        revalidatePath('/opensource/learn')
        return { success: true, progress: completion }
    } catch (error) {
        console.error('Error updating lesson progress:', error)
        return { success: false, error: 'Failed to update progress' }
    }
}

// Get next lesson in module
export async function getNextLesson(moduleSlug: string, currentLessonId: string) {
    try {
        const lesson = await prisma.oSLearnLesson.findUnique({
            where: { id: currentLessonId },
            select: { orderIndex: true, moduleId: true }
        })

        if (!lesson) {
            return { success: false, error: 'Lesson not found' }
        }

        const nextLesson = await prisma.oSLearnLesson.findFirst({
            where: {
                moduleId: lesson.moduleId,
                orderIndex: { gt: lesson.orderIndex }
            },
            orderBy: { orderIndex: 'asc' },
            select: { id: true, title: true }
        })

        return { success: true, nextLesson }
    } catch (error) {
        console.error('Error finding next lesson:', error)
        return { success: false, error: 'Failed to find next lesson' }
    }
}
