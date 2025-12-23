'use server'

import { auth } from '@repo/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { 
    OSProjectType, 
    OSProjectStatus, 
    OSIssueStatus, 
    OSIssueDifficulty,
    OSContributionType,
    OSContributionStatus,
    OSCertificationStatus 
} from '@prisma/client'
import * as github from '@/lib/github'

// Constants are imported from constants.ts (client-accessible)
// import { PROJECT_TYPES, DIFFICULTY_LEVELS } from './constants'

// ==========================================
// PROJECT ACTIONS
// ==========================================

// Get all projects with filtering
export async function getProjects(params?: {
    type?: OSProjectType | 'ALL'
    status?: OSProjectStatus
    difficulty?: OSIssueDifficulty | 'ALL'
    search?: string
    technologies?: string[]
    page?: number
    limit?: number
}) {
    try {
        const page = params?.page || 1
        const limit = params?.limit || 12
        const skip = (page - 1) * limit

        const where: any = {
            status: params?.status || 'ACTIVE'
        }

        if (params?.type && params.type !== 'ALL') {
            where.type = params.type
        }

        if (params?.difficulty && params.difficulty !== 'ALL') {
            where.difficulty = params.difficulty
        }

        if (params?.search) {
            where.OR = [
                { title: { contains: params.search, mode: 'insensitive' } },
                { description: { contains: params.search, mode: 'insensitive' } },
            ]
        }

        if (params?.technologies && params.technologies.length > 0) {
            where.technologies = { hasSome: params.technologies }
        }

        const [projects, total] = await Promise.all([
            prisma.openSourceProject.findMany({
                where,
                skip,
                take: limit,
                orderBy: [
                    { type: 'asc' }, // FREE first, then PAID, then EXCLUSIVE
                    { openIssues: 'desc' },
                    { createdAt: 'desc' }
                ],
                include: {
                    maintainer: {
                        select: {
                            id: true,
                            name: true,
                            username: true,
                            image: true
                        }
                    },
                    _count: {
                        select: {
                            issues: true,
                            contributors: true
                        }
                    }
                }
            }),
            prisma.openSourceProject.count({ where })
        ])

        return {
            success: true,
            projects,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: page
        }
    } catch (error) {
        console.error('Error fetching projects:', error)
        return {
            success: false,
            error: 'Failed to fetch projects',
            projects: [],
            total: 0
        }
    }
}

// Get single project by slug
export async function getProjectBySlug(slug: string) {
    try {
        const project = await prisma.openSourceProject.findUnique({
            where: { slug },
            include: {
                maintainer: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        image: true
                    }
                },
                createdBy: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        image: true
                    }
                },
                issues: {
                    where: { status: 'OPEN' },
                    orderBy: [
                        { bountyAmount: 'desc' },
                        { createdAt: 'desc' }
                    ],
                    take: 10
                },
                contributors: {
                    orderBy: { contributionScore: 'desc' },
                    take: 10,
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
                },
                _count: {
                    select: {
                        issues: true,
                        contributions: true,
                        contributors: true
                    }
                }
            }
        })

        if (!project) {
            return {
                success: false,
                error: 'Project not found'
            }
        }

        return {
            success: true,
            project
        }
    } catch (error) {
        console.error('Error fetching project:', error)
        return {
            success: false,
            error: 'Failed to fetch project'
        }
    }
}

// Get project issues
export async function getProjectIssues(projectId: string, params?: {
    status?: OSIssueStatus | 'ALL'
    difficulty?: OSIssueDifficulty | 'ALL'
    page?: number
    limit?: number
}) {
    try {
        const page = params?.page || 1
        const limit = params?.limit || 20
        const skip = (page - 1) * limit

        const where: any = { projectId }

        if (params?.status && params.status !== 'ALL') {
            where.status = params.status
        }

        if (params?.difficulty && params.difficulty !== 'ALL') {
            where.difficulty = params.difficulty
        }

        const [issues, total] = await Promise.all([
            prisma.oSIssue.findMany({
                where,
                skip,
                take: limit,
                orderBy: [
                    { bountyAmount: 'desc' },
                    { createdAt: 'desc' }
                ],
                include: {
                    assignedTo: {
                        select: {
                            id: true,
                            name: true,
                            username: true,
                            image: true
                        }
                    }
                }
            }),
            prisma.oSIssue.count({ where })
        ])

        return {
            success: true,
            issues,
            total,
            totalPages: Math.ceil(total / limit)
        }
    } catch (error) {
        console.error('Error fetching issues:', error)
        return {
            success: false,
            error: 'Failed to fetch issues',
            issues: []
        }
    }
}

