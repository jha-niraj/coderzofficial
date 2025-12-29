"use client"

import { motion } from "framer-motion"
import { Search, Filter, Users, Star, MoreVertical } from "lucide-react"
import { Button } from "@repo/ui/components/ui/button"
import { Input } from "@repo/ui/components/ui/input"

export default function CandidatesPage() {
    const candidates: Array<{
        id: string
        name: string
        email: string
        role: string
        status: string
        rating: number
        appliedDate: string
    }> = []

    return (
        <div className="min-h-full p-6 lg:p-8">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-neutral-900 dark:text-white">
                        Candidates
                    </h1>
                    <p className="text-neutral-500 mt-1">
                        View and manage all candidate profiles
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <Input
                        placeholder="Search candidates..."
                        className="pl-10 rounded-xl bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800"
                    />
                </div>
                <Button variant="outline" className="rounded-xl">
                    <Filter className="w-4 h-4 mr-2" />
                    Filters
                </Button>
            </div>

            {/* Candidates List */}
            {candidates.length > 0 ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                >
                    {candidates.map((candidate) => (
                        <div
                            key={candidate.id}
                            className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all cursor-pointer"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                                    <span className="text-lg font-bold text-neutral-600 dark:text-neutral-400">
                                        {candidate.name.charAt(0)}
                                    </span>
                                </div>
                                <Button variant="ghost" size="icon">
                                    <MoreVertical className="w-4 h-4" />
                                </Button>
                            </div>
                            <h3 className="font-bold text-neutral-900 dark:text-white">{candidate.name}</h3>
                            <p className="text-sm text-neutral-500 mb-4">{candidate.role}</p>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`w-4 h-4 ${i < candidate.rating ? "text-yellow-500 fill-yellow-500" : "text-neutral-300"}`}
                                        />
                                    ))}
                                </div>
                                <span className="text-xs text-neutral-500">{candidate.appliedDate}</span>
                            </div>
                        </div>
                    ))}
                </motion.div>
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
                        No candidates yet
                    </h3>
                    <p className="text-neutral-500 mb-6 max-w-md mx-auto">
                        Candidates will appear here once they apply to your job listings.
                    </p>
                </motion.div>
            )}
        </div>
    )
}
