import type { Metadata } from 'next'
import ConnectClient from './_components/ConnectClient'

export const metadata: Metadata = {
  title: 'Mock Interview Connect | BuildrHQ',
  description: 'Connect with a peer for a real-time mock interview session.',
}

export default function ConnectMentorsPage() {
  return <ConnectClient />
}
