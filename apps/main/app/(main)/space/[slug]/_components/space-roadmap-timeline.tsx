"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    CheckCircle2, Lock, Clock, Play, BookOpen, Rocket, FileText,
    Brain, Layers, Video, Link as LinkIcon, MessageSquare, Heart,
    ExternalLink, AlertCircle, RotateCcw, Loader2
} from 'lucide-react';
import { Button } from '@repo/ui/components/ui/button';
import { Badge } from '@repo/ui/components/ui/badge';
import {
    Avatar, AvatarFallback, AvatarImage
} from '@repo/ui/components/ui/avatar';
import { cn } from '@repo/ui/lib/utils';
import { useSpaceStore } from '@/app/store/spaceStore';
import {
    toggleStepLike
} from '@/actions/(main)/space/social.action';
import toast from '@repo/ui/components/ui/sonner';

interface TimelineStep {
    id: string;
    order: number;
    title: string;
    description?: string | null;
    contentType: string;
    contentId?: string | null;
    contentData?: Record<string, unknown>;
    isRequired: boolean;
    estimatedTime?: number | null;
    status: string;
    completionCount: number;
    averageTimeSpent?: number | null;
    // Optimistic fields
    isOptimistic?: boolean;
    isLoading?: boolean;
    error?: string | null;
}

interface SpaceRoadmapTimelineProps {
    steps: TimelineStep[];
    spaceId: string;
    spaceSlug: string;
    userProgress?: {
        currentStepId?: string;
        completedSteps: string[];
    };
    activeMembers?: {
        id: string;
        name?: string | null;
        image?: string | null;
        currentStepId?: string | null;
    }[];
    onStepClick?: (step: TimelineStep) => void;
    onCommentClick?: (stepId: string) => void;
}

const contentTypeIcons: Record<string, typeof Rocket> = {
    PROJECT: Rocket,
    STUDIO: FileText,
    QUIZ: Brain,
    FLASHCARD: Layers,
    VIDEO: Video,
    LINK: LinkIcon,
    learn: BookOpen,
};

const contentTypeColors: Record<string, string> = {
    PROJECT: 'from-blue-500 to-cyan-500',
    STUDIO: 'from-purple-500 to-pink-500',
    QUIZ: 'from-emerald-500 to-teal-500',
    FLASHCARD: 'from-amber-500 to-orange-500',
    VIDEO: 'from-red-500 to-rose-500',
    LINK: 'from-slate-500 to-gray-500',
    learn: 'from-rose-500 to-red-500',
};

