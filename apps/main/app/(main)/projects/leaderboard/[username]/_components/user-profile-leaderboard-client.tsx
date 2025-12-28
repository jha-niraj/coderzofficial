"use client"

import { motion } from 'framer-motion'
import Link from 'next/link'
import { format } from 'date-fns'
import {
    ArrowLeft, Trophy, Calendar, Target, CheckCircle2, Clock, Sparkles,
    TrendingUp
} from 'lucide-react'
import { Button } from '@repo/ui/components/ui/button'
import {
    Card, CardContent, CardDescription, CardHeader, CardTitle
} from '@repo/ui/components/ui/card'
import { Badge } from '@repo/ui/components/ui/badge'
import {
    Avatar, AvatarFallback, AvatarImage
} from '@repo/ui/components/ui/avatar'
import { Progress } from '@repo/ui/components/ui/progress'

interface Project {
    id: string
    slug: string
    title: string
    shortDescription: string | null
    difficulty: string
    estimatedHours: number | null
    technologies: string[]
    visibility: string
}

interface ProjectProgress {
    id: string
    status: string
    progressPercentage: number
    tasksCompleted: number
    totalTasks: number
    startedAt: Date | null
    completedAt: Date | null
    updatedAt: Date
    project: Project
}

interface TaskProgressEntry {
    id: string
    completedAt: Date | null
    task: {
        id: string
        title: string
        projectId: string
        project: {
            slug: string
            title: string
        }
    }
}

interface UserProfile {
    id: string
    name: string | null
    username: string | null
    email: string
    image: string | null
    bio: string | null
    credits: number
    createdAt: Date
    UserProjectV2Progress: ProjectProgress[]
    UserTaskV2Status: TaskProgressEntry[]
}

interface UserProfileLeaderboardClientProps {
    userProfile: UserProfile
    stats: {
        totalProjects: number
        completedProjects: number
        inProgressProjects: number
        totalTasksCompleted: number
    }
    currentUserId?: string
}

