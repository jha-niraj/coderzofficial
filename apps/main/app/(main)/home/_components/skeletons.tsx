"use client";

import {
    Card, CardContent, CardHeader
} from "@repo/ui/components/ui/card";
import { Skeleton } from "@repo/ui/components/ui/skeleton";

// Greeting Header Skeleton
export function GreetingHeaderSkeleton() {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Skeleton className="h-16 w-16 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-4 w-48" />
                </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {
                    [...Array(4)].map((_, i) => (
                        <Card key={i} className="p-4 border-0 bg-muted/30">
                            <div className="flex items-start justify-between">
                                <div className="space-y-2">
                                    <Skeleton className="h-3 w-16" />
                                    <Skeleton className="h-7 w-20" />
                                </div>
                                <Skeleton className="h-8 w-8 rounded-lg" />
                            </div>
                        </Card>
                    ))
                }
            </div>
        </div>
    );
}

// Continue Learning Skeleton
export function ContinueLearningSkeleton() {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-8 w-20" />
            </div>
            <div className="flex gap-4 overflow-hidden">
                {
                    [...Array(4)].map((_, i) => (
                        <Card key={i} className="flex-shrink-0 w-[300px]">
                            <CardHeader className="pb-2">
                                <div className="flex items-start justify-between">
                                    <Skeleton className="h-8 w-8 rounded-lg" />
                                    <Skeleton className="h-5 w-16 rounded-full" />
                                </div>
                                <Skeleton className="h-5 w-3/4 mt-2" />
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-2/3" />
                                <div className="flex justify-between">
                                    <Skeleton className="h-5 w-16 rounded-full" />
                                    <Skeleton className="h-4 w-16" />
                                </div>
                            </CardContent>
                        </Card>
                    ))
                }
            </div>
        </div>
    );
}

// Weekly Goals Skeleton
export function WeeklyGoalsSkeleton() {
    return (
        <Card>
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-8 w-8 rounded-lg" />
                        <Skeleton className="h-5 w-32" />
                    </div>
                    <Skeleton className="h-8 w-24" />
                </div>
                <div className="mt-4 space-y-2">
                    <div className="flex justify-between">
                        <Skeleton className="h-3 w-24" />
                        <Skeleton className="h-3 w-20" />
                    </div>
                    <Skeleton className="h-2 w-full rounded-full" />
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                {
                    [...Array(3)].map((_, i) => (
                        <div
                            key={i}
                            className="p-3 rounded-lg border bg-muted/30 flex items-start gap-3"
                        >
                            <Skeleton className="h-5 w-5 rounded-full mt-0.5" />
                            <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-2">
                                    <Skeleton className="h-6 w-6" />
                                    <Skeleton className="h-4 w-40" />
                                </div>
                                <Skeleton className="h-1.5 w-full rounded-full" />
                            </div>
                        </div>
                    ))
                }
            </CardContent>
        </Card>
    );
}

// Quick Actions Skeleton
export function QuickActionsSkeleton() {
    return (
        <Card>
            <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                    <Skeleton className="h-8 w-8 rounded-lg" />
                    <Skeleton className="h-5 w-28" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {
                        [...Array(6)].map((_, i) => (
                            <div key={i} className="p-4 rounded-xl bg-muted/30">
                                <div className="flex flex-col gap-3">
                                    <Skeleton className="h-10 w-10 rounded-lg" />
                                    <div className="space-y-1">
                                        <Skeleton className="h-4 w-20" />
                                        <Skeleton className="h-3 w-24" />
                                    </div>
                                </div>
                            </div>
                        ))
                    }
                </div>
            </CardContent>
        </Card>
    );
}

// Activity Calendar Skeleton
export function ActivityCalendarSkeleton() {
    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-8 w-8 rounded-lg" />
                        <Skeleton className="h-5 w-20" />
                    </div>
                    <Skeleton className="h-4 w-24" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    <Skeleton className="h-3 w-full" />
                    <div className="grid grid-cols-[repeat(53,1fr)] gap-[3px]">
                        {
                            [...Array(371)].map((_, i) => (
                                <Skeleton
                                    key={i}
                                    className="h-[10px] w-[10px] rounded-sm"
                                />
                            ))
                        }
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

// Achievements Card Skeleton
export function AchievementsCardSkeleton() {
    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-8 w-8 rounded-lg" />
                        <Skeleton className="h-5 w-28" />
                    </div>
                    <Skeleton className="h-6 w-16" />
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                {
                    [...Array(4)].map((_, i) => (
                        <div
                            key={i}
                            className="flex items-center gap-3 p-2 rounded-lg"
                        >
                            <Skeleton className="h-8 w-8 rounded" />
                            <div className="flex-1 space-y-1">
                                <div className="flex items-center gap-2">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-4 w-12 rounded-full" />
                                </div>
                                <Skeleton className="h-3 w-40" />
                            </div>
                            <div className="space-y-1">
                                <Skeleton className="h-3 w-12" />
                                <Skeleton className="h-3 w-10" />
                            </div>
                        </div>
                    ))
                }
            </CardContent>
        </Card>
    );
}

