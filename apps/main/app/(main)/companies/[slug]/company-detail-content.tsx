"use client"

import { motion } from "framer-motion"
import {
    ArrowLeft, Building2, MapPin, Users, Globe, ExternalLink, Briefcase,
    CheckCircle2, Mic, ChevronRight, Calendar, Phone, Code, Layout,
    MessageSquare, FileText, Star, Play, Award, Clock
} from "lucide-react"
import { Button } from "@repo/ui/components/ui/button"
import { Badge } from "@repo/ui/components/ui/badge"
import { Separator } from "@repo/ui/components/ui/separator"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface Company {
    id: string
    name: string
    slug: string
    logoUrl: string | null
    website: string | null
    industry: string | null
    companySize: string | null
    description: string | null
    verificationStatus: string
    headquarters: string | null
    foundedYear: number | null
    linkedIn: string | null
    twitter: string | null
    techStack: string[]
    benefits: string[]
}

interface InterviewProcess {
    id: string
    name: string
    description: string | null
    estimatedDurationWeeks: number | null
    isDefault: boolean
    rounds: Array<{
        id: string
        roundNumber: number
        title: string
        roundType: string
        description: string | null
        duration: number | null
        format: string | null
        hasMockInterview: boolean
        tipsForCandidates: string | null
    }>
}

interface Job {
    id: string
    title: string
    slug: string
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
    applicationsCount: number
    publishedAt: Date | null
}

