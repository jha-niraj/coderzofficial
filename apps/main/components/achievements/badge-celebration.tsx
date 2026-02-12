'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Gift, Sparkles, ExternalLink } from 'lucide-react'
import { Button } from '@repo/ui/components/ui/button'
import { cn } from '@repo/ui/lib/utils'
import confetti from 'canvas-confetti'
import Link from 'next/link'

interface BadgeCelebrationProps {
    badge: {
        id: string
        name: string
        icon: string
        color: string
        bgGradient?: string | null
        rarity: string
        xpReward: number
        creditsReward: number
    }
    show: boolean
    onClose: () => void
    onCollect?: () => void
    autoCollect?: boolean
}

const RARITY_COLORS = {
    COMMON: { ring: 'ring-neutral-400', glow: '' },
    RARE: { ring: 'ring-blue-400', glow: 'shadow-blue-500/50' },
    EPIC: { ring: 'ring-purple-400', glow: 'shadow-purple-500/50' },
    LEGENDARY: { ring: 'ring-amber-400', glow: 'shadow-amber-500/50' },
    MYTHIC: { ring: 'ring-pink-400', glow: 'shadow-pink-500/50' },
}

export function BadgeCelebration({ 
    badge, 
    show, 
    onClose, 
    onCollect,
    autoCollect: _autoCollect = false 
}: BadgeCelebrationProps) {
    const [collecting, setCollecting] = useState(false)
    
    const rarityConfig = RARITY_COLORS[badge.rarity as keyof typeof RARITY_COLORS] || RARITY_COLORS.COMMON

    useEffect(() => {
        if (show) {
            // Trigger confetti
            const duration = 3000
            const end = Date.now() + duration

            const frame = () => {
                confetti({
                    particleCount: 3,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 },
                    colors: [badge.color, '#fbbf24', '#a855f7'],
                })
                confetti({
                    particleCount: 3,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 },
                    colors: [badge.color, '#fbbf24', '#a855f7'],
                })

                if (Date.now() < end) {
                    requestAnimationFrame(frame)
                }
            }
            frame()
        }
    }, [show, badge.color])

    const handleCollect = async () => {
        setCollecting(true)
        
        // Extra confetti burst
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: [badge.color, '#fbbf24', '#a855f7', '#22c55e'],
        })

        if (onCollect) {
            await onCollect()
        }
        
        setTimeout(() => {
            setCollecting(false)
            onClose()
        }, 500)
    }

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                    onClick={(e) => e.target === e.currentTarget && onClose()}
                >
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0, y: 50 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.8, opacity: 0, y: 20 }}
                        transition={{ type: 'spring', damping: 15 }}
                        className="relative bg-white dark:bg-neutral-900 rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl"
                    >
                        {/* Close button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {/* Header */}
                        <motion.div
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.1 }}
                            className="flex items-center justify-center gap-2 mb-6"
                        >
                            <Sparkles className="w-5 h-5 text-amber-500" />
                            <span className="text-sm font-medium text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                                Achievement Unlocked!
                            </span>
                            <Sparkles className="w-5 h-5 text-amber-500" />
                        </motion.div>

                        {/* Badge */}
                        <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ delay: 0.2, type: 'spring', damping: 10 }}
                            className={cn(
                                "mx-auto w-28 h-28 rounded-2xl flex items-center justify-center text-6xl ring-4",
                                rarityConfig.ring,
                                "shadow-xl",
                                rarityConfig.glow
                            )}
                            style={{ 
                                background: badge.bgGradient || `linear-gradient(135deg, ${badge.color} 0%, #a855f7 100%)`,
                            }}
                        >
                            {badge.icon}
                        </motion.div>

                        {/* Badge Name */}
                        <motion.h3
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="mt-6 text-2xl font-bold text-neutral-900 dark:text-white"
                        >
                            {badge.name}
                        </motion.h3>

                        {/* Rarity */}
                        <motion.span
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.35 }}
                            className={cn(
                                "inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium capitalize",
                                badge.rarity === 'COMMON' && "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400",
                                badge.rarity === 'RARE' && "bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400",
                                badge.rarity === 'EPIC' && "bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-400",
                                badge.rarity === 'LEGENDARY' && "bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400",
                                badge.rarity === 'MYTHIC' && "bg-pink-100 text-pink-600 dark:bg-pink-950 dark:text-pink-400",
                            )}
                        >
                            {badge.rarity.toLowerCase()} badge
                        </motion.span>

                        {/* Rewards */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="mt-6 flex items-center justify-center gap-6"
                        >
                            <div className="text-center">
                                <p className="text-2xl font-bold text-blue-500">+{badge.xpReward}</p>
                                <p className="text-xs text-neutral-500">XP</p>
                            </div>
                            <div className="w-px h-10 bg-neutral-200 dark:bg-neutral-800" />
                            <div className="text-center">
                                <p className="text-2xl font-bold text-purple-500">+{badge.creditsReward}</p>
                                <p className="text-xs text-neutral-500">Credits</p>
                            </div>
                        </motion.div>

                        {/* Actions */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="mt-8 space-y-3"
                        >
                            <Button
                                onClick={handleCollect}
                                disabled={collecting}
                                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
                            >
                                {collecting ? (
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                    >
                                        <Sparkles className="w-5 h-5" />
                                    </motion.div>
                                ) : (
                                    <>
                                        <Gift className="w-5 h-5 mr-2" />
                                        Collect Badge
                                    </>
                                )}
                            </Button>
                            
                            <Link href="/achievements" className="block">
                                <Button variant="outline" className="w-full">
                                    View All Achievements
                                    <ExternalLink className="w-4 h-4 ml-2" />
                                </Button>
                            </Link>
                        </motion.div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

// Hook for triggering badge celebration
export function useBadgeCelebration() {
    const [showCelebration, setShowCelebration] = useState(false)
    const [currentBadge, setCurrentBadge] = useState<BadgeCelebrationProps['badge'] | null>(null)
    const [onCollectCallback, setOnCollectCallback] = useState<(() => Promise<void>) | undefined>()

    const celebrate = (
        badge: BadgeCelebrationProps['badge'], 
        onCollect?: () => Promise<void>
    ) => {
        setCurrentBadge(badge)
        setOnCollectCallback(() => onCollect)
        setShowCelebration(true)
    }

    const closeCelebration = () => {
        setShowCelebration(false)
        setCurrentBadge(null)
    }

    return {
        showCelebration,
        currentBadge,
        celebrate,
        closeCelebration,
        onCollect: onCollectCallback,
    }
}
