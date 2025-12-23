import { getServerSession } from '@repo/auth'
import { authOptions } from '@repo/auth'
import { getCrucibleEventBySlug } from '@/actions/(main)/challenges/crucible.action'
import { notFound } from 'next/navigation'
import { CrucibleEventClient } from './_components/crucible-event-client'

interface Props {
    params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props) {
    const { slug } = await params
    const result = await getCrucibleEventBySlug(slug)
    
    if (!result.success || !result.data) {
        return { title: 'Event Not Found | The Coderz' }
    }

    return {
        title: `${result.data.name} | The Crucible | The Coderz`,
        description: result.data.shortDescription || result.data.description
    }
}

export default async function CrucibleEventPage({ params }: Props) {
    const { slug } = await params
    const session = await getServerSession(authOptions)
    
    const result = await getCrucibleEventBySlug(slug)

    if (!result.success || !result.data) {
        notFound()
    }

    return (
        <CrucibleEventClient
            event={result.data}
            participation={result.participation}
            problemProgress={result.problemProgress}
            user={session?.user ? {
                id: session.user.id,
                name: session.user.name || null,
                image: session.user.image ?? null
            } : null}
        />
    )
}


