"use client"

import { motion } from "framer-motion"
import { BarChart3, Users, Briefcase, Clock, Target } from "lucide-react"

export default function AnalyticsPage() {
    const stats = [
        { label: "Total Views", value: "0", change: "+0%", icon: <Target className="w-5 h-5" /> },
        { label: "Applications", value: "0", change: "+0%", icon: <Users className="w-5 h-5" /> },
        { label: "Active Jobs", value: "0", change: "+0%", icon: <Briefcase className="w-5 h-5" /> },
        { label: "Avg. Time to Hire", value: "0d", change: "+0%", icon: <Clock className="w-5 h-5" /> },
    ]

    return (
        <div className="min-h-full p-6 lg:p-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl lg:text-3xl font-bold text-neutral-900 dark:text-white">
                    Analytics
                </h1>
                <p className="text-neutral-500 mt-1">
                    Track your hiring pipeline performance
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
                            <div className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400">
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

            {/* Charts Placeholder */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-8"
            >
                <div className="text-center py-16">
                    <div className="w-20 h-20 rounded-2xl bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center mx-auto mb-6">
                        <BarChart3 className="w-10 h-10 text-neutral-400" />
                    </div>
                    <h3 className="font-bold text-xl text-neutral-900 dark:text-white mb-2">
                        No data to display
                    </h3>
                    <p className="text-neutral-500 max-w-md mx-auto">
                        Analytics will appear here once you start receiving applications and engaging with candidates.
                    </p>
                </div>
            </motion.div>
        </div>
    )
}
