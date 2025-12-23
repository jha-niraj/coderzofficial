"use client"

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
    Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle
} from '@/components/ui/sheet'
import {
    Avatar, AvatarFallback, AvatarImage
} from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
    Card, CardContent, CardHeader, CardTitle
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import {
    CheckCircle2, Clock, Trophy, Target, Calendar, Loader2
} from 'lucide-react'
import { getUserProjectProgress } from '@/actions/(main)/projects/leaderboard.action'
import { formatScore, getScoreColor } from '@/lib/project-scoring'
import { format } from 'date-fns'

interface UserProgressSheetProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    projectSlug: string
    username: string
}

export function UserProgressSheet({
    open,
    onOpenChange,
    projectSlug,
    username
}: UserProgressSheetProps) {
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState<any>(null)
    const [error, setError] = useState<string | null>(null)

    const fetchProgress = useCallback(async () => {
        setLoading(true)
        setError(null)

        const result = await getUserProjectProgress(projectSlug, username)

        if (result.success) {
            setData(result.data)
        } else {
            setError(result.message || 'Failed to load progress')
        }

        setLoading(false)
    }, [projectSlug, username]);

    useEffect(() => {
        if (open && username) {
            fetchProgress()
        }
    }, [open, username, fetchProgress])

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'BEGINNER': return 'bg-green-500/10 text-green-600 dark:text-green-400'
            case 'INTERMEDIATE': return 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
            case 'ADVANCED': return 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
            default: return 'bg-gray-500/10 text-gray-600 dark:text-gray-400'
        }
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-xl overflow-y-auto">
                {
                    loading ? (
                        <div className="flex items-center justify-center h-full">
                            <Loader2 className="w-8 h-8 animate-spin text-neutral-500" />
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center h-full">
                            <p className="text-red-500 mb-4">{error}</p>
                        </div>
                    ) : data ? (
                        <>
                            <SheetHeader>
                                <SheetTitle className="flex items-center gap-3">
                                    <Avatar className="h-12 w-12">
                                        <AvatarImage src={data.user.image} />
                                        <AvatarFallback>
                                            {data.user.name?.[0] || data.user.username?.[0] || 'U'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="text-lg font-bold">{data.user.name}</p>
                                        <p className="text-sm text-muted-foreground">@{data.user.username}</p>
                                    </div>
                                </SheetTitle>
                                <SheetDescription>
                                    Progress on {data.project.title}
                                </SheetDescription>
                            </SheetHeader>
                            <div className="mt-6 space-y-6">
                                <div className="grid grid-cols-2 gap-3">
                                    <Card>
                                        <CardContent className="pt-4">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Trophy className="w-4 h-4 text-yellow-500" />
                                                <p className="text-xs font-medium text-muted-foreground">Total Score</p>
                                            </div>
                                            <p className={`text-2xl font-bold ${getScoreColor(data.progress.totalScore)}`}>
                                                {formatScore(data.progress.totalScore)}
                                            </p>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardContent className="pt-4">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Target className="w-4 h-4 text-blue-500" />
                                                <p className="text-xs font-medium text-muted-foreground">Progress</p>
                                            </div>
                                            <p className="text-2xl font-bold">
                                                {Math.round(data.progress.progressPercentage)}%
                                            </p>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardContent className="pt-4">
                                            <div className="flex items-center gap-2 mb-1">
                                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                                <p className="text-xs font-medium text-muted-foreground">Tasks</p>
                                            </div>
                                            <p className="text-2xl font-bold">
                                                {data.progress.tasksCompleted}/{data.progress.totalTasks}
                                            </p>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardContent className="pt-4">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Calendar className="w-4 h-4 text-purple-500" />
                                                <p className="text-xs font-medium text-muted-foreground">Started</p>
                                            </div>
                                            <p className="text-xs font-semibold">
                                                {
                                                    data.progress.startedAt
                                                        ? format(new Date(data.progress.startedAt), 'MMM d, yyyy')
                                                        : 'Not started'
                                                }
                                            </p>
                                        </CardContent>
                                    </Card>
                                </div>
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-sm">Score Breakdown</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm">Tasks</span>
                                            <span className="font-semibold">{formatScore(data.progress.tasksScore)}/50</span>
                                        </div>
                                        <Progress value={(data.progress.tasksScore / 50) * 100} className="h-2" />

                                        <div className="flex justify-between items-center">
                                            <span className="text-sm">Quiz</span>
                                            <span className="font-semibold">{formatScore(data.progress.quizScore)}/25</span>
                                        </div>
                                        <Progress value={(data.progress.quizScore / 25) * 100} className="h-2" />

                                        <div className="flex justify-between items-center">
                                            <span className="text-sm">Mock AI</span>
                                            <span className="font-semibold">{formatScore(data.progress.mockScore)}/25</span>
                                        </div>
                                        <Progress value={(data.progress.mockScore / 25) * 100} className="h-2" />
                                    </CardContent>
                                </Card>
                                {
                                    data.tasks.completed.length > 0 && (
                                        <div>
                                            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                                Completed Tasks ({data.tasks.completed.length})
                                            </h3>
                                            <div className="space-y-2">
                                                {
                                                    data.tasks.completed.map((task: any) => (
                                                        <motion.div
                                                            key={task.id}
                                                            initial={{ opacity: 0, y: 10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                        >
                                                            <Card className="border-green-200 dark:border-green-900/50 bg-green-50/50 dark:bg-green-950/20">
                                                                <CardContent className="p-4">
                                                                    <div className="flex items-start justify-between gap-2 mb-2">
                                                                        <h4 className="font-medium text-sm">{task.title}</h4>
                                                                        <Badge className={getDifficultyColor(task.difficulty)} variant="outline">
                                                                            {task.difficulty}
                                                                        </Badge>
                                                                    </div>
                                                                    <p className="text-xs text-muted-foreground mb-2">
                                                                        {task.description[0]}
                                                                    </p>
                                                                    <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
                                                                        <CheckCircle2 className="w-3 h-3" />
                                                                        Completed {task.completedAt ? format(new Date(task.completedAt), 'MMM d, yyyy') : ''}
                                                                    </div>
                                                                </CardContent>
                                                            </Card>
                                                        </motion.div>
                                                    ))
                                                }
                                            </div>
                                        </div>
                                    )
                                }

                                {
                                    data.tasks.inProgress.length > 0 && (
                                        <div>
                                            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                                <Clock className="w-4 h-4 text-yellow-500" />
                                                In Progress ({data.tasks.inProgress.length})
                                            </h3>
                                            <div className="space-y-2">
                                                {
                                                    data.tasks.inProgress.map((task: any) => (
                                                        <Card key={task.id} className="border-yellow-200 dark:border-yellow-900/50 bg-yellow-50/50 dark:bg-yellow-950/20">
                                                            <CardContent className="p-4">
                                                                <div className="flex items-start justify-between gap-2 mb-2">
                                                                    <h4 className="font-medium text-sm">{task.title}</h4>
                                                                    <Badge className={getDifficultyColor(task.difficulty)} variant="outline">
                                                                        {task.difficulty}
                                                                    </Badge>
                                                                </div>
                                                                <p className="text-xs text-muted-foreground">
                                                                    {task.description[0]}
                                                                </p>
                                                            </CardContent>
                                                        </Card>
                                                    ))
                                                }
                                            </div>
                                        </div>
                                    )
                                }
                                {
                                    data.tasks.todo.length > 0 && (
                                        <div>
                                            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                                <Target className="w-4 h-4 text-gray-500" />
                                                To Do ({data.tasks.todo.length})
                                            </h3>
                                            <div className="space-y-2">
                                                {
                                                    data.tasks.todo.map((task: any) => (
                                                        <Card key={task.id} className="bg-neutral-50 dark:bg-neutral-900/50 p-2">
                                                            <CardContent className="p-4">
                                                                <div className="flex items-start justify-between gap-2 mb-2">
                                                                    <h4 className="font-medium text-sm text-muted-foreground">{task.title}</h4>
                                                                    <Badge className={getDifficultyColor(task.difficulty)} variant="outline">
                                                                        {task.difficulty}
                                                                    </Badge>
                                                                </div>
                                                                <p className="text-xs text-muted-foreground">
                                                                    {task.description[0]}
                                                                </p>
                                                            </CardContent>
                                                        </Card>
                                                    ))
                                                }
                                            </div>
                                        </div>
                                    )
                                }
                            </div>
                        </>
                    ) : null
                }
            </SheetContent>
        </Sheet>
    )
}