export default function SpaceRoadmapTimeline({
    steps,
    spaceId,
    userProgress,
    activeMembers = [],
    onStepClick,
    onCommentClick
}: SpaceRoadmapTimelineProps) {
    const router = useRouter();
    const { openSidebar, retryStep } = useSpaceStore();
    const [likeStates, setLikeStates] = useState<Record<string, { isLiked: boolean; count: number; loading: boolean }>>({});

    const getStepStatus = (step: TimelineStep) => {
        if (step.isOptimistic && step.isLoading) return 'loading';
        if (step.error) return 'error';
        if (userProgress?.completedSteps.includes(step.id)) return 'completed';
        if (userProgress?.currentStepId === step.id) return 'current';
        const stepIndex = steps.findIndex(s => s.id === step.id);
        const currentIndex = steps.findIndex(s => s.id === userProgress?.currentStepId);
        if (currentIndex >= 0 && stepIndex > currentIndex) return 'locked';
        return 'available';
    };

    const getMembersAtStep = (stepId: string) => {
        return activeMembers.filter(m => m.currentStepId === stepId);
    };

    const handleStepAction = (step: TimelineStep) => {
        const contentType = step.contentType;

        // Open Quiz or Flashcard in sidebar
        if (contentType === 'QUIZ') {
            openSidebar('quiz', {
                title: step.title,
                contentData: step.contentData,
            });
            return;
        }

        if (contentType === 'FLASHCARD') {
            openSidebar('flashcard', {
                title: step.title,
                contentData: step.contentData,
            });
            return;
        }

        // Handle external links
        if (contentType === 'LINK' && step.contentData?.url && typeof step.contentData.url === 'string') {
            window.open(step.contentData.url, '_blank', 'noopener,noreferrer');
            return;
        }

        // Handle video
        if (contentType === 'VIDEO' && step.contentData?.url && typeof step.contentData.url === 'string') {
            window.open(step.contentData.url, '_blank', 'noopener,noreferrer');
            return;
        }

        // Navigate to Project or Studio details
        if (contentType === 'PROJECT' && step.contentId) {
            router.push(`/projects/${step.contentId}`);
            return;
        }

        if (contentType === 'STUDIO' && step.contentId) {
            router.push(`/studio/${step.contentId}`);
            return;
        }

        onStepClick?.(step);
    };

    const handleLike = async (stepId: string) => {
        // Optimistic update
        setLikeStates(prev => ({
            ...prev,
            [stepId]: {
                ...prev[stepId],
                isLiked: !prev[stepId]?.isLiked,
                count: (prev[stepId]?.count || 0) + (prev[stepId]?.isLiked ? -1 : 1),
                loading: true,
            }
        }));

        try {
            const result = await toggleStepLike(spaceId, stepId);
            if (result.success && result.data) {
                setLikeStates(prev => ({
                    ...prev,
                    [stepId]: {
                        isLiked: result.data!.isLiked,
                        count: result.data!.count,
                        loading: false,
                    }
                }));
            } else {
                // Revert on error
                setLikeStates(prev => ({
                    ...prev,
                    [stepId]: {
                        ...prev[stepId],
                        isLiked: !prev[stepId]?.isLiked,
                        count: (prev[stepId]?.count || 0) + (prev[stepId]?.isLiked ? 1 : -1),
                        loading: false,
                    }
                }));
                toast.error(result.error || 'Failed to update like');
            }
        } catch {
            // Revert on error
            setLikeStates(prev => ({
                ...prev,
                [stepId]: {
                    ...prev[stepId],
                    isLiked: !prev[stepId]?.isLiked,
                    count: (prev[stepId]?.count || 0) + (prev[stepId]?.isLiked ? 1 : -1),
                    loading: false,
                }
            }));
            toast.error('Failed to update like');
        }
    };

    const handleRetry = async (stepId: string) => {
        await retryStep(stepId);
    };

    if (steps.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-6">
                    <Rocket className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
                    No Steps Yet
                </h3>
                <p className="text-neutral-500 dark:text-neutral-400 mb-6">
                    Add content to build your learning timeline
                </p>
            </div>
        );
    }

    return (
        <div className="relative py-4">
            <div className="absolute left-[22px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500 rounded-full opacity-30" />

            <div className="relative space-y-4">
                {
                    steps.map((step, index) => {
                        const status = getStepStatus(step);
                        const membersAtStep = getMembersAtStep(step.id);
                        const Icon = contentTypeIcons[step.contentType] || BookOpen;
                        const color = contentTypeColors[step.contentType] || 'from-gray-500 to-slate-500';
                        const likeState = likeStates[step.id] || { isLiked: false, count: 0, loading: false };

                        return (
                            <motion.div
                                key={step.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="relative flex items-start gap-4"
                            >
                                <div className="relative flex flex-col items-center z-10 shrink-0">
                                    <motion.div
                                        whileHover={{ scale: 1.05 }}
                                        className={cn(
                                            "w-10 h-10 rounded-xl flex items-center justify-center shadow-md cursor-pointer transition-all",
                                            status === 'completed' ? "bg-gradient-to-br from-green-400 to-emerald-500" :
                                                status === 'current' ? `bg-gradient-to-br ${color}` :
                                                    status === 'locked' ? "bg-neutral-200 dark:bg-neutral-800" :
                                                        status === 'loading' ? "bg-neutral-100 dark:bg-neutral-800 animate-pulse" :
                                                            status === 'error' ? "bg-red-100 dark:bg-red-900" :
                                                                `bg-gradient-to-br ${color} opacity-70`
                                        )}
                                        onClick={() => handleStepAction(step)}
                                    >
                                        {
                                            status === 'completed' ? (
                                                <CheckCircle2 className="w-5 h-5 text-white" />
                                            ) : status === 'locked' ? (
                                                <Lock className="w-4 h-4 text-neutral-400" />
                                            ) : status === 'current' ? (
                                                <Play className="w-4 h-4 text-white" />
                                            ) : status === 'loading' ? (
                                                <Loader2 className="w-4 h-4 text-neutral-400 animate-spin" />
                                            ) : status === 'error' ? (
                                                <AlertCircle className="w-4 h-4 text-red-500" />
                                            ) : (
                                                <Icon className="w-4 h-4 text-white" />
                                            )
                                        }
                                    </motion.div>
                                    <div className={cn(
                                        "mt-1.5 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold",
                                        status === 'completed' ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-400" :
                                            status === 'current' ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-400" :
                                                "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
                                    )}>
                                        {step.order}
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0 max-w-md">
                                    <motion.div
                                        layout
                                        className={cn(
                                            "relative p-4 rounded-xl border-2 transition-all bg-white dark:bg-neutral-900",
                                            status === 'completed' ? "border-green-200 dark:border-green-800" :
                                                status === 'current' ? "border-blue-300 dark:border-blue-700 shadow-lg shadow-blue-500/10" :
                                                    status === 'locked' ? "border-neutral-200 dark:border-neutral-800 opacity-60" :
                                                        status === 'error' ? "border-red-300 dark:border-red-700" :
                                                            status === 'loading' ? "border-neutral-200 dark:border-neutral-800 animate-pulse" :
                                                                "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700"
                                        )}
                                    >
                                        {
                                            status === 'error' && (
                                                <div className="absolute -top-2 right-4 flex items-center gap-2">
                                                    <Badge variant="destructive" className="text-xs">
                                                        Failed
                                                    </Badge>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleRetry(step.id)}
                                                        className="h-6 px-2"
                                                    >
                                                        <RotateCcw className="w-3 h-3 mr-1" />
                                                        Retry
                                                    </Button>
                                                </div>
                                            )
                                        }

                                        {
                                            status === 'current' && (
                                                <Badge className="absolute -top-2 right-4 bg-blue-500 text-white">
                                                    Current
                                                </Badge>
                                            )
                                        }

                                        {
                                            status === 'loading' && (
                                                <Badge className="absolute -top-2 right-4 bg-neutral-500 text-white">
                                                    Adding...
                                                </Badge>
                                            )
                                        }

                                        <div
                                            className="flex items-start gap-2 mb-2 cursor-pointer"
                                            onClick={() => handleStepAction(step)}
                                        >
                                            <div className={cn(
                                                "p-1.5 rounded-lg bg-gradient-to-br shrink-0",
                                                color
                                            )}>
                                                <Icon className="w-3.5 h-3.5 text-white" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-sm text-neutral-900 dark:text-white line-clamp-1">
                                                    {step.title}
                                                </h3>
                                                <Badge variant="outline" className="text-[10px] mt-0.5 px-1.5 py-0">
                                                    {step.contentType}
                                                </Badge>
                                            </div>
                                            {
                                                (step.contentType === 'LINK' || step.contentType === 'VIDEO') && (
                                                    <ExternalLink className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                                                )
                                            }
                                        </div>

                                        <div className="flex items-center gap-3 text-[10px] text-neutral-500">
                                            <div className="flex items-center gap-0.5">
                                                <CheckCircle2 className="w-3 h-3" />
                                                <span>{step.completionCount}</span>
                                            </div>
                                            {
                                                step.estimatedTime && (
                                                    <div className="flex items-center gap-0.5">
                                                        <Clock className="w-3 h-3" />
                                                        <span>{step.estimatedTime}m</span>
                                                    </div>
                                                )
                                            }
                                        </div>

                                        {
                                            membersAtStep.length > 0 && (
                                                <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                                                    <div className="flex -space-x-1.5">
                                                        {
                                                            membersAtStep.slice(0, 3).map((member) => (
                                                                <Avatar key={member.id} className="w-5 h-5 border border-white dark:border-neutral-900">
                                                                    <AvatarImage src={member.image || undefined} />
                                                                    <AvatarFallback className="text-[8px]">
                                                                        {member.name?.charAt(0) || 'U'}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                            ))
                                                        }
                                                    </div>
                                                    <span className="text-[10px] text-neutral-500">
                                                        {membersAtStep.length} here
                                                    </span>
                                                </div>
                                            )
                                        }

                                        <div className="flex items-center gap-1 mt-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleLike(step.id);
                                                }}
                                                disabled={likeState.loading}
                                                className={cn(
                                                    "h-6 px-2 gap-1 text-[10px]",
                                                    likeState.isLiked && "text-red-500"
                                                )}
                                            >
                                                <Heart className={cn(
                                                    "w-3 h-3",
                                                    likeState.isLiked && "fill-current"
                                                )} />
                                                {likeState.count > 0 && <span>{likeState.count}</span>}
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onCommentClick?.(step.id);
                                                }}
                                                className="h-6 px-2 gap-1 text-[10px]"
                                            >
                                                <MessageSquare className="w-3 h-3" />
                                            </Button>
                                        </div>
                                    </motion.div>
                                </div>
                            </motion.div>
                        );
                    })
                }
            </div>
        </div>
    );
}