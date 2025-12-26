'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
    ArrowLeft, CheckCircle, Code, DollarSign, ExternalLink, GitBranch, GitMerge,
    GitPullRequest, Loader2, Rocket, Star, Target, Trophy, Zap, AlertCircle, Eye
} from 'lucide-react'
import { Button } from '@repo/ui/components/ui/button'
import {
    Card, CardContent, CardHeader, CardTitle
} from '@repo/ui/components/ui/card'
import { Badge } from '@repo/ui/components/ui/badge'
import {
    Tabs, TabsList, TabsTrigger
} from '@repo/ui/components/ui/tabs'
import { cn } from '@repo/ui/lib/utils'
import { useUserStore } from '@/app/store/useUserStore'
import {
    getUserContributions, getUserContributionStats, getUserCertificationStatus
} from '@/actions/(main)/opensource'
import { formatDistanceToNow } from 'date-fns'
import type { LucideIcon } from 'lucide-react'

const statusColors: Record<string, { bg: string; text: string; icon: LucideIcon }> = {
    CLAIMED: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', icon: GitBranch },
    IN_PROGRESS: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400', icon: Code },
    SUBMITTED: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-400', icon: GitPullRequest },
    REVIEW: { bg: 'bg-indigo-100 dark:bg-indigo-900/30', text: 'text-indigo-700 dark:text-indigo-400', icon: Eye },
    CHANGES_REQUESTED: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-400', icon: AlertCircle },
    APPROVED: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', icon: CheckCircle },
    MERGED: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', icon: GitMerge },
    REJECTED: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', icon: AlertCircle },
}

interface Contribution {
    id: string
    type: string
    status: string
    pointsEarned: number
    bountyEarned: number
    createdAt: Date
    completedAt: Date | null
    issue: {
        id: string
        title: string
        githubIssueNumber: number
        bountyAmount: number
        project: {
            id: string
            title: string
            slug: string
            githubOwner: string
            githubRepo: string
        }
    }
}

interface Stats {
    totalContributions: number
    prsMerged: number
    issuesSolved?: number
    codeReviews?: number
    totalBountyEarned: number
    pendingBounty?: number
    reputation?: number
}