interface CompanyDetailContentProps {
    company: Company
    interviewProcesses: InterviewProcess[]
    jobs: Job[]
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

const roundTypeIcons: Record<string, React.ElementType> = {
    PHONE_SCREEN: Phone,
    TECHNICAL_CODING: Code,
    SYSTEM_DESIGN: Layout,
    BEHAVIORAL: MessageSquare,
    TAKE_HOME: FileText,
    PANEL: Users,
    HIRING_MANAGER: Star,
    CULTURE_FIT: Users,
    HR_FINAL: Users,
    CUSTOM: FileText,
}

const roundTypeColors: Record<string, string> = {
    PHONE_SCREEN: "bg-blue-500",
    TECHNICAL_CODING: "bg-purple-500",
    SYSTEM_DESIGN: "bg-orange-500",
    BEHAVIORAL: "bg-green-500",
    TAKE_HOME: "bg-yellow-500",
    PANEL: "bg-pink-500",
    HIRING_MANAGER: "bg-indigo-500",
    CULTURE_FIT: "bg-teal-500",
    HR_FINAL: "bg-cyan-500",
    CUSTOM: "bg-neutral-500",
}

export function CompanyDetailContent({ company, interviewProcesses, jobs }: CompanyDetailContentProps) {
    const router = useRouter()

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

    const defaultProcess = interviewProcesses.find(p => p.isDefault) || interviewProcesses[0]

    return (
        <div className="min-h-full">
            {/* Header */}
            <div className="sticky top-0 z-20 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-xl border-b border-neutral-200 dark:border-neutral-800">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.back()}
                        className="gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Companies
                    </Button>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Company Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row items-start gap-6 mb-8"
                >
                    <div className="w-24 h-24 rounded-2xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center overflow-hidden shrink-0">
                        {company.logoUrl ? (
                            <img src={company.logoUrl} alt={company.name} className="w-full h-full object-cover" />
                        ) : (
                            <Building2 className="w-12 h-12 text-neutral-400" />
                        )}
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-2xl lg:text-3xl font-bold text-neutral-900 dark:text-white">
                                {company.name}
                            </h1>
                            {company.verificationStatus === "VERIFIED" && (
                                <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                                    Verified
                                </Badge>
                            )}
                        </div>
                        {company.description && (
                            <p className="text-neutral-600 dark:text-neutral-400 mb-4 max-w-2xl">
                                {company.description}
                            </p>
                        )}
                        <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-500">
                            {company.industry && (
                                <Badge variant="secondary">{company.industry}</Badge>
                            )}
                            {company.headquarters && (
                                <div className="flex items-center gap-1">
                                    <MapPin className="w-4 h-4" />
                                    <span>{company.headquarters}</span>
                                </div>
                            )}
                            {company.companySize && (
                                <div className="flex items-center gap-1">
                                    <Users className="w-4 h-4" />
                                    <span>{company.companySize} employees</span>
                                </div>
                            )}
                            {company.foundedYear && (
                                <div className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    <span>Founded {company.foundedYear}</span>
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-3 mt-4">
                            {company.website && (
                                <a
                                    href={company.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                                >
                                    <Globe className="w-4 h-4" />
                                    Website
                                    <ExternalLink className="w-3 h-3" />
                                </a>
                            )}
                            {company.linkedIn && (
                                <a
                                    href={company.linkedIn}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                                >
                                    LinkedIn
                                    <ExternalLink className="w-3 h-3" />
                                </a>
                            )}
                        </div>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Interview Process */}
                        {defaultProcess && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800"
                            >
                                <div className="flex items-center gap-2 mb-4">
                                    <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
                                    <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                                        Interview Process
                                    </h2>
                                    <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                        Transparent
                                    </Badge>
                                </div>

                                {defaultProcess.description && (
                                    <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                                        {defaultProcess.description}
                                    </p>
                                )}

                                {defaultProcess.estimatedDurationWeeks && (
                                    <div className="flex items-center gap-2 text-sm text-neutral-500 mb-6">
                                        <Clock className="w-4 h-4" />
                                        <span>Typically takes {defaultProcess.estimatedDurationWeeks} week(s)</span>
                                    </div>
                                )}

                                <div className="relative pl-10 space-y-4">
                                    <div className="absolute left-4 top-3 bottom-3 w-0.5 bg-gradient-to-b from-green-500 via-blue-500 to-purple-500" />

                                    {defaultProcess.rounds.map((round, index) => {
                                        const IconComponent = roundTypeIcons[round.roundType] ?? FileText
                                        const roundColor = roundTypeColors[round.roundType] ?? "bg-neutral-500"
                                        return (
                                            <motion.div
                                                key={round.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.2 + index * 0.1 }}
                                                className="relative flex items-start gap-4"
                                            >
                                                <div className={`absolute -left-6 w-8 h-8 rounded-full ${roundColor} flex items-center justify-center shadow-lg`}>
                                                    <IconComponent className="w-4 h-4 text-white" />
                                                </div>

                                                <div className="flex-1 p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <span className="text-xs text-neutral-500">Round {round.roundNumber}</span>
                                                            <h4 className="font-medium text-neutral-900 dark:text-white">
                                                                {round.title}
                                                            </h4>
                                                            {round.duration && (
                                                                <span className="text-xs text-neutral-500">{round.duration} min</span>
                                                            )}
                                                        </div>
                                                        {round.hasMockInterview && (
                                                            <Button size="sm" variant="outline" className="rounded-lg gap-1.5">
                                                                <Mic className="w-3.5 h-3.5" />
                                                                Practice
                                                            </Button>
                                                        )}
                                                    </div>
                                                    {round.description && (
                                                        <p className="text-sm text-neutral-500 mt-2">{round.description}</p>
                                                    )}
                                                </div>
                                            </motion.div>
                                        )
                                    })}
                                </div>

                                <div className="mt-6 p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shrink-0">
                                            <Mic className="w-5 h-5 text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-neutral-900 dark:text-white mb-1">
                                                Practice with AI Mock Interviews
                                            </h4>
                                            <p className="text-sm text-neutral-500 mb-3">
                                                Prepare for {company.name}&apos;s interviews with company-specific mock sessions
                                            </p>
                                            <Button className="rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:text-black dark:hover:bg-neutral-200">
                                                <Play className="w-4 h-4 mr-2" />
                                                Start Practice
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Tech Stack */}
                        {company.techStack && company.techStack.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
                                    <Code className="w-5 h-5 text-purple-500" />
                                    Tech Stack
                                </h2>
                                <div className="flex flex-wrap gap-2">
                                    {company.techStack.map((tech, i) => (
                                        <Badge key={i} variant="secondary" className="px-3 py-1.5">
                                            {tech}
                                        </Badge>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* Benefits */}
                        {company.benefits && company.benefits.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
                                    <Award className="w-5 h-5 text-green-500" />
                                    Benefits & Perks
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {company.benefits.map((benefit, i) => (
                                        <div 
                                            key={i}
                                            className="flex items-center gap-3 p-3 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300"
                                        >
                                            <CheckCircle2 className="w-4 h-4 shrink-0" />
                                            <span className="text-sm">{benefit}</span>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Open Positions */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
                                    <Briefcase className="w-5 h-5 text-blue-500" />
                                    Open Positions
                                </h3>
                                <Badge variant="secondary">{jobs.length}</Badge>
                            </div>

                            {jobs.length > 0 ? (
                                <div className="space-y-3">
                                    {jobs.slice(0, 5).map((job) => (
                                        <Link
                                            key={job.id}
                                            href={`/jobs/${job.slug}`}
                                            className="block p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors group"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-medium text-neutral-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                        {job.title}
                                                    </h4>
                                                    <div className="flex items-center gap-2 text-xs text-neutral-500 mt-1">
                                                        <span>{locationTypeLabels[job.locationType]}</span>
                                                        <span>•</span>
                                                        <span>{employmentTypeLabels[job.employmentType]}</span>
                                                    </div>
                                                </div>
                                                <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-neutral-300 shrink-0" />
                                            </div>
                                        </Link>
                                    ))}
                                    {jobs.length > 5 && (
                                        <Link
                                            href={`/jobs?company=${company.slug}`}
                                            className="block text-center text-sm text-blue-600 dark:text-blue-400 hover:underline mt-2"
                                        >
                                            View all {jobs.length} positions
                                        </Link>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-6">
                                    <Briefcase className="w-10 h-10 text-neutral-300 dark:text-neutral-700 mx-auto mb-2" />
                                    <p className="text-sm text-neutral-500">
                                        No open positions at the moment
                                    </p>
                                </div>
                            )}
                        </motion.div>

                        {/* Quick Stats */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800"
                        >
                            <h3 className="font-semibold text-neutral-900 dark:text-white mb-4">
                                Quick Info
                            </h3>
                            <div className="space-y-3">
                                {company.industry && (
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-neutral-500">Industry</span>
                                        <span className="font-medium text-neutral-900 dark:text-white">{company.industry}</span>
                                    </div>
                                )}
                                {company.companySize && (
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-neutral-500">Company Size</span>
                                        <span className="font-medium text-neutral-900 dark:text-white">{company.companySize}</span>
                                    </div>
                                )}
                                {company.foundedYear && (
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-neutral-500">Founded</span>
                                        <span className="font-medium text-neutral-900 dark:text-white">{company.foundedYear}</span>
                                    </div>
                                )}
                                {company.headquarters && (
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-neutral-500">Headquarters</span>
                                        <span className="font-medium text-neutral-900 dark:text-white">{company.headquarters}</span>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    )
}
