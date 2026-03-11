"use server";

import { auth } from "@repo/auth";
import { prisma } from "@repo/prisma";
import OpenAI from "openai";
import type { StudioStep, ExplanationMetadata } from "@/types/studios";

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

// Build context from previous steps
async function buildContext(studioId: string): Promise<string> {
	const steps = await prisma.studioStep.findMany({
		where: { studioId },
		orderBy: { orderNumber: "asc" },
		take: 10, // Last 10 steps for context
	});

	if (steps.length === 0) return "";

	const contextParts = steps.map((step: any, idx: number) => {
		if (step.type === "EXPLANATION" && step.content) {
			return `Step ${idx + 1} (Explanation): ${step.content.substring(0, 200)}...`;
		}
		if (step.type === "QUIZ") {
			const meta = step.metadata as any;
			return `Step ${idx + 1} (Quiz): Topic - ${meta.topic}`;
		}
		if (step.type === "CODE") {
			const meta = step.metadata as any;
			return `Step ${idx + 1} (Code): ${meta.problemTitle || "Coding practice"}`;
		}
		return `Step ${idx + 1} (${step.type})`;
	});

	return contextParts.join("\n");
}

// Generate explanation content
export async function generateExplanation(
	studioId: string,
	prompt: string
): Promise<{
	success: boolean;
	step?: StudioStep;
	error?: string;
}> {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return { success: false, error: "Unauthorized" };
		}

		// Verify studio ownership
		const studio = await prisma.studio.findUnique({
			where: { id: studioId, userId: session.user.id },
		});

		if (!studio) {
			return { success: false, error: "Studio not found" };
		}

		// Build context
		const context = await buildContext(studioId);

		// Generate content with OpenAI
		const systemPrompt = `You are an expert educator creating comprehensive explanations for students learning programming and technology.

${context ? `Previous learning context:\n${context}\n` : ""}

Create a detailed, well-structured explanation that:
- Uses clear, simple language
- Includes practical code examples where relevant
- Breaks down complex concepts step-by-step
- Uses markdown formatting (headings, lists, code blocks)
- Is engaging and easy to understand
- Length: 500-1000 words

Format your response in markdown.`;

		const completion = await openai.chat.completions.create({
			model: "gpt-4o",
			messages: [
				{ role: "system", content: systemPrompt },
				{ role: "user", content: prompt },
			],
			temperature: 0.7,
			max_tokens: 2000,
		});

		const content = completion.choices[0]?.message?.content;
		if (!content) {
			return { success: false, error: "Failed to generate content" };
		}

		// Get next order number
		const maxOrder = await prisma.studioStep.findFirst({
			where: { studioId },
			orderBy: { orderNumber: "desc" },
			select: { orderNumber: true },
		});

		const nextOrder = (maxOrder?.orderNumber ?? 0) + 1;

		// Create step
		const metadata: ExplanationMetadata = {
			prompt,
			model: "gpt-4o",
			tokensUsed: completion.usage?.total_tokens,
		};

		const step = await prisma.studioStep.create({
			data: {
				studioId,
				type: "EXPLANATION",
				content,
				metadata: metadata as any,
				source: "AI",
				orderNumber: nextOrder,
				status: "COMPLETED",
			},
		});

		// Update studio
		await prisma.studio.update({
			where: { id: studioId },
			data: {
				stepCount: { increment: 1 },
				lastEditedAt: new Date(),
			},
		});

		return { success: true, step: step as unknown as StudioStep };
	} catch (error) {
		console.error("Error generating explanation:", error);
		return { success: false, error: "Failed to generate explanation" };
	}
}

// Generate quiz
export async function generateQuiz(
	studioId: string,
	topic: string,
	questionCount: number = 5,
	difficulty: "easy" | "medium" | "hard" = "medium"
): Promise<{
	success: boolean;
	step?: StudioStep;
	quizId?: string;
	error?: string;
}> {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return { success: false, error: "Unauthorized" };
		}

		const studio = await prisma.studio.findUnique({
			where: { id: studioId, userId: session.user.id },
		});

		if (!studio) {
			return { success: false, error: "Studio not found" };
		}

		const context = await buildContext(studioId);

		const systemPrompt = `You are an expert educator creating quiz questions for students.

${context ? `Previous learning context:\n${context}\n` : ""}

Create ${questionCount} multiple-choice questions about: ${topic}
Difficulty: ${difficulty}

Return ONLY a valid JSON array with this exact structure:
[
  {
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "explanation": "Why this answer is correct"
  }
]

Make questions challenging but fair. Include clear explanations.`;

		const completion = await openai.chat.completions.create({
			model: "gpt-4o",
			messages: [{ role: "system", content: systemPrompt }],
			temperature: 0.7,
			max_tokens: 2000,
		});

		const content = completion.choices[0]?.message?.content;
		if (!content) {
			return { success: false, error: "Failed to generate quiz" };
		}

		// Parse questions
		let questions;
		try {
			questions = JSON.parse(content);
		} catch {
			return { success: false, error: "Failed to parse quiz questions" };
		}

		// Create quiz in database
		const quiz = await prisma.studioQuiz.create({
			data: {
				studioId,
				blockId: `quiz_${Date.now()}`,
				title: topic,
				questions: questions as any,
				timeLimit: null,
				shuffleQuestions: false,
				showCorrectAnswers: true,
			},
		});

		// Get next order
		const maxOrder = await prisma.studioStep.findFirst({
			where: { studioId },
			orderBy: { orderNumber: "desc" },
			select: { orderNumber: true },
		});

		const nextOrder = (maxOrder?.orderNumber ?? 0) + 1;

		// Create step
		const step = await prisma.studioStep.create({
			data: {
				studioId,
				type: "QUIZ",
				metadata: {
					quizId: quiz.id,
					topic,
					difficulty,
					questionCount: questions.length,
				} as any,
				source: "AI",
				orderNumber: nextOrder,
				status: "COMPLETED",
			},
		});

		await prisma.studio.update({
			where: { id: studioId },
			data: {
				stepCount: { increment: 1 },
				lastEditedAt: new Date(),
			},
		});

		return { success: true, step: step as unknown as StudioStep, quizId: quiz.id };
	} catch (error) {
		console.error("Error generating quiz:", error);
		return { success: false, error: "Failed to generate quiz" };
	}
}

