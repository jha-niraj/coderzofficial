import { Suspense } from "react"
import { 
    Loader2 
} from "lucide-react"
import { browseJobs, getRecommendedJobs } from "@/actions/jobs"
import { getFeaturedCompanies } from "@/actions/companies"
import { JobsContent } from "@/app/(main)/jobs/jobs-content"

export const metadata = {
    title: "Jobs | CodeDot.AI",
    description: "Discover jobs with transparent interview processes and practice with AI mock interviews"
}

export default async function JobsPage() {
    const [jobsResult, recommendedResult, companiesResult] = await Promise.all([
        browseJobs({}, 1, 20),
        getRecommendedJobs(5),
        getFeaturedCompanies(6)
    ])

    const jobs = jobsResult.success ? jobsResult.data?.jobs ?? [] : []
    const pagination = jobsResult.success ? jobsResult.data?.pagination ?? { page: 1, limit: 20, total: 0, totalPages: 0 } : { page: 1, limit: 20, total: 0, totalPages: 0 }
    const recommended = recommendedResult.success ? recommendedResult.data ?? [] : []
    const featuredCompanies = companiesResult.success ? companiesResult.data ?? [] : []

    return (
        <Suspense 
            fallback={
                <div className="min-h-full flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
                </div>
            }
        >
            <JobsContent 
                initialJobs={jobs}
                initialPagination={pagination}
                recommendedJobs={recommended}
                featuredCompanies={featuredCompanies}
            />
        </Suspense>
    )
}
