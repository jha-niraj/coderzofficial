"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Textarea } from "@repo/ui/components/ui/textarea";
import { StickyNote, Save, Check } from "lucide-react";
import { Button } from "@repo/ui/components/ui/button";
import { saveStep } from "@/actions/(main)/studios/studio.actions";
import toast from "@repo/ui/components/ui/sonner";
import type { StudioStep } from "@/types/studios";

interface NoteStepProps {
	step: StudioStep;
	studioId: string;
}

export function NoteStep({ step, studioId }: NoteStepProps) {
	const [content, setContent] = useState(step.content || "");
	const [isSaving, setIsSaving] = useState(false);
	const [isSaved, setIsSaved] = useState(true);
	const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null);

	useEffect(() => {
		// Debounced auto-save
		if (content !== step.content) {
			setIsSaved(false);

			if (saveTimeout) {
				clearTimeout(saveTimeout);
			}

			const timeout = setTimeout(() => {
				handleSave();
			}, 2000);

			setSaveTimeout(timeout);
		}

		return () => {
			if (saveTimeout) {
				clearTimeout(saveTimeout);
			}
		};
	}, [content]);

	const handleSave = async () => {
		if (content === step.content) return;

		setIsSaving(true);
		const result = await saveStep({
			studioId,
			stepId: step.id,
			type: "NOTE",
			content,
			metadata: { editorType: "markdown" },
			source: "USER",
		});

		setIsSaving(false);

		if (result.success) {
			setIsSaved(true);
			setTimeout(() => setIsSaved(false), 2000);
		} else {
			toast.error(result.error || "Failed to save note");
		}
	};

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			className="py-8"
		>
			<div className="rounded-2xl bg-amber-50 dark:bg-amber-950/10 p-6">
				<div className="flex items-center justify-between mb-4">
					<div className="flex items-center gap-2">
						<StickyNote className="h-5 w-5 text-amber-600 dark:text-amber-400" />
						<span className="text-sm font-medium text-amber-900 dark:text-amber-100">
							Personal Note
						</span>
					</div>

					<div className="flex items-center gap-2">
						{isSaving && (
							<span className="text-xs text-neutral-500 flex items-center gap-1">
								<Save className="h-3 w-3 animate-pulse" />
								Saving...
							</span>
						)}
						{isSaved && !isSaving && (
							<motion.span
								initial={{ opacity: 0, scale: 0.8 }}
								animate={{ opacity: 1, scale: 1 }}
								className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1"
							>
								<Check className="h-3 w-3" />
								Saved
							</motion.span>
						)}
						{!isSaved && !isSaving && (
							<Button
								size="sm"
								variant="ghost"
								onClick={handleSave}
								className="h-7 text-xs"
							>
								<Save className="h-3 w-3 mr-1" />
								Save
							</Button>
						)}
					</div>
				</div>

				<Textarea
					value={content}
					onChange={(e) => setContent(e.target.value)}
					placeholder="Write your personal notes here... You can use markdown formatting."
					className="min-h-[200px] bg-white dark:bg-neutral-900 border-amber-200 dark:border-amber-900/30 focus:border-amber-400 dark:focus:border-amber-600 resize-none"
				/>

				<p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
					💡 Tip: Use markdown for formatting (# headings, **bold**, *italic*, etc.)
				</p>
			</div>
		</motion.div>
	);
}