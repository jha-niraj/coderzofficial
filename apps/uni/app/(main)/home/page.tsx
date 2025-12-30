"use client"

import { useSession } from "@repo/auth/client"
import { motion } from "framer-motion"
import {
    Users, BookOpen, School, Plus, ArrowRight,
    TrendingUp, GraduationCap, CheckCircle2, AlertCircle, Briefcase, Award
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
            className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 hover:border-violet-300 dark:hover:border-violet-700 transition-all cursor-pointer group"
        >
            <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-xl bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 group-hover:scale-105 transition-transform">
                    {icon}
                </div>
                <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors" />
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
    type: "verification" | "assignment" | "submission" | "placement"
    title: string
    subtitle: string
    time: string
}

const ActivityItem = ({ type, title, subtitle, time }: ActivityItemProps) => {
    const icons = {
        verification: <Users className="w-4 h-4" />,
        assignment: <BookOpen className="w-4 h-4" />,
        submission: <CheckCircle2 className="w-4 h-4" />,
        placement: <Award className="w-4 h-4" />,
    }

    const colors = {
        verification: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
        assignment: "bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400",
        submission: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400",
        placement: "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400",
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

export default function UniversityDashboard() {
    const { data: session } = useSession()
    const userName = session?.user?.name?.split(" ")[0] || "there"

    // Mock data - replace with real data later
    const stats = [
        { title: "Active Students", value: 0, change: "Verify students to begin", icon: <Users className="w-5 h-5 text-violet-600" />, href: "/students" },
        { title: "Total Faculty", value: 0, change: "Invite faculty members", icon: <GraduationCap className="w-5 h-5 text-violet-600" />, href: "/faculty" },
        { title: "Active Classes", value: 0, change: "Create your first class", icon: <School className="w-5 h-5 text-violet-600" />, href: "/classes" },
        { title: "Assignments", value: 0, change: "Create assignments", icon: <BookOpen className="w-5 h-5 text-violet-600" />, href: "/assignments" },
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
                            Here&apos;s an overview of your university&apos;s progress on the platform.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link href="/faculty/invite">
                            <Button variant="outline" className="rounded-xl">
                                <Plus className="w-4 h-4 mr-2" />
                                Invite Faculty
                            </Button>
                        </Link>
                        <Link href="/assignments/new">
                            <Button className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white">
                                <Plus className="w-4 h-4 mr-2" />
                                Create Assignment
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
                        <Link href="/analytics">
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
                            <div className="w-16 h-16 rounded-2xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mx-auto mb-4">
                                <AlertCircle className="w-8 h-8 text-violet-500" />
                            </div>
                            <h3 className="font-semibold text-neutral-900 dark:text-white mb-2">No activity yet</h3>
                            <p className="text-sm text-neutral-500 mb-4 max-w-sm mx-auto">
                                Start by verifying students or creating your first assignment to see activity here.
                            </p>
                            <Link href="/classes/new">
                                <Button variant="outline" size="sm" className="rounded-xl">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Create Your First Class
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
                    <div className="bg-gradient-to-br from-violet-600 to-indigo-700 rounded-2xl p-6 text-white">
                        <h3 className="font-bold text-lg mb-2">Getting Started</h3>
                        <p className="text-violet-200 text-sm mb-4">
                            Complete these steps to set up your university.
                        </p>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 text-sm">
                                <CheckCircle2 className="w-4 h-4 text-green-300" />
                                <span>Complete university profile</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-violet-200">
                                <div className="w-4 h-4 rounded-full border-2 border-violet-300" />
                                <span>Invite faculty members</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-violet-200">
                                <div className="w-4 h-4 rounded-full border-2 border-violet-300" />
                                <span>Create departments & classes</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-violet-200">
                                <div className="w-4 h-4 rounded-full border-2 border-violet-300" />
                                <span>Set up student verification</span>
                            </div>
                        </div>
                    </div>

                    {/* Placements Preview */}
                    <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-lg bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800">
                                <Briefcase className="w-4 h-4 text-violet-600" />
                            </div>
                            <h3 className="font-bold text-neutral-900 dark:text-white">Placements</h3>
                        </div>
                        <p className="text-sm text-neutral-500 mb-4">
                            Refer companies and post exclusive jobs for your students.
                        </p>
                        <Link href="/placements">
                            <Button variant="outline" size="sm" className="w-full rounded-xl">
                                View Placements
                            </Button>
                        </Link>
                    </div>

                    {/* Analytics Preview */}
                    <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-lg bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800">
                                <TrendingUp className="w-4 h-4 text-violet-600" />
                            </div>
                            <h3 className="font-bold text-neutral-900 dark:text-white">Analytics</h3>
                        </div>
                        <p className="text-sm text-neutral-500 mb-4">
                            Track student progress, completion rates, and more.
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
