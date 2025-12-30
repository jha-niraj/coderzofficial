"use client"

import { motion } from "framer-motion"
import { Users, Plus, Search, Filter, MoreVertical, CheckCircle2, Clock, XCircle } from "lucide-react"
import { Button } from "@repo/ui/components/ui/button"
import { Input } from "@repo/ui/components/ui/input"

export default function StudentsPage() {
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
                        Students
                    </h1>
                    <p className="text-neutral-500 mt-1">
                        Manage verified students and track their progress.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="rounded-xl">
                        <Filter className="w-4 h-4 mr-2" />
                        Filter
                    </Button>
                    <Button className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white">
                        <Plus className="w-4 h-4 mr-2" />
                        Bulk Import
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
                        placeholder="Search students by name, email, or roll number..."
                        className="pl-10 rounded-xl"
                    />
                </div>
            </motion.div>

            {/* Stats */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8"
            >
                <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-4">
                    <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        <div>
                            <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">0</p>
                            <p className="text-sm text-emerald-600/80">Verified Students</p>
                        </div>
                    </div>
                </div>
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4">
                    <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-amber-600" />
                        <div>
                            <p className="text-2xl font-bold text-amber-700 dark:text-amber-400">0</p>
                            <p className="text-sm text-amber-600/80">Pending Verification</p>
                        </div>
                    </div>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4">
                    <div className="flex items-center gap-3">
                        <XCircle className="w-5 h-5 text-red-600" />
                        <div>
                            <p className="text-2xl font-bold text-red-700 dark:text-red-400">0</p>
                            <p className="text-sm text-red-600/80">Rejected</p>
                        </div>
                    </div>
                </div>
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
                        <Users className="w-8 h-8 text-violet-600" />
                    </div>
                    <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
                        No students yet
                    </h3>
                    <p className="text-neutral-500 mb-6">
                        Students will appear here once they verify their university email. You can also bulk import student data.
                    </p>
                    <div className="flex justify-center gap-3">
                        <Button variant="outline" className="rounded-xl">
                            <MoreVertical className="w-4 h-4 mr-2" />
                            View Pending
                        </Button>
                        <Button className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white">
                            <Plus className="w-4 h-4 mr-2" />
                            Bulk Import Students
                        </Button>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
