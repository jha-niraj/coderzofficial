import type { Metadata } from 'next'
import UniCreditsClient from './_components/UniCreditsClient'

export const metadata: Metadata = {
  title: 'Credits | BuildrHQ',
  description: 'Track your university credits and academic progress.',
}

export default function UniCreditsPage() {
  return <UniCreditsClient />
}
