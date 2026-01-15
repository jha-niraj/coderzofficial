import { getServerSession } from '@repo/auth'
import { authOptions } from '@repo/auth'
import { redirect, notFound } from 'next/navigation'
import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'
import { acceptCommunityInvite } from '@/actions/(main)/community/invite.action'
import { getCommunityBySlug } from '@/actions/(main)/community/community.action'
import { JoinPageClient } from './_components/join-page-client'

interface JoinPageProps {
    params: Promise<{ slug: string }>
    searchParams: Promise<{ code?: string }>
}

export async function generateMetadata({ params }: JoinPageProps) {
    const { slug } = await params
    const result = await getCommunityBySlug(slug)

    if (!result.success || !result.data) {
        return { title: 'Community Not Found' }
    }

    return {
        title: `Join ${result.data.name} | Communities`,
        description: `Accept your invitation to join ${result.data.name}`
    }
}

export default async function JoinPage({ params, searchParams }: JoinPageProps) {
    const { slug } = await params
    const { code } = await searchParams

    const session = await getServerSession(authOptions)

    // Get community info
    const communityResult = await getCommunityBySlug(slug)

    if (!communityResult.success || !communityResult.data) {
        notFound()
    }

    const community = communityResult.data

    // If not signed in, redirect to sign in with callback
    if (!session?.user) {
        redirect(`/signin?callbackUrl=/communities/${slug}/join${code ? `?code=${code}` : ''}`)
    }

    // If already a member, redirect to community page
    if (community.isMember) {
        redirect(`/communities/${slug}`)
    }

    // If there's an invite code, try to accept it
    let inviteResult = null
    if (code) {
        inviteResult = await acceptCommunityInvite(code)
    }

    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-white dark:bg-neutral-950">
                <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
            </div>
        }>
            <JoinPageClient
                community={{
                    id: community.id,
                    name: community.name,
                    slug: community.slug,
                    description: community.description,
                    logo: community.logo ?? undefined,
                    coverImage: community.coverImage ?? undefined,
                    themeColor: community.themeColor,
                    memberCount: community.memberCount,
                    visibility: community.visibility
                }}
                inviteResult={inviteResult}
                hasInviteCode={!!code}
            />
        </Suspense>
    )
}
