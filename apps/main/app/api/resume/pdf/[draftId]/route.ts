import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@repo/auth'
import { prisma } from '@repo/prisma'
import { generateResumePDF } from '@/lib/resume-pdf'
import { ResumeDraftContent } from '@/types/resume-draft'

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ draftId: string }> }
) {
    try {
        const { draftId } = await params
        const session = await auth()

        // Allow public access for public drafts, otherwise require auth
        const draft = await prisma.resumeDraft.findFirst({
            where: session?.user?.id
                ? { id: draftId, OR: [{ userId: session.user.id }, { isPublic: true }] }
                : { id: draftId, isPublic: true },
        })

        if (!draft) {
            return NextResponse.json({ error: 'Not found or access denied' }, { status: 404 })
        }

        const content = draft.content as unknown as ResumeDraftContent
        const draftRecord = draft as { templateSlug?: string; name?: string }
        const templateSlug = draftRecord.templateSlug ?? 'clean-minimal'
        const buffer = await generateResumePDF(content, templateSlug)
        const safeName = (draftRecord.name ?? 'resume').replace(/[^a-z0-9]/gi, '_').toLowerCase()

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
