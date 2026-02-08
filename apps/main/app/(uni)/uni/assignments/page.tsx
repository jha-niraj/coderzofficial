"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { 
    BookOpen, Search, Clock, Coins, CheckCircle2, AlertCircle,
    Filter, ArrowUpRight, Calendar, Tag
} from "lucide-react"
import { Button } from "@repo/ui/components/ui/button"
import { Input } from "@repo/ui/components/ui/input"
import Link from "next/link"
import { getStudentUniversityDashboard } from "@/actions/university/university.action"

interface AssignmentData {
    id: string
    title: string
    description: string | null
    type: string
    deadline: Date
    creditsRequired: number
    status?: "pending" | "submitted" | "graded"
    class?: {
        id: string
        name: string
        code: string
    }
}

const typeColors: Record<string, { bg: string; text: string }> = {
    project: { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-600 dark:text-blue-400" },
    quiz: { bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-600 dark:text-amber-400" },
    assignment: { bg: "bg-violet-100 dark:bg-violet-900/30", text: "text-violet-600 dark:text-violet-400" },
    exam: { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-600 dark:text-red-400" },
    lab: { bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-600 dark:text-green-400" },
}

export default function UniAssignmentsPage() {
    const [assignments, setAssignments] = useState<AssignmentData[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [filterType, setFilterType] = useState<string | null>(null)

    useEffect(() => {
        const fetchAssignments = async () => {
            try {
                const response = await getStudentUniversityDashboard()
                if (response.success && response.data) {
                    setAssignments(response.data.pendingAssignments || [])
                }
            } catch (error) {
                console.error("Error fetching assignments:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchAssignments()
    }, [])

    const filteredAssignments = assignments.filter((assignment) => {
        const matchesSearch =
            assignment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            assignment.description?.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesType = !filterType || assignment.type.toLowerCase() === filterType.toLowerCase()
        return matchesSearch && matchesType
    })

    const isOverdue = (deadline: Date) => new Date(deadline) < new Date()
    const isDueSoon = (deadline: Date) => {
        const diff = new Date(deadline).getTime() - new Date().getTime()
        return diff > 0 && diff < 3 * 24 * 60 * 60 * 1000 // 3 days
    }

    if (loading) {
        return (
            <div className="min-h-full p-6 lg:p-8">
                <div className="animate-pulse space-y-6">
                    <div className="h-8 bg-neutral-200 dark:bg-neutral-800 rounded-lg w-64" />
                    <div className="space-y-4">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-32 bg-neutral-200 dark:bg-neutral-800 rounded-2xl" />
                        ))}
                    </div>
                </div>
            </div>
        )
    }

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
                            <BookOpen className="w-5 h-5 text-violet-500" />
                            <span className="text-xs font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider">
                                Assignments
                            </span>
                        </div>
                        <h1 className="text-2xl lg:text-3xl font-bold text-neutral-900 dark:text-white">
                            My Assignments
                        </h1>
                        <p className="text-neutral-500 mt-1">
                            View and complete your pending assignments
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Stats */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
            >
                <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4">
                    <p className="text-2xl font-bold text-neutral-900 dark:text-white">{assignments.length}</p>
                    <p className="text-xs text-neutral-500">Total Pending</p>
                </div>
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                    <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                        {assignments.filter(a => isDueSoon(a.deadline)).length}
                    </p>
                    <p className="text-xs text-amber-600/70 dark:text-amber-400/70">Due Soon</p>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                        {assignments.filter(a => isOverdue(a.deadline)).length}
                    </p>
                    <p className="text-xs text-red-600/70 dark:text-red-400/70">Overdue</p>
                </div>
                <div className="bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 rounded-xl p-4">
                    <p className="text-2xl font-bold text-violet-600 dark:text-violet-400">
                        {assignments.reduce((sum, a) => sum + a.creditsRequired, 0)}
                    </p>
                    <p className="text-xs text-violet-600/70 dark:text-violet-400/70">Credits Needed</p>
                </div>
            </motion.div>

            {/* Search and Filter */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex flex-col sm:flex-row gap-4 mb-6"
            >
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search assignments..."
                        className="pl-10 rounded-xl"
                    />
                </div>
                <div className="flex gap-2">
                    <Button
                        variant={filterType === null ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFilterType(null)}
                        className="rounded-xl"
                    >
                        All
                    </Button>
                    {["project", "quiz", "assignment", "lab"].map(type => (
                        <Button
                            key={type}
                            variant={filterType === type ? "default" : "outline"}
                            size="sm"
                            onClick={() => setFilterType(type)}
                            className="rounded-xl capitalize"
                        >
                            {type}
                        </Button>
                    ))}
                </div>
            </motion.div>

            {/* Assignments List */}
            {filteredAssignments.length > 0 ? (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-4"
                >
                    {filteredAssignments.map((assignment, index) => {
                        const colors = typeColors[assignment.type.toLowerCase()] || typeColors.assignment
                        const overdue = isOverdue(assignment.deadline)
                        const dueSoon = isDueSoon(assignment.deadline)

                        return (
                            <motion.div
                                key={assignment.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.05 * index }}
                            >
                                <Link href={`/uni/assignments/${assignment.id}`}>
                                    <div className={`bg-white dark:bg-neutral-950 border rounded-2xl p-6 hover:border-violet-300 dark:hover:border-violet-700 transition-all cursor-pointer group ${
                                        overdue 
                                            ? "border-red-300 dark:border-red-700" 
                                            : dueSoon 
                                                ? "border-amber-300 dark:border-amber-700"
                                                : "border-neutral-200 dark:border-neutral-800"
                                    }`}>
                                        <div className="flex items-start gap-4">
                                            <div className={`p-3 rounded-xl ${colors.bg}`}>
                                                <BookOpen className={`w-5 h-5 ${colors.text}`} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div>
                                                        <h3 className="font-bold text-neutral-900 dark:text-white group-hover:text-violet-600 transition-colors">
                                                            {assignment.title}
                                                        </h3>
                                                        {assignment.description && (
                                                            <p className="text-sm text-neutral-500 mt-1 line-clamp-2">
                                                                {assignment.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <ArrowUpRight className="w-4 h-4 text-neutral-400 group-hover:text-violet-600 transition-colors flex-shrink-0" />
                                                </div>

                                                <div className="flex flex-wrap items-center gap-4 mt-4">
                                                    <span className={`text-[10px] px-2 py-1 rounded-full font-medium uppercase ${colors.bg} ${colors.text}`}>
                                                        {assignment.type}
                                                    </span>
                                                    <span className={`flex items-center gap-1 text-xs ${
                                                        overdue 
                                                            ? "text-red-600 dark:text-red-400" 
                                                            : dueSoon 
                                                                ? "text-amber-600 dark:text-amber-400"
                                                                : "text-neutral-500"
                                                    }`}>
                                                        {overdue ? (
                                                            <AlertCircle className="w-3 h-3" />
                                                        ) : (
                                                            <Calendar className="w-3 h-3" />
                                                        )}
                                                        {overdue ? "Overdue: " : dueSoon ? "Due Soon: " : "Due: "}
                                                        {new Date(assignment.deadline).toLocaleDateString()}
                                                    </span>
                                                    <span className="flex items-center gap-1 text-xs text-neutral-500">
                                                        <Coins className="w-3 h-3" />
                                                        {assignment.creditsRequired} credits
                                                    </span>
                                                    {assignment.class && (
                                                        <span className="flex items-center gap-1 text-xs text-neutral-500">
                                                            <Tag className="w-3 h-3" />
                                                            {assignment.class.code}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        )
                    })}
                </motion.div>
            ) : (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-center py-16"
                >
                    <div className="w-20 h-20 rounded-2xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="w-10 h-10 text-green-500" />
                    </div>
                    <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
                        {searchQuery || filterType ? "No Assignments Found" : "All Caught Up!"}
                    </h2>
                    <p className="text-neutral-500 mb-6 max-w-md mx-auto">
                        {searchQuery || filterType
                            ? "No assignments match your search or filter criteria."
                            : "You don't have any pending assignments. Great job!"}
                    </p>
                </motion.div>
            )}
        </div>
    )
}
