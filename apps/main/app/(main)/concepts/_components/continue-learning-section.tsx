"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
    ArrowRight, Play, CheckCircle2, Clock
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ConceptCategory, ConceptDifficulty } from "@prisma/client";

interface ConceptProgress {
    id: string;
    currentStep: number;
    completedSteps: number[];
    totalSteps: number;
    progressPercent: number;
    isCompleted: boolean;
    lastAccessedAt: Date;
    concept: {
        id: string;
        slug: string;
        title: string;
        thumbnail?: string | null;
        iconEmoji?: string | null;
        category: ConceptCategory;
        difficulty: ConceptDifficulty;
        estimatedTime?: number | null;
    };
}

interface ContinueLearningSectionProps {
    progress: ConceptProgress[];
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

export default function ContinueLearningSection({
    progress,
}: ContinueLearningSectionProps) {
    if (progress.length === 0) {
        return null;
    }

    // Show up to 4 in-progress concepts
    const displayProgress = progress.slice(0, 4);

    return (
        <section>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                        <Play className="w-6 h-6 text-blue-600" />
                        Continue Learning
                    </h2>
                    <p className="text-muted-foreground mt-1">
                        Pick up where you left off
                    </p>
                </div>
                <Link
                    href="/concepts/my-progress"
                    className="flex items-center gap-1 text-sm text-primary hover:underline"
                >
                    View all progress
                    <ArrowRight className="w-4 h-4" />
                </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {
                    displayProgress.map((item, index) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                            <Link href={`/concepts/${item.concept.slug}`}>
                                <Card className="group overflow-hidden hover:shadow-md transition-all duration-300 border-neutral-200 dark:border-neutral-800 hover:border-blue-300 dark:hover:border-blue-700">
                                    <CardContent className="p-4">
                                        <div className="flex items-start gap-4">
                                            <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-3xl">
                                                {item.concept.iconEmoji || "📚"}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Badge variant="outline" className="text-xs">
                                                        {item.concept.category.replace(/_/g, " ")}
                                                    </Badge>
                                                    <Badge className={`text-xs ${difficultyColors[item.concept.difficulty]}`}>
                                                        {item.concept.difficulty}
                                                    </Badge>
                                                </div>
                                                <h3 className="font-semibold text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                                                    {item.concept.title}
                                                </h3>
                                                <div className="mt-3">
                                                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                                                        <span className="flex items-center gap-1">
                                                            <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                                                            {item.completedSteps.length} / {item.totalSteps} steps
                                                        </span>
                                                        <span>{Math.round(item.progressPercent)}%</span>
                                                    </div>
                                                    <Progress value={item.progressPercent} className="h-2" />
                                                </div>
                                                <div className="flex items-center justify-between mt-3">
                                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                        <Clock className="w-3.5 h-3.5" />
                                                        {formatTimeAgo(item.lastAccessedAt)}
                                                    </span>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-7 text-xs group-hover:bg-blue-50 dark:group-hover:bg-blue-950/30 group-hover:text-blue-600"
                                                    >
                                                        Continue
                                                        <ArrowRight className="w-3.5 h-3.5 ml-1" />
                                                    </Button>
                                                </div>
                                            </div>
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