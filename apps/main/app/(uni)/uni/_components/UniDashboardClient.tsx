"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import {
    GraduationCap, BookOpen, School, Clock, Award, ArrowRight,
    Coins, Calendar, TrendingUp, CheckCircle2
} from "lucide-react"
import { Button } from "@repo/ui/components/ui/button"
import Link from "next/link"
import {
    getStudentUniversityDashboard
} from "@/actions/university/university.action"

interface DashboardData {
    university: {
        id: string
        name: string
        logoUrl: string | null
    }
    credits: {
        allocated: number
        used: number
        remaining: number
    }
    classes: {
        id: string
        name: string
        code: string
        semester: number | null
    }[]
    pendingAssignments: {
        id: string
        title: string
        type: string
        deadline: Date
        creditsRequired: number
    }[]
    stats: {
        totalClasses: number
        pendingAssignments: number
    }
}

export default function UniDashboardPage() {
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const response = await getStudentUniversityDashboard()
                if (response.success && response.data) {
                    setDashboardData(response.data as DashboardData)
                }
            } catch (error) {
                console.error("Error fetching dashboard:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchDashboard()
    }, [])

    if (loading) {
        return (
            <div className="min-h-full p-6 lg:p-8">
                <div className="animate-pulse space-y-6">
                    <div className="h-8 bg-neutral-200 dark:bg-neutral-800 rounded-lg w-64" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {
                            [1, 2, 3, 4].map(i => (
                                <div key={i} className="h-32 bg-neutral-200 dark:bg-neutral-800 rounded-2xl" />
                            ))
                        }
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-full p-6 lg:p-8">
            <div className="mb-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
                >
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <GraduationCap className="w-5 h-5 text-violet-500" />
                            <span className="text-xs font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider">
                                {dashboardData?.university.name || "University Portal"}
                            </span>
                        </div>
                        <h1 className="text-2xl lg:text-3xl font-bold text-neutral-900 dark:text-white">
                            Welcome to your University Dashboard 👋
                        </h1>
                        <p className="text-neutral-500 mt-1">
                            View your classes, assignments, and credits.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link href="/uni/assignments">
                            <Button variant="outline" className="rounded-xl">
                                <BookOpen className="w-4 h-4 mr-2" />
                                View Assignments
                            </Button>
                        </Link>
                        <Link href="/uni/classes">
                            <Button className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white">
                                <School className="w-4 h-4 mr-2" />
                                My Classes
                            </Button>
                        </Link>
                    </div>
                </motion.div>
            </div>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-br from-violet-600 to-indigo-700 rounded-2xl p-6 mb-8 text-white"
            >
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-violet-200 text-sm mb-1">University Credits</p>
                        <h2 className="text-4xl font-bold flex items-center gap-2">
                            <Coins className="w-8 h-8" />
                            {dashboardData?.credits.remaining ?? 0}
                            <span className="text-lg font-normal text-violet-200">remaining</span>
                        </h2>
                        <p className="text-violet-200 text-sm mt-2">
                            {dashboardData?.credits.used ?? 0} / {dashboardData?.credits.allocated ?? 0} credits used
                        </p>
                    </div>
                    <Link href="/uni/credits">
                        <Button className="rounded-xl bg-white text-violet-700 hover:bg-violet-50">
                            View Details
                        </Button>
                    </Link>
                </div>
            </motion.div>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
            >
                <Link href="/uni/classes">
                    <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 hover:border-violet-300 dark:hover:border-violet-700 transition-all cursor-pointer group">
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-3 rounded-xl bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 group-hover:scale-105 transition-transform">
                                <School className="w-5 h-5 text-violet-600" />
                            </div>
                            <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-violet-600 transition-colors" />
                        </div>
                        <p className="text-3xl font-bold text-neutral-900 dark:text-white">
                            {dashboardData?.stats.totalClasses ?? 0}
                        </p>
                        <p className="text-sm text-neutral-500">Enrolled Classes</p>
                    </div>
                </Link>
                <Link href="/uni/assignments">
                    <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 hover:border-violet-300 dark:hover:border-violet-700 transition-all cursor-pointer group">
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-3 rounded-xl bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 group-hover:scale-105 transition-transform">
                                <BookOpen className="w-5 h-5 text-violet-600" />
                            </div>
                            <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-violet-600 transition-colors" />
                        </div>
                        <p className="text-3xl font-bold text-neutral-900 dark:text-white">
                            {dashboardData?.stats.pendingAssignments ?? 0}
                        </p>
                        <p className="text-sm text-neutral-500">Pending Assignments</p>
                    </div>
                </Link>
                <Link href="/uni/grades">
                    <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 hover:border-violet-300 dark:hover:border-violet-700 transition-all cursor-pointer group">
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-3 rounded-xl bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 group-hover:scale-105 transition-transform">
                                <Award className="w-5 h-5 text-violet-600" />
                            </div>
                            <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-violet-600 transition-colors" />
                        </div>
                        <p className="text-3xl font-bold text-neutral-900 dark:text-white">-</p>
                        <p className="text-sm text-neutral-500">View Grades</p>
                    </div>
                </Link>
                <Link href="/uni/leaderboard">
                    <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 hover:border-violet-300 dark:hover:border-violet-700 transition-all cursor-pointer group">
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-3 rounded-xl bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 group-hover:scale-105 transition-transform">
                                <TrendingUp className="w-5 h-5 text-violet-600" />
                            </div>
                            <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-violet-600 transition-colors" />
                        </div>
                        <p className="text-3xl font-bold text-neutral-900 dark:text-white">-</p>
                        <p className="text-sm text-neutral-500">Leaderboard Rank</p>
                    </div>
                </Link>
            </motion.div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="lg:col-span-2 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Upcoming Assignments</h2>
                        <Link href="/uni/assignments">
                            <Button variant="ghost" size="sm" className="text-xs">
                                View All <ArrowRight className="w-3 h-3 ml-1" />
                            </Button>
                        </Link>
                    </div>

                    {
                        dashboardData?.pendingAssignments && dashboardData.pendingAssignments.length > 0 ? (
                            <div className="space-y-4">
                                {
                                    dashboardData.pendingAssignments.map((assignment) => (
                                        <div
                                            key={assignment.id}
                                            className="flex items-start gap-4 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-violet-300 dark:hover:border-violet-700 transition-all"
                                        >
                                            <div className="p-2 rounded-lg bg-violet-100 dark:bg-violet-900/30">
                                                <BookOpen className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-neutral-900 dark:text-white truncate">
                                                    {assignment.title}
                                                </p>
                                                <div className="flex items-center gap-4 mt-1 text-xs text-neutral-500">
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        {new Date(assignment.deadline).toLocaleDateString()}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Coins className="w-3 h-3" />
                                                        {assignment.creditsRequired} credits
                                                    </span>
                                                </div>
                                            </div>
                                            <span className="text-[10px] px-2 py-1 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 font-medium uppercase">
                                                {assignment.type}
                                            </span>
                                        </div>
                                    ))
                                }
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 rounded-2xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle2 className="w-8 h-8 text-violet-500" />
                                </div>
                                <h3 className="font-semibold text-neutral-900 dark:text-white mb-2">All caught up!</h3>
                                <p className="text-sm text-neutral-500">
                                    No pending assignments at the moment.
                                </p>
                            </div>
                        )
                    }
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="space-y-4"
                >
                    <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-lg bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800">
                                <School className="w-4 h-4 text-violet-600" />
                            </div>
                            <h3 className="font-bold text-neutral-900 dark:text-white">My Classes</h3>
                        </div>

                        {
                            dashboardData?.classes && dashboardData.classes.length > 0 ? (
                                <div className="space-y-2">
                                    {
                                        dashboardData.classes.slice(0, 3).map((cls) => (
                                            <div
                                                key={cls.id}
                                                className="p-3 rounded-xl bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800"
                                            >
                                                <p className="font-medium text-sm text-neutral-900 dark:text-white truncate">
                                                    {cls.name}
                                                </p>
                                                <p className="text-xs text-neutral-500">{cls.code}</p>
                                            </div>
                                        ))
                                    }
                                </div>
                            ) : (
                                <p className="text-sm text-neutral-500">No classes enrolled yet.</p>
                            )
                        }

                        <Link href="/uni/classes" className="block mt-4">
                            <Button variant="outline" size="sm" className="w-full rounded-xl">
                                View All Classes
                            </Button>
                        </Link>
                    </div>
                    <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-lg bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800">
                                <Calendar className="w-4 h-4 text-violet-600" />
                            </div>
                            <h3 className="font-bold text-neutral-900 dark:text-white">University Jobs</h3>
                        </div>
                        <p className="text-sm text-neutral-500 mb-4">
                            Exclusive job opportunities for your university.
                        </p>
                        <Link href="/uni/jobs">
                            <Button variant="outline" size="sm" className="w-full rounded-xl">
                                View Jobs
                            </Button>
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}