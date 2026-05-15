import type { Metadata } from 'next'
import PublicGenerationsClient from './_components/PublicGenerationsClient'

export const metadata: Metadata = {
  title: 'Community Interview Generations | BuildrHQ',
  description: 'Browse publicly shared AI interview preparation sessions from the BuildrHQ community.',
}

export default function PublicGenerationsPage() {
  return <PublicGenerationsClient />
}
