import { NextRequest } from "next/server"
import { auth } from "@repo/auth"
import { prisma } from "@repo/prisma"
import { openai } from "@/lib/openai-client"

// ── Keyword extractor ─────────────────────────────────────────────────────────
function extractKeywords(query: string): string[] {
    const stopWords = new Set(["the", "a", "an", "is", "are", "was", "were", "how", "what", "where",
        "when", "why", "does", "do", "did", "can", "could", "will", "would", "should",
        "in", "on", "at", "to", "for", "of", "and", "or", "but", "with", "this", "that"])
    return query
        .toLowerCase()
        .replace(/[^a-z0-9 ]/g, " ")
        .split(/\s+/)
        .filter(w => w.length > 2 && !stopWords.has(w))
        .slice(0, 10)
}

// ── Find relevant files ───────────────────────────────────────────────────────
function scoreFile(content: string, filePath: string, keywords: string[]): number {
    const text = (filePath + " " + content).toLowerCase()
    let score = 0
    for (const kw of keywords) {
        const count = (text.match(new RegExp(kw, "g")) ?? []).length
        // Path matches worth more
        if (filePath.toLowerCase().includes(kw)) score += 5
        score += Math.min(count, 10)
    }
    // Boost important files
    if (filePath.includes("/actions/")) score += 3
    if (filePath.includes("middleware")) score += 4
    if (filePath.includes("auth") || filePath.includes("Auth")) score += 3
    if (filePath.endsWith(".prisma")) score += 3
    return score
}

export async function POST(req: NextRequest) {
    const session = await auth()
    if (!session?.user?.id) return new Response("Unauthorized", { status: 401 })

    const body = await req.json() as {
        projectSlug: string
        sessionId: string
        message: string
        pinnedFiles?: string[]
    }

    if (!body.projectSlug || !body.message?.trim()) {
        return new Response("Bad request", { status: 400 })
    }

    const project = await prisma.codebaseProject.findUnique({
        where: { slug: body.projectSlug, userId: session.user.id },
        select: { id: true, name: true, detectedStack: true, indexStatus: true },
    })

    if (!project) return new Response("Not found", { status: 404 })
    if (project.indexStatus !== "ready") return new Response("Project still indexing", { status: 400 })

    // Fetch all files (path + content) for search
    const allFiles = await prisma.codebaseFile.findMany({
        where: { projectId: project.id },
        select: { filePath: true, content: true, language: true, lineCount: true },
    })

    // Find relevant files using keyword scoring
    const keywords = extractKeywords(body.message)
    const scoredFiles = allFiles
        .map(f => ({ ...f, score: scoreFile(f.content, f.filePath, keywords) }))
        .sort((a, b) => b.score - a.score)

    // Use top 8 files; always include pinned files
    const pinnedSet = new Set(body.pinnedFiles ?? [])
    const pinned = allFiles.filter(f => pinnedSet.has(f.filePath))
    const topFiles = scoredFiles.filter(f => !pinnedSet.has(f.filePath)).slice(0, 8 - pinned.length)
    const contextFiles = [...pinned, ...topFiles]

    const stack = project.detectedStack as Record<string, string> | null
    const stackDesc = stack
        ? Object.entries(stack).map(([k, v]) => `${k}: ${v}`).join(", ")
        : "unknown stack"

    const codeContext = contextFiles
        .map(f => `\`\`\`${f.language?.toLowerCase() ?? "text"}\n// File: ${f.filePath} (${f.lineCount} lines)\n${f.content.slice(0, 4000)}\n\`\`\``)
        .join("\n\n")

    const systemPrompt = `You are an expert code analyst reviewing the "${project.name}" codebase (${stackDesc}).

IMPORTANT FORMATTING RULES — always follow these:
1. Respond entirely in **Markdown** format
2. Use fenced code blocks with language tags for all code: \`\`\`typescript, \`\`\`python etc.
3. Cite files with this exact format: \`filepath.tsx:lineNumber\` (make them inline code)
4. Use **bold** for emphasis, ## headings for sections, - bullet points for lists
5. Be direct and specific — reference the actual code shown, not generic advice
6. If asked about something not in the context files, say so clearly

CODEBASE CONTEXT (${contextFiles.length} most relevant files):
${codeContext}`

    const encoder = new TextEncoder()
    const { readable, writable } = new TransformStream<Uint8Array, Uint8Array>()
    const writer = writable.getWriter()

    // Start streaming in background
    ;(async () => {
        try {
            const stream = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: body.message },
                ],
                stream: true,
                temperature: 0.3,
                max_tokens: 2500,
            })

            for await (const chunk of stream) {
                const text = chunk.choices[0]?.delta?.content ?? ""
                if (text) await writer.write(encoder.encode(text))
            }
        } catch (err) {
            const errMsg = err instanceof Error ? err.message : "AI error"
            await writer.write(encoder.encode(`\n\n> **Error:** ${errMsg}`))
        } finally {
            await writer.close()
        }
    })()

    return new Response(readable, {
        headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "no-cache, no-transform",
            "X-Content-Type-Options": "nosniff",
        },
    })
}
