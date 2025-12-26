'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import {
    Heart, MessageCircle, Share2, MoreHorizontal, Pin, Lock, CheckCircle,
    Code2, HelpCircle, Image as ImageIcon, FileText, Bookmark, LucideIcon
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
import { togglePostLike } from '@/actions/(main)/community/post.action'
import toast from '@repo/ui/components/ui/sonner'

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
        attachments?: unknown
        codeBlocks?: unknown
    }
    showCommunity?: boolean
    compact?: boolean
    onLikeChange?: (liked: boolean) => void
}

const POST_TYPE_CONFIG: Record<string, { icon: LucideIcon; label: string; color: string }> = {
    DISCUSSION: { icon: MessageCircle, label: 'Discussion', color: 'text-blue-500' },
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
    onLikeChange
}: PostCardProps) {
    const [isLiked, setIsLiked] = useState(post.isLiked ?? false)
    const [likeCount, setLikeCount] = useState(post._count?.likes ?? post.likeCount)
    const [isLiking, setIsLiking] = useState(false)

    const typeConfig = POST_TYPE_CONFIG[post.type] || POST_TYPE_CONFIG.DISCUSSION
    const TypeIcon = typeConfig?.icon ?? MessageCircle

    const handleLike = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()

        if (isLiking) return
        setIsLiking(true)

        setIsLiked(!isLiked)
        setLikeCount(prev => isLiked ? prev - 1 : prev + 1)

        try {
            const result = await togglePostLike(post.id)
            if (result.success) {
                onLikeChange?.(result.liked ?? false)
            } else {
                // Revert on error
                setIsLiked(isLiked)
                setLikeCount(prev => isLiked ? prev + 1 : prev - 1)
                toast.error(result.error)
            }
        } catch {
            setIsLiked(isLiked)
            setLikeCount(prev => isLiked ? prev + 1 : prev - 1)
            toast.error('Failed to like post')
        } finally {
            setIsLiking(false)
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <Link href={`/community/${post.community?.slug}/post/${post.id}`}>
                <Card className={cn(
                    "group border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all duration-200 bg-white dark:bg-neutral-900",
                    post.isPinned && "border-l-4 border-l-blue-500",
                    compact && "shadow-none"
                )}>
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
                                        {
                                            post.channel && (
                                                <>
                                                    <span>•</span>
                                                    <span className="flex items-center gap-1">
                                                        {post.channel.icon} {post.channel.name}
                                                    </span>
                                                </>
                                            )
                                        }
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
            </Link>
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