import type { Metadata } from 'next'
import MockHubClient from './_components/MockHubClient'

export const metadata: Metadata = {
  title: 'Mock Interviews | BuildrHQ',
  description: 'Practice with AI voice interviews, peer-to-peer sessions, and company-specific mock interviews.',
}

export default function MockInterviewLandingPage() {
  return <MockHubClient />
}
