"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@repo/ui/components/ui/card";
import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import { Progress } from "@repo/ui/components/ui/progress";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import {
    ChevronRight, CheckCircle2, Clock, BookOpen, Flame, Zap
} from "lucide-react";
import Link from "next/link";
import { LearnDifficulty } from "@repo/prisma/client";
import { getUserProgress } from "@/actions/(main)/learn/learn.action";

interface ProgressItem {
    id: string;
    progressPercent?: number;
    isCompleted?: boolean;
    learn: {
        id: string;
        title: string;
        slug: string;
        iconEmoji?: string | null;
        difficulty?: string;
        estimatedTime?: number | null;
        _count?: { steps?: number };
    };
}

const difficultyStyles: Record<string, { label: string; color: string }> = {
    BEGINNER: { label: "Beginner", color: "text-green-500 bg-green-500/10" },
    INTERMEDIATE: { label: "Intermediate", color: "text-amber-500 bg-amber-500/10" },
    ADVANCED: { label: "Advanced", color: "text-orange-500 bg-orange-500/10" },
    EXPERT: { label: "Expert", color: "text-red-500 bg-red-500/10" },
};

export function MyProgressTab() {
    const [inProgress, setInProgress] = useState<ProgressItem[]>([]);
    const [completed, setCompleted] = useState<ProgressItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadProgress = async () => {
            try {
                const result = await getUserProgress();
                setInProgress(result.inProgress || []);
                setCompleted(result.completed || []);
            } catch (error) {
                console.error("Failed to load progress:", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadProgress();
    }, []);

    if (isLoading) {
        return (
            <div className="space-y-6">
                {/* Stats skeleton */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="h-28 rounded-xl" />
                    ))}
                </div>
                {/* Cards skeleton */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-36 rounded-xl" />
                    ))}
                </div>
            </div>
        );
    }

    const stats = {
        completedCount: completed.length,
        inProgressCount: inProgress.length,
        totalLearns: inProgress.length + completed.length,
    };

    return (
        <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                    { label: "Completed", value: stats.completedCount, icon: CheckCircle2, color: "text-emerald-500", bgColor: "bg-emerald-500/10" },
                    { label: "In Progress", value: stats.inProgressCount, icon: Clock, color: "text-amber-500", bgColor: "bg-amber-500/10" },
                    { label: "Total Started", value: stats.totalLearns, icon: BookOpen, color: "text-blue-500", bgColor: "bg-blue-500/10" },
                ].map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: i * 0.1 }}
                    >
                        <Card className="relative overflow-hidden">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between mb-3">
                                    <div className={`h-10 w-10 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                                        <stat.icon className={`h-5 w-5 ${stat.color}`} />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-3xl font-bold">{stat.value}</p>
                                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* In Progress Section */}
            {inProgress.length > 0 && (
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <Clock className="h-5 w-5 text-amber-500" />
                        <h2 className="text-lg font-semibold">In Progress</h2>
                        <Badge variant="secondary">{inProgress.length}</Badge>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {inProgress.map((item) => (
                            <Link key={item.id} href={`/learn/topic/${item.learn.slug}`}>
                                <Card className="p-4 hover:shadow-md transition-shadow h-full">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-xl">
                                            {item.learn.iconEmoji || "📚"}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-medium text-sm truncate">{item.learn.title}</h4>
                                            <p className="text-xs text-neutral-500">
                                                {item.learn._count?.steps || 0} steps
                                            </p>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs">
                                            <span className="text-neutral-500">Progress</span>
                                            <span className="font-medium">{Math.round(item.progressPercent || 0)}%</span>
                                        </div>
                                        <Progress value={item.progressPercent || 0} className="h-2" />
                                    </div>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Completed Section */}
            {completed.length > 0 && (
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                        <h2 className="text-lg font-semibold">Completed</h2>
                        <Badge variant="secondary">{completed.length}</Badge>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {completed.map((item) => (
                            <Link key={item.id} href={`/learn/topic/${item.learn.slug}`}>
                                <Card className="p-4 hover:shadow-md transition-shadow bg-green-50/50 dark:bg-green-950/10 border-green-200 dark:border-green-900">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-xl">
                                            {item.learn.iconEmoji || "📚"}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-medium text-sm truncate">{item.learn.title}</h4>
                                            <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                                                <CheckCircle2 className="w-3 h-3" />
                                                Completed
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Empty state */}
            {inProgress.length === 0 && completed.length === 0 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-20">
                    <div className="h-20 w-20 mx-auto rounded-full bg-muted/50 flex items-center justify-center mb-6">
                        <BookOpen className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Start Your Learning Journey</h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                        You haven&apos;t started any learns yet. Browse our library and begin learning today!
                    </p>
                </motion.div>
            )}
        </div>
    );
}
