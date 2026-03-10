'use client'

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
    Search, Grid, List, Clock, Eye, Heart, ChevronLeft, ChevronRight,
    Lightbulb, BookOpen, BarChart3, Bookmark, Filter, Code, Layers,
    ArrowRight, X
} from "lucide-react";
import { Button } from "@repo/ui/components/ui/button";
import { Badge } from "@repo/ui/components/ui/badge";
import { Card } from "@repo/ui/components/ui/card";
import { Input } from "@repo/ui/components/ui/input";
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
    categories?: LearnCategory[];
    selectedMainCategorySlug?: string | null;
    initialSearchQuery?: string;
    initialDifficulty?: string | null;
}

const difficultyConfig: Record<LearnDifficulty, { label: string; color: string; dot: string }> = {
    BEGINNER: { label: "Beginner", color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800", dot: "bg-emerald-500" },
    INTERMEDIATE: { label: "Intermediate", color: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800", dot: "bg-amber-500" },
    ADVANCED: { label: "Advanced", color: "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800", dot: "bg-orange-500" },
    EXPERT: { label: "Expert", color: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800", dot: "bg-red-500" },
};

const DIFFICULTY_FILTERS = [
    { key: "BEGINNER", label: "Beginner", dot: "bg-emerald-500" },
    { key: "INTERMEDIATE", label: "Intermediate", dot: "bg-amber-500" },
    { key: "ADVANCED", label: "Advanced", dot: "bg-orange-500" },
    { key: "EXPERT", label: "Expert", dot: "bg-red-500" },
];

function formatCount(count: number): string {
    if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
    return count.toString();
}

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
    const [searchQuery, setSearchQuery] = useState(initialSearchQuery || "");

    const selectedMainCategory = selectedMainCategorySlug
        ? categories.find(c => c.slug === selectedMainCategorySlug)
        : null;

    const hasSearch = !!initialSearchQuery;
    const showMainCategories = !selectedMainCategorySlug && !hasSearch;
    const showSubCategories = !!selectedMainCategorySlug && !!selectedMainCategory && !hasSearch;
    const showLearns = hasSearch || (!!selectedMainCategorySlug && !selectedMainCategory);

    useEffect(() => {
        const timeout = setTimeout(() => {
            if (searchQuery !== (initialSearchQuery || "")) {
                const params = new URLSearchParams();
                if (searchQuery) params.set("search", searchQuery);
                if (selectedMainCategorySlug) params.set("mainCategory", selectedMainCategorySlug);
                const url = params.toString() ? `/learn?${params.toString()}` : "/learn";
                router.push(url);
            }
        }, 400);
        return () => clearTimeout(timeout);
    }, [searchQuery, initialSearchQuery, selectedMainCategorySlug, router]);

    const handleDifficultyChange = (diff: LearnDifficulty | null) => {
        const params = new URLSearchParams();
        if (selectedMainCategorySlug) params.set("mainCategory", selectedMainCategorySlug);
        if (initialSearchQuery) params.set("search", initialSearchQuery);
        if (diff) params.set("difficulty", diff);
        const url = params.toString() ? `/learn?${params.toString()}` : "/learn";
        router.push(url);
    };

    const clearSearch = () => {
        setSearchQuery("");
        const params = new URLSearchParams();
        if (selectedMainCategorySlug) params.set("mainCategory", selectedMainCategorySlug);
        router.push(params.toString() ? `/learn?${params.toString()}` : "/learn");
    };

    return (
        <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="flex flex-col gap-4 mb-6">
                    <div className="flex items-center justify-between">
                        <TabsList className="bg-neutral-100 dark:bg-neutral-800/50">
                            <TabsTrigger value="browse" className="flex items-center gap-1.5 text-xs px-3">
                                <BookOpen className="w-3.5 h-3.5" /> Browse
                            </TabsTrigger>
                            {
                                isLoggedIn && (
                                    <>
                                        <TabsTrigger value="progress" className="flex items-center gap-1.5 text-xs px-3">
                                            <BarChart3 className="w-3.5 h-3.5" /> My Progress
                                        </TabsTrigger>
                                        <TabsTrigger value="bookmarks" className="flex items-center gap-1.5 text-xs px-3">
                                            <Bookmark className="w-3.5 h-3.5" /> Bookmarks
                                        </TabsTrigger>
                                    </>
                                )
                            }
                        </TabsList>

                        {
                            activeTab === "browse" && (
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
                                        <button
                                            onClick={() => setViewMode("grid")}
                                            className={cn(
                                                "p-1.5 transition-colors",
                                                viewMode === "grid" ? "bg-neutral-100 dark:bg-neutral-800" : "hover:bg-neutral-50 dark:hover:bg-neutral-900"
                                            )}
                                        >
                                            <Grid className="w-3.5 h-3.5" />
                                        </button>
                                        <div className="w-[1px] h-4 bg-neutral-200 dark:bg-neutral-800" />
                                        <button
                                            onClick={() => setViewMode("list")}
                                            className={cn(
                                                "p-1.5 transition-colors",
                                                viewMode === "list" ? "bg-neutral-100 dark:bg-neutral-800" : "hover:bg-neutral-50 dark:hover:bg-neutral-900"
                                            )}
                                        >
                                            <List className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            )
                        }
                    </div>

                    {
                        activeTab === "browse" && (
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                                <div className="relative w-full max-w-md">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                                    <Input
                                        placeholder="Search learns..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-9 pr-9 h-9 text-sm bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800"
                                    />
                                    {
                                        searchQuery && (
                                            <button onClick={clearSearch} className="absolute right-3 top-1/2 -translate-y-1/2">
                                                <X className="w-3.5 h-3.5 text-neutral-400 hover:text-neutral-600" />
                                            </button>
                                        )
                                    }
                                </div>
                                {
                                    (showLearns || hasSearch) && (
                                        <div className="flex items-center gap-1 flex-wrap">
                                            <span className="text-neutral-400 mr-1"><Filter className="w-3 h-3" /></span>
                                            {
                                                DIFFICULTY_FILTERS.map((diff) => {
                                                    const isActive = initialDifficulty === diff.key;
                                                    return (
                                                        <button
                                                            key={diff.key}
                                                            onClick={() => handleDifficultyChange(isActive ? null : diff.key as LearnDifficulty)}
                                                            className={cn(
                                                                "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all border",
                                                                isActive
                                                                    ? "border-neutral-300 dark:border-neutral-600 bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white"
                                                                    : "border-transparent text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900"
                                                            )}
                                                        >
                                                            <span className={cn("w-1.5 h-1.5 rounded-full", diff.dot)} />
                                                            {diff.label}
                                                        </button>
                                                    );
                                                })
                                            }
                                        </div>
                                    )
                                }
                            </div>
                        )
                    }
                </div>
                <TabsContent value="browse" className="space-y-6">
                    {
                        showMainCategories && (
                            <div className="space-y-6">
                                <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                                    Explore Categories
                                </h2>
                                {
                                    categories.length === 0 ? (
                                        <EmptyState message="No categories found" sub="Categories will appear here once they are created." />
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 space-y-6">
                                            {
                                                categories.map((category, index) => {
                                                    const learnCount = category._count?.learns || 0;
                                                    const subCount = category.subCategories?.length || 0;

                                                    return (
                                                        <motion.div
                                                            key={category.id}
                                                            initial={{ opacity: 0, y: 8 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            transition={{ delay: index * 0.04 }}
                                                        >
                                                            <Link href={`/learn?mainCategory=${category.slug}`}>
                                                                <Card className="group p-5 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 bg-white dark:bg-neutral-900/50 hover:shadow-md transition-all cursor-pointer h-full">
                                                                    <div className="flex items-start justify-between mb-3">
                                                                        <div className="w-10 h-10 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-xl">
                                                                            {category.icon || "📁"}
                                                                        </div>
                                                                        <ArrowRight className="w-4 h-4 text-neutral-300 dark:text-neutral-700 group-hover:text-neutral-500 group-hover:translate-x-0.5 transition-all" />
                                                                    </div>
                                                                    <h3 className="font-semibold text-neutral-900 dark:text-white mb-1">
                                                                        {category.name}
                                                                    </h3>
                                                                    {
                                                                        category.description && (
                                                                            <p className="text-xs text-neutral-500 line-clamp-2 mb-3">
                                                                                {category.description}
                                                                            </p>
                                                                        )
                                                                    }
                                                                    <div className="flex items-center gap-3 text-xs text-neutral-400">
                                                                        <span className="flex items-center gap-1">
                                                                            <Layers className="w-3 h-3" />
                                                                            {subCount} courses
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
                                                })
                                            }
                                        </div>
                                    )
                                }
                            </div>
                        )
                    }
                    {
                        showSubCategories && selectedMainCategory && (
                            <div>
                                <div className="flex items-center gap-2 mb-5">
                                    <Link href="/learn" className="text-sm text-neutral-400 hover:text-neutral-600 transition-colors">Learns</Link>
                                    <ChevronRight className="w-3 h-3 text-neutral-300" />
                                    <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                                        {selectedMainCategory.name}
                                    </h2>
                                </div>
                                {
                                    (!selectedMainCategory.subCategories || selectedMainCategory.subCategories.length === 0) ? (
                                        <EmptyState message="No courses yet" sub="Courses will appear here once they are added." />
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 space-y-6">
                                            {
                                                selectedMainCategory.subCategories.map((sub: LearnSubCategory, index: number) => {
                                                    const learnCount = sub._count?.learns || 0;
                                                    return (
                                                        <motion.div
                                                            key={sub.id}
                                                            initial={{ opacity: 0, y: 8 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            transition={{ delay: index * 0.04 }}
                                                        >
                                                            <Link href={`/learn/${sub.slug}`}>
                                                                <Card className="group p-5 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 bg-white dark:bg-neutral-900/50 hover:shadow-md transition-all cursor-pointer h-full">
                                                                    <div className="flex items-start justify-between mb-3">
                                                                        <div className="w-10 h-10 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-xl">
                                                                            {(typeof sub.icon === 'string' && sub.icon) ? sub.icon : <Code className="w-5 h-5 text-neutral-500" />}
                                                                        </div>
                                                                        <ArrowRight className="w-4 h-4 text-neutral-300 dark:text-neutral-700 group-hover:text-neutral-500 group-hover:translate-x-0.5 transition-all" />
                                                                    </div>
                                                                    <h3 className="font-semibold text-neutral-900 dark:text-white mb-1">
                                                                        {sub.name}
                                                                    </h3>
                                                                    {
                                                                        sub.description && (
                                                                            <p className="text-xs text-neutral-500 line-clamp-2 mb-3">
                                                                                {sub.description}
                                                                            </p>
                                                                        )
                                                                    }
                                                                    <div className="flex items-center gap-1 text-xs text-neutral-400">
                                                                        <BookOpen className="w-3 h-3" />
                                                                        {learnCount} learns
                                                                    </div>
                                                                </Card>
                                                            </Link>
                                                        </motion.div>
                                                    );
                                                })
                                            }
                                        </div>
                                    )
                                }
                            </div>
                        )
                    }

                    {
                        showLearns && (
                            <div className="space-y-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">{title}</h2>
                                    <Badge variant="secondary" className="text-xs font-normal">
                                        {pagination.total}
                                    </Badge>
                                </div>

                                {
                                    learns.length === 0 ? (
                                        <EmptyState message="No learns found" sub="Try adjusting your search or filters." />
                                    ) : (
                                        <div className={cn(
                                            "grid gap-4",
                                            viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"
                                        )}>
                                            <AnimatePresence>
                                                {
                                                    learns.map((learn, index) => (
                                                        <motion.div
                                                            key={learn.id}
                                                            initial={{ opacity: 0, y: 8 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            transition={{ delay: index * 0.03 }}
                                                        >
                                                            <LearnCard learn={learn} viewMode={viewMode} />
                                                        </motion.div>
                                                    ))
                                                }
                                            </AnimatePresence>
                                        </div>
                                    )
                                }

                                {
                                    pagination.totalPages > 1 && (
                                        <div className="flex items-center justify-center gap-2 pt-8">
                                            <Button variant="outline" size="sm" disabled={pagination.page <= 1} className="h-8 w-8 p-0">
                                                <ChevronLeft className="w-4 h-4" />
                                            </Button>
                                            <span className="text-sm text-neutral-500">
                                                Page {pagination.page} of {pagination.totalPages}
                                            </span>
                                            <Button variant="outline" size="sm" disabled={pagination.page >= pagination.totalPages} className="h-8 w-8 p-0">
                                                <ChevronRight className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    )
                                }
                            </div>
                        )
                    }

                    {
                        !showMainCategories && !showSubCategories && !showLearns && (
                            <EmptyState message="No content found" sub="Try selecting a different category or clearing your search." />
                        )
                    }
                </TabsContent>

                {
                    isLoggedIn && (
                        <TabsContent value="progress" className="space-y-6">
                            <MyProgressTab />
                        </TabsContent>
                    )
                }

                {
                    isLoggedIn && (
                        <TabsContent value="bookmarks" className="mt-0">
                            <BookmarksTab />
                        </TabsContent>
                    )
                }
            </Tabs>
        </div>
    );
}

function LearnCard({ learn, viewMode }: { learn: LearnListItem; viewMode: "grid" | "list" }) {
    const diff = difficultyConfig[learn.difficulty as LearnDifficulty];

    return (
        <Link href={`/learn/${learn.subCategory?.slug || 'topic'}/${learn.slug}`}>
            <Card className={cn(
                "group h-full overflow-hidden border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 hover:shadow-md transition-all duration-200 bg-white dark:bg-neutral-900/50",
                viewMode === "list" && "flex flex-row"
            )}>
                <div className={cn(
                    "relative overflow-hidden bg-neutral-50 dark:bg-neutral-900",
                    viewMode === "grid" ? "h-36" : "w-40 shrink-0"
                )}>
                    {
                        learn.thumbnail ? (
                            <Image
                                src={learn.thumbnail || ""}
                                alt={learn.title}
                                fill
                                className="object-cover group-hover:scale-[1.03] transition-transform duration-300"
                            />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-4xl">{learn.iconEmoji || "📚"}</span>
                            </div>
                        )
                    }
                    <div className="absolute top-2.5 right-2.5">
                        <Badge className={cn("text-[10px] border", diff?.color)}>
                            {diff?.label}
                        </Badge>
                    </div>
                </div>
                <div className={cn("p-4 flex flex-col justify-between", viewMode === "list" ? "flex-1" : "")}>
                    <div>
                        <div className="flex items-center gap-2 mb-1.5 text-[10px] text-neutral-400">
                            {
                                learn.subCategory && (
                                    <span className="font-medium text-neutral-500 dark:text-neutral-400">
                                        {learn.subCategory.name}
                                    </span>
                                )
                            }
                            {
                                learn.estimatedTime && (
                                    <span className="flex items-center gap-0.5">
                                        <Clock className="w-2.5 h-2.5" />
                                        {learn.estimatedTime}m
                                    </span>
                                )
                            }
                        </div>
                        <h3 className="font-semibold text-sm text-neutral-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1 mb-1">
                            {learn.title}
                        </h3>
                        <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed">
                            {learn.description}
                        </p>
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800/50">
                        <div className="flex items-center gap-1 text-[10px] text-neutral-400">
                            <BookOpen className="w-3 h-3" />
                            {learn._count?.steps || 0} steps
                        </div>
                        <div className="flex items-center gap-2.5 text-[10px] text-neutral-400">
                            <span className="flex items-center gap-0.5">
                                <Eye className="w-3 h-3" /> {formatCount(learn.viewCount || 0)}
                            </span>
                            <span className="flex items-center gap-0.5">
                                <Heart className="w-3 h-3" /> {formatCount(learn.likeCount || 0)}
                            </span>
                        </div>
                    </div>
                </div>
            </Card>
        </Link>
    );
}

function EmptyState({ message, sub }: { message: string; sub: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-4">
                <Lightbulb className="w-7 h-7 text-neutral-400" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-1">{message}</h3>
            <p className="text-sm text-neutral-500 max-w-sm">{sub}</p>
        </div>
    );
}