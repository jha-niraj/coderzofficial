"use server"

import { getSession } from "@repo/auth"
import { headers } from "next/headers"
import {
    db,
    codebaseProject,
    codebaseFile,
    codebaseAskSession,
} from "@repo/db"
import { eq, and, desc } from "drizzle-orm"
import { revalidatePath } from "next/cache"

async function getUser() {
    const session = await getSession(headers())
    if (!session?.user?.id) return null
    return session.user
}

export async function getCodebaseProjects() {
    const user = await getUser()
    if (!user) return { success: false, error: "Unauthorized", projects: [] }
    const projects = await db.query.codebaseProject.findMany({
        where: eq(codebaseProject.userId, user.id),
        orderBy: [desc(codebaseProject.updatedAt)],
        with: {
            files: { columns: { id: true } },
            askSessions: { columns: { id: true } },
            optimizationIssues: { columns: { id: true } },
            interviews: { columns: { id: true } },
        },
    })
    return { success: true, projects }
}

export async function getCodebaseProject(slug: string) {
    const user = await getUser()
    if (!user) return { success: false, error: "Unauthorized", project: null }
    const project = await db.query.codebaseProject.findFirst({
        where: and(eq(codebaseProject.slug, slug), eq(codebaseProject.userId, user.id)),
        with: {
            files: { columns: { id: true } },
            askSessions: { columns: { id: true } },
            optimizationIssues: { columns: { id: true } },
            interviews: { columns: { id: true } },
        },
    })
    if (!project) return { success: false, error: "Not found", project: null }
    return { success: true, project }
}

export async function getCodebaseProjectFiles(slug: string) {
    const user = await getUser()
    if (!user) return { success: false, error: "Unauthorized", files: [] }
    const project = await db.query.codebaseProject.findFirst({
        where: and(eq(codebaseProject.slug, slug), eq(codebaseProject.userId, user.id)),
        columns: { id: true },
    })
    if (!project) return { success: false, error: "Not found", files: [] }
    const files = await db.query.codebaseFile.findMany({
        where: eq(codebaseFile.projectId, project.id),
        columns: { id: true, filePath: true, fileName: true, extension: true, lineCount: true, language: true },
        orderBy: [codebaseFile.filePath],
    })
    return { success: true, files }
}

export async function getCodebaseFileContent(slug: string, filePath: string) {
    const user = await getUser()
    if (!user) return { success: false, error: "Unauthorized", content: null }
    const project = await db.query.codebaseProject.findFirst({
        where: and(eq(codebaseProject.slug, slug), eq(codebaseProject.userId, user.id)),
        columns: { id: true },
    })
    if (!project) return { success: false, error: "Not found", content: null }
    const file = await db.query.codebaseFile.findFirst({
        where: and(eq(codebaseFile.projectId, project.id), eq(codebaseFile.filePath, filePath)),
        columns: { content: true, language: true, lineCount: true },
    })
    if (!file) return { success: false, error: "File not found", content: null }
    return { success: true, content: file.content, language: file.language, lineCount: file.lineCount }
}

export async function deleteCodebaseProject(slug: string) {
    const user = await getUser()
    if (!user) return { success: false, error: "Unauthorized" }
    const project = await db.query.codebaseProject.findFirst({
        where: and(eq(codebaseProject.slug, slug), eq(codebaseProject.userId, user.id)),
        columns: { id: true },
    })
    if (!project) return { success: false, error: "Not found" }
    await db.delete(codebaseProject).where(eq(codebaseProject.id, project.id))
    revalidatePath("/ai/codesage")
    return { success: true }
}

export async function getUserPortfolioProjectsWithGitHub() {
    const user = await getUser()
    if (!user) return { success: false, projects: [] }
    try {
        const { portfolioProjects, projectLinks } = await import('@repo/db')
        const projects = await db.query.portfolioProjects.findMany({
            where: eq((portfolioProjects as any).userId, user.id),
            with: {
                projectLinks: {
                    where: (pl: any, { eq }: any) => eq(pl.linkType, "GITHUB"),
                    limit: 1,
                },
            },
            orderBy: (pp: any, { desc }: any) => [desc(pp.startDate)],
        })
        const withGitHub = projects
            .filter((p: any) => p.projectLinks.length > 0)
            .map((p: any) => ({
                id: p.id,
                name: p.projectName,
                githubUrl: p.projectLinks[0]!.url,
            }))
        return { success: true, projects: withGitHub }
    } catch {
        return { success: false, projects: [] }
    }
}

export async function getAskSessions(slug: string) {
    const user = await getUser()
    if (!user) return { success: false, sessions: [] }
    const project = await db.query.codebaseProject.findFirst({
        where: and(eq(codebaseProject.slug, slug), eq(codebaseProject.userId, user.id)),
        columns: { id: true },
    })
    if (!project) return { success: false, sessions: [] }
    const sessions = await db.query.codebaseAskSession.findMany({
        where: and(
            eq(codebaseAskSession.projectId, project.id),
            eq(codebaseAskSession.userId, user.id)
        ),
        orderBy: [desc(codebaseAskSession.updatedAt)],
        columns: { id: true, title: true, createdAt: true, updatedAt: true },
        limit: 20,
    })
    return { success: true, sessions }
}

export async function getAskSession(sessionId: string) {
    const user = await getUser()
    if (!user) return { success: false, session: null }
    const session = await db.query.codebaseAskSession.findFirst({
        where: and(
            eq(codebaseAskSession.id, sessionId),
            eq(codebaseAskSession.userId, user.id)
        ),
    })
    if (!session) return { success: false, session: null }
    return { success: true, session }
}

export async function createAskSession(slug: string) {
    const user = await getUser()
    if (!user) return { success: false, error: "Unauthorized", sessionId: null }
    const project = await db.query.codebaseProject.findFirst({
        where: and(eq(codebaseProject.slug, slug), eq(codebaseProject.userId, user.id)),
        columns: { id: true },
    })
    if (!project) return { success: false, error: "Not found", sessionId: null }
    const [session] = await db.insert(codebaseAskSession).values({
        projectId: project.id,
        userId: user.id,
        messages: [] as any,
    }).returning()
    return { success: true, sessionId: session!.id }
}

export async function saveAskSession(
    sessionId: string,
    messages: unknown[],
    title?: string
) {
    const user = await getUser()
    if (!user) return { success: false }
    await db.update(codebaseAskSession)
        .set({ messages: messages as any, title: title ?? undefined, updatedAt: new Date() })
        .where(and(
            eq(codebaseAskSession.id, sessionId),
            eq(codebaseAskSession.userId, user.id)
        ))
    return { success: true }
}

export async function deleteAskSession(sessionId: string) {
    const user = await getUser()
    if (!user) return { success: false }
    await db.delete(codebaseAskSession)
        .where(and(
            eq(codebaseAskSession.id, sessionId),
            eq(codebaseAskSession.userId, user.id)
        ))
    return { success: true }
}
