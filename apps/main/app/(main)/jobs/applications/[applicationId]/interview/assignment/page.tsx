import { Suspense } from "react"
import { notFound, redirect } from "next/navigation"
import {
    Loader2
} from "lucide-react"
import { auth } from "@repo/auth"
import { prisma } from "@repo/prisma"
import {
    AssignmentContent, type Application as AssignmentApplication
} from "./assignment-content"

interface AssignmentPageProps {
    params: Promise<{
        applicationId: string
    }>
}

export async function generateMetadata({ params }: AssignmentPageProps) {
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
            ? `Assignment - ${application.job.title} | CodeDot.AI`
            : "Assignment | CodeDot.AI",
        description: "Complete your take-home assignment"
    }
}

// Helper to safely parse JSON fields
function parseJsonField<T>(value: unknown, defaultValue: T): T {
    if (value === null || value === undefined) return defaultValue
    if (typeof value === 'object') return value as T
    if (typeof value === 'string') {
        try {
            return JSON.parse(value) as T
        } catch {
            return defaultValue
        }
    }
    return defaultValue
}

async function getAssignmentData(applicationId: string, userId: string) {
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
                    }
                }
            }
        }
    })

    return application
}

export default async function AssignmentPage({ params }: AssignmentPageProps) {
    const session = await auth()
    if (!session?.user?.id) {
        redirect("/signin")
    }

    const { applicationId } = await params
    const application = await getAssignmentData(applicationId, session.user.id)

    if (!application) {
        notFound()
    }

    // Check if application has access to assignment
    const allowedStatuses = ["ASSIGNMENT_SENT", "ASSIGNMENT_SUBMITTED", "INTERVIEW_SCHEDULED", "INTERVIEWED", "OFFER_EXTENDED", "HIRED"]
    if (!allowedStatuses.includes(application.status) || !application.job.hasAssignment) {
        redirect(`/jobs/applications/${applicationId}/interview`)
    }

    // Transform data to match the component's expected types
    const transformedApplication: AssignmentApplication = {
        id: application.id,
        status: application.status,
        assignmentStartedAt: application.assignmentStartedAt,
        assignmentSubmittedAt: application.assignmentSubmittedAt,
        assignmentScore: application.assignmentScore,
        assignmentFeedback: application.assignmentFeedback,
        job: {
            id: application.job.id,
            title: application.job.title,
            slug: application.job.slug,
            hasAssignment: application.job.hasAssignment,
            assignmentDetails: parseJsonField(application.job.assignmentDetails, null),
            assignmentDeadlineDays: application.job.assignmentDeadlineDays,
            company: {
                id: application.job.company.id,
                name: application.job.company.name,
                slug: application.job.company.slug,
                logoUrl: application.job.company.logoUrl
            }
        }
    }

    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
                </div>
            }
        >
            <AssignmentContent application={transformedApplication} />
        </Suspense>
    )
}