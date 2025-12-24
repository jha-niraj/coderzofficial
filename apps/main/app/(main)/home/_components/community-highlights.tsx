"use client";

import { motion } from "framer-motion";
import {
    Card, CardContent, CardHeader, CardTitle
} from "@repo/ui/components/ui/card";
import { Button } from "@repo/ui/components/ui/button";
import {
    Avatar, AvatarFallback, AvatarImage
} from "@repo/ui/components/ui/avatar";
import {
    Users, Heart, MessageCircle, ArrowRight, Sparkles
} from "lucide-react";
import Link from "next/link";

interface CommunityPost {
    id: string;
    content: string;
    createdAt: Date;
    author: {
        id: string;
        name: string | null;
        image: string | null;
        username: string | null;
    };
    _count: {
        likes: number;
        comments: number;
    };
}

interface CommunityHighlightsProps {
    posts: CommunityPost[];
}

export default function CommunityHighlights({ posts }: CommunityHighlightsProps) {
    const formatTimeAgo = (date: Date) => {
        const now = new Date();
        const diff = now.getTime() - new Date(date).getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days}d ago`;
        if (hours > 0) return `${hours}h ago`;
        return "Just now";
    };

    return (
        <Card className="border-primary/10">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-pink-500/10">
                            <Users className="h-4 w-4 text-pink-500" />
                        </div>
                        <CardTitle className="text-lg">Community Highlights</CardTitle>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/community">
                            View all <ArrowRight className="ml-1 h-3 w-3" />
                        </Link>
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {
                    posts.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center py-8 space-y-3"
                        >
                            <div className="mx-auto w-12 h-12 rounded-full bg-pink-500/10 flex items-center justify-center">
                                <Sparkles className="h-6 w-6 text-pink-500" />
                            </div>
                            <div>
                                <p className="font-medium">No community posts yet</p>
                                <p className="text-sm text-muted-foreground">
                                    Be the first to share something!
                                </p>
                            </div>
                            <Button asChild>
                                <Link href="/community">
                                    Go to Community
                                </Link>
                            </Button>
                        </motion.div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {
                                posts.map((post, index) => (
                                    <motion.div
                                        key={post.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                    >
                                        <Link href={`/community/post/${post.id}`}>
                                            <div className="p-4 rounded-xl border bg-muted/30 hover:bg-muted/50 transition-all cursor-pointer h-full">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <Avatar className="h-8 w-8">
                                                        <AvatarImage
                                                            src={post.author.image || ""}
                                                            alt={post.author.name || "User"}
                                                        />
                                                        <AvatarFallback className="text-xs">
                                                            {post.author.name?.charAt(0) || "U"}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium truncate">
                                                            {post.author.name}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            @{post.author.username}
                                                        </p>
                                                    </div>
                                                </div>
                                                <p className="text-sm line-clamp-3 mb-3">
                                                    {post.content}
                                                </p>
                                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                                    <div className="flex items-center gap-3">
                                                        <span className="flex items-center gap-1">
                                                            <Heart className="h-3 w-3" />
                                                            {post._count.likes}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <MessageCircle className="h-3 w-3" />
                                                            {post._count.comments}
                                                        </span>
                                                    </div>
                                                    <span>{formatTimeAgo(post.createdAt)}</span>
                                                </div>
                                            </div>
                                        </Link>
                                    </motion.div>
                                ))
                            }
                        </div>
                    )
                }
            </CardContent>
        </Card>
    );
}