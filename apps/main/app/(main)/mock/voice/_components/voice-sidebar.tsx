'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Button } from '@repo/ui/components/ui/button'
import { Badge } from '@repo/ui/components/ui/badge'
import { ScrollArea } from '@repo/ui/components/ui/scroll-area'
import { Separator } from '@repo/ui/components/ui/separator'
import {
    Mic, Users, Calendar, Target, Plus, Trophy, Star, TrendingUp,
    Clock, ChevronRight
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

    // Determine active state
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
        async function loadStats() {
            const result = await getVoiceMockStats()
            if (result.success && result.stats) {
                setPlatformStats(result.stats)
            }
        }
        loadStats()
    }, [])

    const displayStats = [
        {
            icon: <Users className="w-4 h-4" />,
            value: platformStats ? (platformStats.totalSessions >= 1000 ? `${(platformStats.totalSessions / 1000).toFixed(1)}K+` : `${platformStats.totalSessions}`) : '...',
            label: 'Sessions',
            icon2: Trophy
        },
        {
            icon: <Star className="w-4 h-4" />,
            value: platformStats ? (platformStats.avgRating ? platformStats.avgRating.toFixed(1) : 'NEW') : '...',
            label: 'Rating',
            icon2: Star
        },
        {
            icon: <TrendingUp className="w-4 h-4" />,
            value: platformStats ? `${platformStats.totalMocks}` : '...',
            label: 'Mocks Available',
            icon2: Award
        },
        {
            icon: <Clock className="w-4 h-4" />,
            value: '24/7',
            label: 'Available',
            icon2: Timer
        },
    ]

    return (
        <aside className="h-full border-r border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30 w-full">
            <div className="sticky top-0 h-screen overflow-y-auto p-6 flex flex-col gap-4">
                <div className="space-y-4">
                    <Badge variant="outline" className="px-3 py-1 rounded-full border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900">
                        <Mic className="w-3.5 h-3.5 mr-2 text-primary" />
                        AI Voice Interview
                    </Badge>
                    <div>
                        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white tracking-tight leading-tight">
                            Practice with AI
                        </h1>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2 leading-relaxed">
                            Ace your interviews with real-time AI feedback and personalized coaching.
                        </p>
                    </div>
                </div>

                <Separator className="bg-neutral-200 dark:bg-neutral-800" />

                <div className="space-y-3">
                    <Button
                        className="w-full justify-start text-white bg-black dark:bg-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200"
                        onClick={() => setCreateSheetOpen(true)}
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Create Custom Mock
                    </Button>
                    <nav className="flex flex-col gap-1">
                        <Link href="/mock/voice?view=all-mocks" className="w-full">
                            <Button
                                variant={isAllMocks ? "secondary" : "ghost"}
                                className={cn("w-full justify-start", isAllMocks ? "bg-neutral-200 dark:bg-neutral-800" : "")}
                            >
                                <Users className="w-4 h-4 mr-2" />
                                All Public Mocks
                            </Button>
                        </Link>
                        <Link href="/mock/voice?view=my-sessions" className="w-full">
                            <Button
                                variant={isMySessions ? "secondary" : "ghost"}
                                className={cn("w-full justify-start", isMySessions ? "bg-neutral-200 dark:bg-neutral-800" : "")}
                            >
                                <Calendar className="w-4 h-4 mr-2" />
                                My Sessions
                            </Button>
                        </Link>
                        <Link href="/mock/voice?view=my-mocks" className="w-full">
                            <Button
                                variant={isMyMocks ? "secondary" : "ghost"}
                                className={cn("w-full justify-start", isMyMocks ? "bg-neutral-200 dark:bg-neutral-800" : "")}
                            >
                                <Target className="w-4 h-4 mr-2" />
                                My Mocks
                            </Button>
                        </Link>
                    </nav>
                </div>

                <Separator className="bg-neutral-200 dark:bg-neutral-800" />

                <div className="flex-1 min-h-0">
                    <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-4">
                        Browse Categories
                    </h3>
                    <ScrollArea className="h-[300px] pr-4">
                        <div className="space-y-1">
                            {
                                MOCK_CATEGORIES.map((category) => (
                                    <Link key={category.value} href={`/mock/voice?category=${category.value}`} className="block w-full">
                                        <button
                                            className={cn(
                                                "cursor-pointer w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all text-sm",
                                                currentCategory === category.value
                                                    ? "bg-neutral-900 dark:bg-white text-white dark:text-black"
                                                    : "hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
                                            )}
                                        >
                                            <span className="text-base">{category.icon}</span>
                                            <span className="font-medium truncate">{category.label}</span>
                                            {
                                                currentCategory === category.value && (
                                                    <ChevronRight className="w-3 h-3 ml-auto" />
                                                )
                                            }
                                        </button>
                                    </Link>
                                ))
                            }
                        </div>
                    </ScrollArea>
                </div>

                <Separator className="bg-neutral-200 dark:bg-neutral-800" />

                <div>
                    <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-4">
                        Platform Stats
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                        {
                            displayStats.map((stat, index) => (
                                <div key={index} className="p-3 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                                    <div className="flex items-center gap-2 mb-1 text-neutral-500 dark:text-neutral-400">
                                        {stat.icon}
                                        <span className="text-[10px] uppercase font-medium">{stat.label}</span>
                                    </div>
                                    <div className="text-lg font-bold text-neutral-900 dark:text-white">
                                        {stat.value}
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                </div>
            </div>

            <CreateMockSheet
                open={createSheetOpen}
                onOpenChange={setCreateSheetOpen}
                userCredits={credits}
            />
        </aside>
    )
}

function Award(props: React.ComponentProps<'svg'>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="12" cy="8" r="7" />
            <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
        </svg>
    )
}

function Timer(props: React.ComponentProps<'svg'>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <line x1="10" x2="14" y1="2" y2="2" />
            <line x1="12" x2="15" y1="14" y2="11" />
            <circle cx="12" cy="14" r="8" />
        </svg>
    )
}