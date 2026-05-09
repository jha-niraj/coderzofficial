"use client"

import { useState, useEffect } from "react"
import { useSession } from "@repo/auth/client"
import {
    Users, CreditCard, TrendingUp,
    Activity, ArrowRight, AlertCircle, CheckCircle, Bell,
    Code, Building2, GraduationCap, Shield, MessageCircle
} from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { getDashboardStats } from "@/actions/admin.action"
import { getHiringDashboardStats } from "@/actions/hiring/hiring.action"
import { getUniversityDashboardStats } from "@/actions/uni/uni.action"
import { getOverviewStats } from "@/actions/main/analytics.action"
import { toast } from "@repo/ui/components/ui/sonner"
import type { StatsData } from "@/types/admin"

interface PlatformCardProps {
    title: string
    description: string
    icon: React.ElementType
    color: string
    bgColor: string
    href: string
    stats: Array<{ label: string; value: string }>
    pendingActions?: number
}

function PlatformCard({ title, description, icon: Icon, color, bgColor, href, stats, pendingActions }: PlatformCardProps) {
    return (
        <Link href={href}>
            <motion.div
                whileHover={{ y: -4 }}
                className={cn(
                    "relative rounded-2xl border p-6 transition-all cursor-pointer group overflow-hidden",
                    "bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800",
                    "hover:shadow-xl hover:border-neutral-300 dark:hover:border-neutral-700"
                )}
            >
                <div className={cn("absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 -translate-y-1/2 translate-x-1/2", bgColor)} />
                {pendingActions && pendingActions > 0 && (
                    <div className="absolute top-4 right-4">
                        <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 text-xs font-medium">
                            <AlertCircle className="w-3 h-3" />
                            {pendingActions} pending
                        </span>
                    </div>
                )}
                <div className="flex items-center gap-3 mb-4">
                    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", bgColor)}>
                        <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-neutral-900 dark:text-white">{title}</h3>
                        <p className="text-sm text-neutral-500">{description}</p>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-6">
                    {stats.map((stat, idx) => (
                        <div key={idx} className="bg-neutral-50 dark:bg-neutral-800/50 rounded-lg p-3">
                            <p className="text-2xl font-bold text-neutral-900 dark:text-white">{stat.value}</p>
                            <p className="text-xs text-neutral-500">{stat.label}</p>
                        </div>
                    ))}
                </div>
                <div className={cn("mt-6 flex items-center text-sm font-medium transition-colors", color)}>
                    <span>Manage Platform</span>
                    <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
            </motion.div>
        </Link>
    )
}

interface QuickStatProps {
    title: string
    value: string
    change?: number
    icon: React.ElementType
    color: string
}

function QuickStat({ title, value, change, icon: Icon, color }: QuickStatProps) {
    return (
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
            <div className="flex items-center justify-between">
                <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", color)}>
                    <Icon className="w-5 h-5 text-white" />
                </div>
                {change !== undefined && (
                    <span className={cn(
                        "text-xs font-medium px-2 py-0.5 rounded-full",
                        change >= 0
                            ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400"
                            : "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
                    )}>
                        {change >= 0 ? "+" : ""}{change}%
                    </span>
                )}
            </div>
            <p className="text-2xl font-bold text-neutral-900 dark:text-white mt-3">{value}</p>
            <p className="text-sm text-neutral-500">{title}</p>
        </div>
    )
}

interface PendingActionProps {
    title: string
    count: number
    type: "warning" | "info" | "success"
    href: string
    platform: "main" | "hiring" | "uni"
}

function PendingAction({ title, count, type, href, platform }: PendingActionProps) {
    if (count === 0) return null

    const colors = {
        warning: "bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20 text-amber-700 dark:text-amber-400",
        info: "bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20 text-blue-700 dark:text-blue-400",
        success: "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400"
    }
    const icons = { warning: AlertCircle, info: Bell, success: CheckCircle }
    const platformColors = { main: "border-l-blue-500", hiring: "border-l-emerald-500", uni: "border-l-violet-500" }
    const Icon = icons[type]

    return (
        <Link href={href}>
            <div className={cn(
                "flex items-center justify-between p-4 rounded-lg border border-l-4 transition-all hover:scale-[1.01]",
                colors[type],
                platformColors[platform]
            )}>
                <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{count} {title}</span>
                </div>
                <span className="text-sm font-medium underline underline-offset-2">Review</span>
            </div>
        </Link>
    )
}

