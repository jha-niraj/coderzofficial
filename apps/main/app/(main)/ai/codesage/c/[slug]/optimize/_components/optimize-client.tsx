"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Zap, RotateCcw, CheckCircle2, EyeOff, Clock, ChevronDown,
    ChevronUp, Cpu, Code2, Shield, Wrench, Package,
    Search, AlertCircle, Trophy, TrendingUp
} from "lucide-react"
import { Button } from "@repo/ui/components/ui/button"
import { Input } from "@repo/ui/components/ui/input"
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@repo/ui/components/ui/select"
import { cn } from "@repo/ui/lib/utils"
import toast from "@repo/ui/components/ui/sonner"
import { runOptimizationScan, updateIssueStatus } from "@/actions/(main)/ai/codesage/optimize.action"
import { DotmSquare11 } from "@repo/ui/components/ui/dotm-square-11"

type IssueStatus = "open" | "done" | "ignored"
type Severity = "critical" | "high" | "medium" | "low"
type Category = "performance" | "architecture" | "code_quality" | "security" | "dx" | "bundle"

interface Issue {
    id: string
    category: Category
    severity: Severity
    title: string
    filePath: string | null
    lineStart: number | null
    lineEnd: number | null
    description: string
    currentCode: string | null
    fixedCode: string | null
    explanation: string | null
    effortLevel: string
    status: IssueStatus
}

const SEVERITY_CONFIG: Record<Severity, { color: string; bg: string; label: string; dot: string }> = {
    critical: { color: "text-red-700 dark:text-red-400",    bg: "bg-red-50 dark:bg-red-900/20",    label: "Critical", dot: "bg-red-500" },
    high:     { color: "text-orange-700 dark:text-orange-400", bg: "bg-orange-50 dark:bg-orange-900/20", label: "High",     dot: "bg-orange-500" },
    medium:   { color: "text-yellow-700 dark:text-yellow-400", bg: "bg-yellow-50 dark:bg-yellow-900/20", label: "Medium",   dot: "bg-yellow-500" },
    low:      { color: "text-blue-700 dark:text-blue-400",   bg: "bg-blue-50 dark:bg-blue-900/20",   label: "Low",      dot: "bg-blue-500" },
}

const CATEGORY_CONFIG: Record<Category, { icon: typeof Zap; label: string }> = {
    performance:  { icon: Cpu,       label: "Performance" },
    architecture: { icon: TrendingUp, label: "Architecture" },
    code_quality: { icon: Code2,     label: "Code Quality" },
    security:     { icon: Shield,    label: "Security" },
    dx:           { icon: Wrench,    label: "DX" },
    bundle:       { icon: Package,   label: "Bundle" },
}

const EFFORT_COLORS: Record<string, string> = {
    easy:   "text-green-600 bg-green-50 dark:bg-green-900/20",
    medium: "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20",
    hard:   "text-red-600 bg-red-50 dark:bg-red-900/20",
}

const SEVERITY_ORDER: Record<Severity, number> = { critical: 0, high: 1, medium: 2, low: 3 }

