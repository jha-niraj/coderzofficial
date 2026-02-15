"use client"

import { useState, useEffect, useTransition } from "react"
import { motion } from "framer-motion"
import { ScrollArea } from "@repo/ui/components/ui/scroll-area"
import { Button } from "@repo/ui/components/ui/button"
import { Badge } from "@repo/ui/components/ui/badge"
import { Textarea } from "@repo/ui/components/ui/textarea"
import {
    Avatar, AvatarFallback, AvatarImage
} from "@repo/ui/components/ui/avatar"
import { Separator } from "@repo/ui/components/ui/separator"
import {
    Globe, Github, Twitter, Eye, ThumbsUp, ThumbsDown, MessageSquare, 
    Share2, Calendar, User, Tag, Zap, CheckCircle, ArrowUpRight, Send, 
    Rocket
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import toast from "@repo/ui/components/ui/sonner"
import {
    trackProductView, trackProductClick, likeProduct, dislikeProduct,
    getUserProductReaction, addProductComment
} from "@/actions/(main)/launchpads"

interface Product {
    id: string
    slug: string
    name: string
    tagline: string
    description: string
    logo: string | null
    coverImage: string | null
    screenshots: string[]
    websiteUrl: string | null
    demoUrl: string | null
    githubUrl: string | null
    twitterUrl: string | null
    category: string
    tags: string[]
    techStack: string[]
    features: unknown
    pricing: string | null
    viewCount: number
    likeCount: number
    dislikeCount: number
    commentCount: number
    isFeatured: boolean
    isVerified: boolean
    type: string
    createdAt: string | Date
    createdBy?: {
        id: string
        name: string | null
        username: string | null
        image: string | null
        bio?: string | null
    } | null
    comments?: {
        id: string
        content: string
        createdAt: string | Date
        user: {
            id: string
            name: string | null
            username: string | null
            image: string | null
        }
        replies?: {
            id: string
            content: string
            createdAt: string | Date
            user: {
                id: string
                name: string | null
                username: string | null
                image: string | null
            }
        }[]
    }[]
}

interface ProductDetailProps {
    product: Product
}

export function ProductDetail({ product }: ProductDetailProps) {
    const [isLiked, setIsLiked] = useState(false)
    const [isDisliked, setIsDisliked] = useState(false)
    const [likeCount, setLikeCount] = useState(product.likeCount)
    const [dislikeCount, setDislikeCount] = useState(product.dislikeCount)
    const [comment, setComment] = useState("")
    const [isPending, startTransition] = useTransition()
    const [comments, setComments] = useState(product.comments || [])

    const features: string[] = Array.isArray(product.features) ? product.features : []

    useEffect(() => {
        trackProductView(product.slug, 'product_page')
    }, [product.slug])

    useEffect(() => {
        const fetchReaction = async () => {
            const result = await getUserProductReaction(product.slug)
            if (result.success) {
                setIsLiked(result.liked || false)
                setIsDisliked(result.disliked || false)
            }
        }
        fetchReaction()
    }, [product.slug])

    const handleLike = () => {
        startTransition(async () => {
            const result = await likeProduct(product.slug)
            if (result.success) {
                if (result.liked) {
                    setIsLiked(true)
                    setIsDisliked(false)
                    setLikeCount(prev => prev + 1)
                    if (isDisliked) setDislikeCount(prev => prev - 1)
                } else {
                    setIsLiked(false)
                    setLikeCount(prev => prev - 1)
                }
            } else {
                toast.error(result.error || "Failed to like")
            }
        })
    }

    const handleDislike = () => {
        startTransition(async () => {
            const result = await dislikeProduct(product.slug)
            if (result.success) {
                if (result.disliked) {
                    setIsDisliked(true)
                    setIsLiked(false)
                    setDislikeCount(prev => prev + 1)
                    if (isLiked) setLikeCount(prev => prev - 1)
                } else {
                    setIsDisliked(false)
                    setDislikeCount(prev => prev - 1)
                }
            } else {
                toast.error(result.error || "Failed to dislike")
            }
        })
    }

    const handleComment = () => {
        if (!comment.trim()) return

        startTransition(async () => {
            const result = await addProductComment(product.slug, comment)
            if (result.success && result.data) {
                setComments(prev => [result.data, ...prev])
                setComment("")
                toast.success("Comment added!")
            } else {
                toast.error(result.error || "Failed to add comment")
            }
        })
    }

    const handleLinkClick = (linkType: string, url: string) => {
        trackProductClick(product.slug, linkType, url)
    }

    const handleShare = async () => {
        try {
            await navigator.share({
                title: product.name,
                text: product.tagline,
                url: window.location.href
            })
        } catch {
            await navigator.clipboard.writeText(window.location.href)
            toast.success("Link copied to clipboard!")
        }
    }

    return (
        <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-neutral-950">
            <ScrollArea className="flex-1">
                <div className="max-w-4xl mx-auto p-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8"
                    >
                        <div className="flex items-start gap-6">
                            {
                                product.logo ? (
                                    <Image
                                        src={product.logo}
                                        alt={product.name}
                                        width={96}
                                        height={96}
                                        className="w-24 h-24 rounded-2xl object-cover shadow-lg"
                                    />
                                ) : (
                                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-neutral-800 to-neutral-900 dark:from-neutral-200 dark:to-neutral-300 flex items-center justify-center shadow-lg">
                                        <span className="text-3xl font-bold text-white dark:text-neutral-900">
                                            {product.name.charAt(0)}
                                        </span>
                                    </div>
                                )
                            }

                            <div className="flex-1">
                                <div className="flex items-center gap-3 flex-wrap">
                                    <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
                                        {product.name}
                                    </h1>
                                    {
                                        product.isVerified && (
                                            <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0">
                                                <CheckCircle className="w-3 h-3 mr-1" />
                                                Verified
                                            </Badge>
                                        )
                                    }
                                    {
                                        product.type === 'CODERZ_OFFICIAL' && (
                                            <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-0">
                                                <Rocket className="w-3 h-3 mr-1" />
                                                Coderz Official
                                            </Badge>
                                        )
                                    }
                                </div>
                                <p className="text-lg text-neutral-600 dark:text-neutral-400 mt-2">
                                    {product.tagline}
                                </p>
                                <div className="flex items-center gap-3 mt-4 flex-wrap">
                                    {
                                        product.websiteUrl && (
                                            <Link
                                                href={product.websiteUrl}
                                                target="_blank"
                                                onClick={() => handleLinkClick('website', product.websiteUrl!)}
                                            >
                                                <Button className="bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-900 rounded-full">
                                                    <Globe className="w-4 h-4 mr-2" />
                                                    Visit Website
                                                    <ArrowUpRight className="w-4 h-4 ml-1" />
                                                </Button>
                                            </Link>
                                        )
                                    }
                                    {
                                        product.demoUrl && (
                                            <Link
                                                href={product.demoUrl}
                                                target="_blank"
                                                onClick={() => handleLinkClick('demo', product.demoUrl!)}
                                            >
                                                <Button variant="outline" className="rounded-full">
                                                    <Zap className="w-4 h-4 mr-2" />
                                                    Try Demo
                                                </Button>
                                            </Link>
                                        )
                                    }
                                    {
                                        product.githubUrl && (
                                            <Link
                                                href={product.githubUrl}
                                                target="_blank"
                                                onClick={() => handleLinkClick('github', product.githubUrl!)}
                                            >
                                                <Button variant="outline" size="icon" className="rounded-full">
                                                    <Github className="w-4 h-4" />
                                                </Button>
                                            </Link>
                                        )
                                    }
                                    {
                                        product.twitterUrl && (
                                            <Link
                                                href={product.twitterUrl}
                                                target="_blank"
                                                onClick={() => handleLinkClick('twitter', product.twitterUrl!)}
                                            >
                                                <Button variant="outline" size="icon" className="rounded-full">
                                                    <Twitter className="w-4 h-4" />
                                                </Button>
                                            </Link>
                                        )
                                    }
                                </div>
                            </div>
                        </div>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="flex items-center justify-between p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 mb-8"
                    >
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
                                <Eye className="w-5 h-5" />
                                <span className="font-medium">{product.viewCount + 1}</span>
                                <span className="text-sm">views</span>
                            </div>
                            <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
                                <MessageSquare className="w-5 h-5" />
                                <span className="font-medium">{comments.length}</span>
                                <span className="text-sm">comments</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant={isLiked ? "default" : "outline"}
                                size="sm"
                                onClick={handleLike}
                                disabled={isPending}
                                className={`rounded-full ${isLiked ? 'bg-green-500 hover:bg-green-600 text-white' : ''}`}
                            >
                                <ThumbsUp className="w-4 h-4 mr-1.5" />
                                {likeCount}
                            </Button>
                            <Button
                                variant={isDisliked ? "default" : "outline"}
                                size="sm"
                                onClick={handleDislike}
                                disabled={isPending}
                                className={`rounded-full ${isDisliked ? 'bg-red-500 hover:bg-red-600 text-white' : ''}`}
                            >
                                <ThumbsDown className="w-4 h-4 mr-1.5" />
                                {dislikeCount}
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleShare}
                                className="rounded-full"
                            >
                                <Share2 className="w-4 h-4 mr-1.5" />
                                Share
                            </Button>
                        </div>
                    </motion.div>

                    {
                        product.coverImage && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.15 }}
                                className="mb-8"
                            >
                                <Image
                                    src={product.coverImage}
                                    alt={`${product.name} cover`}
                                    width={1200}
                                    height={600}
                                    className="w-full rounded-2xl object-cover shadow-lg"
                                />
                            </motion.div>
                        )
                    }

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mb-8"
                    >
                        <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-4">
                            About {product.name}
                        </h2>
                        <div className="prose prose-neutral dark:prose-invert max-w-none">
                            <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed whitespace-pre-wrap">
                                {product.description}
                            </p>
                        </div>
                    </motion.div>

                    {
                        features.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.25 }}
                                className="mb-8"
                            >
                                <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-4">
                                    Features
                                </h2>
                                <div className="grid md:grid-cols-2 gap-3">
                                    {
                                        features.map((feature: string, index: number) => (
                                            <div
                                                key={index}
                                                className="flex items-start gap-3 p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800"
                                            >
                                                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                                <span className="text-neutral-700 dark:text-neutral-300">{feature}</span>
                                            </div>
                                        ))
                                    }
                                </div>
                            </motion.div>
                        )
                    }

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="mb-8 grid md:grid-cols-2 gap-6"
                    >
                        {
                            product.techStack.length > 0 && (
                                <div>
                                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-3 flex items-center gap-2">
                                        <Zap className="w-5 h-5" />
                                        Tech Stack
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {
                                            product.techStack.map((tech, index) => (
                                                <Badge
                                                    key={index}
                                                    variant="secondary"
                                                    className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                                >
                                                    {tech}
                                                </Badge>
                                            ))
                                        }
                                    </div>
                                </div>
                            )
                        }

                        {
                            product.tags.length > 0 && (
                                <div>
                                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-3 flex items-center gap-2">
                                        <Tag className="w-5 h-5" />
                                        Tags
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {
                                            product.tags.map((tag, index) => (
                                                <Badge
                                                    key={index}
                                                    variant="outline"
                                                    className="text-neutral-600 dark:text-neutral-400"
                                                >
                                                    #{tag}
                                                </Badge>
                                            ))
                                        }
                                    </div>
                                </div>
                            )
                        }
                    </motion.div>

                    {
                        product.screenshots.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.35 }}
                                className="mb-8"
                            >
                                <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-4">
                                    Screenshots
                                </h2>
                                <div className="grid grid-cols-2 gap-4">
                                    {
                                        product.screenshots.map((screenshot, index) => (
                                            <Image
                                                key={index}
                                                src={screenshot}
                                                alt={`${product.name} screenshot ${index + 1}`}
                                                width={600}
                                                height={400}
                                                className="w-full rounded-xl object-cover shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                                            />
                                        ))
                                    }
                                </div>
                            </motion.div>
                        )
                    }

                    {
                        product.createdBy && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="mb-8"
                            >
                                <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-4">
                                    Created By
                                </h2>
                                <div className="flex items-center gap-4 p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                                    <Avatar className="w-14 h-14">
                                        <AvatarImage src={product.createdBy.image || undefined} />
                                        <AvatarFallback>
                                            {product.createdBy.name?.charAt(0) || 'U'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h4 className="font-semibold text-neutral-900 dark:text-white">
                                            {product.createdBy.name || 'Anonymous'}
                                        </h4>
                                        {
                                            product.createdBy.username && (
                                                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                                    @{product.createdBy.username}
                                                </p>
                                            )
                                        }
                                    </div>
                                    <div className="ml-auto text-sm text-neutral-500 dark:text-neutral-400 flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        {formatDistanceToNow(new Date(product.createdAt), { addSuffix: true })}
                                    </div>
                                </div>
                            </motion.div>
                        )
                    }

                    <Separator className="my-8" />

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.45 }}
                    >
                        <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-6">
                            Comments ({comments.length})
                        </h2>
                        <div className="flex gap-4 mb-8">
                            <Avatar className="w-10 h-10 flex-shrink-0">
                                <AvatarFallback>
                                    <User className="w-5 h-5" />
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <Textarea
                                    placeholder="Share your thoughts..."
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    className="min-h-[100px] resize-none border-neutral-200 dark:border-neutral-800 focus:ring-neutral-900 dark:focus:ring-white"
                                />
                                <div className="flex justify-end mt-3">
                                    <Button
                                        onClick={handleComment}
                                        disabled={isPending || !comment.trim()}
                                        className="bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-900 rounded-full"
                                    >
                                        <Send className="w-4 h-4 mr-2" />
                                        Post Comment
                                    </Button>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-6">
                            {
                                comments.length === 0 ? (
                                    <div className="text-center py-12">
                                        <MessageSquare className="w-12 h-12 mx-auto text-neutral-300 dark:text-neutral-700 mb-4" />
                                        <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-2">
                                            No comments yet
                                        </h3>
                                        <p className="text-neutral-500 dark:text-neutral-400">
                                            Be the first to share your thoughts!
                                        </p>
                                    </div>
                                ) : (
                                    comments.map((c) => (
                                        <div key={c.id} className="flex gap-4">
                                            <Avatar className="w-10 h-10 flex-shrink-0">
                                                <AvatarImage src={c.user.image || undefined} />
                                                <AvatarFallback>
                                                    {c.user.name?.charAt(0) || 'U'}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-neutral-900 dark:text-white">
                                                        {c.user.name || 'Anonymous'}
                                                    </span>
                                                    {
                                                        c.user.username && (
                                                            <span className="text-sm text-neutral-500 dark:text-neutral-400">
                                                                @{c.user.username}
                                                            </span>
                                                        )
                                                    }
                                                    <span className="text-xs text-neutral-400 dark:text-neutral-500">
                                                        • {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}
                                                    </span>
                                                </div>
                                                <p className="text-neutral-600 dark:text-neutral-400 mt-1">
                                                    {c.content}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                )
                            }
                        </div>
                    </motion.div>
                </div>
            </ScrollArea>
        </div>
    )
}