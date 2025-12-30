"use client"

import { motion } from "framer-motion"
import { Plus, Search, Filter, Briefcase, Building2, Users, TrendingUp, ExternalLink, Award } from "lucide-react"
import { Button } from "@repo/ui/components/ui/button"
import { Input } from "@repo/ui/components/ui/input"
import Link from "next/link"

export default function PlacementsPage() {
    // Mock data - replace with real data
    const universityJobs: Array<{
        id: string
        title: string
        company: string
        location: string
        type: string
        applications: number
        posted: string
        visibility: "public" | "university_only" | "filtered"
    }> = []

    return (
        <div className="min-h-full p-6 lg:p-8">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-neutral-900 dark:text-white">
                        Placements
                    </h1>
                    <p className="text-neutral-500 mt-1">
                        Manage job listings and company partnerships for your students.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="rounded-xl">
                        <Building2 className="w-4 h-4 mr-2" />
                        Refer Company
                    </Button>
                    <Button className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white">
                        <Plus className="w-4 h-4 mr-2" />
                        Post Exclusive Job
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
            >
                <div className="bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 rounded-2xl p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-violet-100 dark:bg-violet-900/50 flex items-center justify-center">
                            <Briefcase className="w-6 h-6 text-violet-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-violet-700 dark:text-violet-400">0</p>
                            <p className="text-sm text-violet-600/80">Active Jobs</p>
                        </div>
                    </div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                            <Building2 className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">0</p>
                            <p className="text-sm text-blue-600/80">Partner Companies</p>
                        </div>
                    </div>
                </div>
                <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                            <Users className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">0</p>
                            <p className="text-sm text-emerald-600/80">Applications</p>
                        </div>
                    </div>
                </div>
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
                            <Award className="w-6 h-6 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-amber-700 dark:text-amber-400">0</p>
                            <p className="text-sm text-amber-600/80">Placed Students</p>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <Input
                        placeholder="Search jobs or companies..."
                        className="pl-10 rounded-xl bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800"
                    />
                </div>
                <Button variant="outline" className="rounded-xl">
                    <Filter className="w-4 h-4 mr-2" />
                    Filters
                </Button>
            </div>

            {/* Tabs */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex flex-wrap gap-2 mb-6"
            >
                {["All Jobs", "University Only", "Public", "Companies"].map((tab, idx) => (
                    <button
                        key={tab}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer ${idx === 0
                                ? "bg-violet-600 text-white"
                                : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </motion.div>

            {/* Jobs List */}
            {universityJobs.length > 0 ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-4"
                >
                    {universityJobs.map((job) => (
                        <Link key={job.id} href={`/placements/${job.id}`}>
                            <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 hover:border-violet-300 dark:hover:border-violet-700 transition-all cursor-pointer">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="font-bold text-lg text-neutral-900 dark:text-white">
                                                {job.title}
                                            </h3>
                                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${job.visibility === "university_only"
                                                    ? "bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400"
                                                    : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
                                                }`}>
                                                {job.visibility === "university_only" ? "University Only" : "Public"}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap gap-4 text-sm text-neutral-500">
                                            <span className="flex items-center gap-1">
                                                <Building2 className="w-4 h-4" />
                                                {job.company}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Users className="w-4 h-4" />
                                                {job.applications} applications
                                            </span>
                                        </div>
                                    </div>
                                    <ExternalLink className="w-4 h-4 text-neutral-400" />
                                </div>
                            </div>
                        </Link>
                    ))}
                </motion.div>
            ) : (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-16 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl"
                >
                    <div className="w-20 h-20 rounded-2xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mx-auto mb-6">
                        <Briefcase className="w-10 h-10 text-violet-600" />
                    </div>
                    <h3 className="font-bold text-xl text-neutral-900 dark:text-white mb-2">
                        No placement activities yet
                    </h3>
                    <p className="text-neutral-500 mb-6 max-w-md mx-auto">
                        Refer companies to our hiring platform or post exclusive jobs for your students to kickstart placements.
                    </p>
                    <div className="flex justify-center gap-3">
                        <Button variant="outline" className="rounded-xl">
                            <Building2 className="w-4 h-4 mr-2" />
                            Refer a Company
                        </Button>
                        <Button className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white">
                            <Plus className="w-4 h-4 mr-2" />
                            Post Exclusive Job
                        </Button>
                    </div>
                </motion.div>
            )}

            {/* Partner Companies Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-8"
            >
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Partner Companies</h2>
                    <Button variant="ghost" size="sm" className="text-sm text-violet-600">
                        <TrendingUp className="w-4 h-4 mr-1" />
                        View Analytics
                    </Button>
                </div>
                <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 text-center">
                    <p className="text-neutral-500">
                        No partner companies yet. Refer companies to build your placement network.
                    </p>
                </div>
            </motion.div>
        </div>
    )
}
