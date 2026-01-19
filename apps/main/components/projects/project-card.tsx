'use client'

import {
    Card, CardContent, CardFooter, CardHeader
} from '@repo/ui/components/ui/card'
import { Badge } from '@repo/ui/components/ui/badge'
import { Button } from '@repo/ui/components/ui/button'
import {
    Clock, Users, Eye, Trophy, Brain, CheckCircle2, Play
} from 'lucide-react'
import Link from 'next/link'
import { Progress } from '@repo/ui/components/ui/progress'
import { Skeleton } from '@repo/ui/components/ui/skeleton'

interface ProjectCardProps {
    project: {
        id: string
        slug: string
        title: string
        shortDescription?: string | null
        description: string
        technologies: string[]
        difficulty: string
        estimatedHours: number
        totalViews?: number
        includeAssessment?: boolean
        creator?: {
            name?: string | null
            username?: string | null
            image?: string | null
        }
        progress?: Array<{
            status: string
            progressPercentage: number
            tasksCompleted: number
            totalTasks: number
        }>
        submissions?: Array<{
            id: string
            githubUrl: string
            liveUrl?: string | null
        }>
        _count?: {
            submissions: number
            progress: number
        }
    }
    showProgress?: boolean
    variant?: 'default' | 'compact'
}

const difficultyColors = {
    BEGINNER: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    INTERMEDIATE: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    ADVANCED: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
}

const statusColors = {
    NOT_STARTED: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
    IN_PROGRESS: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    COMPLETED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    SUBMITTED: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
}

export function ProjectCard({ project, showProgress = false }: ProjectCardProps) {
    const description = project.shortDescription || project.description
    const truncatedDescription = description?.length > 120 ? description.substring(0, 120) + '...' : description

    const userProgress = project.progress?.[0]
    const hasStarted = userProgress && userProgress.status !== 'NOT_STARTED'

    return (
        <Card className="h-full flex flex-col bg-white dark:bg-neutral-900 p-3 shadow-2xl rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all duration-300">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2 mb-2">
                    <Badge className={`${difficultyColors[project.difficulty as keyof typeof difficultyColors]} text-xs px-2 py-1`}>
                        {project.difficulty}
                    </Badge>
                    <div className="flex flex-wrap gap-1 justify-end">
                        {
                            project.technologies.slice(0, 2).map((tech) => (
                                <Badge key={tech} variant="outline" className="text-xs">
                                    {tech}
                                </Badge>
                            ))
                        }
                        {
                            project.technologies.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                    +{project.technologies.length - 2}
                                </Badge>
                            )
                        }
                    </div>
                </div>
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white line-clamp-2 leading-tight">
                    {project.title}
                </h3>
                {
                    showProgress && userProgress && (
                        <Badge className={`${statusColors[userProgress.status as keyof typeof statusColors]} text-xs w-fit mt-2`}>
                            {userProgress.status.replace('_', ' ')}
                        </Badge>
                    )
                }
            </CardHeader>
            <CardContent className="pb-3 flex-grow space-y-4">
                <p className="text-sm text-left text-neutral-600 dark:text-neutral-400 line-clamp-2">
                    {truncatedDescription}
                </p>
                {
                    showProgress && userProgress && hasStarted && (
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs">
                                <span className="text-neutral-600 dark:text-neutral-400">Progress</span>
                                <span className="text-neutral-900 dark:text-white font-medium">
                                    {userProgress.tasksCompleted}/{userProgress.totalTasks} tasks
                                </span>
                            </div>
                            <Progress value={userProgress.progressPercentage} className="h-2" />
                        </div>
                    )
                }
                <div className="flex items-center gap-4 text-xs text-neutral-600 dark:text-neutral-400">
                    <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{project.estimatedHours}h</span>
                    </div>
                    {
                        project._count && (
                            <div className="flex items-center gap-1">
                                <Users className="w-3.5 h-3.5" />
                                <span>{project._count.progress} enrolled</span>
                            </div>
                        )
                    }
                    {
                        project.totalViews !== undefined && (
                            <div className="flex items-center gap-1">
                                <Eye className="w-3.5 h-3.5" />
                                <span>{project.totalViews}</span>
                            </div>
                        )
                    }
                    {
                        project.includeAssessment && (
                            <div className="flex items-center gap-1">
                                <Brain className="w-3.5 h-3.5" />
                                <span>AI</span>
                            </div>
                        )
                    }
                </div>
            </CardContent>
            <CardFooter className="pt-3 border-t border-neutral-200 dark:border-neutral-800">
                <div className="w-full flex gap-2">
                    <Link href={`/projects/${project.slug}`} className="flex-1">
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full rounded-xl border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                        >
                            <Eye className="w-4 h-4 mr-2" />
                            View
                        </Button>
                    </Link>
                    {
                        showProgress && userProgress && (
                            <>
                                {
                                    userProgress.status === 'IN_PROGRESS' && (
                                        <Link href={`/projects/${project.slug}/sprints`} className="flex-1">
                                            <Button size="sm" className="w-full bg-black text-white dark:bg-white dark:text-black hover:opacity-90 rounded-xl">
                                                <Play className="w-4 h-4 mr-2" />
                                                Continue
                                            </Button>
                                        </Link>
                                    )
                                }
                                {
                                    userProgress.status === 'COMPLETED' && !project.submissions?.length && (
                                        <Link href={`/projects/${project.slug}/submit`} className="flex-1">
                                            <Button size="sm" className="w-full bg-black text-white dark:bg-white dark:text-black hover:opacity-90 rounded-xl">
                                                <Trophy className="w-4 h-4 mr-2" />
                                                Submit
                                            </Button>
                                        </Link>
                                    )
                                }
                                {
                                    userProgress.status === 'SUBMITTED' && (
                                        <Button size="sm" disabled className="flex-1 rounded-xl">
                                            <CheckCircle2 className="w-4 h-4 mr-2" />
                                            Submitted
                                        </Button>
                                    )
                                }
                            </>
                        )
                    }
                </div>
            </CardFooter>
        </Card>
    )
}

export function ProjectCardSkeleton() {
    return (
        <Card className="h-full flex flex-col bg-white dark:bg-neutral-900 p-3 shadow-2xl rounded-xl border border-neutral-200 dark:border-neutral-800">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2 mb-2">
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <div className="flex flex-wrap gap-1 justify-end">
                        <Skeleton className="h-6 w-16 rounded-full" />
                        <Skeleton className="h-6 w-16 rounded-full" />
                    </div>
                </div>
                <Skeleton className="h-6 w-full mb-2" />
                <Skeleton className="h-6 w-3/4" />
            </CardHeader>
            <CardContent className="pb-3 flex-grow space-y-4">
                <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                </div>
                <div className="flex items-center gap-4">
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-14" />
                </div>
            </CardContent>
            <CardFooter className="pt-3 border-t border-neutral-200 dark:border-neutral-800">
                <div className="w-full flex gap-2">
                    <Skeleton className="h-9 flex-1 rounded-xl" />
                </div>
            </CardFooter>
        </Card>
    )
}