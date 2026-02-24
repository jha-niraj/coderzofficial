'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import {
    Users, Sparkles, ChevronRight, RefreshCw, Plus,
    Loader2, CheckCircle2, Settings, TrendingUp, Eye,
    ChevronDown, MessageSquare
} from 'lucide-react'
import { Button } from '@repo/ui/components/ui/button'
import { Badge } from '@repo/ui/components/ui/badge'
import { ScrollArea } from '@repo/ui/components/ui/scroll-area'
import {
    Collapsible, CollapsibleContent, CollapsibleTrigger
} from '@repo/ui/components/ui/collapsible'
import { CommunityCard } from '@/components/community/community-card'
import { PostCard } from '@/components/community/post-card'
import { PostComposer } from '@/components/community/post-composer'
import { MagicSheet } from '@/components/community/magic-sheet'
import { JoinCommunitySheet } from '@/components/community/join-community-sheet'
import {
    getGlobalFeed
} from '@/actions/(main)/community/post.action'
import {
    joinCommunity, leaveCommunity
} from '@/actions/(main)/community/community.action'
import { useCommunityStore, type CommunityBasic } from '@/app/store/communityStore'
import toast from '@repo/ui/components/ui/sonner'
import { useInView } from 'react-intersection-observer'
import CreateCommunitySheet from '@/components/community/create-community-sheet'
import { cn } from '@repo/ui/lib/utils'

// Type for PostCard to avoid 'as any' casts
type PostCardPost = Parameters<typeof PostCard>[0]['post']

