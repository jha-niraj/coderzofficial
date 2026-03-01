"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
	FileText,
	FileQuestion,
	Code,
	Image as ImageIcon,
	Video,
	FileCode,
	Rocket,
	Mic,
	StickyNote,
	Layers,
	Send,
	Sparkles,
	Loader2,
	ChevronDown,
	ChevronUp,
} from "lucide-react";
import { Button } from "@repo/ui/components/ui/button";
import { Textarea } from "@repo/ui/components/ui/textarea";
import { cn } from "@repo/ui/lib/utils";
import { generateExplanation, generateQuiz } from "@/actions/(main)/studios/ai-generation.actions";
import { saveStep } from "@/actions/(main)/studios/studio.actions";
import toast from "@repo/ui/components/ui/sonner";
import type { StudioStepType, StudioStep } from "@/types/studios";
import { useStudioStore } from "@/app/store/studioStore";

interface AIInputPanelProps {
	studioId: string;
	onContentAdded?: () => void;
	/** External prompt from text selection - will be pre-filled as EXPLANATION */
	externalPrompt?: string | null;
	/** Callback when external prompt has been consumed */
	onExternalPromptConsumed?: () => void;
}

interface ContentTypeOption {
	type: StudioStepType;
	label: string;
	icon: React.ComponentType<{ className?: string }>;
	description: string;
	category: "basic" | "interactive" | "resource";
	comingSoon?: boolean;
}

const CONTENT_TYPES: ContentTypeOption[] = [
	{
		type: "EXPLANATION",
		label: "Explanation",
		icon: FileText,
		description: "AI-generated detailed explanation",
		category: "basic",
	},
	{
		type: "QUIZ",
		label: "Quiz",
		icon: FileQuestion,
		description: "Test your knowledge",
		category: "interactive",
	},
	{
		type: "CODE",
		label: "Code",
		icon: Code,
		description: "Coding challenge",
		category: "interactive",
		comingSoon: true,
	},
	{
		type: "NOTE",
		label: "Note",
		icon: StickyNote,
		description: "Write personal notes",
		category: "basic",
	},
	{
		type: "FLASHCARD",
		label: "Flashcards",
		icon: Layers,
		description: "Study with flashcards",
		category: "interactive",
		comingSoon: true,
	},
	{
		type: "IMAGE",
		label: "Image",
		icon: ImageIcon,
		description: "AI-generated image",
		category: "resource",
		comingSoon: true,
	},
	{
		type: "VIDEO",
		label: "Video",
		icon: Video,
		description: "YouTube resource",
		category: "resource",
		comingSoon: true,
	},
	{
		type: "DOCUMENT",
		label: "Document",
		icon: FileCode,
		description: "External resource",
		category: "resource",
		comingSoon: true,
	},
	{
		type: "PROJECT",
		label: "Project",
		icon: Rocket,
		description: "Project suggestions",
		category: "interactive",
		comingSoon: true,
	},
	{
		type: "MOCK_INTERVIEW",
		label: "Interview",
		icon: Mic,
		description: "Mock interview practice",
		category: "interactive",
		comingSoon: true,
	},
];

