"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
	ArrowLeft, Save, Settings, PanelRight, PanelRightClose, Globe, Lock,
	MoreVertical, Trash2, Clock, Users
} from "lucide-react";
import { format } from "date-fns";
import { Button } from "@repo/ui/components/ui/button";
import {
	DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
	DropdownMenuSeparator
} from "@repo/ui/components/ui/dropdown-menu";
import { Badge } from "@repo/ui/components/ui/badge";
import toast from "@repo/ui/components/ui/sonner";
import { updateStudio, deleteStudio } from "@/actions/(main)/studios/studio.action";
import StudioBlockEditor from "./studio-block-editor";
import StudioAIPanel from "./studio-ai-panel";
import { cn } from "@repo/ui/lib/utils";
import type {
	StudioEditorProps, BlockContent
} from "@/types/studio";
import { Input } from "@repo/ui/components/ui/input";

export default function StudioEditor({ studio }: StudioEditorProps) {
	const router = useRouter();
	const [title, setTitle] = useState(studio.title);
	const [content, setContent] = useState(studio.content);
	const [isSaving, setIsSaving] = useState(false);
	const [lastSaved, setLastSaved] = useState<Date | null>(null);
	const [showAIPanel, setShowAIPanel] = useState(true);
	const [hasChanges, setHasChanges] = useState(false);

	// Auto-save functionality
	const saveStudio = useCallback(async () => {
		if (!hasChanges) return;

		setIsSaving(true);
		const result = await updateStudio(studio.id, {
			title,
			content,
		});

		if (result.error) {
			toast.error(result.error);
		} else {
			setLastSaved(new Date());
			setHasChanges(false);
		}
		setIsSaving(false);
	}, [studio.id, title, content, hasChanges]);

	// Auto-save every 30 seconds if there are changes
	useEffect(() => {
		const interval = setInterval(() => {
			if (hasChanges) {
				saveStudio();
			}
		}, 30000);

		return () => clearInterval(interval);
	}, [hasChanges, saveStudio]);

	// Save on Ctrl+S
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if ((e.metaKey || e.ctrlKey) && e.key === "s") {
				e.preventDefault();
				saveStudio();
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [saveStudio]);

	const handleContentChange = (newContent: BlockContent) => {
		setContent(newContent);
		setHasChanges(true);
	};

	const handleTitleChange = (newTitle: string) => {
		setTitle(newTitle);
		setHasChanges(true);
	};

	const handleDelete = async () => {
		const result = await deleteStudio(studio.id);
		if (result.error) {
			toast.error(result.error);
		} else {
			toast.success("Studio deleted");
			router.push("/studio");
		}
	};

	return (
		<div className="flex h-screen bg-white dark:bg-neutral-950">
			<div className={cn(
				"flex-1 flex flex-col overflow-hidden transition-all duration-300",
				showAIPanel ? "mr-0" : "mr-0"
			)}>
				<div className="h-14 border-b border-neutral-200 dark:border-neutral-800 flex items-center px-4 gap-4 bg-white dark:bg-neutral-950">
					<Button
						variant="ghost"
						size="icon"
						onClick={() => router.push("/studio")}
						className="shrink-0"
					>
						<ArrowLeft className="h-4 w-4" />
					</Button>
					<Input
						type="text"
						value={title}
						onChange={(e) => handleTitleChange(e.target.value)}
						className="flex-1 text-lg font-semibold bg-transparent border-none outline-none text-neutral-900 dark:text-white placeholder:text-neutral-400"
						placeholder="Untitled Studio"
					/>
					<div className="flex items-center gap-2 text-sm text-neutral-500">
						{
							isSaving ? (
								<motion.div
									className="flex items-center gap-2"
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
								>
									<motion.div
										className="h-3 w-3 border-2 border-primary/30 border-t-primary rounded-full"
										animate={{ rotate: 360 }}
										transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
									/>
									<span>Saving...</span>
								</motion.div>
							) : lastSaved ? (
								<div className="flex items-center gap-1">
									<Clock className="h-3 w-3" />
									<span>Saved {format(lastSaved, "h:mm a")}</span>
								</div>
							) : hasChanges ? (
								<span className="text-amber-500">Unsaved changes</span>
							) : null
						}
					</div>
					<div className="flex items-center gap-2">
						<Badge variant="outline" className="gap-1">
							{
								studio.visibility === "PUBLIC" ? (
									<>
										<Globe className="h-3 w-3" />
										Public
									</>
								) : studio.visibility === "COMMUNITY" ? (
									<>
										<Users className="h-3 w-3" />
										Community
									</>
								) : (
									<>
										<Lock className="h-3 w-3" />
										Private
									</>
								)
							}
						</Badge>
						<Button
							variant="outline"
							size="sm"
							onClick={saveStudio}
							disabled={isSaving || !hasChanges}
							className="gap-2"
						>
							<Save className="h-4 w-4" />
							Save
						</Button>
						<Button
							variant="ghost"
							size="icon"
							onClick={() => setShowAIPanel(!showAIPanel)}
							className="shrink-0"
						>
							{
								showAIPanel ? (
									<PanelRightClose className="h-4 w-4" />
								) : (
									<PanelRight className="h-4 w-4" />
								)
							}
						</Button>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="ghost" size="icon" className="shrink-0">
									<MoreVertical className="h-4 w-4" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								<DropdownMenuItem onClick={() => toast.info("Settings coming soon!")}>
									<Settings className="h-4 w-4 mr-2" />
									Settings
								</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuItem
									className="text-red-600 dark:text-red-400"
									onClick={handleDelete}
								>
									<Trash2 className="h-4 w-4 mr-2" />
									Delete Studio
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</div>
				<div className="flex-1 overflow-y-auto">
					<StudioBlockEditor
						studioId={studio.id}
						content={content}
						onChange={handleContentChange}
						quizzes={studio.quizzes}
						flashcardDecks={studio.flashcardDecks}
						codeBlocks={studio.codeBlocks}
						mediaBlocks={studio.mediaBlocks}
					/>
				</div>
			</div>
			<AnimatePresence>
				{
					showAIPanel && (
						<motion.div
							initial={{ width: 0, opacity: 0 }}
							animate={{ width: 380, opacity: 1 }}
							exit={{ width: 0, opacity: 0 }}
							transition={{ duration: 0.3 }}
							className="border-l border-neutral-200 dark:border-neutral-800 flex flex-col overflow-hidden bg-white dark:bg-neutral-950"
						>
							<StudioAIPanel
								studioId={studio.id}
								initialMessages={studio.chatHistory}
							/>
						</motion.div>
					)
				}
			</AnimatePresence>
		</div>
	);
}