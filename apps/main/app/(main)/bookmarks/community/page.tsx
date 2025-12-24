"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
    MessageSquare, ChevronRight, Loader2, Clock, Heart, MessageCircle
} from "lucide-react";
import { Button } from "@repo/ui/components/ui/button";
import { 
    Avatar, AvatarFallback, AvatarImage 
} from "@repo/ui/components/ui/avatar";
import { getCommunityBookmarks } from "@/actions/(main)/bookmarks/bookmarks.action";
import { formatDistanceToNow } from "date-fns";

export default function CommunityBookmarksPage() {
    const [posts, setPosts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            setIsLoading(true);
            try {
                const result = await getCommunityBookmarks();
                if (result.success && result.data) {
                    setPosts(result.data);
                }
            } catch (error) {
                console.error("Error loading community bookmarks:", error);
            } finally {
                setIsLoading(false);
            }
        }
        loadData();
    }, []);

    return (
        <div className="min-h-screen">
            {/* Header */}
            <section className="border-b border-neutral-200 dark:border-neutral-800 bg-gradient-to-b from-green-50 to-white dark:from-green-950/20 dark:to-neutral-950">
                <div className="max-w-6xl mx-auto px-4 py-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="flex items-center gap-4 mb-4">
                            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                                <MessageSquare className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
                                    Saved Posts
                                </h1>
                                <p className="text-neutral-600 dark:text-neutral-400">
                                    {posts.length} community posts bookmarked
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Content */}
            <div className="max-w-6xl mx-auto px-4 py-8 pb-24 lg:pb-8">
                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
                    </div>
                ) : posts.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-20"
                    >
                        <MessageSquare className="h-16 w-16 mx-auto text-neutral-300 dark:text-neutral-700 mb-4" />
                        <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
                            No post bookmarks
                        </h3>
                        <p className="text-neutral-500 mb-6">
                            Save community posts to read them later
                        </p>
                        <Button asChild>
                            <Link href="/communities/discover">
                                Explore Communities
                                <ChevronRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </motion.div>
                ) : (
                    <div className="space-y-4">
                        <AnimatePresence>
                            {posts.map((post, index) => (
                                <motion.div
                                    key={post.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <Link href={`/communities/${post.community.slug}/post/${post.id}`}>
                                        <div className="group rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all duration-300 hover:shadow-lg">
                                            <div className="flex items-start gap-4">
                                                {/* Community Icon */}
                                                <Avatar className="h-12 w-12 shrink-0">
                                                    <AvatarImage src={post.community.icon} />
                                                    <AvatarFallback className="bg-gradient-to-br from-green-500 to-emerald-500 text-white font-bold">
                                                        {post.community.name.charAt(0)}
                                                    </AvatarFallback>
                                                </Avatar>

                                                <div className="flex-1 min-w-0">
                                                    {/* Header */}
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="text-sm font-medium text-neutral-900 dark:text-white">
                                                            {post.community.name}
                                                        </span>
                                                        <span className="text-neutral-300">•</span>
                                                        <span className="text-sm text-neutral-500">
                                                            by {post.author.name || post.author.username}
                                                        </span>
                                                    </div>

                                                    {/* Title */}
                                                    {post.title && (
                                                        <h3 className="font-semibold text-neutral-900 dark:text-white mb-2 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors line-clamp-2">
                                                            {post.title}
                                                        </h3>
                                                    )}

                                                    {/* Content Preview */}
                                                    {post.content && (
                                                        <p className="text-sm text-neutral-500 line-clamp-2 mb-3">
                                                            {post.content}
                                                        </p>
                                                    )}

                                                    {/* Footer */}
                                                    <div className="flex items-center gap-4 text-xs text-neutral-500">
                                                        <span className="flex items-center gap-1">
                                                            <Heart className="h-3.5 w-3.5" />
                                                            {post.likeCount} likes
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <MessageCircle className="h-3.5 w-3.5" />
                                                            {post.commentCount} comments
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="h-3.5 w-3.5" />
                                                            Saved {formatDistanceToNow(new Date(post.savedAt), { addSuffix: true })}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
}
