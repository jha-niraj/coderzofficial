"use client"

import { useState, useEffect } from "react"
import {
    Building2, Users, Briefcase, UserCheck, FileText,
    Activity, ArrowRight, CheckCircle, Clock, UserPlus, BarChart3
} from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface StatCardProps {
    title: string
    value: string
    change?: number
    icon: React.ElementType
    href: string
    color: string
}

function StatCard({ title, value, change, icon: Icon, href, color }: StatCardProps) {
    return (
        <Link href={href}>
            <motion.div
                whileHover={{ y: -2 }}
                className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-5 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all cursor-pointer group"
            >
                <div className="flex items-center justify-between mb-3">
                    <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", color)}>
                        <Icon className="w-5 h-5 text-white" />
                    </div>
                    {change !== undefined && (
                        <span className={cn(
                            "text-xs font-medium px-2 py-0.5 rounded-full",
                            change >= 0
                                ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600"
                                : "bg-red-50 dark:bg-red-900/20 text-red-600"
                        )}>
                            {change >= 0 ? "+" : ""}{change}%
                        </span>
                    )}
                </div>
                <p className="text-2xl font-bold text-neutral-900 dark:text-white">{value}</p>
                <p className="text-sm text-neutral-500 mt-1">{title}</p>
                <div className="mt-3 flex items-center text-sm text-emerald-600 dark:text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>View details</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                </div>
            </motion.div>
        </Link>
    )
}

interface ModuleCardProps {
    title: string
    description: string
    icon: React.ElementType
    href: string
    stats: { label: string; value: string }[]
    badge?: { text: string; type: "warning" | "success" | "info" }
}

function ModuleCard({ title, description, icon: Icon, href, stats, badge }: ModuleCardProps) {
    const badgeColors = {
        warning: "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400",
        success: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400",
        info: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
    }

    return (
        <Link href={href}>
            <motion.div
                whileHover={{ y: -2 }}
                className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-5 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all cursor-pointer group h-full"
            >
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                            <Icon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-neutral-900 dark:text-white">{title}</h3>
                            <p className="text-xs text-neutral-500">{description}</p>
                        </div>
                    </div>
                    {badge && (
                        <span className={cn("text-xs font-medium px-2 py-1 rounded-full", badgeColors[badge.type])}>
                            {badge.text}
                        </span>
                    )}
                </div>
                <div className="grid grid-cols-2 gap-2 mt-4">
                    {stats.map((stat, idx) => (
                        <div key={idx} className="bg-neutral-50 dark:bg-neutral-800/50 rounded-lg p-2">
                            <p className="text-lg font-bold text-neutral-900 dark:text-white">{stat.value}</p>
                            <p className="text-[10px] text-neutral-500 uppercase tracking-wider">{stat.label}</p>
                        </div>
                    ))}
                </div>
                <div className="mt-4 flex items-center text-sm text-emerald-600 dark:text-emerald-400">
                    <span>Manage</span>
                    <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
            </motion.div>
        </Link>
    )
}

