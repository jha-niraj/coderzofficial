"use client"

import { useState, useEffect } from "react"
import {
    GraduationCap, Users, Building2, BookOpen, UserCheck, Briefcase,
    Activity, ArrowRight, CheckCircle, Clock, Coins, BarChart3, 
    BookMarked
} from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { getUniversityDashboardStats } from "@/actions/uni/uni.action"

interface StatCardProps {
    title: string
    value: string
    icon: React.ElementType
    href: string
    color: string
}

function StatCard({ title, value, icon: Icon, href, color }: StatCardProps) {
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
                    {
                        badge && (
                            <span className={cn("text-xs font-medium px-2 py-1 rounded-full", badgeColors[badge.type])}>
                                {badge.text}
                            </span>
                        )
                    }
                </div>
                <div className="grid grid-cols-2 gap-2 mt-4">
                    {
                        stats.map((stat, idx) => (
                            <div key={idx} className="bg-neutral-50 dark:bg-neutral-800/50 rounded-lg p-2">
                                <p className="text-lg font-bold text-neutral-900 dark:text-white">{stat.value}</p>
                                <p className="text-[10px] text-neutral-500 uppercase tracking-wider">{stat.label}</p>
                            </div>
                        ))
                    }
                </div>
                <div className="mt-4 flex items-center text-sm text-violet-600 dark:text-violet-400">
                    <span>Manage</span>
                    <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
            </motion.div>
        </Link>
    )
}

interface DashboardStats {
    totalUniversities: number
    verifiedUniversities: number
    pendingVerifications: number
    rejectedVerifications: number
    totalDepartments: number
    totalFaculty: number
    totalStudents: number
    verifiedStudents: number
    totalClasses: number
    totalCreditsAllocated: number
}

export default function UniversityPlatformPage() {
    const [isLoading, setIsLoading] = useState(true)
    const [stats, setStats] = useState<DashboardStats | null>(null)

    useEffect(() => {
        async function fetchStats() {
            try {
                const result = await getUniversityDashboardStats()
                if (result.success && result.data) {
                    setStats(result.data)
                }
            } catch (error) {
                console.error("Failed to fetch stats:", error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchStats()
    }, [])

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

    // Use real stats or fallback to 0
    const displayStats = stats || {
        totalUniversities: 0,
        verifiedUniversities: 0,
        pendingVerifications: 0,
        rejectedVerifications: 0,
        totalDepartments: 0,
        totalFaculty: 0,
        totalStudents: 0,
        verifiedStudents: 0,
        totalClasses: 0,
        totalCreditsAllocated: 0,
    }

    return (
        <div className="p-6 lg:p-8 w-full mx-auto">
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
                {
                    displayStats.pendingVerifications > 0 && (
                        <Link href="/uni/universities/verification">
                            <div className="mt-4 flex items-center justify-between p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                                <div className="flex items-center gap-3">
                                    <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                                    <span className="font-medium text-amber-700 dark:text-amber-300">
                                        {displayStats.pendingVerifications} university verifications pending
                                    </span>
                                </div>
                                <span className="text-sm font-medium text-amber-600 dark:text-amber-400 underline">
                                    Review now →
                                </span>
                            </div>
                        </Link>
                    )
                }
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <StatCard
                    title="Universities"
                    value={displayStats.totalUniversities.toLocaleString()}
                    icon={GraduationCap}
                    href="/uni/universities"
                    color="bg-violet-500"
                />
                <StatCard
                    title="Students"
                    value={displayStats.totalStudents.toLocaleString()}
                    icon={Users}
                    href="/uni/students"
                    color="bg-blue-500"
                />
                <StatCard
                    title="Faculty"
                    value={displayStats.totalFaculty.toLocaleString()}
                    icon={UserCheck}
                    href="/uni/faculty"
                    color="bg-emerald-500"
                />
                <StatCard
                    title="Classes"
                    value={displayStats.totalClasses.toLocaleString()}
                    icon={BookMarked}
                    href="/uni/classes"
                    color="bg-amber-500"
                />
            </div>
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Platform Modules</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <ModuleCard
                    title="Universities"
                    description="University management & verification"
                    icon={GraduationCap}
                    href="/uni/universities"
                    stats={[
                        { label: "Total", value: displayStats.totalUniversities.toLocaleString() },
                        { label: "Verified", value: displayStats.verifiedUniversities.toLocaleString() },
                    ]}
                    badge={displayStats.pendingVerifications > 0 ? { text: `${displayStats.pendingVerifications} pending`, type: "warning" } : undefined}
                />
                <ModuleCard
                    title="Verification Queue"
                    description="Review pending verifications"
                    icon={CheckCircle}
                    href="/uni/universities/verification"
                    stats={[
                        { label: "Pending", value: displayStats.pendingVerifications.toLocaleString() },
                        { label: "Rejected", value: displayStats.rejectedVerifications.toLocaleString() },
                    ]}
                />
                <ModuleCard
                    title="Departments"
                    description="Department management"
                    icon={Building2}
                    href="/uni/departments"
                    stats={[
                        { label: "Total", value: displayStats.totalDepartments.toLocaleString() },
                        { label: "Universities", value: displayStats.totalUniversities.toLocaleString() },
                    ]}
                />
                <ModuleCard
                    title="Faculty"
                    description="Faculty members"
                    icon={UserCheck}
                    href="/uni/faculty"
                    stats={[
                        { label: "Total", value: displayStats.totalFaculty.toLocaleString() },
                        { label: "Departments", value: displayStats.totalDepartments.toLocaleString() },
                    ]}
                />
                <ModuleCard
                    title="Students"
                    description="Student verification"
                    icon={Users}
                    href="/uni/students"
                    stats={[
                        { label: "Total", value: displayStats.totalStudents.toLocaleString() },
                        { label: "Verified", value: displayStats.verifiedStudents.toLocaleString() },
                    ]}
                />
                <ModuleCard
                    title="Classes"
                    description="Class management"
                    icon={BookOpen}
                    href="/uni/classes"
                    stats={[
                        { label: "Total", value: displayStats.totalClasses.toLocaleString() },
                        { label: "Universities", value: displayStats.totalUniversities.toLocaleString() },
                    ]}
                />
                <ModuleCard
                    title="Placements"
                    description="Placement jobs (Mock Data)"
                    icon={Briefcase}
                    href="/uni/placements"
                    stats={[
                        { label: "Jobs", value: "—" },
                        { label: "Placed", value: "—" },
                    ]}
                    badge={{ text: "Coming Soon", type: "info" }}
                />
                <ModuleCard
                    title="Credits"
                    description="University credits"
                    icon={Coins}
                    href="/uni/credits"
                    stats={[
                        { label: "Allocated", value: displayStats.totalCreditsAllocated > 1000 ? `${(displayStats.totalCreditsAllocated / 1000).toFixed(0)}K` : displayStats.totalCreditsAllocated.toLocaleString() },
                        { label: "Universities", value: displayStats.totalUniversities.toLocaleString() },
                    ]}
                />
                <ModuleCard
                    title="Analytics"
                    description="University analytics (Mock Data)"
                    icon={BarChart3}
                    href="/uni/analytics"
                    stats={[
                        { label: "Students", value: displayStats.totalStudents.toLocaleString() },
                        { label: "Classes", value: displayStats.totalClasses.toLocaleString() },
                    ]}
                    badge={{ text: "Coming Soon", type: "info" }}
                />
            </div>
        </div>
    )
}