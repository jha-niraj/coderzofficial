"use client"

import { motion } from "framer-motion"
import {
    BarChart3, Users, Briefcase, Clock, Target, Eye, TrendingUp,
    TrendingDown, CheckCircle, ArrowRight, Award
} from "lucide-react"
import { Badge } from "@repo/ui/components/ui/badge"
import Link from "next/link"
import Image from "next/image"

interface AnalyticsData {
    overview: {
        totalJobs: number
        activeJobs: number
        totalApplications: number
        recentApplications: number
        applicationChange: number
        totalViews: number
        hiredCount: number
        interviewsScheduled: number
        avgTimeToHire: string
        conversionRate: number
    }
    pipeline: {
        applied: number
        reviewing: number
        shortlisted: number
        interviewing: number
        offered: number
        hired: number
        rejected: number
    }
    topJobs: Array<{
        id: string
        title: string
        slug: string
        viewsCount: number
        applicationsCount: number
        status: string
        createdAt: Date
    }>
}

interface RecruiterPerformance {
    id: string
    name: string
    image: string | null
    role: string
    jobsPosted: number
    applicationsReviewed: number
}

interface AnalyticsContentProps {
    analytics: AnalyticsData | null
    recruiterPerformance: RecruiterPerformance[]
}

export function AnalyticsContent({ analytics, recruiterPerformance }: AnalyticsContentProps) {
    if (!analytics) {
        return (
            <div className="min-h-full p-6 lg:p-8">
                <div className="mb-8">
                    <h1 className="text-2xl lg:text-3xl font-bold text-neutral-900 dark:text-white">
                        Analytics
                    </h1>
                    <p className="text-neutral-500 mt-1">
                        Track your hiring pipeline performance
                    </p>
                </div>
                <div className="text-center py-16 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl">
                    <div className="w-20 h-20 rounded-2xl bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center mx-auto mb-6">
                        <BarChart3 className="w-10 h-10 text-neutral-400" />
                    </div>
                    <h3 className="font-bold text-xl text-neutral-900 dark:text-white mb-2">
                        No data yet
                    </h3>
                    <p className="text-neutral-500 max-w-md mx-auto">
                        Analytics will appear once you start posting jobs and receiving applications.
                    </p>
                </div>
            </div>
        )
    }

    const { overview, pipeline, topJobs } = analytics
    const totalPipeline = Object.values(pipeline).reduce((a, b) => a + b, 0)

    const statsCards = [
        {
            label: "Total Views",
            value: overview.totalViews.toLocaleString(),
            icon: <Eye className="w-5 h-5" />,
            color: "text-blue-500",
            bgColor: "bg-blue-100 dark:bg-blue-900/30"
        },
        {
            label: "Applications",
            value: overview.totalApplications.toLocaleString(),
            change: overview.applicationChange,
            icon: <Users className="w-5 h-5" />,
            color: "text-purple-500",
            bgColor: "bg-purple-100 dark:bg-purple-900/30"
        },
        {
            label: "Active Jobs",
            value: overview.activeJobs.toString(),
            icon: <Briefcase className="w-5 h-5" />,
            color: "text-green-500",
            bgColor: "bg-green-100 dark:bg-green-900/30"
        },
        {
            label: "Avg. Time to Hire",
            value: overview.avgTimeToHire,
            icon: <Clock className="w-5 h-5" />,
            color: "text-orange-500",
            bgColor: "bg-orange-100 dark:bg-orange-900/30"
        },
        {
            label: "Total Hired",
            value: overview.hiredCount.toString(),
            icon: <CheckCircle className="w-5 h-5" />,
            color: "text-emerald-500",
            bgColor: "bg-emerald-100 dark:bg-emerald-900/30"
        },
        {
            label: "Conversion Rate",
            value: `${overview.conversionRate}%`,
            icon: <Target className="w-5 h-5" />,
            color: "text-indigo-500",
            bgColor: "bg-indigo-100 dark:bg-indigo-900/30"
        },
    ]

    const pipelineStages = [
        { label: "Applied", count: pipeline.applied, color: "bg-blue-500" },
        { label: "Reviewing", count: pipeline.reviewing, color: "bg-yellow-500" },
        { label: "Shortlisted", count: pipeline.shortlisted, color: "bg-purple-500" },
        { label: "Interviewing", count: pipeline.interviewing, color: "bg-orange-500" },
        { label: "Offered", count: pipeline.offered, color: "bg-indigo-500" },
        { label: "Hired", count: pipeline.hired, color: "bg-green-500" },
        { label: "Rejected", count: pipeline.rejected, color: "bg-red-500" },
    ]

    return (
        <div className="min-h-full p-6 lg:p-8">
            <div className="mb-8">
                <h1 className="text-2xl lg:text-3xl font-bold text-neutral-900 dark:text-white">
                    Analytics
                </h1>
                <p className="text-neutral-500 mt-1">
                    Track your hiring pipeline performance
                </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                {
                    statsCards.map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4"
                        >
                            <div className="flex items-center gap-2 mb-3">
                                <div className={`p-2 rounded-lg ${stat.bgColor} ${stat.color}`}>
                                    {stat.icon}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <span className="text-2xl font-bold text-neutral-900 dark:text-white">{stat.value}</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-neutral-500">{stat.label}</span>
                                    {
                                        stat.change !== undefined && (
                                            <span className={`text-xs flex items-center gap-0.5 ${stat.change >= 0 ? "text-green-600" : "text-red-600"}`}>
                                                {stat.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                                {Math.abs(stat.change)}%
                                            </span>
                                        )
                                    }
                                </div>
                            </div>
                        </motion.div>
                    ))
                }
            </div>
            <div className="grid lg:grid-cols-3 gap-6 mb-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="lg:col-span-2 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6"
                >
                    <h2 className="font-semibold text-lg text-neutral-900 dark:text-white mb-6">
                        Hiring Pipeline
                    </h2>
                    <div className="space-y-4">
                        {
                            pipelineStages.map((stage, i) => {
                                const percentage = totalPipeline > 0 ? (stage.count / totalPipeline) * 100 : 0
                                return (
                                    <motion.div
                                        key={stage.label}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.4 + i * 0.05 }}
                                        className="flex items-center gap-4"
                                    >
                                        <div className="w-24 text-sm text-neutral-600 dark:text-neutral-400">
                                            {stage.label}
                                        </div>
                                        <div className="flex-1 h-8 bg-neutral-100 dark:bg-neutral-800 rounded-lg overflow-hidden relative">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${percentage}%` }}
                                                transition={{ delay: 0.5 + i * 0.1, duration: 0.5 }}
                                                className={`h-full ${stage.color} rounded-lg`}
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-neutral-900 dark:text-white">
                                                {stage.count}
                                            </span>
                                        </div>
                                        <div className="w-12 text-right text-sm text-neutral-500">
                                            {percentage.toFixed(0)}%
                                        </div>
                                    </motion.div>
                                )
                            })
                        }
                    </div>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="font-semibold text-lg text-neutral-900 dark:text-white">
                            Top Jobs
                        </h2>
                        <Link href="/jobs" className="text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-white flex items-center gap-1">
                            View all <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                    {
                        topJobs.length > 0 ? (
                            <div className="space-y-4">
                                {
                                    topJobs.map((job, i) => (
                                        <motion.div
                                            key={job.id}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.5 + i * 0.05 }}
                                            className="flex items-center gap-3"
                                        >
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${i === 0 ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600" :
                                                i === 1 ? "bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300" :
                                                    i === 2 ? "bg-orange-100 dark:bg-orange-900/30 text-orange-600" :
                                                        "bg-neutral-100 dark:bg-neutral-800 text-neutral-500"
                                                }`}>
                                                {i + 1}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <Link href={`/jobs/${job.slug}`}>
                                                    <p className="font-medium text-neutral-900 dark:text-white truncate hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors">
                                                        {job.title}
                                                    </p>
                                                </Link>
                                                <p className="text-xs text-neutral-500">
                                                    {job.viewsCount} views • {job.applicationsCount} apps
                                                </p>
                                            </div>
                                            <Badge variant={job.status === "ACTIVE" ? "default" : "secondary"} className="text-xs">
                                                {job.status.toLowerCase()}
                                            </Badge>
                                        </motion.div>
                                    ))
                                }
                            </div>
                        ) : (
                            <p className="text-neutral-500 text-sm text-center py-8">
                                No jobs posted yet
                            </p>
                        )
                    }
                </motion.div>
            </div>

            {
                recruiterPerformance.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6"
                    >
                        <h2 className="font-semibold text-lg text-neutral-900 dark:text-white mb-6 flex items-center gap-2">
                            <Award className="w-5 h-5 text-yellow-500" />
                            Team Performance
                        </h2>
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {
                                recruiterPerformance.map((recruiter, i) => (
                                    <motion.div
                                        key={recruiter.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.6 + i * 0.05 }}
                                        className="p-4 bg-neutral-50 dark:bg-neutral-900 rounded-xl"
                                    >
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-10 h-10 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center overflow-hidden relative">
                                                {
                                                    recruiter.image ? (
                                                        <Image src={recruiter.image} alt={recruiter.name} fill className="object-cover" />
                                                    ) : (
                                                        <span className="font-bold text-neutral-600 dark:text-neutral-400">
                                                            {recruiter.name.charAt(0)}
                                                        </span>
                                                    )
                                                }
                                            </div>
                                            <div>
                                                <p className="font-medium text-neutral-900 dark:text-white text-sm">{recruiter.name}</p>
                                                <p className="text-xs text-neutral-500">{recruiter.role}</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="text-center p-2 bg-white dark:bg-neutral-800 rounded-lg">
                                                <p className="text-lg font-bold text-neutral-900 dark:text-white">{recruiter.jobsPosted}</p>
                                                <p className="text-xs text-neutral-500">Jobs</p>
                                            </div>
                                            <div className="text-center p-2 bg-white dark:bg-neutral-800 rounded-lg">
                                                <p className="text-lg font-bold text-neutral-900 dark:text-white">{recruiter.applicationsReviewed}</p>
                                                <p className="text-xs text-neutral-500">Reviewed</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            }
                        </div>
                    </motion.div>
                )
            }
        </div>
    )
}