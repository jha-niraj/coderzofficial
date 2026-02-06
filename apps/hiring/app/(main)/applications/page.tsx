import { Suspense } from "react"
import { 
    getApplicationStats, getJobApplicationStats 
} from "@/actions/applications"
import { ApplicationsContent } from "./applications-content"

export default async function ApplicationsPage() {
    const [statsResult, jobStatsResult] = await Promise.all([
        getApplicationStats(),
        getJobApplicationStats()
    ])

    const stats = statsResult.success ? statsResult.data : null
    const jobStats = jobStatsResult.success ? jobStatsResult.data : []

    return (
        <Suspense fallback={<ApplicationsLoading />}>
            <ApplicationsContent 
                stats={stats ?? null}
                jobStats={jobStats ?? []}
            />
        </Suspense>
    )
}

function ApplicationsLoading() {
    return (
        <div className="min-h-full p-6 lg:p-8 animate-pulse">
            <div className="h-10 w-64 bg-neutral-200 dark:bg-neutral-800 rounded-xl mb-8" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-24 bg-neutral-200 dark:bg-neutral-800 rounded-xl" />
                ))}
            </div>
            <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-20 bg-neutral-200 dark:bg-neutral-800 rounded-xl" />
                ))}
            </div>
        </div>
    )
}