import type { Metadata } from 'next'
import UniVerifyClient from './_components/UniVerifyClient'

export const metadata: Metadata = {
  title: 'Verify University | BuildrHQ',
  description: 'Verify your university student status.',
}

export default function UniVerifyPage() {
  return <UniVerifyClient />
}
