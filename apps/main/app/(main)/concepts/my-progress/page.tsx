import { Suspense } from "react";
import { auth } from '@repo/auth';
import { redirect } from "next/navigation";
import { prisma } from "@repo/prisma";
import { ProgressHeader } from "./_components/progress-header";
import { Metadata } from "next";
import { ProgressStats } from "./_components/progress-stats";
import { LearningJourney } from "./_components/learning-journey";
import { ProgressSkeleton } from "./_components/progress-skeleton";

export const metadata: Metadata = {
	title: "My Learning Progress | Concepts Hub",
	description: "Track your learning journey and progress through concepts",
};

async function getProgressData(userId: string) {
	const [progress, completedCount, , streakData] = await Promise.all([
		prisma.conceptProgress.findMany({
			where: { userId },
			include: {
				concept: {
					select: {
						id: true,
						title: true,
						slug: true,
						description: true,
						category: true,
						difficulty: true,
						estimatedTime: true,
						_count: {
							select: {
								steps: true,
							},
						},
					},
				},
			},
			orderBy: {
				updatedAt: "desc",
			},
		}),
		// Get count of completed concepts
		prisma.conceptProgress.count({
			where: {
				userId,
				isCompleted: true,
			},
		}),
		// Calculate total time spent (mock for now, would need time tracking)
		prisma.conceptProgress.aggregate({
			where: {
				userId,
				isCompleted: true,
			},
			_count: true,
		}),
		// Get streak data (concepts completed in last 7 days)
		prisma.conceptProgress.findMany({
			where: {
				userId,
				isCompleted: true,
				updatedAt: {
					gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
				},
			},
			select: {
				updatedAt: true,
			},
		}),
	]);

	// Calculate streak
	const uniqueDays = new Set(
		streakData.map((s) => s.updatedAt.toISOString().split("T")[0])
	);
	const currentStreak = uniqueDays.size;

	return {
		progress,
		stats: {
			completedCount,
			inProgressCount: progress.filter((p) => !p.isCompleted && p.currentStep > 0).length,
			totalConcepts: progress.length,
			currentStreak,
		},
	};
}

async function ProgressContent() {
	const session = await auth();

	if (!session?.user?.id) {
		redirect("/signin");
	}

	const data = await getProgressData(session.user.id);

	return (
		<>
			<ProgressStats stats={data.stats} />
			<LearningJourney progress={data.progress} />
		</>
	);
}

export default async function MyProgressPage() {
	const session = await auth();

	if (!session?.user?.id) {
		redirect("/signin");
	}

	return (
		<div className="min-h-screen bg-white dark:bg-neutral-950 pb-20">
			<ProgressHeader />
			<div className="container max-w-6xl mx-auto px-4">
				<Suspense fallback={<ProgressSkeleton />}>
					<ProgressContent />
				</Suspense>
			</div>
		</div>
	);
}