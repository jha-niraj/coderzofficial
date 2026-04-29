"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import {
    ArrowLeft, Github, FolderKanban, Sparkles,
    Lock, Eye, EyeOff, CheckCircle2, AlertCircle
} from "lucide-react"
import { Button } from "@repo/ui/components/ui/button"
import { Input } from "@repo/ui/components/ui/input"
import { Label } from "@repo/ui/components/ui/label"
import { Textarea } from "@repo/ui/components/ui/textarea"
import { Badge } from "@repo/ui/components/ui/badge"
import { cn } from "@repo/ui/lib/utils"
import toast from "@repo/ui/components/ui/sonner"
import { ingestGitHubRepo } from "@/actions/(main)/ai/codesage/ingest.action"
import { DotmSquare11 } from "@repo/ui/components/ui/dotm-square-11"

type SourceType = "github" | "portfolio"

interface PortfolioProject {
    id: string
    name: string
    githubUrl: string
}

export function NewProjectForm({ portfolioProjects }: { portfolioProjects: PortfolioProject[] }) {
    const router = useRouter()
    const [sourceType, setSourceType] = useState<SourceType>("github")
    const [githubUrl, setGithubUrl] = useState("")
    const [projectName, setProjectName] = useState("")
    const [description, setDescription] = useState("")
    const [githubToken, setGithubToken] = useState("")
    const [showToken, setShowToken] = useState(false)
    const [loading, setLoading] = useState(false)
    const [selectedPortfolio, setSelectedPortfolio] = useState<PortfolioProject | null>(null)

    const activeUrl = sourceType === "portfolio" ? (selectedPortfolio?.githubUrl ?? "") : githubUrl

    const handleSubmit = async () => {
        const url = activeUrl.trim()
        if (!url) return toast.error("Enter a GitHub repository URL")

        const name = projectName.trim() || url.split("/").slice(-1)[0]?.replace(/-/g, " ") || "My Project"

        setLoading(true)
        const toastId = toast.loading("Connecting to GitHub and indexing files…")

        const res = await ingestGitHubRepo({
            name,
            githubUrl: url,
            description: description.trim() || undefined,
            githubToken: githubToken.trim() || undefined,
        })

        if (!res.success) {
            toast.error(res.error ?? "Failed to ingest codebase", { id: toastId })
            setLoading(false)
            return
        }

        toast.success(`Indexed ${res.fileCount} files — CodeSage is ready!`, { id: toastId })
        router.push(`/ai/codesage/c/${res.slug}`)
    }

    return (
        <div className="min-h-screen bg-white dark:bg-neutral-950">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-4 mb-10"
                >
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/ai/codesage">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Add Codebase</h1>
                        <p className="text-sm text-neutral-500 mt-0.5">Connect a GitHub repo to unlock AI-powered insights</p>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    {/* Form */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="lg:col-span-3 space-y-6"
                    >
                        {/* Source type tabs */}
                        <div>
                            <Label className="text-sm font-medium mb-3 block">Source</Label>
                            <div className="grid grid-cols-2 gap-3">
                                {([
                                    { type: "github", icon: Github, label: "GitHub URL", desc: "Paste any public repo URL" },
                                    { type: "portfolio", icon: FolderKanban, label: "My Projects", desc: "Import from your portfolio" },
                                ] as const).map(opt => (
                                    <button
                                        key={opt.type}
                                        onClick={() => setSourceType(opt.type)}
                                        className={cn(
                                            "flex items-start gap-3 p-4 rounded-xl border text-left transition-all",
                                            sourceType === opt.type
                                                ? "border-neutral-900 dark:border-white bg-neutral-50 dark:bg-neutral-800"
                                                : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-8 h-8 rounded-lg flex items-center justify-center mt-0.5 shrink-0",
                                            sourceType === opt.type ? "bg-neutral-900 dark:bg-white" : "bg-neutral-100 dark:bg-neutral-800"
                                        )}>
                                            <opt.icon className={cn("w-4 h-4", sourceType === opt.type ? "text-white dark:text-black" : "text-neutral-500")} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-neutral-900 dark:text-white">{opt.label}</p>
                                            <p className="text-xs text-neutral-500 mt-0.5">{opt.desc}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Source input */}
                        {sourceType === "github" ? (
                            <div className="space-y-1.5">
                                <Label className="text-sm font-medium">Repository URL <span className="text-red-500">*</span></Label>
                                <Input
                                    placeholder="https://github.com/owner/repo"
                                    value={githubUrl}
                                    onChange={e => setGithubUrl(e.target.value)}
                                    disabled={loading}
                                    className="font-mono text-sm"
                                />
                                <p className="text-xs text-neutral-500">Supports: github.com/owner/repo, github.com/owner/repo/tree/branch</p>
                            </div>
                        ) : (
                            <div className="space-y-1.5">
                                <Label className="text-sm font-medium">Select Project</Label>
                                {portfolioProjects.length === 0 ? (
                                    <div className="rounded-xl border border-dashed border-neutral-200 dark:border-neutral-800 p-6 text-center">
                                        <FolderKanban className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
                                        <p className="text-sm text-neutral-500">No portfolio projects with GitHub links found.</p>
                                        <p className="text-xs text-neutral-400 mt-1">
                                            Add GitHub links to your projects in your{" "}
                                            <Link href="/profile?tab=projects" className="text-primary hover:underline">profile</Link>.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {portfolioProjects.map(p => (
                                            <button
                                                key={p.id}
                                                onClick={() => {
                                                    setSelectedPortfolio(p)
                                                    if (!projectName) setProjectName(p.name)
                                                }}
                                                className={cn(
                                                    "w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all",
                                                    selectedPortfolio?.id === p.id
                                                        ? "border-neutral-900 dark:border-white bg-neutral-50 dark:bg-neutral-800"
                                                        : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300"
                                                )}
                                            >
                                                {selectedPortfolio?.id === p.id ? (
                                                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                                                ) : (
                                                    <FolderKanban className="w-4 h-4 text-neutral-400 shrink-0" />
                                                )}
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">{p.name}</p>
                                                    <p className="text-xs text-neutral-500 font-mono truncate">{p.githubUrl.replace("https://github.com/", "")}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Project details */}
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <Label className="text-sm font-medium">Project Name</Label>
                                <Input
                                    placeholder="Auto-filled from repo name"
                                    value={projectName}
                                    onChange={e => setProjectName(e.target.value)}
                                    disabled={loading}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-sm font-medium">Description <span className="text-neutral-400 font-normal">(optional)</span></Label>
                                <Textarea
                                    placeholder="What does this project do?"
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    disabled={loading}
                                    rows={2}
                                    className="resize-none"
                                />
                            </div>
                        </div>

                        {/* GitHub token (optional) */}
                        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 space-y-2">
                            <div className="flex items-center gap-2">
                                <Lock className="w-4 h-4 text-neutral-500" />
                                <Label className="text-sm font-medium cursor-pointer">GitHub Token <span className="text-neutral-400 font-normal">(optional, for private repos)</span></Label>
                            </div>
                            <div className="relative">
                                <Input
                                    type={showToken ? "text" : "password"}
                                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                                    value={githubToken}
                                    onChange={e => setGithubToken(e.target.value)}
                                    disabled={loading}
                                    className="pr-10 font-mono text-sm"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowToken(s => !s)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                                >
                                    {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            <p className="text-xs text-neutral-500">Token is used only for this request and never stored.</p>
                        </div>

                        <Button
                            onClick={handleSubmit}
                            disabled={loading || !activeUrl.trim()}
                            className="w-full h-11 bg-neutral-900 text-white dark:bg-white dark:text-black hover:opacity-90 rounded-xl font-semibold text-sm"
                        >
                            {loading ? (
                                <>
                                    <DotmSquare11 size={18} dotSize={3} speed={1.4} className="mr-2" />
                                    Indexing codebase…
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-4 h-4 mr-2" />
                                    Index Codebase
                                </>
                            )}
                        </Button>
                    </motion.div>

                    {/* Info panel */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="lg:col-span-2 space-y-4"
                    >
                        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 p-5 space-y-4">
                            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">What happens next</h3>
                            <div className="space-y-3">
                                {[
                                    { step: "1", text: "We clone your repo via GitHub API" },
                                    { step: "2", text: "Source files are filtered and indexed (up to 500 files)" },
                                    { step: "3", text: "Framework, language and dependencies are detected" },
                                    { step: "4", text: "CodeSage modules become available instantly" },
                                ].map(s => (
                                    <div key={s.step} className="flex items-start gap-3">
                                        <div className="w-5 h-5 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center text-[10px] font-bold text-neutral-600 dark:text-neutral-300 shrink-0 mt-0.5">
                                            {s.step}
                                        </div>
                                        <p className="text-xs text-neutral-600 dark:text-neutral-400">{s.text}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 p-5">
                            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-3">We include</h3>
                            <div className="flex flex-wrap gap-1.5">
                                {[".ts", ".tsx", ".js", ".jsx", ".py", ".go", ".prisma", ".graphql", ".sql", "package.json", ".env.example"].map(ext => (
                                    <Badge key={ext} variant="secondary" className="text-[10px] font-mono">
                                        {ext}
                                    </Badge>
                                ))}
                            </div>

                            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mt-4 mb-3">We exclude</h3>
                            <div className="flex flex-wrap gap-1.5">
                                {["node_modules/", ".git/", "dist/", "build/", ".next/", "*.min.js", "*.lock"].map(ext => (
                                    <Badge key={ext} variant="outline" className="text-[10px] font-mono text-neutral-500">
                                        {ext}
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-2xl border border-amber-200 dark:border-amber-900/30 bg-amber-50 dark:bg-amber-900/10 p-4">
                            <div className="flex gap-2">
                                <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-xs font-medium text-amber-800 dark:text-amber-300">Limits</p>
                                    <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">Max 500 source files · 100MB repo · 200KB per file</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}
