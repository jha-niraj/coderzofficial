'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import {
    ArrowLeft, BookOpen, CheckCircle, Clock, DollarSign, ExternalLink,
    GitBranch, GitPullRequest, GraduationCap, Loader2, Plus, Star,
    Users, AlertCircle
} from 'lucide-react'
import { Button } from '@repo/ui/components/ui/button'
import {
    Card, CardContent
} from '@repo/ui/components/ui/card'
import { Badge } from '@repo/ui/components/ui/badge'
import {
    Tabs, TabsContent, TabsList, TabsTrigger
} from '@repo/ui/components/ui/tabs'
import {
    Avatar, AvatarFallback, AvatarImage
} from '@repo/ui/components/ui/avatar'
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@repo/ui/components/ui/select"
import {
    Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle
} from "@repo/ui/components/ui/dialog"
import { cn } from '@repo/ui/lib/utils'
import { useUserStore } from '@/app/store/useUserStore'
import {
    getProjectBySlug, getProjectIssues, claimIssue, getUserCertificationStatus,
    DIFFICULTY_LEVELS
} from '@/actions/(main)/opensource'
import { OSIssueDifficulty, OSIssueStatus } from '@repo/prisma/client'
import toast from '@repo/ui/components/ui/sonner'
import { formatDistanceToNow } from 'date-fns'

const typeColors: Record<string, { bg: string; text: string }> = {
    FREE: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400' },
    PAID: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400' },
    EXCLUSIVE: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-400' },
}

const difficultyColors: Record<string, { bg: string; text: string; dot: string }> = {
    GOOD_FIRST_ISSUE: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', dot: 'bg-green-500' },
    EASY: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-400', dot: 'bg-emerald-500' },
    MEDIUM: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400', dot: 'bg-yellow-500' },
    HARD: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', dot: 'bg-red-500' },
    EXPERT: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-400', dot: 'bg-purple-500' },
}

const statusColors: Record<string, { bg: string; text: string }> = {
    OPEN: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400' },
    ASSIGNED: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400' },
    IN_PROGRESS: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400' },
    REVIEW: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-400' },
    COMPLETED: { bg: 'bg-neutral-100 dark:bg-neutral-900/30', text: 'text-neutral-700 dark:text-neutral-400' },
}

interface Issue {
    id: string
    githubIssueNumber: number
    title: string
    description: string | null
    difficulty: string
    status: string
    bountyAmount: number
    estimatedHours: number
    labels: string[]
    createdAt: Date
    assignee: {
        id: string
        name: string | null
        username: string | null
        image: string | null
    } | null
}

interface Project {
    id: string
    title: string
    slug: string
    description: string
    longDescription: string | null
    type: 'FREE' | 'PAID' | 'EXCLUSIVE'
    status: string
    difficulty: string
    githubOwner: string
    githubRepo: string
    technologies: string[]
    totalBounty?: number
    openIssues?: number
    totalContributors?: number
    stars: number
    forks: number
    _count?: {
        contributors: number
        issues: number
    }
    maintainer: {
        id: string
        name: string | null
        username: string | null
        image: string | null
    } | null
    contributors?: Array<{
        user: {
            id: string
            name: string | null
            username: string | null
            image: string | null
        }
    }>
}

