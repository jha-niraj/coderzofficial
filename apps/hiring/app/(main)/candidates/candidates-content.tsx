"use client"

import { useState, useTransition } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Search, Filter, Users, MoreVertical, Mail, Calendar, Briefcase,
    ChevronRight, CheckCircle2, XCircle, Clock, Eye, MessageSquare,
    FileText, Award, TrendingUp, Loader2, LayoutGrid, List, 
    Columns, CheckSquare, Square, ArrowRight
} from "lucide-react"
import { Button } from "@repo/ui/components/ui/button"
import { Input } from "@repo/ui/components/ui/input"
import { Badge } from "@repo/ui/components/ui/badge"
import { Checkbox } from "@repo/ui/components/ui/checkbox"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@repo/ui/components/ui/sheet"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@repo/ui/components/ui/select"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@repo/ui/components/ui/dropdown-menu"
import { CandidateDetailSheet } from "./components/candidate-detail-sheet"
import { updateCandidateStatus } from "@/actions/candidates"
import { toast } from "sonner"

interface Candidate {
    id: string
    applicationId: string
    userId: string
    name: string
    email: string
    image: string | null
    jobId: string
    jobTitle: string
    jobSlug: string
    status: string
    appliedAt: Date
    matchScore: number | null
    currentStage: number | null
    resumeUrl: string | null
    coverLetter: string | null
}

interface Stats {
    total: number
    new: number
    screening: number
    interviewing: number
    offered: number
    hired: number
    rejected: number
    thisWeek: number
}

interface Job {
    id: string
    title: string
    status: string
    applicationsCount: number
}

interface CandidatesContentProps {
    initialCandidates: Candidate[]
    stats: Stats | null
    jobs: Job[]
}

const statusColors: Record<string, string> = {
    INTERESTED: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    PREPARING: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    APPLIED: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    UNDER_REVIEW: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    SHORTLISTED: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    INTERVIEW_SCHEDULED: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
    INTERVIEWED: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
    OFFER_EXTENDED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    HIRED: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    REJECTED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    WITHDRAWN: "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-400",
}

const statusLabels: Record<string, string> = {
    INTERESTED: "Interested",
    PREPARING: "Preparing",
    APPLIED: "Applied",
    UNDER_REVIEW: "Under Review",
    SHORTLISTED: "Shortlisted",
    INTERVIEW_SCHEDULED: "Interview Scheduled",
    INTERVIEWED: "Interviewed",
    OFFER_EXTENDED: "Offer Extended",
    HIRED: "Hired",
    REJECTED: "Rejected",
    WITHDRAWN: "Withdrawn",
}

// Kanban columns
const kanbanColumns = [
    { key: "APPLIED", label: "Applied", color: "border-t-blue-500" },
    { key: "UNDER_REVIEW", label: "Reviewing", color: "border-t-yellow-500" },
    { key: "SHORTLISTED", label: "Shortlisted", color: "border-t-purple-500" },
    { key: "INTERVIEW_SCHEDULED", label: "Interviewing", color: "border-t-orange-500" },
    { key: "OFFER_EXTENDED", label: "Offered", color: "border-t-emerald-500" },
    { key: "HIRED", label: "Hired", color: "border-t-green-500" },
]