export default function HiringPlatformPage() {
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        // Simulate loading
        const timer = setTimeout(() => setIsLoading(false), 500)
        return () => clearTimeout(timer)
    }, [])

    // Mock stats - in production, these would come from server actions
    const stats = {
        totalCompanies: 150,
        verifiedCompanies: 142,
        pendingVerifications: 5,
        totalMembers: 892,
        totalJobs: 456,
        activeJobs: 324,
        totalCandidates: 2845,
        totalApplications: 8921,
    }

    if (isLoading) {
        return (
            <div className="p-6 lg:p-8 flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Activity className="w-12 h-12 animate-spin text-emerald-400 mx-auto mb-4" />
                    <p className="text-neutral-500">Loading Hiring Platform...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="p-6 lg:p-8 w-full mx-auto">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-3 h-8 rounded-full bg-emerald-500" />
                    <div>
                        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
                            Hiring Platform
                        </h1>
                        <p className="text-neutral-500 dark:text-neutral-400">
                            Coder&apos;z Hiring platform administration
                        </p>
                    </div>
                </div>

                {/* Pending Verifications Alert */}
                {stats.pendingVerifications > 0 && (
                    <Link href="/hiring/companies/verification">
                        <div className="mt-4 flex items-center justify-between p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                            <div className="flex items-center gap-3">
                                <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                                <span className="font-medium text-amber-700 dark:text-amber-300">
                                    {stats.pendingVerifications} company verifications pending
                                </span>
                            </div>
                            <span className="text-sm font-medium text-amber-600 dark:text-amber-400 underline">
                                Review now →
                            </span>
                        </div>
                    </Link>
                )}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <StatCard
                    title="Total Companies"
                    value={stats.totalCompanies.toLocaleString()}
                    change={8}
                    icon={Building2}
                    href="/hiring/companies"
                    color="bg-emerald-500"
                />
                <StatCard
                    title="Active Jobs"
                    value={stats.activeJobs.toLocaleString()}
                    change={12}
                    icon={Briefcase}
                    href="/hiring/jobs"
                    color="bg-blue-500"
                />
                <StatCard
                    title="Candidates"
                    value={stats.totalCandidates.toLocaleString()}
                    change={15}
                    icon={UserCheck}
                    href="/hiring/candidates"
                    color="bg-violet-500"
                />
                <StatCard
                    title="Applications"
                    value={stats.totalApplications.toLocaleString()}
                    change={22}
                    icon={FileText}
                    href="/hiring/applications"
                    color="bg-amber-500"
                />
            </div>

            {/* Modules Grid */}
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Platform Modules</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <ModuleCard
                    title="Companies"
                    description="Company management & verification"
                    icon={Building2}
                    href="/hiring/companies"
                    stats={[
                        { label: "Total", value: stats.totalCompanies.toLocaleString() },
                        { label: "Verified", value: stats.verifiedCompanies.toLocaleString() },
                    ]}
                    badge={stats.pendingVerifications > 0 ? { text: `${stats.pendingVerifications} pending`, type: "warning" } : undefined}
                />
                <ModuleCard
                    title="Verification Queue"
                    description="Review pending verifications"
                    icon={CheckCircle}
                    href="/hiring/companies/verification"
                    stats={[
                        { label: "Pending", value: stats.pendingVerifications.toLocaleString() },
                        { label: "This Week", value: "8" },
                    ]}
                />
                <ModuleCard
                    title="Company Members"
                    description="Member management"
                    icon={Users}
                    href="/hiring/members"
                    stats={[
                        { label: "Total", value: stats.totalMembers.toLocaleString() },
                        { label: "Recruiters", value: "654" },
                    ]}
                />
                <ModuleCard
                    title="Job Listings"
                    description="Job management"
                    icon={Briefcase}
                    href="/hiring/jobs"
                    stats={[
                        { label: "Total", value: stats.totalJobs.toLocaleString() },
                        { label: "Active", value: stats.activeJobs.toLocaleString() },
                    ]}
                />
                <ModuleCard
                    title="Candidates"
                    description="Candidate profiles"
                    icon={UserCheck}
                    href="/hiring/candidates"
                    stats={[
                        { label: "Total", value: stats.totalCandidates.toLocaleString() },
                        { label: "Verified", value: "2,456" },
                    ]}
                />
                <ModuleCard
                    title="Applications"
                    description="Job applications"
                    icon={FileText}
                    href="/hiring/applications"
                    stats={[
                        { label: "Total", value: stats.totalApplications.toLocaleString() },
                        { label: "This Month", value: "1,234" },
                    ]}
                />
                <ModuleCard
                    title="Invitations"
                    description="Company invitations"
                    icon={UserPlus}
                    href="/hiring/invitations"
                    stats={[
                        { label: "Sent", value: "345" },
                        { label: "Pending", value: "23" },
                    ]}
                />
                <ModuleCard
                    title="Analytics"
                    description="Hiring analytics"
                    icon={BarChart3}
                    href="/hiring/analytics"
                    stats={[
                        { label: "Placements", value: "456" },
                        { label: "Avg. Time", value: "12d" },
                    ]}
                />
            </div>
        </div>
    )
}
