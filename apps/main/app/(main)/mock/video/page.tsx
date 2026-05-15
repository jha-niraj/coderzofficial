import type { Metadata } from 'next'
import VideoMockClient from './_components/VideoMockClient'

export const metadata: Metadata = {
  title: 'Video Mock Interview | BuildrHQ',
  description: 'Practice with AI-powered video mock interviews on BuildrHQ.',
}

export default function AIVideoMockPage() {
  return <VideoMockClient />
}
