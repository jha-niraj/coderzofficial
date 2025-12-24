'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
    ArrowLeft, Flame, CheckCircle2, Lock, Users, Trophy, 
    Brain, ChevronRight, Star, Clock, Zap, TrendingUp
} from 'lucide-react'
import { Button } from '@repo/ui/components/ui/button'
import { Badge } from '@repo/ui/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui/components/ui/card'
import { Progress } from '@repo/ui/components/ui/progress'
import { cn } from '@repo/ui/lib/utils'

interface CrucibleProblem {
    id: string
    dayNumber: number
    title: string
    slug: string
    difficulty: number
    xpReward: number
    isLocked: boolean
    unlocksAt?: Date | null
    solveCount: number
    _count?: {
        submissions: number
    }
    learningModules: Array<{ id: string; conceptName: string }>
}

interface CrucibleEvent {
    id: string
    name: string
    slug: string
    description: string
    shortDescription?: string | null
    icon?: string | null
    themeColor: string
    eventType: string
    status: string
    startsAt?: Date | null
    endsAt?: Date | null
    isFree: boolean
    totalParticipants: number
    problems: CrucibleProblem[]
    _count?: {
        participations: number
        problems: number
    }
}

interface Participation {
    id: string
    problemsSolved: number
    totalXpEarned: number
    currentStreak: number
    longestStreak: number
}

interface ProblemProgress {
    [problemId: string]: {
        solved: boolean
        xpEarned: number
    }
}

interface CrucibleEventClientProps {
    event: CrucibleEvent
    participation: Participation | null
    problemProgress: ProblemProgress
    user: { id: string; name: string | null; image: string | null } | null
}

const difficultyColors = [
    'text-emerald-500',
    'text-lime-500',
    'text-amber-500',
    'text-orange-500',
    'text-rose-500'
]

const statusColors: Record<string, string> = {
    UPCOMING: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
    ACTIVE: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
    ENDED: 'bg-neutral-100 dark:bg-neutral-900/30 text-neutral-700 dark:text-neutral-400',
}

