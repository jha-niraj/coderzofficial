import type { Metadata } from 'next'
import UniAssignmentsClient from './_components/UniAssignmentsClient'

export const metadata: Metadata = {
  title: 'Assignments | BuildrHQ',
  description: 'View and submit university assignments.',
}

export default function UniAssignmentsPage() {
  return <UniAssignmentsClient />
}
