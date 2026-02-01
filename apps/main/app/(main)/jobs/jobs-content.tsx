"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Search, Filter, MapPin, Clock, Briefcase, Building2, ChevronRight,
    Mic, Star, Heart, ExternalLink, TrendingUp, Users, CheckCircle2,
    X
} from "lucide-react"
import { Button } from "@repo/ui/components/ui/button"
import { Input } from "@repo/ui/components/ui/input"
import { Badge } from "@repo/ui/components/ui/badge"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@repo/ui/components/ui/sheet"
import Link from "next/link"

interface Job {
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
    hasAssignment: boolean
    applicationsCount: number
    publishedAt: Date | null
    interviewProcess: {
        id: string
        name: string
        rounds: Array<{
            id: string
            roundNumber: number
            title: string
            roundType: string
            hasMockInterview: boolean
        }>
    } | null
    matchScore?: number
}

interface Company {
    id: string
    name: string
    slug: string
    logoUrl: string | null
    industry: string | null
    activeJobsCount: number
    hasTransparentProcess: boolean
}

interface Pagination {
    page: number
    limit: number
    total: number
    totalPages: number
}

interface JobsContentProps {
    initialJobs: Job[]
    initialPagination: Pagination
    recommendedJobs: Job[]
    featuredCompanies: Company[]
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

export function JobsContent({
    initialJobs,
    initialPagination,
    recommendedJobs,
    featuredCompanies
}: JobsContentProps) {
    const [jobs] = useState<Job[]>(initialJobs)
    const [searchQuery, setSearchQuery] = useState("")
    const [isFilterOpen, setIsFilterOpen] = useState(false)

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

    return (
        <div className="min-h-full p-6 lg:p-8">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-neutral-900 dark:text-white">
                        Find Your Next Role
                    </h1>
                    <p className="text-neutral-500 mt-1">
                        Discover jobs with transparent interview processes
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Link href="/jobs/applications">
                        <Button variant="outline" className="rounded-xl">
                            My Applications
                        </Button>
                    </Link>
                    <Link href="/jobs/saved">
                        <Button variant="outline" className="rounded-xl">
                            <Heart className="w-4 h-4 mr-2" />
                            Saved
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Search & Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <Input
                        placeholder="Search jobs, companies, or skills..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 rounded-xl bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800"
                    />
                </div>
                <Button 
                    variant="outline" 
                    className="rounded-xl"
                    onClick={() => setIsFilterOpen(true)}
                >
                    <Filter className="w-4 h-4 mr-2" />
                    Filters
                </Button>
            </div>

            {/* Recommended Jobs */}
            {recommendedJobs.length > 0 && (
                <div className="mb-10">
                    <div className="flex items-center gap-2 mb-4">
                        <Star className="w-5 h-5 text-yellow-500" />
                        <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                            Recommended for You
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {recommendedJobs.slice(0, 3).map((job, index) => (
                            <Link
                                key={job.id}
                                href={`/jobs/${job.slug}`}
                            >
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="group bg-gradient-to-br from-neutral-50 to-neutral-100/50 dark:from-neutral-900 dark:to-neutral-800/50 rounded-2xl p-5 border border-neutral-200 dark:border-neutral-700 hover:shadow-lg transition-all cursor-pointer h-full"
                                >
                                <div className="flex items-start gap-3 mb-3">
                                    <div className="w-12 h-12 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center overflow-hidden">
                                        {job.company.logoUrl ? (
                                            <img src={job.company.logoUrl} alt={job.company.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <Building2 className="w-6 h-6 text-neutral-400" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-neutral-900 dark:text-white truncate">
                                            {job.title}
                                        </h3>
                                        <p className="text-sm text-neutral-500 truncate">{job.company.name}</p>
                                    </div>
                                    {job.matchScore && (
                                        <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                            {job.matchScore}% match
                                        </Badge>
                                    )}
                                </div>

                                <div className="flex flex-wrap gap-2 mb-3">
                                    <Badge variant="secondary" className="text-xs">
                                        {locationTypeLabels[job.locationType]}
                                    </Badge>
                                    <Badge variant="secondary" className="text-xs">
                                        {employmentTypeLabels[job.employmentType]}
                                    </Badge>
                                </div>

                                {job.interviewProcess && (
                                    <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                        <span>{job.interviewProcess.rounds.length} rounds transparent</span>
                                        {job.interviewProcess.rounds.some(r => r.hasMockInterview) && (
                                            <>
                                                <span>•</span>
                                                <Mic className="w-3.5 h-3.5" />
                                                <span>Mock available</span>
                                            </>
                                        )}
                                    </div>
                                )}
                            </motion.div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Featured Companies */}
            {featuredCompanies.length > 0 && (
                <div className="mb-10">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                            Featured Companies
                        </h2>
                        <Link href="/companies" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                            View all
                        </Link>
                    </div>
                    <div className="flex gap-4 overflow-x-auto pb-2 -mx-2 px-2">
                        {featuredCompanies.map((company) => (
                            <Link
                                key={company.id}
                                href={`/companies/${company.slug}`}
                                className="flex-shrink-0 w-48 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 hover:shadow-lg transition-all"
                            >
                                <div className="w-12 h-12 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-3 overflow-hidden">
                                    {company.logoUrl ? (
                                        <img src={company.logoUrl} alt={company.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <Building2 className="w-6 h-6 text-neutral-400" />
                                    )}
                                </div>
                                <h3 className="font-medium text-neutral-900 dark:text-white truncate">
                                    {company.name}
                                </h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs text-neutral-500">
                                        {company.activeJobsCount} jobs
                                    </span>
                                    {company.hasTransparentProcess && (
                                        <Badge className="text-[10px] px-1.5 py-0 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                            Transparent
                                        </Badge>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* All Jobs */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                        All Jobs
                    </h2>
                    <span className="text-sm text-neutral-500">
                        {initialPagination.total} jobs found
                    </span>
                </div>

                <AnimatePresence mode="popLayout">
                    <div className="space-y-4">
                        {jobs.map((job, index) => (
                            <Link key={job.id} href={`/jobs/${job.slug}`}>
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ delay: index * 0.03 }}
                                    className="group bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 hover:shadow-lg hover:border-neutral-300 dark:hover:border-neutral-700 transition-all cursor-pointer"
                                >
                                <div className="flex items-start gap-4">
                                    {/* Company Logo */}
                                    <div className="w-14 h-14 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center overflow-hidden shrink-0">
                                        {job.company.logoUrl ? (
                                            <img src={job.company.logoUrl} alt={job.company.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <Building2 className="w-7 h-7 text-neutral-400" />
                                        )}
                                    </div>

                                    {/* Job Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-4 mb-2">
                                            <div>
                                                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                    {job.title}
                                                </h3>
                                                <p className="text-neutral-500">{job.company.name}</p>
                                            </div>
                                            <Button variant="ghost" size="icon" className="shrink-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Heart className="w-5 h-5" />
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

                                        {/* Interview Process Info */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                {job.interviewProcess ? (
                                                    <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                                                        <CheckCircle2 className="w-4 h-4" />
                                                        <span>{job.interviewProcess.rounds.length} rounds</span>
                                                        {job.interviewProcess.rounds.some(r => r.hasMockInterview) && (
                                                            <>
                                                                <span className="text-neutral-300 dark:text-neutral-700">•</span>
                                                                <Mic className="w-4 h-4" />
                                                                <span>Mock Interview</span>
                                                            </>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-neutral-400">Interview process not disclosed</span>
                                                )}
                                                {job.hasAssignment && (
                                                    <Badge variant="outline" className="text-xs">
                                                        Has Assignment
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-neutral-400">
                                                <Users className="w-4 h-4" />
                                                <span>{job.applicationsCount} applicants</span>
                                            </div>
                                        </div>
                                    </div>

                                    <ChevronRight className="w-5 h-5 text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors shrink-0 mt-6" />
                                </div>
                            </motion.div>
                            </Link>
                        ))}
                    </div>
                </AnimatePresence>

                {/* Empty State */}
                {jobs.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-16"
                    >
                        <Briefcase className="w-16 h-16 text-neutral-300 dark:text-neutral-700 mx-auto mb-4" />
                        <h3 className="text-xl font-medium text-neutral-900 dark:text-white mb-2">
                            No jobs found
                        </h3>
                        <p className="text-neutral-500 max-w-md mx-auto">
                            Try adjusting your filters or check back later for new opportunities.
                        </p>
                    </motion.div>
                )}
            </div>

            {/* Filters Sheet */}
            <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                <SheetContent className="w-full sm:max-w-md">
                    <SheetHeader>
                        <SheetTitle>Filter Jobs</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6 space-y-6">
                        {/* Add filter controls here */}
                        <p className="text-neutral-500 text-sm">Filter controls coming soon...</p>
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    )
}
