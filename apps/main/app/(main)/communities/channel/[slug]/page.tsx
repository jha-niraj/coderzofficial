import { getServerSession } from 'next-auth'
import { authOptions } from '@/auth'
import { redirect, notFound } from 'next/navigation'
import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'
import { ChannelPageClient } from './_components/channel-client'
import { getChannelPosts } from '@/actions/(main)/community/channel.action'
import { getUserCommunities } from '@/actions/(main)/community/community.action'

const OFFICIAL_CHANNELS = {
    general: { name: 'General', icon: '📢', description: 'General discussions and announcements' },
    showcase: { name: 'Showcase', icon: '🎨', description: 'Share your projects, designs, and achievements' },
    help: { name: 'Help & Support', icon: '🆘', description: 'Get help from the community' },
    career: { name: 'Career', icon: '💼', description: 'Job opportunities, career advice, and professional growth' },
    wins: { name: 'Wins & Milestones', icon: '🏆', description: 'Celebrate your wins and milestones' },
}

interface ChannelPageProps {
    params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: ChannelPageProps) {
    const { slug } = await params
    const channel = OFFICIAL_CHANNELS[slug as keyof typeof OFFICIAL_CHANNELS]
    
    if (!channel) {
        return { title: 'Channel Not Found' }
    }

    return {
        title: `${channel.name} | Community`,
        description: channel.description
    }
}

export default async function ChannelPage({ params }: ChannelPageProps) {
    const { slug } = await params
    const channel = OFFICIAL_CHANNELS[slug as keyof typeof OFFICIAL_CHANNELS]
    
    if (!channel) {
        notFound()
    }

    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
        redirect(`/signin?callbackUrl=/community/channel/${slug}`)
    }

    const [postsResult, userCommunitiesResult] = await Promise.all([
        getChannelPosts(slug, { limit: 30 }),
        getUserCommunities()
    ])

    const posts = postsResult.success ? postsResult.data || [] : []
    const userCommunities = userCommunitiesResult.success ? userCommunitiesResult.data || [] : []

    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-white dark:bg-neutral-950">
                <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
            </div>
        }>
            <ChannelPageClient 
                user={{
                    id: session.user.id,
                    name: session.user.name ?? null,
                    image: session.user.image ?? null
                }}
                channel={{
                    slug,
                    name: channel.name,
                    icon: channel.icon,
                    description: channel.description
                }}
                initialPosts={posts}
                userCommunities={userCommunities}
                nextCursor={postsResult.nextCursor}
            />
        </Suspense>
    )
}