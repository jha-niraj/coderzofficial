"use client"

import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import {
    ArrowLeft, Building2, CheckCircle2, Clock, Mic, FileText,
    Video, Users, Code, Phone, Briefcase, MessageSquare,
    ClipboardList, Target, Award, Lightbulb, HelpCircle,
    BookOpen, ExternalLink, Play
} from "lucide-react"
import { Button } from "@repo/ui/components/ui/button"
import { Badge } from "@repo/ui/components/ui/badge"
import { Separator } from "@repo/ui/components/ui/separator"
import type { LucideIcon } from "lucide-react"

export interface InterviewRound {
    id: string
    roundNumber: number
    roundType: string
    title: string
    description: string
    durationMinutes: number | null
    format: string
    hasMockInterview: boolean
    whatToExpect: string[]
    sampleQuestions: string[]
    evaluationCriteria: string[]
    topicsCovered: string[]
    tipsForCandidates: string[]
}

export interface InterviewProcess {
    id: string
    name: string
    rounds: InterviewRound[]
}

export interface Job {
    id: string
    title: string
    slug: string
    company: {
        id: string
        name: string
        slug: string | null
        logoUrl: string | null
    }
    interviewProcess: InterviewProcess | null
}

export interface PrepProgress {
    id: string
    roundsCompleted?: number | number[]
}

export interface Application {
    id: string
    status: string
    interviewScheduledAt: Date | null
    job: Job
    prepProgress: PrepProgress | null
}

interface RoundContentProps {
    application: Application
    round: InterviewRound
}

const roundTypeIcons: Record<string, LucideIcon> = {
    PHONE_SCREEN: Phone,
    TECHNICAL_CODING: Code,
    SYSTEM_DESIGN: Target,
    BEHAVIORAL: Users,
    TAKE_HOME: ClipboardList,
    PANEL: Users,
    HIRING_MANAGER: Briefcase,
    CULTURE_FIT: MessageSquare,
    HR_FINAL: Award,
    CUSTOM: FileText,
}

const roundTypeLabels: Record<string, string> = {
    PHONE_SCREEN: "Phone Screen",
    TECHNICAL_CODING: "Technical Coding",
    SYSTEM_DESIGN: "System Design",
    BEHAVIORAL: "Behavioral",
    TAKE_HOME: "Take Home",
    PANEL: "Panel Interview",
    HIRING_MANAGER: "Hiring Manager",
    CULTURE_FIT: "Culture Fit",
    HR_FINAL: "HR Final",
    CUSTOM: "Custom Round",
}

const formatLabels: Record<string, { label: string; icon: LucideIcon }> = {
    VOICE: { label: "Voice Call", icon: Phone },
    VIDEO: { label: "Video Call", icon: Video },
    IN_PERSON: { label: "In Person", icon: Users },
    TAKE_HOME: { label: "Take Home", icon: ClipboardList },
    LIVE_CODING: { label: "Live Coding", icon: Code },
    WHITEBOARD: { label: "Whiteboard", icon: FileText },
}

