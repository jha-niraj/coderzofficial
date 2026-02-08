import { redirect } from "next/navigation"

interface Props {
    params: Promise<{ jobSlug: string }>
}

export default async function AssessmentDetailRedirectPage({ params }: Props) {
    const { jobSlug } = await params
    redirect(`/assignments/${jobSlug}`)
}
