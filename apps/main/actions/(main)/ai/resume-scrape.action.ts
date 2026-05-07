'use server'

import { getSession } from '@repo/auth'
import { headers } from 'next/headers'
import { db, resumeDraft } from '@repo/db'
import { openai, zodResponseFormat } from '@/lib/openai-client'
import { ResumeDraftContent } from '@/types/resume-draft'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface GitHubRepo {
    name: string
    description: string | null
    language: string | null
    stars: number
    url: string
    languages: Record<string, number>
}

interface GitHubData {
    name: string | null
    bio: string | null
    company: string | null
    location: string | null
    blog: string | null
    avatarUrl: string | null
    publicRepos: number
    followers: number
    repos: GitHubRepo[]
}

// ─────────────────────────────────────────────────────────────────────────────
// GitHub API scraper (official REST API)
// ─────────────────────────────────────────────────────────────────────────────

export async function scrapeGitHubProfile(username: string): Promise<GitHubData> {
    const ghHeaders = {
        Authorization: `Bearer ${process.env.GITHUB_NIRAJ_JHA_TOKEN}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
    }

    const [profileRes, reposRes] = await Promise.all([
        fetch(`https://api.github.com/users/${username}`, { headers: ghHeaders }),
        fetch(`https://api.github.com/users/${username}/repos?sort=stars&per_page=8&type=owner`, { headers: ghHeaders }),
    ])

    if (!profileRes.ok) {
        throw new Error(`GitHub API error ${profileRes.status}: could not fetch profile for "${username}"`)
    }

    const profile = await profileRes.json()
    const rawRepos: Array<{
        name: string
        description: string | null
        language: string | null
        stargazers_count: number
        html_url: string
        topics?: string[]
    }> = reposRes.ok ? await reposRes.json() : []

    // Fetch languages for the top 3 repos in parallel
    const top3 = rawRepos.slice(0, 3)
    const languagesResults = await Promise.allSettled(
        top3.map((repo) =>
            fetch(`https://api.github.com/repos/${username}/${repo.name}/languages`, { headers: ghHeaders })
                .then((r) => (r.ok ? r.json() : {}))
        )
    )

    const repos: GitHubRepo[] = rawRepos.map((repo, idx) => {
        let languages: Record<string, number> = {}
        if (idx < 3) {
            const result = languagesResults[idx]
            if (result !== undefined && result.status === 'fulfilled') {
                languages = result.value as Record<string, number>
            }
        }
        return {
            name: repo.name,
            description: repo.description,
            language: repo.language,
            stars: repo.stargazers_count,
            url: repo.html_url,
            languages,
        }
    })

    return {
        name: profile.name ?? null,
        bio: profile.bio ?? null,
        company: profile.company ?? null,
        location: profile.location ?? null,
        blog: profile.blog ?? null,
        avatarUrl: profile.avatar_url ?? null,
        publicRepos: profile.public_repos ?? 0,
        followers: profile.followers ?? 0,
        repos,
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// LinkedIn scraper via Exa.ai content extraction
// ─────────────────────────────────────────────────────────────────────────────

export async function scrapeLinkedInProfile(linkedinUrl: string): Promise<string> {
    const res = await fetch('https://api.exa.ai/contents', {
        method: 'POST',
        headers: {
            'x-api-key': process.env.EXA_API_KEY!,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            ids: [linkedinUrl],
            text: { maxCharacters: 8000 },
        }),
    })

    if (!res.ok) {
        throw new Error(`Exa API error ${res.status}: could not extract LinkedIn profile`)
    }

    const data = await res.json()
    return data.results?.[0]?.text ?? ''
}

// ─────────────────────────────────────────────────────────────────────────────
// Exa generic URL scraper (for portfolio etc.)
// ─────────────────────────────────────────────────────────────────────────────

async function scrapeUrl(url: string): Promise<string> {
    const res = await fetch('https://api.exa.ai/contents', {
        method: 'POST',
        headers: {
            'x-api-key': process.env.EXA_API_KEY!,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            ids: [url],
            text: { maxCharacters: 6000 },
        }),
    })
    if (!res.ok) return ''
    const data = await res.json()
    return data.results?.[0]?.text ?? ''
}

// ─────────────────────────────────────────────────────────────────────────────
// Resume Zod schema (matches ResumeDraftContent)
// ─────────────────────────────────────────────────────────────────────────────

