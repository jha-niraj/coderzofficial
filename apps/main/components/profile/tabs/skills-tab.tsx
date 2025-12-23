"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
	Card, CardContent, CardHeader, CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
	Code2, Database, Server, Cloud, Wrench, Globe, Plus, ThumbsUp, Users,
	Check, Search
} from "lucide-react";
import { cn } from "../../lib/utils";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import Link from "next/link";

interface SkillsTabProps {
	user: {
		id: string;
		skills: Array<{
			id: string;
			name: string;
			level: string;
			category: string;
			endorsements?: Array<{
				id: string;
				endorserId: string;
				message?: string | null;
			}>;
		}>;
		certifications?: Array<{
			id: string;
			name: string;
			issuer: string;
			issuedDate: Date;
			link: string;
		}>;
	};
	isOwnProfile: boolean;
	currentUserId?: string;
	onEndorseSkill?: (skillId: string) => Promise<void>;
	onAddSkill?: () => void;
}

// Category icons and colors
const categoryConfig: Record<
	string,
	{ icon: React.ComponentType<{ className?: string }>; color: string }
> = {
	FRONTEND: { icon: Globe, color: "text-blue-500 bg-blue-500/10" },
	LANGUAGES: { icon: Code2, color: "text-purple-500 bg-purple-500/10" },
	BACKEND: { icon: Server, color: "text-green-500 bg-green-500/10" },
	API: { icon: Wrench, color: "text-orange-500 bg-orange-500/10" },
	DATABASE: { icon: Database, color: "text-red-500 bg-red-500/10" },
	DEVOPS: { icon: Wrench, color: "text-yellow-500 bg-yellow-500/10" },
	CLOUD: { icon: Cloud, color: "text-cyan-500 bg-cyan-500/10" },
};

// Level to percentage
const levelToPercent = (level: string): number => {
	const levelMap: Record<string, number> = {
		"1": 20,
		"2": 40,
		"3": 60,
		"4": 80,
		"5": 100,
		beginner: 25,
		intermediate: 50,
		advanced: 75,
		expert: 100,
	};
	return levelMap[level.toLowerCase()] || 50;
};

