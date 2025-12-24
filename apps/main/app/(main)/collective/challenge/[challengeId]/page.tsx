import { notFound } from "next/navigation";
import {
	Card, CardContent, CardDescription, CardHeader, CardTitle
} from "@repo/ui/components/ui/card";
import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import { Progress } from "@repo/ui/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/components/ui/avatar";
import { Separator } from "@repo/ui/components/ui/separator";
import {
	Trophy, Users, Calendar, Clock, ExternalLink, Star, Play, CheckCircle, ArrowLeft,
} from "lucide-react";
import { getChallengeDetails, getUserProgress } from "@/actions/(main)/collective/challenge.actions";
import { JoinChallengeButton } from "../../_components/join-challenge-button";
import { ChallengeStepCard } from "../../_components/challenge-step-card";
import { ChallengeLeaderboard } from "../../_components/challenge-leaderboard";
import { formatDistanceToNow, format } from "date-fns";
import Link from "next/link";

interface ChallengePageProps {
	params: Promise<{
		challengeId: string;
	}>;
}

export default async function ChallengePage({ params }: ChallengePageProps) {
	const { challengeId } = await params;
	const challenge = await getChallengeDetails(challengeId);
	const userProgress = await getUserProgress(challengeId);

	if (!challenge) {
		notFound();
	}

	const isActive = challenge.status === "ACTIVE";
	const hasStarted = challenge.startDate ? new Date() >= new Date(challenge.startDate) : true;
	const hasEnded = challenge.endDate ? new Date() > new Date(challenge.endDate) : false;
	const hasJoined = userProgress !== null;

	const daysLeft = challenge.endDate
		? Math.max(0, Math.ceil((new Date(challenge.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
		: null;

	const completionRate = hasJoined && userProgress && challenge.totalSteps > 0
		? (userProgress.completedSteps / challenge.totalSteps) * 100
		: 0;

	return (
		<div className="min-h-screen bg-gradient-to-br from-neutral-50 to-blue-50 dark:from-neutral-950 dark:to-blue-950/30">
			<div className="max-w-7xl mx-auto px-4 py-8">
				<div className="flex items-center gap-2 text-sm mb-6">
					<Link href="/communityhub" className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
						<ArrowLeft className="w-4 h-4" />
						Back to Collective
					</Link>
				</div>
				<div className="mb-8">
					<div className="flex items-start justify-between mb-4">
						<div className="flex items-center gap-3">
							{
								challenge.proposal?.proposer && (
									<>
										<Avatar className="w-12 h-12">
											<AvatarImage src={challenge.proposal.proposer.image || ""} />
											<AvatarFallback>
												{challenge.proposal.proposer.name?.charAt(0) || "C"}
											</AvatarFallback>
										</Avatar>
										<div>
											<h3 className="font-semibold">{challenge.proposal.proposer.name}</h3>
											<p className="text-sm text-muted-foreground">Challenge Creator</p>
										</div>
									</>
								)
							}
						</div>
						<div className="flex items-center gap-2">
							{
								isActive && hasStarted && !hasEnded ? (
									<Badge className="bg-green-100 text-green-800">
										<Play className="w-3 h-3 mr-1" />
										Live Challenge
									</Badge>
								) : hasEnded ? (
									<Badge variant="outline">
										<CheckCircle className="w-3 h-3 mr-1" />
										Completed
									</Badge>
								) : (
									<Badge variant="secondary">
										<Clock className="w-3 h-3 mr-1" />
										Coming Soon
									</Badge>
								)
							}
						</div>
					</div>
					<h1 className="text-3xl font-bold mb-4">{challenge.title}</h1>
					{
						hasJoined && (
							<div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
								<div className="flex items-center justify-between mb-2">
									<span className="font-medium text-blue-900">Your Progress</span>
									<span className="text-sm text-blue-700">
										{userProgress.completedSteps} / {challenge.totalSteps} steps
									</span>
								</div>
								<Progress value={completionRate} className="h-3 mb-2" />
								<div className="flex justify-between text-sm text-blue-700">
									<span>{Math.round(completionRate)}% Complete</span>
									<span>{userProgress.totalXpEarned} XP Earned</span>
								</div>
							</div>
						)
					}
				</div>
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					<div className="lg:col-span-2 space-y-6">
						<Card>
							<CardHeader>
								<CardTitle>Challenge Overview</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="prose prose-sm max-w-none">
									<p className="whitespace-pre-wrap">{challenge.description}</p>
								</div>
								{
									challenge.playlistUrl && (
										<div className="pt-4 border-t">
											<Link
												href={challenge.playlistUrl}
												target="_blank"
												rel="noopener noreferrer"
												className="inline-flex items-center gap-2 text-blue-600 hover:underline"
											>
												<ExternalLink className="w-4 h-4" />
												View Learning Resources
											</Link>
										</div>
									)
								}
							</CardContent>
						</Card>
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Trophy className="w-5 h-5" />
									Challenge Steps ({challenge.steps.length})
								</CardTitle>
								<CardDescription>
									Complete each step to progress through the challenge
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								{
									challenge.steps.length === 0 ? (
										<div className="text-center py-8">
											<Trophy className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
											<h3 className="text-lg font-semibold mb-2">Steps Coming Soon</h3>
											<p className="text-muted-foreground">
												The challenge steps are being prepared. Check back soon!
											</p>
										</div>
									) : (
										challenge.steps.map((step, index) => (
											<ChallengeStepCard
												key={step.id}
												step={step}
												stepNumber={index + 1}
												isUnlocked={hasJoined && (index === 0 || (userProgress.completedSteps > index))}
												isCompleted={hasJoined && userProgress.submissions.some(s => s.step.id === step.id && s.status === "APPROVED")}
												userProgress={userProgress}
											/>
										))
									)
								}
							</CardContent>
						</Card>
						<ChallengeLeaderboard challengeId={challengeId} />
					</div>
					<div className="space-y-6">
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Users className="w-5 h-5" />
									Participation
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								{
									!hasJoined ? (
										<JoinChallengeButton
											challengeId={challengeId}
											disabled={!isActive || !hasStarted || hasEnded}
										/>
									) : (
										<div className="space-y-3">
											<div className="flex justify-between text-sm">
												<span className="text-muted-foreground">Joined</span>
												<span>{formatDistanceToNow(new Date(userProgress.joinedAt), { addSuffix: true })}</span>
											</div>
											<div className="flex justify-between text-sm">
												<span className="text-muted-foreground">Current Step</span>
												<span className="font-medium">Step {userProgress.currentStep}</span>
											</div>
											<div className="flex justify-between text-sm">
												<span className="text-muted-foreground">XP Earned</span>
												<span className="font-medium text-blue-600">{userProgress.totalXpEarned}</span>
											</div>
										</div>
									)
								}

								<Separator />

								<div className="space-y-2">
									<div className="flex justify-between text-sm">
										<span className="text-muted-foreground">Total Participants</span>
										<span className="font-medium">{challenge.participations?.length || 0}</span>
									</div>
								</div>
							</CardContent>
						</Card>
						{
							challenge.startDate && challenge.endDate && (
								<Card>
									<CardHeader>
										<CardTitle className="flex items-center gap-2">
											<Calendar className="w-5 h-5" />
											Timeline
										</CardTitle>
									</CardHeader>
									<CardContent className="space-y-3">
										<div className="flex justify-between text-sm">
											<span className="text-muted-foreground">Start Date</span>
											<span>{format(new Date(challenge.startDate), "MMM d, yyyy")}</span>
										</div>
										<div className="flex justify-between text-sm">
											<span className="text-muted-foreground">End Date</span>
											<span>{format(new Date(challenge.endDate), "MMM d, yyyy")}</span>
										</div>
										{
											daysLeft !== null && daysLeft > 0 && (
												<div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mt-3">
													<p className="text-sm text-orange-800 font-medium">
														<Clock className="w-4 h-4 inline mr-1" />
														{daysLeft} days remaining
													</p>
												</div>
											)
										}
									</CardContent>
								</Card>
							)
						}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Star className="w-5 h-5 text-yellow-500" />
									Rewards
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-3">
								{
									challenge.xpReward > 0 && (
										<div className="flex justify-between items-center">
											<span className="text-sm text-muted-foreground">XP Reward</span>
											<span className="font-semibold text-blue-600">{challenge.xpReward} XP</span>
										</div>
									)
								}
								{
									challenge.creditReward > 0 && (
										<div className="flex justify-between items-center">
											<span className="text-sm text-muted-foreground">Credit Reward</span>
											<span className="font-semibold text-green-600">{challenge.creditReward} Credits</span>
										</div>
									)
								}
								{
									challenge.badgeId && (
										<div className="flex justify-between items-center">
											<span className="text-sm text-muted-foreground">Badge</span>
											<Badge variant="secondary">Special Badge</Badge>
										</div>
									)
								}
							</CardContent>
						</Card>
						<Card>
							<CardHeader>
								<CardTitle>Challenge Stats</CardTitle>
							</CardHeader>
							<CardContent className="space-y-3">
								<div className="flex justify-between text-sm">
									<span className="text-muted-foreground">Total Steps</span>
									<span className="font-medium">{challenge.totalSteps}</span>
								</div>
								<div className="flex justify-between text-sm">
									<span className="text-muted-foreground">Completion Rate</span>
									<span className="font-medium">
										{challenge.participations?.length > 0
											? Math.round((challenge.participations.filter(p => p.completedAt).length / challenge.participations.length) * 100)
											: 0}%
									</span>
								</div>
								<div className="flex justify-between text-sm">
									<span className="text-muted-foreground">Created</span>
									<span>{formatDistanceToNow(new Date(challenge.createdAt), { addSuffix: true })}</span>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</div>
	);
}