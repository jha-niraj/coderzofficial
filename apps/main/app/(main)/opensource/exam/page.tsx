'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useSession } from '@repo/auth/client'
import {
    Trophy, Award, Brain, Terminal, Mic, Clock, CheckCircle2,
    XCircle, ArrowRight, Loader2, Crown, Medal, Star,
    GraduationCap, Coins, AlertTriangle, Users
} from 'lucide-react'
import {
    Card, CardContent, CardHeader, CardTitle, CardDescription
} from '@repo/ui/components/ui/card'
import { Button } from '@repo/ui/components/ui/button'
import { Badge } from '@repo/ui/components/ui/badge'
import { Progress } from '@repo/ui/components/ui/progress'
import { ScrollArea } from '@repo/ui/components/ui/scroll-area'
import {
    Avatar, AvatarFallback, AvatarImage
} from '@repo/ui/components/ui/avatar'
import { Separator } from '@repo/ui/components/ui/separator'
import { cn } from '@repo/ui/lib/utils'
import toast from '@repo/ui/components/ui/sonner'
import {
    checkExamEligibility, getUserExamHistory, getExamLeaderboard
} from '@/actions/(main)/opensource'
import { useUserStore } from '@/app/store/useUserStore'

const RETAKE_COST = 30 // Credits required for retake

interface ExamHistory {
    id: string
    status: string
    totalScore: number | null
    quizScore: number | null
    codeScore: number | null
    scenarioScore: number | null
    completedAt: Date | null
    attemptNumber: number
}

interface LeaderboardEntry {
    rank: number
    userId: string
    username: string | null
    name: string | null
    image: string | null
    score: number
    certifiedAt: Date
}

