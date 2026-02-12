'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    Check, Gift, Lock, Share2, Pin, Sparkles, Zap, Trophy
} from 'lucide-react'
import { Button } from '@repo/ui/components/ui/button'
import { Progress } from '@repo/ui/components/ui/progress'
import {
    Sheet, SheetContent, SheetHeader, SheetTitle
} from '@repo/ui/components/ui/sheet'
import { cn } from '@repo/ui/lib/utils'
import toast from '@repo/ui/components/ui/sonner'
import {
    claimBadge, togglePinBadge
} from '@/actions/(main)/achievements/achievements.action'
import type { BadgeWithProgress } from '@/actions/(main)/achievements/achievements.action'
import confetti from 'canvas-confetti'
import type { SocialConnectionSummary } from '@/types/achievements'

interface ClaimBadgeSheetProps {
    badge: BadgeWithProgress | null
    open: boolean
    onOpenChange: (open: boolean) => void
    onShare: (badge: BadgeWithProgress) => void
    socialConnections: SocialConnectionSummary[]
}

const RARITY_CONFIG = {
    COMMON: {
        gradient: 'from-neutral-400 to-neutral-600',
        bg: 'bg-neutral-100 dark:bg-neutral-800',
        text: 'text-neutral-600 dark:text-neutral-400',
    },
    RARE: {
        gradient: 'from-blue-400 to-blue-600',
        bg: 'bg-blue-50 dark:bg-blue-950',
        text: 'text-blue-600 dark:text-blue-400',
    },
    EPIC: {
        gradient: 'from-purple-400 to-purple-600',
        bg: 'bg-purple-50 dark:bg-purple-950',
        text: 'text-purple-600 dark:text-purple-400',
    },
    LEGENDARY: {
        gradient: 'from-amber-400 to-amber-600',
        bg: 'bg-amber-50 dark:bg-amber-950',
        text: 'text-amber-600 dark:text-amber-400',
    },
    MYTHIC: {
        gradient: 'from-pink-400 via-purple-400 to-cyan-400',
        bg: 'bg-gradient-to-r from-pink-50 via-purple-50 to-cyan-50 dark:from-pink-950 dark:via-purple-950 dark:to-cyan-950',
        text: 'text-pink-600 dark:text-pink-400',
    },
}

