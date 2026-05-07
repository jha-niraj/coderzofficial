import { getProjectBySlug } from '@/actions/(main)/projects/project.action'
import { getSession } from '@repo/auth'
import { headers } from 'next/headers'
import { db, users, projectV2Members } from '@repo/db'
import { eq, and } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import SprintsPageClient from './_components/sprints-page-client'
import { ProjectDetailsError } from '../_components/project-details-error'

export default async function ProjectSprintsPage({ params }: { params: Promise<{ slug: string }> }) {
    const session = await getSession(headers())
    const { slug } = await params
    const result = await getProjectBySlug(slug)

    if (!result.success || !result.data) {
        return <ProjectDetailsError />
    }

    const project = result.data
    const currentUserId = session?.user?.id

    if (currentUserId) {
        // Verify enrollment/membership
        const membershipRows = await db
            .select({ id: projectV2Members.id })
            .from(projectV2Members)
            .where(and(
                eq(projectV2Members.projectId, project.id),
                eq(projectV2Members.userId, currentUserId)
            ))
            .limit(1)

        const isCreator = project.createdBy === currentUserId

        if (!isCreator && !membershipRows[0]) {
            redirect(`/projects/${slug}`)
        }
    } else {
        redirect(`/auth/signin?callbackUrl=/projects/${slug}/sprints`)
    }

    // Get user credits
    let userCredits = 0
    let currentUser = null
    if (currentUserId) {
        const userRows = await db
            .select({
                id: users.id,
                credits: users.credits,
                username: users.username,
                name: users.name,
                email: users.email,
                image: users.image,
            })
            .from(users)
            .where(eq(users.id, currentUserId))
            .limit(1)

        const user = userRows[0]
        userCredits = user?.credits || 0
        currentUser = user || null
    }

    return (
        <SprintsPageClient
            project={project}
            currentUserId={currentUserId || null}
            userCredits={userCredits}
            currentUser={currentUser || undefined}
        />
    )
}
