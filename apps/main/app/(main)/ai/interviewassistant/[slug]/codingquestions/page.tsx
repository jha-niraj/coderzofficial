import type { Metadata } from 'next'
import CodingQuestionsClient from './_components/CodingQuestionsClient'

export const metadata: Metadata = {
  title: 'Coding Questions | BuildrHQ',
  description: 'Practice coding questions generated for your specific interview.',
}

export default function CodingQuestionsPage({ params }: { params: Promise<{ slug: string }> }) {
  return <CodingQuestionsClient params={params} />
}
