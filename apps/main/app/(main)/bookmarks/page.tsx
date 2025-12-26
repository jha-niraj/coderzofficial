"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
    Bookmark, Lightbulb, FolderKanban, MessageSquare, GraduationCap,
    ChevronRight, Clock, BookMarked, LucideIcon
} from "lucide-react";
import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import { 
    Card, CardContent 
} from "@repo/ui/components/ui/card";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import { getBookmarksSummary } from "@/actions/(main)/bookmarks/bookmarks.action";
import { cn } from "@repo/ui/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface ModuleCard {
    id: string;
    label: string;
    icon: LucideIcon;
    href: string;
    color: string;
    bgColor: string;
    count: number;
    recent: any[];
}

export default function BookmarksPage() {
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            setIsLoading(true);
            try {
                const result = await getBookmarksSummary();
                if (result.success && result.data) {
                    setData(result.data);
                }
            } catch (error) {
                console.error("Error loading bookmarks:", error);
            } finally {
                setIsLoading(false);
            }
        }
        loadData();
    }, []);

    const modules: ModuleCard[] = data ? [
        {
            id: "concepts",
            label: "Concepts",
            icon: Lightbulb,
            href: "/bookmarks/concepts",
            color: "text-blue-500",
            bgColor: "from-blue-500 to-purple-500",
            count: data.byModule.concepts.count,
            recent: data.byModule.concepts.recent,
        },
        {
            id: "projects",
            label: "Projects",
            icon: FolderKanban,
            href: "/bookmarks/projects",
            color: "text-orange-500",
            bgColor: "from-orange-500 to-red-500",
            count: data.byModule.projects.count,
            recent: data.byModule.projects.recent,
        },
        {
            id: "community",
            label: "Community",
            icon: MessageSquare,
            href: "/bookmarks/community",
            color: "text-green-500",
            bgColor: "from-green-500 to-emerald-500",
            count: data.byModule.community.count,
            recent: data.byModule.community.recent,
        },
        {
            id: "studio",
            label: "Studio",
            icon: GraduationCap,
            href: "/bookmarks/studio",
            color: "text-purple-500",
            bgColor: "from-purple-500 to-pink-500",
            count: 0,
            recent: [],
        },
    ] : [];

    if (isLoading) {
        return <BookmarksSkeleton />;
    }

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative overflow-hidden border-b border-neutral-200 dark:border-neutral-800">
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
                <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />

                <div className="relative max-w-6xl mx-auto px-4 py-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 mb-4">
                            <BookMarked className="h-5 w-5" />
                            <span className="text-sm font-medium">Your Collection</span>
                        </div>
                        <h1 className="text-4xl font-bold text-neutral-900 dark:text-white mb-3">
                            Bookmarks
                        </h1>
                        <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl">
                            All your saved content in one place. Organized by type for easy access.
                        </p>
                    </motion.div>

                    {/* Stats */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8"
                    >
                        <Card className="border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm">
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                                        <Bookmark className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-neutral-900 dark:text-white">
                                            {data?.totalBookmarks || 0}
                                        </div>
                                        <div className="text-xs text-neutral-500">Total Saved</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm">
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                                        <Lightbulb className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-neutral-900 dark:text-white">
                                            {data?.byModule.concepts.count || 0}
                                        </div>
                                        <div className="text-xs text-neutral-500">Concepts</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm">
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                                        <FolderKanban className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-neutral-900 dark:text-white">
                                            {data?.byModule.projects.count || 0}
                                        </div>
                                        <div className="text-xs text-neutral-500">Projects</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm">
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                                        <MessageSquare className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-neutral-900 dark:text-white">
                                            {data?.byModule.community.count || 0}
                                        </div>
                                        <div className="text-xs text-neutral-500">Posts</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </section>

            {/* Module Cards */}
            <section className="max-w-6xl mx-auto px-4 py-12">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                        Browse by Category
                    </h2>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    {modules.map((module, index) => {
                        const Icon = module.icon;

                        return (
                            <motion.div
                                key={module.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Link href={module.href}>
                                    <Card className="group h-full border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all duration-300 hover:shadow-lg overflow-hidden">
                                        <CardContent className="p-0">
                                            <div className={cn(
                                                "h-24 bg-gradient-to-br relative overflow-hidden",
                                                module.bgColor
                                            )}>
                                                <Icon className="absolute right-4 bottom-2 h-20 w-20 text-white/20" />
                                            </div>
                                            <div className="p-5">
                                                <div className="flex items-start justify-between mb-3">
                                                    <div>
                                                        <h3 className="font-semibold text-neutral-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                                                            {module.label}
                                                        </h3>
                                                        <p className="text-sm text-neutral-500">
                                                            {module.count} bookmarked
                                                        </p>
                                                    </div>
                                                    <ChevronRight className="h-5 w-5 text-neutral-400 group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
                                                </div>

                                                {module.recent.length > 0 && (
                                                    <div className="space-y-2">
                                                        {module.recent.slice(0, 2).map((item: any) => (
                                                            <div
                                                                key={item.id}
                                                                className="flex items-center gap-2 text-sm"
                                                            >
                                                                <div className={cn(
                                                                    "h-2 w-2 rounded-full",
                                                                    `bg-gradient-to-br ${module.bgColor}`
                                                                )} />
                                                                <span className="text-neutral-600 dark:text-neutral-400 truncate flex-1">
                                                                    {item.title}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            </motion.div>
                        );
                    })}
                </div>
            </section>

            {/* Recent Saves */}
            {data?.recentSaves?.length > 0 && (
                <section className="max-w-6xl mx-auto px-4 pb-24 lg:pb-12">
                    <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-6">
                        Recently Saved
                    </h2>
                    <div className="space-y-3">
                        <AnimatePresence>
                            {data.recentSaves.map((item: any, index: number) => (
                                <motion.div
                                    key={`${item.type}-${item.id}`}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <Link
                                        href={
                                            item.type === "concept"
                                                ? `/concepts/${item.slug}`
                                                : item.type === "project"
                                                    ? `/projects/${item.slug}`
                                                    : `/communities/${item.communitySlug}/post/${item.id}`
                                        }
                                    >
                                        <div className="flex items-center gap-4 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all duration-200 group">
                                            {/* Thumbnail */}
                                            <div className={cn(
                                                "h-12 w-12 rounded-xl flex items-center justify-center shrink-0 bg-gradient-to-br",
                                                item.type === "concept" && "from-blue-500 to-purple-500",
                                                item.type === "project" && "from-orange-500 to-red-500",
                                                item.type === "community" && "from-green-500 to-emerald-500"
                                            )}>
                                                {item.type === "concept" && <Lightbulb className="h-6 w-6 text-white" />}
                                                {item.type === "project" && <FolderKanban className="h-6 w-6 text-white" />}
                                                {item.type === "community" && <MessageSquare className="h-6 w-6 text-white" />}
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <Badge variant="secondary" className="text-xs rounded-full capitalize">
                                                        {item.type}
                                                    </Badge>
                                                    {item.category && (
                                                        <Badge variant="outline" className="text-xs rounded-full">
                                                            {item.category.replace(/_/g, " ")}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <h4 className="font-medium text-neutral-900 dark:text-white truncate group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                                                    {item.title}
                                                </h4>
                                            </div>

                                            {/* Time */}
                                            <div className="text-xs text-neutral-400 shrink-0 flex items-center gap-1">
                                                <Clock className="h-3.5 w-3.5" />
                                                {formatDistanceToNow(new Date(item.savedAt), { addSuffix: true })}
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </section>
            )}

            {/* Empty State */}
            {data?.totalBookmarks === 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-20"
                >
                    <div className="max-w-md mx-auto">
                        <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mx-auto mb-6">
                            <Bookmark className="h-10 w-10 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-3">
                            No bookmarks yet
                        </h2>
                        <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                            Save concepts, projects, and posts to access them later. Start exploring to find content worth saving!
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Button asChild variant="default" className="rounded-full">
                                <Link href="/concepts">
                                    Explore Concepts
                                    <ChevronRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                            <Button asChild variant="outline" className="rounded-full">
                                <Link href="/projects">
                                    Browse Projects
                                    <ChevronRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
}

function BookmarksSkeleton() {
    return (
        <div className="min-h-screen">
            <section className="border-b border-neutral-200 dark:border-neutral-800">
                <div className="max-w-6xl mx-auto px-4 py-12">
                    <Skeleton className="h-5 w-32 mb-4" />
                    <Skeleton className="h-10 w-64 mb-3" />
                    <Skeleton className="h-6 w-96" />
                    <div className="grid grid-cols-4 gap-4 mt-8">
                        {[1, 2, 3, 4].map((i) => (
                            <Skeleton key={i} className="h-20 rounded-xl" />
                        ))}
                    </div>
                </div>
            </section>
            <div className="max-w-6xl mx-auto px-4 py-12">
                <Skeleton className="h-8 w-48 mb-6" />
                <div className="grid md:grid-cols-2 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="h-52 rounded-2xl" />
                    ))}
                </div>
            </div>
        </div>
    );
}
