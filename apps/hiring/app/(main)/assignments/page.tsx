import { 
    getAssessmentStats, getJobsWithAssessments 
} from "@/actions/assignments"
import AssignmentsContent from "./assignments-content"

export const metadata = {
    title: "Assignments | Hiring",
    description: "Manage job assignments and take-home tasks",
}

export default async function AssignmentsPage() {
    const [statsResult, jobsResult] = await Promise.all([
        getAssessmentStats(),
        getJobsWithAssessments()
    ])

    const stats = statsResult.success ? statsResult.data ?? null : null
    const jobs = jobsResult.success ? jobsResult.data ?? [] : []

    return <AssignmentsContent
        stats={stats}
        jobs={jobs}
    />
}