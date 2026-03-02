import { Suspense } from "react";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import {
    getProblemsForModule, getCategoriesForModule, getLeaderboard
} from "@/actions/(main)/practice";
import { ModuleContent } from "../_components/module-content";

function ContentSkeleton() {
    return (
        <div className="p-6 space-y-6">
            <Skeleton className="h-8 w-48" />
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {
                    [...Array(6)].map((_, i) => (
                        <Skeleton key={i} className="h-36 w-full rounded-xl" />
                    ))
                }
            </div>
        </div>
    );
}

interface PageProps {
    searchParams: Promise<{
        topic?: string;
    }>;
}

export default async function WebFrontendPracticePage({ searchParams }: PageProps) {
    const params = await searchParams;
    const topic = params.topic ?? null;

    const [problems, categories, leaderboard] = await Promise.all([
        getProblemsForModule("WEB_FRONTEND", topic ?? undefined),
        getCategoriesForModule("WEB_FRONTEND"),
        getLeaderboard("WEB_FRONTEND", 10),
    ]);

    return (
        <div className="flex-1 overflow-auto">
            <Suspense fallback={<ContentSkeleton />}>
                <ModuleContent
                    module="WEB_FRONTEND"
                    moduleLabel="Web Frontend"
                    problems={problems}
                    categories={categories}
                    leaderboard={leaderboard}
                    activeCategory={topic}
                />
            </Suspense>
        </div>
    );
}