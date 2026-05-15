import type { Metadata } from 'next'
import UniGradesClient from './_components/UniGradesClient'

export const metadata: Metadata = {
  title: 'Grades | BuildrHQ',
  description: 'View your academic grades and performance.',
}

export default function UniGradesPage() {
  return <UniGradesClient />
}
