import type { Metadata } from 'next'
import AllProjectsClient from './_components/AllProjectsClient'

export const metadata: Metadata = {
  title: 'All Projects | BuildrHQ',
  description: 'Browse all available projects on BuildrHQ.',
}

export default function AllProjectsPage() {
  return <AllProjectsClient />
}
