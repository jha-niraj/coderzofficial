"use client";

import { useState } from "react";
import { Button } from "@repo/ui/components/ui/button";
import {
	Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger
} from "@repo/ui/components/ui/dialog";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import { Textarea } from "@repo/ui/components/ui/textarea";
import {
	Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@repo/ui/components/ui/select";
import {
	Plus, FileText, MessageSquare, Code, Globe
} from "lucide-react";
import { addChallengeStep } from "@/actions/collective.action";
import { toast } from "@repo/ui/components/ui/sonner";

interface AddStepDialogProps {
	children: React.ReactNode;
	challengeId: string;
	nextStepNumber: number;
}

export function AddStepDialog({ children, challengeId, nextStepNumber }: AddStepDialogProps) {
	const [open, setOpen] = useState(false);
	const [stepType, setStepType] = useState<string>("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [quizQuestions, setQuizQuestions] = useState([{ question: "", type: "multiple_choice", options: ["", "", "", ""], correctAnswer: "" }]);

	const handleSubmit = async (formData: FormData) => {
		setIsSubmitting(true);
		try {
			formData.set("challengeId", challengeId);
			formData.set("stepNumber", nextStepNumber.toString());
			formData.set("type", stepType);

			// Add step-specific data
			if (stepType === "QUIZ") {
				formData.set("stepData", JSON.stringify({ questions: quizQuestions }));
			} else if (stepType === "MOCK") {
				const instructions = formData.get("mockInstructions") as string;
				formData.set("stepData", JSON.stringify({ instructions }));
			} else if (stepType === "CODING") {
				const problem = formData.get("codingProblem") as string;
				const expectedOutput = formData.get("expectedOutput") as string;
				formData.set("stepData", JSON.stringify({ problem, expectedOutput }));
			} else if (stepType === "PROJECT") {
				const requirements = formData.get("projectRequirements") as string;
				formData.set("stepData", JSON.stringify({ requirements }));
			}

			await addChallengeStep(formData);
			toast.success("Step added successfully!");
			setOpen(false);

			// Reset form
			setStepType("");
			setQuizQuestions([{ question: "", type: "multiple_choice", options: ["", "", "", ""], correctAnswer: "" }]);
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Failed to add step");
		} finally {
			setIsSubmitting(false);
		}
	};

	const addQuizQuestion = () => {
		setQuizQuestions([...quizQuestions, { question: "", type: "multiple_choice", options: ["", "", "", ""], correctAnswer: "" }]);
	};

	const updateQuizQuestion = (index: number, field: string, value: any) => {
		const updated = [...quizQuestions];
		updated[index] = { ...updated[index], [field]: value as string | string[] };
		setQuizQuestions(updated as { question: string; type: string; options: string[]; correctAnswer: string }[]);
	};

	const removeQuizQuestion = (index: number) => {
		setQuizQuestions(quizQuestions.filter((_, i) => i !== index));
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				{children}
			</DialogTrigger>
			<DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Plus className="w-5 h-5" />
						Add Challenge Step {nextStepNumber}
					</DialogTitle>
					<DialogDescription>
						Create a new step for participants to complete in this challenge
					</DialogDescription>
				</DialogHeader>
				<form action={handleSubmit} className="space-y-6">
					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="title">Step Title *</Label>
							<Input
								id="title"
								name="title"
								placeholder="e.g., Complete React Basics Quiz"
								required
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="type">Step Type *</Label>
							<Select value={stepType} onValueChange={setStepType} required>
								<SelectTrigger>
									<SelectValue placeholder="Select step type" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="QUIZ">
										<div className="flex items-center gap-2">
											<FileText className="w-4 h-4" />
											Quiz
										</div>
									</SelectItem>
									<SelectItem value="MOCK">
										<div className="flex items-center gap-2">
											<MessageSquare className="w-4 h-4" />
											Mock Interview
										</div>
									</SelectItem>
									<SelectItem value="CODING">
										<div className="flex items-center gap-2">
											<Code className="w-4 h-4" />
											Coding Challenge
										</div>
									</SelectItem>
									<SelectItem value="PROJECT">
										<div className="flex items-center gap-2">
											<Globe className="w-4 h-4" />
											Project Submission
										</div>
									</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>
					<div className="space-y-2">
						<Label htmlFor="description">Description *</Label>
						<Textarea
							id="description"
							name="description"
							placeholder="Describe what participants need to do in this step..."
							required
							rows={3}
						/>
					</div>
					{
						stepType === "QUIZ" && (
							<div className="space-y-4">
								<div className="flex items-center justify-between">
									<Label className="text-base font-medium">Quiz Questions</Label>
									<Button type="button" onClick={addQuizQuestion} size="sm" variant="outline">
										<Plus className="w-4 h-4 mr-2" />
										Add Question
									</Button>
								</div>
								{
									quizQuestions.map((question, index) => (
										<div key={index} className="border rounded-lg p-4 space-y-3">
											<div className="flex items-center justify-between">
												<Label className="font-medium">Question {index + 1}</Label>
												{
													quizQuestions.length > 1 && (
														<Button
															type="button"
															onClick={() => removeQuizQuestion(index)}
															size="sm"
															variant="destructive"
														>
															Remove
														</Button>
													)
												}
											</div>
											<Input
												placeholder="Enter your question..."
												value={question.question}
												onChange={(e) => updateQuizQuestion(index, "question", e.target.value)}
											/>
											<div className="grid grid-cols-2 gap-2">
												{
													question.options.map((option, optIndex) => (
														<Input
															key={optIndex}
															placeholder={`Option ${optIndex + 1}`}
															value={option}
															onChange={(e) => {
																const newOptions = [...question.options];
																newOptions[optIndex] = e.target.value;
																updateQuizQuestion(index, "options", newOptions);
															}}
														/>
													))
												}
											</div>
											<Input
												placeholder="Correct answer"
												value={question.correctAnswer}
												onChange={(e) => updateQuizQuestion(index, "correctAnswer", e.target.value)}
											/>
										</div>
									))
								}
							</div>
						)
					}
					{
						stepType === "MOCK" && (
							<div className="space-y-2">
								<Label htmlFor="mockInstructions">Interview Instructions</Label>
								<Textarea
									id="mockInstructions"
									name="mockInstructions"
									placeholder="Provide instructions for the mock interview, including topics to cover and evaluation criteria..."
									rows={4}
								/>
							</div>
						)
					}
					{
						stepType === "CODING" && (
							<div className="space-y-4">
								<div className="space-y-2">
									<Label htmlFor="codingProblem">Problem Statement</Label>
									<Textarea
										id="codingProblem"
										name="codingProblem"
										placeholder="Describe the coding problem participants need to solve..."
										rows={4}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="expectedOutput">Expected Output/Solution</Label>
									<Textarea
										id="expectedOutput"
										name="expectedOutput"
										placeholder="Describe the expected output or provide a sample solution..."
										rows={3}
									/>
								</div>
							</div>
						)
					}
					{
						stepType === "PROJECT" && (
							<div className="space-y-2">
								<Label htmlFor="projectRequirements">Project Requirements</Label>
								<Textarea
									id="projectRequirements"
									name="projectRequirements"
									placeholder="Describe the project requirements, features to implement, and evaluation criteria..."
									rows={5}
								/>
							</div>
						)
					}
					<div className="flex justify-end gap-3">
						<Button
							type="button"
							variant="outline"
							onClick={() => setOpen(false)}
							disabled={isSubmitting}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={isSubmitting || !stepType}>
							{isSubmitting ? "Adding..." : "Add Step"}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}