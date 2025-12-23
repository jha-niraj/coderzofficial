import { getServerSession } from '@repo/auth'
import { authOptions } from '@repo/auth'
import { getForgeStep } from '@/actions/(main)/challenges/forge.action'
import { notFound, redirect } from 'next/navigation'
import { ForgeStepClient } from './_components/forge-step-client'

interface Props {
    params: Promise<{ slug: string; stepNumber: string }>
}

export async function generateMetadata({ params }: Props) {
    const { slug, stepNumber } = await params
    const result = await getForgeStep(slug, parseInt(stepNumber))
    
    if (!result.success || !result.data) {
        return { title: 'Step Not Found | The Coderz' }
    }

    return {
        title: `Step ${stepNumber}: ${result.data.title} | The Forge | The Coderz`,
        description: `Complete Step ${stepNumber} of ${result.data.track.name}`
    }
}

export default async function ForgeStepPage({ params }: Props) {
    const { slug, stepNumber } = await params
    const session = await getServerSession(authOptions)
    
    const result = await getForgeStep(slug, parseInt(stepNumber))

    if (!result.success || !result.data) {
        notFound()
    }

    // If not enrolled, redirect to track page
    if (!result.isEnrolled && session?.user?.id) {
        redirect(`/challenges/forge/${slug}`)
    }

    // If not logged in, redirect to sign in
    if (!session?.user?.id) {
        redirect('/signin')
    }

    return (
        <ForgeStepClient
            step={result.data}
            submissions={result.submissions}
            user={{
                id: session.user.id,
                name: session.user.name || null,
                image: session.user.image ?? null
            }}
        />
    )
}


