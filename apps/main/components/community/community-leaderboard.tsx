'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
    Trophy, Medal, Crown, Star, MessageSquare, Target, Users, Award,
    ChevronLeft, ChevronRight, Loader2, Sparkles
} from 'lucide-react'
import { Button } from '@repo/ui/components/ui/button'
import {
    Avatar, AvatarFallback, AvatarImage
} from '@repo/ui/components/ui/avatar'
import {
    Card, CardContent, CardHeader, CardTitle
} from '@repo/ui/components/ui/card'
import { ScrollArea } from '@repo/ui/components/ui/scroll-area'
import { cn } from '@repo/ui/lib/utils'
import { getCommunityLeaderboard } from '@/actions/(main)/community/post.action'
import Link from 'next/link'

// ==================== TYPES ====================
interface LeaderboardEntry {
    id: string
    totalPoints: number
    postPoints: number
    commentPoints: number
    quizPoints: number
    peerMockPoints: number
    helpPoints: number
    postsCount: number
    commentsCount: number
    quizzesCompleted: number
    questionsCorrect: number
    peerSessionsCount: number
    helpRequestsSolved: number
    rank: number
    user: {
        id: string
        name: string | null
        username: string | null
        image: string | null
    }
}

interface CommunityLeaderboardProps {
    communityId: string
    communitySlug: string
}

// ==================== PODIUM COMPONENT ====================
function PodiumCard({
    entry,
    position,
    className
}: {
    entry: LeaderboardEntry
    position: 1 | 2 | 3
    className?: string
}) {
    const positionConfig = {
        1: {
            label: '1st',
            icon: Crown,
            gradient: 'from-yellow-400 via-amber-500 to-orange-500',
            ring: 'ring-yellow-400/50',
            bgGlow: 'bg-gradient-to-b from-yellow-500/20 to-transparent',
            size: 'w-24 h-24',
            height: 'h-32'
        },
        2: {
            label: '2nd',
            icon: Medal,
            gradient: 'from-slate-300 via-gray-400 to-slate-500',
            ring: 'ring-gray-400/50',
            bgGlow: 'bg-gradient-to-b from-gray-400/20 to-transparent',
            size: 'w-20 h-20',
            height: 'h-24'
        },
        3: {
            label: '3rd',
            icon: Award,
            gradient: 'from-orange-400 via-amber-600 to-orange-700',
            ring: 'ring-orange-400/50',
            bgGlow: 'bg-gradient-to-b from-orange-500/20 to-transparent',
            size: 'w-20 h-20',
            height: 'h-20'
        }
    }

    const config = positionConfig[position]
    const Icon = config.icon

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: position * 0.1 }}
            className={cn("flex flex-col items-center", className)}
        >
            {/* Position badge */}
            <div className={cn(
                "mb-3 p-2 rounded-full bg-gradient-to-br shadow-lg",
                config.gradient
            )}>
                <Icon className="w-5 h-5 text-white" />
            </div>

            {/* Avatar */}
            <Link href={`/profile/${entry.user.username || entry.user.id}`} className="group">
                <div className={cn(
                    "relative rounded-full p-1 ring-4",
                    config.ring
                )}>
                    <Avatar className={cn(config.size, "border-4 border-white dark:border-neutral-800")}>
                        <AvatarImage src={entry.user.image || undefined} />
                        <AvatarFallback className={cn("bg-gradient-to-br text-white font-bold text-xl", config.gradient)}>
                            {entry.user.name?.charAt(0) || 'U'}
                        </AvatarFallback>
                    </Avatar>
                    <div className={cn(
                        "absolute -bottom-1 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full",
                        "bg-gradient-to-br font-bold text-white text-sm shadow-lg",
                        config.gradient
                    )}>
                        {config.label}
                    </div>
                </div>
            </Link>

            {/* User info */}
            <div className="mt-4 text-center">
                <p className="font-semibold text-neutral-900 dark:text-white truncate max-w-[120px]">
                    {entry.user.name || 'Anonymous'}
                </p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    @{entry.user.username || 'user'}
                </p>
            </div>

            {/* Points */}
            <div className="mt-2 flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500" />
                <span className="font-bold text-lg text-neutral-900 dark:text-white">
                    {entry.totalPoints.toLocaleString()}
                </span>
            </div>

            {/* Podium base */}
            <div className={cn(
                "mt-3 w-full rounded-t-lg bg-gradient-to-b",
                config.bgGlow,
                config.height
            )} />
        </motion.div>
    )
}

