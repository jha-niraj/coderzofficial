'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
    TrendingUp, Flame, RefreshCw, Loader2, Clock, Award
} from 'lucide-react'
import { Button } from '@repo/ui/components/ui/button'
import { Badge } from '@repo/ui/components/ui/badge'
import {
    Tabs, TabsList, TabsTrigger
} from '@repo/ui/components/ui/tabs'
import { CommunitySidebar } from '@/components/community/community-sidebar'
import { PostCard } from '@/components/community/post-card'
import { getTrendingPosts } from '@/actions/(main)/community/post.action'
import toast from '@repo/ui/components/ui/sonner'

interface TrendingPageClientProps {
    user: {
        id: string
        name: string | null
        image: string | null
    }
    trendingPosts: Array<{
        id: string
        title?: string | null
        content: string
        type: string
        tags: string[]
        isPinned: boolean
        isLocked: boolean
        isAnswered?: boolean
        likeCount: number
        commentCount: number
        viewCount: number
        createdAt: Date
        author: {
            id: string
            name: string | null
            username: string | null
            image: string | null
        }
        community?: {
            id: string
            name: string
            slug: string
            logo?: string | null
        } | null
        channel?: {
            id: string
            name: string
            slug: string
            icon?: string | null
        } | null
        _count?: {
            likes: number
            comments: number
        }
        isLiked?: boolean
    }>
    userCommunities: Array<{
        id: string
        name: string
        slug: string
        logo?: string | null
        themeColor: string
        userRole?: string
    }>
}

export function TrendingPageClient({
    user,
    trendingPosts: initialPosts,
    userCommunities
}: TrendingPageClientProps) {
    const [posts, setPosts] = useState(initialPosts)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [timeFilter, setTimeFilter] = useState<'today' | 'week' | 'month' | 'all'>('week')

    const refreshPosts = useCallback(async () => {
        setIsRefreshing(true)
        try {
            const result = await getTrendingPosts({ limit: 30, timeRange: timeFilter })
            if (result.success && result.data) {
                setPosts(result.data)
                toast.success('Posts refreshed!')
            }
        } catch {
            toast.error('Failed to refresh posts')
        } finally {
            setIsRefreshing(false)
        }
    }, [timeFilter])

    const handleTimeFilterChange = async (value: string) => {
        const filter = value as 'today' | 'week' | 'month' | 'all'
        setTimeFilter(filter)
        setIsRefreshing(true)
        try {
            const result = await getTrendingPosts({ limit: 30, timeRange: filter })
            if (result.success && result.data) {
                setPosts(result.data)
            }
        } catch {
            toast.error('Failed to load posts')
        } finally {
            setIsRefreshing(false)
        }
    }

    return (
        <div className="min-h-screen bg-white dark:bg-neutral-950">
            <div className="flex">
                <CommunitySidebar userCommunities={userCommunities} />
                <main className="flex-1 min-w-0">
                    <div className="max-w-3xl mx-auto px-4 py-6">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl">
                                    <Flame className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
                                        Trending
                                    </h1>
                                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                        Most engaging posts from the community
                                    </p>
                                </div>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={refreshPosts}
                                disabled={isRefreshing}
                                className="gap-2"
                            >
                                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                                Refresh
                            </Button>
                        </div>
                        <Tabs defaultValue="week" onValueChange={handleTimeFilterChange} className="mb-6">
                            <TabsList className="grid w-full max-w-md grid-cols-4">
                                <TabsTrigger value="today" className="gap-2">
                                    <Clock className="w-4 h-4" />
                                    Today
                                </TabsTrigger>
                                <TabsTrigger value="week" className="gap-2">
                                    <TrendingUp className="w-4 h-4" />
                                    This Week
                                </TabsTrigger>
                                <TabsTrigger value="month" className="gap-2">
                                    <Award className="w-4 h-4" />
                                    This Month
                                </TabsTrigger>
                                <TabsTrigger value="all" className="gap-2">
                                    <Flame className="w-4 h-4" />
                                    All Time
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>
                        {
                            isRefreshing ? (
                                <div className="flex justify-center py-16">
                                    <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
                                </div>
                            ) : posts.length === 0 ? (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-center py-16"
                                >
                                    <TrendingUp className="w-16 h-16 mx-auto text-neutral-300 dark:text-neutral-700 mb-4" />
                                    <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
                                        No trending posts yet
                                    </h3>
                                    <p className="text-neutral-500 dark:text-neutral-400 mb-6 max-w-md mx-auto">
                                        Be the first to create engaging content!
                                    </p>
                                    <Link href="/community">
                                        <Button className="bg-neutral-900 dark:bg-white text-white dark:text-neutral-900">
                                            Back to Feed
                                        </Button>
                                    </Link>
                                </motion.div>
                            ) : (
                                <div className="space-y-4">
                                    <AnimatePresence>
                                        {
                                            posts.map((post, index) => (
                                                <motion.div
                                                    key={post.id}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: index * 0.05 }}
                                                    className="relative"
                                                >
                                                    {
                                                        index < 3 && (
                                                            <div className={`absolute -left-3 top-4 z-10 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white ${index === 0 ? 'bg-gradient-to-br from-amber-400 to-amber-600' :
                                                                    index === 1 ? 'bg-gradient-to-br from-neutral-300 to-neutral-500' :
                                                                        'bg-gradient-to-br from-amber-600 to-amber-800'
                                                                }`}>
                                                                {index + 1}
                                                            </div>
                                                        )
                                                    }
                                                    <PostCard
                                                        post={post as any}
                                                        showCommunity
                                                    />
                                                </motion.div>
                                            ))
                                        }
                                    </AnimatePresence>
                                </div>
                            )
                        }
                    </div>
                </main>
                <aside className="w-80 flex-shrink-0 hidden xl:block border-l border-neutral-200 dark:border-neutral-800">
                    <div className="sticky top-20 p-4 space-y-6">
                        <div className="p-4 rounded-xl bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 border border-orange-200 dark:border-orange-800">
                            <div className="flex items-center gap-2 mb-4">
                                <Flame className="w-5 h-5 text-orange-500" />
                                <h3 className="font-semibold text-neutral-900 dark:text-white">Trending Now</h3>
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-neutral-600 dark:text-neutral-400">Total Posts</span>
                                    <Badge variant="secondary">{posts.length}</Badge>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-neutral-600 dark:text-neutral-400">Total Engagement</span>
                                    <Badge variant="secondary">
                                        {posts.reduce((acc, p) => acc + (p._count?.likes || p.likeCount) + (p._count?.comments || p.commentCount), 0)}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                            <h3 className="font-semibold text-neutral-900 dark:text-white mb-3">Trending Tags</h3>
                            <div className="flex flex-wrap gap-2">
                                {
                                    Array.from(new Set(posts.flatMap(p => p.tags))).slice(0, 10).map((tag) => (
                                        <Badge key={tag} variant="secondary" className="text-xs">
                                            #{tag}
                                        </Badge>
                                    ))
                                }
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    )
}