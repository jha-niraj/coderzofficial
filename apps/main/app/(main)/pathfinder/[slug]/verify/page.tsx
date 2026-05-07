import { 
    getPathfinderGoal, getVerificationStatus 
} from '@/actions/(main)/pathfinder'
import { VerificationPageClient } from './_components/verification-page-client'
import { notFound } from 'next/navigation'
import type { PathfinderVerification } from '@repo/db'

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

    return (
        <VerificationPageClient
            goal={goal}
            verification={verification as PathfinderVerification | null}
        />
    )
}