export function ClaimBadgeSheet({ badge, open, onOpenChange, onShare, socialConnections }: ClaimBadgeSheetProps) {
    const [claiming, setClaiming] = useState(false)
    const [claimed, setClaimed] = useState(false)
    const [pinning, setPinning] = useState(false)

    if (!badge) return null

    const config = RARITY_CONFIG[badge.rarity as keyof typeof RARITY_CONFIG]
    const isLocked = badge.status === 'LOCKED'
    const isClaimed = badge.status === 'CLAIMED' || claimed
    const isReady = badge.status === 'READY_TO_CLAIM' && !claimed

    const handleClaim = async () => {
        if (!isReady) return
        setClaiming(true)

        try {
            const result = await claimBadge(badge.id)

            if (result.success) {
                setClaimed(true)

                // Trigger confetti
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: [badge.color, '#fbbf24', '#a855f7'],
                })

                toast.success('Badge Claimed!', {
                    description: `You earned ${result.xpReward} XP and ${result.creditsReward} credits!`,
                })
            } else {
                toast.error('Failed to claim badge')
            }
        } catch {
            toast.error('Something went wrong')
        } finally {
            setClaiming(false)
        }
    }

    const handlePin = async () => {
        if (!isClaimed) return
        setPinning(true)

        try {
            const result = await togglePinBadge(badge.id)

            if (result.success) {
                toast.success(result.isPinned ? 'Badge pinned to profile!' : 'Badge unpinned')
            } else {
                toast.error(result.error || 'Failed to pin badge')
            }
        } catch {
            toast.error('Something went wrong')
        } finally {
            setPinning(false)
        }
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-md">
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-amber-500" />
                        Badge Details
                    </SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-6">
                    <div className="flex flex-col items-center">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className={cn(
                                "relative w-24 h-24 rounded-2xl flex items-center justify-center text-5xl",
                                isLocked && "grayscale opacity-60"
                            )}
                            style={{
                                background: isLocked ? '#e5e5e5' : (badge.bgGradient || `linear-gradient(135deg, ${badge.color} 0%, #a855f7 100%)`),
                            }}
                        >
                            {
                                isLocked ? (
                                    <Lock className="w-10 h-10 text-neutral-400" />
                                ) : (
                                    badge.icon
                                )
                            }

                            {
                                isClaimed && (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center"
                                    >
                                        <Check className="w-5 h-5 text-white" />
                                    </motion.div>
                                )
                            }
                        </motion.div>

                        <h3 className="mt-4 text-xl font-bold text-neutral-900 dark:text-white">{badge.name}</h3>

                        <span className={cn(
                            "mt-1 px-3 py-1 rounded-full text-xs font-medium capitalize",
                            config.bg, config.text
                        )}>
                            {badge.rarity.toLowerCase()}
                        </span>
                        <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400 text-center">
                            {badge.description}
                        </p>
                    </div>
                    <div className="bg-neutral-50 dark:bg-neutral-900 rounded-xl p-4 space-y-3">
                        <h4 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-2">
                            <Gift className="w-4 h-4" />
                            Rewards
                        </h4>
                        <div className="flex items-center justify-center gap-6">
                            <div className="text-center">
                                <div className="flex items-center gap-1 text-blue-500">
                                    <Zap className="w-5 h-5" />
                                    <span className="text-2xl font-bold">{badge.xpReward}</span>
                                </div>
                                <p className="text-xs text-neutral-500">XP</p>
                            </div>
                            <div className="w-px h-8 bg-neutral-200 dark:bg-neutral-800" />
                            <div className="text-center">
                                <div className="flex items-center gap-1 text-purple-500">
                                    <span className="text-xl">💎</span>
                                    <span className="text-2xl font-bold">{badge.creditsReward}</span>
                                </div>
                                <p className="text-xs text-neutral-500">Credits</p>
                            </div>
                        </div>
                    </div>

                    {
                        (isLocked || badge.status === 'IN_PROGRESS') && (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-neutral-600 dark:text-neutral-400">Progress</span>
                                    <span className="font-medium">{badge.progressPercent}%</span>
                                </div>
                                <Progress value={badge.progressPercent} className="h-2" />
                                {
                                    badge.progress && (
                                        <p className="text-xs text-neutral-500">
                                            {badge.progress.current || 0} / {badge.requirements.count || 1} completed
                                        </p>
                                    )
                                }
                            </div>
                        )
                    }

                    <div className="space-y-3">
                        {
                            isReady && (
                                <Button
                                    onClick={handleClaim}
                                    disabled={claiming}
                                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
                                >
                                    {
                                        claiming ? (
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                            >
                                                <Sparkles className="w-5 h-5" />
                                            </motion.div>
                                        ) : (
                                            <>
                                                <Gift className="w-5 h-5 mr-2" />
                                                Claim Badge
                                            </>
                                        )
                                    }
                                </Button>
                            )
                        }

                        {
                            isClaimed && (
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => onShare(badge)}
                                        className="flex-1"
                                    >
                                        <Share2 className="w-4 h-4 mr-2" />
                                        Share
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={handlePin}
                                        disabled={pinning}
                                        className={cn(
                                            "flex-1",
                                            badge.isPinned && "bg-amber-50 dark:bg-amber-950 border-amber-300 dark:border-amber-700"
                                        )}
                                    >
                                        <Pin className={cn(
                                            "w-4 h-4 mr-2",
                                            badge.isPinned && "fill-amber-500 text-amber-500"
                                        )} />
                                        {badge.isPinned ? 'Pinned' : 'Pin to Profile'}
                                    </Button>
                                </div>
                            )
                        }

                        {
                            isClaimed && socialConnections.length === 0 && (
                                <div className="bg-blue-50 dark:bg-blue-950/50 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
                                    <p className="text-sm text-blue-700 dark:text-blue-300">
                                        Connect your social accounts to share achievements!
                                    </p>
                                    <Button
                                        variant="link"
                                        className="text-blue-600 dark:text-blue-400 p-0 h-auto mt-1"
                                        onClick={() => window.location.href = '/settings/social-integrations'}
                                    >
                                        Connect accounts →
                                    </Button>
                                </div>
                            )
                        }
                    </div>
                    <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-neutral-500">Category</p>
                                <p className="font-medium text-neutral-900 dark:text-white capitalize">
                                    {badge.category.toLowerCase().replace('_', ' ')}
                                </p>
                            </div>
                            <div>
                                <p className="text-neutral-500">Tier</p>
                                <p className="font-medium text-neutral-900 dark:text-white">
                                    {badge.tier === 1 ? 'Bronze' :
                                        badge.tier === 2 ? 'Silver' :
                                            badge.tier === 3 ? 'Gold' :
                                                badge.tier === 4 ? 'Platinum' : 'Diamond'}
                                </p>
                            </div>
                            {
                                badge.claimedAt && (
                                    <div className="col-span-2">
                                        <p className="text-neutral-500">Claimed on</p>
                                        <p className="font-medium text-neutral-900 dark:text-white">
                                            {
                                                new Date(badge.claimedAt).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                })
                                            }
                                        </p>
                                    </div>
                                )
                            }
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}