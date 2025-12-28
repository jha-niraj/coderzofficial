"use client";

import { useState } from "react";
import { Button } from "@repo/ui/components/ui/button";
import {
	Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle
} from "@repo/ui/components/ui/dialog";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import { Textarea } from "@repo/ui/components/ui/textarea";
import {
	RadioGroup, RadioGroupItem
} from "@repo/ui/components/ui/radio-group";
import { Checkbox } from "@repo/ui/components/ui/checkbox";
import {
	Send, FileText, Code, Globe, MessageSquare
} from "lucide-react";
import { submitStep } from "@/actions/(main)/collective/challenge.actions";
import toast from '@repo/ui/components/ui/sonner'

interface QuizQuestion {
	question: string;
	type: 'multiple_choice' | 'text' | 'checkbox';
	options?: string[];
}

interface StepSubmissionDialogProps {
	step: {
		id: string;
		title: string;
		description: string;
		type: string;
		quizData?: { questions?: QuizQuestion[] } | unknown;
		mockData?: { instructions?: string } | unknown;
		codingData?: { problem?: string } | unknown;
		projectData?: { requirements?: string } | unknown;
	};
	challengeId: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	existingSubmission?: {
		id: string;
		status: string;
		content?: string | null;
		projectUrl?: string | null;
		quizAnswers?: Record<string, string | string[]> | null;
	} | null;
}

