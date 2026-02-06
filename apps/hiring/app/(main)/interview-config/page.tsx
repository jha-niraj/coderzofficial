import { Suspense } from "react"
import { 
    getInterviewProcesses, getInterviewProcessStats 
} from "@/actions/interview-config"
import { InterviewConfigContent } from "./interview-config-content"
import { 
    Loader2 
} from "lucide-react"

export const metadata = {
    title: "Interview Process Configuration | FlowSync",
    description: "Configure your interview process for transparency and enable AI mock interviews"
}

export default async function InterviewConfigPage() {
    const [processesResult, statsResult] = await Promise.all([
        getInterviewProcesses(),
        getInterviewProcessStats()
    ])

    const processes = processesResult.success ? processesResult.data : []
    const stats = statsResult.success ? statsResult.data : { processCount: 0, totalRounds: 0, jobsWithProcess: 0 }

    return (
        <Suspense 
            fallback={
                <div className="min-h-full flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
                </div>
            }
        >
            <InterviewConfigContent 
                initialProcesses={processes ?? []}
                initialStats={stats ?? { processCount: 0, totalRounds: 0, jobsWithProcess: 0 }}
            />
        </Suspense>
    )
}