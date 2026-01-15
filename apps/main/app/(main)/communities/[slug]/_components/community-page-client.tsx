'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import {
    Users, MessageSquare, FileText, Calendar, Trophy, Settings, Bell,
    Share2, CheckCircle2, Lock, Globe, UserPlus, LogOut, Loader2, ChevronDown,
    HelpCircle, Briefcase, Code2, CircleHelp, Mail, RefreshCw, Plus,
    Send, Trash
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
    DialogTitle, DialogTrigger
} from '@repo/ui/components/ui/dialog'
import {
    Card, CardContent, CardDescription, CardHeader, CardTitle
} from '@repo/ui/components/ui/card'
import { PostCard } from '@/components/community/post-card'
import { PostComposer } from '@/components/community/post-composer'
import { PostDetailSheet } from '@/components/community/post-detail-sheet'
import { CommunityInfoSidebar } from '@/components/community/community-sidebar'
import { MagicSheet } from '@/components/community/magic-sheet'
import { getCommunityPosts } from '@/actions/(main)/community/post.action'
import { joinCommunity, leaveCommunity } from '@/actions/(main)/community/community.action'
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

interface CommunityPost {
    id: string
    title?: string | null
    content: string
    createdAt: Date
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
    channel?: {
        id: string
        name: string
        slug: string
        icon?: string | null
    } | null
    officialChannel?: string | null
    community?: {
        id: string
        name: string
        slug: string
        logo?: string | null
    } | null
    attachments?: unknown
    codeBlocks?: unknown
    [key: string]: unknown
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
    CODE_REVIEW: { label: 'Code Review', icon: Code2, description: 'Request code reviews' }
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

