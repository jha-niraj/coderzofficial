"use client"

import { motion } from "framer-motion"
import { BarChart3, Users, BookOpen, GraduationCap, Award, TrendingUp, Clock } from "lucide-react"

export default function AnalyticsPage() {
    const stats = [
        { label: "Active Students", value: "0", change: "+0%", icon: <Users className="w-5 h-5 text-violet-600" /> },
        { label: "Assignments", value: "0", change: "+0%", icon: <BookOpen className="w-5 h-5 text-violet-600" /> },
        { label: "Completion Rate", value: "0%", change: "+0%", icon: <TrendingUp className="w-5 h-5 text-violet-600" /> },
        { label: "Placements", value: "0", change: "+0%", icon: <Award className="w-5 h-5 text-violet-600" /> },
    ]

    return (
        <div className="min-h-full p-6 lg:p-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl lg:text-3xl font-bold text-neutral-900 dark:text-white">
                    Analytics
                </h1>
                <p className="text-neutral-500 mt-1">
                    Track student performance and university engagement
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {stats.map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-lg bg-violet-50 dark:bg-violet-900/30">
                                {stat.icon}
                            </div>
                            <span className="text-sm text-neutral-500">{stat.label}</span>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-neutral-900 dark:text-white">{stat.value}</span>
                            <span className="text-sm text-green-600 dark:text-green-400">{stat.change}</span>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6"
                >
                    <h3 className="font-bold text-lg text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
                        <GraduationCap className="w-5 h-5 text-violet-600" />
                        Student Engagement
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-neutral-600 dark:text-neutral-400">Verified Students</span>
                            <span className="font-bold text-neutral-900 dark:text-white">0</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-neutral-600 dark:text-neutral-400">Active This Week</span>
                            <span className="font-bold text-neutral-900 dark:text-white">0</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-neutral-600 dark:text-neutral-400">Total Submissions</span>
                            <span className="font-bold text-neutral-900 dark:text-white">0</span>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6"
                >
                    <h3 className="font-bold text-lg text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-violet-600" />
                        Credit Usage
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-neutral-600 dark:text-neutral-400">Total Credits</span>
                            <span className="font-bold text-neutral-900 dark:text-white">0</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-neutral-600 dark:text-neutral-400">Used This Month</span>
                            <span className="font-bold text-neutral-900 dark:text-white">0</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-neutral-600 dark:text-neutral-400">Remaining</span>
                            <span className="font-bold text-emerald-600">0</span>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Charts Placeholder */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-8"
            >
                <div className="text-center py-16">
                    <div className="w-20 h-20 rounded-2xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mx-auto mb-6">
                        <BarChart3 className="w-10 h-10 text-violet-600" />
                    </div>
                    <h3 className="font-bold text-xl text-neutral-900 dark:text-white mb-2">
                        No data to display
                    </h3>
                    <p className="text-neutral-500 max-w-md mx-auto">
                        Analytics will appear here once students start completing assignments and engaging with the platform.
                    </p>
                </div>
            </motion.div>
        </div>
    )
}
