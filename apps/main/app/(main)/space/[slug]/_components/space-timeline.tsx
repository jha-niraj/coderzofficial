"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Rocket } from 'lucide-react';
import { Button } from '@repo/ui/components/ui/button';
import type { SpaceWithDetails } from '@/types/space';
import SpaceRoadmapTimeline from './space-roadmap-timeline';
import AddContentSheet from './add-content-sheet';
import CommentsSheet from './comments-sheet';

interface SpaceTimelineProps {
    space: SpaceWithDetails;
}

export default function SpaceTimeline({ space }: SpaceTimelineProps) {
    const steps = space.steps || [];
    const userProgress = space.userProgress;
    const [commentsOpen, setCommentsOpen] = useState(false);
    const [selectedStepId, setSelectedStepId] = useState<string | null>(null);
    const [selectedStepTitle, setSelectedStepTitle] = useState<string>('');

    const handleStepClick = (step: { id: string; title: string }) => {
        // Navigate to step details or expand step
        console.log('Step clicked:', step);
    };

    const handleCommentClick = (stepId: string) => {
        const step = steps.find(s => s.id === stepId);
        setSelectedStepId(stepId);
        setSelectedStepTitle(step?.title || '');
        setCommentsOpen(true);
    };

    const handleLikeClick = (stepId: string) => {
        // TODO: Implement like functionality
        console.log('Like clicked:', stepId);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2 flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                            <Rocket className="w-5 h-5 text-white" />
                        </div>
                        Learning Timeline
                    </h2>
                    <p className="text-neutral-600 dark:text-neutral-400">
                        Follow the steps to complete this learning journey
                    </p>
                </div>
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

            {/* Empty State */}
            {
                steps.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="relative overflow-hidden rounded-3xl p-12 text-center bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-950 border border-neutral-200 dark:border-neutral-800"
                    >
                        {/* Decorative Background */}
                        <div className="absolute inset-0 opacity-5">
                            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                                <defs>
                                    <pattern id="dots" width="30" height="30" patternUnits="userSpaceOnUse">
                                        <circle cx="15" cy="15" r="2" fill="currentColor" />
                                    </pattern>
                                </defs>
                                <rect width="100%" height="100%" fill="url(#dots)" />
                            </svg>
                        </div>
                        <div className="relative">
                            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/20">
                                <Plus className="w-12 h-12 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-3">
                                Start Building Your Timeline
                            </h3>
                            <p className="text-neutral-600 dark:text-neutral-400 max-w-md mx-auto mb-8">
                                Add projects, quizzes, flashcards, and more to create an engaging learning path for yourself and others.
                            </p>
                            <AddContentSheet
                                spaceId={space.id}
                                spaceSlug={space.slug}
                                trigger={
                                    <Button size="lg" className="gap-2 shadow-lg">
                                        <Plus className="w-5 h-5" />
                                        Add Your First Content
                                    </Button>
                                }
                            />
                        </div>
                    </motion.div>
                ) : (
                    <SpaceRoadmapTimeline
                        steps={steps.map(s => ({
                            id: s.id,
                            order: s.order,
                            title: s.title,
                            description: s.description,
                            contentType: s.contentType,
                            contentId: s.contentId,
                            isRequired: s.isRequired,
                            estimatedTime: s.estimatedTime,
                            status: s.status,
                            completionCount: s.completionCount,
                            averageTimeSpent: s.averageTimeSpent
                        }))}
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
                        onLikeClick={handleLikeClick}
                    />
                )
            }

            {/* Comments Sheet */}
            <CommentsSheet
                open={commentsOpen}
                onOpenChange={setCommentsOpen}
                spaceId={space.id}
                stepId={selectedStepId || undefined}
                stepTitle={selectedStepTitle}
            />
        </div>
    );
}
