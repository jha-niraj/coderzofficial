import { Suspense } from 'react'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/auth'
import { redirect } from 'next/navigation'
import { CommunityHubClient } from './_components/community-hub-client'
import {
    getUserCommunities, getPublicCommunities, getFeaturedCommunities
} from '@/actions/(main)/community/community.action'
import { getGlobalFeed } from '@/actions/(main)/community/post.action'
import { Loader2 } from 'lucide-react'

export const metadata = {
    title: 'Communities | The Coder&apos;z',
    description: 'Connect with fellow developers, share knowledge, and grow together'
}

export default async function CommunityPage() {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
        redirect('/signin?callbackUrl=/community')
    }

    // Fetch initial data in parallel
    const [
        userCommunitiesResult,
        featuredCommunitiesResult,
        globalFeedResult
    ] = await Promise.all([
        getUserCommunities(),
        getFeaturedCommunities(4),
        getGlobalFeed({ limit: 20 })
    ])

    const userCommunities = userCommunitiesResult.success ? userCommunitiesResult.data || [] : []
    const featuredCommunities = featuredCommunitiesResult.success ? featuredCommunitiesResult.data || [] : []
    const initialPosts = globalFeedResult.success ? globalFeedResult.data || [] : []
    const nextCursor = globalFeedResult.success ? globalFeedResult.nextCursor : undefined

    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-white dark:bg-neutral-950">
                <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
            </div>
        }>
            <CommunityHubClient
                user={{
                    id: session.user.id,
                    name: session.user.name ?? null,
                    image: session.user.image ?? null
                }}
                userCommunities={userCommunities}
                featuredCommunities={featuredCommunities}
                initialPosts={initialPosts}
                initialNextCursor={nextCursor}
            />
        </Suspense>
    )
}