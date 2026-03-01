import { auth } from "@repo/auth"
import { redirect } from "next/navigation"
import { getCoverLetters } from "@/actions/(main)/ai/cover-letter.action"
import { CoverLetterClient } from "./_components/cover-letter-client"

export default async function CoverLetterPage(props: {
    searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const session = await auth()
    const user = session?.user

    if (!user) {
        redirect("/login")
    }

    const { coverLetters = [] } = await getCoverLetters()

    // Check if there's a selected cover letter to resume/view step 3
    const sp = await props.searchParams
    const selectedId = sp?.id as string | undefined

    return (
        <div className="flex flex-col h-full mx-auto max-w-7xl px-4 py-8">
            <CoverLetterClient
                initialCoverLetters={coverLetters}
                selectedId={selectedId}
            />
        </div>
    )
}