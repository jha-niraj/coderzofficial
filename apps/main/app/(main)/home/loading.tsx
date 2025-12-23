import {
    GreetingHeaderSkeleton, ContinueLearningSkeleton, WeeklyGoalsSkeleton,
    QuickActionsSkeleton, ActivityCalendarSkeleton, AchievementsCardSkeleton,
    LeaderboardPositionSkeleton, FeatureDiscoverySkeleton, RecentActivitySkeleton,
    ShareCreditsSkeleton, ReferralsSkeleton, CommunityHighlightsSkeleton
} from "./_components/skeletons";

export default function HomeLoading() {
    return (
        <div className="w-full min-h-screen bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
                <GreetingHeaderSkeleton />

                <ContinueLearningSkeleton />

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    <div className="lg:col-span-3 space-y-6">
                        <WeeklyGoalsSkeleton />
                        <QuickActionsSkeleton />
                    </div>
                    <div className="lg:col-span-2 space-y-6">
                        <ActivityCalendarSkeleton />
                        <AchievementsCardSkeleton />
                        <LeaderboardPositionSkeleton />
                    </div>
                </div>

                <FeatureDiscoverySkeleton />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <RecentActivitySkeleton />
                    <div className="space-y-6">
                        <ShareCreditsSkeleton />
                        <ReferralsSkeleton />
                    </div>
                </div>

                <CommunityHighlightsSkeleton />
            </div>
        </div>
    );
}