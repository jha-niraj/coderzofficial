"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Plus, Search, ListChecks, ChevronRight, Clock, Users, Mic,
    MoreVertical, Star, Edit2, Trash2, Copy, Eye, CheckCircle2, AlertCircle
} from "lucide-react"
import { Button } from "@repo/ui/components/ui/button"
import { Input } from "@repo/ui/components/ui/input"
import { Badge } from "@repo/ui/components/ui/badge"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@repo/ui/components/ui/dropdown-menu"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@repo/ui/components/ui/sheet"
import { InterviewProcessForm } from "./components/interview-process-form"
import { InterviewProcessDetail } from "./components/interview-process-detail"

interface InterviewRound {
    id: string
    roundNumber: number
    roundType: string
    title: string
    durationMinutes?: number | null
    format: string
    description: string
    hasMockInterview: boolean
}

interface InterviewProcess {
    id: string
    name: string
    description?: string | null
    isDefault: boolean
    isActive: boolean
    estimatedDurationWeeks?: number | null
    rounds: InterviewRound[]
    _count?: {
        jobs: number
    }
    createdAt: Date
}

interface Stats {
    processCount: number
    totalRounds: number
    jobsWithProcess: number
}

interface InterviewConfigContentProps {
    initialProcesses: InterviewProcess[]
    initialStats: Stats
}

const roundTypeColors: Record<string, string> = {
    PHONE_SCREEN: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    TECHNICAL_CODING: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    SYSTEM_DESIGN: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    BEHAVIORAL: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    TAKE_HOME: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    PANEL: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
    HIRING_MANAGER: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
    CULTURE_FIT: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400",
    HR_FINAL: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
    CUSTOM: "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-400",
}

