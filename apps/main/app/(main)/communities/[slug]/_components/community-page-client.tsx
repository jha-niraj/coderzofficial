'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import {
    Users, MessageSquare, FileText, Calendar, Trophy, Settings, Bell, BellOff, Share2,
    MoreHorizontal, CheckCircle2, Lock, Globe, UserPlus, LogOut, Loader2, ChevronDown,
    RefreshCw, HelpCircle, Code2, Plus
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    Avatar, AvatarFallback, AvatarImage
} from '@/components/ui/avatar'
import {
    Tabs, TabsContent, TabsList, TabsTrigger
} from '@/components/ui/tabs'
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { PostCard } from '@/components/community/post-card'
import { PostComposer } from '@/components/community/post-composer'
import { CommunityInfoSidebar } from '@/components/community/community-sidebar'
import { MagicSheet } from '@/components/community/magic-sheet'
import { getCommunityPosts } from '@/actions/(main)/community/post.action'
import { joinCommunity, leaveCommunity } from '@/actions/(main)/community/community.action'
import { toast } from 'sonner'
import { cn } from '../../lib/utils'
import { useInView } from 'react-intersection-observer'

interface CommunityPageClientProps {
    community: {
        id: string
        name: string
        slug: string
        description: string
        shortDescription?: string | null
        coverImage?: string | null
        logo?: string | null
        themeColor: string
        category: string
        visibility: string
        isVerified: boolean
        memberCount: number
        postCount: number
        enabledSections: string[]
        rules: string[]
        tags: string[]
        createdAt: Date
        creator: {
            id: string
            name: string | null
            username: string | null
            image: string | null
        }
        channels: Array<{
            id: string
            name: string
            slug: string
            description?: string | null
            icon?: string | null
            type: string
        }>
        isMember?: boolean
        userRole?: string
    }
    user: {
        id: string
        name: string | null
        image: string | null
    } | null
    initialPosts: any[]
    initialResources: any[]
    members: any[]
    topContributors: Array<{
        id: string
        name: string | null
        username: string | null
        image: string | null
        helpfulCount: number
    }>
    nextCursor?: string
}

