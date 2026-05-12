import type { Metadata } from 'next'
import TermsClient from './TermsClient'

export const metadata: Metadata = {
    title: 'Terms of Service',
    description: 'BuildrHQ Terms of Service — the rules and conditions for using the engineering intelligence platform.',
    robots: { index: true, follow: false },
    alternates: { canonical: '/termsofservice' },
}

export default function TermsOfServicePage() {
    return <TermsClient />
}
