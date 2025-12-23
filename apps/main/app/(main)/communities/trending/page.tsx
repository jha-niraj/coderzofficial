import { getServerSession } from '@repo/auth'
import { authOptions } from '@repo/auth'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'
import { TrendingPageClient } from './_components/trending-client'
import { getTrendingPosts } from '@/actions/(main)/community/post.action'
import { getUserCommunities } from '@/actions/(main)/community/community.action'

export const metadata = {
    title: 'Trending | Community',
    description: 'Discover trending posts with the most engagement'
}

export default async function TrendingPage() {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
        redirect('/signin?callbackUrl=/community/trending')
    }

    const [trendingResult, userCommunitiesResult] = await Promise.all([
        getTrendingPosts({ limit: 30 }),
        getUserCommunities()
    ])

    const trendingPosts = trendingResult.success ? trendingResult.data || [] : []
    const userCommunities = userCommunitiesResult.success ? userCommunitiesResult.data || [] : []

    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-white dark:bg-neutral-950">
                <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
            </div>
        }>
            <TrendingPageClient 
                user={{
                    id: session.user.id,
                    name: session.user.name ?? null,
                    image: session.user.image ?? null
                }}
                trendingPosts={trendingPosts}
                userCommunities={userCommunities}
            />
        </Suspense>
    )
}