// ==========================================
// ISSUE CLAIMING
// ==========================================

// Claim an issue
export async function claimIssue(issueId: string) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: 'You must be logged in' }
        }

        // Check if user is certified
        const userStats = await prisma.userOSStats.findUnique({
            where: { userId: session.user.id }
        })

        if (!userStats?.isCertified) {
            return { 
                success: false, 
                error: 'You must complete the Open Source certification first' 
            }
        }

        // Get the issue
        const issue = await prisma.oSIssue.findUnique({
            where: { id: issueId },
            include: {
                project: true
            }
        })

        if (!issue) {
            return { success: false, error: 'Issue not found' }
        }

        if (issue.status !== 'OPEN') {
            return { success: false, error: 'This issue is not available' }
        }

        // Check user's active issues
        const activeIssues = await prisma.oSIssue.count({
            where: {
                assignedToId: session.user.id,
                status: { in: ['ASSIGNED', 'IN_REVIEW'] }
            }
        })

        if (activeIssues >= issue.project.maxActiveIssues) {
            return { 
                success: false, 
                error: `You can only work on ${issue.project.maxActiveIssues} issues at a time` 
            }
        }

        // Calculate deadline
        const deadlineAt = new Date()
        deadlineAt.setHours(deadlineAt.getHours() + issue.project.prDeadlineHours)

        // Assign the issue
        await prisma.oSIssue.update({
            where: { id: issueId },
            data: {
                status: 'ASSIGNED',
                assignedToId: session.user.id,
                assignedAt: new Date(),
                deadlineAt,
                totalAttempts: { increment: 1 }
            }
        })

        // Add user as contributor if not already
        await prisma.oSProjectContributor.upsert({
            where: {
                projectId_userId: {
                    projectId: issue.projectId,
                    userId: session.user.id
                }
            },
            create: {
                projectId: issue.projectId,
                userId: session.user.id
            },
            update: {
                lastActiveAt: new Date()
            }
        })

        // Assign on GitHub if we have the issue number
        if (issue.githubIssueNumber) {
            const user = await prisma.user.findUnique({
                where: { id: session.user.id },
                select: { githubUsername: true }
            })

            if (user?.githubUsername) {
                await github.assignIssue(
                    issue.project.githubOwner,
                    issue.project.githubRepo,
                    issue.githubIssueNumber,
                    [user.githubUsername]
                )
            }
        }

        revalidatePath(`/opensource/${issue.project.slug}`)

        return { success: true }
    } catch (error) {
        console.error('Error claiming issue:', error)
        return { success: false, error: 'Failed to claim issue' }
    }
}

