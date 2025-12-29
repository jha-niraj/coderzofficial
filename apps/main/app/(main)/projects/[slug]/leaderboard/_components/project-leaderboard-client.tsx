"use client"

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

import {
    ArrowLeft, Trophy, Share2, Users, TrendingUp, Check
} from 'lucide-react'
import { Button } from '@repo/ui/components/ui/button'
import { Card, CardContent } from '@repo/ui/components/ui/card'
import { Badge } from '@repo/ui/components/ui/badge'
import {
    Avatar, AvatarFallback, AvatarImage
} from '@repo/ui/components/ui/avatar'
import { Progress } from '@repo/ui/components/ui/progress'
import {
    Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink,
    PaginationNext, PaginationPrevious
} from '@repo/ui/components/ui/pagination'
import toast from '@repo/ui/components/ui/sonner'
import { getProjectLeaderboard } from '@/actions/(main)/projects/leaderboard.action'
import {
    formatScore, getScoreColor, getRankBadgeColor, getRankSuffix
} from '@/lib/project-scoring'
import { UserProgressSheet } from '@/components/projects/user-progress-sheet'

interface LeaderboardEntry {
    id: string
    rank: number
    score: number
    progressPercent: number
    tasksCompleted: number
    totalTasks: number
    user: {
        name?: string | null
        username?: string | null
        image?: string | null
    }
}

interface LeaderboardPagination {
    total: number
    totalPages: number
    currentPage: number
}

interface ProjectLeaderboardClientProps {
    project: {
        slug: string
        title: string
        totalStarted: number
        totalCompleted: number
    }
    currentPage: number
    autoOpenUsername?: string
    autoOpenSheet?: boolean
    currentUserId?: string
}

