"use client";

import { useState } from "react";
import {
	Card, CardContent, CardDescription, CardHeader, CardTitle
} from "@repo/ui/components/ui/card";
import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import {
	CheckCircle, Lock, Play, FileText, Code, MessageSquare, Globe, Clock
} from "lucide-react";
import { StepSubmissionDialog } from "./step-submission-dialog";

interface StepData {
	questions?: Array<{ question: string; type: 'multiple_choice' | 'text' | 'checkbox'; options?: string[] }>;
}

interface ChallengeStepCardProps {
	step: {
		id: string;
		stepNumber: number;
		title: string;
		description: string;
		type: string;
		quizData?: StepData | unknown;
		mockData?: { instructions?: string } | unknown;
		codingData?: { problem?: string } | unknown;
		projectData?: { requirements?: string } | unknown;
	};
	stepNumber: number;
	isUnlocked: boolean;
	isCompleted: boolean;
	userProgress?: {
		id: string;
		challengeId: string;
		submissions: Array<{
			id: string;
			status: string;
			score?: number | null;
			feedback?: string | null;
			step: {
				id: string;
			};
		}>;
	} | null;
}

export function ChallengeStepCard({
	step,
	stepNumber,
	isUnlocked,
	isCompleted,
	userProgress
}: ChallengeStepCardProps) {
	const [showSubmission, setShowSubmission] = useState(false);

	const getStepIcon = (type: string) => {
		switch (type) {
			case "QUIZ": return <FileText className="w-5 h-5" />;
			case "MOCK": return <MessageSquare className="w-5 h-5" />;
			case "CODING": return <Code className="w-5 h-5" />;
			case "PROJECT": return <Globe className="w-5 h-5" />;
			default: return <Play className="w-5 h-5" />;
		}
	};

	const getStepColor = (type: string) => {
		switch (type) {
			case "QUIZ": return "bg-blue-100 text-blue-800";
			case "MOCK": return "bg-purple-100 text-purple-800";
			case "CODING": return "bg-green-100 text-green-800";
			case "PROJECT": return "bg-orange-100 text-orange-800";
			default: return "bg-gray-100 text-gray-800";
		}
	};

	const submission = userProgress?.submissions.find(s => s.step.id === step.id);
	const isPending = submission?.status === "PENDING";
	const isRejected = submission?.status === "REJECTED" || submission?.status === "NEEDS_REVISION";

	return (
		<Card className={`transition-all duration-200 ${isCompleted ? "border-green-500 bg-green-50" :
			isUnlocked ? "border-blue-500 hover:shadow-md" :
				"border-gray-200 opacity-60"
			}`}>
			<CardHeader className="pb-3">
				<div className="flex items-start justify-between">
					<div className="flex items-center gap-3">
						<div className={`p-2 rounded-full ${isCompleted ? "bg-green-500 text-white" :
							isUnlocked ? "bg-blue-500 text-white" :
								"bg-gray-300 text-gray-500"
							}`}>
							{isCompleted ? (
								<CheckCircle className="w-5 h-5" />
							) : isUnlocked ? (
								getStepIcon(step.type)
							) : (
								<Lock className="w-5 h-5" />
							)}
						</div>
						<div>
							<CardTitle className="text-lg">
								Step {stepNumber}: {step.title}
							</CardTitle>
							<div className="flex items-center gap-2 mt-1">
								<Badge className={getStepColor(step.type)}>
									{step.type}
								</Badge>
								{isCompleted && (
									<Badge variant="outline" className="text-green-600 border-green-600">
										Completed
									</Badge>
								)}
								{isPending && (
									<Badge variant="outline" className="text-yellow-600 border-yellow-600">
										<Clock className="w-3 h-3 mr-1" />
										Under Review
									</Badge>
								)}
								{isRejected && (
									<Badge variant="outline" className="text-red-600 border-red-600">
										Needs Revision
									</Badge>
								)}
							</div>
						</div>
					</div>
				</div>
			</CardHeader>

			<CardContent className="space-y-4">
				<CardDescription className="text-sm">
					{step.description}
				</CardDescription>

				{/* Step Requirements */}
				{step.type === "QUIZ" && step.quizData !== null && step.quizData !== undefined && typeof step.quizData === 'object' && !Array.isArray(step.quizData) ? (
					<div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
						<p className="text-sm text-blue-800">
							📝 Complete the quiz with {(step.quizData as StepData).questions?.length || 0} questions
						</p>
					</div>
				) : null}

				{step.type === "MOCK" && step.mockData !== null && step.mockData !== undefined && typeof step.mockData === 'object' && !Array.isArray(step.mockData) ? (
					<div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
						<p className="text-sm text-purple-800">
							🎤 Participate in a mock interview session
						</p>
					</div>
				) : null}

				{step.type === "CODING" && step.codingData !== null && step.codingData !== undefined && typeof step.codingData === 'object' && !Array.isArray(step.codingData) ? (
					<div className="bg-green-50 border border-green-200 rounded-lg p-3">
						<p className="text-sm text-green-800">
							💻 Submit your code solution
						</p>
					</div>
				) : null}

				{step.type === "PROJECT" && step.projectData !== null && step.projectData !== undefined && typeof step.projectData === 'object' && !Array.isArray(step.projectData) ? (
					<div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
						<p className="text-sm text-orange-800">
							🚀 Build and deploy your project, then submit the URL
						</p>
					</div>
				) : null}

				{/* Submission Feedback */}
				{submission?.feedback && (
					<div className={`border rounded-lg p-3 ${submission.status === "APPROVED" ? "bg-green-50 border-green-200" :
						submission.status === "REJECTED" ? "bg-red-50 border-red-200" :
							"bg-yellow-50 border-yellow-200"
						}`}>
						<h4 className="font-medium text-sm mb-1">Feedback:</h4>
						<p className="text-sm">{submission.feedback}</p>
						{submission.score && (
							<p className="text-sm font-medium mt-2">
								Score: {submission.score}/100
							</p>
						)}
					</div>
				)}

				{/* Action Button */}
				<div className="pt-2">
					{!isUnlocked ? (
						<Button disabled variant="outline" className="w-full">
							<Lock className="w-4 h-4 mr-2" />
							Complete Previous Steps
						</Button>
					) : isCompleted ? (
						<Button disabled variant="outline" className="w-full">
							<CheckCircle className="w-4 h-4 mr-2" />
							Step Completed
						</Button>
					) : isPending ? (
						<Button disabled variant="outline" className="w-full">
							<Clock className="w-4 h-4 mr-2" />
							Submission Under Review
						</Button>
					) : (
						<Button
							onClick={() => setShowSubmission(true)}
							className="w-full"
						>
							<Play className="w-4 h-4 mr-2" />
							{isRejected ? "Resubmit" : "Start Step"}
						</Button>
					)}
				</div>
			</CardContent>

			{/* Submission Dialog */}
			{showSubmission && (
				<StepSubmissionDialog
					step={step}
					challengeId={userProgress?.challengeId || ""}
					open={showSubmission}
					onOpenChange={setShowSubmission}
					existingSubmission={submission}
				/>
			)}
		</Card>
	);
}






