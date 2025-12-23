import { getServerSession } from 'next-auth'
import { authOptions } from '@/auth'
import { getCrucibleProblem } from '@/actions/(main)/challenges/crucible.action'
import { notFound, redirect } from 'next/navigation'
import { CrucibleProblemClient } from './_components/crucible-problem-client'

interface Props {
    params: Promise<{ slug: string; dayNumber: string }>
}

export async function generateMetadata({ params }: Props) {
    const { slug, dayNumber } = await params
    const result = await getCrucibleProblem(slug, parseInt(dayNumber))
    
    if (!result.success || !result.data) {
        return { title: 'Problem Not Found | The Coderz' }
    }

    return {
        title: `Day ${dayNumber}: ${result.data.title} | The Crucible | The Coderz`,
        description: `Solve Day ${dayNumber} of ${result.event?.name}`
    }
}

export default async function CrucibleProblemPage({ params }: Props) {
    const { slug, dayNumber } = await params
    const session = await getServerSession(authOptions)
    
    // If not logged in, redirect to sign in
    if (!session?.user?.id) {
        redirect('/signin')
    }

    const result = await getCrucibleProblem(slug, parseInt(dayNumber))

    if (!result.success || !result.data) {
        if (result.error === 'Problem is locked') {
            // Could show a locked page instead
            redirect(`/challenges/crucible/${slug}`)
        }
        notFound()
    }

    return (
        <CrucibleProblemClient
            problem={result.data}
            event={result.event!}
            userInput={result.userInput}
            submissions={result.submissions}
            isSolved={result.isSolved || false}
            user={{
                id: session.user.id,
                name: session.user.name || null,
                image: session.user.image ?? null
            }}
        />
    )
}


