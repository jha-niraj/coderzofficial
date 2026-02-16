'use client';

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
    Search, ChevronRight, Plus, Code, Server, Database,
    Cpu, Cloud, Brain, Shield, Box, Palette, Gamepad2, Network, HardDrive,
    Layers, TestTube, GitBranch, Layout, Blocks, Settings, Filter, Lightbulb
} from "lucide-react";
import { Input } from "@repo/ui/components/ui/input";
import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import { Separator } from "@repo/ui/components/ui/separator";
import { ScrollArea } from "@repo/ui/components/ui/scroll-area";
import { cn } from "@repo/ui/lib/utils";
import { ConceptCategory, ConceptDifficulty } from "@repo/prisma/client";
import { getSubCategoriesByCategory } from "@/actions/(main)/concepts/concept.action";

const CATEGORY_CONFIG: Record<ConceptCategory, {
    label: string;
    icon: any;
    color: string;
}> = {
    WEB_DEVELOPMENT: { label: "Web Development", icon: Code, color: "text-blue-500" },
    MOBILE_DEVELOPMENT: { label: "Mobile Development", icon: Blocks, color: "text-green-500" },
    DATA_STRUCTURES: { label: "Data Structures", icon: Layers, color: "text-purple-500" },
    ALGORITHMS: { label: "Algorithms", icon: Cpu, color: "text-orange-500" },
    SYSTEM_DESIGN: { label: "System Design", icon: Network, color: "text-cyan-500" },
    DATABASE: { label: "Database", icon: Database, color: "text-emerald-500" },
    DEVOPS: { label: "DevOps", icon: Settings, color: "text-yellow-500" },
    CLOUD_COMPUTING: { label: "Cloud Computing", icon: Cloud, color: "text-sky-500" },
    MACHINE_LEARNING: { label: "Machine Learning", icon: Brain, color: "text-pink-500" },
    ARTIFICIAL_INTELLIGENCE: { label: "AI", icon: Brain, color: "text-violet-500" },
    CYBERSECURITY: { label: "Cybersecurity", icon: Shield, color: "text-red-500" },
    BLOCKCHAIN: { label: "Blockchain", icon: Box, color: "text-amber-500" },
    PROGRAMMING_FUNDAMENTALS: { label: "Programming Fundamentals", icon: Code, color: "text-indigo-500" },
    SOFTWARE_ARCHITECTURE: { label: "Software Architecture", icon: Layers, color: "text-teal-500" },
    API_DESIGN: { label: "API Design", icon: Server, color: "text-lime-500" },
    TESTING: { label: "Testing", icon: TestTube, color: "text-rose-500" },
    VERSION_CONTROL: { label: "Version Control", icon: GitBranch, color: "text-orange-600" },
    UI_UX_DESIGN: { label: "UI/UX Design", icon: Palette, color: "text-fuchsia-500" },
    GAME_DEVELOPMENT: { label: "Game Development", icon: Gamepad2, color: "text-red-400" },
    NETWORKING: { label: "Networking", icon: Network, color: "text-blue-400" },
    OPERATING_SYSTEMS: { label: "Operating Systems", icon: HardDrive, color: "text-gray-500" },
    CUSTOM: { label: "Custom", icon: Layout, color: "text-neutral-500" },
};

