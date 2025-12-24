import { auth } from '@repo/auth'
import { redirect } from "next/navigation"
import prisma from "@repo/prisma"
import AIMockInterviewClient from "./_components/aimock-client"
import { ProgressGate } from "../_components/progress-gate"

export default async function AIMockPage({ params }: { params: Promise<{ slug: string }> }) {
	const session = await auth()
	const { slug } = await params

	if (!session?.user?.id) {
		redirect(`/login?callbackUrl=/projects/${slug}/aimock`)
	}

    // Get project with knowledge base and user progress
	const project = await prisma.projectV2.findUnique({
		where: { slug: slug },
		select: {
			id: true,
			slug: true,
			title: true,
            description: true,
            difficulty: true,
			includeAssessment: true,
            knowledge: {
                select: {
                    mockKnowledgeBase: true
                }
            },
			progress: {
				where: { userId: session.user.id },
				select: {
					progressPercentage: true,
					status: true
				}
			}
		}
	})

	if (!project) {
		redirect('/projects')
	}

	// Check if project includes assessment
	if (!project.includeAssessment) {
		redirect(`/projects/${slug}`)
	}

    // Get user credits
    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { credits: true }
    })

    // Get previous mock attempts
    const previousAttempts = await prisma.projectV2MockSession.findMany({
        where: {
            userId: session.user.id,
            projectId: project.id,
            status: 'COMPLETED'
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
            id: true,
            score: true,
            duration: true,
            completedAt: true
        }
    })

	// Get user progress
	const userProgress = project.progress?.[0]
	const currentProgress = userProgress?.progressPercentage || 0

	// Check if user has at least 75% progress
	if (!userProgress || currentProgress < 75) {
		return (
			<ProgressGate
				type="mock"
				currentProgress={currentProgress}
				requiredProgress={75}
				projectSlug={slug}
				projectTitle={project.title}
			/>
		)
	}

    return (
        <AIMockInterviewClient
            project={{
                id: project.id,
                slug: project.slug,
                title: project.title,
                description: project.description,
                difficulty: project.difficulty || 'INTERMEDIATE'
            }}
            userCredits={user?.credits || 0}
            hasKnowledgeBase={!!project.knowledge?.mockKnowledgeBase}
            knowledgeBase={project.knowledge?.mockKnowledgeBase || null}
            previousAttempts={previousAttempts}
        />
    )
}