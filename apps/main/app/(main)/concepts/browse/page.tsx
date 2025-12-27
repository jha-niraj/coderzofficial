import { Metadata } from "next";
import {
    getConcepts, getCategories
} from "@/actions/(main)/concepts/concept.action";
import { ConceptCategory, ConceptDifficulty } from "@repo/prisma/client";
import BrowsePageClient from "./_components/browse-page-client";

export const metadata: Metadata = {
    title: "Browse Concepts | TheCoderz",
    description: "Explore all programming concepts organized by category and difficulty",
};

interface BrowsePageProps {
    searchParams: Promise<{
        search?: string;
        category?: ConceptCategory;
        difficulty?: ConceptDifficulty;
        sortBy?: "latest" | "popular" | "views" | "likes";
        page?: string;
    }>;
}

export default async function BrowsePage({ searchParams }: BrowsePageProps) {
    const params = await searchParams;
    const page = parseInt(params.page || "1", 10);

    const [conceptsResult, categoriesResult] = await Promise.all([
        getConcepts({
            search: params.search,
            category: params.category,
            difficulty: params.difficulty,
            sortBy: params.sortBy || "latest",
            page,
            limit: 12,
        }),
        getCategories(),
    ]);

    const concepts = conceptsResult.concepts || [];
    const pagination = conceptsResult.pagination || { total: 0, page: 1, limit: 12, totalPages: 0 };
    const categories = categoriesResult.categories || [];

    return (
        <BrowsePageClient
            initialConcepts={concepts}
            categories={categories}
            pagination={pagination}
            initialSearch={params.search}
            initialCategory={params.category}
            initialDifficulty={params.difficulty}
            initialSortBy={params.sortBy || "latest"}
        />
    );
}