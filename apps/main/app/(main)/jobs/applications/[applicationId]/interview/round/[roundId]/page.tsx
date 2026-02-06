import { Suspense } from "react"
import { notFound, redirect } from "next/navigation"
import { 
    Loader2 
} from "lucide-react"
import { auth } from "@repo/auth"
import { prisma } from "@repo/prisma"
import { RoundContent, type Application as RoundApplication, type InterviewRound } from "./round-content"

interface RoundPageProps {
    params: Promise<{
        applicationId: string
        roundId: string
    }>
}

export async function generateMetadata({ params }: RoundPageProps) {
    const { roundId } = await params
    
    const round = await prisma.interviewRound.findUnique({
        where: { id: roundId },
        select: { title: true }
    })

    return {
        title: round 
            ? `${round.title} | Interview Round`
            : "Interview Round | CodeDot.AI",
        description: "Prepare for your interview round"
    }
}

// Helper to safely parse JSON array fields
function parseJsonArray(value: unknown): string[] {
    if (Array.isArray(value)) return value.map(String)
    if (value === null || value === undefined) return []
    if (typeof value === 'string') {
        try {
            const parsed = JSON.parse(value)
            return Array.isArray(parsed) ? parsed.map(String) : []
        } catch {
            return []
        }
    }
    return []
}

async function getRoundData(applicationId: string, roundId: string, userId: string) {
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

    const round = application.job.interviewProcess?.rounds.find(r => r.id === roundId)
    if (!round) return null

    return { application, round }
}

export default async function RoundPage({ params }: RoundPageProps) {
    const session = await auth()
    if (!session?.user?.id) {
        redirect("/signin")
    }

    const { applicationId, roundId } = await params
    const data = await getRoundData(applicationId, roundId, session.user.id)

    if (!data) {
        notFound()
    }

    // Check if application has access to interviews
    const allowedStatuses = ["INTERVIEW_SCHEDULED", "INTERVIEWED", "OFFER_EXTENDED", "HIRED"]
    if (!allowedStatuses.includes(data.application.status)) {
        redirect(`/jobs/applications/${applicationId}/interview`)
    }

    // Transform application data
    const transformedApplication: RoundApplication = {
        id: data.application.id,
        status: data.application.status,
        interviewScheduledAt: data.application.interviewScheduledAt,
        job: {
            id: data.application.job.id,
            title: data.application.job.title,
            slug: data.application.job.slug,
            company: {
                id: data.application.job.company.id,
                name: data.application.job.company.name,
                slug: data.application.job.company.slug,
                logoUrl: data.application.job.company.logoUrl
            },
            interviewProcess: data.application.job.interviewProcess ? {
                id: data.application.job.interviewProcess.id,
                name: data.application.job.interviewProcess.name,
                rounds: data.application.job.interviewProcess.rounds.map(r => ({
                    id: r.id,
                    roundNumber: r.roundNumber,
                    roundType: r.roundType,
                    title: r.title,
                    description: r.description || "",
                    durationMinutes: r.durationMinutes,
                    format: r.format,
                    hasMockInterview: r.hasMockInterview,
                    whatToExpect: parseJsonArray(r.whatToExpect),
                    sampleQuestions: parseJsonArray(r.sampleQuestions),
                    evaluationCriteria: parseJsonArray(r.evaluationCriteria),
                    topicsCovered: parseJsonArray(r.topicsCovered),
                    tipsForCandidates: parseJsonArray(r.tipsForCandidates)
                }))
            } : null
        },
        prepProgress: data.application.prepProgress ? {
            id: data.application.prepProgress.id,
            roundsCompleted: parseJsonArray(data.application.prepProgress.roundsCompleted) as unknown as number[]
        } : null
    }

    // Transform round data
    const transformedRound: InterviewRound = {
        id: data.round.id,
        roundNumber: data.round.roundNumber,
        roundType: data.round.roundType,
        title: data.round.title,
        description: data.round.description || "",
        durationMinutes: data.round.durationMinutes,
        format: data.round.format,
        hasMockInterview: data.round.hasMockInterview,
        whatToExpect: parseJsonArray(data.round.whatToExpect),
        sampleQuestions: parseJsonArray(data.round.sampleQuestions),
        evaluationCriteria: parseJsonArray(data.round.evaluationCriteria),
        topicsCovered: parseJsonArray(data.round.topicsCovered),
        tipsForCandidates: parseJsonArray(data.round.tipsForCandidates)
    }

    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
                </div>
            }
        >
            <RoundContent application={transformedApplication} round={transformedRound} />
        </Suspense>
    )
}