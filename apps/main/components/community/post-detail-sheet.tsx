'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    X, Heart, MessageSquare, Share2, Bookmark, MoreHorizontal, Flag,
    Send, Loader2, Code2, ExternalLink, ChevronDown, CheckCircle, Reply,
    GraduationCap, Award, Play
} from 'lucide-react'
import { Button } from '@repo/ui/components/ui/button'
import { Textarea } from '@repo/ui/components/ui/textarea'
import { Badge } from '@repo/ui/components/ui/badge'
import {
    Avatar, AvatarFallback, AvatarImage
} from '@repo/ui/components/ui/avatar'
import {
    Sheet, SheetContent, SheetHeader, SheetTitle
} from '@repo/ui/components/ui/sheet'
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuSeparator, DropdownMenuTrigger
} from '@repo/ui/components/ui/dropdown-menu'
import { ScrollArea } from '@repo/ui/components/ui/scroll-area'
import { cn } from '@repo/ui/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import {
    togglePostLike, createComment, getPost, submitQuizAttempt, getQuizAttempt, voteOnPoll
} from '@/actions/(main)/community/post.action'
import toast from '@repo/ui/components/ui/sonner'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import Link from 'next/link'

// Dynamically import CodeEditor and Quiz
const CodeEditor = dynamic(() => import('@/components/main/code-editor'), { ssr: false })
const Quiz = dynamic(() => import('@/components/main/quiz'), { ssr: false })

interface PostAuthor {
    id: string
    name: string | null
    username: string | null
    image: string | null
}

interface PostCommunity {
    id: string
    name: string
    slug: string
    logo?: string | null
}

interface PostAttachment {
    type: 'image' | 'link' | 'code' | 'quiz'
    url?: string
    name?: string
    title?: string
    description?: string
    code?: string
    language?: string
    questions?: {
        id: string
        text: string
        type: 'single' | 'multiple'
        options: { id: string; text: string; isCorrect?: boolean }[]
        explanation?: string
    }[]
    quiz?: {
        title: string
        description?: string
        questions: {
            id: string
            text: string
            type: 'single' | 'multiple'
            options: { id: string; text: string; isCorrect?: boolean }[]
            explanation?: string
        }[]
    }
}

interface PostCodeBlock {
    code: string
    language: string
}

interface Comment {
    id: string
    content: string
    createdAt: Date
    likeCount: number
    isLiked?: boolean
    author: PostAuthor
    replies?: Comment[]
    parentId?: string | null
}

interface Post {
    id: string
    title?: string | null
    content: string
    type: string
    tags: string[]
    isPinned: boolean
    isLocked: boolean
    isAnswered?: boolean
    isResolved?: boolean
    likeCount: number
    commentCount: number
    viewCount: number
    createdAt: Date
    updatedAt: Date
    author: PostAuthor
    community: PostCommunity | null
    channel: {
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
    isBookmarked?: boolean
    attachments?: PostAttachment[]
    codeBlocks?: PostCodeBlock[]
    embeds?: unknown[]
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
    }
}

interface PostDetailSheetProps {
    post: Post | null
    isOpen: boolean
    onClose: () => void
    currentUserId?: string | null
    onPostUpdated?: () => void
}

