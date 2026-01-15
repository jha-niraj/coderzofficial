import { getServerSession } from '@repo/auth'
import { authOptions } from '@repo/auth'
import { redirect, notFound } from 'next/navigation'
import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'
import { getCommunityBySlug } from '@/actions/(main)/community/community.action'
import { getCommunityInvites } from '@/actions/(main)/community/invite.action'
import { CommunitySettingsClient } from './_components/settings-client'

interface SettingsPageProps {
    params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: SettingsPageProps) {
    const { slug } = await params
    const result = await getCommunityBySlug(slug)

    if (!result.success || !result.data) {
        return { title: 'Settings' }
    }

    return {
        title: `${result.data.name} Settings | Admin`,
        description: `Manage settings for ${result.data.name}`
    }
}

export default async function CommunitySettingsPage({ params }: SettingsPageProps) {
    const { slug } = await params
    const session = await getServerSession(authOptions)

    if (!session?.user) {
        redirect(`/signin?callbackUrl=/communities/${slug}/settings`)
    }

    const communityResult = await getCommunityBySlug(slug)

    if (!communityResult.success || !communityResult.data) {
        notFound()
    }

    const community = communityResult.data

    // Check if user is admin
    if (!['OWNER', 'ADMIN'].includes(community.userRole || '')) {
        redirect(`/communities/${slug}`)
    }

    // Get invites for the invites tab
    const invitesResult = await getCommunityInvites(community.id)
    const invites = invitesResult.success ? invitesResult.data || [] : []

    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-white dark:bg-neutral-950">
                <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
            </div>
        }>
            <CommunitySettingsClient
                community={{
                    id: community.id,
                    name: community.name,
                    slug: community.slug,
                    description: community.description,
                    shortDescription: community.shortDescription ?? undefined,
                    logo: community.logo ?? undefined,
                    coverImage: community.coverImage ?? undefined,
                    themeColor: community.themeColor,
                    category: community.category,
                    visibility: community.visibility,
                    isVerified: community.isVerified,
                    enabledSections: community.enabledSections,
                    rules: community.rules,
                    tags: community.tags,
                    memberCount: community.memberCount,
                    postCount: community.postCount,
                    userRole: community.userRole,
                    websiteUrl: (community as { websiteUrl?: string }).websiteUrl,
                    contactEmail: (community as { contactEmail?: string }).contactEmail,
                    twitterUrl: (community as { twitterUrl?: string }).twitterUrl,
                    instagramUrl: (community as { instagramUrl?: string }).instagramUrl,
                    discordUrl: (community as { discordUrl?: string }).discordUrl,
                    githubUrl: (community as { githubUrl?: string }).githubUrl,
                }}
                initialInvites={invites}
            />
        </Suspense>
    )
}
