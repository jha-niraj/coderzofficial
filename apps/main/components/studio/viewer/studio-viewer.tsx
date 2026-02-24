"use client"

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollArea } from "@repo/ui/components/ui/scroll-area";
import { ExplanationStep } from "../steps/explanation-step";
import { QuizStep } from "../steps/quiz-step";
import { NoteStep } from "../steps/note-step";
import { CodeStep } from "../steps/code-step";
import { ImageStep } from "../steps/image-step";
import { VideoStep } from "../steps/video-step";
import { DocumentStep } from "../steps/document-step";
import { ProjectStep } from "../steps/project-step";
import { MockInterviewStep } from "../steps/mock-interview-step";
import { FlashcardStep } from "../steps/flashcard-step";
import { 
	Loader2 
} from "lucide-react";
import type { StudioWithSteps, StudioStep, QuizMetadata } from "@/types/studios";

interface StudioViewerProps {
	studio: StudioWithSteps;
	className?: string;
}

export function StudioViewer({ studio, className }: StudioViewerProps) {
	const [quizData, setQuizData] = useState<Record<string, unknown>>({});
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const loadQuizData = async () => {
			const quizSteps = studio.steps.filter((s) => s.type === "QUIZ");

			if (quizSteps.length === 0) {
				setLoading(false);
				return;
			}

			const quizDataMap: Record<string, unknown> = {};

			for (const step of quizSteps) {
				const metadata = step.metadata as QuizMetadata;
				if (metadata.quizId) {
					// Fetch quiz data
					// quizDataMap[metadata.quizId] = await fetchQuizData(metadata.quizId);
				}
			}

			setQuizData(quizDataMap);
			setLoading(false);
		};

		loadQuizData();
	}, [studio.steps]);

	const renderStep = (step: StudioStep, _index: number) => {
		switch (step.type) {
			case "EXPLANATION":
				return <ExplanationStep key={step.id} step={step} />;

			case "QUIZ": {
				const metadata = step.metadata as QuizMetadata;
				return (
					<QuizStep
						key={step.id}
						step={step}
						quizData={quizData[metadata.quizId]}
					/>
				);
			}

			case "NOTE":
				return <NoteStep key={step.id} step={step} studioId={studio.id} />;

			case "CODE":
				return <CodeStep key={step.id} step={step} studioId={studio.id} />;

			case "IMAGE":
				return <ImageStep key={step.id} step={step} />;

			case "VIDEO":
				return <VideoStep key={step.id} step={step} />;

			case "DOCUMENT":
				return <DocumentStep key={step.id} step={step} />;

			case "PROJECT":
				return <ProjectStep key={step.id} step={step} />;

			case "MOCK_INTERVIEW":
				return <MockInterviewStep key={step.id} step={step} />;

			case "FLASHCARD":
				return <FlashcardStep key={step.id} step={step} />;

			default:
				return null;
		}
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center py-20">
				<Loader2 className="h-8 w-8 animate-spin text-purple-500" />
			</div>
		);
	}

	if (studio.steps.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center py-20 text-center">
				<div className="h-20 w-20 rounded-full bg-purple-100 dark:bg-purple-950/30 flex items-center justify-center mb-4">
					<span className="text-4xl">📝</span>
				</div>
				<h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
					No content yet
				</h3>
				<p className="text-neutral-600 dark:text-neutral-400 max-w-md">
					Start adding content using the AI panel below. Ask for explanations,
					quizzes, code challenges, and more!
				</p>
			</div>
		);
	}

	return (
		<ScrollArea className={className}>
			<div className="max-w-4xl mx-auto px-6 py-8">
				<AnimatePresence mode="popLayout">
					{
						studio.steps.map((step, index) => (
							<motion.div
								key={step.id}
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -20 }}
								transition={{ delay: index * 0.1 }}
							>
								{renderStep(step, index)}

								{
									index < studio.steps.length - 1 && (
										<div className="flex items-center gap-4 py-4">
											<div className="flex-1 h-px bg-gradient-to-r from-transparent via-neutral-200 dark:via-neutral-800 to-transparent" />
											<span className="text-xs text-neutral-400 dark:text-neutral-600">
												Step {index + 1} of {studio.steps.length}
											</span>
											<div className="flex-1 h-px bg-gradient-to-r from-transparent via-neutral-200 dark:via-neutral-800 to-transparent" />
										</div>
									)
								}
							</motion.div>
						))
					}
				</AnimatePresence>
			</div>
		</ScrollArea>
	);
}