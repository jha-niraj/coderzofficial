'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ScrollArea } from '@repo/ui/components/ui/scroll-area'
import { Button } from '@repo/ui/components/ui/button'
import { Badge } from '@repo/ui/components/ui/badge'
import {
    Copy, Loader2, Code2, Brain
} from 'lucide-react'
import { copyPathfinderGoal } from '@/actions/(main)/pathfinder'
import { useUserStore } from '@/app/store/useUserStore'
import { PATHFINDER_CATEGORIES } from '@/types/pathfinder'
import { cn } from '@repo/ui/lib/utils'
import toast from '@repo/ui/components/ui/sonner'

interface SubGoal {
    id: string
    title: string
    description: string | null
    status: string
    hasCoding: boolean
}

interface GoalUser {
    id: string
    name: string | null
    username: string | null
    image: string | null
}

interface Goal {
    id: string
    title: string
    slug: string
    category: string
    level: string
    overview: string | null
    totalSubGoals: number
    completedSubGoals: number
    creditPrice: number | null
    subGoals: SubGoal[]
    user: GoalUser
}

interface GoalPreviewContentProps {
    goal: Goal
}

export function GoalPreviewContent({ goal }: GoalPreviewContentProps) {
    const router = useRouter()
    const { credits } = useUserStore()
    const [copying, setCopying] = useState(false)
    const category = PATHFINDER_CATEGORIES[goal.category as keyof typeof PATHFINDER_CATEGORIES]
    const price = goal.creditPrice ?? 0
    const canAfford = (credits ?? 0) >= price
    const isPaid = price > 0

    const handleCopy = async () => {
        setCopying(true)
        try {
            const result = await copyPathfinderGoal(goal.id)
            if (result.success && result.slug) {
                toast.success('Goal copied! Redirecting...')
                router.push(`/pathfinder/${result.slug}`)
            } else {
                toast.error(result.error || 'Failed to copy goal')
                if (result.code === 'INSUFFICIENT_CREDITS') {
                    toast.error(`You need ${result.required} credits. You have ${result.available}.`)
                }
            }
        } catch {
            toast.error('Something went wrong')
        } finally {
            setCopying(false)
        }
    }

    return (
        <ScrollArea className="h-full">
            <div className="p-6 max-w-2xl">
                <div className="mb-6">
                    <div className="flex items-start gap-4">
                        <div className={cn(
                            "w-14 h-14 rounded-xl flex items-center justify-center text-2xl shrink-0",
                            category?.bg ?? "bg-violet-100 dark:bg-violet-900/30"
                        )}>
                            {category?.emoji ?? "🎯"}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h1 className="text-xl font-semibold text-neutral-900 dark:text-white mb-1">
                                {goal.title}
                            </h1>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-3">
                                by {goal.user?.name || goal.user?.username || 'Unknown'} • {goal.level}
                            </p>
                            {
                                goal.overview && (
                                    <p className="text-sm text-neutral-600 dark:text-neutral-300 mb-4">
                                        {goal.overview}
                                    </p>
                                )
                            }
                            <div className="flex flex-wrap items-center gap-3">
                                <Button
                                    onClick={handleCopy}
                                    disabled={copying || (isPaid && !canAfford)}
                                    className="gap-2"
                                >
                                    {
                                        copying ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Copy className="w-4 h-4" />
                                        )
                                    }
                                    {
                                        isPaid
                                            ? `Copy for ${price} credits`
                                            : 'Copy to My Goals'
                                    }
                                </Button>
                                {
                                    isPaid && (
                                        <span className="text-sm text-neutral-500">
                                            {
                                                canAfford
                                                    ? `You have ${credits ?? 0} credits`
                                                    : `Need ${price - (credits ?? 0)} more credits`
                                            }
                                        </span>
                                    )
                                }
                            </div>
                        </div>
                    </div>
                </div>

                {
                    goal.subGoals && goal.subGoals.length > 0 && (
                        <div>
                            <h2 className="text-sm font-semibold text-neutral-900 dark:text-white mb-3">
                                What&apos;s inside ({goal.subGoals.length} tasks)
                            </h2>
                            <div className="space-y-2">
                                {
                                    goal.subGoals.map((sg, idx) => (
                                        <div
                                            key={sg.id}
                                            className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/50 flex items-start gap-3"
                                        >
                                            <span className="text-xs font-medium text-neutral-400 w-6">
                                                {idx + 1}.
                                            </span>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-neutral-900 dark:text-white">
                                                    {sg.title}
                                                </p>
                                                {
                                                    sg.description && (
                                                        <p className="text-xs text-neutral-500 mt-0.5 line-clamp-2">
                                                            {sg.description}
                                                        </p>
                                                    )
                                                }
                                                <div className="flex gap-2 mt-2">
                                                    <Badge variant="secondary" className="text-[10px] h-5 gap-1">
                                                        <Brain className="w-2.5 h-2.5" />
                                                        Quiz
                                                    </Badge>
                                                    {
                                                        sg.hasCoding && (
                                                            <Badge variant="secondary" className="text-[10px] h-5 gap-1">
                                                                <Code2 className="w-2.5 h-2.5" />
                                                                Coding
                                                            </Badge>
                                                        )
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                }
                            </div>
                        </div>
                    )
                }
                {
                    goal.subGoals && goal.subGoals.length === 0 && (
                        <div className="py-8 text-center text-sm text-neutral-500 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-lg">
                            This goal has no sub-goals yet.
                        </div>
                    )
                }
            </div>
        </ScrollArea>
    )
}