import {
    getJobAssessmentDetails, getAssignmentSubmissions
} from "@/actions/assessments"
import { notFound } from "next/navigation"
import AssessmentDetailContent from "./assessment-detail-content"

export async function generateMetadata({ params }: { params: Promise<{ jobSlug: string }> }) {
    const { jobSlug } = await params
    const result = await getJobAssessmentDetails(jobSlug)

    if (!result.success || !result.data) {
        return { title: "Assessment Not Found | Hiring" }
    }

    return {
        title: `${result.data.title} - Assessments | Hiring`,
        description: `Manage assignments for ${result.data.title}`,
    }
}

export default async function AssessmentDetailPage({
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
        <AssessmentDetailContent
            job={jobResult.data}
            submissions={submissions}
        />
    )
}