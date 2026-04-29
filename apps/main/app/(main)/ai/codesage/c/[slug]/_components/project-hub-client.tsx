"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { useParams } from "next/navigation"
import {
    MessageSquareCode, Zap, GraduationCap,
    ArrowRight, FileCode2, Bug, Trophy, Lock
} from "lucide-react"
import { Badge } from "@repo/ui/components/ui/badge"
import { cn } from "@repo/ui/lib/utils"

interface ProjectHubClientProps {
    project: {
        name: string
        slug: string
        description: string | null
        fileCount: number | null
        totalLines: number | null
        detectedStack: Record<string, string> | null
        indexStatus: string
        optimizedAt: Date | null
        _count: { files: number; sessions: number; issues: number; interviews: number }
    }
    stats: {
        openIssues: number
        interviewCount: number
        bestScore: number | null
    }
}

const MODULES = [
    {
        id: "ask",
        icon: MessageSquareCode,
        name: "Ask",
        tagline: "Chat with your codebase",
        description: "Ask anything about how your code works. Get answers with exact file and line references.",
        color: "from-violet-500/10 to-purple-500/10 border-violet-200 dark:border-violet-900/30",
        iconBg: "bg-violet-100 dark:bg-violet-900/30",
        iconColor: "text-violet-600 dark:text-violet-400",
        available: true,
    },
    {
        id: "optimize",
        icon: Zap,
        name: "Optimize",
        tagline: "Find real improvements",
        description: "Scan for performance, architecture, and code quality issues. Get actionable before/after diffs.",
        color: "from-amber-500/10 to-orange-500/10 border-amber-200 dark:border-amber-900/30",
        iconBg: "bg-amber-100 dark:bg-amber-900/30",
        iconColor: "text-amber-600 dark:text-amber-400",
        available: true,
    },
    {
        id: "interview",
        icon: GraduationCap,
        name: "Interview",
        tagline: "Practice on your own code",
        description: "AI generates questions from your actual code. Get scored and get detailed feedback.",
        color: "from-emerald-500/10 to-green-500/10 border-emerald-200 dark:border-emerald-900/30",
        iconBg: "bg-emerald-100 dark:bg-emerald-900/30",
        iconColor: "text-emerald-600 dark:text-emerald-400",
        available: true,
    },
]

const COMING_SOON = [
    { icon: FileCode2, name: "Explain", desc: "Auto-generate architecture diagrams" },
    { icon: FileCode2, name: "Docs",    desc: "Auto-generate README and API docs" },
    { icon: Bug,       name: "Security", desc: "Scan for vulnerabilities" },
]

export function ProjectHubClient({ project, stats }: ProjectHubClientProps) {
    const { slug } = useParams<{ slug: string }>()
    const stack = project.detectedStack as Record<string, string> | null

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            {/* Project summary */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-10"
            >
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">{project.name}</h1>
                        {project.description && (
                            <p className="text-neutral-500 mt-1 text-sm">{project.description}</p>
                        )}
                        {stack && (
                            <div className="flex flex-wrap gap-2 mt-3">
                                {Object.entries(stack).map(([, v]) => (
                                    <Badge key={v} variant="secondary" className="text-xs font-normal">{v}</Badge>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
                    {[
                        { label: "Files", value: project.fileCount ?? 0, icon: FileCode2 },
                        { label: "Lines", value: project.totalLines ? `${Math.round(project.totalLines / 1000)}K` : "—", icon: FileCode2 },
                        { label: "Open Issues", value: stats.openIssues || "Run scan", icon: Bug },
                        { label: "Best Score", value: stats.bestScore !== null ? `${stats.bestScore}%` : "Not taken", icon: Trophy },
                    ].map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.05 * i }}
                            className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 p-4"
                        >
                            <p className="text-xs text-neutral-500 mb-1">{stat.label}</p>
                            <p className="text-lg font-bold text-neutral-900 dark:text-white">{stat.value}</p>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* Modules grid */}
            <div className="mb-8">
                <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-4">Available Modules</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {MODULES.map((mod, i) => (
                        <motion.div
                            key={mod.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 + i * 0.08 }}
                        >
                            <Link
                                href={`/ai/codesage/c/${slug}/${mod.id}`}
                                className={cn(
                                    "group flex flex-col h-full rounded-2xl border bg-gradient-to-br p-5 transition-all duration-200 hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/30 hover:-translate-y-0.5",
                                    mod.color
                                )}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", mod.iconBg)}>
                                        <mod.icon className={cn("w-5 h-5", mod.iconColor)} />
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-neutral-700 dark:group-hover:text-neutral-300 group-hover:translate-x-0.5 transition-all" />
                                </div>
                                <h3 className="text-base font-bold text-neutral-900 dark:text-white mb-1">{mod.name}</h3>
                                <p className="text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-2">{mod.tagline}</p>
                                <p className="text-xs text-neutral-500 leading-relaxed flex-1">{mod.description}</p>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Coming soon */}
            <div>
                <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-4">Coming Soon</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {COMING_SOON.map((mod, i) => (
                        <motion.div
                            key={mod.name}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 + i * 0.06 }}
                            className="flex items-center gap-3 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 opacity-70"
                        >
                            <div className="w-8 h-8 rounded-lg bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center">
                                <mod.icon className="w-4 h-4 text-neutral-400" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                                    {mod.name}
                                    <Lock className="w-3 h-3" />
                                </p>
                                <p className="text-xs text-neutral-500">{mod.desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    )
}
