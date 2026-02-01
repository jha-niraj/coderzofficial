"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    ArrowLeft, FileText, Building2, MapPin, Clock, Briefcase,
    ChevronRight, CheckCircle2, XCircle, Mic, Play, Target,
    Calendar, AlertCircle, Loader2
} from "lucide-react"
import { Button } from "@repo/ui/components/ui/button"
import { Badge } from "@repo/ui/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/components/ui/tabs"
import { Progress } from "@repo/ui/components/ui/progress"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface Application {
    id: string
    status: string
    appliedAt: Date | null
    updatedAt: Date
    job: {
        id: string
        title: string
        slug: string
        location: string | null
        locationType: string
        employmentType: string
        company: {
            id: string
            name: string
            logoUrl: string | null
        }
        interviewProcess: {
            id: string
            name: string
            rounds: Array<{
                id: string
                roundNumber: number
                title: string
                roundType: string
                hasMockInterview: boolean
            }>
        } | null
    }
    prepProgress: {
        id: string
        readinessScore: number
        mockSessionsCompleted: number
        roundsCompleted: number[]
    } | null
}

interface ApplicationsContentProps {
    applications: Application[]
}

const statusColors: Record<string, string> = {
    INTERESTED: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    PREPARING: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    APPLIED: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    SCREENING: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
    INTERVIEWING: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    OFFERED: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    ACCEPTED: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    REJECTED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    WITHDRAWN: "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-400",
}

const statusLabels: Record<string, string> = {
    INTERESTED: "Interested",
    PREPARING: "Preparing",
    APPLIED: "Applied",
    SCREENING: "Screening",
    INTERVIEWING: "Interviewing",
    OFFERED: "Offer Received",
    ACCEPTED: "Accepted",
    REJECTED: "Not Selected",
    WITHDRAWN: "Withdrawn",
}

const locationTypeLabels: Record<string, string> = {
    REMOTE: "Remote",
    HYBRID: "Hybrid",
    ONSITE: "On-site"
}

