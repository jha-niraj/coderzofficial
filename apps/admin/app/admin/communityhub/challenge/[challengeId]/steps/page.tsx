import { notFound } from "next/navigation";
import {
	Card, CardContent, CardHeader, CardTitle
} from "@repo/ui/components/ui/card";
import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import { Plus, ArrowLeft, Settings } from "lucide-react";
import { getChallengeById } from "@/actions/collective.action";
import { AddStepDialog } from "../_components/add-step-dialog";
import { StepManagementCard } from "../_components/step-management-card";
import Link from "next/link";

interface ChallengeStepsPageProps {
	params: Promise<{
		challengeId: string;
	}>;
}

export default async function ChallengeStepsPage({ params }: ChallengeStepsPageProps) {
	const { challengeId } = await params;
	const challenge = await getChallengeById(challengeId);

	if (!challenge) {
		notFound();
	}

	return (
		<div className="container mx-auto px-4 py-8 max-w-4xl">
			<div className="flex items-center gap-4 mb-6">
				<Button variant="outline" size="sm" asChild>
					<Link href="/admin/communityhub">
						<ArrowLeft className="w-4 h-4 mr-2" />
						Back to Admin
					</Link>
				</Button>
				<div className="flex-1">
					<h1 className="text-2xl font-bold">{challenge.title}</h1>
					<p className="text-muted-foreground">Manage challenge steps</p>
				</div>
				<AddStepDialog challengeId={challenge.id} nextStepNumber={challenge.steps.length + 1}>
					<Button>
						<Plus className="w-4 h-4 mr-2" />
						Add Step
					</Button>
				</AddStepDialog>
			</div>
			<Card className="mb-6">
				<CardHeader>
					<div className="flex items-center justify-between">
						<CardTitle className="flex items-center gap-2">
							<Settings className="w-5 h-5" />
							Challenge Overview
						</CardTitle>
						<Badge variant={challenge.status === "ACTIVE" ? "default" : "secondary"}>
							{challenge.status}
						</Badge>
					</div>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
						<div>
							<span className="text-muted-foreground">Total Steps</span>
							<p className="font-semibold">{challenge.totalSteps}</p>
						</div>
						<div>
							<span className="text-muted-foreground">Participants</span>
							<p className="font-semibold">{challenge.participations?.length || 0}</p>
						</div>
						<div>
							<span className="text-muted-foreground">XP Reward</span>
							<p className="font-semibold text-blue-600">{challenge.xpReward}</p>
						</div>
						<div>
							<span className="text-muted-foreground">Credits</span>
							<p className="font-semibold text-green-600">{challenge.creditReward}</p>
						</div>
					</div>
					{
						challenge.proposal?.proposer && (
							<div className="pt-4 border-t">
								<span className="text-sm text-muted-foreground">
									Originally proposed by {challenge.proposal.proposer.name}
								</span>
							</div>
						)
					}
				</CardContent>
			</Card>
			<div className="space-y-4">
				<div className="flex items-center justify-between">
					<h2 className="text-xl font-semibold">Challenge Steps</h2>
					<span className="text-sm text-muted-foreground">
						{challenge.steps.length} step{challenge.steps.length !== 1 ? 's' : ''} configured
					</span>
				</div>

				{
					challenge.steps.length === 0 ? (
						<Card className="p-8 text-center">
							<Plus className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
							<h3 className="text-lg font-semibold mb-2">No Steps Added Yet</h3>
							<p className="text-muted-foreground mb-4">
								Add steps to define what participants need to complete in this challenge.
							</p>
							<AddStepDialog challengeId={challenge.id} nextStepNumber={1}>
								<Button>
									<Plus className="w-4 h-4 mr-2" />
									Add First Step
								</Button>
							</AddStepDialog>
						</Card>
					) : (
						<div className="space-y-4">
							{
								challenge.steps.map((step) => (
									<StepManagementCard
										key={step.id}
										step={step}
										challengeId={challenge.id}
									/>
								))
							}
						</div>
					)
				}
			</div>
			<Card className="mt-8">
				<CardHeader>
					<CardTitle>Step Creation Guidelines</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
						<div>
							<h4 className="font-medium mb-2">📝 Quiz Steps</h4>
							<ul className="space-y-1 text-muted-foreground">
								<li>• Test knowledge and understanding</li>
								<li>• Include multiple choice and text questions</li>
								<li>• Provide clear correct answers</li>
							</ul>
						</div>
						<div>
							<h4 className="font-medium mb-2">🎤 Mock Interview Steps</h4>
							<ul className="space-y-1 text-muted-foreground">
								<li>• Practice interview scenarios</li>
								<li>• Include common questions for the topic</li>
								<li>• Focus on communication skills</li>
							</ul>
						</div>
						<div>
							<h4 className="font-medium mb-2">💻 Coding Steps</h4>
							<ul className="space-y-1 text-muted-foreground">
								<li>• Hands-on programming challenges</li>
								<li>• Provide clear problem statements</li>
								<li>• Include expected input/output</li>
							</ul>
						</div>
						<div>
							<h4 className="font-medium mb-2">🚀 Project Steps</h4>
							<ul className="space-y-1 text-muted-foreground">
								<li>• Build and deploy real applications</li>
								<li>• Specify requirements clearly</li>
								<li>• Include evaluation criteria</li>
							</ul>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}