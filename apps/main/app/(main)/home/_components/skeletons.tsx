"use client";

import { DotmSquare11 } from "@repo/ui/components/ui/dotm-square-11";

// Shared loader tile — matches the bento card style
function LoaderTile({ className = "" }: { className?: string }) {
    return (
        <div className={`rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex items-center justify-center ${className}`}>
            <DotmSquare11 size={32} dotSize={4} speed={1.4} />
        </div>
    );
}

export function GreetingHeaderSkeleton() {
    return (
        <div className="h-28 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex items-center justify-center">
            <DotmSquare11 size={32} dotSize={4} speed={1.4} />
        </div>
    );
}

export function ContinueLearningSkeleton() {
    return <LoaderTile className="h-36" />;
}

export function PathfinderGoalsSkeleton() {
    return <LoaderTile className="h-64" />;
}

export function ActivityCalendarSkeleton() {
    return <LoaderTile className="h-64" />;
}

export function AchievementsCardSkeleton() {
    return <LoaderTile className="h-56" />;
}

export function LeaderboardPositionSkeleton() {
    return <LoaderTile className="h-64" />;
}

export function FeatureDiscoverySkeleton() {
    return <LoaderTile className="h-40" />;
}

export function RecentActivitySkeleton() {
    return <LoaderTile className="h-56" />;
}

export function ShareCreditsSkeleton() {
    return <LoaderTile className="h-56" />;
}

export function ReferralsSkeleton() {
    return <LoaderTile className="h-56" />;
}

export function CommunityHighlightsSkeleton() {
    return <LoaderTile className="h-48" />;
}

export function ProjectsPreviewSkeleton() {
    return <LoaderTile className="h-64" />;
}

export function MockVoicePreviewSkeleton() {
    return <LoaderTile className="h-64" />;
}
