"use client"

import { motion } from "framer-motion"
import { Award, TrendingUp, BookOpen, School, ArrowRight } from "lucide-react"
import { Button } from "@repo/ui/components/ui/button"
import Link from "next/link"

export default function UniGradesPage() {
    return (
        <div className="min-h-full p-6 lg:p-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <div className="flex items-center gap-2 mb-2">
                    <Award className="w-5 h-5 text-violet-500" />
                    <span className="text-xs font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider">
                        Grades
                    </span>
                </div>
                <h1 className="text-2xl lg:text-3xl font-bold text-neutral-900 dark:text-white">
                    My Grades
                </h1>
                <p className="text-neutral-500 mt-1">
                    View your academic performance across all classes
                </p>
            </motion.div>

            {/* Coming Soon */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex items-center justify-center py-20"
            >
                <div className="text-center max-w-md">
                    <div className="w-20 h-20 rounded-2xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mx-auto mb-6">
                        <Award className="w-10 h-10 text-violet-500" />
                    </div>
                    <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
                        Grades Coming Soon
                    </h2>
                    <p className="text-neutral-500 mb-6">
                        Your grades will appear here once your university admin enables the grading system.
                    </p>
                    <Link href="/uni/classes">
                        <Button className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white">
                            <School className="w-4 h-4 mr-2" />
                            View My Classes
                        </Button>
                    </Link>
                </div>
            </motion.div>

            {/* Quick Stats Preview */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8"
            >
                <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 rounded-lg bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800">
                            <TrendingUp className="w-4 h-4 text-violet-600" />
                        </div>
                        <span className="text-sm font-medium text-neutral-500">GPA</span>
                    </div>
                    <p className="text-3xl font-bold text-neutral-900 dark:text-white">--</p>
                    <p className="text-xs text-neutral-500 mt-1">Not available yet</p>
                </div>

                <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 rounded-lg bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800">
                            <BookOpen className="w-4 h-4 text-violet-600" />
                        </div>
                        <span className="text-sm font-medium text-neutral-500">Completed</span>
                    </div>
                    <p className="text-3xl font-bold text-neutral-900 dark:text-white">0</p>
                    <p className="text-xs text-neutral-500 mt-1">Graded assignments</p>
                </div>

                <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 rounded-lg bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800">
                            <School className="w-4 h-4 text-violet-600" />
                        </div>
                        <span className="text-sm font-medium text-neutral-500">Credits</span>
                    </div>
                    <p className="text-3xl font-bold text-neutral-900 dark:text-white">0</p>
                    <p className="text-xs text-neutral-500 mt-1">Earned this semester</p>
                </div>
            </motion.div>
        </div>
    )
}
