import type { Metadata } from 'next'
import LeaderboardClient from './_components/LeaderboardClient'

export const metadata: Metadata = {
  title: 'Leaderboard | BuildrHQ',
  description: 'See the top developers on BuildrHQ by XP, projects completed, and mock interview scores.',
}

export default function Leaderboard() {
  return <LeaderboardClient />
}
