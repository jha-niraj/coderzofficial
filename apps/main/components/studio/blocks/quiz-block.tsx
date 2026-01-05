"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
	FileQuestion, RotateCcw, Trophy
} from "lucide-react";
import { Button } from "@repo/ui/components/ui/button";
import { cn } from "@repo/ui/lib/utils";
import { submitQuizAttempt } from "@/actions/(main)/studios/studio.action";
import toast from "@repo/ui/components/ui/sonner";
import Quiz, { type QuizQuestion, type QuizResult } from "@/components/main/quiz";

interface StudioQuizQuestion {
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
		questions: StudioQuizQuestion[];
	};
	topic?: string;
}

export default function StudioQuizBlock({ quiz, topic }: StudioQuizBlockProps) {
	const [showResult, setShowResult] = useState(false);
	const [score, setScore] = useState(0);
	const [totalQuestions, setTotalQuestions] = useState(0);

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

	// Transform studio quiz questions to centralized format
	const transformedQuestions: QuizQuestion[] = quiz.questions.map(q => ({
		id: q.id,
		text: q.question,
		type: "single" as const,
		options: q.options.map((opt, idx) => ({
			id: idx.toString(),
			text: opt,
			isCorrect: idx === q.correctAnswer,
		})),
		explanation: q.explanation,
		correctAnswer: q.correctAnswer,
	}));

	const handleComplete = async (result: QuizResult) => {
		const answers = result.answers.map(a => ({
			questionId: a.questionId,
			selectedAnswer: parseInt(Array.isArray(a.selectedAnswer) ? a.selectedAnswer[0] || "0" : a.selectedAnswer),
		}));

		const apiResult = await submitQuizAttempt(quiz.id, answers, result.totalTimeTaken);
		if (apiResult.error) {
			toast.error(apiResult.error);
		} else {
			setScore(apiResult.score || result.correctCount);
		}
		setTotalQuestions(result.totalQuestions);
		setShowResult(true);
	};

	const handleRestart = () => {
		setShowResult(false);
		setScore(0);
	};

	// Results view
	if (showResult) {
		const percentage = Math.round((score / totalQuestions) * 100);
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
								{totalQuestions}
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
				<div className="flex items-center gap-2">
					<FileQuestion className="h-5 w-5 text-purple-500" />
					<span className="font-medium text-neutral-900 dark:text-white">
						{quiz.title}
					</span>
				</div>
			</div>
			<div className="p-4">
				<Quiz
					quizId={quiz.id}
					questions={transformedQuestions}
					title=""
					mode="practice"
					immediateResults={true}
					allowSkip={false}
					allowHints={false}
					allowFlag={false}
					allowPrevious={false}
					allowQuestionNavigation={false}
					showTimer={false}
					showProgress={true}
					showQuestionNavigator={false}
					onComplete={handleComplete}
				/>
			</div>
		</div>
	);
}