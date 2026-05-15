import type { Metadata } from 'next'
import TransactionsClient from './_components/TransactionsClient'

export const metadata: Metadata = {
  title: 'Transaction History | BuildrHQ',
  description: 'View your BuildrHQ credit purchase and usage history.',
}

export default function TransactionsPage() {
  return <TransactionsClient />
}
