import { auth } from '@repo/auth'
import { redirect } from 'next/navigation'
import { getUserAchievements } from '@/actions/(main)/achievements/achievements.action'
import { AchievementsContent } from './_components/achievements-content'

export const metadata = {
    title: 'Achievements | Coderz',
    description: 'Track your progress, earn badges, and showcase your achievements',
}

export default async function AchievementsPage() {
    const session = await auth()
    
    if (!session?.user) {
        redirect('/login')
    }

    const result = await getUserAchievements()

    if (!result.success) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p className="text-neutral-500">Failed to load achievements</p>
            </div>
        )
    }

    return (
        <AchievementsContent
            badges={result.badges!}
            stats={result.stats!}
            levelInfo={result.levelInfo!}
            socialConnections={result.socialConnections!}
            levels={result.levels!}
        />
    )
}
