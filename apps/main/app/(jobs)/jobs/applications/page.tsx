import { Suspense } from "react"
import { Loader2 } from "lucide-react"
import { auth } from "@repo/auth"
import { getMyApplications } from "@/actions/jobs"
import { ApplicationsContent } from "./applications-content"

export const dynamic = "force-dynamic"

export const metadata = {
    title: "My Applications | CodeDot.AI",
    description: "Track your job applications and preparation progress"
}

export default async function ApplicationsPage() {
    const [session, result] = await Promise.all([
        auth(),
        getMyApplications()
    ])

    const isAuthenticated = !!session?.user?.id
    const applications = result.success && result.data ? result.data.applications : []

    return (
        <Suspense 
            fallback={
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
                </div>
            }
        >
            <ApplicationsContent 
                applications={applications} 
                isAuthenticated={isAuthenticated}
            />
        </Suspense>
    )
}