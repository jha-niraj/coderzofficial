"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CheckCircle2, Lock, Clock, Play, BookOpen, Rocket, FileText, 
    Brain, Layers, Video, Link as LinkIcon, MessageSquare, Heart
} from 'lucide-react';
import { Button } from '@repo/ui/components/ui/button';
import { Badge } from '@repo/ui/components/ui/badge';
import { 
    Avatar, AvatarFallback, AvatarImage 
} from '@repo/ui/components/ui/avatar';
import { cn } from '@repo/ui/lib/utils';

interface TimelineStep {
    id: string;
    order: number;
    title: string;
    description?: string | null;
    contentType: string;
    contentId?: string | null;
    isRequired: boolean;
    estimatedTime?: number | null;
    status: string;
    completionCount: number;
    averageTimeSpent?: number | null;
}

interface SpaceRoadmapTimelineProps {
    steps: TimelineStep[];
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
    onLikeClick?: (stepId: string) => void;
}

const contentTypeIcons: Record<string, typeof Rocket> = {
    PROJECT: Rocket,
    STUDIO: FileText,
    QUIZ: Brain,
    FLASHCARD: Layers,
    VIDEO: Video,
    LINK: LinkIcon,
    CONCEPT: BookOpen,
};

const contentTypeColors: Record<string, string> = {
    PROJECT: 'from-blue-500 to-cyan-500',
    STUDIO: 'from-purple-500 to-pink-500',
    QUIZ: 'from-emerald-500 to-teal-500',
    FLASHCARD: 'from-amber-500 to-orange-500',
    VIDEO: 'from-red-500 to-rose-500',
    LINK: 'from-slate-500 to-gray-500',
    CONCEPT: 'from-rose-500 to-red-500',
};

