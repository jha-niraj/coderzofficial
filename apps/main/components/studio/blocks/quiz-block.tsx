"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
	FileQuestion, CheckCircle, XCircle, ChevronRight, RotateCcw, Trophy
} from "lucide-react";
import { Button } from "@repo/ui/components/ui/button";
import { Progress } from "@repo/ui/components/ui/progress";
import { cn } from "@repo/ui/lib/utils";
import { submitQuizAttempt } from "@/actions/(main)/studios/studio.action";
import toast from "@repo/ui/components/ui/sonner";

interface QuizQuestion {
	id: string;
	question: string;
	options: string[];
	correctAnswer: number;
	explanation?: string;
}

interface StudioQuizBlockProps {
	quiz?: {
		id: string;
		title: string;
		questions: QuizQuestion[];
	};
	topic?: string;
}

export default function StudioQuizBlock({ quiz, topic }: StudioQuizBlockProps) {
	const [currentQuestion, setCurrentQuestion] = useState(0);
	const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
	const [showResult, setShowResult] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [score, setScore] = useState(0);
	const [showExplanation, setShowExplanation] = useState(false);
	const [startTime] = useState(Date.now());

	if (!quiz) {
		return (
			<div className="border border-neutral-200 dark:border-neutral-800 rounded-xl p-8 text-center bg-neutral-50 dark:bg-neutral-900">
				<FileQuestion className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
				<p className="text-neutral-600 dark:text-neutral-400">
					Quiz data not found. Try regenerating.
				</p>
			</div>
		);
	}

	const questions = quiz.questions as QuizQuestion[];
	const question = questions[currentQuestion];
	const progress = ((currentQuestion + 1) / questions.length) * 100;
	const hasAnswered = selectedAnswers[question?.id || ""] !== undefined;
	// const isCorrect = hasAnswered && selectedAnswers[question?.id || ""] === question?.correctAnswer;

	const handleSelectAnswer = (answerIndex: number) => {
		if (hasAnswered) return;
		setSelectedAnswers((prev) => ({
			...prev,
			[question?.id || ""]: answerIndex,
		}));
		setShowExplanation(true);
	};

	const handleNext = () => {
		if (currentQuestion < questions.length - 1) {
			setCurrentQuestion((prev) => prev + 1);
			setShowExplanation(false);
		} else {
			handleSubmit();
		}
	};

	const handleSubmit = async () => {
		setIsSubmitting(true);
		const timeTaken = Math.floor((Date.now() - startTime) / 1000);
		const answers = Object.entries(selectedAnswers).map(([questionId, selectedAnswer]) => ({
			questionId,
			selectedAnswer,
		}));

		const result = await submitQuizAttempt(quiz.id, answers, timeTaken);
		if (result.error) {
			toast.error(result.error);
		} else {
			setScore(result.score || 0);
		}
		setShowResult(true);
		setIsSubmitting(false);
	};

	const handleRestart = () => {
		setCurrentQuestion(0);
		setSelectedAnswers({});
		setShowResult(false);
		setShowExplanation(false);
		setScore(0);
	};

	// Results view
	if (showResult) {
		const percentage = Math.round((score / questions.length) * 100);
		return (
			<motion.div
				initial={{ opacity: 0, scale: 0.95 }}
				animate={{ opacity: 1, scale: 1 }}
				className="border border-neutral-200 dark:border-neutral-800 rounded-xl p-8 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-neutral-900 dark:to-neutral-900"
			>
				<div className="text-center">
					<motion.div
						initial={{ scale: 0 }}
						animate={{ scale: 1 }}
						transition={{ type: "spring", delay: 0.2 }}
						className={cn(
							"h-20 w-20 rounded-full mx-auto mb-6 flex items-center justify-center",
							percentage >= 80
								? "bg-green-500"
								: percentage >= 50
									? "bg-amber-500"
									: "bg-red-500"
						)}
					>
						<Trophy className="h-10 w-10 text-white" />
					</motion.div>

					<h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
						Quiz Complete!
					</h3>
					<p className="text-neutral-600 dark:text-neutral-400 mb-6">
						{topic}
					</p>
					<div className="flex items-center justify-center gap-8 mb-8">
						<div className="text-center">
							<p className="text-4xl font-bold text-primary">{score}</p>
							<p className="text-sm text-neutral-500">Correct</p>
						</div>
						<div className="h-16 w-px bg-neutral-200 dark:bg-neutral-700" />
						<div className="text-center">
							<p className="text-4xl font-bold text-neutral-900 dark:text-white">
								{questions.length}
							</p>
							<p className="text-sm text-neutral-500">Total</p>
						</div>
						<div className="h-16 w-px bg-neutral-200 dark:bg-neutral-700" />
						<div className="text-center">
							<p className="text-4xl font-bold text-neutral-900 dark:text-white">
								{percentage}%
							</p>
							<p className="text-sm text-neutral-500">Score</p>
						</div>
					</div>
					<Button onClick={handleRestart} className="gap-2">
						<RotateCcw className="h-4 w-4" />
						Try Again
					</Button>
				</div>
			</motion.div>
		);
	}

	return (
		<div className="border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden bg-white dark:bg-neutral-900">
			<div className="p-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/50">
				<div className="flex items-center justify-between mb-2">
					<div className="flex items-center gap-2">
						<FileQuestion className="h-5 w-5 text-purple-500" />
						<span className="font-medium text-neutral-900 dark:text-white">
							{quiz.title}
						</span>
					</div>
					<span className="text-sm text-neutral-500">
						Question {currentQuestion + 1} of {questions.length}
					</span>
				</div>
				<Progress value={progress} className="h-2" />
			</div>
			<div className="p-6">
				<AnimatePresence mode="wait">
					<motion.div
						key={currentQuestion}
						initial={{ opacity: 0, x: 20 }}
						animate={{ opacity: 1, x: 0 }}
						exit={{ opacity: 0, x: -20 }}
					>
						<h4 className="text-lg font-medium text-neutral-900 dark:text-white mb-6">
							{question?.question}
						</h4>
						<div className="space-y-3">
							{
								question?.options.map((option, index) => {
									const isSelected = selectedAnswers[question?.id || ""] === index;
									const isCorrectAnswer = index === question.correctAnswer;

									return (
										<button
											key={index}
											onClick={() => handleSelectAnswer(index)}
											disabled={hasAnswered}
											className={cn(
												"w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all",
												!hasAnswered &&
												"hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-500/10 cursor-pointer",
												isSelected && isCorrectAnswer
													? "border-green-500 bg-green-50 dark:bg-green-500/10"
													: isSelected
														? "border-red-500 bg-red-50 dark:bg-red-500/10"
														: hasAnswered && isCorrectAnswer
															? "border-green-500 bg-green-50 dark:bg-green-500/10"
															: "border-neutral-200 dark:border-neutral-700"
											)}
										>
											<div
												className={cn(
													"h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium",
													isSelected && isCorrectAnswer
														? "bg-green-500 text-white"
														: isSelected
															? "bg-red-500 text-white"
															: hasAnswered && isCorrectAnswer
																? "bg-green-500 text-white"
																: "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
												)}
											>
												{
													hasAnswered ? (
														isCorrectAnswer ? (
															<CheckCircle className="h-5 w-5" />
														) : isSelected ? (
															<XCircle className="h-5 w-5" />
														) : (
															String.fromCharCode(65 + index)
														)
													) : (
														String.fromCharCode(65 + index)
													)
												}
											</div>
											<span
												className={cn(
													"flex-1",
													isSelected && isCorrectAnswer
														? "text-green-700 dark:text-green-400"
														: isSelected
															? "text-red-700 dark:text-red-400"
															: hasAnswered && isCorrectAnswer
																? "text-green-700 dark:text-green-400"
																: "text-neutral-900 dark:text-white"
												)}
											>
												{option}
											</span>
										</button>
									);
								})
							}
						</div>
						<AnimatePresence>
							{
								showExplanation && question?.explanation && question?.id && (
									<motion.div
										initial={{ opacity: 0, height: 0 }}
										animate={{ opacity: 1, height: "auto" }}
										exit={{ opacity: 0, height: 0 }}
										className="mt-4 p-4 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20"
									>
										<p className="text-sm text-blue-800 dark:text-blue-300">
											<strong>Explanation:</strong> {question?.explanation}
										</p>
									</motion.div>
								)
							}
						</AnimatePresence>
					</motion.div>
				</AnimatePresence>
			</div>
			<div className="p-4 border-t border-neutral-200 dark:border-neutral-800 flex justify-end">
				<Button
					onClick={handleNext}
					disabled={!hasAnswered || isSubmitting}
					className="gap-2"
				>
					{
						isSubmitting ? (
							<>
								<motion.div
									className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full"
									animate={{ rotate: 360 }}
									transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
								/>
								Submitting...
							</>
						) : currentQuestion < questions.length - 1 ? (
							<>
								Next
								<ChevronRight className="h-4 w-4" />
							</>
						) : (
							"Finish Quiz"
						)
					}
				</Button>
			</div>
		</div>
	);
}