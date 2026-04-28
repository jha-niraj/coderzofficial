import { auth } from "@repo/auth"
import { redirect } from "next/navigation"
import { getCoverLetters } from "@/actions/(main)/ai/cover-letter.action"
import { CoverLetterClient } from "@/app/(main)/ai/coverletter/_components/cover-letter-client"

export default async function CoverLetterPage(props: {
    searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const session = await auth()
    const user = session?.user

    if (!user) {
        redirect("/login")
    }

    const { coverLetters = [] } = await getCoverLetters()

    const sp = await props.searchParams
    const selectedId = sp?.id as string | undefined

    return (
        <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
            <CoverLetterClient
                initialCoverLetters={coverLetters}
                selectedId={selectedId}
            />
        </div>
    )
}