    const getInviteStatusBadge = (invite: CommunityInvite) => {
        if (invite.isUsed) {
            return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Accepted</Badge>
        }
        if (invite.expiresAt && new Date(invite.expiresAt) < new Date()) {
            return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">Expired</Badge>
        }
        return <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">Pending</Badge>
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
                        {isMember && user && (
                            <div className="mb-6">
                                <PostComposer
                                    communityId={community.id}
                                    communitySlug={community.slug}
                                    channels={community.channels}
                                    user={user}
                                    onPostCreated={refreshPosts}
                                    sectionType={sectionId}
                                    defaultType={config.postType as 'DISCUSSION' | 'QUESTION' | 'HELP_REQUEST' | 'SHOWCASE' | 'RESOURCE' | undefined}
                                />
                            </div>
                        )}
                        <div className="space-y-4">
                            {sectionPosts.length === 0 ? (
                                <EmptyState
                                    icon={config.icon}
                                    title={`No ${config.label.toLowerCase()} yet`}
                                    description={`Be the first to post in ${config.label.toLowerCase()}!`}
                                />
                            ) : (
                                <AnimatePresence>
                                    {sectionPosts.map((post, index) => (
                                        <motion.div
                                            key={post.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.03 }}
                                            onClick={() => handlePostClick(post)}
                                            className="cursor-pointer"
                                        >
                                            <PostCard post={post} />
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            )}
                            {nextCursor && (
                                <div ref={loadMoreRef} className="py-8 flex justify-center">
                                    {isLoading && <Loader2 className="w-6 h-6 animate-spin text-neutral-400" />}
                                </div>
                            )}
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
                        {initialResources.map((resource) => (
                            <ResourceCard key={resource.id} resource={resource} />
                        ))}
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

            default:
                return null
        }
    }

    return (
        <div className="min-h-screen bg-white dark:bg-neutral-950">
            <div className="max-w-7xl mx-auto relative">
                {/* Cover Image */}
                <div className="relative w-full bg-neutral-100 dark:bg-neutral-900">
                    {community.coverImage ? (
                        <Image
                            src={community.coverImage}
                            alt="Community cover"
                            width={1200}
                            height={400}
                            className="mx-auto w-full max-h-[40vh] object-cover"
                            priority
                        />
                    ) : (
                        <div
                            className="w-full h-64"
                            style={{
                                background: `linear-gradient(135deg, ${community.themeColor}40 0%, ${community.themeColor}20 100%)`,
                            }}
                        />
                    )}
                </div>

                {/* Community Header */}
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
                                        {community.isVerified && (
                                            <CheckCircle2 className="w-6 h-6 text-blue-500" />
                                        )}
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
                                    {isMember ? (
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
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    className="text-red-600"
                                                    onClick={handleLeave}
                                                    disabled={isJoining || community.userRole === 'OWNER'}
                                                >
                                                    <LogOut className="w-4 h-4 mr-2" />
                                                    Leave Community
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    ) : (
                                        <Button
                                            onClick={handleJoin}
                                            disabled={isJoining}
                                            className="bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 gap-2"
                                        >
                                            {isJoining ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <UserPlus className="w-4 h-4" />
                                            )}
                                            Join Community
                                        </Button>
                                    )}
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

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex gap-8">
                    <main className="flex-1 min-w-0">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="w-full justify-start border-b border-neutral-200 dark:border-neutral-800 bg-transparent rounded-none p-0 h-auto overflow-x-auto">
                                {/* Dynamic sections based on enabledSections */}
                                {enabledSections.map(sectionId => {
                                    const config = SECTION_CONFIG[sectionId]
                                    if (!config) return null
                                    const Icon = config.icon
                                    return (
                                        <TabsTrigger
                                            key={sectionId}
                                            value={sectionId.toLowerCase()}
                                            className={cn(
                                                "px-4 py-3 border-b-2 border-transparent rounded-none data-[state=active]:border-neutral-900 dark:data-[state=active]:border-white data-[state=active]:bg-transparent whitespace-nowrap"
                                            )}
                                        >
                                            <Icon className="w-4 h-4 mr-2" />
                                            {config.label}
                                        </TabsTrigger>
                                    )
                                })}

                                {/* Members tab */}
                                <TabsTrigger
                                    value="members"
                                    className={cn(
                                        "px-4 py-3 border-b-2 border-transparent rounded-none data-[state=active]:border-neutral-900 dark:data-[state=active]:border-white data-[state=active]:bg-transparent whitespace-nowrap"
                                    )}
                                >
                                    <Users className="w-4 h-4 mr-2" />
                                    Members
                                </TabsTrigger>

                                {/* Settings tab - only for admins */}
                                {isAdmin && (
                                    <TabsTrigger
                                        value="settings"
                                        className={cn(
                                            "px-4 py-3 border-b-2 border-transparent rounded-none data-[state=active]:border-neutral-900 dark:data-[state=active]:border-white data-[state=active]:bg-transparent whitespace-nowrap"
                                        )}
                                    >
                                        <Settings className="w-4 h-4 mr-2" />
                                        Settings
                                    </TabsTrigger>
                                )}
                            </TabsList>

                            {/* Dynamic section content */}
                            {enabledSections.map(sectionId => (
                                <TabsContent key={sectionId} value={sectionId.toLowerCase()} className="mt-6">
                                    {renderSectionContent(sectionId)}
                                </TabsContent>
                            ))}

                            {/* Members Tab */}
                            <TabsContent value="members" className="mt-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {members.map((member) => (
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
                                                            {['OWNER', 'ADMIN'].includes(member.role) && (
                                                                <Badge variant="secondary" className="text-xs">
                                                                    {member.role}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <span className="text-sm text-neutral-500 dark:text-neutral-400">
                                                            Joined {formatDistanceToNow(new Date(member.joinedAt), { addSuffix: true })}
                                                        </span>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        </Link>
                                    ))}
                                </div>
                            </TabsContent>

