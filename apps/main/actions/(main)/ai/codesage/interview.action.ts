"use server"

import { getSession } from "@repo/auth"
import { headers } from "next/headers"
import {
    db,
    codebaseProject,
    codebaseFile,
    codebaseInterview,
} from "@repo/db"
import { eq, and, desc } from "drizzle-orm"
import { openai } from "@/lib/openai-client"
import { zodResponseFormat } from "openai/helpers/zod"
import { z } from "zod"
import { revalidatePath } from "next/cache"

// ── Schemas ───────────────────────────────────────────────────────────────────
const QuestionsSchema = z.object({
    questions: z.array(z.object({
        id: z.string(),
        questionText: z.string(),
        codeContext: z.string(),
        filePath: z.string(),
        keyPoints: z.array(z.string()),
        difficulty: z.string(),
    }))
})

const EvalSchema = z.object({
    score: z.number().min(0).max(100),
    feedback: z.string(),
    missedPoints: z.array(z.string()),
    strongPoints: z.array(z.string()),
    suggestedAnswer: z.string(),
})

const MODE_PROMPTS: Record<string, string> = {
    explain: `Generate questions that ask the candidate to EXPLAIN how specific code works.
Questions should start with: "Walk me through...", "Explain how...", "What does this function do...", "How does X work in this context?"`,
    defend: `Generate questions that ask the candidate to DEFEND their architectural choices.
Questions should start with: "Why did you choose...", "What are the trade-offs of...", "How would you justify...", "What alternatives did you consider?"`,
    improve: `Generate questions that ask the candidate to IMPROVE the code.
Questions should start with: "How would you refactor...", "What would you change about...", "How could this be made more...", "What bugs or edge cases exist in..."`,
    mixed: `Generate a mix of explain, defend, and improve questions for a well-rounded technical interview.
Each question should test a different skill: understanding, judgment, and problem-solving.`,
}

const DIFFICULTY_CONTEXTS: Record<string, string> = {
    junior: "Questions should be accessible to someone with 0-2 years experience. Focus on understanding over optimization.",
    mid: "Questions should test solid engineering judgment. Mix of conceptual and practical questions.",
    senior: "Questions should be deep. Focus on architecture, trade-offs, scalability, and advanced patterns.",
}

// ── Select representative files for interview ─────────────────────────────────
function selectInterestingFiles(
    files: Array<{ filePath: string; content: string; extension: string }>,
    focusArea?: string | null,
    maxFiles = 12
): Array<typeof files[0]> {
    let candidates = files

    if (focusArea) {
        candidates = files.filter(f => f.filePath.includes(focusArea))
        if (candidates.length < 3) candidates = files
    }

    // Prioritize: actions > components > pages > lib
    const priority = (path: string) => {
        if (path.includes("/actions/")) return 0
        if (path.includes("/components/")) return 1
        if (path.includes("/app/") && path.endsWith("page.tsx")) return 2
        if (path.includes("/lib/")) return 3
        if (path.endsWith(".prisma")) return 4
        return 5
    }

    return candidates
        .filter(f => ["ts", "tsx", "js", "jsx"].includes(f.extension))
        .filter(f => f.content.length > 200) // skip tiny files
        .sort((a, b) => priority(a.filePath) - priority(b.filePath))
        .slice(0, maxFiles)
}

