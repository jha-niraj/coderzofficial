import { getProjectBySlug } from '@/actions/(main)/projects/project.action'
import ProjectDetailsClient from './_components/project-details-client'
import { ProjectDetailsError } from './_components/project-details-error'
import { getSession } from '@repo/auth'
import { headers } from 'next/headers'
import { db, users } from '@repo/db'
import { eq } from 'drizzle-orm'

export default async function ProjectDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
    const session = await getSession(headers())
    const { slug } = await params;
    const result = await getProjectBySlug(slug)

    if (!result.success || !result.data) {
        return <ProjectDetailsError />
    }

    const project = result.data

    // Get user credits and data if authenticated
    let userCredits = 0
    let currentUser = null
    if (session?.user?.id) {
        const userRows = await db
            .select({
                id: users.id,
                credits: users.credits,
                username: users.username,
                name: users.name,
                email: users.email,
            })
            .from(users)
            .where(eq(users.id, session.user.id))
            .limit(1)

        const user = userRows[0]
        userCredits = user?.credits || 0
        currentUser = user || null
    }

    return <ProjectDetailsClient project={project} currentUserId={session?.user?.id || null} userCredits={userCredits} currentUser={currentUser || undefined} />
}
