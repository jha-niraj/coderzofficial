"use client";

import { motion } from "framer-motion";
import {
	Card, CardContent
} from "@/components/ui/card";
import {
	CheckCircle, Clock, Flame, BookOpen, Zap
} from "lucide-react";

interface ProgressStatsProps {
	stats: {
		completedCount: number;
		inProgressCount: number;
		totalConcepts: number;
		currentStreak: number;
	};
}

export function ProgressStats({ stats }: ProgressStatsProps) {
	const statCards = [
		{
			label: "Completed",
			value: stats.completedCount,
			icon: CheckCircle,
			color: "text-emerald-500",
			bgColor: "bg-emerald-500/10",
			delay: 0,
		},
		{
			label: "In Progress",
			value: stats.inProgressCount,
			icon: Clock,
			color: "text-amber-500",
			bgColor: "bg-amber-500/10",
			delay: 0.1,
		},
		{
			label: "Total Started",
			value: stats.totalConcepts,
			icon: BookOpen,
			color: "text-blue-500",
			bgColor: "bg-blue-500/10",
			delay: 0.2,
		},
		{
			label: "Day Streak",
			value: stats.currentStreak,
			icon: Flame,
			color: "text-orange-500",
			bgColor: "bg-orange-500/10",
			delay: 0.3,
		},
	];

	return (
		<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
			{
				statCards.map((stat, index) => (
					<motion.div
						key={stat.label}
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.4, delay: stat.delay }}
					>
						<Card className="relative overflow-hidden">
							<CardContent className="pt-6">
								<div className="flex items-center justify-between mb-3">
									<div className={`h-10 w-10 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
										<stat.icon className={`h-5 w-5 ${stat.color}`} />
									</div>
									{
										stat.label === "Day Streak" && stats.currentStreak > 0 && (
											<Zap className="h-5 w-5 text-yellow-500 animate-pulse" />
										)
									}
								</div>
								<div className="space-y-1">
									<p className="text-3xl font-bold">{stat.value}</p>
									<p className="text-sm text-muted-foreground">{stat.label}</p>
								</div>
							</CardContent>
						</Card>
					</motion.div>
				))
			}
		</div>
	);
}