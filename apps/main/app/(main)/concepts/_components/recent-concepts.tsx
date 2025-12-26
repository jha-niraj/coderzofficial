"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
    ArrowRight, Clock, BookOpen, Sparkles
} from "lucide-react";
import { Badge } from "@repo/ui/components/ui/badge";
import { Card, CardContent } from "@repo/ui/components/ui/card";
import { ConceptCategory, ConceptDifficulty } from "@repo/prisma/client";

interface Concept {
    id: string;
    slug: string;
    title: string;
    shortDescription?: string | null;
    description: string;
    thumbnail?: string | null;
    iconEmoji?: string | null;
    category: ConceptCategory;
    difficulty: ConceptDifficulty;
    estimatedTime?: number | null;
    viewCount: number;
    likeCount: number;
    createdAt: Date;
    _count: {
        steps: number;
        likes: number;
        comments: number;
    };
}

interface RecentConceptsProps {
    concepts: Concept[];
}

const difficultyColors: Record<ConceptDifficulty, string> = {
    BEGINNER: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    INTERMEDIATE: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    ADVANCED: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    EXPERT: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

function formatTimeAgo(date: Date): string {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return "Just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString();
}

export default function RecentConcepts({ concepts }: RecentConceptsProps) {
    if (concepts.length === 0) {
        return (
            <section>
                <div className="text-center py-12">
                    <Sparkles className="w-12 h-12 mx-auto text-neutral-400 dark:text-neutral-600 mb-4" />
                    <h3 className="text-lg font-medium text-neutral-900 dark:text-white">
                        No concepts yet
                    </h3>
                    <p className="text-neutral-500 dark:text-neutral-400 mt-1">
                        Check back soon for new learning content!
                    </p>
                </div>
            </section>
        );
    }

    return (
        <section>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                        <Sparkles className="w-6 h-6 text-neutral-900 dark:text-white" />
                        Recently Added
                    </h2>
                    <p className="text-neutral-600 dark:text-neutral-400 mt-1">
                        Fresh concepts to explore
                    </p>
                </div>
                <Link
                    href="/concepts/browse?sortBy=latest"
                    className="flex items-center gap-1 text-sm font-medium text-neutral-900 dark:text-white hover:underline"
                >
                    View all
                    <ArrowRight className="w-4 h-4" />
                </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {
                    concepts.map((concept, index) => (
                        <motion.div
                            key={concept.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                        >
                            <Link href={`/concepts/${concept.slug}`}>
                                <Card className="group h-full overflow-hidden bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 hover:shadow-lg transition-all duration-300">
                                    <CardContent className="p-4">
                                        <div className="flex items-start gap-3 mb-3">
                                            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-2xl">
                                                {concept.iconEmoji || "📚"}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h3 className="font-semibold text-neutral-900 dark:text-white group-hover:text-neutral-700 dark:group-hover:text-neutral-200 transition-colors line-clamp-2 text-sm">
                                                    {concept.title}
                                                </h3>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 mb-3">
                                            <Badge variant="outline" className="text-xs truncate max-w-[100px] border-neutral-200 dark:border-neutral-700">
                                                {concept.category.replace(/_/g, " ")}
                                            </Badge>
                                            <Badge className={`text-xs ${difficultyColors[concept.difficulty]}`}>
                                                {concept.difficulty}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
                                            <div className="flex items-center gap-3">
                                                <span className="flex items-center gap-1">
                                                    <BookOpen className="w-3.5 h-3.5" />
                                                    {concept._count.steps}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    {concept.estimatedTime || 10}m
                                                </span>
                                            </div>
                                            <span className="text-neutral-900 dark:text-white font-medium">
                                                New
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        </motion.div>
                    ))
                }
            </div>
        </section>
    );
}