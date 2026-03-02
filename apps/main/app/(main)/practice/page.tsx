import { Suspense } from "react";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import { getUserPracticeStats } from "@/actions/(main)/practice";
import { PracticeDashboard } from "./_components/practice-dashboard";

function DashboardSkeleton() {
    return (
        <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {
                    [...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="h-28 w-full rounded-xl" />
                    ))
                }
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Skeleton className="h-64 w-full rounded-xl" />
                <Skeleton className="h-64 w-full rounded-xl" />
            </div>
            <Skeleton className="h-80 w-full rounded-xl" />
        </div>
    );
}

export default async function PracticePage() {
    const stats = await getUserPracticeStats();

    return (
        <div className="flex-1 overflow-auto">
            <Suspense fallback={<DashboardSkeleton />}>
                <PracticeDashboard stats={stats} />
            </Suspense>
        </div>
    );
}