'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Loader2, RefreshCw } from 'lucide-react'
import { Button } from '@repo/ui/components/ui/button'
import { PostCard } from '@/components/community/post-card'
import { PostComposer } from '@/components/community/post-composer'
import { CommunityCard } from '@/components/community/community-card'
import { getGlobalFeed } from '@/actions/(main)/community/post.action'
import { joinCommunity } from '@/actions/(main)/community/community.action'
import toast from '@repo/ui/components/ui/sonner'
import { CommunityPostType } from '@prisma/client'

interface CommunityFeedProps {
    user: {
        id: string
        name: string | null
        image: string | null
    }
    featuredCommunities?: Array<{
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
        _count?: {
            members: number
            posts: number
        }
    }>
    communityId?: string
    communitySlug?: string
}

interface Post {
    id: string
    title?: string | null
    content: string
    type: CommunityPostType
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
}

export function CommunityFeed({ user, featuredCommunities = [], communityId, communitySlug }: CommunityFeedProps) {
    const [posts, setPosts] = useState<Post[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isLoadingMore, setIsLoadingMore] = useState(false)
    const [hasMore, setHasMore] = useState(true)
    const [cursor, setCursor] = useState<string | undefined>()
    const [joiningCommunity, setJoiningCommunity] = useState<string | null>(null)

    const loadPosts = useCallback(async (loadMore = false) => {
        if (loadMore) {
            setIsLoadingMore(true)
        } else {
            setIsLoading(true)
        }

        try {
            const result = await getGlobalFeed({ limit: 20, cursor: loadMore ? cursor : undefined })

            if (result.success && result.data) {
                if (loadMore) {
                    setPosts(prev => [...prev, ...result.data])
                } else {
                    setPosts(result.data)
                }
                setCursor(result.nextCursor)
                setHasMore(!!result.nextCursor)
            }
        } catch (error) {
            toast.error('Failed to load posts')
        } finally {
            setIsLoading(false)
            setIsLoadingMore(false)
        }
    }, [cursor])

    useEffect(() => {
        loadPosts()
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    const handleJoinCommunity = async (communityIdToJoin: string) => {
        setJoiningCommunity(communityIdToJoin)
        try {
            const result = await joinCommunity(communityIdToJoin)
            if (result.success) {
                toast.success(result.message || 'Joined successfully!')
            } else {
                toast.error(result.error || 'Failed to join')
            }
        } catch {
            toast.error('Something went wrong')
        } finally {
            setJoiningCommunity(null)
        }
    }

    const handleRefresh = () => {
        setCursor(undefined)
        loadPosts(false)
    }

    const handlePostCreated = () => {
        handleRefresh()
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {
                communityId && communitySlug && (
                    <PostComposer
                        communityId={communityId}
                        communitySlug={communitySlug}
                        user={user}
                        onPostCreated={handlePostCreated}
                    />
                )
            }
            {
                posts.length === 0 && !communityId && featuredCommunities.length > 0 && (
                    <div className="space-y-4">
                        <div className="text-center py-8">
                            <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
                                Welcome to the Community!
                            </h2>
                            <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                                Join some communities to see posts in your feed
                            </p>
                        </div>
                        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                            Suggested Communities
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {
                                featuredCommunities.slice(0, 4).map((community) => (
                                    <CommunityCard
                                        key={community.id}
                                        community={community}
                                        onJoin={() => handleJoinCommunity(community.id)}
                                        loading={joiningCommunity === community.id}
                                    />
                                ))
                            }
                        </div>
                    </div>
                )
            }
            {
                posts.length > 0 && (
                    <div className="flex justify-center">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleRefresh}
                            className="gap-2 rounded-full"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Refresh
                        </Button>
                    </div>
                )
            }
            <div className="space-y-4">
                {
                    posts.map((post, index) => (
                        <motion.div
                            key={post.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <PostCard
                                post={post}
                                showCommunity={!communityId}
                            />
                        </motion.div>
                    ))
                }
            </div>
            {
                hasMore && posts.length > 0 && (
                    <div className="flex justify-center pt-4">
                        <Button
                            variant="outline"
                            onClick={() => loadPosts(true)}
                            disabled={isLoadingMore}
                            className="rounded-full"
                        >
                            {
                                isLoadingMore ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Loading...
                                    </>
                                ) : (
                                    'Load More'
                                )
                            }
                        </Button>
                    </div>
                )
            }
            {
                posts.length === 0 && communityId && (
                    <div className="text-center py-12">
                        <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                            No posts yet. Be the first to share something!
                        </p>
                    </div>
                )
            }
        </div>
    )
}