function IssueCard({
    issue,
    onStatusChange,
}: {
    issue: Issue
    onStatusChange: (id: string, status: IssueStatus) => void
}) {
    const [expanded, setExpanded] = useState(false)
    const sev = SEVERITY_CONFIG[issue.severity] ?? SEVERITY_CONFIG.low
    const cat = CATEGORY_CONFIG[issue.category] ?? CATEGORY_CONFIG.code_quality
    const CatIcon = cat.icon

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
                "rounded-xl border overflow-hidden transition-all",
                issue.status === "done"
                    ? "border-green-200 dark:border-green-900/30 bg-green-50/30 dark:bg-green-900/5 opacity-60"
                    : issue.status === "ignored"
                        ? "border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30 opacity-50"
                        : "border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900"
            )}
        >
            {/* Header */}
            <div
                className="flex items-start gap-3 p-4 cursor-pointer"
                onClick={() => setExpanded(e => !e)}
            >
                <div className={cn("w-1.5 h-1.5 rounded-full mt-2 shrink-0", sev.dot)} />

                <div className="flex-1 min-w-0">
                    <div className="flex items-start flex-wrap gap-2 mb-1">
                        <span className={cn("text-xs px-1.5 py-0.5 rounded font-medium flex items-center gap-1", sev.bg, sev.color)}>
                            {sev.label}
                        </span>
                        <span className="text-xs text-neutral-500 flex items-center gap-1">
                            <CatIcon className="w-3 h-3" />
                            {cat.label}
                        </span>
                        <span className={cn("text-xs px-1.5 py-0.5 rounded capitalize font-medium", EFFORT_COLORS[issue.effortLevel] ?? "")}>
                            {issue.effortLevel}
                        </span>
                    </div>
                    <p className="text-sm font-medium text-neutral-900 dark:text-white">{issue.title}</p>
                    {issue.filePath && (
                        <p className="text-xs text-neutral-500 font-mono mt-0.5 truncate">
                            {issue.filePath}{issue.lineStart ? `:${issue.lineStart}` : ""}
                        </p>
                    )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    {issue.status === "open" && (
                        <>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 gap-1"
                                onClick={e => { e.stopPropagation(); onStatusChange(issue.id, "done") }}
                            >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Done
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs text-neutral-500 gap-1"
                                onClick={e => { e.stopPropagation(); onStatusChange(issue.id, "ignored") }}
                            >
                                <EyeOff className="w-3.5 h-3.5" />
                                Ignore
                            </Button>
                        </>
                    )}
                    {issue.status !== "open" && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={e => { e.stopPropagation(); onStatusChange(issue.id, "open") }}
                        >
                            Reopen
                        </Button>
                    )}
                    {expanded ? <ChevronUp className="w-4 h-4 text-neutral-400" /> : <ChevronDown className="w-4 h-4 text-neutral-400" />}
                </div>
            </div>

            {/* Expanded */}
            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-neutral-100 dark:border-neutral-800 overflow-hidden"
                    >
                        <div className="p-4 space-y-4">
                            <p className="text-sm text-neutral-600 dark:text-neutral-400">{issue.description}</p>

                            {(issue.currentCode || issue.fixedCode) && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {issue.currentCode && (
                                        <div>
                                            <p className="text-xs font-semibold text-red-600 dark:text-red-400 mb-1.5 flex items-center gap-1">
                                                <span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> Before
                                            </p>
                                            <pre className="text-xs font-mono bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-lg p-3 overflow-auto whitespace-pre-wrap text-neutral-700 dark:text-neutral-300">
                                                {issue.currentCode}
                                            </pre>
                                        </div>
                                    )}
                                    {issue.fixedCode && (
                                        <div>
                                            <p className="text-xs font-semibold text-green-600 dark:text-green-400 mb-1.5 flex items-center gap-1">
                                                <span className="w-2 h-2 rounded-full bg-green-500 inline-block" /> After
                                            </p>
                                            <pre className="text-xs font-mono bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/30 rounded-lg p-3 overflow-auto whitespace-pre-wrap text-neutral-700 dark:text-neutral-300">
                                                {issue.fixedCode}
                                            </pre>
                                        </div>
                                    )}
                                </div>
                            )}

                            {issue.explanation && (
                                <p className="text-xs text-neutral-500 italic border-l-2 border-neutral-200 dark:border-neutral-700 pl-3">
                                    {issue.explanation}
                                </p>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}

export function OptimizeClient({
    projectSlug,
    projectName: _projectName,
    issues: initialIssues,
    optimizedAt,
    isReady,
}: {
    projectSlug: string
    projectName: string
    issues: Issue[]
    optimizedAt: Date | null
    isReady: boolean
}) {
    const [issues, setIssues] = useState(initialIssues)
    const [scanning, setScanning] = useState(false)
    const [search, setSearch] = useState("")
    const [severityFilter, setSeverityFilter] = useState<string>("all")
    const [categoryFilter, setCategoryFilter] = useState<string>("all")
    const [statusFilter, setStatusFilter] = useState<string>("open")

    const handleScan = async () => {
        setScanning(true)
        const toastId = toast.loading("Scanning codebase… this takes ~60 seconds")
        const res = await runOptimizationScan(projectSlug)
        setScanning(false)
        if (!res.success) {
            toast.error(res.error ?? "Scan failed", { id: toastId })
            return
        }
        toast.success(`Found ${res.issueCount} optimization opportunities`, { id: toastId })
        // Reload issues by revalidating
        window.location.reload()
    }

    const handleStatusChange = async (id: string, status: IssueStatus) => {
        setIssues(prev => prev.map(i => i.id === id ? { ...i, status } : i))
        await updateIssueStatus(id, status)
    }

    const filteredIssues = useMemo(() => {
        return issues
            .filter(i => {
                if (statusFilter !== "all" && i.status !== statusFilter) return false
                if (severityFilter !== "all" && i.severity !== severityFilter) return false
                if (categoryFilter !== "all" && i.category !== categoryFilter) return false
                if (search) {
                    const q = search.toLowerCase()
                    return i.title.toLowerCase().includes(q) || (i.filePath?.toLowerCase().includes(q) ?? false)
                }
                return true
            })
            .sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity])
    }, [issues, statusFilter, severityFilter, categoryFilter, search])

    const openCount = issues.filter(i => i.status === "open").length
    const doneCount = issues.filter(i => i.status === "done").length
    const score = issues.length > 0 ? Math.round((doneCount / issues.length) * 100) : null

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start justify-between gap-4 mb-8"
            >
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                        <Zap className="w-6 h-6 text-amber-500" />
                        Optimize
                    </h1>
                    <p className="text-sm text-neutral-500 mt-1">
                        {optimizedAt
                            ? `Last scanned ${new Date(optimizedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}`
                            : "No scan yet — run one to see opportunities"}
                    </p>
                </div>
                <Button
                    onClick={handleScan}
                    disabled={scanning || !isReady}
                    className="bg-neutral-900 text-white dark:bg-white dark:text-black hover:opacity-90 rounded-xl shrink-0"
                >
                    {scanning ? (
                        <><DotmSquare11 size={16} dotSize={2.5} speed={1.4} className="mr-2" />Scanning…</>
                    ) : (
                        <><RotateCcw className="w-4 h-4 mr-2" />{issues.length > 0 ? "Re-scan" : "Run Scan"}</>
                    )}
                </Button>
            </motion.div>

            {/* Stats */}
            {issues.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6"
                >
                    {[
                        { label: "Total Issues", value: issues.length, icon: AlertCircle },
                        { label: "Open", value: openCount, icon: Clock },
                        { label: "Resolved", value: doneCount, icon: CheckCircle2 },
                        { label: "Progress", value: score !== null ? `${score}%` : "—", icon: Trophy },
                    ].map((stat, _i) => (
                        <div
                            key={stat.label}
                            className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 p-4"
                        >
                            <p className="text-xs text-neutral-500 mb-1 flex items-center gap-1">
                                <stat.icon className="w-3 h-3" />
                                {stat.label}
                            </p>
                            <p className="text-xl font-bold text-neutral-900 dark:text-white">{stat.value}</p>
                        </div>
                    ))}
                </motion.div>
            )}

            {/* Filters */}
            {issues.length > 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.15 }}
                    className="flex flex-wrap gap-2 mb-5"
                >
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
                        <Input
                            placeholder="Search issues…"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="pl-9 h-8 text-sm"
                        />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="h-8 w-[110px] text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all" className="text-xs">All Status</SelectItem>
                            <SelectItem value="open" className="text-xs">Open</SelectItem>
                            <SelectItem value="done" className="text-xs">Done</SelectItem>
                            <SelectItem value="ignored" className="text-xs">Ignored</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={severityFilter} onValueChange={setSeverityFilter}>
                        <SelectTrigger className="h-8 w-[110px] text-xs"><SelectValue placeholder="Severity" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all" className="text-xs">All Severity</SelectItem>
                            <SelectItem value="critical" className="text-xs">Critical</SelectItem>
                            <SelectItem value="high" className="text-xs">High</SelectItem>
                            <SelectItem value="medium" className="text-xs">Medium</SelectItem>
                            <SelectItem value="low" className="text-xs">Low</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger className="h-8 w-[120px] text-xs"><SelectValue placeholder="Category" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all" className="text-xs">All Categories</SelectItem>
                            <SelectItem value="performance" className="text-xs">Performance</SelectItem>
                            <SelectItem value="architecture" className="text-xs">Architecture</SelectItem>
                            <SelectItem value="code_quality" className="text-xs">Code Quality</SelectItem>
                            <SelectItem value="security" className="text-xs">Security</SelectItem>
                            <SelectItem value="dx" className="text-xs">DX</SelectItem>
                            <SelectItem value="bundle" className="text-xs">Bundle</SelectItem>
                        </SelectContent>
                    </Select>
                </motion.div>
            )}

            {/* Issues or empty state */}
            {issues.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center py-24 text-center"
                >
                    <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-4">
                        <Zap className="w-7 h-7 text-amber-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-neutral-800 dark:text-white mb-2">
                        {scanning ? "Scanning your codebase…" : "No scan results yet"}
                    </h3>
                    <p className="text-sm text-neutral-500 max-w-sm mb-6">
                        {scanning
                            ? "Analyzing files for performance, architecture, code quality, and security issues."
                            : "Run a scan to discover optimization opportunities, code quality improvements, and security issues."}
                    </p>
                    {!scanning && (
                        <Button
                            onClick={handleScan}
                            disabled={!isReady}
                            className="bg-neutral-900 text-white dark:bg-white dark:text-black hover:opacity-90 rounded-xl"
                        >
                            <Zap className="w-4 h-4 mr-2" />
                            Run First Scan
                        </Button>
                    )}
                    {scanning && <DotmSquare11 size={36} dotSize={5} speed={1.4} />}
                </motion.div>
            ) : (
                <div className="space-y-3">
                    <p className="text-xs text-neutral-500">
                        {filteredIssues.length} of {issues.length} issues
                    </p>
                    {filteredIssues.map(issue => (
                        <IssueCard key={issue.id} issue={issue} onStatusChange={handleStatusChange} />
                    ))}
                    {filteredIssues.length === 0 && (
                        <div className="text-center py-10 text-neutral-500 text-sm">
                            No issues match your filters.
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
