import type { Metadata } from 'next'
import UniJobsClient from './_components/UniJobsClient'

export const metadata: Metadata = {
  title: 'Campus Jobs | BuildrHQ',
  description: 'Find campus-exclusive job opportunities.',
}

export default function UniJobsPage() {
  return <UniJobsClient />
}
