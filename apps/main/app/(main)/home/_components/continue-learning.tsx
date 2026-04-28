"use client";

import { motion } from "framer-motion";
import {
    Card, CardContent, CardHeader, CardTitle
} from "@repo/ui/components/ui/card";
import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import {
    FolderKanban, ChevronRight, Clock, ArrowRight
} from "lucide-react";
import Link from "next/link";

interface Project {
    id: string;
    project: {
        id: string;
        title: string;
        slug: string;
        description: string | null;
        difficulty: string;
        generationType: string;
    };
}

interface Studio {
    id: string;
    slug: string | null;
    title: string;
    description: string | null;
    emoji: string | null;
    updatedAt: Date;
    _count: {
        quizzes: number;
        flashcardDecks: number;
    };
}

interface ContinueLearningProps {
    projects: Project[];
    studios: Studio[];
}

export default function ContinueLearning({ projects, studios }: ContinueLearningProps) {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0 },
    };

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty.toLowerCase()) {
            case "easy":
                return "bg-green-500/10 text-green-500";
            case "medium":
                return "bg-yellow-500/10 text-yellow-500";
            case "hard":
                return "bg-red-500/10 text-red-500";
            default:
                return "bg-blue-500/10 text-blue-500";
        }
    };

    const formatTimeAgo = (date: Date) => {
        const now = new Date();
        const diff = now.getTime() - new Date(date).getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days}d ago`;
        if (hours > 0) return `${hours}h ago`;
        return "Just now";
    };

    if (projects.length === 0 && studios.length === 0) {
        return null;
    }

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5"
        >
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Clock className="h-4 w-4 text-primary" />
                    </div>
                    <span className="font-semibold text-sm">Continue Learning</span>
                </div>
                <Button variant="ghost" size="sm" className="h-7 text-xs" asChild>
                    <Link href="/projects">
                        View all <ArrowRight className="ml-1 h-3 w-3" />
                    </Link>
                </Button>
            </div>
            <div className="relative">
                <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent">
                    {
                        projects.map((progress) => (
                            <motion.div
                                key={progress.id}
                                variants={itemVariants}
                                className="flex-shrink-0 w-[260px]"
                            >
                                <Link href={`/projects/${progress.project.slug}`}>
                                    <Card className="h-full hover:shadow-md transition-shadow cursor-pointer border-neutral-200 dark:border-neutral-700 hover:border-primary/30 rounded-xl bg-neutral-50 dark:bg-neutral-800/50">
                                        <CardHeader className="pb-2">
                                            <div className="flex items-start justify-between">
                                                <div className="p-2 rounded-lg bg-primary/10">
                                                    <FolderKanban className="h-4 w-4 text-primary" />
                                                </div>
                                                <Badge
                                                    variant="secondary"
                                                    className={getDifficultyColor(
                                                        progress.project.difficulty
                                                    )}
                                                >
                                                    {progress.project.difficulty}
                                                </Badge>
                                            </div>
                                            <CardTitle className="text-base line-clamp-1">
                                                {progress.project.title}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            <p className="text-sm text-muted-foreground line-clamp-2">
                                                {progress.project.description ||
                                                    "Continue building your project"}
                                            </p>
                                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                                <Badge variant="outline" className="text-xs">
                                                    {progress.project.generationType}
                                                </Badge>
                                                <span className="flex items-center gap-1">
                                                    <ChevronRight className="h-3 w-3" />
                                                    Continue
                                                </span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            </motion.div>
                        ))
                    }
                    {
                        studios.map((studio) => (
                            <motion.div
                                key={studio.id}
                                variants={itemVariants}
                                className="flex-shrink-0 w-[260px]"
                            >
                                <Link href={`/studio/${studio.slug || studio.id}`}>
                                    <Card className="h-full hover:shadow-md transition-shadow cursor-pointer border-neutral-200 dark:border-neutral-700 hover:border-purple-500/30 rounded-xl bg-neutral-50 dark:bg-neutral-800/50">
                                        <CardHeader className="pb-2">
                                            <div className="flex items-start justify-between">
                                                <div className="p-2 rounded-lg bg-purple-500/10 text-lg">
                                                    {studio.emoji || "📚"}
                                                </div>
                                                <span className="text-xs text-muted-foreground">
                                                    {formatTimeAgo(studio.updatedAt)}
                                                </span>
                                            </div>
                                            <CardTitle className="text-base line-clamp-1">
                                                {studio.title}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            <p className="text-sm text-muted-foreground line-clamp-2">
                                                {studio.description || "Continue your studio"}
                                            </p>
                                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                                <div className="flex items-center gap-2">
                                                    <span>{studio._count.quizzes} quizzes</span>
                                                    <span>{studio._count.flashcardDecks} decks</span>
                                                </div>
                                                <span className="flex items-center gap-1">
                                                    <ChevronRight className="h-3 w-3" />
                                                    Continue
                                                </span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            </motion.div>
                        ))
                    }
                </div>
            </div>
        </motion.div>
    );
}