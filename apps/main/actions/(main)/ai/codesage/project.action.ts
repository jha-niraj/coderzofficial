"use server"

import { auth } from "@repo/auth"
import { prisma } from "@repo/prisma"
import { revalidatePath } from "next/cache"

async function getUser() {
    const session = await auth()
    if (!session?.user?.id) return null
    return session.user
}

export async function getCodebaseProjects() {
    const user = await getUser()
    if (!user) return { success: false, error: "Unauthorized", projects: [] }
    const projects = await prisma.codebaseProject.findMany({
        where: { userId: user.id },
        orderBy: { updatedAt: "desc" },
        include: {
            _count: { select: { files: true, sessions: true, issues: true, interviews: true } },
        },
    })
    return { success: true, projects }
}

export async function getCodebaseProject(slug: string) {
    const user = await getUser()
    if (!user) return { success: false, error: "Unauthorized", project: null }
    const project = await prisma.codebaseProject.findUnique({
        where: { slug, userId: user.id },
        include: {
            _count: { select: { files: true, sessions: true, issues: true, interviews: true } },
        },
    })
    if (!project) return { success: false, error: "Not found", project: null }
    return { success: true, project }
}

export async function getCodebaseProjectFiles(slug: string) {
    const user = await getUser()
    if (!user) return { success: false, error: "Unauthorized", files: [] }
    const project = await prisma.codebaseProject.findUnique({
        where: { slug, userId: user.id },
        select: { id: true },
    })
    if (!project) return { success: false, error: "Not found", files: [] }
    const files = await prisma.codebaseFile.findMany({
        where: { projectId: project.id },
        select: { id: true, filePath: true, fileName: true, extension: true, lineCount: true, language: true },
        orderBy: { filePath: "asc" },
    })
    return { success: true, files }
}

export async function getCodebaseFileContent(slug: string, filePath: string) {
    const user = await getUser()
    if (!user) return { success: false, error: "Unauthorized", content: null }
    const project = await prisma.codebaseProject.findUnique({
        where: { slug, userId: user.id },
        select: { id: true },
    })
    if (!project) return { success: false, error: "Not found", content: null }
    const file = await prisma.codebaseFile.findFirst({
        where: { projectId: project.id, filePath },
        select: { content: true, language: true, lineCount: true },
    })
    if (!file) return { success: false, error: "File not found", content: null }
    return { success: true, content: file.content, language: file.language, lineCount: file.lineCount }
}

export async function deleteCodebaseProject(slug: string) {
    const user = await getUser()
    if (!user) return { success: false, error: "Unauthorized" }
    const project = await prisma.codebaseProject.findUnique({
        where: { slug, userId: user.id },
        select: { id: true },
    })
    if (!project) return { success: false, error: "Not found" }
    await prisma.codebaseProject.delete({ where: { id: project.id } })
    revalidatePath("/ai/codesage")
    return { success: true }
}

export async function getUserPortfolioProjectsWithGitHub() {
    const user = await getUser()
    if (!user) return { success: false, projects: [] }
    const projects = await prisma.portfolioProject.findMany({
        where: { userId: user.id },
        include: { projectLinks: { where: { linkType: "GITHUB" }, take: 1 } },
        orderBy: { startDate: "desc" },
    })
    const withGitHub = projects
        .filter(p => p.projectLinks.length > 0)
        .map(p => ({
            id: p.id,
            name: p.projectName,
            githubUrl: p.projectLinks[0]!.url,
        }))
    return { success: true, projects: withGitHub }
}

export async function getAskSessions(slug: string) {
    const user = await getUser()
    if (!user) return { success: false, sessions: [] }
    const project = await prisma.codebaseProject.findUnique({
        where: { slug, userId: user.id },
        select: { id: true },
    })
    if (!project) return { success: false, sessions: [] }
    const sessions = await prisma.codebaseAskSession.findMany({
        where: { projectId: project.id, userId: user.id },
        orderBy: { updatedAt: "desc" },
        select: { id: true, title: true, createdAt: true, updatedAt: true },
        take: 20,
    })
    return { success: true, sessions }
}

export async function getAskSession(sessionId: string) {
    const user = await getUser()
    if (!user) return { success: false, session: null }
    const session = await prisma.codebaseAskSession.findUnique({
        where: { id: sessionId, userId: user.id },
    })
    if (!session) return { success: false, session: null }
    return { success: true, session }
}

export async function createAskSession(slug: string) {
    const user = await getUser()
    if (!user) return { success: false, error: "Unauthorized", sessionId: null }
    const project = await prisma.codebaseProject.findUnique({
        where: { slug, userId: user.id },
        select: { id: true },
    })
    if (!project) return { success: false, error: "Not found", sessionId: null }
    const session = await prisma.codebaseAskSession.create({
        data: { projectId: project.id, userId: user.id, messages: [] },
    })
    return { success: true, sessionId: session.id }
}

export async function saveAskSession(
    sessionId: string,
    messages: unknown[],
    title?: string
) {
    const user = await getUser()
    if (!user) return { success: false }
    await prisma.codebaseAskSession.update({
        where: { id: sessionId, userId: user.id },
        data: { messages: messages as never, title: title ?? undefined, updatedAt: new Date() },
    })
    return { success: true }
}

export async function deleteAskSession(sessionId: string) {
    const user = await getUser()
    if (!user) return { success: false }
    await prisma.codebaseAskSession.delete({ where: { id: sessionId, userId: user.id } })
    return { success: true }
}
