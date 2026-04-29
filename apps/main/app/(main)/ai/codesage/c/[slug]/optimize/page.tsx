import { auth } from "@repo/auth"
import { redirect } from "next/navigation"
import { getCodebaseProject } from "@/actions/(main)/ai/codesage/project.action"
import { getOptimizationIssues } from "@/actions/(main)/ai/codesage/optimize.action"
import { notFound } from "next/navigation"
import { OptimizeClient } from "./_components/optimize-client"
type IssueArg = Parameters<typeof OptimizeClient>[0]["issues"]

export const metadata = { title: "Optimize — CodeSage" }

export default async function OptimizePage({ params }: { params: Promise<{ slug: string }> }) {
    const session = await auth()
    if (!session?.user) redirect("/login")

    const { slug } = await params
    const [{ project }, { issues = [], optimizedAt }] = await Promise.all([
        getCodebaseProject(slug),
        getOptimizationIssues(slug),
    ])

    if (!project) notFound()

    return (
        <OptimizeClient
            projectSlug={slug}
            projectName={project.name}
            issues={issues as IssueArg}
            optimizedAt={optimizedAt ?? null}
            isReady={project.indexStatus === "ready"}
        />
    )
}
