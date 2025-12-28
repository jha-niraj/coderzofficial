"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
    ChevronLeft, ChevronRight, Heart, Bookmark, Share2, MessageSquare,
    ArrowLeft, CheckCircle2, Sparkles, Eye
} from "lucide-react";
import { Button } from "@repo/ui/components/ui/button";
import { Badge } from "@repo/ui/components/ui/badge";
import { Progress } from "@repo/ui/components/ui/progress";
import { Card, CardContent } from "@repo/ui/components/ui/card";
import {
    Avatar, AvatarFallback, AvatarImage
} from "@repo/ui/components/ui/avatar";
import {
    Tooltip, TooltipContent, TooltipProvider, TooltipTrigger
} from "@repo/ui/components/ui/tooltip";
import toast from "@repo/ui/components/ui/sonner";
import {
    ConceptCategory, ConceptDifficulty, ConceptStepType
} from "@repo/prisma/client";
import {
    toggleConceptLike, toggleConceptBookmark, updateConceptProgress
} from "@/actions/(main)/concepts/concept.action";
import StepCard from "./step-card";
import AIAssistantPanel from "./ai-assistant-panel";

interface ConceptStep {
    id: string;
    order: number;
    title: string;
    type: ConceptStepType;
    content: string;
    language?: string | null;
    visualizationType?: string | null;
    visualizationData?: unknown;
    comparisonItems?: unknown;
    quizQuestion?: string | null;
    quizOptions?: unknown;
    quizExplanation?: string | null;
    challengeDescription?: string | null;
    challengeStarterCode?: string | null;
    challengeSolution?: string | null;
    challengeHints?: unknown;
    challengeTestCases?: unknown;
    tips?: unknown;
    codeBlocks: {
        id: string;
        order: number;
        title?: string | null;
        language: string;
        code: string;
        explanation?: string | null;
        highlightLines: number[];
        showLineNumbers: boolean;
        isRunnable: boolean;
    }[];
}

interface Concept {
    id: string;
    slug: string;
    title: string;
    description: string;
    shortDescription?: string | null;
    category: ConceptCategory;
    difficulty: ConceptDifficulty;
    iconEmoji?: string | null;
    accentColor?: string | null;
    estimatedTime?: number | null;
    tags: string[];
    prerequisites: string[];
    creator: {
        id: string;
        name?: string | null;
        username?: string | null;
        image?: string | null;
    };
    steps: ConceptStep[];
    _count: {
        likes: number;
        bookmarks: number;
        comments: number;
        views: number;
    };
}

interface ConceptProgress {
    id: string;
    currentStep: number;
    completedSteps: number[];
    progressPercent: number;
    isCompleted: boolean;
}