export function CandidatesContent({ initialCandidates, stats, jobs }: CandidatesContentProps) {
    const [candidates, setCandidates] = useState<Candidate[]>(initialCandidates)
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedJob, setSelectedJob] = useState<string>("all")
    const [selectedStatus, setSelectedStatus] = useState<string>("all")
    const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
    const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false)
    const [viewMode, setViewMode] = useState<"list" | "kanban">("list")
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
    const [isPending, startTransition] = useTransition()

    const toggleSelect = (id: string) => {
        setSelectedIds(prev => {
            const next = new Set(prev)
            if (next.has(id)) next.delete(id)
            else next.add(id)
            return next
        })
    }

    const selectAll = () => {
        if (selectedIds.size === filteredCandidates.length) {
            setSelectedIds(new Set())
        } else {
            setSelectedIds(new Set(filteredCandidates.map(c => c.id)))
        }
    }

    const handleBulkAction = async (action: string) => {
        if (selectedIds.size === 0) return
        
        startTransition(async () => {
            const ids = Array.from(selectedIds)
            let successCount = 0
            
            for (const id of ids) {
                const result = await updateCandidateStatus(id, action)
                if (result.success) {
                    successCount++
                    setCandidates(prev => prev.map(c => 
                        c.id === id ? { ...c, status: action } : c
                    ))
                }
            }
            
            if (successCount > 0) {
                toast.success(`Updated ${successCount} candidate(s)`)
                setSelectedIds(new Set())
            }
        })
    }

    const filteredCandidates = candidates.filter(candidate => {
        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            if (!candidate.name.toLowerCase().includes(query) && 
                !candidate.email.toLowerCase().includes(query)) {
                return false
            }
        }
        if (selectedJob !== "all" && candidate.jobId !== selectedJob) {
            return false
        }
        if (selectedStatus !== "all" && candidate.status !== selectedStatus) {
            return false
        }
        return true
    })

    const handleViewCandidate = (candidate: Candidate) => {
        setSelectedCandidate(candidate)
        setIsDetailSheetOpen(true)
    }

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        }).format(new Date(date))
    }

    return (
        <div className="min-h-full p-6 lg:p-8">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-neutral-900 dark:text-white">
                        Candidates
                    </h1>
                    <p className="text-neutral-500 mt-1">
                        View and manage all candidate applications
                    </p>
                </div>
            </div>

            {/* Stats */}
            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-8">
                    <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                        <p className="text-2xl font-bold text-neutral-900 dark:text-white">{stats.total}</p>
                        <p className="text-xs text-neutral-500">Total</p>
                    </div>
                    <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                        <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">{stats.new}</p>
                        <p className="text-xs text-blue-600 dark:text-blue-500">New</p>
                    </div>
                    <div className="p-4 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                        <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">{stats.screening}</p>
                        <p className="text-xs text-yellow-600 dark:text-yellow-500">Screening</p>
                    </div>
                    <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                        <p className="text-2xl font-bold text-purple-700 dark:text-purple-400">{stats.interviewing}</p>
                        <p className="text-xs text-purple-600 dark:text-purple-500">Interviewing</p>
                    </div>
                    <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                        <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">{stats.offered}</p>
                        <p className="text-xs text-emerald-600 dark:text-emerald-500">Offered</p>
                    </div>
                    <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                        <p className="text-2xl font-bold text-green-700 dark:text-green-400">{stats.hired}</p>
                        <p className="text-xs text-green-600 dark:text-green-500">Hired</p>
                    </div>
                    <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                        <p className="text-2xl font-bold text-red-700 dark:text-red-400">{stats.rejected}</p>
                        <p className="text-xs text-red-600 dark:text-red-500">Rejected</p>
                    </div>
                    <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
                        <p className="text-2xl font-bold text-neutral-900 dark:text-white">{stats.thisWeek}</p>
                        <p className="text-xs text-neutral-500">This Week</p>
                    </div>
                </div>
            )}

            {/* Filters & View Toggle */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <Input
                        placeholder="Search by name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 rounded-xl bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800"
                    />
                </div>
                <Select value={selectedJob} onValueChange={setSelectedJob}>
                    <SelectTrigger className="w-[200px] rounded-xl">
                        <SelectValue placeholder="All Jobs" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Jobs</SelectItem>
                        {jobs.map(job => (
                            <SelectItem key={job.id} value={job.id}>
                                {job.title} ({job.applicationsCount})
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="w-[180px] rounded-xl">
                        <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        {Object.entries(statusLabels).map(([key, label]) => (
                            <SelectItem key={key} value={key}>
                                {label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {/* View Toggle */}
                <div className="flex items-center gap-1 p-1 rounded-xl bg-neutral-100 dark:bg-neutral-900">
                    <Button
                        variant={viewMode === "list" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setViewMode("list")}
                        className="rounded-lg"
                    >
                        <List className="w-4 h-4" />
                    </Button>
                    <Button
                        variant={viewMode === "kanban" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setViewMode("kanban")}
                        className="rounded-lg"
                    >
                        <Columns className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Bulk Actions Toolbar */}
            {selectedIds.size > 0 && viewMode === "list" && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-4 p-4 mb-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl"
                >
                    <span className="text-sm font-medium text-blue-700 dark:text-blue-400">
                        {selectedIds.size} selected
                    </span>
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleBulkAction("SHORTLISTED")}
                            disabled={isPending}
                            className="rounded-lg text-green-600 border-green-300 hover:bg-green-50"
                        >
                            <CheckCircle2 className="w-4 h-4 mr-1" />
                            Shortlist
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleBulkAction("REJECTED")}
                            disabled={isPending}
                            className="rounded-lg text-red-600 border-red-300 hover:bg-red-50"
                        >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                        </Button>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setSelectedIds(new Set())}
                            className="rounded-lg"
                        >
                            Clear
                        </Button>
                    </div>
                </motion.div>
            )}

            {/* Kanban View */}
            {viewMode === "kanban" && (
                <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6">
                    {kanbanColumns.map((column) => {
                        const columnCandidates = filteredCandidates.filter(c => c.status === column.key)
                        return (
                            <div 
                                key={column.key}
                                className={`flex-shrink-0 w-72 bg-neutral-50 dark:bg-neutral-900 rounded-xl border-t-4 ${column.color}`}
                            >
                                <div className="p-4 border-b border-neutral-200 dark:border-neutral-800">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-semibold text-neutral-900 dark:text-white">
                                            {column.label}
                                        </h3>
                                        <Badge variant="outline">{columnCandidates.length}</Badge>
                                    </div>
                                </div>
                                <div className="p-2 space-y-2 max-h-[600px] overflow-y-auto">
                                    {columnCandidates.map((candidate) => (
                                        <motion.div
                                            key={candidate.id}
                                            layout
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="bg-white dark:bg-neutral-950 rounded-lg p-3 border border-neutral-200 dark:border-neutral-800 cursor-pointer hover:shadow-md transition-shadow"
                                            onClick={() => handleViewCandidate(candidate)}
                                        >
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center overflow-hidden">
                                                    {candidate.image ? (
                                                        <img src={candidate.image} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-sm font-bold text-neutral-600 dark:text-neutral-400">
                                                            {candidate.name.charAt(0)}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-sm text-neutral-900 dark:text-white truncate">
                                                        {candidate.name}
                                                    </p>
                                                </div>
                                                {candidate.matchScore && (
                                                    <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs">
                                                        {candidate.matchScore}%
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-xs text-neutral-500 truncate mb-1">
                                                {candidate.jobTitle}
                                            </p>
                                            <p className="text-xs text-neutral-400">
                                                {formatDate(candidate.appliedAt)}
                                            </p>
                                        </motion.div>
                                    ))}
                                    {columnCandidates.length === 0 && (
                                        <div className="text-center py-8 text-neutral-400 text-sm">
                                            No candidates
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* List View */}
            {viewMode === "list" && (
            <AnimatePresence mode="popLayout">
                {filteredCandidates.length > 0 ? (
                    <div className="space-y-3">
                        {/* Select All Header */}
                        <div className="flex items-center gap-3 px-4 py-2">
                            <Checkbox
                                checked={selectedIds.size === filteredCandidates.length && filteredCandidates.length > 0}
                                onCheckedChange={selectAll}
                            />
                            <span className="text-sm text-neutral-500">Select all</span>
                        </div>
                        {filteredCandidates.map((candidate, index) => (
                            <motion.div
                                key={candidate.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: index * 0.02 }}
                                className="group bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 hover:shadow-lg hover:border-neutral-300 dark:hover:border-neutral-700 transition-all cursor-pointer"
                            >
                                <div className="flex items-center gap-4">
                                    {/* Checkbox */}
                                    <Checkbox
                                        checked={selectedIds.has(candidate.id)}
                                        onCheckedChange={() => toggleSelect(candidate.id)}
                                    />
                                    {/* Avatar */}
                                    <div 
                                        className="flex items-center gap-4 flex-1 min-w-0"
                                        onClick={() => handleViewCandidate(candidate)}
                                    >
                                        <div className="w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center overflow-hidden shrink-0">
                                            {candidate.image ? (
                                                <img src={candidate.image} alt={candidate.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-lg font-bold text-neutral-600 dark:text-neutral-400">
                                                    {candidate.name.charAt(0).toUpperCase()}
                                                </span>
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-semibold text-neutral-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                    {candidate.name}
                                                </h3>
                                                <Badge className={statusColors[candidate.status]}>
                                                    {statusLabels[candidate.status]}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-neutral-500 mt-1">
                                                <div className="flex items-center gap-1">
                                                    <Mail className="w-3.5 h-3.5" />
                                                    <span className="truncate">{candidate.email}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Briefcase className="w-3.5 h-3.5" />
                                                    <span>{candidate.jobTitle}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    <span>{formatDate(candidate.appliedAt)}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Match Score */}
                                        {candidate.matchScore && (
                                            <div className="text-center px-4">
                                                <div className="text-lg font-bold text-green-600 dark:text-green-400">
                                                    {candidate.matchScore}%
                                                </div>
                                                <div className="text-xs text-neutral-500">Match</div>
                                            </div>
                                        )}

                                        {/* Actions */}
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                <Button variant="ghost" size="icon" className="shrink-0 rounded-xl">
                                                    <MoreVertical className="w-4 h-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleViewCandidate(candidate); }}>
                                                    <Eye className="w-4 h-4 mr-2" />
                                                    View Profile
                                                </DropdownMenuItem>
                                                <DropdownMenuItem>
                                                    <MessageSquare className="w-4 h-4 mr-2" />
                                                    Send Message
                                                </DropdownMenuItem>
                                                <DropdownMenuItem>
                                                    <Calendar className="w-4 h-4 mr-2" />
                                                    Schedule Interview
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem>
                                                    <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />
                                                    Shortlist
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="text-red-600 dark:text-red-400">
                                                    <XCircle className="w-4 h-4 mr-2" />
                                                    Reject
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>

                                        <ChevronRight className="w-5 h-5 text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors shrink-0" />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-16"
                    >
                        <div className="w-20 h-20 rounded-2xl bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center mx-auto mb-6">
                            <Users className="w-10 h-10 text-neutral-400" />
                        </div>
                        <h3 className="font-bold text-xl text-neutral-900 dark:text-white mb-2">
                            {searchQuery || selectedJob !== "all" || selectedStatus !== "all" 
                                ? "No matching candidates" 
                                : "No candidates yet"}
                        </h3>
                        <p className="text-neutral-500 mb-6 max-w-md mx-auto">
                            {searchQuery || selectedJob !== "all" || selectedStatus !== "all"
                                ? "Try adjusting your filters to find candidates."
                                : "Candidates will appear here once they apply to your job listings."}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
            )}

            {/* Candidate Detail Sheet */}
            <Sheet open={isDetailSheetOpen} onOpenChange={setIsDetailSheetOpen}>
                <SheetContent className="w-full sm:max-w-2xl h-[95vh] overflow-y-auto p-0">
                    {selectedCandidate && (
                        <CandidateDetailSheet
                            candidate={selectedCandidate}
                            onClose={() => setIsDetailSheetOpen(false)}
                        />
                    )}
                </SheetContent>
            </Sheet>
        </div>
    )
}