// Leaderboard Position Skeleton
export function LeaderboardPositionSkeleton() {
    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-8 w-8 rounded-lg" />
                        <Skeleton className="h-5 w-24" />
                    </div>
                    <Skeleton className="h-6 w-14" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="p-4 rounded-xl bg-muted/30">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Skeleton className="h-12 w-12 rounded" />
                            <div className="space-y-1">
                                <Skeleton className="h-8 w-16" />
                                <Skeleton className="h-3 w-24" />
                            </div>
                        </div>
                        <div className="text-right space-y-1">
                            <Skeleton className="h-4 w-16 ml-auto" />
                            <Skeleton className="h-5 w-14 ml-auto" />
                        </div>
                    </div>
                    <div className="mt-4 space-y-2">
                        <div className="flex justify-between">
                            <Skeleton className="h-3 w-16" />
                            <Skeleton className="h-3 w-12" />
                        </div>
                        <Skeleton className="h-2 w-full rounded-full" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

// Feature Discovery Skeleton
export function FeatureDiscoverySkeleton() {
    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                    <Skeleton className="h-8 w-8 rounded-lg" />
                    <Skeleton className="h-5 w-36" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex gap-4 overflow-hidden">
                    {
                        [...Array(6)].map((_, i) => (
                            <div
                                key={i}
                                className="flex-shrink-0 w-[200px] p-4 rounded-xl bg-muted/30"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <Skeleton className="h-9 w-9 rounded-lg" />
                                    <Skeleton className="h-4 w-16 rounded-full" />
                                </div>
                                <Skeleton className="h-4 w-24 mb-1" />
                                <Skeleton className="h-3 w-full" />
                                <Skeleton className="h-3 w-3/4 mt-1" />
                            </div>
                        ))
                    }
                </div>
            </CardContent>
        </Card>
    );
}

// Recent Activity Skeleton
export function RecentActivitySkeleton() {
    return (
        <Card className="h-full">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-8 w-8 rounded-lg" />
                        <Skeleton className="h-5 w-32" />
                    </div>
                    <Skeleton className="h-6 w-16" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {
                        [...Array(6)].map((_, i) => (
                            <div key={i} className="flex items-start gap-3 pl-2">
                                <Skeleton className="h-5 w-5 rounded-full" />
                                <div className="flex-1 space-y-1">
                                    <Skeleton className="h-4 w-40" />
                                    <Skeleton className="h-3 w-32" />
                                </div>
                                <div className="space-y-1">
                                    <Skeleton className="h-3 w-12" />
                                    <Skeleton className="h-3 w-10" />
                                </div>
                            </div>
                        ))
                    }
                </div>
            </CardContent>
        </Card>
    );
}

// Share Credits Skeleton
export function ShareCreditsSkeleton() {
    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-8 w-8 rounded-lg" />
                        <Skeleton className="h-5 w-20" />
                    </div>
                    <Skeleton className="h-8 w-16" />
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="p-4 rounded-xl bg-muted/30">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <Skeleton className="h-3 w-24" />
                            <Skeleton className="h-7 w-20" />
                        </div>
                        <Skeleton className="h-8 w-8" />
                    </div>
                </div>
                <Skeleton className="h-3 w-32" />
                <div className="space-y-2">
                    {
                        [...Array(3)].map((_, i) => (
                            <div
                                key={i}
                                className="flex items-center gap-3 p-2 rounded-lg"
                            >
                                <Skeleton className="h-8 w-8 rounded-full" />
                                <div className="flex-1 space-y-1">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-3 w-32" />
                                </div>
                                <Skeleton className="h-4 w-10" />
                            </div>
                        ))
                    }
                </div>
            </CardContent>
        </Card>
    );
}

// Referrals Skeleton
export function ReferralsSkeleton() {
    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                    <Skeleton className="h-8 w-8 rounded-lg" />
                    <Skeleton className="h-5 w-20" />
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                    {
                        [...Array(2)].map((_, i) => (
                            <div key={i} className="p-3 rounded-lg bg-muted/30">
                                <div className="flex items-center gap-2 mb-1">
                                    <Skeleton className="h-4 w-4" />
                                    <Skeleton className="h-3 w-20" />
                                </div>
                                <Skeleton className="h-6 w-10" />
                            </div>
                        ))
                    }
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-3 w-28" />
                    <Skeleton className="h-10 w-full rounded-lg" />
                </div>
                <div className="p-3 rounded-lg bg-muted/30 flex items-center gap-3">
                    <Skeleton className="h-8 w-8" />
                    <div className="space-y-1">
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-3 w-48" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

// Community Highlights Skeleton
export function CommunityHighlightsSkeleton() {
    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-8 w-8 rounded-lg" />
                        <Skeleton className="h-5 w-40" />
                    </div>
                    <Skeleton className="h-6 w-16" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {
                        [...Array(3)].map((_, i) => (
                            <div key={i} className="p-4 rounded-xl bg-muted/30">
                                <div className="flex items-center gap-2 mb-3">
                                    <Skeleton className="h-8 w-8 rounded-full" />
                                    <div className="flex-1 space-y-1">
                                        <Skeleton className="h-4 w-24" />
                                        <Skeleton className="h-3 w-16" />
                                    </div>
                                </div>
                                <Skeleton className="h-4 w-full mb-1" />
                                <Skeleton className="h-4 w-full mb-1" />
                                <Skeleton className="h-4 w-3/4 mb-3" />
                                <div className="flex justify-between">
                                    <div className="flex gap-3">
                                        <Skeleton className="h-3 w-8" />
                                        <Skeleton className="h-3 w-8" />
                                    </div>
                                    <Skeleton className="h-3 w-12" />
                                </div>
                            </div>
                        ))
                    }
                </div>
            </CardContent>
        </Card>
    );
}