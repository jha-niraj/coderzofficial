"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { v4 as uuidv4 } from "uuid";
import {
	Type, Heading1, Heading2, Heading3, List, ListOrdered, Code, Image as ImageIcon, 
	Video, FileQuestion, Layers, Quote, Minus, CheckSquare, Mic, Plus, GripVertical, 
	Trash2, Sparkles
} from "lucide-react";
import { Button } from "@repo/ui/components/ui/button";
import { cn } from "@repo/ui/lib/utils";
import toast from "@repo/ui/components/ui/sonner";
import StudioQuizBlock from "./blocks/quiz-block";
import StudioFlashcardBlock from "./blocks/flashcard-block";
import StudioCodeBlock from "./blocks/code-block";
import StudioImageBlock from "./blocks/image-block";
import StudioVideoBlock from "./blocks/video-block";
import StudioMockBlock from "./blocks/mock-block";
import {
	generateQuiz, generateFlashcards, generateImage
} from "@/actions/(main)/studios/studio.action";
import type {
	EditorBlock, BlockContent, StudioQuiz, StudioFlashcardDeck,
	StudioCodeBlock as CodeBlockType, StudioMediaBlock
} from "@/types/studio";
import { Textarea } from "@repo/ui/components/ui/textarea";

interface StudioBlockEditorProps {
	studioId: string;
	content: BlockContent | null;
	onChange: (content: BlockContent) => void;
	quizzes: StudioQuiz[];
	flashcardDecks: StudioFlashcardDeck[];
	codeBlocks: CodeBlockType[];
	mediaBlocks: StudioMediaBlock[];
}

interface LocalSlashCommand {
	type: string;
	label: string;
	description: string;
	icon: React.ComponentType<{ className?: string }>;
	isAI?: boolean;
	comingSoon?: boolean;
}

const SLASH_COMMANDS: LocalSlashCommand[] = [
	{ type: "text", label: "Text", description: "Plain text block", icon: Type },
	{ type: "h1", label: "Heading 1", description: "Large heading", icon: Heading1 },
	{ type: "h2", label: "Heading 2", description: "Medium heading", icon: Heading2 },
	{ type: "h3", label: "Heading 3", description: "Small heading", icon: Heading3 },
	{ type: "bullet", label: "Bullet List", description: "Unordered list", icon: List },
	{ type: "numbered", label: "Numbered List", description: "Ordered list", icon: ListOrdered },
	{ type: "todo", label: "To-do List", description: "Checklist items", icon: CheckSquare },
	{ type: "quote", label: "Quote", description: "Blockquote", icon: Quote },
	{ type: "divider", label: "Divider", description: "Horizontal line", icon: Minus },
	{ type: "code", label: "Code Block", description: "Code with syntax highlighting", icon: Code },
	{ type: "quiz", label: "AI Quiz", description: "Generate quiz with AI", icon: FileQuestion, isAI: true },
	{ type: "flashcard", label: "AI Flashcards", description: "Generate flashcards with AI", icon: Layers, isAI: true },
	{ type: "image", label: "AI Image", description: "Generate image with AI", icon: ImageIcon, isAI: true },
	{ type: "video", label: "Video", description: "Coming soon", icon: Video, comingSoon: true },
	{ type: "mock", label: "Mock Interview", description: "Coming soon", icon: Mic, comingSoon: true },
];