interface CommunityHubClientProps {
    user: {
        id: string | null
        name: string | null
        image: string | null
    }
    userCommunities: Array<{
        id: string
        name: string
        slug: string
        description: string
        shortDescription?: string | null
        logo?: string | null
        coverImage?: string | null
        themeColor: string
        category: string
        visibility: string
        isVerified: boolean
        memberCount: number
        postCount: number
        tags: string[]
        enabledSections: string[]
        rules: string[]
        joinQuestions: string[]
        userRole?: string
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
        visibility: string
        isVerified: boolean
        memberCount: number
        postCount: number
        tags: string[]
        enabledSections: string[]
        rules: string[]
        joinQuestions: string[]
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
    // Zustand store
    const {
        userCommunities: storeCommunities,
        selectedCommunityId,
        posts: storePosts,
        isLoadingPosts,
        postsCursor,
        selectCommunity,
        fetchPosts,
        loadMorePosts: storeLoadMore,
        fetchUserCommunities
    } = useCommunityStore()

    // Local state for global feed (when no community selected)
    const [globalPosts, setGlobalPosts] = useState(initialPosts)
    const [globalCursor, setGlobalCursor] = useState(initialNextCursor)
    const [isLoadingGlobal, setIsLoadingGlobal] = useState(false)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [myCommunitiesOpen, setMyCommunitiesOpen] = useState(true)

    // Join sheet
    const [joinSheetOpen, setJoinSheetOpen] = useState(false)
    const [joinSheetCommunity, setJoinSheetCommunity] = useState<CommunityBasic | null>(null)

    // Loading states for featured community join/leave
    const [joinedCommunities, setJoinedCommunities] = useState<Set<string>>(
        new Set(userCommunities.map(c => c.id))
    )
    const [loadingCommunities, setLoadingCommunities] = useState<Set<string>>(new Set())

    // Initialize store with server data
    useEffect(() => {
        if (storeCommunities.length === 0 && userCommunities.length > 0) {
            fetchUserCommunities()
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // Derive which communities list to use
    const communities = storeCommunities.length > 0 ? storeCommunities : (userCommunities as unknown as CommunityBasic[])
    const selectedCommunity = selectedCommunityId
        ? communities.find(c => c.id === selectedCommunityId) || null
        : null

    // Posts to display
    const displayPosts = selectedCommunityId ? storePosts : globalPosts
    const isLoadingAny = selectedCommunityId ? isLoadingPosts : isLoadingGlobal
    const hasMore = selectedCommunityId ? !!postsCursor : !!globalCursor

    // Infinite scroll
    const { ref: loadMoreRef, inView } = useInView({ threshold: 0.1 })

    const loadMore = useCallback(async () => {
        if (isLoadingAny) return
        if (selectedCommunityId) {
            storeLoadMore(selectedCommunityId)
        } else {
            if (!globalCursor) return
            setIsLoadingGlobal(true)
            try {
                const result = await getGlobalFeed({ limit: 20, cursor: globalCursor })
                if (result.success && result.data) {
                    setGlobalPosts(prev => [...prev, ...result.data!])
                    setGlobalCursor(result.nextCursor)
                }
            } catch {
                toast.error('Failed to load more posts')
            } finally {
                setIsLoadingGlobal(false)
            }
        }
    }, [selectedCommunityId, globalCursor, isLoadingAny, storeLoadMore])

    useEffect(() => {
        if (inView && hasMore) loadMore()
    }, [inView, hasMore, loadMore])

    const refreshFeed = async () => {
        setIsRefreshing(true)
        try {
            if (selectedCommunityId) {
                await fetchPosts(selectedCommunityId)
            } else {
                const result = await getGlobalFeed({ limit: 20 })
                if (result.success && result.data) {
                    setGlobalPosts(result.data)
                    setGlobalCursor(result.nextCursor)
                }
            }
            toast.success('Feed refreshed!')
        } catch {
            toast.error('Failed to refresh')
        } finally {
            setIsRefreshing(false)
        }
    }

    const handleSelectCommunity = (communityId: string | null) => {
        selectCommunity(communityId)
    }

    const handleJoinFeatured = async (communityId: string) => {
        setLoadingCommunities(prev => new Set(prev).add(communityId))
        try {
            const result = await joinCommunity(communityId)
            if (result.success) {
                setJoinedCommunities(prev => new Set(prev).add(communityId))
                fetchUserCommunities()
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

    const handleLeaveFeatured = async (communityId: string) => {
        setLoadingCommunities(prev => new Set(prev).add(communityId))
        try {
            const result = await leaveCommunity(communityId)
            if (result.success) {
                setJoinedCommunities(prev => {
                    const next = new Set(prev)
                    next.delete(communityId)
                    return next
                })
                fetchUserCommunities()
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

    const openJoinSheet = (community: CommunityBasic) => {
        setJoinSheetCommunity(community)
        setJoinSheetOpen(true)
    }

    // ==================== LEFT SIDEBAR ====================
    const renderLeftSidebar = () => (
        <aside className="w-72 flex-shrink-0 border-r border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 h-screen sticky top-0 hidden lg:block">
            <ScrollArea className="h-full">
                <div className="p-4 space-y-4">
                    {/* Selected community branding */}
                    {selectedCommunity ? (
                        <div className="space-y-3">
                            <div
                                className="h-20 rounded-xl relative overflow-hidden"
                                style={{
                                    background: selectedCommunity.coverImage
                                        ? `url(${selectedCommunity.coverImage}) center/cover`
                                        : `linear-gradient(135deg, ${selectedCommunity.themeColor}60, ${selectedCommunity.themeColor}30)`
                                }}
                            >
                                <div className="absolute bottom-2 left-3">
                                    <div
                                        className="w-10 h-10 rounded-lg border-2 border-white dark:border-neutral-900 flex items-center justify-center text-sm font-bold shadow overflow-hidden"
                                        style={{ backgroundColor: selectedCommunity.themeColor }}
                                    >
                                        {selectedCommunity.logo ? (
                                            <Image src={selectedCommunity.logo} alt={selectedCommunity.name} width={40} height={40} className="object-cover" />
                                        ) : (
                                            <span className="text-white">{selectedCommunity.name.charAt(0)}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div>
                                <div className="flex items-center gap-1.5">
                                    <h3 className="font-semibold text-sm text-neutral-900 dark:text-white truncate">
                                        {selectedCommunity.name}
                                    </h3>
                                    {selectedCommunity.isVerified && (
                                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                                    )}
                                </div>
                                <p className="text-xs text-neutral-500 line-clamp-2 mt-0.5">
                                    {selectedCommunity.shortDescription || selectedCommunity.description}
                                </p>
                                <div className="flex items-center gap-3 mt-2 text-xs text-neutral-400">
                                    <span className="flex items-center gap-1">
                                        <Users className="w-3 h-3" />
                                        {(selectedCommunity._count?.members ?? selectedCommunity.memberCount).toLocaleString()}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <MessageSquare className="w-3 h-3" />
                                        {(selectedCommunity._count?.posts ?? selectedCommunity.postCount).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Link href={`/communities/${selectedCommunity.slug}`} className="flex-1">
                                    <Button variant="outline" size="sm" className="w-full text-xs gap-1">
                                        <Eye className="w-3 h-3" />
                                        View Page
                                    </Button>
                                </Link>
                                {(selectedCommunity.userRole === 'OWNER' || selectedCommunity.userRole === 'ADMIN') && (
                                    <Link href={`/communities/${selectedCommunity.slug}?tab=settings`}>
                                        <Button variant="outline" size="sm" className="text-xs">
                                            <Settings className="w-3 h-3" />
                                        </Button>
                                    </Link>
                                )}
                            </div>
                            <div className="h-px bg-neutral-200 dark:bg-neutral-800" />
                            <Button
                                variant="ghost"
                                size="sm"
                                className="w-full justify-start text-xs text-neutral-500 gap-2"
                                onClick={() => handleSelectCommunity(null)}
                            >
                                ← Back to all communities
                            </Button>
                        </div>
                    ) : (
                        <>
                            {/* Navigation */}
                            <nav className="space-y-1">
                                <motion.div
                                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white"
                                    whileHover={{ x: 2 }}
                                >
                                    <MessageSquare className="w-5 h-5" />
                                    <span className="font-medium text-sm">Feed</span>
                                </motion.div>
                                <Link href="/communities/discover">
                                    <motion.div
                                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                                        whileHover={{ x: 2 }}
                                    >
                                        <TrendingUp className="w-5 h-5" />
                                        <span className="font-medium text-sm">Discover</span>
                                    </motion.div>
                                </Link>
                            </nav>
                            <div className="h-px bg-neutral-200 dark:bg-neutral-800" />
                        </>
                    )}

                    {/* My communities list */}
                    <Collapsible open={myCommunitiesOpen} onOpenChange={setMyCommunitiesOpen}>
                        <CollapsibleTrigger asChild>
                            <button className="cursor-pointer flex items-center justify-between w-full px-3 py-2 text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300">
                                <span>My Communities</span>
                                <div className="flex items-center gap-2">
                                    <Badge variant="secondary" className="text-xs">
                                        {communities.length}
                                    </Badge>
                                    <ChevronDown className={cn(
                                        "w-4 h-4 transition-transform",
                                        myCommunitiesOpen && "rotate-180"
                                    )} />
                                </div>
                            </button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="space-y-1 mt-1">
                            {communities.length > 0 ? (
                                communities.map((community) => (
                                    <motion.div
                                        key={community.id}
                                        className={cn(
                                            "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors cursor-pointer",
                                            selectedCommunityId === community.id
                                                ? "bg-neutral-100 dark:bg-neutral-800"
                                                : "hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                                        )}
                                        whileHover={{ x: 2 }}
                                        onClick={() => handleSelectCommunity(community.id)}
                                    >
                                        <div
                                            className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-medium flex-shrink-0"
                                            style={{
                                                background: community.logo
                                                    ? `url(${community.logo}) center/cover`
                                                    : community.themeColor
                                            }}
                                        >
                                            {!community.logo && community.name.charAt(0)}
                                        </div>
                                        <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300 truncate">
                                            {community.name}
                                        </span>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="px-3 py-4 text-center">
                                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-3">
                                        You haven&apos;t joined any communities yet
                                    </p>
                                    <Link href="/communities/discover">
                                        <Button variant="outline" size="sm" className="gap-2">
                                            <Eye className="w-4 h-4" />
                                            Explore
                                        </Button>
                                    </Link>
                                </div>
                            )}
                            <CreateCommunitySheet
                                trigger={
                                    <motion.div
                                        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-neutral-300 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400 hover:border-neutral-400 dark:hover:border-neutral-600 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors mt-2 cursor-pointer"
                                        whileHover={{ scale: 1.01 }}
                                    >
                                        <Plus className="w-4 h-4" />
                                        <span className="text-sm">Create Community</span>
                                    </motion.div>
                                }
                            />
                        </CollapsibleContent>
                    </Collapsible>
                </div>
            </ScrollArea>
        </aside>
    )

    // ==================== CENTER CONTENT ====================
    const renderCenterContent = () => (
        <main className="flex-1 min-w-0">
            <div className="w-full max-w-2xl mx-auto px-4 py-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
                            {selectedCommunity ? selectedCommunity.name : 'Your Feed'}
                        </h1>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            {selectedCommunity
                                ? selectedCommunity.shortDescription || selectedCommunity.description
                                : 'Posts from communities you\'ve joined'
                            }
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

                {/* Suggested communities (only when no community selected and user has < 3) */}
                {!selectedCommunityId && communities.length < 3 && featuredCommunities.length > 0 && (
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
                            <Link href="/communities/discover">
                                <Button variant="ghost" size="sm" className="text-neutral-500 gap-1">
                                    See all
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {featuredCommunities.slice(0, 2).map((community) => (
                                <CommunityCard
                                    key={community.id}
                                    community={community}
                                    isMember={joinedCommunities.has(community.id)}
                                    onJoin={() => {
                                        const hasQuestions = community.joinQuestions && community.joinQuestions.length > 0
                                        if (hasQuestions || community.visibility === 'RESTRICTED') {
                                            openJoinSheet(community as unknown as CommunityBasic)
                                        } else {
                                            handleJoinFeatured(community.id)
                                        }
                                    }}
                                    onLeave={() => handleLeaveFeatured(community.id)}
                                    loading={loadingCommunities.has(community.id)}
                                />
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Post composer */}
                {communities.length > 0 && (
                    <div className="mb-6">
                        <PostComposer
                            communityId={selectedCommunityId || (communities[0]?.id ?? '')}
                            communitySlug={selectedCommunity?.slug || communities[0]?.slug}
                            user={user}
                            onPostCreated={refreshFeed}
                        />
                    </div>
                )}

                {/* Posts feed */}
                <div className="space-y-4">
                    {displayPosts.length === 0 ? (
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
                                {selectedCommunityId
                                    ? 'Be the first to post in this community!'
                                    : 'Join some communities to see posts from fellow developers!'
                                }
                            </p>
                            {!selectedCommunityId && (
                                <Link href="/communities/discover">
                                    <Button className="bg-neutral-900 dark:bg-white text-white dark:text-neutral-900">
                                        <Users className="w-4 h-4 mr-2" />
                                        Discover Communities
                                    </Button>
                                </Link>
                            )}
                        </motion.div>
                    ) : (
                        <AnimatePresence>
                            {displayPosts.map((post, index) => (
                                <motion.div
                                    key={post.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: Math.min(index * 0.05, 0.5) }}
                                >
                                    <PostCard
                                        post={post as unknown as PostCardPost}
                                        showCommunity={!selectedCommunityId}
                                    />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    )}

                    {hasMore && (
                        <div ref={loadMoreRef} className="py-8 flex justify-center">
                            {isLoadingAny && (
                                <Loader2 className="w-6 h-6 animate-spin text-neutral-400" />
                            )}
                        </div>
                    )}
                    {!hasMore && displayPosts.length > 0 && (
                        <p className="text-center text-sm text-neutral-400 py-8">
                            You&apos;ve reached the end
                        </p>
                    )}
                </div>
            </div>
        </main>
    )

    // ==================== RIGHT SIDEBAR ====================
    const renderRightSidebar = () => (
        <aside className="w-80 flex-shrink-0 hidden xl:block border-l border-neutral-200 dark:border-neutral-800">
            <div className="sticky top-0 p-4 space-y-6">
                {selectedCommunity ? (
                    <>
                        {/* Community stats */}
                        <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                            <h3 className="font-semibold text-neutral-900 dark:text-white mb-3">About</h3>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4 line-clamp-3">
                                {selectedCommunity.description}
                            </p>
                            <div className="grid grid-cols-2 gap-4 text-center">
                                <div>
                                    <div className="text-2xl font-bold text-neutral-900 dark:text-white">
                                        {(selectedCommunity._count?.members ?? selectedCommunity.memberCount).toLocaleString()}
                                    </div>
                                    <div className="text-xs text-neutral-500">Members</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-neutral-900 dark:text-white">
                                        {(selectedCommunity._count?.posts ?? selectedCommunity.postCount).toLocaleString()}
                                    </div>
                                    <div className="text-xs text-neutral-500">Posts</div>
                                </div>
                            </div>
                        </div>

                        {/* Community rules */}
                        {selectedCommunity.rules && selectedCommunity.rules.length > 0 && (
                            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                                <h3 className="font-semibold text-neutral-900 dark:text-white mb-3">Rules</h3>
                                <ol className="space-y-2">
                                    {selectedCommunity.rules.map((rule, index) => (
                                        <li key={index} className="flex gap-2 text-sm">
                                            <span className="font-medium text-neutral-500">{index + 1}.</span>
                                            <span className="text-neutral-600 dark:text-neutral-400">{rule}</span>
                                        </li>
                                    ))}
                                </ol>
                            </div>
                        )}

                        {/* Tags */}
                        {selectedCommunity.tags && selectedCommunity.tags.length > 0 && (
                            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                                <h3 className="font-semibold text-neutral-900 dark:text-white mb-3">Tags</h3>
                                <div className="flex flex-wrap gap-2">
                                    {selectedCommunity.tags.map((tag) => (
                                        <Badge key={tag} variant="secondary" className="text-xs">
                                            #{tag}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <>
                        {/* Trending */}
                        <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                            <div className="flex items-center gap-2 mb-4">
                                <TrendingUp className="w-5 h-5 text-blue-500" />
                                <h3 className="font-semibold text-neutral-900 dark:text-white">Trending</h3>
                            </div>
                            <div className="space-y-3">
                                {['#react', '#nextjs', '#typescript', '#dsa', '#interview'].map((tag) => (
                                    <Link
                                        key={tag}
                                        href={`/communities/discover?q=${tag}`}
                                        className="flex items-center justify-between group"
                                    >
                                        <span className="text-sm text-neutral-600 dark:text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors">
                                            {tag}
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Quick actions */}
                        <div className="space-y-2">
                            <Link href="/communities/discover">
                                <Button variant="outline" className="w-full justify-start gap-2">
                                    <Users className="w-4 h-4" />
                                    Discover Communities
                                </Button>
                            </Link>
                            <CreateCommunitySheet
                                trigger={
                                    <motion.div
                                        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-neutral-300 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400 hover:border-neutral-400 dark:hover:border-neutral-600 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors mt-2 cursor-pointer"
                                        whileHover={{ scale: 1.01 }}
                                    >
                                        <Plus className="w-4 h-4" />
                                        <span className="text-sm">Create Community</span>
                                    </motion.div>
                                }
                            />
                        </div>
                    </>
                )}
            </div>
        </aside>
    )

    return (
        <div className="min-h-screen bg-white dark:bg-neutral-950">
            <div className="flex">
                {renderLeftSidebar()}
                {renderCenterContent()}
                {renderRightSidebar()}
            </div>
            <MagicSheet />
            {joinSheetCommunity && (
                <JoinCommunitySheet
                    open={joinSheetOpen}
                    onOpenChange={setJoinSheetOpen}
                    community={joinSheetCommunity}
                />
            )}
        </div>
    )
}
