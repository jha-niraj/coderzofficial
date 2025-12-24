'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
    ArrowLeft, Play, Lock, CheckCircle2, Zap, Clock, Users,
    Trophy, ChevronRight, BookOpen, Star, AlertCircle, Code2
} from 'lucide-react'
import { Button } from '@repo/ui/components/ui/button'
import { Badge } from '@repo/ui/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui/components/ui/card'
import { Progress } from '@repo/ui/components/ui/progress'
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@repo/ui/components/ui/sheet'
import { enrollInForgeTrack } from '@/actions/(main)/challenges/forge.action'
import toast from '@repo/ui/components/ui/sonner'
import { cn } from '@repo/ui/lib/utils'

interface ForgeStep {
    id: string
    stepNumber: number
    title: string
    slug: string
    xpReward: number
    learningModules: Array<{
        id: string
        conceptName: string
    }>
}

interface ForgeTrack {
    id: string
    name: string
    slug: string
    description: string
    shortDescription?: string | null
    icon?: string | null
    themeColor: string
    technology: string
    level: string
    estimatedHours: number
    creditsRequired: number
    isFree: boolean
    totalXp: number
    enrollmentCount: number
    completionCount: number
    narrativeTitle?: string | null
    narrativePremise?: string | null
    steps: ForgeStep[]
    _count?: {
        steps: number
        enrollments: number
        completions: number
    }
}

interface Enrollment {
    id: string
    currentStepNumber: number
    completedSteps: number
    totalXpEarned: number
    isCompleted: boolean
}

interface StepProgress {
    [stepId: string]: {
        status: string
        xpEarned: number
    }
}

interface ForgeTrackClientProps {
    track: ForgeTrack
    enrollment: Enrollment | null
    stepProgress: StepProgress
    user: { id: string; name: string | null; image: string | null; credits: number } | null
}

const levelColors: Record<string, string> = {
    BEGINNER: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
    INTERMEDIATE: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
    ADVANCED: 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400',
}

