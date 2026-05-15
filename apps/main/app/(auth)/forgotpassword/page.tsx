import type { Metadata } from 'next'
import ForgotPasswordClient from './_components/ForgotPasswordClient'

export const metadata: Metadata = {
  title: 'Reset Password | BuildrHQ',
  description: 'Reset your BuildrHQ account password.',
}

export default function ForgotPasswordPage() {
  return <ForgotPasswordClient />
}
