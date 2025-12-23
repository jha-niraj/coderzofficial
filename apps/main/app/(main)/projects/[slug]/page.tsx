import { getProjectBySlug } from '@/actions/(main)/projects/project.action'
import ProjectDetailsClient from './_components/project-details-client'
import { ProjectDetailsError } from './_components/project-details-error'
import { auth } from '@/auth'
import prisma from '@/lib/prisma'

export default async function ProjectDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
    const session = await auth()
    const { slug } = await params;
    const result = await getProjectBySlug(slug)

    if (!result.success || !result.data) {
        return <ProjectDetailsError error={result.error} />
    }

    const project = result.data
    
    // Get user credits and data if authenticated
    let userCredits = 0
    let currentUser = null
    if (session?.user?.id) {
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { 
                credits: true,
                username: true,
                name: true,
                email: true
            }
        })
        userCredits = user?.credits || 0
        currentUser = user
    }

    return <ProjectDetailsClient project={project} currentUserId={session?.user?.id || null} userCredits={userCredits} currentUser={currentUser} />
}