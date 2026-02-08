"use client"

import { motion } from "framer-motion"
import { Users, Video, Calendar, Clock, Star, ArrowRight, Play, Plus } from "lucide-react"
import { Button } from "@repo/ui/components/ui/button"
import Link from "next/link"

export default function UniMockPage() {
    return (
        <div className="min-h-full p-6 lg:p-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Users className="w-5 h-5 text-violet-500" />
                            <span className="text-xs font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider">
                                Mock Interviews
                            </span>
                        </div>
                        <h1 className="text-2xl lg:text-3xl font-bold text-neutral-900 dark:text-white">
                            AI Mock Interviews
                        </h1>
                        <p className="text-neutral-500 mt-1">
                            Practice interviews with AI and get instant feedback
                        </p>
                    </div>
                    <Button className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white">
                        <Plus className="w-4 h-4 mr-2" />
                        Start Practice
                    </Button>
                </div>
            </motion.div>

            {/* Feature Cards */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
            >
                <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 hover:border-violet-300 dark:hover:border-violet-700 transition-all cursor-pointer group">
                    <div className="flex items-start justify-between mb-4">
                        <div className="p-3 rounded-xl bg-violet-100 dark:bg-violet-900/30">
                            <Video className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                        </div>
                        <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-violet-600 transition-colors" />
                    </div>
                    <h3 className="font-bold text-neutral-900 dark:text-white mb-2">Technical Interview</h3>
                    <p className="text-sm text-neutral-500">
                        Practice coding problems and system design questions
                    </p>
                </div>

                <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 hover:border-violet-300 dark:hover:border-violet-700 transition-all cursor-pointer group">
                    <div className="flex items-start justify-between mb-4">
                        <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30">
                            <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-blue-600 transition-colors" />
                    </div>
                    <h3 className="font-bold text-neutral-900 dark:text-white mb-2">Behavioral Interview</h3>
                    <p className="text-sm text-neutral-500">
                        Practice STAR method and common behavioral questions
                    </p>
                </div>

                <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 hover:border-violet-300 dark:hover:border-violet-700 transition-all cursor-pointer group">
                    <div className="flex items-start justify-between mb-4">
                        <div className="p-3 rounded-xl bg-green-100 dark:bg-green-900/30">
                            <Star className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-green-600 transition-colors" />
                    </div>
                    <h3 className="font-bold text-neutral-900 dark:text-white mb-2">HR Interview</h3>
                    <p className="text-sm text-neutral-500">
                        Practice salary negotiation and company culture fit
                    </p>
                </div>
            </motion.div>

            {/* Coming Soon */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-center py-16 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl"
            >
                <div className="w-20 h-20 rounded-2xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mx-auto mb-6">
                    <Play className="w-10 h-10 text-violet-500" />
                </div>
                <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
                    Mock Interviews Coming Soon
                </h2>
                <p className="text-neutral-500 mb-6 max-w-md mx-auto">
                    AI-powered mock interviews will help you prepare for real interviews. Practice anytime, anywhere!
                </p>
                <div className="flex items-center justify-center gap-4">
                    <div className="text-center">
                        <p className="text-2xl font-bold text-violet-600">0</p>
                        <p className="text-xs text-neutral-500">Sessions Completed</p>
                    </div>
                    <div className="w-px h-8 bg-neutral-200 dark:bg-neutral-800" />
                    <div className="text-center">
                        <p className="text-2xl font-bold text-violet-600">--</p>
                        <p className="text-xs text-neutral-500">Average Score</p>
                    </div>
                    <div className="w-px h-8 bg-neutral-200 dark:bg-neutral-800" />
                    <div className="text-center">
                        <p className="text-2xl font-bold text-violet-600">0h</p>
                        <p className="text-xs text-neutral-500">Practice Time</p>
                    </div>
                </div>
            </motion.div>

            {/* How it Works */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 mt-8"
            >
                <h3 className="font-bold text-neutral-900 dark:text-white mb-4">How Mock Interviews Work</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-sm font-bold text-violet-600 flex-shrink-0">
                            1
                        </div>
                        <div>
                            <h4 className="font-medium text-neutral-900 dark:text-white">Choose Interview Type</h4>
                            <p className="text-sm text-neutral-500">Select technical, behavioral, or HR interview</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-sm font-bold text-violet-600 flex-shrink-0">
                            2
                        </div>
                        <div>
                            <h4 className="font-medium text-neutral-900 dark:text-white">Answer Questions</h4>
                            <p className="text-sm text-neutral-500">AI asks relevant questions based on your profile</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-sm font-bold text-violet-600 flex-shrink-0">
                            3
                        </div>
                        <div>
                            <h4 className="font-medium text-neutral-900 dark:text-white">Get Feedback</h4>
                            <p className="text-sm text-neutral-500">Receive instant AI feedback and improvement tips</p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
