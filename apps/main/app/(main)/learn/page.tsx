import { Suspense } from "react";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import { LearnDifficulty } from "@repo/prisma/client";
import {
    getLearns, getHierarchicalCategories
} from "@/actions/(main)/learn/learn.action";
import { LearnsContent } from "./_components/learn-content";
import { LearnsSidebar } from "./_components/learn-sidebar";

function ContentSkeleton() {
    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <Skeleton className="h-8 w-48" />
                <div className="flex gap-2">
                    <Skeleton className="h-9 w-24" />
                    <Skeleton className="h-9 w-20" />
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {
                    [...Array(12)].map((_, i) => (
                        <Skeleton key={i} className="h-64 w-full rounded-xl" />
                    ))
                }
            </div>
        </div>
    );
}

interface PageProps {
    searchParams: Promise<{
        mainCategory?: string;
        search?: string;
        difficulty?: string;
    }>;
}

export default async function LearnsPage({ searchParams }: PageProps) {
    const params = await searchParams;
    const mainCategorySlug = params.mainCategory || null;
    const searchQuery = params.search || "";
    const difficulty = params.difficulty || null;

    // Fetch categories on the server
    const categoriesResult = await getHierarchicalCategories();
    const categories = categoriesResult.categories || [];

    // Resolve slug to ID for the getLearns API call
    let mainCategoryId: string | undefined;
    if (mainCategorySlug) {
        const found = categories.find(c => c.slug === mainCategorySlug);
        mainCategoryId = found?.id;
    }

    // Fetch learns on the server
    const learnsResult = await getLearns({
        search: searchQuery || undefined,
        mainCategoryId,
        difficulty: (difficulty as LearnDifficulty) || undefined,
        sortBy: "latest",
        page: 1,
        limit: 12,
    });

    const learns = learnsResult.learns || [];
    const pagination = learnsResult.pagination || { total: 0, page: 1, limit: 12, totalPages: 0 };

    // Generate title based on selection
    let title = "All Learns";
    if (mainCategorySlug && categories.length > 0) {
        const main = categories.find(c => c.slug === mainCategorySlug);
        if (main) title = main.name;
    }
    if (searchQuery) title = `Search: "${searchQuery}"`;

    return (
        <div className="flex h-screen">
            <LearnsSidebar
                categories={categories}
                selectedMainCategorySlug={mainCategorySlug}
                searchQuery={searchQuery}
                totalLearns={pagination.total}
            />

            <main className="flex-1 overflow-auto">
                <Suspense fallback={<ContentSkeleton />}>
                    <LearnsContent
                        learns={learns}
                        pagination={pagination}
                        isLoggedIn={true}
                        title={title}
                        categories={categories}
                        selectedMainCategorySlug={mainCategorySlug}
                        initialSearchQuery={searchQuery}
                        initialDifficulty={difficulty}
                    />
                </Suspense>
            </main>
        </div>
    );
}