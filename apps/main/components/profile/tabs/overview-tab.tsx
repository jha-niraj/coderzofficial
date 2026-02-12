"use client";

import { motion } from "framer-motion";
import {
	Card, CardContent, CardHeader, CardTitle
} from "@repo/ui/components/ui/card";
import { Button } from "@repo/ui/components/ui/button";
import { Badge } from "@repo/ui/components/ui/badge";
import { Progress } from "@repo/ui/components/ui/progress";
import {
	FolderKanban, ArrowRight, Trophy, TrendingUp, 
	Globe, CheckCircle2, Clock3, Star
} from "lucide-react";
import Link from "next/link";

interface PortfolioProject {
	id: string;
	projectName: string;
	projectType: string;
	description: string | null;
	status: string;
	visibility: string;
	technologies: string[];
	startDate: Date;
	endDate: Date | null;
	thumbnailUrl: string | null;
}

interface OverviewTabProps {
	user: {
		id: string;
		name: string | null;
		bio: string | null;
		currentLevel: number;
		currentXp: number;
		totalXp: number;
		portfolioProjects?: PortfolioProject[];
		achievements: Array<{	
			id: string;
			title: string;
			description: string;
			createdAt?: Date | null;
		} | null>;
	};
	stats: {
		projectsCount: number;
		skillsCount: number;
		level: number;
		xp: number;
	};
	isOwnProfile: boolean;
}

export function OverviewTab({
	user,
	stats,
	isOwnProfile,
}: OverviewTabProps) {
	// Get featured projects (public, completed first, max 6)
	const featuredProjects = (user.portfolioProjects || [])
		.filter(p => p.visibility === "PUBLIC" || isOwnProfile)
		.sort((a, b) => {
			if (a.status === "COMPLETED" && b.status !== "COMPLETED") return -1;
			if (a.status !== "COMPLETED" && b.status === "COMPLETED") return 1;
			return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
		})
		.slice(0, 6);

	const recentAchievements = user.achievements?.slice(0, 3) || [];

	// Calculate XP progress to next level
	const xpToNextLevel = (user.currentLevel + 1) * 1000;
	const xpProgress = Math.min((user.currentXp / xpToNextLevel) * 100, 100);

	return (
		<div className="space-y-6">
			{
				user.bio && (
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
					>
						<Card>
							<CardContent className="py-4">
								<p className="text-muted-foreground">{user.bio}</p>
							</CardContent>
						</Card>
					</motion.div>
				)
			}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.05 }}
			>
				<Card className="overflow-hidden">
					<div className="bg-gradient-to-r from-yellow-500/10 via-amber-500/10 to-orange-500/10 p-4">
						<div className="flex items-center justify-between mb-2">
							<div className="flex items-center gap-2">
								<TrendingUp className="w-5 h-5 text-yellow-500" />
								<span className="font-medium">Level {user.currentLevel}</span>
							</div>
							<span className="text-sm text-muted-foreground">
								{user.currentXp.toLocaleString()} / {xpToNextLevel.toLocaleString()} XP
							</span>
						</div>
						<Progress value={xpProgress} className="h-2" />
						<p className="text-xs text-muted-foreground mt-2">
							{(xpToNextLevel - user.currentXp).toLocaleString()} XP to Level {user.currentLevel + 1}
						</p>
					</div>
				</Card>
			</motion.div>
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.25 }}
			>
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-lg">Quick Stats</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
							<div className="text-center p-4 rounded-lg bg-muted/50">
								<FolderKanban className="w-6 h-6 mx-auto mb-2 text-blue-500" />
								<p className="text-2xl font-bold">{stats.projectsCount}</p>
								<p className="text-xs text-muted-foreground">Projects</p>
							</div>
							<div className="text-center p-4 rounded-lg bg-muted/50">
								<Star className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
								<p className="text-2xl font-bold">{stats.skillsCount}</p>
								<p className="text-xs text-muted-foreground">Skills</p>
							</div>
							<div className="text-center p-4 rounded-lg bg-muted/50">
								<TrendingUp className="w-6 h-6 mx-auto mb-2 text-green-500" />
								<p className="text-2xl font-bold">{stats.level}</p>
								<p className="text-xs text-muted-foreground">Level</p>
							</div>
							<div className="text-center p-4 rounded-lg bg-muted/50">
								<Trophy className="w-6 h-6 mx-auto mb-2 text-purple-500" />
								<p className="text-2xl font-bold">{user.achievements?.length || 0}</p>
								<p className="text-xs text-muted-foreground">Achievements</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</motion.div>
		</div>
	);
}