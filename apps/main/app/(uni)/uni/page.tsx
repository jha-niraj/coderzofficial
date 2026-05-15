import type { Metadata } from 'next'
import UniDashboardClient from './_components/UniDashboardClient'

export const metadata: Metadata = {
  title: 'University Dashboard | BuildrHQ',
  description: 'University student dashboard.',
}

export default function UniDashboardPage() {
  return <UniDashboardClient />
}
