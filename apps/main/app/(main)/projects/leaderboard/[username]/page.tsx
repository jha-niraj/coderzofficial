import { Suspense } from 'react'
import { auth } from '@repo/auth'
import prisma from '@repo/prisma'
import { UserProfileLeaderboardClient } from './_components/user-profile-leaderboard-client'
import { 
    Card, CardContent, CardDescription, CardHeader, CardTitle 
} from '@repo/ui/components/ui/card'
import { Button } from '@repo/ui/components/ui/button'
import { UserX, ArrowLeft, Users } from 'lucide-react'
import Link from 'next/link'

interface UserProfileLeaderboardPageProps {
    params: Promise<{
        username: string
    }>
}

async function getUserProfile(username: string) {
    const user = await prisma.user.findUnique({
        where: { username },
        select: {
            id: true,
            name: true,
            username: true,
            email: true,
            image: true,
            bio: true,
            credits: true,
            createdAt: true,
            // Get user's project progress
            UserProjectV2Progress: {
                select: {
                    id: true,
                    status: true,
                    progressPercentage: true,
                    tasksCompleted: true,
                    totalTasks: true,
                    startedAt: true,
                    completedAt: true,
                    updatedAt: true,
                    project: {
                        select: {
                            id: true,
                            slug: true,
                            title: true,
                            shortDescription: true,
                            difficulty: true,
                            estimatedHours: true,
                            technologies: true,
                            visibility: true
                        }
                    }
                },
                orderBy: {
                    updatedAt: 'desc'
                }
            },
            // Get recent task completions
            UserTaskV2Status: {
                where: {
                    status: 'COMPLETED'
                },
                select: {
                    id: true,
                    completedAt: true,
                    task: {
                        select: {
                            id: true,
                            title: true,
                            projectId: true,
                            project: {
                                select: {
                                    slug: true,
                                    title: true
                                }
                            }
                        }
                    }
                },
                orderBy: {
                    completedAt: 'desc'
                },
                take: 10
            }
        }
    })

    return user
}

export default async function UserProfileLeaderboardPage({
    params
}: UserProfileLeaderboardPageProps) {
    const session = await auth()
    const { username } = await params;
    const userProfile = await getUserProfile(username)

    // User not found - show friendly error
    if (!userProfile) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white dark:from-neutral-950 dark:to-neutral-900 flex items-center justify-center p-4">
                <Card className="max-w-md w-full">
                    <CardHeader>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                                <UserX className="w-6 h-6 text-red-600 dark:text-red-400" />
                            </div>
                            <CardTitle>User Not Found</CardTitle>
                        </div>
                        <CardDescription>
                            The user profile you're looking for doesn't exist.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <p className="text-sm text-muted-foreground">
                            We couldn't find a user with the username <strong className="text-foreground">@{username}</strong>
                        </p>
                        <div className="bg-neutral-100 dark:bg-neutral-900 rounded-lg p-3 text-sm">
                            <p className="text-muted-foreground">
                                💡 <strong>Tip:</strong> Make sure the username is spelled correctly or try searching for the user from the global leaderboard.
                            </p>
                        </div>
                        <div className="flex gap-2 pt-4">
                            <Link href="/projects/leaderboard" className="flex-1">
                                <Button className="w-full gap-2">
                                    <Users className="w-4 h-4" />
                                    Global Leaderboard
                                </Button>
                            </Link>
                            <Link href="/projects" className="flex-1">
                                <Button variant="outline" className="w-full gap-2">
                                    <ArrowLeft className="w-4 h-4" />
                                    Projects
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    // Calculate stats
    const totalProjects = userProfile.UserProjectV2Progress.length
    const completedProjects = userProfile.UserProjectV2Progress.filter((p: any) => p.status === 'COMPLETED').length
    const inProgressProjects = userProfile.UserProjectV2Progress.filter((p: any) => p.status === 'IN_PROGRESS').length
    const totalTasksCompleted = userProfile.UserProjectV2Progress.reduce((sum: number, p: any) => sum + p.tasksCompleted, 0)

    return (
        <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white dark:from-neutral-950 dark:to-neutral-900">
            <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
                <UserProfileLeaderboardClient
                    userProfile={userProfile}
                    stats={{
                        totalProjects,
                        completedProjects,
                        inProgressProjects,
                        totalTasksCompleted
                    }}
                    currentUserId={session?.user?.id}
                />
            </Suspense>
        </div>
    )
}

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }) {
    const { username } = await params
    const user = await getUserProfile(username)

    if (!user) {
        return {
            title: 'User Not Found | TheCoderz',
            description: 'The requested user profile could not be found'
        }
    }

    return {
        title: `${user.name || user.username} - Progress | TheCoderz`,
        description: `View ${user.name || user.username}'s coding journey and project achievements`
    }
}