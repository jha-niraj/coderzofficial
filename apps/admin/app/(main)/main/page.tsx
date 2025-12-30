"use client"

import { useState, useEffect } from "react"
import {
    Users, CreditCard, FolderKanban, Mic, TrendingUp,
    Activity, ArrowRight, MessageSquare, ClipboardCheck, Trophy,
    MessageCircle, BarChart3
} from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { getDashboardStats } from "@/actions/admin.action"
import { toast } from "@repo/ui/components/ui/sonner"

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
                className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-5 hover:border-blue-300 dark:hover:border-blue-700 transition-all cursor-pointer group"
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
                <div className="mt-3 flex items-center text-sm text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
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
}

function ModuleCard({ title, description, icon: Icon, href, stats }: ModuleCardProps) {
    return (
        <Link href={href}>
            <motion.div
                whileHover={{ y: -2 }}
                className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-5 hover:border-blue-300 dark:hover:border-blue-700 transition-all cursor-pointer group h-full"
            >
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-neutral-900 dark:text-white">{title}</h3>
                        <p className="text-xs text-neutral-500">{description}</p>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-4">
                    {stats.map((stat, idx) => (
                        <div key={idx} className="bg-neutral-50 dark:bg-neutral-800/50 rounded-lg p-2">
                            <p className="text-lg font-bold text-neutral-900 dark:text-white">{stat.value}</p>
                            <p className="text-[10px] text-neutral-500 uppercase tracking-wider">{stat.label}</p>
                        </div>
                    ))}
                </div>
                <div className="mt-4 flex items-center text-sm text-blue-600 dark:text-blue-400">
                    <span>Manage</span>
                    <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
            </motion.div>
        </Link>
    )
}

export default function MainPlatformPage() {
    const [stats, setStats] = useState<Record<string, number | undefined>>({})
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        async function fetchData() {
            setIsLoading(true)
            try {
                const statsRes = await getDashboardStats()
                if (statsRes.success && statsRes.data) {
                    setStats(statsRes.data)
                }
            } catch (error) {
                console.error("Failed to fetch stats:", error)
                toast.error("Failed to load platform stats")
            } finally {
                setIsLoading(false)
            }
        }
        fetchData()
    }, [])

    if (isLoading) {
        return (
            <div className="p-6 lg:p-8 flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Activity className="w-12 h-12 animate-spin text-blue-400 mx-auto mb-4" />
                    <p className="text-neutral-500">Loading Main Platform...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="p-6 lg:p-8 w-full mx-auto">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-3 h-8 rounded-full bg-blue-500" />
                    <div>
                        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
                            Main Platform
                        </h1>
                        <p className="text-neutral-500 dark:text-neutral-400">
                            Coder&apos;z learning platform administration
                        </p>
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <StatCard
                    title="Total Users"
                    value={stats?.totalUsers?.toLocaleString() || "0"}
                    change={stats?.growthRate as number}
                    icon={Users}
                    href="/main/users"
                    color="bg-blue-500"
                />
                <StatCard
                    title="Active Today"
                    value={stats?.activeToday?.toString() || "0"}
                    change={5}
                    icon={Activity}
                    href="/main/analytics"
                    color="bg-emerald-500"
                />
                <StatCard
                    title="Total Credits"
                    value={stats?.totalCredits?.toLocaleString() || "0"}
                    change={8}
                    icon={CreditCard}
                    href="/main/credits"
                    color="bg-purple-500"
                />
                <StatCard
                    title="New This Month"
                    value={stats?.newUsersThisMonth?.toLocaleString() || "0"}
                    change={stats?.growthRate as number}
                    icon={TrendingUp}
                    href="/main/users"
                    color="bg-amber-500"
                />
            </div>

            {/* Modules Grid */}
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Platform Modules</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <ModuleCard
                    title="Users"
                    description="User management & roles"
                    icon={Users}
                    href="/main/users"
                    stats={[
                        { label: "Total", value: stats?.totalUsers?.toLocaleString() || "0" },
                        { label: "New (30d)", value: stats?.newUsersThisMonth?.toLocaleString() || "0" },
                    ]}
                />
                <ModuleCard
                    title="Credits"
                    description="Credit transactions & requests"
                    icon={CreditCard}
                    href="/main/credits"
                    stats={[
                        { label: "Total", value: stats?.totalCredits?.toLocaleString() || "0" },
                        { label: "Requests", value: "12" },
                    ]}
                />
                <ModuleCard
                    title="Projects"
                    description="Studio projects & ideas"
                    icon={FolderKanban}
                    href="/main/projects"
                    stats={[
                        { label: "Total", value: "856" },
                        { label: "Ideas", value: "124" },
                    ]}
                />
                <ModuleCard
                    title="Mock Interviews"
                    description="Voice mock sessions"
                    icon={Mic}
                    href="/main/mocks"
                    stats={[
                        { label: "Sessions", value: "1,234" },
                        { label: "Active", value: "89" },
                    ]}
                />
                <ModuleCard
                    title="Assessments"
                    description="Topics & questions"
                    icon={ClipboardCheck}
                    href="/main/assessments"
                    stats={[
                        { label: "Topics", value: "45" },
                        { label: "Questions", value: "2,340" },
                    ]}
                />
                <ModuleCard
                    title="Challenges"
                    description="Forge, Crucible & Collective"
                    icon={Trophy}
                    href="/main/challenges"
                    stats={[
                        { label: "Tracks", value: "12" },
                        { label: "Events", value: "8" },
                    ]}
                />
                <ModuleCard
                    title="Communities"
                    description="Community management"
                    icon={MessageSquare}
                    href="/main/communities"
                    stats={[
                        { label: "Total", value: "48" },
                        { label: "Reports", value: "5" },
                    ]}
                />
                <ModuleCard
                    title="Feedback"
                    description="User feedback & bugs"
                    icon={MessageCircle}
                    href="/main/feedback"
                    stats={[
                        { label: "Total", value: "234" },
                        { label: "Bugs", value: "18" },
                    ]}
                />
                <ModuleCard
                    title="Analytics"
                    description="Platform analytics"
                    icon={BarChart3}
                    href="/main/analytics"
                    stats={[
                        { label: "DAU", value: stats?.activeToday?.toString() || "0" },
                        { label: "MAU", value: stats?.totalUsers?.toLocaleString() || "0" },
                    ]}
                />
            </div>
        </div>
    )
}
