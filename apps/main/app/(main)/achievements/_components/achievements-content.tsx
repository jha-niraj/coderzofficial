'use client'

import { useState, useMemo } from 'react'
import {
    Trophy, Award, Star, Crown, Sparkles, Share2, Search, Gift,
    Zap, TrendingUp, Target, Medal, Flame
} from 'lucide-react'
import { Button } from '@repo/ui/components/ui/button'
import { Input } from '@repo/ui/components/ui/input'
import { Progress } from '@repo/ui/components/ui/progress'
import { Badge } from '@repo/ui/components/ui/badge'
import { ScrollArea } from '@repo/ui/components/ui/scroll-area'
import {
    Tabs, TabsContent, TabsList, TabsTrigger
} from '@repo/ui/components/ui/tabs'
import Link from 'next/link'
import { cn } from '@repo/ui/lib/utils'
import type { AchievementsContentProps } from '@/types/achievements'
import type { BadgeWithProgress } from '@/actions/(main)/achievements/achievements.action'
import { BadgeCard } from './badge-card'
import { LevelProgress } from './level-progress'
import { ClaimBadgeSheet } from './claim-badge-sheet'
import { ShareSheet } from './share-sheet'

const CATEGORIES = [
    { id: 'all', name: 'All', icon: Trophy },
    { id: 'PROJECTS', name: 'Projects', icon: Target },
    { id: 'ASSESSMENTS', name: 'Assessments', icon: Award },
    { id: 'CHALLENGES', name: 'Challenges', icon: Flame },
    { id: 'MOCK_INTERVIEWS', name: 'Mock Interviews', icon: Star },
    { id: 'COMMUNITY', name: 'Community', icon: Sparkles },
    { id: 'PATHFINDER', name: 'Pathfinder', icon: TrendingUp },
    { id: 'STUDIO', name: 'Studio', icon: Medal },
    { id: 'CONSISTENCY', name: 'Streaks', icon: Zap },
    { id: 'MILESTONE', name: 'Milestones', icon: Crown },
]

