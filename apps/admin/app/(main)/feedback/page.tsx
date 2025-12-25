"use client"

import { useState, useEffect, useCallback } from "react"
import {
    MessageCircle, Search, ChevronLeft, ChevronRight, Loader2, Award, Trash2,
    CheckCircle, Clock, AlertCircle
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@repo/ui/lib/utils"
import {
    getAllFeedback, updateFeedbackStatus, assignReward, deleteFeedback
} from "@/actions/feedback.action"
import { toast } from "@repo/ui/components/ui/sonner"
import { Select, SelectItem } from "@repo/ui/components/ui/select"
import { Label } from "@repo/ui/components/ui/label"
import { Input } from "@repo/ui/components/ui/input"
import Image from "next/image"

interface Feedback {
    id: string
    title: string
    description: string
    category: string
    status: string
    isVerified: boolean
    upvotes: number
    imageUrl: string | null
    createdAt: Date | string
    user: {
        id: string
        name: string | null
        email: string
        image: string | null
    }
    rewards: {
        credits: number
        xp: number | null
    } | null
}

export default function FeedbackPage() {
    const [feedback, setFeedback] = useState<Feedback[]>([])
    const [totalFeedback, setTotalFeedback] = useState(0)
    const [totalPages, setTotalPages] = useState(0)
    const [isLoading, setIsLoading] = useState(true)

    const [searchQuery, setSearchQuery] = useState("")
    const [categoryFilter, setCategoryFilter] = useState<"all" | "BUG" | "FEATURE" | "UI" | "OTHER">("all")
    const [statusFilter, setStatusFilter] = useState<"all" | "UNDER_REVIEW" | "PLANNED" | "COMPLETED">("all")
    const [currentPage, setCurrentPage] = useState(1)
    const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null)
    const [showRewardDialog, setShowRewardDialog] = useState(false)
    const itemsPerPage = 20

    const fetchFeedback = useCallback(async() => {
        setIsLoading(true)
        try {
            const result = await getAllFeedback(
                {
                    search: searchQuery || undefined,
                    category: categoryFilter,
                    status: statusFilter,
                },
                {
                    page: currentPage,
                    limit: itemsPerPage,
                }
            )

            if (result.success && result.data) {
                setFeedback(result.data.feedback)
                setTotalFeedback(result.data.total)
                setTotalPages(result.data.pages)
            } else {
                toast.error(result.error || "Failed to fetch feedback")
            }
        } catch (error) {
            console.error("Failed to fetch feedback:", error)
            toast.error("Failed to fetch feedback")
        } finally {
            setIsLoading(false)
        }
    }, [categoryFilter, currentPage, statusFilter, searchQuery]);

    useEffect(() => {
        fetchFeedback()
    }, [currentPage, searchQuery, categoryFilter, statusFilter, fetchFeedback])

    useEffect(() => {
        const timer = setTimeout(() => {
            if (currentPage === 1) {
                fetchFeedback()
            } else {
                setCurrentPage(1)
            }
        }, 500)
        return () => clearTimeout(timer)
    }, [searchQuery, currentPage, fetchFeedback])

    useEffect(() => {
        if (currentPage !== 1) {
            setCurrentPage(1)
        }
    }, [categoryFilter, statusFilter, currentPage])

    const handleStatusChange = useCallback(async(feedbackId: string, newStatus: "UNDER_REVIEW" | "PLANNED" | "COMPLETED") => {
        try {
            const result = await updateFeedbackStatus(feedbackId, newStatus)
            if (result.success) {
                toast.success("Status updated successfully")
                fetchFeedback()
            } else {
                toast.error(result.error || "Failed to update status")
            }
        } catch (error) {
            console.log("Error Occurred while updating status: " + error);
            toast.error("Failed to update status")
        }
    }, [fetchFeedback]);

    const handleAssignReward = useCallback(async(feedbackId: string, credits: number, xp: number) => {
        try {
            const result = await assignReward(feedbackId, credits, xp)
            if (result.success) {
                toast.success("Reward assigned successfully")
                setShowRewardDialog(false)
                setSelectedFeedback(null)
                fetchFeedback()
            } else {
                toast.error(result.error || "Failed to assign reward")
            }
        } catch (error) {
            console.log("Error Occurred while assigning reward: " + error);
            toast.error("Failed to assign reward")
        }
    }, [fetchFeedback]);

    const handleDelete = useCallback(async(feedbackId: string) => {
        if (!confirm("Are you sure you want to delete this feedback?")) return

        try {
            const result = await deleteFeedback(feedbackId)
            if (result.success) {
                toast.success("Feedback deleted successfully")
                fetchFeedback()
            } else {
                toast.error(result.error || "Failed to delete feedback")
            }
        } catch (error) {
            console.log("Error Occurred while deleting Feedback: " + error);
            toast.error("Failed to delete feedback")
        }
    }, [fetchFeedback]);

    const getCategoryColor = (category: string) => {
        switch (category) {
            case "BUG": return "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"
            case "FEATURE": return "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
            case "UI": return "bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400"
            default: return "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-400"
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "COMPLETED": return <CheckCircle className="w-4 h-4 text-emerald-500" />
            case "PLANNED": return <Clock className="w-4 h-4 text-blue-500" />
            default: return <AlertCircle className="w-4 h-4 text-amber-500" />
        }
    }

    if (isLoading && feedback.length === 0) {
        return (
            <div className="p-6 lg:p-8 max-w-7xl mx-auto flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-neutral-400 mx-auto mb-4" />
                    <p className="text-neutral-500 dark:text-neutral-400">Loading feedback...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-3">
                        <MessageCircle className="w-7 h-7" />
                        Feedback Management
                    </h1>
                    <p className="text-neutral-500 dark:text-neutral-400 mt-1">
                        Review and respond to user feedback
                    </p>
                </div>
            </div>
            <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                        <Input
                            type="text"
                            placeholder="Search feedback..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                        />
                    </div>
                    <Select
                        value={categoryFilter}
                        onValueChange={(value) => setCategoryFilter(value)}
                    >
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="BUG">Bug</SelectItem>
                        <SelectItem value="FEATURE">Feature</SelectItem>
                        <SelectItem value="UI">UI/UX</SelectItem>
                        <SelectItem value="OTHER">Other</SelectItem>
                    </Select>
                    <Select
                        value={statusFilter}
                        onValueChange={(value) => setStatusFilter(value)}
                    >
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
                        <SelectItem value="PLANNED">Planned</SelectItem>
                        <SelectItem value="COMPLETED">Completed</SelectItem>
                    </Select>
                </div>
            </div>
            <div className="space-y-4">
                {
                    isLoading ? (
                        <div className="text-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-neutral-400 mx-auto" />
                        </div>
                    ) : feedback.length === 0 ? (
                        <div className="text-center py-12 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800">
                            <MessageCircle className="w-12 h-12 text-neutral-300 dark:text-neutral-600 mx-auto mb-4" />
                            <p className="text-neutral-500 dark:text-neutral-400">No feedback found</p>
                        </div>
                    ) : (
                        feedback.map((item) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all"
                            >
                                <div className="flex items-start gap-4">
                                    {
                                        item.user.image ? (
                                            <Image
                                                src={item.user.image}
                                                alt={item.user.name || item.user.email}
                                                className="w-10 h-10 rounded-full border border-neutral-200 dark:border-neutral-800"
                                                height={32}
                                                width={32}
                                            />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neutral-200 to-neutral-300 dark:from-neutral-700 dark:to-neutral-600 flex items-center justify-center flex-shrink-0">
                                                <span className="text-sm font-bold text-neutral-600 dark:text-neutral-300">
                                                    {item.user.name?.[0]?.toUpperCase() || item.user.email?.[0]?.toUpperCase() || ''}
                                                </span>
                                            </div>
                                        )
                                    }
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-4 mb-2">
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-neutral-900 dark:text-white mb-1">
                                                    {item.title}
                                                </h3>
                                                <p className="text-sm text-neutral-500 dark:text-neutral-400 line-clamp-2">
                                                    {item.description}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {getStatusIcon(item.status)}
                                                <span className={cn(
                                                    "px-2.5 py-1 rounded-full text-xs font-medium",
                                                    getCategoryColor(item.category)
                                                )}>
                                                    {item.category}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-neutral-500 dark:text-neutral-400 mb-4">
                                            <span>{item.user.name || item.user.email}</span>
                                            <span>•</span>
                                            <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                                            <span>•</span>
                                            <span className="flex items-center gap-1">
                                                <Award className="w-4 h-4" />
                                                {item.upvotes} upvotes
                                            </span>
                                            {
                                                item.isVerified && (
                                                    <>
                                                        <span>•</span>
                                                        <span className="text-emerald-500 flex items-center gap-1">
                                                            <CheckCircle className="w-4 h-4" />
                                                            Verified
                                                        </span>
                                                    </>
                                                )
                                            }
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Select
                                                value={item.status}
                                                onValueChange={(value) => handleStatusChange(item.id, value)}
                                            >
                                                <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
                                                <SelectItem value="PLANNED">Planned</SelectItem>
                                                <SelectItem value="COMPLETED">Completed</SelectItem>
                                            </Select>

                                            {
                                                !item.rewards && (
                                                    <button
                                                        onClick={() => {
                                                            setSelectedFeedback(item)
                                                            setShowRewardDialog(true)
                                                        }}
                                                        className="px-3 py-1.5 text-sm font-medium text-white bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg hover:from-emerald-600 hover:to-green-600 transition-colors flex items-center gap-2"
                                                    >
                                                        <Award className="w-4 h-4" />
                                                        Assign Reward
                                                    </button>
                                                )
                                            }
                                            {
                                                item.rewards && (
                                                    <span className="px-3 py-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg flex items-center gap-2">
                                                        <Award className="w-4 h-4" />
                                                        {item.rewards.credits} credits{item.rewards.xp && `, ${item.rewards.xp} XP`}
                                                    </span>
                                                )
                                            }
                                            <button
                                                onClick={() => handleDelete(item.id)}
                                                className="ml-auto p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )
                }
            </div>
            {
                totalPages > 1 && (
                    <div className="flex items-center justify-between mt-6 p-4 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800">
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalFeedback)} of {totalFeedback} items
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <span className="text-sm text-neutral-600 dark:text-neutral-400 px-3">
                                Page {currentPage} of {totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )
            }
            <AnimatePresence>
                {
                    showRewardDialog && selectedFeedback && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                            onClick={() => setShowRewardDialog(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.95, opacity: 0 }}
                                onClick={(e) => e.stopPropagation()}
                                className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 max-w-md w-full"
                            >
                                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
                                    Assign Reward
                                </h3>
                                <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
                                    {selectedFeedback.title}
                                </p>
                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault()
                                        const formData = new FormData(e.currentTarget)
                                        const credits = Number(formData.get("credits"))
                                        const xp = Number(formData.get("xp"))
                                        handleAssignReward(selectedFeedback.id, credits, xp)
                                    }}
                                    className="space-y-4"
                                >
                                    <div>
                                        <Label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                                            Credits
                                        </Label>
                                        <Input
                                            type="number"
                                            name="credits"
                                            required
                                            min="0"
                                            defaultValue="100"
                                            className="w-full px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/20"
                                        />
                                    </div>
                                    <div>
                                        <Label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                                            XP (Optional)
                                        </Label>
                                        <Input
                                            type="number"
                                            name="xp"
                                            min="0"
                                            defaultValue="50"
                                            className="w-full px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/20"
                                        />
                                    </div>
                                    <div className="flex items-center gap-3 pt-4">
                                        <button
                                            type="button"
                                            onClick={() => setShowRewardDialog(false)}
                                            className="flex-1 px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-orange-500 rounded-lg hover:from-red-600 hover:to-orange-600 transition-colors"
                                        >
                                            Assign
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        </motion.div>
                    )
                }
            </AnimatePresence>
        </div>
    )
}