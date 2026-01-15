'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
    CheckCircle2, XCircle, Users, ArrowRight, Loader2, UserPlus,
    Lock, Globe, AlertCircle
} from 'lucide-react'
import { Button } from '@repo/ui/components/ui/button'
import { Badge } from '@repo/ui/components/ui/badge'
import {
    Card, CardContent, CardDescription, CardHeader, CardTitle
} from '@repo/ui/components/ui/card'
import { joinCommunity } from '@/actions/(main)/community/community.action'
import toast from '@repo/ui/components/ui/sonner'

interface JoinPageClientProps {
    community: {
        id: string
        name: string
        slug: string
        description: string
        logo?: string
        coverImage?: string
        themeColor: string
        memberCount: number
        visibility: string
    }
    inviteResult: {
        success: boolean
        error?: string
        data?: {
            communitySlug: string
            communityName: string
        }
    } | null
    hasInviteCode: boolean
}

export function JoinPageClient({
    community,
    inviteResult,
    hasInviteCode
}: JoinPageClientProps) {
    const router = useRouter()
    const [isJoining, setIsJoining] = useState(false)

    // If invite was already accepted, show success
    const inviteAccepted = inviteResult?.success

    const handleJoin = async () => {
        setIsJoining(true)
        try {
            const result = await joinCommunity(community.id)
            if (result.success) {
                toast.success(result.message || 'Joined successfully!')
                router.push(`/communities/${community.slug}`)
            } else {
                toast.error(result.error || 'Failed to join')
            }
        } catch {
            toast.error('Something went wrong')
        } finally {
            setIsJoining(false)
        }
    }

    const getVisibilityInfo = () => {
        switch (community.visibility) {
            case 'PRIVATE':
                return {
                    icon: Lock,
                    label: 'Private',
                    description: 'You need an invitation to join this community'
                }
            case 'RESTRICTED':
                return {
                    icon: UserPlus,
                    label: 'Restricted',
                    description: 'Your request will need approval from admins'
                }
            default:
                return {
                    icon: Globe,
                    label: 'Public',
                    description: 'Anyone can join this community'
                }
        }
    }

    const visibilityInfo = getVisibilityInfo()
    const VisibilityIcon = visibilityInfo.icon

    return (
        <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900">
            {/* Background */}
            <div className="absolute inset-0 overflow-hidden">
                {community.coverImage ? (
                    <Image
                        src={community.coverImage}
                        alt=""
                        fill
                        className="object-cover opacity-10"
                    />
                ) : (
                    <div
                        className="absolute inset-0 opacity-20"
                        style={{
                            background: `radial-gradient(ellipse at center, ${community.themeColor}30 0%, transparent 70%)`
                        }}
                    />
                )}
            </div>

            <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-md"
                >
                    {inviteAccepted ? (
                        // Success State
                        <Card className="border-green-200 dark:border-green-800">
                            <CardContent className="pt-8 text-center">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', delay: 0.2 }}
                                    className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4"
                                >
                                    <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
                                </motion.div>
                                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
                                    Welcome to {community.name}!
                                </h2>
                                <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                                    You&apos;ve successfully joined the community. Start exploring and connecting!
                                </p>
                                <Button asChild className="w-full gap-2">
                                    <Link href={`/communities/${community.slug}`}>
                                        Enter Community
                                        <ArrowRight className="w-4 h-4" />
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    ) : inviteResult && !inviteResult.success && hasInviteCode ? (
                        // Error State (invalid/expired invite)
                        <Card className="border-red-200 dark:border-red-800">
                            <CardContent className="pt-8 text-center">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', delay: 0.2 }}
                                    className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4"
                                >
                                    <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                                </motion.div>
                                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
                                    Invalid Invitation
                                </h2>
                                <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                                    {inviteResult.error || 'This invitation is invalid or has expired.'}
                                </p>
                                {community.visibility === 'PUBLIC' && (
                                    <Button onClick={handleJoin} disabled={isJoining} className="w-full gap-2">
                                        {isJoining ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <UserPlus className="w-4 h-4" />
                                        )}
                                        Join Anyway
                                    </Button>
                                )}
                                <Button variant="outline" asChild className="w-full mt-2">
                                    <Link href="/communities">
                                        Browse Communities
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        // Join Prompt
                        <Card>
                            <CardHeader className="text-center">
                                <div
                                    className="w-20 h-20 rounded-2xl mx-auto mb-4 flex items-center justify-center text-3xl font-bold text-white shadow-lg"
                                    style={{
                                        background: community.logo
                                            ? `url(${community.logo}) center/cover`
                                            : community.themeColor
                                    }}
                                >
                                    {!community.logo && community.name.charAt(0)}
                                </div>
                                <CardTitle className="text-2xl">{community.name}</CardTitle>
                                <CardDescription className="mt-2">
                                    {community.description}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-center justify-center gap-4 text-sm text-neutral-600 dark:text-neutral-400">
                                    <Badge variant="secondary" className="gap-1">
                                        <VisibilityIcon className="w-3 h-3" />
                                        {visibilityInfo.label}
                                    </Badge>
                                    <span className="flex items-center gap-1">
                                        <Users className="w-4 h-4" />
                                        {community.memberCount.toLocaleString()} members
                                    </span>
                                </div>

                                {community.visibility === 'PRIVATE' && !hasInviteCode ? (
                                    <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                                        <div className="flex gap-3">
                                            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <p className="font-medium text-amber-800 dark:text-amber-200">
                                                    Invitation Required
                                                </p>
                                                <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                                                    {visibilityInfo.description}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <Button
                                        onClick={handleJoin}
                                        disabled={isJoining}
                                        className="w-full gap-2"
                                        size="lg"
                                    >
                                        {isJoining ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <UserPlus className="w-4 h-4" />
                                        )}
                                        {community.visibility === 'RESTRICTED' ? 'Request to Join' : 'Join Community'}
                                    </Button>
                                )}

                                <p className="text-xs text-center text-neutral-500">
                                    By joining, you agree to follow the community guidelines
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </motion.div>
            </div>
        </div>
    )
}
