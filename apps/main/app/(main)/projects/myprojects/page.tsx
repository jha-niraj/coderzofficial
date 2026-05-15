import type { Metadata } from 'next'
import MyProjectsClient from './_components/MyProjectsClient'

export const metadata: Metadata = {
  title: 'My Projects | BuildrHQ',
  description: 'Track your ongoing and completed BuildrHQ projects.',
}

export default function MyProjectsPage() {
  return <MyProjectsClient />
}