export function StepSubmissionDialog({
	step,
	challengeId,
	open,
	onOpenChange,
	existingSubmission
}: StepSubmissionDialogProps) {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [quizAnswers, setQuizAnswers] = useState<Record<string, string | string[]>>({});

	const handleSubmit = async (formData: FormData) => {
		setIsSubmitting(true);
		try {
			formData.set("stepId", step.id);
			formData.set("challengeId", challengeId);

			if (step.type === "QUIZ") {
				formData.set("quizAnswers", JSON.stringify(quizAnswers));
			}

			await submitStep(formData);
			toast.success("Submission sent for review! 🎉");
			onOpenChange(false);
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Failed to submit");
		} finally {
			setIsSubmitting(false);
		}
	};

	const getStepIcon = (type: string) => {
		switch (type) {
			case "QUIZ": return <FileText className="w-5 h-5 text-blue-500" />;
			case "MOCK": return <MessageSquare className="w-5 h-5 text-purple-500" />;
			case "CODING": return <Code className="w-5 h-5 text-green-500" />;
			case "PROJECT": return <Globe className="w-5 h-5 text-orange-500" />;
			default: return <FileText className="w-5 h-5" />;
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						{getStepIcon(step.type)}
						{step.title}
					</DialogTitle>
					<DialogDescription>
						{step.description}
					</DialogDescription>
				</DialogHeader>
				<form action={handleSubmit} className="space-y-6">
					{(() => {
						const quizData = step.quizData as { questions?: QuizQuestion[] } | null | undefined;
						return step.type === "QUIZ" && quizData?.questions && (
							<div className="space-y-4">
								<h3 className="font-medium">Quiz Questions</h3>
								{
									quizData.questions.map((question, index) => (
										<div key={index} className="space-y-3 p-4 border rounded-lg">
											<h4 className="font-medium">
												{index + 1}. {question.question}
											</h4>

											{
												question.type === "multiple_choice" && (
													<RadioGroup
														value={(quizAnswers[index] as string) || ""}
														onValueChange={(value) =>
															setQuizAnswers(prev => ({ ...prev, [index]: value }))
														}
													>
														{
															question.options?.map((option: string, optIndex: number) => (
																<div key={optIndex} className="flex items-center space-x-2">
																	<RadioGroupItem value={option} id={`q${index}_${optIndex}`} />
																	<Label htmlFor={`q${index}_${optIndex}`}>{option}</Label>
																</div>
															))
														}
													</RadioGroup>
												)
											}

											{
												question.type === "text" && (
													<Textarea
														placeholder="Enter your answer..."
														value={(quizAnswers[index] as string) || ""}
														onChange={(e) =>
															setQuizAnswers(prev => ({ ...prev, [index]: e.target.value }))
														}
														rows={3}
													/>
												)
											}

											{
												question.type === "checkbox" && (
													<div className="space-y-2">
														{
															question.options?.map((option: string, optIndex: number) => (
																<div key={optIndex} className="flex items-center space-x-2">
																	<Checkbox
																		id={`q${index}_${optIndex}`}
																		checked={((quizAnswers[index] as string[]) || []).includes(option)}
																		onCheckedChange={(checked) => {
																			const current = (quizAnswers[index] as string[]) || [];
																			const updated = checked
																				? [...current, option]
																				: current.filter((item: string) => item !== option);
																			setQuizAnswers(prev => ({ ...prev, [index]: updated }));
																		}}
																	/>
																	<Label htmlFor={`q${index}_${optIndex}`}>{option}</Label>
																</div>
															))
														}
													</div>
												)
											}
										</div>
									))
								}
							</div>
						);
					})()}

					{
						step.type === "MOCK" && (
							<div className="space-y-4">
								<div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
									<h3 className="font-medium text-purple-900 mb-2">Mock Interview Instructions</h3>
									<p className="text-sm text-purple-800">
										{(step.mockData as { instructions?: string } | null)?.instructions || "Complete the mock interview and provide a summary of your experience."}
									</p>
								</div>
								<div className="space-y-2">
									<Label htmlFor="content">Interview Summary *</Label>
									<Textarea
										id="content"
										name="content"
										placeholder="Describe your mock interview experience, key questions asked, and what you learned..."
										required
										rows={6}
										defaultValue={existingSubmission?.content || ""}
									/>
								</div>
							</div>
						)
					}

					{
						step.type === "CODING" && (
							<div className="space-y-4">
								<div className="bg-green-50 border border-green-200 rounded-lg p-4">
									<h3 className="font-medium text-green-900 mb-2">Coding Challenge</h3>
									<p className="text-sm text-green-800">
										{(step.codingData as { problem?: string } | null)?.problem || "Complete the coding challenge and submit your solution."}
									</p>
								</div>
								<div className="space-y-2">
									<Label htmlFor="content">Your Solution *</Label>
									<Textarea
										id="content"
										name="content"
										placeholder="Paste your code solution here..."
										required
										rows={8}
										className="font-mono text-sm"
										defaultValue={existingSubmission?.content || ""}
									/>
								</div>
							</div>
						)
					}
					{
						step.type === "PROJECT" && (
							<div className="space-y-4">
								<div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
									<h3 className="font-medium text-orange-900 mb-2">Project Requirements</h3>
									<p className="text-sm text-orange-800">
										{(step.projectData as { requirements?: string } | null)?.requirements || "Build and deploy your project, then submit the URL for review."}
									</p>
								</div>
								<div className="space-y-2">
									<Label htmlFor="projectUrl">Project URL *</Label>
									<Input
										id="projectUrl"
										name="projectUrl"
										type="url"
										placeholder="https://your-project.com"
										required
										defaultValue={existingSubmission?.projectUrl || ""}
									/>
									<p className="text-xs text-muted-foreground">
										Provide the live URL where your project can be accessed
									</p>
								</div>
								<div className="space-y-2">
									<Label htmlFor="content">Project Description</Label>
									<Textarea
										id="content"
										name="content"
										placeholder="Describe your project, technologies used, challenges faced, and key features..."
										rows={4}
										defaultValue={existingSubmission?.content || ""}
									/>
								</div>
							</div>
						)
					}

					{
						step.type === "REFLECTION" && (
							<div className="space-y-4">
								<div className="space-y-2">
									<Label htmlFor="content">Your Reflection *</Label>
									<Textarea
										id="content"
										name="content"
										placeholder="Share your thoughts, learnings, and insights from this step..."
										required
										rows={6}
										defaultValue={existingSubmission?.content || ""}
									/>
								</div>
							</div>
						)
					}

					<div className="bg-gray-50 rounded-lg p-4">
						<h4 className="font-medium text-sm mb-2">Submission Guidelines</h4>
						<ul className="text-xs text-muted-foreground space-y-1">
							<li>• Ensure your submission is complete and accurate</li>
							<li>• Provide detailed explanations where requested</li>
							<li>• Your submission will be reviewed by our team</li>
							<li>• You&apos;ll receive feedback and XP upon approval</li>
						</ul>
					</div>
					<div className="flex justify-end gap-3">
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
							disabled={isSubmitting}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={isSubmitting}>
							<Send className="w-4 h-4 mr-2" />
							{isSubmitting ? "Submitting..." : "Submit for Review"}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}