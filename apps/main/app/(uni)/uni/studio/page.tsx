"use client"

import { motion } from "framer-motion"
import { Code, FolderOpen, GitBranch, Plus, Clock, Users, Star, ArrowRight } from "lucide-react"
import { Button } from "@repo/ui/components/ui/button"
import Link from "next/link"

export default function UniStudioPage() {
    // Placeholder - will be replaced with real project data
    const projects: any[] = []

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
                            <Code className="w-5 h-5 text-violet-500" />
                            <span className="text-xs font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider">
                                Studio
                            </span>
                        </div>
                        <h1 className="text-2xl lg:text-3xl font-bold text-neutral-900 dark:text-white">
                            Code Studio
                        </h1>
                        <p className="text-neutral-500 mt-1">
                            Work on your assignments and projects in the cloud IDE
                        </p>
                    </div>
                    <Button className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white">
                        <Plus className="w-4 h-4 mr-2" />
                        New Project
                    </Button>
                </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
            >
                <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 hover:border-violet-300 dark:hover:border-violet-700 transition-all cursor-pointer group">
                    <div className="flex items-start justify-between mb-4">
                        <div className="p-3 rounded-xl bg-violet-100 dark:bg-violet-900/30">
                            <Plus className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                        </div>
                        <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-violet-600 transition-colors" />
                    </div>
                    <h3 className="font-bold text-neutral-900 dark:text-white mb-2">Start from Template</h3>
                    <p className="text-sm text-neutral-500">
                        Choose from pre-built templates for common languages
                    </p>
                </div>

                <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 hover:border-violet-300 dark:hover:border-violet-700 transition-all cursor-pointer group">
                    <div className="flex items-start justify-between mb-4">
                        <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30">
                            <GitBranch className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-blue-600 transition-colors" />
                    </div>
                    <h3 className="font-bold text-neutral-900 dark:text-white mb-2">Import from GitHub</h3>
                    <p className="text-sm text-neutral-500">
                        Clone an existing repository and start coding
                    </p>
                </div>

                <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 hover:border-violet-300 dark:hover:border-violet-700 transition-all cursor-pointer group">
                    <div className="flex items-start justify-between mb-4">
                        <div className="p-3 rounded-xl bg-green-100 dark:bg-green-900/30">
                            <FolderOpen className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-green-600 transition-colors" />
                    </div>
                    <h3 className="font-bold text-neutral-900 dark:text-white mb-2">Blank Project</h3>
                    <p className="text-sm text-neutral-500">
                        Start from scratch with an empty workspace
                    </p>
                </div>
            </motion.div>

            {/* Projects List */}
            {projects.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-center py-16 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl"
                >
                    <div className="w-20 h-20 rounded-2xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mx-auto mb-6">
                        <Code className="w-10 h-10 text-violet-500" />
                    </div>
                    <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
                        No Projects Yet
                    </h2>
                    <p className="text-neutral-500 mb-6 max-w-md mx-auto">
                        Create your first project to start coding in the cloud. Use credits to run and compile your code.
                    </p>
                    <Button className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white">
                        <Plus className="w-4 h-4 mr-2" />
                        Create First Project
                    </Button>
                </motion.div>
            ) : (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-4"
                >
                    {projects.map((project) => (
                        <div
                            key={project.id}
                            className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 hover:border-violet-300 dark:hover:border-violet-700 transition-all cursor-pointer group"
                        >
                            <div className="flex items-start gap-4">
                                <div className="p-3 rounded-xl bg-neutral-100 dark:bg-neutral-900">
                                    <Code className="w-5 h-5 text-neutral-600" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-neutral-900 dark:text-white group-hover:text-violet-600 transition-colors">
                                        {project.name}
                                    </h3>
                                    <p className="text-sm text-neutral-500">{project.language}</p>
                                    <div className="flex items-center gap-4 mt-2 text-xs text-neutral-500">
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {project.lastEdited}
                                        </span>
                                    </div>
                                </div>
                                <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-violet-600 transition-colors" />
                            </div>
                        </div>
                    ))}
                </motion.div>
            )}

            {/* Credits Info */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 rounded-2xl p-6 mt-8"
            >
                <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-violet-100 dark:bg-violet-900/30">
                        <Star className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                    </div>
                    <div>
                        <h3 className="font-bold text-violet-800 dark:text-violet-200">Credits Usage</h3>
                        <p className="text-sm text-violet-700 dark:text-violet-300 mt-1">
                            Running code and compiling projects uses credits from your university allocation. 
                            Check your <Link href="/uni/credits" className="underline">credits balance</Link> before starting.
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
