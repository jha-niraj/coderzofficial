"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
    ChevronLeft, ChevronRight, Heart, Bookmark, Share2, MessageSquare,
    ArrowLeft, CheckCircle2, Sparkles, Eye, Shield, XCircle, AlertCircle, Coins
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
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from "@repo/ui/components/ui/dialog";
import { Textarea } from "@repo/ui/components/ui/textarea";
import { Alert, AlertDescription } from "@repo/ui/components/ui/alert";
// ...existing imports
import toast from "@repo/ui/components/ui/sonner";
import {
    ConceptCategory, ConceptDifficulty, ConceptStepType
} from "@repo/prisma/client";
import {
    toggleConceptLike, toggleConceptBookmark, updateConceptProgress,
    verifyConcept, rejectConcept
} from "@/actions/(main)/concepts/concept.action";
import StepCard from "./step-card";
import AIAssistantPanel from "./ai-assistant-panel";
import { ShareDialog } from "@/components/common/share-dialog";

interface ConceptStep {
    id: string;
    order: number;
    title: string;
    type: ConceptStepType;
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

interface Concept {
    id: string;
    slug: string;
    title: string;
    description: string;
    category: ConceptCategory;
    difficulty: ConceptDifficulty;
    status: string;
    pricingType: string;
    price: number;
    verifiedAt: Date | null;
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
    previousConcepts?: { id: string; title: string; slug: string; iconEmoji: string | null }[];
    nextConcepts?: { id: string; title: string; slug: string; iconEmoji: string | null }[];
    isAdmin: boolean;
    isCreator: boolean;
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
    previousConcepts: _previousConcepts,
    nextConcepts: _nextConcepts,
    isAdmin,
    isCreator: _isCreator,
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
    const [showAIAssistant, setShowAIAssistant] = useState(true); // Always show by default
    const [shareOpen, setShareOpen] = useState(false);
    
    // Admin verification states
    const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
    const [rejectReason, setRejectReason] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);
    const [isRejecting, setIsRejecting] = useState(false);

    const isPendingVerification = concept.status === "PENDING_VERIFICATION";
    const showAdminActions = isAdmin && isPendingVerification;
    
