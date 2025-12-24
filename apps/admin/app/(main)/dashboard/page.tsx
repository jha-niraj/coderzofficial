"use client"

import { useState, useEffect } from "react"
import { useSession } from "@repo/auth"
import { 
    Users, CreditCard, FolderKanban, Mic, TrendingUp, TrendingDown, 
    Activity, Clock, ArrowRight, AlertCircle, CheckCircle, Bell
} from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface StatCardProps {
    title: string
    value: string
    change: number
    icon: React.ElementType
    href: string
    color: string
}

function StatCard({ title, value, change, icon: Icon, href, color }: StatCardProps) {
    const isPositive = change >= 0

    return (
        <Link href={href}>
            <motion.div
                whileHover={{ y: -2 }}
                className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all cursor-pointer group"
            >
                <div className="flex items-start justify-between">
                    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", color)}>
                        <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className={cn(
                        "flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-full",
                        isPositive 
                            ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400"
                    )}>
                        {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        <span>{Math.abs(change)}%</span>
                    </div>
                </div>
                <div className="mt-4">
                    <p className="text-3xl font-bold text-neutral-900 dark:text-white">{value}</p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">{title}</p>
                </div>
                <div className="mt-4 flex items-center text-sm text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors">
                    <span>View details</span>
                    <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
            </motion.div>
        </Link>
    )
}

interface PendingActionProps {
    title: string
    count: number
    type: "warning" | "info" | "success"
    href: string
}

function PendingAction({ title, count, type, href }: PendingActionProps) {
    const colors = {
        warning: "bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20 text-amber-700 dark:text-amber-400",
        info: "bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20 text-blue-700 dark:text-blue-400",
        success: "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400"
    }

    const icons = {
        warning: AlertCircle,
        info: Bell,
        success: CheckCircle
    }

    const Icon = icons[type]

    return (
        <Link href={href}>
            <div className={cn(
                "flex items-center justify-between p-4 rounded-lg border transition-all hover:scale-[1.01]",
                colors[type]
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

interface RecentActivityProps {
    activities: Array<{
        id: string
        action: string
        user: string
        time: string
        type: "user" | "credit" | "project" | "system"
    }>
}

function RecentActivity({ activities }: RecentActivityProps) {
    const icons = {
        user: Users,
        credit: CreditCard,
        project: FolderKanban,
        system: Activity
    }

    const colors = {
        user: "bg-blue-500",
        credit: "bg-emerald-500",
        project: "bg-purple-500",
        system: "bg-neutral-500"
    }

    return (
        <div className="space-y-3">
            {activities.map((activity) => {
                const Icon = icons[activity.type]
                return (
                    <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                        <div className={cn("w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0", colors[activity.type])}>
                            <Icon className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm text-neutral-900 dark:text-white">{activity.action}</p>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">{activity.user}</p>
                        </div>
                        <span className="text-xs text-neutral-400 flex-shrink-0">{activity.time}</span>
                    </div>
                )
            })}
        </div>
    )
}

export default function AdminDashboard() {
    const { data: session } = useSession()
    const [stats, setStats] = useState({
        totalUsers: "12,456",
        activeToday: "342",
        totalCredits: "1.2M",
        revenue: "₹45,230"
    })

    // Mock data - replace with actual API calls
    const pendingActions = [
        { title: "Credit requests awaiting approval", count: 23, type: "warning" as const, href: "/credits/requests" },
        { title: "Feedback items marked as BUG", count: 5, type: "warning" as const, href: "/feedback" },
        { title: "Project ideas pending review", count: 12, type: "info" as const, href: "/projects/ideas" },
        { title: "Community reports flagged", count: 3, type: "warning" as const, href: "/communities/reports" },
    ]

    const recentActivities = [
        { id: "1", action: "User earned 500 XP from project completion", user: "john@example.com", time: "2m ago", type: "user" as const },
        { id: "2", action: "New project 'AI Bot' created", user: "System", time: "5m ago", type: "project" as const },
        { id: "3", action: "Credit request approved (+500)", user: "admin@example.com", time: "10m ago", type: "credit" as const },
        { id: "4", action: "New user registration", user: "newuser@example.com", time: "15m ago", type: "user" as const },
        { id: "5", action: "Feedback #123 marked complete", user: "support@example.com", time: "20m ago", type: "system" as const },
    ]

    return (
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
                    Welcome back, {session?.user?.name?.split(' ')[0] || 'Admin'}
                </h1>
                <p className="text-neutral-500 dark:text-neutral-400 mt-1">
                    Here's what's happening with your platform today.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard
                    title="Total Users"
                    value={stats.totalUsers}
                    change={12}
                    icon={Users}
                    href="/users"
                    color="bg-gradient-to-br from-blue-500 to-blue-600"
                />
                <StatCard
                    title="Active Today"
                    value={stats.activeToday}
                    change={5}
                    icon={Activity}
                    href="/analytics"
                    color="bg-gradient-to-br from-emerald-500 to-emerald-600"
                />
                <StatCard
                    title="Total Credits"
                    value={stats.totalCredits}
                    change={8}
                    icon={CreditCard}
                    href="/credits"
                    color="bg-gradient-to-br from-purple-500 to-purple-600"
                />
                <StatCard
                    title="Revenue (30d)"
                    value={stats.revenue}
                    change={-3}
                    icon={TrendingUp}
                    href="/credits/payments"
                    color="bg-gradient-to-br from-amber-500 to-amber-600"
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Pending Actions */}
                <div className="lg:col-span-2">
                    <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Pending Actions</h2>
                            <span className="text-sm text-neutral-500 dark:text-neutral-400">
                                {pendingActions.reduce((acc, a) => acc + a.count, 0)} total
                            </span>
                        </div>
                        <div className="space-y-3">
                            {pendingActions.map((action, index) => (
                                <PendingAction key={index} {...action} />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="lg:col-span-1">
                    <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 h-full">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Recent Activity</h2>
                            <Link href="/admins/audit" className="text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300">
                                View all
                            </Link>
                        </div>
                        <RecentActivity activities={recentActivities} />
                    </div>
                </div>
            </div>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
                            <Mic className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-neutral-900 dark:text-white">1,234</p>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">Mock Sessions (30d)</p>
                        </div>
                    </div>
                    <Link href="/mocks" className="text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 flex items-center gap-1">
                        View sessions <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
                            <FolderKanban className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-neutral-900 dark:text-white">856</p>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">Projects Started (30d)</p>
                        </div>
                    </div>
                    <Link href="/projects" className="text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 flex items-center gap-1">
                        View projects <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center">
                            <Clock className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-neutral-900 dark:text-white">45.2h</p>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">Avg. Learning Time</p>
                        </div>
                    </div>
                    <Link href="/analytics" className="text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 flex items-center gap-1">
                        View analytics <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </div>
    )
}