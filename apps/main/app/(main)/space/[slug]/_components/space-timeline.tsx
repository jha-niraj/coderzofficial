"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    Plus, Rocket, LayoutGrid, GitBranch 
} from 'lucide-react';
import { Button } from '@repo/ui/components/ui/button';
import { ScrollArea } from '@repo/ui/components/ui/scroll-area';
import type { SpaceWithDetails } from '@/types/space';
import SpaceFlowTimeline from './space-flow-timeline';
import SpaceRoadmapTimeline from './space-roadmap-timeline';
import AddContentSheet from './add-content-sheet';
import CommentsSheet from './comments-sheet';
import { useSpaceStore, type OptimisticStep } from '@/app/store/spaceStore';
import { useSession } from '@repo/auth/client';
import {
    ToggleGroup, ToggleGroupItem
} from '@repo/ui/components/ui/toggle-group';
import {
    Tooltip, TooltipContent, TooltipProvider, TooltipTrigger
} from '@repo/ui/components/ui/tooltip';

interface SpaceTimelineProps {
    space: SpaceWithDetails;
}

export default function SpaceTimeline({ space }: SpaceTimelineProps) {
    const { data: session } = useSession();
    const { initializeSpace, steps: storeSteps, openCommentsSheet, closeCommentsSheet, isCommentsSheetOpen, selectedStepForComments } = useSpaceStore();
    
    const userProgress = space.userProgress;
    const [selectedStepTitle, setSelectedStepTitle] = useState<string>('');
    const [viewMode, setViewMode] = useState<'flow' | 'list'>('list'); // Default to list view for better compatibility

    // Initialize store with space data
    useEffect(() => {
        const initialSteps: OptimisticStep[] = (space.steps || []).map(s => ({
            id: s.id,
            order: s.order,
            title: s.title,
            description: s.description,
            contentType: s.contentType,
            contentId: s.contentId,
            contentData: (s.contentData as Record<string, unknown>) || undefined,
            isRequired: s.isRequired,
            estimatedTime: s.estimatedTime,
            status: s.status,
            completionCount: s.completionCount,
            averageTimeSpent: s.averageTimeSpent,
            isOptimistic: false,
            isLoading: false,
            error: null,
        }));
        initializeSpace(space.id, initialSteps);
    }, [space.id, space.steps, initializeSpace]);

    // Use store steps or fall back to space steps
    const displaySteps = storeSteps.length > 0 ? storeSteps : (space.steps || []).map(s => ({
        id: s.id,
        order: s.order,
        title: s.title,
        description: s.description,
        contentType: s.contentType,
        contentId: s.contentId,
        contentData: (s.contentData as Record<string, unknown>) || undefined,
        isRequired: s.isRequired,
        estimatedTime: s.estimatedTime,
        status: s.status,
        completionCount: s.completionCount,
        averageTimeSpent: s.averageTimeSpent,
    }));

    const handleStepClick = (step: OptimisticStep) => {
        console.log('Step clicked:', step);
    };

    const handleCommentClick = (stepId: string) => {
        const step = displaySteps.find(s => s.id === stepId);
        setSelectedStepTitle(step?.title || '');
        openCommentsSheet(stepId);
    };

    return (
        <div className="h-full flex flex-col">
            {/* Compact Header */}
            <div className="flex items-center justify-between gap-2 p-3 border-b border-neutral-200 dark:border-neutral-800 shrink-0">
                <div className="flex items-center gap-2 min-w-0">
                    <div className="p-1.5 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shrink-0">
                        <Rocket className="w-4 h-4 text-white" />
                    </div>
                    <h2 className="text-lg font-bold text-neutral-900 dark:text-white truncate">
                        Timeline
                    </h2>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    {/* View Mode Toggle */}
                    <TooltipProvider>
                        <ToggleGroup 
                            type="single" 
                            value={viewMode} 
                            onValueChange={(value) => value && setViewMode(value as 'flow' | 'list')}
                            className="bg-white dark:bg-neutral-800 p-0.5 rounded-lg border border-neutral-200 dark:border-neutral-700"
                        >
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <ToggleGroupItem 
                                        value="flow" 
                                        aria-label="Canvas view"
                                        className="data-[state=on]:bg-neutral-100 dark:data-[state=on]:bg-neutral-700 px-2 py-1"
                                    >
                                        <GitBranch className="w-3.5 h-3.5" />
                                    </ToggleGroupItem>
                                </TooltipTrigger>
                                <TooltipContent side="bottom">
                                    <p className="text-xs">Canvas View</p>
                                </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <ToggleGroupItem 
                                        value="list" 
                                        aria-label="List view"
                                        className="data-[state=on]:bg-neutral-100 dark:data-[state=on]:bg-neutral-700 px-2 py-1"
                                    >
                                        <LayoutGrid className="w-3.5 h-3.5" />
                                    </ToggleGroupItem>
                                </TooltipTrigger>
                                <TooltipContent side="bottom">
                                    <p className="text-xs">List View</p>
                                </TooltipContent>
                            </Tooltip>
                        </ToggleGroup>
                    </TooltipProvider>
                    
                    <AddContentSheet
                        spaceId={space.id}
                        spaceSlug={space.slug}
                        trigger={
                            <Button size="sm" className="gap-1.5">
                                <Plus className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Add</span>
                            </Button>
                        }
                    />
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden">
                {displaySteps.length === 0 ? (
                    <div className="h-full flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="relative overflow-hidden rounded-2xl p-8 text-center bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 max-w-md"
                        >
                            <div className="absolute inset-0 opacity-5">
                                <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                                    <defs>
                                        <pattern id="dots" width="24" height="24" patternUnits="userSpaceOnUse">
                                            <circle cx="12" cy="12" r="1.5" fill="currentColor" />
                                        </pattern>
                                    </defs>
                                    <rect width="100%" height="100%" fill="url(#dots)" />
                                </svg>
                            </div>
                            <div className="relative">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/20">
                                    <Plus className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">
                                    Start Building
                                </h3>
                                <p className="text-sm text-neutral-600 dark:text-neutral-400 max-w-sm mx-auto mb-6">
                                    Add projects, quizzes, and more to create your learning path.
                                </p>
                                <AddContentSheet
                                    spaceId={space.id}
                                    spaceSlug={space.slug}
                                    trigger={
                                        <Button className="gap-2">
                                            <Plus className="w-4 h-4" />
                                            Add Content
                                        </Button>
                                    }
                                />
                            </div>
                        </motion.div>
                    </div>
                ) : viewMode === 'flow' ? (
                    <div className="h-full w-full">
                        <SpaceFlowTimeline
                            steps={displaySteps}
                            spaceId={space.id}
                            spaceSlug={space.slug}
                            userProgress={userProgress ? {
                                currentStepId: userProgress.currentStepId || undefined,
                                completedSteps: userProgress.completedSteps
                            } : undefined}
                            activeMembers={space.members?.slice(0, 10).map(m => ({
                                id: m.userId,
                                name: m.user?.name,
                                image: m.user?.image,
                                currentStepId: m.currentStepId
                            }))}
                            onStepClick={handleStepClick}
                            onCommentClick={handleCommentClick}
                        />
                    </div>
                ) : (
                    <ScrollArea className="h-full">
                        <div className="p-4">
                            <SpaceRoadmapTimeline
                                steps={displaySteps}
                                spaceId={space.id}
                                spaceSlug={space.slug}
                                userProgress={userProgress ? {
                                    currentStepId: userProgress.currentStepId || undefined,
                                    completedSteps: userProgress.completedSteps
                                } : undefined}
                                activeMembers={space.members?.slice(0, 10).map(m => ({
                                    id: m.userId,
                                    name: m.user?.name,
                                    image: m.user?.image,
                                    currentStepId: m.currentStepId
                                }))}
                                onStepClick={handleStepClick}
                                onCommentClick={handleCommentClick}
                            />
                        </div>
                    </ScrollArea>
                )}
            </div>

            {/* Comments Sheet */}
            <CommentsSheet
                open={isCommentsSheetOpen}
                onOpenChange={(open) => {
                    if (!open) closeCommentsSheet();
                }}
                spaceId={space.id}
                stepId={selectedStepForComments || undefined}
                stepTitle={selectedStepTitle}
                currentUserId={session?.user?.id}
            />
        </div>
    );
}
