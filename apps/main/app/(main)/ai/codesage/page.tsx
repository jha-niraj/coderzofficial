import { auth } from "@repo/auth"
import { redirect } from "next/navigation"
import { getCodebaseProjects } from "@/actions/(main)/ai/codesage/project.action"
import { CodeSageDashboard } from "./_components/codesage-dashboard"

export const metadata = {
    title: "CodeSage — AI Codebase Intelligence | Coderz",
    description: "Chat with your codebase, find optimizations, and practice interviews on your own code.",
}

export default async function CodeSagePage() {
    const session = await auth()
    if (!session?.user) redirect("/login")

    const { projects = [] } = await getCodebaseProjects()

    return <CodeSageDashboard projects={projects as Parameters<typeof CodeSageDashboard>[0]["projects"]} />
}
