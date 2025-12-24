'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
    ArrowRight, BookOpen, CheckCircle, Clock, Code, GitBranch, GitMerge,
    GitPullRequest, GraduationCap, Lock, Rocket, Trophy, ArrowLeft,
    Terminal, MessageSquare, Shield, Award, Loader2
} from 'lucide-react'
import { Button } from '@repo/ui/components/ui/button'
import {
    Card, CardContent
} from '@repo/ui/components/ui/card'
import { Badge } from '@repo/ui/components/ui/badge'
import { Progress } from '@repo/ui/components/ui/progress'
import { cn } from '@repo/ui/lib/utils'
import { useUserStore } from '@/app/store/useUserStore'
import { getLearnModules } from '@/actions/(main)/opensource'

import type { LucideIcon } from 'lucide-react'

// Icon mapping
const iconMap: Record<string, LucideIcon> = {
    GitBranch,
    Code,
    GitPullRequest,
    MessageSquare,
    GitMerge,
}

const colorClasses: Record<string, { bg: string; text: string; border: string }> = {
    orange: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-600 dark:text-orange-400', border: 'border-orange-200 dark:border-orange-800' },
    purple: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-200 dark:border-purple-800' },
    green: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-600 dark:text-green-400', border: 'border-green-200 dark:border-green-800' },
    blue: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-800' },
    red: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-600 dark:text-red-400', border: 'border-red-200 dark:border-red-800' },
}

// Map slug to color
const slugColorMap: Record<string, string> = {
    'git-basics': 'orange',
    'github-essentials': 'purple',
    'first-contribution': 'green',
    'code-review': 'blue',
    'advanced-git': 'red',
}

interface Module {
    id: string
    slug: string
    title: string
    description: string
    icon: string | null
    estimatedMinutes: number
    orderIndex: number
    lessons: {
        id: string
        title: string
        type: string
        estimatedMinutes: number
    }[]
    _count: {
        lessons: number
    }
    userProgress: {
        lessonsCompleted: number
        isCompleted: boolean
    } | null
}

