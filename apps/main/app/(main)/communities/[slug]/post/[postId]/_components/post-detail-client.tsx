'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { formatDistanceToNow } from 'date-fns'
import {
    ArrowLeft, Heart, MessageCircle, Share2, MoreHorizontal, Pin, Lock, CheckCircle,
    UserPlus, UserMinus, Send, Loader2, Flag, Bookmark, Copy, Twitter, Linkedin
} from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader } from '@repo/ui/components/ui/card'
import { Badge } from '@repo/ui/components/ui/badge'
import { Button } from '@repo/ui/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@repo/ui/components/ui/avatar'
import { Textarea } from '@repo/ui/components/ui/textarea'
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@repo/ui/components/ui/dropdown-menu'
import { CommunitySidebar } from '@/components/community/community-sidebar'
import { cn } from '@repo/ui/lib/utils'
import {
    togglePostLike, createComment, toggleCommentLike
} from '@/actions/(main)/community/post.action'
import { toggleFollow } from '@/actions/(main)/community/follow.action'
import toast from '@repo/ui/components/ui/sonner'

interface PostDetailClientProps {
    user: {
        id: string
        name: string | null
        image: string | null
    }
    post: {
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
            bio?: string | null
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
        comments?: Array<{
            id: string
            content: string
            isAccepted: boolean
            likeCount: number
            createdAt: Date
            author: {
                id: string
                name: string | null
                username: string | null
                image: string | null
            }
            replies?: Array<{
                id: string
                content: string
                likeCount: number
                createdAt: Date
                author: {
                    id: string
                    name: string | null
                    username: string | null
                    image: string | null
                }
                _count?: { likes: number }
            }>
            _count?: {
                likes: number
                replies: number
            }
        }>
        _count?: {
            likes: number
            comments: number
        }
        isLiked?: boolean
    }
    userCommunities: Array<{
        id: string
        name: string
        slug: string
        logo?: string | null
        themeColor: string
        userRole?: string
    }>
    isFollowingAuthor: boolean
}

