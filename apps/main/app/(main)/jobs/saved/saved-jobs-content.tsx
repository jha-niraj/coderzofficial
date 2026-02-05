"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    ArrowLeft, Heart, Building2, MapPin, Clock, Briefcase,
    ChevronRight, TrendingUp, Trash2, Calendar
} from "lucide-react"
import { Button } from "@repo/ui/components/ui/button"
import { Badge } from "@repo/ui/components/ui/badge"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { unsaveJob } from "@/actions/jobs"
import Image from "next/image"

interface SavedJob {
    id: string
    title: string
    slug: string
    company: {
        id: string
        name: string
        logoUrl: string | null
        industry: string | null
    }
    location: string | null
    locationType: string
    employmentType: string
    experienceMin: number | null
    experienceMax: number | null
    salaryMin: number | null
    salaryMax: number | null
    salaryCurrency: string
    salaryDisclosed: boolean
    skillsRequired: string[]
    savedAt: Date
    notes: string | null
}

interface SavedJobsContentProps {
    savedJobs: SavedJob[]
}

const locationTypeLabels: Record<string, string> = {
    REMOTE: "Remote",
    HYBRID: "Hybrid",
    ONSITE: "On-site"
}

const employmentTypeLabels: Record<string, string> = {
    FULL_TIME: "Full-time",
    PART_TIME: "Part-time",
    CONTRACT: "Contract",
    INTERNSHIP: "Internship",
    FREELANCE: "Freelance"
}

export function SavedJobsContent({ savedJobs: initialSavedJobs }: SavedJobsContentProps) {
    const router = useRouter()
    const [savedJobs, setSavedJobs] = useState(initialSavedJobs)
    const [removingId, setRemovingId] = useState<string | null>(null)

    const formatSalary = (min: number | null, max: number | null, currency: string) => {
        if (!min && !max) return null
        const formatter = new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: currency,
            maximumFractionDigits: 0
        })
        if (min && max) return `${formatter.format(min)} - ${formatter.format(max)}`
        if (min) return `From ${formatter.format(min)}`
        if (max) return `Up to ${formatter.format(max)}`
        return null
    }

    const formatExperience = (min: number | null, max: number | null) => {
        if (!min && !max) return null
        if (min && max) return `${min}-${max} years`
        if (min) return `${min}+ years`
        if (max) return `Up to ${max} years`
        return null
    }

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        }).format(new Date(date))
    }

    const handleRemove = async (jobId: string) => {
        setRemovingId(jobId)
        try {
            await unsaveJob(jobId)
            setSavedJobs(prev => prev.filter(job => job.id !== jobId))
        } catch (error) {
            console.error("Error removing job:", error)
        } finally {
            setRemovingId(null)
        }
    }

    return (
        <div className="min-h-full p-6 lg:p-8">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.back()}
                    className="rounded-xl"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-neutral-900 dark:text-white flex items-center gap-3">
                        <Heart className="w-7 h-7 text-red-500 fill-red-500" />
                        Saved Jobs
                    </h1>
                    <p className="text-neutral-500 mt-1">
                        {savedJobs.length} job{savedJobs.length !== 1 ? 's' : ''} saved
                    </p>
                </div>
            </div>

            {/* Jobs List */}
            <AnimatePresence mode="popLayout">
                {savedJobs.length > 0 ? (
                    <div className="space-y-4">
                        {savedJobs.map((job, index) => (
                            <motion.div
                                key={job.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -100 }}
                                transition={{ delay: index * 0.03 }}
                                className="group bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 hover:shadow-lg hover:border-neutral-300 dark:hover:border-neutral-700 transition-all"
                            >
                                <div className="flex items-start gap-4">
                                    {/* Company Logo */}
                                    <Link href={`/jobs/${job.slug}`}>
                                        <div className="w-14 h-14 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center overflow-hidden shrink-0">
                                            {job.company.logoUrl ? (
                                                <Image
                                                    src={job.company.logoUrl}
                                                    alt={job.company.name}
                                                    className="w-full h-full object-cover"
                                                    height={32}
                                                    width={32}
                                                />
                                            ) : (
                                                <Building2 className="w-7 h-7 text-neutral-400" />
                                            )}
                                        </div>
                                    </Link>

                                    {/* Job Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-4 mb-2">
                                            <Link href={`/jobs/${job.slug}`} className="flex-1">
                                                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                    {job.title}
                                                </h3>
                                                <p className="text-neutral-500">{job.company.name}</p>
                                            </Link>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="shrink-0 rounded-xl text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                onClick={() => handleRemove(job.id)}
                                                disabled={removingId === job.id}
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </Button>
                                        </div>

                                        {/* Meta Info */}
                                        <div className="flex flex-wrap items-center gap-3 text-sm text-neutral-500 mb-3">
                                            <div className="flex items-center gap-1">
                                                <MapPin className="w-4 h-4" />
                                                <span>{job.location || locationTypeLabels[job.locationType]}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Briefcase className="w-4 h-4" />
                                                <span>{employmentTypeLabels[job.employmentType]}</span>
                                            </div>
                                            {formatExperience(job.experienceMin, job.experienceMax) && (
                                                <div className="flex items-center gap-1">
                                                    <Clock className="w-4 h-4" />
                                                    <span>{formatExperience(job.experienceMin, job.experienceMax)}</span>
                                                </div>
                                            )}
                                            {job.salaryDisclosed && formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency) && (
                                                <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                                                    <TrendingUp className="w-4 h-4" />
                                                    <span>{formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Skills */}
                                        <div className="flex flex-wrap gap-2 mb-3">
                                            {job.skillsRequired.slice(0, 5).map((skill, i) => (
                                                <Badge key={i} variant="secondary" className="text-xs">
                                                    {skill}
                                                </Badge>
                                            ))}
                                            {job.skillsRequired.length > 5 && (
                                                <Badge variant="secondary" className="text-xs">
                                                    +{job.skillsRequired.length - 5}
                                                </Badge>
                                            )}
                                        </div>

                                        {/* Saved Date */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-xs text-neutral-400">
                                                <Calendar className="w-3.5 h-3.5" />
                                                <span>Saved on {formatDate(job.savedAt)}</span>
                                            </div>
                                            <Link href={`/jobs/${job.slug}`}>
                                                <Button variant="outline" size="sm" className="rounded-xl gap-1">
                                                    View Details
                                                    <ChevronRight className="w-4 h-4" />
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-16"
                    >
                        <Heart className="w-16 h-16 text-neutral-300 dark:text-neutral-700 mx-auto mb-4" />
                        <h3 className="text-xl font-medium text-neutral-900 dark:text-white mb-2">
                            No saved jobs yet
                        </h3>
                        <p className="text-neutral-500 max-w-md mx-auto mb-6">
                            Browse jobs and save the ones you&apos;re interested in to keep track of them here.
                        </p>
                        <Link href="/jobs">
                            <Button className="rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:text-black dark:hover:bg-neutral-200">
                                Browse Jobs
                            </Button>
                        </Link>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
