"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ConceptCategory, ConceptDifficulty } from "@prisma/client";
import {
    Card, CardContent, CardHeader, CardTitle
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
    Filter, SlidersHorizontal, RotateCcw
} from "lucide-react";

interface Category {
    category: ConceptCategory;
    _count: number;
}

interface BrowseFiltersProps {
    categories: Category[];
    currentCategory?: ConceptCategory;
    currentDifficulty?: ConceptDifficulty;
    currentSort: string;
}

const categoryLabels: Record<ConceptCategory, { label: string; emoji: string }> = {
    WEB_DEVELOPMENT: { label: "Web Development", emoji: "🌐" },
    MOBILE_DEVELOPMENT: { label: "Mobile Development", emoji: "📱" },
    DATA_STRUCTURES: { label: "Data Structures", emoji: "🗂️" },
    ALGORITHMS: { label: "Algorithms", emoji: "🧮" },
    SYSTEM_DESIGN: { label: "System Design", emoji: "🏗️" },
    DATABASE: { label: "Database", emoji: "🗃️" },
    DEVOPS: { label: "DevOps", emoji: "🔧" },
    CLOUD_COMPUTING: { label: "Cloud Computing", emoji: "☁️" },
    MACHINE_LEARNING: { label: "Machine Learning", emoji: "🤖" },
    ARTIFICIAL_INTELLIGENCE: { label: "AI", emoji: "🧠" },
    CYBERSECURITY: { label: "Cybersecurity", emoji: "🔐" },
    BLOCKCHAIN: { label: "Blockchain", emoji: "⛓️" },
    PROGRAMMING_FUNDAMENTALS: { label: "Fundamentals", emoji: "📚" },
    SOFTWARE_ARCHITECTURE: { label: "Architecture", emoji: "🏛️" },
    API_DESIGN: { label: "API Design", emoji: "🔌" },
    TESTING: { label: "Testing", emoji: "🧪" },
    VERSION_CONTROL: { label: "Version Control", emoji: "📝" },
    UI_UX_DESIGN: { label: "UI/UX Design", emoji: "🎨" },
    GAME_DEVELOPMENT: { label: "Game Development", emoji: "🎮" },
    NETWORKING: { label: "Networking", emoji: "🌍" },
    OPERATING_SYSTEMS: { label: "Operating Systems", emoji: "💻" },
    CUSTOM: { label: "Custom", emoji: "✨" },
};

const difficultyOptions: { value: ConceptDifficulty; label: string; color: string }[] = [
    { value: "BEGINNER", label: "Beginner", color: "text-green-600" },
    { value: "INTERMEDIATE", label: "Intermediate", color: "text-yellow-600" },
    { value: "ADVANCED", label: "Advanced", color: "text-orange-600" },
    { value: "EXPERT", label: "Expert", color: "text-red-600" },
];

const sortOptions = [
    { value: "latest", label: "Latest" },
    { value: "popular", label: "Most Popular" },
    { value: "views", label: "Most Viewed" },
    { value: "likes", label: "Most Liked" },
];

export default function BrowseFilters({
    categories,
    currentCategory,
    currentDifficulty,
    currentSort,
}: BrowseFiltersProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const updateFilter = (key: string, value: string | null) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value) {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        params.delete("page");
        router.push(`/concepts/browse?${params.toString()}`);
    };

    const resetFilters = () => {
        router.push("/concepts/browse");
    };

    return (
        <div className="space-y-4 sticky top-20">
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-base flex items-center gap-2">
                            <Filter className="w-4 h-4" />
                            Filters
                        </CardTitle>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={resetFilters}
                            className="h-7 text-xs"
                        >
                            <RotateCcw className="w-3 h-3 mr-1" />
                            Reset
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <Label className="text-sm font-medium flex items-center gap-2 mb-3">
                            <SlidersHorizontal className="w-4 h-4" />
                            Sort by
                        </Label>
                        <RadioGroup
                            value={currentSort}
                            onValueChange={(value) => updateFilter("sortBy", value)}
                        >
                            {
                                sortOptions.map((option) => (
                                    <div key={option.value} className="flex items-center space-x-2">
                                        <RadioGroupItem value={option.value} id={`sort-${option.value}`} />
                                        <Label
                                            htmlFor={`sort-${option.value}`}
                                            className="text-sm cursor-pointer"
                                        >
                                            {option.label}
                                        </Label>
                                    </div>
                                ))
                            }
                        </RadioGroup>
                    </div>

                    <Separator />

                    <div>
                        <Label className="text-sm font-medium mb-3 block">Difficulty</Label>
                        <RadioGroup
                            value={currentDifficulty || ""}
                            onValueChange={(value) =>
                                updateFilter("difficulty", value || null)
                            }
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="" id="difficulty-all" />
                                <Label htmlFor="difficulty-all" className="text-sm cursor-pointer">
                                    All Levels
                                </Label>
                            </div>
                            {
                                difficultyOptions.map((option) => (
                                    <div key={option.value} className="flex items-center space-x-2">
                                        <RadioGroupItem
                                            value={option.value}
                                            id={`difficulty-${option.value}`}
                                        />
                                        <Label
                                            htmlFor={`difficulty-${option.value}`}
                                            className={`text-sm cursor-pointer ${option.color}`}
                                        >
                                            {option.label}
                                        </Label>
                                    </div>
                                ))
                            }
                        </RadioGroup>
                    </div>

                    <Separator />

                    <div>
                        <Label className="text-sm font-medium mb-3 block">Category</Label>
                        <div className="space-y-1 max-h-80 overflow-y-auto pr-2">
                            <button
                                onClick={() => updateFilter("category", null)}
                                className={`w-full text-left px-2 py-1.5 rounded text-sm transition-colors ${!currentCategory
                                        ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                                        : "hover:bg-neutral-100 dark:hover:bg-neutral-800"
                                    }`}
                            >
                                All Categories
                            </button>
                            {
                                categories.map((cat) => {
                                    const config = categoryLabels[cat.category];
                                    return (
                                        <button
                                            key={cat.category}
                                            onClick={() => updateFilter("category", cat.category)}
                                            className={`w-full text-left px-2 py-1.5 rounded text-sm transition-colors flex items-center justify-between ${currentCategory === cat.category
                                                    ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                                                    : "hover:bg-neutral-100 dark:hover:bg-neutral-800"
                                                }`}
                                        >
                                            <span className="flex items-center gap-2">
                                                <span>{config.emoji}</span>
                                                <span className="truncate">{config.label}</span>
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                {cat._count}
                                            </span>
                                        </button>
                                    );
                                })
                            }
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}