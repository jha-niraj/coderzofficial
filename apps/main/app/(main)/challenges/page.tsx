import { getServerSession } from '@repo/auth'
import { authOptions } from '@repo/auth'
import { 
    getAllForgeTracks, getUserForgeProgress 
} from '@/actions/(main)/challenges/forge.action'
import { getAllCrucibleEvents } from '@/actions/(main)/challenges/crucible.action'
import { ChallengesHubClient } from './_components/challenges-hub-client'

export const metadata = {
    title: 'Challenges | The Coderz',
    description: 'Master technologies and sharpen your logic through hands-on challenges'
}

export default async function ChallengesPage() {
    const session = await getServerSession(authOptions)
    
    const [forgeTracksResult, crucibleEventsResult, userProgressResult] = await Promise.all([
        getAllForgeTracks({ status: 'PUBLISHED' }),
        getAllCrucibleEvents(),
        session?.user?.id ? getUserForgeProgress() : Promise.resolve({ success: false, data: { enrollments: [], completions: [] } })
    ])

    return (
        <ChallengesHubClient
            user={session?.user ? {
                id: session.user.id,
                name: session.user.name || null,
                image: session.user.image ?? null
            } : null}
            forgeTracks={forgeTracksResult.success ? forgeTracksResult.data || [] : []}
            crucibleEvents={crucibleEventsResult.success ? crucibleEventsResult.data || [] : []}
            userProgress={userProgressResult.success ? userProgressResult.data || { enrollments: [], completions: [] } : { enrollments: [], completions: [] }}
        />
    )
}