export default function SpaceRoadmapTimeline({
    steps,
    userProgress,
    activeMembers = [],
    onStepClick,
    onCommentClick,
    onLikeClick
}: SpaceRoadmapTimelineProps) {
    const [hoveredStep, setHoveredStep] = useState<string | null>(null);
    const [expandedStep, setExpandedStep] = useState<string | null>(null);

    const getStepStatus = (step: TimelineStep) => {
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
        <div className="relative py-8">
            
            <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500 transform md:-translate-x-1/2 rounded-full opacity-20" />
            
            <div className="relative space-y-0">
                {
                    steps.map((step, index) => {
                        const status = getStepStatus(step);
                        const membersAtStep = getMembersAtStep(step.id);
                        const Icon = contentTypeIcons[step.contentType] || BookOpen;
                        const color = contentTypeColors[step.contentType] || 'from-gray-500 to-slate-500';
                        const isLeft = index % 2 === 0;
                        const isExpanded = expandedStep === step.id;

                        return (
                            <motion.div
                                key={step.id}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className={cn(
                                    "relative flex items-start gap-4 md:gap-8",
                                    "md:grid md:grid-cols-2",
                                    isLeft ? "" : "md:flex-row-reverse"
                                )}
                            >
                                <div className={cn(
                                    "flex-1 hidden md:block",
                                    isLeft ? "text-right pr-8" : "text-left pl-8 md:col-start-2"
                                )}>
                                    {
                                        isLeft && (
                                            <StepCard
                                                step={step}
                                                status={status}
                                                icon={Icon}
                                                color={color}
                                                membersAtStep={membersAtStep}
                                                isExpanded={isExpanded}
                                                onExpand={() => setExpandedStep(isExpanded ? null : step.id)}
                                                onStepClick={onStepClick}
                                                onCommentClick={onCommentClick}
                                                onLikeClick={onLikeClick}
                                                isHovered={hoveredStep === step.id}
                                                onHover={(hovered) => setHoveredStep(hovered ? step.id : null)}
                                                align="right"
                                            />
                                        )
                                    }
                                </div>
                                <div className="relative flex flex-col items-center z-10 shrink-0 md:absolute md:left-1/2 md:-translate-x-1/2">
                                    <motion.div
                                        whileHover={{ scale: 1.1 }}
                                        className={cn(
                                            "w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg cursor-pointer transition-all",
                                            status === 'completed' ? "bg-gradient-to-br from-green-400 to-emerald-500" :
                                                status === 'current' ? `bg-gradient-to-br ${color}` :
                                                    status === 'locked' ? "bg-neutral-200 dark:bg-neutral-800" :
                                                        `bg-gradient-to-br ${color} opacity-70`
                                        )}
                                        onClick={() => onStepClick?.(step)}
                                    >
                                        {
                                            status === 'completed' ? (
                                                <CheckCircle2 className="w-8 h-8 text-white" />
                                            ) : status === 'locked' ? (
                                                <Lock className="w-6 h-6 text-neutral-400" />
                                            ) : status === 'current' ? (
                                                <Play className="w-6 h-6 text-white" />
                                            ) : (
                                                <Icon className="w-6 h-6 text-white" />
                                            )
                                        }
                                    </motion.div>
                                    <div className={cn(
                                        "mt-2 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                                        status === 'completed' ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-400" :
                                            status === 'current' ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-400" :
                                                "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
                                    )}>
                                        {step.order}
                                    </div>
                                    {
                                        index < steps.length - 1 && (
                                            <div className={cn(
                                                "w-1 h-24 my-2 rounded-full",
                                                status === 'completed' ? "bg-green-500" :
                                                    status === 'current' ? "bg-gradient-to-b from-blue-500 to-neutral-200 dark:to-neutral-700" :
                                                        "bg-neutral-200 dark:bg-neutral-700"
                                            )} />
                                        )
                                    }
                                </div>
                                <div className={cn(
                                    "flex-1 hidden md:block",
                                    !isLeft ? "text-left pl-8" : "text-right pr-8 md:col-start-1 md:row-start-1"
                                )}>
                                    {
                                        !isLeft && (
                                            <StepCard
                                                step={step}
                                                status={status}
                                                icon={Icon}
                                                color={color}
                                                membersAtStep={membersAtStep}
                                                isExpanded={isExpanded}
                                                onExpand={() => setExpandedStep(isExpanded ? null : step.id)}
                                                onStepClick={onStepClick}
                                                onCommentClick={onCommentClick}
                                                onLikeClick={onLikeClick}
                                                isHovered={hoveredStep === step.id}
                                                onHover={(hovered) => setHoveredStep(hovered ? step.id : null)}
                                                align="left"
                                            />
                                        )
                                    }
                                </div>
                                <div className="flex-1 md:hidden ml-4">
                                    <StepCard
                                        step={step}
                                        status={status}
                                        icon={Icon}
                                        color={color}
                                        membersAtStep={membersAtStep}
                                        isExpanded={isExpanded}
                                        onExpand={() => setExpandedStep(isExpanded ? null : step.id)}
                                        onStepClick={onStepClick}
                                        onCommentClick={onCommentClick}
                                        onLikeClick={onLikeClick}
                                        isHovered={hoveredStep === step.id}
                                        onHover={(hovered) => setHoveredStep(hovered ? step.id : null)}
                                        align="left"
                                    />
                                </div>
                            </motion.div>
                        );
                    })
                }
            </div>
        </div>
    );
}

interface StepCardProps {
    step: TimelineStep;
    status: string;
    icon: typeof Rocket;
    color: string;
    membersAtStep: { id: string; name?: string | null; image?: string | null }[];
    isExpanded: boolean;
    onExpand: () => void;
    onStepClick?: (step: TimelineStep) => void;
    onCommentClick?: (stepId: string) => void;
    onLikeClick?: (stepId: string) => void;
    isHovered: boolean;
    onHover: (hovered: boolean) => void;
    align: 'left' | 'right';
}

