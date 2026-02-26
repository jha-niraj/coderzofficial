'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import {
    Users, MessageSquare, FileText, Calendar, Trophy, Settings, Bell,
    Share2, CheckCircle2, Lock, Globe, UserPlus, LogOut, Loader2,
    ChevronDown, HelpCircle, Briefcase, Code2, CircleHelp, Mail,
    RefreshCw, Plus, Trash, LayoutGrid, Compass
} from 'lucide-react'
import { Button } from '@repo/ui/components/ui/button'
import { Badge } from '@repo/ui/components/ui/badge'
import { Input } from '@repo/ui/components/ui/input'
import { Label } from '@repo/ui/components/ui/label'
import {
    Avatar, AvatarFallback, AvatarImage
} from '@repo/ui/components/ui/avatar'
import {
    Tabs, TabsContent, TabsList, TabsTrigger
} from '@repo/ui/components/ui/tabs'
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@repo/ui/components/ui/dropdown-menu'
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader,
    DialogTitle
} from '@repo/ui/components/ui/dialog'
import {
    Card, CardContent, CardDescription, CardHeader, CardTitle
} from '@repo/ui/components/ui/card'
import { PostCard } from '@/components/community/post-card'
import { PostComposer } from '@/components/community/post-composer'
import { PostDetailSheet } from '@/components/community/post-detail-sheet'
import { CommunityInfoSidebar } from '@/components/community/community-sidebar'
import { CommunityLeaderboard } from '@/components/community/community-leaderboard'
import {
    getCommunityPosts, createPost
} from '@/actions/(main)/community/post.action'
import {
    joinCommunity, leaveCommunity
} from '@/actions/(main)/community/community.action'
import {
    createCommunityInvite, getCommunityInvites, cancelCommunityInvite,
    resendCommunityInvite
} from '@/actions/(main)/community/invite.action'
import toast from '@repo/ui/components/ui/sonner'
import { cn } from '@repo/ui/lib/utils'
import { useInView } from 'react-intersection-observer'
import Image from 'next/image'

// ==================== TYPES ====================
interface PostAuthor {
    id: string
    name: string | null
    username: string | null
    image: string | null
}

interface ShareableItem {
    id: string
    type: 'interview' | 'project' | 'space' | 'studio' | 'Learn' | 'challenge'
    title: string
    description?: string
    thumbnail?: string
    url?: string
    metadata?: Record<string, unknown>
}

interface CommunityPost {
    id: string
    title?: string | null
    content: string
    createdAt: Date
    updatedAt: Date
    author: PostAuthor
    _count?: {
        likes: number
        comments: number
    }
    likesCount?: number
    commentsCount?: number
    type: string
    tags: string[]
    isPinned: boolean
    isLocked: boolean
    isAnswered?: boolean
    isResolved?: boolean
    likeCount: number
    commentCount: number
    viewCount: number
    isLiked?: boolean
    officialChannel?: string | null
    community: {
        id: string
        name: string
        slug: string
        logo?: string | null
    } | null
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    poll?: any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    attachments?: any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    codeBlocks?: any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    embeds?: any
}

interface CommunityResource {
    id: string
    title: string
    description?: string | null
    url?: string | null
    type: string
    uploader?: { name: string | null } | null
    downloadCount?: number
}

interface CommunityMember {
    id: string
    name?: string | null
    username?: string | null
    image?: string | null
    role: string
    joinedAt: Date
    user: {
        id: string
        name: string | null
        username: string | null
        image: string | null
        bio?: string | null
    }
}

interface CommunityInvite {
    id: string
    code: string
    inviteeEmail: string | null
    isUsed: boolean
    usedAt: Date | null
    expiresAt: Date | null
    createdAt: Date
    status?: string
    inviter: {
        id: string
        name: string | null
        image: string | null
    }
}

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
        isMember?: boolean
        userRole?: string
    }
    user: {
        id: string
        name: string | null
        image: string | null
    } | null
    initialPosts: CommunityPost[]
    initialResources: CommunityResource[]
    members: CommunityMember[]
    topContributors: Array<{
        id: string
        name: string | null
        username: string | null
        image: string | null
        helpfulCount: number
    }>
    nextCursor?: string
}

