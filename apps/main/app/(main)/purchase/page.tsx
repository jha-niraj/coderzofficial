import type { Metadata } from 'next'
import PurchaseClient from './_components/PurchaseClient'

export const metadata: Metadata = {
  title: 'Get Credits | BuildrHQ',
  description: 'Purchase BuildrHQ credits to unlock AI mock interviews, resume tools, and premium features.',
}

export default function PurchasePage() {
  return <PurchaseClient />
}
