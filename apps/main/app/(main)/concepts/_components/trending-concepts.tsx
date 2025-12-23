"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
    ArrowRight, Eye, Heart, Clock, BookOpen
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
    Card, CardContent, CardFooter
} from "@/components/ui/card";
import {
    Avatar, AvatarFallback, AvatarImage
} from "@/components/ui/avatar";
import { ConceptCategory, ConceptDifficulty } from "@prisma/client";

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
    creator: {
        id: string;
        name?: string | null;
        username?: string | null;
        image?: string | null;
    };
    _count: {
        steps: number;
    };
}

interface TrendingConceptsProps {
    concepts: Concept[];
}

const difficultyConfig: Record<
    ConceptDifficulty,
    { label: string; color: string }
> = {
    BEGINNER: { label: "Beginner", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
    INTERMEDIATE: { label: "Intermediate", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" },
    ADVANCED: { label: "Advanced", color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" },
    EXPERT: { label: "Expert", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
};

function formatCount(count: number): string {
    if (count >= 1000) {
        return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
}

export default function TrendingConcepts({ concepts }: TrendingConceptsProps) {
    if (concepts.length === 0) {
        return null;
    }

    return (
        <section>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                        🔥 Trending Concepts
                    </h2>
                    <p className="text-neutral-600 dark:text-neutral-400 mt-1">
                        Most popular concepts this week
                    </p>
                </div>
                <Link
                    href="/concepts/browse?sortBy=popular"
                    className="flex items-center gap-1 text-sm font-medium text-neutral-900 dark:text-white hover:underline"
                >
                    View all
                    <ArrowRight className="w-4 h-4" />
                </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {
                    concepts.map((concept, index) => (
                        <motion.div
                            key={concept.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                        >
                            <Link href={`/concepts/${concept.slug}`}>
                                <Card className="group h-full overflow-hidden bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 hover:shadow-xl transition-all duration-300">
                                    <div className="relative h-44 bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-900 overflow-hidden">
                                        {
                                            concept.thumbnail ? (
                                                <Image
                                                    src={concept.thumbnail}
                                                    alt={concept.title}
                                                    fill
                                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                            ) : (
                                                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-neutral-100 to-neutral-50 dark:from-neutral-800 dark:to-neutral-900">
                                                    <span className="text-7xl">
                                                        {concept.iconEmoji || "📚"}
                                                    </span>
                                                </div>
                                            )
                                        }
                                        <div className="absolute top-3 left-3">
                                            <Badge className="bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 shadow-lg">
                                                #{index + 1} Trending
                                            </Badge>
                                        </div>
                                        <div className="absolute top-3 right-3">
                                            <Badge className={difficultyConfig[concept.difficulty].color}>
                                                {difficultyConfig[concept.difficulty].label}
                                            </Badge>
                                        </div>
                                    </div>
                                    <CardContent className="p-5">
                                        <h3 className="font-semibold text-lg text-neutral-900 dark:text-white group-hover:text-neutral-700 dark:group-hover:text-neutral-200 transition-colors line-clamp-1">
                                            {concept.title}
                                        </h3>
                                        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2 line-clamp-2">
                                            {concept.shortDescription || concept.description}
                                        </p>
                                        <div className="flex items-center gap-4 mt-4 text-xs text-neutral-500 dark:text-neutral-400">
                                            <div className="flex items-center gap-1">
                                                <BookOpen className="w-3.5 h-3.5" />
                                                <span>{concept._count.steps} steps</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Clock className="w-3.5 h-3.5" />
                                                <span>{concept.estimatedTime || 10} min</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Eye className="w-3.5 h-3.5" />
                                                <span>{formatCount(concept.viewCount)}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Heart className="w-3.5 h-3.5" />
                                                <span>{formatCount(concept.likeCount)}</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="px-5 py-3 bg-neutral-50 dark:bg-neutral-800/50 border-t border-neutral-100 dark:border-neutral-800">
                                        <div className="flex items-center gap-2">
                                            <Avatar className="w-6 h-6 border border-neutral-200 dark:border-neutral-700">
                                                <AvatarImage src={concept.creator.image || ""} />
                                                <AvatarFallback className="text-xs bg-neutral-100 dark:bg-neutral-800">
                                                    {concept.creator.name?.charAt(0) || "A"}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span className="text-xs text-neutral-500 dark:text-neutral-400">
                                                {concept.creator.name || concept.creator.username || "Admin"}
                                            </span>
                                        </div>
                                    </CardFooter>
                                </Card>
                            </Link>
                        </motion.div>
                    ))
                }
            </div>
        </section>
    );
}