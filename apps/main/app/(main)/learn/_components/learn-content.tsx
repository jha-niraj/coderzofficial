'use client'

import { useState, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
    Grid, List, Clock, Eye, Heart, ChevronLeft, ChevronRight,
    Lightbulb, BookOpen, CheckCircle2, BarChart3,
    TrendingUp, Flame, Filter
} from "lucide-react";
import { Button } from "@repo/ui/components/ui/button";
import { Badge } from "@repo/ui/components/ui/badge";
import { Card } from "@repo/ui/components/ui/card";
import {
    Avatar, AvatarFallback, AvatarImage
} from "@repo/ui/components/ui/avatar";
import {
    Tabs, TabsContent, TabsList, TabsTrigger
} from "@repo/ui/components/ui/tabs";
import { Progress } from "@repo/ui/components/ui/progress";
import { cn } from "@repo/ui/lib/utils";
import { LearnDifficulty } from "@repo/prisma/client";

interface Learn {
    id: string;
    slug: string;
    title: string;
    description: string;
    thumbnail?: string | null;
    iconEmoji?: string | null;
    category: string;
    difficulty: LearnDifficulty;
    estimatedTime?: number | null;
    viewCount: number;
    likeCount: number;
    createdAt: Date;
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

interface LearnProgress {
    id: string;
    learnId: string;
    progressPercent: number;
    isCompleted: boolean;
    lastAccessedAt: Date;
    learn: {
        id: string;
        slug: string;
        title: string;
        iconEmoji?: string | null;
        thumbnail?: string | null;
        difficulty: LearnDifficulty;
        estimatedTime?: number | null;
        category?: string;
        _count?: { steps: number };
    };
}

interface Pagination {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    // Add missing properties? No.
}

interface LearnsContentProps {
    Learns: Learn[];
    pagination: Pagination;
    userProgress: LearnProgress[];
    completedLearns: LearnProgress[];
    isLoggedIn: boolean;
    currentFilter?: string;
    title?: string;
    categorySlug?: string;
    selectedDifficulty?: LearnDifficulty | null;
    onDifficultyChange?: (difficulty: LearnDifficulty | null) => void;
}

const difficultyConfig: Record<LearnDifficulty, { label: string; color: string }> = {
    BEGINNER: { label: "Beginner", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
    INTERMEDIATE: { label: "Intermediate", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" },
    ADVANCED: { label: "Advanced", color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" },
    EXPERT: { label: "Expert", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
};

const QUICK_FILTERS = [
    { id: "recent", label: "Just Added", icon: Clock, color: "text-blue-500", activeBg: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400" },
    { id: "trending", label: "Trending", icon: TrendingUp, color: "text-orange-500", activeBg: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400" },
    { id: "popular", label: "Popular", icon: Flame, color: "text-rose-500", activeBg: "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400" },
];

const DIFFICULTY_HEADER_FILTERS = [
    { key: "BEGINNER", label: "Beginner", color: "text-green-600", activeBg: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" },
    { key: "INTERMEDIATE", label: "Intermediate", color: "text-yellow-600", activeBg: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400" },
    { key: "ADVANCED", label: "Advanced", color: "text-orange-600", activeBg: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400" },
    { key: "EXPERT", label: "Expert", color: "text-red-600", activeBg: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400" },
];

function formatCount(count: number): string {
    if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
    return count.toString();
}

function getTimeAgo(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString();
}

export function LearnsContent({
    Learns, // Keeping Prop name for now
    pagination,
    userProgress,
    completedLearns,
    isLoggedIn,
    currentFilter,
    title = "All Learns",
    categorySlug,
    selectedDifficulty,
    onDifficultyChange,
}: LearnsContentProps) {
    const router = useRouter();
    const _pathname = usePathname();
    const searchParams = useSearchParams();

    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [activeTab, setActiveTab] = useState("browse");

    const basePath = categorySlug ? `/learn/${categorySlug}` : "/learn"; // Fixed route to /learn

    const _updateFilters = useCallback((updates: Record<string, string | undefined>) => {
        const params = new URLSearchParams(searchParams.toString());
        Object.entries(updates).forEach(([key, value]) => {
            if (value) params.set(key, value);
            else params.delete(key);
        });
        params.delete("page");
        router.push(`${basePath}?${params.toString()}`);
    }, [router, searchParams, basePath]);

    const handleFilterChange = (filter: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (currentFilter === filter) {
            params.delete("filter");
        } else {
            params.set("filter", filter);
        }
        params.delete("page");
        router.push(`${basePath}?${params.toString()}`);
    };

    const goToPage = (page: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", page.toString());
        router.push(`${basePath}?${params.toString()}`);
    };

    return (
        <div className="p-6 lg:p-8 h-full overflow-y-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                {/* Header with tabs and controls */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <TabsList className="bg-neutral-100 dark:bg-neutral-800/50 h-9">
                        <TabsTrigger value="browse" className="flex items-center gap-1.5 text-xs px-3 h-7">
                            <BookOpen className="w-3.5 h-3.5 text-blue-500" /> Browse
                        </TabsTrigger>
                        {isLoggedIn && (
                            <TabsTrigger value="progress" className="flex items-center gap-1.5 text-xs px-3 h-7">
                                <BarChart3 className="w-3.5 h-3.5 text-emerald-500" /> My Progress
                            </TabsTrigger>
                        )}
                    </TabsList>

                    {activeTab === "browse" && (
                        <div className="flex items-center gap-2">
                            {/* Quick Filters */}
                            <div className="flex items-center gap-0.5 border border-neutral-200 dark:border-neutral-800 rounded-lg p-0.5">
                                {QUICK_FILTERS.map((filter) => {
                                    const Icon = filter.icon;
                                    const isActive = currentFilter === filter.id;
                                    return (
                                        <button
                                            key={filter.id}
                                            onClick={() => handleFilterChange(filter.id)}
                                            className={cn(
                                                "flex items-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-medium transition-all",
                                                isActive
                                                    ? filter.activeBg
                                                    : "hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
                                            )}
                                        >
                                            <Icon className={cn("w-3.5 h-3.5", isActive ? "" : filter.color)} />
                                            <span className="hidden sm:inline">{filter.label}</span>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Difficulty Filter */}
                            {onDifficultyChange && (
                                <div className="flex items-center gap-0.5 border border-neutral-200 dark:border-neutral-800 rounded-lg p-0.5">
                                    <span className="px-1.5 text-neutral-400"><Filter className="w-3 h-3" /></span>
                                    {DIFFICULTY_HEADER_FILTERS.map((diff) => {
                                        const isActive = selectedDifficulty === diff.key;
                                        return (
                                            <button
                                                key={diff.key}
                                                onClick={() => onDifficultyChange(
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
                            )}

                            {/* View Mode Toggle */}
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

                {/* Browse Tab */}
                <TabsContent value="browse" className="mt-0">
                    <div className="flex items-center gap-2 mb-4">
                        <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                            {title}
                        </h2>
                        <Badge variant="secondary" className="text-xs">
                            {pagination.total} results
                        </Badge>
                    </div>

                    {Learns.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-xl">
                            <Lightbulb className="w-12 h-12 text-neutral-300 dark:text-neutral-700 mb-4" />
                            <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
                                No Learns found
                            </h3>
                            <p className="text-neutral-500 max-w-sm mb-6">
                                Try adjusting your filters or search query.
                            </p>
                            <Link href="/learn/create">
                                <Button>Create Learn</Button>
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
                                {Learns.map((learn, index) => (
                                    <motion.div
                                        key={learn.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        <Link href={`/learn/${learn.slug}`}>
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
                                                            src={learn.thumbnail}
                                                            alt={learn.title}
                                                            fill
                                                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                        />
                                                    ) : (
                                                        <div className="absolute inset-0 flex items-center justify-center text-4xl">
                                                            {learn.iconEmoji || "📚"}
                                                        </div>
                                                    )}
                                                    <div className="absolute top-2 right-2 flex flex-col gap-1.5 items-end">
                                                        <Badge className={difficultyConfig[learn.difficulty].color}>
                                                            {difficultyConfig[learn.difficulty].label}
                                                        </Badge>
                                                        {currentFilter === "recent" && (
                                                            <Badge className="absolute top-2 left-2 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-0">
                                                                <Clock className="w-3 h-3 mr-1" />
                                                                {getTimeAgo(learn.createdAt)}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div> {/* Closed div */}
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
                                                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                                                        <div className="flex items-center gap-1.5">
                                                            <Avatar className="w-5 h-5">
                                                                <AvatarImage src={learn.creator.image || ""} />
                                                                <AvatarFallback className="text-[10px]">
                                                                    {learn.creator.name?.charAt(0)}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <span className="text-xs text-neutral-500">
                                                                {learn.creator.name}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-3 text-xs text-neutral-400">
                                                            <div className="flex items-center gap-1">
                                                                <Eye className="w-3 h-3" /> {formatCount(learn.viewCount)}
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <Heart className="w-3 h-3" /> {formatCount(learn.likeCount)}
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
                </TabsContent>

                {/* Progress Tab */}
                {isLoggedIn && (
                    <TabsContent value="progress" className="mt-0 space-y-8">
                        {/* In Progress */}
                        <div>
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-blue-500" />
                                Continue Learning
                                <Badge variant="secondary">{userProgress.length}</Badge>
                            </h3>
                            {userProgress.length === 0 ? (
                                <Card className="p-8 text-center border-dashed">
                                    <BookOpen className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
                                    <p className="text-neutral-500">
                                        Start learning a Learn to track your progress here.
                                    </p>
                                </Card>
                            ) : (
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    {userProgress.map((progress) => (
                                        <Link key={progress.id} href={`/learn/${progress.learn.slug}`}>
                                            <Card className="p-4 hover:shadow-md transition-shadow">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <div className="w-10 h-10 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-xl">
                                                        {progress.learn.iconEmoji || "📚"}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-medium text-sm truncate">
                                                            {progress.learn.title}
                                                        </h4>
                                                        <p className="text-xs text-neutral-500">
                                                            {progress.learn._count?.steps || 0} steps
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <div className="flex justify-between text-xs">
                                                        <span className="text-neutral-500">Progress</span>
                                                        <span className="font-medium">
                                                            {Math.round(progress.progressPercent)}%
                                                        </span>
                                                    </div>
                                                    <Progress value={progress.progressPercent} className="h-2" />
                                                </div>
                                            </Card>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Completed */}
                        <div>
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                                Completed
                                <Badge variant="secondary">{completedLearns.length}</Badge>
                            </h3>
                            {completedLearns.length === 0 ? (
                                <Card className="p-8 text-center border-dashed">
                                    <CheckCircle2 className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
                                    <p className="text-neutral-500">
                                        Complete a Learn to see it here.
                                    </p>
                                </Card>
                            ) : (
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    {completedLearns.map((progress) => (
                                        <Link key={progress.id} href={`/learn/${progress.learn.slug}`}>
                                            <Card className="p-4 hover:shadow-md transition-shadow bg-green-50/50 dark:bg-green-950/10 border-green-200 dark:border-green-900">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-xl">
                                                        {progress.learn.iconEmoji || "📚"}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-medium text-sm truncate">
                                                            {progress.learn.title}
                                                        </h4>
                                                        <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                                                            <CheckCircle2 className="w-3 h-3" />
                                                            Completed
                                                        </div>
                                                    </div>
                                                </div>
                                            </Card>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </TabsContent>
                )}
            </Tabs>
        </div>
    );
}