export function ApplicationsContent({ applications }: ApplicationsContentProps) {
    const router = useRouter()
    const [activeTab, setActiveTab] = useState("all")

    const filteredApplications = applications.filter(app => {
        if (activeTab === "all") return true
        if (activeTab === "active") return ["INTERESTED", "PREPARING", "APPLIED", "SCREENING", "INTERVIEWING"].includes(app.status)
        if (activeTab === "offers") return ["OFFERED", "ACCEPTED"].includes(app.status)
        if (activeTab === "closed") return ["REJECTED", "WITHDRAWN"].includes(app.status)
        return true
    })

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        }).format(new Date(date))
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "INTERESTED":
            case "PREPARING":
                return <Target className="w-4 h-4" />
            case "APPLIED":
            case "SCREENING":
                return <Loader2 className="w-4 h-4" />
            case "INTERVIEWING":
                return <Mic className="w-4 h-4" />
            case "OFFERED":
            case "ACCEPTED":
                return <CheckCircle2 className="w-4 h-4" />
            case "REJECTED":
            case "WITHDRAWN":
                return <XCircle className="w-4 h-4" />
            default:
                return <AlertCircle className="w-4 h-4" />
        }
    }

    const activeCount = applications.filter(app => 
        ["INTERESTED", "PREPARING", "APPLIED", "SCREENING", "INTERVIEWING"].includes(app.status)
    ).length
    const offersCount = applications.filter(app => 
        ["OFFERED", "ACCEPTED"].includes(app.status)
    ).length
    const closedCount = applications.filter(app => 
        ["REJECTED", "WITHDRAWN"].includes(app.status)
    ).length

    return (
        <div className="min-h-full p-6 lg:p-8">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.back()}
                    className="rounded-xl"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-neutral-900 dark:text-white flex items-center gap-3">
                        <FileText className="w-7 h-7 text-blue-500" />
                        My Applications
                    </h1>
                    <p className="text-neutral-500 mt-1">
                        {applications.length} application{applications.length !== 1 ? 's' : ''} total
                    </p>
                </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
                <TabsList className="bg-neutral-100 dark:bg-neutral-800 rounded-xl p-1">
                    <TabsTrigger value="all" className="rounded-lg">
                        All ({applications.length})
                    </TabsTrigger>
                    <TabsTrigger value="active" className="rounded-lg">
                        Active ({activeCount})
                    </TabsTrigger>
                    <TabsTrigger value="offers" className="rounded-lg">
                        Offers ({offersCount})
                    </TabsTrigger>
                    <TabsTrigger value="closed" className="rounded-lg">
                        Closed ({closedCount})
                    </TabsTrigger>
                </TabsList>
            </Tabs>

            {/* Applications List */}
            <AnimatePresence mode="popLayout">
                {filteredApplications.length > 0 ? (
                    <div className="space-y-4">
                        {filteredApplications.map((application, index) => (
                            <motion.div
                                key={application.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: index * 0.03 }}
                                className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 hover:shadow-lg hover:border-neutral-300 dark:hover:border-neutral-700 transition-all"
                            >
                                <div className="flex items-start gap-4">
                                    {/* Company Logo */}
                                    <Link href={`/jobs/${application.job.slug}`}>
                                        <div className="w-14 h-14 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center overflow-hidden shrink-0">
                                            {application.job.company.logoUrl ? (
                                                <img src={application.job.company.logoUrl} alt={application.job.company.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <Building2 className="w-7 h-7 text-neutral-400" />
                                            )}
                                        </div>
                                    </Link>

                                    {/* Application Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-4 mb-2">
                                            <Link href={`/jobs/${application.job.slug}`} className="flex-1">
                                                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                                    {application.job.title}
                                                </h3>
                                                <p className="text-neutral-500">{application.job.company.name}</p>
                                            </Link>
                                            <Badge className={statusColors[application.status]}>
                                                {getStatusIcon(application.status)}
                                                <span className="ml-1.5">{statusLabels[application.status]}</span>
                                            </Badge>
                                        </div>

                                        {/* Meta Info */}
                                        <div className="flex flex-wrap items-center gap-3 text-sm text-neutral-500 mb-4">
                                            <div className="flex items-center gap-1">
                                                <MapPin className="w-4 h-4" />
                                                <span>{application.job.location || locationTypeLabels[application.job.locationType]}</span>
                                            </div>
                                            {application.appliedAt && (
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="w-4 h-4" />
                                                    <span>Applied {formatDate(application.appliedAt)}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Interview Process & Progress */}
                                        {application.job.interviewProcess && (
                                            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800 mb-4">
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className="flex items-center gap-2">
                                                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                                                        <span className="text-sm font-medium text-neutral-900 dark:text-white">
                                                            {application.job.interviewProcess.rounds.length} Interview Rounds
                                                        </span>
                                                    </div>
                                                    {application.prepProgress && (
                                                        <span className="text-sm text-neutral-500">
                                                            {application.prepProgress.readinessScore}% ready
                                                        </span>
                                                    )}
                                                </div>

                                                {application.prepProgress && (
                                                    <Progress 
                                                        value={application.prepProgress.readinessScore} 
                                                        className="h-2 mb-3" 
                                                    />
                                                )}

                                                <div className="flex flex-wrap gap-2">
                                                    {application.job.interviewProcess.rounds.slice(0, 4).map((round) => {
                                                        const isCompleted = application.prepProgress?.roundsCompleted?.includes(round.roundNumber)
                                                        return (
                                                            <div 
                                                                key={round.id}
                                                                className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-lg ${
                                                                    isCompleted 
                                                                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                                                        : "bg-neutral-200 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-400"
                                                                }`}
                                                            >
                                                                {isCompleted && <CheckCircle2 className="w-3 h-3" />}
                                                                <span>R{round.roundNumber}: {round.title}</span>
                                                                {round.hasMockInterview && !isCompleted && (
                                                                    <Mic className="w-3 h-3 text-blue-500" />
                                                                )}
                                                            </div>
                                                        )
                                                    })}
                                                    {application.job.interviewProcess.rounds.length > 4 && (
                                                        <span className="text-xs text-neutral-500 px-2 py-1">
                                                            +{application.job.interviewProcess.rounds.length - 4} more
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Actions */}
                                        <div className="flex items-center gap-3">
                                            {["INTERESTED", "PREPARING"].includes(application.status) && application.job.interviewProcess && (
                                                <Button
                                                    className="rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:text-black dark:hover:bg-neutral-200 gap-2"
                                                    onClick={() => router.push(`/mock/job/${application.job.id}`)}
                                                >
                                                    <Mic className="w-4 h-4" />
                                                    Practice Interview
                                                </Button>
                                            )}
                                            <Link href={`/jobs/${application.job.slug}`}>
                                                <Button variant="outline" className="rounded-xl gap-1">
                                                    View Job
                                                    <ChevronRight className="w-4 h-4" />
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-16"
                    >
                        <FileText className="w-16 h-16 text-neutral-300 dark:text-neutral-700 mx-auto mb-4" />
                        <h3 className="text-xl font-medium text-neutral-900 dark:text-white mb-2">
                            No applications found
                        </h3>
                        <p className="text-neutral-500 max-w-md mx-auto mb-6">
                            {activeTab === "all" 
                                ? "Start exploring jobs and show your interest to begin your journey."
                                : `No applications in this category.`
                            }
                        </p>
                        {activeTab === "all" && (
                            <Link href="/jobs">
                                <Button className="rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:text-black dark:hover:bg-neutral-200">
                                    <Play className="w-4 h-4 mr-2" />
                                    Browse Jobs
                                </Button>
                            </Link>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
