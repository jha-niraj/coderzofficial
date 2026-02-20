"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
	StickyNote, Save, Check, Bold, Italic, Underline, List,
	ListOrdered, Code, Quote, Heading1, Heading2, Heading3,
	Link as LinkIcon, Undo, Redo
} from "lucide-react";
import { Button } from "@repo/ui/components/ui/button";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import UnderlineExt from "@tiptap/extension-underline";
import LinkExt from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { saveStep } from "@/actions/(main)/studios/studio.actions";
import toast from "@repo/ui/components/ui/sonner";
import type { StudioStep } from "@/types/studios";
import { cn } from "@repo/ui/lib/utils";

interface NoteStepProps {
	step: StudioStep;
	studioId: string;
}

export function NoteStep({ step, studioId }: NoteStepProps) {
	const [isSaving, setIsSaving] = useState(false);
	const [isSaved, setIsSaved] = useState(true);
	const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null);

	const editor = useEditor({
		extensions: [
			StarterKit.configure({
				heading: {
					levels: [1, 2, 3],
				},
				codeBlock: {
					HTMLAttributes: {
						class: "rounded-lg bg-neutral-900 text-neutral-100 p-4 font-mono text-sm my-4",
					},
				},
				blockquote: {
					HTMLAttributes: {
						class: "border-l-4 border-amber-400 pl-4 py-1 my-4 italic text-neutral-600 dark:text-neutral-400",
					},
				},
			}),
			UnderlineExt,
			LinkExt.configure({
				openOnClick: false,
				HTMLAttributes: {
					class: "text-amber-600 dark:text-amber-400 underline cursor-pointer",
				},
			}),
			Placeholder.configure({
				placeholder: "Write your personal notes here...",
			}),
		],
		content: step.content || "",
		editorProps: {
			attributes: {
				class: "prose prose-neutral dark:prose-invert max-w-none min-h-[200px] focus:outline-none px-4 py-3 text-sm leading-relaxed",
			},
		},
		onUpdate: ({ editor: ed }) => {
			setIsSaved(false);

			if (saveTimeout) {
				clearTimeout(saveTimeout);
			}

			const timeout = setTimeout(() => {
				handleSave(ed.getHTML());
			}, 2000);

			setSaveTimeout(timeout);
		},
	});

	useEffect(() => {
		return () => {
			if (saveTimeout) {
				clearTimeout(saveTimeout);
			}
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [saveTimeout]);

	const handleSave = useCallback(async (content: string) => {
		if (content === step.content) return;

		setIsSaving(true);
		const result = await saveStep({
			studioId,
			stepId: step.id,
			type: "NOTE",
			content,
			metadata: { editorType: "rich" },
			source: "USER",
		});

		setIsSaving(false);

		if (result.success) {
			setIsSaved(true);
			setTimeout(() => setIsSaved(false), 2000);
		} else {
			toast.error(result.error || "Failed to save note");
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [step.content, step.id, studioId]);

	const handleSetLink = useCallback(() => {
		if (!editor) return;
		const previousUrl = editor.getAttributes("link").href;
		const url = window.prompt("URL", previousUrl);

		if (url === null) return;
		if (url === "") {
			editor.chain().focus().extendMarkRange("link").unsetLink().run();
			return;
		}

		editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
	}, [editor]);

	if (!editor) {
		return (
			<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="py-8">
				<div className="rounded-2xl bg-amber-50 dark:bg-amber-950/10 p-6 animate-pulse">
					<div className="h-[200px]" />
				</div>
			</motion.div>
		);
	}

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			className="py-8"
		>
			<div className="rounded-2xl bg-amber-50 dark:bg-amber-950/10 overflow-hidden">
				{/* Header */}
				<div className="flex items-center justify-between px-6 pt-5 pb-3">
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
								onClick={() => handleSave(editor.getHTML())}
								className="h-7 text-xs"
							>
								<Save className="h-3 w-3 mr-1" />
								Save
							</Button>
						)}
					</div>
				</div>

				{/* Toolbar */}
				<div className="flex items-center gap-1 px-6 pb-3 flex-wrap border-b border-amber-200 dark:border-amber-900/30">
					<ToolbarButton
						onClick={() => editor.chain().focus().toggleBold().run()}
						active={editor.isActive("bold")}
						title="Bold"
					>
						<Bold className="h-3.5 w-3.5" />
					</ToolbarButton>
					<ToolbarButton
						onClick={() => editor.chain().focus().toggleItalic().run()}
						active={editor.isActive("italic")}
						title="Italic"
					>
						<Italic className="h-3.5 w-3.5" />
					</ToolbarButton>
					<ToolbarButton
						onClick={() => editor.chain().focus().toggleUnderline().run()}
						active={editor.isActive("underline")}
						title="Underline"
					>
						<Underline className="h-3.5 w-3.5" />
					</ToolbarButton>

					<div className="w-px h-5 bg-amber-300 dark:bg-amber-800 mx-1" />

					<ToolbarButton
						onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
						active={editor.isActive("heading", { level: 1 })}
						title="Heading 1"
					>
						<Heading1 className="h-3.5 w-3.5" />
					</ToolbarButton>
					<ToolbarButton
						onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
						active={editor.isActive("heading", { level: 2 })}
						title="Heading 2"
					>
						<Heading2 className="h-3.5 w-3.5" />
					</ToolbarButton>
					<ToolbarButton
						onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
						active={editor.isActive("heading", { level: 3 })}
						title="Heading 3"
					>
						<Heading3 className="h-3.5 w-3.5" />
					</ToolbarButton>

					<div className="w-px h-5 bg-amber-300 dark:bg-amber-800 mx-1" />

					<ToolbarButton
						onClick={() => editor.chain().focus().toggleBulletList().run()}
						active={editor.isActive("bulletList")}
						title="Bullet List"
					>
						<List className="h-3.5 w-3.5" />
					</ToolbarButton>
					<ToolbarButton
						onClick={() => editor.chain().focus().toggleOrderedList().run()}
						active={editor.isActive("orderedList")}
						title="Ordered List"
					>
						<ListOrdered className="h-3.5 w-3.5" />
					</ToolbarButton>

					<div className="w-px h-5 bg-amber-300 dark:bg-amber-800 mx-1" />

					<ToolbarButton
						onClick={() => editor.chain().focus().toggleCodeBlock().run()}
						active={editor.isActive("codeBlock")}
						title="Code Block"
					>
						<Code className="h-3.5 w-3.5" />
					</ToolbarButton>
					<ToolbarButton
						onClick={() => editor.chain().focus().toggleBlockquote().run()}
						active={editor.isActive("blockquote")}
						title="Blockquote"
					>
						<Quote className="h-3.5 w-3.5" />
					</ToolbarButton>
					<ToolbarButton
						onClick={handleSetLink}
						active={editor.isActive("link")}
						title="Link"
					>
						<LinkIcon className="h-3.5 w-3.5" />
					</ToolbarButton>

					<div className="w-px h-5 bg-amber-300 dark:bg-amber-800 mx-1" />

					<ToolbarButton
						onClick={() => editor.chain().focus().undo().run()}
						disabled={!editor.can().undo()}
						title="Undo"
					>
						<Undo className="h-3.5 w-3.5" />
					</ToolbarButton>
					<ToolbarButton
						onClick={() => editor.chain().focus().redo().run()}
						disabled={!editor.can().redo()}
						title="Redo"
					>
						<Redo className="h-3.5 w-3.5" />
					</ToolbarButton>
				</div>

				{/* Editor */}
				<div className="bg-white dark:bg-neutral-900 mx-4 mb-4 mt-3 rounded-xl border border-amber-200 dark:border-amber-900/30">
					<EditorContent editor={editor} />
				</div>

				<p className="text-xs text-neutral-500 dark:text-neutral-400 px-6 pb-4">
					💡 Tip: Use the toolbar above for formatting, or type markdown shortcuts like # for headings
				</p>
			</div>
		</motion.div>
	);
}

function ToolbarButton({
	children,
	onClick,
	active,
	disabled,
	title,
}: {
	children: React.ReactNode;
	onClick: () => void;
	active?: boolean;
	disabled?: boolean;
	title?: string;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			disabled={disabled}
			title={title}
			className={cn(
				"p-1.5 rounded-md transition-colors",
				active
					? "bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-100"
					: "text-neutral-600 dark:text-neutral-400 hover:bg-amber-100 dark:hover:bg-amber-900/30",
				disabled && "opacity-40 cursor-not-allowed"
			)}
		>
			{children}
		</button>
	);
}