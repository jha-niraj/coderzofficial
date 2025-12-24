'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import {
    Users, MessageSquare, CheckCircle2, TrendingUp, Sparkles, Lock, Globe
} from 'lucide-react'
import {
    Card, CardContent
} from '@repo/ui/components/ui/card'
import { Badge } from '@repo/ui/components/ui/badge'
import { Button } from '@repo/ui/components/ui/button'
import { cn } from '@repo/ui/lib/utils'

interface CommunityCardProps {
    community: {
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
        visibility?: string
        isTrending?: boolean
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
    }
    isMember?: boolean
    onJoin?: () => void
    onLeave?: () => void
    loading?: boolean
    variant?: 'default' | 'compact' | 'featured'
}

export function CommunityCard({
    community,
    isMember = false,
    onJoin,
    onLeave,
    loading = false,
    variant = 'default'
}: CommunityCardProps) {
    const memberCount = community._count?.members ?? community.memberCount
    const postCount = community._count?.posts ?? community.postCount
    const isPrivate = community.visibility === 'PRIVATE'

    if (variant === 'featured') {
        return (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -6, scale: 1.02 }}
                transition={{ duration: 0.2 }}
            >
                <Link href={`/community/${community.slug}`}>
                    <Card className="group overflow-hidden border-2 border-neutral-200 dark:border-neutral-800 hover:border-blue-500/50 dark:hover:border-blue-500/50 hover:shadow-xl transition-all duration-300 bg-white dark:bg-neutral-900">
                        <div
                            className="h-36 relative"
                            style={{
                                background: community.coverImage
                                    ? `url(${community.coverImage}) center/cover`
                                    : `linear-gradient(135deg, ${community.themeColor}60, ${community.themeColor}30)`
                            }}
                        >
                            {
                                community.isTrending && (
                                    <Badge className="absolute top-3 right-3 bg-gradient-to-r from-orange-500 to-red-500 text-white border-0">
                                        <TrendingUp className="w-3 h-3 mr-1" />
                                        Trending
                                    </Badge>
                                )
                            }
                            <div className="absolute -bottom-8 left-4">
                                <div
                                    className="w-16 h-16 rounded-2xl border-4 border-white dark:border-neutral-900 flex items-center justify-center text-2xl font-bold shadow-lg overflow-hidden"
                                    style={{
                                        backgroundColor: community.themeColor
                                    }}
                                >
                                    {
                                        community.logo ? (
                                            <Image
                                                src={community.logo}
                                                alt={community.name}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <span className="text-white">{community.name.charAt(0)}</span>
                                        )
                                    }
                                </div>
                            </div>
                        </div>
                        <CardContent className="pt-10 pb-5 px-4">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-bold text-lg text-neutral-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                            {community.name}
                                        </h3>
                                        {
                                            community.isVerified && (
                                                <CheckCircle2 className="w-5 h-5 text-blue-500 flex-shrink-0" />
                                            )
                                        }
                                        {
                                            isPrivate && (
                                                <Lock className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                                            )
                                        }
                                    </div>
                                    <Badge variant="secondary" className="text-xs bg-neutral-100 dark:bg-neutral-800">
                                        {community.category}
                                    </Badge>
                                </div>
                            </div>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2 mb-4 min-h-[40px]">
                                {community.shortDescription || community.description}
                            </p>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4 text-sm text-neutral-500">
                                    <span className="flex items-center gap-1.5 font-medium">
                                        <Users className="w-4 h-4" />
                                        {memberCount >= 1000 ? `${(memberCount / 1000).toFixed(1)}k` : memberCount}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <MessageSquare className="w-4 h-4" />
                                        {postCount >= 1000 ? `${(postCount / 1000).toFixed(1)}k` : postCount}
                                    </span>
                                </div>
                                <Button
                                    size="sm"
                                    variant={isMember ? "outline" : "default"}
                                    onClick={(e) => {
                                        e.preventDefault()
                                        e.stopPropagation()
                                        if (isMember) {
                                            onLeave?.()
                                        } else {
                                            onJoin?.()
                                        }
                                    }}
                                    disabled={loading}
                                    className={cn(
                                        "rounded-full px-4",
                                        isMember
                                            ? "bg-transparent border-neutral-300 dark:border-neutral-700"
                                            : "bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 text-white border-0"
                                    )}
                                >
                                    {loading ? '...' : isMember ? '✓ Joined' : 'Join'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </Link>
            </motion.div>
        )
    }

    if (variant === 'compact') {
        return (
            <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ x: 4 }}
                transition={{ duration: 0.15 }}
            >
                <Link href={`/community/${community.slug}`}>
                    <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors group">
                        <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold flex-shrink-0 overflow-hidden"
                            style={{ backgroundColor: community.themeColor }}
                        >
                            {
                                community.logo ? (
                                    <Image
                                        src={community.logo}
                                        alt={community.name}
                                        width={48}
                                        height={48}
                                        className="object-cover"
                                    />
                                ) : (
                                    <span className="text-white">{community.name.charAt(0)}</span>
                                )
                            }
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                                <span className="font-semibold text-sm text-neutral-900 dark:text-white truncate group-hover:text-blue-600 transition-colors">
                                    {community.name}
                                </span>
                                {
                                    community.isVerified && (
                                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                                    )
                                }
                            </div>
                            <div className="flex items-center gap-2 text-xs text-neutral-500">
                                <span className="flex items-center gap-1">
                                    <Users className="w-3 h-3" />
                                    {memberCount.toLocaleString()}
                                </span>
                                <span>•</span>
                                <span>{community.category}</span>
                            </div>
                        </div>
                        <Button
                            size="sm"
                            variant={isMember ? "ghost" : "outline"}
                            onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                if (isMember) {
                                    onLeave?.()
                                } else {
                                    onJoin?.()
                                }
                            }}
                            disabled={loading}
                            className="rounded-full text-xs h-8"
                        >
                            {loading ? '...' : isMember ? 'Joined' : 'Join'}
                        </Button>
                    </div>
                </Link>
            </motion.div>
        )
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
        >
            <Link href={`/community/${community.slug}`}>
                <Card className="group overflow-hidden border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 hover:shadow-lg transition-all duration-300 bg-white dark:bg-neutral-900">
                    <div
                        className="h-24 relative"
                        style={{
                            background: community.coverImage
                                ? `url(${community.coverImage}) center/cover`
                                : `linear-gradient(135deg, ${community.themeColor}40, ${community.themeColor}20)`
                        }}
                    >
                        {
                            community.isTrending && (
                                <Badge className="absolute top-2 right-2 bg-orange-500/90 text-white text-xs border-0">
                                    <Sparkles className="w-3 h-3 mr-1" />
                                    Hot
                                </Badge>
                            )
                        }
                        <div className="absolute -bottom-6 left-4">
                            <div
                                className="w-14 h-14 rounded-xl border-4 border-white dark:border-neutral-900 flex items-center justify-center text-2xl shadow-md overflow-hidden"
                                style={{
                                    backgroundColor: community.themeColor
                                }}
                            >
                                {
                                    community.logo ? (
                                        <Image
                                            src={community.logo}
                                            alt={community.name}
                                            width={56}
                                            height={56}
                                            className="object-cover"
                                        />
                                    ) : (
                                        <span className="text-white font-bold">{community.name.charAt(0)}</span>
                                    )
                                }
                            </div>
                        </div>
                    </div>
                    <CardContent className="pt-8 pb-4 px-4">
                        <div className="flex items-start justify-between mb-2">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-semibold text-neutral-900 dark:text-white truncate group-hover:text-neutral-700 dark:group-hover:text-neutral-200 transition-colors">
                                        {community.name}
                                    </h3>
                                    {
                                        community.isVerified && (
                                            <CheckCircle2 className="w-4 h-4 text-blue-500 flex-shrink-0" />
                                        )
                                    }
                                </div>
                                <Badge variant="secondary" className="mt-1 text-xs bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                                    {community.category}
                                </Badge>
                            </div>
                        </div>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2 mb-4 min-h-[40px]">
                            {community.shortDescription || community.description}
                        </p>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 text-sm text-neutral-500 dark:text-neutral-400">
                                <span className="flex items-center gap-1">
                                    <Users className="w-4 h-4" />
                                    {memberCount.toLocaleString()}
                                </span>
                                <span className="flex items-center gap-1">
                                    <MessageSquare className="w-4 h-4" />
                                    {postCount.toLocaleString()}
                                </span>
                            </div>
                            <Button
                                size="sm"
                                variant={isMember ? "outline" : "default"}
                                onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    if (isMember) {
                                        onLeave?.()
                                    } else {
                                        onJoin?.()
                                    }
                                }}
                                disabled={loading}
                                className={cn(
                                    "rounded-full text-xs",
                                    isMember
                                        ? "bg-transparent border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                                        : "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-100"
                                )}
                            >
                                {loading ? 'Loading...' : isMember ? 'Joined' : 'Join'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </Link>
        </motion.div>
    )
}

// Mini version for sidebar
export function CommunityCardMini({
    community,
    isActive = false
}: {
    community: {
        id: string
        name: string
        slug: string
        logo?: string | null
        themeColor: string
    }
    isActive?: boolean
}) {
    return (
        <Link href={`/community/${community.slug}`}>
            <motion.div
                className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                    isActive
                        ? "bg-neutral-100 dark:bg-neutral-800"
                        : "hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                )}
                whileHover={{ x: 2 }}
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
        </Link>
    )
}