import { Suspense } from "react"
import { Loader2 } from "lucide-react"
import { 
    getAnalyticsOverview, getRecruiterPerformance 
} from "@/actions/analytics"
import { AnalyticsContent } from "./analytics-content"

export const metadata = {
    title: "Analytics | FlowSync",
    description: "Track your hiring pipeline performance"
}

export default async function AnalyticsPage() {
    const [analyticsResult, performanceResult] = await Promise.all([
        getAnalyticsOverview(),
        getRecruiterPerformance()
    ])

    const analytics = analyticsResult.success && analyticsResult.data ? analyticsResult.data : null
    const performance = performanceResult.success && performanceResult.data ? performanceResult.data : []

    return (
        <Suspense 
            fallback={
                <div className="min-h-full flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
                </div>
            }
        >
            <AnalyticsContent 
                analytics={analytics}
                recruiterPerformance={performance}
            />
        </Suspense>
    )
}