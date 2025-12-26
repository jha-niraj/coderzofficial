"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
	Layers, ChevronLeft, ChevronRight, RotateCcw, ThumbsUp, ThumbsDown,
	Shuffle, Lightbulb, Trophy
} from "lucide-react";
import { Button } from "@repo/ui/components/ui/button";
import { Progress } from "@repo/ui/components/ui/progress";
import { cn } from "@repo/ui/lib/utils";
import { saveFlashcardSession } from "@/actions/(main)/studios/studio.action";

interface FlashCard {
	id: string;
	front: string;
	back: string;
	hint?: string;
}

interface StudioFlashcardBlockProps {
	deck?: {
		id: string;
		title: string;
		cards: FlashCard[];
	};
	topic?: string;
}

export default function StudioFlashcardBlock({ deck }: StudioFlashcardBlockProps) {
	const [currentIndex, setCurrentIndex] = useState(0);
	const [isFlipped, setIsFlipped] = useState(false);
	const [showHint, setShowHint] = useState(false);
	const [cardProgress, setCardProgress] = useState<Record<string, { correct: number; incorrect: number; lastSeen: Date }>>({});
	const [correctCount, setCorrectCount] = useState(0);
	const [incorrectCount, setIncorrectCount] = useState(0);
	const [isComplete, setIsComplete] = useState(false);
	const [startTime] = useState(Date.now());
	const [shuffledCards, setShuffledCards] = useState<FlashCard[]>([]);

	useEffect(() => {
		if (deck?.cards) {
			setShuffledCards(deck.cards as FlashCard[]);
		}
	}, [deck]);

	if (!deck) {
		return (
			<div className="border border-neutral-200 dark:border-neutral-800 rounded-xl p-8 text-center bg-neutral-50 dark:bg-neutral-900">
				<Layers className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
				<p className="text-neutral-600 dark:text-neutral-400">
					Flashcard data not found. Try regenerating.
				</p>
			</div>
		);
	}

	const cards = shuffledCards;
	const card = cards[currentIndex];
	const progress = ((currentIndex + 1) / cards.length) * 100;

	const handleFlip = () => {
		setIsFlipped(!isFlipped);
		setShowHint(false);
	};

	const handleResponse = async (isCorrect: boolean) => {
		// Update progress
		setCardProgress((prev) => ({
			...prev,
			[card?.id || ""]: {
				correct: (prev[card?.id || ""]?.correct || 0) + (isCorrect ? 1 : 0),
				incorrect: (prev[card?.id || ""]?.incorrect || 0) + (isCorrect ? 0 : 1),
				lastSeen: new Date(),
			},
		}));

		if (isCorrect) {
			setCorrectCount((prev) => prev + 1);
		} else {
			setIncorrectCount((prev) => prev + 1);
		}

		// Move to next card
		if (currentIndex < cards.length - 1) {
			setCurrentIndex((prev) => prev + 1);
			setIsFlipped(false);
			setShowHint(false);
		} else {
			// Complete session
			const studyTime = Math.floor((Date.now() - startTime) / 1000);
			await saveFlashcardSession(deck.id, {
				cardsStudied: cards.length,
				correctCount: correctCount + (isCorrect ? 1 : 0),
				studyTime,
				cardProgress: {
					...cardProgress,
					[card?.id || ""]: {
						correct: (cardProgress[card?.id || ""]?.correct || 0) + (isCorrect ? 1 : 0),
						incorrect: (cardProgress[card?.id || ""]?.incorrect || 0) + (isCorrect ? 0 : 1),
						lastSeen: new Date(),
					},
				},
			});
			setIsComplete(true);
		}
	};

	const handleShuffle = () => {
		const shuffled = [...cards].sort(() => Math.random() - 0.5);
		setShuffledCards(shuffled);
		setCurrentIndex(0);
		setIsFlipped(false);
		setShowHint(false);
	};

	const handleRestart = () => {
		setCurrentIndex(0);
		setIsFlipped(false);
		setShowHint(false);
		setCorrectCount(0);
		setIncorrectCount(0);
		setIsComplete(false);
		setCardProgress({});
	};

	const handlePrevious = () => {
		if (currentIndex > 0) {
			setCurrentIndex((prev) => prev - 1);
			setIsFlipped(false);
			setShowHint(false);
		}
	};

	const handleNext = () => {
		if (currentIndex < cards.length - 1) {
			setCurrentIndex((prev) => prev + 1);
			setIsFlipped(false);
			setShowHint(false);
		}
	};

	// Completion view
	if (isComplete) {
		const percentage = Math.round((correctCount / cards.length) * 100);
		return (
			<motion.div
				initial={{ opacity: 0, scale: 0.95 }}
				animate={{ opacity: 1, scale: 1 }}
				className="border border-neutral-200 dark:border-neutral-800 rounded-xl p-8 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-neutral-900 dark:to-neutral-900"
			>
				<div className="text-center">
					<motion.div
						initial={{ scale: 0 }}
						animate={{ scale: 1 }}
						transition={{ type: "spring", delay: 0.2 }}
						className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 mx-auto mb-6 flex items-center justify-center"
					>
						<Trophy className="h-10 w-10 text-white" />
					</motion.div>
					<h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
						Study Session Complete!
					</h3>
					<p className="text-neutral-600 dark:text-neutral-400 mb-6">
						{deck.title}
					</p>
					<div className="flex items-center justify-center gap-8 mb-8">
						<div className="text-center">
							<p className="text-4xl font-bold text-green-500">{correctCount}</p>
							<p className="text-sm text-neutral-500">Got It</p>
						</div>
						<div className="h-16 w-px bg-neutral-200 dark:bg-neutral-700" />
						<div className="text-center">
							<p className="text-4xl font-bold text-red-500">{incorrectCount}</p>
							<p className="text-sm text-neutral-500">Need Review</p>
						</div>
						<div className="h-16 w-px bg-neutral-200 dark:bg-neutral-700" />
						<div className="text-center">
							<p className="text-4xl font-bold text-neutral-900 dark:text-white">
								{percentage}%
							</p>
							<p className="text-sm text-neutral-500">Mastery</p>
						</div>
					</div>
					<Button onClick={handleRestart} className="gap-2">
						<RotateCcw className="h-4 w-4" />
						Study Again
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
						<Layers className="h-5 w-5 text-blue-500" />
						<span className="font-medium text-neutral-900 dark:text-white">
							{deck.title}
						</span>
					</div>
					<div className="flex items-center gap-2">
						<Button variant="ghost" size="icon" onClick={handleShuffle} className="h-8 w-8">
							<Shuffle className="h-4 w-4" />
						</Button>
						<span className="text-sm text-neutral-500">
							{currentIndex + 1} of {cards.length}
						</span>
					</div>
				</div>
				<Progress value={progress} className="h-2" />
			</div>
			<div className="p-6">
				<div
					className="relative w-full h-64 cursor-pointer perspective-1000"
					onClick={handleFlip}
				>
					<motion.div
						className="absolute inset-0"
						animate={{ rotateY: isFlipped ? 180 : 0 }}
						transition={{ duration: 0.6, type: "spring" }}
						style={{ transformStyle: "preserve-3d" }}
					>
						<div
							className={cn(
								"absolute inset-0 flex flex-col items-center justify-center p-6 rounded-xl border-2 backface-hidden",
								"bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-neutral-800 dark:to-neutral-800",
								"border-blue-200 dark:border-blue-500/30"
							)}
						>
							<p className="text-xl font-medium text-neutral-900 dark:text-white text-center">
								{card?.front}
							</p>
							<p className="mt-4 text-sm text-neutral-500">Click to flip</p>
						</div>
						<div
							className={cn(
								"absolute inset-0 flex flex-col items-center justify-center p-6 rounded-xl border-2 backface-hidden",
								"bg-gradient-to-br from-purple-50 to-pink-50 dark:from-neutral-800 dark:to-neutral-800",
								"border-purple-200 dark:border-purple-500/30"
							)}
							style={{ transform: "rotateY(180deg)" }}
						>
							<p className="text-xl font-medium text-neutral-900 dark:text-white text-center">
								{card?.back}
							</p>
						</div>
					</motion.div>
				</div>
				<AnimatePresence>
					{
						showHint && card?.hint && card?.id && (
							<motion.div
								initial={{ opacity: 0, height: 0 }}
								animate={{ opacity: 1, height: "auto" }}
								exit={{ opacity: 0, height: 0 }}
								className="mt-4 p-4 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20"
							>
								<div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
									<Lightbulb className="h-4 w-4" />
									<span className="text-sm font-medium">Hint:</span>
								</div>
								<p className="text-sm text-amber-800 dark:text-amber-300 mt-1">
									{card?.hint}
								</p>
							</motion.div>
						)
					}
				</AnimatePresence>
			</div>
			<div className="p-4 border-t border-neutral-200 dark:border-neutral-800">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<Button variant="outline" size="icon" onClick={handlePrevious} disabled={currentIndex === 0}>
							<ChevronLeft className="h-4 w-4" />
						</Button>
						<Button variant="outline" size="icon" onClick={handleNext} disabled={currentIndex === cards.length - 1}>
							<ChevronRight className="h-4 w-4" />
						</Button>
						{
							card?.hint && card?.id && !isFlipped && (
								<Button
									variant="outline"
									size="sm"
									onClick={(e) => {
										e.stopPropagation();
										setShowHint(!showHint);
									}}
									className="gap-2"
								>
									<Lightbulb className="h-4 w-4" />
									Hint
								</Button>
							)
						}
					</div>
					{
						isFlipped && (
							<div className="flex items-center gap-2">
								<Button
									variant="outline"
									className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-500/10"
									onClick={() => handleResponse(false)}
								>
									<ThumbsDown className="h-4 w-4" />
									Need Review
								</Button>
								<Button
									variant="outline"
									className="gap-2 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-500/10"
									onClick={() => handleResponse(true)}
								>
									<ThumbsUp className="h-4 w-4" />
									Got It!
								</Button>
							</div>
						)
					}
				</div>
			</div>
		</div>
	);
}