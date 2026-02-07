import {
    getJobAssessmentDetails, getAssignmentSubmissions
} from "@/actions/assignments"
import { notFound } from "next/navigation"
import AssignmentDetailContent from "./assignment-detail-content"

export async function generateMetadata({ params }: { params: Promise<{ jobSlug: string }> }) {
    const { jobSlug } = await params
    const result = await getJobAssessmentDetails(jobSlug)

    if (!result.success || !result.data) {
        return { title: "Assignment Not Found | Hiring" }
    }

    return {
        title: `${result.data.title} - Assignments | Hiring`,
        description: `Manage assignments for ${result.data.title}`,
    }
}

export default async function AssignmentDetailPage({
    params
}: {
    params: Promise<{ jobSlug: string }>
}) {
    const { jobSlug } = await params

    const [jobResult, submissionsResult] = await Promise.all([
        getJobAssessmentDetails(jobSlug),
        getAssignmentSubmissions(jobSlug)
    ])

    if (!jobResult.success || !jobResult.data) {
        notFound()
    }

    const submissions = submissionsResult.success ? submissionsResult.data ?? [] : []

    return (
        <AssignmentDetailContent
            job={jobResult.data}
            submissions={submissions}
        />
    )
}