export default function StudioBlockEditor({
	studioId,
	content,
	onChange,
	quizzes,
	flashcardDecks,
	codeBlocks,
	mediaBlocks,
}: StudioBlockEditorProps) {
	const [blocks, setBlocks] = useState<EditorBlock[]>(content?.blocks || []);
	const [showSlashMenu, setShowSlashMenu] = useState(false);
	const [slashMenuPosition, setSlashMenuPosition] = useState({ top: 0, left: 0 });
	const [slashFilter, setSlashFilter] = useState("");
	const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
	const [selectedCommandIndex, setSelectedCommandIndex] = useState(0);
	const [generatingBlock, setGeneratingBlock] = useState<string | null>(null);
	const [aiPrompt, setAiPrompt] = useState("");
	const [showAiPrompt, setShowAiPrompt] = useState<{ blockId: string; type: string } | null>(null);
	const editorRef = useRef<HTMLDivElement>(null);

	// Update parent when blocks change
	useEffect(() => {
		onChange({ blocks });
	}, [blocks, onChange]);

	// Filter commands based on slash input
	const filteredCommands = SLASH_COMMANDS.filter((cmd) =>
		cmd.label.toLowerCase().includes(slashFilter.toLowerCase()) ||
		cmd.description.toLowerCase().includes(slashFilter.toLowerCase())
	);

	const addBlock = useCallback((type: string, afterId?: string) => {
		const newBlock: EditorBlock = {
			id: uuidv4(),
			type,
			content: "",
		};

		setBlocks((prev) => {
			if (afterId) {
				const index = prev.findIndex((b) => b.id === afterId);
				if (index !== -1) {
					const newBlocks = [...prev];
					newBlocks.splice(index + 1, 0, newBlock);
					return newBlocks;
				}
			}
			return [...prev, newBlock];
		});

		setShowSlashMenu(false);
		setSlashFilter("");
		setActiveBlockId(newBlock.id);

		return newBlock;
	}, []);

	const updateBlock = useCallback((id: string, updates: Partial<EditorBlock>) => {
		setBlocks((prev) =>
			prev.map((block) => (block.id === id ? { ...block, ...updates } : block))
		);
	}, []);

	const deleteBlock = useCallback((id: string) => {
		setBlocks((prev) => prev.filter((block) => block.id !== id));
		setActiveBlockId(null);
	}, []);

	const handleSelectCommand = useCallback(async (type: string, blockId: string) => {
		setShowSlashMenu(false);
		setSlashFilter("");

		const command = SLASH_COMMANDS.find((c) => c.type === type);
		if (command?.comingSoon) {
			toast.info("This feature is coming soon!");
			return;
		}

		// For AI blocks, show prompt input
		if (command?.isAI) {
			setShowAiPrompt({ blockId, type });
			return;
		}

		// Regular blocks
		if (type === "code") {
			updateBlock(blockId, { type, data: { language: "javascript", code: "" } });
		} else {
			updateBlock(blockId, { type, content: "" });
		}
	}, [updateBlock]);

	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent, blockId: string) => {
			const target = e.target as HTMLElement;
			const content = target.textContent || "";

			// Slash command
			if (e.key === "/" && content === "") {
				e.preventDefault();
				const rect = target.getBoundingClientRect();
				const editorRect = editorRef.current?.getBoundingClientRect();
				if (editorRect) {
					setSlashMenuPosition({
						top: rect.bottom - editorRect.top + 4,
						left: rect.left - editorRect.left,
					});
				}
				setShowSlashMenu(true);
				setSlashFilter("");
				setSelectedCommandIndex(0);
			}

			// Navigate slash menu
			if (showSlashMenu) {
				if (e.key === "ArrowDown") {
					e.preventDefault();
					setSelectedCommandIndex((prev) =>
						prev < filteredCommands.length - 1 ? prev + 1 : 0
					);
				} else if (e.key === "ArrowUp") {
					e.preventDefault();
					setSelectedCommandIndex((prev) =>
						prev > 0 ? prev - 1 : filteredCommands.length - 1
					);
				} else if (e.key === "Enter") {
					e.preventDefault();
					const command = filteredCommands[selectedCommandIndex];
					if (command && !command.comingSoon) {
						handleSelectCommand(command.type, blockId);
					}
				} else if (e.key === "Escape") {
					setShowSlashMenu(false);
					setSlashFilter("");
				}
			}

			// Enter to create new block
			if (e.key === "Enter" && !showSlashMenu && !e.shiftKey) {
				e.preventDefault();
				addBlock("text", blockId);
			}

			// Backspace on empty block
			if (e.key === "Backspace" && content === "") {
				e.preventDefault();
				if (blocks.length > 1) {
					deleteBlock(blockId);
					const index = blocks.findIndex((b) => b.id === blockId);
					if (index > 0) {
						setActiveBlockId(blocks[index - 1]?.id || "");
					}
				}
			}
		},
		[showSlashMenu, filteredCommands, selectedCommandIndex, blocks, addBlock, deleteBlock, handleSelectCommand]
	);

	const handleAIGenerate = async () => {
		if (!showAiPrompt || !aiPrompt.trim()) return;

		const { blockId, type } = showAiPrompt;
		setGeneratingBlock(blockId);
		setShowAiPrompt(null);

		try {
			if (type === "quiz") {
				const result = await generateQuiz(studioId, blockId, aiPrompt, 5, "medium");
				if (result.error) {
					toast.error(result.error);
				} else {
					updateBlock(blockId, { type: "quiz", data: { quizId: result.quiz?.id, topic: aiPrompt } });
					toast.success("Quiz generated successfully!");
				}
			} else if (type === "flashcard") {
				const result = await generateFlashcards(studioId, blockId, aiPrompt, 10);
				if (result.error) {
					toast.error(result.error);
				} else {
					updateBlock(blockId, { type: "flashcard", data: { deckId: result.deck?.id, topic: aiPrompt } });
					toast.success("Flashcards generated successfully!");
				}
			} else if (type === "image") {
				const result = await generateImage(studioId, blockId, aiPrompt);
				if (result.error) {
					toast.error(result.error);
				} else {
					updateBlock(blockId, { type: "image", data: { mediaId: result.mediaBlock?.id, url: result.imageUrl, prompt: aiPrompt } });
					toast.success("Image generated successfully!");
				}
			}
		} catch (error) {
			toast.error("Failed to generate content");
		}

		setGeneratingBlock(null);
		setAiPrompt("");
	};

	const renderBlock = (block: EditorBlock, index: number) => {
		const isGenerating = generatingBlock === block.id;

		// Loading state for AI blocks
		if (isGenerating) {
			return (
				<div className="flex items-center justify-center py-12 bg-neutral-50 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800">
					<div className="flex flex-col items-center gap-4">
						<motion.div
							className="relative"
							animate={{ rotate: 360 }}
							transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
						>
							<div className="h-12 w-12 rounded-full border-4 border-purple-500/20 border-t-purple-500" />
						</motion.div>
						<div className="text-center">
							<p className="font-medium text-neutral-900 dark:text-white">
								Generating with AI...
							</p>
							<p className="text-sm text-neutral-500">This may take a few seconds</p>
						</div>
						<motion.div
							className="w-64 h-2 rounded-full bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"
							animate={{ x: [-256, 256] }}
							transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
						/>
					</div>
				</div>
			);
		}

		switch (block.type) {
			case "quiz":
				const quiz = quizzes.find((q) => q.id === block.data?.quizId);
				return <StudioQuizBlock quiz={quiz} topic={block.data?.topic} />;

			case "flashcard":
				const deck = flashcardDecks.find((d) => d.id === block.data?.deckId);
				return <StudioFlashcardBlock deck={deck} topic={block.data?.topic} />;

			case "code":
				const codeBlock = codeBlocks.find((c) => c.blockId === block.id);
				return (
					<StudioCodeBlock
						studioId={studioId}
						blockId={block.id}
						initialData={codeBlock || block.data}
						onChange={(data: any) => updateBlock(block.id, { data })}
					/>
				);

			case "image":
				const media = mediaBlocks.find((m) => m.blockId === block.id);
				return <StudioImageBlock media={media} data={block.data as { url: string; prompt: string } | undefined} />;

			case "video":
				return <StudioVideoBlock />;

			case "mock":
				return <StudioMockBlock />;

			case "divider":
				return <hr className="my-4 border-neutral-200 dark:border-neutral-800" />;

			case "quote":
				return (
					<blockquote
						contentEditable
						suppressContentEditableWarning
						className="border-l-4 border-purple-500 pl-4 py-2 italic text-neutral-600 dark:text-neutral-400 outline-none"
						onInput={(e) => updateBlock(block.id, { content: e.currentTarget.textContent || "" })}
						onKeyDown={(e) => handleKeyDown(e, block.id)}
					>
						{block.content || "Quote..."}
					</blockquote>
				);

			default:
				return (
					<div
						contentEditable
						suppressContentEditableWarning
						className={cn(
							"outline-none py-1",
							block.type === "h1" && "text-3xl font-bold",
							block.type === "h2" && "text-2xl font-semibold",
							block.type === "h3" && "text-xl font-medium",
							block.type === "bullet" && "before:content-['•'] before:mr-2",
							block.type === "numbered" && `before:content-['${index + 1}.'] before:mr-2`,
							block.type === "todo" && "flex items-center gap-2",
							block.type === "text" && "text-base"
						)}
						onInput={(e) => {
							const text = e.currentTarget.textContent || "";
							// Check for slash command typing
							if (text.startsWith("/")) {
								setSlashFilter(text.slice(1));
							} else {
								updateBlock(block.id, { content: text });
							}
						}}
						onKeyDown={(e) => handleKeyDown(e, block.id)}
						onFocus={() => setActiveBlockId(block.id)}
						data-placeholder={block.type === "text" ? "Type '/' for commands..." : ""}
					>
						{
							block.type === "todo" && (
								<input
									type="checkbox"
									className="h-4 w-4 rounded border-neutral-300 dark:border-neutral-600"
									checked={block.data?.checked || false}
									onChange={(e) => updateBlock(block.id, { data: { ...block.data, checked: e.target.checked } })}
									onClick={(e) => e.stopPropagation()}
								/>
							)
						}
						{block.content}
					</div>
				);
		}
	};

	return (
		<div ref={editorRef} className="relative max-w-3xl mx-auto px-8 py-12">
			{
				blocks.length === 0 && (
					<div className="text-center py-12">
						<p className="text-neutral-500 dark:text-neutral-400 mb-4">
							Start writing, or press{" "}
							<kbd className="px-2 py-1 bg-neutral-100 dark:bg-neutral-800 rounded text-sm font-mono">
								/
							</kbd>{" "}
							for commands
						</p>
						<Button
							variant="outline"
							onClick={() => addBlock("text")}
							className="gap-2"
						>
							<Plus className="h-4 w-4" />
							Add Block
						</Button>
					</div>
				)
			}
			<div className="space-y-2">
				{
					blocks.map((block, index) => (
						<div
							key={block.id}
							className={cn(
								"group relative pl-8",
								activeBlockId === block.id && "bg-neutral-50 dark:bg-neutral-900/50 -mx-4 px-12 rounded-lg"
							)}
						>
							<div className="absolute left-0 top-1 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
								<Button
									variant="ghost"
									size="icon"
									className="h-6 w-6 cursor-grab"
								>
									<GripVertical className="h-4 w-4 text-neutral-400" />
								</Button>
								<Button
									variant="ghost"
									size="icon"
									className="h-6 w-6"
									onClick={() => addBlock("text", block.id)}
								>
									<Plus className="h-4 w-4 text-neutral-400" />
								</Button>
							</div>
							<Button
								variant="ghost"
								size="icon"
								className="absolute right-0 top-1 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 text-red-500 hover:text-red-600"
								onClick={() => deleteBlock(block.id)}
							>
								<Trash2 className="h-4 w-4" />
							</Button>

							{renderBlock(block, index)}
						</div>
					))
				}
			</div>

			{
				blocks.length > 0 && (
					<div className="pt-8">
						<Button
							variant="ghost"
							onClick={() => addBlock("text")}
							className="w-full justify-start gap-2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
						>
							<Plus className="h-4 w-4" />
							Add block
						</Button>
					</div>
				)
			}

			<AnimatePresence>
				{
					showSlashMenu && (
						<motion.div
							initial={{ opacity: 0, y: -10 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -10 }}
							style={{
								position: "absolute",
								top: slashMenuPosition.top,
								left: slashMenuPosition.left,
							}}
							className="z-50 w-72 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-xl overflow-hidden"
						>
							<div className="p-2 border-b border-neutral-200 dark:border-neutral-800">
								<p className="text-xs font-medium text-neutral-500 px-2">
									Basic blocks
								</p>
							</div>
							<div className="max-h-80 overflow-y-auto p-1">
								{
									filteredCommands.map((command, index) => (
										<button
											key={command.type}
											className={cn(
												"w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors",
												index === selectedCommandIndex
													? "bg-primary/10 text-primary"
													: "hover:bg-neutral-100 dark:hover:bg-neutral-800",
												command.comingSoon && "opacity-50 cursor-not-allowed"
											)}
											onClick={() => {
												if (!command.comingSoon) {
													handleSelectCommand(command.type, activeBlockId || "");
												}
											}}
										>
											<div
												className={cn(
													"h-10 w-10 rounded-lg flex items-center justify-center",
													command.isAI
														? "bg-gradient-to-br from-purple-500/20 to-pink-500/20"
														: "bg-neutral-100 dark:bg-neutral-800"
												)}
											>
												<command.icon
													className={cn(
														"h-5 w-5",
														command.isAI
															? "text-purple-500"
															: "text-neutral-600 dark:text-neutral-400"
													)}
												/>
											</div>
											<div className="flex-1 min-w-0">
												<div className="flex items-center gap-2">
													<p className="font-medium text-neutral-900 dark:text-white text-sm">
														{command.label}
													</p>
													{
														command.isAI && (
															<span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-gradient-to-r from-purple-500 to-pink-500 text-white">
																AI
															</span>
														)
													}
													{
														command.comingSoon && (
															<span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-600">
																Soon
															</span>
														)
													}
												</div>
												<p className="text-xs text-neutral-500 truncate">
													{command.description}
												</p>
											</div>
										</button>
									))
								}
							</div>
						</motion.div>
					)
				}
			</AnimatePresence>
			<AnimatePresence>
				{
					showAiPrompt && (
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
							onClick={() => setShowAiPrompt(null)}
						>
							<motion.div
								initial={{ scale: 0.95, opacity: 0 }}
								animate={{ scale: 1, opacity: 1 }}
								exit={{ scale: 0.95, opacity: 0 }}
								onClick={(e) => e.stopPropagation()}
								className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-2xl"
							>
								<div className="flex items-center gap-3 mb-4">
									<div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
										<Sparkles className="h-5 w-5 text-white" />
									</div>
									<div>
										<h3 className="font-semibold text-neutral-900 dark:text-white">
											{showAiPrompt.type === "quiz" && "Generate Quiz"}
											{showAiPrompt.type === "flashcard" && "Generate Flashcards"}
											{showAiPrompt.type === "image" && "Generate Image"}
										</h3>
										<p className="text-sm text-neutral-500">
											{showAiPrompt.type === "quiz" && "Enter a topic to generate quiz questions"}
											{showAiPrompt.type === "flashcard" && "Enter a topic to generate flashcards"}
											{showAiPrompt.type === "image" && "Describe the image you want to generate"}
										</p>
									</div>
								</div>
								<Textarea
									autoFocus
									value={aiPrompt}
									onChange={(e) => setAiPrompt(e.target.value)}
									placeholder={
										showAiPrompt.type === "quiz"
											? "e.g., JavaScript closures and scope"
											: showAiPrompt.type === "flashcard"
												? "e.g., React hooks and their use cases"
												: "e.g., A futuristic city with flying cars"
									}
									className="w-full h-24 p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800 resize-none outline-none focus:ring-2 focus:ring-purple-500"
									onKeyDown={(e) => {
										if (e.key === "Enter" && !e.shiftKey) {
											e.preventDefault();
											handleAIGenerate();
										}
									}}
								/>

								<div className="flex justify-end gap-2 mt-4">
									<Button variant="outline" onClick={() => setShowAiPrompt(null)}>
										Cancel
									</Button>
									<Button
										onClick={handleAIGenerate}
										disabled={!aiPrompt.trim()}
										className="gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
									>
										<Sparkles className="h-4 w-4" />
										Generate
									</Button>
								</div>
							</motion.div>
						</motion.div>
					)
				}
			</AnimatePresence>
		</div>
	);
}