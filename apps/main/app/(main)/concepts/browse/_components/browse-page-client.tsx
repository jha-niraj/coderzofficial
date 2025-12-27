"use client";

import { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
    Search, Lightbulb, Grid, List, Loader2, BookOpen, Clock, Eye, Heart,
    ChevronLeft, ChevronRight, Plus
} from "lucide-react";
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { Badge } from "@repo/ui/components/ui/badge";
import { Card, CardContent, CardFooter } from "@repo/ui/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/components/ui/avatar";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@repo/ui/components/ui/select";
import { cn } from "@repo/ui/lib/utils";
import { ConceptCategory, ConceptDifficulty } from "@repo/prisma/client";

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
    categories: Category[];
    pagination: Pagination;
    initialSearch?: string;
    initialCategory?: ConceptCategory;
    initialDifficulty?: ConceptDifficulty;
    initialSortBy: string;
}

const CATEGORIES = [
    { value: "All", label: "All" },
    { value: "WEB_DEVELOPMENT", label: "Web Dev" },
    { value: "DATA_STRUCTURES", label: "DSA" },
    { value: "ALGORITHMS", label: "Algorithms" },
    { value: "SYSTEM_DESIGN", label: "System Design" },
    { value: "DATABASE", label: "Database" },
    { value: "DEVOPS", label: "DevOps" },
    { value: "MACHINE_LEARNING", label: "ML" },
];

