import { Suspense } from "react"
import { getSession } from "@repo/auth"
import { headers } from "next/headers"
import { getCandidateStats } from "@/actions/candidates"
import { getInterviewProcesses } from "@/actions/interview-config"
import HomeContent from "./home-content"

export const dynamic = "force-dynamic"

export default async function HomePage() {
    const session = await getSession(headers())

    // Fetch real stats
    const [candidateStatsResult, interviewProcessesResult] = await Promise.all([
        getCandidateStats(),
        getInterviewProcesses()
    ])

    const candidateStats = candidateStatsResult.success ? candidateStatsResult.data ?? null : null
    const interviewProcesses = interviewProcessesResult.success ? interviewProcessesResult.data : []

    return (
        <Suspense fallback={<HomeLoading />}>
            <HomeContent
                userName={session?.user?.name?.split(" ")[0] || "there"}
                candidateStats={candidateStats}
                interviewProcessCount={interviewProcesses?.length || 0}
            />
        </Suspense>
    )
}

function HomeLoading() {
    return (
        <div className="min-h-full p-6 lg:p-8 animate-pulse">
            <div className="h-10 w-64 bg-neutral-200 dark:bg-neutral-800 rounded-xl mb-8" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {
                    [...Array(4)].map((_, i) => (
                        <div key={i} className="h-36 bg-neutral-200 dark:bg-neutral-800 rounded-2xl" />
                    ))
                }
            </div>
        </div>
    )
}