export default function OpenSourceLearnPage() {
    const { user } = useUserStore()
    const [modules, setModules] = useState<Module[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchModules() {
            try {
                const result = await getLearnModules()
                if (result.success && Array.isArray(result.modules)) {
                    setModules(result.modules as Module[])
                } else {
                    setModules([])
                }
            } catch (error) {
                console.error('Error fetching modules:', error)
                setModules([])
            } finally {
                setLoading(false)
            }
        }

        fetchModules()
    }, [user])

    const isModuleUnlocked = (module: Module, index: number) => {
        if (index === 0) return true
        // Check if previous module is completed
        const previousModule = modules[index - 1]
        return previousModule?.userProgress?.isCompleted ?? false
    }

    const getModuleProgress = (module: Module) => {
        if (!module.userProgress) return 0
        const completed = module.userProgress.lessonsCompleted || 0
        const total = module._count?.lessons || module.lessons?.length || 1
        return Math.round((completed / total) * 100)
    }

    // Ensure modules is always an array before using array methods
    const safeModules = Array.isArray(modules) ? modules : []
    
    const totalLessons = safeModules.reduce((acc, module) => acc + (module._count?.lessons || module.lessons?.length || 0), 0)
    const completedLessons = safeModules.reduce((acc, module) => acc + (module.userProgress?.lessonsCompleted || 0), 0)
    const overallProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0

    // Format duration
    const formatDuration = (minutes: number) => {
        if (minutes >= 60) {
            const hours = Math.floor(minutes / 60)
            const mins = minutes % 60
            return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
        }
        return `${minutes} min`
    }

    const totalDuration = safeModules.reduce((acc, m) => acc + (m.estimatedMinutes || 0), 0)

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 via-white to-neutral-100 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-purple-600" />
                    <p className="text-neutral-600 dark:text-neutral-400">Loading learning path...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-100 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
            {/* Header */}
            <div className="sticky top-0 z-50 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-xl border-b border-neutral-200 dark:border-neutral-800">
                <div className="max-w-6xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href="/opensource">
                                <Button variant="ghost" size="icon" className="rounded-xl">
                                    <ArrowLeft className="w-5 h-5" />
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                                    <GraduationCap className="w-6 h-6 text-purple-600" />
                                    Open Source Academy
                                </h1>
                                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                    Learn Git & GitHub from zero to hero
                                </p>
                            </div>
                        </div>
                        {user && (
                            <div className="flex items-center gap-4">
                                <div className="text-right">
                                    <p className="text-sm text-neutral-600 dark:text-neutral-400">Overall Progress</p>
                                    <p className="text-lg font-bold text-neutral-900 dark:text-white">{overallProgress}%</p>
                                </div>
                                <div className="w-32">
                                    <Progress value={overallProgress} className="h-2" />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Hero Section */}
            <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-transparent to-orange-600/10" />
                <div className="max-w-6xl mx-auto px-4 py-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center max-w-3xl mx-auto"
                    >
                        <Badge className="mb-4 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400">
                            <Rocket className="w-3 h-3 mr-1" />
                            Free Learning Path
                        </Badge>
                        <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white mb-4">
                            Stop making{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-orange-600">
                                README contributions
                            </span>
                        </h2>
                        <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-6">
                            Learn real open source skills - from git commands to managing merge conflicts.
                            Complete the course to unlock project contributions. No fluff, just stuff that matters.
                        </p>
                        <div className="flex items-center justify-center gap-8 text-sm">
                            <div className="flex items-center gap-2">
                                <BookOpen className="w-4 h-4 text-purple-600" />
                                <span className="text-neutral-600 dark:text-neutral-400">{safeModules.length} Modules</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-orange-600" />
                                <span className="text-neutral-600 dark:text-neutral-400">~{formatDuration(totalDuration)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Terminal className="w-4 h-4 text-green-600" />
                                <span className="text-neutral-600 dark:text-neutral-400">Hands-on Labs</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Award className="w-4 h-4 text-blue-600" />
                                <span className="text-neutral-600 dark:text-neutral-400">Certificate</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Modules */}
            <div className="max-w-6xl mx-auto px-4 py-8">
                {safeModules.length === 0 ? (
                    <Card className="border-dashed border-2 border-neutral-200 dark:border-neutral-800">
                        <CardContent className="flex flex-col items-center justify-center py-16">
                            <BookOpen className="w-12 h-12 text-neutral-400 mb-4" />
                            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                                No modules available yet
                            </h3>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                Learning modules are being prepared. Check back soon!
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-6">
                        {safeModules.map((module, index) => {
                            const iconName = module.icon || 'BookOpen'
                            const Icon = iconMap[iconName] || BookOpen
                            const colorKey = slugColorMap[module.slug] || 'purple'
                            const colors = colorClasses[colorKey]
                            const unlocked = isModuleUnlocked(module, index)
                            const moduleProgress = getModuleProgress(module)
                            const isComplete = module.userProgress?.isCompleted ?? false

                            return (
                                <motion.div
                                    key={module.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <Card className={cn(
                                        "relative overflow-hidden transition-all",
                                        !unlocked && "opacity-60",
                                        unlocked && "hover:shadow-lg hover:border-purple-300 dark:hover:border-purple-700"
                                    )}>
                                        <CardContent className="p-6">
                                            <div className="flex items-start gap-6">
                                                <div className={cn(
                                                    "flex-shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center",
                                                    colors.bg
                                                )}>
                                                    <Icon className={cn("w-8 h-8", colors.text)} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-4 mb-2">
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="text-sm text-neutral-500 dark:text-neutral-500">
                                                                    Module {index + 1}
                                                                </span>
                                                                {
                                                                isComplete && (
                                                                    <Badge className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                                                                        <CheckCircle className="w-3 h-3 mr-1" />
                                                                        Completed
                                                                    </Badge>
                                                                )
                                                                }
                                                                {
                                                                !unlocked && (
                                                                    <Badge variant="outline" className="text-neutral-500">
                                                                        <Lock className="w-3 h-3 mr-1" />
                                                                        Locked
                                                                    </Badge>
                                                                )
                                                                }
                                                            </div>
                                                            <h3 className="text-xl font-semibold text-neutral-900 dark:text-white">
                                                                {module.title}
                                                            </h3>
                                                            <p className="text-neutral-600 dark:text-neutral-400 text-sm mt-1">
                                                                {module.description}
                                                            </p>
                                                        </div>
                                                        <Link href={unlocked ? `/opensource/learn/${module.slug}` : '#'}>
                                                            <Button
                                                                disabled={!unlocked}
                                                                className={cn(
                                                                    "gap-2",
                                                                    unlocked && "bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 dark:text-neutral-900"
                                                                )}
                                                            >
                                                                {isComplete ? 'Review' : moduleProgress > 0 ? 'Continue' : 'Start'}
                                                                <ArrowRight className="w-4 h-4" />
                                                            </Button>
                                                        </Link>
                                                    </div>
                                                    <div className="flex items-center gap-4 mt-4 text-sm">
                                                        <div className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-400">
                                                            <BookOpen className="w-4 h-4" />
                                                            <span>{module._count.lessons || module.lessons.length} lessons</span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-400">
                                                            <Clock className="w-4 h-4" />
                                                            <span>{formatDuration(module.estimatedMinutes)}</span>
                                                        </div>
                                                        {module.lessons.some(l => l.type === 'INTERACTIVE') && (
                                                            <Badge variant="outline" className="text-xs">
                                                                <Terminal className="w-3 h-3 mr-1" />
                                                                Hands-on
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    {unlocked && moduleProgress > 0 && (
                                                        <div className="mt-4">
                                                            <div className="flex items-center justify-between text-xs mb-1">
                                                                <span className="text-neutral-600 dark:text-neutral-400">
                                                                    {module.userProgress?.lessonsCompleted || 0} of {module._count.lessons || module.lessons.length} lessons completed
                                                                </span>
                                                                <span className="font-medium text-neutral-900 dark:text-white">
                                                                    {moduleProgress}%
                                                                </span>
                                                            </div>
                                                            <Progress value={moduleProgress} className="h-1.5" />
                                                        </div>
                                                    )}
                                                    {!unlocked && index > 0 && (
                                                        <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                                                            <p className="text-sm text-amber-800 dark:text-amber-300">
                                                                🔒 Complete "{modules[index - 1]?.title}" to unlock
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                        <div className="absolute -right-6 -bottom-6 text-[120px] font-bold text-neutral-100 dark:text-neutral-800 select-none">
                                            {index + 1}
                                        </div>
                                    </Card>
                                </motion.div>
                            )
                        })}
                    </div>
                )}

                {/* CTA Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mt-8"
                >
                    <Card className="bg-gradient-to-r from-purple-600 to-orange-600 border-0">
                        <CardContent className="p-8">
                            <div className="flex items-center gap-6">
                                <div className="flex-shrink-0 w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center">
                                    <Trophy className="w-10 h-10 text-white" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-white mb-2">
                                        Ready to Contribute?
                                    </h3>
                                    <p className="text-white/80 mb-4">
                                        Complete all modules and pass the certification exam to unlock project contributions.
                                        Get verified as a real open source contributor!
                                    </p>
                                    <div className="flex items-center gap-3">
                                        <Link href="/opensource/exam">
                                            <Button className="bg-white text-purple-600 hover:bg-neutral-100 gap-2">
                                                <Shield className="w-4 h-4" />
                                                Take Certification Exam
                                            </Button>
                                        </Link>
                                        <Link href="/opensource">
                                            <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 gap-2">
                                                Browse Projects
                                                <ArrowRight className="w-4 h-4" />
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    )
}