interface ConceptDetailClientProps {
    concept: Concept;
    isLiked: boolean;
    isBookmarked: boolean;
    progress: ConceptProgress | null;
    isLoggedIn: boolean;
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

export default function ConceptDetailClient({
    concept,
    isLiked: initialIsLiked,
    isBookmarked: initialIsBookmarked,
    progress: initialProgress,
    isLoggedIn,
}: ConceptDetailClientProps) {
    const router = useRouter();
    const [currentStepIndex, setCurrentStepIndex] = useState(
        initialProgress?.currentStep || 0
    );
    const [completedSteps, setCompletedSteps] = useState<number[]>(
        initialProgress?.completedSteps || []
    );
    const [isLiked, setIsLiked] = useState(initialIsLiked);
    const [isBookmarked, setIsBookmarked] = useState(initialIsBookmarked);
    const [likeCount, setLikeCount] = useState(concept._count.likes);
    const [showAIAssistant, setShowAIAssistant] = useState(false);

    const totalSteps = concept.steps.length;
    const currentStep = concept.steps[currentStepIndex];
    const progressPercent = totalSteps > 0 ? (completedSteps.length / totalSteps) * 100 : 0;
    // const isCompleted = completedSteps.length >= totalSteps;

    const goToStep = useCallback((stepIndex: number) => {
        setCurrentStepIndex(stepIndex);
        if (isLoggedIn) {
            updateConceptProgress(concept.id, stepIndex).catch(() => { });
        }
    }, [concept.id, isLoggedIn]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "ArrowLeft" && currentStepIndex > 0) {
                goToStep(currentStepIndex - 1);
            } else if (e.key === "ArrowRight" && currentStepIndex < totalSteps - 1) {
                goToStep(currentStepIndex + 1);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [currentStepIndex, totalSteps, goToStep]);

    const markStepComplete = useCallback((stepOrder: number) => {
        if (!completedSteps.includes(stepOrder)) {
            const newCompleted = [...completedSteps, stepOrder];
            setCompletedSteps(newCompleted);
            if (isLoggedIn) {
                updateConceptProgress(concept.id, currentStepIndex, stepOrder).catch(() => { });
            }
        }
    }, [completedSteps, concept.id, currentStepIndex, isLoggedIn]);

    const handleLike = async () => {
        if (!isLoggedIn) {
            toast.error("Please login to like concepts");
            return;
        }
        const result = await toggleConceptLike(concept.id);
        if (!result.error) {
            setIsLiked(result.liked || false);
            setLikeCount((prev) => (result.liked ? prev + 1 : prev - 1));
        }
    };

    const handleBookmark = async () => {
        if (!isLoggedIn) {
            toast.error("Please login to bookmark concepts");
            return;
        }
        const result = await toggleConceptBookmark(concept.id);
        if (!result.error) {
            setIsBookmarked(result.bookmarked || false);
            toast.success(result.bookmarked ? "Bookmarked!" : "Bookmark removed");
        }
    };

    const handleShare = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            toast.success("Link copied to clipboard!");
        } catch {
            toast.error("Failed to copy link");
        }
    };

    return (
        <div className="relative">
            <div className="sticky top-0 z-40 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-lg border-b border-neutral-200 dark:border-neutral-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-4 min-w-0">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.back()}
                                className="flex-shrink-0 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                            >
                                <ArrowLeft className="w-4 h-4 mr-1" />
                                Back
                            </Button>
                            <div className="hidden sm:flex items-center gap-2 min-w-0">
                                <span className="text-2xl">{concept.iconEmoji || "📚"}</span>
                                <h1 className="font-semibold text-neutral-900 dark:text-white truncate">
                                    {concept.title}
                                </h1>
                            </div>
                        </div>
                        <div className="hidden md:flex items-center gap-4 flex-1 max-w-md mx-4">
                            <div className="flex-1">
                                <Progress value={progressPercent} className="h-2" />
                            </div>
                            <span className="text-sm text-muted-foreground whitespace-nowrap">
                                {completedSteps.length}/{totalSteps} complete
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={handleLike}
                                            className={isLiked ? "text-red-500" : ""}
                                        >
                                            <Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        {isLiked ? "Unlike" : "Like"} ({likeCount})
                                    </TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={handleBookmark}
                                            className={isBookmarked ? "text-blue-500" : ""}
                                        >
                                            <Bookmark className={`w-5 h-5 ${isBookmarked ? "fill-current" : ""}`} />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        {isBookmarked ? "Remove bookmark" : "Bookmark"}
                                    </TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="ghost" size="icon" onClick={handleShare}>
                                            <Share2 className="w-5 h-5" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Share</TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant={showAIAssistant ? "secondary" : "ghost"}
                                            size="icon"
                                            onClick={() => setShowAIAssistant(!showAIAssistant)}
                                        >
                                            <Sparkles className="w-5 h-5" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>AI Assistant</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex">
                <aside className="hidden lg:block w-72 flex-shrink-0 border-r border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30 overflow-y-auto h-[calc(100vh-4rem)] sticky top-16">
                    <div className="p-4">
                        <h3 className="font-semibold text-sm text-neutral-500 dark:text-neutral-400 mb-4 tracking-wide">
                            STEPS
                        </h3>
                        <div className="space-y-1">
                            {
                                concept.steps.map((step, index) => (
                                    <button
                                        key={step.id}
                                        onClick={() => goToStep(index)}
                                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${currentStepIndex === index
                                            ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                                            : "hover:bg-neutral-100 dark:hover:bg-neutral-800"
                                            }`}
                                    >
                                        <div
                                            className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${completedSteps.includes(step.order)
                                                ? "bg-green-500 text-white"
                                                : currentStepIndex === index
                                                    ? "bg-blue-500 text-white"
                                                    : "bg-neutral-200 dark:bg-neutral-700 text-muted-foreground"
                                                }`}
                                        >
                                            {
                                                completedSteps.includes(step.order) ? (
                                                    <CheckCircle2 className="w-4 h-4" />
                                                ) : (
                                                    index + 1
                                                )
                                            }
                                        </div>
                                        <span className="text-sm truncate">{step.title}</span>
                                    </button>
                                ))
                            }
                        </div>
                    </div>
                </aside>
                <main className="flex-1 min-w-0">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <div className="md:hidden mb-4">
                            <div className="flex items-center justify-between text-sm text-neutral-500 dark:text-neutral-400 mb-2">
                                <span>Step {currentStepIndex + 1} of {totalSteps}</span>
                                <span>{Math.round(progressPercent)}%</span>
                            </div>
                            <Progress value={progressPercent} className="h-2" />
                        </div>
                        <AnimatePresence mode="wait">
                            {
                                currentStep && (
                                    <motion.div
                                        key={currentStep.id}
                                        initial={{ opacity: 0, x: 50 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -50 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <StepCard
                                            step={currentStep}
                                            stepNumber={currentStepIndex + 1}
                                            totalSteps={totalSteps}
                                            isCompleted={completedSteps.includes(currentStep.order)}
                                            onComplete={() => markStepComplete(currentStep.order)}
                                            conceptId={concept.id}
                                            isLoggedIn={isLoggedIn}
                                        />
                                    </motion.div>
                                )
                            }
                        </AnimatePresence>
                        <div className="flex items-center justify-between mt-6">
                            <Button
                                variant="outline"
                                onClick={() => goToStep(currentStepIndex - 1)}
                                disabled={currentStepIndex === 0}
                            >
                                <ChevronLeft className="w-4 h-4 mr-1" />
                                Previous
                            </Button>
                            <div className="hidden sm:flex items-center gap-1">
                                {
                                    concept.steps.map((step, index) => (
                                        <button
                                            key={step.id}
                                            onClick={() => goToStep(index)}
                                            className={`w-2.5 h-2.5 rounded-full transition-all ${currentStepIndex === index
                                                ? "w-6 bg-blue-500"
                                                : completedSteps.includes(step.order)
                                                    ? "bg-green-500"
                                                    : "bg-neutral-300 dark:bg-neutral-600"
                                                }`}
                                        />
                                    ))
                                }
                            </div>
                            {
                                currentStepIndex < totalSteps - 1 ? (
                                    <Button onClick={() => goToStep(currentStepIndex + 1)}>
                                        Next
                                        <ChevronRight className="w-4 h-4 ml-1" />
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={() => {
                                            if (currentStep) {
                                                markStepComplete(currentStep.order);
                                            }
                                            toast.success("🎉 Congratulations! You completed this concept!");
                                        }}
                                        className="bg-green-600 hover:bg-green-700"
                                    >
                                        <CheckCircle2 className="w-4 h-4 mr-1" />
                                        Complete
                                    </Button>
                                )
                            }
                        </div>
                        <Card className="mt-8 border-neutral-200 dark:border-neutral-800 shadow-sm">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
                                            About this concept
                                        </h2>
                                        <p className="text-neutral-600 dark:text-neutral-400">
                                            {concept.description}
                                        </p>
                                        {
                                            concept.tags.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mt-4">
                                                    {
                                                        concept.tags.map((tag) => (
                                                            <Badge key={tag} variant="secondary">
                                                                {tag}
                                                            </Badge>
                                                        ))
                                                    }
                                                </div>
                                            )
                                        }
                                    </div>
                                    <div className="flex items-center gap-3 flex-shrink-0">
                                        <Avatar>
                                            <AvatarImage src={concept.creator.image || ""} />
                                            <AvatarFallback>
                                                {concept.creator.name?.charAt(0) || "A"}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="text-sm font-medium">
                                                {concept.creator.name || "Admin"}
                                            </p>
                                            <p className="text-xs text-muted-foreground">Creator</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6 mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-800">
                                    <div className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
                                        <Eye className="w-4 h-4" />
                                        <span>{concept._count.views} views</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
                                        <Heart className="w-4 h-4" />
                                        <span>{likeCount} likes</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
                                        <MessageSquare className="w-4 h-4" />
                                        <span>{concept._count.comments} comments</span>
                                    </div>
                                    <Badge className={difficultyConfig[concept.difficulty].color}>
                                        {difficultyConfig[concept.difficulty].label}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </main>
                <AnimatePresence>
                    {
                        showAIAssistant && currentStep && (
                            <motion.aside
                                initial={{ width: 0, opacity: 0 }}
                                animate={{ width: 384, opacity: 1 }}
                                exit={{ width: 0, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="hidden lg:block flex-shrink-0 border-l border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30 overflow-hidden h-[calc(100vh-4rem)] sticky top-16"
                            >
                                <AIAssistantPanel
                                    conceptTitle={concept.title}
                                    currentStep={currentStep}
                                    onClose={() => setShowAIAssistant(false)}
                                />
                            </motion.aside>
                        )
                    }
                </AnimatePresence>
            </div>
        </div>
    );
}