export function CrucibleEventClient({
    event,
    participation,
    problemProgress,
    user
}: CrucibleEventClientProps) {
    const progress = participation 
        ? Math.round((participation.problemsSolved / event.problems.length) * 100)
        : 0

    const isProblemSolved = (problemId: string) => {
        return problemProgress[problemId]?.solved
    }

    const isProblemAvailable = (problem: CrucibleProblem) => {
        if (!problem.isLocked) return true
        if (problem.unlocksAt && new Date() >= new Date(problem.unlocksAt)) return true
        return false
    }

    return (
        <div className="min-h-screen bg-white dark:bg-neutral-950">
            {/* Hero Section */}
            <section 
                className="relative overflow-hidden border-b border-neutral-200 dark:border-neutral-800"
                style={{ 
                    background: `linear-gradient(to bottom, ${event.themeColor}10, transparent)` 
                }}
            >
                <div className="absolute inset-0 -z-10">
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]" />
                </div>

                <div className="max-w-5xl mx-auto px-4 py-8">
                    {/* Back Button */}
                    <Link href="/challenges">
                        <Button variant="ghost" size="sm" className="mb-6 -ml-2">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Challenges
                        </Button>
                    </Link>

                    <div className="flex flex-col lg:flex-row lg:items-start gap-8">
                        {/* Event Info */}
                        <div className="flex-1">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="text-5xl">{event.icon || '🔥'}</span>
                                    <div className="flex items-center gap-2">
                                        <Badge className={statusColors[event.status]}>
                                            {event.status === 'ACTIVE' && (
                                                <span className="w-2 h-2 bg-emerald-500 rounded-full mr-1 animate-pulse" />
                                            )}
                                            {event.status}
                                        </Badge>
                                        {event.isFree && (
                                            <Badge className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                                                Free
                                            </Badge>
                                        )}
                                    </div>
                                </div>

                                <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white mb-3">
                                    {event.name}
                                </h1>
                                
                                <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                                    {event.description}
                                </p>

                                {/* Stats */}
                                <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-500 dark:text-neutral-400">
                                    <span className="flex items-center gap-1">
                                        <Brain className="w-4 h-4" />
                                        {event.problems.length} problems
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Users className="w-4 h-4" />
                                        {event.totalParticipants.toLocaleString()} participants
                                    </span>
                                    {event.startsAt && (
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-4 h-4" />
                                            Started {new Date(event.startsAt).toLocaleDateString()}
                                        </span>
                                    )}
                                </div>
                            </motion.div>
                        </div>

                        {/* Stats Card */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="lg:w-80 flex-shrink-0"
                        >
                            <Card className="border-neutral-200 dark:border-neutral-800 shadow-lg">
                                <CardHeader className="pb-3">
                                    <CardTitle>Your Progress</CardTitle>
                                    <CardDescription>
                                        {user ? 'Track your journey' : 'Sign in to participate'}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {user ? (
                                        <>
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-neutral-500">Completion</span>
                                                    <span className="font-semibold">{progress}%</span>
                                                </div>
                                                <Progress value={progress} className="h-2" />
                                                <p className="text-xs text-neutral-400">
                                                    {participation?.problemsSolved || 0} of {event.problems.length} problems solved
                                                </p>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 pt-2">
                                                <div className="text-center p-3 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
                                                    <div className="text-2xl font-bold" style={{ color: event.themeColor }}>
                                                        {participation?.totalXpEarned || 0}
                                                    </div>
                                                    <div className="text-xs text-neutral-500">XP Earned</div>
                                                </div>
                                                <div className="text-center p-3 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
                                                    <div className="text-2xl font-bold text-amber-500">
                                                        {participation?.currentStreak || 0}
                                                    </div>
                                                    <div className="text-xs text-neutral-500">Day Streak</div>
                                                </div>
                                            </div>

                                            <Link href={`/challenges/crucible/${event.slug}/day/1`}>
                                                <Button 
                                                    className="w-full gap-2"
                                                    style={{ backgroundColor: event.themeColor }}
                                                >
                                                    <Flame className="w-4 h-4" />
                                                    {participation?.problemsSolved ? 'Continue' : 'Start Now'}
                                                </Button>
                                            </Link>
                                        </>
                                    ) : (
                                        <div className="text-center py-4">
                                            <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                                                Sign in to track your progress
                                            </p>
                                            <Link href="/signin">
                                                <Button>Sign In</Button>
                                            </Link>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Problems List */}
            <section className="py-12">
                <div className="max-w-5xl mx-auto px-4">
                    <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-6">
                        Problems
                    </h2>

                    <div className="grid gap-4">
                        {event.problems.map((problem, index) => {
                            const solved = isProblemSolved(problem.id)
                            const available = isProblemAvailable(problem)
                            const locked = !available

                            return (
                                <motion.div
                                    key={problem.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    {locked ? (
                                        <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 opacity-60">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center">
                                                    <Lock className="w-5 h-5 text-neutral-400" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm text-neutral-500">Day {problem.dayNumber}</span>
                                                    </div>
                                                    <h3 className="font-semibold text-neutral-500 dark:text-neutral-400">
                                                        {problem.title}
                                                    </h3>
                                                    {problem.unlocksAt && (
                                                        <p className="text-xs text-neutral-400 mt-1">
                                                            Unlocks {new Date(problem.unlocksAt).toLocaleString()}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <Link href={`/challenges/crucible/${event.slug}/day/${problem.dayNumber}`}>
                                            <div className={cn(
                                                "p-4 rounded-xl border transition-all hover:shadow-md cursor-pointer",
                                                solved 
                                                    ? "border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20"
                                                    : "border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-neutral-300 dark:hover:border-neutral-700"
                                            )}>
                                                <div className="flex items-center gap-4">
                                                    <div 
                                                        className={cn(
                                                            "w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold",
                                                            solved ? "bg-emerald-500" : ""
                                                        )}
                                                        style={{ 
                                                            backgroundColor: solved ? undefined : event.themeColor 
                                                        }}
                                                    >
                                                        {solved ? (
                                                            <CheckCircle2 className="w-6 h-6" />
                                                        ) : (
                                                            problem.dayNumber
                                                        )}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm text-neutral-500">Day {problem.dayNumber}</span>
                                                            {solved && (
                                                                <Badge className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs">
                                                                    Solved
                                                                </Badge>
                                                            )}
                                                            <div className="flex items-center gap-0.5">
                                                                {Array.from({ length: 5 }).map((_, i) => (
                                                                    <Star 
                                                                        key={i} 
                                                                        className={cn(
                                                                            "w-3 h-3",
                                                                            i < problem.difficulty 
                                                                                ? difficultyColors[problem.difficulty - 1]
                                                                                : "text-neutral-300 dark:text-neutral-700"
                                                                        )}
                                                                        fill={i < problem.difficulty ? 'currentColor' : 'none'}
                                                                    />
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <h3 className="font-semibold text-neutral-900 dark:text-white">
                                                            {problem.title}
                                                        </h3>
                                                        {problem.learningModules.length > 0 && (
                                                            <div className="flex items-center gap-1 mt-1 text-xs text-neutral-500">
                                                                <Brain className="w-3 h-3" />
                                                                {problem.learningModules.map(m => m.conceptName).join(', ')}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <div className="text-right">
                                                            <div className="text-sm font-medium" style={{ color: event.themeColor }}>
                                                                {problem.xpReward} XP
                                                            </div>
                                                            <div className="text-xs text-neutral-400">
                                                                {problem.solveCount} solved
                                                            </div>
                                                        </div>
                                                        <ChevronRight className="w-5 h-5 text-neutral-400" />
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    )}
                                </motion.div>
                            )
                        })}
                    </div>
                </div>
            </section>
        </div>
    )
}


