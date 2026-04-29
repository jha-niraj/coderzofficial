import { auth } from "@repo/auth"
import { redirect } from "next/navigation"
import { getCodebaseProject } from "@/actions/(main)/ai/codesage/project.action"
import { getInterviews, getFolders } from "@/actions/(main)/ai/codesage/interview.action"
import { notFound } from "next/navigation"
import { InterviewClient } from "./_components/interview-client"

export const metadata = { title: "Interview — CodeSage" }

export default async function InterviewPage({ params }: { params: Promise<{ slug: string }> }) {
    const session = await auth()
    if (!session?.user) redirect("/login")

    const { slug } = await params
    const [{ project }, { interviews = [] }, { folders = [] }] = await Promise.all([
        getCodebaseProject(slug),
        getInterviews(slug),
        getFolders(slug),
    ])

    if (!project) notFound()

    return (
        <InterviewClient
            projectSlug={slug}
            projectName={project.name}
            interviews={interviews}
            folders={folders}
            isReady={project.indexStatus === "ready"}
        />
    )
}
