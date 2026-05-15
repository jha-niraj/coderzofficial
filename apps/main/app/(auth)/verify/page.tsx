import type { Metadata } from 'next'
import VerifyClient from './_components/VerifyClient'

export const metadata: Metadata = {
  title: 'Verify Email | BuildrHQ',
  description: 'Verify your email address to activate your BuildrHQ account.',
}

export default function VerifyPage() {
  return <VerifyClient />
}
