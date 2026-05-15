import type { Metadata } from 'next'
import UniLeaderboardClient from './_components/UniLeaderboardClient'

export const metadata: Metadata = {
  title: 'University Leaderboard | BuildrHQ',
  description: 'See the top students at your university.',
}

export default function UniLeaderboardPage() {
  return <UniLeaderboardClient />
}
