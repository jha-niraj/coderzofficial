"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
    ChevronLeft, ChevronRight, Heart, Bookmark, Share2, MessageSquare,
    ArrowLeft, CheckCircle2, PenLine, Eye,
} from "lucide-react";
import { Button } from "@repo/ui/components/ui/button";
import { Badge } from "@repo/ui/components/ui/badge";
import { Progress } from "@repo/ui/components/ui/progress";
import { ScrollArea } from "@repo/ui/components/ui/scroll-area";
import {
    Avatar, AvatarFallback, AvatarImage
} from "@repo/ui/components/ui/avatar";
import {
    Tooltip, TooltipContent, TooltipProvider, TooltipTrigger
} from "@repo/ui/components/ui/tooltip";
import toast from "@repo/ui/components/ui/sonner";
import {
    LearnDifficulty, LearnStepType
} from "@repo/prisma/client";
import {
    toggleLearnLike, toggleLearnBookmark, updateLearnProgress,
} from "@/actions/(main)/learn/learn.action";
import StepCard from "./step-card";
import { StudioPanel } from "./studio-panel";
import { TextSelectionToolbar } from "./text-selection-toolbar";
import { ShareDialog } from "@/components/common/share-dialog";

interface LearnStep {
    id: string;
    order: number;
    title: string;
    type: LearnStepType;
    content: string;
    stepData?: unknown;
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

interface Learn {
    id: string;
    slug: string;
    title: string;
    description: string;
    mainCategory?: { id: string; name: string; slug: string } | null;
    subCategory?: { id: string; name: string; slug: string } | null;
    difficulty: LearnDifficulty;
    status: string;
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
    steps: LearnStep[];
    _count: {
        likes: number;
        bookmarks: number;
        comments: number;
        views: number;
    };
}

interface LearnProgress {
    id: string;
    currentStep: number;
    completedSteps: number[];
    progressPercent: number;
    isCompleted: boolean;
}

interface LearnDetailClientProps {
    learn: Learn;
    isLiked: boolean;
    isBookmarked: boolean;
    progress: LearnProgress | null;
    isLoggedIn: boolean;
    isAdmin: boolean;
    isCreator: boolean;
}

const difficultyConfig: Record<
    LearnDifficulty,
    { label: string; color: string }
> = {
    BEGINNER: { label: "Beginner", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
    INTERMEDIATE: { label: "Intermediate", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" },
    ADVANCED: { label: "Advanced", color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" },
    EXPERT: { label: "Expert", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
};

export default function LearnDetailClient({
    learn,
    isLiked: initialIsLiked,
    isBookmarked: initialIsBookmarked,
    progress: initialProgress,
    isLoggedIn,
    isAdmin: _isAdmin,
    isCreator: _isCreator,
}: LearnDetailClientProps) {
    const router = useRouter();
    const [currentStepIndex, setCurrentStepIndex] = useState(
        initialProgress?.currentStep || 0
    );
    const [completedSteps, setCompletedSteps] = useState<number[]>(
        initialProgress?.completedSteps || []
    );
    const [isLiked, setIsLiked] = useState(initialIsLiked);
    const [isBookmarked, setIsBookmarked] = useState(initialIsBookmarked);
    const [likeCount, setLikeCount] = useState(learn._count.likes);
    const [showStudio, setShowStudio] = useState(true);
    const [studioId, setStudioId] = useState<string | null>(null);
    const [externalMessage, setExternalMessage] = useState<string | null>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const [shareOpen, setShareOpen] = useState(false);

    // Admin verification states removed
    // const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);
    // const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
    // const [rejectReason, setRejectReason] = useState("");
    // const [isVerifying, setIsVerifying] = useState(false);
    // const [isRejecting, setIsRejecting] = useState(false);

    // const isPendingVerification = learn.status === "PENDING_VERIFICATION";
    // const showAdminActions = isAdmin && isPendingVerification;

    const shareUrl = typeof window !== "undefined"
        ? `${window.location.origin}/learn/${learn.subCategory?.slug || 'topic'}/${learn.slug}`
        : `/learn/${learn.subCategory?.slug || 'topic'}/${learn.slug}`;

    const handleCreateStudio = useCallback(() => {
        // Create a local studio ID for now
        const localStudioId = `studio-${learn.id}-local`;
        setStudioId(localStudioId);
        toast.success("Study notes created!");
    }, [learn.id]);

    const handleAskAI = useCallback((text: string, prompt?: string) => {
        setShowStudio(true);
        setExternalMessage(prompt || `Explain this: "${text}"`);
    }, []);

    const handleCopyText = useCallback((text: string) => {
        toast.success("Copied to clipboard!");
    }, []);

    const totalSteps = learn.steps.length;
    const currentStep = learn.steps[currentStepIndex];
    const progressPercent = totalSteps > 0 ? (completedSteps.length / totalSteps) * 100 : 0;
    // const isCompleted = completedSteps.length >= totalSteps;

    const goToStep = useCallback((stepIndex: number) => {
        setCurrentStepIndex(stepIndex);
        if (isLoggedIn) {
            updateLearnProgress(learn.id, stepIndex).catch(() => { });
        }
    }, [learn.id, isLoggedIn]);

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
                updateLearnProgress(learn.id, currentStepIndex, stepOrder).catch(() => { });
            }
        }
    }, [completedSteps, learn.id, currentStepIndex, isLoggedIn]);

    const handleLike = async () => {
        if (!isLoggedIn) {
            toast.error("Please login to like Learns");
            return;
        }
        const result = await toggleLearnLike(learn.id);
        if (!result.error) {
            setIsLiked(result.liked || false);
            setLikeCount((prev) => (result.liked ? prev + 1 : prev - 1));
        }
    };

    const handleBookmark = async () => {
        if (!isLoggedIn) {
            toast.error("Please login to bookmark Learns");
            return;
        }
        const result = await toggleLearnBookmark(learn.id);
        if (!result.error) {
            setIsBookmarked(result.bookmarked || false);
            toast.success(result.bookmarked ? "Bookmarked!" : "Bookmark removed");
        }
    };

    const handleShare = async () => {
        setShareOpen(true);
    };

    // Verification handlers removed

    return (
        <div className="relative">
            <div className="sticky top-0 z-40 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-lg border-b border-neutral-200 dark:border-neutral-800">
                <div className="max-w-full mx-auto px-4 sm:px-6">
                    <div className="flex items-center justify-between h-14">
                        <div className="flex items-center gap-3 min-w-0">
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
                                <span className="text-xl">{learn.iconEmoji || "📚"}</span>
                                <h1 className="font-semibold text-neutral-900 dark:text-white truncate text-sm">
                                    {learn.title}
                                </h1>
                                <Badge className={difficultyConfig[learn.difficulty].color}>
                                    {difficultyConfig[learn.difficulty].label}
                                </Badge>
                            </div>
                        </div>
                        <div className="hidden md:flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => goToStep(currentStepIndex - 1)}
                                disabled={currentStepIndex === 0}
                                className="h-8"
                            >
                                <ChevronLeft className="w-4 h-4" />
                                <span className="hidden lg:inline ml-1">Previous</span>
                            </Button>
                            <div className="flex items-center gap-2 px-3">
                                <span className="text-sm font-medium">
                                    Step {currentStepIndex + 1} / {totalSteps}
                                </span>
                                <Progress value={progressPercent} className="w-24 h-2" />
                            </div>
                            {
                                currentStepIndex < totalSteps - 1 ? (
                                    <Button
                                        size="sm"
                                        onClick={() => goToStep(currentStepIndex + 1)}
                                        className="h-8"
                                    >
                                        <span className="hidden lg:inline mr-1">Next</span>
                                        <ChevronRight className="w-4 h-4" />
                                    </Button>
                                ) : (
                                    <Button
                                        size="sm"
                                        onClick={() => {
                                            if (currentStep) {
                                                markStepComplete(currentStep.order);
                                            }
                                            toast.success("🎉 Learn completed!");
                                        }}
                                        className="h-8 bg-green-600 hover:bg-green-700"
                                    >
                                        <CheckCircle2 className="w-4 h-4 mr-1" />
                                        Complete
                                    </Button>
                                )
                            }
                        </div>
                        <div className="flex items-center gap-1">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={handleLike}
                                            className={`h-8 w-8 ${isLiked ? "text-red-500" : ""}`}
                                        >
                                            <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
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
                                            className={`h-8 w-8 ${isBookmarked ? "text-blue-500" : ""}`}
                                        >
                                            <Bookmark className={`w-4 h-4 ${isBookmarked ? "fill-current" : ""}`} />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        {isBookmarked ? "Remove bookmark" : "Bookmark"}
                                    </TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="ghost" size="icon" onClick={handleShare} className="h-8 w-8">
                                            <Share2 className="w-4 h-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Share</TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant={showStudio ? "secondary" : "ghost"}
                                            size="icon"
                                            onClick={() => setShowStudio(!showStudio)}
                                            className="h-8 w-8"
                                        >
                                            <PenLine className="w-4 h-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Studio</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex">
                <aside className="hidden lg:block w-72 flex-shrink-0 border-r border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30 h-[calc(100vh-4rem)] sticky top-16">
                    <ScrollArea className="h-full">
                        <div className="p-4">
                            <h3 className="font-semibold text-sm text-neutral-500 dark:text-neutral-400 mb-4 tracking-wide">
                                STEPS
                            </h3>
                            <div className="space-y-1">
                                {
                                    learn.steps.map((step, index) => (
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
                            <div className="mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-800">
                                <h3 className="font-semibold text-sm text-neutral-500 dark:text-neutral-400 mb-4 tracking-wide">
                                    ABOUT
                                </h3>
                                <div className="flex items-center gap-3 mb-4">
                                    <Avatar className="w-10 h-10">
                                        <AvatarImage src={learn.creator.image || ""} />
                                        <AvatarFallback>
                                            {learn.creator.name?.charAt(0) || "A"}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="text-sm font-medium text-neutral-900 dark:text-white">
                                            {learn.creator.name || "Admin"}
                                        </p>
                                        <p className="text-xs text-muted-foreground">Creator</p>
                                    </div>
                                </div>
                                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4 line-clamp-4">
                                    {learn.description}
                                </p>
                                {
                                    learn.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5 mb-4">
                                            {
                                                learn.tags.slice(0, 5).map((tag) => (
                                                    <Badge key={tag} variant="secondary" className="text-xs">
                                                        {tag}
                                                    </Badge>
                                                ))
                                            }
                                            {learn.tags.length > 5 && (
                                                <Badge variant="outline" className="text-xs">
                                                    +{learn.tags.length - 5}
                                                </Badge>
                                            )}
                                        </div>
                                    )
                                }
                                <div className="space-y-2 text-xs text-neutral-500 dark:text-neutral-400">
                                    <div className="flex items-center gap-2">
                                        <Eye className="w-3.5 h-3.5" />
                                        <span>{learn._count.views} views</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Heart className="w-3.5 h-3.5" />
                                        <span>{likeCount} likes</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MessageSquare className="w-3.5 h-3.5" />
                                        <span>{learn._count.comments} comments</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </ScrollArea>
                </aside>
                <main className="flex-1 min-w-0 h-[calc(100vh-4rem)]">
                    <ScrollArea className="h-full">
                        <div ref={contentRef} className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                            <TextSelectionToolbar
                                containerRef={contentRef}
                                onAskAI={handleAskAI}
                                onCopy={handleCopyText}
                            />
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
                                                LearnId={learn.id}
                                                isLoggedIn={isLoggedIn}
                                                allSteps={learn.steps}
                                                LearnTitle={learn.title}
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
                                        learn.steps.map((step, index) => (
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
                                                toast.success("🎉 Congratulations! You completed this Learn!");
                                            }}
                                            className="bg-green-600 hover:bg-green-700"
                                        >
                                            <CheckCircle2 className="w-4 h-4 mr-1" />
                                            Complete
                                        </Button>
                                    )
                                }
                            </div>
                        </div>
                    </ScrollArea>
                </main>
                <AnimatePresence>
                    {
                        showStudio && currentStep && (
                            <motion.aside
                                initial={{ width: 0, opacity: 0 }}
                                animate={{ width: 384, opacity: 1 }}
                                exit={{ width: 0, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="hidden lg:block flex-shrink-0 border-l border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30 overflow-hidden h-[calc(100vh-4rem)] sticky top-16"
                            >
                                <StudioPanel
                                    learnTitle={learn.title}
                                    learnDescription={learn.description}
                                    currentStep={{
                                        id: currentStep.id,
                                        title: currentStep.title,
                                        content: currentStep.content,
                                        type: currentStep.type,
                                    }}
                                    studioId={studioId}
                                    onCreateStudio={handleCreateStudio}
                                    onClose={() => setShowStudio(false)}
                                    externalMessage={externalMessage}
                                    onExternalMessageConsumed={() => setExternalMessage(null)}
                                />
                            </motion.aside>
                        )
                    }
                </AnimatePresence>
            </div>


            <ShareDialog
                open={shareOpen}
                onOpenChange={setShareOpen}
                url={shareUrl}
                title={learn.title}
                description={learn.description || undefined}
                type="Learn"
                entityId={learn.id}
            />
        </div>
    );
}