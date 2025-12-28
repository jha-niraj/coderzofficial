"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
    Lightbulb, ChevronRight, Loader2, Clock, BookOpen, Heart
} from "lucide-react";
import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import { getConceptBookmarks } from "@/actions/(main)/bookmarks/bookmarks.action";
import { cn } from "@repo/ui/lib/utils";
import { formatDistanceToNow } from "date-fns";

const difficultyColors = {
    BEGINNER: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    INTERMEDIATE: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    ADVANCED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

interface BookmarkConcept {
    id: string;
    slug: string;
    title: string;
    description?: string | null;
    thumbnail?: string | null;
    category?: string | null;
    difficulty: string;
    stepCount: number;
    estimatedTime: number | null;
    likeCount: number;
    savedAt: string | Date;
}

export default function ConceptBookmarksPage() {
    const [concepts, setConcepts] = useState<BookmarkConcept[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            setIsLoading(true);
            try {
                const result = await getConceptBookmarks();
                if (result.success && result.data) {
                    setConcepts(result.data as unknown as BookmarkConcept[]);
                }
            } catch (error) {
                console.error("Error loading concept bookmarks:", error);
            } finally {
                setIsLoading(false);
            }
        }
        loadData();
    }, []);

    return (
        <div className="min-h-screen">
            <section className="border-b border-neutral-200 dark:border-neutral-800 bg-gradient-to-b from-blue-50 to-white dark:from-blue-950/20 dark:to-neutral-950">
                <div className="max-w-6xl mx-auto px-4 py-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="flex items-center gap-4 mb-4">
                            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                                <Lightbulb className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
                                    Saved Concepts
                                </h1>
                                <p className="text-neutral-600 dark:text-neutral-400">
                                    {concepts.length} concepts bookmarked
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>
            <div className="max-w-6xl mx-auto px-4 py-8 pb-24 lg:pb-8">
                {
                    isLoading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
                        </div>
                    ) : concepts.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-20"
                        >
                            <Lightbulb className="h-16 w-16 mx-auto text-neutral-300 dark:text-neutral-700 mb-4" />
                            <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
                                No concept bookmarks
                            </h3>
                            <p className="text-neutral-500 mb-6">
                                Save concepts to revisit them later
                            </p>
                            <Button asChild>
                                <Link href="/concepts">
                                    Explore Concepts
                                    <ChevronRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </motion.div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <AnimatePresence>
                                {
                                    concepts.map((concept, index) => (
                                        <motion.div
                                            key={concept.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                        >
                                            <Link href={`/concepts/${concept.slug}`}>
                                                <div className="group rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden hover:border-neutral-300 dark:hover:border-neutral-700 transition-all duration-300 hover:shadow-lg">
                                                    <div className="relative h-36 bg-gradient-to-br from-blue-500/20 to-purple-500/20">
                                                        {
                                                            concept.thumbnail && (
                                                                <Image
                                                                    src={concept.thumbnail}
                                                                    alt={concept.title}
                                                                    fill
                                                                    className="object-cover"
                                                                />
                                                            )
                                                        }
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                                                        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                                                            <Badge
                                                                variant="secondary"
                                                                className={cn(
                                                                    "text-xs rounded-full",
                                                                    difficultyColors[concept.difficulty as keyof typeof difficultyColors]
                                                                )}
                                                            >
                                                                {concept.difficulty}
                                                            </Badge>
                                                            <div className="text-xs text-white/80 flex items-center gap-1">
                                                                <Clock className="h-3.5 w-3.5" />
                                                                {formatDistanceToNow(new Date(concept.savedAt), { addSuffix: true })}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="p-5">
                                                        <Badge variant="outline" className="text-xs rounded-full mb-2">
                                                            {concept.category?.replace(/_/g, " ")}
                                                        </Badge>

                                                        <h3 className="font-semibold text-neutral-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                                                            {concept.title}
                                                        </h3>

                                                        {
                                                            concept.description && (
                                                                <p className="text-sm text-neutral-500 line-clamp-2 mb-3">
                                                                    {concept.description}
                                                                </p>
                                                            )
                                                        }

                                                        <div className="flex items-center gap-4 text-xs text-neutral-500">
                                                            <span className="flex items-center gap-1">
                                                                <BookOpen className="h-3.5 w-3.5" />
                                                                {concept.stepCount} steps
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <Clock className="h-3.5 w-3.5" />
                                                                {concept.estimatedTime} min
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <Heart className="h-3.5 w-3.5" />
                                                                {concept.likeCount}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Link>
                                        </motion.div>
                                    ))
                                }
                            </AnimatePresence>
                        </div>
                    )
                }
            </div>
        </div>
    );
}