// Section configuration
interface SectionConfig {
    label: string
    icon: React.ComponentType<{ className?: string }>
    description: string
    postType?: string
}

const SECTION_CONFIG: Record<string, SectionConfig> = {
    FEED: { label: 'Feed', icon: MessageSquare, description: 'General posts and discussions' },
    QA: { label: 'Q&A', icon: HelpCircle, description: 'Questions and answers', postType: 'QUESTION' },
    RESOURCES: { label: 'Resources', icon: FileText, description: 'Shared files and resources' },
    SHOWCASE: { label: 'Showcase', icon: Code2, description: 'Show your work', postType: 'SHOWCASE' },
    EVENTS: { label: 'Events', icon: Calendar, description: 'Community events' },
    CHALLENGES: { label: 'Challenges', icon: Trophy, description: 'Weekly/monthly challenges' },
    JOBS: { label: 'Jobs', icon: Briefcase, description: 'Job postings and referrals' },
    HELP: { label: 'Help Room', icon: CircleHelp, description: 'Real-time help requests', postType: 'HELP_REQUEST' },
    CODE_REVIEW: { label: 'Code Review', icon: Code2, description: 'Request code reviews' },
    LEADERBOARD: { label: 'Leaderboard', icon: Trophy, description: 'Top contributors ranking' }
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

    // Post detail sheet
    const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null)
    const [isPostDetailOpen, setIsPostDetailOpen] = useState(false)

    // Invite management
    const [invites, setInvites] = useState<CommunityInvite[]>([])
    const [isLoadingInvites, setIsLoadingInvites] = useState(false)
    const [inviteEmail, setInviteEmail] = useState('')
    const [isSendingInvite, setIsSendingInvite] = useState(false)
    const [showInviteDialog, setShowInviteDialog] = useState(false)

    const isAdmin = community.userRole === 'OWNER' || community.userRole === 'ADMIN'

    // Get enabled sections
    const enabledSections = community.enabledSections || ['FEED']

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

    // Load invites when settings tab is active
    useEffect(() => {
        if (activeTab === 'settings' && isAdmin && invites.length === 0) {
            loadInvites()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab, isAdmin])

    const loadInvites = async () => {
        setIsLoadingInvites(true)
        try {
            const result = await getCommunityInvites(community.id)
            if (result.success && result.data) {
                setInvites(result.data)
            }
        } catch {
            toast.error('Failed to load invites')
        } finally {
            setIsLoadingInvites(false)
        }
    }

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

    const handleSendInvite = async () => {
        if (!inviteEmail.trim()) {
            toast.error('Please enter an email')
            return
        }

        setIsSendingInvite(true)
        try {
            const result = await createCommunityInvite({
                email: inviteEmail.trim(),
                communityId: community.id
            })
            if (result.success) {
                toast.success('Invitation sent!')
                setInviteEmail('')
                setShowInviteDialog(false)
                loadInvites()
            } else {
                toast.error(result.error || 'Failed to send invite')
            }
        } catch {
            toast.error('Something went wrong')
        } finally {
            setIsSendingInvite(false)
        }
    }

    const handleCancelInvite = async (inviteId: string) => {
        try {
            const result = await cancelCommunityInvite(inviteId)
            if (result.success) {
                setInvites(prev => prev.filter(i => i.id !== inviteId))
                toast.success('Invite cancelled')
            } else {
                toast.error(result.error || 'Failed to cancel')
            }
        } catch {
            toast.error('Something went wrong')
        }
    }

    const handleResendInvite = async (inviteId: string) => {
        try {
            const result = await resendCommunityInvite(inviteId)
            if (result.success) {
                toast.success('Invite resent!')
                loadInvites()
            } else {
                toast.error(result.error || 'Failed to resend')
            }
        } catch {
            toast.error('Something went wrong')
        }
    }

    const handlePostUpdate = async () => {
        await refreshPosts()
    }

    const handleShare = async (item: ShareableItem) => {
        try {
            const result = await createPost({
                communityId: community.id,
                title: item.title,
                content: item.description || `Shared ${item.type}`,
                type: 'SHOWCASE',
                embeds: [{
                    itemType: item.type,
                    title: item.title,
                    description: item.description,
                    url: item.url,
                    thumbnail: item.thumbnail,
                    metadata: item.metadata
                }],
                tags: ['shared', item.type]
            })

            if (result.success) {
                toast.success('Shared successfully to community!')
                refreshPosts()
            } else {
                toast.error(result.error || 'Failed to share')
            }
        } catch {
            toast.error('Something went wrong')
        }
    }

    const handlePostClick = (post: CommunityPost) => {
        setSelectedPost(post)
        setIsPostDetailOpen(true)
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

    // Render section content based on type
    const renderSectionContent = (sectionId: string) => {
        const config = SECTION_CONFIG[sectionId]
        if (!config) return null

        // Filter posts by section type if applicable
        const sectionPosts = config.postType
            ? posts.filter(p => p.type === config.postType)
            : posts

        switch (sectionId) {
            case 'FEED':
            case 'QA':
            case 'SHOWCASE':
            case 'HELP':
                return (
                    <>
                        {
                            isMember && user && (
                                <div className="mb-6">
                                    <PostComposer
                                        communityId={community.id}
                                        communitySlug={community.slug}
                                        user={user}
                                        onPostCreated={refreshPosts}
                                        sectionType={sectionId}
                                        defaultType={config.postType as 'DISCUSSION' | 'QUESTION' | 'HELP_REQUEST' | 'SHOWCASE' | 'RESOURCE' | undefined}
                                    />
                                </div>
                            )
                        }
                        <div className="space-y-4">
                            {
                                sectionPosts.length === 0 ? (
                                    <EmptyState
                                        icon={config.icon}
                                        title={`No ${config.label.toLowerCase()} yet`}
                                        description={`Be the first to post in ${config.label.toLowerCase()}!`}
                                    />
                                ) : (
                                    <AnimatePresence>
                                        {
                                            sectionPosts.map((post, index) => (
                                                <motion.div
                                                    key={post.id}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: index * 0.03 }}
                                                >
                                                    <PostCard
                                                        post={post}
                                                        onClick={() => handlePostClick(post)}
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
                                        {isLoading && <Loader2 className="w-6 h-6 animate-spin text-neutral-400" />}
                                    </div>
                                )
                            }
                        </div>
                    </>
                )

            case 'RESOURCES':
                return initialResources.length === 0 ? (
                    <EmptyState
                        icon={FileText}
                        title="No resources shared yet"
                        description="Share helpful resources with the community!"
                    />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {
                            initialResources.map((resource) => (
                                <ResourceCard key={resource.id} resource={resource} />
                            ))
                        }
                    </div>
                )

            case 'EVENTS':
                return (
                    <EmptyState
                        icon={Calendar}
                        title="No events scheduled"
                        description="Events will appear here when scheduled"
                    />
                )

            case 'CHALLENGES':
                return (
                    <EmptyState
                        icon={Trophy}
                        title="No active challenges"
                        description="Community challenges will appear here"
                    />
                )

            case 'JOBS':
                return (
                    <EmptyState
                        icon={Briefcase}
                        title="No job postings"
                        description="Job opportunities will appear here"
                    />
                )

            case 'CODE_REVIEW':
                return (
                    <EmptyState
                        icon={Code2}
                        title="No code review requests"
                        description="Request code reviews from the community"
                    />
                )

            case 'LEADERBOARD':
                return (
                    <CommunityLeaderboard
                        communityId={community.id}
                        communitySlug={community.slug}
                    />
                )

            default:
                return null
        }
    }

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 pb-20">
            <div className="relative w-full h-[280px] bg-neutral-900">
                {
                    community.coverImage ? (
                        <Image
                            src={community.coverImage}
                            alt="Community cover"
                            fill
                            className="object-cover opacity-80"
                            priority
                        />
                    ) : (
                        <div
                            className="absolute inset-0"
                            style={{
                                background: `linear-gradient(135deg, ${community.themeColor} 40%, ${community.themeColor}80 100%)`,
                            }}
                        >
                            <div className="absolute inset-0 bg-black/20" />
                        </div>
                    )
                }
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>
            <div className="w-full px-4 sm:px-6 lg:px-8 relative z-10 -mt-20">
                <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl border border-neutral-200 dark:border-neutral-800 p-6 md:p-8 mb-8 backdrop-blur-sm bg-white/95 dark:bg-neutral-900/95">
                    <div className="flex flex-col md:flex-row gap-6 items-start">
                        <div className="relative -mt-16 md:-mt-20 flex-shrink-0">
                            <div
                                className="w-32 h-32 md:w-36 md:h-36 rounded-2xl border-4 border-white dark:border-neutral-900 shadow-2xl flex items-center justify-center text-5xl font-bold text-white overflow-hidden bg-white dark:bg-neutral-800"
                                style={{
                                    background: community.logo
                                        ? undefined
                                        : community.themeColor
                                }}
                            >
                                {
                                    community.logo ? (
                                        <Image
                                            src={community.logo}
                                            alt={community.name}
                                            width={144}
                                            height={144}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <span>{community.name.charAt(0)}</span>
                                    )
                                }
                            </div>
                            {
                                community.isVerified && (
                                    <div className="absolute -bottom-2 -right-2 bg-white dark:bg-neutral-900 rounded-full p-1.5 shadow-sm">
                                        <CheckCircle2 className="w-6 h-6 text-blue-500 fill-blue-500/10" />
                                    </div>
                                )
                            }
                        </div>
                        <div className="flex-1 min-w-0 pt-2">
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                <div>
                                    <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2 truncate">
                                        {community.name}
                                    </h1>
                                    <div className="flex flex-wrap items-center gap-3 text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                                        <Badge variant="secondary" className="gap-1.5 h-6">
                                            {getVisibilityIcon()}
                                            {community.visibility}
                                        </Badge>
                                        <Badge variant="outline" className="h-6">{community.category}</Badge>
                                        <span className="flex items-center gap-1.5 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-full text-xs font-medium">
                                            <Users className="w-3.5 h-3.5" />
                                            {memberCount.toLocaleString()} members
                                        </span>
                                    </div>
                                    <p className="text-neutral-600 dark:text-neutral-300 max-w-2xl text-sm leading-relaxed line-clamp-2">
                                        {community.shortDescription || community.description}
                                    </p>
                                </div>
                                <div className="flex items-center gap-3 flex-shrink-0">
                                    {
                                        isMember ? (
                                            <>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="outline" className="gap-2 font-medium">
                                                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                                                            Joined
                                                            <ChevronDown className="w-4 h-4 opacity-50" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-56">
                                                        <DropdownMenuItem>
                                                            <Bell className="w-4 h-4 mr-2" />
                                                            Notification Settings
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/20"
                                                            onClick={handleLeave}
                                                            disabled={isJoining || community.userRole === 'OWNER'}
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
                                                className="bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 gap-2 shadow-lg hover:shadow-xl transition-all font-medium px-6"
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
                                        variant="ghost"
                                        size="icon"
                                        className="text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                                        onClick={() => {
                                            navigator.clipboard.writeText(window.location.href)
                                            toast.success('Link copied!')
                                        }}
                                    >
                                        <Share2 className="w-5 h-5" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <aside className="lg:col-span-3 space-y-6">
                        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-2 shadow-sm">
                            <div className="space-y-1">
                                <Link href="/communities">
                                    <Button variant="ghost" size="sm" className="w-full justify-start gap-3 h-10 text-neutral-600 dark:text-neutral-400">
                                        <LayoutGrid className="w-4 h-4" />
                                        All Communities
                                    </Button>
                                </Link>
                                <Link href="/communities/discover">
                                    <Button variant="ghost" size="sm" className="w-full justify-start gap-3 h-10 text-neutral-600 dark:text-neutral-400">
                                        <Compass className="w-4 h-4" />
                                        Discover
                                    </Button>
                                </Link>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-2 shadow-sm sticky top-24">
                            <div className="px-3 py-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">
                                Menu
                            </div>
                            <TabsList className="flex flex-col h-auto w-full bg-transparent p-0 gap-1">
                                {
                                    enabledSections.map(sectionId => {
                                        const config = SECTION_CONFIG[sectionId]
                                        if (!config) return null
                                        const Icon = config.icon
                                        return (
                                            <TabsTrigger
                                                key={sectionId}
                                                value={sectionId.toLowerCase()}
                                                className={cn(
                                                    "w-full justify-start gap-3 px-3 py-2.5 h-auto text-sm font-medium rounded-lg transition-all",
                                                    "data-[state=active]:bg-neutral-100 dark:data-[state=active]:bg-neutral-800",
                                                    "data-[state=active]:text-neutral-900 dark:data-[state=active]:text-white",
                                                    "hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                                                )}
                                            >
                                                <Icon className="w-4 h-4" />
                                                {config.label}
                                            </TabsTrigger>
                                        )
                                    })
                                }

                                <div className="h-px bg-neutral-100 dark:bg-neutral-800 my-2 mx-2" />

                                <TabsTrigger
                                    value="leaderboard"
                                    className={cn(
                                        "w-full justify-start gap-3 px-3 py-2.5 h-auto text-sm font-medium rounded-lg transition-all",
                                        "data-[state=active]:bg-neutral-100 dark:data-[state=active]:bg-neutral-800",
                                        "data-[state=active]:text-neutral-900 dark:data-[state=active]:text-white",
                                        "hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                                    )}
                                >
                                    <Trophy className="w-4 h-4" />
                                    Leaderboard
                                </TabsTrigger>
                                <TabsTrigger
                                    value="members"
                                    className={cn(
                                        "w-full justify-start gap-3 px-3 py-2.5 h-auto text-sm font-medium rounded-lg transition-all",
                                        "data-[state=active]:bg-neutral-100 dark:data-[state=active]:bg-neutral-800",
                                        "data-[state=active]:text-neutral-900 dark:data-[state=active]:text-white",
                                        "hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                                    )}
                                >
                                    <Users className="w-4 h-4" />
                                    Members
                                </TabsTrigger>

                                {
                                    isAdmin && (
                                        <TabsTrigger
                                            value="settings"
                                            className={cn(
                                                "w-full justify-start gap-3 px-3 py-2.5 h-auto text-sm font-medium rounded-lg transition-all",
                                                "data-[state=active]:bg-neutral-100 dark:data-[state=active]:bg-neutral-800",
                                                "data-[state=active]:text-neutral-900 dark:data-[state=active]:text-white",
                                                "hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                                            )}
                                        >
                                            <Settings className="w-4 h-4" />
                                            Settings
                                        </TabsTrigger>
                                    )
                                }
                            </TabsList>
                        </div>
                    </aside>
                    <main className="lg:col-span-6 min-w-0">
                        {
                            enabledSections.map(sectionId => (
                                <TabsContent key={sectionId} value={sectionId.toLowerCase()} className="mt-0 focus-visible:outline-none">
                                    {renderSectionContent(sectionId)}
                                </TabsContent>
                            ))
                        }

                        <TabsContent value="members" className="mt-0 focus-visible:outline-none">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {
                                    members.map((member) => (
                                        <Link
                                            key={member.id}
                                            href={`/profile/${member.user.username || member.user.id}`}
                                        >
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors shadow-sm"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="w-12 h-12 border border-neutral-100 dark:border-neutral-800">
                                                        <AvatarImage src={member.user.image ?? undefined} />
                                                        <AvatarFallback className="bg-neutral-100 dark:bg-neutral-800">
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
                                                                    <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
                                                                        {member.role}
                                                                    </Badge>
                                                                )
                                                            }
                                                        </div>
                                                        <span className="text-xs text-neutral-500 dark:text-neutral-400 block mt-0.5">
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

                        {
                            isAdmin && (
                                <TabsContent value="settings" className="mt-0 focus-visible:outline-none">
                                    <div className="space-y-6">
                                        <Card>
                                            <CardHeader>
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <CardTitle className="flex items-center gap-2">
                                                            <Mail className="w-5 h-5" />
                                                            Pending Invites
                                                        </CardTitle>
                                                        <CardDescription>
                                                            Manage outstanding invitations
                                                        </CardDescription>
                                                    </div>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setShowInviteDialog(true)}
                                                        className="gap-2"
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                        Invite Member
                                                    </Button>
                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                {
                                                    isLoadingInvites ? (
                                                        <div className="flex justify-center py-8">
                                                            <Loader2 className="w-6 h-6 animate-spin text-neutral-400" />
                                                        </div>
                                                    ) : invites.length > 0 ? (
                                                        <div className="space-y-3">
                                                            {
                                                                invites.map((invite) => (
                                                                    <div
                                                                        key={invite.id}
                                                                        className="flex items-center justify-between p-3 rounded-lg border border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50"
                                                                    >
                                                                        <div>
                                                                            <p className="font-medium text-sm text-neutral-900 dark:text-white">
                                                                                {invite.inviteeEmail || 'No email provided'}
                                                                            </p>
                                                                            <div className="flex items-center gap-2 mt-1">
                                                                                <Badge variant="outline" className="text-[10px]">
                                                                                    {invite.status || 'PENDING'}
                                                                                </Badge>
                                                                                <span className="text-xs text-neutral-500">
                                                                                    Expires in {formatDistanceToNow(new Date(invite.expiresAt!), { addSuffix: true })}
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex items-center gap-2">
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="icon"
                                                                                className="h-8 w-8 text-neutral-500 hover:text-neutral-900"
                                                                                onClick={() => handleResendInvite(invite.id)}
                                                                                disabled={isSendingInvite}
                                                                            >
                                                                                <RefreshCw className="w-4 h-4" />
                                                                            </Button>
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="icon"
                                                                                className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                                                                                onClick={() => handleCancelInvite(invite.id)}
                                                                            >
                                                                                <Trash className="w-4 h-4" />
                                                                            </Button>
                                                                        </div>
                                                                    </div>
                                                                ))
                                                            }
                                                        </div>
                                                    ) : (
                                                        <div className="text-center py-8 text-neutral-500 text-sm">
                                                            No pending invites. Invite people to grow your community!
                                                        </div>
                                                    )
                                                }
                                            </CardContent>
                                        </Card>
                                        <Card className="flex justify-end">
                                            <Link href={`/communities/${community.slug}/settings`}>
                                                <Button variant="outline" className="gap-2">
                                                    <Settings className="w-4 h-4" />
                                                    View All Settings
                                                </Button>
                                            </Link>
                                        </Card>
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="flex items-center gap-2">
                                                    <Settings className="w-5 h-5" />
                                                    Community Settings
                                                </CardTitle>
                                                <CardDescription>
                                                    Manage your community settings
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <Button variant="outline" asChild>
                                                    <Link href={`/communities/${community.slug}/settings`}>
                                                        Open Full Settings
                                                    </Link>
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </TabsContent>
                            )
                        }
                    </main>
                    <div className="w-80 hidden xl:block shrink-0 space-y-6">
                        <CommunityInfoSidebar
                            community={{
                                id: community.id,
                                name: community.name,
                                description: community.description,
                                memberCount: memberCount,
                                postCount: community.postCount,
                                createdAt: community.createdAt,
                                rules: community.rules || [],
                                creator: {
                                    id: 'owner',
                                    name: null,
                                    username: null,
                                    image: null
                                }
                            }}
                            topContributors={topContributors}
                        />
                    </div>
                </Tabs>
            </div>

            <PostDetailSheet
                post={selectedPost}
                isOpen={isPostDetailOpen}
                onClose={() => {
                    setIsPostDetailOpen(false)
                    setSelectedPost(null)
                }}
                currentUserId={user?.id}
                onPostUpdated={handlePostUpdate}
            />

            <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Invite Member</DialogTitle>
                        <DialogDescription>
                            Send an email invitation to join this community.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email address</Label>
                            <Input
                                id="email"
                                placeholder="friend@example.com"
                                type="email"
                                value={inviteEmail}
                                onChange={(e) => setInviteEmail(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowInviteDialog(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSendInvite}
                            disabled={isSendingInvite || !inviteEmail}
                        >
                            {isSendingInvite && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                            Send Invite
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div >
    )
}

// Helper Components
function EmptyState({
    icon: Icon,
    title,
    description
}: {
    icon: React.ComponentType<{ className?: string }>
    title: string
    description: string
}) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 border border-dashed border-neutral-300 dark:border-neutral-700 rounded-xl"
        >
            <Icon className="w-12 h-12 mx-auto text-neutral-300 dark:text-neutral-700 mb-4" />
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                {title}
            </h3>
            <p className="text-neutral-500 dark:text-neutral-400">
                {description}
            </p>
        </motion.div>
    )
}

function ResourceCard({ resource }: { resource: CommunityResource }) {
    return (
        <motion.div
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
    )
}