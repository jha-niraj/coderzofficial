import type { Metadata } from 'next'
import InterviewAssistantHubClient from './_components/InterviewAssistantHubClient'

export const metadata: Metadata = {
  title: 'Job Interview Assistant | BuildrHQ',
  description: 'AI-powered interview prep that analyzes your resume and generates role-specific interview questions.',
}

export default function JobInterviewAssistant() {
  return <InterviewAssistantHubClient />
}
