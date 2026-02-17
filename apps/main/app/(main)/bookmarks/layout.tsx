"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    Bookmark, Lightbulb, FolderKanban, MessageSquare, GraduationCap,
    LayoutDashboard, ChevronLeft, ChevronRight, Sparkles, LucideIcon
} from "lucide-react";
import { Button } from "@repo/ui/components/ui/button";
import { cn } from "@repo/ui/lib/utils";
import { getBookmarksSummary } from "@/actions/(main)/bookmarks/bookmarks.action";

interface SidebarLink {
    href: string;
    label: string;
    icon: LucideIcon;
    count?: number;
    color: string;
}

export default function BookmarksLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [counts, setCounts] = useState({
        total: 0,
        Learns: 0,
        projects: 0,
        community: 0,
        studio: 0,
    });

    useEffect(() => {
        async function loadCounts() {
            try {
                const result = await getBookmarksSummary();
                if (result.success && result.data) {
                    setCounts({
                        total: result.data.total,
                        Learns: result.data.Learns,
                        projects: result.data.projects,
                        community: result.data.community,
                        studio: result.data.studio,
                    });
                }
            } catch (error) {
                console.error("Error loading bookmark counts:", error);
            }
        }
        loadCounts();
    }, []);

    const links: SidebarLink[] = [
        {
            href: "/bookmarks",
            label: "Overview",
            icon: LayoutDashboard,
            count: counts.total,
            color: "from-amber-500 to-orange-500",
        },
        {
            href: "/bookmarks/Learns",
            label: "Learns",
            icon: Lightbulb,
            count: counts.Learns,
            color: "from-blue-500 to-purple-500",
        },
        {
            href: "/bookmarks/projects",
            label: "Projects",
            icon: FolderKanban,
            count: counts.projects,
            color: "from-orange-500 to-red-500",
        },
        {
            href: "/bookmarks/community",
            label: "Community",
            icon: MessageSquare,
            count: counts.community,
            color: "from-green-500 to-emerald-500",
        },
        {
            href: "/bookmarks/studio",
            label: "Studio",
            icon: GraduationCap,
            count: counts.studio,
            color: "from-purple-500 to-pink-500",
        },
    ];

    const isActive = (href: string) => {
        if (href === "/bookmarks") {
            return pathname === "/bookmarks";
        }
        return pathname.startsWith(href);
    };

    return (
        <div className="flex min-h-[calc(100vh-4rem)]">
            <motion.aside
                initial={false}
                animate={{ width: isCollapsed ? 80 : 280 }}
                className="hidden lg:flex flex-col border-r border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 sticky top-16 h-[calc(100vh-4rem)]"
            >
                <div className="p-4 border-b border-neutral-200 dark:border-neutral-800">
                    <div className="flex items-center justify-between">
                        <AnimatePresence mode="wait">
                            {
                                !isCollapsed && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="flex items-center gap-3"
                                    >
                                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                                            <Bookmark className="h-5 w-5 text-white" />
                                        </div>
                                        <div>
                                            <h2 className="font-semibold text-neutral-900 dark:text-white">
                                                Bookmarks
                                            </h2>
                                            <p className="text-xs text-neutral-500">
                                                {counts.total} saved items
                                            </p>
                                        </div>
                                    </motion.div>
                                )
                            }
                        </AnimatePresence>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            className="shrink-0"
                        >
                            {
                                isCollapsed ? (
                                    <ChevronRight className="h-4 w-4" />
                                ) : (
                                    <ChevronLeft className="h-4 w-4" />
                                )
                            }
                        </Button>
                    </div>
                </div>
                <nav className="flex-1 p-3 space-y-1">
                    {
                        links.map((link) => {
                            const Icon = link.icon;
                            const active = isActive(link.href);

                            return (
                                <Link key={link.href} href={link.href}>
                                    <motion.div
                                        className={cn(
                                            "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
                                            active
                                                ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900"
                                                : "hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
                                        )}
                                        whileHover={{ x: active ? 0 : 4 }}
                                    >
                                        <div
                                            className={cn(
                                                "h-8 w-8 rounded-lg flex items-center justify-center shrink-0",
                                                active
                                                    ? `bg-gradient-to-br ${link.color}`
                                                    : "bg-neutral-100 dark:bg-neutral-800"
                                            )}
                                        >
                                            <Icon
                                                className={cn(
                                                    "h-4 w-4",
                                                    active ? "text-white" : "text-neutral-500"
                                                )}
                                            />
                                        </div>
                                        <AnimatePresence mode="wait">
                                            {
                                                !isCollapsed && (
                                                    <motion.div
                                                        initial={{ opacity: 0, width: 0 }}
                                                        animate={{ opacity: 1, width: "auto" }}
                                                        exit={{ opacity: 0, width: 0 }}
                                                        className="flex items-center justify-between flex-1 overflow-hidden"
                                                    >
                                                        <span className="font-medium text-sm whitespace-nowrap">
                                                            {link.label}
                                                        </span>
                                                        {
                                                            link.count !== undefined && link.count > 0 && (
                                                                <span
                                                                    className={cn(
                                                                        "text-xs px-2 py-0.5 rounded-full",
                                                                        active
                                                                            ? "bg-white/20 text-white dark:bg-neutral-900/30 dark:text-neutral-900"
                                                                            : "bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300"
                                                                    )}
                                                                >
                                                                    {link.count}
                                                                </span>
                                                            )
                                                        }
                                                    </motion.div>
                                                )
                                            }
                                        </AnimatePresence>
                                    </motion.div>
                                </Link>
                            );
                        })
                    }
                </nav>

                {
                    !isCollapsed && (
                        <div className="p-4 border-t border-neutral-200 dark:border-neutral-800">
                            <div className="rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Sparkles className="h-4 w-4 text-amber-500" />
                                    <span className="text-sm font-medium text-neutral-900 dark:text-white">
                                        Pro Tip
                                    </span>
                                </div>
                                <p className="text-xs text-neutral-600 dark:text-neutral-400">
                                    Organize your bookmarks by category and revisit them regularly to reinforce learning.
                                </p>
                            </div>
                        </div>
                    )
                }
            </motion.aside>
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-950/95 backdrop-blur-lg">
                <div className="flex items-center justify-around py-2 px-2">
                    {
                        links.map((link) => {
                            const Icon = link.icon;
                            const active = isActive(link.href);

                            return (
                                <Link key={link.href} href={link.href}>
                                    <div
                                        className={cn(
                                            "flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all",
                                            active
                                                ? "text-amber-600 dark:text-amber-400"
                                                : "text-neutral-500"
                                        )}
                                    >
                                        <div className="relative">
                                            <Icon className="h-5 w-5" />
                                            {
                                                active && (
                                                    <motion.div
                                                        layoutId="bookmarks-mobile-indicator"
                                                        className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-amber-500"
                                                    />
                                                )
                                            }
                                        </div>
                                        <span className="text-[10px] font-medium">{link.label}</span>
                                    </div>
                                </Link>
                            );
                        })
                    }
                </div>
            </nav>
            <main className="flex-1 bg-neutral-50 dark:bg-neutral-950">
                {children}
            </main>
        </div>
    );
}