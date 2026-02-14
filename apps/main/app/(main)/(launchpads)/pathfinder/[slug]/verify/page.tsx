import { 
    getPathfinderGoal, getVerificationStatus 
} from '@/actions/(main)/pathfinder'
import { VerificationContent } from './_components/verification-content'
import { notFound, redirect } from 'next/navigation'
import type { PathfinderVerification } from '@repo/prisma/client'

export const dynamic = 'force-dynamic'

interface PageProps {
    params: Promise<{ slug: string }>
}

export default async function VerificationPage({ params }: PageProps) {
    const { slug } = await params
    const [{ goal }, { verification }] = await Promise.all([
        getPathfinderGoal(slug),
        getVerificationStatus(slug)
    ])

    if (!goal) {
        notFound()
    }

    // If not in verification status, redirect back
    if (goal.status !== 'VERIFICATION' && goal.status !== 'COMPLETED') {
        redirect(`/pathfinder/${slug}`)
    }

    return (
        <VerificationContent
            goal={goal}
            verification={verification as PathfinderVerification | null}
        />
    )
}