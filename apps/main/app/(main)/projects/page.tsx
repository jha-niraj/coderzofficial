import type { Metadata } from 'next'
import ProjectsHubClient from './_components/ProjectsHubClient'

export const metadata: Metadata = {
  title: 'Projects | BuildrHQ',
  description: 'Build real-world projects, explore project ideas, and track your progress with a portfolio.',
}

export default function ProjectsHomePage() {
  return <ProjectsHubClient />
}