export function CommunityPageClient({
    community,
    user,
    initialPosts,
    initialResources,
    members,
    topContributors,
    nextCursor: initialNextCursor
}: CommunityPageClientProps) {
    const [posts, setPosts] = useState(initialPosts)
    const [nextCursor, setNextCursor] = useState(initialNextCursor)
    const [isLoading, setIsLoading] = useState(false)
    const [isMember, setIsMember] = useState(community.isMember ?? false)
    const [isJoining, setIsJoining] = useState(false)
    const [memberCount, setMemberCount] = useState(community.memberCount)
    const [activeTab, setActiveTab] = useState('feed')

    const isAdmin = community.userRole === 'OWNER' || community.userRole === 'ADMIN'

    // Infinite scroll
    const { ref: loadMoreRef, inView } = useInView({ threshold: 0.1 })

    const loadMorePosts = useCallback(async () => {
        if (!nextCursor || isLoading) return

        setIsLoading(true)
        try {
            const result = await getCommunityPosts(community.id, {
                limit: 20,
                cursor: nextCursor
            })
            if (result.success && result.data) {
                setPosts(prev => [...prev, ...result.data!])
                setNextCursor(result.nextCursor)
            }
        } catch {
            toast.error('Failed to load more posts')
        } finally {
            setIsLoading(false)
        }
    }, [community.id, nextCursor, isLoading])

    useEffect(() => {
        if (inView) {
            loadMorePosts()
        }
    }, [inView, loadMorePosts])

    const refreshPosts = async () => {
        try {
            const result = await getCommunityPosts(community.id, { limit: 20 })
            if (result.success && result.data) {
                setPosts(result.data)
                setNextCursor(result.nextCursor)
            }
        } catch {
            toast.error('Failed to refresh')
        }
    }

    const handleJoin = async () => {
        if (!user) {
            toast.error('Please sign in to join')
            return
        }

        setIsJoining(true)
        try {
            const result = await joinCommunity(community.id)
            if (result.success) {
                setIsMember(true)
                setMemberCount(prev => prev + 1)
                toast.success(result.message || 'Joined community!')
            } else {
                toast.error(result.error || 'Failed to join')
            }
        } catch {
            toast.error('Something went wrong')
        } finally {
            setIsJoining(false)
        }
    }

    const handleLeave = async () => {
        setIsJoining(true)
        try {
            const result = await leaveCommunity(community.id)
            if (result.success) {
                setIsMember(false)
                setMemberCount(prev => prev - 1)
                toast.success('Left community')
            } else {
                toast.error(result.error || 'Failed to leave')
            }
        } catch {
            toast.error('Something went wrong')
        } finally {
            setIsJoining(false)
        }
    }

    const getVisibilityIcon = () => {
        switch (community.visibility) {
            case 'PRIVATE':
                return <Lock className="w-4 h-4" />
            case 'RESTRICTED':
                return <UserPlus className="w-4 h-4" />
            default:
                return <Globe className="w-4 h-4" />
        }
    }

    return (
        <div className="min-h-screen bg-white dark:bg-neutral-950">
            <div className="relative">
                <div
                    className="h-48 md:h-64 bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-900"
                    style={community.coverImage ? {
                        backgroundImage: `url(${community.coverImage})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                    } : {
                        background: `linear-gradient(135deg, ${community.themeColor}40 0%, ${community.themeColor}20 100%)`
                    }}
                />
                <div className="max-w-7xl mx-auto px-4 -mt-16 relative z-10">
                    <div className="flex flex-col md:flex-row gap-6 items-start">
                        <div
                            className="w-28 h-28 md:w-32 md:h-32 rounded-2xl border-4 border-white dark:border-neutral-900 shadow-xl flex items-center justify-center text-4xl font-bold text-white"
                            style={{
                                background: community.logo
                                    ? `url(${community.logo}) center/cover`
                                    : community.themeColor
                            }}
                        >
                            {!community.logo && community.name.charAt(0)}
                        </div>
                        <div className="flex-1 mt-4 md:mt-8">
                            <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h1 className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white">
                                            {community.name}
                                        </h1>
                                        {
                                            community.isVerified && (
                                                <CheckCircle2 className="w-6 h-6 text-blue-500" />
                                            )
                                        }
                                    </div>
                                    <div className="flex flex-wrap items-center gap-3 text-sm text-neutral-600 dark:text-neutral-400">
                                        <Badge variant="secondary" className="gap-1">
                                            {getVisibilityIcon()}
                                            {community.visibility.charAt(0) + community.visibility.slice(1).toLowerCase()}
                                        </Badge>
                                        <Badge variant="outline">{community.category}</Badge>
                                        <span className="flex items-center gap-1">
                                            <Users className="w-4 h-4" />
                                            {memberCount.toLocaleString()} members
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <MessageSquare className="w-4 h-4" />
                                            {community.postCount.toLocaleString()} posts
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    {
                                        isMember ? (
                                            <>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="outline" className="gap-2">
                                                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                                                            Joined
                                                            <ChevronDown className="w-4 h-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem>
                                                            <Bell className="w-4 h-4 mr-2" />
                                                            Notification Settings
                                                        </DropdownMenuItem>
                                                        {
                                                            isAdmin && (
                                                                <>
                                                                    <DropdownMenuSeparator />
                                                                    <DropdownMenuItem asChild>
                                                                        <Link href={`/community/${community.slug}/settings`}>
                                                                            <Settings className="w-4 h-4 mr-2" />
                                                                            Community Settings
                                                                        </Link>
                                                                    </DropdownMenuItem>
                                                                </>
                                                            )
                                                        }
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            className="text-red-600"
                                                            onClick={handleLeave}
                                                            disabled={isJoining}
                                                        >
                                                            <LogOut className="w-4 h-4 mr-2" />
                                                            Leave Community
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </>
                                        ) : (
                                            <Button
                                                onClick={handleJoin}
                                                disabled={isJoining}
                                                className="bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 gap-2"
                                            >
                                                {
                                                    isJoining ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <UserPlus className="w-4 h-4" />
                                                    )
                                                }
                                                Join Community
                                            </Button>
                                        )
                                    }
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => {
                                            navigator.clipboard.writeText(window.location.href)
                                            toast.success('Link copied!')
                                        }}
                                    >
                                        <Share2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                            <p className="mt-4 text-neutral-600 dark:text-neutral-400 max-w-2xl">
                                {community.shortDescription || community.description}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex gap-8">
                    <main className="flex-1 min-w-0">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="w-full justify-start border-b border-neutral-200 dark:border-neutral-800 bg-transparent rounded-none p-0 h-auto">
                                <TabsTrigger
                                    value="feed"
                                    className={cn(
                                        "px-4 py-3 border-b-2 border-transparent rounded-none data-[state=active]:border-neutral-900 dark:data-[state=active]:border-white data-[state=active]:bg-transparent"
                                    )}
                                >
                                    <MessageSquare className="w-4 h-4 mr-2" />
                                    Feed
                                </TabsTrigger>
                                {
                                    community.enabledSections.includes('RESOURCES') && (
                                        <TabsTrigger
                                            value="resources"
                                            className={cn(
                                                "px-4 py-3 border-b-2 border-transparent rounded-none data-[state=active]:border-neutral-900 dark:data-[state=active]:border-white data-[state=active]:bg-transparent"
                                            )}
                                        >
                                            <FileText className="w-4 h-4 mr-2" />
                                            Resources
                                        </TabsTrigger>
                                    )
                                }
                                {
                                    community.enabledSections.includes('EVENTS') && (
                                        <TabsTrigger
                                            value="events"
                                            className={cn(
                                                "px-4 py-3 border-b-2 border-transparent rounded-none data-[state=active]:border-neutral-900 dark:data-[state=active]:border-white data-[state=active]:bg-transparent"
                                            )}
                                        >
                                            <Calendar className="w-4 h-4 mr-2" />
                                            Events
                                        </TabsTrigger>
                                    )
                                }
                                {
                                    community.enabledSections.includes('CHALLENGES') && (
                                        <TabsTrigger
                                            value="challenges"
                                            className={cn(
                                                "px-4 py-3 border-b-2 border-transparent rounded-none data-[state=active]:border-neutral-900 dark:data-[state=active]:border-white data-[state=active]:bg-transparent"
                                            )}
                                        >
                                            <Trophy className="w-4 h-4 mr-2" />
                                            Challenges
                                        </TabsTrigger>
                                    )
                                }
                                <TabsTrigger
                                    value="members"
                                    className={cn(
                                        "px-4 py-3 border-b-2 border-transparent rounded-none data-[state=active]:border-neutral-900 dark:data-[state=active]:border-white data-[state=active]:bg-transparent"
                                    )}
                                >
                                    <Users className="w-4 h-4 mr-2" />
                                    Members
                                </TabsTrigger>
                            </TabsList>
                            <TabsContent value="feed" className="mt-6">
                                {
                                    isMember && user && (
                                        <div className="mb-6">
                                            <PostComposer
                                                communityId={community.id}
                                                communitySlug={community.slug}
                                                channels={community.channels}
                                                user={user}
                                                onPostCreated={refreshPosts}
                                            />
                                        </div>
                                    )
                                }
                                <div className="space-y-4">
                                    {
                                        posts.length === 0 ? (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="text-center py-16 border border-dashed border-neutral-300 dark:border-neutral-700 rounded-xl"
                                            >
                                                <MessageSquare className="w-12 h-12 mx-auto text-neutral-300 dark:text-neutral-700 mb-4" />
                                                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                                                    No posts yet
                                                </h3>
                                                <p className="text-neutral-500 dark:text-neutral-400 mb-6">
                                                    Be the first to start a conversation!
                                                </p>
                                            </motion.div>
                                        ) : (
                                            <AnimatePresence>
                                                {
                                                    posts.map((post, index) => (
                                                        <motion.div
                                                            key={post.id}
                                                            initial={{ opacity: 0, y: 10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            transition={{ delay: index * 0.03 }}
                                                        >
                                                            <PostCard post={post} />
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
                                </div>
                            </TabsContent>
                            <TabsContent value="resources" className="mt-6">
                                {
                                    initialResources.length === 0 ? (
                                        <div className="text-center py-16 border border-dashed border-neutral-300 dark:border-neutral-700 rounded-xl">
                                            <FileText className="w-12 h-12 mx-auto text-neutral-300 dark:text-neutral-700 mb-4" />
                                            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                                                No resources shared yet
                                            </h3>
                                            <p className="text-neutral-500 dark:text-neutral-400">
                                                Share helpful resources with the community!
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {
                                                initialResources.map((resource) => (
                                                    <motion.div
                                                        key={resource.id}
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors"
                                                    >
                                                        <div className="flex items-start gap-3">
                                                            <div className="w-10 h-10 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                                                                <FileText className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <h4 className="font-medium text-neutral-900 dark:text-white truncate">
                                                                    {resource.title}
                                                                </h4>
                                                                <p className="text-sm text-neutral-500 dark:text-neutral-400 line-clamp-2">
                                                                    {resource.description}
                                                                </p>
                                                                <div className="flex items-center gap-2 mt-2 text-xs text-neutral-400">
                                                                    <span>by {resource.uploader?.name}</span>
                                                                    <span>•</span>
                                                                    <span>{resource.downloadCount} downloads</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                ))
                                            }
                                        </div>
                                    )
                                }
                            </TabsContent>
                            <TabsContent value="members" className="mt-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {
                                        members.map((member) => (
                                            <Link
                                                key={member.id}
                                                href={`/profile/${member.user.username || member.user.id}`}
                                            >
                                                <motion.div
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="w-12 h-12">
                                                            <AvatarImage src={member.user.image ?? undefined} />
                                                            <AvatarFallback>
                                                                {member.user.name?.charAt(0) || 'U'}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-medium text-neutral-900 dark:text-white truncate">
                                                                    {member.user.name || member.user.username}
                                                                </span>
                                                                {
                                                                    ['OWNER', 'ADMIN'].includes(member.role) && (
                                                                        <Badge variant="secondary" className="text-xs">
                                                                            {member.role}
                                                                        </Badge>
                                                                    )
                                                                }
                                                            </div>
                                                            <span className="text-sm text-neutral-500 dark:text-neutral-400">
                                                                Joined {formatDistanceToNow(new Date(member.joinedAt), { addSuffix: true })}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            </Link>
                                        ))
                                    }
                                </div>
                            </TabsContent>
                            <TabsContent value="events" className="mt-6">
                                <div className="text-center py-16 border border-dashed border-neutral-300 dark:border-neutral-700 rounded-xl">
                                    <Calendar className="w-12 h-12 mx-auto text-neutral-300 dark:text-neutral-700 mb-4" />
                                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                                        No events scheduled
                                    </h3>
                                    <p className="text-neutral-500 dark:text-neutral-400">
                                        Events will appear here when scheduled
                                    </p>
                                </div>
                            </TabsContent>
                            <TabsContent value="challenges" className="mt-6">
                                <div className="text-center py-16 border border-dashed border-neutral-300 dark:border-neutral-700 rounded-xl">
                                    <Trophy className="w-12 h-12 mx-auto text-neutral-300 dark:text-neutral-700 mb-4" />
                                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                                        No active challenges
                                    </h3>
                                    <p className="text-neutral-500 dark:text-neutral-400">
                                        Community challenges will appear here
                                    </p>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </main>
                    <CommunityInfoSidebar
                        community={{
                            id: community.id,
                            name: community.name,
                            description: community.description,
                            memberCount: memberCount,
                            postCount: community.postCount,
                            createdAt: community.createdAt,
                            rules: community.rules,
                            creator: community.creator
                        }}
                        topContributors={topContributors}
                    />
                </div>
            </div>
            <MagicSheet communityId={community.id} communitySlug={community.slug} />
        </div>
    )
}