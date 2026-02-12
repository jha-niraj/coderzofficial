'use client'

import { motion } from 'framer-motion'
import { Lock, Check, Gift, Share2, Pin } from 'lucide-react'
import { Progress } from '@repo/ui/components/ui/progress'
import { cn } from '@repo/ui/lib/utils'
import type { BadgeWithProgress } from '@/actions/(main)/achievements/achievements.action'

interface BadgeCardProps {
    badge: BadgeWithProgress
    onClick?: () => void
    onShare?: () => void
    compact?: boolean
}

const RARITY_GLOW = {
    COMMON: '',
    RARE: 'hover:shadow-blue-500/20',
    EPIC: 'hover:shadow-purple-500/30',
    LEGENDARY: 'hover:shadow-amber-500/40',
    MYTHIC: 'hover:shadow-pink-500/50',
}

const RARITY_BORDER = {
    COMMON: 'border-neutral-200 dark:border-neutral-800',
    RARE: 'border-blue-200 dark:border-blue-900',
    EPIC: 'border-purple-200 dark:border-purple-900',
    LEGENDARY: 'border-amber-200 dark:border-amber-900',
    MYTHIC: 'border-pink-200 dark:border-pink-900',
}

export function BadgeCard({ badge, onClick, onShare, compact = false }: BadgeCardProps) {
    const isLocked = badge.status === 'LOCKED'
    const isClaimed = badge.status === 'CLAIMED'
    const isReady = badge.status === 'READY_TO_CLAIM'
    const isInProgress = badge.status === 'IN_PROGRESS'

    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className={cn(
                "relative bg-white dark:bg-neutral-900 rounded-xl border p-4 cursor-pointer transition-all",
                RARITY_BORDER[badge.rarity as keyof typeof RARITY_BORDER],
                RARITY_GLOW[badge.rarity as keyof typeof RARITY_GLOW],
                "hover:shadow-lg",
                isLocked && "opacity-60",
                isReady && "ring-2 ring-emerald-500/50 border-emerald-300 dark:border-emerald-700",
                compact && "p-3"
            )}
        >
            {/* Pinned indicator */}
            {badge.isPinned && (
                <div className="absolute top-2 right-2">
                    <Pin className="w-3 h-3 text-amber-500 fill-amber-500" />
                </div>
            )}

            {/* Status indicator */}
            {isReady && (
                <div className="absolute -top-1 -right-1">
                    <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center animate-pulse">
                        <Gift className="w-3 h-3 text-white" />
                    </div>
                </div>
            )}
            {isClaimed && (
                <div className="absolute -top-1 -right-1">
                    <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                    </div>
                </div>
            )}

            {/* Badge Icon */}
            <div className="flex flex-col items-center">
                <div 
                    className={cn(
                        "relative w-14 h-14 rounded-xl flex items-center justify-center text-2xl transition-transform",
                        compact && "w-12 h-12 text-xl",
                        isLocked && "grayscale"
                    )}
                    style={{ 
                        background: isLocked ? '#e5e5e5' : (badge.bgGradient || badge.color),
                    }}
                >
                    {isLocked ? (
                        <Lock className="w-5 h-5 text-neutral-400" />
                    ) : (
                        badge.icon
                    )}
                </div>

                {/* Name */}
                <h4 className={cn(
                    "mt-2 text-sm font-medium text-neutral-900 dark:text-white text-center line-clamp-2",
                    compact && "text-xs mt-1.5"
                )}>
                    {badge.name}
                </h4>

                {/* Rarity */}
                <span className={cn(
                    "mt-1 text-xs capitalize",
                    badge.rarity === 'COMMON' && "text-neutral-500",
                    badge.rarity === 'RARE' && "text-blue-500",
                    badge.rarity === 'EPIC' && "text-purple-500",
                    badge.rarity === 'LEGENDARY' && "text-amber-500",
                    badge.rarity === 'MYTHIC' && "text-pink-500",
                )}>
                    {badge.rarity.toLowerCase()}
                </span>

                {/* Progress bar for in-progress badges */}
                {isInProgress && badge.progressPercent > 0 && !compact && (
                    <div className="w-full mt-2">
                        <Progress value={badge.progressPercent} className="h-1.5" />
                        <p className="text-xs text-neutral-500 text-center mt-1">{badge.progressPercent}%</p>
                    </div>
                )}

                {/* Rewards preview */}
                {!compact && (
                    <div className="flex items-center gap-2 mt-2">
                        {badge.xpReward > 0 && (
                            <span className="text-xs text-blue-500 font-medium">+{badge.xpReward} XP</span>
                        )}
                        {badge.creditsReward > 0 && (
                            <span className="text-xs text-purple-500 font-medium">+{badge.creditsReward} 💎</span>
                        )}
                    </div>
                )}

                {/* Share button for claimed badges */}
                {isClaimed && onShare && !compact && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            onShare()
                        }}
                        className="mt-2 text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 flex items-center gap-1"
                    >
                        <Share2 className="w-3 h-3" />
                        Share
                    </button>
                )}
            </div>
        </motion.div>
    )
}