const ResumeSchema = z.object({
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
    experience: z.array(
        z.object({
            id: z.string(),
            company: z.string(),
            role: z.string(),
            location: z.string().nullable(),
            startDate: z.string().nullable(),
            endDate: z.string().nullable(),
            current: z.boolean(),
            bullets: z.array(z.string()),
        })
    ),
    projects: z.array(
        z.object({
            id: z.string(),
            name: z.string(),
            description: z.string().nullable(),
            technologies: z.array(z.string()),
            github: z.string().nullable(),
            liveUrl: z.string().nullable(),
            bullets: z.array(z.string()),
        })
    ),
    education: z.array(
        z.object({
            id: z.string(),
            institution: z.string(),
            degree: z.string().nullable(),
            field: z.string().nullable(),
            startDate: z.string().nullable(),
            endDate: z.string().nullable(),
            bullets: z.array(z.string()),
        })
    ),
    skills: z.array(
        z.object({
            category: z.string(),
            items: z.array(z.string()),
        })
    ),
    certifications: z.array(
        z.object({
            id: z.string(),
            name: z.string(),
            issuer: z.string().nullable(),
            date: z.string().nullable(),
            url: z.string().nullable(),
        })
    ),
})

// ─────────────────────────────────────────────────────────────────────────────
// Build resume from scraped data via GPT-4o
// ─────────────────────────────────────────────────────────────────────────────

export async function buildResumeFromScrapes(input: {
    linkedinText?: string
    githubData?: GitHubData
    twitterHandle?: string
    portfolioUrl?: string
    portfolioText?: string
}): Promise<ResumeDraftContent> {
    const parts: string[] = []

    if (input.linkedinText) {
        parts.push(`=== LinkedIn Profile ===\n${input.linkedinText}`)
    }

    if (input.githubData) {
        const gh = input.githubData
        const repoSummary = gh.repos
            .map((r) => {
                const langs = Object.keys(r.languages).join(', ')
                return `- ${r.name} (${r.stars} stars): ${r.description ?? 'no description'}. Languages: ${langs || r.language || 'unknown'}. URL: ${r.url}`
            })
            .join('\n')

        parts.push(
            `=== GitHub Profile ===
Name: ${gh.name ?? ''}
Bio: ${gh.bio ?? ''}
Company: ${gh.company ?? ''}
Location: ${gh.location ?? ''}
Blog/Website: ${gh.blog ?? ''}
Public Repos: ${gh.publicRepos}
Followers: ${gh.followers}

Top Repositories:
${repoSummary}`
        )
    }

    if (input.portfolioText) {
        parts.push(`=== Portfolio / Personal Website ===\n${input.portfolioText}`)
    }

    if (input.twitterHandle) {
        parts.push(`=== Twitter/X Handle ===\n@${input.twitterHandle.replace(/^@/, '')}`)
    }

    if (parts.length === 0) {
        throw new Error('No data available to build resume from')
    }

    const combinedData = parts.join('\n\n')

    const res = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
            {
                role: 'system',
                content: `You are a professional resume builder. Parse all provided data from LinkedIn, GitHub, portfolio, and other sources to build a comprehensive, polished resume.

Rules:
- Use random 8-char alphanumeric IDs for all id fields (e.g. "a1b2c3d4")
- Dates should be ISO format YYYY-MM-DD or partial like "2022-01" — use null if unknown
- Group skills by category: Programming Languages, Frameworks & Libraries, Tools & DevOps, Databases, Cloud & Infrastructure, etc.
- Extract all work experience from LinkedIn if available
- Extract notable GitHub projects as resume projects (include stars, languages, URLs)
- Write polished bullet points using action verbs and impact metrics where possible
- All nullable fields must be null (never undefined or empty string) if data not available
- Populate github/linkedin header fields from the profile URLs if present
- Return valid JSON matching the schema exactly`,
            },
            {
                role: 'user',
                content: `Build a professional resume from this data:\n\n${combinedData}`,
            },
        ],
        response_format: zodResponseFormat(ResumeSchema, 'resume_content'),
    })

    const rawContent = res.choices[0]?.message?.content ?? '{}'
    const parsed = JSON.parse(rawContent)

    // Normalize nullable fields to match ResumeDraftContent interface
    const resume: ResumeDraftContent = {
        header: {
            name: parsed.header?.name ?? '',
            email: parsed.header?.email ?? '',
            phone: parsed.header?.phone ?? undefined,
            location: parsed.header?.location ?? undefined,
            title: parsed.header?.title ?? undefined,
            summary: parsed.header?.summary ?? undefined,
            website: parsed.header?.website ?? undefined,
            linkedin: parsed.header?.linkedin ?? undefined,
            github: parsed.header?.github ?? undefined,
            portfolio: parsed.header?.portfolio ?? undefined,
        },
        experience: (parsed.experience ?? []).map((e: { id: string; company: string; role: string; location?: string | null; startDate?: string | null; endDate?: string | null; current: boolean; bullets: string[] }) => ({
            id: e.id,
            company: e.company,
            role: e.role,
            location: e.location ?? undefined,
            startDate: e.startDate ?? '',
            endDate: e.endDate ?? undefined,
            current: e.current,
            bullets: e.bullets ?? [],
        })),
        projects: (parsed.projects ?? []).map((p: { id: string; name: string; description?: string | null; technologies: string[]; github?: string | null; liveUrl?: string | null; bullets: string[] }) => ({
            id: p.id,
            name: p.name,
            description: p.description ?? undefined,
            technologies: p.technologies ?? [],
            github: p.github ?? undefined,
            liveUrl: p.liveUrl ?? undefined,
            bullets: p.bullets ?? [],
        })),
        education: (parsed.education ?? []).map((e: { id: string; institution: string; degree?: string | null; field?: string | null; startDate?: string | null; endDate?: string | null; bullets: string[] }) => ({
            id: e.id,
            institution: e.institution,
            degree: e.degree ?? undefined,
            field: e.field ?? undefined,
            startDate: e.startDate ?? '',
            endDate: e.endDate ?? undefined,
            bullets: e.bullets ?? [],
        })),
        skills: (parsed.skills ?? []).map((s: { category: string; items: string[] }) => ({
            category: s.category,
            items: s.items ?? [],
        })),
        certifications: (parsed.certifications ?? []).map((c: { id: string; name: string; issuer?: string | null; date?: string | null; url?: string | null }) => ({
            id: c.id,
            name: c.name,
            issuer: c.issuer ?? undefined,
            date: c.date ?? undefined,
            url: c.url ?? undefined,
        })),
    }

    return resume
}

