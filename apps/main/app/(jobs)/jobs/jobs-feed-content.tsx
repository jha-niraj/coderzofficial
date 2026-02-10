"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Search, Filter, MapPin, Clock, Briefcase, Building2, 
    ChevronRight, Mic, TrendingUp, Users, CheckCircle2, Sparkles,
    UserCheck, Bookmark, BookmarkCheck, ArrowRight, Target, Zap,
    Award, GraduationCap, AlertCircle, ExternalLink, BarChart3,
    ChevronDown, Loader2
} from "lucide-react"
import { Button } from "@repo/ui/components/ui/button"
import { Input } from "@repo/ui/components/ui/input"
import { Badge } from "@repo/ui/components/ui/badge"
import { 
    Tabs, TabsList, TabsTrigger 
} from "@repo/ui/components/ui/tabs"
import { 
    Tooltip, TooltipContent, TooltipProvider, TooltipTrigger 
} from "@repo/ui/components/ui/tooltip"
import {
    Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription
} from "@repo/ui/components/ui/sheet"
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from "@repo/ui/components/ui/dialog"
import Link from "next/link"
import Image from "next/image"
import { cn } from "@repo/ui/lib/utils"
import { 
    getFollowingFeedJobs, getForYouFeedJobs, getSavedFeedJobs,
    getShouldApplyScore, getSkillGapForJob, toggleSaveJob,
    type FeedJobResult, type ShouldApplyScore, type SkillGapAnalysis
} from "@/actions/jobs"
import { toast } from "@repo/ui/components/ui/sonner"

// Types
interface FeedStats {
    followedCompaniesCount: number
    followingJobsCount: number
    savedJobsCount: number
    appliedJobsCount: number
    userSkillsCount: number
}

interface JobsFeedContentProps {
    initialStats: FeedStats | null
    isAuthenticated: boolean
}

type FeedTab = "following" | "foryou" | "saved"

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

// Format helpers
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

// Get match score color
const getMatchScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30"
    if (score >= 70) return "text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30"
    return "text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30"
}

const getMatchScoreBadge = (score: number) => {
    if (score >= 90) return { label: "Perfect Match", icon: Target, color: "text-green-600 dark:text-green-400" }
    if (score >= 70) return { label: "Good Match", icon: Zap, color: "text-yellow-600 dark:text-yellow-400" }
    return { label: "Explore", icon: Sparkles, color: "text-orange-600 dark:text-orange-400" }
}

// ============================================
// JOB CARD COMPONENT
// ============================================
interface JobCardProps {
    job: FeedJobResult
    onSave: (jobId: string) => void
    onViewDetails: (job: FeedJobResult) => void
    showMatchScore?: boolean
    index?: number
}

