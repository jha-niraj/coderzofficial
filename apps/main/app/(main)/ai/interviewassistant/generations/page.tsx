import type { Metadata } from 'next'
import GenerationsClient from './_components/GenerationsClient'

export const metadata: Metadata = {
  title: 'My Interview Generations | BuildrHQ',
  description: 'View your AI-generated interview preparation sessions.',
}

export default function MyPlansPage() {
  return <GenerationsClient />
}
