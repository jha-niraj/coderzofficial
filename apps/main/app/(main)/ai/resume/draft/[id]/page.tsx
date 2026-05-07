import { getSession } from '@repo/auth'
import { headers } from 'next/headers'
import { redirect, notFound } from 'next/navigation'
import { getResumeDraft, getResumeTemplates } from '@/actions/(main)/ai/resume-draft.action'
import { ResumeEditor } from '../../_components/resume-editor'
import { ResumeDraftContent } from '@/types/resume-draft'

export default async function ResumeEditorPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const session = await getSession(headers())
    if (!session?.user?.id) redirect('/login')

    const [draftRes, templatesRes] = await Promise.all([
        getResumeDraft(id),
        getResumeTemplates(),
    ])

    if (!draftRes.success || !draftRes.draft) notFound()

    return (
        <ResumeEditor
            draft={draftRes.draft as { id: string; name: string; templateSlug: string; isPublic: boolean; shareSlug: string; atsScore: number | null }}
            content={draftRes.draft.content as unknown as ResumeDraftContent}
            templates={templatesRes.templates ?? []}
        />
    )
}
