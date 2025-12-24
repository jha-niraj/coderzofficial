"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import {
    Eye, Heart, Clock, BookOpen, ChevronLeft, ChevronRight
} from "lucide-react";
import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import {
    Card, CardContent, CardFooter
} from "@repo/ui/components/ui/card";
import {
    Avatar, AvatarFallback, AvatarImage
} from "@repo/ui/components/ui/avatar";
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
        likes: number;
        comments: number;
    };
}

interface Pagination {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

interface ConceptsGridProps {
    concepts: Concept[];
    pagination: Pagination;
    search?: string;
    category?: ConceptCategory;
    difficulty?: ConceptDifficulty;
    sortBy?: string;
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

export default function ConceptsGrid({
    concepts,
    pagination,
    search,
    category,
    difficulty,
    sortBy,
}: ConceptsGridProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const goToPage = (page: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", page.toString());
        router.push(`/concepts/browse?${params.toString()}`);
    };

    if (concepts.length === 0) {
        return (
            <div className="text-center py-16">
                <div className="w-16 h-16 mx-auto bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mb-4">
                    <BookOpen className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">
                    No concepts found
                </h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                    {
                        search
                            ? `No concepts match "${search}". Try a different search term.`
                            : "No concepts match your filters. Try adjusting them."
                    }
                </p>
                <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => router.push("/concepts/browse")}
                >
                    Clear filters
                </Button>
            </div>
        );
    }

    return (
        <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {
                    concepts.map((concept, index) => (
                        <motion.div
                            key={concept.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                        >
                            <Link href={`/concepts/${concept.slug}`}>
                                <Card className="group h-full overflow-hidden hover:shadow-lg transition-all duration-300 border-neutral-200 dark:border-neutral-800 hover:border-blue-300 dark:hover:border-blue-700">
                                    <div className="relative h-36 bg-gradient-to-br from-blue-500 to-indigo-600 overflow-hidden">
                                        {
                                            concept.thumbnail ? (
                                                <Image
                                                    src={concept.thumbnail}
                                                    alt={concept.title}
                                                    fill
                                                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                            ) : (
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <span className="text-5xl opacity-50">
                                                        {concept.iconEmoji || "📚"}
                                                    </span>
                                                </div>
                                            )
                                        }
                                        <div className="absolute top-3 right-3">
                                            <Badge className={difficultyConfig[concept.difficulty].color}>
                                                {difficultyConfig[concept.difficulty].label}
                                            </Badge>
                                        </div>
                                    </div>
                                    <CardContent className="p-4">
                                        <Badge variant="outline" className="text-xs mb-2">
                                            {concept.category.replace(/_/g, " ")}
                                        </Badge>
                                        <h3 className="font-semibold text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                                            {concept.title}
                                        </h3>
                                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                            {concept.shortDescription || concept.description}
                                        </p>
                                        <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
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
                                        </div>
                                    </CardContent>
                                    <CardFooter className="px-4 py-3 bg-neutral-50 dark:bg-neutral-900/50 border-t border-neutral-100 dark:border-neutral-800">
                                        <div className="flex items-center justify-between w-full">
                                            <div className="flex items-center gap-2">
                                                <Avatar className="w-5 h-5">
                                                    <AvatarImage src={concept.creator.image || ""} />
                                                    <AvatarFallback className="text-xs">
                                                        {concept.creator.name?.charAt(0) || "A"}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <span className="text-xs text-muted-foreground">
                                                    {concept.creator.name || "Admin"}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                <Heart className="w-3.5 h-3.5" />
                                                <span>{formatCount(concept.likeCount)}</span>
                                            </div>
                                        </div>
                                    </CardFooter>
                                </Card>
                            </Link>
                        </motion.div>
                    ))
                }
            </div>
            {
                pagination.totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-8">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => goToPage(pagination.page - 1)}
                            disabled={pagination.page <= 1}
                        >
                            <ChevronLeft className="w-4 h-4 mr-1" />
                            Previous
                        </Button>
                        <div className="flex items-center gap-1">
                            {
                                Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                                    let pageNum: number;
                                    if (pagination.totalPages <= 5) {
                                        pageNum = i + 1;
                                    } else if (pagination.page <= 3) {
                                        pageNum = i + 1;
                                    } else if (pagination.page >= pagination.totalPages - 2) {
                                        pageNum = pagination.totalPages - 4 + i;
                                    } else {
                                        pageNum = pagination.page - 2 + i;
                                    }

                                    return (
                                        <Button
                                            key={pageNum}
                                            variant={pagination.page === pageNum ? "default" : "outline"}
                                            size="sm"
                                            className="w-9 h-9 p-0"
                                            onClick={() => goToPage(pageNum)}
                                        >
                                            {pageNum}
                                        </Button>
                                    );
                                })
                            }
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => goToPage(pagination.page + 1)}
                            disabled={pagination.page >= pagination.totalPages}
                        >
                            Next
                            <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                    </div>
                )
            }
            <div className="text-center text-sm text-muted-foreground mt-4">
                Showing {(pagination.page - 1) * pagination.limit + 1} -{" "}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
                {pagination.total} concepts
            </div>
        </div>
    );
}