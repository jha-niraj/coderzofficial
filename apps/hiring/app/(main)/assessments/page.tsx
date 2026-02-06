import { 
    getAssessmentStats, getJobsWithAssessments 
} from "@/actions/assessments"
import AssessmentsContent from "./assessments-content"

export const metadata = {
    title: "Assessments | Hiring",
    description: "Manage job assignments and assessments",
}

export default async function AssessmentsPage() {
    const [statsResult, jobsResult] = await Promise.all([
        getAssessmentStats(),
        getJobsWithAssessments()
    ])

    const stats = statsResult.success ? statsResult.data ?? null : null
    const jobs = jobsResult.success ? jobsResult.data ?? [] : []

    return <AssessmentsContent
        stats={stats}
        jobs={jobs}
    />
}