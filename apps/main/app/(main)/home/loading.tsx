import {
    GreetingHeaderSkeleton, ContinueLearningSkeleton, PathfinderGoalsSkeleton,
    ActivityCalendarSkeleton, AchievementsCardSkeleton, LeaderboardPositionSkeleton,
    ShareCreditsSkeleton, ReferralsSkeleton, CommunityHighlightsSkeleton
} from "./_components/skeletons";

export default function HomeLoading() {
    return (
        <div className="w-full min-h-screen bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
                <GreetingHeaderSkeleton />

                <ContinueLearningSkeleton />

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    <div className="md:col-span-7 lg:col-span-8 space-y-6">
                        <PathfinderGoalsSkeleton />
                        <ActivityCalendarSkeleton />
                    </div>
                    <div className="md:col-span-5 lg:col-span-4 space-y-6">
                        <LeaderboardPositionSkeleton />
                        <AchievementsCardSkeleton />
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-4">
                            <ShareCreditsSkeleton />
                            <ReferralsSkeleton />
                        </div>
                    </div>
                </div>

                <CommunityHighlightsSkeleton />
            </div>
        </div>
    );
}