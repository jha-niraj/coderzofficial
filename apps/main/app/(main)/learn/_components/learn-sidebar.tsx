'use client';

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
    Search, ChevronRight, Plus, Code, Server, Database, Cpu, Cloud,
    Brain, Shield, Box, Palette, Gamepad2, Network, HardDrive, Layers,
    TestTube, GitBranch, Layout, Blocks, Settings, Lightbulb
} from "lucide-react";
import { Input } from "@repo/ui/components/ui/input";
import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import { ScrollArea } from "@repo/ui/components/ui/scroll-area";
import { cn } from "@repo/ui/lib/utils";
import { LearnDifficulty } from "@repo/prisma/client";

// Map slugs or names to icons
const ICON_MAP: Record<string, any> = {
    "web-development": Code,
    "mobile-development": Blocks,
    "data-structures": Layers,
    "algorithms": Cpu,
    "system-design": Network,
    "database": Database,
    "devops": Settings,
    "cloud-computing": Cloud,
    "machine-learning": Brain,
    "artificial-intelligence": Brain,
    "cybersecurity": Shield,
    "blockchain": Box,
    "programming-fundamentals": Code,
    "software-architecture": Layers,
    "api-design": Server,
    "testing": TestTube,
    "version-control": GitBranch,
    "ui-ux-design": Palette,
    "game-development": Gamepad2,
    "networking": Network,
    "operating-systems": HardDrive,
};

interface LearnsSidebarProps {
    categories: any[];
    selectedMainCategoryId: string | null;
    selectedSubCategoryId: string | null;
    onMainCategoryChange: (id: string | null) => void;
    onSubCategoryChange: (id: string | null) => void;
    selectedDifficulty?: LearnDifficulty | null;
    onDifficultyChange?: (difficulty: LearnDifficulty | null) => void;
    searchQuery: string;
    onSearchChange: (query: string) => void;
    totalLearns?: number;
}

export function LearnsSidebar({
    categories,
    selectedMainCategoryId,
    selectedSubCategoryId,
    onMainCategoryChange,
    onSubCategoryChange,
    selectedDifficulty,
    onDifficultyChange,
    searchQuery,
    onSearchChange,
    totalLearns = 0,
}: LearnsSidebarProps) {
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

    // Auto-expand selected category
    useEffect(() => {
        if (selectedMainCategoryId) {
            setExpandedCategories(prev => {
                const newSet = new Set(prev);
                newSet.add(selectedMainCategoryId);
                return newSet;
            });
        }
    }, [selectedMainCategoryId]);

    const toggleCategory = (id: string) => {
        setExpandedCategories(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const handleMainCategoryClick = (id: string) => {
        if (selectedMainCategoryId === id) {
            // Include clearing logic if desired, or just toggle expand
            // onMainCategoryChange(null);
            // onSubCategoryChange(null);
        } else {
            onMainCategoryChange(id);
            onSubCategoryChange(null);
            if (!expandedCategories.has(id)) {
                toggleCategory(id);
            }
        }
    };

    const handleSubCategoryClick = (mainId: string, subId: string) => {
        onMainCategoryChange(mainId);
        onSubCategoryChange(subId === selectedSubCategoryId ? null : subId);
    };

    const getCategoryIcon = (slug: string) => {
        return ICON_MAP[slug] || Layout;
    };

    return (
        <aside className="w-72 border-r border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30 flex flex-col h-full hidden lg:flex">
            <div className="p-4 border-b border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Lightbulb className="w-5 h-5 text-yellow-500" />
                        <span className="font-semibold">Learns</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                        {totalLearns.toLocaleString()}
                    </Badge>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <Input
                        placeholder="Search Learns..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="pl-9 h-9 text-sm bg-white dark:bg-neutral-900"
                    />
                </div>
            </div>
            <ScrollArea className="flex-1">
                <div className="p-4 space-y-4">
                    <div className="space-y-2">
                        <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                            Categories
                        </h3>
                        <button
                            onClick={() => {
                                onMainCategoryChange(null);
                                onSubCategoryChange(null);
                            }}
                            className={cn(
                                "w-full text-left px-3 py-2 rounded-lg text-sm transition-all font-medium",
                                !selectedMainCategoryId
                                    ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900"
                                    : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                            )}
                        >
                            All Learns
                        </button>
                        <div className="space-y-0.5">
                            {
                                categories.map((category) => {
                                    const CategoryIcon = getCategoryIcon(category.slug);
                                    const hasSubCategories = category.subCategories && category.subCategories.length > 0;
                                    const isExpanded = expandedCategories.has(category.id);
                                    const isSelected = selectedMainCategoryId === category.id;

                                    return (
                                        <div key={category.id}>
                                            <div className="flex items-center">
                                                <button
                                                    onClick={() => handleMainCategoryClick(category.id)}
                                                    className={cn(
                                                        "flex-1 flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all",
                                                        isSelected && !selectedSubCategoryId
                                                            ? "bg-neutral-200 dark:bg-neutral-700 font-medium"
                                                            : isSelected
                                                                ? "bg-neutral-100 dark:bg-neutral-800"
                                                                : "hover:bg-neutral-100 dark:hover:bg-neutral-800"
                                                    )}
                                                >
                                                    <CategoryIcon className={cn("w-4 h-4", isSelected ? "text-primary" : "text-neutral-500")} />
                                                    <span className="flex-1 text-left truncate text-neutral-700 dark:text-neutral-300">
                                                        {category.name}
                                                    </span>
                                                    {
                                                        hasSubCategories && (
                                                            <motion.div
                                                                animate={{ rotate: isExpanded ? 90 : 0 }}
                                                                transition={{ duration: 0.2 }}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    toggleCategory(category.id);
                                                                }}
                                                                className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-600 rounded"
                                                            >
                                                                <ChevronRight className="w-4 h-4 text-neutral-400" />
                                                            </motion.div>
                                                        )
                                                    }
                                                </button>
                                            </div>
                                            <AnimatePresence>
                                                {
                                                    isExpanded && hasSubCategories && (
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: "auto", opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            transition={{ duration: 0.2 }}
                                                            className="overflow-hidden"
                                                        >
                                                            <div className="ml-4 pl-3 border-l border-neutral-200 dark:border-neutral-700 py-1 space-y-0.5">
                                                                {
                                                                    category.subCategories.map((sub: any) => (
                                                                        <button
                                                                            key={sub.id}
                                                                            onClick={() => handleSubCategoryClick(category.id, sub.id)}
                                                                            className={cn(
                                                                                "w-full text-left px-3 py-1.5 rounded-md text-xs transition-colors block truncate",
                                                                                selectedSubCategoryId === sub.id
                                                                                    ? "bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-white font-medium"
                                                                                    : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800"
                                                                            )}
                                                                        >
                                                                            {sub.name}
                                                                        </button>
                                                                    ))
                                                                }
                                                            </div>
                                                        </motion.div>
                                                    )
                                                }
                                            </AnimatePresence>
                                        </div>
                                    );
                                })
                            }
                        </div>
                    </div>
                </div>
            </ScrollArea>
            <div className="p-4 border-t border-neutral-200 dark:border-neutral-800">
                <Link href="/learn/create">
                    <Button className="w-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-100">
                        <Plus className="w-4 h-4 mr-2" /> Create Learn
                    </Button>
                </Link>
            </div>
        </aside>
    );
}