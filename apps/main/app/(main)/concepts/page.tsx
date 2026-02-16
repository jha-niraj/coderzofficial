'use client';

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import { ConceptCategory, ConceptDifficulty } from "@repo/prisma/client";
import { getConcepts, getUserProgress } from "@/actions/(main)/concepts/concept.action";
import { ConceptsContent } from "./_components/concepts-content";
import { ConceptsSidebar } from "./_components/concepts-sidebar";

const CATEGORY_LABELS: Record<ConceptCategory, string> = {
    WEB_DEVELOPMENT: "Web Development",
    MOBILE_DEVELOPMENT: "Mobile Development",
    DATA_STRUCTURES: "Data Structures",
    ALGORITHMS: "Algorithms",
    SYSTEM_DESIGN: "System Design",
    DATABASE: "Database",
    DEVOPS: "DevOps",
    CLOUD_COMPUTING: "Cloud Computing",
    MACHINE_LEARNING: "Machine Learning",
    ARTIFICIAL_INTELLIGENCE: "AI",
    CYBERSECURITY: "Cybersecurity",
    BLOCKCHAIN: "Blockchain",
    PROGRAMMING_FUNDAMENTALS: "Programming Fundamentals",
    SOFTWARE_ARCHITECTURE: "Software Architecture",
    API_DESIGN: "API Design",
    TESTING: "Testing",
    VERSION_CONTROL: "Version Control",
    UI_UX_DESIGN: "UI/UX Design",
    GAME_DEVELOPMENT: "Game Development",
    NETWORKING: "Networking",
    OPERATING_SYSTEMS: "Operating Systems",
    CUSTOM: "Custom",
};

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
                {[...Array(9)].map((_, i) => (
                    <Skeleton key={i} className="h-64 w-full rounded-xl" />
                ))}
            </div>
        </div>
    );
}

export default function ConceptsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    
    const [isLoading, setIsLoading] = useState(true);
    const [concepts, setConcepts] = useState<any[]>([]);
    const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 12, totalPages: 0 });
    const [userProgress, setUserProgress] = useState<any[]>([]);
    const [completedConcepts, setCompletedConcepts] = useState<any[]>([]);
    
    // Filter states
    const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
    const [selectedCategory, setSelectedCategory] = useState<ConceptCategory | null>(
        (searchParams.get("category") as ConceptCategory) || null
    );
    const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(
        searchParams.get("subCategory") || null
    );
    const [selectedDifficulty, setSelectedDifficulty] = useState<ConceptDifficulty | null>(
        (searchParams.get("difficulty") as ConceptDifficulty) || null
    );

    const loadConcepts = useCallback(async () => {
        setIsLoading(true);
        try {
            const [conceptsResult, progressResult] = await Promise.all([
                getConcepts({
                    search: searchQuery || undefined,
                    category: selectedCategory || undefined,
                    customCategory: selectedSubCategory || undefined,
                    difficulty: selectedDifficulty || undefined,
                    sortBy: "latest",
                    page: 1,
                    limit: 12,
                }),
                getUserProgress(),
            ]);

            setConcepts(conceptsResult.concepts || []);
            setPagination(conceptsResult.pagination || { total: 0, page: 1, limit: 12, totalPages: 0 });
            setUserProgress(progressResult.inProgress || []);
            setCompletedConcepts(progressResult.completed || []);
        } catch (error) {
            console.error("Failed to load concepts:", error);
        } finally {
            setIsLoading(false);
        }
    }, [searchQuery, selectedCategory, selectedSubCategory, selectedDifficulty]);

    useEffect(() => {
        loadConcepts();
    }, [loadConcepts]);

    // Update URL when filters change
    useEffect(() => {
        const params = new URLSearchParams();
        if (searchQuery) params.set("search", searchQuery);
        if (selectedCategory) params.set("category", selectedCategory);
        if (selectedSubCategory) params.set("subCategory", selectedSubCategory);
        if (selectedDifficulty) params.set("difficulty", selectedDifficulty);
        
        const newUrl = params.toString() ? `?${params.toString()}` : "";
        router.replace(`/concepts${newUrl}`, { scroll: false });
    }, [searchQuery, selectedCategory, selectedSubCategory, selectedDifficulty, router]);

    // Generate title based on selection
    const getTitle = () => {
        if (selectedSubCategory) {
            return selectedSubCategory;
        }
        if (selectedCategory) {
            return CATEGORY_LABELS[selectedCategory];
        }
        return "All Concepts";
    };

    return (
        <div className="flex h-[calc(100vh-4rem)]">
            {/* Sidebar */}
            <ConceptsSidebar
                selectedCategory={selectedCategory}
                selectedSubCategory={selectedSubCategory}
                selectedDifficulty={selectedDifficulty}
                onCategoryChange={setSelectedCategory}
                onSubCategoryChange={setSelectedSubCategory}
                onDifficultyChange={setSelectedDifficulty}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                totalConcepts={pagination.total}
            />

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                {isLoading ? (
                    <ContentSkeleton />
                ) : (
                    <Suspense fallback={<ContentSkeleton />}>
                        <ConceptsContent
                            concepts={concepts}
                            pagination={pagination}
                            userProgress={userProgress}
                            completedConcepts={completedConcepts}
                            isLoggedIn={true}
                            title={getTitle()}
                        />
                    </Suspense>
                )}
            </main>
        </div>
    );
}