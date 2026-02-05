"use client"

import { useState, useTransition } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    ArrowLeft, FileText, Building2, MapPin, Clock, Briefcase,
    CheckCircle2, XCircle, Mic, Play, Target, Calendar,
    AlertCircle, Loader2, History, Star, Eye, LayoutList,
    MoreVertical, Bell, BookOpen, TrendingUp, Trash2, ExternalLink
} from "lucide-react"
import { Button } from "@repo/ui/components/ui/button"
import { Badge } from "@repo/ui/components/ui/badge"
import {
    Tabs, TabsList, TabsTrigger
} from "@repo/ui/components/ui/tabs"
import { Progress } from "@repo/ui/components/ui/progress"
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuSeparator, DropdownMenuTrigger
} from "@repo/ui/components/ui/dropdown-menu"
import {
    Dialog, DialogContent, DialogDescription, DialogFooter,
    DialogHeader, DialogTitle
} from "@repo/ui/components/ui/dialog"
import { Separator } from "@repo/ui/components/ui/separator"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { withdrawApplication } from "@/actions/jobs"
import toast from "@repo/ui/components/ui/sonner"
import Image from "next/image"

interface Application {
    id: string
    status: string
    appliedAt: Date | null
    updatedAt: Date
    notes?: string | null
    feedback?: string | null
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
            slug?: string
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
        overallReadinessScore?: number
        readinessScore?: number
        mockSessionsCompleted?: number
        roundsCompleted?: number | number[]
    } | null
    statusHistory?: Array<{
        id: string
        fromStatus: string | null
        toStatus: string
        changedAt: Date
        note: string | null
    }>
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

