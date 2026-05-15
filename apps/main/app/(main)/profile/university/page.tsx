import type { Metadata } from 'next'
import UniversityProfileClient from './_components/UniversityProfileClient'

export const metadata: Metadata = {
  title: 'University Profile | BuildrHQ',
  description: 'Connect your university to BuildrHQ to access campus features.',
}

export default function UniversityVerificationPage() {
  return <UniversityProfileClient />
}