                            {/* Settings Tab - Admin Only */}
                            {isAdmin && (
                                <TabsContent value="settings" className="mt-6">
                                    <div className="grid gap-6">
                                        {/* Invites Management */}
                                        <Card>
                                            <CardHeader>
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <CardTitle className="flex items-center gap-2">
                                                            <Mail className="w-5 h-5" />
                                                            Invite Management
                                                        </CardTitle>
                                                        <CardDescription>
                                                            Send email invitations to join your community
                                                        </CardDescription>
                                                    </div>
                                                    <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
                                                        <DialogTrigger asChild>
                                                            <Button className="gap-2">
                                                                <Plus className="w-4 h-4" />
                                                                Send Invite
                                                            </Button>
                                                        </DialogTrigger>
                                                        <DialogContent>
                                                            <DialogHeader>
                                                                <DialogTitle>Send Invitation</DialogTitle>
                                                                <DialogDescription>
                                                                    Enter the email address of the person you want to invite.
                                                                </DialogDescription>
                                                            </DialogHeader>
                                                            <div className="space-y-4 py-4">
                                                                <div className="space-y-2">
                                                                    <Label htmlFor="email">Email Address</Label>
                                                                    <Input
                                                                        id="email"
                                                                        type="email"
                                                                        placeholder="example@email.com"
                                                                        value={inviteEmail}
                                                                        onChange={(e) => setInviteEmail(e.target.value)}
                                                                    />
                                                                </div>
                                                            </div>
                                                            <DialogFooter>
                                                                <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
                                                                    Cancel
                                                                </Button>
                                                                <Button onClick={handleSendInvite} disabled={isSendingInvite}>
                                                                    {isSendingInvite ? (
                                                                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                                                    ) : (
                                                                        <Send className="w-4 h-4 mr-2" />
                                                                    )}
                                                                    Send Invitation
                                                                </Button>
                                                            </DialogFooter>
                                                        </DialogContent>
                                                    </Dialog>
                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                {isLoadingInvites ? (
                                                    <div className="flex items-center justify-center py-8">
                                                        <Loader2 className="w-6 h-6 animate-spin text-neutral-400" />
                                                    </div>
                                                ) : invites.length === 0 ? (
                                                    <div className="text-center py-8 text-neutral-500">
                                                        <Mail className="w-12 h-12 mx-auto text-neutral-300 dark:text-neutral-700 mb-4" />
                                                        <p>No invitations sent yet</p>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-3">
                                                        {invites.map((invite) => (
                                                            <div
                                                                key={invite.id}
                                                                className="flex items-center justify-between p-3 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800"
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-10 h-10 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center">
                                                                        <Mail className="w-5 h-5 text-neutral-500" />
                                                                    </div>
                                                                    <div>
                                                                        <p className="font-medium">{invite.inviteeEmail}</p>
                                                                        <p className="text-sm text-neutral-500">
                                                                            Sent {formatDistanceToNow(new Date(invite.createdAt), { addSuffix: true })}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    {getInviteStatusBadge(invite)}
                                                                    {!invite.isUsed && (
                                                                        <>
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="icon"
                                                                                onClick={() => handleResendInvite(invite.id)}
                                                                                title="Resend"
                                                                            >
                                                                                <RefreshCw className="w-4 h-4" />
                                                                            </Button>
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="icon"
                                                                                onClick={() => handleCancelInvite(invite.id)}
                                                                                className="text-red-500 hover:text-red-600"
                                                                                title="Cancel"
                                                                            >
                                                                                <Trash className="w-4 h-4" />
                                                                            </Button>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>

                                        {/* Community Settings */}
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
                            )}
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

            {/* Post Detail Sheet */}
            <PostDetailSheet
                post={selectedPost}
                isOpen={isPostDetailOpen}
                onClose={() => {
                    setIsPostDetailOpen(false)
                    setSelectedPost(null)
                }}
                currentUserId={user?.id}
                onPostUpdated={refreshPosts}
            />

            <MagicSheet />
        </div>
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