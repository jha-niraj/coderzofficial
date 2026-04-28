import { renderToBuffer } from '@react-pdf/renderer'
import React from 'react'
import { ResumeDraftContent } from '@/types/resume-draft'
import { CleanMinimalTemplate } from './clean-minimal'
import { DeveloperProTemplate } from './developer-pro'

// Map slug → component
const TEMPLATES: Record<string, React.FC<{ content: ResumeDraftContent }>> = {
    'clean-minimal': CleanMinimalTemplate,
    'developer-pro': DeveloperProTemplate,
    'executive-classic': CleanMinimalTemplate,   // reuse minimal, different colour handled via config
    'ats-optimizer': CleanMinimalTemplate,
    'modern-creative': DeveloperProTemplate,
}

export async function generateResumePDF(
    content: ResumeDraftContent,
    templateSlug: string,
): Promise<Buffer> {
    const Template = TEMPLATES[templateSlug] ?? CleanMinimalTemplate
    const element = React.createElement(Template, { content })
    const buffer = await renderToBuffer(element as Parameters<typeof renderToBuffer>[0])
    return Buffer.from(buffer)
}
