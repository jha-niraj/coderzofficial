import { 
    getPathfinderGoal, getOrCreateDailySession 
} from '@/actions/(main)/pathfinder'
import { notFound } from 'next/navigation'
import { DailyPracticeView } from './_components/daily-practice-view'

export const dynamic = 'force-dynamic'

interface Props {
    params: Promise<{ slug: string }>
}

export default async function DailyPracticePage({ params }: Props) {
    const { slug } = await params
    
    const { goal } = await getPathfinderGoal(slug)
    
    if (!goal) {
        notFound()
    }

    // Get or create today's session
    const { session } = await getOrCreateDailySession(goal.id)

    return (
        <DailyPracticeView 
            goal={goal}
            initialSession={session ?? null}
        />
    )
}