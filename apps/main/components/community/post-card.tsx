'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import {
    Heart, MessageCircle, Share2, MoreHorizontal, Pin, Lock, CheckCircle,
    Code2, HelpCircle, Image as ImageIcon, FileText, Bookmark, LucideIcon,
    BarChart2
} from 'lucide-react'
import {
    Card, CardContent, CardFooter, CardHeader
} from '@repo/ui/components/ui/card'
import { Badge } from '@repo/ui/components/ui/badge'
import { Button } from '@repo/ui/components/ui/button'
import {
    Avatar, AvatarFallback, AvatarImage
} from '@repo/ui/components/ui/avatar'
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@repo/ui/components/ui/dropdown-menu'
import { cn } from '@repo/ui/lib/utils'
import { CommunityPostType } from '@repo/prisma/client'
import { togglePostLike, voteOnPoll } from '@/actions/(main)/community/post.action'
import toast from '@repo/ui/components/ui/sonner'

import { SharedInterviewCard, SharedProjectCard } from '@/components/community/shared-items'
import { useUserStore } from '@/app/store/useUserStore'

export interface PostEmbed {
    itemType: 'interview' | 'project' | 'space' | 'studio' | string
    type?: string
    title: string
    description?: string
    url?: string
    thumbnail?: string
    metadata?: {
        role?: string
        level?: string
        [key: string]: unknown
    }
}

export interface PostAttachment {
    type: 'link' | 'image' | 'file' | string
    url: string
    title?: string
    description?: string
}

interface PostCardProps {
    post: {
        id: string
        title?: string | null
        content: string
        type: CommunityPostType | string
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
        attachments?: PostAttachment[] | unknown
        codeBlocks?: unknown
        embeds?: PostEmbed[] | unknown
        poll?: {
            id: string
            question: string
            options: unknown // Json
            allowMultiple: boolean
            endDate: Date | null
            votes?: {
                id: string
                userId: string
                optionIndex: number
            }[]
        } | null
    }
    showCommunity?: boolean
    compact?: boolean
    onLikeChange?: (postId: string, liked: boolean, count: number) => void
    onClick?: () => void
}

const POST_TYPES: Record<string, { icon: LucideIcon; label: string; color: string }> = {
    DISCUSSION: { icon: MessageCircle, label: 'Discussion', color: 'text-blue-500' },
    POLL: { icon: BarChart2, label: 'Poll', color: 'text-purple-500' },
    QUESTION: { icon: HelpCircle, label: 'Question', color: 'text-orange-500' },
    RESOURCE: { icon: FileText, label: 'Resource', color: 'text-green-500' },
    SHOWCASE: { icon: ImageIcon, label: 'Showcase', color: 'text-purple-500' },
    EVENT: { icon: Pin, label: 'Event', color: 'text-red-500' },
    CHALLENGE: { icon: Code2, label: 'Challenge', color: 'text-yellow-500' },
    HELP_REQUEST: { icon: HelpCircle, label: 'Help', color: 'text-rose-500' },
    ANNOUNCEMENT: { icon: Pin, label: 'Announcement', color: 'text-cyan-500' },
}

