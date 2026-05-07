import { getSession } from '@repo/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getSocialConnections } from '@/actions/(main)/achievements/social-share.action'
import { IntegrationsContent } from './_components/integrations-content'

export const metadata = {
    title: 'Integrations | Settings | Coderz',
    description: 'Connect GitHub and social accounts',
}

export default async function IntegrationsPage() {
    const session = await getSession(headers())

    if (!session?.user) {
        redirect('/login')
    }

    const result = await getSocialConnections()

    return (
        <IntegrationsContent
            socialConnections={result.success ? result.connections || [] : []}
        />
    )
}