    const shareUrl = typeof window !== "undefined" 
        ? `${window.location.origin}/concepts/${concept.slug}` 
        : `/concepts/${concept.slug}`;

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
        setShareOpen(true);
    };

    const handleVerifyConcept = async () => {
        setIsVerifying(true);
        try {
            const result = await verifyConcept(concept.id);
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success("Concept verified and published!");
                setVerifyDialogOpen(false);
                router.refresh();
            }
        } catch {
            toast.error("Failed to verify concept");
        } finally {
            setIsVerifying(false);
        }
    };

    const handleRejectConcept = async () => {
        if (!rejectReason.trim()) {
            toast.error("Please provide a reason for rejection");
            return;
        }
        setIsRejecting(true);
        try {
            const result = await rejectConcept(concept.id, rejectReason);
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success("Concept rejected");
                setRejectDialogOpen(false);
                router.refresh();
            }
        } catch {
            toast.error("Failed to reject concept");
        } finally {
            setIsRejecting(false);
        }
    };

    return (
        <div className="relative">
            {/* Admin Verification Banner */}
            {showAdminActions && (
                <div className="bg-yellow-50 dark:bg-yellow-950/30 border-b border-yellow-200 dark:border-yellow-800">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                        <div className="flex items-center justify-between flex-wrap gap-3">
                            <div className="flex items-center gap-3">
                                <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                                <span className="text-sm text-yellow-800 dark:text-yellow-200">
                                    This concept is pending verification. Review and approve or reject.
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setRejectDialogOpen(true)}
                                    className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-950/30"
                                >
                                    <XCircle className="w-4 h-4 mr-1" />
                                    Reject
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={() => setVerifyDialogOpen(true)}
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                    <Shield className="w-4 h-4 mr-1" />
                                    Verify & Publish
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Pricing Badge for Paid Concepts */}
            {concept.pricingType === "PAID" && (
                <div className="bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-800">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
                        <div className="flex items-center justify-center gap-2 text-sm text-amber-700 dark:text-amber-300">
                            <Coins className="w-4 h-4" />
                            <span>Premium Concept • {concept.price} credits</span>
                        </div>
                    </div>
                </div>
            )}

            <div className="sticky top-0 z-40 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-lg border-b border-neutral-200 dark:border-neutral-800">
                <div className="max-w-full mx-auto px-4 sm:px-6">
                    <div className="flex items-center justify-between h-14">
                        {/* Left: Back button and title */}
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
                                <span className="text-xl">{concept.iconEmoji || "📚"}</span>
                                <h1 className="font-semibold text-neutral-900 dark:text-white truncate text-sm">
                                    {concept.title}
                                </h1>
                                <Badge className={difficultyConfig[concept.difficulty].color}>
                                    {difficultyConfig[concept.difficulty].label}
                                </Badge>
                            </div>
                        </div>
                        
                        {/* Center: Step Navigation */}
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
                            {currentStepIndex < totalSteps - 1 ? (
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
                                        toast.success("🎉 Concept completed!");
                                    }}
                                    className="h-8 bg-green-600 hover:bg-green-700"
                                >
                                    <CheckCircle2 className="w-4 h-4 mr-1" />
                                    Complete
                                </Button>
                            )}
                        </div>

                        {/* Right: Actions */}
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
                                            variant={showAIAssistant ? "secondary" : "ghost"}
                                            size="icon"
                                            onClick={() => setShowAIAssistant(!showAIAssistant)}
                                            className="h-8 w-8"
                                        >
                                            <Sparkles className="w-4 h-4" />
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

            {/* Verify Concept Dialog */}
            <Dialog open={verifyDialogOpen} onOpenChange={setVerifyDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Shield className="w-5 h-5 text-green-500" />
                            Verify Concept
                        </DialogTitle>
                        <DialogDescription>
                            Are you sure you want to verify and publish this concept?
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Alert className="bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800">
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                            <AlertDescription className="text-sm text-green-700 dark:text-green-300">
                                Once verified, this concept will be visible to all users
                                {concept.pricingType === "PAID" && " and available for purchase"}.
                            </AlertDescription>
                        </Alert>
                    </div>
                    <DialogFooter className="gap-3 sm:gap-0">
                        <Button variant="outline" onClick={() => setVerifyDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button 
                            onClick={handleVerifyConcept}
                            disabled={isVerifying}
                            className="bg-green-600 hover:bg-green-700 text-white"
                        >
                            {isVerifying ? (
                                <>
                                    <span className="animate-spin mr-2">⏳</span>
                                    Verifying...
                                </>
                            ) : (
                                <>
                                    <Shield className="w-4 h-4 mr-2" />
                                    Verify & Publish
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Reject Concept Dialog */}
            <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <XCircle className="w-5 h-5 text-red-500" />
                            Reject Concept
                        </DialogTitle>
                        <DialogDescription>
                            Provide a reason for rejecting this concept. The creator will be notified.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Textarea
                            placeholder="Enter the reason for rejection..."
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            rows={4}
                            className="resize-none"
                        />
                    </div>
                    <DialogFooter className="gap-3 sm:gap-0">
                        <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button 
                            onClick={handleRejectConcept}
                            disabled={isRejecting || !rejectReason.trim()}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            {isRejecting ? (
                                <>
                                    <span className="animate-spin mr-2">⏳</span>
                                    Rejecting...
                                </>
                            ) : (
                                <>
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Reject Concept
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Share Dialog */}
            <ShareDialog
                open={shareOpen}
                onOpenChange={setShareOpen}
                url={shareUrl}
                title={concept.title}
                description={concept.description || undefined}
                type="concept"
                entityId={concept.id}
            />
        </div>
    );
}