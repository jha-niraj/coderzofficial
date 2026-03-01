"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@repo/ui/components/ui/card";
import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import {
    ChevronRight, Clock, Eye, Heart, Bookmark, BookmarkX
} from "lucide-react";
import Link from "next/link";
import { toggleLearnBookmark, getUserBookmarks } from "@/actions/(main)/learn/learn.action";
import toast from "@repo/ui/components/ui/sonner";

interface BookmarkItem {
    id: string;
    createdAt: Date;
    learn: {
        id: string;
        title: string;
        slug: string;
        description: string;
        iconEmoji?: string | null;
        difficulty: string;
        estimatedTime?: number | null;
        viewCount?: number;
        likeCount?: number;
    };
}

const difficultyStyles: Record<string, { label: string; color: string }> = {
    BEGINNER: { label: "Beginner", color: "text-green-500 bg-green-500/10" },
    INTERMEDIATE: { label: "Intermediate", color: "text-amber-500 bg-amber-500/10" },
    ADVANCED: { label: "Advanced", color: "text-orange-500 bg-orange-500/10" },
    EXPERT: { label: "Expert", color: "text-red-500 bg-red-500/10" },
};

export function BookmarksTab() {
    const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [removingId, setRemovingId] = useState<string | null>(null);

    useEffect(() => {
        const loadBookmarks = async () => {
            try {
                const result = await getUserBookmarks();
                if (result.bookmarks) {
                    setBookmarks(result.bookmarks as unknown as BookmarkItem[]);
                }
            } catch (error) {
                console.error("Failed to load bookmarks:", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadBookmarks();
    }, []);

    const handleRemoveBookmark = async (learnId: string) => {
        setRemovingId(learnId);
        try {
            const result = await toggleLearnBookmark(learnId);
            if ('bookmarked' in result) {
                setBookmarks((prev) => prev.filter((b) => b.learn.id !== learnId));
                toast.success("Bookmark removed");
            } else {
                toast.error(result.error || "Failed to remove bookmark");
            }
        } catch {
            toast.error("Something went wrong");
        } finally {
            setRemovingId(null);
        }
    };

    if (isLoading) {
        return (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="h-56 rounded-xl" />
                ))}
            </div>
        );
    }

    if (bookmarks.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-20"
            >
                <div className="h-20 w-20 mx-auto rounded-full bg-muted/50 flex items-center justify-center mb-6">
                    <Bookmark className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No Bookmarks Yet</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Save learns you want to revisit later. Click the bookmark icon on any learn to add it here.
                </p>
            </motion.div>
        );
    }

    return (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
                {bookmarks.map((bookmark, index) => {
                    const learn = bookmark.learn;
                    const difficultyStyle = difficultyStyles[learn.difficulty] || { label: learn.difficulty, color: "text-gray-500 bg-gray-500/10" };
                    const isRemoving = removingId === learn.id;

                    return (
                        <motion.div
                            key={bookmark.id}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                        >
                            <Card className="group h-full hover:shadow-lg transition-all duration-300 relative overflow-hidden">
                                <CardContent className="p-6 flex flex-col h-full">
                                    <div className="flex items-center gap-2 flex-wrap mb-4">
                                        <Badge className={difficultyStyle.color}>
                                            {difficultyStyle.label}
                                        </Badge>
                                    </div>
                                    <Link href={`/learn/topic/${learn.slug}`} className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="text-2xl">{learn.iconEmoji || "📚"}</span>
                                            <h3 className="font-semibold text-lg group-hover:text-primary transition-colors line-clamp-2">
                                                {learn.title}
                                            </h3>
                                        </div>
                                        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                                            {learn.description}
                                        </p>
                                    </Link>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                                        <span className="flex items-center gap-1">
                                            <Heart className="h-4 w-4" />
                                            {learn.likeCount || 0}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Eye className="h-4 w-4" />
                                            {learn.viewCount || 0}
                                        </span>
                                        {learn.estimatedTime && (
                                            <span className="flex items-center gap-1">
                                                <Clock className="h-4 w-4" />
                                                {learn.estimatedTime}m
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button asChild className="flex-1" size="sm">
                                            <Link href={`/learn/topic/${learn.slug}`}>
                                                Start Learning
                                                <ChevronRight className="ml-2 h-4 w-4" />
                                            </Link>
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => handleRemoveBookmark(learn.id)}
                                            disabled={isRemoving}
                                            className="shrink-0 h-8 w-8"
                                        >
                                            <BookmarkX className={`h-4 w-4 ${isRemoving ? "animate-pulse" : ""}`} />
                                        </Button>
                                    </div>
                                </CardContent>
                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Badge variant="secondary" className="text-xs">
                                        Saved {new Date(bookmark.createdAt).toLocaleDateString()}
                                    </Badge>
                                </div>
                            </Card>
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
    );
}
