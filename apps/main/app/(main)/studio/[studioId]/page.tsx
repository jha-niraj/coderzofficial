import { Suspense } from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import StudioEditor from "@/components/studio/studio-editor";
import StudioEditorSkeleton from "@/components/studio/studio-editor-skeleton";
import { getStudio } from "@/actions/(main)/studios/studio.action";
import type { 
	Studio, StudioQuiz, StudioFlashcardDeck, StudioCodeBlock, StudioMediaBlock, 
	StudioChatMessage, QuizQuestion, FlashCard, BlockContent 
} from "@/types/studio";

interface StudioEditorPageProps {
	params: Promise<{
		studioId: string;
	}>;
}

export async function generateMetadata({ params }: StudioEditorPageProps): Promise<Metadata> {
	const { studioId } = await params;
	const result = await getStudio(studioId);

	if (result.error || !result.studio) {
		return {
			title: "Studio Not Found | The Coderz",
		};
	}

	return {
		title: `${result.studio.title} | Studio | The Coderz`,
		description: result.studio.description || "AI-powered learning workspace",
	};
}

export default async function StudioEditorPage({ params }: StudioEditorPageProps) {
	const { studioId } = await params;
	const result = await getStudio(studioId);

	if (result.error || !result.studio) {
		notFound();
	}

	// Transform the Prisma result to match our Studio type
	const studio: Studio = {
		id: result.studio.id,
		title: result.studio.title,
		description: result.studio.description,
		emoji: result.studio.emoji ?? undefined,
		coverImage: result.studio.coverImage ?? undefined,
		content: (result.studio.content as unknown as BlockContent) || { blocks: [] },
		category: result.studio.category,
		tags: result.studio.tags,
		visibility: result.studio.visibility,
		isTemplate: result.studio.isTemplate,
		views: result.studio.views,
		clones: result.studio.clones,
		likes: result.studio.likes,
		userId: result.studio.userId,
		projectId: result.studio.projectId ?? undefined,
		createdAt: result.studio.createdAt,
		updatedAt: result.studio.updatedAt,
		lastEditedAt: result.studio.lastEditedAt,
		user: result.studio.user,
		quizzes: result.studio.quizzes.map((q) => ({
			id: q.id,
			blockId: q.blockId,
			title: q.title,
			questions: q.questions as unknown as QuizQuestion[],
			timeLimit: q.timeLimit ?? undefined,
			shuffleQuestions: q.shuffleQuestions,
			showCorrectAnswers: q.showCorrectAnswers,
			studioId: q.studioId,
			createdAt: q.createdAt,
			updatedAt: q.updatedAt,
		})),
		flashcardDecks: result.studio.flashcardDecks.map((d) => ({
			id: d.id,
			blockId: d.blockId,
			title: d.title,
			cards: d.cards as unknown as FlashCard[],
			studioId: d.studioId,
			createdAt: d.createdAt,
			updatedAt: d.updatedAt,
		})),
		codeBlocks: result.studio.codeBlocks.map((c) => ({
			id: c.id,
			blockId: c.blockId,
			language: c.language,
			code: c.code,
			isPractice: c.isPractice,
			problemTitle: c.problemTitle ?? undefined,
			problemDescription: c.problemDescription ?? undefined,
			testCases: c.testCases as unknown as { input: string; expectedOutput: string }[] | undefined,
			hints: c.hints,
			solution: c.solution ?? undefined,
			studioId: c.studioId,
			createdAt: c.createdAt,
			updatedAt: c.updatedAt,
		})),
		mediaBlocks: result.studio.mediaBlocks.map((m) => ({
			id: m.id,
			blockId: m.blockId,
			type: m.type,
			url: m.url,
			prompt: m.prompt ?? undefined,
			width: m.width ?? undefined,
			height: m.height ?? undefined,
			duration: m.duration ?? undefined,
			studioId: m.studioId,
			createdAt: m.createdAt,
		})),
		chatHistory: result.studio.chatHistory.map((c) => ({
			id: c.id,
			studioId: c.studioId,
			role: c.role as "user" | "assistant",
			content: c.content,
			createdAt: c.createdAt,
		})),
	};

	return (
		<div className="min-h-screen bg-white dark:bg-neutral-950">
			<Suspense fallback={<StudioEditorSkeleton />}>
				<StudioEditor studio={studio} />
			</Suspense>
		</div>
	);
}