import { Suspense } from 'react'
import { auth } from '@/auth'
import { GlobalLeaderboardClient } from './_components/globalleaderboardclient'

interface GlobalLeaderboardPageProps {
    searchParams: Promise<{
        page?: string
    }>
}

export default async function GlobalLeaderboardPage({
    searchParams
}: GlobalLeaderboardPageProps) {
    const session = await auth()
    const resolvedSearchParams = await searchParams
    const currentPage = parseInt(resolvedSearchParams.page || '1')

    return (
        <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white dark:from-neutral-950 dark:to-neutral-900">
            <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
                <GlobalLeaderboardClient
                    currentPage={currentPage}
                    currentUserId={session?.user?.id}
                />
            </Suspense>
        </div>
    )
}

export const metadata = {
    title: 'Projects Leaderboard | TheCoderz',
    description: 'View top performers across all projects and challenges'
}