"use server"

import { getSession } from "@repo/auth"
import { headers } from "next/headers"
import {
    db,
    codebaseProject,
    codebaseOptimizationIssue,
} from "@repo/db"
import { eq, and, desc } from "drizzle-orm"
import { openai } from "@/lib/openai-client"
import { zodResponseFormat } from "openai/helpers/zod"
import { z } from "zod"
import { revalidatePath } from "next/cache"

const IssueSchema = z.object({
    issues: z.array(z.object({
        category: z.enum(["performance", "architecture", "code_quality", "security", "dx", "bundle"]),
        severity: z.enum(["critical", "high", "medium", "low"]),
        title: z.string(),
        filePath: z.string().nullable(),
        lineStart: z.number().nullable(),
        lineEnd: z.number().nullable(),
        description: z.string(),
        currentCode: z.string().nullable(),
        fixedCode: z.string().nullable(),
        explanation: z.string().nullable(),
        effortLevel: z.enum(["easy", "medium", "hard"]),
    }))
})

const SYSTEM_PROMPT = `You are a senior software engineer conducting a thorough code review.
Analyze the provided code files and identify real, actionable improvements.

IMPORTANT RULES:
- Only report issues that actually exist in the code shown
- Provide exact file paths and approximate line numbers
- For every issue, provide currentCode (the problematic snippet) and fixedCode (the improved version)
- Focus on: performance, architecture patterns, code quality, security, developer experience, bundle size
- Be specific and practical — no vague "improve error handling" without showing the exact code
- Rate effort: easy (< 30 min), medium (1-2h), hard (half day+)
- Severity: critical (breaks/data loss), high (significant impact), medium (noticeable), low (minor polish)`

function groupFilesByType(files: Array<{ filePath: string; content: string }>): Array<Array<typeof files[0]>> {
    const groups: Record<string, typeof files> = {
        pages: [],
        components: [],
        actions: [],
        api: [],
        lib: [],
        schema: [],
        config: [],
        other: [],
    }

    for (const f of files) {
        const p = f.filePath
        if (p.match(/\/app\/.+\/page\.(tsx|ts|jsx|js)$/)) groups.pages!.push(f)
        else if (p.includes("/components/")) groups.components!.push(f)
        else if (p.includes("/actions/")) groups.actions!.push(f)
        else if (p.includes("/api/")) groups.api!.push(f)
        else if (p.includes("/lib/")) groups.lib!.push(f)
        else if (p.endsWith(".prisma") || p.endsWith(".sql") || p.endsWith(".graphql")) groups.schema!.push(f)
        else if (["package.json", "tsconfig.json", "next.config.js", "next.config.ts"].some(n => p.endsWith(n))) groups.config!.push(f)
        else groups.other!.push(f)
    }

    // Batch: max 8 files per batch to stay within token limits
    const BATCH = 8
    const batches: Array<typeof files> = []

    for (const group of Object.values(groups)) {
        if (group.length === 0) continue
        for (let i = 0; i < group.length; i += BATCH) {
            batches.push(group.slice(i, i + BATCH))
        }
    }

    return batches
}

