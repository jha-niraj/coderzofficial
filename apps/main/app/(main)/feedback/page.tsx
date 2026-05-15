import type { Metadata } from 'next'
import FeedbackClient from './_components/FeedbackClient'

export const metadata: Metadata = {
  title: 'Feedback | BuildrHQ',
  description: 'Share your feedback to help us improve BuildrHQ.',
}

export default function FeedbackPage() {
  return <FeedbackClient />
}
