'use server'

import { getSession } from '@repo/auth'
import { headers } from 'next/headers'
import Exa from 'exa-js'
import { openai } from '@/lib/openai-client'
import { ResumeDraftContent } from '@/types/resume-draft'
import { createResumeDraft } from './resume-draft.action'
import { z } from 'zod'
import { zodResponseFormat } from 'openai/helpers/zod'

// ── Exa client (lazy singleton) ──────────────────────────────────────────────
let _exa: Exa | null = null
const exa = new Proxy({} as Exa, {
    get(_, prop) {
        if (!_exa) _exa = new Exa(process.env.EXA_API_KEY!)
        return Reflect.get(_exa, prop)
    }
})

async function fetchPageText(url: string): Promise<string> {
    const result = await exa.getContents([url], { text: true, livecrawlTimeout: 10000 })
    return result?.results?.[0]?.text?.trim() ?? ''
}

// ─────────────────────────────────────────────────────────────────────────────
// Schema for structured extraction
// ─────────────────────────────────────────────────────────────────────────────
const ResumeContentSchema = z.object({
    header: z.object({
        name: z.string(),
        email: z.string().nullable(),
        phone: z.string().nullable(),
        location: z.string().nullable(),
        title: z.string().nullable(),
        summary: z.string().nullable(),
        website: z.string().nullable(),
        linkedin: z.string().nullable(),
        github: z.string().nullable(),
        portfolio: z.string().nullable(),
    }),
    experience: z.array(z.object({
        id: z.string(),
        company: z.string(),
        role: z.string(),
        location: z.string().nullable(),
        startDate: z.string(),
        endDate: z.string().nullable(),
        current: z.boolean(),
        bullets: z.array(z.string()),
    })),
    projects: z.array(z.object({
        id: z.string(),
        name: z.string(),
        description: z.string().nullable(),
        technologies: z.array(z.string()),
        github: z.string().nullable(),
        liveUrl: z.string().nullable(),
        bullets: z.array(z.string()),
    })),
    education: z.array(z.object({
        id: z.string(),
        institution: z.string(),
        degree: z.string().nullable(),
        field: z.string().nullable(),
        startDate: z.string(),
        endDate: z.string().nullable(),
        bullets: z.array(z.string()),
    })),
    skills: z.array(z.object({
        category: z.string(),
        items: z.array(z.string()),
    })),
    certifications: z.array(z.object({
        id: z.string(),
        name: z.string(),
        issuer: z.string().nullable(),
        date: z.string().nullable(),
        url: z.string().nullable(),
    })),
})

// ─────────────────────────────────────────────────────────────────────────────
// Extract structured resume content from raw text using GPT
// ─────────────────────────────────────────────────────────────────────────────
async function extractStructuredContent(rawText: string, sourceHint: string): Promise<ResumeDraftContent> {
    const res = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
            {
                role: 'system',
                content: `You are a resume parser. Extract structured resume data from ${sourceHint} content.
Use cuid-style IDs (random 8-char strings) for array items.
Dates should be ISO strings (YYYY-MM-DD).
Group skills by category (Programming Languages, Frameworks, Tools, Databases, Cloud, etc.).
All nullable fields should be null if not found, never undefined.`,
            },
            {
                role: 'user',
                content: `Extract resume data from this content:\n\n${rawText.slice(0, 8000)}`,
            },
        ],
        response_format: zodResponseFormat(ResumeContentSchema, 'resume_content'),
    })

    const parsed = JSON.parse(res.choices[0]?.message?.content ?? '{}')
    return parsed as ResumeDraftContent
}

