"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
    ArrowLeft, Building2, Play, Clock, Users, Star, CheckCircle2, Lock,
    Sparkles, Award, TrendingUp, Target, ChevronRight, Video,
    MessageSquare, Code, Layout, Phone, FileText
} from "lucide-react"
import { Button } from "@repo/ui/components/ui/button"
import { Badge } from "@repo/ui/components/ui/badge"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"

import { LucideIcon } from "lucide-react"

interface Company {
    id: string
    name: string
    slug: string
    logo: string | null
    industry: string | null
    isVerified: boolean
}

interface InterviewRound {
    id: string
    roundNumber: number
    title: string
    roundType: string
    description: string | null
    durationMinutes: number | null
    hasMockInterview: boolean
    tipsForCandidates: string[] | null
}

interface InterviewProcess {
    id: string
    name: string
    description: string | null
    estimatedDurationWeeks: number | null
    rounds: InterviewRound[]
}

interface UserProgress {
    roundId: string
    sessionsCompleted: number
    bestScore: number | null
    lastPracticedAt: Date | null
}

interface MockHubData {
    processes: InterviewProcess[]
    userProgress: UserProgress[]
    stats: {
        totalSessions: number
        averageScore: number
        roundsAttempted: number
    }
}

interface CompanyMockHubContentProps {
    company: Company
    mockHub: MockHubData | null
}

const roundTypeIcons: Record<string, LucideIcon> = {
    PHONE_SCREEN: Phone,
    TECHNICAL_CODING: Code,
    SYSTEM_DESIGN: Layout,
    BEHAVIORAL: MessageSquare,
    TAKE_HOME: FileText,
    PANEL: Users,
    HIRING_MANAGER: Star,
    CULTURE_FIT: Users,
    HR_FINAL: Users,
    CUSTOM: FileText,
}

const roundTypeColors: Record<string, string> = {
    PHONE_SCREEN: "from-blue-500 to-blue-600",
    TECHNICAL_CODING: "from-purple-500 to-purple-600",
    SYSTEM_DESIGN: "from-orange-500 to-orange-600",
    BEHAVIORAL: "from-green-500 to-green-600",
    TAKE_HOME: "from-yellow-500 to-yellow-600",
    PANEL: "from-pink-500 to-pink-600",
    HIRING_MANAGER: "from-indigo-500 to-indigo-600",
    CULTURE_FIT: "from-teal-500 to-teal-600",
    HR_FINAL: "from-cyan-500 to-cyan-600",
    CUSTOM: "from-neutral-500 to-neutral-600",
}