export function ApplicationsContent({ applications: initialApplications }: ApplicationsContentProps) {
    const router = useRouter()
    const [applications, setApplications] = useState(initialApplications)
    const [activeTab, setActiveTab] = useState("all")
    const [viewMode, setViewMode] = useState<"list" | "timeline">("list")
    const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)
    const [detailsOpen, setDetailsOpen] = useState(false)
    const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false)
    const [applicationToWithdraw, setApplicationToWithdraw] = useState<string | null>(null)
    const [isPending, startTransition] = useTransition()

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

    const handleWithdraw = async () => {
        if (!applicationToWithdraw) return

        startTransition(async () => {
            const result = await withdrawApplication(applicationToWithdraw)
            if (result.success) {
                setApplications(prev => prev.map(app =>
                    app.id === applicationToWithdraw ? { ...app, status: "WITHDRAWN" } : app
                ))
                toast.success("Application withdrawn")
                setWithdrawDialogOpen(false)
                setApplicationToWithdraw(null)
            } else {
                toast.error(result.error || "Failed to withdraw application")
            }
        })
    }

    const openApplicationDetails = (application: Application) => {
        setSelectedApplication(application)
        setDetailsOpen(true)
    }

    const getStatusStep = (status: string): number => {
        const steps = ["INTERESTED", "PREPARING", "APPLIED", "SCREENING", "INTERVIEWING", "OFFERED", "ACCEPTED"]
        const index = steps.indexOf(status)
        return index >= 0 ? index : 0
    }

    const formatRelativeDate = (date: Date) => {
        const now = new Date()
        const diff = now.getTime() - new Date(date).getTime()
        const days = Math.floor(diff / (1000 * 60 * 60 * 24))
        if (days === 0) return "Today"
        if (days === 1) return "Yesterday"
        if (days < 7) return `${days} days ago`
        if (days < 30) return `${Math.floor(days / 7)} weeks ago`
        return formatDate(date)
    }

    return (
        <div className="min-h-full p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.back()}
                    className="rounded-xl w-fit"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div className="flex-1">
                    <h1 className="text-2xl lg:text-3xl font-bold text-neutral-900 dark:text-white flex items-center gap-3">
                        <FileText className="w-7 h-7 text-blue-500" />
                        My Applications
                    </h1>
                    <p className="text-neutral-500 mt-1">
                        {applications.length} application{applications.length !== 1 ? 's' : ''} total
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant={viewMode === "list" ? "secondary" : "ghost"}
                        size="icon"
                        className="rounded-xl"
                        onClick={() => setViewMode("list")}
                    >
                        <LayoutList className="w-4 h-4" />
                    </Button>
                    <Button
                        variant={viewMode === "timeline" ? "secondary" : "ghost"}
                        size="icon"
                        className="rounded-xl"
                        onClick={() => setViewMode("timeline")}
                    >
                        <History className="w-4 h-4" />
                    </Button>
                </div>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-100 dark:border-blue-800"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <Briefcase className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-neutral-900 dark:text-white">{applications.length}</div>
                            <div className="text-xs text-neutral-500">Total</div>
                        </div>
                    </div>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-100 dark:border-amber-800"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-neutral-900 dark:text-white">{activeCount}</div>
                            <div className="text-xs text-neutral-500">Active</div>
                        </div>
                    </div>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="p-4 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-100 dark:border-green-800"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                            <Star className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-neutral-900 dark:text-white">{offersCount}</div>
                            <div className="text-xs text-neutral-500">Offers</div>
                        </div>
                    </div>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="p-4 rounded-2xl bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-800/50 dark:to-neutral-900/50 border border-neutral-200 dark:border-neutral-700"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                            <XCircle className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-neutral-900 dark:text-white">{closedCount}</div>
                            <div className="text-xs text-neutral-500">Closed</div>
                        </div>
                    </div>
                </motion.div>
            </div>
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
            <AnimatePresence mode="popLayout">
                {
                    filteredApplications.length > 0 ? (
                        viewMode === "list" ? (
                            <div className="space-y-4">
                                {
                                    filteredApplications.map((application, index) => (
                                        <motion.div
                                            key={application.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ delay: index * 0.03 }}
                                            className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 hover:shadow-lg hover:border-neutral-300 dark:hover:border-neutral-700 transition-all"
                                        >
                                            <div className="flex items-start gap-4">
                                                <Link href={`/jobs/${application.job.slug}`}>
                                                    <div className="w-14 h-14 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center overflow-hidden shrink-0">
                                                        {
                                                            application.job.company.logoUrl ? (
                                                                <Image
                                                                    src={application.job.company.logoUrl}
                                                                    alt={application.job.company.name}
                                                                    className="w-full h-full object-cover"
                                                                    fill
                                                                />
                                                            ) : (
                                                                <Building2 className="w-7 h-7 text-neutral-400" />
                                                            )
                                                        }
                                                    </div>
                                                </Link>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-4 mb-2">
                                                        <div className="flex-1">
                                                            <Link href={`/jobs/${application.job.slug}`}>
                                                                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                                                    {application.job.title}
                                                                </h3>
                                                            </Link>
                                                            <Link href={`/companies/${application.job.company.slug}`}>
                                                                <p className="text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors">
                                                                    {application.job.company.name}
                                                                </p>
                                                            </Link>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Badge className={statusColors[application.status]}>
                                                                {getStatusIcon(application.status)}
                                                                <span className="ml-1.5">{statusLabels[application.status]}</span>
                                                            </Badge>
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                        <MoreVertical className="w-4 h-4" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end">
                                                                    <DropdownMenuItem onClick={() => openApplicationDetails(application)}>
                                                                        <Eye className="w-4 h-4 mr-2" />
                                                                        View Details
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem onClick={() => router.push(`/companies/${application.job.company.slug}/mock`)}>
                                                                        <Mic className="w-4 h-4 mr-2" />
                                                                        Practice Interview
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuSeparator />
                                                                    {
                                                                        !["WITHDRAWN", "REJECTED", "ACCEPTED"].includes(application.status) && (
                                                                            <DropdownMenuItem
                                                                                className="text-red-600 dark:text-red-400"
                                                                                onClick={() => {
                                                                                    setApplicationToWithdraw(application.id)
                                                                                    setWithdrawDialogOpen(true)
                                                                                }}
                                                                            >
                                                                                <Trash2 className="w-4 h-4 mr-2" />
                                                                                Withdraw Application
                                                                            </DropdownMenuItem>
                                                                        )
                                                                    }
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-wrap items-center gap-3 text-sm text-neutral-500 mb-4">
                                                        <div className="flex items-center gap-1">
                                                            <MapPin className="w-4 h-4" />
                                                            <span>{application.job.location || locationTypeLabels[application.job.locationType]}</span>
                                                        </div>
                                                        {
                                                            application.appliedAt && (
                                                                <div className="flex items-center gap-1">
                                                                    <Calendar className="w-4 h-4" />
                                                                    <span>Applied {formatDate(application.appliedAt)}</span>
                                                                </div>
                                                            )
                                                        }
                                                        <div className="flex items-center gap-1">
                                                            <Clock className="w-4 h-4" />
                                                            <span>Updated {formatRelativeDate(application.updatedAt)}</span>
                                                        </div>
                                                    </div>

                                                    {
                                                        application.job.interviewProcess && (
                                                            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800 mb-4">
                                                                <div className="flex items-center justify-between mb-3">
                                                                    <div className="flex items-center gap-2">
                                                                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                                                                        <span className="text-sm font-medium text-neutral-900 dark:text-white">
                                                                            {application.job.interviewProcess.rounds.length} Interview Rounds
                                                                        </span>
                                                                    </div>
                                                                    {
                                                                        application.prepProgress && (
                                                                            <span className="text-sm text-neutral-500">
                                                                                {application.prepProgress.readinessScore}% ready
                                                                            </span>
                                                                        )
                                                                    }
                                                                </div>

                                                                {
                                                                    application.prepProgress && (
                                                                        <Progress
                                                                            value={application.prepProgress.overallReadinessScore || application.prepProgress.readinessScore || 0}
                                                                            className="h-2 mb-3"
                                                                        />
                                                                    )
                                                                }

                                                                <div className="flex flex-wrap gap-2">
                                                                    {
                                                                        application.job.interviewProcess.rounds.slice(0, 4).map((round) => {
                                                                            const roundsCompleted = application.prepProgress?.roundsCompleted
                                                                            const isCompleted = Array.isArray(roundsCompleted)
                                                                                ? roundsCompleted.includes(round.roundNumber)
                                                                                : (typeof roundsCompleted === 'number' && roundsCompleted >= round.roundNumber)
                                                                            return (
                                                                                <div
                                                                                    key={round.id}
                                                                                    className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-lg ${isCompleted
                                                                                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                                                                        : "bg-neutral-200 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-400"
                                                                                        }`}
                                                                                >
                                                                                    {isCompleted && <CheckCircle2 className="w-3 h-3" />}
                                                                                    <span>R{round.roundNumber}: {round.title}</span>
                                                                                    {
                                                                                        round.hasMockInterview && !isCompleted && (
                                                                                            <Mic className="w-3 h-3 text-blue-500" />
                                                                                        )
                                                                                    }
                                                                                </div>
                                                                            )
                                                                        })
                                                                    }
                                                                    {
                                                                        application.job.interviewProcess.rounds.length > 4 && (
                                                                            <span className="text-xs text-neutral-500 px-2 py-1">
                                                                                +{application.job.interviewProcess.rounds.length - 4} more
                                                                            </span>
                                                                        )
                                                                    }
                                                                </div>
                                                            </div>
                                                        )
                                                    }
                                                    {
                                                        application.feedback && (
                                                            <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 mb-4">
                                                                <div className="flex items-start gap-2">
                                                                    <Bell className="w-4 h-4 text-blue-500 mt-0.5" />
                                                                    <div>
                                                                        <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Recruiter Feedback</span>
                                                                        <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">{application.feedback}</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )
                                                    }

                                                    <div className="flex items-center gap-3">
                                                        {
                                                            ["INTERESTED", "PREPARING"].includes(application.status) && application.job.interviewProcess && (
                                                                <Button
                                                                    className="rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:text-black dark:hover:bg-neutral-200 gap-2"
                                                                    onClick={() => router.push(`/companies/${application.job.company.slug}/mock`)}
                                                                >
                                                                    <Mic className="w-4 h-4" />
                                                                    Practice Interview
                                                                </Button>
                                                            )
                                                        }
                                                        <Button
                                                            variant="outline"
                                                            className="rounded-xl gap-1"
                                                            onClick={() => openApplicationDetails(application)}
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                            View Timeline
                                                        </Button>
                                                        <Link href={`/jobs/${application.job.slug}`}>
                                                            <Button variant="ghost" className="rounded-xl gap-1">
                                                                View Job
                                                                <ExternalLink className="w-4 h-4" />
                                                            </Button>
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))
                                }
                            </div>
                        ) : (
                            <div className="relative">
                                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-green-500 dark:from-blue-400 dark:via-purple-400 dark:to-green-400" />
                                <div className="space-y-6">
                                    {
                                        filteredApplications.map((application, index) => (
                                            <motion.div
                                                key={application.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -20 }}
                                                transition={{ delay: index * 0.05 }}
                                                className="relative pl-16"
                                            >
                                                <div className={`absolute left-5 w-6 h-6 rounded-full flex items-center justify-center ${["OFFERED", "ACCEPTED"].includes(application.status)
                                                    ? "bg-green-500"
                                                    : ["REJECTED", "WITHDRAWN"].includes(application.status)
                                                        ? "bg-red-500"
                                                        : "bg-blue-500"
                                                    }`}>
                                                    {getStatusIcon(application.status)}
                                                </div>
                                                <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 hover:shadow-lg transition-shadow">
                                                    <div className="flex items-start gap-4">
                                                        <div className="w-12 h-12 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center overflow-hidden shrink-0">
                                                            {
                                                                application.job.company.logoUrl ? (
                                                                    <Image
                                                                        src={application.job.company.logoUrl}
                                                                        alt={application.job.company.name}
                                                                        className="w-full h-full object-cover"
                                                                        fill
                                                                    />
                                                                ) : (
                                                                    <Building2 className="w-6 h-6 text-neutral-400" />
                                                                )
                                                            }
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center justify-between mb-1">
                                                                <Badge className={statusColors[application.status]}>
                                                                    {statusLabels[application.status]}
                                                                </Badge>
                                                                <span className="text-xs text-neutral-500">
                                                                    {formatRelativeDate(application.updatedAt)}
                                                                </span>
                                                            </div>
                                                            <Link href={`/jobs/${application.job.slug}`}>
                                                                <h3 className="font-semibold text-neutral-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                                                    {application.job.title}
                                                                </h3>
                                                            </Link>
                                                            <p className="text-sm text-neutral-500">{application.job.company.name}</p>

                                                            {
                                                                application.prepProgress && (
                                                                    <div className="mt-3 flex items-center gap-2">
                                                                        <Progress value={application.prepProgress.readinessScore} className="h-1.5 flex-1" />
                                                                        <span className="text-xs text-neutral-500">
                                                                            {application.prepProgress.readinessScore}% ready
                                                                        </span>
                                                                    </div>
                                                                )
                                                            }

                                                            <div className="flex items-center gap-2 mt-3">
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    className="rounded-lg text-xs h-7"
                                                                    onClick={() => openApplicationDetails(application)}
                                                                >
                                                                    <Eye className="w-3 h-3 mr-1" />
                                                                    Details
                                                                </Button>
                                                                {
                                                                    ["INTERESTED", "PREPARING"].includes(application.status) && (
                                                                        <Button
                                                                            size="sm"
                                                                            variant="ghost"
                                                                            className="rounded-lg text-xs h-7"
                                                                            onClick={() => router.push(`/companies/${application.job.company.slug}/mock`)}
                                                                        >
                                                                            <Mic className="w-3 h-3 mr-1" />
                                                                            Practice
                                                                        </Button>
                                                                    )
                                                                }
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))
                                    }
                                </div>
                            </div>
                        )
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
                                {
                                    activeTab === "all"
                                        ? "Start exploring jobs and show your interest to begin your journey."
                                        : `No applications in this category.`
                                }
                            </p>
                            {
                                activeTab === "all" && (
                                    <Link href="/jobs">
                                        <Button className="rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:text-black dark:hover:bg-neutral-200">
                                            <Play className="w-4 h-4 mr-2" />
                                            Browse Jobs
                                        </Button>
                                    </Link>
                                )
                            }
                        </motion.div>
                    )
                }
            </AnimatePresence>
            <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    {
                        selectedApplication && (
                            <>
                                <DialogHeader>
                                    <div className="flex items-start gap-4">
                                        <div className="w-14 h-14 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center overflow-hidden shrink-0">
                                            {
                                                selectedApplication.job.company.logoUrl ? (
                                                    <Image
                                                        src={selectedApplication.job.company.logoUrl}
                                                        alt={selectedApplication.job.company.name}
                                                        className="w-full h-full object-cover"
                                                        fill
                                                    />
                                                ) : (
                                                    <Building2 className="w-7 h-7 text-neutral-400" />
                                                )
                                            }
                                        </div>
                                        <div className="flex-1">
                                            <DialogTitle className="text-xl">
                                                {selectedApplication.job.title}
                                            </DialogTitle>
                                            <DialogDescription className="text-base">
                                                {selectedApplication.job.company.name}
                                            </DialogDescription>
                                        </div>
                                        <Badge className={statusColors[selectedApplication.status]}>
                                            {statusLabels[selectedApplication.status]}
                                        </Badge>
                                    </div>
                                </DialogHeader>
                                <div className="space-y-6 mt-4">
                                    <div>
                                        <h4 className="text-sm font-medium text-neutral-900 dark:text-white mb-3">Application Progress</h4>
                                        <div className="flex items-center gap-1">
                                            {
                                                ["INTERESTED", "PREPARING", "APPLIED", "SCREENING", "INTERVIEWING", "OFFERED"].map((step, i) => (
                                                    <div key={step} className="flex-1 flex items-center">
                                                        <div className={`h-2 flex-1 rounded-full ${i <= getStatusStep(selectedApplication.status)
                                                            ? "bg-gradient-to-r from-blue-500 to-green-500"
                                                            : "bg-neutral-200 dark:bg-neutral-700"
                                                            }`} />
                                                    </div>
                                                ))
                                            }
                                        </div>
                                        <div className="flex justify-between mt-2">
                                            <span className="text-xs text-neutral-500">Started</span>
                                            <span className="text-xs text-neutral-500">Offered</span>
                                        </div>
                                    </div>

                                    <Separator />

                                    {
                                        selectedApplication.statusHistory && selectedApplication.statusHistory.length > 0 && (
                                            <div>
                                                <h4 className="text-sm font-medium text-neutral-900 dark:text-white mb-3 flex items-center gap-2">
                                                    <History className="w-4 h-4" />
                                                    Status History
                                                </h4>
                                                <div className="relative pl-6 space-y-4">
                                                    <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-neutral-200 dark:bg-neutral-700" />
                                                    {
                                                        selectedApplication.statusHistory.map((history, index) => (
                                                            <div key={history.id} className="relative">
                                                                <div className={`absolute -left-4 w-4 h-4 rounded-full border-2 border-white dark:border-neutral-900 ${index === 0 ? "bg-blue-500" : "bg-neutral-400"
                                                                    }`} />
                                                                <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-3">
                                                                    <div className="flex items-center justify-between mb-1">
                                                                        <Badge variant="outline" className="text-xs">
                                                                            {statusLabels[history.toStatus] || history.toStatus}
                                                                        </Badge>
                                                                        <span className="text-xs text-neutral-500">
                                                                            {formatDate(history.changedAt)}
                                                                        </span>
                                                                    </div>
                                                                    {
                                                                        history.note && (
                                                                            <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                                                                {history.note}
                                                                            </p>
                                                                        )
                                                                    }
                                                                </div>
                                                            </div>
                                                        ))
                                                    }
                                                </div>
                                            </div>
                                        )
                                    }
                                    {
                                        selectedApplication.feedback && (
                                            <div>
                                                <h4 className="text-sm font-medium text-neutral-900 dark:text-white mb-3 flex items-center gap-2">
                                                    <Bell className="w-4 h-4" />
                                                    Recruiter Feedback
                                                </h4>
                                                <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
                                                    <p className="text-sm text-blue-700 dark:text-blue-300">
                                                        {selectedApplication.feedback}
                                                    </p>
                                                </div>
                                            </div>
                                        )
                                    }
                                    {
                                        selectedApplication.job.interviewProcess && (
                                            <div>
                                                <h4 className="text-sm font-medium text-neutral-900 dark:text-white mb-3 flex items-center gap-2">
                                                    <BookOpen className="w-4 h-4" />
                                                    Interview Rounds
                                                </h4>
                                                <div className="space-y-2">
                                                    {
                                                        selectedApplication.job.interviewProcess.rounds.map((round) => {
                                                            const roundsCompleted = selectedApplication.prepProgress?.roundsCompleted
                                                            const isCompleted = Array.isArray(roundsCompleted) 
                                                                ? roundsCompleted.includes(round.roundNumber)
                                                                : (typeof roundsCompleted === 'number' && roundsCompleted >= round.roundNumber)
                                                            return (
                                                                <div
                                                                    key={round.id}
                                                                    className={`p-3 rounded-xl border ${isCompleted
                                                                        ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800"
                                                                        : "bg-neutral-50 border-neutral-200 dark:bg-neutral-800 dark:border-neutral-700"
                                                                        }`}
                                                                >
                                                                    <div className="flex items-center justify-between">
                                                                        <div className="flex items-center gap-2">
                                                                            {
                                                                                isCompleted ? (
                                                                                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                                                                                ) : (
                                                                                    <div className="w-4 h-4 rounded-full border-2 border-neutral-300 dark:border-neutral-600" />
                                                                                )
                                                                            }
                                                                            <span className="font-medium text-sm text-neutral-900 dark:text-white">
                                                                                Round {round.roundNumber}: {round.title}
                                                                            </span>
                                                                        </div>
                                                                        {
                                                                            round.hasMockInterview && !isCompleted && (
                                                                                <Button
                                                                                    size="sm"
                                                                                    variant="outline"
                                                                                    className="h-7 text-xs rounded-lg"
                                                                                    onClick={() => {
                                                                                        setDetailsOpen(false)
                                                                                        router.push(`/companies/${selectedApplication.job.company.slug}/mock`)
                                                                                    }}
                                                                                >
                                                                                    <Mic className="w-3 h-3 mr-1" />
                                                                                    Practice
                                                                                </Button>
                                                                            )
                                                                        }
                                                                    </div>
                                                                </div>
                                                            )
                                                        })
                                                    }
                                                </div>
                                            </div>
                                        )
                                    }
                                </div>

                                <DialogFooter className="mt-6">
                                    <div className="flex items-center gap-3 w-full">
                                        {
                                            !["WITHDRAWN", "REJECTED", "ACCEPTED"].includes(selectedApplication.status) && (
                                                <Button
                                                    variant="outline"
                                                    className="rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
                                                    onClick={() => {
                                                        setApplicationToWithdraw(selectedApplication.id)
                                                        setWithdrawDialogOpen(true)
                                                        setDetailsOpen(false)
                                                    }}
                                                >
                                                    <Trash2 className="w-4 h-4 mr-2" />
                                                    Withdraw
                                                </Button>
                                            )
                                        }
                                        <div className="flex-1" />
                                        <Link href={`/jobs/${selectedApplication.job.slug}`}>
                                            <Button className="rounded-xl">
                                                View Job
                                                <ExternalLink className="w-4 h-4 ml-2" />
                                            </Button>
                                        </Link>
                                    </div>
                                </DialogFooter>
                            </>
                        )
                    }
                </DialogContent>
            </Dialog>
            <Dialog open={withdrawDialogOpen} onOpenChange={setWithdrawDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Withdraw Application</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to withdraw this application? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setWithdrawDialogOpen(false)
                                setApplicationToWithdraw(null)
                            }}
                            className="rounded-xl"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleWithdraw}
                            disabled={isPending}
                            className="rounded-xl bg-red-600 hover:bg-red-700 text-white"
                        >
                            {
                                isPending ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                    <Trash2 className="w-4 h-4 mr-2" />
                                )
                            }
                            Withdraw
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}