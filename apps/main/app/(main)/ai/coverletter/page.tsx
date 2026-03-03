import { redirect } from "next/navigation"

export default async function CoverLetterPage(props: {
    searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const sp = await props.searchParams
    const selectedId = sp?.id as string | undefined
    if (selectedId) {
        redirect(`/ai/resume/cover-letter?id=${selectedId}`)
    }
    redirect("/ai/resume/cover-letter")
}