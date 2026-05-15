import type { Metadata } from 'next'
import ShareCreditsClient from './_components/ShareCreditsClient'

export const metadata: Metadata = {
  title: 'Share Credits | BuildrHQ',
  description: 'Share BuildrHQ credits with friends and collaborators.',
}

export default function CreditTransferPage() {
  return <ShareCreditsClient />
}