export function PostCard({
    post,
    showCommunity = false,
    compact = false,
    onLikeChange,
    onClick
}: PostCardProps
) {
    const { user } = useUserStore()
    const [isLiked, setIsLiked] = useState(post.isLiked)
    const [likeCount, setLikeCount] = useState(post.likeCount)
    const [isLiking, setIsLiking] = useState(false)

    const typeConfig = POST_TYPES[post.type as keyof typeof POST_TYPES] || POST_TYPES.DISCUSSION
    const TypeIcon = typeConfig?.icon ?? MessageCircle

    const handleLike = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()

        if (isLiking) return

        if (!user) {
            toast.error('Please login to like posts')
            return
        }

        setIsLiking(true)

        const newLiked = !isLiked
        const newCount = newLiked ? likeCount + 1 : likeCount - 1

        setIsLiked(newLiked)
        setLikeCount(newCount)

        // Optimistic update
        onLikeChange?.(post.id, newLiked, newCount)

        try {
            const result = await togglePostLike(post.id)
            if (!result.success) {
                // Revert on failure
                setIsLiked(!newLiked)
                setLikeCount(newLiked ? newCount - 1 : newCount + 1)
                onLikeChange?.(post.id, !newLiked, newLiked ? newCount - 1 : newCount + 1)
                toast.error(result.error)
            }
        } catch {
            setIsLiked(!newLiked)
            setLikeCount(newLiked ? newCount - 1 : newCount + 1)
            onLikeChange?.(post.id, !newLiked, newLiked ? newCount - 1 : newCount + 1)
            toast.error('Failed to like post')
        } finally {
            setIsLiking(false)
        }
    }

    // Safe accessors for array props
    const embeds = Array.isArray(post.embeds) ? (post.embeds as PostEmbed[]) : []
    const attachments = Array.isArray(post.attachments) ? (post.attachments as PostAttachment[]) : []
    const codeBlocks = Array.isArray(post.codeBlocks) ? (post.codeBlocks as { code: string; language: string }[]) : []

    const hasCode = codeBlocks.length > 0
    const hasLink = attachments.some(a => a.type === 'link')

    const CardContentWrapper = ({ children }: { children: React.ReactNode }) => {
        // If an onClick handler is provided, use it on a div.
        // This is typically used to open a details sheet.
        if (onClick) {
            return (
                <div
                    onClick={onClick}
                    className="block hover:bg-neutral-50 dark:hover:bg-white/5 transition-colors cursor-pointer"
                >
                    {children}
                </div>
            )
        }

        // Fallback: If no onClick is provided, we use Link for robustness.
        const linkHref = `/communities/${post.community?.slug || 'global'}/post/${post.id}`
        return (
            <Link
                href={linkHref}
                className="block hover:bg-neutral-50 dark:hover:bg-white/5 transition-colors"
            >
                {children}
            </Link>
        )
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <Card className={cn(
                "group border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all duration-200 bg-white dark:bg-neutral-900 overflow-hidden",
                post.isPinned && "border-l-4 border-l-blue-500",
                compact && "shadow-none"
            )}>
                <CardContentWrapper>
                    <CardHeader className={cn("pb-2", compact && "py-3")}>
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <Avatar className="w-10 h-10">
                                    <AvatarImage src={post.author.image ?? undefined} />
                                    <AvatarFallback className="bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                                        {post.author.name?.charAt(0) || 'U'}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-sm text-neutral-900 dark:text-white">
                                            {post.author.name || post.author.username || 'Anonymous'}
                                        </span>
                                        {
                                            showCommunity && post.community && (
                                                <>
                                                    <span className="text-neutral-400">in</span>
                                                    <span className="font-medium text-sm text-neutral-700 dark:text-neutral-300">
                                                        {post.community.name}
                                                    </span>
                                                </>
                                            )
                                        }
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                                        <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {
                                    post.isPinned && (
                                        <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs">
                                            <Pin className="w-3 h-3 mr-1" />
                                            Pinned
                                        </Badge>
                                    )
                                }
                                {
                                    post.isLocked && (
                                        <Lock className="w-4 h-4 text-neutral-400" />
                                    )
                                }
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <MoreHorizontal className="w-4 h-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem>
                                            <Bookmark className="w-4 h-4 mr-2" />
                                            Save Post
                                        </DropdownMenuItem>
                                        <DropdownMenuItem>
                                            <Share2 className="w-4 h-4 mr-2" />
                                            Share
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem className="text-red-600">
                                            Report
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className={cn("pt-0", compact && "pb-3")}>
                        <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className={cn("text-xs", typeConfig?.color ?? 'text-black')}>
                                <TypeIcon className="w-3 h-3 mr-1" />
                                {typeConfig?.label ?? 'Discussion'}
                            </Badge>
                            {
                                hasCode && (
                                    <Badge variant="secondary" className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400">
                                        <Code2 className="w-3 h-3 mr-1" /> Code
                                    </Badge>
                                )
                            }
                            {
                                hasLink && (
                                    <Badge variant="secondary" className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                                        <Share2 className="w-3 h-3 mr-1" /> Link
                                    </Badge>
                                )
                            }

                            {
                                post.type === 'QUESTION' && post.isAnswered && (
                                    <Badge className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs">
                                        <CheckCircle className="w-3 h-3 mr-1" />
                                        Answered
                                    </Badge>
                                )
                            }
                        </div>
                        {
                            post.title && (
                                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2 group-hover:text-neutral-700 dark:group-hover:text-neutral-200 transition-colors">
                                    {post.title}
                                </h3>
                            )
                        }
                        <p className={cn(
                            "text-neutral-600 dark:text-neutral-400",
                            compact ? "line-clamp-2 text-sm" : "line-clamp-4"
                        )}>
                            {post.content}
                        </p>

                        {
                            post.poll && (
                                <div className="mt-4 space-y-3 border rounded-xl p-4 bg-neutral-50 dark:bg-neutral-900/50" onClick={(e) => e.stopPropagation()}>
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="font-medium text-sm text-neutral-900 dark:text-neutral-100">{post.poll.question}</h3>
                                        <div className="text-xs text-neutral-500">
                                            {post.poll.endDate && new Date() > new Date(post.poll.endDate) ? 'Closed' : 'Open'} • {post.poll.votes?.length || 0} votes
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        {
                                            ((post.poll.options as string[]) || []).map((option, idx) => {
                                                const totalVotes = post.poll?.votes?.length || 0
                                                const optionVotes = post.poll?.votes?.filter(v => v.optionIndex === idx).length || 0
                                                const percentage = totalVotes > 0 ? Math.round((optionVotes / totalVotes) * 100) : 0
                                                const userVote = post.poll?.votes?.find(v => v.userId === user?.id)
                                                const isVoted = !!userVote
                                                const isSelected = userVote?.optionIndex === idx
                                                const isClosed = post.poll?.endDate && new Date() > new Date(post.poll.endDate)

                                                return (
                                                    <div key={idx} className="relative">
                                                        {
                                                            isVoted || isClosed ? (
                                                                <div className="relative h-10 w-full rounded-lg bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                                                                    <div
                                                                        className={cn("absolute inset-y-0 left-0 bg-blue-100 dark:bg-blue-900/30 transition-all duration-500", isSelected && "bg-blue-200 dark:bg-blue-900/50")}
                                                                        style={{ width: `${percentage}%` }}
                                                                    />
                                                                    <div className="absolute inset-0 flex items-center justify-between px-3">
                                                                        <span className="text-sm font-medium z-10 flex items-center gap-2">
                                                                            {option}
                                                                            {isSelected && <CheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
                                                                        </span>
                                                                        <span className="text-sm text-neutral-500 z-10">
                                                                            {percentage}%
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <Button
                                                                    variant="outline"
                                                                    className="w-full justify-start h-10 px-3 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                                                                    onClick={(e) => {
                                                                        e.preventDefault()
                                                                        e.stopPropagation()
                                                                        if (post.poll) voteOnPoll(post.poll.id, idx)
                                                                        if (!user) toast.error('Please login to vote')
                                                                        else toast.success('Vote submitted')
                                                                    }}
                                                                >
                                                                    {option}
                                                                </Button>
                                                            )
                                                        }
                                                    </div>
                                                )
                                            })
                                        }
                                    </div>
                                </div>
                            )
                        }

                        {
                            embeds.length > 0 && (
                                <div className="mt-4">
                                    {
                                        embeds.map((embed, index) => {
                                            if (embed.itemType === 'interview') {
                                                return (
                                                    <SharedInterviewCard
                                                        key={index}
                                                        title={embed.title}
                                                        description={embed.description}
                                                        role={embed.metadata?.role || 'Developer'}
                                                        level={embed.metadata?.level || 'Mid'}
                                                        author={{ name: post.author.name || 'User', image: post.author.image || undefined }}
                                                        onAccept={() => toast.info('Feature coming soon!')}
                                                    />
                                                )
                                            }
                                            if (embed.itemType === 'project' || embed.itemType === 'space' || embed.itemType === 'studio') {
                                                return (
                                                    <SharedProjectCard
                                                        key={index}
                                                        title={embed.title}
                                                        description={embed.description}
                                                        url={embed.url}
                                                        thumbnail={embed.thumbnail}
                                                        author={{ name: post.author.name || 'User', image: post.author.image || undefined }}
                                                    />
                                                )
                                            }
                                            return null
                                        })
                                    }
                                </div>
                            )
                        }

                        {
                            post.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {
                                        post.tags.slice(0, 5).map((tag) => (
                                            <Badge
                                                key={tag}
                                                variant="secondary"
                                                className="text-xs bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
                                            >
                                                #{tag}
                                            </Badge>
                                        ))
                                    }
                                    {
                                        post.tags.length > 5 && (
                                            <Badge variant="secondary" className="text-xs">
                                                +{post.tags.length - 5}
                                            </Badge>
                                        )
                                    }
                                </div>
                            )
                        }
                    </CardContent>
                </CardContentWrapper>

                <CardFooter className={cn(
                    "border-t border-neutral-100 dark:border-neutral-800 pt-3",
                    compact && "py-2"
                )}>
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            className={cn(
                                "h-8 px-2 gap-1.5 text-neutral-600 dark:text-neutral-400 hover:text-red-500 dark:hover:text-red-500",
                                isLiked && "text-red-500 dark:text-red-500"
                            )}
                            onClick={handleLike}
                        >
                            <Heart className={cn("w-4 h-4", isLiked && "fill-current")} />
                            <span className="text-xs">{likeCount}</span>
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 gap-1.5 text-neutral-600 dark:text-neutral-400 hover:text-blue-500 dark:hover:text-blue-500"
                        >
                            <MessageCircle className="w-4 h-4" />
                            <span className="text-xs">{post._count?.comments ?? post.commentCount}</span>
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 text-neutral-600 dark:text-neutral-400 hover:text-green-500 dark:hover:text-green-500"
                            onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                navigator.clipboard.writeText(window.location.origin + `/community/${post.community?.slug}/post/${post.id}`)
                                toast.success('Link copied!')
                            }}
                        >
                            <Share2 className="w-4 h-4" />
                        </Button>
                        <span className="text-xs text-neutral-400 ml-auto">
                            {post.viewCount} views
                        </span>
                    </div>
                </CardFooter>
            </Card>
        </motion.div>
    )
}

// Compact version for sidebar/widget
export function PostCardCompact({ post }: { post: PostCardProps['post'] }) {
    return (
        <Link href={`/community/${post.community?.slug}/post/${post.id}`}>
            <motion.div
                className="flex gap-3 p-3 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
                whileHover={{ x: 2 }}
            >
                <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarImage src={post.author.image ?? undefined} />
                    <AvatarFallback className="text-xs">
                        {post.author.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-900 dark:text-white line-clamp-1">
                        {post.title || post.content}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                        <span>{post.author.name}</span>
                        <span>•</span>
                        <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
                    </div>
                </div>
            </motion.div>
        </Link>
    )
}