import type { Metadata } from 'next'
import UniClassesClient from './_components/UniClassesClient'

export const metadata: Metadata = {
  title: 'Classes | BuildrHQ',
  description: 'View your university classes and schedule.',
}

export default function UniClassesPage() {
  return <UniClassesClient />
}
