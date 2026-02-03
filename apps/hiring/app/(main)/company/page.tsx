import { Suspense } from "react"
import { Loader2 } from "lucide-react"
import { getCompanyProfile, getCompanyPublicStats } from "@/actions/company"
import { CompanyProfileContent } from "./company-content"

export const metadata = {
    title: "Company Profile | FlowSync",
    description: "Manage your company information and branding"
}

export default async function CompanyPage() {
    const [profileResult, statsResult] = await Promise.all([
        getCompanyProfile(),
        getCompanyPublicStats()
    ])

    const profile = profileResult.success && profileResult.data ? profileResult.data : null
    const stats = statsResult.success && statsResult.data ? statsResult.data : null

    return (
        <Suspense 
            fallback={
                <div className="min-h-full flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
                </div>
            }
        >
            <CompanyProfileContent 
                profile={profile}
                stats={stats}
            />
        </Suspense>
    )
}
