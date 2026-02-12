'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronRight, Sparkles, TrendingUp, Zap } from 'lucide-react'
import { Progress } from '@repo/ui/components/ui/progress'
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@repo/ui/components/ui/sheet'
import { ScrollArea } from '@repo/ui/components/ui/scroll-area'
import { cn } from '@repo/ui/lib/utils'
import type { LevelInfo, Level } from '@/types/achievements'

interface LevelProgressProps {
    levelInfo: LevelInfo
    levels: Level[]
}

export function LevelProgress({ levelInfo, levels }: LevelProgressProps) {
    const [sheetOpen, setSheetOpen] = useState(false)

    return (
        <>
            <motion.div
                whileHover={{ scale: 1.01 }}
                onClick={() => setSheetOpen(true)}
                className="bg-gradient-to-br from-violet-500/10 via-purple-500/10 to-fuchsia-500/10 dark:from-violet-500/5 dark:via-purple-500/5 dark:to-fuchsia-500/5 rounded-xl p-4 border border-violet-200 dark:border-violet-900 cursor-pointer transition-all hover:shadow-lg hover:shadow-violet-500/10"
            >
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div 
                            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                            style={{ background: `linear-gradient(135deg, ${levelInfo.color} 0%, #a855f7 100%)` }}
                        >
                            {levelInfo.icon}
                        </div>
                        <div>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">Level {levelInfo.level}</p>
                            <h3 className="font-bold text-neutral-900 dark:text-white">{levelInfo.title}</h3>
                        </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-neutral-400" />
                </div>

                <div className="mt-4">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-neutral-500">{levelInfo.currentXp.toLocaleString()} XP</span>
                        {levelInfo.nextLevelXp && (
                            <span className="text-neutral-500">{levelInfo.nextLevelXp.toLocaleString()} XP</span>
                        )}
                    </div>
                    <Progress value={levelInfo.progressPercent} className="h-2 bg-violet-100 dark:bg-violet-900/30" />
                    {levelInfo.xpToNext > 0 && (
                        <p className="text-xs text-neutral-500 mt-1.5 text-center">
                            {levelInfo.xpToNext.toLocaleString()} XP to next level
                        </p>
                    )}
                </div>
            </motion.div>

            {/* Level Details Sheet */}
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetContent className="sm:max-w-lg">
                    <SheetHeader>
                        <SheetTitle className="flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-violet-500" />
                            Level System
                        </SheetTitle>
                        <SheetDescription>
                            Earn XP to level up and unlock rewards
                        </SheetDescription>
                    </SheetHeader>

                    <ScrollArea className="h-[calc(100vh-150px)] mt-6 pr-4">
                        <div className="space-y-3">
                            {levels.map((level, idx) => {
                                const isCurrent = level.level === levelInfo.level
                                const isCompleted = level.level < levelInfo.level

                                return (
                                    <motion.div
                                        key={level.level}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.03 }}
                                        className={cn(
                                            "relative p-4 rounded-xl border transition-all",
                                            isCurrent 
                                                ? "bg-violet-50 dark:bg-violet-950/50 border-violet-300 dark:border-violet-800 ring-2 ring-violet-500/30"
                                                : isCompleted
                                                    ? "bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 opacity-70"
                                                    : "bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800"
                                        )}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div 
                                                className={cn(
                                                    "w-10 h-10 rounded-lg flex items-center justify-center text-lg shrink-0",
                                                    !isCompleted && !isCurrent && "grayscale opacity-50"
                                                )}
                                                style={{ 
                                                    background: isCompleted || isCurrent 
                                                        ? `linear-gradient(135deg, ${level.color} 0%, #a855f7 100%)`
                                                        : '#e5e5e5'
                                                }}
                                            >
                                                {level.icon}
                                            </div>
                                            
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-neutral-500">Lv. {level.level}</span>
                                                    {isCurrent && (
                                                        <span className="px-2 py-0.5 text-xs font-medium bg-violet-100 dark:bg-violet-900 text-violet-700 dark:text-violet-300 rounded-full">
                                                            Current
                                                        </span>
                                                    )}
                                                    {isCompleted && (
                                                        <span className="text-xs text-emerald-500">✓ Completed</span>
                                                    )}
                                                </div>
                                                <h4 className="font-semibold text-neutral-900 dark:text-white">{level.title}</h4>
                                                {level.description && (
                                                    <p className="text-xs text-neutral-500 mt-0.5 line-clamp-2">{level.description}</p>
                                                )}
                                                
                                                <div className="flex items-center gap-4 mt-2">
                                                    <div className="flex items-center gap-1 text-xs">
                                                        <TrendingUp className="w-3 h-3 text-neutral-400" />
                                                        <span className="text-neutral-600 dark:text-neutral-400">
                                                            {level.xpRequired.toLocaleString()} XP required
                                                        </span>
                                                    </div>
                                                </div>

                                                {(level.xpReward > 0 || level.creditsReward > 0) && (
                                                    <div className="flex items-center gap-3 mt-2">
                                                        {level.xpReward > 0 && (
                                                            <span className="text-xs text-blue-500 font-medium flex items-center gap-1">
                                                                <Zap className="w-3 h-3" />
                                                                +{level.xpReward} bonus XP
                                                            </span>
                                                        )}
                                                        {level.creditsReward > 0 && (
                                                            <span className="text-xs text-purple-500 font-medium">
                                                                +{level.creditsReward} 💎
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {isCurrent && levelInfo.xpToNext > 0 && (
                                            <div className="mt-3 pt-3 border-t border-violet-200 dark:border-violet-800">
                                                <Progress value={levelInfo.progressPercent} className="h-1.5" />
                                                <p className="text-xs text-violet-600 dark:text-violet-400 mt-1">
                                                    {levelInfo.xpToNext.toLocaleString()} XP to Level {levelInfo.level + 1}
                                                </p>
                                            </div>
                                        )}
                                    </motion.div>
                                )
                            })}
                        </div>
                    </ScrollArea>
                </SheetContent>
            </Sheet>
        </>
    )
}
