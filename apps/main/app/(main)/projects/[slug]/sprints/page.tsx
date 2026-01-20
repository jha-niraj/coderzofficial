import { getProjectBySlug } from '@/actions/(main)/projects/project.action'
import { auth } from '@repo/auth'
import prisma from '@repo/prisma'
import { redirect } from 'next/navigation'
import SprintsPageClient from './_components/sprints-page-client'
import { ProjectDetailsError } from '../_components/project-details-error'

export default async function ProjectSprintsPage({ params }: { params: Promise<{ slug: string }> }) {
    const session = await auth()
    const { slug } = await params
    const result = await getProjectBySlug(slug)

    if (!result.success || !result.data) {
        return <ProjectDetailsError />
    }

    const project = result.data
    const currentUserId = session?.user?.id

    // Check if user has access (Creator or Member)
    // Assuming 'members' in project data or use DB check
    // Since getProjectBySlug is generic, let's verify membership via DB if needed or check if we can rely on client to handle "started".
    // User said "Only accessible when the user have started the project".
    // "Started" might mean "Enrolled" or "Creator".

    // We can do a quick check here if currentUserId is set.
    if (currentUserId) {
        // Verify enrollment/membership
        const membership = await prisma.projectV2Member.findUnique({
            where: {
                projectId_userId: {
                    userId: currentUserId,
                    projectId: project.id
                }
            }
        })

        const isCreator = project.createdBy === currentUserId

        if (!isCreator && !membership) {
            // Redirect to main project page if not enrolled
            redirect(`/projects/${slug}`)
        }
    } else {
        // Not logged in
        redirect(`/auth/signin?callbackUrl=/projects/${slug}/sprints`)
    }

    // Get user credits
    let userCredits = 0
    let currentUser = null
    if (currentUserId) {
        const user = await prisma.user.findUnique({
            where: { id: currentUserId },
            select: {
                id: true,
                credits: true,
                username: true,
                name: true,
                email: true,
                image: true
            }
        })
        userCredits = user?.credits || 0
        currentUser = user
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