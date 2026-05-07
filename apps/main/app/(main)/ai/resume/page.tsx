import { getSession } from '@repo/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getResumeDrafts, getResumeTemplates } from '@/actions/(main)/ai/resume-draft.action'
import { ResumeHub } from './_components/resume-hub'

export const metadata = {
    title: 'Resume Builder | TheCoderz',
    description: 'Create, import, and manage professional resumes powered by AI.',
}

export default async function ResumeHubPage() {
    const session = await getSession(headers())
    if (!session?.user?.id) redirect('/login')

    const [draftsRes, templatesRes] = await Promise.all([
        getResumeDrafts(),
        getResumeTemplates(),
    ])

    return (
        <div className="w-full min-h-screen bg-neutral-50 dark:bg-neutral-950">
            <ResumeHub
                drafts={draftsRes.drafts ?? []}
                templates={templatesRes.templates ?? []}
            />
        </div>
    )
}