const RARITY_COLORS = {
    COMMON: { bg: 'bg-neutral-100 dark:bg-neutral-800', text: 'text-neutral-600 dark:text-neutral-400', border: 'border-neutral-300 dark:border-neutral-700' },
    RARE: { bg: 'bg-blue-50 dark:bg-blue-950', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-300 dark:border-blue-700' },
    EPIC: { bg: 'bg-purple-50 dark:bg-purple-950', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-300 dark:border-purple-700' },
    LEGENDARY: { bg: 'bg-amber-50 dark:bg-amber-950', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-300 dark:border-amber-700' },
    MYTHIC: { bg: 'bg-pink-50 dark:bg-pink-950', text: 'text-pink-600 dark:text-pink-400', border: 'border-pink-300 dark:border-pink-700' },
}

export function AchievementsContent({
    badges,
    stats,
    levelInfo,
    socialConnections,
    levels
}: AchievementsContentProps) {
    const [selectedCategory, setSelectedCategory] = useState('all')
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedBadge, setSelectedBadge] = useState<BadgeWithProgress | null>(null)
    const [shareSheetOpen, setShareSheetOpen] = useState(false)
    const [shareBadge, setShareBadge] = useState<BadgeWithProgress | null>(null)
    const [filterRarity, setFilterRarity] = useState<string | null>(null)

    // Filter badges
    const filteredBadges = useMemo(() => {
        return badges.filter(badge => {
            if (selectedCategory !== 'all' && badge.category !== selectedCategory) return false
            if (filterRarity && badge.rarity !== filterRarity) return false
            if (searchQuery) {
                const query = searchQuery.toLowerCase()
                return badge.name.toLowerCase().includes(query) ||
                    badge.description.toLowerCase().includes(query)
            }
            return true
        })
    }, [badges, selectedCategory, searchQuery, filterRarity])

    // Group badges by status for the overview
    const readyToClaim = badges.filter(b => b.status === 'READY_TO_CLAIM')
    const inProgress = badges.filter(b => b.status === 'IN_PROGRESS').sort((a, b) => b.progressPercent - a.progressPercent)

    const handleShare = (badge: BadgeWithProgress) => {
        setShareBadge(badge)
        setShareSheetOpen(true)
    }

    const hasConnectedSocials = socialConnections.length > 0

    return (
        <div className="h-screen bg-neutral-50 dark:bg-neutral-950">
            <ScrollArea className="h-full">
                <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Achievements</h1>
                            <p className="text-neutral-500 mt-1">Track your progress and earn badges</p>
                        </div>
                        <Link href="/settings/integrations">
                            <Button variant="outline" size="sm" className="gap-2">
                                <Share2 className="w-4 h-4" />
                                {hasConnectedSocials ? 'Social Connected' : 'Connect Social'}
                            </Button>
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        <div className="lg:col-span-1">
                            <LevelProgress levelInfo={levelInfo} levels={levels} />
                        </div>
                        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <StatsCard
                                icon={<Trophy className="w-5 h-5" />}
                                label="Badges Earned"
                                value={stats.claimedBadges}
                                total={stats.totalBadges}
                                color="text-amber-500"
                            />
                            <StatsCard
                                icon={<Gift className="w-5 h-5" />}
                                label="Ready to Claim"
                                value={stats.readyToClaim}
                                color="text-emerald-500"
                                highlight={stats.readyToClaim > 0}
                            />
                            <StatsCard
                                icon={<Zap className="w-5 h-5" />}
                                label="XP from Badges"
                                value={stats.totalXpFromBadges.toLocaleString()}
                                color="text-blue-500"
                            />
                            <StatsCard
                                icon={<Star className="w-5 h-5" />}
                                label="Credits Earned"
                                value={stats.totalCreditsFromBadges.toLocaleString()}
                                color="text-purple-500"
                            />
                        </div>
                    </div>
                    <div className="bg-white dark:bg-neutral-900 rounded-xl p-4 border border-neutral-200 dark:border-neutral-800">
                        <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">Badge Collection</h3>
                        <div className="flex flex-wrap gap-2">
                            <RarityBadge rarity="COMMON" count={stats.commonBadges} onClick={() => setFilterRarity(filterRarity === 'COMMON' ? null : 'COMMON')} active={filterRarity === 'COMMON'} />
                            <RarityBadge rarity="RARE" count={stats.rareBadges} onClick={() => setFilterRarity(filterRarity === 'RARE' ? null : 'RARE')} active={filterRarity === 'RARE'} />
                            <RarityBadge rarity="EPIC" count={stats.epicBadges} onClick={() => setFilterRarity(filterRarity === 'EPIC' ? null : 'EPIC')} active={filterRarity === 'EPIC'} />
                            <RarityBadge rarity="LEGENDARY" count={stats.legendaryBadges} onClick={() => setFilterRarity(filterRarity === 'LEGENDARY' ? null : 'LEGENDARY')} active={filterRarity === 'LEGENDARY'} />
                            <RarityBadge rarity="MYTHIC" count={stats.mythicBadges} onClick={() => setFilterRarity(filterRarity === 'MYTHIC' ? null : 'MYTHIC')} active={filterRarity === 'MYTHIC'} />
                        </div>
                    </div>

                    {
                        readyToClaim.length > 0 && (
                            <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 dark:from-emerald-500/5 dark:to-teal-500/5 rounded-xl p-4 border border-emerald-200 dark:border-emerald-800">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <Gift className="w-5 h-5 text-emerald-500" />
                                        <h3 className="font-semibold text-neutral-900 dark:text-white">Ready to Claim!</h3>
                                        <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
                                            {readyToClaim.length}
                                        </Badge>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                    {
                                        readyToClaim.slice(0, 5).map(badge => (
                                            <BadgeCard
                                                key={badge.id}
                                                badge={badge}
                                                onClick={() => setSelectedBadge(badge)}
                                                compact
                                            />
                                        ))
                                    }
                                </div>
                            </div>
                        )
                    }


                    <Tabs defaultValue="all" className="space-y-4">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <TabsList className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-1 flex-wrap h-auto">
                                {
                                    CATEGORIES.map(cat => (
                                        <TabsTrigger
                                            key={cat.id}
                                            value={cat.id}
                                            onClick={() => setSelectedCategory(cat.id)}
                                            className="gap-1.5 data-[state=active]:bg-neutral-100 dark:data-[state=active]:bg-neutral-800"
                                        >
                                            <cat.icon className="w-3.5 h-3.5" />
                                            <span className="hidden sm:inline">{cat.name}</span>
                                        </TabsTrigger>
                                    ))
                                }
                            </TabsList>
                            <div className="relative w-full sm:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                                <Input
                                    placeholder="Search badges..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9 bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800"
                                />
                            </div>
                        </div>
                        <TabsContent value={selectedCategory} className="mt-4">
                            {
                                filteredBadges.length === 0 ? (
                                    <div className="text-center py-12">
                                        <Trophy className="w-12 h-12 mx-auto text-neutral-300 dark:text-neutral-700 mb-3" />
                                        <p className="text-neutral-500">No badges found</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                                        {
                                            filteredBadges.map(badge => (
                                                <BadgeCard
                                                    key={badge.id}
                                                    badge={badge}
                                                    onClick={() => setSelectedBadge(badge)}
                                                    onShare={() => handleShare(badge)}
                                                />
                                            ))
                                        }
                                    </div>
                                )
                            }
                        </TabsContent>
                    </Tabs>

                    {
                        inProgress.length > 0 && (
                            <div className="bg-white dark:bg-neutral-900 rounded-xl p-4 border border-neutral-200 dark:border-neutral-800">
                                <div className="flex items-center gap-2 mb-4">
                                    <TrendingUp className="w-5 h-5 text-blue-500" />
                                    <h3 className="font-semibold text-neutral-900 dark:text-white">In Progress</h3>
                                    <Badge variant="secondary">{inProgress.length}</Badge>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {
                                        inProgress.slice(0, 6).map(badge => (
                                            <div
                                                key={badge.id}
                                                className="flex items-center gap-3 p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                                                onClick={() => setSelectedBadge(badge)}
                                            >
                                                <div
                                                    className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                                                    style={{ background: badge.bgGradient || badge.color }}
                                                >
                                                    {badge.icon}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">{badge.name}</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <Progress value={badge.progressPercent} className="h-1.5 flex-1" />
                                                        <span className="text-xs text-neutral-500">{badge.progressPercent}%</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    }
                                </div>
                            </div>
                        )
                    }
                </div>
            </ScrollArea>

            <ClaimBadgeSheet
                badge={selectedBadge}
                open={!!selectedBadge}
                onOpenChange={(open) => !open && setSelectedBadge(null)}
                onShare={handleShare}
                socialConnections={socialConnections}
            />

            <ShareSheet
                badge={shareBadge}
                open={shareSheetOpen}
                onOpenChange={setShareSheetOpen}
                socialConnections={socialConnections}
            />
        </div>
    )
}

// Stats Card Component
function StatsCard({
    icon,
    label,
    value,
    total,
    color,
    highlight
}: {
    icon: React.ReactNode
    label: string
    value: string | number
    total?: number
    color: string
    highlight?: boolean
}) {
    return (
        <div className={cn(
            "bg-white dark:bg-neutral-900 rounded-xl p-4 border border-neutral-200 dark:border-neutral-800",
            highlight && "ring-2 ring-emerald-500/50 border-emerald-200 dark:border-emerald-800"
        )}>
            <div className={cn("mb-2", color)}>{icon}</div>
            <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                {value}
                {
                    total !== undefined && (
                        <span className="text-sm font-normal text-neutral-400">/{total}</span>
                    )
                }
            </p>
            <p className="text-xs text-neutral-500 mt-1">{label}</p>
        </div>
    )
}

// Rarity Badge Component
function RarityBadge({
    rarity,
    count,
    onClick,
    active
}: {
    rarity: keyof typeof RARITY_COLORS
    count: number
    onClick: () => void
    active: boolean
}) {
    const colors = RARITY_COLORS[rarity]
    return (
        <button
            onClick={onClick}
            className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all",
                colors.bg, colors.border, colors.text,
                active && "ring-2 ring-offset-2 ring-offset-white dark:ring-offset-neutral-900",
                active && (rarity === 'COMMON' ? 'ring-neutral-400' :
                    rarity === 'RARE' ? 'ring-blue-400' :
                        rarity === 'EPIC' ? 'ring-purple-400' :
                            rarity === 'LEGENDARY' ? 'ring-amber-400' : 'ring-pink-400')
            )}
        >
            <span className="text-sm font-medium capitalize">{rarity.toLowerCase()}</span>
            <span className="text-xs font-bold">{count}</span>
        </button>
    )
}