export function SkillsTab({
	user,
	isOwnProfile,
	currentUserId,
	onEndorseSkill,
	onAddSkill,
}: SkillsTabProps) {
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
	const [endorsingSkillId, setEndorsingSkillId] = useState<string | null>(null);

	// Group skills by category
	const skillsByCategory = user.skills.reduce((acc, skill) => {
		const category = skill.category || "OTHER";
		if (!acc[category]) acc[category] = [];
		acc[category].push(skill);
		return acc;
	}, {} as Record<string, typeof user.skills>);

	// Filter skills
	const filteredCategories = Object.entries(skillsByCategory).filter(
		([category, skills]) => {
			if (selectedCategory && category !== selectedCategory) return false;
			if (searchQuery) {
				return skills.some((s) =>
					s.name.toLowerCase().includes(searchQuery.toLowerCase())
				);
			}
			return true;
		}
	);

	// All categories
	const allCategories = Object.keys(skillsByCategory);

	const handleEndorse = async (skillId: string) => {
		if (!onEndorseSkill) return;
		setEndorsingSkillId(skillId);
		try {
			await onEndorseSkill(skillId);
			toast.success("Skill endorsed!");
		} catch {
			toast.error("Failed to endorse skill");
		} finally {
			setEndorsingSkillId(null);
		}
	};

	return (
		<div className="space-y-6">
			<Card>
				<CardContent className="py-4">
					<div className="flex flex-col sm:flex-row gap-4">
						<div className="relative flex-1">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
							<Input
								placeholder="Search skills..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="pl-9"
							/>
						</div>
						<div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
							<Button
								variant={selectedCategory === null ? "default" : "outline"}
								size="sm"
								onClick={() => setSelectedCategory(null)}
							>
								All
							</Button>
							{
								allCategories.map((category) => {
									const config = categoryConfig[category] || {
										icon: Code2,
										color: "text-gray-500 bg-gray-500/10",
									};
									const Icon = config.icon;
									return (
										<Button
											key={category}
											variant={selectedCategory === category ? "default" : "outline"}
											size="sm"
											onClick={() =>
												setSelectedCategory(
													selectedCategory === category ? null : category
												)
											}
											className="gap-1.5 whitespace-nowrap"
										>
											<Icon className="w-4 h-4" />
											{category.charAt(0) + category.slice(1).toLowerCase()}
										</Button>
									);
								})
							}
						</div>
					</div>
				</CardContent>
			</Card>
			{
				filteredCategories.length > 0 ? (
					<div className="space-y-6">
						{
							filteredCategories.map(([category, skills], categoryIndex) => {
								const config = categoryConfig[category] || {
									icon: Code2,
									color: "text-gray-500 bg-gray-500/10",
								};
								const Icon = config.icon;
								const filteredSkills = searchQuery
									? skills.filter((s) =>
										s.name.toLowerCase().includes(searchQuery.toLowerCase())
									)
									: skills;

								if (filteredSkills.length === 0) return null;

								return (
									<motion.div
										key={category}
										initial={{ opacity: 0, y: 20 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ delay: categoryIndex * 0.1 }}
									>
										<Card>
											<CardHeader className="pb-2">
												<CardTitle className="text-lg flex items-center gap-2">
													<div className={cn("p-2 rounded-lg", config.color.split(" ")[1])}>
														<Icon className={cn("w-5 h-5", config.color.split(" ")[0])} />
													</div>
													{category.charAt(0) + category.slice(1).toLowerCase()}
													<Badge variant="secondary" className="ml-2">
														{filteredSkills.length} skills
													</Badge>
												</CardTitle>
											</CardHeader>
											<CardContent>
												<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
													{
														filteredSkills.map((skill, skillIndex) => {
															const hasEndorsed = skill.endorsements?.some(
																(e) => e.endorserId === currentUserId
															);
															const endorsementCount = skill.endorsements?.length || 0;

															return (
																<motion.div
																	key={skill.id}
																	initial={{ opacity: 0, scale: 0.95 }}
																	animate={{ opacity: 1, scale: 1 }}
																	transition={{ delay: skillIndex * 0.05 }}
																	className="p-4 rounded-lg border bg-card hover:shadow-sm transition-shadow"
																>
																	<div className="flex items-start justify-between mb-2">
																		<div>
																			<h4 className="font-medium">{skill.name}</h4>
																			<p className="text-xs text-muted-foreground">
																				Level {skill.level}
																			</p>
																		</div>
																		{
																			!isOwnProfile && currentUserId && (
																				<Button
																					variant={hasEndorsed ? "secondary" : "outline"}
																					size="sm"
																					onClick={() => handleEndorse(skill.id)}
																					disabled={hasEndorsed || endorsingSkillId === skill.id}
																					className="gap-1"
																				>
																					{
																						hasEndorsed ? (
																							<>
																								<Check className="w-4 h-4" />
																								Endorsed
																							</>
																						) : (
																							<>
																								<ThumbsUp className="w-4 h-4" />
																								Endorse
																							</>
																						)
																					}
																				</Button>
																			)
																		}
																	</div>
																	<Progress
																		value={levelToPercent(skill.level)}
																		className="h-1.5 mb-2"
																	/>

																	{
																		endorsementCount > 0 && (
																			<div className="flex items-center gap-1 text-xs text-muted-foreground">
																				<Users className="w-3 h-3" />
																				{endorsementCount} endorsement
																				{endorsementCount > 1 ? "s" : ""}
																			</div>
																		)
																	}
																</motion.div>
															);
														})
													}
												</div>
											</CardContent>
										</Card>
									</motion.div>
								);
							})
						}
					</div>
				) : (
					<Card>
						<CardContent className="py-12 text-center">
							<Code2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-30" />
							<h3 className="font-medium mb-2">No skills found</h3>
							<p className="text-sm text-muted-foreground mb-4">
								{
									searchQuery
										? "Try a different search term"
										: "No skills have been added yet"
								}
							</p>
							{
								isOwnProfile && !searchQuery && (
									<Button onClick={onAddSkill}>
										<Plus className="w-4 h-4 mr-2" />
										Add your first skill
									</Button>
								)
							}
						</CardContent>
					</Card>
				)
			}
			{
				user.certifications && user.certifications.length > 0 && (
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.3 }}
					>
						<Card>
							<CardHeader className="pb-2">
								<CardTitle className="text-lg">Certifications</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									{
										user.certifications.map((cert) => (
											<Link
												key={cert.id}
												href={cert.link}
												target="_blank"
												rel="noopener noreferrer"
												className="flex items-center gap-3 p-4 rounded-lg border hover:shadow-sm transition-shadow"
											>
												<div className="w-12 h-12 rounded-lg bg-gradient-to-br from-yellow-500/20 to-amber-500/20 flex items-center justify-center">
													🏅
												</div>
												<div className="flex-1 min-w-0">
													<h4 className="font-medium line-clamp-1">{cert.name}</h4>
													<p className="text-sm text-muted-foreground">
														{cert.issuer} •{" "}
														{
															new Date(cert.issuedDate).toLocaleDateString("en-US", {
																month: "short",
																year: "numeric",
															})
														}
													</p>
												</div>
											</Link>
										))
									}
								</div>
							</CardContent>
						</Card>
					</motion.div>
				)
			}
			{
				isOwnProfile && (
					<div className="flex justify-center">
						<Button variant="outline" onClick={onAddSkill} className="gap-2">
							<Plus className="w-4 h-4" />
							Add New Skill
						</Button>
					</div>
				)
			}
		</div>
	);
}