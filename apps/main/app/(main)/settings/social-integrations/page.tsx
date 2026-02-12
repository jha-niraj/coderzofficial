import { auth } from '@repo/auth'
import { redirect } from 'next/navigation'
import { getSocialConnections } from '@/actions/(main)/achievements/social-share.action'
import { SocialIntegrationsContent } from './_components/social-integrations-content'

export const metadata = {
    title: 'Social Integrations | Settings | Coderz',
    description: 'Connect your social accounts to share achievements',
}

export default async function SocialIntegrationsPage() {
    const session = await auth()
    
    if (!session?.user) {
        redirect('/login')
    }

    const result = await getSocialConnections()

    return (
        <SocialIntegrationsContent
            connections={result.success ? result.connections || [] : []}
        />
    )
}
