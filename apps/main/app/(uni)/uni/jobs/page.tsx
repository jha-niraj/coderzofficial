"use client"

import { motion } from "framer-motion"
import { Briefcase, Search, MapPin, Clock, Building, ArrowRight, Filter, ExternalLink } from "lucide-react"
import { Button } from "@repo/ui/components/ui/button"
import { Input } from "@repo/ui/components/ui/input"
import Link from "next/link"

interface Job {
    id: string
    title: string
    company: string
    location: string
    postedAt: string
}

export default function UniJobsPage() {
    // Placeholder - will be replaced with real university jobs data
    const jobs: Job[] = []

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
                            <Briefcase className="w-5 h-5 text-violet-500" />
                            <span className="text-xs font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider">
                                University Jobs
                            </span>
                        </div>
                        <h1 className="text-2xl lg:text-3xl font-bold text-neutral-900 dark:text-white">
                            Exclusive Job Opportunities
                        </h1>
                        <p className="text-neutral-500 mt-1">
                            Jobs exclusively available for your university students
                        </p>
                    </div>
                    <Link href="/jobs">
                        <Button variant="outline" className="rounded-xl">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Browse All Jobs
                        </Button>
                    </Link>
                </div>
            </motion.div>

            {/* Search */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex flex-col sm:flex-row gap-4 mb-8"
            >
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <Input
                        placeholder="Search university jobs..."
                        className="pl-10 rounded-xl"
                    />
                </div>
                <Button variant="outline" className="rounded-xl">
                    <Filter className="w-4 h-4 mr-2" />
                    Filters
                </Button>
            </motion.div>

            {/* Coming Soon */}
            {jobs.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-center py-20"
                >
                    <div className="w-20 h-20 rounded-2xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mx-auto mb-6">
                        <Briefcase className="w-10 h-10 text-violet-500" />
                    </div>
                    <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
                        No Exclusive Jobs Yet
                    </h2>
                    <p className="text-neutral-500 mb-6 max-w-md mx-auto">
                        Your university hasn&apos;t posted any exclusive job opportunities yet. Check back soon or browse all available jobs.
                    </p>
                    <Link href="/jobs">
                        <Button className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white">
                            <Briefcase className="w-4 h-4 mr-2" />
                            Browse All Jobs
                        </Button>
                    </Link>
                </motion.div>
            ) : (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-4"
                >
                    {jobs.map((job) => (
                        <div
                            key={job.id}
                            className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 hover:border-violet-300 dark:hover:border-violet-700 transition-all cursor-pointer group"
                        >
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center">
                                    <Building className="w-6 h-6 text-neutral-400" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-neutral-900 dark:text-white group-hover:text-violet-600 transition-colors">
                                        {job.title}
                                    </h3>
                                    <p className="text-sm text-neutral-500">{job.company}</p>
                                    <div className="flex items-center gap-4 mt-2 text-xs text-neutral-500">
                                        <span className="flex items-center gap-1">
                                            <MapPin className="w-3 h-3" />
                                            {job.location}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {job.postedAt}
                                        </span>
                                    </div>
                                </div>
                                <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-violet-600 transition-colors" />
                            </div>
                        </div>
                    ))}
                </motion.div>
            )}

            {/* Info Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 mt-8"
            >
                <h3 className="font-bold text-neutral-900 dark:text-white mb-2">
                    What are University Jobs?
                </h3>
                <p className="text-sm text-neutral-500">
                    University jobs are exclusive opportunities posted by companies specifically for students of your university. 
                    These jobs often have priority placement and may have special requirements or benefits for university students.
                </p>
            </motion.div>
        </div>
    )
}
