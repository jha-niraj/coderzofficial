import { Suspense } from 'react'
import { getServerSession } from '@repo/auth'
import { authOptions } from '@repo/auth'
import { notFound } from 'next/navigation'
import { CommunityPageClient } from './_components/community-page-client'
import { 
    getCommunityBySlug, getCommunityMembers 
} from '@/actions/(main)/community/community.action'
import { getCommunityPosts } from '@/actions/(main)/community/post.action'
import { getCommunityResources } from '@/actions/(main)/community/resource.action'
import { 
    Loader2 
} from 'lucide-react'

interface CommunityPageProps {
    params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: CommunityPageProps) {
    const { slug } = await params
    const result = await getCommunityBySlug(slug)
    
    if (!result.success || !result.data) {
        return { title: 'Community Not Found' }
    }
    
    return {
        title: `${result.data.name} | Community`,
        description: result.data.shortDescription || result.data.description
    }
}

export default async function CommunityPage({ params }: CommunityPageProps) {
    const { slug } = await params
    const session = await getServerSession(authOptions)

    // Fetch community data
    const communityResult = await getCommunityBySlug(slug)
    
    if (!communityResult.success || !communityResult.data) {
        notFound()
    }

    const community = communityResult.data

    // Fetch additional data in parallel
    const [postsResult, resourcesResult, membersResult] = await Promise.all([
        getCommunityPosts(community.id, { limit: 20 }),
        getCommunityResources(community.id, { limit: 10 }),
        getCommunityMembers(community.id, { limit: 10 })
    ])

    const posts = postsResult.success ? postsResult.data || [] : []
    const resources = resourcesResult.success ? resourcesResult.data || [] : []
    const members = membersResult.success ? membersResult.data || [] : []

    // Get top contributors (members with highest helpfulCount)
    const topContributors = members
        .sort((a, b) => (b.helpfulCount || 0) - (a.helpfulCount || 0))
        .slice(0, 5)
        .map(m => ({
            id: m.user.id,
            name: m.user.name,
            username: m.user.username,
            image: m.user.image,
            helpfulCount: m.helpfulCount || 0
        }))

    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-white dark:bg-neutral-950">
                <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
            </div>
        }>
            <CommunityPageClient
                community={community}
                user={session?.user ? {
                    id: session.user.id,
                    name: session.user.name ?? null,
                    image: session.user.image ?? null
                } : null}
                initialPosts={posts}
                initialResources={resources}
                members={members}
                topContributors={topContributors}
                nextCursor={postsResult.nextCursor}
            />
        </Suspense>
    )
}