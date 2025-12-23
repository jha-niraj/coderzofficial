import { getServerSession } from '@repo/auth'
import { authOptions } from '@repo/auth'
import { getForgeTrackBySlug } from '@/actions/(main)/challenges/forge.action'
import { notFound } from 'next/navigation'
import { ForgeTrackClient } from './_components/forge-track-client'
import { prisma } from '@/lib/prisma'

interface Props {
    params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props) {
    const { slug } = await params
    const result = await getForgeTrackBySlug(slug)
    
    if (!result.success || !result.data) {
        return { title: 'Track Not Found | The Coderz' }
    }

    return {
        title: `${result.data.name} | The Forge | The Coderz`,
        description: result.data.shortDescription || result.data.description
    }
}

export default async function ForgeTrackPage({ params }: Props) {
    const { slug } = await params
    const session = await getServerSession(authOptions)
    
    const result = await getForgeTrackBySlug(slug)

    if (!result.success || !result.data) {
        notFound()
    }

    // Get user credits
    let userCredits = 0
    if (session?.user?.id) {
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { credits: true }
        })
        userCredits = user?.credits || 0
    }

    return (
        <ForgeTrackClient
            track={result.data}
            enrollment={result.enrollment}
            stepProgress={result.stepProgress}
            user={session?.user ? {
                id: session.user.id,
                name: session.user.name || null,
                image: session.user.image ?? null,
                credits: userCredits
            } : null}
        />
    )
}


