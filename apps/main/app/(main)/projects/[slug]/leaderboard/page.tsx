import { Suspense } from 'react'
import { notFound, redirect } from 'next/navigation'
import { auth } from '@repo/auth'
import prisma from '@/lib/prisma'
import { ProjectLeaderboardClient } from './_components/project-leaderboard-client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui/components/ui/card'
import { Button } from '@repo/ui/components/ui/button'
import { AlertCircle, Lock, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface ProjectLeaderboardPageProps {
    params: Promise<{
        slug: string
    }>
    searchParams: Promise<{
        page?: string
        username?: string
        showProgress?: string
    }>
}

async function getProjectData(slug: string) {
    const project = await prisma.projectV2.findUnique({
        where: { slug },
        select: {
            id: true,
            slug: true,
            title: true,
            shortDescription: true,
            visibility: true,
            difficulty: true,
            technologies: true,
            totalStarted: true,
            totalCompleted: true,
            creator: {
                select: {
                    id: true,
                    name: true,
                    username: true,
                    image: true
                }
            }
        }
    })

    return project
}

export default async function ProjectLeaderboardPage({
    params,
    searchParams
}: ProjectLeaderboardPageProps) {
    const session = await auth()
    const { slug } = await params
    const project = await getProjectData(slug)

    // Project not found - show friendly error
    if (!project) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <Card className="max-w-md w-full bg-gradient-to-b from-neutral-50 to-white dark:from-neutral-950 dark:to-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl flex items-center justify-center p-4">
                    <CardHeader>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                                <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                            </div>
                            <CardTitle>Project Not Found</CardTitle>
                        </div>
                        <CardDescription>
                            The project you're looking for doesn't exist or may have been removed.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <p className="text-sm text-muted-foreground">
                            This could happen if:
                        </p>
                        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-2">
                            <li>The project URL is incorrect</li>
                            <li>The project has been deleted</li>
                            <li>You don't have access to this project</li>
                        </ul>
                        <div className="pt-4">
                            <Link href="/projects">
                                <Button className="w-full gap-2">
                                    <ArrowLeft className="w-4 h-4" />
                                    Back to Projects
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    // Private project - show access denied message
    if (project.visibility !== 'PUBLIC') {
        return (
            <div className="min-h-screen w-full flex items-center justify-center p-4">
                <Card className="max-w-md w-full bg-gradient-to-b from-neutral-50 to-white dark:from-neutral-950 dark:to-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl flex items-center justify-center p-4">
                    <CardHeader className="flex items-center justify-center">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                                <Lock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                            </div>
                            <CardTitle>Private Project</CardTitle>
                        </div>
                        <CardDescription>
                            This project's leaderboard is not publicly available.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <p className="text-sm text-muted-foreground">
                            <strong>{project.title}</strong> is a private project. Only public projects have leaderboards.
                        </p>
                        <div className="bg-neutral-100 dark:bg-neutral-900 rounded-lg p-3 text-sm">
                            <p className="text-muted-foreground">
                                💡 <strong>Tip:</strong> You can still work on this project if you have access. Check the project details page.
                            </p>
                        </div>
                        <div className="flex gap-2 pt-4">
                            <Link href={`/projects/${slug}`} className="flex-1">
                                <Button variant="outline" className="w-full gap-2">
                                    View Project
                                </Button>
                            </Link>
                            <Link href="/projects" className="flex-1">
                                <Button className="w-full gap-2">
                                    <ArrowLeft className="w-4 h-4" />
                                    All Projects
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const { page, username: autoOpenUsername, showProgress } = await searchParams
    const currentPage = parseInt(page || '1')
    const autoOpenSheet = showProgress === 'true'

    return (
        <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white dark:from-neutral-950 dark:to-neutral-900">
            <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
                <ProjectLeaderboardClient
                    project={project}
                    currentPage={currentPage}
                    autoOpenUsername={autoOpenUsername}
                    autoOpenSheet={autoOpenSheet}
                    currentUserId={session?.user?.id}
                />
            </Suspense>
        </div>
    )
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const project = await getProjectData(slug)

    if (!project) {
        return {
            title: 'Project Not Found | TheCoderz',
            description: 'The requested project could not be found'
        }
    }

    return {
        title: `${project.title} - Leaderboard | TheCoderz`,
        description: `View the leaderboard and top performers for ${project.title}`
    }
}