function StepCard({
    step,
    status,
    icon: Icon,
    color,
    membersAtStep,
    isExpanded,
    onExpand,
    onStepClick,
    onCommentClick,
    onLikeClick,
    isHovered,
    onHover,
    align
}: StepCardProps) {
    return (
        <motion.div
            layout
            onMouseEnter={() => onHover(true)}
            onMouseLeave={() => onHover(false)}
            className={cn(
                "relative p-5 rounded-2xl border-2 transition-all cursor-pointer bg-white dark:bg-neutral-900",
                status === 'completed' ? "border-green-200 dark:border-green-800" :
                    status === 'current' ? "border-blue-300 dark:border-blue-700 shadow-lg shadow-blue-500/10" :
                        status === 'locked' ? "border-neutral-200 dark:border-neutral-800 opacity-60" :
                            "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700",
                isHovered && "scale-[1.02] shadow-xl"
            )}
            onClick={() => onStepClick?.(step)}
        >
            {
                status === 'current' && (
                    <Badge className="absolute -top-2 right-4 bg-blue-500 text-white">
                        Current
                    </Badge>
                )
            }

            <div className={cn("flex items-start gap-3 mb-3", align === 'right' ? "flex-row-reverse" : "")}>
                <div className={cn(
                    "p-2 rounded-lg bg-gradient-to-br shrink-0",
                    color
                )}>
                    <Icon className="w-4 h-4 text-white" />
                </div>
                <div className={cn("flex-1 min-w-0", align === 'right' ? "text-right" : "")}>
                    <h3 className="font-semibold text-neutral-900 dark:text-white line-clamp-1">
                        {step.title}
                    </h3>
                    <Badge variant="outline" className="text-xs mt-1">
                        {step.contentType}
                    </Badge>
                </div>
            </div>

            {
                step.description && (
                    <p className={cn(
                        "text-sm text-neutral-500 dark:text-neutral-400 line-clamp-2 mb-3",
                        align === 'right' ? "text-right" : ""
                    )}>
                        {step.description}
                    </p>
                )
            }

            <div className={cn(
                "flex items-center gap-4 text-xs text-neutral-500",
                align === 'right' ? "flex-row-reverse" : ""
            )}>
                <div className="flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>{step.completionCount} completed</span>
                </div>
                {
                    step.estimatedTime && (
                        <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{step.estimatedTime}min</span>
                        </div>
                    )
                }
            </div>

            {
                membersAtStep.length > 0 && (
                    <div className={cn(
                        "flex items-center gap-2 mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800",
                        align === 'right' ? "flex-row-reverse" : ""
                    )}>
                        <div className="flex -space-x-2">
                            {
                                membersAtStep.slice(0, 3).map((member) => (
                                    <Avatar key={member.id} className="w-6 h-6 border-2 border-white dark:border-neutral-900">
                                        <AvatarImage src={member.image || undefined} />
                                        <AvatarFallback className="text-[10px]">
                                            {member.name?.charAt(0) || 'U'}
                                        </AvatarFallback>
                                    </Avatar>
                                ))
                            }
                        </div>
                        <span className="text-xs text-neutral-500">
                            {membersAtStep.length} {membersAtStep.length === 1 ? 'learner' : 'learners'} here
                        </span>
                    </div>
                )
            }

            <AnimatePresence>
                {
                    isHovered && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className={cn(
                                "flex items-center gap-2 mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800",
                                align === 'right' ? "flex-row-reverse" : ""
                            )}
                        >
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onCommentClick?.(step.id);
                                }}
                                className="gap-1 text-xs"
                            >
                                <MessageSquare className="w-3 h-3" />
                                Comments
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onLikeClick?.(step.id);
                                }}
                                className="gap-1 text-xs"
                            >
                                <Heart className="w-3 h-3" />
                                Like
                            </Button>
                        </motion.div>
                    )
                }
            </AnimatePresence>
        </motion.div>
    );
}