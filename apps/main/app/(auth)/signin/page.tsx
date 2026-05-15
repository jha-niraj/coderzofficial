import type { Metadata } from 'next'
import SignInClient from './_components/SignInClient'

export const metadata: Metadata = {
  title: 'Sign In | BuildrHQ',
  description: 'Sign in to your BuildrHQ account to continue your developer journey.',
}

export default function SignInPage() {
  return <SignInClient />
}
