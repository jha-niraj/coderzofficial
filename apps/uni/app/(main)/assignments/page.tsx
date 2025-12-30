"use client"

import { motion } from "framer-motion"
import { BookOpen, Plus, Search, Filter } from "lucide-react"
import { Button } from "@repo/ui/components/ui/button"
import { Input } from "@repo/ui/components/ui/input"

export default function AssignmentsPage() {
    return (
        <div className="min-h-full p-6 lg:p-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8"
            >
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-neutral-900 dark:text-white">
                        Assignments
                    </h1>
                    <p className="text-neutral-500 mt-1">
                        Create quizzes, coding challenges, projects, and mock interviews.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="rounded-xl">
                        <Filter className="w-4 h-4 mr-2" />
                        Filter
                    </Button>
                    <Button className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Assignment
                    </Button>
                </div>
            </motion.div>

            {/* Search */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-6"
            >
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <Input
                        placeholder="Search assignments..."
                        className="pl-10 rounded-xl"
                    />
                </div>
            </motion.div>

            {/* Assignment Type Tabs */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="flex flex-wrap gap-2 mb-6"
            >
                {["All", "Quiz", "Coding", "Project", "Mock Interview", "Space Topic"].map((type, idx) => (
                    <button
                        key={type}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer ${idx === 0
                                ? "bg-violet-600 text-white"
                                : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                            }`}
                    >
                        {type}
                    </button>
                ))}
            </motion.div>

            {/* Empty State */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-12"
            >
                <div className="text-center max-w-md mx-auto">
                    <div className="w-16 h-16 rounded-2xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mx-auto mb-4">
                        <BookOpen className="w-8 h-8 text-violet-600" />
                    </div>
                    <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
                        No assignments yet
                    </h3>
                    <p className="text-neutral-500 mb-6">
                        Create assignments using our quiz, coding, project, or mock interview engines. Auto-grading saves hours of manual work.
                    </p>
                    <Button className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Your First Assignment
                    </Button>
                </div>
            </motion.div>
        </div>
    )
}
