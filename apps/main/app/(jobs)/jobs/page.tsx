import { Suspense } from "react"
import { 
    Loader2 
} from "lucide-react"
import { getFeedStats } from "@/actions/jobs"
import { auth } from "@repo/auth"
import { JobsFeedContent } from "./jobs-feed-content"

export const metadata = {
    title: "Jobs | CodeDot.AI",
    description: "Discover jobs with transparent interview processes and practice with AI mock interviews"
}

export default async function JobsPage() {
    const [session, statsResult] = await Promise.all([
        auth(),
        getFeedStats()
    ])

    const stats = statsResult.success && statsResult.data ? statsResult.data : null
    const isAuthenticated = !!session?.user?.id

    return (
        <Suspense 
            fallback={
                <div className="min-h-full flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
                </div>
            }
        >
            <JobsFeedContent 
                initialStats={stats}
                isAuthenticated={isAuthenticated}
            />
        </Suspense>
    )
}