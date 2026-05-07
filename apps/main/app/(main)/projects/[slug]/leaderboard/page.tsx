import { Suspense } from 'react'
import { getSession } from '@repo/auth'
import { headers } from 'next/headers'
import { db, projectsV2, users } from '@repo/db'
import { eq } from 'drizzle-orm'
import { ProjectLeaderboardClient } from './_components/project-leaderboard-client'
import {
    Card, CardContent, CardDescription, CardHeader, CardTitle
} from '@repo/ui/components/ui/card'
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
    const rows = await db
        .select({
            id: projectsV2.id,
            slug: projectsV2.slug,
            title: projectsV2.title,
            shortDescription: projectsV2.shortDescription,
            visibility: projectsV2.visibility,
            difficulty: projectsV2.difficulty,
            technologies: projectsV2.technologies,
            totalStarted: projectsV2.totalStarted,
            totalCompleted: projectsV2.totalCompleted,
            createdBy: projectsV2.createdBy,
            creatorId: users.id,
            creatorName: users.name,
            creatorUsername: users.username,
            creatorImage: users.image,
        })
        .from(projectsV2)
        .innerJoin(users, eq(projectsV2.createdBy, users.id))
        .where(eq(projectsV2.slug, slug))
        .limit(1)

    if (!rows[0]) return null

    const row = rows[0]
    return {
        id: row.id,
        slug: row.slug,
        title: row.title,
        shortDescription: row.shortDescription,
        visibility: row.visibility,
        difficulty: row.difficulty,
        technologies: row.technologies,
        totalStarted: row.totalStarted,
        totalCompleted: row.totalCompleted,
        creator: {
            id: row.creatorId,
            name: row.creatorName,
            username: row.creatorUsername,
            image: row.creatorImage,
        },
    }
}

export default async function ProjectLeaderboardPage({
    params,
    searchParams
}: ProjectLeaderboardPageProps) {
    const session = await getSession(headers())
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
                            The project you&apos;re looking for doesn&apos;t exist or may have been removed.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <p className="text-sm text-muted-foreground">
                            This could happen if:
                        </p>
                        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-2">
                            <li>The project URL is incorrect</li>
                            <li>The project has been deleted</li>
                            <li>You don&apos;t have access to this project</li>
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
                            This project&apos;s leaderboard is not publicly available.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <p className="text-sm text-muted-foreground">
                            <strong>{project.title}</strong> is a private project. Only public projects have leaderboards.
                        </p>
                        <div className="bg-neutral-100 dark:bg-neutral-900 rounded-lg p-3 text-sm">
                            <p className="text-muted-foreground">
                                Tip: You can still work on this project if you have access. Check the project details page.
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