// ==================== LEADERBOARD ROW ====================
function LeaderboardRow({
    entry,
    index
}: {
    entry: LeaderboardEntry
    index: number
}) {
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.03 }}
            className={cn(
                "flex items-center gap-4 p-4 rounded-xl",
                "bg-white dark:bg-neutral-800/50",
                "border border-neutral-200 dark:border-neutral-700/50",
                "hover:shadow-md hover:border-primary/30 transition-all"
            )}
        >
            {/* Rank */}
            <div className={cn(
                "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold",
                entry.rank <= 3
                    ? "bg-gradient-to-br from-yellow-400 to-orange-500 text-white"
                    : "bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300"
            )}>
                {entry.rank}
            </div>

            {/* User */}
            <Link href={`/profile/${entry.user.username || entry.user.id}`} className="flex items-center gap-3 flex-1 min-w-0">
                <Avatar className="w-10 h-10">
                    <AvatarImage src={entry.user.image || undefined} />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-purple-600 text-white">
                        {entry.user.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                    <p className="font-medium text-neutral-900 dark:text-white truncate">
                        {entry.user.name || 'Anonymous'}
                    </p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 truncate">
                        @{entry.user.username || 'user'}
                    </p>
                </div>
            </Link>

            {/* Stats */}
            <div className="hidden md:flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1 text-neutral-500 dark:text-neutral-400">
                    <MessageSquare className="w-4 h-4" />
                    <span>{entry.postsCount}</span>
                </div>
                <div className="flex items-center gap-1 text-neutral-500 dark:text-neutral-400">
                    <Target className="w-4 h-4" />
                    <span>{entry.quizzesCompleted}</span>
                </div>
            </div>

            {/* Points */}
            <div className="flex items-center gap-1">
                <Star className="w-5 h-5 text-yellow-500" />
                <span className="font-bold text-neutral-900 dark:text-white">
                    {entry.totalPoints.toLocaleString()}
                </span>
            </div>
        </motion.div>
    )
}

