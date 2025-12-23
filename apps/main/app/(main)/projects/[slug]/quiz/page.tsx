import { auth } from "@/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import QuizClient from "./_components/quiz-client"
import { ProgressGate } from "../_components/progress-gate"

export default async function QuizPage({ params }: { params: Promise<{ slug: string }> }) {
    const session = await auth()
    const { slug } = await params
    
    if (!session?.user?.id) {
        redirect(`/login?callbackUrl=/projects/${slug}/quiz`)
    }

    // Get project with quiz and user progress
    const project = await prisma.projectV2.findUnique({
        where: { slug: slug },
        include: {
            quiz: {
                include: {
                    questions: {
                        orderBy: { orderIndex: 'asc' }
                    }
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

    // Get user progress
    const userProgress = project.progress?.[0]
    const currentProgress = userProgress?.progressPercentage || 0
    
    // Check if user has started the project and has at least 50% progress
    if (!userProgress || currentProgress < 50) {
        return (
            <ProgressGate
                type="quiz"
                currentProgress={currentProgress}
                requiredProgress={50}
                projectSlug={slug}
                projectTitle={project.title}
            />
        )
    }	// Get user credits
	const user = await prisma.user.findUnique({
		where: { id: session.user.id },
		select: { credits: true }
	})

	// Get previous attempts
	const attempts = await prisma.projectV2QuizAttempt.findMany({
		where: {
			userId: session.user.id,
			projectId: project.id
		},
		orderBy: { createdAt: 'desc' },
		take: 5,
		select: {
			id: true,
			score: true,
			correctAnswers: true,
			totalQuestions: true,
			timeSpent: true,
			completedAt: true,
			createdAt: true
		}
	})

	// Format quiz data for client
	const existingQuiz = project.quiz ? {
		id: project.quiz.id,
		totalQuestions: project.quiz.totalQuestions,
		questions: project.quiz.questions.map(q => ({
			id: q.id,
			difficulty: q.difficulty,
			prompt: q.prompt,
			options: q.options,
			correctAnswer: q.correctAnswer,
			explanation: q.explanation,
			orderIndex: q.orderIndex
		}))
	} : null

	return (
		<QuizClient
			project={{
				id: project.id,
				slug: project.slug,
				title: project.title,
				description: project.description
			}}
			existingQuiz={existingQuiz}
			userCredits={user?.credits || 0}
			previousAttempts={attempts}
		/>
	)
}