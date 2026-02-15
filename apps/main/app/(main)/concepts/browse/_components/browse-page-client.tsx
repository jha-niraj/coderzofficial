"use client";

import { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
    Grid, List, Clock, Eye, Heart,
    ChevronLeft, ChevronRight, Plus, SortAsc, Lightbulb
} from "lucide-react";
import { Button } from "@repo/ui/components/ui/button";
import { Badge } from "@repo/ui/components/ui/badge";
import {
    Card,
} from "@repo/ui/components/ui/card";
import {
    Avatar, AvatarFallback, AvatarImage
} from "@repo/ui/components/ui/avatar";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@repo/ui/components/ui/select";
import { cn } from "@repo/ui/lib/utils";
import { ConceptCategory, ConceptDifficulty } from "@repo/prisma/client";
import { CATEGORIES } from "../_constants/filters";

interface Concept {
    id: string;
    slug: string;
    title: string;
    shortDescription?: string | null;
    description: string;
    thumbnail?: string | null;
    iconEmoji?: string | null;
    category: ConceptCategory;
    difficulty: ConceptDifficulty;
    estimatedTime?: number | null;
    viewCount: number;
    likeCount: number;
    creator: {
        id: string;
        name?: string | null;
        username?: string | null;
        image?: string | null;
    };
    _count: {
        steps: number;
        likes: number;
        comments: number;
    };
}

interface Category {
    category: ConceptCategory;
    _count: number;
}

