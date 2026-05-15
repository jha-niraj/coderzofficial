"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Coins, TrendingUp, Gift, Clock, CheckCircle2, Sparkles } from "lucide-react"
import { getStudentUniversityDashboard } from "@/actions/university/university.action"

interface CreditsData {
    allocated: number
    used: number
    remaining: number
}

export default function UniCreditsPage() {
    const [credits, setCredits] = useState<CreditsData | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchCredits = async () => {
            try {
                const response = await getStudentUniversityDashboard()
                if (response.success && response.data) {
                    setCredits(response.data.credits)
                }
            } catch (error) {
                console.error("Error fetching credits:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchCredits()
    }, [])

    const usedPercentage = credits ? (credits.used / credits.allocated) * 100 : 0

    if (loading) {
        return (
            <div className="min-h-full p-6 lg:p-8">
                <div className="animate-pulse space-y-6">
                    <div className="h-8 bg-neutral-200 dark:bg-neutral-800 rounded-lg w-64" />
                    <div className="h-40 bg-neutral-200 dark:bg-neutral-800 rounded-2xl" />
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-full p-6 lg:p-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <div className="flex items-center gap-2 mb-2">
                    <Coins className="w-5 h-5 text-violet-500" />
                    <span className="text-xs font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider">
                        Credits
                    </span>
                </div>
                <h1 className="text-2xl lg:text-3xl font-bold text-neutral-900 dark:text-white">
                    University Credits
                </h1>
                <p className="text-neutral-500 mt-1">
                    Manage and track your allocated credits
                </p>
            </motion.div>

            {/* Main Credits Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-br from-violet-600 to-indigo-700 rounded-2xl p-8 mb-8 text-white"
            >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    <div>
                        <p className="text-violet-200 text-sm mb-1">Available Credits</p>
                        <h2 className="text-5xl lg:text-6xl font-bold flex items-center gap-3">
                            <Coins className="w-12 h-12" />
                            {credits?.remaining ?? 0}
                        </h2>
                        <p className="text-violet-200 mt-3">
                            {credits?.used ?? 0} of {credits?.allocated ?? 0} credits used
                        </p>
                    </div>

                    {/* Progress Ring */}
                    <div className="relative w-32 h-32">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle
                                cx="64"
                                cy="64"
                                r="56"
                                stroke="rgba(255,255,255,0.2)"
                                strokeWidth="12"
                                fill="none"
                            />
                            <circle
                                cx="64"
                                cy="64"
                                r="56"
                                stroke="white"
                                strokeWidth="12"
                                fill="none"
                                strokeLinecap="round"
                                strokeDasharray={`${usedPercentage * 3.52} 352`}
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                                <p className="text-2xl font-bold">{Math.round(usedPercentage)}%</p>
                                <p className="text-xs text-violet-200">used</p>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Stats Grid */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8"
            >
                <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 rounded-xl bg-violet-100 dark:bg-violet-900/30">
                            <Gift className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                                {credits?.allocated ?? 0}
                            </p>
                            <p className="text-xs text-neutral-500">Total Allocated</p>
                        </div>
                    </div>
                    <p className="text-xs text-neutral-500">
                        Credits allocated by your university
                    </p>
                </div>

                <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 rounded-xl bg-green-100 dark:bg-green-900/30">
                            <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                                {credits?.used ?? 0}
                            </p>
                            <p className="text-xs text-neutral-500">Credits Used</p>
                        </div>
                    </div>
                    <p className="text-xs text-neutral-500">
                        Used for assignments and projects
                    </p>
                </div>

                <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 rounded-xl bg-amber-100 dark:bg-amber-900/30">
                            <Sparkles className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                                {credits?.remaining ?? 0}
                            </p>
                            <p className="text-xs text-neutral-500">Available</p>
                        </div>
                    </div>
                    <p className="text-xs text-neutral-500">
                        Ready to use for AI features
                    </p>
                </div>
            </motion.div>

            {/* What are credits */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6"
            >
                <h2 className="text-lg font-bold text-neutral-900 dark:text-white mb-4">
                    What are University Credits?
                </h2>
                <div className="space-y-4">
                    <div className="flex items-start gap-4">
                        <div className="p-2 rounded-lg bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800">
                            <Coins className="w-4 h-4 text-violet-600" />
                        </div>
                        <div>
                            <h3 className="font-medium text-neutral-900 dark:text-white">Allocated by University</h3>
                            <p className="text-sm text-neutral-500">
                                Credits are allocated by your university to help you complete assignments and access AI-powered features.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <div className="p-2 rounded-lg bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800">
                            <TrendingUp className="w-4 h-4 text-violet-600" />
                        </div>
                        <div>
                            <h3 className="font-medium text-neutral-900 dark:text-white">Used for AI Features</h3>
                            <p className="text-sm text-neutral-500">
                                Use credits to run code, get AI assistance, compile projects, and complete assignments.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <div className="p-2 rounded-lg bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800">
                            <Clock className="w-4 h-4 text-violet-600" />
                        </div>
                        <div>
                            <h3 className="font-medium text-neutral-900 dark:text-white">Monthly Refresh</h3>
                            <p className="text-sm text-neutral-500">
                                Your credits may refresh periodically based on your university&apos;s policy.
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
