"use client";

import {
    Card, CardContent, CardHeader, CardTitle
} from '@repo/ui/components/ui/card';
import { Button } from '@repo/ui/components/ui/button';
import {
    Plus, FileText, Code, BookOpen, Brain
} from 'lucide-react';
import type { SpaceWithDetails } from '@/types/space';
import { useRouter } from 'next/navigation';

interface SpaceSidebarProps {
    space: SpaceWithDetails;
}

export default function SpaceSidebar({ space }: SpaceSidebarProps) {
    const router = useRouter();
    const userProgress = space.userProgress;

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Brain className="w-5 h-5 text-blue-500" />
                        <CardTitle className="text-lg">AI Assistant</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="space-y-3">
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        Ask me anything about this space...
                    </p>
                    <div className="space-y-2">
                        <Button
                            variant="outline"
                            className="w-full justify-start text-sm"
                            onClick={() => {
                                // TODO: Open AI chat
                            }}
                        >
                            💡 What should I learn next?
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full justify-start text-sm"
                            onClick={() => {
                                // TODO: Open AI chat
                            }}
                        >
                            ❓ Help with current step
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full justify-start text-sm"
                            onClick={() => {
                                // TODO: Open AI chat
                            }}
                        >
                            🎯 Suggest project ideas
                        </Button>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => {
                            // TODO: Open add content modal
                        }}
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Content
                    </Button>
                    <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => {
                            router.push(`/projects/generate?returnTo=space&spaceId=${space.id}`);
                        }}
                    >
                        <Code className="w-4 h-4 mr-2" />
                        Create Project
                    </Button>
                    <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => {
                            router.push(`/studio?returnTo=space&spaceId=${space.id}`);
                        }}
                    >
                        <FileText className="w-4 h-4 mr-2" />
                        Create Studio Note
                    </Button>
                    <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => {
                            router.push(`/concepts/browse?returnTo=space&spaceId=${space.id}`);
                        }}
                    >
                        <BookOpen className="w-4 h-4 mr-2" />
                        Add Concept
                    </Button>
                </CardContent>
            </Card>
            {
                userProgress && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">My Progress</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-neutral-600 dark:text-neutral-400">
                                        Progress
                                    </span>
                                    <span className="text-sm font-semibold">
                                        {Math.round(userProgress.progressPercent)}%
                                    </span>
                                </div>
                                <div className="w-full bg-neutral-200 dark:bg-neutral-800 rounded-full h-2">
                                    <div
                                        className="bg-blue-500 h-2 rounded-full transition-all"
                                        style={{ width: `${userProgress.progressPercent}%` }}
                                    />
                                </div>
                            </div>
                            <div className="text-sm text-neutral-600 dark:text-neutral-400">
                                <div>Current Step: {userProgress.currentStepId ? 'Step ' + (space.steps?.findIndex(s => s.id === userProgress.currentStepId) || 0) + 1 : 'Not started'}</div>
                                <div>Completed: {userProgress.completedSteps.length} steps</div>
                                <div>Time Spent: {Math.round(userProgress.totalTimeSpent / 3600)}h</div>
                            </div>
                        </CardContent>
                    </Card>
                )
            }
        </div>
    );
}