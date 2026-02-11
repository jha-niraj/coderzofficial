import { getUserPathfinderGoals } from '@/actions/(main)/pathfinder'
import { PathfinderDashboard } from './_components/pathfinder-dashboard'

export const dynamic = 'force-dynamic'

export default async function PathfinderPage() {
    const { goals, groups } = await getUserPathfinderGoals()

    return <PathfinderDashboard initialGoals={goals || []} initialGroups={groups || []} />
}