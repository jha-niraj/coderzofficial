import { Suspense } from "react"
import { 
    Loader2 
} from "lucide-react"
import { getSavedJobs } from "@/actions/jobs"
import { SavedJobsContent } from "./saved-jobs-content"

export const metadata = {
    title: "Saved Jobs | CodeDot.AI",
    description: "Your saved job opportunities"
}

export default async function SavedJobsPage() {
    const result = await getSavedJobs()

    const rawJobs = result.success && result.data ? result.data : []
    
    // Transform the data to match the expected interface
    const savedJobs = rawJobs.map(job => ({
        ...job,
        skillsRequired: Array.isArray(job.skillsRequired) 
            ? job.skillsRequired as string[] 
            : []
    }))

    return (
        <Suspense 
            fallback={
                <div className="min-h-full flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
                </div>
            }
        >
            <SavedJobsContent savedJobs={savedJobs} />
        </Suspense>
    )
}