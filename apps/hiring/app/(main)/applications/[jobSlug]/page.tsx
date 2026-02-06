import { Suspense } from "react"
import { notFound } from "next/navigation"
import { 
    getApplications, getJobBySlug 
} from "@/actions/applications"
import { JobApplicationsContent } from "./job-applications-content"
import type { ApplicationStatus } from "@/types"

interface JobApplicationsPageProps {
    params: Promise<{
        jobSlug: string
    }>
    searchParams: Promise<{
        page?: string
        status?: string
        search?: string
    }>
}

function LoadingSkeleton() {
    return (
        <div className="min-h-full p-6 lg:p-8 animate-pulse">
            <div className="h-8 w-64 bg-neutral-200 dark:bg-neutral-800 rounded-lg mb-2" />
            <div className="h-4 w-96 bg-neutral-200 dark:bg-neutral-800 rounded-lg mb-8" />

            <div className="flex gap-4 mb-6">
                <div className="h-10 w-64 bg-neutral-200 dark:bg-neutral-800 rounded-xl" />
                <div className="h-10 w-40 bg-neutral-200 dark:bg-neutral-800 rounded-xl" />
            </div>
            <div className="bg-white dark:bg-neutral-950 rounded-2xl border border-neutral-200 dark:border-neutral-800">
                <div className="p-4 border-b border-neutral-200 dark:border-neutral-800">
                    <div className="grid grid-cols-6 gap-4">
                        {
                            [...Array(6)].map((_, i) => (
                                <div key={i} className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded" />
                            ))
                        }
                    </div>
                </div>
                {
                    [...Array(10)].map((_, i) => (
                        <div key={i} className="p-4 border-b border-neutral-200 dark:border-neutral-800 last:border-b-0">
                            <div className="grid grid-cols-6 gap-4">
                                <div className="col-span-2 h-4 bg-neutral-200 dark:bg-neutral-800 rounded" />
                                <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded" />
                                <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded" />
                                <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded" />
                                <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded" />
                            </div>
                        </div>
                    ))
                }
            </div>
        </div>
    )
}

export default async function JobApplicationsPage({ params, searchParams }: JobApplicationsPageProps) {
    const { jobSlug } = await params
    const { page = "1", status, search } = await searchParams

    // Get job info
    const jobResult = await getJobBySlug(jobSlug)

    if (!jobResult.success || !jobResult.data) {
        notFound()
    }

    // Get applications for this job
    const applicationsResult = await getApplications(
        jobSlug,
        parseInt(page, 10),
        25, // 25 items per page
        {
            status: status ? (status.split(",") as ApplicationStatus[]) : undefined,
            search: search || undefined
        }
    )

    return (
        <Suspense fallback={<LoadingSkeleton />}>
            <JobApplicationsContent
                job={jobResult.data}
                initialApplications={applicationsResult.success ? applicationsResult.data! : {
                    applications: [],
                    total: 0,
                    page: 1,
                    pageSize: 25,
                    totalPages: 0
                }}
                initialFilters={{
                    status: status ? status.split(",") as ApplicationStatus[] : undefined,
                    search: search || undefined
                }}
            />
        </Suspense>
    )
}