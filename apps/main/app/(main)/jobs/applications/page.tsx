import { Suspense } from "react"
import { Loader2 } from "lucide-react"
import { getMyApplications } from "@/actions/jobs"
import { ApplicationsContent } from "./applications-content"

export const metadata = {
    title: "My Applications | CodeDot.AI",
    description: "Track your job applications and preparation progress"
}

export default async function ApplicationsPage() {
    const result = await getMyApplications()

    const applications = result.success && result.data ? result.data.applications : []

    return (
        <Suspense 
            fallback={
                <div className="min-h-full flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
                </div>
            }
        >
            <ApplicationsContent applications={applications} />
        </Suspense>
    )
}
