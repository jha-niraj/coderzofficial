'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Button } from '@repo/ui/components/ui/button'
import { Badge } from '@repo/ui/components/ui/badge'
import { ScrollArea } from '@repo/ui/components/ui/scroll-area'
import { Separator } from '@repo/ui/components/ui/separator'
import {
    Mic, Users, Target, Plus, Trophy, Star, TrendingUp,
    Clock, ChevronRight, History
} from 'lucide-react'
import { cn } from '@repo/ui/lib/utils'
import { MOCK_CATEGORIES } from '../_constants/mock-categories'
import React, { useState, useEffect } from 'react'
import { getVoiceMockStats } from '@/actions/(main)/mockvoice/voice.action'
import { useUserStore } from '@/app/store/useUserStore'
import { CreateMockSheet } from '../../_components/create-mock-sheet'

export function VoiceSidebar() {
    const searchParams = useSearchParams()
    const currentView = searchParams.get('view')
    const currentCategory = searchParams.get('category')

    const isAllMocks = !currentView && !currentCategory || currentView === 'all-mocks'
    const isMySessions = currentView === 'my-sessions'
    const isMyMocks = currentView === 'my-mocks'

    const { credits } = useUserStore()
    const [createSheetOpen, setCreateSheetOpen] = useState(false)
    const [platformStats, setPlatformStats] = useState<{
        totalMocks: number
        totalSessions: number
        avgRating: number
    } | null>(null)

    useEffect(() => {
        getVoiceMockStats().then(r => {
            if (r.success && r.stats) setPlatformStats(r.stats)
        })
    }, [])

    const navLinks = [
        {
            href: '/mock/voice?view=all-mocks',
            active: isAllMocks,
            icon: <Users className="w-4 h-4" />,
            label: 'All Mocks',
        },
        {
            href: '/mock/voice?view=my-sessions',
            active: isMySessions,
            icon: <History className="w-4 h-4" />,
            label: 'My Sessions',
        },
        {
            href: '/mock/voice?view=my-mocks',
            active: isMyMocks,
            icon: <Target className="w-4 h-4" />,
            label: 'My Mocks',
        },
    ]

    return (
        <>
            {/* ── MOBILE: horizontal top bar ── */}
            <div className="lg:hidden w-full bg-white dark:bg-neutral-950 px-4 py-3 flex items-center gap-3 overflow-x-auto">
                {/* Brand */}
                <div className="flex items-center gap-2 flex-shrink-0 mr-2">
                    <div className="w-7 h-7 rounded-full bg-neutral-900 dark:bg-white flex items-center justify-center">
                        <Mic className="w-3.5 h-3.5 text-white dark:text-black" />
                    </div>
                    <span className="font-semibold text-sm whitespace-nowrap text-neutral-900 dark:text-white">AI Mock</span>
                </div>

                <Separator orientation="vertical" className="h-6 flex-shrink-0" />

                {/* Nav tabs */}
                <div className="flex items-center gap-1 flex-shrink-0">
                    {navLinks.map(link => (
                        <Link key={link.href} href={link.href}>
                            <button
                                className={cn(
                                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors',
                                    link.active
                                        ? 'bg-neutral-900 dark:bg-white text-white dark:text-black'
                                        : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                                )}
                            >
                                {link.icon}
                                {link.label}
                            </button>
                        </Link>
                    ))}
                </div>

                <Separator orientation="vertical" className="h-6 flex-shrink-0" />

                {/* Categories — horizontal scroll */}
                <div className="flex items-center gap-1 flex-shrink-0">
                    {MOCK_CATEGORIES.map(cat => (
                        <Link key={cat.value} href={`/mock/voice?category=${cat.value}`}>
                            <button
                                className={cn(
                                    'flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs whitespace-nowrap transition-colors',
                                    currentCategory === cat.value
                                        ? 'bg-neutral-900 dark:bg-white text-white dark:text-black'
                                        : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                                )}
                            >
                                <span>{cat.icon}</span>
                                <span>{cat.label}</span>
                            </button>
                        </Link>
                    ))}
                </div>

                {/* Create button — always visible */}
                <div className="ml-auto flex-shrink-0">
                    <Button
                        size="sm"
                        onClick={() => setCreateSheetOpen(true)}
                        className="bg-black text-white dark:bg-white dark:text-black hover:opacity-90 whitespace-nowrap"
                    >
                        <Plus className="w-3.5 h-3.5 mr-1" />
                        Create
                    </Button>
                </div>
            </div>

            {/* ── DESKTOP: full left sidebar ── */}
            <aside className="hidden lg:flex h-full flex-col bg-neutral-50/50 dark:bg-neutral-900/30 w-full overflow-y-auto">
                <div className="p-6 flex flex-col gap-5 flex-1">
                    {/* Header */}
                    <div className="space-y-3">
                        <Badge variant="outline" className="px-3 py-1 rounded-full border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 w-fit">
                            <Mic className="w-3.5 h-3.5 mr-2 text-primary" />
                            AI Voice Interview
                        </Badge>
                        <div>
                            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white tracking-tight leading-tight">
                                Practice with AI
                            </h1>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1.5 leading-relaxed">
                                Real-time AI interviews with instant feedback.
                            </p>
                        </div>
                    </div>

                    <Separator />

                    {/* Actions + Nav */}
                    <div className="space-y-2">
                        <Button
                            className="w-full justify-start bg-neutral-900 text-white dark:bg-white dark:text-black hover:opacity-90"
                            onClick={() => setCreateSheetOpen(true)}
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Create Custom Mock
                        </Button>
                        <nav className="flex flex-col gap-0.5 mt-1">
                            {navLinks.map(link => (
                                <Link key={link.href} href={link.href} className="w-full">
                                    <Button
                                        variant={link.active ? 'secondary' : 'ghost'}
                                        className={cn(
                                            'w-full justify-start text-sm',
                                            link.active && 'bg-neutral-200 dark:bg-neutral-800'
                                        )}
                                    >
                                        {link.icon}
                                        <span className="ml-2">{link.label}</span>
                                    </Button>
                                </Link>
                            ))}
                        </nav>
                    </div>

                    <Separator />

                    {/* Categories */}
                    <div className="flex-1 min-h-0">
                        <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">
                            Browse Categories
                        </p>
                        <ScrollArea className="h-[260px] pr-2">
                            <div className="space-y-0.5">
                                {MOCK_CATEGORIES.map((category) => (
                                    <Link key={category.value} href={`/mock/voice?category=${category.value}`} className="block w-full">
                                        <button
                                            className={cn(
                                                'cursor-pointer w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all text-sm',
                                                currentCategory === category.value
                                                    ? 'bg-neutral-900 dark:bg-white text-white dark:text-black'
                                                    : 'hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                                            )}
                                        >
                                            <span className="text-base">{category.icon}</span>
                                            <span className="font-medium truncate">{category.label}</span>
                                            {currentCategory === category.value && (
                                                <ChevronRight className="w-3 h-3 ml-auto flex-shrink-0" />
                                            )}
                                        </button>
                                    </Link>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>

                    <Separator />

                    {/* Platform Stats */}
                    <div>
                        <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">
                            Platform Stats
                        </p>
                        <div className="grid grid-cols-2 gap-2.5">
                            <StatCard
                                icon={<Trophy className="w-3.5 h-3.5" />}
                                label="Sessions"
                                value={
                                    platformStats
                                        ? platformStats.totalSessions >= 1000
                                            ? `${(platformStats.totalSessions / 1000).toFixed(1)}K+`
                                            : `${platformStats.totalSessions}`
                                        : '…'
                                }
                            />
                            <StatCard
                                icon={<Star className="w-3.5 h-3.5" />}
                                label="Rating"
                                value={platformStats ? (platformStats.avgRating ? platformStats.avgRating.toFixed(1) : 'NEW') : '…'}
                            />
                            <StatCard
                                icon={<TrendingUp className="w-3.5 h-3.5" />}
                                label="Mocks"
                                value={platformStats ? `${platformStats.totalMocks}` : '…'}
                            />
                            <StatCard
                                icon={<Clock className="w-3.5 h-3.5" />}
                                label="Available"
                                value="24/7"
                            />
                        </div>
                    </div>
                </div>
            </aside>

            <CreateMockSheet
                open={createSheetOpen}
                onOpenChange={setCreateSheetOpen}
                userCredits={credits}
            />
        </>
    )
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <div className="p-3 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center gap-1.5 mb-1 text-neutral-500 dark:text-neutral-400">
                {icon}
                <span className="text-[10px] uppercase font-medium tracking-wide">{label}</span>
            </div>
            <div className="text-base font-bold text-neutral-900 dark:text-white">{value}</div>
        </div>
    )
}
