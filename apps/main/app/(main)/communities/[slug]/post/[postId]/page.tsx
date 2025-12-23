import { getServerSession } from 'next-auth'
import { authOptions } from '@/auth'
import { redirect, notFound } from 'next/navigation'
import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'
import { PostDetailClient } from './_components/post-detail-client'
import { getPost } from '@/actions/(main)/community/post.action'
import { getUserCommunities } from '@/actions/(main)/community/community.action'
import { checkFollowStatus } from '@/actions/(main)/community/follow.action'

interface PostPageProps {
    params: Promise<{ slug: string; postId: string }>
}

export async function generateMetadata({ params }: PostPageProps) {
    const { postId } = await params
    const result = await getPost(postId)
    
    if (!result.success || !result.data) {
        return { title: 'Post Not Found' }
    }

    return {
        title: `${result.data.title || result.data.content.slice(0, 50)}... | Community`,
        description: result.data.content.slice(0, 160)
    }
}

export default async function PostPage({ params }: PostPageProps) {
    const { slug, postId } = await params
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
        redirect(`/signin?callbackUrl=/community/${slug}/post/${postId}`)
    }

    const [postResult, userCommunitiesResult] = await Promise.all([
        getPost(postId),
        getUserCommunities()
    ])

    if (!postResult.success || !postResult.data) {
        notFound()
    }

    const post = postResult.data
    const userCommunities = userCommunitiesResult.success ? userCommunitiesResult.data || [] : []

    // Check if user follows the post author
    const followStatus = await checkFollowStatus(post.author.id)

    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-white dark:bg-neutral-950">
                <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
            </div>
        }>
            <PostDetailClient 
                user={{
                    id: session.user.id,
                    name: session.user.name ?? null,
                    image: session.user.image ?? null
                }}
                post={post}
                userCommunities={userCommunities}
                isFollowingAuthor={followStatus.isFollowing || false}
            />
        </Suspense>
    )
}