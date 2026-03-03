"use server";

import OpenAI from "openai";
import { prisma } from "@repo/prisma";
import { auth } from "@repo/auth";
import type { 
    PracticeAssessPayload, PracticeAssessResult, PracticeProblemDetail 
} from "@/types/practice";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ─────────────────────────────────────────────
// SYSTEM PROMPTS PER MODULE
// ─────────────────────────────────────────────

const MODULE_SYSTEM_PROMPTS: Record<string, string> = {
    DSA: `You are a senior software engineer and DSA expert reviewing a candidate's solution.
Evaluate their code for:
- Correctness: Does the solution handle all cases including edge cases?
- Time Complexity: Is it optimal? What is the Big-O?
- Space Complexity: Is memory usage efficient?
- Code Quality: Clean, readable, well-named variables, no unnecessary complexity.
- Approach: Is the chosen algorithm appropriate?`,

    SYSTEM_DESIGN: `You are a senior system architect reviewing a system design solution on an Excalidraw canvas (provided as JSON).
Evaluate the design for:
- Component Selection: Are the right components (load balancers, caches, databases, queues) chosen?
- Scalability: Does the design handle scale requirements?
- Data Flow: Is the data flow logical and complete?
- Trade-offs: Are trade-offs acknowledged and reasonable?
- Completeness: Does the design address all requirements?`,

    WEB_FRONTEND: `You are a senior frontend engineer reviewing a React/HTML/CSS implementation.
Evaluate the work for:
- Visual Accuracy: Does it match the requirements?
- Responsiveness: Does the layout work at different sizes?
- Code Quality: Clean JSX/HTML, semantic elements, organized CSS.
- Interactivity: Do interactions work correctly?
- Accessibility: Basic a11y considerations (alt tags, labels, contrast).`,

    WEB_BACKEND: `You are a senior backend engineer reviewing an API implementation.
Evaluate the work for:
- Endpoint Design: RESTful conventions, proper HTTP methods and status codes.
- Input Validation: Are inputs validated and sanitized?
- Error Handling: Graceful error responses, proper error codes.
- Security: Authentication, authorization, injection prevention.
- Code Structure: Clean separation of concerns, maintainable code.`,
};

// ─────────────────────────────────────────────
// BUILD ASSESSMENT PROMPT
// ─────────────────────────────────────────────

function buildAssessPrompt(
    problem: PracticeProblemDetail,
    payload: PracticeAssessPayload
): string {
    const requirementsList = problem.requirements
        .map((r, i) => `  ${i + 1}. ${r}`)
        .join("\n");

    const previousContext = payload.previousFeedback
        ? `\n\nPrevious Feedback (attempt ${payload.attemptNumber - 1}):\n${payload.previousFeedback}`
        : "";

    const conversationContext = payload.conversationHistory.length > 0
        ? `\n\nConversation History:\n${payload.conversationHistory
            .slice(-10)
            .map((m) => `[${m.role}]: ${m.content}`)
            .join("\n")}`
        : "";

    let workSection = "";
    if (payload.module === "SYSTEM_DESIGN") {
        workSection = `Canvas Data (Excalidraw JSON):\n\`\`\`json\n${payload.userWork}\n\`\`\``;
    } else if (payload.module === "WEB_FRONTEND") {
        workSection = `HTML/JSX Code:\n\`\`\`\n${payload.userWork}\n\`\`\``;
        if (payload.userCss) {
            workSection += `\n\nCSS:\n\`\`\`css\n${payload.userCss}\n\`\`\``;
        }
    } else {
        workSection = `Code (${payload.language ?? "javascript"}):\n\`\`\`${payload.language ?? "javascript"}\n${payload.userWork}\n\`\`\``;
    }

    return `Problem: ${problem.title}
Difficulty: ${problem.difficulty}
Category: ${problem.category}
Mode: ${payload.mode} (${payload.mode === "EXAM" ? "no assistance given" : "AI assistance was available"})
Attempt Number: ${payload.attemptNumber}

Description:
${problem.description}

Requirements:
${requirementsList}

${workSection}
${previousContext}
${conversationContext}

Evaluate the solution and respond with ONLY valid JSON (no markdown, no code blocks):
{
  "score": <number 0-100>,
  "feedback": "<detailed constructive feedback as a single string>",
  "requirementsMet": {
    ${problem.requirements.map((r, i) => `"req-${i}": <true|false>`).join(",\n    ")}
  },
  "summary": "<one-line summary of performance>"
}

Scoring Guidelines:
- 90-100: Excellent — all requirements met, optimal approach, clean code
- 75-89: Good — most requirements met, reasonable approach, minor issues
- 60-74: Satisfactory — core requirements met, some issues to address
- 40-59: Needs Improvement — several requirements missing, significant issues
- 0-39: Incomplete — fundamental issues, major requirements not met

For ${payload.mode === "EXAM" ? "EXAM mode, be fair but rigorous since no help was given" : "ASSIST mode, acknowledge the collaborative approach but still evaluate the final result objectively"}.`;
}

// ─────────────────────────────────────────────
// ASSESS ACTION
// ─────────────────────────────────────────────