export function RoundContent({ application, round }: RoundContentProps) {
    const router = useRouter()
    const { job } = application

    const Icon = roundTypeIcons[round.roundType] || FileText
    const formatInfo = formatLabels[round.format] || { label: round.format, icon: Video }
    const FormatIcon = formatInfo.icon

    // Check if this round is completed
    const completedRounds = application.prepProgress?.roundsCompleted 
        ? (Array.isArray(application.prepProgress.roundsCompleted) 
            ? application.prepProgress.roundsCompleted 
            : Array.from({ length: application.prepProgress.roundsCompleted }, (_, i) => i + 1))
        : []
    const isCompleted = completedRounds.includes(round.roundNumber)

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
            {/* Header */}
            <div className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-6 py-4">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.push(`/jobs/applications/${application.id}/interview`)}
                            className="rounded-xl"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <div className="flex items-center gap-3 flex-1">
                            <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center overflow-hidden">
                                {job.company.logoUrl ? (
                                    <Image
                                        src={job.company.logoUrl}
                                        alt={job.company.name}
                                        width={40}
                                        height={40}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <Building2 className="w-5 h-5 text-neutral-400" />
                                )}
                            </div>
                            <div>
                                <h1 className="text-lg font-semibold text-neutral-900 dark:text-white">
                                    Round {round.roundNumber}: {round.title}
                                </h1>
                                <p className="text-sm text-neutral-500">{job.title} • {job.company.name}</p>
                            </div>
                        </div>
                        {isCompleted ? (
                            <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Completed
                            </Badge>
                        ) : (
                            <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                Upcoming
                            </Badge>
                        )}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-6 py-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                >
                    {/* Round Overview Card */}
                    <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6">
                        <div className="flex items-start gap-4 mb-6">
                            <div className="w-14 h-14 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                <Icon className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="flex-1">
                                <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-1">
                                    {round.title}
                                </h2>
                                <p className="text-neutral-500">
                                    {roundTypeLabels[round.roundType] || round.roundType}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                            <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800">
                                <div className="flex items-center gap-2 text-neutral-500 mb-1">
                                    <Clock className="w-4 h-4" />
                                    <span className="text-xs font-medium">Duration</span>
                                </div>
                                <p className="text-neutral-900 dark:text-white font-semibold">
                                    {round.durationMinutes || 45} minutes
                                </p>
                            </div>
                            <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800">
                                <div className="flex items-center gap-2 text-neutral-500 mb-1">
                                    <FormatIcon className="w-4 h-4" />
                                    <span className="text-xs font-medium">Format</span>
                                </div>
                                <p className="text-neutral-900 dark:text-white font-semibold">
                                    {formatInfo.label}
                                </p>
                            </div>
                            {round.hasMockInterview && (
                                <div className="p-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800">
                                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400 mb-1">
                                        <Mic className="w-4 h-4" />
                                        <span className="text-xs font-medium">Mock Available</span>
                                    </div>
                                    <p className="text-green-700 dark:text-green-300 font-semibold">
                                        Practice Ready
                                    </p>
                                </div>
                            )}
                        </div>

                        {round.description && (
                            <p className="text-neutral-600 dark:text-neutral-400">
                                {round.description}
                            </p>
                        )}
                    </div>

                    {/* What to Expect */}
                    {round.whatToExpect && round.whatToExpect.length > 0 && (
                        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6">
                            <h3 className="font-semibold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-blue-500" />
                                What to Expect
                            </h3>
                            <ul className="space-y-3">
                                {round.whatToExpect.map((item, index) => (
                                    <li key={index} className="flex items-start gap-3">
                                        <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-xs font-semibold text-blue-700 dark:text-blue-400 shrink-0">
                                            {index + 1}
                                        </div>
                                        <span className="text-neutral-700 dark:text-neutral-300">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Topics Covered */}
                    {round.topicsCovered && round.topicsCovered.length > 0 && (
                        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6">
                            <h3 className="font-semibold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
                                <Target className="w-5 h-5 text-purple-500" />
                                Topics Covered
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {round.topicsCovered.map((topic, index) => (
                                    <Badge key={index} variant="secondary" className="px-3 py-1">
                                        {topic}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Sample Questions */}
                    {round.sampleQuestions && round.sampleQuestions.length > 0 && (
                        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6">
                            <h3 className="font-semibold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
                                <HelpCircle className="w-5 h-5 text-amber-500" />
                                Sample Questions
                            </h3>
                            <div className="space-y-3">
                                {round.sampleQuestions.map((question, index) => (
                                    <div key={index} className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800">
                                        <p className="text-neutral-800 dark:text-neutral-200">
                                            <span className="font-semibold text-amber-700 dark:text-amber-400">Q{index + 1}:</span> {question}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Evaluation Criteria */}
                    {round.evaluationCriteria && round.evaluationCriteria.length > 0 && (
                        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6">
                            <h3 className="font-semibold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                                Evaluation Criteria
                            </h3>
                            <ul className="space-y-2">
                                {round.evaluationCriteria.map((criteria, index) => (
                                    <li key={index} className="flex items-start gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                                        <span className="text-neutral-700 dark:text-neutral-300">{criteria}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Tips for Candidates */}
                    {round.tipsForCandidates && round.tipsForCandidates.length > 0 && (
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl border border-blue-100 dark:border-blue-800 p-6">
                            <h3 className="font-semibold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
                                <Lightbulb className="w-5 h-5 text-yellow-500" />
                                Tips for Success
                            </h3>
                            <ul className="space-y-3">
                                {round.tipsForCandidates.map((tip, index) => (
                                    <li key={index} className="flex items-start gap-3">
                                        <div className="w-6 h-6 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center shrink-0">
                                            <Lightbulb className="w-3 h-3 text-yellow-600 dark:text-yellow-400" />
                                        </div>
                                        <span className="text-neutral-700 dark:text-neutral-300">{tip}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center gap-4">
                        {round.hasMockInterview && !isCompleted && (
                            <Link href={`/companies/${job.company.slug}/mock`}>
                                <Button size="lg" className="rounded-xl">
                                    <Mic className="w-5 h-5 mr-2" />
                                    Practice Mock Interview
                                </Button>
                            </Link>
                        )}
                        <Link href={`/jobs/applications/${application.id}/interview`}>
                            <Button size="lg" variant="outline" className="rounded-xl">
                                <ArrowLeft className="w-5 h-5 mr-2" />
                                Back to Overview
                            </Button>
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