// ─────────────────────────────────────────────────────────────────────────────
// Main export: scrape profiles → build resume → save draft
// ─────────────────────────────────────────────────────────────────────────────

export async function importProfileAndCreateDraft(input: {
    linkedinUrl?: string
    githubUsername?: string
    twitterHandle?: string
    portfolioUrl?: string
}): Promise<{ success: boolean; draftId?: string; error?: string }> {
    const session = await getSession(headers())
    if (!session?.user?.id) {
        return { success: false, error: 'Unauthorized. Please sign in to import your profile.' }
    }

    if (!input.linkedinUrl && !input.githubUsername) {
        return { success: false, error: 'Please provide at least a LinkedIn URL or GitHub username.' }
    }

    try {
        // Scrape LinkedIn and GitHub in parallel
        const [linkedinResult, githubResult] = await Promise.allSettled([
            input.linkedinUrl ? scrapeLinkedInProfile(input.linkedinUrl) : Promise.resolve(''),
            input.githubUsername ? scrapeGitHubProfile(input.githubUsername) : Promise.resolve(null),
        ])

        const linkedinText =
            linkedinResult.status === 'fulfilled' ? (linkedinResult.value as string) : ''
        const githubData =
            githubResult.status === 'fulfilled' ? (githubResult.value as GitHubData | null) : null

        if (linkedinResult.status === 'rejected') {
            console.warn('[resume-scrape] LinkedIn scrape failed:', linkedinResult.reason)
        }
        if (githubResult.status === 'rejected') {
            console.warn('[resume-scrape] GitHub scrape failed:', githubResult.reason)
        }

        // If both primary scrapes failed, bail
        if (!linkedinText && !githubData) {
            return {
                success: false,
                error: 'Could not extract data from LinkedIn or GitHub. Please check the URLs and try again.',
            }
        }

        // Scrape portfolio if provided
        let portfolioText = ''
        if (input.portfolioUrl) {
            try {
                portfolioText = await scrapeUrl(input.portfolioUrl)
            } catch {
                console.warn('[resume-scrape] Portfolio scrape failed')
            }
        }

        // Build resume with AI
        const content = await buildResumeFromScrapes({
            linkedinText: linkedinText || undefined,
            githubData: githubData ?? undefined,
            twitterHandle: input.twitterHandle,
            portfolioUrl: input.portfolioUrl,
            portfolioText: portfolioText || undefined,
        })

        // Determine which sources were used for the importedFrom tag
        const sources: string[] = []
        if (linkedinText) sources.push('linkedin')
        if (githubData) sources.push('github')
        if (portfolioText) sources.push('portfolio')

        // Insert draft into DB
        const draftName = content.header.name
            ? `${content.header.name}'s Resume`
            : 'Imported Resume'

        const [draft] = await db
            .insert(resumeDraft)
            .values({
                userId: session.user.id,
                name: draftName,
                content: content as unknown as Record<string, unknown>,
                templateSlug: 'clean-minimal',
                importedFrom: sources.join('_') + '_import',
                importedUrl: input.linkedinUrl ?? (input.githubUsername ? `https://github.com/${input.githubUsername}` : undefined),
            })
            .returning()

        revalidatePath('/ai/resume')

        if (!draft) {
            return { success: false, error: 'Failed to save resume draft to database.' }
        }

        return { success: true, draftId: draft.id }
    } catch (e) {
        console.error('[resume-scrape] importProfileAndCreateDraft error:', e)
        return {
            success: false,
            error: e instanceof Error ? e.message : 'An unexpected error occurred during import.',
        }
    }
}
