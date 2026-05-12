import type { Metadata } from 'next'
import PrivacyPolicyClient from './PrivacyPolicyClient'

export const metadata: Metadata = {
    title: 'Privacy Policy',
    description: 'BuildrHQ Privacy Policy — how we collect, use, and protect your personal data on the engineering intelligence platform.',
    robots: { index: true, follow: false },
    alternates: { canonical: '/privacypolicy' },
}

export default function PrivacyPolicyPage() {
    return <PrivacyPolicyClient />
}
