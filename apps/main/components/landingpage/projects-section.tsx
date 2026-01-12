"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
    Target, Globe, Cpu, Terminal, Layers, ShieldCheck, GitMerge,
    Zap, Users, FolderCode
} from "lucide-react"
import { Badge } from "@repo/ui/components/ui/badge"
import { Button } from "@repo/ui/components/ui/button"
import { Skeleton } from "@repo/ui/components/ui/skeleton"
import { PublicProjectsGrid } from "@/app/(main)/projects/_components/public-projects-grid"
import { getProjectsPageStats } from "@/actions/(common)/stats/platform-stats.action"

interface ProjectStats {
    totalProjects: number
    activeBuilders: number
    completedTasks: number
    successRate: number
}

const features = [
    {
        icon: Terminal,
        title: "Scaffold Agent",
        description: "Generate personalized boilerplates based on your tech stack preference."
    },
    {
        icon: Layers,
        title: "Execution Plan",
        description: "Step-by-step implementation guide broke down into atomic tasks."
    },
    {
        icon: ShieldCheck,
        title: "Knowledge Check",
        description: "Validate understanding with automated technical quizzes per module."
    },
    {
        icon: Target,
        title: "Interview Sim",
        description: "Defend your project decisions against an AI technical interviewer."
    }
]

export default function ProjectsSection() {
    const [stats, setStats] = useState<ProjectStats | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchStats() {
            try {
                const result = await getProjectsPageStats()
                if (result.success && result.data) {
                    setStats({
                        totalProjects: result.data.totalProjects,
                        activeBuilders: result.data.activeBuilders,
                        completedTasks: result.data.completedTasks,
                        successRate: result.data.successRate
                    })
                }
            } catch (error) {
                console.error('Failed to fetch stats:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchStats()
    }, [])

    // Format number for display
    const formatNumber = (num: number): string => {
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
        return num.toString()
    }

    // Dynamic stats using real data
    const displayStats = [
        {
            label: "Projects Built",
            value: loading ? "..." : `${formatNumber(stats?.totalProjects || 0)}+`,
            icon: FolderCode
        },
        {
            label: "Active Builders",
            value: loading ? "..." : `${formatNumber(stats?.activeBuilders || 0)}+`,
            icon: Users
        },
        {
            label: "Tasks Completed",
            value: loading ? "..." : `${formatNumber(stats?.completedTasks || 0)}+`,
            icon: GitMerge
        },
        {
            label: "Success Rate",
            value: loading ? "..." : `${stats?.successRate || 94}%`,
            icon: Zap
        },
    ]

    return (
        <section id="projects" className="py-24 relative bg-white dark:bg-neutral-950 border-t border-neutral-100 dark:border-neutral-800">
            <div className="absolute inset-0 -z-10 h-full w-full bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]" />
            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-center max-w-3xl mx-auto mb-20"
                >
                    <Badge variant="outline" className="px-4 py-1.5 rounded-full border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 font-medium text-sm mb-6">
                        <Cpu className="w-3.5 h-3.5 mr-2" />
                        Project Foundry
                    </Badge>
                    <h2 className="text-4xl md:text-5xl font-bold mb-6 text-neutral-900 dark:text-white tracking-tight">
                        From Prompt to <span className="text-neutral-400 dark:text-neutral-600">Production.</span>
                    </h2>
                    <p className="text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed font-light">
                        Don&apos;t just watch tutorials. Generate full-stack project scaffolds, follow execution plans, and deploy real software to your portfolio.
                    </p>
                </motion.div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-24">
                    {
                        features.map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="group bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors"
                            >
                                <div className="w-10 h-10 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center mb-4 text-neutral-900 dark:text-white">
                                    <feature.icon className="w-5 h-5" />
                                </div>
                                <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">
                                    {feature.title}
                                </h3>
                                <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
                                    {feature.description}
                                </p>
                            </motion.div>
                        ))
                    }
                </div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className="flex flex-col md:flex-row justify-between items-end mb-10 border-b border-neutral-200 dark:border-neutral-800 pb-8 gap-6"
                >
                    <div>
                        <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2 flex items-center gap-2">
                            <Globe className="w-5 h-5 text-neutral-500" />
                            Public Registry
                        </h3>
                        <p className="text-neutral-500 dark:text-neutral-400 text-sm">
                            Open source projects built by the community.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Link href="/projects/generate">
                            <Button className="cursor-pointer rounded-full bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900">
                                <Terminal className="mr-2 h-4 w-4" />
                                Initialize Project
                            </Button>
                        </Link>
                        <Link href="/projects/allprojects">
                            <Button variant="outline" className=" cursor-pointerrounded-full border-neutral-200 dark:border-neutral-800">
                                View Registry
                            </Button>
                        </Link>
                    </div>
                </motion.div>

                <PublicProjectsGrid />

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                    className="mt-20 border-t border-neutral-200 dark:border-neutral-800 pt-10"
                >
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {
                            displayStats.map((stat, index) => (
                                <div key={index} className="flex flex-col items-center md:items-start">
                                    <div className="flex items-center gap-2 text-neutral-900 dark:text-white font-mono text-2xl font-bold mb-1">
                                        <stat.icon className="w-5 h-5 text-neutral-400" />
                                        {loading ? (
                                            <Skeleton className="h-7 w-16" />
                                        ) : (
                                            stat.value
                                        )}
                                    </div>
                                    <div className="text-xs text-neutral-500 uppercase tracking-wider font-medium">
                                        {stat.label}
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                </motion.div>
            </div>
        </section>
    )
}