export async function runOptimizationScan(slug: string) {
    const session = await getSession(headers())
    if (!session?.user?.id) return { success: false, error: "Unauthorized" }

    const project = await db.query.codebaseProject.findFirst({
        where: and(eq(codebaseProject.slug, slug), eq(codebaseProject.userId, session.user.id)),
        with: {
            files: {
                columns: { filePath: true, content: true, language: true, extension: true },
                where: (f: any, { notInArray }: any) => notInArray(f.extension, ["md", "json", "yaml", "yml", "lock"]),
            },
        },
    })

    if (!project) return { success: false, error: "Project not found" }
    if (project.indexStatus !== "ready") return { success: false, error: "Project is still indexing" }

    // Clear existing issues
    await db.delete(codebaseOptimizationIssue).where(eq(codebaseOptimizationIssue.projectId, project.id))

    const files = project.files.map((f: any) => ({ filePath: f.filePath, content: f.content }))
    const batches = groupFilesByType(files)

    const allIssues: Array<z.infer<typeof IssueSchema>["issues"][0]> = []

    // Process batches with concurrency limit of 3
    const CONCURRENCY = 3
    for (let i = 0; i < batches.length; i += CONCURRENCY) {
        const chunk = batches.slice(i, i + CONCURRENCY)
        const results = await Promise.all(
            chunk.map(async batch => {
                const codeContext = batch.map(f =>
                    `\`\`\`\n// File: ${f.filePath}\n${f.content.slice(0, 4000)}\n\`\`\``
                ).join("\n\n")

                try {
                    const completion = await openai.chat.completions.create({
                        model: "gpt-4o",
                        messages: [
                            { role: "system", content: SYSTEM_PROMPT },
                            {
                                role: "user",
                                content: `Analyze these ${(project.detectedStack as Record<string, string> | null)?.framework ?? "code"} files for issues:\n\n${codeContext}`,
                            },
                        ],
                        response_format: zodResponseFormat(IssueSchema, "issues_schema"),
                        temperature: 0.2,
                        max_tokens: 4000,
                    })
                    const content = completion.choices[0]?.message?.content
                    if (!content) return []
                    const parsed = JSON.parse(content) as z.infer<typeof IssueSchema>
                    return parsed.issues ?? []
                } catch {
                    return []
                }
            })
        )
        allIssues.push(...results.flat())
    }

    if (allIssues.length === 0) {
        await db.update(codebaseProject)
            .set({ optimizedAt: new Date() })
            .where(eq(codebaseProject.id, project.id))
        revalidatePath(`/ai/codesage/c/${slug}/optimize`)
        return { success: true, issueCount: 0 }
    }

    // Save issues
    await db.insert(codebaseOptimizationIssue).values(
        allIssues.map(issue => ({
            projectId: project.id,
            category: issue.category,
            severity: issue.severity,
            title: issue.title,
            filePath: issue.filePath,
            lineStart: issue.lineStart,
            lineEnd: issue.lineEnd,
            description: issue.description,
            currentCode: issue.currentCode,
            fixedCode: issue.fixedCode,
            explanation: issue.explanation,
            effortLevel: issue.effortLevel,
            status: "open",
        }))
    )

    await db.update(codebaseProject)
        .set({ optimizedAt: new Date() })
        .where(eq(codebaseProject.id, project.id))

    revalidatePath(`/ai/codesage/c/${slug}/optimize`)
    return { success: true, issueCount: allIssues.length }
}

export async function getOptimizationIssues(slug: string) {
    const session = await getSession(headers())
    if (!session?.user?.id) return { success: false, issues: [] }

    const project = await db.query.codebaseProject.findFirst({
        where: and(eq(codebaseProject.slug, slug), eq(codebaseProject.userId, session.user.id)),
        columns: { id: true, optimizedAt: true },
    })
    if (!project) return { success: false, issues: [] }

    const issues = await db.query.codebaseOptimizationIssue.findMany({
        where: eq(codebaseOptimizationIssue.projectId, project.id),
        orderBy: [codebaseOptimizationIssue.severity, codebaseOptimizationIssue.effortLevel],
    })

    return { success: true, issues, optimizedAt: project.optimizedAt }
}

export async function updateIssueStatus(issueId: string, status: "open" | "done" | "ignored") {
    const session = await getSession(headers())
    if (!session?.user?.id) return { success: false }

    const issue = await db.query.codebaseOptimizationIssue.findFirst({
        where: eq(codebaseOptimizationIssue.id, issueId),
        with: { project: { columns: { userId: true } } },
    })

    if (!issue || issue.project.userId !== session.user.id) return { success: false }

    await db.update(codebaseOptimizationIssue)
        .set({ status })
        .where(eq(codebaseOptimizationIssue.id, issueId))

    return { success: true }
}
