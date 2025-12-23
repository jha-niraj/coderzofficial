"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
    Search, X, Layers, BookOpen
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    ConceptCategory, ConceptDifficulty
} from "@prisma/client";
import { useState } from "react";

interface BrowseHeaderProps {
    search?: string;
    category?: ConceptCategory;
    difficulty?: ConceptDifficulty;
    totalResults: number;
}

const categoryLabels: Record<ConceptCategory, string> = {
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
    PROGRAMMING_FUNDAMENTALS: "Fundamentals",
    SOFTWARE_ARCHITECTURE: "Architecture",
    API_DESIGN: "API Design",
    TESTING: "Testing",
    VERSION_CONTROL: "Version Control",
    UI_UX_DESIGN: "UI/UX Design",
    GAME_DEVELOPMENT: "Game Development",
    NETWORKING: "Networking",
    OPERATING_SYSTEMS: "Operating Systems",
    CUSTOM: "Custom",
};

export default function BrowseHeader({
    search,
    category,
    difficulty,
    totalResults,
}: BrowseHeaderProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [query, setQuery] = useState(search || "");

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const params = new URLSearchParams(searchParams.toString());
        if (query.trim()) {
            params.set("search", query.trim());
        } else {
            params.delete("search");
        }
        params.delete("page");
        router.push(`/concepts/browse?${params.toString()}`);
    };

    const clearFilter = (filterType: "search" | "category" | "difficulty") => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete(filterType);
        params.delete("page");
        if (filterType === "search") {
            setQuery("");
        }
        router.push(`/concepts/browse?${params.toString()}`);
    };

    const clearAllFilters = () => {
        setQuery("");
        router.push("/concepts/browse");
    };

    const hasFilters = search || category || difficulty;

    return (
        <div>
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                    <Layers className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Browse Concepts</h1>
                    <p className="text-sm text-muted-foreground">
                        {totalResults} concept{totalResults !== 1 ? "s" : ""} found
                    </p>
                </div>
            </div>
            <form onSubmit={handleSearch} className="flex items-center gap-3 mb-4">
                <div className="relative flex-1 max-w-xl">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder="Search concepts..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="pl-10 h-11"
                    />
                </div>
                <Button type="submit" className="h-11">
                    Search
                </Button>
            </form>
            {
                hasFilters && (
                    <div className="flex items-center flex-wrap gap-2">
                        <span className="text-sm text-muted-foreground">Active filters:</span>

                        {
                            search && (
                                <Badge variant="secondary" className="gap-1 pr-1">
                                    <BookOpen className="w-3 h-3" />
                                    &quot;{search}&quot;
                                    <button
                                        onClick={() => clearFilter("search")}
                                        className="ml-1 p-0.5 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-full"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </Badge>
                            )
                        }
                        {
                            category && (
                                <Badge variant="secondary" className="gap-1 pr-1">
                                    {categoryLabels[category]}
                                    <button
                                        onClick={() => clearFilter("category")}
                                        className="ml-1 p-0.5 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-full"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </Badge>
                            )
                        }
                        {
                            difficulty && (
                                <Badge variant="secondary" className="gap-1 pr-1">
                                    {difficulty}
                                    <button
                                        onClick={() => clearFilter("difficulty")}
                                        className="ml-1 p-0.5 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-full"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </Badge>
                            )
                        }

                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearAllFilters}
                            className="text-xs h-7 text-muted-foreground"
                        >
                            Clear all
                        </Button>
                    </div>
                )
            }
        </div>
    );
}