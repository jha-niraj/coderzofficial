"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@repo/ui/lib/utils";
import { ScrollArea } from "@repo/ui/components/ui/scroll-area";
import { Button } from "@repo/ui/components/ui/button";
import { Layers, Globe, ChevronRight } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { LearnCategory, LearnSubCategory } from "@/types/learn";

interface LeaderboardSidebarProps {
    categories: LearnCategory[];
}

export function LeaderboardSidebar({ categories }: LeaderboardSidebarProps) {
    const pathname = usePathname();
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

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

    const isGlobalActive = pathname === "/Learns/leaderboard";

    return (
        <aside className="w-64 border-r bg-muted/10 hidden md:flex flex-col h-full sticky top-0">
            <div className="p-4 border-b">
                <h2 className="font-semibold text-lg flex items-center gap-2">
                    <Layers className="w-5 h-5" />
                    Leaderboards
                </h2>
            </div>

            <ScrollArea className="flex-1">
                <div className="p-2 space-y-1">
                    <Link href="/Learns/leaderboard">
                        <Button
                            variant={isGlobalActive ? "secondary" : "ghost"}
                            className="w-full justify-start font-medium"
                        >
                            <Globe className="w-4 h-4 mr-2" />
                            Global Ranking
                        </Button>
                    </Link>

                    <div className="pt-4 pb-2 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Categories
                    </div>

                    {categories.map((category) => {
                        const isExpanded = expandedCategories.has(category.id);

                        // Check if any subcategory is active to auto-expand
                        const isActiveParent = category.subCategories.some((sub: LearnSubCategory) =>
                            pathname === `/Learns/leaderboard/${sub.slug}`
                        );

                        if (isActiveParent && !isExpanded && !expandedCategories.has(category.id)) {
                            // This causes infinite loop if we set state during render.
                            // Better to use useEffect or just check pathname in render for initial state?
                            // For simplicity, let's just expanded if user clicks or manual. 
                            // Or we can initialize state based on pathname.
                        }

                        return (
                            <div key={category.id} className="space-y-1">
                                <Button
                                    variant="ghost"
                                    className="w-full justify-between hover:bg-muted/50"
                                    onClick={() => toggleCategory(category.id)}
                                >
                                    <span className="flex items-center gap-2 truncate">
                                        {/* Icon here if available */}
                                        <span className="truncate">{category.name}</span>
                                    </span>
                                    <ChevronRight
                                        className={cn(
                                            "h-4 w-4 transition-transform text-muted-foreground",
                                            isExpanded && "rotate-90"
                                        )}
                                    />
                                </Button>

                                <AnimatePresence>
                                    {(isExpanded || isActiveParent) && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden ml-4 border-l pl-2 space-y-1"
                                        >
                                            {category.subCategories.map((sub: LearnSubCategory) => {
                                                const isActive = pathname === `/Learns/leaderboard/${sub.slug}`;
                                                return (
                                                    <Link key={sub.id} href={`/Learns/leaderboard/${sub.slug}`}>
                                                        <Button
                                                            variant={isActive ? "secondary" : "ghost"}
                                                            size="sm"
                                                            className="w-full justify-start h-8 text-sm font-normal"
                                                        >
                                                            {sub.name}
                                                        </Button>
                                                    </Link>
                                                );
                                            })}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })}
                </div>
            </ScrollArea>
        </aside>
    );
}
