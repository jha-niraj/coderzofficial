"use client"

import { useSession } from "@repo/auth/client"
import { motion } from "framer-motion"
import {
    Briefcase, Users, FileText, Plus, ArrowRight,
    TrendingUp, Clock, CheckCircle2, AlertCircle, Eye
} from "lucide-react"
import { Button } from "@repo/ui/components/ui/button"
import Link from "next/link"

interface StatCardProps {
    title: string
    value: string | number
    change?: string
    changeType?: "positive" | "negative" | "neutral"
    icon: React.ReactNode
    href: string
}

const StatCard = ({ title, value, change, changeType = "neutral", icon, href }: StatCardProps) => (
    <Link href={href}>
        <motion.div
            whileHover={{ y: -2 }}
            className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all cursor-pointer group"
        >
            <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-xl bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 group-hover:scale-105 transition-transform">
                    {icon}
                </div>
                <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors" />
            </div>
            <div className="space-y-1">
                <p className="text-3xl font-bold text-neutral-900 dark:text-white">{value}</p>
                <p className="text-sm text-neutral-500">{title}</p>
            </div>
            {change && (
                <div className={`mt-3 text-xs font-medium ${changeType === "positive" ? "text-green-600 dark:text-green-400" :
                    changeType === "negative" ? "text-red-600 dark:text-red-400" :
                        "text-neutral-500"
                    }`}>
                    {change}
                </div>
            )}
        </motion.div>
    </Link>
)

interface ActivityItemProps {
    type: "application" | "review" | "interview" | "offer"
    title: string
    subtitle: string
    time: string
}

const ActivityItem = ({ type, title, subtitle, time }: ActivityItemProps) => {
    const icons = {
        application: <FileText className="w-4 h-4" />,
        review: <Eye className="w-4 h-4" />,
        interview: <Users className="w-4 h-4" />,
        offer: <CheckCircle2 className="w-4 h-4" />,
    }

    const colors = {
        application: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
        review: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
        interview: "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400",
        offer: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
    }

    return (
        <div className="flex items-start gap-4 py-4 border-b border-neutral-100 dark:border-neutral-800 last:border-0">
            <div className={`p-2 rounded-lg ${colors[type]}`}>
                {icons[type]}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">{title}</p>
                <p className="text-xs text-neutral-500 mt-0.5">{subtitle}</p>
            </div>
            <span className="text-xs text-neutral-400 whitespace-nowrap">{time}</span>
        </div>
    )
}

export default function HomePage() {
    const { data: session } = useSession()
    const userName = session?.user?.name?.split(" ")[0] || "there"

    // Mock data - replace with real data later
    const stats = [
        { title: "Active Jobs", value: 0, change: "Start posting jobs", icon: <Briefcase className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />, href: "/jobs" },
        { title: "Total Candidates", value: 0, change: "No candidates yet", icon: <Users className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />, href: "/candidates" },
        { title: "Applications", value: 0, change: "Awaiting applications", icon: <FileText className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />, href: "/applications" },
        { title: "Interviews", value: 0, change: "Schedule interviews", icon: <Clock className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />, href: "/assessments" },
    ]

    const recentActivity: ActivityItemProps[] = []

    return (
        <div className="min-h-full p-6 lg:p-8">
            {/* Header */}
            <div className="mb-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
                >
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-bold text-neutral-900 dark:text-white">
                            Welcome back, {userName}! 👋
                        </h1>
                        <p className="text-neutral-500 mt-1">
                            Here&apos;s what&apos;s happening with your hiring pipeline today.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link href="/jobs/new">
                            <Button className="rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:text-black dark:hover:bg-neutral-200">
                                <Plus className="w-4 h-4 mr-2" />
                                Post New Job
                            </Button>
                        </Link>
                    </div>
                </motion.div>
            </div>

            {/* Stats Grid */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
            >
                {stats.map((stat, index) => (
                    <StatCard key={index} {...stat} />
                ))}
            </motion.div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Activity */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="lg:col-span-2 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Recent Activity</h2>
                        <Link href="/applications">
                            <Button variant="ghost" size="sm" className="text-xs">
                                View All <ArrowRight className="w-3 h-3 ml-1" />
                            </Button>
                        </Link>
                    </div>

                    {recentActivity.length > 0 ? (
                        <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                            {recentActivity.map((activity, index) => (
                                <ActivityItem key={index} {...activity} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 rounded-2xl bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center mx-auto mb-4">
                                <AlertCircle className="w-8 h-8 text-neutral-400" />
                            </div>
                            <h3 className="font-semibold text-neutral-900 dark:text-white mb-2">No activity yet</h3>
                            <p className="text-sm text-neutral-500 mb-4 max-w-sm mx-auto">
                                Post your first job to start receiving applications and track activity here.
                            </p>
                            <Link href="/jobs/new">
                                <Button variant="outline" size="sm" className="rounded-xl">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Post Your First Job
                                </Button>
                            </Link>
                        </div>
                    )}
                </motion.div>

                {/* Quick Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-4"
                >
                    {/* Getting Started Card */}
                    <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 dark:from-white dark:to-neutral-100 rounded-2xl p-6 text-white dark:text-black">
                        <h3 className="font-bold text-lg mb-2">Getting Started</h3>
                        <p className="text-neutral-300 dark:text-neutral-600 text-sm mb-4">
                            Complete these steps to set up your hiring pipeline.
                        </p>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 text-sm">
                                <CheckCircle2 className="w-4 h-4 text-green-400 dark:text-green-600" />
                                <span>Create your company profile</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-neutral-400 dark:text-neutral-500">
                                <div className="w-4 h-4 rounded-full border-2 border-neutral-600 dark:border-neutral-400" />
                                <span>Post your first job listing</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-neutral-400 dark:text-neutral-500">
                                <div className="w-4 h-4 rounded-full border-2 border-neutral-600 dark:border-neutral-400" />
                                <span>Invite team members</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-neutral-400 dark:text-neutral-500">
                                <div className="w-4 h-4 rounded-full border-2 border-neutral-600 dark:border-neutral-400" />
                                <span>Set up assessments</span>
                            </div>
                        </div>
                    </div>

                    {/* Analytics Preview */}
                    <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-lg bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800">
                                <TrendingUp className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
                            </div>
                            <h3 className="font-bold text-neutral-900 dark:text-white">Pipeline Health</h3>
                        </div>
                        <p className="text-sm text-neutral-500 mb-4">
                            Track your hiring funnel performance and conversion rates.
                        </p>
                        <Link href="/analytics">
                            <Button variant="outline" size="sm" className="w-full rounded-xl">
                                View Analytics
                            </Button>
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
