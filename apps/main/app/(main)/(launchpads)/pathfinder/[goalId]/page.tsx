import { getPathfinderGoal } from '@/actions/(main)/pathfinder'
import { GoalDetailsContent } from './_components/goal-details-content'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

interface PageProps {
    params: Promise<{ goalId: string }>
}

export default async function GoalDetailsPage({ params }: PageProps) {
    const { goalId } = await params
    const { goal, success } = await getPathfinderGoal(goalId)

    if (!success || !goal) {
        notFound()
    }

    return <GoalDetailsContent goal={goal} />
}