export function AIInputPanel({ studioId, onContentAdded, externalPrompt, onExternalPromptConsumed }: AIInputPanelProps) {
	const [selectedType, setSelectedType] = useState<StudioStepType>("EXPLANATION");
	const [prompt, setPrompt] = useState("");
	const [isGenerating, setIsGenerating] = useState(false);
	const [showAllTypes, setShowAllTypes] = useState(false);

	// Zustand store actions
	const addStep = useStudioStore((s) => s.addStep);
	const addPendingStep = useStudioStore((s) => s.addPendingStep);
	const removePendingStep = useStudioStore((s) => s.removePendingStep);
	const updatePendingStep = useStudioStore((s) => s.updatePendingStep);
	const storeExternalPrompt = useStudioStore((s) => s.externalPrompt);
	const setStoreExternalPrompt = useStudioStore((s) => s.setExternalPrompt);

	// Handle external prompt from text selection (prop-based)
	useEffect(() => {
		if (externalPrompt) {
			setSelectedType("EXPLANATION");
			setPrompt(externalPrompt);
			onExternalPromptConsumed?.();
		}
	}, [externalPrompt, onExternalPromptConsumed]);

	// Handle external prompt from store
	useEffect(() => {
		if (storeExternalPrompt) {
			setSelectedType("EXPLANATION");
			setPrompt(storeExternalPrompt);
			setStoreExternalPrompt(null);
		}
	}, [storeExternalPrompt, setStoreExternalPrompt]);

	const selectedOption = CONTENT_TYPES.find((t) => t.type === selectedType);

	const handleGenerate = async () => {
		if (!prompt.trim() || isGenerating) return;

		const option = CONTENT_TYPES.find((t) => t.type === selectedType);
		if (option?.comingSoon) {
			toast.info("This feature is coming soon!");
			return;
		}

		setIsGenerating(true);

		// Add a pending step to the store for real-time skeleton display
		const pendingId = `pending_${Date.now()}`;
		addPendingStep({
			id: pendingId,
			type: selectedType,
			prompt: prompt.trim(),
			status: "generating",
			createdAt: new Date(),
		});

		try {
			let result: { success: boolean; step?: StudioStep; error?: string };

			switch (selectedType) {
				case "EXPLANATION":
					result = await generateExplanation(studioId, prompt);
					break;

				case "QUIZ":
					result = await generateQuiz(studioId, prompt, 5, "medium");
					break;

				case "NOTE": {
					// Create a note step directly
					result = await saveStep({
						studioId,
						type: "NOTE",
						content: prompt.trim(),
						metadata: { editorType: "rich" },
						source: "USER",
					});
					break;
				}

				default:
					toast.info("This content type is not yet implemented");
					removePendingStep(pendingId);
					setIsGenerating(false);
					return;
			}

			if (result.success && result.step) {
				// Remove pending and add the real step to the store
				removePendingStep(pendingId);
				addStep(result.step);
				toast.success("Content generated successfully!");
				setPrompt("");
				onContentAdded?.();
			} else {
				// Mark pending as error
				updatePendingStep(pendingId, {
					status: "error",
					errorMessage: result.error || "Failed to generate content",
				});
				// Remove after a moment
				setTimeout(() => removePendingStep(pendingId), 3000);
				toast.error(result.error || "Failed to generate content");
			}
		} catch (error) {
			console.error("Generation error:", error);
			updatePendingStep(pendingId, {
				status: "error",
				errorMessage: "An error occurred while generating content",
			});
			setTimeout(() => removePendingStep(pendingId), 3000);
			toast.error("An error occurred while generating content");
		}

		setIsGenerating(false);
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleGenerate();
		}
	};

	const primaryTypes = CONTENT_TYPES.filter((t) => !t.comingSoon).slice(0, 4);
	const displayTypes = showAllTypes ? CONTENT_TYPES : primaryTypes;

	return (
		<div className="border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
			<div className="max-w-4xl mx-auto px-6 py-4">
				{/* Content type selector */}
				<div className="mb-3">
					<div className="flex items-center justify-between mb-2">
						<p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
							What would you like to add?
						</p>
						{CONTENT_TYPES.length > 4 && (
							<Button
								variant="ghost"
								size="sm"
								onClick={() => setShowAllTypes(!showAllTypes)}
								className="h-7 text-xs"
							>
								{showAllTypes ? (
									<>
										<ChevronUp className="h-3 w-3 mr-1" />
										Show less
									</>
								) : (
									<>
										<ChevronDown className="h-3 w-3 mr-1" />
										More options
									</>
								)}
							</Button>
						)}
					</div>

					<div className="flex flex-wrap gap-2">
						{displayTypes.map((option) => {
							const Icon = option.icon;
							const isSelected = selectedType === option.type;

							return (
								<button
									key={option.type}
									onClick={() => setSelectedType(option.type)}
									disabled={option.comingSoon}
									className={cn(
										"flex items-center gap-2 px-3 py-2 rounded-lg border transition-all",
										isSelected
											? "border-purple-500 bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300"
											: "border-neutral-200 dark:border-neutral-800 hover:border-purple-300 dark:hover:border-purple-700 text-neutral-700 dark:text-neutral-300",
										option.comingSoon && "opacity-50 cursor-not-allowed"
									)}
								>
									<Icon className="h-4 w-4" />
									<span className="text-sm font-medium">{option.label}</span>
									{option.comingSoon && (
										<span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400">
											Soon
										</span>
									)}
								</button>
							);
						})}
					</div>
				</div>

				{/* Input area */}
				<div className="flex gap-3">
					<div className="flex-1 relative">
						<Textarea
							value={prompt}
							onChange={(e) => setPrompt(e.target.value)}
							onKeyDown={handleKeyDown}
							placeholder={
								selectedType === "EXPLANATION"
									? "e.g., Explain JavaScript closures with examples"
									: selectedType === "QUIZ"
										? "e.g., Create a quiz on React hooks"
										: selectedType === "NOTE"
											? "Click to add a personal note"
											: `Ask AI to generate ${selectedOption?.label.toLowerCase()}...`
							}
							className="min-h-[60px] max-h-[120px] pr-12 resize-none rounded-xl border-neutral-200 dark:border-neutral-800 focus:border-purple-500 dark:focus:border-purple-500"
							disabled={isGenerating}
						/>
						<div className="absolute bottom-2 right-2">
							<Button
								onClick={handleGenerate}
								disabled={!prompt.trim() || isGenerating}
								size="icon"
								className="h-8 w-8 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
							>
								{isGenerating ? (
									<Loader2 className="h-4 w-4 animate-spin" />
								) : (
									<Send className="h-4 w-4" />
								)}
							</Button>
						</div>
					</div>
				</div>

				{/* Hint */}
				{selectedOption && (
					<motion.p
						key={selectedType}
						initial={{ opacity: 0, y: -5 }}
						animate={{ opacity: 1, y: 0 }}
						className="text-xs text-neutral-500 dark:text-neutral-400 mt-2 flex items-center gap-1"
					>
						<Sparkles className="h-3 w-3" />
						{selectedOption.description}
					</motion.p>
				)}
			</div>
		</div>
	);
}
