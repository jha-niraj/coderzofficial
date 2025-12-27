"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
    Lightbulb, ChevronRight, Loader2, Clock, CheckCircle2,
    BookOpen, Play
} from "lucide-react";
import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import { Progress } from "@repo/ui/components/ui/progress";
import { getConceptLearnings } from "@/actions/(main)/learnings/learnings.action";
import { cn } from "@repo/ui/lib/utils";

const difficultyColors = {
    BEGINNER: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    INTERMEDIATE: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    ADVANCED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const categoryColors: Record<string, string> = {
    FUNDAMENTALS: "from-blue-500 to-cyan-500",
    WEB_DEV: "from-purple-500 to-pink-500",
    MOBILE_DEV: "from-green-500 to-emerald-500",
    AI_ML: "from-orange-500 to-red-500",
    DEVOPS: "from-yellow-500 to-orange-500",
    SYSTEM_DESIGN: "from-indigo-500 to-purple-500",
    DSA: "from-teal-500 to-cyan-500",
};

export default function ConceptLearningsPage() {
    const [concepts, setConcepts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState("all");

    useEffect(() => {
        async function loadData() {
            setIsLoading(true);
            try {
                const result = await getConceptLearnings();
                if (result.success && result.data) {
                    setConcepts(result.data);
                }
            } catch (error) {
                console.error("Error loading concepts:", error);
            } finally {
                setIsLoading(false);
            }
        }
        loadData();
    }, []);

    const filteredConcepts = concepts.filter(c => {
        if (filter === "all") return true;
        if (filter === "completed") return c.isCompleted;
        if (filter === "in-progress") return !c.isCompleted && c.currentStep > 0;
        return true;
    });

    const completedCount = concepts.filter(c => c.isCompleted).length;
    const inProgressCount = concepts.filter(c => !c.isCompleted && c.currentStep > 0).length;

    return (
        <div className="min-h-screen">
            <section className="border-b border-neutral-200 dark:border-neutral-800 bg-gradient-to-b from-blue-50 to-white dark:from-blue-950/20 dark:to-neutral-950">
                <div className="max-w-6xl mx-auto px-4 py-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="flex items-center gap-4 mb-4">
                            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                                <Lightbulb className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
                                    My Concepts
                                </h1>
                                <p className="text-neutral-600 dark:text-neutral-400">
                                    {completedCount} completed · {inProgressCount} in progress
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>
            <div className="border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 sticky top-16 z-20">
                <div className="max-w-6xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            {
                                ["all", "in-progress", "completed"].map((status) => (
                                    <Button
                                        key={status}
                                        variant={filter === status ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setFilter(status)}
                                        className={cn(
                                            "rounded-full capitalize",
                                            filter === status
                                                ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900"
                                                : "border-neutral-200 dark:border-neutral-700"
                                        )}
                                    >
                                        {status === "in-progress" ? "In Progress" : status}
                                    </Button>
                                ))
                            }
                        </div>
                        <p className="text-sm text-neutral-500">
                            {filteredConcepts.length} concepts
                        </p>
                    </div>
                </div>
            </div>
            <div className="max-w-6xl mx-auto px-4 py-8 pb-24 lg:pb-8">
                {
                    isLoading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
                        </div>
                    ) : filteredConcepts.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-20"
                        >
                            <Lightbulb className="h-16 w-16 mx-auto text-neutral-300 dark:text-neutral-700 mb-4" />
                            <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
                                No concepts yet
                            </h3>
                            <p className="text-neutral-500 mb-6">
                                Start learning concepts to track your progress
                            </p>
                            <Button asChild>
                                <Link href="/concepts">
                                    Explore Concepts
                                    <ChevronRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </motion.div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <AnimatePresence>
                                {
                                    filteredConcepts.map((concept, index) => (
                                        <motion.div
                                            key={concept.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                        >
                                            <Link href={`/concepts/${concept.slug}`}>
                                                <div className="group rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden hover:border-neutral-300 dark:hover:border-neutral-700 transition-all duration-300 hover:shadow-lg">
                                                    <div className={cn(
                                                        "relative h-36 bg-gradient-to-br",
                                                        categoryColors[concept.category] || "from-blue-500/20 to-purple-500/20"
                                                    )}>
                                                        {
                                                            concept.thumbnail && (
                                                                <Image
                                                                    src={concept.thumbnail}
                                                                    alt={concept.title}
                                                                    fill
                                                                    className="object-cover opacity-50"
                                                                />
                                                            )
                                                        }
                                                        <div className="absolute inset-0 flex items-center justify-center">
                                                            <Lightbulb className="h-12 w-12 text-white/80" />
                                                        </div>
                                                        {
                                                            concept.isCompleted && (
                                                                <div className="absolute top-3 right-3">
                                                                    <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center">
                                                                        <CheckCircle2 className="h-5 w-5 text-white" />
                                                                    </div>
                                                                </div>
                                                            )
                                                        }
                                                    </div>
                                                    <div className="p-5">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <Badge
                                                                variant="secondary"
                                                                className={cn(
                                                                    "text-xs rounded-full",
                                                                    difficultyColors[concept.difficulty as keyof typeof difficultyColors]
                                                                )}
                                                            >
                                                                {concept.difficulty}
                                                            </Badge>
                                                            <Badge variant="secondary" className="text-xs rounded-full">
                                                                {concept.category?.replace(/_/g, " ")}
                                                            </Badge>
                                                        </div>

                                                        <h3 className="font-semibold text-neutral-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                                                            {concept.title}
                                                        </h3>
                                                        <div className="space-y-2 mb-3">
                                                            <div className="flex items-center justify-between text-xs">
                                                                <span className="text-neutral-500">
                                                                    Step {concept.currentStep} of {concept.totalSteps}
                                                                </span>
                                                                <span className="font-medium text-neutral-700 dark:text-neutral-300">
                                                                    {concept.progressPercent}%
                                                                </span>
                                                            </div>
                                                            <Progress value={concept.progressPercent} className="h-1.5" />
                                                        </div>
                                                        <div className="flex items-center gap-3 text-xs text-neutral-500">
                                                            <span className="flex items-center gap-1">
                                                                <Clock className="h-3.5 w-3.5" />
                                                                {concept.estimatedTime} min
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <BookOpen className="h-3.5 w-3.5" />
                                                                {concept.totalSteps} steps
                                                            </span>
                                                        </div>
                                                        <div className="mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                                                            <Button size="sm" className="w-full gap-2 rounded-xl" variant="secondary">
                                                                <Play className="h-4 w-4" />
                                                                {concept.isCompleted ? "Review" : "Continue"}
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Link>
                                        </motion.div>
                                    ))
                                }
                            </AnimatePresence>
                        </div>
                    )
                }
            </div>
        </div>
    );
}