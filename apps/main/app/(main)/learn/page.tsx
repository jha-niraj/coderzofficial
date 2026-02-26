'use client';

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import { LearnDifficulty } from "@repo/prisma/client";
import {
    getLearns, getUserProgress, getHierarchicalCategories
} from "@/actions/(main)/learn/learn.action";
import { LearnsContent } from "./_components/learn-content";
import { LearnsSidebar } from "./_components/learn-sidebar";
import type { LearnCategory, LearnSubCategory, LearnListItem, LearnProgressItem } from "@/types/learn";

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
                    [...Array(9)].map((_, i) => (
                        <Skeleton key={i} className="h-64 w-full rounded-xl" />
                    ))
                }
            </div>
        </div>
    );
}

export default function LearnsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [isLoading, setIsLoading] = useState(true);
    const [learns, setLearns] = useState<LearnListItem[]>([]);
    const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 12, totalPages: 0 });
    const [userProgress, setUserProgress] = useState<LearnProgressItem[]>([]);
    const [completedLearns, setCompletedLearns] = useState<LearnProgressItem[]>([]);
    const [categories, setCategories] = useState<LearnCategory[]>([]);

    // Filter states
    const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
    const [selectedMainCategoryId, setSelectedMainCategoryId] = useState<string | null>(
        searchParams.get("mainCategory") || null
    );
    const [selectedSubCategoryId, setSelectedSubCategoryId] = useState<string | null>(
        searchParams.get("subCategory") || null
    );
    // Keep old category/subCategory just in case but we prioritize hierarchical
    const [selectedDifficulty, setSelectedDifficulty] = useState<LearnDifficulty | null>(
        (searchParams.get("difficulty") as LearnDifficulty) || null
    );

    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [LearnsResult, progressResult, categoriesResult] = await Promise.all([
                getLearns({
                    search: searchQuery || undefined,
                    mainCategoryId: selectedMainCategoryId || undefined,
                    subCategoryId: selectedSubCategoryId || undefined,
                    difficulty: selectedDifficulty || undefined,
                    sortBy: "latest",
                    page: 1,
                    limit: 12,
                }),
                getUserProgress(),
                getHierarchicalCategories(),
            ]);

            setLearns(LearnsResult.learns || []); // Use lowercase learns from result
            setPagination(LearnsResult.pagination || { total: 0, page: 1, limit: 12, totalPages: 0 });
            setUserProgress(progressResult.inProgress || []);
            setCompletedLearns(progressResult.completed || []);
            setCategories(categoriesResult.categories || []);
        } catch (error) {
            console.error("Failed to load Learns:", error);
        } finally {
            setIsLoading(false);
        }
    }, [searchQuery, selectedMainCategoryId, selectedSubCategoryId, selectedDifficulty]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // Update URL when filters change
    useEffect(() => {
        const params = new URLSearchParams();
        if (searchQuery) params.set("search", searchQuery);
        if (selectedMainCategoryId) params.set("mainCategory", selectedMainCategoryId);
        if (selectedSubCategoryId) params.set("subCategory", selectedSubCategoryId);
        if (selectedDifficulty) params.set("difficulty", selectedDifficulty);

        const newUrl = params.toString() ? `?${params.toString()}` : "";
        router.replace(`/learn${newUrl}`, { scroll: false });
    }, [searchQuery, selectedMainCategoryId, selectedSubCategoryId, selectedDifficulty, router]);

    // Generate title based on selection
    const getTitle = () => {
        if (selectedSubCategoryId && categories.length > 0) {
            // Find subcategory name
            for (const cat of categories) {
                const sub = cat.subCategories.find((s: LearnSubCategory) => s.id === selectedSubCategoryId);
                if (sub) return sub.name;
            }
        }
        if (selectedMainCategoryId && categories.length > 0) {
            const main = categories.find(c => c.id === selectedMainCategoryId);
            if (main) return main.name;
        }
        return "All Learns";
    };

    return (
        <div className="flex h-screen">
            <LearnsSidebar
                categories={categories}
                selectedMainCategoryId={selectedMainCategoryId}
                selectedSubCategoryId={selectedSubCategoryId}
                selectedDifficulty={selectedDifficulty}
                onMainCategoryChange={setSelectedMainCategoryId}
                onSubCategoryChange={setSelectedSubCategoryId}
                onDifficultyChange={setSelectedDifficulty}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                totalLearns={pagination.total}
            />

            <main className="flex-1 overflow-auto">
                {
                    isLoading ? (
                        <ContentSkeleton />
                    ) : (
                        <Suspense fallback={<ContentSkeleton />}>
                            <LearnsContent
                                learns={learns} // Use renamed state
                                pagination={pagination}
                                userProgress={userProgress}
                                completedLearns={completedLearns}
                                isLoggedIn={true}
                                title={getTitle()}
                                selectedDifficulty={selectedDifficulty}
                                onDifficultyChange={setSelectedDifficulty}
                            />
                        </Suspense>
                    )
                }
            </main>
        </div>
    );
}