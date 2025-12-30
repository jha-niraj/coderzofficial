"use client"

import { motion } from "framer-motion"
import { FolderKanban, Plus, Search } from "lucide-react"
import { Button } from "@repo/ui/components/ui/button"
import { Input } from "@repo/ui/components/ui/input"

export default function DepartmentsPage() {
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
                        Departments
                    </h1>
                    <p className="text-neutral-500 mt-1">
                        Organize your university by departments and assign department heads.
                    </p>
                </div>
                <Button className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Department
                </Button>
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
                        placeholder="Search departments..."
                        className="pl-10 rounded-xl"
                    />
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
                        <FolderKanban className="w-8 h-8 text-violet-600" />
                    </div>
                    <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
                        No departments yet
                    </h3>
                    <p className="text-neutral-500 mb-6">
                        Add departments like Computer Science, Electronics, etc. to organize faculty and students.
                    </p>
                    <Button className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Your First Department
                    </Button>
                </div>
            </motion.div>
        </div>
    )
}