export default function MyContributionsPage() {
    const { user } = useUserStore()
    const [contributions, setContributions] = useState<Contribution[]>([])
    const [stats, setStats] = useState<Stats | null>(null)
    const [loading, setLoading] = useState(true)
    const [isCertified, setIsCertified] = useState(false)
    const [activeTab, setActiveTab] = useState('all')

    useEffect(() => {
        async function fetchData() {
            if (!user) {
                setLoading(false)
                return
            }

            try {
                const [contribResult, statsResult, certResult] = await Promise.all([
                    getUserContributions(),
                    getUserContributionStats(),
                    getUserCertificationStatus()
                ])

                if (contribResult.success && contribResult.contributions) {
                    setContributions(Array.isArray(contribResult.contributions) ? contribResult.contributions as unknown as Contribution[] : [])
                }

                if (statsResult.success && statsResult.stats) {
                    setStats(statsResult.stats as unknown as Stats)
                }

                if (certResult.success) {
                    setIsCertified(certResult.isCertified || false)
                }
            } catch (error) {
                console.error('Error fetching data:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [user])

    const filteredContributions = contributions.filter(c => {
        if (activeTab === 'all') return true
        if (activeTab === 'active') return ['CLAIMED', 'IN_PROGRESS', 'SUBMITTED', 'REVIEW', 'CHANGES_REQUESTED'].includes(c.status)
        if (activeTab === 'completed') return ['APPROVED', 'MERGED'].includes(c.status)
        return true
    })

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Card className="max-w-md">
                    <CardContent className="p-8 text-center">
                        <Target className="w-12 h-12 mx-auto mb-4 text-neutral-400" />
                        <h2 className="text-xl font-bold mb-2">Sign in Required</h2>
                        <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                            Please sign in to view your contributions.
                        </p>
                        <Link href="/login">
                            <Button>Sign In</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-100 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
            <div className="border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
                <div className="max-w-6xl mx-auto px-4 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href="/opensource">
                                <Button variant="ghost" size="icon" className="rounded-xl">
                                    <ArrowLeft className="w-5 h-5" />
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                                    <Target className="w-6 h-6 text-green-600" />
                                    My Contributions
                                </h1>
                                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                    Track your open source journey
                                </p>
                            </div>
                        </div>
                        {
                            isCertified && (
                                <Badge className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Certified Contributor
                                </Badge>
                            )
                        }
                    </div>
                </div>
            </div>
            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                    <GitPullRequest className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                                        {stats?.totalContributions || 0}
                                    </p>
                                    <p className="text-xs text-neutral-500">Total PRs</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                    <GitMerge className="w-5 h-5 text-green-600 dark:text-green-400" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                                        {stats?.prsMerged || 0}
                                    </p>
                                    <p className="text-xs text-neutral-500">Merged</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                                    <Star className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                                        {stats?.issuesSolved || 0}
                                    </p>
                                    <p className="text-xs text-neutral-500">Issues Solved</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                                    <DollarSign className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                                        ${stats?.totalBountyEarned || 0}
                                    </p>
                                    <p className="text-xs text-neutral-500">Earned</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                                    <Zap className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                                        {stats?.reputation || 0}
                                    </p>
                                    <p className="text-xs text-neutral-500">Reputation</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">Contribution History</CardTitle>
                            <Tabs value={activeTab} onValueChange={setActiveTab}>
                                <TabsList className="h-8">
                                    <TabsTrigger value="all" className="text-xs h-7">All</TabsTrigger>
                                    <TabsTrigger value="active" className="text-xs h-7">Active</TabsTrigger>
                                    <TabsTrigger value="completed" className="text-xs h-7">Completed</TabsTrigger>
                                </TabsList>
                            </Tabs>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {
                            filteredContributions.length === 0 ? (
                                <div className="py-12 text-center">
                                    <div className="p-4 bg-neutral-100 dark:bg-neutral-800 rounded-full w-fit mx-auto mb-4">
                                        <GitPullRequest className="w-8 h-8 text-neutral-400" />
                                    </div>
                                    <h3 className="text-lg font-semibold mb-2">No contributions yet</h3>
                                    <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                                        {
                                            isCertified
                                                ? "Start contributing to open source projects!"
                                                : "Complete the learning path to start contributing."
                                        }
                                    </p>
                                    <Link href={isCertified ? "/opensource" : "/opensource/learn"}>
                                        <Button className="gap-2">
                                            {
                                                isCertified ? (
                                                    <>
                                                        <Rocket className="w-4 h-4" />
                                                        Browse Projects
                                                    </>
                                                ) : (
                                                    <>
                                                        <Target className="w-4 h-4" />
                                                        Start Learning
                                                    </>
                                                )
                                            }
                                        </Button>
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {
                                        filteredContributions.map((contribution, index) => {
                                            const statusConfig = statusColors[contribution.status] || statusColors.CLAIMED
                                            const StatusIcon = statusConfig?.icon

                                            return (
                                                <motion.div
                                                    key={contribution.id}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: index * 0.05 }}
                                                    className="flex items-center gap-4 p-4 border border-neutral-200 dark:border-neutral-800 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors"
                                                >
                                                    <div className={cn(
                                                        "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                                                        statusConfig?.bg
                                                    )}>
                                                        {
                                                            StatusIcon && (
                                                                <StatusIcon className={cn("w-5 h-5", statusConfig?.text)} />
                                                            )
                                                        }
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="text-sm text-neutral-500">
                                                                #{contribution.issue.githubIssueNumber}
                                                            </span>
                                                            <h4 className="font-medium text-neutral-900 dark:text-white truncate">
                                                                {contribution.issue.title}
                                                            </h4>
                                                        </div>
                                                        <div className="flex items-center gap-3 text-sm">
                                                            <Link
                                                                href={`/opensource/${contribution.issue.project.slug}`}
                                                                className="text-green-600 hover:underline"
                                                            >
                                                                {contribution.issue.project.title}
                                                            </Link>
                                                            <Badge className={cn("text-xs", statusConfig?.bg, statusConfig?.text)}>
                                                                {contribution.status.replace('_', ' ')}
                                                            </Badge>
                                                            <span className="text-neutral-500">
                                                                {formatDistanceToNow(new Date(contribution.createdAt), { addSuffix: true })}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4 flex-shrink-0">
                                                        {
                                                            contribution.pointsEarned > 0 && (
                                                                <div className="text-right">
                                                                    <p className="text-sm font-semibold text-purple-600">
                                                                        +{contribution.pointsEarned}
                                                                    </p>
                                                                    <p className="text-xs text-neutral-500">points</p>
                                                                </div>
                                                            )
                                                        }
                                                        {
                                                            contribution.bountyEarned > 0 && (
                                                                <div className="text-right">
                                                                    <p className="text-sm font-semibold text-amber-600">
                                                                        +${contribution.bountyEarned}
                                                                    </p>
                                                                    <p className="text-xs text-neutral-500">bounty</p>
                                                                </div>
                                                            )
                                                        }
                                                        <Link
                                                            href={`https://github.com/${contribution.issue.project.githubOwner}/${contribution.issue.project.githubRepo}/issues/${contribution.issue.githubIssueNumber}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                        >
                                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                <ExternalLink className="w-4 h-4" />
                                                            </Button>
                                                        </Link>
                                                    </div>
                                                </motion.div>
                                            )
                                        })
                                    }
                                </div>
                            )
                        }
                    </CardContent>
                </Card>
                {
                    stats && stats.prsMerged > 0 && (
                        <Card className="mt-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-200 dark:border-green-800">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-xl">
                                        <Trophy className="w-8 h-8 text-green-600 dark:text-green-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-green-900 dark:text-green-200 mb-1">
                                            🎉 You&apos;re a real contributor now!
                                        </h3>
                                        <p className="text-sm text-green-700 dark:text-green-300">
                                            You&apos;ve merged {stats.prsMerged} PR{stats.prsMerged > 1 ? 's' : ''} and solved {stats.issuesSolved || 0} issues.
                                            {stats.totalBountyEarned > 0 && ` Plus $${stats.totalBountyEarned} in bounties!`}
                                            {' '}Keep the momentum going!
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )
                }
            </div>
        </div>
    )
}