interface Pagination {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

interface BrowsePageClientProps {
    initialConcepts: Concept[];
    categories?: Category[];
    pagination: Pagination;
    initialSearch?: string;
    initialCategory?: ConceptCategory;
    initialDifficulty?: ConceptDifficulty;
    initialSortBy: string;
}

const difficultyConfig: Record<ConceptDifficulty, { label: string; color: string }> = {
    BEGINNER: { label: "Beginner", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
    INTERMEDIATE: { label: "Intermediate", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" },
    ADVANCED: { label: "Advanced", color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" },
    EXPERT: { label: "Expert", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
};

function formatCount(count: number): string {
    if (count >= 1000) {
        return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
}

export default function BrowsePageClient({
    initialConcepts,
    pagination,
    initialSearch,
    initialCategory,
    initialSortBy,
}: BrowsePageClientProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [concepts] = useState(initialConcepts);
    const [sortBy, setSortBy] = useState(initialSortBy);
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

    const category = initialCategory || "All";
    const search = initialSearch || "";

    const updateFilters = useCallback((updates: Record<string, string | undefined>) => {
        const params = new URLSearchParams(searchParams.toString());

        Object.entries(updates).forEach(([key, value]) => {
            if (value && value !== "All") {
                params.set(key, value);
            } else {
                params.delete(key);
            }
        });

        params.delete("page");
        router.push(`/concepts/browse?${params.toString()}`);
    }, [router, searchParams]);

    const handleSortChange = (value: string) => {
        setSortBy(value);
        updateFilters({ sortBy: value });
    };

    const goToPage = (page: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", page.toString());
        router.push(`/concepts/browse?${params.toString()}`);
    };

    return (
        <div className="p-6 lg:p-10 space-y-8 bg-white dark:bg-neutral-950 min-h-screen">
            {/* Top Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                        {category === "All" ? "All Concepts" : CATEGORIES.find(c => c.value === category)?.label}
                    </h2>
                    <Badge variant="secondary" className="text-xs bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                        {pagination.total} results
                    </Badge>
                </div>
                <div className="flex items-center gap-3">
                    <Select value={sortBy} onValueChange={handleSortChange}>
                        <SelectTrigger className="w-40 h-9 text-xs rounded-lg border-neutral-200 dark:border-neutral-800">
                            <SortAsc className="w-3.5 h-3.5 mr-2 opacity-70" />
                            <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="latest">Latest</SelectItem>
                            <SelectItem value="popular">Most Popular</SelectItem>
                            <SelectItem value="views">Most Viewed</SelectItem>
                            <SelectItem value="likes">Most Liked</SelectItem>
                        </SelectContent>
                    </Select>
                    <div className="flex items-center border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
                        <button
                            onClick={() => setViewMode("grid")}
                            className={cn(
                                "p-2 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors",
                                viewMode === "grid" && "bg-neutral-100 dark:bg-neutral-800"
                            )}
                        >
                            <Grid className="w-4 h-4" />
                        </button>
                        <div className="w-[1px] h-4 bg-neutral-200 dark:bg-neutral-800" />
                        <button
                            onClick={() => setViewMode("list")}
                            className={cn(
                                "p-2 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors",
                                viewMode === "list" && "bg-neutral-100 dark:bg-neutral-800"
                            )}
                        >
                            <List className="w-4 h-4" />
                        </button>
                    </div>
                    <Link href="/concepts/create">
                        <Button size="sm" className="hidden sm:flex bg-neutral-900 dark:bg-white text-white dark:text-neutral-900">
                            <Plus className="w-4 h-4 mr-1.5" /> Create
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Content Grid */}
            {concepts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-xl">
                    <Lightbulb className="w-12 h-12 text-neutral-300 dark:text-neutral-700 mb-4" />
                    <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">No concepts found</h3>
                    <p className="text-neutral-500 max-w-sm mb-6">
                        {search ? `No results for "${search}".` : "Try adjusting your filters selected on the left."}
                    </p>
                    <Link href="/concepts/create">
                        <Button>Create Concept</Button>
                    </Link>
                </div>
            ) : (
                <div className={cn(
                    "grid gap-6",
                    viewMode === "grid"
                        ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
                        : "grid-cols-1"
                )}>
                    <AnimatePresence>
                        {concepts.map((concept, index) => (
                            <motion.div
                                key={concept.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <Link href={`/concepts/${concept.slug}`}>
                                    <Card className={cn(
                                        "group h-full overflow-hidden border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 hover:shadow-lg transition-all duration-300",
                                        viewMode === "list" && "flex flex-row h-40"
                                    )}>
                                        <div className={cn(
                                            "relative overflow-hidden bg-gradient-to-br from-neutral-100 to-neutral-50 dark:from-neutral-900 dark:to-neutral-950",
                                            viewMode === "grid" ? "h-40" : "w-48 shrink-0"
                                        )}>
                                            {concept.thumbnail ? (
                                                <Image
                                                    src={concept.thumbnail}
                                                    alt={concept.title}
                                                    fill
                                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                            ) : (
                                                <div className="absolute inset-0 flex items-center justify-center text-4xl">
                                                    {concept.iconEmoji || "📚"}
                                                </div>
                                            )}
                                            <div className="absolute top-2 right-2">
                                                <Badge className={difficultyConfig[concept.difficulty].color}>
                                                    {difficultyConfig[concept.difficulty].label}
                                                </Badge>
                                            </div>
                                        </div>
                                        <div className={cn(
                                            "p-5 flex flex-col justify-between",
                                            viewMode === "grid" ? "h-[calc(100%-10rem)]" : "w-full"
                                        )}>
                                            <div>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Badge variant="outline" className="text-[10px] h-5 px-1.5 border-neutral-200 dark:border-neutral-800 text-neutral-500">
                                                        {concept.category.replace(/_/g, " ")}
                                                    </Badge>
                                                    <div className="flex items-center gap-1 text-[10px] text-neutral-400">
                                                        <Clock className="w-3 h-3" />
                                                        <span>{concept.estimatedTime || 10}m</span>
                                                    </div>
                                                </div>
                                                <h3 className="font-semibold text-neutral-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1 mb-1.5">
                                                    {concept.title}
                                                </h3>
                                                <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2">
                                                    {concept.shortDescription || concept.description}
                                                </p>
                                            </div>

                                            <div className="flex items-center justify-between mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                                                <div className="flex items-center gap-1.5">
                                                    <Avatar className="w-5 h-5">
                                                        <AvatarImage src={concept.creator.image || ""} />
                                                        <AvatarFallback className="text-[10px]">{concept.creator.name?.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                    <span className="text-xs text-neutral-500">{concept.creator.name}</span>
                                                </div>
                                                <div className="flex items-center gap-3 text-xs text-neutral-400">
                                                    <div className="flex items-center gap-1">
                                                        <Eye className="w-3 h-3" /> {formatCount(concept.viewCount)}
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Heart className="w-3 h-3" /> {formatCount(concept.likeCount)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                </Link>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-8">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => goToPage(pagination.page - 1)}
                        disabled={pagination.page <= 1}
                        className="h-8 w-8 p-0"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-sm text-neutral-500">
                        Page {pagination.page} of {pagination.totalPages}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => goToPage(pagination.page + 1)}
                        disabled={pagination.page >= pagination.totalPages}
                        className="h-8 w-8 p-0"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
            )}
        </div>
    );
}