export function ProjectLeaderboardClient({
    project,
    currentPage,
    autoOpenUsername,
    autoOpenSheet,
}: ProjectLeaderboardClientProps) {
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
    const [pagination, setPagination] = useState<LeaderboardPagination | null>(null)
    const [loading, setLoading] = useState(true)
    const [selectedUser, setSelectedUser] = useState<string | null>(null)
    const [sheetOpen, setSheetOpen] = useState(false)
    const [copied, setCopied] = useState(false)

    const fetchLeaderboard = useCallback(async () => {
        setLoading(true)
        const result = await getProjectLeaderboard(project.slug, currentPage, 20)

        if (result.success && result.data) {
            setLeaderboard(result.data.leaderboard)
            setPagination({
                total: result.data.pagination.total,
                totalPages: result.data.pagination.totalPages,
                currentPage: currentPage
            })
        }

        setLoading(false)
    }, [project.slug, currentPage]);

    useEffect(() => {
        fetchLeaderboard()
    }, [currentPage, fetchLeaderboard])

    useEffect(() => {
        if (autoOpenUsername && autoOpenSheet) {
            setSelectedUser(autoOpenUsername)
            setSheetOpen(true)
        }
    }, [autoOpenUsername, autoOpenSheet])

    const handleViewProgress = (username: string) => {
        setSelectedUser(username)
        setSheetOpen(true)
    }

    const handleShare = (username: string) => {
        const shareUrl = `${window.location.origin}/projects/${project.slug}/leaderboard?username=${username}&showProgress=true`
        navigator.clipboard.writeText(shareUrl)
        setCopied(true)
        toast.success('Share link copied to clipboard!')
        setTimeout(() => setCopied(false), 2000)
    }

    const top3 = leaderboard.slice(0, 3)
    const rest = leaderboard.slice(3)

    return (
        <div className="container max-w-7xl mx-auto px-4 py-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <Link
                    href={`/projects/${project.slug}`}
                    className="inline-flex items-center gap-2 px-4 py-2 mb-6 bg-neutral-100 dark:bg-neutral-900 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Project
                </Link>
                <div className="flex items-start justify-between mb-8">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-neutral-900 to-neutral-600 dark:from-neutral-50 dark:to-neutral-400">
                            {project.title}
                        </h1>
                        <p className="text-lg text-neutral-600 dark:text-neutral-400">
                            Leaderboard & Rankings
                        </p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-blue-500/10 rounded-lg">
                                    <Users className="w-6 h-6 text-blue-500" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">{project.totalStarted}</p>
                                    <p className="text-sm text-muted-foreground">Total Participants</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-green-500/10 rounded-lg">
                                    <Trophy className="w-6 h-6 text-green-500" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">{project.totalCompleted}</p>
                                    <p className="text-sm text-muted-foreground">Completed</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-purple-500/10 rounded-lg">
                                    <TrendingUp className="w-6 h-6 text-purple-500" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">{pagination?.total || 0}</p>
                                    <p className="text-sm text-muted-foreground">On Leaderboard</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </motion.div>

            {
                top3.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="mb-12"
                    >
                        <div className="flex items-end justify-center gap-4 md:gap-8">
                            {
                                top3[1] && (
                                    <div className="flex flex-col items-center">
                                        <Trophy className="w-12 h-12 text-gray-400 mb-2" />
                                        <Avatar className="h-20 w-20 mb-3 ring-4 ring-gray-400">
                                            <AvatarImage src={top3[1].user.image!} />
                                            <AvatarFallback>{top3[1].user.name?.[0] || 'U'}</AvatarFallback>
                                        </Avatar>
                                        <Badge className="mb-2 bg-gray-400 hover:bg-gray-500">2nd</Badge>
                                        <p className="font-semibold text-center">{top3[1].user.name}</p>
                                        <p className="text-sm text-muted-foreground">@{top3[1].user.username || 'user'}</p>
                                        <p className={`text-2xl font-bold mt-2 ${getScoreColor(top3[1].score)}`}>
                                            {formatScore(top3[1].score)}
                                        </p>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="mt-3"
                                            onClick={() => handleViewProgress(top3[1]?.user?.username || '')}
                                        >
                                            View Progress
                                        </Button>
                                    </div>
                                )
                            }
                            {
                                top3[0] && (
                                    <div className="flex flex-col items-center -mt-8">
                                        <Trophy className="w-16 h-16 text-yellow-500 mb-2 animate-pulse" />
                                        <Avatar className="h-28 w-28 mb-3 ring-4 ring-yellow-500">
                                            <AvatarImage src={top3[0].user.image!} />
                                            <AvatarFallback>{top3[0].user.name?.[0] || 'U'}</AvatarFallback>
                                        </Avatar>
                                        <Badge className="mb-2 bg-yellow-500 hover:bg-yellow-600">1st</Badge>
                                        <p className="font-bold text-lg text-center">{top3[0].user.name}</p>
                                        <p className="text-sm text-muted-foreground">@{top3[0].user.username || 'user'}</p>
                                        <p className={`text-3xl font-bold mt-2 ${getScoreColor(top3[0].score)}`}>
                                            {formatScore(top3[0].score)}
                                        </p>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="mt-3"
                                            onClick={() => handleViewProgress(top3[0]?.user?.username || '')}
                                        >
                                            View Progress
                                        </Button>
                                    </div>
                                )
                            }
                            {
                                top3[2] && (
                                    <div className="flex flex-col items-center">
                                        <Trophy className="w-12 h-12 text-amber-600 mb-2" />
                                        <Avatar className="h-20 w-20 mb-3 ring-4 ring-amber-600">
                                            <AvatarImage src={top3[2].user.image!} />
                                            <AvatarFallback>{top3[2].user.name?.[0] || 'U'}</AvatarFallback>
                                        </Avatar>
                                        <Badge className="mb-2 bg-amber-600 hover:bg-amber-700">3rd</Badge>
                                        <p className="font-semibold text-center">{top3[2].user.name}</p>
                                        <p className="text-sm text-muted-foreground">@{top3[2].user.username || 'user'}</p>
                                        <p className={`text-2xl font-bold mt-2 ${getScoreColor(top3[2].score)}`}>
                                            {formatScore(top3[2].score)}
                                        </p>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="mt-3"
                                            onClick={() => handleViewProgress(top3[2]?.user?.username || '')}
                                        >
                                            View Progress
                                        </Button>
                                    </div>
                                )
                            }
                        </div>
                    </motion.div>
                )
            }
            {
                rest.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="space-y-3"
                    >
                        <h2 className="text-2xl font-bold mb-4">All Participants</h2>
                        {
                            rest.map((entry) => (
                                <Card key={entry.id} className="hover:shadow-lg transition-shadow">
                                    <CardContent className="p-4 md:p-6">
                                        <div className="flex items-center gap-4">
                                            <Badge className={`${getRankBadgeColor(entry.rank)} min-w-[60px] justify-center`}>
                                                {getRankSuffix(entry.rank)}
                                            </Badge>
                                            <Avatar className="h-12 w-12">
                                                <AvatarImage src={entry.user.image!} />
                                                <AvatarFallback>{entry.user.name?.[0] || 'U'}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1">
                                                <p className="font-semibold">{entry.user.name}</p>
                                                <p className="text-sm text-muted-foreground">@{entry.user.username || 'user'}</p>
                                            </div>
                                            <div className="text-right hidden md:block">
                                                <p className={`text-2xl font-bold ${getScoreColor(entry.score)}`}>
                                                    {formatScore(entry.score)}
                                                </p>
                                                <p className="text-xs text-muted-foreground">points</p>
                                            </div>
                                            <div className="hidden md:block w-32">
                                                <Progress value={entry.progressPercent} className="h-2" />
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {entry.tasksCompleted}/{entry.totalTasks} tasks
                                                </p>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleViewProgress(entry.user.username || '')}
                                                >
                                                    View
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleShare(entry.user.username || '')}
                                                >
                                                    {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        }
                    </motion.div>
                )
            }
            {
                pagination && pagination.totalPages > 1 && (
                    <div className="mt-8 flex justify-center">
                        <Pagination>
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious
                                        href={`?page=${Math.max(1, currentPage - 1)}`}
                                        className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                                    />
                                </PaginationItem>

                                {
                                    [...Array(pagination.totalPages)].map((_, i) => {
                                        const pageNum = i + 1
                                        if (
                                            pageNum === 1 ||
                                            pageNum === pagination.totalPages ||
                                            (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                                        ) {
                                            return (
                                                <PaginationItem key={pageNum}>
                                                    <PaginationLink
                                                        href={`?page=${pageNum}`}
                                                        isActive={pageNum === currentPage}
                                                    >
                                                        {pageNum}
                                                    </PaginationLink>
                                                </PaginationItem>
                                            )
                                        } else if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                                            return <PaginationEllipsis key={pageNum} />
                                        }
                                        return null
                                    })
                                }

                                <PaginationItem>
                                    <PaginationNext
                                        href={`?page=${Math.min(pagination.totalPages, currentPage + 1)}`}
                                        className={currentPage === pagination.totalPages ? 'pointer-events-none opacity-50' : ''}
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </div>
                )
            }

            {
                !loading && leaderboard.length === 0 && (
                    <Card className="p-12 text-center">
                        <Trophy className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-xl font-semibold mb-2">No participants yet</h3>
                        <p className="text-muted-foreground mb-4">
                            Be the first to start this project and claim the top spot!
                        </p>
                        <Link href={`/projects/${project.slug}`}>
                            <Button>View Project</Button>
                        </Link>
                    </Card>
                )
            }

            {
                selectedUser && (
                    <UserProgressSheet
                        open={sheetOpen}
                        onOpenChange={setSheetOpen}
                        projectSlug={project.slug}
                        username={selectedUser}
                    />
                )
            }
        </div>
    )
}