'use client'

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
    Grid, List, Clock, Eye, Heart, ChevronLeft, ChevronRight,
    Lightbulb, BookOpen, BarChart3, Bookmark,
    Filter, Code, Layers
} from "lucide-react";
import { Button } from "@repo/ui/components/ui/button";
import { Badge } from "@repo/ui/components/ui/badge";
import { Card } from "@repo/ui/components/ui/card";
import {
    Tabs, TabsContent, TabsList, TabsTrigger
} from "@repo/ui/components/ui/tabs";
import { cn } from "@repo/ui/lib/utils";
import { LearnDifficulty } from "@repo/prisma/client";
import type { LearnListItem, LearnCategory, LearnSubCategory } from "@/types/learn";
import { MyProgressTab } from "./my-progress-tab";
import { BookmarksTab } from "./bookmarks-tab";

interface Pagination {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

interface LearnsContentProps {
    learns: LearnListItem[];
    pagination: Pagination;
    isLoggedIn: boolean;
    title?: string;
    /** The categories list (used for browsing when no category is selected) */
    categories?: LearnCategory[];
    /** Currently selected main category slug (if any) */
    selectedMainCategorySlug?: string | null;
    /** Initial search query from server */
    initialSearchQuery?: string;
    /** Initial difficulty filter from server */
    initialDifficulty?: string | null;
}

const difficultyConfig: Record<LearnDifficulty, { label: string; color: string }> = {
    BEGINNER: { label: "Beginner", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
    INTERMEDIATE: { label: "Intermediate", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" },
    ADVANCED: { label: "Advanced", color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" },
    EXPERT: { label: "Expert", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
};

const DIFFICULTY_HEADER_FILTERS = [
    { key: "BEGINNER", label: "Beginner", activeBg: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" },
    { key: "INTERMEDIATE", label: "Intermediate", activeBg: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400" },
    { key: "ADVANCED", label: "Advanced", activeBg: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400" },
    { key: "EXPERT", label: "Expert", activeBg: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400" },
];

function formatCount(count: number): string {
    if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
    return count.toString();
}

// Category card colors
const CATEGORY_COLORS = [
    "from-blue-500/10 to-blue-600/5 border-blue-200 dark:border-blue-800 hover:border-blue-300 dark:hover:border-blue-700",
    "from-purple-500/10 to-purple-600/5 border-purple-200 dark:border-purple-800 hover:border-purple-300 dark:hover:border-purple-700",
    "from-green-500/10 to-green-600/5 border-green-200 dark:border-green-800 hover:border-green-300 dark:hover:border-green-700",
    "from-orange-500/10 to-orange-600/5 border-orange-200 dark:border-orange-800 hover:border-orange-300 dark:hover:border-orange-700",
    "from-pink-500/10 to-pink-600/5 border-pink-200 dark:border-pink-800 hover:border-pink-300 dark:hover:border-pink-700",
    "from-cyan-500/10 to-cyan-600/5 border-cyan-200 dark:border-cyan-800 hover:border-cyan-300 dark:hover:border-cyan-700",
    "from-amber-500/10 to-amber-600/5 border-amber-200 dark:border-amber-800 hover:border-amber-300 dark:hover:border-amber-700",
    "from-indigo-500/10 to-indigo-600/5 border-indigo-200 dark:border-indigo-800 hover:border-indigo-300 dark:hover:border-indigo-700",
];

const CATEGORY_TEXT_COLORS = [
    "text-blue-600 dark:text-blue-400",
    "text-purple-600 dark:text-purple-400",
    "text-green-600 dark:text-green-400",
    "text-orange-600 dark:text-orange-400",
    "text-pink-600 dark:text-pink-400",
    "text-cyan-600 dark:text-cyan-400",
    "text-amber-600 dark:text-amber-400",
    "text-indigo-600 dark:text-indigo-400",
];

export function LearnsContent({
    learns,
    pagination,
    isLoggedIn,
    title = "All Learns",
    categories = [],
    selectedMainCategorySlug,
    initialSearchQuery,
    initialDifficulty,
}: LearnsContentProps) {
    const router = useRouter();
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [activeTab, setActiveTab] = useState("browse");

    // Find the selected main category object for showing subcategories
    const selectedMainCategory = selectedMainCategorySlug
        ? categories.find(c => c.slug === selectedMainCategorySlug)
        : null;

    // Determine what to show on the right side:
    // 1. No category selected & no search → Show main categories
    // 2. Main category selected → Show subcategories
    // 3. Search active → Show matched learns
    const hasSearch = !!initialSearchQuery;
    const showMainCategories = !selectedMainCategorySlug && !hasSearch;
    const showSubCategories = !!selectedMainCategorySlug && !!selectedMainCategory && !hasSearch;
    const showLearns = hasSearch || (!!selectedMainCategorySlug && !selectedMainCategory);

    // Difficulty filter via URL
    const handleDifficultyChange = (diff: LearnDifficulty | null) => {
        const params = new URLSearchParams();
        if (selectedMainCategorySlug) params.set("mainCategory", selectedMainCategorySlug);
        if (initialSearchQuery) params.set("search", initialSearchQuery);
        if (diff) params.set("difficulty", diff);
        const url = params.toString() ? `/learn?${params.toString()}` : "/learn";
        router.push(url);
    };

    return (
        <div className="p-6 lg:p-8 h-full overflow-y-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <TabsList className="bg-neutral-100 dark:bg-neutral-800/50 h-9">
                        <TabsTrigger value="browse" className="flex items-center gap-1.5 text-xs px-3 h-7">
                            <BookOpen className="w-3.5 h-3.5 text-blue-500" /> Browse
                        </TabsTrigger>
                        {isLoggedIn && (
                            <>
                                <TabsTrigger value="progress" className="flex items-center gap-1.5 text-xs px-3 h-7">
                                    <BarChart3 className="w-3.5 h-3.5 text-emerald-500" /> My Progress
                                </TabsTrigger>
                                <TabsTrigger value="bookmarks" className="flex items-center gap-1.5 text-xs px-3 h-7">
                                    <Bookmark className="w-3.5 h-3.5 text-yellow-500" /> Bookmarks
                                </TabsTrigger>
                            </>
                        )}
                    </TabsList>

                    {activeTab === "browse" && showLearns && (
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-0.5 border border-neutral-200 dark:border-neutral-800 rounded-lg p-0.5">
                                <span className="px-1.5 text-neutral-400"><Filter className="w-3 h-3" /></span>
                                {DIFFICULTY_HEADER_FILTERS.map((diff) => {
                                    const isActive = initialDifficulty === diff.key;
                                    return (
                                        <button
                                            key={diff.key}
                                            onClick={() => handleDifficultyChange(
                                                isActive ? null : diff.key as LearnDifficulty
                                            )}
                                            className={cn(
                                                "px-2 py-1.5 rounded-md text-xs font-medium transition-all",
                                                isActive
                                                    ? diff.activeBg
                                                    : "text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                                            )}
                                        >
                                            {diff.label}
                                        </button>
                                    );
                                })}
                            </div>

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
                        </div>
                    )}
                </div>

                {/* ======= BROWSE TAB ======= */}
                <TabsContent value="browse" className="mt-0">
                    {/* Show Main Categories (default view - nothing selected) */}
                    {showMainCategories && (
                        <div>
                            <div className="flex items-center gap-2 mb-6">
                                <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                                    Explore Categories
                                </h2>
                                <Badge variant="secondary" className="text-xs">
                                    {categories.length} categories
                                </Badge>
                            </div>
                            {categories.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-xl">
                                    <Lightbulb className="w-12 h-12 text-neutral-300 dark:text-neutral-700 mb-4" />
                                    <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
                                        No categories found
                                    </h3>
                                    <p className="text-neutral-500 max-w-sm">
                                        Categories will appear here once they are created.
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {categories.map((category, index) => {
                                        const colorIdx = index % CATEGORY_COLORS.length;
                                        const learnCount = category._count?.learns || 0;
                                        const subCount = category.subCategories?.length || 0;

                                        return (
                                            <motion.div
                                                key={category.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                            >
                                                <Link href={`/learn?mainCategory=${category.slug}`}>
                                                    <Card className={cn(
                                                        "group p-6 border bg-gradient-to-br transition-all duration-300 hover:shadow-lg cursor-pointer h-full",
                                                        CATEGORY_COLORS[colorIdx]
                                                    )}>
                                                        <div className="flex items-start justify-between mb-4">
                                                            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-white/50 dark:bg-neutral-900/50">
                                                                {category.icon || "📁"}
                                                            </div>
                                                            <ChevronRight className="w-5 h-5 text-neutral-400 group-hover:translate-x-1 transition-transform" />
                                                        </div>
                                                        <h3 className={cn(
                                                            "text-lg font-semibold mb-1",
                                                            CATEGORY_TEXT_COLORS[colorIdx]
                                                        )}>
                                                            {category.name}
                                                        </h3>
                                                        {category.description && (
                                                            <p className="text-sm text-neutral-500 dark:text-neutral-400 line-clamp-2 mb-3">
                                                                {category.description}
                                                            </p>
                                                        )}
                                                        <div className="flex items-center gap-3 text-xs text-neutral-500">
                                                            <span className="flex items-center gap-1">
                                                                <Layers className="w-3 h-3" />
                                                                {subCount} subcategories
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <BookOpen className="w-3 h-3" />
                                                                {learnCount} learns
                                                            </span>
                                                        </div>
                                                    </Card>
                                                </Link>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Show Subcategories of selected main category */}
                    {showSubCategories && selectedMainCategory && (
                        <div>
                            <div className="flex items-center gap-2 mb-6">
                                <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                                    {selectedMainCategory.name}
                                </h2>
                                <Badge variant="secondary" className="text-xs">
                                    {selectedMainCategory.subCategories?.length || 0} subcategories
                                </Badge>
                            </div>
                            {(!selectedMainCategory.subCategories || selectedMainCategory.subCategories.length === 0) ? (
                                <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-xl">
                                    <Lightbulb className="w-12 h-12 text-neutral-300 dark:text-neutral-700 mb-4" />
                                    <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
                                        No subcategories yet
                                    </h3>
                                    <p className="text-neutral-500 max-w-sm">
                                        Subcategories will appear here once they are added.
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {selectedMainCategory.subCategories.map((sub: LearnSubCategory, index: number) => {
                                        const colorIdx = index % CATEGORY_COLORS.length;
                                        const learnCount = sub._count?.learns || 0;

                                        return (
                                            <motion.div
                                                key={sub.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                            >
                                                <Link href={`/learn/${sub.slug}`}>
                                                    <Card className={cn(
                                                        "group p-6 border bg-gradient-to-br transition-all duration-300 hover:shadow-lg cursor-pointer h-full",
                                                        CATEGORY_COLORS[colorIdx]
                                                    )}>
                                                        <div className="flex items-start justify-between mb-4">
                                                            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-white/50 dark:bg-neutral-900/50">
                                                                <Code className={cn("w-6 h-6", CATEGORY_TEXT_COLORS[colorIdx])} />
                                                            </div>
                                                            <ChevronRight className="w-5 h-5 text-neutral-400 group-hover:translate-x-1 transition-transform" />
                                                        </div>
                                                        <h3 className={cn(
                                                            "text-lg font-semibold mb-1",
                                                            CATEGORY_TEXT_COLORS[colorIdx]
                                                        )}>
                                                            {sub.name}
                                                        </h3>
                                                        {sub.description && (
                                                            <p className="text-sm text-neutral-500 dark:text-neutral-400 line-clamp-2 mb-3">
                                                                {sub.description}
                                                            </p>
                                                        )}
                                                        <div className="flex items-center gap-3 text-xs text-neutral-500">
                                                            <span className="flex items-center gap-1">
                                                                <BookOpen className="w-3 h-3" />
                                                                {learnCount} learns
                                                            </span>
                                                        </div>
                                                    </Card>
                                                </Link>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Show Learns (when search is active) */}
                    {showLearns && (
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                                    {title}
                                </h2>
                                <Badge variant="secondary" className="text-xs">
                                    {pagination.total} results
                                </Badge>
                            </div>

                            {learns.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-xl">
                                    <Lightbulb className="w-12 h-12 text-neutral-300 dark:text-neutral-700 mb-4" />
                                    <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
                                        No Learns found
                                    </h3>
                                    <p className="text-neutral-500 max-w-sm mb-6">
                                        Try adjusting your filters or search query.
                                    </p>
                                </div>
                            ) : (
                                <div className={cn(
                                    "grid gap-6",
                                    viewMode === "grid"
                                        ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
                                        : "grid-cols-1"
                                )}>
                                    <AnimatePresence>
                                        {learns.map((learn, index) => (
                                            <motion.div
                                                key={learn.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                            >
                                                <Link href={`/learn/${learn.subCategory?.slug || 'topic'}/${learn.slug}`}>
                                                    <Card className={cn(
                                                        "group h-full overflow-hidden border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 hover:shadow-lg transition-all duration-300",
                                                        viewMode === "list" && "flex flex-row h-40"
                                                    )}>
                                                        <div className={cn(
                                                            "relative overflow-hidden bg-gradient-to-br from-neutral-100 to-neutral-50 dark:from-neutral-900 dark:to-neutral-950",
                                                            viewMode === "grid" ? "h-40" : "w-48 shrink-0"
                                                        )}>
                                                            {learn.thumbnail ? (
                                                                <Image
                                                                    src={learn.thumbnail || ""}
                                                                    alt={learn.title}
                                                                    fill
                                                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                                />
                                                            ) : (
                                                                <div className="absolute inset-0 flex items-center justify-center text-4xl">
                                                                    {learn.iconEmoji || "📚"}
                                                                </div>
                                                            )}
                                                            <div className="absolute top-2 right-2">
                                                                <Badge className={difficultyConfig[learn.difficulty as LearnDifficulty]?.color}>
                                                                    {difficultyConfig[learn.difficulty as LearnDifficulty]?.label}
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                        <div className={cn(
                                                            "p-5 flex flex-col justify-between",
                                                            viewMode === "grid" ? "h-[calc(100%-10rem)]" : "w-full"
                                                        )}>
                                                            <div>
                                                                <div className="flex items-center gap-2 mb-2">
                                                                    <div className="flex items-center gap-1 text-[10px] text-neutral-400">
                                                                        <Clock className="w-3 h-3" />
                                                                        <span>{learn.estimatedTime || 10}m</span>
                                                                    </div>
                                                                </div>
                                                                <h3 className="font-semibold text-neutral-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1 mb-1.5">
                                                                    {learn.title}
                                                                </h3>
                                                                <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2">
                                                                    {learn.description}
                                                                </p>
                                                            </div>
                                                            <div className="flex items-center justify-end mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                                                                <div className="flex items-center gap-3 text-xs text-neutral-400">
                                                                    <div className="flex items-center gap-1">
                                                                        <Eye className="w-3 h-3" /> {formatCount(learn.viewCount || 0)}
                                                                    </div>
                                                                    <div className="flex items-center gap-1">
                                                                        <Heart className="w-3 h-3" /> {formatCount(learn.likeCount || 0)}
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

                            {pagination.totalPages > 1 && (
                                <div className="flex items-center justify-center gap-2 pt-8">
                                    <Button
                                        variant="outline"
                                        size="sm"
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
                                        disabled={pagination.page >= pagination.totalPages}
                                        className="h-8 w-8 p-0"
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* When main category selected but no subcategories and no learns */}
                    {!showMainCategories && !showSubCategories && !showLearns && (
                        <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-xl">
                            <Lightbulb className="w-12 h-12 text-neutral-300 dark:text-neutral-700 mb-4" />
                            <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
                                No content found
                            </h3>
                            <p className="text-neutral-500 max-w-sm">
                                Try selecting a different category or clearing your search.
                            </p>
                        </div>
                    )}
                </TabsContent>

                {/* ======= MY PROGRESS TAB ======= */}
                {isLoggedIn && (
                    <TabsContent value="progress" className="mt-0">
                        <MyProgressTab />
                    </TabsContent>
                )}

                {/* ======= BOOKMARKS TAB ======= */}
                {isLoggedIn && (
                    <TabsContent value="bookmarks" className="mt-0">
                        <BookmarksTab />
                    </TabsContent>
                )}
            </Tabs>
        </div>
    );
}