import { Suspense } from "react"
import { notFound, redirect } from "next/navigation"
import { Loader2 } from "lucide-react"
import { auth } from "@repo/auth"
import { prisma } from "@repo/prisma"
import { InterviewJourneyLayout } from "./components/interview-journey-layout"

interface InterviewJourneyPageProps {
    params: Promise<{
        applicationId: string
    }>
}

export async function generateMetadata({ params }: InterviewJourneyPageProps) {
    const { applicationId } = await params
    
    const application = await prisma.jobApplication.findUnique({
        where: { id: applicationId },
        include: {
            job: {
                select: { title: true }
            }
        }
    })

    return {
        title: application 
            ? `Interview Journey - ${application.job.title} | CodeDot.AI`
            : "Interview Journey | CodeDot.AI",
        description: "Track your interview progress and prepare for each round"
    }
}

// Type for transformed application data
type TransformedApplication = {
    id: string
    status: string
    assignmentStartedAt: Date | null
    assignmentSubmittedAt: Date | null
    assignmentScore: number | null
    assignmentFeedback: unknown
    interviewScheduledAt: Date | null
    interviewCompletedAt: Date | null
    interviewFeedback: unknown
    job: {
        id: string
        title: string
        slug: string
        hasAssignment: boolean
        assignmentDetails: unknown
        assignmentDeadlineDays: number | null
        company: {
            id: string
            name: string
            slug: string | null
            logoUrl: string | null
        }
        interviewProcess: {
            id: string
            name: string
            description: string | null
            rounds: Array<{
                id: string
                roundNumber: number
                roundType: string
                title: string
                description: string
                durationMinutes: number | null
                format: string
                hasMockInterview: boolean
                whatToExpect: unknown
                sampleQuestions: unknown
                tipsForCandidates: unknown
            }>
        } | null
    }
    prepProgress: {
        id: string
        overallReadinessScore?: number
        readinessScore?: number
        roundsCompleted?: number | number[]
    } | null
}

async function getApplicationWithInterviewData(applicationId: string, userId: string): Promise<TransformedApplication | null> {
    const application = await prisma.jobApplication.findFirst({
        where: {
            id: applicationId,
            userId: userId
        },
        include: {
            job: {
                include: {
                    company: {
                        select: {
                            id: true,
                            name: true,
                            slug: true,
                            logoUrl: true
                        }
                    },
                    interviewProcess: {
                        include: {
                            rounds: {
                                orderBy: { roundNumber: "asc" }
                            }
                        }
                    }
                }
            },
            prepProgress: true
        }
    })

    if (!application) return null

    // Transform the data to match the expected interface
    return {
        id: application.id,
        status: application.status,
        assignmentStartedAt: application.assignmentStartedAt,
        assignmentSubmittedAt: application.assignmentSubmittedAt,
        assignmentScore: application.assignmentScore,
        assignmentFeedback: application.assignmentFeedback,
        interviewScheduledAt: application.interviewScheduledAt,
        interviewCompletedAt: application.interviewCompletedAt,
        interviewFeedback: application.interviewFeedback,
        job: {
            id: application.job.id,
            title: application.job.title,
            slug: application.job.slug,
            hasAssignment: application.job.hasAssignment,
            assignmentDetails: application.job.assignmentDetails,
            assignmentDeadlineDays: application.job.assignmentDeadlineDays,
            company: application.job.company,
            interviewProcess: application.job.interviewProcess ? {
                id: application.job.interviewProcess.id,
                name: application.job.interviewProcess.name,
                description: application.job.interviewProcess.description,
                rounds: application.job.interviewProcess.rounds.map(round => ({
                    id: round.id,
                    roundNumber: round.roundNumber,
                    roundType: round.roundType,
                    title: round.title,
                    description: round.description,
                    durationMinutes: round.durationMinutes,
                    format: round.format,
                    hasMockInterview: round.hasMockInterview,
                    whatToExpect: round.whatToExpect,
                    sampleQuestions: round.sampleQuestions,
                    tipsForCandidates: round.tipsForCandidates
                }))
            } : null
        },
        prepProgress: application.prepProgress ? {
            id: application.prepProgress.id,
            overallReadinessScore: application.prepProgress.overallReadinessScore ?? undefined,
            readinessScore: application.prepProgress.overallReadinessScore ?? undefined, // Use same as overall
            roundsCompleted: application.prepProgress.roundsCompleted as number | number[] | undefined
        } : null
    }
}

export default async function InterviewJourneyPage({ params }: InterviewJourneyPageProps) {
    const session = await auth()
    if (!session?.user?.id) {
        redirect("/signin")
    }

    const { applicationId } = await params
    const application = await getApplicationWithInterviewData(applicationId, session.user.id)

    if (!application) {
        notFound()
    }

    // Check if the application status allows viewing interview journey
    const allowedStatuses = [
        "SHORTLISTED", 
        "ASSIGNMENT_SENT", 
        "ASSIGNMENT_SUBMITTED",
        "INTERVIEW_SCHEDULED", 
        "INTERVIEWED", 
        "OFFER_EXTENDED", 
        "HIRED"
    ]
    
    if (!allowedStatuses.includes(application.status)) {
        redirect(`/jobs/applications`)
    }

    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
                </div>
            }
        >
            <InterviewJourneyLayout application={application} />
        </Suspense>
    )
}
