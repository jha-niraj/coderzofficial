import { auth } from "@repo/auth"
import { redirect } from "next/navigation"
import { getCodebaseProject } from "@/actions/(main)/ai/codesage/project.action"
import { getInterviews } from "@/actions/(main)/ai/codesage/interview.action"
import { getOptimizationIssues } from "@/actions/(main)/ai/codesage/optimize.action"
import { notFound } from "next/navigation"
import { ProjectHubClient } from "./_components/project-hub-client"
type ProjectArg = Parameters<typeof ProjectHubClient>[0]["project"]

export default async function ProjectHubPage({ params }: { params: Promise<{ slug: string }> }) {
    const session = await auth()
    if (!session?.user) redirect("/login")

    const { slug } = await params
    const { project } = await getCodebaseProject(slug)
    if (!project) notFound()

    const [{ issues = [] }, { interviews = [] }] = await Promise.all([
        getOptimizationIssues(slug),
        getInterviews(slug),
    ])

    const openIssues = issues.filter(i => i.status === "open").length
    const completedInterviews = interviews.filter(i => i.status === "completed")
    const bestScore = completedInterviews.length > 0
        ? Math.max(...completedInterviews.map(i => i.score ?? 0))
        : null

    return (
        <ProjectHubClient
            project={project as ProjectArg}
            stats={{ openIssues, interviewCount: interviews.length, bestScore }}
        />
    )
}
