"use client";

import { motion } from "framer-motion";
import {
	Card, CardContent, CardHeader, CardTitle
} from "@repo/ui/components/ui/card";
import { Button } from "@repo/ui/components/ui/button";
import { Badge } from "@repo/ui/components/ui/badge";
import { Progress } from "@repo/ui/components/ui/progress";
import {
	FolderKanban, ExternalLink, GitBranch, Star, Clock, ArrowRight, Plus,
	Pin, Activity, BookOpen, Trophy, TrendingUp
} from "lucide-react";
import { cn } from "@repo/ui/lib/utils";
import Link from "next/link";
import Image from "next/image";

interface OverviewTabProps {
	user: {
		id: string;
		name: string | null;
		bio: string | null;
		currentLevel: number;
		currentXp: number;
		totalXp: number;
		userProfile?: {
			pinnedProjects: Array<{
				id: string;
				order: number;
				project: {
					id: string;
					name: string;
					description: string;
					category: string;
					difficulty: string;
					tags: string[];
				};
			}>;
		} | null;
		recentActivity: Array<{
			id: string;
			activityType: string | null;
			description: string | null;
			createdAt: Date;
		}>;
		achievements: Array<{
			id: string;
			title: string;
			description: string;
			createdAt: Date;
		}>;
	};
	stats: {
		projectsCount: number;
		skillsCount: number;
		level: number;
		xp: number;
	};
	isOwnProfile: boolean;
	onPinProject?: () => void;
}

// Activity type icons and colors
const activityConfig: Record<string, { icon: string; color: string }> = {
	PROJECT_COMPLETED: { icon: "🏆", color: "text-yellow-500" },
	LESSON_COMPLETED: { icon: "📚", color: "text-blue-500" },
	SKILL_ADDED: { icon: "⚡", color: "text-purple-500" },
	ACHIEVEMENT_UNLOCKED: { icon: "🎖️", color: "text-green-500" },
	QUIZ_COMPLETED: { icon: "✅", color: "text-teal-500" },
	FEEDBACK_SUBMITTED: { icon: "💬", color: "text-orange-500" },
	DEFAULT: { icon: "📌", color: "text-gray-500" },
};

