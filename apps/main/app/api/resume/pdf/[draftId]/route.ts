import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@repo/auth'
import { db, resumeDraft } from '@repo/db'
import { and, eq, or } from 'drizzle-orm'
import { generateResumePDF } from '@/lib/resume-pdf'
import { ResumeDraftContent } from '@/types/resume-draft'

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ draftId: string }> }
) {
    try {
        const { draftId } = await params
        const session = await getSession(req.headers)

        // Allow public access for public drafts, otherwise require auth
        const [draft] = session?.user?.id
            ? await db
                .select()
                .from(resumeDraft)
                .where(
                    and(
                        eq(resumeDraft.id, draftId),
                        or(
                            eq(resumeDraft.userId, session.user.id),
                            eq(resumeDraft.isPublic, true)
                        )
                    )
                )
                .limit(1)
            : await db
                .select()
                .from(resumeDraft)
                .where(
                    and(
                        eq(resumeDraft.id, draftId),
                        eq(resumeDraft.isPublic, true)
                    )
                )
                .limit(1)

        if (!draft) {
            return NextResponse.json({ error: 'Not found or access denied' }, { status: 404 })
        }

        const content = draft.content as unknown as ResumeDraftContent
        const templateSlug = draft.templateSlug ?? 'clean-minimal'
        const buffer = await generateResumePDF(content, templateSlug)
        const safeName = (draft.name ?? 'resume').replace(/[^a-z0-9]/gi, '_').toLowerCase()

        return new NextResponse(new Uint8Array(buffer), {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="${safeName}.pdf"`,
                'Content-Length': buffer.length.toString(),
            },
        })
    } catch (err) {
        console.error('PDF generation error:', err)
        return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 })
    }
}
