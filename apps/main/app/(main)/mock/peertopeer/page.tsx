import type { Metadata } from 'next'
import PeerToPeerClient from './_components/PeerToPeerClient'

export const metadata: Metadata = {
  title: 'Peer-to-Peer Mock Interviews | BuildrHQ',
  description: 'Practice mock interviews with other developers in live sessions.',
}

export default function PeerToPeerMockPage() {
  return <PeerToPeerClient />
}
