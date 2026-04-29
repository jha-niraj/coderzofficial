"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
    MessageSquareCode, Zap, GraduationCap, Plus, Clock, FileCode2,
    Layers, CheckCircle2, Loader2, AlertCircle, ArrowRight, Sparkles
} from "lucide-react"
import { Button } from "@repo/ui/components/ui/button"
import { Badge } from "@repo/ui/components/ui/badge"
import { cn } from "@repo/ui/lib/utils"

interface Project {
    id: string
    name: string
    slug: string
    description: string | null
    sourceType: string
    indexStatus: string
    fileCount: number | null
    detectedStack: Record<string, string> | null
    updatedAt: Date
    _count: { files: number; sessions: number; issues: number; interviews: number }
}

const STATUS_CONFIG = {
    ready:    { icon: CheckCircle2, color: "text-green-500", bg: "bg-green-500/10", label: "Ready" },
    indexing: { icon: Loader2,      color: "text-blue-500",  bg: "bg-blue-500/10",  label: "Indexing…", spin: true },
    pending:  { icon: Clock,        color: "text-yellow-500",bg: "bg-yellow-500/10",label: "Pending" },
    failed:   { icon: AlertCircle,  color: "text-red-500",   bg: "bg-red-500/10",   label: "Failed" },
} as const

function timeAgo(date: Date): string {
    const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
    if (s < 60) return "just now"
    if (s < 3600) return `${Math.floor(s / 60)}m ago`
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`
    return `${Math.floor(s / 86400)}d ago`
}

function ProjectCard({ project, index }: { project: Project; index: number }) {
    const router = useRouter()
    const status = STATUS_CONFIG[project.indexStatus as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.pending
    const StatusIcon = status.icon
    const stack = project.detectedStack as Record<string, string> | null

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.07 }}
            onClick={() => project.indexStatus === "ready" && router.push(`/ai/codesage/c/${project.slug}`)}
            className={cn(
                "group relative rounded-2xl border bg-white dark:bg-neutral-900 p-5 flex flex-col gap-3 transition-all duration-200",
                project.indexStatus === "ready"
                    ? "border-neutral-200 dark:border-neutral-800 hover:shadow-md hover:shadow-black/5 dark:hover:shadow-black/30 cursor-pointer hover:border-neutral-300 dark:hover:border-neutral-700"
                    : "border-neutral-200 dark:border-neutral-800 opacity-80"
            )}
        >
            {/* Status badge */}
            <div className="flex items-center justify-between">
                <div className={cn("flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium", status.bg, status.color)}>
                    <StatusIcon className={cn("w-3 h-3", "spin" in status && status.spin && "animate-spin")} />
                    {status.label}
                </div>
                <span className="text-xs text-neutral-400">{timeAgo(project.updatedAt)}</span>
            </div>

            {/* Name + description */}
            <div>
                <h3 className="font-semibold text-neutral-900 dark:text-white group-hover:text-primary transition-colors">
                    {project.name}
                </h3>
                {project.description && (
                    <p className="text-xs text-neutral-500 mt-0.5 line-clamp-1">{project.description}</p>
                )}
            </div>

            {/* Stack badges */}
            {stack && Object.keys(stack).length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                    {Object.entries(stack).slice(0, 3).map(([k, v]) => (
                        <Badge key={k} variant="secondary" className="text-[10px] px-1.5 py-0 h-4 font-normal">
                            {v}
                        </Badge>
                    ))}
                </div>
            )}

            {/* Stats */}
            <div className="flex items-center gap-4 pt-1 border-t border-neutral-100 dark:border-neutral-800 text-xs text-neutral-500">
                <span className="flex items-center gap-1">
                    <FileCode2 className="w-3 h-3" />
                    {project.fileCount ?? 0} files
                </span>
                <span className="flex items-center gap-1">
                    <MessageSquareCode className="w-3 h-3" />
                    {project._count.sessions} chats
                </span>
                <span className="flex items-center gap-1">
                    <GraduationCap className="w-3 h-3" />
                    {project._count.interviews} interviews
                </span>
            </div>

            {project.indexStatus === "ready" && (
                <ArrowRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            )}
        </motion.div>
    )
}

export function CodeSageDashboard({ projects }: { projects: Project[] }) {
    return (
        <div className="min-h-screen bg-white dark:bg-neutral-950">
            {/* Hero */}
            <section className="border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
                    >
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <div className="w-9 h-9 rounded-xl bg-neutral-900 dark:bg-white flex items-center justify-center">
                                    <Sparkles className="w-4.5 h-4.5 text-white dark:text-black" />
                                </div>
                                <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
                                    CodeSage
                                </h1>
                            </div>
                            <p className="text-neutral-500 dark:text-neutral-400 max-w-lg">
                                Connect a GitHub repo and unlock AI-powered Q&A, optimization audits, and mock interviews — all based on your actual code.
                            </p>
                        </div>
                        <Button
                            asChild
                            size="lg"
                            className="bg-neutral-900 text-white dark:bg-white dark:text-black hover:opacity-90 rounded-xl px-6 shrink-0"
                        >
                            <Link href="/ai/codesage/new">
                                <Plus className="w-4 h-4 mr-2" />
                                Add Codebase
                            </Link>
                        </Button>
                    </motion.div>

                    {/* Capability pills */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="flex flex-wrap gap-2 mt-6"
                    >
                        {[
                            { icon: MessageSquareCode, label: "Ask Anything", color: "text-violet-600" },
                            { icon: Zap, label: "Find Optimizations", color: "text-amber-600" },
                            { icon: GraduationCap, label: "Mock Interviews", color: "text-emerald-600" },
                            { icon: Layers, label: "Architecture Insights", color: "text-blue-600" },
                        ].map(({ icon: Icon, label, color }) => (
                            <div
                                key={label}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs font-medium text-neutral-600 dark:text-neutral-400"
                            >
                                <Icon className={cn("w-3.5 h-3.5", color)} />
                                {label}
                            </div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Projects grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {projects.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center justify-center py-24 text-center"
                    >
                        <div className="w-16 h-16 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-5">
                            <FileCode2 className="w-8 h-8 text-neutral-400" />
                        </div>
                        <h2 className="text-xl font-semibold text-neutral-800 dark:text-white mb-2">No codebases yet</h2>
                        <p className="text-neutral-500 text-sm mb-6 max-w-sm">
                            Connect a GitHub repo and get AI-powered insights about your codebase in minutes.
                        </p>
                        <Button asChild className="rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-black hover:opacity-90">
                            <Link href="/ai/codesage/new">
                                <Plus className="w-4 h-4 mr-2" />
                                Add Your First Codebase
                            </Link>
                        </Button>
                    </motion.div>
                ) : (
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide">
                                Your Codebases ({projects.length})
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {projects.map((p, i) => <ProjectCard key={p.id} project={p} index={i} />)}
                            {/* Add new card */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: projects.length * 0.07 }}
                            >
                                <Link href="/ai/codesage/new" className="group flex flex-col items-center justify-center gap-3 h-full min-h-[180px] rounded-2xl border-2 border-dashed border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors">
                                    <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center group-hover:bg-neutral-200 dark:group-hover:bg-neutral-700 transition-colors">
                                        <Plus className="w-5 h-5 text-neutral-500" />
                                    </div>
                                    <span className="text-sm font-medium text-neutral-500">Add Codebase</span>
                                </Link>
                            </motion.div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
