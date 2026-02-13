import { Suspense } from "react";
import { auth } from '@repo/auth';
import { redirect } from "next/navigation";
import {
	getHomeData, getCommunityHighlights,
} from "@/actions/(main)/home/home.action";

// Components
import GreetingHeader from "./_components/greeting-header";
import ContinueLearning from "./_components/continue-learning";
import PathfinderGoalsCard from "./_components/pathfinder-goals-card";
import QuickActions from "./_components/quick-actions";
import ActivityCalendar from "./_components/activity-calendar";
import AchievementsCard from "./_components/achievements-card";
import LeaderboardPosition from "./_components/leaderboard-position";
import ShareCredits from "./_components/share-credits";
import { KnowmeSheetProvider } from "./_components/knowme-sheet-provider";
import Referrals from "./_components/referrals";
import ProjectsPreview from "./_components/projects-preview";
import MockVoicePreview from "./_components/mock-voice-preview";
import MockVoiceSection from "./_components/mock-voice-section";
import CommunityHighlights from "./_components/community-highlights";

import {
	GreetingHeaderSkeleton, ContinueLearningSkeleton,
	PathfinderGoalsSkeleton, QuickActionsSkeleton,
	ActivityCalendarSkeleton, AchievementsCardSkeleton,
	LeaderboardPositionSkeleton,
	ShareCreditsSkeleton,
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
		pathfinderGoals,
		activityCalendar,
		achievements,
		leaderboardRank,
		recentTransfers,
		referralStats,
		recentMockSessions,
	} = homeDataResult.data;

	const communityPosts = communityResult.posts || [];

	return (
		<KnowmeSheetProvider>
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

					<div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
						<div className="md:col-span-7 lg:col-span-8 space-y-6 flex flex-col h-full">

						<Suspense fallback={<PathfinderGoalsSkeleton />}>
							<PathfinderGoalsCard goals={pathfinderGoals} />
						</Suspense>

						<ProjectsPreview projects={inProgressProjects} />

						<MockVoicePreview sessions={recentMockSessions} />
						<Suspense fallback={<ActivityCalendarSkeleton />}>
								<ActivityCalendar data={activityCalendar} />
							</Suspense>
						</div>

						<div className="md:col-span-5 lg:col-span-4 space-y-6 flex flex-col h-full sticky top-6">
						<Suspense fallback={<QuickActionsSkeleton />}>
							<QuickActions />
						</Suspense>

						<MockVoiceSection />

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
					<div className="pt-4 border-t border-border">
						<Suspense fallback={<CommunityHighlightsSkeleton />}>
							<CommunityHighlights posts={communityPosts} />
						</Suspense>
					</div>
				</div>
			</main>
		</KnowmeSheetProvider>
	);
}