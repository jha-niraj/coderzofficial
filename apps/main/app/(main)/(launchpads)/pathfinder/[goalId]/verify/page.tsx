import { getPathfinderGoal, getVerificationStatus } from '@/actions/(main)/pathfinder'
import { VerificationContent } from './_components/verification-content'
import { notFound, redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

interface PageProps {
    params: Promise<{ goalId: string }>
}

export default async function VerificationPage({ params }: PageProps) {
    const { goalId } = await params
    const [{ goal }, { verification }] = await Promise.all([
        getPathfinderGoal(goalId),
        getVerificationStatus(goalId)
    ])

    if (!goal) {
        notFound()
    }

    // If not in verification status, redirect back
    if (goal.status !== 'VERIFICATION' && goal.status !== 'COMPLETED') {
        redirect(`/pathfinder/${goalId}`)
    }

    return <VerificationContent goal={goal} verification={verification} />
}
