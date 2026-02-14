import { getPathfinderGoal } from '@/actions/(main)/pathfinder'
import { GoalDetailsContent } from './_components/goal-details-content'
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

    return <GoalDetailsContent goal={goal} />
}