// Unclaim an issue
export async function unclaimIssue(issueId: string) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: 'You must be logged in' }
        }

        const issue = await prisma.oSIssue.findUnique({
            where: { id: issueId },
            include: { project: true }
        })

        if (!issue) {
            return { success: false, error: 'Issue not found' }
        }

        if (issue.assignedToId !== session.user.id) {
            return { success: false, error: 'You are not assigned to this issue' }
        }

        // Unassign the issue
        await prisma.oSIssue.update({
            where: { id: issueId },
            data: {
                status: 'OPEN',
                assignedToId: null,
                assignedAt: null,
                deadlineAt: null
            }
        })

        // Unassign on GitHub
        if (issue.githubIssueNumber) {
            const user = await prisma.user.findUnique({
                where: { id: session.user.id },
                select: { githubUsername: true }
            })

            if (user?.githubUsername) {
                await github.unassignIssue(
                    issue.project.githubOwner,
                    issue.project.githubRepo,
                    issue.githubIssueNumber,
                    [user.githubUsername]
                )
            }
        }

        revalidatePath(`/opensource/${issue.project.slug}`)

        return { success: true }
    } catch (error) {
        console.error('Error unclaiming issue:', error)
        return { success: false, error: 'Failed to unclaim issue' }
    }
}

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

        // Get user progress if logged in
        let userProgress: Record<string, any> = {}
        if (session?.user?.id) {
            const progress = await prisma.oSLearnProgress.findMany({
                where: { userId: session.user.id }
            })
            userProgress = progress.reduce((acc, p) => {
                acc[p.moduleId] = p
                return acc
            }, {} as Record<string, any>)
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

        const allModulesComplete = completedModules.length >= requiredModules.length

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
                cooldownEndsAt: new Date(recentExam.completedAt!.getTime() + 24 * 60 * 60 * 1000)
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
                certification: existingCert
            }
        }

        return {
            success: true,
            canTake: allModulesComplete,
            reason: allModulesComplete ? 'ready' : 'modules_incomplete',
            requiredModules: requiredModules.length,
            completedModules: completedModules.length
        }
    } catch (error) {
        console.error('Error checking certification eligibility:', error)
        return { success: false, error: 'Failed to check eligibility', canTake: false }
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

        // Generate randomized exam content
        const quizQuestions = generateQuizQuestions()
        const codeExercises = generateCodeExercises()
        const scenarioQuestions = generateScenarioQuestions()

        // Get attempt number
        const previousAttempts = await prisma.oSCertificationExam.count({
            where: { userId: session.user.id }
        })

        // Create exam
        const exam = await prisma.oSCertificationExam.create({
            data: {
                userId: session.user.id,
                status: 'IN_PROGRESS',
                quizQuestions,
                codeExercises,
                scenarioQuestions,
                attemptNumber: previousAttempts + 1,
                startedAt: new Date()
            }
        })

        return {
            success: true,
            examId: exam.id,
            timeLimit: exam.timeLimit
        }
    } catch (error) {
        console.error('Error starting exam:', error)
        return { success: false, error: 'Failed to start exam' }
    }
}

