"use client"

import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@repo/ui/components/ui/button"
import { Progress } from "@repo/ui/components/ui/progress"
import {
    Target, Plus, CheckCircle2
} from "lucide-react"
import { PATHFINDER_CATEGORIES } from "@/types/pathfinder"
import type { PathfinderGoalSummary } from "@/types/pathfinder"

interface PathfinderGoalsCardProps {
    goals: PathfinderGoalSummary[]
}

const DURATION_LABELS: Record<string, string> = {
    ONE_WEEK: "1 Week",
    FORTNIGHT: "Fortnight",
    ONE_MONTH: "1 Month",
    TWO_MONTHS: "2 Months",
    THREE_MONTHS: "3 Months",
    SIX_MONTHS: "6 Months",
    CUSTOM: "Custom",
}

export default function PathfinderGoalsCard({ goals }: PathfinderGoalsCardProps) {
    const router = useRouter()
    const activeGoals = goals.filter((g) => g.status === "ACTIVE" || g.status === "VERIFICATION")
    const completedCount = goals.filter((g) => g.status === "COMPLETED").length
    const total = goals.length
    const progressPercent = total > 0 ? Math.round((completedCount / total) * 100) : 0

    return (
        <>
            <div className="rounded-xl border border-primary/10 bg-card/50 p-4">
                <div className="pb-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="p-2 rounded-lg bg-primary/10">
                                <Target className="h-4 w-4 text-primary" />
                            </div>
                            <h3 className="text-lg">Learning Goals</h3>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push("/pathfinder")}
                        >
                            <Plus className="h-4 w-4 mr-1" />
                            New Goal
                        </Button>
                    </div>
                    {
                        goals.length > 0 && (
                            <div className="mt-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Progress</span>
                                    <span className="font-medium">
                                        {completedCount}/{total} completed
                                    </span>
                                </div>
                                <Progress value={progressPercent} className="h-2" />
                            </div>
                        )
                    }
                </div>
                <div className="space-y-3">
                    {
                        activeGoals.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-center py-8 space-y-3"
                            >
                                <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                                    <Target className="h-6 w-6 text-muted-foreground" />
                                </div>
                                <div>
                                    <p className="font-medium">No active goals</p>
                                    <p className="text-sm text-muted-foreground">
                                        Create a learning goal to track your progress
                                    </p>
                                </div>
                            </motion.div>
                        ) : (
                            <AnimatePresence>
                                {
                                    activeGoals.slice(0, 5).map((goal, index) => {
                                        const category = PATHFINDER_CATEGORIES[goal.category as keyof typeof PATHFINDER_CATEGORIES]
                                        return (
                                            <motion.div
                                                key={goal.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: 20 }}
                                                transition={{ delay: index * 0.1 }}
                                                className="p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors bg-muted/30 border-border"
                                                onClick={() => router.push("/pathfinder")}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <span className="text-lg">{category?.emoji ?? "🎯"}</span>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium truncate">{goal.title}</p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <Progress
                                                                value={goal.progressPercent}
                                                                className="h-1.5 flex-1 max-w-[120px]"
                                                            />
                                                            <span className="text-xs text-muted-foreground">
                                                                {goal.progressPercent}%
                                                            </span>
                                                        </div>
                                                        {
                                                            (goal.duration || goal.estimatedDays) && (
                                                                <p className="text-xs text-muted-foreground mt-0.5">
                                                                    {
                                                                        goal.duration
                                                                            ? DURATION_LABELS[goal.duration] ?? goal.duration
                                                                            : goal.estimatedDays
                                                                                ? `${goal.estimatedDays} days`
                                                                                : null
                                                                    }
                                                                </p>
                                                            )
                                                        }
                                                    </div>
                                                    <CheckCircle2 className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                                                </div>
                                            </motion.div>
                                        )
                                    })
                                }
                                {
                                    activeGoals.length > 5 && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="w-full"
                                            onClick={() => router.push("/pathfinder")}
                                        >
                                            View all {activeGoals.length} goals
                                        </Button>
                                    )
                                }
                            </AnimatePresence>
                        )
                    }
                </div>
            </div>
        </>
    )
}