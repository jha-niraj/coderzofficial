"use client"

import { motion } from "framer-motion"
import { Plus, Search, Filter, MoreVertical, Briefcase, MapPin, Clock, Users } from "lucide-react"
import { Button } from "@repo/ui/components/ui/button"
import { Input } from "@repo/ui/components/ui/input"
import Link from "next/link"

export default function JobsPage() {
    // Mock data - replace with real data
    const jobs: Array<{
        id: string
        title: string
        department: string
        location: string
        type: string
        applicants: number
        posted: string
        status: "active" | "paused" | "closed"
    }> = []

    return (
        <div className="min-h-full p-6 lg:p-8">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-neutral-900 dark:text-white">
                        Job Listings
                    </h1>
                    <p className="text-neutral-500 mt-1">
                        Manage and track all your open positions
                    </p>
                </div>
                <Link href="/jobs/new">
                    <Button className="rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:text-black dark:hover:bg-neutral-200">
                        <Plus className="w-4 h-4 mr-2" />
                        Create New Job
                    </Button>
                </Link>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <Input
                        placeholder="Search jobs..."
                        className="pl-10 rounded-xl bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800"
                    />
                </div>
                <Button variant="outline" className="rounded-xl">
                    <Filter className="w-4 h-4 mr-2" />
                    Filters
                </Button>
            </div>

            {/* Jobs List */}
            {jobs.length > 0 ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-4"
                >
                    {jobs.map((job) => (
                        <Link key={job.id} href={`/jobs/${job.id}`}>
                            <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all cursor-pointer">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="font-bold text-lg text-neutral-900 dark:text-white">
                                                {job.title}
                                            </h3>
                                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${job.status === "active" ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400" :
                                                    job.status === "paused" ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400" :
                                                        "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
                                                }`}>
                                                {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap gap-4 text-sm text-neutral-500">
                                            <span className="flex items-center gap-1">
                                                <Briefcase className="w-4 h-4" />
                                                {job.department}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <MapPin className="w-4 h-4" />
                                                {job.location}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-4 h-4" />
                                                {job.type}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Users className="w-4 h-4" />
                                                {job.applicants} applicants
                                            </span>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="icon">
                                        <MoreVertical className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </Link>
                    ))}
                </motion.div>
            ) : (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-16"
                >
                    <div className="w-20 h-20 rounded-2xl bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center mx-auto mb-6">
                        <Briefcase className="w-10 h-10 text-neutral-400" />
                    </div>
                    <h3 className="font-bold text-xl text-neutral-900 dark:text-white mb-2">
                        No jobs posted yet
                    </h3>
                    <p className="text-neutral-500 mb-6 max-w-md mx-auto">
                        Create your first job listing to start receiving applications from qualified candidates.
                    </p>
                    <Link href="/jobs/new">
                        <Button className="rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:text-black dark:hover:bg-neutral-200">
                            <Plus className="w-4 h-4 mr-2" />
                            Create Your First Job
                        </Button>
                    </Link>
                </motion.div>
            )}
        </div>
    )
}
