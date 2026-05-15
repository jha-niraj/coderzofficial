import type { Metadata } from 'next'
import ReferralsClient from './_components/ReferralsClient'

export const metadata: Metadata = {
  title: 'Referrals | BuildrHQ',
  description: 'Invite your friends to BuildrHQ and earn credits.',
}

export default function ReferralsPage() {
  return <ReferralsClient />
}
