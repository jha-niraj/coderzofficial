import { auth } from "@repo/auth"
import { redirect } from "next/navigation"
import { getUserPortfolioProjectsWithGitHub } from "@/actions/(main)/ai/codesage/project.action"
import { NewProjectForm } from "./_components/new-project-form"

export const metadata = {
    title: "Add Codebase — CodeSage | Coderz",
}

export default async function NewCodebasePage() {
    const session = await auth()
    if (!session?.user) redirect("/login")

    const { projects: portfolioProjects = [] } = await getUserPortfolioProjectsWithGitHub()

    return <NewProjectForm portfolioProjects={portfolioProjects} />
}