export function PostDetailClient({
    user,
    post,
    userCommunities,
    isFollowingAuthor: initialFollowing
}: PostDetailClientProps) {
    const [isLiked, setIsLiked] = useState(post.isLiked ?? false)
    const [likeCount, setLikeCount] = useState(post._count?.likes ?? post.likeCount)
    const [isLiking, setIsLiking] = useState(false)
    const [isFollowing, setIsFollowing] = useState(initialFollowing)
    const [isFollowLoading, setIsFollowLoading] = useState(false)
    const [comments, setComments] = useState(post.comments || [])
    const [newComment, setNewComment] = useState('')
    const [isSubmittingComment, setIsSubmittingComment] = useState(false)
    const [replyingTo, setReplyingTo] = useState<string | null>(null)
    const [replyContent, setReplyContent] = useState('')

    const handleLike = async () => {
        if (isLiking) return
        setIsLiking(true)

        setIsLiked(!isLiked)
        setLikeCount(prev => isLiked ? prev - 1 : prev + 1)

        try {
            const result = await togglePostLike(post.id)
            if (!result.success) {
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

    const handleFollow = async () => {
        if (isFollowLoading || user.id === post.author.id) return
        setIsFollowLoading(true)

        try {
            const result = await toggleFollow(post.author.id)
            if (result.success) {
                setIsFollowing(result.following ?? false)
                toast.success(result.following ? 'Following!' : 'Unfollowed')
            } else {
                toast.error(result.error)
            }
        } catch {
            toast.error('Failed to update follow status')
        } finally {
            setIsFollowLoading(false)
        }
    }

    const handleSubmitComment = async () => {
        if (!newComment.trim() || isSubmittingComment) return
        setIsSubmittingComment(true)

        try {
            const result = await createComment(post.id, newComment.trim())
            if (result.success && result.data) {
                setComments(prev => [result.data as any, ...prev])
                setNewComment('')
                toast.success('Comment added!')
            } else {
                toast.error(result.error || 'Failed to add comment')
            }
        } catch {
            toast.error('Something went wrong')
        } finally {
            setIsSubmittingComment(false)
        }
    }

    const handleSubmitReply = async (commentId: string) => {
        if (!replyContent.trim() || isSubmittingComment) return
        setIsSubmittingComment(true)

        try {
            const result = await createComment(post.id, replyContent.trim(), commentId)
            if (result.success && result.data) {
                setComments(prev => prev.map(c =>
                    c.id === commentId
                        ? { ...c, replies: [...(c.replies || []), result.data as any] }
                        : c
                ))
                setReplyContent('')
                setReplyingTo(null)
                toast.success('Reply added!')
            } else {
                toast.error(result.error || 'Failed to add reply')
            }
        } catch {
            toast.error('Something went wrong')
        } finally {
            setIsSubmittingComment(false)
        }
    }

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href)
        toast.success('Link copied to clipboard!')
    }

    return (
        <div className="min-h-screen bg-white dark:bg-neutral-950">
            <div className="flex">
                <CommunitySidebar userCommunities={userCommunities} />

                <main className="flex-1 min-w-0">
                    <div className="max-w-3xl mx-auto px-4 py-6">
                        <Link href={`/community/${post.community?.slug || ''}`}>
                            <Button variant="ghost" size="sm" className="mb-4 gap-2">
                                <ArrowLeft className="w-4 h-4" />
                                Back to {post.community?.name || 'Community'}
                            </Button>
                        </Link>
                        <Card className="border border-neutral-200 dark:border-neutral-800 mb-6">
                            <CardHeader>
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-start gap-3">
                                        <Link href={`/profile/${post.author.username || post.author.id}`}>
                                            <Avatar className="w-12 h-12">
                                                <AvatarImage src={post.author.image ?? undefined} />
                                                <AvatarFallback className="bg-neutral-100 dark:bg-neutral-800">
                                                    {post.author.name?.charAt(0) || 'U'}
                                                </AvatarFallback>
                                            </Avatar>
                                        </Link>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <Link
                                                    href={`/profile/${post.author.username || post.author.id}`}
                                                    className="font-semibold text-neutral-900 dark:text-white hover:underline"
                                                >
                                                    {post.author.name || post.author.username || 'Anonymous'}
                                                </Link>
                                                {
                                                    user.id !== post.author.id && (
                                                        <Button
                                                            variant={isFollowing ? "outline" : "default"}
                                                            size="sm"
                                                            onClick={handleFollow}
                                                            disabled={isFollowLoading}
                                                            className="h-7 text-xs"
                                                        >
                                                            {
                                                                isFollowLoading ? (
                                                                    <Loader2 className="w-3 h-3 animate-spin" />
                                                                ) : isFollowing ? (
                                                                    <>
                                                                        <UserMinus className="w-3 h-3 mr-1" />
                                                                        Following
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <UserPlus className="w-3 h-3 mr-1" />
                                                                        Follow
                                                                    </>
                                                                )
                                                            }
                                                        </Button>
                                                    )
                                                }
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-neutral-500">
                                                {
                                                    post.community && (
                                                        <>
                                                            <Link
                                                                href={`/community/${post.community.slug}`}
                                                                className="hover:text-neutral-700 dark:hover:text-neutral-300"
                                                            >
                                                                {post.community.name}
                                                            </Link>
                                                            <span>•</span>
                                                        </>
                                                    )
                                                }
                                                <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {
                                            post.isPinned && (
                                                <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                                                    <Pin className="w-3 h-3 mr-1" />
                                                    Pinned
                                                </Badge>
                                            )
                                        }
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="w-8 h-8">
                                                    <MoreHorizontal className="w-4 h-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={handleShare}>
                                                    <Copy className="w-4 h-4 mr-2" />
                                                    Copy Link
                                                </DropdownMenuItem>
                                                <DropdownMenuItem>
                                                    <Bookmark className="w-4 h-4 mr-2" />
                                                    Save Post
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem className="text-red-600">
                                                    <Flag className="w-4 h-4 mr-2" />
                                                    Report
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {
                                    post.title && (
                                        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">
                                            {post.title}
                                        </h1>
                                    )
                                }
                                <div className="prose prose-neutral dark:prose-invert max-w-none mb-4">
                                    <p className="text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap">
                                        {post.content}
                                    </p>
                                </div>
                                {
                                    post.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-4">
                                            {
                                                post.tags.map((tag) => (
                                                    <Badge
                                                        key={tag}
                                                        variant="secondary"
                                                        className="text-xs bg-neutral-100 dark:bg-neutral-800"
                                                    >
                                                        #{tag}
                                                    </Badge>
                                                ))
                                            }
                                        </div>
                                    )
                                }
                            </CardContent>
                            <CardFooter className="border-t border-neutral-100 dark:border-neutral-800 pt-4">
                                <div className="flex items-center justify-between w-full">
                                    <div className="flex items-center gap-4">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className={cn(
                                                "gap-2 text-neutral-600 dark:text-neutral-400 hover:text-red-500",
                                                isLiked && "text-red-500"
                                            )}
                                            onClick={handleLike}
                                        >
                                            <Heart className={cn("w-5 h-5", isLiked && "fill-current")} />
                                            <span>{likeCount}</span>
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="gap-2 text-neutral-600 dark:text-neutral-400"
                                        >
                                            <MessageCircle className="w-5 h-5" />
                                            <span>{comments.length}</span>
                                        </Button>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="gap-2 text-neutral-600 dark:text-neutral-400"
                                                >
                                                    <Share2 className="w-5 h-5" />
                                                    Share
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                                <DropdownMenuItem onClick={handleShare}>
                                                    <Copy className="w-4 h-4 mr-2" />
                                                    Copy Link
                                                </DropdownMenuItem>
                                                <DropdownMenuItem>
                                                    <Twitter className="w-4 h-4 mr-2" />
                                                    Share on Twitter
                                                </DropdownMenuItem>
                                                <DropdownMenuItem>
                                                    <Linkedin className="w-4 h-4 mr-2" />
                                                    Share on LinkedIn
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                    <span className="text-sm text-neutral-400">
                                        {post.viewCount} views
                                    </span>
                                </div>
                            </CardFooter>
                        </Card>
                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                                Comments ({comments.length})
                            </h2>
                            {
                                !post.isLocked && (
                                    <div className="flex gap-3">
                                        <Avatar className="w-10 h-10">
                                            <AvatarImage src={user.image ?? undefined} />
                                            <AvatarFallback className="bg-neutral-100 dark:bg-neutral-800">
                                                {user.name?.charAt(0) || 'U'}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <Textarea
                                                placeholder="Write a comment..."
                                                value={newComment}
                                                onChange={(e) => setNewComment(e.target.value)}
                                                rows={3}
                                                className="resize-none mb-2"
                                            />
                                            <div className="flex justify-end">
                                                <Button
                                                    onClick={handleSubmitComment}
                                                    disabled={!newComment.trim() || isSubmittingComment}
                                                    size="sm"
                                                >
                                                    {
                                                        isSubmittingComment ? (
                                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                        ) : (
                                                            <Send className="w-4 h-4 mr-2" />
                                                        )
                                                    }
                                                    Comment
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                )
                            }
                            {
                                post.isLocked && (
                                    <div className="text-center py-4 text-neutral-500">
                                        <Lock className="w-5 h-5 mx-auto mb-2" />
                                        This post is locked. No new comments can be added.
                                    </div>
                                )
                            }
                            <div className="space-y-4">
                                <AnimatePresence>
                                    {
                                        comments.map((comment, index) => (
                                            <motion.div
                                                key={comment.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                            >
                                                <CommentCard
                                                    comment={comment}
                                                    postId={post.id}
                                                    currentUserId={user.id}
                                                    isPostAuthor={post.author.id === comment.author.id}
                                                    replyingTo={replyingTo}
                                                    setReplyingTo={setReplyingTo}
                                                    replyContent={replyContent}
                                                    setReplyContent={setReplyContent}
                                                    onSubmitReply={handleSubmitReply}
                                                    isSubmitting={isSubmittingComment}
                                                    isLocked={post.isLocked}
                                                />
                                            </motion.div>
                                        ))
                                    }
                                </AnimatePresence>
                                {
                                    comments.length === 0 && (
                                        <div className="text-center py-8 text-neutral-500">
                                            <MessageCircle className="w-12 h-12 mx-auto mb-3 text-neutral-300 dark:text-neutral-700" />
                                            <p>No comments yet. Be the first to comment!</p>
                                        </div>
                                    )
                                }
                            </div>
                        </div>
                    </div>
                </main>
                <aside className="w-80 flex-shrink-0 hidden xl:block border-l border-neutral-200 dark:border-neutral-800">
                    <div className="sticky top-20 p-4 space-y-6">
                        <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                            <Link href={`/profile/${post.author.username || post.author.id}`}>
                                <div className="flex items-center gap-3 mb-3">
                                    <Avatar className="w-12 h-12">
                                        <AvatarImage src={post.author.image ?? undefined} />
                                        <AvatarFallback>
                                            {post.author.name?.charAt(0) || 'U'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-semibold text-neutral-900 dark:text-white">
                                            {post.author.name || 'Anonymous'}
                                        </p>
                                        {
                                            post.author.username && (
                                                <p className="text-sm text-neutral-500">@{post.author.username}</p>
                                            )
                                        }
                                    </div>
                                </div>
                            </Link>
                            {
                                post.author.bio && (
                                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                                        {post.author.bio}
                                    </p>
                                )
                            }
                            {
                                user.id !== post.author.id && (
                                    <Button
                                        variant={isFollowing ? "outline" : "default"}
                                        className="w-full"
                                        onClick={handleFollow}
                                        disabled={isFollowLoading}
                                    >
                                        {
                                            isFollowLoading ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : isFollowing ? (
                                                <>
                                                    <UserMinus className="w-4 h-4 mr-2" />
                                                    Unfollow
                                                </>
                                            ) : (
                                                <>
                                                    <UserPlus className="w-4 h-4 mr-2" />
                                                    Follow
                                                </>
                                            )
                                        }
                                    </Button>
                                )
                            }
                        </div>
                        {
                            post.community && (
                                <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                                    <h3 className="font-semibold text-neutral-900 dark:text-white mb-3">
                                        Posted in
                                    </h3>
                                    <Link href={`/community/${post.community.slug}`}>
                                        <div className="flex items-center gap-3 hover:bg-neutral-100 dark:hover:bg-neutral-800 p-2 -m-2 rounded-lg transition-colors">
                                            {
                                                post.community.logo ? (
                                                    <Image
                                                        src={post.community.logo}
                                                        alt={post.community.name}
                                                        width={40}
                                                        height={40}
                                                        className="w-10 h-10 rounded-lg object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500" />
                                                )
                                            }
                                            <span className="font-medium text-neutral-900 dark:text-white">
                                                {post.community.name}
                                            </span>
                                        </div>
                                    </Link>
                                </div>
                            )
                        }
                    </div>
                </aside>
            </div>
        </div>
    )
}

// Comment Card Component
interface CommentCardProps {
    comment: {
        id: string
        content: string
        isAccepted: boolean
        likeCount: number
        createdAt: Date
        author: {
            id: string
            name: string | null
            username: string | null
            image: string | null
        }
        replies?: Array<{
            id: string
            content: string
            likeCount: number
            createdAt: Date
            author: {
                id: string
                name: string | null
                username: string | null
                image: string | null
            }
            _count?: { likes: number }
        }>
        _count?: {
            likes: number
            replies: number
        }
    }
    postId?: string
    currentUserId?: string
    isPostAuthor: boolean
    replyingTo: string | null
    setReplyingTo: (id: string | null) => void
    replyContent: string
    setReplyContent: (content: string) => void
    onSubmitReply: (commentId: string) => void
    isSubmitting: boolean
    isLocked: boolean
}

function CommentCard({
    comment,
    isPostAuthor,
    replyingTo,
    setReplyingTo,
    replyContent,
    setReplyContent,
    onSubmitReply,
    isSubmitting,
    isLocked
}: CommentCardProps) {
    const [isLiked, setIsLiked] = useState(false)
    const [likeCount, setLikeCount] = useState(comment._count?.likes ?? comment.likeCount)
    const [isLiking, setIsLiking] = useState(false)

    const handleLike = async () => {
        if (isLiking) return
        setIsLiking(true)

        setIsLiked(!isLiked)
        setLikeCount(prev => isLiked ? prev - 1 : prev + 1)

        try {
            const result = await toggleCommentLike(comment.id)
            if (!result.success) {
                setIsLiked(isLiked)
                setLikeCount(prev => isLiked ? prev + 1 : prev - 1)
            }
        } catch {
            setIsLiked(isLiked)
            setLikeCount(prev => isLiked ? prev + 1 : prev - 1)
        } finally {
            setIsLiking(false)
        }
    }

    return (
        <div className="space-y-3">
            <div className={cn(
                "p-4 rounded-xl border",
                comment.isAccepted
                    ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800"
                    : "bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800"
            )}>
                {
                    comment.isAccepted && (
                        <div className="flex items-center gap-2 mb-3 text-green-600 dark:text-green-400">
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-sm font-medium">Accepted Answer</span>
                        </div>
                    )
                }
                <div className="flex gap-3">
                    <Link href={`/profile/${comment.author.username || comment.author.id}`}>
                        <Avatar className="w-8 h-8">
                            <AvatarImage src={comment.author.image ?? undefined} />
                            <AvatarFallback className="text-xs">
                                {comment.author.name?.charAt(0) || 'U'}
                            </AvatarFallback>
                        </Avatar>
                    </Link>
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <Link
                                href={`/profile/${comment.author.username || comment.author.id}`}
                                className="font-medium text-sm text-neutral-900 dark:text-white hover:underline"
                            >
                                {comment.author.name || 'Anonymous'}
                            </Link>
                            {
                                isPostAuthor && (
                                    <Badge variant="secondary" className="text-xs">OP</Badge>
                                )
                            }
                            <span className="text-xs text-neutral-500">
                                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                            </span>
                        </div>
                        <p className="text-neutral-700 dark:text-neutral-300 text-sm whitespace-pre-wrap">
                            {comment.content}
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                className={cn(
                                    "h-7 px-2 text-xs gap-1",
                                    isLiked ? "text-red-500" : "text-neutral-500"
                                )}
                                onClick={handleLike}
                            >
                                <Heart className={cn("w-3 h-3", isLiked && "fill-current")} />
                                {likeCount}
                            </Button>
                            {
                                !isLocked && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 px-2 text-xs text-neutral-500"
                                        onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                                    >
                                        Reply
                                    </Button>
                                )
                            }
                        </div>
                    </div>
                </div>
                {
                    replyingTo === comment.id && !isLocked && (
                        <div className="mt-3 ml-11">
                            <Textarea
                                placeholder="Write a reply..."
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                rows={2}
                                className="resize-none text-sm mb-2"
                            />
                            <div className="flex justify-end gap-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setReplyingTo(null)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={() => onSubmitReply(comment.id)}
                                    disabled={!replyContent.trim() || isSubmitting}
                                >
                                    {
                                        isSubmitting ? (
                                            <Loader2 className="w-3 h-3 animate-spin" />
                                        ) : (
                                            'Reply'
                                        )
                                    }
                                </Button>
                            </div>
                        </div>
                    )
                }
            </div>
            {
                comment.replies && comment.replies.length > 0 && (
                    <div className="ml-11 space-y-3">
                        {
                            comment.replies.map((reply) => (
                                <div
                                    key={reply.id}
                                    className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800"
                                >
                                    <div className="flex gap-3">
                                        <Link href={`/profile/${reply.author.username || reply.author.id}`}>
                                            <Avatar className="w-6 h-6">
                                                <AvatarImage src={reply.author.image ?? undefined} />
                                                <AvatarFallback className="text-xs">
                                                    {reply.author.name?.charAt(0) || 'U'}
                                                </AvatarFallback>
                                            </Avatar>
                                        </Link>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Link
                                                    href={`/profile/${reply.author.username || reply.author.id}`}
                                                    className="font-medium text-xs text-neutral-900 dark:text-white hover:underline"
                                                >
                                                    {reply.author.name || 'Anonymous'}
                                                </Link>
                                                <span className="text-xs text-neutral-500">
                                                    {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
                                                </span>
                                            </div>
                                            <p className="text-neutral-700 dark:text-neutral-300 text-sm whitespace-pre-wrap">
                                                {reply.content}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                )}
        </div>
    )
}