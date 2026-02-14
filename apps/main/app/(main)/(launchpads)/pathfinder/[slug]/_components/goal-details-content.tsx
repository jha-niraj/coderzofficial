'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@repo/ui/components/ui/button'
import { Badge } from '@repo/ui/components/ui/badge'
import { Progress } from '@repo/ui/components/ui/progress'
import { ScrollArea } from '@repo/ui/components/ui/scroll-area'
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle
} from '@repo/ui/components/ui/dialog'
import {
    ArrowLeft, CheckCircle2, BookOpen,
    Code2, Brain, FileText, Play, Sparkles, Mic,
    Clock, Flame, FolderOpen
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { PathfinderStatus, PathfinderCategory, PathfinderLevel } from '@repo/prisma/client'
import { startVerification } from '@/actions/(main)/pathfinder'
import toast from '@repo/ui/components/ui/sonner'

interface AIPlan {
    overview?: string
    learningObjectives?: string[]
    prerequisites?: string[]
    quizQuestions?: unknown[]
    codingQuestions?: unknown[]
    mockInterview?: {
        title: string
        description: string
        duration: number
        questionsCount: number
    }
    minorProject?: {
        title: string
        description: string
        technologies: string[]
    } | null
    majorProject?: {
        title: string
        description: string
        technologies: string[]
        features: string[]
    } | null
}

interface DailySession {
    id: string
    date: Date
    totalSubGoals: number
    completedSubGoals: number
}

interface Goal {
    id: string
    slug: string
    title: string
    category: PathfinderCategory
    level: PathfinderLevel
    focusAreas: string[]
    status: PathfinderStatus
    progressPercent: number
    totalSubGoals: number
    completedSubGoals: number
    totalQuizAnswered: number
    totalCodingSolved: number
    streakDays: number
    lastActivityAt: Date | null
    estimatedDays: number | null
    overview: string | null
    aiGeneratedPlan: unknown
    learningObjectives: string[]
    prerequisites: string[]
    createdAt: Date
    completedAt: Date | null
    studioId: string | null
    mockInterviewId: string | null
    groupId: string | null
    group?: { name: string; emoji: string | null; color: string | null } | null
    dailySessions?: DailySession[]
}

const categoryEmoji: Record<PathfinderCategory, string> = {
    DSA: '🧮',
    WEB_DEVELOPMENT: '🌐',
    FRONTEND: '🎨',
    BACKEND: '⚙️',
    DEVOPS: '🚀',
    AI_ML: '🤖',
    DATABASE: '🗄️',
    SYSTEM_DESIGN: '🏗️',
    MOBILE: '📱',
    OTHER: '📚',
}

// ================================================================================
// HEADER COMPONENT
// ================================================================================

function GoalHeader({ goal }: { goal: Goal }) {
    const [verifyDialogOpen, setVerifyDialogOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleStartVerification = async () => {
        setLoading(true)
        const result = await startVerification(goal.id) // API uses id
        setLoading(false)

        if (result.success) {
            setVerifyDialogOpen(false)
            router.push(`/pathfinder/${goal.slug}/verify`)
        } else {
            toast.error(result.error || 'Failed to start verification')
        }
    }

    return (
        <div className="border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
            <div className="px-6 py-4">
                {/* Back link */}
                <Link href="/pathfinder" className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-white mb-4">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Goals
                </Link>

                {/* Goal Info */}
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-3xl shadow-lg">
                            {categoryEmoji[goal.category]}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-1">
                                {goal.title}
                            </h1>
                            <div className="flex items-center gap-3 flex-wrap">
                                <Badge variant="secondary" className="capitalize">
                                    {goal.level.toLowerCase()}
                                </Badge>
                                <Badge variant="outline" className="capitalize">
                                    {goal.category.toLowerCase().replace('_', ' ')}
                                </Badge>
                                {goal.group && (
                                    <Badge 
                                        variant="secondary" 
                                        style={{ backgroundColor: `${goal.group.color}20`, color: goal.group.color || undefined }}
                                    >
                                        <FolderOpen className="w-3 h-3 mr-1" />
                                        {goal.group.name}
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {goal.studioId && (
                            <Link href={`/studio/${goal.studioId}`}>
                                <Button variant="outline" size="sm">
                                    <FileText className="w-4 h-4 mr-2" />
                                    Studio
                                </Button>
                            </Link>
                        )}
                        <Link href={`/pathfinder/${goal.slug}/practice`}>
                            <Button variant="outline" size="sm">
                                <BookOpen className="w-4 h-4 mr-2" />
                                Daily Practice
                            </Button>
                        </Link>
                        {goal.status === 'ACTIVE' && (
                            <Button
                                onClick={() => setVerifyDialogOpen(true)}
                                size="sm"
                                className="bg-gradient-to-r from-violet-600 to-purple-600"
                            >
                                <Sparkles className="w-4 h-4 mr-2" />
                                Mark Complete
                            </Button>
                        )}
                        {goal.status === 'VERIFICATION' && (
                            <Link href={`/pathfinder/${goal.slug}/verify`}>
                                <Button size="sm" className="bg-gradient-to-r from-violet-600 to-purple-600">
                                    <Play className="w-4 h-4 mr-2" />
                                    Continue Verification
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>

                {/* Progress */}
                <div className="mt-4">
                    <div className="flex items-center justify-between text-sm text-neutral-500 mb-1.5">
                        <span>Overall Progress</span>
                        <span>
                            {goal.totalSubGoals > 0 
                                ? Math.round((goal.completedSubGoals / goal.totalSubGoals) * 100) 
                                : 0}%
                        </span>
                    </div>
                    <Progress 
                        value={goal.totalSubGoals > 0 
                            ? Math.round((goal.completedSubGoals / goal.totalSubGoals) * 100) 
                            : 0} 
                        className="h-2" 
                    />
                </div>
            </div>

            {/* Verification Dialog */}
            <Dialog open={verifyDialogOpen} onOpenChange={setVerifyDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Ready to Complete?</DialogTitle>
                        <DialogDescription>
                            You are about to start the verification process. This includes:
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-3">
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-neutral-50 dark:bg-neutral-900">
                            <Brain className="w-5 h-5 text-purple-500" />
                            <div>
                                <div className="font-medium">Quiz Assessment</div>
                                <div className="text-sm text-neutral-500">20+ questions to test your knowledge</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-neutral-50 dark:bg-neutral-900">
                            <Code2 className="w-5 h-5 text-blue-500" />
                            <div>
                                <div className="font-medium">Coding Challenges</div>
                                <div className="text-sm text-neutral-500">Solve problems to prove your skills</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-neutral-50 dark:bg-neutral-900">
                            <Mic className="w-5 h-5 text-green-500" />
                            <div>
                                <div className="font-medium">Mock Interview</div>
                                <div className="text-sm text-neutral-500">AI-powered voice interview</div>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setVerifyDialogOpen(false)}>
                            Not Yet
                        </Button>
                        <Button
                            onClick={handleStartVerification}
                            disabled={loading}
                            className="bg-gradient-to-r from-violet-600 to-purple-600"
                        >
                            {loading ? 'Starting...' : "I'm Ready"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

// ================================================================================
// STATS CARDS
// ================================================================================

function StatsCards({ goal }: { goal: Goal }) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="p-4 rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2 text-green-600 mb-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-xs font-medium">Tasks Done</span>
                </div>
                <div className="text-2xl font-bold text-green-700">
                    {goal.completedSubGoals}/{goal.totalSubGoals}
                </div>
            </div>
            <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800">
                <div className="flex items-center gap-2 text-purple-600 mb-1">
                    <Brain className="w-4 h-4" />
                    <span className="text-xs font-medium">Quiz Answered</span>
                </div>
                <div className="text-2xl font-bold text-purple-700">
                    {goal.totalQuizAnswered}
                </div>
            </div>
            <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2 text-blue-600 mb-1">
                    <Code2 className="w-4 h-4" />
                    <span className="text-xs font-medium">Code Solved</span>
                </div>
                <div className="text-2xl font-bold text-blue-700">
                    {goal.totalCodingSolved}
                </div>
            </div>
            <div className="p-4 rounded-xl bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800">
                <div className="flex items-center gap-2 text-orange-600 mb-1">
                    <Flame className="w-4 h-4" />
                    <span className="text-xs font-medium">Streak</span>
                </div>
                <div className="text-2xl font-bold text-orange-700">
                    {goal.streakDays} days
                </div>
            </div>
        </div>
    )
}

// ================================================================================
// MAIN CONTENT
// ================================================================================

export function GoalDetailsContent({ goal }: { goal: Goal }) {
    const aiPlan = goal.aiGeneratedPlan as AIPlan | null

    // Check if AI plan is still generating
    const isPlanReady = aiPlan && (aiPlan.quizQuestions || aiPlan.codingQuestions)

    if (!isPlanReady) {
        return (
            <div className="flex-1 flex flex-col overflow-hidden">
                <GoalHeader goal={goal} />
                <div className="flex-1 flex items-center justify-center">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center"
                    >
                        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mb-4">
                            <Brain className="w-8 h-8 text-white animate-pulse" />
                        </div>
                        <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
                            AI is generating your plan...
                        </h3>
                        <p className="text-neutral-500 max-w-sm">
                            This usually takes 30-60 seconds. Please refresh in a moment.
                        </p>
                        <Button
                            variant="outline"
                            className="mt-4"
                            onClick={() => window.location.reload()}
                        >
                            Refresh Page
                        </Button>
                    </motion.div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            <GoalHeader goal={goal} />

            <ScrollArea className="flex-1">
                <div className="p-6 max-w-4xl mx-auto">
                    {/* Stats */}
                    <StatsCards goal={goal} />

                    {/* Quick Actions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                        <Link href={`/pathfinder/${goal.slug}/practice`}>
                            <motion.div
                                whileHover={{ scale: 1.01 }}
                                className="p-6 rounded-xl border-2 border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-950/30 cursor-pointer"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-xl bg-violet-500 text-white">
                                        <BookOpen className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-neutral-900 dark:text-white">
                                            Daily Practice
                                        </h3>
                                        <p className="text-sm text-neutral-500">
                                            Add tasks, take quizzes, solve coding problems
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        </Link>

                        {goal.studioId && (
                            <Link href={`/studio/${goal.studioId}`}>
                                <motion.div
                                    whileHover={{ scale: 1.01 }}
                                    className="p-6 rounded-xl border-2 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30 cursor-pointer"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 rounded-xl bg-blue-500 text-white">
                                            <FileText className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-neutral-900 dark:text-white">
                                                Learning Studio
                                            </h3>
                                            <p className="text-sm text-neutral-500">
                                                Write notes, save code snippets, practice
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            </Link>
                        )}
                    </div>

                    {/* Overview */}
                    {goal.overview && (
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">Overview</h3>
                            <p className="text-neutral-600 dark:text-neutral-400">{goal.overview}</p>
                        </div>
                    )}

                    {/* Learning Objectives */}
                    {goal.learningObjectives.length > 0 && (
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-3">
                                Learning Objectives
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {goal.learningObjectives.map((objective, i) => (
                                    <div key={i} className="flex items-start gap-2 p-3 rounded-lg bg-neutral-50 dark:bg-neutral-900">
                                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                        <span className="text-sm text-neutral-600 dark:text-neutral-400">{objective}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Prerequisites */}
                    {goal.prerequisites.length > 0 && (
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">Prerequisites</h3>
                            <div className="flex flex-wrap gap-2">
                                {goal.prerequisites.map((prereq, i) => (
                                    <Badge key={i} variant="outline">{prereq}</Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Projects */}
                    {(aiPlan?.minorProject || aiPlan?.majorProject) && (
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-3">Projects</h3>
                            <div className="grid gap-4 md:grid-cols-2">
                                {aiPlan.minorProject && (
                                    <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900">
                                        <Badge variant="secondary" className="mb-2">Minor Project</Badge>
                                        <h4 className="font-semibold text-neutral-900 dark:text-white">{aiPlan.minorProject.title}</h4>
                                        <p className="text-sm text-neutral-500 mt-1">{aiPlan.minorProject.description}</p>
                                        {aiPlan.minorProject.technologies && (
                                            <div className="flex flex-wrap gap-1 mt-2">
                                                {aiPlan.minorProject.technologies.map((tech, i) => (
                                                    <Badge key={i} variant="outline" className="text-[10px]">{tech}</Badge>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                                {aiPlan.majorProject && (
                                    <div className="p-4 rounded-xl border border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-950/30">
                                        <Badge className="mb-2 bg-violet-500">Major Project</Badge>
                                        <h4 className="font-semibold text-neutral-900 dark:text-white">{aiPlan.majorProject.title}</h4>
                                        <p className="text-sm text-neutral-500 mt-1">{aiPlan.majorProject.description}</p>
                                        {aiPlan.majorProject.technologies && (
                                            <div className="flex flex-wrap gap-1 mt-2">
                                                {aiPlan.majorProject.technologies.map((tech, i) => (
                                                    <Badge key={i} variant="outline" className="text-[10px]">{tech}</Badge>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Mock Interview Info */}
                    {aiPlan?.mockInterview && (
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-3">Mock Interview</h3>
                            <div className="p-4 rounded-xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/30">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-green-500/10">
                                        <Mic className="w-5 h-5 text-green-500" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-neutral-900 dark:text-white">{aiPlan.mockInterview.title}</h4>
                                        <p className="text-sm text-neutral-500">{aiPlan.mockInterview.description}</p>
                                        <div className="flex items-center gap-4 mt-2 text-xs text-neutral-400">
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {aiPlan.mockInterview.duration} min
                                            </span>
                                            <span>{aiPlan.mockInterview.questionsCount} questions</span>
                                        </div>
                                    </div>
                                    {goal.mockInterviewId && (
                                        <Link href={`/mock/voice/interview/${goal.mockInterviewId}`}>
                                            <Button variant="outline" size="sm">
                                                <Play className="w-4 h-4 mr-1" />
                                                Practice
                                            </Button>
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Verification Stats */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-3">
                            Verification Content
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                                <Brain className="w-8 h-8 text-purple-500 mb-2" />
                                <div className="text-2xl font-bold text-neutral-900 dark:text-white">
                                    {(aiPlan?.quizQuestions as unknown[])?.length || 0}
                                </div>
                                <div className="text-xs text-neutral-500">Quiz Questions</div>
                            </div>
                            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                                <Code2 className="w-8 h-8 text-blue-500 mb-2" />
                                <div className="text-2xl font-bold text-neutral-900 dark:text-white">
                                    {(aiPlan?.codingQuestions as unknown[])?.length || 0}
                                </div>
                                <div className="text-xs text-neutral-500">Coding Challenges</div>
                            </div>
                        </div>
                    </div>

                    {/* Focus Areas */}
                    {goal.focusAreas.length > 0 && (
                        <div>
                            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">Focus Areas</h3>
                            <div className="flex flex-wrap gap-2">
                                {goal.focusAreas.map((area, i) => (
                                    <Badge key={i} variant="secondary" className="capitalize">
                                        {area}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </ScrollArea>
        </div>
    )
}
