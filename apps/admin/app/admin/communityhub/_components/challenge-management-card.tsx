"use client";

import { useState } from "react";
import {
	Card, CardContent, CardDescription, CardHeader, CardTitle
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
	Trophy, Users, Calendar, Settings, Play, Pause, BarChart3, Plus, CheckCircle
} from "lucide-react";
import { publishChallenge } from "@/actions/(main)/collective/admin.actions";
import { formatDistanceToNow, format } from "date-fns";
import Link from "next/link";
import { toast } from "sonner";

interface ChallengeManagementCardProps {
	challenge: {
		id: string;
		title: string;
		description: string;
		status: string;
		startDate?: Date | null;
		endDate?: Date | null;
		totalSteps: number;
		xpReward: number;
		creditReward: number;
		createdAt: Date;
		proposal?: {
			proposer: {
				id: string;
				name: string | null;
				image: string | null;
			};
		} | null;
		steps: Array<{
			id: string;
			stepNumber: number;
			title: string;
			type: string;
		}>;
		_count: {
			participations: number;
			steps: number;
		};
	};
}

export function ChallengeManagementCard({ challenge }: ChallengeManagementCardProps) {
	const [isProcessing, setIsProcessing] = useState(false);

	const handlePublish = async () => {
		if (challenge.totalSteps === 0) {
			toast.error("Please add at least one step before publishing");
			return;
		}

		setIsProcessing(true);
		try {
			await publishChallenge(challenge.id);
			toast.success("Challenge published successfully!");
		} catch (error) {
			toast.error("Failed to publish challenge");
		} finally {
			setIsProcessing(false);
		}
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case "ACTIVE": return "bg-green-100 text-green-800";
			case "DRAFT": return "bg-yellow-100 text-yellow-800";
			case "COMPLETED": return "bg-blue-100 text-blue-800";
			case "ARCHIVED": return "bg-gray-100 text-gray-800";
			default: return "bg-gray-100 text-gray-800";
		}
	};

	const getStatusIcon = (status: string) => {
		switch (status) {
			case "ACTIVE": return <Play className="w-3 h-3" />;
			case "DRAFT": return <Settings className="w-3 h-3" />;
			case "COMPLETED": return <CheckCircle className="w-3 h-3" />;
			case "ARCHIVED": return <Pause className="w-3 h-3" />;
			default: return <Settings className="w-3 h-3" />;
		}
	};

	const isActive = challenge.status === "ACTIVE";
	const isDraft = challenge.status === "DRAFT";
	const hasStarted = challenge.startDate ? new Date() >= new Date(challenge.startDate) : false;
	const hasEnded = challenge.endDate ? new Date() > new Date(challenge.endDate) : false;

	return (
		<Card className={`border-l-4 ${isActive ? "border-l-green-500" :
			isDraft ? "border-l-yellow-500" :
				"border-l-gray-500"
			}`}>
			<CardHeader className="space-y-3">
				<div className="flex items-start justify-between">
					<div className="flex items-center gap-3">
						{
							challenge.proposal?.proposer && (
								<>
									<Avatar className="w-10 h-10">
										<AvatarImage src={challenge.proposal.proposer.image || ""} />
										<AvatarFallback>
											{challenge.proposal.proposer.name?.charAt(0) || "C"}
										</AvatarFallback>
									</Avatar>
									<div>
										<p className="font-medium">{challenge.proposal.proposer.name}</p>
										<p className="text-sm text-muted-foreground">Original Proposer</p>
									</div>
								</>
							)
						}
					</div>
					<Badge className={getStatusColor(challenge.status)}>
						{getStatusIcon(challenge.status)}
						{challenge.status}
					</Badge>
				</div>
				<div>
					<CardTitle className="text-lg">{challenge.title}</CardTitle>
					<CardDescription className="mt-2 line-clamp-2">
						{challenge.description}
					</CardDescription>
				</div>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="grid grid-cols-3 gap-4 text-center">
					<div>
						<div className="flex items-center justify-center gap-1">
							<Users className="w-4 h-4 text-muted-foreground" />
							<span className="font-semibold">{challenge._count.participations}</span>
						</div>
						<p className="text-xs text-muted-foreground mt-1">Participants</p>
					</div>
					<div>
						<div className="flex items-center justify-center gap-1">
							<Calendar className="w-4 h-4 text-muted-foreground" />
							<span className="font-semibold">{challenge.totalSteps}</span>
						</div>
						<p className="text-xs text-muted-foreground mt-1">Steps</p>
					</div>
					<div>
						<div className="flex items-center justify-center gap-1">
							<Trophy className="w-4 h-4 text-muted-foreground" />
							<span className="font-semibold">{challenge.xpReward}</span>
						</div>
						<p className="text-xs text-muted-foreground mt-1">XP Reward</p>
					</div>
				</div>
				{
					challenge.startDate && challenge.endDate && (
						<div className="space-y-2">
							<div className="flex justify-between text-sm">
								<span className="text-muted-foreground">Timeline</span>
								{
									isActive && !hasEnded && (
										<span className="text-green-600 font-medium">
											{Math.ceil((new Date(challenge.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days left
										</span>
									)
								}
							</div>
							<div className="text-xs text-muted-foreground">
								{format(new Date(challenge.startDate), "MMM d")} - {format(new Date(challenge.endDate), "MMM d, yyyy")}
							</div>
							{
								isActive && (
									<div className="space-y-1">
										<Progress
											value={hasEnded ? 100 : hasStarted ?
												((new Date().getTime() - new Date(challenge.startDate).getTime()) /
													(new Date(challenge.endDate).getTime() - new Date(challenge.startDate).getTime())) * 100 : 0
											}
											className="h-2"
										/>
									</div>
								)
							}
						</div>
					)
				}
				{
					challenge.steps.length > 0 && (
						<div className="space-y-2">
							<div className="flex justify-between items-center">
								<span className="text-sm font-medium">Challenge Steps</span>
								<span className="text-xs text-muted-foreground">
									{challenge.steps.length} configured
								</span>
							</div>
							<div className="flex flex-wrap gap-1">
								{
									challenge.steps.slice(0, 3).map((step) => (
										<Badge key={step.id} variant="outline" className="text-xs">
											{step.stepNumber}. {step.type}
										</Badge>
									))
								}
								{
									challenge.steps.length > 3 && (
										<Badge variant="outline" className="text-xs">
											+{challenge.steps.length - 3} more
										</Badge>
									)
								}
							</div>
						</div>
					)
				}
				<div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-3">
					<div className="flex items-center justify-between">
						<span className="text-sm font-medium text-yellow-800">Completion Rewards</span>
						<div className="flex items-center gap-3 text-sm">
							{
								challenge.xpReward > 0 && (
									<span className="text-blue-600 font-medium">
										{challenge.xpReward} XP
									</span>
								)
							}
							{
								challenge.creditReward > 0 && (
									<span className="text-green-600 font-medium">
										{challenge.creditReward} Credits
									</span>
								)
							}
						</div>
					</div>
				</div>
				<div className="flex gap-2">
					{
						isDraft && (
							<>
								<Button
									asChild
									variant="outline"
									size="sm"
									className="flex-1"
								>
									<Link href={`/admin/communityhub/challenge/${challenge.id}/steps`}>
										<Plus className="w-4 h-4 mr-2" />
										Add Steps
									</Link>
								</Button>
								<Button
									onClick={handlePublish}
									size="sm"
									disabled={isProcessing || challenge.totalSteps === 0}
									className="flex-1 bg-green-600 hover:bg-green-700"
								>
									<Play className="w-4 h-4 mr-2" />
									Publish
								</Button>
							</>
						)
					}
					{
						isActive && (
							<>
								<Button
									asChild
									variant="outline"
									size="sm"
									className="flex-1"
								>
									<Link href={`/admin/communityhub/challenge/${challenge.id}/analytics`}>
										<BarChart3 className="w-4 h-4 mr-2" />
										Analytics
									</Link>
								</Button>
								<Button
									asChild
									size="sm"
									className="flex-1"
								>
									<Link href={`/admin/communityhub/challenge/${challenge.id}/manage`}>
										<Settings className="w-4 h-4 mr-2" />
										Manage
									</Link>
								</Button>
							</>
						)
					}
				</div>
				{
					isDraft && challenge.totalSteps === 0 && (
						<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
							<p className="text-sm text-yellow-800">
								⚠️ Add challenge steps before publishing
							</p>
						</div>
					)
				}
			</CardContent>
		</Card>
	);
}