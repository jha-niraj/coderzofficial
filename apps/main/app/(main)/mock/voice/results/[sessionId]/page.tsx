import type { Metadata } from 'next'
import InterviewResultsClient from './_components/InterviewResultsClient'

export const metadata: Metadata = {
  title: 'Interview Results | BuildrHQ',
  description: 'View your mock interview performance and feedback.',
}

export default function ResultsPage({ params }: { params: Promise<{ sessionId: string }> }) {
  return <InterviewResultsClient params={params} />
}
