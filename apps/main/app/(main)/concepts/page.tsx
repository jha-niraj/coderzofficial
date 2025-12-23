import { Suspense } from "react";
import { Metadata } from "next";
import { auth } from "@/auth";
import {
    getConcepts, getTrendingConcepts, getCategories, getUserProgress
} from "@/actions/(main)/concepts/concept.action";
import ConceptsHero from "./_components/concepts-hero";
import {
    ConceptsHeroSkeleton, CategoriesGridSkeleton, TrendingConceptsSkeleton,
    ContinueLearningSkeleton, RecentConceptsSkeleton
} from "./_components/skeletons";
import ContinueLearningSection from "./_components/continue-learning-section";
import CategoriesGrid from "./_components/categories-grid";
import TrendingConcepts from "./_components/trending-concepts";
import RecentConcepts from "./_components/recent-concepts";

export const metadata: Metadata = {
    title: "Concepts Hub | TheCoderz",
    description:
        "Learn programming concepts from basics to advanced. Interactive card-based learning with code examples, quizzes, and challenges.",
};

export default async function ConceptsPage() {
    const session = await auth();
    const userId = session?.user?.id;

    const [
        trendingResult,
        categoriesResult,
        recentResult,
        progressResult,
    ] = await Promise.all([
        getTrendingConcepts(6),
        getCategories(),
        getConcepts({ limit: 8, sortBy: "latest" }),
        userId ? getUserProgress() : Promise.resolve({ inProgress: [], completed: [] }),
    ]);

    const trending = trendingResult.concepts || [];
    const categories = categoriesResult.categories || [];
    const recentConcepts = recentResult.concepts || [];
    const inProgress = progressResult.inProgress || [];

    return (
        <div className="min-h-screen bg-white dark:bg-neutral-950">
            <Suspense fallback={<ConceptsHeroSkeleton />}>
                <ConceptsHero />
            </Suspense>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
                {
                    userId && inProgress.length > 0 && (
                        <Suspense fallback={<ContinueLearningSkeleton />}>
                            <ContinueLearningSection progress={inProgress} />
                        </Suspense>
                    )
                }
                <Suspense fallback={<CategoriesGridSkeleton />}>
                    <CategoriesGrid categories={categories} />
                </Suspense>
                <Suspense fallback={<TrendingConceptsSkeleton />}>
                    <TrendingConcepts concepts={trending} />
                </Suspense>
                <Suspense fallback={<RecentConceptsSkeleton />}>
                    <RecentConcepts concepts={recentConcepts} />
                </Suspense>
            </div>
        </div>
    );
}