export function ForgeTrackClient({
    track,
    enrollment,
    stepProgress,
    user
}: ForgeTrackClientProps) {
    const router = useRouter()
    const [enrolling, setEnrolling] = useState(false)
    const [showEnrollSheet, setShowEnrollSheet] = useState(false)

    const isEnrolled = !!enrollment
    const progress = enrollment 
        ? Math.round((enrollment.completedSteps / track.steps.length) * 100)
        : 0

    const canEnroll = user && (track.isFree || user.credits >= track.creditsRequired)

    const handleEnroll = async () => {
        if (!user) {
            router.push('/signin')
            return
        }

        setEnrolling(true)
        try {
            const result = await enrollInForgeTrack(track.id)
            if (result.success) {
                toast.success('Successfully enrolled!')
                setShowEnrollSheet(false)
                router.refresh()
            } else {
                toast.error(result.error || 'Failed to enroll')
            }
        } catch {
            toast.error('Something went wrong')
        } finally {
            setEnrolling(false)
        }
    }

    const getStepStatus = (step: ForgeStep, index: number) => {
        const progress = stepProgress[step.id]
        if (progress?.status === 'CORRECT') return 'completed'
        
        if (!isEnrolled) return 'locked'
        
        if (index === 0) return 'available'
        
        // Check if previous step is completed
        const prevStep = track.steps[index - 1]
        const prevProgress = stepProgress[prevStep.id]
        if (prevProgress?.status === 'CORRECT') return 'available'
        
        return 'locked'
    }

    return (
        <div className="min-h-screen bg-white dark:bg-neutral-950">
            {/* Hero Section */}
            <section 
                className="relative overflow-hidden border-b border-neutral-200 dark:border-neutral-800"
                style={{ 
                    background: `linear-gradient(to bottom, ${track.themeColor}10, transparent)` 
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
                        {/* Track Info */}
                        <div className="flex-1">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="text-5xl">{track.icon || '📘'}</span>
                                    <div>
                                        <Badge className={levelColors[track.level]}>
                                            {track.level}
                                        </Badge>
                                        <Badge variant="outline" className="ml-2">
                                            {track.technology}
                                        </Badge>
                                    </div>
                                </div>

                                <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white mb-3">
                                    {track.name}
                                </h1>
                                
                                {track.narrativeTitle && (
                                    <p className="text-lg text-neutral-600 dark:text-neutral-400 italic mb-4">
                                        "{track.narrativeTitle}"
                                    </p>
                                )}

                                <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                                    {track.description}
                                </p>

                                {/* Stats */}
                                <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-500 dark:text-neutral-400">
                                    <span className="flex items-center gap-1">
                                        <Code2 className="w-4 h-4" />
                                        {track.steps.length} steps
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-4 h-4" />
                                        ~{track.estimatedHours} hours
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Users className="w-4 h-4" />
                                        {track.enrollmentCount.toLocaleString()} enrolled
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Trophy className="w-4 h-4" />
                                        {track.totalXp} XP total
                                    </span>
                                </div>
                            </motion.div>
                        </div>

                        {/* Action Card */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="lg:w-80 flex-shrink-0"
                        >
                            <Card className="border-neutral-200 dark:border-neutral-800 shadow-lg">
                                <CardHeader className="pb-3">
                                    <CardTitle className="flex items-center gap-2">
                                        {track.isFree ? (
                                            <span className="text-emerald-600 dark:text-emerald-400">Free</span>
                                        ) : (
                                            <>
                                                <Zap className="w-5 h-5 text-amber-500" />
                                                <span>{track.creditsRequired} Credits</span>
                                            </>
                                        )}
                                    </CardTitle>
                                    <CardDescription>
                                        {isEnrolled 
                                            ? enrollment.isCompleted 
                                                ? 'You have completed this track!' 
                                                : 'Continue your journey'
                                            : 'Enroll to start learning'
                                        }
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {isEnrolled && (
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-neutral-500">Progress</span>
                                                <span className="font-semibold">{progress}%</span>
                                            </div>
                                            <Progress value={progress} className="h-2" />
                                            <p className="text-xs text-neutral-400">
                                                {enrollment.completedSteps} of {track.steps.length} steps completed
                                            </p>
                                        </div>
                                    )}

                                    {user && !track.isFree && !isEnrolled && (
                                        <div className="p-3 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
                                            <div className="text-sm text-neutral-500 mb-1">Your Credits</div>
                                            <div className="text-2xl font-bold text-neutral-900 dark:text-white">
                                                {user.credits}
                                            </div>
                                        </div>
                                    )}

                                    {isEnrolled ? (
                                        <Link href={`/challenges/forge/${track.slug}/step/${enrollment.currentStepNumber}`}>
                                            <Button 
                                                className="w-full gap-2"
                                                style={{ backgroundColor: track.themeColor }}
                                            >
                                                <Play className="w-4 h-4" />
                                                {enrollment.isCompleted ? 'Review Steps' : 'Continue'}
                                            </Button>
                                        </Link>
                                    ) : (
                                        <Sheet open={showEnrollSheet} onOpenChange={setShowEnrollSheet}>
                                            <SheetTrigger asChild>
                                                <Button 
                                                    className="w-full gap-2"
                                                    style={{ backgroundColor: track.themeColor }}
                                                    disabled={!canEnroll && !user}
                                                >
                                                    {user ? (
                                                        <>
                                                            <Zap className="w-4 h-4" />
                                                            {track.isFree ? 'Enroll Free' : `Enroll for ${track.creditsRequired} Credits`}
                                                        </>
                                                    ) : (
                                                        'Sign In to Enroll'
                                                    )}
                                                </Button>
                                            </SheetTrigger>
                                            <SheetContent>
                                                <SheetHeader>
                                                    <SheetTitle>Enroll in {track.name}</SheetTitle>
                                                    <SheetDescription>
                                                        {track.isFree 
                                                            ? 'Start your learning journey for free!'
                                                            : `This will cost ${track.creditsRequired} credits from your balance.`
                                                        }
                                                    </SheetDescription>
                                                </SheetHeader>

                                                <div className="mt-6 space-y-6">
                                                    <div className="p-4 bg-neutral-50 dark:bg-neutral-900 rounded-lg space-y-3">
                                                        <h4 className="font-semibold">What you'll get:</h4>
                                                        <ul className="space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
                                                            <li className="flex items-center gap-2">
                                                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                                                {track.steps.length} hands-on challenges
                                                            </li>
                                                            <li className="flex items-center gap-2">
                                                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                                                Interactive learning modules
                                                            </li>
                                                            <li className="flex items-center gap-2">
                                                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                                                {track.totalXp} XP upon completion
                                                            </li>
                                                            <li className="flex items-center gap-2">
                                                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                                                Completion certificate
                                                            </li>
                                                        </ul>
                                                    </div>

                                                    {!track.isFree && user && (
                                                        <div className="p-4 border border-neutral-200 dark:border-neutral-800 rounded-lg">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <span className="text-sm text-neutral-500">Your credits</span>
                                                                <span className="font-semibold">{user.credits}</span>
                                                            </div>
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-sm text-neutral-500">Cost</span>
                                                                <span className="font-semibold text-amber-600">-{track.creditsRequired}</span>
                                                            </div>
                                                            <div className="border-t border-neutral-200 dark:border-neutral-800 mt-2 pt-2">
                                                                <div className="flex items-center justify-between">
                                                                    <span className="text-sm font-medium">After enrollment</span>
                                                                    <span className="font-bold">{user.credits - track.creditsRequired}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {!canEnroll && !track.isFree && user && (
                                                        <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                                                            <div className="flex gap-2">
                                                                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                                                                <div className="text-sm text-red-900 dark:text-red-100">
                                                                    <p className="font-medium">Insufficient credits</p>
                                                                    <Link href="/purchase" className="underline">
                                                                        Purchase more credits
                                                                    </Link>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    <Button
                                                        className="w-full"
                                                        style={{ backgroundColor: track.themeColor }}
                                                        onClick={handleEnroll}
                                                        disabled={enrolling || (!track.isFree && !canEnroll)}
                                                    >
                                                        {enrolling ? (
                                                            <>
                                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                                                Enrolling...
                                                            </>
                                                        ) : (
                                                            'Confirm Enrollment'
                                                        )}
                                                    </Button>
                                                </div>
                                            </SheetContent>
                                        </Sheet>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Steps List */}
            <section className="py-12">
                <div className="max-w-5xl mx-auto px-4">
                    <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-6">
                        Course Steps
                    </h2>

                    <div className="space-y-4">
                        {track.steps.map((step, index) => {
                            const status = getStepStatus(step, index)
                            const isLocked = status === 'locked'
                            const isCompleted = status === 'completed'

                            return (
                                <motion.div
                                    key={step.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    {isLocked ? (
                                        <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 opacity-60">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center">
                                                    <Lock className="w-5 h-5 text-neutral-400" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm text-neutral-500">Step {step.stepNumber}</span>
                                                    </div>
                                                    <h3 className="font-semibold text-neutral-500 dark:text-neutral-400">
                                                        {step.title}
                                                    </h3>
                                                </div>
                                                <div className="text-sm text-neutral-400">
                                                    {step.xpReward} XP
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <Link href={`/challenges/forge/${track.slug}/step/${step.stepNumber}`}>
                                            <div className={cn(
                                                "p-4 rounded-xl border transition-all hover:shadow-md cursor-pointer",
                                                isCompleted 
                                                    ? "border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20"
                                                    : "border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-neutral-300 dark:hover:border-neutral-700"
                                            )}>
                                                <div className="flex items-center gap-4">
                                                    <div 
                                                        className={cn(
                                                            "w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold",
                                                            isCompleted ? "bg-emerald-500" : ""
                                                        )}
                                                        style={{ 
                                                            backgroundColor: isCompleted ? undefined : track.themeColor 
                                                        }}
                                                    >
                                                        {isCompleted ? (
                                                            <CheckCircle2 className="w-6 h-6" />
                                                        ) : (
                                                            step.stepNumber
                                                        )}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm text-neutral-500">Step {step.stepNumber}</span>
                                                            {isCompleted && (
                                                                <Badge className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs">
                                                                    Completed
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <h3 className="font-semibold text-neutral-900 dark:text-white">
                                                            {step.title}
                                                        </h3>
                                                        {step.learningModules.length > 0 && (
                                                            <div className="flex items-center gap-1 mt-1 text-xs text-neutral-500">
                                                                <BookOpen className="w-3 h-3" />
                                                                {step.learningModules.map(m => m.conceptName).join(', ')}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <div className="text-sm font-medium" style={{ color: track.themeColor }}>
                                                            {step.xpReward} XP
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

            {/* Narrative Section */}
            {track.narrativePremise && (
                <section className="py-12 bg-neutral-50 dark:bg-neutral-900/50 border-t border-neutral-200 dark:border-neutral-800">
                    <div className="max-w-3xl mx-auto px-4 text-center">
                        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">
                            The Story
                        </h2>
                        <p className="text-neutral-600 dark:text-neutral-400 italic leading-relaxed">
                            "{track.narrativePremise}"
                        </p>
                    </div>
                </section>
            )}
        </div>
    )
}


