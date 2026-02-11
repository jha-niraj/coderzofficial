import { Suspense } from "react"
import { Loader2 } from "lucide-react"
import { auth } from "@repo/auth"
import { getForYouFeedJobs } from "@/actions/jobs"
import { BrowseContent } from "./browse-content"

export const dynamic = "force-dynamic"

export const metadata = {
    title: "Browse All Jobs | CodeDot.AI",
    description: "Browse all available job opportunities"
}

export default async function BrowsePage() {
    const [session, jobsResult] = await Promise.all([
        auth(),
        getForYouFeedJobs(1, 20)
    ])

    const isAuthenticated = !!session?.user?.id

    return (
        <Suspense fallback={
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
            </div>
        }>
            <BrowseContent 
                initialData={jobsResult}
                isAuthenticated={isAuthenticated}
            />
        </Suspense>
    )
}
