import { getInterviewProcesses } from "@/actions/interview-config"
import JobFormContent from "./job-form-content"

export const metadata = {
    title: "Create New Job | Hiring",
    description: "Create a new job posting",
}

export default async function NewJobPage() {
    const processesResult = await getInterviewProcesses()
    const interviewProcesses = processesResult.success ? processesResult.data ?? [] : []

    return <JobFormContent interviewProcesses={interviewProcesses} />
}