const DIFFICULTIES = [
    { value: "All", label: "All Levels" },
    { value: "BEGINNER", label: "Beginner" },
    { value: "INTERMEDIATE", label: "Intermediate" },
    { value: "ADVANCED", label: "Advanced" },
    { value: "EXPERT", label: "Expert" },
];

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
    categories,
    pagination,
    initialSearch,
    initialCategory,
    initialDifficulty,
    initialSortBy,
}: BrowsePageClientProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [concepts] = useState(initialConcepts);
    const [search, setSearch] = useState(initialSearch || "");
    const [category, setCategory] = useState(initialCategory || "All");
    const [difficulty, setDifficulty] = useState(initialDifficulty || "All");
    const [sortBy, setSortBy] = useState(initialSortBy);
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [isLoading, setIsLoading] = useState(false);

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

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        updateFilters({ search: search.trim() || undefined });
    };

    const handleCategoryChange = (value: string) => {
        setCategory(value as ConceptCategory | "All");
        updateFilters({ category: value === "All" ? undefined : value });
    };

    const handleDifficultyChange = (value: string) => {
        setDifficulty(value as ConceptDifficulty | "All");
        updateFilters({ difficulty: value === "All" ? undefined : value });
    };

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
        <div className="min-h-screen bg-white dark:bg-neutral-950">
            <section className="relative overflow-hidden border-b border-neutral-200 dark:border-neutral-800 bg-gradient-to-b from-neutral-50 to-white dark:from-neutral-900 dark:to-neutral-950">
                <div className="absolute inset-0 -z-10 h-full w-full bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]" />
                <div className="max-w-7xl mx-auto px-4 py-16 md:py-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center max-w-3xl mx-auto"
                    >
                        <Badge variant="outline" className="mb-6 px-4 py-1.5 rounded-full border-neutral-300 dark:border-neutral-700">
                            <Lightbulb className="w-4 h-4 mr-2" />
                            {pagination.total.toLocaleString()} Concepts
                        </Badge>
                        <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 dark:text-white mb-4 tracking-tight">
                            Browse Concepts
                        </h1>
                        <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-8">
                            Find the perfect concept to learn. Filter by category, difficulty, and more.
                        </p>
                        <form onSubmit={handleSearch} className="max-w-xl mx-auto">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                                <Input
                                    placeholder="Search concepts..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-12 h-14 text-lg rounded-xl bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 shadow-lg focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white"
                                />
                            </div>
                        </form>
                    </motion.div>
                </div>
            </section>
            <div className="border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 sticky top-16 z-30">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto scrollbar-hide">
                            {
                                CATEGORIES.map((cat) => (
                                    <Button
                                        key={cat.value}
                                        variant={category === cat.value ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => handleCategoryChange(cat.value)}
                                        className={cn(
                                            "rounded-full whitespace-nowrap",
                                            category === cat.value
                                                ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900"
                                                : "border-neutral-200 dark:border-neutral-700"
                                        )}
                                    >
                                        {cat.label}
                                    </Button>
                                ))
                            }
                        </div>
                        <div className="flex items-center gap-3">
                            <Select value={difficulty as string} onValueChange={handleDifficultyChange}>
                                <SelectTrigger className="w-36 h-9 rounded-lg border-neutral-200 dark:border-neutral-700">
                                    <SelectValue placeholder="Difficulty" />
                                </SelectTrigger>
                                <SelectContent>
                                    {
                                        DIFFICULTIES.map((d) => (
                                            <SelectItem key={d.value} value={d.value}>
                                                {d.label}
                                            </SelectItem>
                                        ))
                                    }
                                </SelectContent>
                            </Select>
                            <Select value={sortBy} onValueChange={handleSortChange}>
                                <SelectTrigger className="w-36 h-9 rounded-lg border-neutral-200 dark:border-neutral-700">
                                    <SelectValue placeholder="Sort by" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="latest">Latest</SelectItem>
                                    <SelectItem value="popular">Most Popular</SelectItem>
                                    <SelectItem value="views">Most Viewed</SelectItem>
                                    <SelectItem value="likes">Most Liked</SelectItem>
                                </SelectContent>
                            </Select>
                            <div className="hidden md:flex items-center border border-neutral-200 dark:border-neutral-700 rounded-lg">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setViewMode("grid")}
                                    className={cn(
                                        "h-9 w-9 rounded-l-lg rounded-r-none",
                                        viewMode === "grid" && "bg-neutral-100 dark:bg-neutral-800"
                                    )}
                                >
                                    <Grid className="w-4 h-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setViewMode("list")}
                                    className={cn(
                                        "h-9 w-9 rounded-r-lg rounded-l-none",
                                        viewMode === "list" && "bg-neutral-100 dark:bg-neutral-800"
                                    )}
                                >
                                    <List className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="max-w-7xl mx-auto px-4 py-8">
                {
                    isLoading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
                        </div>
                    ) : concepts.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-20"
                        >
                            <Lightbulb className="w-16 h-16 mx-auto text-neutral-300 dark:text-neutral-700 mb-4" />
                            <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
                                No concepts found
                            </h3>
                            <p className="text-neutral-500 dark:text-neutral-400 mb-6">
                                {search ? `No results for "${search}"` : "Try adjusting your filters"}
                            </p>
                            <Link href="/concepts/create">
                                <Button className="bg-neutral-900 dark:bg-white text-white dark:text-neutral-900">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Create Concept
                                </Button>
                            </Link>
                        </motion.div>
                    ) : (
                        <>
                            <div className="flex items-center justify-between mb-6">
                                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                    Showing {concepts.length} of {pagination.total} concepts
                                </p>
                            </div>
                            <div className={cn(
                                "grid gap-6",
                                viewMode === "grid"
                                    ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                                    : "grid-cols-1"
                            )}>
                                <AnimatePresence>
                                    {
                                        concepts.map((concept, index) => (
                                            <motion.div
                                                key={concept.id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.03 }}
                                            >
                                                <Link href={`/concepts/${concept.slug}`}>
                                                    <Card className="group h-full overflow-hidden bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 hover:shadow-xl transition-all duration-300">
                                                        <div className="relative h-44 bg-gradient-to-br from-neutral-100 to-neutral-50 dark:from-neutral-800 dark:to-neutral-900 overflow-hidden">
                                                            {
                                                                concept.thumbnail ? (
                                                                    <Image
                                                                        src={concept.thumbnail}
                                                                        alt={concept.title}
                                                                        fill
                                                                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                                    />
                                                                ) : (
                                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                                        <span className="text-7xl">
                                                                            {concept.iconEmoji || "📚"}
                                                                        </span>
                                                                    </div>
                                                                )
                                                            }
                                                            <div className="absolute top-3 right-3">
                                                                <Badge className={difficultyConfig[concept.difficulty].color}>
                                                                    {difficultyConfig[concept.difficulty].label}
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                        <CardContent className="p-5">
                                                            <Badge variant="outline" className="text-xs mb-2 border-neutral-200 dark:border-neutral-700">
                                                                {concept.category.replace(/_/g, " ")}
                                                            </Badge>
                                                            <h3 className="font-semibold text-lg text-neutral-900 dark:text-white group-hover:text-neutral-700 dark:group-hover:text-neutral-200 transition-colors line-clamp-1">
                                                                {concept.title}
                                                            </h3>
                                                            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2 line-clamp-2">
                                                                {concept.shortDescription || concept.description}
                                                            </p>
                                                            <div className="flex items-center gap-4 mt-4 text-xs text-neutral-500 dark:text-neutral-400">
                                                                <div className="flex items-center gap-1">
                                                                    <BookOpen className="w-3.5 h-3.5" />
                                                                    <span>{concept._count.steps} steps</span>
                                                                </div>
                                                                <div className="flex items-center gap-1">
                                                                    <Clock className="w-3.5 h-3.5" />
                                                                    <span>{concept.estimatedTime || 10} min</span>
                                                                </div>
                                                                <div className="flex items-center gap-1">
                                                                    <Eye className="w-3.5 h-3.5" />
                                                                    <span>{formatCount(concept.viewCount)}</span>
                                                                </div>
                                                            </div>
                                                        </CardContent>
                                                        <CardFooter className="px-5 py-3 bg-neutral-50 dark:bg-neutral-800/50 border-t border-neutral-100 dark:border-neutral-800">
                                                            <div className="flex items-center justify-between w-full">
                                                                <div className="flex items-center gap-2">
                                                                    <Avatar className="w-6 h-6 border border-neutral-200 dark:border-neutral-700">
                                                                        <AvatarImage src={concept.creator.image || ""} />
                                                                        <AvatarFallback className="text-xs bg-neutral-100 dark:bg-neutral-800">
                                                                            {concept.creator.name?.charAt(0) || "A"}
                                                                        </AvatarFallback>
                                                                    </Avatar>
                                                                    <span className="text-xs text-neutral-500 dark:text-neutral-400">
                                                                        {concept.creator.name || "Admin"}
                                                                    </span>
                                                                </div>
                                                                <div className="flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400">
                                                                    <Heart className="w-3.5 h-3.5" />
                                                                    <span>{formatCount(concept.likeCount)}</span>
                                                                </div>
                                                            </div>
                                                        </CardFooter>
                                                    </Card>
                                                </Link>
                                            </motion.div>
                                        ))
                                    }
                                </AnimatePresence>
                            </div>

                            {
                                pagination.totalPages > 1 && (
                                    <div className="flex items-center justify-center gap-2 mt-12">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => goToPage(pagination.page - 1)}
                                            disabled={pagination.page <= 1}
                                            className="rounded-lg"
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                        </Button>

                                        {
                                            Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                                                let pageNum;
                                                if (pagination.totalPages <= 5) {
                                                    pageNum = i + 1;
                                                } else if (pagination.page <= 3) {
                                                    pageNum = i + 1;
                                                } else if (pagination.page >= pagination.totalPages - 2) {
                                                    pageNum = pagination.totalPages - 4 + i;
                                                } else {
                                                    pageNum = pagination.page - 2 + i;
                                                }

                                                return (
                                                    <Button
                                                        key={pageNum}
                                                        variant={pagination.page === pageNum ? "default" : "outline"}
                                                        size="sm"
                                                        onClick={() => goToPage(pageNum)}
                                                        className={cn(
                                                            "rounded-lg min-w-[36px]",
                                                            pagination.page === pageNum
                                                                ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900"
                                                                : ""
                                                        )}
                                                    >
                                                        {pageNum}
                                                    </Button>
                                                );
                                            })
                                        }

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => goToPage(pagination.page + 1)}
                                            disabled={pagination.page >= pagination.totalPages}
                                            className="rounded-lg"
                                        >
                                            <ChevronRight className="w-4 h-4" />
                                        </Button>
                                    </div>
                                )
                            }
                        </>
                    )
                }
            </div>
            <section className="border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900">
                <div className="max-w-4xl mx-auto px-4 py-16 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white mb-4">
                            Can&apos;t find what you&apos;re looking for?
                        </h2>
                        <p className="text-neutral-600 dark:text-neutral-400 mb-8 max-w-2xl mx-auto">
                            Create your own concept and share your knowledge with the community.
                        </p>
                        <Link href="/concepts/create">
                            <Button size="lg" className="bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 h-12 px-8 rounded-xl">
                                <Plus className="w-5 h-5 mr-2" />
                                Create a Concept
                            </Button>
                        </Link>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}