export async function assessPracticeWork(
    payload: PracticeAssessPayload
): Promise<{ success: true; result: PracticeAssessResult } | { success: false; error: string }> {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: "Not authenticated" };
    }

    if (!process.env.OPENAI_API_KEY) {
        return { success: false, error: "OpenAI API key not configured" };
    }

    try {
        // Fetch the problem details
        const problem = await prisma.practiceProblem.findUnique({
            where: { slug: payload.problemSlug },
        });
        if (!problem) {
            return { success: false, error: "Problem not found" };
        }

        const problemDetail: PracticeProblemDetail = {
            id: problem.id,
            slug: problem.slug,
            title: problem.title,
            description: problem.description,
            module: problem.module,
            category: problem.category,
            difficulty: problem.difficulty,
            requirements: problem.requirements,
            hints: problem.hints,
            starterCode: problem.starterCode,
            starterCss: problem.starterCss,
            testCases: problem.testCases as PracticeProblemDetail["testCases"],
            tags: problem.tags,
        };

        const systemPrompt = MODULE_SYSTEM_PROMPTS[payload.module] ?? MODULE_SYSTEM_PROMPTS.DSA!;
        const userPrompt = buildAssessPrompt(problemDetail, payload);

        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt },
            ],
            temperature: 0.3,
            max_tokens: 1500,
        });

        const responseContent = completion.choices[0]?.message?.content;
        if (!responseContent) {
            return { success: false, error: "No response from AI" };
        }

        // Parse JSON response, handling potential markdown wrapping
        const cleaned = responseContent.replace(/```json\s*|```\s*/g, "").trim();
        let parsed: {
            score: number;
            feedback: string;
            requirementsMet: Record<string, boolean>;
            summary?: string;
        };

        try {
            parsed = JSON.parse(cleaned);
        } catch {
            // Fallback: try to extract score from text
            const scoreMatch = responseContent.match(/score['"]\s*:\s*(\d+)/i);
            const score = scoreMatch ? parseInt(scoreMatch[1] ?? "50", 10) : 50;
            parsed = {
                score,
                feedback: responseContent,
                requirementsMet: {},
            };
        }

        // Calculate XP based on score and difficulty
        const difficultyMultiplier = { EASY: 1, MEDIUM: 2, HARD: 3 };
        const mult = difficultyMultiplier[problem.difficulty] ?? 1;
        const baseXP = Math.round((parsed.score / 100) * 25);
        const xpAwarded = baseXP * mult;

        // Adjust XP for attempt number (diminishing returns after first attempt)
        const attemptPenalty = payload.attemptNumber > 1 ? Math.max(0.5, 1 - (payload.attemptNumber - 1) * 0.1) : 1;
        const finalXP = Math.round(xpAwarded * attemptPenalty);

        const result: PracticeAssessResult = {
            score: parsed.score,
            feedback: parsed.feedback,
            requirementsMet: parsed.requirementsMet,
            xpAwarded: finalXP,
        };

        return { success: true, result };
    } catch (err) {
        console.error("[assessPracticeWork] Error:", err);
        return { success: false, error: "Assessment failed. Please try again." };
    }
}

// ─────────────────────────────────────────────
// AI MENTOR CHAT (Assist Mode)
// ─────────────────────────────────────────────

export async function getMentorResponse(
    problemSlug: string,
    chatHistory: Array<{ role: "user" | "assistant" | "system"; content: string }>,
    userMessage: string,
    userCode: string,
    module: string
): Promise<{ success: true; message: string } | { success: false; error: string }> {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: "Not authenticated" };
    }

    if (!process.env.OPENAI_API_KEY) {
        return { success: false, error: "OpenAI API key not configured" };
    }

    try {
        const problem = await prisma.practiceProblem.findUnique({
            where: { slug: problemSlug },
            select: { title: true, description: true, requirements: true, hints: true, difficulty: true },
        });
        if (!problem) {
            return { success: false, error: "Problem not found" };
        }

        const systemMessage = `You are a patient, Socratic coding mentor helping a student solve a practice problem.

Problem: ${problem.title} (${problem.difficulty})
Description: ${problem.description}

Requirements:
${problem.requirements.map((r, i) => `${i + 1}. ${r}`).join("\n")}

Available Hints (use sparingly, guide the student to discover them):
${problem.hints.map((h, i) => `${i + 1}. ${h}`).join("\n")}

Current Code:
\`\`\`
${userCode}
\`\`\`

Rules:
1. NEVER give the complete solution. Guide with questions and small hints.
2. If the student is stuck, give ONE small nudge in the right direction.
3. If they ask for the answer directly, redirect them with a guiding question.
4. Acknowledge what they've done well before pointing out issues.
5. Keep responses concise (2-4 sentences usually).
6. Use code snippets only for small illustrative examples, never full solutions.
7. When the student asks for a flowchart, diagram, or visual explanation, generate it using a mermaid code block (\`\`\`mermaid). Use graph TD for flowcharts, sequenceDiagram for sequence flows, classDiagram for class relationships, etc.
8. Format numbered lists properly using markdown (1. item, 2. item). Use bullet points (- item) for unordered lists. Always add a blank line before and after lists.
9. When analyzing code the student sends to "run", walk through the logic step by step: identify potential bugs, predict the output, and suggest improvements. Do NOT just give the corrected code.`;

        const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
            { role: "system", content: systemMessage },
            ...chatHistory.slice(-20),
            { role: "user", content: userMessage },
        ];

        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages,
            temperature: 0.7,
            max_tokens: 1000,
        });

        const response = completion.choices[0]?.message?.content;
        if (!response) {
            return { success: false, error: "No response from AI mentor" };
        }

        return { success: true, message: response };
    } catch (err) {
        console.error("[getMentorResponse] Error:", err);
        return { success: false, error: "Mentor unavailable. Please try again." };
    }
}
