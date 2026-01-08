import { Suspense } from "react";
import { auth } from '@repo/auth';
import { redirect } from "next/navigation";
import {
	getHomeData, getCommunityHighlights,
} from "@/actions/(main)/home/home.action";

// Components
import GreetingHeader from "./_components/greeting-header";
import ContinueLearning from "./_components/continue-learning";
import WeeklyGoals from "./_components/weekly-goals";
import QuickActions from "./_components/quick-actions";
import ActivityCalendar from "./_components/activity-calendar";
import AchievementsCard from "./_components/achievements-card";
import LeaderboardPosition from "./_components/leaderboard-position";
import FeatureDiscovery from "./_components/feature-discovery";
import RecentActivity from "./_components/recent-activity";
import ShareCredits from "./_components/share-credits";
import Referrals from "./_components/referrals";
import CommunityHighlights from "./_components/community-highlights";

import {
	GreetingHeaderSkeleton, ContinueLearningSkeleton,
	WeeklyGoalsSkeleton, QuickActionsSkeleton,
	ActivityCalendarSkeleton, AchievementsCardSkeleton,
	LeaderboardPositionSkeleton, FeatureDiscoverySkeleton,
	RecentActivitySkeleton, ShareCreditsSkeleton,
	ReferralsSkeleton, CommunityHighlightsSkeleton,
} from "./_components/skeletons";

export const metadata = {
	title: "Home | TheCoderz",
	description: "Your personalized learning dashboard",
};

export default async function HomePage() {
	const session = await auth();

	if (!session?.user?.id) {
		redirect("/login");
	}

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
		user,
		inProgressProjects,
		recentStudios,
		weeklyGoals,
		weeklyGoalProgress,
		recentActivity,
		activityCalendar,
		achievements,
		leaderboardRank,
		recentTransfers,
		referralStats,
	} = homeDataResult.data;

	const communityPosts = communityResult.posts || [];

	return (
		<main className="w-full min-h-screen pb-12">
			<div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

				<Suspense fallback={<GreetingHeaderSkeleton />}>
					<GreetingHeader user={user} />
				</Suspense>

				{
					(inProgressProjects.length > 0 || recentStudios.length > 0) && (
						<Suspense fallback={<ContinueLearningSkeleton />}>
							<div className="w-full">
								<ContinueLearning
									projects={inProgressProjects}
									studios={recentStudios}
								/>
							</div>
						</Suspense>
					)
				}

				{/* --- SECTION 3: MAIN DASHBOARD GRID --- */}
				{/* Using a 12-column grid gives us perfect control over width */}
				<div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">

					{/* LEFT COLUMN: Activity & Goals (Spans 12 on Mobile, 7 on Tablet, 8 on Desktop) */}
					<div className="md:col-span-7 lg:col-span-8 space-y-6 flex flex-col h-full">

						<Suspense fallback={<WeeklyGoalsSkeleton />}>
							<WeeklyGoals
								goals={weeklyGoals}
								progress={weeklyGoalProgress}
							/>
						</Suspense>

						<Suspense fallback={<ActivityCalendarSkeleton />}>
							<ActivityCalendar data={activityCalendar} />
						</Suspense>

						<Suspense fallback={<RecentActivitySkeleton />}>
							<RecentActivity activities={recentActivity} />
						</Suspense>

						<Suspense fallback={<FeatureDiscoverySkeleton />}>
							<FeatureDiscovery />
						</Suspense>
					</div>

					{/* RIGHT COLUMN: Widgets & Gamification (Spans 12 on Mobile, 5 on Tablet, 4 on Desktop) */}
					<div className="md:col-span-5 lg:col-span-4 space-y-6 flex flex-col h-full sticky top-6">

						<Suspense fallback={<QuickActionsSkeleton />}>
							<QuickActions />
						</Suspense>

						<Suspense fallback={<LeaderboardPositionSkeleton />}>
							<LeaderboardPosition rank={leaderboardRank} />
						</Suspense>

						<Suspense fallback={<AchievementsCardSkeleton />}>
							<AchievementsCard achievements={achievements} />
						</Suspense>

						<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-4">
							<Suspense fallback={<ShareCreditsSkeleton />}>
								<ShareCredits
									transfers={recentTransfers}
									currentCredits={user?.credits || 0}
								/>
							</Suspense>

							<Suspense fallback={<ReferralsSkeleton />}>
								<Referrals stats={referralStats} />
							</Suspense>
						</div>
					</div>
				</div>

				{/* --- SECTION 4: COMMUNITY (Full Width Footer Area) --- */}
				<div className="pt-4 border-t border-border">
					<Suspense fallback={<CommunityHighlightsSkeleton />}>
						<CommunityHighlights posts={communityPosts} />
					</Suspense>
				</div>

			</div>
		</main>
	);
}