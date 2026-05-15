import type { Metadata } from 'next'
import UniStudioClient from './_components/UniStudioClient'

export const metadata: Metadata = {
  title: 'Studio | BuildrHQ',
  description: 'University studio workspace.',
}

export default function UniStudioPage() {
  return <UniStudioClient />
}
