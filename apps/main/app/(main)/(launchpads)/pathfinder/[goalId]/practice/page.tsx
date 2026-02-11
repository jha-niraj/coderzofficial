import { getPathfinderGoal, getOrCreateDailySession } from '@/actions/(main)/pathfinder'
import { notFound } from 'next/navigation'
import { DailyPracticeView } from './_components/daily-practice-view'

export const dynamic = 'force-dynamic'

interface Props {
    params: Promise<{ goalId: string }>
}

export default async function DailyPracticePage({ params }: Props) {
    const { goalId } = await params
    
    const { goal } = await getPathfinderGoal(goalId)
    
    if (!goal) {
        notFound()
    }

    // Get or create today's session
    const { session } = await getOrCreateDailySession(goalId)

    return (
        <DailyPracticeView 
            goal={goal}
            initialSession={session ?? null}
        />
    )
}
