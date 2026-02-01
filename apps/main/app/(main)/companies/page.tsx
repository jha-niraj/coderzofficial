import { Suspense } from "react"
import { Loader2 } from "lucide-react"
import { browseCompanies, getFeaturedCompanies } from "@/actions/companies"
import { CompaniesContent } from "./companies-content"

export const metadata = {
    title: "Companies | CodeDot.AI",
    description: "Discover companies with transparent interview processes"
}

export default async function CompaniesPage() {
    const [companiesResult, featuredResult] = await Promise.all([
        browseCompanies({}, 1, 20),
        getFeaturedCompanies()
    ])

    const companies = companiesResult.success && companiesResult.data 
        ? companiesResult.data.companies 
        : []
    const pagination = companiesResult.success && companiesResult.data
        ? companiesResult.data.pagination
        : { page: 1, limit: 20, total: 0, totalPages: 0 }
    const featuredCompanies = featuredResult.success ? featuredResult.data || [] : []

    return (
        <Suspense 
            fallback={
                <div className="min-h-full flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
                </div>
            }
        >
            <CompaniesContent 
                initialCompanies={companies}
                initialPagination={pagination}
                featuredCompanies={featuredCompanies}
            />
        </Suspense>
    )
}