// ── Generate interview ────────────────────────────────────────────────────────
export async function createInterview(input: {
    projectSlug: string
    mode: "explain" | "defend" | "improve" | "mixed"
    difficulty: "junior" | "mid" | "senior"
    focusArea?: string | null
}) {
    const session = await getSession(headers())
    if (!session?.user?.id) return { success: false, error: "Unauthorized" }

    const project = await db.query.codebaseProject.findFirst({
        where: and(eq(codebaseProject.slug, input.projectSlug), eq(codebaseProject.userId, session.user.id)),
        with: {
            files: {
                columns: { filePath: true, content: true, extension: true },
            },
        },
    })

    if (!project) return { success: false, error: "Project not found" }
    if (project.indexStatus !== "ready") return { success: false, error: "Project still indexing" }

    const selectedFiles = selectInterestingFiles(
        project.files,
        input.focusArea,
    )

    const codeContext = selectedFiles.map(f =>
        `// File: ${f.filePath}\n${f.content.slice(0, 3000)}`
    ).join("\n\n---\n\n")

    const stack = project.detectedStack as Record<string, string> | null
    const systemPrompt = `You are an experienced technical interviewer conducting a realistic coding interview.
You have access to the candidate's actual codebase: ${project.name} (${stack?.framework ?? "software project"}).

${MODE_PROMPTS[input.mode] ?? MODE_PROMPTS.mixed}

DIFFICULTY: ${DIFFICULTY_CONTEXTS[input.difficulty] ?? DIFFICULTY_CONTEXTS.mid}

REQUIREMENTS:
- Generate exactly 6 questions
- Each question must reference a SPECIFIC piece of code from the files provided
- Include the exact code snippet (codeContext) that the question refers to
- Include 3-5 key points that a good answer should cover
- Question IDs: q1, q2, q3, q4, q5, q6`

    let questions: z.infer<typeof QuestionsSchema>["questions"] = []
    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: systemPrompt },
                {
                    role: "user",
                    content: `Codebase files:\n\n${codeContext}\n\nGenerate 6 interview questions based on this specific codebase.`,
                },
            ],
            response_format: zodResponseFormat(QuestionsSchema, "questions_schema"),
            temperature: 0.4,
            max_tokens: 4000,
        })
        const content = completion.choices[0]?.message?.content
        if (content) {
            const parsed = JSON.parse(content) as z.infer<typeof QuestionsSchema>
            questions = parsed.questions ?? []
        }
    } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : "Failed to generate questions" }
    }

    if (questions.length === 0) return { success: false, error: "Failed to generate questions" }

    const [interview] = await db.insert(codebaseInterview).values({
        projectId: project.id,
        userId: session.user.id,
        mode: input.mode,
        difficulty: input.difficulty,
        focusArea: input.focusArea ?? null,
        status: "in_progress",
        questions: questions as any,
    }).returning()

    revalidatePath(`/ai/codesage/c/${input.projectSlug}/interview`)
    return { success: true, interviewId: interview!.id, questions }
}

// ── Evaluate one answer ───────────────────────────────────────────────────────
export async function evaluateAnswer(input: {
    interviewId: string
    questionId: string
    userAnswer: string
}) {
    const session = await getSession(headers())
    if (!session?.user?.id) return { success: false, error: "Unauthorized" }

    const interview = await db.query.codebaseInterview.findFirst({
        where: and(eq(codebaseInterview.id, input.interviewId), eq(codebaseInterview.userId, session.user.id)),
    })
    if (!interview) return { success: false, error: "Interview not found" }

    const questions = interview.questions as z.infer<typeof QuestionsSchema>["questions"]
    const question = questions.find(q => q.id === input.questionId)
    if (!question) return { success: false, error: "Question not found" }

    let evaluation: z.infer<typeof EvalSchema>
    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: `You are evaluating a technical interview answer. Be fair but rigorous.
The candidate answered a question about their own codebase.
Score 0-100 where: 0-40 = poor understanding, 41-60 = basic understanding, 61-80 = good, 81-100 = excellent.
Provide constructive, specific feedback.`,
                },
                {
                    role: "user",
                    content: `QUESTION: ${question.questionText}

CODE CONTEXT:
\`\`\`
${question.codeContext}
\`\`\`

KEY POINTS (what a good answer should cover):
${question.keyPoints.map((p, i) => `${i + 1}. ${p}`).join("\n")}

CANDIDATE'S ANSWER:
${input.userAnswer || "(No answer provided)"}

Evaluate this answer.`,
                },
            ],
            response_format: zodResponseFormat(EvalSchema, "eval_schema"),
            temperature: 0.2,
            max_tokens: 1500,
        })
        const content = completion.choices[0]?.message?.content
        if (!content) return { success: false, error: "Evaluation failed" }
        evaluation = JSON.parse(content) as z.infer<typeof EvalSchema>
    } catch {
        return { success: false, error: "Failed to evaluate answer" }
    }

    // Update the question in the interview record
    const updatedQuestions = questions.map(q =>
        q.id === input.questionId
            ? { ...q, userAnswer: input.userAnswer, score: evaluation.score, feedback: evaluation.feedback }
            : q
    )

    await db.update(codebaseInterview)
        .set({ questions: updatedQuestions as any })
        .where(eq(codebaseInterview.id, input.interviewId))

    return { success: true, evaluation }
}

