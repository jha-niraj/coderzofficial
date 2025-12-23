'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
    TrendingUp, Users, Sparkles, ChevronRight, RefreshCw, Plus,
    Loader2, Home, UserCheck
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Tabs, TabsList, TabsTrigger
} from '@/components/ui/tabs'
import { CommunitySidebar } from '@/components/community/community-sidebar'
import { CommunityCard } from '@/components/community/community-card'
import { PostCard } from '@/components/community/post-card'
import { PostComposer } from '@/components/community/post-composer'
import { MagicSheet } from '@/components/community/magic-sheet'
import { getGlobalFeed, getFollowingFeed } from '@/actions/(main)/community/post.action'
import {
    joinCommunity, leaveCommunity
} from '@/actions/(main)/community/community.action'
import { toast } from 'sonner'
import { useInView } from 'react-intersection-observer'

interface CommunityHubClientProps {
    user: {
        id: string
        name: string | null
        image: string | null
    }
    userCommunities: Array<{
        id: string
        name: string
        slug: string
        logo?: string | null
        themeColor: string
        userRole?: string
    }>
    featuredCommunities: Array<{
        id: string
        name: string
        slug: string
        shortDescription?: string | null
        description: string
        logo?: string | null
        coverImage?: string | null
        themeColor: string
        category: string
        isVerified: boolean
        memberCount: number
        postCount: number
        creator?: {
            id: string
            name: string | null
            username: string | null
            image: string | null
        }
        _count?: {
            members: number
            posts: number
        }
    }>
    initialPosts: Array<{
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
    initialNextCursor?: string
}

export function CommunityHubClient({
    user,
    userCommunities,
    featuredCommunities,
    initialPosts,
    initialNextCursor
}: CommunityHubClientProps) {
    const [posts, setPosts] = useState(initialPosts)
    const [followingPosts, setFollowingPosts] = useState<typeof initialPosts>([])
    const [nextCursor, setNextCursor] = useState(initialNextCursor)
    const [followingCursor, setFollowingCursor] = useState<string | undefined>()
    const [isLoading, setIsLoading] = useState(false)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [activeTab, setActiveTab] = useState<'for-you' | 'following'>('for-you')
    const [followingLoaded, setFollowingLoaded] = useState(false)
    const [joinedCommunities, setJoinedCommunities] = useState<Set<string>>(
        new Set(userCommunities.map(c => c.id))
    )
    const [loadingCommunities, setLoadingCommunities] = useState<Set<string>>(new Set())

    // Infinite scroll
    const { ref: loadMoreRef, inView } = useInView({
        threshold: 0.1,
    })

    const loadMorePosts = useCallback(async () => {
        if (!nextCursor || isLoading) return

        setIsLoading(true)
        try {
            const result = await getGlobalFeed({ limit: 20, cursor: nextCursor })
            if (result.success && result.data) {
                setPosts(prev => [...prev, ...result.data!])
                setNextCursor(result.nextCursor)
            }
        } catch {
            toast.error('Failed to load more posts')
        } finally {
            setIsLoading(false)
        }
    }, [nextCursor, isLoading])

    useEffect(() => {
        if (inView) {
            loadMorePosts()
        }
    }, [inView, loadMorePosts])

    const refreshFeed = async () => {
        setIsRefreshing(true)
        try {
            if (activeTab === 'for-you') {
                const result = await getGlobalFeed({ limit: 20 })
                if (result.success && result.data) {
                    setPosts(result.data)
                    setNextCursor(result.nextCursor)
                    toast.success('Feed refreshed!')
                }
            } else {
                const result = await getFollowingFeed({ limit: 20 })
                if (result.success && result.data) {
                    setFollowingPosts(result.data)
                    setFollowingCursor(result.nextCursor)
                    toast.success('Feed refreshed!')
                }
            }
        } catch {
            toast.error('Failed to refresh feed')
        } finally {
            setIsRefreshing(false)
        }
    }

    const loadFollowingFeed = async () => {
        if (followingLoaded) return
        setIsLoading(true)
        try {
            const result = await getFollowingFeed({ limit: 20 })
            if (result.success && result.data) {
                setFollowingPosts(result.data)
                setFollowingCursor(result.nextCursor)
                setFollowingLoaded(true)
            }
        } catch {
            toast.error('Failed to load following feed')
        } finally {
            setIsLoading(false)
        }
    }

    const loadMoreFollowing = useCallback(async () => {
        if (!followingCursor || isLoading) return

        setIsLoading(true)
        try {
            const result = await getFollowingFeed({ limit: 20, cursor: followingCursor })
            if (result.success && result.data) {
                setFollowingPosts(prev => [...prev, ...result.data!])
                setFollowingCursor(result.nextCursor)
            }
        } catch {
            toast.error('Failed to load more posts')
        } finally {
            setIsLoading(false)
        }
    }, [followingCursor, isLoading])

    const handleTabChange = (value: string) => {
        setActiveTab(value as 'for-you' | 'following')
        if (value === 'following' && !followingLoaded) {
            loadFollowingFeed()
        }
    }

    const handleJoinCommunity = async (communityId: string) => {
        setLoadingCommunities(prev => new Set(prev).add(communityId))
        try {
            const result = await joinCommunity(communityId)
            if (result.success) {
                setJoinedCommunities(prev => new Set(prev).add(communityId))
                toast.success(result.message || 'Joined community!')
            } else {
                toast.error(result.error || 'Failed to join')
            }
        } catch {
            toast.error('Something went wrong')
        } finally {
            setLoadingCommunities(prev => {
                const next = new Set(prev)
                next.delete(communityId)
                return next
            })
        }
    }

    const handleLeaveCommunity = async (communityId: string) => {
        setLoadingCommunities(prev => new Set(prev).add(communityId))
        try {
            const result = await leaveCommunity(communityId)
            if (result.success) {
                setJoinedCommunities(prev => {
                    const next = new Set(prev)
                    next.delete(communityId)
                    return next
                })
                toast.success('Left community')
            } else {
                toast.error(result.error || 'Failed to leave')
            }
        } catch {
            toast.error('Something went wrong')
        } finally {
            setLoadingCommunities(prev => {
                const next = new Set(prev)
                next.delete(communityId)
                return next
            })
        }
    }

    return (
        <div className="min-h-screen bg-white dark:bg-neutral-950">
            <div className="flex">
                <CommunitySidebar userCommunities={userCommunities} />
                <main className="flex-1 min-w-0">
                    <div className="max-w-3xl mx-auto px-4 py-6">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
                                    Your Feed
                                </h1>
                                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                    Posts from communities you've joined
                                </p>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={refreshFeed}
                                disabled={isRefreshing}
                                className="gap-2"
                            >
                                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                                Refresh
                            </Button>
                        </div>
                        <Tabs defaultValue="for-you" onValueChange={handleTabChange} className="mb-6">
                            <TabsList className="grid w-full max-w-xs grid-cols-2">
                                <TabsTrigger value="for-you" className="gap-2">
                                    <Home className="w-4 h-4" />
                                    For You
                                </TabsTrigger>
                                <TabsTrigger value="following" className="gap-2">
                                    <UserCheck className="w-4 h-4" />
                                    Following
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>
                        {
                            userCommunities.length < 3 && featuredCommunities.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mb-8"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <Sparkles className="w-5 h-5 text-amber-500" />
                                            <h2 className="font-semibold text-neutral-900 dark:text-white">
                                                Suggested Communities
                                            </h2>
                                        </div>
                                        <Link href="/community/discover">
                                            <Button variant="ghost" size="sm" className="text-neutral-500 gap-1">
                                                See all
                                                <ChevronRight className="w-4 h-4" />
                                            </Button>
                                        </Link>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {
                                            featuredCommunities.slice(0, 2).map((community) => (
                                                <CommunityCard
                                                    key={community.id}
                                                    community={community}
                                                    isMember={joinedCommunities.has(community.id)}
                                                    onJoin={() => handleJoinCommunity(community.id)}
                                                    onLeave={() => handleLeaveCommunity(community.id)}
                                                    loading={loadingCommunities.has(community.id)}
                                                />
                                            ))
                                        }
                                    </div>
                                </motion.div>
                            )
                        }
                        {
                            userCommunities.length > 0 && (
                                <div className="mb-6">
                                    <PostComposer
                                        communityId={userCommunities[0].id}
                                        communitySlug={userCommunities[0].slug}
                                        user={user}
                                        onPostCreated={refreshFeed}
                                    />
                                </div>
                            )
                        }
                        <div className="space-y-4">
                            {
                                activeTab === 'for-you' ? (
                                    <>
                                        {
                                            posts.length === 0 ? (
                                                <motion.div
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    className="text-center py-16"
                                                >
                                                    <Users className="w-16 h-16 mx-auto text-neutral-300 dark:text-neutral-700 mb-4" />
                                                    <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
                                                        No posts yet
                                                    </h3>
                                                    <p className="text-neutral-500 dark:text-neutral-400 mb-6 max-w-md mx-auto">
                                                        Join some communities to see posts from fellow developers!
                                                    </p>
                                                    <Link href="/community/discover">
                                                        <Button className="bg-neutral-900 dark:bg-white text-white dark:text-neutral-900">
                                                            <Users className="w-4 h-4 mr-2" />
                                                            Discover Communities
                                                        </Button>
                                                    </Link>
                                                </motion.div>
                                            ) : (
                                                <AnimatePresence>
                                                    {
                                                        posts.map((post, index) => (
                                                            <motion.div
                                                                key={post.id}
                                                                initial={{ opacity: 0, y: 20 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                transition={{ delay: index * 0.05 }}
                                                            >
                                                                <PostCard
                                                                    post={post as any}
                                                                    showCommunity
                                                                />
                                                            </motion.div>
                                                        ))
                                                    }
                                                </AnimatePresence>
                                            )
                                        }
                                        {
                                            nextCursor && (
                                                <div ref={loadMoreRef} className="py-8 flex justify-center">
                                                    {
                                                        isLoading && (
                                                            <Loader2 className="w-6 h-6 animate-spin text-neutral-400" />
                                                        )
                                                    }
                                                </div>
                                            )
                                        }
                                        {
                                            !nextCursor && posts.length > 0 && (
                                                <p className="text-center text-sm text-neutral-400 py-8">
                                                    You've reached the end
                                                </p>
                                            )
                                        }
                                    </>
                                ) : (
                                    <>
                                        {
                                            isLoading && !followingLoaded ? (
                                                <div className="py-16 flex justify-center">
                                                    <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
                                                </div>
                                            ) : followingPosts.length === 0 ? (
                                                <motion.div
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    className="text-center py-16"
                                                >
                                                    <UserCheck className="w-16 h-16 mx-auto text-neutral-300 dark:text-neutral-700 mb-4" />
                                                    <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
                                                        No posts from following
                                                    </h3>
                                                    <p className="text-neutral-500 dark:text-neutral-400 mb-6 max-w-md mx-auto">
                                                        Follow some users to see their posts here!
                                                    </p>
                                                    <Link href="/community/discover">
                                                        <Button className="bg-neutral-900 dark:bg-white text-white dark:text-neutral-900">
                                                            <Users className="w-4 h-4 mr-2" />
                                                            Discover People
                                                        </Button>
                                                    </Link>
                                                </motion.div>
                                            ) : (
                                                <AnimatePresence>
                                                    {
                                                        followingPosts.map((post, index) => (
                                                            <motion.div
                                                                key={post.id}
                                                                initial={{ opacity: 0, y: 20 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                transition={{ delay: index * 0.05 }}
                                                            >
                                                                <PostCard
                                                                    post={post as any}
                                                                    showCommunity
                                                                />
                                                            </motion.div>
                                                        ))
                                                    }
                                                </AnimatePresence>
                                            )
                                        }
                                        {
                                            followingCursor && followingPosts.length > 0 && (
                                                <div className="py-8 flex justify-center">
                                                    <Button
                                                        variant="outline"
                                                        onClick={loadMoreFollowing}
                                                        disabled={isLoading}
                                                    >
                                                        {isLoading ? (
                                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                        ) : null}
                                                        Load More
                                                    </Button>
                                                </div>
                                            )
                                        }
                                        {
                                            !followingCursor && followingPosts.length > 0 && (
                                                <p className="text-center text-sm text-neutral-400 py-8">
                                                    You've reached the end
                                                </p>
                                            )
                                        }
                                    </>
                                )
                            }
                        </div>
                    </div>
                </main>
                <aside className="w-80 flex-shrink-0 hidden xl:block border-l border-neutral-200 dark:border-neutral-800">
                    <div className="sticky top-20 p-4 space-y-6">
                        <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                            <div className="flex items-center gap-2 mb-4">
                                <TrendingUp className="w-5 h-5 text-blue-500" />
                                <h3 className="font-semibold text-neutral-900 dark:text-white">Trending</h3>
                            </div>
                            <div className="space-y-3">
                                {
                                    ['#react', '#nextjs', '#typescript', '#dsa', '#interview'].map((tag, index) => (
                                        <Link
                                            key={tag}
                                            href={`/community/search?q=${tag}`}
                                            className="flex items-center justify-between group"
                                        >
                                            <span className="text-sm text-neutral-600 dark:text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors">
                                                {tag}
                                            </span>
                                            <span className="text-xs text-neutral-400">
                                                {Math.floor(Math.random() * 50 + 10)} posts
                                            </span>
                                        </Link>
                                    ))
                                }
                            </div>
                        </div>
                        <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                <h3 className="font-semibold text-neutral-900 dark:text-white">Active Now</h3>
                            </div>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                Start chatting with active members coming soon!
                            </p>
                        </div>
                        <div className="space-y-2">
                            <Link href="/community/discover">
                                <Button variant="outline" className="w-full justify-start gap-2">
                                    <Users className="w-4 h-4" />
                                    Discover Communities
                                </Button>
                            </Link>
                            <Link href="/community/create">
                                <Button variant="outline" className="w-full justify-start gap-2">
                                    <Plus className="w-4 h-4" />
                                    Create Community
                                </Button>
                            </Link>
                        </div>
                    </div>
                </aside>
            </div>
            <MagicSheet />
        </div>
    )
}