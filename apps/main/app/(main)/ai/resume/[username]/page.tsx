import { notFound } from "next/navigation"
import { getPublicResumeByUsername } from "@/actions/(main)/user/profile.action"
import { ResumePublicView } from "@/components/resume/resume-public-view"

export const metadata = {
    title: "Resume | Coderz",
    description: "View resume",
}

export default async function PublicResumePage({ params }: { params: Promise<{ username: string }> }) {
    const { username } = await params
    const result = await getPublicResumeByUsername(username)
    if (!result.success || !result.user) notFound()
    return <ResumePublicView user={result.user} />
}