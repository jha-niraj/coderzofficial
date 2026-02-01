import { Suspense } from "react"
import { Loader2 } from "lucide-react"
import { getSavedJobs } from "@/actions/jobs"
import { SavedJobsContent } from "./saved-jobs-content"

export const metadata = {
    title: "Saved Jobs | CodeDot.AI",
    description: "Your saved job opportunities"
}

export default async function SavedJobsPage() {
    const result = await getSavedJobs()

    const savedJobs = result.success && result.data ? result.data : []

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