// ─────────────────────────────────────────────────────────────────────────────
// IMPORT from LinkedIn URL
// ─────────────────────────────────────────────────────────────────────────────
export async function importFromLinkedIn(url: string) {
    const session = await getSession(headers())
    if (!session?.user?.id) return { success: false, error: 'Unauthorized' }

    try {
        const raw = await fetchPageText(url)
        if (!raw) return { success: false, error: 'Could not extract LinkedIn profile. Make sure the profile is public.' }

        const content = await extractStructuredContent(raw, 'a LinkedIn profile page')
        return { success: true, content, rawPreview: raw.slice(0, 500) }
    } catch (e) {
        return { success: false, error: e instanceof Error ? e.message : 'Import failed' }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// IMPORT from GitHub profile URL
// ─────────────────────────────────────────────────────────────────────────────
export async function importFromGitHub(url: string) {
    const session = await getSession(headers())
    if (!session?.user?.id) return { success: false, error: 'Unauthorized' }

    try {
        const username = url.replace(/https?:\/\/(www\.)?github\.com\/?/, '').split('/')[0]

        const [profileRaw, reposRaw] = await Promise.all([
            fetchPageText(`https://github.com/${username}`),
            fetchPageText(`https://github.com/${username}?tab=repositories`),
        ])

        if (!profileRaw) return { success: false, error: 'Could not extract GitHub profile. Make sure the profile is public.' }

        const combined = `=== GitHub Profile ===\n${profileRaw}\n\n=== Repositories ===\n${reposRaw}`
        const content = await extractStructuredContent(combined, 'a GitHub developer profile and repositories')

        return { success: true, content, username }
    } catch (e) {
        return { success: false, error: e instanceof Error ? e.message : 'GitHub import failed' }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// IMPORT from pasted resume text / PDF text
// ─────────────────────────────────────────────────────────────────────────────
export async function importFromText(text: string) {
    const session = await getSession(headers())
    if (!session?.user?.id) return { success: false, error: 'Unauthorized' }

    if (text.trim().length < 50) return { success: false, error: 'Text is too short to extract resume data.' }

    try {
        const content = await extractStructuredContent(text, 'a pasted resume or document')
        return { success: true, content }
    } catch (e) {
        return { success: false, error: e instanceof Error ? e.message : 'Import failed' }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// IMPORT from any URL (generic: company page, portfolio, etc.)
// ─────────────────────────────────────────────────────────────────────────────
export async function importFromUrl(url: string) {
    const session = await getSession(headers())
    if (!session?.user?.id) return { success: false, error: 'Unauthorized' }

    try {
        const raw = await fetchPageText(url)
        if (!raw) return { success: false, error: 'Could not extract content from this URL.' }

        const content = await extractStructuredContent(raw, 'a professional profile or portfolio page')
        return { success: true, content }
    } catch (e) {
        return { success: false, error: e instanceof Error ? e.message : 'Import failed' }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// COMBINED: Scrape multiple sources and merge into one draft
// ─────────────────────────────────────────────────────────────────────────────
export async function importAndCreateDraft(input: {
    name: string
    templateSlug: string
    linkedinUrl?: string
    githubUrl?: string
    pastedText?: string
}) {
    const session = await getSession(headers())
    if (!session?.user?.id) return { success: false, error: 'Unauthorized' }

    try {
        const parts: string[] = []
        const usedSources: string[] = []

        if (input.linkedinUrl) {
            const raw = await fetchPageText(input.linkedinUrl)
            if (raw) { parts.push(`=== LinkedIn Profile ===\n${raw}`); usedSources.push('linkedin') }
        }

        if (input.githubUrl) {
            const username = input.githubUrl.replace(/https?:\/\/(www\.)?github\.com\/?/, '').split('/')[0]
            const raw = await fetchPageText(`https://github.com/${username}`)
            if (raw) { parts.push(`=== GitHub Profile ===\n${raw}`); usedSources.push('github') }
        }

        if (input.pastedText?.trim()) {
            parts.push(`=== Pasted Resume/Text ===\n${input.pastedText}`)
            usedSources.push('text')
        }

        if (parts.length === 0) return { success: false, error: 'Please provide at least one source (LinkedIn, GitHub, or resume text).' }

        const combined = parts.join('\n\n')
        const content = await extractStructuredContent(combined, `${usedSources.join(' + ')} sources`)

        const result = await createResumeDraft({
            name: input.name,
            templateSlug: input.templateSlug,
            content,
            importedFrom: usedSources.join(','),
            importedUrl: input.linkedinUrl ?? input.githubUrl,
        })

        return result
    } catch (e) {
        return { success: false, error: e instanceof Error ? e.message : 'Import failed' }
    }
}
