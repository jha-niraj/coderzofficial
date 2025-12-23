"use client";

import {
	Card, CardContent, CardDescription, CardHeader, CardTitle
} from "@repo/ui/components/ui/card";
import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import {
	FileText, MessageSquare, Code, Globe, Edit, Trash2, Users, CheckCircle, Clock
} from "lucide-react";

interface StepManagementCardProps {
	step: {
		id: string;
		stepNumber: number;
		title: string;
		description: string;
		type: string;
		quizData?: any;
		mockData?: any;
		codingData?: any;
		projectData?: any;
		createdAt: Date;
	};
	challengeId: string;
}

export function StepManagementCard({ step, challengeId }: StepManagementCardProps) {
	const getStepIcon = (type: string) => {
		switch (type) {
			case "QUIZ": return <FileText className="w-5 h-5 text-blue-500" />;
			case "MOCK": return <MessageSquare className="w-5 h-5 text-purple-500" />;
			case "CODING": return <Code className="w-5 h-5 text-green-500" />;
			case "PROJECT": return <Globe className="w-5 h-5 text-orange-500" />;
			default: return <FileText className="w-5 h-5" />;
		}
	};

	const getStepColor = (type: string) => {
		switch (type) {
			case "QUIZ": return "bg-blue-100 text-blue-800 border-blue-300";
			case "MOCK": return "bg-purple-100 text-purple-800 border-purple-300";
			case "CODING": return "bg-green-100 text-green-800 border-green-300";
			case "PROJECT": return "bg-orange-100 text-orange-800 border-orange-300";
			default: return "bg-gray-100 text-gray-800 border-gray-300";
		}
	};

	const getStepDetails = () => {
		switch (step.type) {
			case "QUIZ":
				return step.quizData?.questions ? `${step.quizData.questions.length} questions` : "Quiz configured";
			case "MOCK":
				return "Interview simulation";
			case "CODING":
				return "Programming challenge";
			case "PROJECT":
				return "Build & deploy project";
			default:
				return "Step configured";
		}
	};

	return (
		<Card className="hover:shadow-md transition-shadow">
			<CardHeader>
				<div className="flex items-start justify-between">
					<div className="flex items-center gap-3">
						<div className="p-2 rounded-lg bg-gray-50">
							{getStepIcon(step.type)}
						</div>
						<div>
							<CardTitle className="text-lg">
								Step {step.stepNumber}: {step.title}
							</CardTitle>
							<div className="flex items-center gap-2 mt-1">
								<Badge variant="outline" className={getStepColor(step.type)}>
									{step.type}
								</Badge>
								<span className="text-sm text-muted-foreground">
									{getStepDetails()}
								</span>
							</div>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<Button variant="outline" size="sm">
							<Edit className="w-4 h-4 mr-2" />
							Edit
						</Button>
						<Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
							<Trash2 className="w-4 h-4" />
						</Button>
					</div>
				</div>
			</CardHeader>
			<CardContent className="space-y-4">
				<CardDescription className="text-sm">
					{step.description}
				</CardDescription>

				{
					step.type === "QUIZ" && step.quizData?.questions && (
						<div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
							<h4 className="font-medium text-blue-900 text-sm mb-2">Quiz Preview</h4>
							<div className="space-y-1 text-sm text-blue-800">
								{
									step.quizData.questions.slice(0, 2).map((q: any, index: number) => (
										<p key={index} className="truncate">
											{index + 1}. {q.question}
										</p>
									))
								}
								{
									step.quizData.questions.length > 2 && (
										<p className="text-blue-600">
											+{step.quizData.questions.length - 2} more questions
										</p>
									)
								}
							</div>
						</div>
					)
				}
				{
					step.type === "MOCK" && step.mockData?.instructions && (
						<div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
							<h4 className="font-medium text-purple-900 text-sm mb-2">Interview Instructions</h4>
							<p className="text-sm text-purple-800 line-clamp-2">
								{step.mockData.instructions}
							</p>
						</div>
					)
				}
				{
					step.type === "CODING" && step.codingData?.problem && (
						<div className="bg-green-50 border border-green-200 rounded-lg p-3">
							<h4 className="font-medium text-green-900 text-sm mb-2">Problem Statement</h4>
							<p className="text-sm text-green-800 line-clamp-2">
								{step.codingData.problem}
							</p>
						</div>
					)
				}
				{
					step.type === "PROJECT" && step.projectData?.requirements && (
						<div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
							<h4 className="font-medium text-orange-900 text-sm mb-2">Project Requirements</h4>
							<p className="text-sm text-orange-800 line-clamp-2">
								{step.projectData.requirements}
							</p>
						</div>
					)
				}
				<div className="grid grid-cols-3 gap-4 pt-4 border-t">
					<div className="text-center">
						<div className="flex items-center justify-center gap-1 text-muted-foreground">
							<Users className="w-4 h-4" />
							<span className="font-semibold">0</span>
						</div>
						<p className="text-xs text-muted-foreground mt-1">Submissions</p>
					</div>
					<div className="text-center">
						<div className="flex items-center justify-center gap-1 text-green-600">
							<CheckCircle className="w-4 h-4" />
							<span className="font-semibold">0</span>
						</div>
						<p className="text-xs text-muted-foreground mt-1">Completed</p>
					</div>
					<div className="text-center">
						<div className="flex items-center justify-center gap-1 text-yellow-600">
							<Clock className="w-4 h-4" />
							<span className="font-semibold">0</span>
						</div>
						<p className="text-xs text-muted-foreground mt-1">Pending</p>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}