import { Suspense } from "react"
import { Loader2 } from "lucide-react"
import { getMockSessionsOverview, getMockStats } from "@/actions/mock"
import { MockInterviewsContent } from "./mock-content"

export const metadata = {
    title: "Mock Interviews | FlowSync",
    description: "Manage AI-powered mock interviews for your company"
}

export default async function MockInterviewsPage() {
    const [sessionsResult, statsResult] = await Promise.all([
        getMockSessionsOverview(),
        getMockStats()
    ])

    const sessions = sessionsResult.success && sessionsResult.data ? sessionsResult.data : []
    const stats = statsResult.success && statsResult.data ? statsResult.data : null

    return (
        <Suspense 
            fallback={
                <div className="min-h-full flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
                </div>
            }
        >
            <MockInterviewsContent 
                initialSessions={sessions}
                stats={stats}
            />
        </Suspense>
    )
}
