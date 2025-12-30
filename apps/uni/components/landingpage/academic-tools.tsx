"use client"

import { motion } from "framer-motion"
import {
    FileQuestion, Code2, Presentation, Lightbulb,
    CheckCircle2, Clock, BarChart3, Zap
} from "lucide-react"

export default function AcademicTools() {
    return (
        <div className="py-24 bg-neutral-50 dark:bg-neutral-900">
            <div className="max-w-6xl mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <span className="px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 text-[10px] font-mono uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                        Academic Tools
                    </span>
                    <h2 className="mt-6 text-4xl md:text-5xl font-bold tracking-tight text-neutral-900 dark:text-white">
                        Assignment Types That Work
                    </h2>
                    <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
                        Create diverse assignments using our powerful engines. Auto-grading saves you hours.
                    </p>
                </motion.div>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Quiz Card */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="group p-8 rounded-3xl bg-white dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all"
                    >
                        <div className="flex items-start gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shrink-0">
                                <FileQuestion className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
                                    Quiz Assessments
                                </h3>
                                <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                                    MCQs, short answers, and conceptual questions. Auto-graded instantly with detailed analytics.
                                </p>
                                <div className="flex flex-wrap gap-3">
                                    <span className="flex items-center gap-1.5 text-xs bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-2.5 py-1 rounded-full">
                                        <CheckCircle2 className="w-3 h-3" /> Auto-Grading
                                    </span>
                                    <span className="flex items-center gap-1.5 text-xs bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-2.5 py-1 rounded-full">
                                        <Clock className="w-3 h-3" /> Timed Tests
                                    </span>
                                    <span className="flex items-center gap-1.5 text-xs bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-2.5 py-1 rounded-full">
                                        <BarChart3 className="w-3 h-3" /> Analytics
                                    </span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Coding Card */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="group p-8 rounded-3xl bg-white dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 hover:border-blue-300 dark:hover:border-blue-700 transition-all"
                    >
                        <div className="flex items-start gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shrink-0">
                                <Code2 className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
                                    Coding Challenges
                                </h3>
                                <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                                    Real coding problems with test cases. Support for multiple languages, instant feedback.
                                </p>
                                <div className="flex flex-wrap gap-3">
                                    <span className="flex items-center gap-1.5 text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2.5 py-1 rounded-full">
                                        <Zap className="w-3 h-3" /> Live Execution
                                    </span>
                                    <span className="flex items-center gap-1.5 text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2.5 py-1 rounded-full">
                                        <CheckCircle2 className="w-3 h-3" /> Test Cases
                                    </span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Mock Interview Card */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="group p-8 rounded-3xl bg-white dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 hover:border-violet-300 dark:hover:border-violet-700 transition-all"
                    >
                        <div className="flex items-start gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center shrink-0">
                                <Presentation className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
                                    Mock Interviews
                                </h3>
                                <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                                    AI-powered interview simulations. Perfect for placement preparation for final year students.
                                </p>
                                <div className="flex flex-wrap gap-3">
                                    <span className="flex items-center gap-1.5 text-xs bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 px-2.5 py-1 rounded-full">
                                        🤖 AI Interviewer
                                    </span>
                                    <span className="flex items-center gap-1.5 text-xs bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 px-2.5 py-1 rounded-full">
                                        📊 Detailed Feedback
                                    </span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Space Topics Card */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="group p-8 rounded-3xl bg-white dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 hover:border-amber-300 dark:hover:border-amber-700 transition-all"
                    >
                        <div className="flex items-start gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shrink-0">
                                <Lightbulb className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
                                    Interactive Spaces
                                </h3>
                                <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                                    Assign topics for self-paced learning. Visual, interactive content that students actually enjoy.
                                </p>
                                <div className="flex flex-wrap gap-3">
                                    <span className="flex items-center gap-1.5 text-xs bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-2.5 py-1 rounded-full">
                                        📚 Rich Content
                                    </span>
                                    <span className="flex items-center gap-1.5 text-xs bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-2.5 py-1 rounded-full">
                                        🎯 Progress Tracking
                                    </span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}