export default function ExamLandingPage() {
    const router = useRouter()
    const { status } = useSession()
    const { user } = useUserStore()

    const [loading, setLoading] = useState(true)
    const [eligibility, setEligibility] = useState<{
        eligible: boolean
        message: string
        modulesCompleted: number
        totalModules: number
        canRetakeAt?: Date
    } | null>(null)
    const [examHistory, setExamHistory] = useState<{
        history: ExamHistory[]
        bestScore?: number
        lastAttempt?: Date | null
        isCertified?: boolean
        certificateId?: string | null
    } | null>(null)
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
    const [currentUserRank, setCurrentUserRank] = useState<number | undefined>()

    useEffect(() => {
        const fetchData = async () => {
            if (status !== 'authenticated') {
                setLoading(false)
                return
            }

            try {
                const [eligibilityResult, historyResult, leaderboardResult] = await Promise.all([
                    checkExamEligibility(),
                    getUserExamHistory(),
                    getExamLeaderboard()
                ])

                if (eligibilityResult) {
                    setEligibility({
                        eligible: eligibilityResult.eligible,
                        message: eligibilityResult.message,
                        modulesCompleted: eligibilityResult.modulesCompleted,
                        totalModules: eligibilityResult.totalModules,
                        canRetakeAt: eligibilityResult.canRetakeAt
                    })
                }

                if (historyResult.success) {
                    setExamHistory({
                        history: historyResult.history || [],
                        bestScore: historyResult.bestScore,
                        lastAttempt: historyResult.lastAttempt,
                        isCertified: historyResult.isCertified,
                        certificateId: historyResult.certificateId
                    })
                }

                if (leaderboardResult.success) {
                    setLeaderboard(leaderboardResult.leaderboard || [])
                    setCurrentUserRank(leaderboardResult.currentUserRank)
                }
            } catch (error) {
                console.error('Error fetching data:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [status])

    const hasTakenExam = examHistory && examHistory.history.length > 0
    const hasPassed = examHistory?.isCertified
    const needsRetake = hasTakenExam && !hasPassed
    const canAffordRetake = user && (user.credits ?? 0) >= RETAKE_COST

    const handleStartExam = () => {
        if (needsRetake && !canAffordRetake) {
            toast.error(`You need ${RETAKE_COST} credits to retake the exam`)
            return
        }
        router.push('/opensource/exam/details')
    }

    const getRankIcon = (rank: number) => {
        if (rank === 1) return <Crown className="w-5 h-5 text-yellow-500" />
        if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />
        if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />
        return <span className="text-sm font-medium text-neutral-500">#{rank}</span>
    }

    const getRankBgColor = (rank: number) => {
        if (rank === 1) return 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border-yellow-500/30'
        if (rank === 2) return 'bg-gradient-to-r from-gray-400/20 to-gray-500/20 border-gray-400/30'
        if (rank === 3) return 'bg-gradient-to-r from-amber-600/20 to-orange-600/20 border-amber-600/30'
        return ''
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white dark:bg-neutral-950">
                <div className="text-center">
                    <Loader2 className="w-10 h-10 animate-spin text-purple-500 mx-auto mb-4" />
                    <p className="text-black dark:text-white">Loading exam data...</p>
                </div>
            </div>
        )
    }

    if (status !== 'authenticated') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900/30 to-slate-900">
                <Card className="max-w-md bg-neutral-900/80 border-neutral-800">
                    <CardHeader className="text-center">
                        <GraduationCap className="w-12 h-12 mx-auto mb-4 text-purple-500" />
                        <CardTitle className="text-white">Sign In Required</CardTitle>
                        <CardDescription>Please sign in to access the certification exam</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button
                            onClick={() => router.push('/signin?callbackUrl=/opensource/exam')}
                            className="w-full cursor-pointer"
                        >
                            Sign In
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/30 to-slate-900">
            <div className="border-b border-white/10 bg-black/30 backdrop-blur-xl">
                <div className="container max-w-7xl mx-auto px-4 py-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20">
                            <GraduationCap className="w-8 h-8 text-purple-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">Git Certification Exam</h1>
                            <p className="text-white/60">Prove your Git & GitHub expertise</p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="container max-w-7xl mx-auto px-4 py-8">
                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        {
                            hasTakenExam && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    <Card className={cn(
                                        "bg-neutral-900/80 border-2",
                                        hasPassed ? "border-green-500/50" : "border-orange-500/50"
                                    )}>
                                        <CardContent className="p-6">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className={cn(
                                                        "p-4 rounded-full",
                                                        hasPassed
                                                            ? "bg-green-500/20"
                                                            : "bg-orange-500/20"
                                                    )}>
                                                        {
                                                            hasPassed ? (
                                                                <Trophy className="w-8 h-8 text-green-500" />
                                                            ) : (
                                                                <AlertTriangle className="w-8 h-8 text-orange-500" />
                                                            )
                                                        }
                                                    </div>
                                                    <div>
                                                        <h3 className="text-xl font-bold text-white">
                                                            {hasPassed ? 'Certified!' : 'Not Yet Certified'}
                                                        </h3>
                                                        <p className="text-white/60">
                                                            {hasPassed
                                                                ? `Certificate ID: ${examHistory.certificateId}`
                                                                : 'Complete the exam with 80% or higher to get certified'
                                                            }
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-4xl font-bold text-white">
                                                        {examHistory.bestScore || 0}%
                                                    </p>
                                                    <p className="text-sm text-white/60">Best Score</p>
                                                </div>
                                            </div>

                                            {
                                                examHistory.history[0] && examHistory.history[0].quizScore !== null && (
                                                    <div className="mt-6 grid grid-cols-3 gap-4">
                                                        <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <Brain className="w-4 h-4 text-blue-400" />
                                                                <span className="text-xs text-blue-300">Quiz</span>
                                                            </div>
                                                            <p className="text-lg font-bold text-white">
                                                                {examHistory.history[0].quizScore}%
                                                            </p>
                                                        </div>
                                                        <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <Terminal className="w-4 h-4 text-green-400" />
                                                                <span className="text-xs text-green-300">Coding</span>
                                                            </div>
                                                            <p className="text-lg font-bold text-white">
                                                                {examHistory.history[0].codeScore}%
                                                            </p>
                                                        </div>
                                                        <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <Mic className="w-4 h-4 text-purple-400" />
                                                                <span className="text-xs text-purple-300">Voice</span>
                                                            </div>
                                                            <p className="text-lg font-bold text-white">
                                                                {examHistory.history[0].scenarioScore}%
                                                            </p>
                                                        </div>
                                                    </div>
                                                )
                                            }
                                            {
                                                needsRetake && (
                                                    <div className="mt-6 p-4 rounded-lg bg-white/5 border border-white/10">
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <p className="text-sm font-medium text-white">Want to try again?</p>
                                                                <p className="text-xs text-white/60 flex items-center gap-1">
                                                                    <Coins className="w-3 h-3" />
                                                                    Retake costs {RETAKE_COST} credits
                                                                    {
                                                                        user && (
                                                                            <span className="ml-1">
                                                                                (You have {user.credits} credits)
                                                                            </span>
                                                                        )
                                                                    }
                                                                </p>
                                                            </div>
                                                            <Button
                                                                onClick={handleStartExam}
                                                                disabled={!canAffordRetake}
                                                                className="cursor-pointer"
                                                            >
                                                                <Coins className="w-4 h-4 mr-2" />
                                                                Retake Exam
                                                            </Button>
                                                        </div>
                                                    </div>
                                                )
                                            }
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            )
                        }

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <Card className="bg-neutral-900/80 border-neutral-800">
                                <CardHeader>
                                    <CardTitle className="text-white flex items-center gap-2">
                                        <Award className="w-5 h-5 text-purple-500" />
                                        3-Phase Certification Exam
                                    </CardTitle>
                                    <CardDescription>
                                        Complete all three phases to earn your Git certification
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid md:grid-cols-3 gap-4">
                                        <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Brain className="w-5 h-5 text-blue-400" />
                                                <span className="font-medium text-white">Quiz Phase</span>
                                            </div>
                                            <p className="text-sm text-white/60 mb-2">
                                                18 multiple choice questions on Git concepts
                                            </p>
                                            <Badge className="bg-blue-500/20 text-blue-300">30% Weight</Badge>
                                        </div>
                                        <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Terminal className="w-5 h-5 text-green-400" />
                                                <span className="font-medium text-white">Coding Phase</span>
                                            </div>
                                            <p className="text-sm text-white/60 mb-2">
                                                5 practical Git command challenges
                                            </p>
                                            <Badge className="bg-green-500/20 text-green-300">35% Weight</Badge>
                                        </div>
                                        <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Mic className="w-5 h-5 text-purple-400" />
                                                <span className="font-medium text-white">Voice Phase</span>
                                            </div>
                                            <p className="text-sm text-white/60 mb-2">
                                                5-7 min AI interview on Git workflows
                                            </p>
                                            <Badge className="bg-purple-500/20 text-purple-300">35% Weight</Badge>
                                        </div>
                                    </div>
                                    <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                                        <h4 className="font-medium text-white mb-3">Requirements</h4>
                                        <ul className="space-y-2 text-sm text-white/70">
                                            <li className="flex items-center gap-2">
                                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                                Score 80% or higher to pass
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                                Complete all three phases in one session
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                                Switch between phases freely during exam
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <Clock className="w-4 h-4 text-yellow-500" />
                                                Estimated time: 30-45 minutes
                                            </li>
                                        </ul>
                                    </div>

                                    {
                                        eligibility && (
                                            <div className={cn(
                                                "p-4 rounded-lg border",
                                                eligibility.eligible
                                                    ? "bg-green-500/10 border-green-500/30"
                                                    : "bg-yellow-500/10 border-yellow-500/30"
                                            )}>
                                                <div className="flex items-center gap-2 mb-2">
                                                    {
                                                        eligibility.eligible ? (
                                                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                                                        ) : (
                                                            <AlertTriangle className="w-5 h-5 text-yellow-500" />
                                                        )
                                                    }
                                                    <span className={cn(
                                                        "font-medium",
                                                        eligibility.eligible ? "text-green-300" : "text-yellow-300"
                                                    )}>
                                                        {eligibility.message}
                                                    </span>
                                                </div>
                                                <Progress
                                                    value={(eligibility.modulesCompleted / eligibility.totalModules) * 100}
                                                    className="h-2 mt-2"
                                                />
                                                <p className="text-xs text-white/50 mt-1">
                                                    {eligibility.modulesCompleted}/{eligibility.totalModules} modules completed
                                                </p>
                                            </div>
                                        )}

                                    {
                                        !hasTakenExam && (
                                            <Button
                                                size="lg"
                                                onClick={handleStartExam}
                                                disabled={!eligibility?.eligible}
                                                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 cursor-pointer"
                                            >
                                                <Star className="w-5 h-5 mr-2" />
                                                Start Certification Exam
                                                <ArrowRight className="w-5 h-5 ml-2" />
                                            </Button>
                                        )
                                    }
                                    {
                                        hasPassed && (
                                            <Button
                                                variant="outline"
                                                onClick={handleStartExam}
                                                className="w-full cursor-pointer"
                                            >
                                                <Trophy className="w-5 h-5 mr-2" />
                                                Retake to Improve Score
                                            </Button>
                                        )
                                    }
                                </CardContent>
                            </Card>
                        </motion.div>

                        {
                            examHistory && examHistory.history.length > 1 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    <Card className="bg-neutral-900/80 border-neutral-800">
                                        <CardHeader>
                                            <CardTitle className="text-white text-lg">Previous Attempts</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-2">
                                                {
                                                    examHistory.history.slice(1).map((attempt) => (
                                                        <div
                                                            key={attempt.id}
                                                            className="flex items-center justify-between p-3 rounded-lg bg-white/5"
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                {
                                                                    attempt.status === 'PASSED' ? (
                                                                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                                                                    ) : (
                                                                        <XCircle className="w-5 h-5 text-red-500" />
                                                                    )
                                                                }
                                                                <div>
                                                                    <p className="text-sm text-white">Attempt #{attempt.attemptNumber}</p>
                                                                    <p className="text-xs text-white/50">
                                                                        {
                                                                            attempt.completedAt
                                                                                ? new Date(attempt.completedAt).toLocaleDateString()
                                                                                : 'Not completed'
                                                                        }
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <Badge className={cn(
                                                                attempt.status === 'PASSED'
                                                                    ? "bg-green-500/20 text-green-300"
                                                                    : "bg-red-500/20 text-red-300"
                                                            )}>
                                                                {attempt.totalScore || 0}%
                                                            </Badge>
                                                        </div>
                                                    ))
                                                }
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            )
                        }
                    </div>
                    <div className="lg:col-span-1">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="sticky top-4"
                        >
                            <Card className="bg-neutral-900/80 border-neutral-800">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-white flex items-center gap-2">
                                        <Users className="w-5 h-5 text-yellow-500" />
                                        Certification Leaderboard
                                    </CardTitle>
                                    <CardDescription>
                                        Top certified Git developers
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <ScrollArea className="h-[500px]">
                                        <div className="px-4 pb-4 space-y-2">
                                            {
                                                leaderboard.length === 0 ? (
                                                    <div className="text-center py-8">
                                                        <Trophy className="w-10 h-10 mx-auto mb-3 text-neutral-600" />
                                                        <p className="text-sm text-white/50">
                                                            No certifications yet. Be the first!
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <>
                                                        {
                                                            leaderboard.map((entry) => {
                                                                const isCurrentUser = user?.id === entry.userId
                                                                return (
                                                                    <div
                                                                        key={entry.userId}
                                                                        className={cn(
                                                                            "flex items-center gap-3 p-3 rounded-lg border transition-all",
                                                                            getRankBgColor(entry.rank),
                                                                            isCurrentUser && "ring-2 ring-purple-500 ring-offset-2 ring-offset-neutral-900",
                                                                            !getRankBgColor(entry.rank) && "bg-white/5 border-white/10"
                                                                        )}
                                                                    >
                                                                        <div className="w-8 flex justify-center">
                                                                            {getRankIcon(entry.rank)}
                                                                        </div>
                                                                        <Avatar className="w-8 h-8">
                                                                            <AvatarImage src={entry.image || undefined} />
                                                                            <AvatarFallback className="bg-neutral-700 text-xs">
                                                                                {(entry.name || entry.username || 'U').charAt(0).toUpperCase()}
                                                                            </AvatarFallback>
                                                                        </Avatar>
                                                                        <div className="flex-1 min-w-0">
                                                                            <p className={cn(
                                                                                "text-sm font-medium truncate",
                                                                                isCurrentUser ? "text-purple-300" : "text-white"
                                                                            )}>
                                                                                {entry.name || entry.username || 'Anonymous'}
                                                                                {isCurrentUser && <span className="text-xs ml-1">(You)</span>}
                                                                            </p>
                                                                            <p className="text-xs text-white/50">
                                                                                {new Date(entry.certifiedAt).toLocaleDateString()}
                                                                            </p>
                                                                        </div>
                                                                        <div className="text-right">
                                                                            <p className="text-sm font-bold text-white">{entry.score}%</p>
                                                                        </div>
                                                                    </div>
                                                                )
                                                            })
                                                        }
                                                        {
                                                            currentUserRank && currentUserRank > 50 && user && (
                                                                <>
                                                                    <Separator className="my-2 bg-white/10" />
                                                                    <div className="flex items-center gap-3 p-3 rounded-lg bg-purple-500/10 border border-purple-500/30">
                                                                        <div className="w-8 flex justify-center">
                                                                            <span className="text-sm font-medium text-purple-300">
                                                                                #{currentUserRank}
                                                                            </span>
                                                                        </div>
                                                                        <Avatar className="w-8 h-8">
                                                                            <AvatarImage src={user.image || undefined} />
                                                                            <AvatarFallback className="bg-purple-700 text-xs">
                                                                                {(user.name || user.username || 'U').charAt(0).toUpperCase()}
                                                                            </AvatarFallback>
                                                                        </Avatar>
                                                                        <div className="flex-1 min-w-0">
                                                                            <p className="text-sm font-medium text-purple-300 truncate">
                                                                                {user.name || user.username} (You)
                                                                            </p>
                                                                        </div>
                                                                        <div className="text-right">
                                                                            <p className="text-sm font-bold text-white">
                                                                                {examHistory?.bestScore || 0}%
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                </>
                                                            )
                                                        }
                                                    </>
                                                )
                                            }
                                        </div>
                                    </ScrollArea>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    )
}