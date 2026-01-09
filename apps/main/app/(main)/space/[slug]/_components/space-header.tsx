"use client";

import Link from 'next/link';
import { Button } from '@repo/ui/components/ui/button';
import {
    ArrowLeft, Settings, Users, Share2
} from 'lucide-react';
import type { SpaceWithDetails } from '@/types/space';

interface SpaceHeaderProps {
    space: SpaceWithDetails;
}

export default function SpaceHeader({ space }: SpaceHeaderProps) {
    return (
        <div className="border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 sticky top-0 z-10">
            <div className="container mx-auto px-4 py-4 max-w-7xl">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/space">
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                        </Link>
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">{space.emoji || '🚀'}</span>
                            <div>
                                <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
                                    {space.title}
                                </h1>
                                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                    Created by {space.creator.name || space.creator.username || 'Unknown'} • {space.memberCount} members
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                            <Users className="w-4 h-4 mr-2" />
                            Members
                        </Button>
                        <Button variant="outline" size="sm">
                            <Share2 className="w-4 h-4 mr-2" />
                            Share
                        </Button>
                        <Button variant="outline" size="icon">
                            <Settings className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}