export function InterviewConfigContent({ initialProcesses, initialStats }: InterviewConfigContentProps) {
    const [processes] = useState<InterviewProcess[]>(initialProcesses)
    const [stats] = useState<Stats>(initialStats)
    const [searchQuery, setSearchQuery] = useState("")
    const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false)
    const [selectedProcess, setSelectedProcess] = useState<InterviewProcess | null>(null)
    const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false)

    const filteredProcesses = processes.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const handleViewProcess = (process: InterviewProcess) => {
        setSelectedProcess(process)
        setIsDetailSheetOpen(true)
    }

    return (
        <div className="min-h-full p-6 lg:p-8">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-neutral-900 dark:text-white">
                        Interview Process
                    </h1>
                    <p className="text-neutral-500 mt-1">
                        Configure transparent interview processes for candidates
                    </p>
                </div>
                <Button 
                    onClick={() => setIsCreateSheetOpen(true)}
                    className="rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:text-black dark:hover:bg-neutral-200"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Process
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20 rounded-2xl p-6 border border-blue-200/50 dark:border-blue-800/30"
                >
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-xl bg-blue-500/10">
                            <ListChecks className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Processes</span>
                    </div>
                    <p className="text-3xl font-bold text-neutral-900 dark:text-white">{stats.processCount}</p>
                    <p className="text-sm text-neutral-500 mt-1">Active interview processes</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/30 dark:to-purple-900/20 rounded-2xl p-6 border border-purple-200/50 dark:border-purple-800/30"
                >
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-xl bg-purple-500/10">
                            <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <span className="text-sm font-medium text-purple-600 dark:text-purple-400">Rounds</span>
                    </div>
                    <p className="text-3xl font-bold text-neutral-900 dark:text-white">{stats.totalRounds}</p>
                    <p className="text-sm text-neutral-500 mt-1">Total interview rounds</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/30 dark:to-green-900/20 rounded-2xl p-6 border border-green-200/50 dark:border-green-800/30"
                >
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-xl bg-green-500/10">
                            <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <span className="text-sm font-medium text-green-600 dark:text-green-400">Jobs Linked</span>
                    </div>
                    <p className="text-3xl font-bold text-neutral-900 dark:text-white">{stats.jobsWithProcess}</p>
                    <p className="text-sm text-neutral-500 mt-1">Jobs with processes assigned</p>
                </motion.div>
            </div>

            {/* Warning Banner if no processes */}
            {processes.length === 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50"
                >
                    <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                        <div>
                            <h3 className="font-semibold text-amber-900 dark:text-amber-200">
                                No Interview Process Configured
                            </h3>
                            <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                                Configure your interview process to enable transparency for candidates. 
                                They&apos;ll see what to expect, and can practice with AI mock interviews.
                            </p>
                            <Button 
                                onClick={() => setIsCreateSheetOpen(true)}
                                className="mt-3 bg-amber-600 hover:bg-amber-700 text-white"
                                size="sm"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Create Your First Process
                            </Button>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Search */}
            {processes.length > 0 && (
                <div className="mb-6">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                        <Input
                            placeholder="Search processes..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 rounded-xl bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800"
                        />
                    </div>
                </div>
            )}

            {/* Processes List */}
            <AnimatePresence mode="popLayout">
                <div className="space-y-4">
                    {filteredProcesses.map((process, index) => (
                        <motion.div
                            key={process.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ delay: index * 0.05 }}
                            className="group bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 hover:shadow-lg hover:border-neutral-300 dark:hover:border-neutral-700 transition-all cursor-pointer"
                            onClick={() => handleViewProcess(process)}
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white truncate">
                                            {process.name}
                                        </h3>
                                        {process.isDefault && (
                                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                                                <Star className="w-3 h-3 mr-1" />
                                                Default
                                            </Badge>
                                        )}
                                        {!process.isActive && (
                                            <Badge variant="secondary" className="bg-neutral-100 text-neutral-500 dark:bg-neutral-800">
                                                Inactive
                                            </Badge>
                                        )}
                                    </div>
                                    {process.description && (
                                        <p className="text-sm text-neutral-500 mb-4 line-clamp-2">
                                            {process.description}
                                        </p>
                                    )}

                                    {/* Rounds Preview */}
                                    <div className="flex flex-wrap gap-2">
                                        {process.rounds.slice(0, 5).map((round) => (
                                            <div
                                                key={round.id}
                                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium ${roundTypeColors[round.roundType] || roundTypeColors.CUSTOM}`}
                                            >
                                                <span className="w-5 h-5 flex items-center justify-center rounded-full bg-white/50 dark:bg-black/20 text-[10px] font-bold">
                                                    {round.roundNumber}
                                                </span>
                                                <span className="truncate max-w-[120px]">{round.title}</span>
                                                {round.hasMockInterview && (
                                                    <Mic className="w-3 h-3 opacity-70" />
                                                )}
                                            </div>
                                        ))}
                                        {process.rounds.length > 5 && (
                                            <div className="flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                                                +{process.rounds.length - 5} more
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    {/* Meta Info */}
                                    <div className="hidden md:flex items-center gap-4 text-sm text-neutral-500">
                                        {process.estimatedDurationWeeks && (
                                            <div className="flex items-center gap-1.5">
                                                <Clock className="w-4 h-4" />
                                                <span>{process.estimatedDurationWeeks} weeks</span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-1.5">
                                            <Users className="w-4 h-4" />
                                            <span>{process._count?.jobs || 0} jobs</span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                            <Button variant="ghost" size="icon" className="rounded-xl">
                                                <MoreVertical className="w-4 h-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="rounded-xl">
                                            <DropdownMenuItem className="gap-2" onClick={(e) => { e.stopPropagation(); handleViewProcess(process); }}>
                                                <Eye className="w-4 h-4" />
                                                View Details
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="gap-2">
                                                <Edit2 className="w-4 h-4" />
                                                Edit Process
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="gap-2">
                                                <Copy className="w-4 h-4" />
                                                Duplicate
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem className="gap-2 text-red-600 dark:text-red-400">
                                                <Trash2 className="w-4 h-4" />
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>

                                    <ChevronRight className="w-5 h-5 text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors" />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </AnimatePresence>

            {/* Empty State */}
            {processes.length > 0 && filteredProcesses.length === 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12"
                >
                    <Search className="w-12 h-12 text-neutral-300 dark:text-neutral-700 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-2">
                        No processes found
                    </h3>
                    <p className="text-neutral-500">
                        Try adjusting your search query
                    </p>
                </motion.div>
            )}

            {/* Create Process Sheet */}
            <Sheet open={isCreateSheetOpen} onOpenChange={setIsCreateSheetOpen}>
                <SheetContent className="w-full sm:max-w-2xl h-[95vh] overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle>Create Interview Process</SheetTitle>
                        <SheetDescription>
                            Configure your interview process. Candidates will see this information
                            and can practice with AI mock interviews for each round.
                        </SheetDescription>
                    </SheetHeader>
                    <div className="mt-6">
                        <InterviewProcessForm onClose={() => setIsCreateSheetOpen(false)} />
                    </div>
                </SheetContent>
            </Sheet>

            {/* Process Detail Sheet */}
            <Sheet open={isDetailSheetOpen} onOpenChange={setIsDetailSheetOpen}>
                <SheetContent className="w-full sm:max-w-2xl h-[95vh] overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle>{selectedProcess?.name}</SheetTitle>
                        <SheetDescription>
                            View and manage this interview process
                        </SheetDescription>
                    </SheetHeader>
                    <div className="mt-6">
                        {selectedProcess && (
                            <InterviewProcessDetail 
                                process={selectedProcess} 
                                onClose={() => setIsDetailSheetOpen(false)} 
                            />
                        )}
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    )
}
