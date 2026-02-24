"use client";

import { useState } from 'react';
import {
    Card, CardContent, CardHeader, CardTitle
} from '@repo/ui/components/ui/card';
import { Button } from '@repo/ui/components/ui/button';
import { Badge } from '@repo/ui/components/ui/badge';
import {
    CheckCircle2, Clock, Users, ExternalLink, FileText, Video,
    BookOpen, Zap
} from 'lucide-react';
import type { SpaceStepFromDB } from '@/types/space';
import { SpaceStepContentType } from '@repo/prisma/client';
import { completeStep } from '@/actions/(main)/space/step.action';
import { useRouter } from 'next/navigation';

interface SpaceStepCardProps {
    step: SpaceStepFromDB;
    isCompleted: boolean;
    isCurrent: boolean;
    spaceId: string;
}

const contentTypeIcons: Record<string, typeof BookOpen> = {
    LINK: ExternalLink,
    VIDEO: Video,
    LEARN: BookOpen,
    STUDIO: FileText,
    QUIZ: Zap,
    FLASHCARD: FileText,
    MOCK: Video,
    PDF: FileText,
    TEXT: FileText,
    AI_GENERATED: Zap
};

export default function SpaceStepCard({
    step,
    isCompleted,
    isCurrent,
    spaceId
}: SpaceStepCardProps) {
    const router = useRouter();
    const [isCompleting, setIsCompleting] = useState(false);

    const Icon = contentTypeIcons[step.contentType] || FileText;

    const handleComplete = async () => {
        setIsCompleting(true);
        const result = await completeStep(step.id, {
            isShared: true
        });

        if (result.success) {
            router.refresh();
        }
        setIsCompleting(false);
    };

    const handleContentClick = () => {
        // Handle navigation based on content type
        if (step.contentId) {
            switch (step.contentType) {
                case SpaceStepContentType.PROJECT:
                    router.push(`/projects/${step.contentId}?returnTo=space&spaceId=${spaceId}&stepId=${step.id}`);
                    break;
                case SpaceStepContentType.LEARN:
                    router.push(`/learn/${step.contentId}?returnTo=space&spaceId=${spaceId}&stepId=${step.id}`);
                    break;
                case SpaceStepContentType.STUDIO:
                    router.push(`/studio/${step.contentId}?returnTo=space&spaceId=${spaceId}&stepId=${step.id}`);
                    break;
                default:
                    // Handle links, videos, etc.
                    if (step.contentData && typeof step.contentData === 'object' && 'url' in step.contentData) {
                        window.open((step.contentData as { url: string }).url, '_blank');
                    }
                    break;
            }
        }
    };

    return (
        <Card className={`relative ${isCurrent ? 'ring-2 ring-blue-500' : ''}`}>
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                        <div className={`flex items-center justify-center w-12 h-12 rounded-full ${isCompleted
                            ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400'
                            : isCurrent
                                ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                            }`}>
                            {
                                isCompleted ? (
                                    <CheckCircle2 className="w-6 h-6" />
                                ) : (
                                    <span className="text-lg font-semibold">{step.order}</span>
                                )
                            }
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <CardTitle className="text-xl">{step.title}</CardTitle>
                                {
                                    step.isRequired && (
                                        <Badge variant="outline" className="text-xs">
                                            Required
                                        </Badge>
                                    )
                                }
                            </div>
                            {
                                step.description && (
                                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                                        {step.description}
                                    </p>
                                )
                            }
                            <div className="flex items-center gap-4 text-sm text-neutral-500 dark:text-neutral-500">
                                <div className="flex items-center gap-1">
                                    <Icon className="w-4 h-4" />
                                    <span className="capitalize">{step.contentType.toLowerCase().replace('_', ' ')}</span>
                                </div>
                                {
                                    step.estimatedTime && (
                                        <div className="flex items-center gap-1">
                                            <Clock className="w-4 h-4" />
                                            <span>{step.estimatedTime} min</span>
                                        </div>
                                    )
                                }
                                {
                                    step.completionCount > 0 && (
                                        <div className="flex items-center gap-1">
                                            <Users className="w-4 h-4" />
                                            <span>{step.completionCount} completed</span>
                                        </div>
                                    )
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex items-center gap-2">
                    {
                        step.contentId && (
                            <Button
                                onClick={handleContentClick}
                                variant="outline"
                                className="flex-1"
                            >
                                <Icon className="w-4 h-4 mr-2" />
                                {isCompleted ? 'Review' : 'Start'}
                            </Button>
                        )
                    }
                    {
                        !isCompleted && (
                            <Button
                                onClick={handleComplete}
                                disabled={isCompleting}
                                variant={isCurrent ? 'default' : 'outline'}
                            >
                                {isCompleting ? 'Completing...' : 'Mark Complete'}
                            </Button>
                        )
                    }
                </div>
            </CardContent>
        </Card>
    );
}