interface AllStats {
    main: StatsData | null
    hiring: {
        totalCompanies: number
        verifiedCompanies: number
        pendingVerifications: number
        totalMembers: number
        totalJobs: number
        activeJobs: number
        totalApplications: number
        [key: string]: number
    } | null
    uni: {
        totalUniversities: number
        verifiedUniversities: number
        pendingVerifications: number
        totalDepartments: number
        totalFaculty: number
        totalStudents: number
        totalClasses: number
        [key: string]: number
    } | null
    overview: {
        totalUsers?: number
        newUsers?: number
        totalProjects?: number
        activeCommunities?: number
        totalFeedback?: number
    } | null
}

export default function AdminDashboard() {
    const { data: session } = useSession()
    const [allStats, setAllStats] = useState<AllStats>({ main: null, hiring: null, uni: null, overview: null })
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        async function fetchData() {
            setIsLoading(true)
            try {
                const [mainRes, hiringRes, uniRes, overviewRes] = await Promise.all([
                    getDashboardStats(),
                    getHiringDashboardStats(),
                    getUniversityDashboardStats(),
                    getOverviewStats(),
                ])
                setAllStats({
                    main: mainRes.success ? mainRes.data ?? null : null,
                    hiring: hiringRes.success ? (hiringRes.data as AllStats["hiring"]) ?? null : null,
                    uni: uniRes.success ? (uniRes.data as AllStats["uni"]) ?? null : null,
                    overview: overviewRes.success ? overviewRes.data ?? null : null,
                })
            } catch (error) {
                console.error("Failed to fetch dashboard data:", error)
                toast.error("Failed to load dashboard data")
            } finally {
                setIsLoading(false)
            }
        }
        fetchData()
    }, [])

    const { main, hiring, uni, overview } = allStats

    const pendingActions: PendingActionProps[] = ([
        { title: "company verifications pending", count: hiring?.pendingVerifications ?? 0, type: "warning" as const, href: "/hiring/companies/verification", platform: "hiring" as const },
        { title: "university verifications pending", count: uni?.pendingVerifications ?? 0, type: "warning" as const, href: "/uni/universities/verification", platform: "uni" as const },
        { title: "feedback items submitted", count: overview?.totalFeedback ?? 0, type: "info" as const, href: "/feedback", platform: "main" as const },
    ] satisfies PendingActionProps[]).filter(a => a.count > 0)

    if (isLoading) {
        return (
            <div className="p-6 lg:p-8 max-w-7xl mx-auto flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Activity className="w-12 h-12 animate-spin text-neutral-400 mx-auto mb-4" />
                    <p className="text-neutral-500 dark:text-neutral-400">Loading dashboard...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="p-6 lg:p-8 w-full mx-auto">
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                        <Shield className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
                            Welcome back, {session?.user?.name?.split(" ")[0] || "Admin"}
                        </h1>
                        <p className="text-neutral-500 dark:text-neutral-400">
                            Multi-platform control center • Managing 3 platforms
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <QuickStat
                    title="Total Users"
                    value={main?.totalUsers?.toLocaleString() ?? "0"}
                    change={main?.growthRate as number}
                    icon={Users}
                    color="bg-blue-500"
                />
                <QuickStat
                    title="Active Admins"
                    value={main?.totalAdmins?.toString() ?? "0"}
                    icon={Shield}
                    color="bg-purple-500"
                />
                <QuickStat
                    title="Total Credits"
                    value={main?.totalCredits?.toLocaleString() ?? "0"}
                    icon={CreditCard}
                    color="bg-emerald-500"
                />
                <QuickStat
                    title="New This Month"
                    value={main?.newUsersThisMonth?.toLocaleString() ?? "0"}
                    change={main?.growthRate as number}
                    icon={TrendingUp}
                    color="bg-amber-500"
                />
            </div>

            <div className="mb-8">
                <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Platform Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <PlatformCard
                        title="Main Platform"
                        description="Coder'z learning platform"
                        icon={Code}
                        color="text-blue-600 dark:text-blue-400"
                        bgColor="bg-blue-500"
                        href="/dashboard"
                        stats={[
                            { label: "Total Users", value: main?.totalUsers?.toLocaleString() ?? "0" },
                            { label: "New This Month", value: main?.newUsersThisMonth?.toLocaleString() ?? "0" },
                            { label: "Projects", value: overview?.totalProjects?.toLocaleString() ?? "—" },
                            { label: "Communities", value: overview?.activeCommunities?.toLocaleString() ?? "—" },
                        ]}
                        pendingActions={undefined}
                    />
                    <PlatformCard
                        title="Hiring Platform"
                        description="Coder'z Hiring platform"
                        icon={Building2}
                        color="text-emerald-600 dark:text-emerald-400"
                        bgColor="bg-emerald-500"
                        href="/hiring"
                        stats={[
                            { label: "Companies", value: hiring?.totalCompanies?.toLocaleString() ?? "0" },
                            { label: "Active Jobs", value: hiring?.activeJobs?.toLocaleString() ?? "0" },
                            { label: "Members", value: hiring?.totalMembers?.toLocaleString() ?? "0" },
                            { label: "Applications", value: hiring?.totalApplications?.toLocaleString() ?? "0" },
                        ]}
                        pendingActions={hiring?.pendingVerifications}
                    />
                    <PlatformCard
                        title="University Platform"
                        description="Coder'z University platform"
                        icon={GraduationCap}
                        color="text-violet-600 dark:text-violet-400"
                        bgColor="bg-violet-500"
                        href="/uni"
                        stats={[
                            { label: "Universities", value: uni?.totalUniversities?.toLocaleString() ?? "0" },
                            { label: "Students", value: uni?.totalStudents?.toLocaleString() ?? "0" },
                            { label: "Faculty", value: uni?.totalFaculty?.toLocaleString() ?? "0" },
                            { label: "Classes", value: uni?.totalClasses?.toLocaleString() ?? "0" },
                        ]}
                        pendingActions={uni?.pendingVerifications}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Pending Actions</h2>
                        <span className="text-sm text-neutral-500 dark:text-neutral-400">
                            {pendingActions.reduce((acc, a) => acc + a.count, 0)} total
                        </span>
                    </div>
                    <div className="space-y-3">
                        {pendingActions.length === 0 ? (
                            <div className="flex items-center gap-3 p-4 rounded-lg bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 dark:text-emerald-400">
                                <CheckCircle className="w-5 h-5" />
                                <span className="font-medium">All caught up — no pending actions</span>
                            </div>
                        ) : (
                            pendingActions.map((action, index) => (
                                <PendingAction key={index} {...action} />
                            ))
                        )}
                    </div>
                </div>

                <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Quick Links</h2>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <Link href="/users" className="flex items-center gap-3 p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors">
                            <Users className="w-5 h-5 text-blue-500" />
                            <span className="text-sm font-medium text-neutral-900 dark:text-white">Manage Users</span>
                        </Link>
                        <Link href="/hiring/companies" className="flex items-center gap-3 p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors">
                            <Building2 className="w-5 h-5 text-emerald-500" />
                            <span className="text-sm font-medium text-neutral-900 dark:text-white">Companies</span>
                        </Link>
                        <Link href="/uni/universities" className="flex items-center gap-3 p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors">
                            <GraduationCap className="w-5 h-5 text-violet-500" />
                            <span className="text-sm font-medium text-neutral-900 dark:text-white">Universities</span>
                        </Link>
                        <Link href="/credits" className="flex items-center gap-3 p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors">
                            <CreditCard className="w-5 h-5 text-purple-500" />
                            <span className="text-sm font-medium text-neutral-900 dark:text-white">Credits</span>
                        </Link>
                        <Link href="/feedback" className="flex items-center gap-3 p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors">
                            <MessageCircle className="w-5 h-5 text-amber-500" />
                            <span className="text-sm font-medium text-neutral-900 dark:text-white">Feedback</span>
                        </Link>
                        <Link href="/admins" className="flex items-center gap-3 p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors">
                            <Shield className="w-5 h-5 text-red-500" />
                            <span className="text-sm font-medium text-neutral-900 dark:text-white">Admin Users</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
