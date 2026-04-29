import { auth } from "@repo/auth"
import { redirect } from "next/navigation"
import { getCodebaseProject, getCodebaseProjectFiles, getAskSessions, createAskSession } from "@/actions/(main)/ai/codesage/project.action"
import { notFound } from "next/navigation"
import { AskClient } from "./_components/ask-client"

export const metadata = { title: "Ask — CodeSage" }

export default async function AskPage({ params }: { params: Promise<{ slug: string }> }) {
    const session = await auth()
    if (!session?.user) redirect("/login")

    const { slug } = await params
    const [{ project }, { files = [] }, { sessions = [] }] = await Promise.all([
        getCodebaseProject(slug),
        getCodebaseProjectFiles(slug),
        getAskSessions(slug),
    ])

    if (!project) notFound()

    // Auto-create a session if none exists
    let activeSessionId: string | null = sessions[0]?.id ?? null
    if (!activeSessionId) {
        const { sessionId } = await createAskSession(slug)
        activeSessionId = sessionId
    }

    return (
        <AskClient
            projectSlug={slug}
            projectName={project.name}
            files={files}
            sessions={sessions}
            initialSessionId={activeSessionId}
            fileTree={project.fileTree as Record<string, unknown> | null}
        />
    )
}
