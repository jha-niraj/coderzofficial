"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@repo/ui/components/ui/card";
import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import { Progress } from "@repo/ui/components/ui/progress";
import {
	ChevronRight, CheckCircle2, Clock, BookOpen
} from "lucide-react";
import Link from "next/link";
import {
	LearnDifficulty
} from "@repo/prisma/client";

interface ProgressItem {
	id: string;
	currentStep: number;
	isCompleted: boolean;
	updatedAt: Date;
	learn: {
		id: string;
		title: string;
		slug: string;
		description: string;
		mainCategory: { id: string; name: string } | null;
		subCategory: { id: string; name: string } | null;
		difficulty: LearnDifficulty;
		estimatedTime: number | null;
		_count: {
			steps: number;
		};
	};
}

interface LearningJourneyProps {
	progress: ProgressItem[];
}

// Helper to get a consistent color from a string
function getCategoryColor(category: string) {
	const colors = [
		"text-blue-500 bg-blue-500/10",
		"text-purple-500 bg-purple-500/10",
		"text-green-500 bg-green-500/10",
		"text-pink-500 bg-pink-500/10",
		"text-indigo-500 bg-indigo-500/10",
		"text-amber-500 bg-amber-500/10",
		"text-cyan-500 bg-cyan-500/10",
		"text-sky-500 bg-sky-500/10",
		"text-orange-500 bg-orange-500/10",
		"text-fuchsia-500 bg-fuchsia-500/10",
		"text-red-500 bg-red-500/10",
		"text-emerald-500 bg-emerald-500/10",
		"text-violet-500 bg-violet-500/10",
		"text-teal-500 bg-teal-500/10",
		"text-lime-500 bg-lime-500/10",
		"text-rose-500 bg-rose-500/10",
	];

	let hash = 0;
	for (let i = 0; i < category.length; i++) {
		hash = category.charCodeAt(i) + ((hash << 5) - hash);
	}

	const index = Math.abs(hash) % colors.length;
	return colors[index];
}

const difficultyStyles: Record<LearnDifficulty, { label: string; color: string }> = {
	BEGINNER: { label: "Beginner", color: "text-green-500 bg-green-500/10" },
	INTERMEDIATE: { label: "Intermediate", color: "text-amber-500 bg-amber-500/10" },
	ADVANCED: { label: "Advanced", color: "text-orange-500 bg-orange-500/10" },
	EXPERT: { label: "Expert", color: "text-red-500 bg-red-500/10" },
};

export function LearningJourney({ progress }: LearningJourneyProps) {
	if (progress.length === 0) {
		return (
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				className="text-center py-20"
			>
				<div className="h-20 w-20 mx-auto rounded-full bg-muted/50 flex items-center justify-center mb-6">
					<BookOpen className="h-10 w-10 text-muted-foreground" />
				</div>
				<h3 className="text-xl font-semibold mb-2">Start Your Learning Journey</h3>
				<p className="text-muted-foreground mb-6 max-w-md mx-auto">
					You haven&apos;t started any Learns yet. Explore our library and begin learning today!
				</p>
				<Button asChild>
					<Link href="/Learns/browse">
						Browse Learns
						<ChevronRight className="ml-2 h-4 w-4" />
					</Link>
				</Button>
			</motion.div>
		);
	}

	// Separate completed and in-progress
	const inProgress = progress.filter((p) => !p.isCompleted);
	const completedItems = progress.filter((p) => p.isCompleted);

	return (
		<div className="space-y-10">
			{
				inProgress.length > 0 && (
					<div>
						<motion.div
							initial={{ opacity: 0, x: -20 }}
							animate={{ opacity: 1, x: 0 }}
							className="flex items-center gap-2 mb-4"
						>
							<Clock className="h-5 w-5 text-amber-500" />
							<h2 className="text-xl font-semibold">In Progress</h2>
							<Badge variant="secondary">{inProgress.length}</Badge>
						</motion.div>
						<div className="grid gap-4">
							{
								inProgress.map((item, index) => (
									<ProgressCard key={item.id} item={item} index={index} />
								))
							}
						</div>
					</div>
				)
			}
			{
				completedItems.length > 0 && (
					<div>
						<motion.div
							initial={{ opacity: 0, x: -20 }}
							animate={{ opacity: 1, x: 0 }}
							className="flex items-center gap-2 mb-4"
						>
							<CheckCircle2 className="h-5 w-5 text-emerald-500" />
							<h2 className="text-xl font-semibold">Completed</h2>
							<Badge variant="secondary">{completedItems.length}</Badge>
						</motion.div>
						<div className="grid gap-4">
							{
								completedItems.map((item, index) => (
									<ProgressCard key={item.id} item={item} index={index} isCompleted />
								))
							}
						</div>
					</div>
				)
			}
		</div>
	);
}

function ProgressCard({
	item,
	index,
	isCompleted = false
}: {
	item: ProgressItem;
	index: number;
	isCompleted?: boolean;
}) {
	const totalSteps = item.learn._count.steps;
	const progressPercentage = totalSteps > 0
		? Math.round((item.currentStep / totalSteps) * 100)
		: 0;

	const displayCategory = item.learn.mainCategory?.name || "General";
	const categoryClass = getCategoryColor(displayCategory);
	const difficultyStyle = difficultyStyles[item.learn.difficulty as keyof typeof difficultyStyles] || { label: item.learn.difficulty, color: "text-gray-500 bg-gray-500/10" };

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.3, delay: index * 0.05 }}
		>
			<Card className="group hover:shadow-md transition-all duration-300">
				<CardContent className="p-6">
					<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
						<div className="flex-1 space-y-3">
							<div className="flex items-center gap-2 flex-wrap">
								<Badge className={`${categoryClass} border-0`}>
									{displayCategory}
								</Badge>
								<Badge className={difficultyStyle.color}>
									{difficultyStyle.label}
								</Badge>
								{
									isCompleted && (
										<Badge className="bg-emerald-500/10 text-emerald-500 border-0">
											<CheckCircle2 className="h-3 w-3 mr-1" />
											Completed
										</Badge>
									)
								}
							</div>
							<div>
								<h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
									{item.learn.title}
								</h3>
								<p className="text-sm text-muted-foreground line-clamp-1 mt-1">
									{item.learn.description}
								</p>
							</div>
							<div className="flex items-center gap-4 text-sm text-muted-foreground">
								<span>
									Step {item.currentStep} of {totalSteps}
								</span>
								{
									item.learn.estimatedTime && (
										<span className="flex items-center gap-1">
											<Clock className="h-4 w-4" />
											{item.learn.estimatedTime} min
										</span>
									)
								}
							</div>
							{
								!isCompleted && (
									<div className="pt-2">
										<div className="flex items-center justify-between mb-2">
											<span className="text-xs text-muted-foreground">Progress</span>
											<span className="text-xs font-medium">{progressPercentage}%</span>
										</div>
										<Progress value={progressPercentage} className="h-2" />
									</div>
								)
							}
						</div>
						<div className="flex items-center gap-3">
							<Button asChild variant={isCompleted ? "outline" : "default"}>
								<Link href={`/learn/${item.learn.slug}`}>
									{isCompleted ? "Review" : "Continue"}
									<ChevronRight className="ml-2 h-4 w-4" />
								</Link>
							</Button>
						</div>
					</div>
				</CardContent>
			</Card>
		</motion.div>
	);
}