'use client'

import { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Lightbulb, Grid, Filter } from "lucide-react";
import { Input } from "@repo/ui/components/ui/input";
import { Badge } from "@repo/ui/components/ui/badge";
import { Separator } from "@repo/ui/components/ui/separator";
import { cn } from "@repo/ui/lib/utils";
import { CATEGORIES, DIFFICULTIES } from "../_constants/filters";

interface BrowseSidebarProps {
    totalConcepts?: number
}

export function BrowseSidebar({ totalConcepts = 0 }: BrowseSidebarProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const currentSearch = searchParams.get("search") || "";
    const currentCategory = searchParams.get("category") || "All";
    const currentDifficulty = searchParams.get("difficulty") || "All";

    const [search, setSearch] = useState(currentSearch);

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
        updateFilters({ category: value === "All" ? undefined : value });
    };

    const handleDifficultyChange = (value: string) => {
        updateFilters({ difficulty: value === "All" ? undefined : value });
    };

    return (
        <aside className="w-full h-full border-r border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30">
            <div className="sticky top-0 h-screen overflow-y-auto p-6 space-y-8">
                {/* Header */}
                <div className="space-y-4">
                    <Badge variant="outline" className="px-3 py-1 rounded-full border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900">
                        <Lightbulb className="w-3.5 h-3.5 mr-2 text-yellow-500" />
                        {totalConcepts.toLocaleString()} Concepts
                    </Badge>
                    <div>
                        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white tracking-tight leading-tight">
                            Browse Concepts
                        </h1>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2 leading-relaxed">
                            Find the perfect concept to learn. Filter by category, difficulty, and more.
                        </p>
                    </div>
                </div>

                {/* Search */}
                <form onSubmit={handleSearch} className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <Input
                        placeholder="Search concepts..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 h-10 bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 focus:ring-1 focus:ring-neutral-900 dark:focus:ring-white"
                    />
                </form>

                <Separator className="bg-neutral-200 dark:bg-neutral-800" />

                {/* Filters */}
                <div className="space-y-6">
                    {/* Categories */}
                    <div className="space-y-3">
                        <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider flex items-center gap-2">
                            <Grid className="w-3.5 h-3.5" /> Categories
                        </h3>
                        <div className="space-y-1">
                            {CATEGORIES.map((cat) => (
                                <button
                                    key={cat.value}
                                    onClick={() => handleCategoryChange(cat.value)}
                                    className={cn(
                                        "w-full text-left px-3 py-2 rounded-lg text-sm transition-all",
                                        currentCategory === cat.value
                                            ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-medium"
                                            : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                                    )}
                                >
                                    {cat.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Difficulty */}
                    <div className="space-y-3">
                        <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider flex items-center gap-2">
                            <Filter className="w-3.5 h-3.5" /> Difficulty
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {DIFFICULTIES.slice(1).map((diff) => (
                                <button
                                    key={diff.value}
                                    onClick={() => handleDifficultyChange(diff.value === currentDifficulty ? "All" : diff.value)}
                                    className={cn(
                                        "px-3 py-1.5 rounded-md text-xs border transition-all",
                                        diff.value === currentDifficulty
                                            ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 border-neutral-900 dark:border-white"
                                            : "bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700"
                                    )}
                                >
                                    {diff.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
}