export default function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params)
    const { user } = useUserStore()
    const [project, setProject] = useState<Project | null>(null)
    const [issues, setIssues] = useState<Issue[]>([])
    const [loading, setLoading] = useState(true)
    const [issuesLoading, setIssuesLoading] = useState(true)
    const [selectedDifficulty, setSelectedDifficulty] = useState('ALL')
    const [selectedStatus, setSelectedStatus] = useState('OPEN')
    const [isCertified, setIsCertified] = useState(false)
    const [showCertDialog, setShowCertDialog] = useState(false)
    const [claimingIssue, setClaimingIssue] = useState<string | null>(null)

    // Fetch project
    useEffect(() => {
        async function fetchProject() {
            try {
                const result = await getProjectBySlug(slug)
                if (result.success && result.project) {
                    setProject(result.project as unknown as Project)
                }
            } catch (error) {
                console.error('Error fetching project:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchProject()
    }, [slug])

    // Fetch issues
    useEffect(() => {
        async function fetchIssues() {
            if (!project) return

            setIssuesLoading(true)
            try {
                const result = await getProjectIssues(project.id, {
                    difficulty: selectedDifficulty as OSIssueDifficulty | 'ALL',
                    status: selectedStatus as OSIssueStatus | 'ALL',
                })
                if (result.success && result.issues) {
                    setIssues(Array.isArray(result.issues) ? result.issues as Issue[] : [])
                }
            } catch (error) {
                console.error('Error fetching issues:', error)
            } finally {
                setIssuesLoading(false)
            }
        }

        fetchIssues()
    }, [project, selectedDifficulty, selectedStatus])

    // Check certification status
    useEffect(() => {
        async function checkCertification() {
            if (!user) return

            try {
                const result = await getUserCertificationStatus()
                if (result.success) {
                    setIsCertified(result.isCertified || false)
                }
            } catch (error) {
                console.error('Error checking certification:', error)
            }
        }

        checkCertification()
    }, [user])

    const handleClaimIssue = async (issueId: string) => {
        if (!user) {
            toast.error('Please sign in to claim issues')
            return
        }

        if (!isCertified) {
            setShowCertDialog(true)
            return
        }

        setClaimingIssue(issueId)
        try {
            const result = await claimIssue(issueId)
            if (result.success) {
                toast.success('Issue claimed! Check your contributions page.')
                // Refresh issues
                const refreshResult = await getProjectIssues(project!.id, {
                    difficulty: selectedDifficulty as OSIssueDifficulty | 'ALL',
                    status: selectedStatus as OSIssueStatus | 'ALL',
                })
                if (refreshResult.success && refreshResult.issues) {
                    setIssues(Array.isArray(refreshResult.issues) ? refreshResult.issues as Issue[] : [])
                }
            } else {
                toast.error(result.error || 'Failed to claim issue')
            }
        } catch (error) {
            toast.error('Failed to claim issue: ' + error)
        } finally {
            setClaimingIssue(null)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            </div>
        )
    }

    if (!project) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Card className="max-w-md">
                    <CardContent className="p-8 text-center">
                        <AlertCircle className="w-12 h-12 mx-auto mb-4 text-neutral-400" />
                        <h2 className="text-xl font-bold mb-2">Project Not Found</h2>
                        <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                            This project doesn&apos;t exist or has been removed.
                        </p>
                        <Link href="/opensource">
                            <Button>Browse Projects</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-100 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
            <div className="border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
                <div className="max-w-6xl mx-auto px-4 py-6">
                    <Link href="/opensource" className="inline-flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white mb-4">
                        <ArrowLeft className="w-4 h-4" />
                        Back to projects
                    </Link>
                    <div className="flex items-start justify-between gap-6">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
                                    {project.title}
                                </h1>
                                <Badge className={cn(typeColors[project.type]?.bg ?? 'bg-neutral-100', typeColors[project.type]?.text ?? 'text-neutral-700')}>
                                    {project.type}
                                </Badge>
                                {
                                    project.type === 'PAID' && (project.totalBounty ?? 0) > 0 && (
                                        <Badge className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
                                            <DollarSign className="w-3 h-3 mr-1" />
                                            ${project.totalBounty} total bounty
                                        </Badge>
                                    )
                                }
                            </div>
                            <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                                {project.description}
                            </p>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {
                                    (Array.isArray(project.technologies) ? project.technologies : []).map((tech) => (
                                        <Badge key={tech} variant="secondary" className="text-xs">
                                            {tech}
                                        </Badge>
                                    ))
                                }
                            </div>
                            <div className="flex items-center gap-6 text-sm">
                                <div className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-400">
                                    <GitPullRequest className="w-4 h-4" />
                                    <span>{project.openIssues} open issues</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-400">
                                    <Users className="w-4 h-4" />
                                    <span>{project.totalContributors} contributors</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-400">
                                    <Star className="w-4 h-4" />
                                    <span>{project.stars} stars</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-400">
                                    <GitBranch className="w-4 h-4" />
                                    <span>{project.forks} forks</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-4">
                            {
                                project.maintainer && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-neutral-500">Maintained by</span>
                                        <div className="flex items-center gap-2">
                                            <Avatar className="w-6 h-6">
                                                <AvatarImage src={project.maintainer.image || ''} />
                                                <AvatarFallback>{project.maintainer.name?.[0] || 'M'}</AvatarFallback>
                                            </Avatar>
                                            <span className="text-sm font-medium">{project.maintainer.name || project.maintainer.username}</span>
                                        </div>
                                    </div>
                                )
                            }
                            <div className="flex items-center gap-2">
                                <Link
                                    href={`https://github.com/${project.githubOwner}/${project.githubRepo}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <Button variant="outline" className="gap-2">
                                        <ExternalLink className="w-4 h-4" />
                                        View on GitHub
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="max-w-6xl mx-auto px-4 py-8">
                <Tabs defaultValue="issues" className="space-y-6">
                    <TabsList className="bg-neutral-100 dark:bg-neutral-800">
                        <TabsTrigger value="issues" className="gap-2">
                            <GitPullRequest className="w-4 h-4" />
                            Issues
                        </TabsTrigger>
                        <TabsTrigger value="contributors" className="gap-2">
                            <Users className="w-4 h-4" />
                            Contributors
                        </TabsTrigger>
                        <TabsTrigger value="about" className="gap-2">
                            <BookOpen className="w-4 h-4" />
                            About
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="issues" className="space-y-4">
                        <div className="flex items-center gap-3">
                            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                                <SelectTrigger className="w-[140px]">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">All Status</SelectItem>
                                    <SelectItem value="OPEN">🟢 Open</SelectItem>
                                    <SelectItem value="ASSIGNED">🔵 Assigned</SelectItem>
                                    <SelectItem value="IN_PROGRESS">🟡 In Progress</SelectItem>
                                    <SelectItem value="REVIEW">🟣 In Review</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                                <SelectTrigger className="w-[160px]">
                                    <SelectValue placeholder="Difficulty" />
                                </SelectTrigger>
                                <SelectContent>
                                    {
                                        DIFFICULTY_LEVELS.map((level) => (
                                            <SelectItem key={level.value} value={level.value}>
                                                {level.label}
                                            </SelectItem>
                                        ))
                                    }
                                </SelectContent>
                            </Select>
                        </div>
                        {
                            issuesLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="w-6 h-6 animate-spin text-green-600" />
                                </div>
                            ) : issues.length === 0 ? (
                                <Card className="border-dashed">
                                    <CardContent className="py-12 text-center">
                                        <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
                                        <h3 className="text-lg font-semibold mb-2">No open issues!</h3>
                                        <p className="text-neutral-600 dark:text-neutral-400">
                                            All issues have been claimed or completed. Check back later!
                                        </p>
                                    </CardContent>
                                </Card>
                            ) : (
                                <div className="space-y-3">
                                    {
                                        issues.map((issue) => {
                                            const diffColors = difficultyColors[issue.difficulty] || difficultyColors.MEDIUM
                                            const statColors = statusColors[issue.status] || statusColors.OPEN

                                            return (
                                                <Card key={issue.id} className="hover:shadow-md transition-shadow">
                                                    <CardContent className="p-4">
                                                        <div className="flex items-start justify-between gap-4">
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2 mb-2">
                                                                    <span className="text-sm text-neutral-500">
                                                                        #{issue.githubIssueNumber}
                                                                    </span>
                                                                    <h3 className="font-semibold text-neutral-900 dark:text-white">
                                                                        {issue.title}
                                                                    </h3>
                                                                </div>

                                                                {
                                                                    issue.description && (
                                                                        <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2 mb-3">
                                                                            {issue.description}
                                                                        </p>
                                                                    )
                                                                }

                                                                <div className="flex items-center gap-3 flex-wrap">
                                                                    <Badge className={cn(diffColors?.bg, diffColors?.text, "text-xs")}>
                                                                        <div className={cn("w-1.5 h-1.5 rounded-full mr-1.5", diffColors?.dot)} />
                                                                        {DIFFICULTY_LEVELS.find(d => d.value === issue.difficulty)?.label.split(' ').pop() || issue.difficulty}
                                                                    </Badge>
                                                                    <Badge className={cn(statColors?.bg, statColors?.text, "text-xs")}>
                                                                        {issue.status.replace('_', ' ')}
                                                                    </Badge>
                                                                    {
                                                                        issue.bountyAmount > 0 && (
                                                                            <Badge className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs">
                                                                                <DollarSign className="w-3 h-3 mr-1" />
                                                                                ${issue.bountyAmount}
                                                                            </Badge>
                                                                        )
                                                                    }
                                                                    <span className="text-xs text-neutral-500 flex items-center gap-1">
                                                                        <Clock className="w-3 h-3" />
                                                                        ~{issue.estimatedHours}h
                                                                    </span>
                                                                    <span className="text-xs text-neutral-500">
                                                                        {formatDistanceToNow(new Date(issue.createdAt), { addSuffix: true })}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                {
                                                                    issue.assignee ? (
                                                                        <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                                                            <Avatar className="w-5 h-5">
                                                                                <AvatarImage src={issue.assignee.image || ''} />
                                                                                <AvatarFallback>{issue.assignee.name?.[0] || 'U'}</AvatarFallback>
                                                                            </Avatar>
                                                                            <span className="text-xs text-blue-700 dark:text-blue-400">
                                                                                {issue.assignee.username || issue.assignee.name}
                                                                            </span>
                                                                        </div>
                                                                    ) : (
                                                                        <Button
                                                                            size="sm"
                                                                            onClick={() => handleClaimIssue(issue.id)}
                                                                            disabled={claimingIssue === issue.id}
                                                                            className="bg-green-600 hover:bg-green-700 text-white gap-1"
                                                                        >
                                                                            {
                                                                                claimingIssue === issue.id ? (
                                                                                    <Loader2 className="w-3 h-3 animate-spin" />
                                                                                ) : (
                                                                                    <Plus className="w-3 h-3" />
                                                                                )
                                                                            }
                                                                            Claim
                                                                        </Button>
                                                                    )
                                                                }
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            )
                                        })
                                    }
                                </div>
                            )
                        }
                    </TabsContent>
                    <TabsContent value="contributors">
                        <Card>
                            <CardContent className="py-12 text-center">
                                <Users className="w-12 h-12 mx-auto mb-4 text-neutral-400" />
                                <h3 className="text-lg font-semibold mb-2">Contributors</h3>
                                <p className="text-neutral-600 dark:text-neutral-400">
                                    Coming soon - View all project contributors and their contributions.
                                </p>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="about">
                        <Card>
                            <CardContent className="p-6">
                                <h3 className="text-lg font-semibold mb-4">About this Project</h3>
                                <div className="prose dark:prose-invert max-w-none">
                                    <p>{project.longDescription || project.description}</p>
                                </div>
                                <div className="mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-800">
                                    <h4 className="font-semibold mb-3">Getting Started</h4>
                                    <ol className="space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
                                        <li className="flex items-start gap-2">
                                            <span className="flex-shrink-0 w-5 h-5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full flex items-center justify-center text-xs font-medium">1</span>
                                            <span>Complete the <Link href="/opensource/learn" className="text-green-600 hover:underline">learning path</Link> and get certified</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="flex-shrink-0 w-5 h-5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full flex items-center justify-center text-xs font-medium">2</span>
                                            <span>Fork the repository on GitHub</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="flex-shrink-0 w-5 h-5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full flex items-center justify-center text-xs font-medium">3</span>
                                            <span>Claim an issue that matches your skill level</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="flex-shrink-0 w-5 h-5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full flex items-center justify-center text-xs font-medium">4</span>
                                            <span>Submit your PR and get it reviewed</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="flex-shrink-0 w-5 h-5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full flex items-center justify-center text-xs font-medium">5</span>
                                            <span>Get merged and earn your bounty!</span>
                                        </li>
                                    </ol>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
            <Dialog open={showCertDialog} onOpenChange={setShowCertDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <div className="flex justify-center mb-4">
                            <div className="p-4 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                                <GraduationCap className="w-12 h-12 text-purple-600 dark:text-purple-400" />
                            </div>
                        </div>
                        <DialogTitle className="text-xl text-center">
                            Certification Required
                        </DialogTitle>
                        <DialogDescription className="text-center">
                            You need to complete the learning path and pass the assessment before you can contribute to projects.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3 pt-4">
                        <Link href="/opensource/learn">
                            <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white gap-2">
                                <BookOpen className="w-4 h-4" />
                                Start Learning Path
                            </Button>
                        </Link>
                        <Button
                            variant="outline"
                            onClick={() => setShowCertDialog(false)}
                            className="w-full"
                        >
                            Maybe Later
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}