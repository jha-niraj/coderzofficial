"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import {
    Users, Briefcase, Clock, CheckCircle, XCircle, TrendingUp,
    FileText, ChevronRight, Search
} from "lucide-react"
import { Button } from "@repo/ui/components/ui/button"
import { Input } from "@repo/ui/components/ui/input"
import { Badge } from "@repo/ui/components/ui/badge"
import type {
    ApplicationStats, JobApplicationStats
} from "@/actions/applications"

interface ApplicationsContentProps {
    stats: ApplicationStats | null
    jobStats: JobApplicationStats[]
}

const statCards = [
    { key: "total", label: "Total Applications", icon: Users, color: "violet" },
    { key: "new", label: "New", icon: Clock, color: "blue" },
    { key: "shortlisted", label: "Shortlisted", icon: CheckCircle, color: "green" },
    { key: "rejected", label: "Rejected", icon: XCircle, color: "red" }
] as const

export function ApplicationsContent({ stats, jobStats }: ApplicationsContentProps) {
    const [searchQuery, setSearchQuery] = useState("")

    const filteredJobs = jobStats.filter(job =>
        job.jobTitle.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="min-h-full p-6 lg:p-8">
            <div className="mb-8">
                <h1 className="text-2xl lg:text-3xl font-bold text-neutral-900 dark:text-white">
                    Applications
                </h1>
                <p className="text-neutral-500 mt-1">
                    Review and manage job applications across all positions
                </p>
            </div>

            {
                stats && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        {
                            statCards.map((stat, index) => {
                                const Icon = stat.icon
                                const value = stats[stat.key as keyof ApplicationStats]
                                const colorClasses = {
                                    violet: "bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400",
                                    blue: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
                                    green: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
                                    red: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                                }

                                return (
                                    <motion.div
                                        key={stat.key}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="bg-white dark:bg-neutral-950 rounded-2xl p-5 border border-neutral-200 dark:border-neutral-800"
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <div className={`p-2 rounded-xl ${colorClasses[stat.color]}`}>
                                                <Icon className="w-5 h-5" />
                                            </div>
                                            {
                                                stat.key === "new" && stats.thisWeek > 0 && (
                                                    <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                                                        <TrendingUp className="w-3 h-3 mr-1" />
                                                        +{stats.thisWeek} this week
                                                    </Badge>
                                                )
                                            }
                                        </div>
                                        <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                                            {value}
                                        </p>
                                        <p className="text-sm text-neutral-500">{stat.label}</p>
                                    </motion.div>
                                )
                            })
                        }
                    </div>
                )
            }

            <div className="mb-6">
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <Input
                        placeholder="Search jobs..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 rounded-xl bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800"
                    />
                </div>
            </div>

            {
                filteredJobs.length > 0 ? (
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                            Applications by Job
                        </h2>
                        {
                            filteredJobs.map((job, index) => (
                                <motion.div
                                    key={job.jobId}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <Link href={`/applications/${job.jobSlug}`}>
                                        <div className="bg-white dark:bg-neutral-950 rounded-2xl p-5 border border-neutral-200 dark:border-neutral-800 hover:border-violet-300 dark:hover:border-violet-700 transition-colors cursor-pointer">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                                                        <Briefcase className="w-6 h-6 text-violet-600 dark:text-violet-400" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold text-neutral-900 dark:text-white">
                                                            {job.jobTitle}
                                                        </h3>
                                                        <p className="text-sm text-neutral-500">
                                                            {job.total} total application{job.total !== 1 ? "s" : ""}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="hidden sm:flex items-center gap-2">
                                                        {
                                                            job.new > 0 && (
                                                                <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                                                                    {job.new} new
                                                                </Badge>
                                                            )
                                                        }
                                                        {
                                                            job.shortlisted > 0 && (
                                                                <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                                                                    {job.shortlisted} shortlisted
                                                                </Badge>
                                                            )
                                                        }
                                                        {
                                                            job.interviewing > 0 && (
                                                                <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                                                                    {job.interviewing} interviewing
                                                                </Badge>
                                                            )
                                                        }
                                                    </div>
                                                    <ChevronRight className="w-5 h-5 text-neutral-400" />
                                                </div>
                                            </div>

                                            {
                                                job.total > 0 && (
                                                    <div className="mt-4 flex h-2 rounded-full overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                                                        {
                                                            job.new > 0 && (
                                                                <div
                                                                    className="bg-blue-500"
                                                                    style={{ width: `${(job.new / job.total) * 100}%` }}
                                                                />
                                                            )
                                                        }
                                                        {
                                                            job.underReview > 0 && (
                                                                <div
                                                                    className="bg-yellow-500"
                                                                    style={{ width: `${(job.underReview / job.total) * 100}%` }}
                                                                />
                                                            )
                                                        }
                                                        {
                                                            job.shortlisted > 0 && (
                                                                <div
                                                                    className="bg-green-500"
                                                                    style={{ width: `${(job.shortlisted / job.total) * 100}%` }}
                                                                />
                                                            )
                                                        }
                                                        {
                                                            job.interviewing > 0 && (
                                                                <div
                                                                    className="bg-purple-500"
                                                                    style={{ width: `${(job.interviewing / job.total) * 100}%` }}
                                                                />
                                                            )
                                                        }
                                                        {
                                                            job.hired > 0 && (
                                                                <div
                                                                    className="bg-emerald-500"
                                                                    style={{ width: `${(job.hired / job.total) * 100}%` }}
                                                                />
                                                            )
                                                        }
                                                        {
                                                            job.rejected > 0 && (
                                                                <div
                                                                    className="bg-red-500"
                                                                    style={{ width: `${(job.rejected / job.total) * 100}%` }}
                                                                />
                                                            )
                                                        }
                                                    </div>
                                                )
                                            }
                                        </div>
                                    </Link>
                                </motion.div>
                            ))
                        }
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-16 bg-white dark:bg-neutral-950 rounded-2xl border border-neutral-200 dark:border-neutral-800"
                    >
                        <div className="w-20 h-20 rounded-2xl bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center mx-auto mb-6">
                            <FileText className="w-10 h-10 text-neutral-400" />
                        </div>
                        <h3 className="font-bold text-xl text-neutral-900 dark:text-white mb-2">
                            {searchQuery ? "No matching jobs found" : "No applications yet"}
                        </h3>
                        <p className="text-neutral-500 mb-6 max-w-md mx-auto">
                            {
                                searchQuery
                                    ? "Try adjusting your search query"
                                    : "Applications from candidates will appear here once you start receiving them."
                            }
                        </p>
                        {
                            !searchQuery && (
                                <Link href="/jobs">
                                    <Button className="rounded-xl">
                                        <Briefcase className="w-4 h-4 mr-2" />
                                        View Job Postings
                                    </Button>
                                </Link>
                            )
                        }
                    </motion.div>
                )
            }

            {
                filteredJobs.some(j => j.total > 0) && (
                    <div className="mt-6 flex flex-wrap gap-4 text-sm text-neutral-500">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-blue-500" />
                            <span>New</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-yellow-500" />
                            <span>Under Review</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-green-500" />
                            <span>Shortlisted</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-purple-500" />
                            <span>Interviewing</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-emerald-500" />
                            <span>Hired</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500" />
                            <span>Rejected</span>
                        </div>
                    </div>
                )
            }
        </div>
    )
}