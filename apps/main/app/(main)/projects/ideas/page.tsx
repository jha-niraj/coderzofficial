import type { Metadata } from 'next'
import ProjectIdeasClient from './_components/ProjectIdeasClient'

export const metadata: Metadata = {
  title: 'Project Ideas | BuildrHQ',
  description: 'Discover AI-generated project ideas tailored to your skill level and interests.',
}

export default function ProjectIdeasPage() {
  return <ProjectIdeasClient />
}