export function OverviewTab({
	user,
	stats,
	isOwnProfile,
	onPinProject,
}: OverviewTabProps) {
	const pinnedProjects = user.userProfile?.pinnedProjects || [];
	const recentActivity = user.recentActivity || [];
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
				transition={{ delay: 0.1 }}
			>
				<Card>
					<CardHeader className="pb-2">
						<div className="flex items-center justify-between">
							<CardTitle className="text-lg flex items-center gap-2">
								<Pin className="w-5 h-5 text-primary" />
								Pinned Projects
							</CardTitle>
							{
								isOwnProfile && pinnedProjects.length < 6 && (
									<Button variant="ghost" size="sm" onClick={onPinProject}>
										<Plus className="w-4 h-4 mr-1" />
										Add
									</Button>
								)
							}
						</div>
					</CardHeader>
					<CardContent>
						{
							pinnedProjects.length > 0 ? (
								<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
									{
										pinnedProjects.map((pinned, index) => (
											<motion.div
												key={pinned.id}
												initial={{ opacity: 0, scale: 0.95 }}
												animate={{ opacity: 1, scale: 1 }}
												transition={{ delay: index * 0.05 }}
											>
												<Link href={`/projects/${pinned.project.id}`}>
													<Card className="h-full hover:shadow-md transition-shadow cursor-pointer group">
														<CardContent className="p-4">
															<div className="flex items-start justify-between mb-2">
																<FolderKanban className="w-5 h-5 text-primary flex-shrink-0" />
																<Badge variant="secondary" className="text-xs">
																	{pinned.project.difficulty}
																</Badge>
															</div>
															<h4 className="font-medium text-sm mb-1 group-hover:text-primary transition-colors line-clamp-1">
																{pinned.project.name}
															</h4>
															<p className="text-xs text-muted-foreground line-clamp-2 mb-3">
																{pinned.project.description}
															</p>
															<div className="flex flex-wrap gap-1">
																{
																	pinned.project.tags.slice(0, 3).map((tag) => (
																		<Badge
																			key={tag}
																			variant="outline"
																			className="text-xs px-1.5 py-0"
																		>
																			{tag}
																		</Badge>
																	))
																}
															</div>
														</CardContent>
													</Card>
												</Link>
											</motion.div>
										))
									}
								</div>
							) : (
								<div className="text-center py-8 text-muted-foreground">
									<FolderKanban className="w-12 h-12 mx-auto mb-3 opacity-30" />
									<p className="text-sm">No pinned projects yet</p>
									{
										isOwnProfile && (
											<Button
												variant="outline"
												size="sm"
												className="mt-3"
												onClick={onPinProject}
											>
												<Plus className="w-4 h-4 mr-1" />
												Pin your first project
											</Button>
										)
									}
								</div>
							)
						}
					</CardContent>
				</Card>
			</motion.div>
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.15 }}
				>
					<Card className="h-full">
						<CardHeader className="pb-2">
							<div className="flex items-center justify-between">
								<CardTitle className="text-lg flex items-center gap-2">
									<Activity className="w-5 h-5 text-green-500" />
									Recent Activity
								</CardTitle>
								<Link href="/profile?tab=activity">
									<Button variant="ghost" size="sm">
										View all <ArrowRight className="w-4 h-4 ml-1" />
									</Button>
								</Link>
							</div>
						</CardHeader>
						<CardContent>
							{
								recentActivity.length > 0 ? (
									<div className="space-y-3">
										{
											recentActivity.slice(0, 5).map((activity) => {
												const config =
													activityConfig[activity.activityType || "DEFAULT"] ||
													activityConfig.DEFAULT;
												return (
													<div
														key={activity.id}
														className="flex items-start gap-3 text-sm"
													>
														<span className="text-lg flex-shrink-0">{config.icon}</span>
														<div className="flex-1 min-w-0">
															<p className="text-foreground line-clamp-1">
																{activity.description || activity.activityType}
															</p>
															<p className="text-xs text-muted-foreground">
																{
																	new Date(activity.createdAt).toLocaleDateString("en-US", {
																		month: "short",
																		day: "numeric",
																	})
																}
															</p>
														</div>
													</div>
												);
											})
										}
									</div>
								) : (
									<div className="text-center py-6 text-muted-foreground">
										<Activity className="w-10 h-10 mx-auto mb-2 opacity-30" />
										<p className="text-sm">No recent activity</p>
									</div>
								)
							}
						</CardContent>
					</Card>
				</motion.div>
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.2 }}
				>
					<Card className="h-full">
						<CardHeader className="pb-2">
							<div className="flex items-center justify-between">
								<CardTitle className="text-lg flex items-center gap-2">
									<Trophy className="w-5 h-5 text-yellow-500" />
									Achievements
								</CardTitle>
								<Link href="/profile?tab=about">
									<Button variant="ghost" size="sm">
										View all <ArrowRight className="w-4 h-4 ml-1" />
									</Button>
								</Link>
							</div>
						</CardHeader>
						<CardContent>
							{
								recentAchievements.length > 0 ? (
									<div className="space-y-3">
										{
											recentAchievements.map((achievement) => (
												<div
													key={achievement.id}
													className="flex items-start gap-3 p-2 rounded-lg bg-muted/50"
												>
													<div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-500/20 to-amber-500/20 flex items-center justify-center flex-shrink-0">
														<Trophy className="w-5 h-5 text-yellow-500" />
													</div>
													<div className="flex-1 min-w-0">
														<p className="font-medium text-sm line-clamp-1">
															{achievement.title}
														</p>
														<p className="text-xs text-muted-foreground line-clamp-1">
															{achievement.description}
														</p>
													</div>
												</div>
											))
										}
									</div>
								) : (
									<div className="text-center py-6 text-muted-foreground">
										<Trophy className="w-10 h-10 mx-auto mb-2 opacity-30" />
										<p className="text-sm">No achievements yet</p>
										{
											isOwnProfile && (
												<p className="text-xs mt-1">
													Complete projects to unlock achievements!
												</p>
											)
										}
									</div>
								)
							}
						</CardContent>
					</Card>
				</motion.div>
			</div>
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