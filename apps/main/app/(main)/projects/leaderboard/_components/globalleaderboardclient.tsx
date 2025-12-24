"use client"

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
    ArrowLeft, Trophy, Medal, Award, Star
} from 'lucide-react'
import { Button } from '@repo/ui/components/ui/button'
import { Card, CardContent } from '@repo/ui/components/ui/card'
import { Badge } from '@repo/ui/components/ui/badge'
import { 
    Avatar, AvatarFallback, AvatarImage 
} from '@repo/ui/components/ui/avatar'
import {
    Pagination, PaginationContent, PaginationEllipsis, PaginationItem, 
    PaginationLink, PaginationNext, PaginationPrevious,
} from '@repo/ui/components/ui/pagination'
import { getGlobalLeaderboard } from '@/actions/(main)/projects/leaderboard.action'
import { 
    formatScore, getScoreColor, getRankBadgeColor, getRankSuffix 
} from '@/lib/project-scoring'

interface GlobalLeaderboardClientProps {
    currentPage: number
    currentUserId?: string
}

export function GlobalLeaderboardClient({
    currentPage,
    currentUserId
}: GlobalLeaderboardClientProps) {
    const [leaderboard, setLeaderboard] = useState<any[]>([])
    const [pagination, setPagination] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    const fetchLeaderboard = useCallback(async () => {
        setLoading(true)
        const result = await getGlobalLeaderboard(currentPage, 20)
        
        if (result.success && result.data) {
            setLeaderboard(result.data.leaderboard)
            setPagination(result.data.pagination)
        }
    }, [currentPage]);

    useEffect(() => {
        fetchLeaderboard()
    }, [currentPage, fetchLeaderboard])



    const top3 = leaderboard.slice(0, 3)
    const rest = leaderboard.slice(3)

    return (
        <div className="container max-w-7xl mx-auto px-4 py-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <Link
                    href="/projects"
                    className="inline-flex items-center gap-2 px-4 py-2 mb-6 bg-neutral-100 dark:bg-neutral-900 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Projects
                </Link>

                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-3 mb-4">
                        <Trophy className="w-12 h-12 text-yellow-500" />
                        <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-500 to-orange-500">
                            Global Leaderboard
                        </h1>
                    </div>
                    <p className="text-lg text-neutral-600 dark:text-neutral-400">
                        Top performers across all projects
                    </p>
                </div>
            </motion.div>

            {/* Top 3 Podium */}
            {top3.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="mb-16"
                >
                    <div className="flex items-end justify-center gap-4 md:gap-8">
                        {/* 2nd Place */}
                        {top3[1] && (
                            <div className="flex flex-col items-center">
                                <Trophy className="w-14 h-14 text-gray-400 mb-3 drop-shadow-lg" />
                                <Avatar className="h-24 w-24 mb-3 ring-4 ring-gray-400 shadow-xl">
                                    <AvatarImage src={top3[1].user.image} />
                                    <AvatarFallback>{top3[1].user.name?.[0] || 'U'}</AvatarFallback>
                                </Avatar>
                                <Badge className="mb-2 bg-gray-400 hover:bg-gray-500 text-white text-base px-4 py-1">
                                    <Medal className="w-4 h-4 mr-1" />
                                    2nd
                                </Badge>
                                <p className="font-bold text-lg text-center">{top3[1].user.name}</p>
                                <p className="text-sm text-muted-foreground">@{top3[1].user.username}</p>
                                <div className="mt-3 text-center">
                                    <p className={`text-3xl font-bold ${getScoreColor(top3[1].totalScore)}`}>
                                        {formatScore(top3[1].totalScore)}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">total points</p>
                                    <div className="flex gap-4 mt-2 text-sm">
                                        <div>
                                            <p className="font-semibold">{top3[1].projectsCompleted}</p>
                                            <p className="text-xs text-muted-foreground">completed</p>
                                        </div>
                                        <div>
                                            <p className="font-semibold">{formatScore(top3[1].averageScore)}</p>
                                            <p className="text-xs text-muted-foreground">avg score</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 1st Place - Taller with glow */}
                        {top3[0] && (
                            <div className="flex flex-col items-center -mt-12">
                                <div className="relative">
                                    <Trophy className="w-20 h-20 text-yellow-500 mb-3 animate-pulse drop-shadow-2xl" />
                                    <div className="absolute inset-0 bg-yellow-500/20 blur-xl rounded-full"></div>
                                </div>
                                <Avatar className="h-32 w-32 mb-4 ring-4 ring-yellow-500 shadow-2xl">
                                    <AvatarImage src={top3[0].user.image} />
                                    <AvatarFallback>{top3[0].user.name?.[0] || 'U'}</AvatarFallback>
                                </Avatar>
                                <Badge className="mb-2 bg-yellow-500 hover:bg-yellow-600 text-white text-lg px-5 py-1.5">
                                    <Star className="w-5 h-5 mr-1" />
                                    1st
                                </Badge>
                                <p className="font-bold text-xl text-center">{top3[0].user.name}</p>
                                <p className="text-sm text-muted-foreground">@{top3[0].user.username}</p>
                                <div className="mt-4 text-center">
                                    <p className={`text-4xl font-bold ${getScoreColor(top3[0].totalScore)}`}>
                                        {formatScore(top3[0].totalScore)}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">total points</p>
                                    <div className="flex gap-4 mt-3 text-sm">
                                        <div>
                                            <p className="font-semibold">{top3[0].projectsCompleted}</p>
                                            <p className="text-xs text-muted-foreground">completed</p>
                                        </div>
                                        <div>
                                            <p className="font-semibold">{formatScore(top3[0].averageScore)}</p>
                                            <p className="text-xs text-muted-foreground">avg score</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 3rd Place */}
                        {top3[2] && (
                            <div className="flex flex-col items-center">
                                <Trophy className="w-14 h-14 text-amber-600 mb-3 drop-shadow-lg" />
                                <Avatar className="h-24 w-24 mb-3 ring-4 ring-amber-600 shadow-xl">
                                    <AvatarImage src={top3[2].user.image} />
                                    <AvatarFallback>{top3[2].user.name?.[0] || 'U'}</AvatarFallback>
                                </Avatar>
                                <Badge className="mb-2 bg-amber-600 hover:bg-amber-700 text-white text-base px-4 py-1">
                                    <Award className="w-4 h-4 mr-1" />
                                    3rd
                                </Badge>
                                <p className="font-bold text-lg text-center">{top3[2].user.name}</p>
                                <p className="text-sm text-muted-foreground">@{top3[2].user.username}</p>
                                <div className="mt-3 text-center">
                                    <p className={`text-3xl font-bold ${getScoreColor(top3[2].totalScore)}`}>
                                        {formatScore(top3[2].totalScore)}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">total points</p>
                                    <div className="flex gap-4 mt-2 text-sm">
                                        <div>
                                            <p className="font-semibold">{top3[2].projectsCompleted}</p>
                                            <p className="text-xs text-muted-foreground">completed</p>
                                        </div>
                                        <div>
                                            <p className="font-semibold">{formatScore(top3[2].averageScore)}</p>
                                            <p className="text-xs text-muted-foreground">avg score</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}

            {/* Rest of Leaderboard */}
            {rest.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-2"
                >
                    <h2 className="text-2xl font-bold mb-4">All Participants</h2>
                    {rest.map((entry) => (
                        <Card 
                            key={entry.id} 
                            className={`hover:shadow-md transition-shadow ${entry.userId === currentUserId ? 'ring-2 ring-blue-500' : ''}`}
                        >
                            <CardContent className="p-4">
                                <div className="flex items-center gap-4">
                                    {/* Rank */}
                                    <Badge className={`${getRankBadgeColor(entry.rank)} min-w-[60px] justify-center text-sm`}>
                                        {getRankSuffix(entry.rank)}
                                    </Badge>

                                    {/* Avatar & Name */}
                                    <Avatar className="h-12 w-12">
                                        <AvatarImage src={entry.user.image} />
                                        <AvatarFallback>{entry.user.name?.[0] || 'U'}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <p className="font-semibold">
                                            {entry.user.name}
                                            {entry.userId === currentUserId && (
                                                <Badge variant="outline" className="ml-2 text-xs">You</Badge>
                                            )}
                                        </p>
                                        <p className="text-sm text-muted-foreground">@{entry.user.username}</p>
                                    </div>

                                    {/* Stats */}
                                    <div className="hidden md:flex gap-6 text-center">
                                        <div>
                                            <p className={`text-xl font-bold ${getScoreColor(entry.totalScore)}`}>
                                                {formatScore(entry.totalScore)}
                                            </p>
                                            <p className="text-xs text-muted-foreground">total points</p>
                                        </div>
                                        <div>
                                            <p className="text-xl font-bold">{entry.projectsStarted}</p>
                                            <p className="text-xs text-muted-foreground">started</p>
                                        </div>
                                        <div>
                                            <p className="text-xl font-bold text-green-600">{entry.projectsCompleted}</p>
                                            <p className="text-xs text-muted-foreground">completed</p>
                                        </div>
                                        <div>
                                            <p className="text-xl font-bold">{formatScore(entry.averageScore)}</p>
                                            <p className="text-xs text-muted-foreground">avg score</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </motion.div>
            )}

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
                <div className="mt-8 flex justify-center">
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious 
                                    href={`?page=${Math.max(1, currentPage - 1)}`}
                                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                                />
                            </PaginationItem>
                            
                            {[...Array(pagination.totalPages)].map((_, i) => {
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
                            })}
                            
                            <PaginationItem>
                                <PaginationNext 
                                    href={`?page=${Math.min(pagination.totalPages, currentPage + 1)}`}
                                    className={currentPage === pagination.totalPages ? 'pointer-events-none opacity-50' : ''}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            )}

            {/* Empty State */}
            {!loading && leaderboard.length === 0 && (
                <Card className="p-12 text-center">
                    <Trophy className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-xl font-semibold mb-2">No participants yet</h3>
                    <p className="text-muted-foreground mb-4">
                        Start a project to appear on the leaderboard!
                    </p>
                    <Link href="/projects">
                        <Button>Browse Projects</Button>
                    </Link>
                </Card>
            )}
        </div>
    )
}
