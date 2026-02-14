import { getPathfinderGoal, getOrCreateDailySession } from '@/actions/(main)/pathfinder'
import { DailyPracticeView } from './_components/daily-practice-view'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

interface PageProps {
    params: Promise<{ slug: string }>
}

export default async function GoalDetailsPage({ params }: PageProps) {
    const { slug } = await params
    const { goal, success } = await getPathfinderGoal(slug)

    if (!success || !goal) {
        notFound()
    }

    const { session } = await getOrCreateDailySession(goal.id)

    return (
        <DailyPracticeView
            goal={goal}
            initialSession={session ?? null}
        />
    )
}