// Generate flashcards
export async function generateFlashcards(
	studioId: string,
	topic: string,
	cardCount: number = 10
): Promise<{
	success: boolean;
	step?: StudioStep;
	error?: string;
}> {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return { success: false, error: "Unauthorized" };
		}

		const studio = await prisma.studio.findUnique({
			where: { id: studioId, userId: session.user.id },
		});

		if (!studio) {
			return { success: false, error: "Studio not found" };
		}

		const context = await buildContext(studioId);

		const systemPrompt = `You are an expert educator creating flashcards for students.

${context ? `Previous learning context:\n${context}\n` : ""}

Create ${cardCount} flashcards about: ${topic}

Return ONLY a valid JSON array with this exact structure:
[
  {
    "front": "Question or concept to recall",
    "back": "The answer or explanation",
    "hint": "Optional hint to help recall"
  }
]

Make flashcards concise, focused, and useful for active recall. Cover key concepts, definitions, and common patterns.`;

		const completion = await openai.chat.completions.create({
			model: "gpt-4o-mini",
			messages: [{ role: "system", content: systemPrompt }],
			temperature: 0.7,
			max_tokens: 2000,
		});

		const content = completion.choices[0]?.message?.content;
		if (!content) {
			return { success: false, error: "Failed to generate flashcards" };
		}

		let cards;
		try {
			const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
			cards = JSON.parse(cleaned);
		} catch {
			return { success: false, error: "Failed to parse flashcard data" };
		}

		const maxOrder = await prisma.studioStep.findFirst({
			where: { studioId },
			orderBy: { orderNumber: "desc" },
			select: { orderNumber: true },
		});

		const nextOrder = (maxOrder?.orderNumber ?? 0) + 1;

		const step = await prisma.studioStep.create({
			data: {
				studioId,
				type: "FLASHCARD",
				content: JSON.stringify(cards),
			metadata: JSON.parse(JSON.stringify({
				topic,
				cardCount: cards.length,
			})),
				source: "AI",
				orderNumber: nextOrder,
				status: "COMPLETED",
			},
		});

		await prisma.studio.update({
			where: { id: studioId },
			data: {
				stepCount: { increment: 1 },
				lastEditedAt: new Date(),
			},
		});

		return { success: true, step: step as unknown as StudioStep };
	} catch (error) {
		console.error("Error generating flashcards:", error);
		return { success: false, error: "Failed to generate flashcards" };
	}
}

// Enhance note content with AI
export async function enhanceNoteWithAI(
	content: string
): Promise<{
	success: boolean;
	enhanced?: string;
	error?: string;
}> {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return { success: false, error: "Unauthorized" };
		}

		const completion = await openai.chat.completions.create({
			model: "gpt-4o-mini",
			messages: [
				{
					role: "system",
					content: `You are a writing assistant that enhances notes. Given the user's rough notes, improve them by:
- Fixing grammar and spelling
- Improving clarity and structure
- Adding formatting (headings, bold, lists) using HTML tags (h2, strong, ul/li, etc.)
- Keeping the original meaning and tone intact
- Expanding brief points with more detail where helpful
- Keeping it concise but comprehensive

Return ONLY the enhanced HTML content. Do not add any prefix or explanation.`,
				},
				{ role: "user", content },
			],
			temperature: 0.5,
			max_tokens: 2000,
		});

		const enhanced = completion.choices[0]?.message?.content;
		if (!enhanced) {
			return { success: false, error: "Failed to enhance note" };
		}

		return { success: true, enhanced };
	} catch (error) {
		console.error("Error enhancing note:", error);
		return { success: false, error: "Failed to enhance note" };
	}
}

// Get quiz data by ID
export async function getQuizById(quizId: string): Promise<{
	success: boolean;
	quiz?: {
		id: string;
		title: string;
		questions: Array<{
			id: string;
			question: string;
			options: string[];
			correctAnswer: number;
			explanation?: string;
		}>;
	};
	error?: string;
}> {
	try {
		const session = await auth();
		if (!session?.user?.id) {
			return { success: false, error: "Unauthorized" };
		}

		const quiz = await prisma.studioQuiz.findUnique({
			where: { id: quizId },
			include: { studio: { select: { userId: true } } },
		});

		if (!quiz || quiz.studio.userId !== session.user.id) {
			return { success: false, error: "Quiz not found" };
		}

		const questions = (quiz.questions as any[]).map((q: any, idx: number) => ({
			id: `q_${idx}`,
			question: q.question,
			options: q.options,
			correctAnswer: q.correctAnswer,
			explanation: q.explanation,
		}));

		return {
			success: true,
			quiz: { id: quiz.id, title: quiz.title, questions },
		};
	} catch (error) {
		console.error("Error fetching quiz:", error);
		return { success: false, error: "Failed to fetch quiz" };
	}
}