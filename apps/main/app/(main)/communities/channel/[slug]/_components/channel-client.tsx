'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    RefreshCw, Loader2, Plus, MessageSquare
} from 'lucide-react'
import { Button } from '@repo/ui/components/ui/button'
import { Badge } from '@repo/ui/components/ui/badge'
import { CommunitySidebar } from '@/components/community/community-sidebar'
import { PostCard } from '@/components/community/post-card'
import { ChannelPostComposer } from './channel-post-composer'
import { getChannelPosts } from '@/actions/(main)/community/channel.action'
import toast from '@repo/ui/components/ui/sonner'
import { useInView } from 'react-intersection-observer'

interface ChannelPageClientProps {
    user: {
        id: string
        name: string | null
        image: string | null
    }
    channel: {
        slug: string
        name: string
        icon: string
        description: string
    }
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
    userCommunities: Array<{
        id: string
        name: string
        slug: string
        logo?: string | null
        themeColor: string
        userRole?: string
    }>
    nextCursor?: string
}

export function ChannelPageClient({
    user,
    channel,
    initialPosts,
    userCommunities,
    nextCursor: initialCursor
}: ChannelPageClientProps) {
    const [posts, setPosts] = useState(initialPosts)
    const [nextCursor, setNextCursor] = useState(initialCursor)
    const [isLoading, setIsLoading] = useState(false)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [showComposer, setShowComposer] = useState(false)

    const { ref: loadMoreRef, inView } = useInView({ threshold: 0.1 })

    const loadMorePosts = useCallback(async () => {
        if (!nextCursor || isLoading) return

        setIsLoading(true)
        try {
            const result = await getChannelPosts(channel.slug, { limit: 20, cursor: nextCursor })
            if (result.success && result.data) {
                setPosts(prev => [...prev, ...result.data!])
                setNextCursor(result.nextCursor)
            }
        } catch {
            toast.error('Failed to load more posts')
        } finally {
            setIsLoading(false)
        }
    }, [nextCursor, isLoading, channel.slug])

    useEffect(() => {
        if (inView) {
            loadMorePosts()
        }
    }, [inView, loadMorePosts])

    const refreshPosts = async () => {
        setIsRefreshing(true)
        try {
            const result = await getChannelPosts(channel.slug, { limit: 30 })
            if (result.success && result.data) {
                setPosts(result.data)
                setNextCursor(result.nextCursor)
                toast.success('Posts refreshed!')
            }
        } catch {
            toast.error('Failed to refresh posts')
        } finally {
            setIsRefreshing(false)
        }
    }

    const handlePostCreated = () => {
        setShowComposer(false)
        refreshPosts()
    }

    return (
        <div className="min-h-screen bg-white dark:bg-neutral-950">
            <div className="flex">
                <CommunitySidebar userCommunities={userCommunities} />
                <main className="flex-1 min-w-0">
                    <div className="max-w-3xl mx-auto px-4 py-6">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="text-4xl">{channel.icon}</div>
                                <div>
                                    <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
                                        {channel.name}
                                    </h1>
                                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                        {channel.description}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
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
                                <Button
                                    size="sm"
                                    onClick={() => setShowComposer(!showComposer)}
                                    className="gap-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900"
                                >
                                    <Plus className="w-4 h-4" />
                                    New Post
                                </Button>
                            </div>
                        </div>
                        <AnimatePresence>
                            {
                                showComposer && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="mb-6"
                                    >
                                        <ChannelPostComposer
                                            channel={channel.slug}
                                            user={user}
                                            onSuccess={handlePostCreated}
                                            onCancel={() => setShowComposer(false)}
                                        />
                                    </motion.div>
                                )
                            }
                        </AnimatePresence>
                        <div className="flex items-center gap-4 mb-6 text-sm text-neutral-500 dark:text-neutral-400">
                            <Badge variant="secondary" className="gap-1">
                                <MessageSquare className="w-3 h-3" />
                                {posts.length} posts
                            </Badge>
                        </div>
                        {
                            posts.length === 0 ? (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-center py-16"
                                >
                                    <div className="text-6xl mb-4">{channel.icon}</div>
                                    <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
                                        No posts in {channel.name} yet
                                    </h3>
                                    <p className="text-neutral-500 dark:text-neutral-400 mb-6 max-w-md mx-auto">
                                        Be the first to share something!
                                    </p>
                                    <Button
                                        onClick={() => setShowComposer(true)}
                                        className="bg-neutral-900 dark:bg-white text-white dark:text-neutral-900"
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Create First Post
                                    </Button>
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
                                                >
                                                    <PostCard
                                                        post={post as any}
                                                        showCommunity
                                                    />
                                                </motion.div>
                                            ))
                                        }
                                    </AnimatePresence>
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
                                </div>
                            )
                        }
                    </div>
                </main>
                <aside className="w-80 flex-shrink-0 hidden xl:block border-l border-neutral-200 dark:border-neutral-800">
                    <div className="sticky top-20 p-4 space-y-6">
                        <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                            <div className="text-4xl mb-3">{channel.icon}</div>
                            <h3 className="font-semibold text-neutral-900 dark:text-white mb-2">
                                About {channel.name}
                            </h3>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                {channel.description}
                            </p>
                        </div>
                        <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                            <h3 className="font-semibold text-neutral-900 dark:text-white mb-3">
                                Guidelines
                            </h3>
                            <ul className="space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
                                <li>• Be respectful and constructive</li>
                                <li>• Stay on topic for this channel</li>
                                <li>• No spam or self-promotion</li>
                                <li>• Help others when you can</li>
                            </ul>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    )
}