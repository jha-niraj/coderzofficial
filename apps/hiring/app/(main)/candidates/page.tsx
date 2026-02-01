import { Suspense } from "react"
import { Loader2 } from "lucide-react"
import { 
    getCandidates, getCandidateStats, getCompanyJobsForFilter 
} from "@/actions/candidates"
import { CandidatesContent } from "./candidates-content"

export const metadata = {
    title: "Candidates | FlowSync",
    description: "View and manage candidate applications"
}

export default async function CandidatesPage() {
    const [candidatesResult, statsResult, jobsResult] = await Promise.all([
        getCandidates(),
        getCandidateStats(),
        getCompanyJobsForFilter()
    ])

    const candidates = candidatesResult.success && candidatesResult.data ? candidatesResult.data : []
    const stats = statsResult.success && statsResult.data ? statsResult.data : null
    const jobs = jobsResult.success && jobsResult.data ? jobsResult.data : []

    return (
        <Suspense 
            fallback={
                <div className="min-h-full flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
                </div>
            }
        >
            <CandidatesContent 
                initialCandidates={candidates}
                stats={stats}
                jobs={jobs}
            />
        </Suspense>
    )
}