// Submit certification exam
export async function submitCertificationExam(examId: string, answers: {
    quizAnswers: any
    codeAnswers: any
    scenarioAnswers: any
}) {
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
        const quizScore = scoreQuizAnswers(exam.quizQuestions as any, answers.quizAnswers)
        const codeScore = scoreCodeAnswers(exam.codeExercises as any, answers.codeAnswers)
        const scenarioScore = scoreScenarioAnswers(exam.scenarioQuestions as any, answers.scenarioAnswers)

        const totalScore = Math.round((quizScore + codeScore + scenarioScore) / 3)
        const passed = totalScore >= exam.passingScore

        // Update exam
        await prisma.oSCertificationExam.update({
            where: { id: examId },
            data: {
                status: passed ? 'PASSED' : 'FAILED',
                quizScore,
                codeScore,
                scenarioScore,
                totalScore,
                quizAnswers: answers.quizAnswers,
                codeAnswers: answers.codeAnswers,
                scenarioAnswers: answers.scenarioAnswers,
                completedAt: new Date()
            }
        })

        // If passed, create certification
        if (passed) {
            const certificateId = `OS-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
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
        }

        return {
            success: true,
            passed,
            scores: {
                quiz: quizScore,
                code: codeScore,
                scenario: scenarioScore,
                total: totalScore
            }
        }
    } catch (error) {
        console.error('Error submitting exam:', error)
        return { success: false, error: 'Failed to submit exam' }
    }
}

// ==========================================
// USER DASHBOARD ACTIONS
// ==========================================

// Get user's contribution stats
export async function getUserOSStats() {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: 'You must be logged in' }
        }

        const stats = await prisma.userOSStats.findUnique({
            where: { userId: session.user.id }
        })

        const recentContributions = await prisma.oSContribution.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: 'desc' },
            take: 10,
            include: {
                project: {
                    select: {
                        title: true,
                        slug: true
                    }
                },
                issue: {
                    select: {
                        title: true
                    }
                }
            }
        })

        const activeIssues = await prisma.oSIssue.findMany({
            where: {
                assignedToId: session.user.id,
                status: { in: ['ASSIGNED', 'IN_REVIEW'] }
            },
            include: {
                project: {
                    select: {
                        title: true,
                        slug: true
                    }
                }
            }
        })

        const certification = await prisma.oSCertification.findFirst({
            where: {
                userId: session.user.id,
                isActive: true
            }
        })

        return {
            success: true,
            stats: stats || {
                modulesCompleted: 0,
                lessonsCompleted: 0,
                isCertified: false,
                totalContributions: 0,
                prsMerged: 0,
                totalBountyEarned: 0
            },
            recentContributions,
            activeIssues,
            certification
        }
    } catch (error) {
        console.error('Error fetching user stats:', error)
        return { success: false, error: 'Failed to fetch stats' }
    }
}

// Get user's earnings
export async function getUserEarnings() {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: 'You must be logged in' }
        }

        const transactions = await prisma.oSEarningsTransaction.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: 'desc' },
            take: 50
        })

        const stats = await prisma.userOSStats.findUnique({
            where: { userId: session.user.id },
            select: {
                totalBountyEarned: true,
                pendingBounty: true
            }
        })

        return {
            success: true,
            transactions,
            totalEarned: stats?.totalBountyEarned || 0,
            pendingAmount: stats?.pendingBounty || 0
        }
    } catch (error) {
        console.error('Error fetching earnings:', error)
        return { success: false, error: 'Failed to fetch earnings' }
    }
}

// ==========================================
// HELPER FUNCTIONS
// ==========================================

function generateQuizQuestions() {
    // This would pull from a question bank in production
    return [
        {
            id: 1,
            question: 'What command creates a new Git repository?',
            options: ['git new', 'git init', 'git create', 'git start'],
            correctAnswer: 1
        },
        {
            id: 2,
            question: 'What does "git clone" do?',
            options: [
                'Creates a new branch',
                'Downloads a repository from GitHub',
                'Deletes a repository',
                'Updates the remote'
            ],
            correctAnswer: 1
        },
        {
            id: 3,
            question: 'What is a pull request?',
            options: [
                'A request to delete code',
                'A way to download code',
                'A proposal to merge your changes into another branch',
                'A request for help'
            ],
            correctAnswer: 2
        },
        {
            id: 4,
            question: 'What command stages all changes for commit?',
            options: ['git stage .', 'git add .', 'git commit .', 'git push .'],
            correctAnswer: 1
        },
        {
            id: 5,
            question: 'What is the purpose of .gitignore?',
            options: [
                'To delete files',
                'To list files Git should not track',
                'To create branches',
                'To merge branches'
            ],
            correctAnswer: 1
        },
        // Add more questions...
    ]
}

function generateCodeExercises() {
    return [
        {
            id: 1,
            title: 'Create a Branch',
            description: 'Write the command to create a new branch called "feature-login" and switch to it',
            expectedAnswer: 'git checkout -b feature-login',
            alternativeAnswers: ['git switch -c feature-login']
        },
        {
            id: 2,
            title: 'Stage and Commit',
            description: 'Write the commands to stage all changes and commit with message "Add login form"',
            expectedAnswer: 'git add .\ngit commit -m "Add login form"',
            alternativeAnswers: ['git add . && git commit -m "Add login form"']
        },
        {
            id: 3,
            title: 'Push to Remote',
            description: 'Write the command to push your current branch to origin',
            expectedAnswer: 'git push origin HEAD',
            alternativeAnswers: ['git push', 'git push -u origin HEAD']
        },
    ]
}

function generateScenarioQuestions() {
    return [
        {
            id: 1,
            scenario: 'You made changes to the wrong branch. You want to move your uncommitted changes to a new branch called "correct-branch". What should you do?',
            options: [
                'Delete your changes and start over',
                'Use git stash, create the new branch, then git stash pop',
                'Use git reset --hard',
                'Push to the wrong branch anyway'
            ],
            correctAnswer: 1,
            explanation: 'git stash saves your changes temporarily, allowing you to switch branches and then apply the stashed changes.'
        },
        {
            id: 2,
            scenario: 'You encounter a merge conflict when pulling from origin. What is the correct approach?',
            options: [
                'Force push to override',
                'Open the conflicting files, resolve the conflicts, stage, and commit',
                'Delete the repository and clone again',
                'Ignore the conflict'
            ],
            correctAnswer: 1,
            explanation: 'Merge conflicts must be resolved manually by editing the files to combine both sets of changes correctly.'
        },
        {
            id: 3,
            scenario: 'Your pull request has merge conflicts with the main branch. What should you do?',
            options: [
                'Wait for someone else to fix it',
                'Close the PR and create a new one',
                'Rebase your branch on main or merge main into your branch, resolve conflicts, and push',
                'Delete your branch'
            ],
            correctAnswer: 2,
            explanation: 'You need to update your branch with the latest changes from main and resolve any conflicts.'
        },
    ]
}

function scoreQuizAnswers(questions: any[], answers: Record<number, number>): number {
    let correct = 0
    questions.forEach((q) => {
        if (answers[q.id] === q.correctAnswer) {
            correct++
        }
    })
    return Math.round((correct / questions.length) * 100)
}

function scoreCodeAnswers(exercises: any[], answers: Record<number, string>): number {
    let correct = 0
    exercises.forEach((ex) => {
        const userAnswer = (answers[ex.id] || '').trim().toLowerCase()
        const expected = ex.expectedAnswer.toLowerCase()
        const alternatives = (ex.alternativeAnswers || []).map((a: string) => a.toLowerCase())
        
        if (userAnswer === expected || alternatives.includes(userAnswer)) {
            correct++
        }
    })
    return Math.round((correct / exercises.length) * 100)
}

function scoreScenarioAnswers(scenarios: any[], answers: Record<number, number>): number {
    let correct = 0
    scenarios.forEach((s) => {
        if (answers[s.id] === s.correctAnswer) {
            correct++
        }
    })
    return Math.round((correct / scenarios.length) * 100)
}

// ==========================================
// ADDITIONAL EXPORTS FOR UI PAGES
// ==========================================

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

// Get user contributions with filtering
export async function getUserContributions(params?: {
    type?: OSContributionType
    status?: OSContributionStatus
    limit?: number
}) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: 'You must be logged in', contributions: [] }
        }

        const contributions = await prisma.oSContribution.findMany({
            where: {
                userId: session.user.id,
                type: params?.type,
                status: params?.status
            },
            include: {
                project: {
                    select: {
                        title: true,
                        slug: true,
                        type: true
                    }
                },
                issue: {
                    select: {
                        title: true,
                        difficulty: true,
                        bountyAmount: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: params?.limit || 50
        })

        return { success: true, contributions }
    } catch (error) {
        console.error('Error fetching contributions:', error)
        return { success: false, error: 'Failed to fetch contributions', contributions: [] }
    }
}

// Get user contribution stats (dashboard summary)
export async function getUserContributionStats() {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: 'You must be logged in' }
        }

        const stats = await prisma.userOSStats.findUnique({
            where: { userId: session.user.id }
        })

        // Get contribution counts by status
        const contributionCounts = await prisma.oSContribution.groupBy({
            by: ['status'],
            where: { userId: session.user.id },
            _count: true
        })

        // Get recent activity
        const recentActivity = await prisma.oSContribution.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: 'desc' },
            take: 5,
            include: {
                project: { select: { title: true, slug: true } }
            }
        })

        return {
            success: true,
            stats: stats || {
                totalContributions: 0,
                prsMerged: 0,
                issuesSolved: 0,
                codeReviews: 0,
                totalBountyEarned: 0,
                pendingBounty: 0,
                reputation: 0
            },
            contributionCounts: contributionCounts.reduce((acc, c) => {
                acc[c.status] = c._count
                return acc
            }, {} as Record<string, number>),
            recentActivity
        }
    } catch (error) {
        console.error('Error fetching contribution stats:', error)
        return { success: false, error: 'Failed to fetch stats' }
    }
}

// Record exam result (for client-side scored exams)
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