// ==================== MAIN COMPONENT ====================
export function CommunityLeaderboard({ communityId }: CommunityLeaderboardProps) {
    const [entries, setEntries] = useState<LeaderboardEntry[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [currentUser, setCurrentUser] = useState<LeaderboardEntry | null>(null)

    const loadLeaderboard = useCallback(async (page: number) => {
        setIsLoading(true)
        try {
            const result = await getCommunityLeaderboard(communityId, { page, limit: 100 })
            if (result.success && result.data) {
                setEntries(result.data.leaderboard as LeaderboardEntry[])
                setTotalPages(result.data.totalPages)
                setCurrentUser(result.data.currentUser as LeaderboardEntry | null)
            }
        } catch (error) {
            console.error('Failed to load leaderboard:', error)
        } finally {
            setIsLoading(false)
        }
    }, [communityId])

    useEffect(() => {
        loadLeaderboard(currentPage)
    }, [currentPage, loadLeaderboard])

    // Get top 3 for podium
    const top3 = entries.slice(0, 3)
    const remainingEntries = entries.slice(3)

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-neutral-500 dark:text-neutral-400">Loading leaderboard...</p>
                </div>
            </div>
        )
    }

    if (entries.length === 0) {
        return (
            <Card className="border-dashed">
                <CardContent className="py-16 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-yellow-400/20 to-orange-500/20 flex items-center justify-center">
                        <Trophy className="w-8 h-8 text-yellow-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
                        No Rankings Yet
                    </h3>
                    <p className="text-neutral-500 dark:text-neutral-400 max-w-md mx-auto">
                        Be the first to climb the leaderboard! Earn points by posting, commenting, completing quizzes, and helping others.
                    </p>
                    <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm text-neutral-600 dark:text-neutral-300">
                        <div className="flex items-center gap-2">
                            <MessageSquare className="w-4 h-4 text-blue-500" />
                            <span>Post = 1 pt</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Target className="w-4 h-4 text-green-500" />
                            <span>Quiz correct = 1 pt</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-purple-500" />
                            <span>Peer mock = 2 pts</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 mb-4">
                    <Sparkles className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">Community Leaderboard</span>
                </div>
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
                    Top Contributors
                </h2>
                <p className="text-neutral-500 dark:text-neutral-400 mt-1">
                    Earn points by being active in the community
                </p>
            </div>

            {/* Podium for top 3 */}
            {top3.length >= 3 && top3[0] && top3[1] && top3[2] && (
                <div className="flex items-end justify-center gap-4 md:gap-8 py-8">
                    {/* 2nd place - left */}
                    <PodiumCard entry={top3[1]} position={2} />
                    {/* 1st place - center */}
                    <PodiumCard entry={top3[0]} position={1} className="-mt-8" />
                    {/* 3rd place - right */}
                    <PodiumCard entry={top3[2]} position={3} />
                </div>
            )}

            {/* Current user position */}
            {currentUser && currentUser.rank > 3 && (
                <Card className="bg-gradient-to-r from-primary/5 to-purple-500/5 border-primary/20">
                    <CardContent className="py-4">
                        <div className="flex items-center gap-4">
                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
                                #{currentUser.rank}
                            </div>
                            <div className="flex-1">
                                <p className="font-medium text-neutral-900 dark:text-white">Your Position</p>
                                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                    Keep contributing to climb higher!
                                </p>
                            </div>
                            <div className="flex items-center gap-1">
                                <Star className="w-5 h-5 text-yellow-500" />
                                <span className="font-bold text-lg text-neutral-900 dark:text-white">
                                    {currentUser.totalPoints.toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Remaining entries */}
            {remainingEntries.length > 0 && (
                <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        All Members
                    </h3>
                    <ScrollArea className="h-[500px]">
                        <div className="space-y-2 pr-4">
                            {remainingEntries.map((entry, index) => (
                                <LeaderboardRow key={entry.id} entry={entry} index={index} />
                            ))}
                        </div>
                    </ScrollArea>
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                    >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Previous
                    </Button>
                    <span className="text-sm text-neutral-500 dark:text-neutral-400">
                        Page {currentPage} of {totalPages}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                    >
                        Next
                        <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                </div>
            )}

            {/* Points legend */}
            <Card className="bg-neutral-50 dark:bg-neutral-800/50">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-neutral-600 dark:text-neutral-300">
                        How to earn points
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                <MessageSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <p className="font-medium text-neutral-900 dark:text-white">Post</p>
                                <p className="text-neutral-500 dark:text-neutral-400">+1 point</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                <Target className="w-4 h-4 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <p className="font-medium text-neutral-900 dark:text-white">Quiz Answer</p>
                                <p className="text-neutral-500 dark:text-neutral-400">+1 per correct</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                                <p className="font-medium text-neutral-900 dark:text-white">Peer Mock</p>
                                <p className="text-neutral-500 dark:text-neutral-400">+2 points</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                                <Award className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                            </div>
                            <div>
                                <p className="font-medium text-neutral-900 dark:text-white">Help Solved</p>
                                <p className="text-neutral-500 dark:text-neutral-400">+2 points</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
