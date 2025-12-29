"use client"

import { motion } from "framer-motion"
import { Plus, Search, Filter, ClipboardList, Code, Brain, FileText } from "lucide-react"
import { Button } from "@repo/ui/components/ui/button"
import { Input } from "@repo/ui/components/ui/input"

export default function AssessmentsPage() {
    const assessments: Array<{
        id: string
        title: string
        type: "coding" | "quiz" | "project" | "interview"
        questions: number
        duration: string
        candidates: number
    }> = []

    return (
        <div className="min-h-full p-6 lg:p-8">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-neutral-900 dark:text-white">
                        Assessments
                    </h1>
                    <p className="text-neutral-500 mt-1">
                        Create and manage technical assessments
                    </p>
                </div>
                <Button className="rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:text-black dark:hover:bg-neutral-200">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Assessment
                </Button>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {[
                    { icon: <Code className="w-6 h-6" />, title: "Coding Challenge", desc: "Test coding skills" },
                    { icon: <Brain className="w-6 h-6" />, title: "Technical Quiz", desc: "Multiple choice questions" },
                    { icon: <FileText className="w-6 h-6" />, title: "Take-Home Project", desc: "Real-world assignments" },
                ].map((item, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all cursor-pointer"
                    >
                        <div className="w-12 h-12 rounded-xl bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 flex items-center justify-center mb-4 text-neutral-600 dark:text-neutral-400">
                            {item.icon}
                        </div>
                        <h3 className="font-bold text-neutral-900 dark:text-white mb-1">{item.title}</h3>
                        <p className="text-sm text-neutral-500">{item.desc}</p>
                    </motion.div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <Input
                        placeholder="Search assessments..."
                        className="pl-10 rounded-xl bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800"
                    />
                </div>
                <Button variant="outline" className="rounded-xl">
                    <Filter className="w-4 h-4 mr-2" />
                    Filters
                </Button>
            </div>

            {assessments.length > 0 ? (
                <div className="space-y-4">
                    {/* Assessments list */}
                </div>
            ) : (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-16"
                >
                    <div className="w-20 h-20 rounded-2xl bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center mx-auto mb-6">
                        <ClipboardList className="w-10 h-10 text-neutral-400" />
                    </div>
                    <h3 className="font-bold text-xl text-neutral-900 dark:text-white mb-2">
                        No assessments created
                    </h3>
                    <p className="text-neutral-500 mb-6 max-w-md mx-auto">
                        Create assessments to evaluate candidates&apos; technical skills and knowledge.
                    </p>
                </motion.div>
            )}
        </div>
    )
}
