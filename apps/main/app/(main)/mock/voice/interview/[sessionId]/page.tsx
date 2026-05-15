import type { Metadata } from 'next'
import InterviewSessionClient from './_components/InterviewSessionClient'

export const metadata: Metadata = {
  title: 'Mock Interview Session | BuildrHQ',
  description: 'Live AI mock interview session.',
}

export default function MockInterviewPage({ params }: { params: Promise<{ sessionId: string }> }) {
  return <InterviewSessionClient params={params} />
}