function JobCard({ job, onSave, onViewDetails, showMatchScore = true, index = 0 }: JobCardProps) {
    const matchBadge = getMatchScoreBadge(job.matchScore)
    const MatchIcon = matchBadge.icon

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
            className="group bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 hover:shadow-xl hover:border-neutral-300 dark:hover:border-neutral-700 transition-all cursor-pointer relative overflow-hidden"
            onClick={() => onViewDetails(job)}
        >
            {/* Gradient accent based on match */}
            <div className={cn(
                "absolute top-0 left-0 right-0 h-1",
                job.matchScore >= 90 ? "bg-gradient-to-r from-green-500 to-emerald-500" :
                job.matchScore >= 70 ? "bg-gradient-to-r from-yellow-500 to-amber-500" :
                "bg-gradient-to-r from-orange-500 to-red-400"
            )} />

            <div className="flex items-start gap-4">
                {/* Company Logo */}
                <div className="w-14 h-14 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center overflow-hidden shrink-0 relative">
                    {job.company.logoUrl ? (
                        <Image
                            src={job.company.logoUrl}
                            alt={job.company.name}
                            className="object-cover"
                            fill
                        />
                    ) : (
                        <Building2 className="w-7 h-7 text-neutral-400" />
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                        <div>
                            <div className="flex items-center gap-2 mb-0.5">
                                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                                    {job.title}
                                </h3>
                                {job.isFollowingCompany && (
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-[10px] px-1.5 py-0">
                                                    <UserCheck className="w-3 h-3 mr-0.5" />
                                                    Following
                                                </Badge>
                                            </TooltipTrigger>
                                            <TooltipContent>You follow this company</TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                )}
                            </div>
                            <p className="text-neutral-500">{job.company.name}</p>
                        </div>

                        {/* Match Score & Save */}
                        <div className="flex items-center gap-2 shrink-0">
                            {showMatchScore && (
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <Badge className={cn("font-semibold", getMatchScoreColor(job.matchScore))}>
                                                <MatchIcon className="w-3.5 h-3.5 mr-1" />
                                                {job.matchScore}%
                                            </Badge>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <div className="text-sm">
                                                <p className="font-medium">{matchBadge.label}</p>
                                                <p className="text-neutral-400">Based on your skills</p>
                                            </div>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            )}
                            <Button
                                variant="ghost"
                                size="icon"
                                className={cn(
                                    "shrink-0 rounded-xl transition-all",
                                    job.isSaved 
                                        ? "text-yellow-500 hover:text-yellow-600" 
                                        : "opacity-0 group-hover:opacity-100"
                                )}
                                onClick={(e) => {
                                    e.stopPropagation()
                                    onSave(job.id)
                                }}
                            >
                                {job.isSaved ? <BookmarkCheck className="w-5 h-5 fill-current" /> : <Bookmark className="w-5 h-5" />}
                            </Button>
                        </div>
                    </div>

                    {/* Job Details */}
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

                    {/* Skills with match indication */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                        {job.matchedSkills.slice(0, 4).map((skill, i) => (
                            <Badge key={i} className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                {skill}
                            </Badge>
                        ))}
                        {job.missingSkills.slice(0, 2).map((skill, i) => (
                            <Badge key={i} variant="outline" className="text-xs text-neutral-500">
                                {skill}
                            </Badge>
                        ))}
                        {(job.matchedSkills.length + job.missingSkills.length) > 6 && (
                            <Badge variant="secondary" className="text-xs">
                                +{(job.matchedSkills.length + job.missingSkills.length) - 6}
                            </Badge>
                        )}
                    </div>

                    {/* Bottom row */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            {job.interviewProcess ? (
                                <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span>{job.interviewProcess.rounds.length} rounds</span>
                                    {job.interviewProcess.estimatedDurationWeeks && (
                                        <>
                                            <span className="text-neutral-300 dark:text-neutral-700">•</span>
                                            <span>~{job.interviewProcess.estimatedDurationWeeks}w</span>
                                        </>
                                    )}
                                    {job.interviewProcess.rounds.some(r => r.hasMockInterview) && (
                                        <>
                                            <span className="text-neutral-300 dark:text-neutral-700">•</span>
                                            <Mic className="w-4 h-4" />
                                            <span>Mock</span>
                                        </>
                                    )}
                                </div>
                            ) : (
                                <span className="text-sm text-neutral-400">Interview process not disclosed</span>
                            )}
                            {job.company.hasTransparentProcess && (
                                <Badge className="text-[10px] px-1.5 py-0 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                    Transparent
                                </Badge>
                            )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-neutral-400">
                            <Users className="w-4 h-4" />
                            <span>{job.applicationsCount}</span>
                        </div>
                    </div>
                </div>

                <ChevronRight className="w-5 h-5 text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors shrink-0 mt-6" />
            </div>

            {/* Applied indicator */}
            {job.hasApplied && (
                <div className="absolute bottom-0 left-0 right-0 bg-blue-50 dark:bg-blue-900/20 px-5 py-2 border-t border-blue-100 dark:border-blue-900/30">
                    <span className="text-sm text-blue-600 dark:text-blue-400 font-medium flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        You&apos;ve applied to this job
                    </span>
                </div>
            )}
        </motion.div>
    )
}

// ============================================
// SKILL GAP MODAL
// ============================================
interface SkillGapModalProps {
    job: FeedJobResult | null
    open: boolean
    onClose: () => void
}

function SkillGapModal({ job, open, onClose }: SkillGapModalProps) {
    const [loading, setLoading] = useState(false)
    const [data, setData] = useState<SkillGapAnalysis | null>(null)
    const [shouldApply, setShouldApply] = useState<ShouldApplyScore | null>(null)

    useEffect(() => {
        if (open && job) {
            setLoading(true)
            Promise.all([
                getSkillGapForJob(job.id),
                getShouldApplyScore(job.id)
            ]).then(([gapResult, applyResult]) => {
                if (gapResult.success && gapResult.data) {
                    setData(gapResult.data)
                }
                if (applyResult.success && applyResult.data) {
                    setShouldApply(applyResult.data)
                }
                setLoading(false)
            })
        }
    }, [open, job])

    if (!job) return null

    const getRecommendationColor = (rec: string) => {
        switch (rec) {
            case "HIGHLY_RECOMMENDED": return "text-green-600 bg-green-100 dark:bg-green-900/30"
            case "RECOMMENDED": return "text-blue-600 bg-blue-100 dark:bg-blue-900/30"
            case "CONSIDER": return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30"
            default: return "text-red-600 bg-red-100 dark:bg-red-900/30"
        }
    }

    const getRecommendationLabel = (rec: string) => {
        switch (rec) {
            case "HIGHLY_RECOMMENDED": return "Highly Recommended"
            case "RECOMMENDED": return "Recommended"
            case "CONSIDER": return "Consider Applying"
            default: return "May Not Be a Good Fit"
        }
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center overflow-hidden relative">
                            {job.company.logoUrl ? (
                                <Image src={job.company.logoUrl} alt={job.company.name} fill className="object-cover" />
                            ) : (
                                <Building2 className="w-5 h-5 text-neutral-400" />
                            )}
                        </div>
                        <div>
                            <span className="block">{job.title}</span>
                            <span className="text-sm font-normal text-neutral-500">{job.company.name}</span>
                        </div>
                    </DialogTitle>
                    <DialogDescription>
                        See how well you match and get personalized recommendations
                    </DialogDescription>
                </DialogHeader>

                {loading ? (
                    <div className="py-12 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
                    </div>
                ) : (
                    <div className="space-y-6 mt-4">
                        {/* Should Apply Score */}
                        {shouldApply && (
                            <div className="bg-gradient-to-br from-neutral-50 to-neutral-100/50 dark:from-neutral-900 dark:to-neutral-800/50 rounded-xl p-5 border border-neutral-200 dark:border-neutral-700">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
                                        <Target className="w-5 h-5" />
                                        Should You Apply?
                                    </h3>
                                    <Badge className={cn("text-sm px-3 py-1", getRecommendationColor(shouldApply.recommendation))}>
                                        {getRecommendationLabel(shouldApply.recommendation)}
                                    </Badge>
                                </div>

                                <div className="grid grid-cols-3 gap-4 mb-4">
                                    <div className="text-center p-3 bg-white dark:bg-neutral-800 rounded-lg">
                                        <div className="text-2xl font-bold text-neutral-900 dark:text-white">{shouldApply.score}%</div>
                                        <div className="text-xs text-neutral-500">Match Score</div>
                                    </div>
                                    <div className="text-center p-3 bg-white dark:bg-neutral-800 rounded-lg">
                                        <div className={cn(
                                            "text-2xl font-bold",
                                            shouldApply.competition.level === "LOW" ? "text-green-600" :
                                            shouldApply.competition.level === "HIGH" ? "text-red-600" : "text-yellow-600"
                                        )}>
                                            {shouldApply.competition.level}
                                        </div>
                                        <div className="text-xs text-neutral-500">Competition</div>
                                    </div>
                                    <div className="text-center p-3 bg-white dark:bg-neutral-800 rounded-lg">
                                        <div className="text-2xl font-bold text-neutral-900 dark:text-white">
                                            {shouldApply.competition.applicantsCount}
                                        </div>
                                        <div className="text-xs text-neutral-500">Applicants</div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    {shouldApply.reasons.map((reason, i) => (
                                        <div key={i} className="flex items-start gap-2 text-sm">
                                            <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                                            <span className="text-neutral-600 dark:text-neutral-300">{reason}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Skill Match */}
                        {data && (
                            <>
                                <div>
                                    <h3 className="font-semibold text-neutral-900 dark:text-white mb-3 flex items-center gap-2">
                                        <Award className="w-5 h-5 text-green-500" />
                                        Skills You Have ({data.matchedSkills.length})
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {data.matchedSkills.map((skill, i) => (
                                            <Badge key={i} className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                                {skill}
                                            </Badge>
                                        ))}
                                        {data.matchedSkills.length === 0 && (
                                            <p className="text-sm text-neutral-500">No matching skills found</p>
                                        )}
                                    </div>
                                </div>

                                {data.missingRequired.length > 0 && (
                                    <div>
                                        <h3 className="font-semibold text-neutral-900 dark:text-white mb-3 flex items-center gap-2">
                                            <AlertCircle className="w-5 h-5 text-orange-500" />
                                            Skills You Need ({data.missingRequired.length})
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {data.missingRequired.map((skill, i) => (
                                                <Badge key={i} variant="outline" className="text-orange-600 border-orange-300">
                                                    {skill}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {data.learningRecommendations.length > 0 && (
                                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50/50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-5 border border-blue-200 dark:border-blue-800">
                                        <h3 className="font-semibold text-neutral-900 dark:text-white mb-1 flex items-center gap-2">
                                            <GraduationCap className="w-5 h-5 text-blue-500" />
                                            Learn & Boost Your Match
                                        </h3>
                                        <p className="text-sm text-neutral-500 mb-4">
                                            Complete these projects to increase your match to {data.potentialMatchAfterLearning}%
                                        </p>
                                        
                                        <div className="space-y-3">
                                            {data.learningRecommendations.map((rec, i) => (
                                                <Link 
                                                    key={i}
                                                    href={`/projects/${rec.projectSlug}`}
                                                    className="flex items-center justify-between p-3 bg-white dark:bg-neutral-800 rounded-lg hover:shadow-md transition-all group"
                                                >
                                                    <div>
                                                        <div className="font-medium text-neutral-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                            {rec.projectTitle}
                                                        </div>
                                                        <div className="text-xs text-neutral-500">
                                                            Learn: <span className="text-blue-600">{rec.skill}</span> • ~{rec.estimatedHours}h
                                                        </div>
                                                    </div>
                                                    <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-blue-600 transition-colors" />
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}

                        {/* Actions */}
                        <div className="flex gap-3 pt-2">
                            <Link href={`/jobs/${job.slug}`} className="flex-1">
                                <Button className="w-full rounded-xl" size="lg">
                                    <ExternalLink className="w-4 h-4 mr-2" />
                                    View Full Details
                                </Button>
                            </Link>
                            <Button variant="outline" className="rounded-xl" size="lg" onClick={onClose}>
                                Close
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}

// ============================================
// EMPTY STATES
// ============================================
function FollowingEmptyState() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 px-4"
        >
            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Building2 className="w-10 h-10 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
                Follow companies you love
            </h3>
            <p className="text-neutral-500 max-w-md mx-auto mb-6">
                Follow companies you&apos;d love to work for and never miss a new opening. We&apos;ll show you jobs matched to your skills.
            </p>
            <Link href="/companies">
                <Button className="rounded-xl">
                    <Building2 className="w-4 h-4 mr-2" />
                    Discover Companies
                </Button>
            </Link>
        </motion.div>
    )
}

function SavedEmptyState() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 px-4"
        >
            <div className="w-20 h-20 bg-gradient-to-br from-yellow-100 to-amber-100 dark:from-yellow-900/30 dark:to-amber-900/30 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Bookmark className="w-10 h-10 text-yellow-600 dark:text-yellow-400" />
            </div>
            <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
                No saved jobs yet
            </h3>
            <p className="text-neutral-500 max-w-md mx-auto mb-6">
                Save jobs you&apos;re interested in to easily find them later. Click the bookmark icon on any job to save it.
            </p>
        </motion.div>
    )
}

function AuthRequiredState({ tab }: { tab: FeedTab }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 px-4"
        >
            <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <UserCheck className="w-10 h-10 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
                Sign in to see {tab === "following" ? "followed companies' jobs" : "your saved jobs"}
            </h3>
            <p className="text-neutral-500 max-w-md mx-auto mb-6">
                Create an account or sign in to get personalized job recommendations based on your skills and preferences.
            </p>
            <Link href="/signin">
                <Button className="rounded-xl">
                    Sign In
                </Button>
            </Link>
        </motion.div>
    )
}

// ============================================
// MAIN FEED COMPONENT
// ============================================
export function JobsFeedContent({ initialStats, isAuthenticated }: JobsFeedContentProps) {
    const [activeTab, setActiveTab] = useState<FeedTab>("foryou")
    const [searchQuery, setSearchQuery] = useState("")
    const [isFilterOpen, setIsFilterOpen] = useState(false)
    const [selectedJob, setSelectedJob] = useState<FeedJobResult | null>(null)
    const [isSkillGapOpen, setIsSkillGapOpen] = useState(false)

    // Feed states
    const [followingJobs, setFollowingJobs] = useState<FeedJobResult[]>([])
    const [forYouJobs, setForYouJobs] = useState<FeedJobResult[]>([])
    const [savedJobs, setSavedJobs] = useState<FeedJobResult[]>([])
    
    const [followingLoading, setFollowingLoading] = useState(false)
    const [forYouLoading, setForYouLoading] = useState(true)
    const [savedLoading, setSavedLoading] = useState(false)

    const [followingPagination, setFollowingPagination] = useState({ page: 1, total: 0, totalPages: 0 })
    const [forYouPagination, setForYouPagination] = useState({ page: 1, total: 0, totalPages: 0 })
    const [savedPagination, setSavedPagination] = useState({ page: 1, total: 0, totalPages: 0 })

    const [followingEmpty, setFollowingEmpty] = useState(false)
    const [stats] = useState<FeedStats | null>(initialStats)

    // Load For You feed on mount
    useEffect(() => {
        loadForYouJobs()
    }, [])

    // Load Following jobs when tab changes
    useEffect(() => {
        if (activeTab === "following" && followingJobs.length === 0 && !followingLoading) {
            loadFollowingJobs()
        }
        if (activeTab === "saved" && savedJobs.length === 0 && !savedLoading) {
            loadSavedJobs()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab])

    const loadFollowingJobs = async (page = 1) => {
        setFollowingLoading(true)
        const result = await getFollowingFeedJobs(page, 10)
        if (result.success && result.data) {
            if (result.data.isEmpty) {
                setFollowingEmpty(true)
            } else {
                setFollowingJobs(prev => page === 1 ? result.data!.jobs : [...prev, ...result.data!.jobs])
                setFollowingPagination({
                    page: result.data.pagination.page,
                    total: result.data.pagination.total,
                    totalPages: result.data.pagination.totalPages
                })
            }
        }
        setFollowingLoading(false)
    }

    const loadForYouJobs = async (page = 1) => {
        setForYouLoading(true)
        const result = await getForYouFeedJobs(page, 10)
        if (result.success && result.data) {
            setForYouJobs(prev => page === 1 ? result.data!.jobs : [...prev, ...result.data!.jobs])
            setForYouPagination({
                page: result.data.pagination.page,
                total: result.data.pagination.total,
                totalPages: result.data.pagination.totalPages
            })
        }
        setForYouLoading(false)
    }

    const loadSavedJobs = async (page = 1) => {
        setSavedLoading(true)
        const result = await getSavedFeedJobs(page, 10)
        if (result.success && result.data) {
            setSavedJobs(prev => page === 1 ? result.data!.jobs : [...prev, ...result.data!.jobs])
            setSavedPagination({
                page: result.data.pagination.page,
                total: result.data.pagination.total,
                totalPages: result.data.pagination.totalPages
            })
        }
        setSavedLoading(false)
    }

    const handleSaveJob = useCallback(async (jobId: string) => {
        const result = await toggleSaveJob(jobId)
        if (result.success) {
            // Update all job lists
            const updateJobs = (jobs: FeedJobResult[]) => 
                jobs.map(j => j.id === jobId ? { ...j, isSaved: result.saved ?? false } : j)
            
            setFollowingJobs(updateJobs)
            setForYouJobs(updateJobs)
            setSavedJobs(prev => result.saved ? prev : prev.filter(j => j.id !== jobId))
            
            toast.success(result.saved ? "Job saved!" : "Job removed from saved")
        }
    }, [])

    const handleViewDetails = useCallback((job: FeedJobResult) => {
        setSelectedJob(job)
        setIsSkillGapOpen(true)
    }, [])

    const currentJobs = activeTab === "following" ? followingJobs : activeTab === "saved" ? savedJobs : forYouJobs
    const currentLoading = activeTab === "following" ? followingLoading : activeTab === "saved" ? savedLoading : forYouLoading
    const currentPagination = activeTab === "following" ? followingPagination : activeTab === "saved" ? savedPagination : forYouPagination

    const loadMore = () => {
        if (activeTab === "following") loadFollowingJobs(followingPagination.page + 1)
        else if (activeTab === "saved") loadSavedJobs(savedPagination.page + 1)
        else loadForYouJobs(forYouPagination.page + 1)
    }

    return (
        <div className="min-h-full">
            {/* Header */}
            <div className="sticky top-0 z-20 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-xl border-b border-neutral-200 dark:border-neutral-800">
                <div className="p-6 lg:p-8 pb-0">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-2xl lg:text-3xl font-bold text-neutral-900 dark:text-white">
                                Jobs
                            </h1>
                            <p className="text-neutral-500 mt-1">
                                {stats ? (
                                    <>
                                        {stats.followedCompaniesCount} companies followed • {stats.savedJobsCount} saved
                                    </>
                                ) : (
                                    "Find your next opportunity"
                                )}
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Link href="/jobs/applications">
                                <Button variant="outline" className="rounded-xl">
                                    <BarChart3 className="w-4 h-4 mr-2" />
                                    Applications
                                </Button>
                            </Link>
                            <Link href="/companies">
                                <Button variant="outline" className="rounded-xl">
                                    <Building2 className="w-4 h-4 mr-2" />
                                    Companies
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Tabs */}
                    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as FeedTab)} className="w-full">
                        <TabsList className="w-full max-w-md bg-neutral-100 dark:bg-neutral-900 p-1 rounded-xl h-auto">
                            <TabsTrigger 
                                value="following" 
                                className="flex-1 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-800 data-[state=active]:shadow-sm py-2.5"
                            >
                                <UserCheck className="w-4 h-4 mr-2" />
                                Following
                                {stats && stats.followingJobsCount > 0 && (
                                    <Badge className="ml-2 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-xs">
                                        {stats.followingJobsCount}
                                    </Badge>
                                )}
                            </TabsTrigger>
                            <TabsTrigger 
                                value="foryou" 
                                className="flex-1 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-800 data-[state=active]:shadow-sm py-2.5"
                            >
                                <Sparkles className="w-4 h-4 mr-2" />
                                For You
                            </TabsTrigger>
                            <TabsTrigger 
                                value="saved" 
                                className="flex-1 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-neutral-800 data-[state=active]:shadow-sm py-2.5"
                            >
                                <Bookmark className="w-4 h-4 mr-2" />
                                Saved
                                {stats && stats.savedJobsCount > 0 && (
                                    <Badge className="ml-2 bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 text-xs">
                                        {stats.savedJobsCount}
                                    </Badge>
                                )}
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>
            </div>

            {/* Content */}
            <div className="p-6 lg:p-8">
                {/* Search & Filters */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
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

                {/* Tab Content */}
                <AnimatePresence mode="wait">
                    {/* Following Tab */}
                    {activeTab === "following" && (
                        <motion.div
                            key="following"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.2 }}
                        >
                            {!isAuthenticated ? (
                                <AuthRequiredState tab="following" />
                            ) : followingEmpty ? (
                                <FollowingEmptyState />
                            ) : followingLoading && followingJobs.length === 0 ? (
                                <div className="py-16 flex items-center justify-center">
                                    <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {followingJobs.map((job, index) => (
                                        <JobCard 
                                            key={job.id} 
                                            job={job} 
                                            onSave={handleSaveJob}
                                            onViewDetails={handleViewDetails}
                                            index={index}
                                        />
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* For You Tab */}
                    {activeTab === "foryou" && (
                        <motion.div
                            key="foryou"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.2 }}
                        >
                            {forYouLoading && forYouJobs.length === 0 ? (
                                <div className="py-16 flex items-center justify-center">
                                    <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {forYouJobs.map((job, index) => (
                                        <JobCard 
                                            key={job.id} 
                                            job={job} 
                                            onSave={handleSaveJob}
                                            onViewDetails={handleViewDetails}
                                            showMatchScore={isAuthenticated}
                                            index={index}
                                        />
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* Saved Tab */}
                    {activeTab === "saved" && (
                        <motion.div
                            key="saved"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.2 }}
                        >
                            {!isAuthenticated ? (
                                <AuthRequiredState tab="saved" />
                            ) : savedLoading && savedJobs.length === 0 ? (
                                <div className="py-16 flex items-center justify-center">
                                    <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
                                </div>
                            ) : savedJobs.length === 0 ? (
                                <SavedEmptyState />
                            ) : (
                                <div className="space-y-4">
                                    {savedJobs.map((job, index) => (
                                        <JobCard 
                                            key={job.id} 
                                            job={job} 
                                            onSave={handleSaveJob}
                                            onViewDetails={handleViewDetails}
                                            index={index}
                                        />
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Load More */}
                {currentJobs.length > 0 && currentPagination.page < currentPagination.totalPages && (
                    <div className="mt-8 text-center">
                        <Button 
                            variant="outline" 
                            className="rounded-xl"
                            onClick={loadMore}
                            disabled={currentLoading}
                        >
                            {currentLoading ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <ChevronDown className="w-4 h-4 mr-2" />
                            )}
                            Load More
                        </Button>
                    </div>
                )}

                {/* Job count */}
                {currentJobs.length > 0 && (
                    <p className="text-center text-sm text-neutral-500 mt-4">
                        Showing {currentJobs.length} of {currentPagination.total} jobs
                    </p>
                )}
            </div>

            {/* Skill Gap Modal */}
            <SkillGapModal 
                job={selectedJob}
                open={isSkillGapOpen}
                onClose={() => {
                    setIsSkillGapOpen(false)
                    setSelectedJob(null)
                }}
            />

            {/* Filter Sheet */}
            <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                <SheetContent className="w-full sm:max-w-md">
                    <SheetHeader>
                        <SheetTitle>Filter Jobs</SheetTitle>
                        <SheetDescription>
                            Narrow down your job search
                        </SheetDescription>
                    </SheetHeader>
                    <div className="mt-6 space-y-6">
                        <p className="text-neutral-500 text-sm">Filter controls coming soon...</p>
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    )
}
