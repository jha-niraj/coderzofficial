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
        name: string;
        description: string | null;
        difficulty: string;
        category: string;
        tier: string;
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
            className="space-y-4"
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    <h2 className="text-lg font-semibold">Continue Learning</h2>
                </div>
                <Button variant="ghost" size="sm" asChild>
                    <Link href="/projects">
                        View all <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                </Button>
            </div>
            <div className="relative">
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent">
                    {
                        projects.map((progress) => (
                            <motion.div
                                key={progress.id}
                                variants={itemVariants}
                                className="flex-shrink-0 w-[300px]"
                            >
                                <Link href={`/projects/${progress.project.id}`}>
                                    <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer border-primary/10 hover:border-primary/30">
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
                                                {progress.project.name}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            <p className="text-sm text-muted-foreground line-clamp-2">
                                                {progress.project.description ||
                                                    "Continue building your project"}
                                            </p>
                                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                                <Badge variant="outline" className="text-xs">
                                                    {progress.project.category}
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
                                className="flex-shrink-0 w-[300px]"
                            >
                                <Link href={`/studio/${studio.slug || studio.id}`}>
                                    <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer border-purple-500/10 hover:border-purple-500/30">
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
                <div className="absolute right-0 top-0 bottom-4 w-20 bg-gradient-to-l from-background to-transparent pointer-events-none" />
            </div>
        </motion.div>
    );
}