export function PostDetailSheet({
    post,
    isOpen,
    onClose,
    currentUserId,
    onPostUpdated
}: PostDetailSheetProps) {
    const [isLiked, setIsLiked] = useState(post?.isLiked || false)
    const [likeCount, setLikeCount] = useState(post?.likeCount || 0)
    const [isBookmarked, setIsBookmarked] = useState(post?.isBookmarked || false)
    const [isLiking, setIsLiking] = useState(false)

    const [comments, setComments] = useState<Comment[]>([])
    const [isLoadingComments, setIsLoadingComments] = useState(false)
    const [commentContent, setCommentContent] = useState('')
    const [isSubmittingComment, setIsSubmittingComment] = useState(false)
    const [replyingTo, setReplyingTo] = useState<string | null>(null)
    const [replyContent, setReplyContent] = useState('')

    const [showAllAttachments, setShowAllAttachments] = useState(false)

    // Quiz states
    const [showQuiz, setShowQuiz] = useState(false)
    const [quizCompleted, setQuizCompleted] = useState(false)
    const [quizResult, setQuizResult] = useState<{
        correctAnswers: number
        totalQuestions: number
        scorePercentage: number
        pointsEarned: number
    } | null>(null)
    const [isCheckingQuizAttempt, setIsCheckingQuizAttempt] = useState(false)

    // Load comments when sheet opens
    const loadComments = useCallback(async () => {
        if (!post?.id) return

        setIsLoadingComments(true)
        try {
            // Check if already viewed in this session
            const storageKey = `viewed_post_${post.id}`
            const hasViewed = typeof window !== 'undefined' && sessionStorage.getItem(storageKey)

            // If not viewed, we'll increment. If viewed, we skip increment.
            // Note: getPost defaults to true, so we pass !hasViewed
            const shouldIncrement = !hasViewed

            const result = await getPost(post.id, shouldIncrement)

            if (shouldIncrement && typeof window !== 'undefined') {
                sessionStorage.setItem(storageKey, 'true')
            }

            if (result.success && result.data?.comments) {
                setComments(result.data.comments as Comment[])
            }
        } catch (error) {
            console.error('Failed to load comments:', error)
        } finally {
            setIsLoadingComments(false)
        }
    }, [post?.id])

    // Check for existing quiz attempt
    const checkQuizAttempt = useCallback(async () => {
        if (!post?.id || !currentUserId) return

        setIsCheckingQuizAttempt(true)
        try {
            const result = await getQuizAttempt(post.id)
            if (result.success && result.data) {
                setQuizCompleted(true)
                setQuizResult({
                    correctAnswers: result.data.correctAnswers,
                    totalQuestions: result.data.totalQuestions,
                    scorePercentage: result.data.scorePercentage,
                    pointsEarned: result.data.pointsEarned
                })
            }
        } catch (error) {
            console.error('Failed to check quiz attempt:', error)
        } finally {
            setIsCheckingQuizAttempt(false)
        }
    }, [post?.id, currentUserId])

    // Load comments when post changes
    useState(() => {
        if (isOpen && post?.id) {
            loadComments()
            checkQuizAttempt()
            setIsLiked(post.isLiked || false)
            setLikeCount(post.likeCount || 0)
            setIsBookmarked(post.isBookmarked || false)
            setShowQuiz(false)
        }
    })

    const handleLike = async () => {
        if (!post?.id || !currentUserId || isLiking) return

        setIsLiking(true)
        const previousLiked = isLiked
        const previousCount = likeCount

        // Optimistic update
        setIsLiked(!isLiked)
        setLikeCount(prev => isLiked ? prev - 1 : prev + 1)

        try {
            const result = await togglePostLike(post.id)
            if (!result.success) {
                // Revert on failure
                setIsLiked(previousLiked)
                setLikeCount(previousCount)
                toast.error(result.error || 'Failed to like post')
            }
        } catch {
            setIsLiked(previousLiked)
            setLikeCount(previousCount)
            toast.error('Something went wrong')
        } finally {
            setIsLiking(false)
        }
    }

    const handleComment = async () => {
        if (!post?.id || !currentUserId || !commentContent.trim()) return

        setIsSubmittingComment(true)
        try {
            const result = await createComment(post.id, commentContent.trim())
            if (result.success && result.data) {
                setComments(prev => [result.data as Comment, ...prev])
                setCommentContent('')
                onPostUpdated?.()
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

    const handleReply = async (parentId: string) => {
        if (!post?.id || !currentUserId || !replyContent.trim()) return

        setIsSubmittingComment(true)
        try {
            const result = await createComment(post.id, replyContent.trim(), parentId)
            if (result.success && result.data) {
                // Add reply to parent comment
                setComments(prev => prev.map(c => {
                    if (c.id === parentId) {
                        return {
                            ...c,
                            replies: [...(c.replies || []), result.data as Comment]
                        }
                    }
                    return c
                }))
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

    const handleShare = async () => {
        if (!post?.id) return

        try {
            await navigator.clipboard.writeText(
                `${window.location.origin}/communities/${post.community?.slug || 'post'}/${post.id}`
            )
            toast.success('Link copied to clipboard!')
        } catch {
            toast.error('Failed to copy link')
        }
    }

    if (!post) return null

    const attachments = (post.attachments as PostAttachment[]) || []
    const embeds = (post.embeds as PostAttachment[]) || []
    const allAttachments = [...attachments, ...embeds]
    const codeBlocks = (post.codeBlocks as PostCodeBlock[]) || []
    const imageAttachments = allAttachments.filter(a => a.type === 'image')
    const linkAttachments = allAttachments.filter(a => a.type === 'link')

    return (
        <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <SheetContent side="bottom" className="w-full h-[90vh] overflow-y-auto">
                <div className="max-w-7xl mx-auto flex flex-col h-full">
                    <SheetHeader className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex-shrink-0">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Avatar className="w-10 h-10">
                                    <AvatarImage src={post.author.image ?? undefined} />
                                    <AvatarFallback>
                                        {post.author.name?.charAt(0) || 'U'}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <SheetTitle className="text-sm font-medium">
                                        {post.author.name || 'Unknown'}
                                    </SheetTitle>
                                    <p className="text-xs text-neutral-500">
                                        {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                                        {
                                            post.community && (
                                                <span> in <Link href={`/communities/${post.community.slug}`} className="text-primary hover:underline">{post.community.name}</Link></span>
                                            )
                                        }
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="w-8 h-8">
                                            <MoreHorizontal className="w-4 h-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem>
                                            <Bookmark className="w-4 h-4 mr-2" />
                                            {isBookmarked ? 'Remove Bookmark' : 'Bookmark'}
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem className="text-red-600">
                                            <Flag className="w-4 h-4 mr-2" />
                                            Report
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                <Button variant="ghost" size="icon" className="w-8 h-8" onClick={onClose}>
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </SheetHeader>
                    <ScrollArea className="flex-1">
                        <div className="px-6 py-4 space-y-6">
                            <div className="flex items-center gap-2 flex-wrap">
                                <Badge variant="secondary" className="text-xs">
                                    {post.type.replace('_', ' ')}
                                </Badge>
                                {
                                    post.isPinned && (
                                        <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                                            Pinned
                                        </Badge>
                                    )
                                }
                                {
                                    post.isAnswered && (
                                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                            <CheckCircle className="w-3 h-3 mr-1" />
                                            Answered
                                        </Badge>
                                    )
                                }
                                {
                                    post.isResolved && (
                                        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                                            <CheckCircle className="w-3 h-3 mr-1" />
                                            Resolved
                                        </Badge>
                                    )
                                }
                            </div>

                            {
                                post.title && (
                                    <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                                        {post.title}
                                    </h2>
                                )
                            }

                            <div className="prose prose-neutral dark:prose-invert max-w-none">
                                <p className="whitespace-pre-wrap">{post.content}</p>
                            </div>

                            {/* Poll Rendering */}
                            {post.poll && (
                                <div className="mt-4 space-y-3 border rounded-xl p-4 bg-neutral-50 dark:bg-neutral-900/50">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="font-medium text-sm text-neutral-900 dark:text-neutral-100">{post.poll.question}</h3>
                                        <div className="text-xs text-neutral-500">
                                            {post.poll.endDate && new Date() > new Date(post.poll.endDate) ? 'Closed' : 'Open'} • {post.poll.votes?.length || 0} votes
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        {((post.poll.options as string[]) || []).map((option, idx) => {
                                            const totalVotes = post.poll?.votes?.length || 0
                                            const optionVotes = post.poll?.votes?.filter(v => v.optionIndex === idx).length || 0
                                            const percentage = totalVotes > 0 ? Math.round((optionVotes / totalVotes) * 100) : 0
                                            const userVote = post.poll?.votes?.find(v => v.userId === currentUserId)
                                            const isVoted = !!userVote
                                            const isSelected = userVote?.optionIndex === idx
                                            const isClosed = post.poll?.endDate && new Date() > new Date(post.poll.endDate)

                                            return (
                                                <div key={idx} className="relative">
                                                    {isVoted || isClosed ? (
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
                                                            onClick={async () => {
                                                                if (post.poll) await voteOnPoll(post.poll.id, idx)
                                                                if (!currentUserId) toast.error('Please login to vote')
                                                                else toast.success('Vote submitted')
                                                                if (onPostUpdated) onPostUpdated()
                                                            }}
                                                        >
                                                            {option}
                                                        </Button>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}

                            {
                                imageAttachments.length > 0 && (
                                    <div className="space-y-2">
                                        <div className={cn(
                                            "grid gap-2",
                                            imageAttachments.length === 1 ? "grid-cols-1" :
                                                imageAttachments.length === 2 ? "grid-cols-2" : "grid-cols-2"
                                        )}>
                                            {
                                                (showAllAttachments ? imageAttachments : imageAttachments.slice(0, 4)).map((img, idx) => (
                                                    <div key={idx} className="relative aspect-video rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                                                        <Image
                                                            src={img.url || ''}
                                                            alt={img.name || 'Image'}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    </div>
                                                ))
                                            }
                                        </div>
                                        {
                                            imageAttachments.length > 4 && !showAllAttachments && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setShowAllAttachments(true)}
                                                    className="w-full"
                                                >
                                                    Show {imageAttachments.length - 4} more images
                                                    <ChevronDown className="w-4 h-4 ml-1" />
                                                </Button>
                                            )
                                        }
                                    </div>
                                )
                            }

                            {
                                linkAttachments.length > 0 && (
                                    <div className="space-y-2">
                                        {
                                            linkAttachments.map((link, idx) => (
                                                <Link
                                                    key={idx}
                                                    href={link.url || ""}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-3 p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:border-primary transition-colors"
                                                >
                                                    <div className="w-10 h-10 rounded bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                                                        <ExternalLink className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium truncate">{link.title || link.url}</p>
                                                        {
                                                            link.description && (
                                                                <p className="text-sm text-neutral-500 truncate">{link.description}</p>
                                                            )
                                                        }
                                                    </div>
                                                </Link>
                                            ))
                                        }
                                    </div>
                                )
                            }

                            {
                                codeBlocks.length > 0 && (
                                    <div className="space-y-4">
                                        {
                                            codeBlocks.map((block, idx) => (
                                                <div key={idx} className="rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-700">
                                                    <div className="flex items-center justify-between px-4 py-2 bg-neutral-100 dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700">
                                                        <div className="flex items-center gap-2">
                                                            <Code2 className="w-4 h-4 text-neutral-500" />
                                                            <span className="text-sm font-medium">{block.language}</span>
                                                        </div>
                                                    </div>
                                                    <CodeEditor
                                                        code={block.code}
                                                        language={block.language}
                                                        readOnly
                                                        height="200px"
                                                        showCopyButton
                                                        showLanguageSelector={false}
                                                    />
                                                </div>
                                            ))
                                        }
                                    </div>
                                )
                            }

                            {
                                allAttachments.filter(a => a.type === 'quiz' && (a.quiz || a.questions)).map((quizAttachment, idx) => {
                                    const quizTitle = quizAttachment.quiz?.title || quizAttachment.name || quizAttachment.title || 'Quiz'
                                    const quizDescription = quizAttachment.quiz?.description || quizAttachment.description
                                    const quizQuestions = quizAttachment.quiz?.questions || quizAttachment.questions || []
                                    const questionCount = quizQuestions.length

                                    return (
                                        <div key={idx} className="space-y-4">
                                            {
                                                !showQuiz && !quizCompleted && (
                                                    <div className="p-6 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-800">
                                                        <div className="flex items-start gap-4">
                                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0">
                                                                <GraduationCap className="w-6 h-6 text-white" />
                                                            </div>
                                                            <div className="flex-1">
                                                                <h4 className="font-semibold text-neutral-900 dark:text-white">
                                                                    {quizTitle}
                                                                </h4>
                                                                {
                                                                    quizDescription && (
                                                                        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                                                                            {quizDescription}
                                                                        </p>
                                                                    )
                                                                }
                                                                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">
                                                                    {questionCount} questions • Earn points for correct answers
                                                                </p>
                                                                <Button
                                                                    onClick={() => setShowQuiz(true)}
                                                                    className="mt-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white"
                                                                    disabled={isCheckingQuizAttempt}
                                                                >
                                                                    {
                                                                        isCheckingQuizAttempt ? (
                                                                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                                                        ) : (
                                                                            <Play className="w-4 h-4 mr-2" />
                                                                        )
                                                                    }
                                                                    Take Quiz
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            }

                                            {
                                                !showQuiz && quizCompleted && quizResult && (
                                                    <div className="p-6 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center flex-shrink-0">
                                                                <Award className="w-6 h-6 text-white" />
                                                            </div>
                                                            <div className="flex-1">
                                                                <h4 className="font-semibold text-neutral-900 dark:text-white">
                                                                    Quiz Completed!
                                                                </h4>
                                                                <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                                                                    You previously scored {quizResult.correctAnswers}/{quizResult.totalQuestions} ({quizResult.scorePercentage}%)
                                                                </p>
                                                                <p className="text-sm text-amber-600 dark:text-amber-400 font-medium mt-1">
                                                                    {quizResult.pointsEarned} points earned
                                                                </p>
                                                                <div className="mt-4 flex flex-col gap-2">
                                                                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                                                        You can retake this quiz to improve your score.
                                                                    </p>
                                                                    <Button
                                                                        onClick={() => {
                                                                            setQuizCompleted(false)
                                                                            setShowQuiz(true)
                                                                        }}
                                                                        variant="outline"
                                                                        className="w-full bg-white/50 border-amber-200 hover:bg-white/80 dark:bg-black/20 dark:border-amber-800 dark:hover:bg-black/40 text-amber-700 dark:text-amber-300"
                                                                    >
                                                                        <Play className="w-4 h-4 mr-2" />
                                                                        Retake Quiz
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            }

                                            {
                                                showQuiz && quizQuestions.length > 0 && (
                                                    <div className="py-4">
                                                        <Quiz
                                                            quizId={`post-${post.id}-quiz-${idx}`}
                                                            questions={quizQuestions.map(q => ({
                                                                ...q,
                                                                difficulty: 'MEDIUM' as const
                                                            }))}
                                                            title={quizTitle}
                                                            mode="practice"
                                                            immediateResults={true}
                                                            onComplete={async (results) => {
                                                                // Submit quiz attempt
                                                                const answers = results.answers.map(a => ({
                                                                    questionId: a.questionId,
                                                                    answer: a.selectedAnswer,
                                                                    isCorrect: a.isCorrect || false
                                                                }))

                                                                const submitResult = await submitQuizAttempt(
                                                                    post.id,
                                                                    answers,
                                                                    results.totalTimeTaken
                                                                )

                                                                if (submitResult.success && submitResult.data) {
                                                                    setQuizCompleted(true)
                                                                    setQuizResult({
                                                                        correctAnswers: submitResult.data.correctAnswers,
                                                                        totalQuestions: submitResult.data.totalQuestions,
                                                                        scorePercentage: submitResult.data.scorePercentage,
                                                                        pointsEarned: submitResult.data.pointsEarned
                                                                    })
                                                                    setShowQuiz(false)
                                                                    toast.success(`Quiz completed! +${submitResult.data.pointsEarned} points earned`)
                                                                } else {
                                                                    toast.error(submitResult.error || 'Failed to submit quiz')
                                                                }
                                                            }}
                                                        />
                                                    </div>
                                                )
                                            }
                                        </div>
                                    )
                                })
                            }

                            {
                                post.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {
                                            post.tags.map((tag) => (
                                                <Badge key={tag} variant="outline" className="text-xs">
                                                    #{tag}
                                                </Badge>
                                            ))
                                        }
                                    </div>
                                )
                            }

                            <div className="flex items-center gap-4 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleLike}
                                    disabled={!currentUserId || isLiking}
                                    className={cn(
                                        "gap-2",
                                        isLiked && "text-red-500"
                                    )}
                                >
                                    <Heart className={cn("w-4 h-4", isLiked && "fill-current")} />
                                    {likeCount}
                                </Button>
                                <Button variant="ghost" size="sm" className="gap-2">
                                    <MessageSquare className="w-4 h-4" />
                                    {comments.length || post.commentCount}
                                </Button>
                                <Button variant="ghost" size="sm" onClick={handleShare} className="gap-2">
                                    <Share2 className="w-4 h-4" />
                                    Share
                                </Button>
                            </div>
                            <div className="space-y-4 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                                <h3 className="font-semibold">Comments</h3>

                                {
                                    currentUserId && !post.isLocked && (
                                        <div className="flex gap-3">
                                            <Textarea
                                                placeholder="Write a comment..."
                                                value={commentContent}
                                                onChange={(e) => setCommentContent(e.target.value)}
                                                rows={2}
                                                className="flex-1 resize-none"
                                            />
                                            <Button
                                                onClick={handleComment}
                                                disabled={!commentContent.trim() || isSubmittingComment}
                                                size="icon"
                                            >
                                                {
                                                    isSubmittingComment ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <Send className="w-4 h-4" />
                                                    )
                                                }
                                            </Button>
                                        </div>
                                    )
                                }

                                {
                                    isLoadingComments ? (
                                        <div className="flex items-center justify-center py-8">
                                            <Loader2 className="w-6 h-6 animate-spin text-neutral-400" />
                                        </div>
                                    ) : comments.length === 0 ? (
                                        <p className="text-center text-neutral-500 py-8">
                                            No comments yet. Be the first to comment!
                                        </p>
                                    ) : (
                                        <div className="space-y-4">
                                            {
                                                comments.map((comment) => (
                                                    <div key={comment.id} className="space-y-3">
                                                        <div className="flex gap-3">
                                                            <Avatar className="w-8 h-8">
                                                                <AvatarImage src={comment.author.image ?? undefined} />
                                                                <AvatarFallback className="text-xs">
                                                                    {comment.author.name?.charAt(0) || 'U'}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-medium text-sm">
                                                                        {comment.author.name || 'Unknown'}
                                                                    </span>
                                                                    <span className="text-xs text-neutral-500">
                                                                        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                                                                    </span>
                                                                </div>
                                                                <p className="text-sm mt-1 whitespace-pre-wrap">{comment.content}</p>
                                                                <div className="flex items-center gap-3 mt-2">
                                                                    <Button variant="ghost" size="sm" className="h-6 px-2 text-xs gap-1">
                                                                        <Heart className="w-3 h-3" />
                                                                        {comment.likeCount || 0}
                                                                    </Button>
                                                                    {
                                                                        currentUserId && !post.isLocked && (
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="sm"
                                                                                className="h-6 px-2 text-xs gap-1"
                                                                                onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                                                                            >
                                                                                <Reply className="w-3 h-3" />
                                                                                Reply
                                                                            </Button>
                                                                        )
                                                                    }
                                                                </div>
                                                                <AnimatePresence>
                                                                    {
                                                                        replyingTo === comment.id && (
                                                                            <motion.div
                                                                                initial={{ opacity: 0, height: 0 }}
                                                                                animate={{ opacity: 1, height: 'auto' }}
                                                                                exit={{ opacity: 0, height: 0 }}
                                                                                className="flex gap-2 mt-2"
                                                                            >
                                                                                <Textarea
                                                                                    placeholder="Write a reply..."
                                                                                    value={replyContent}
                                                                                    onChange={(e) => setReplyContent(e.target.value)}
                                                                                    rows={1}
                                                                                    className="flex-1 resize-none text-sm"
                                                                                />
                                                                                <Button
                                                                                    size="sm"
                                                                                    onClick={() => handleReply(comment.id)}
                                                                                    disabled={!replyContent.trim() || isSubmittingComment}
                                                                                >
                                                                                    {
                                                                                        isSubmittingComment ? (
                                                                                            <Loader2 className="w-3 h-3 animate-spin" />
                                                                                        ) : (
                                                                                            <Send className="w-3 h-3" />
                                                                                        )
                                                                                    }
                                                                                </Button>
                                                                            </motion.div>
                                                                        )
                                                                    }
                                                                </AnimatePresence>

                                                                {/* Replies */}
                                                                {
                                                                    comment.replies && comment.replies.length > 0 && (
                                                                        <div className="mt-3 ml-4 pl-4 border-l-2 border-neutral-100 dark:border-neutral-800 space-y-3">
                                                                            {
                                                                                comment.replies.map((reply) => (
                                                                                    <div key={reply.id} className="flex gap-2">
                                                                                        <Avatar className="w-6 h-6">
                                                                                            <AvatarImage src={reply.author.image ?? undefined} />
                                                                                            <AvatarFallback className="text-xs">
                                                                                                {reply.author.name?.charAt(0) || 'U'}
                                                                                            </AvatarFallback>
                                                                                        </Avatar>
                                                                                        <div>
                                                                                            <div className="flex items-center gap-2">
                                                                                                <span className="font-medium text-xs">
                                                                                                    {reply.author.name || 'Unknown'}
                                                                                                </span>
                                                                                                <span className="text-xs text-neutral-500">
                                                                                                    {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
                                                                                                </span>
                                                                                            </div>
                                                                                            <p className="text-sm mt-0.5">{reply.content}</p>
                                                                                        </div>
                                                                                    </div>
                                                                                ))
                                                                            }
                                                                        </div>
                                                                    )
                                                                }
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            }
                                        </div>
                                    )
                                }
                            </div>
                        </div>
                    </ScrollArea>
                </div>
            </SheetContent>
        </Sheet>
    )
}