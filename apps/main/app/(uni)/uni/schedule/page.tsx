import type { Metadata } from 'next'
import UniScheduleClient from './_components/UniScheduleClient'

export const metadata: Metadata = {
  title: 'Schedule | BuildrHQ',
  description: 'View your university class schedule.',
}

export default function UniSchedulePage() {
  return <UniScheduleClient />
}
