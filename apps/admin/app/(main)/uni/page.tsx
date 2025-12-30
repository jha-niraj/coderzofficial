"use client"

import { useState, useEffect } from "react"
import {
    GraduationCap, Users, Building2, BookOpen, UserCheck, Briefcase,
    Activity, ArrowRight, CheckCircle, Clock, Coins, BarChart3, BookMarked
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
                className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-5 hover:border-violet-300 dark:hover:border-violet-700 transition-all cursor-pointer group"
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
                <div className="mt-3 flex items-center text-sm text-violet-600 dark:text-violet-400 opacity-0 group-hover:opacity-100 transition-opacity">
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
                className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-5 hover:border-violet-300 dark:hover:border-violet-700 transition-all cursor-pointer group h-full"
            >
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center">
                            <Icon className="w-5 h-5 text-violet-600 dark:text-violet-400" />
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
                <div className="mt-4 flex items-center text-sm text-violet-600 dark:text-violet-400">
                    <span>Manage</span>
                    <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
            </motion.div>
        </Link>
    )
}

export default function UniversityPlatformPage() {
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        // Simulate loading
        const timer = setTimeout(() => setIsLoading(false), 500)
        return () => clearTimeout(timer)
    }, [])

    // Mock stats - in production, these would come from server actions
    const stats = {
        totalUniversities: 25,
        verifiedUniversities: 22,
        pendingVerifications: 3,
        totalDepartments: 156,
        totalFaculty: 892,
        totalStudents: 12450,
        verifiedStudents: 11234,
        totalClasses: 456,
        totalAssignments: 3210,
        totalCreditsUsed: 245000,
    }

    if (isLoading) {
        return (
            <div className="p-6 lg:p-8 flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Activity className="w-12 h-12 animate-spin text-violet-400 mx-auto mb-4" />
                    <p className="text-neutral-500">Loading University Platform...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="p-6 lg:p-8 w-full mx-auto">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-3 h-8 rounded-full bg-violet-500" />
                    <div>
                        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
                            University Platform
                        </h1>
                        <p className="text-neutral-500 dark:text-neutral-400">
                            Coder&apos;z University platform administration
                        </p>
                    </div>
                </div>

                {/* Pending Verifications Alert */}
                {stats.pendingVerifications > 0 && (
                    <Link href="/uni/universities/verification">
                        <div className="mt-4 flex items-center justify-between p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                            <div className="flex items-center gap-3">
                                <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                                <span className="font-medium text-amber-700 dark:text-amber-300">
                                    {stats.pendingVerifications} university verifications pending
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
                    title="Universities"
                    value={stats.totalUniversities.toLocaleString()}
                    change={15}
                    icon={GraduationCap}
                    href="/uni/universities"
                    color="bg-violet-500"
                />
                <StatCard
                    title="Students"
                    value={stats.totalStudents.toLocaleString()}
                    change={22}
                    icon={Users}
                    href="/uni/students"
                    color="bg-blue-500"
                />
                <StatCard
                    title="Faculty"
                    value={stats.totalFaculty.toLocaleString()}
                    change={8}
                    icon={UserCheck}
                    href="/uni/faculty"
                    color="bg-emerald-500"
                />
                <StatCard
                    title="Assignments"
                    value={stats.totalAssignments.toLocaleString()}
                    change={45}
                    icon={BookMarked}
                    href="/uni/assignments"
                    color="bg-amber-500"
                />
            </div>

            {/* Modules Grid */}
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Platform Modules</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <ModuleCard
                    title="Universities"
                    description="University management & verification"
                    icon={GraduationCap}
                    href="/uni/universities"
                    stats={[
                        { label: "Total", value: stats.totalUniversities.toLocaleString() },
                        { label: "Verified", value: stats.verifiedUniversities.toLocaleString() },
                    ]}
                    badge={stats.pendingVerifications > 0 ? { text: `${stats.pendingVerifications} pending`, type: "warning" } : undefined}
                />
                <ModuleCard
                    title="Verification Queue"
                    description="Review pending verifications"
                    icon={CheckCircle}
                    href="/uni/universities/verification"
                    stats={[
                        { label: "Pending", value: stats.pendingVerifications.toLocaleString() },
                        { label: "This Week", value: "5" },
                    ]}
                />
                <ModuleCard
                    title="Departments"
                    description="Department management"
                    icon={Building2}
                    href="/uni/departments"
                    stats={[
                        { label: "Total", value: stats.totalDepartments.toLocaleString() },
                        { label: "Active", value: "148" },
                    ]}
                />
                <ModuleCard
                    title="Faculty"
                    description="Faculty members"
                    icon={UserCheck}
                    href="/uni/faculty"
                    stats={[
                        { label: "Total", value: stats.totalFaculty.toLocaleString() },
                        { label: "HODs", value: "156" },
                    ]}
                />
                <ModuleCard
                    title="Students"
                    description="Student verification"
                    icon={Users}
                    href="/uni/students"
                    stats={[
                        { label: "Total", value: stats.totalStudents.toLocaleString() },
                        { label: "Verified", value: stats.verifiedStudents.toLocaleString() },
                    ]}
                />
                <ModuleCard
                    title="Classes"
                    description="Class management"
                    icon={BookOpen}
                    href="/uni/classes"
                    stats={[
                        { label: "Total", value: stats.totalClasses.toLocaleString() },
                        { label: "Active", value: "324" },
                    ]}
                />
                <ModuleCard
                    title="Assignments"
                    description="Assignment management"
                    icon={BookMarked}
                    href="/uni/assignments"
                    stats={[
                        { label: "Total", value: stats.totalAssignments.toLocaleString() },
                        { label: "Active", value: "1,245" },
                    ]}
                />
                <ModuleCard
                    title="Placements"
                    description="Placement jobs"
                    icon={Briefcase}
                    href="/uni/placements"
                    stats={[
                        { label: "Jobs", value: "234" },
                        { label: "Placed", value: "1,456" },
                    ]}
                />
                <ModuleCard
                    title="Credits"
                    description="University credits"
                    icon={Coins}
                    href="/uni/credits"
                    stats={[
                        { label: "Allocated", value: (stats.totalCreditsUsed / 1000).toFixed(0) + "K" },
                        { label: "Used", value: "180K" },
                    ]}
                />
                <ModuleCard
                    title="Analytics"
                    description="University analytics"
                    icon={BarChart3}
                    href="/uni/analytics"
                    stats={[
                        { label: "Completion", value: "78%" },
                        { label: "Avg. Score", value: "82%" },
                    ]}
                />
            </div>
        </div>
    )
}