const DIFFICULTY_FILTERS = [
    { key: "BEGINNER", label: "Beginner", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
    { key: "INTERMEDIATE", label: "Intermediate", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" },
    { key: "ADVANCED", label: "Advanced", color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" },
    { key: "EXPERT", label: "Expert", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
];

interface ConceptsSidebarProps {
    selectedCategory: ConceptCategory | null;
    selectedSubCategory: string | null;
    selectedDifficulty: ConceptDifficulty | null;
    onCategoryChange: (category: ConceptCategory | null) => void;
    onSubCategoryChange: (subCategory: string | null) => void;
    onDifficultyChange: (difficulty: ConceptDifficulty | null) => void;
    searchQuery: string;
    onSearchChange: (query: string) => void;
    totalConcepts?: number;
}

export function ConceptsSidebar({
    selectedCategory,
    selectedSubCategory,
    selectedDifficulty,
    onCategoryChange,
    onSubCategoryChange,
    onDifficultyChange,
    searchQuery,
    onSearchChange,
    totalConcepts = 0,
}: ConceptsSidebarProps) {
    const [expandedCategories, setExpandedCategories] = useState<Set<ConceptCategory>>(new Set());
    const [subCategoriesMap, setSubCategoriesMap] = useState<Record<ConceptCategory, string[]>>({} as Record<ConceptCategory, string[]>);
    const [isLoadingSubCategories, setIsLoadingSubCategories] = useState(true);

    useEffect(() => {
        const fetchSubCategories = async () => {
            setIsLoadingSubCategories(true);
            try {
                const result = await getSubCategoriesByCategory();
                if (result.subCategories) {
                    setSubCategoriesMap(result.subCategories as Record<ConceptCategory, string[]>);
                }
            } catch (error) {
                console.error("Failed to fetch subcategories:", error);
            } finally {
                setIsLoadingSubCategories(false);
            }
        };
        fetchSubCategories();
    }, []);

    const toggleCategory = (category: ConceptCategory) => {
        const newExpanded = new Set(expandedCategories);
        if (newExpanded.has(category)) {
            newExpanded.delete(category);
        } else {
            newExpanded.add(category);
        }
        setExpandedCategories(newExpanded);
    };

    const handleCategoryClick = (category: ConceptCategory) => {
        const isCurrentlySelected = selectedCategory === category;
        if (isCurrentlySelected) {
            onCategoryChange(null);
            onSubCategoryChange(null);
        } else {
            onCategoryChange(category);
            onSubCategoryChange(null);
            const hasSubCategories = subCategoriesMap[category]?.length > 0;
            if (hasSubCategories && !expandedCategories.has(category)) {
                toggleCategory(category);
            }
        }
    };

    const handleSubCategoryClick = (category: ConceptCategory, subCategory: string) => {
        onCategoryChange(category);
        if (selectedSubCategory === subCategory) {
            onSubCategoryChange(null);
        } else {
            onSubCategoryChange(subCategory);
        }
    };

    return (
        <aside className="w-72 border-r border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30 flex flex-col h-full">
            <div className="p-4 border-b border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Lightbulb className="w-5 h-5 text-yellow-500" />
                        <span className="font-semibold">Concepts</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                        {totalConcepts.toLocaleString()}
                    </Badge>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <Input
                        placeholder="Search concepts..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="pl-9 h-9 text-sm bg-white dark:bg-neutral-900"
                    />
                </div>
            </div>

            <ScrollArea className="flex-1">
                <div className="p-4 space-y-6">
                    <div className="space-y-2">
                        <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider flex items-center gap-2">
                            <Filter className="w-3.5 h-3.5" /> Difficulty
                        </h3>
                        <div className="flex flex-wrap gap-1.5">
                            {DIFFICULTY_FILTERS.map((diff) => (
                                <button
                                    key={diff.key}
                                    onClick={() => onDifficultyChange(
                                        selectedDifficulty === diff.key ? null : diff.key as ConceptDifficulty
                                    )}
                                    className={cn(
                                        "px-2.5 py-1 rounded-md text-xs border transition-all",
                                        selectedDifficulty === diff.key
                                            ? diff.color + " border-transparent font-medium"
                                            : "bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-800 hover:border-neutral-300"
                                    )}
                                >
                                    {diff.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                        <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                            Categories
                        </h3>
                        <button
                            onClick={() => {
                                onCategoryChange(null);
                                onSubCategoryChange(null);
                            }}
                            className={cn(
                                "w-full text-left px-3 py-2 rounded-lg text-sm transition-all font-medium",
                                !selectedCategory
                                    ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900"
                                    : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                            )}
                        >
                            All Concepts
                        </button>
                        <div className="space-y-0.5">
                            {Object.entries(CATEGORY_CONFIG).map(([key, config]) => {
                                const category = key as ConceptCategory;
                                const CategoryIcon = config.icon;
                                const subCategories = subCategoriesMap[category] || [];
                                const hasSubCategories = subCategories.length > 0;
                                const isExpanded = expandedCategories.has(category);
                                const isSelected = selectedCategory === category;

                                return (
                                    <div key={key}>
                                        <div className="flex items-center">
                                            <button
                                                onClick={() => handleCategoryClick(category)}
                                                className={cn(
                                                    "flex-1 flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all",
                                                    isSelected && !selectedSubCategory
                                                        ? "bg-neutral-200 dark:bg-neutral-700 font-medium"
                                                        : isSelected
                                                            ? "bg-neutral-100 dark:bg-neutral-800"
                                                            : "hover:bg-neutral-100 dark:hover:bg-neutral-800"
                                                )}
                                            >
                                                <CategoryIcon className={cn("w-4 h-4", config.color)} />
                                                <span className="flex-1 text-left truncate text-neutral-700 dark:text-neutral-300">
                                                    {config.label}
                                                </span>
                                                {hasSubCategories && (
                                                    <motion.div
                                                        animate={{ rotate: isExpanded ? 90 : 0 }}
                                                        transition={{ duration: 0.2 }}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            toggleCategory(category);
                                                        }}
                                                        className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-600 rounded"
                                                    >
                                                        <ChevronRight className="w-4 h-4 text-neutral-400" />
                                                    </motion.div>
                                                )}
                                            </button>
                                        </div>
                                        <AnimatePresence>
                                            {isExpanded && hasSubCategories && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: "auto", opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="ml-4 pl-3 border-l border-neutral-200 dark:border-neutral-700 py-1 space-y-0.5">
                                                        {subCategories.map((sub) => (
                                                            <button
                                                                key={sub}
                                                                onClick={() => handleSubCategoryClick(category, sub)}
                                                                className={cn(
                                                                    "w-full text-left px-3 py-1.5 rounded-md text-xs transition-colors",
                                                                    selectedSubCategory === sub
                                                                        ? "bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-white font-medium"
                                                                        : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800"
                                                                )}
                                                            >
                                                                {sub}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </ScrollArea>
            <div className="p-4 border-t border-neutral-200 dark:border-neutral-800">
                <Link href="/concepts/create">
                    <Button className="w-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-100">
                        <Plus className="w-4 h-4 mr-2" /> Create Concept
                    </Button>
                </Link>
            </div>
        </aside>
    );
}