// ── Complete interview ────────────────────────────────────────────────────────
export async function completeInterview(interviewId: string) {
    const session = await getSession(headers())
    if (!session?.user?.id) return { success: false }

    const interview = await db.query.codebaseInterview.findFirst({
        where: and(eq(codebaseInterview.id, interviewId), eq(codebaseInterview.userId, session.user.id)),
    })
    if (!interview) return { success: false }

    const questions = interview.questions as Array<{ score?: number }>
    const scored = questions.filter(q => q.score !== undefined)
    const avgScore = scored.length > 0
        ? Math.round(scored.reduce((s, q) => s + (q.score ?? 0), 0) / scored.length)
        : 0

    await db.update(codebaseInterview)
        .set({ status: "completed", score: avgScore, completedAt: new Date() })
        .where(eq(codebaseInterview.id, interviewId))

    return { success: true, score: avgScore }
}

// ── Get interviews ────────────────────────────────────────────────────────────
export async function getInterviews(slug: string) {
    const session = await getSession(headers())
    if (!session?.user?.id) return { success: false, interviews: [] }

    const project = await db.query.codebaseProject.findFirst({
        where: and(eq(codebaseProject.slug, slug), eq(codebaseProject.userId, session.user.id)),
        columns: { id: true },
    })
    if (!project) return { success: false, interviews: [] }

    const interviews = await db.query.codebaseInterview.findMany({
        where: and(eq(codebaseInterview.projectId, project.id), eq(codebaseInterview.userId, session.user.id)),
        orderBy: [desc(codebaseInterview.createdAt)],
        columns: { id: true, mode: true, difficulty: true, score: true, status: true, createdAt: true, completedAt: true },
        limit: 10,
    })

    return { success: true, interviews }
}

export async function getInterview(interviewId: string) {
    const session = await getSession(headers())
    if (!session?.user?.id) return { success: false, interview: null }

    const interview = await db.query.codebaseInterview.findFirst({
        where: and(eq(codebaseInterview.id, interviewId), eq(codebaseInterview.userId, session.user.id)),
    })
    if (!interview) return { success: false, interview: null }

    return { success: true, interview }
}

export async function getFolders(slug: string) {
    const session = await getSession(headers())
    if (!session?.user?.id) return { success: false, folders: [] }

    const project = await db.query.codebaseProject.findFirst({
        where: and(eq(codebaseProject.slug, slug), eq(codebaseProject.userId, session.user.id)),
        columns: { id: true },
    })
    if (!project) return { success: false, folders: [] }

    const files = await db.query.codebaseFile.findMany({
        where: eq(codebaseFile.projectId, project.id),
        columns: { filePath: true },
    })

    const topFolders = new Set<string>()
    for (const f of files) {
        const parts = f.filePath.split("/")
        if (parts.length > 1) topFolders.add(parts.slice(0, 2).join("/"))
        else topFolders.add(parts[0] ?? "root")
    }

    return { success: true, folders: [...topFolders].sort() }
}