export function CompanyMockHubContent({ company, mockHub }: CompanyMockHubContentProps) {
    const router = useRouter()
    const [selectedProcess, setSelectedProcess] = useState<string | null>(
        mockHub?.processes[0]?.id || null
    )

    const currentProcess = mockHub?.processes.find(p => p.id === selectedProcess)
    const progressMap = new Map(mockHub?.userProgress.map(p => [p.roundId, p]) || [])

    const getProgressForRound = (roundId: string) => {
        return progressMap.get(roundId)
    }

    if (!mockHub || mockHub.processes.length === 0) {
        return (
            <div className="min-h-full p-6 lg:p-8">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.back()}
                    className="gap-2 mb-6"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </Button>
                <div className="text-center py-16">
                    <div className="w-20 h-20 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto mb-6">
                        <Lock className="w-10 h-10 text-neutral-400" />
                    </div>
                    <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
                        No Mock Interviews Available
                    </h2>
                    <p className="text-neutral-500 max-w-md mx-auto mb-6">
                        {company.name} hasn&apos;t configured their interview process for mock interviews yet.
                        Check back later!
                    </p>
                    <Link href={`/companies/${company.slug}`}>
                        <Button variant="outline" className="rounded-xl">
                            View Company Profile
                        </Button>
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-full">
            <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.back()}
                        className="gap-2 mb-6 text-white/80 hover:text-white hover:bg-white/10"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </Button>
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center overflow-hidden relative">
                            {
                                company.logo ? (
                                    <Image src={company.logo} alt={company.name} fill className="object-cover" />
                                ) : (
                                    <Building2 className="w-8 h-8 text-neutral-400" />
                                )
                            }
                        </div>
                        <div>
                            <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-2">
                                {company.name} Mock Hub
                                {
                                    company.isVerified && (
                                        <CheckCircle2 className="w-6 h-6 text-blue-300" />
                                    )
                                }
                            </h1>
                            <p className="text-white/80">
                                Practice AI interviews tailored to their process
                            </p>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                            <div className="flex items-center gap-2 mb-1">
                                <Video className="w-4 h-4 text-white/70" />
                                <span className="text-sm text-white/70">Sessions</span>
                            </div>
                            <p className="text-2xl font-bold">{mockHub.stats.totalSessions}</p>
                        </div>
                        <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                            <div className="flex items-center gap-2 mb-1">
                                <TrendingUp className="w-4 h-4 text-white/70" />
                                <span className="text-sm text-white/70">Avg. Score</span>
                            </div>
                            <p className="text-2xl font-bold">{mockHub.stats.averageScore}%</p>
                        </div>
                        <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                            <div className="flex items-center gap-2 mb-1">
                                <Target className="w-4 h-4 text-white/70" />
                                <span className="text-sm text-white/70">Rounds Practiced</span>
                            </div>
                            <p className="text-2xl font-bold">{mockHub.stats.roundsAttempted}</p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {
                    mockHub.processes.length > 1 && (
                        <div className="mb-8">
                            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-3">
                                Select Interview Process
                            </h2>
                            <div className="flex flex-wrap gap-3">
                                {
                                    mockHub.processes.map((process) => (
                                        <Button
                                            key={process.id}
                                            variant={selectedProcess === process.id ? "default" : "outline"}
                                            onClick={() => setSelectedProcess(process.id)}
                                            className="rounded-xl"
                                        >
                                            {process.name}
                                            <Badge variant="secondary" className="ml-2">
                                                {process.rounds.length} rounds
                                            </Badge>
                                        </Button>
                                    ))
                                }
                            </div>
                        </div>
                    )
                }
                {
                    currentProcess && (
                        <motion.div
                            key={currentProcess.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <div className="mb-6">
                                <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
                                    {currentProcess.name}
                                </h2>
                                {
                                    currentProcess.description && (
                                        <p className="text-neutral-500">{currentProcess.description}</p>
                                    )
                                }
                                {
                                    currentProcess.estimatedDurationWeeks && (
                                        <div className="flex items-center gap-2 text-sm text-neutral-500 mt-2">
                                            <Clock className="w-4 h-4" />
                                            <span>Estimated: {currentProcess.estimatedDurationWeeks} weeks</span>
                                        </div>
                                    )
                                }
                            </div>
                            <div className="grid gap-4">
                                {
                                    currentProcess.rounds.map((round, index) => {
                                        const IconComponent = roundTypeIcons[round.roundType] ?? FileText
                                        const colorClass = roundTypeColors[round.roundType] ?? "from-neutral-500 to-neutral-600"
                                        const progress = getProgressForRound(round.id)

                                        return (
                                            <motion.div
                                                key={round.id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                                className="group bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 hover:shadow-lg hover:border-neutral-300 dark:hover:border-neutral-700 transition-all"
                                            >
                                                <div className="flex items-start gap-4">
                                                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${colorClass} flex items-center justify-center shrink-0 shadow-lg`}>
                                                        {IconComponent && <IconComponent className="w-7 h-7 text-white" />}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <Badge variant="outline" className="text-xs">
                                                                Round {round.roundNumber}
                                                            </Badge>
                                                            {
                                                                round.durationMinutes && (
                                                                    <span className="text-xs text-neutral-500">
                                                                        {round.durationMinutes} min
                                                                    </span>
                                                                )
                                                            }
                                                            {
                                                                progress && progress.bestScore !== null && (
                                                                    <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                                                        Best: {progress.bestScore}%
                                                                    </Badge>
                                                                )
                                                            }
                                                        </div>
                                                        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-1">
                                                            {round.title}
                                                        </h3>
                                                        {
                                                            round.description && (
                                                                <p className="text-sm text-neutral-500 mb-3 line-clamp-2">
                                                                    {round.description}
                                                                </p>
                                                            )
                                                        }
                                                        {
                                                            progress && progress.sessionsCompleted > 0 && (
                                                                <div className="mb-3">
                                                                    <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
                                                                        <span>{progress.sessionsCompleted} sessions completed</span>
                                                                        {
                                                                            progress.lastPracticedAt && (
                                                                                <span>Last: {new Date(progress.lastPracticedAt).toLocaleDateString()}</span>
                                                                            )
                                                                        }
                                                                    </div>
                                                                </div>
                                                            )
                                                        }
                                                        {
                                                            round.tipsForCandidates && round.tipsForCandidates.length > 0 && (
                                                                <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400">
                                                                    <Sparkles className="w-3 h-3" />
                                                                    <span>{round.tipsForCandidates.length} tips from the team</span>
                                                                </div>
                                                            )
                                                        }
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        {
                                                            round.hasMockInterview ? (
                                                                <Button
                                                                    className="rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:text-black dark:hover:bg-neutral-200 gap-2"
                                                                    onClick={() => router.push(`/mock/company/${company.slug}?round=${round.id}`)}
                                                                >
                                                                    <Play className="w-4 h-4" />
                                                                    Practice
                                                                </Button>
                                                            ) : (
                                                                <Badge variant="outline" className="text-neutral-500">
                                                                    <Lock className="w-3 h-3 mr-1" />
                                                                    Coming Soon
                                                                </Badge>
                                                            )
                                                        }
                                                        <ChevronRight className="w-5 h-5 text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors" />
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )
                                    })
                                }
                            </div>
                        </motion.div>
                    )
                }
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mt-10 p-6 rounded-2xl bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-200 dark:border-purple-800"
                >
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shrink-0">
                            <Award className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-neutral-900 dark:text-white mb-1">
                                Ready to Apply?
                            </h3>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                                After practicing, you&apos;ll be better prepared for the real interviews.
                                Check out open positions at {company.name}!
                            </p>
                            <Link href={`/companies/${company.slug}`}>
                                <Button className="rounded-xl">
                                    View Open Positions
                                    <ChevronRight className="w-4 h-4 ml-1" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}