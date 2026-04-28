import { Suspense } from "react";
import { auth } from '@repo/auth';
import { redirect } from "next/navigation";
import { getHomeData, getCommunityHighlights } from "@/actions/(main)/home/home.action";

import GreetingHeader from "./_components/greeting-header";
import ContinueLearning from "./_components/continue-learning";
import PathfinderGoalsCard from "./_components/pathfinder-goals-card";
import ActivityCalendar from "./_components/activity-calendar";
import AchievementsCard from "./_components/achievements-card";
import LeaderboardPosition from "./_components/leaderboard-position";
import ShareCredits from "./_components/share-credits";
import { KnowmeSheetProvider } from "./_components/knowme-sheet-provider";
import Referrals from "./_components/referrals";
import ProjectsPreview from "./_components/projects-preview";
import MockVoicePreview from "./_components/mock-voice-preview";
import CommunityHighlights from "./_components/community-highlights";

import {
    GreetingHeaderSkeleton, ContinueLearningSkeleton, PathfinderGoalsSkeleton,
    ActivityCalendarSkeleton, AchievementsCardSkeleton, LeaderboardPositionSkeleton,
    ShareCreditsSkeleton, ReferralsSkeleton, CommunityHighlightsSkeleton,
    ProjectsPreviewSkeleton, MockVoicePreviewSkeleton,
} from "./_components/skeletons";

export const metadata = {
    title: "Home | TheCoderz",
    description: "Your personalized learning dashboard",
};

export default async function HomePage() {
    const session = await auth();
    if (!session?.user?.id) redirect("/login");

    const [homeDataResult, communityResult] = await Promise.all([
        getHomeData(),
        getCommunityHighlights(),
    ]);

    if (!homeDataResult.success || !homeDataResult.data) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <p className="text-muted-foreground">Failed to load home data</p>
            </div>
        );
    }

    const {
        user, inProgressProjects, recentStudios, pathfinderGoals,
        activityCalendar, achievements, leaderboardRank,
        recentTransfers, referralStats, recentMockSessions,
    } = homeDataResult.data;

    const communityPosts = communityResult.posts || [];
    const hasContinueLearning = inProgressProjects.length > 0 || recentStudios.length > 0;

    return (
        <KnowmeSheetProvider>
            <div className="w-full min-h-screen bg-neutral-50/50 dark:bg-neutral-950">

                {/* ── Greeting header ── */}
                <div className="px-4 sm:px-6 lg:px-8 pt-6 pb-4">
                    <Suspense fallback={<GreetingHeaderSkeleton />}>
                        <GreetingHeader user={user} />
                    </Suspense>
                </div>

                {/* ── Bento grid ── */}
                <div className="px-4 sm:px-6 lg:px-8 pb-10 space-y-4">

                    {/* ── Row: Continue Learning (full width, only when items exist) ── */}
                    {hasContinueLearning && (
                        <Suspense fallback={<ContinueLearningSkeleton />}>
                            <ContinueLearning
                                projects={inProgressProjects}
                                studios={recentStudios}
                            />
                        </Suspense>
                    )}

                    {/* ── Row 1: Activity Calendar (hero, wide) + Leaderboard ── */}
                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
                        <div className="xl:col-span-7 2xl:col-span-8">
                            <Suspense fallback={<ActivityCalendarSkeleton />}>
                                <ActivityCalendar data={activityCalendar} />
                            </Suspense>
                        </div>
                        <div className="xl:col-span-5 2xl:col-span-4">
                            <Suspense fallback={<LeaderboardPositionSkeleton />}>
                                <LeaderboardPosition rank={leaderboardRank} />
                            </Suspense>
                        </div>
                    </div>

                    {/* ── Row 2: Three equal action cards ── */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Suspense fallback={<PathfinderGoalsSkeleton />}>
                            <PathfinderGoalsCard goals={pathfinderGoals} />
                        </Suspense>
                        <Suspense fallback={<ProjectsPreviewSkeleton />}>
                            <ProjectsPreview projects={inProgressProjects} />
                        </Suspense>
                        <Suspense fallback={<MockVoicePreviewSkeleton />}>
                            <MockVoicePreview sessions={recentMockSessions} />
                        </Suspense>
                    </div>

                    {/* ── Row 3: Achievements (wide) + Credits + Referrals ── */}
                    <div className="grid grid-cols-2 lg:grid-cols-12 gap-4">
                        <div className="col-span-2 lg:col-span-6">
                            <Suspense fallback={<AchievementsCardSkeleton />}>
                                <AchievementsCard achievements={achievements} />
                            </Suspense>
                        </div>
                        <div className="col-span-1 lg:col-span-3">
                            <Suspense fallback={<ShareCreditsSkeleton />}>
                                <ShareCredits
                                    transfers={recentTransfers}
                                    currentCredits={user?.credits || 0}
                                />
                            </Suspense>
                        </div>
                        <div className="col-span-1 lg:col-span-3">
                            <Suspense fallback={<ReferralsSkeleton />}>
                                <Referrals stats={referralStats} />
                            </Suspense>
                        </div>
                    </div>

                    {/* ── Row 4: Community (only if posts exist) ── */}
                    {communityPosts.length > 0 && (
                        <Suspense fallback={<CommunityHighlightsSkeleton />}>
                            <CommunityHighlights posts={communityPosts} />
                        </Suspense>
                    )}

                </div>
            </div>
        </KnowmeSheetProvider>
    );
}
