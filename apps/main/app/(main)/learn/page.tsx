import { Suspense } from "react";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import { LearnDifficulty } from "@repo/prisma/client";
import {
    getLearns, getHierarchicalCategories
} from "@/actions/(main)/learn/learn.action";
import { LearnsContent } from "./_components/learn-content";

function ContentSkeleton() {
    return (
        <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-10 w-full max-w-md" />
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {
                    [...Array(9)].map((_, i) => (
                        <Skeleton key={i} className="h-56 w-full rounded-xl" />
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

    const categoriesResult = await getHierarchicalCategories();
    const categories = categoriesResult.categories || [];

    let mainCategoryId: string | undefined;
    if (mainCategorySlug) {
        const found = categories.find(c => c.slug === mainCategorySlug);
        mainCategoryId = found?.id;
    }

    const learnsResult = await getLearns({
        search: searchQuery || undefined,
        mainCategoryId,
        difficulty: (difficulty as LearnDifficulty) || undefined,
        sortBy: "latest",
        page: 1,
        limit: 18,
    });

    const learns = learnsResult.learns || [];
    const pagination = learnsResult.pagination || { total: 0, page: 1, limit: 18, totalPages: 0 };

    let title = "All Learns";
    if (mainCategorySlug && categories.length > 0) {
        const main = categories.find(c => c.slug === mainCategorySlug);
        if (main) title = main.name;
    }
    if (searchQuery) title = `Search: "${searchQuery}"`;

    return (
        <main>
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
    );
}