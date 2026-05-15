import type { Metadata } from 'next'
import UniMockClient from './_components/UniMockClient'

export const metadata: Metadata = {
  title: 'Campus Mock Interviews | BuildrHQ',
  description: 'University-hosted mock interview sessions.',
}

export default function UniMockPage() {
  return <UniMockClient />
}
