'use client';

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
    Search, ChevronRight, Code, Server, Database, Cpu, Cloud,
    Brain, Shield, Box, Palette, Gamepad2, Network, HardDrive, Layers,
    TestTube, GitBranch, Layout, Blocks, Settings, Lightbulb
} from "lucide-react";
import { Input } from "@repo/ui/components/ui/input";
import { Badge } from "@repo/ui/components/ui/badge";
import { ScrollArea } from "@repo/ui/components/ui/scroll-area";
import { cn } from "@repo/ui/lib/utils";
import type { LearnCategory, LearnSubCategory } from "@/types/learn";

// Map slugs or names to icons
const ICON_MAP: Record<string, LucideIcon> = {
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
    "programming": Code,
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
    categories: LearnCategory[];
    selectedMainCategorySlug: string | null;
    searchQuery: string;
    totalLearns?: number;
}

export function LearnsSidebar({
    categories,
    selectedMainCategorySlug,
    searchQuery: initialSearchQuery,
    totalLearns = 0,
}: LearnsSidebarProps) {
    const router = useRouter();
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
    const [searchQuery, setSearchQuery] = useState(initialSearchQuery);

    // Debounce search - navigate after user stops typing
    useEffect(() => {
        const timeout = setTimeout(() => {
            if (searchQuery !== initialSearchQuery) {
                const params = new URLSearchParams();
                if (searchQuery) params.set("search", searchQuery);
                if (selectedMainCategorySlug) params.set("mainCategory", selectedMainCategorySlug);
                const url = params.toString() ? `/learn?${params.toString()}` : "/learn";
                router.push(url);
            }
        }, 400);
        return () => clearTimeout(timeout);
    }, [searchQuery, initialSearchQuery, selectedMainCategorySlug, router]);

    // Auto-expand selected category
    useEffect(() => {
        if (selectedMainCategorySlug) {
            setExpandedCategories(prev => {
                const newSet = new Set(prev);
                newSet.add(selectedMainCategorySlug);
                return newSet;
            });
        }
    }, [selectedMainCategorySlug]);

    const toggleCategory = (slug: string) => {
        setExpandedCategories(prev => {
            const newSet = new Set(prev);
            if (newSet.has(slug)) {
                newSet.delete(slug);
            } else {
                newSet.add(slug);
            }
            return newSet;
        });
    };

    const handleMainCategoryClick = (slug: string) => {
        // Navigate to /learn?mainCategory={slug}
        if (selectedMainCategorySlug === slug) {
            // Already selected, just toggle expand
            toggleCategory(slug);
        } else {
            const params = new URLSearchParams();
            params.set("mainCategory", slug);
            if (searchQuery) params.set("search", searchQuery);
            router.push(`/learn?${params.toString()}`);
            if (!expandedCategories.has(slug)) {
                toggleCategory(slug);
            }
        }
    };

    const handleSubCategoryClick = (subSlug: string) => {
        // Navigate directly to the subcategory page
        router.push(`/learn/${subSlug}`);
    };

    const handleAllCategoriesClick = () => {
        router.push("/learn");
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
                        onChange={(e) => setSearchQuery(e.target.value)}
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
                            onClick={handleAllCategoriesClick}
                            className={cn(
                                "w-full text-left px-3 py-2 rounded-lg text-sm transition-all font-medium",
                                !selectedMainCategorySlug
                                    ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900"
                                    : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                            )}
                        >
                            All Categories
                        </button>
                        <div className="space-y-0.5">
                            {categories.map((category) => {
                                const CategoryIcon = getCategoryIcon(category.slug);
                                const hasSubCategories = category.subCategories && category.subCategories.length > 0;
                                const isExpanded = expandedCategories.has(category.slug);
                                const isSelected = selectedMainCategorySlug === category.slug;

                                return (
                                    <div key={category.id}>
                                        <div className="flex items-center">
                                            <button
                                                onClick={() => handleMainCategoryClick(category.slug)}
                                                className={cn(
                                                    "flex-1 flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all",
                                                    isSelected
                                                        ? "bg-neutral-200 dark:bg-neutral-700 font-medium"
                                                        : "hover:bg-neutral-100 dark:hover:bg-neutral-800"
                                                )}
                                            >
                                                <CategoryIcon className={cn("w-4 h-4", isSelected ? "text-primary" : "text-neutral-500")} />
                                                <span className="flex-1 text-left truncate text-neutral-700 dark:text-neutral-300">
                                                    {category.name}
                                                </span>
                                                {hasSubCategories && (
                                                    <motion.div
                                                        animate={{ rotate: isExpanded ? 90 : 0 }}
                                                        transition={{ duration: 0.2 }}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            toggleCategory(category.slug);
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
                                                        {category.subCategories.map((sub: LearnSubCategory) => (
                                                            <button
                                                                key={sub.id}
                                                                onClick={() => handleSubCategoryClick(sub.slug)}
                                                                className="w-full text-left px-3 py-1.5 rounded-md text-xs transition-colors block truncate text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800"
                                                            >
                                                                {sub.name}
                                                                {sub._count?.learns ? (
                                                                    <span className="ml-1 text-neutral-400">({sub._count.learns})</span>
                                                                ) : null}
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
        </aside>
    );
}