export function UserProfileLeaderboardClient({
    userProfile,
    stats,
    currentUserId
}: UserProfileLeaderboardClientProps) {
    const isOwnProfile = currentUserId === userProfile.id

    const completedProjects = userProfile.UserProjectV2Progress.filter((p) => p.status === 'COMPLETED')
    const inProgressProjects = userProfile.UserProjectV2Progress.filter((p) => p.status === 'IN_PROGRESS')
    const recentTasks = userProfile.UserTaskV2Status

    const difficultyColors = {
        BEGINNER: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
        INTERMEDIATE: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
        ADVANCED: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    }

    return (
        <div className="container max-w-7xl mx-auto px-4 py-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <Link
                    href="/projects/leaderboard"
                    className="inline-flex items-center gap-2 px-4 py-2 mb-6 bg-neutral-100 dark:bg-neutral-900 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Global Leaderboard
                </Link>
                <Card className="mb-8 p-6">
                    <div className="flex items-start gap-6">
                        <Avatar className="w-24 h-24">
                            <AvatarImage src={userProfile.image} alt={userProfile.name} />
                            <AvatarFallback className="text-2xl">{userProfile.name?.[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h1 className="text-3xl font-bold mb-1">{userProfile.name}</h1>
                                    <p className="text-lg text-muted-foreground mb-2">@{userProfile.username}</p>
                                    {
                                        userProfile.bio && (
                                            <p className="text-neutral-600 dark:text-neutral-400 max-w-2xl">{userProfile.bio}</p>
                                        )
                                    }
                                </div>
                                {
                                    isOwnProfile && (
                                        <Badge variant="secondary" className="gap-1">
                                            <Sparkles className="w-3 h-3" />
                                            Your Profile
                                        </Badge>
                                    )
                                }
                            </div>
                            <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    <span>Joined {format(new Date(userProfile.createdAt), 'MMM yyyy')}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <Card className="p-4">
                        <CardContent className="pt-0 px-0">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                    <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">{stats.totalProjects}</p>
                                    <p className="text-xs text-muted-foreground">Total Projects</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="p-4">
                        <CardContent className="pt-0 px-0">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                    <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">{stats.completedProjects}</p>
                                    <p className="text-xs text-muted-foreground">Completed</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="p-4">
                        <CardContent className="pt-0 px-0">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                                    <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">{stats.inProgressProjects}</p>
                                    <p className="text-xs text-muted-foreground">In Progress</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="p-4">
                        <CardContent className="pt-0 px-0">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                                    <Trophy className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">{stats.totalTasksCompleted}</p>
                                    <p className="text-xs text-muted-foreground">Tasks Done</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="p-6">
                        <CardHeader className="px-0 pt-0">
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="w-5 h-5" />
                                Recent Activity
                            </CardTitle>
                            <CardDescription>Latest tasks completed</CardDescription>
                        </CardHeader>
                        <CardContent className="px-0 pb-0">
                            {
                                recentTasks.length === 0 ? (
                                    <p className="text-sm text-muted-foreground py-4">No tasks completed yet</p>
                                ) : (
                                    <div className="space-y-3">
                                        {
                                            recentTasks.map((taskProgress) => (
                                                <div key={taskProgress.id} className="flex items-start gap-3 p-3 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
                                                    <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium truncate">{taskProgress.task.title}</p>
                                                        <p className="text-xs text-muted-foreground">{taskProgress.task.project.title}</p>
                                                    </div>
                                                    <span className="text-xs text-muted-foreground flex-shrink-0">
                                                        {format(new Date(taskProgress.completedAt), 'MMM d')}
                                                    </span>
                                                </div>
                                            ))
                                        }
                                    </div>
                                )
                            }
                        </CardContent>
                    </Card>
                    <Card className="p-6">
                        <CardHeader className="px-0 pt-0">
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="w-5 h-5" />
                                Ongoing Projects
                            </CardTitle>
                            <CardDescription>Currently working on</CardDescription>
                        </CardHeader>
                        <CardContent className="px-0 pb-0">
                            {
                                inProgressProjects.length === 0 ? (
                                    <p className="text-sm text-muted-foreground py-4">No ongoing projects</p>
                                ) : (
                                    <div className="space-y-4">
                                        {
                                            inProgressProjects.map((progress) => (
                                                <div key={progress.id} className="p-4 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
                                                    <div className="flex items-start justify-between mb-2">
                                                        <div className="flex-1">
                                                            <h4 className="font-medium mb-1">{progress.project.title}</h4>
                                                            <Badge className={`${difficultyColors[progress.project.difficulty as keyof typeof difficultyColors]} text-xs mb-2`}>
                                                                {progress.project.difficulty}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <div className="flex justify-between text-xs text-muted-foreground">
                                                            <span>{progress.tasksCompleted}/{progress.totalTasks} tasks</span>
                                                            <span>{Math.round(progress.progressPercentage)}%</span>
                                                        </div>
                                                        <Progress value={progress.progressPercentage} className="h-2" />
                                                    </div>
                                                    <Link href={`/projects/${progress.project.slug}/leaderboard?username=${userProfile.username}&showProgress=true`}>
                                                        <Button variant="outline" size="sm" className="w-full mt-3">
                                                            View Progress
                                                        </Button>
                                                    </Link>
                                                </div>
                                            ))
                                        }
                                    </div>
                                )
                            }
                        </CardContent>
                    </Card>
                </div>
                {
                    completedProjects.length > 0 && (
                        <Card className="mt-6 p-6">
                            <CardHeader className="px-0 pt-0">
                                <CardTitle className="flex items-center gap-2">
                                    <Trophy className="w-5 h-5" />
                                    Completed Projects
                                </CardTitle>
                                <CardDescription>Successfully finished projects</CardDescription>
                            </CardHeader>
                            <CardContent className="px-0 pb-0">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {
                                        completedProjects.map((progress) => (
                                            <Card key={progress.id} className="p-4">
                                                <div className="flex items-start justify-between mb-2">
                                                    <div className="flex-1">
                                                        <h4 className="font-medium mb-1 line-clamp-1">{progress.project.title}</h4>
                                                        <Badge className={`${difficultyColors[progress.project.difficulty as keyof typeof difficultyColors]} text-xs`}>
                                                            {progress.project.difficulty}
                                                        </Badge>
                                                    </div>
                                                    <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                                                </div>
                                                {
                                                    progress.project.shortDescription && (
                                                        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                                                            {progress.project.shortDescription}
                                                        </p>
                                                    )
                                                }
                                                <div className="flex gap-1 flex-wrap mb-3">
                                                    {
                                                        progress.project.technologies.slice(0, 3).map((tech: string) => (
                                                            <Badge key={tech} variant="secondary" className="text-xs">
                                                                {tech}
                                                            </Badge>
                                                        ))
                                                    }
                                                    {
                                                        progress.project.technologies.length > 3 && (
                                                            <Badge variant="secondary" className="text-xs">
                                                                +{progress.project.technologies.length - 3}
                                                            </Badge>
                                                        )
                                                    }
                                                </div>
                                                {
                                                    progress.completedAt && (
                                                        <p className="text-xs text-muted-foreground">
                                                            Completed {format(new Date(progress.completedAt), 'MMM d, yyyy')}
                                                        </p>
                                                    )
                                                }
                                            </Card>
                                        ))
                                    }
                                </div>
                            </CardContent>
                        </Card>
                    )
                }
            </motion.div>
        </div>
    )
}