'use server'

import { getSession } from '@repo/auth'
import { headers } from 'next/headers'
import { db, resumeDraft, users } from '@repo/db'
import { eq, and } from 'drizzle-orm'
import type {
    ResumeDraftContent,
    ResumeExperienceEntry,
    ResumeProjectEntry,
    ResumeEducationEntry,
    ResumeSkillGroup,
    ResumeCertificationEntry,
} from '@/types/resume-draft'

// ─────────────────────────────────────────────────────────────────────────────
// Helper: generate a short cuid-style id for array items
// ─────────────────────────────────────────────────────────────────────────────
function shortId(): string {
    return crypto.randomUUID().slice(0, 8)
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper: group Skills by category
// ─────────────────────────────────────────────────────────────────────────────
function buildSkillGroups(
    skills: Array<{ name: string; category: string }>
): ResumeSkillGroup[] {
    if (!skills.length) return []

    const map = new Map<string, string[]>()
    for (const s of skills) {
        const cat = s.category || 'Technical Skills'
        if (!map.has(cat)) map.set(cat, [])
        map.get(cat)!.push(s.name)
    }

    return Array.from(map.entries()).map(([category, items]) => ({
        category,
        items,
    }))
}

// ─────────────────────────────────────────────────────────────────────────────
// syncProfileToResumeDraft
//
// Reads the user's BuildrHQ profile data and maps it into ResumeDraftContent.
// Optionally persists to an existing draft when `draftId` is supplied.
// ─────────────────────────────────────────────────────────────────────────────
export async function syncProfileToResumeDraft(draftId?: string): Promise<
    | { success: true; content: ResumeDraftContent }
    | { success: false; error: string }
> {
    try {
        const session = await getSession(headers())
        if (!session?.user?.id) {
            return { success: false, error: 'Unauthorized. Please sign in.' }
        }

        const userId = session.user.id

        // ── 1. Fetch user and all profile data in one go ──────────────────────
        const user = await db.query.users.findFirst({
            where: eq(users.id, userId),
            with: {
                socialLinks: true,
                experiences: {
                    orderBy: (e: any, { desc }: any) => [desc(e.startDate)],
                },
                portfolioProjects: {
                    orderBy: (p: any, { desc }: any) => [desc(p.startDate)],
                    with: { projectLinks: true },
                },
                educations: {
                    orderBy: (e: any, { desc }: any) => [desc(e.startDate)],
                },
                skills: {
                    orderBy: (s: any, { asc }: any) => [asc(s.category), asc(s.order)],
                },
                certifications: {
                    orderBy: (c: any, { desc }: any) => [desc(c.issuedDate)],
                },
            },
        })

        if (!user) {
            return { success: false, error: 'User not found.' }
        }

        // ── 2. Fetch ProjectV2 submissions ───────────────────────────────────
        // Note: Using raw query since projectV2Submission may not be in the typed relations
        const projectSubmissions: any[] = []
        try {
            const { projectV2Submissions } = await import('@repo/db')
            const subs = await db.query.projectV2Submissions.findMany({
                where: eq((projectV2Submissions as any).userId, userId),
                orderBy: (s: any, { desc }: any) => [desc(s.createdAt)],
                with: {
                    project: {
                        columns: {
                            title: true,
                            slug: true,
                            technologies: true,
                            shortDescription: true,
                        },
                    },
                },
            })
            projectSubmissions.push(...subs)
        } catch {
            // projectV2Submissions may not exist — skip silently
        }

        // ── 3. Resolve social links ───────────────────────────────────────────
        const socialMap = new Map<string, string | null>(
            (user.socialLinks ?? []).map((s: { platform: string; url: string | null }) => [s.platform.toUpperCase(), s.url])
        )
        const github = socialMap.get('GITHUB') ?? null
        const linkedin = socialMap.get('LINKEDIN') ?? null
        const portfolio = socialMap.get('PORTFOLIO') ?? null
        const website = (user as any).website ?? socialMap.get('WEBSITE') ?? null

        // ── 4. Map header ─────────────────────────────────────────────────────
        const toOptionalString = (v: string | null | undefined): string | undefined =>
            v === null || v === undefined ? undefined : v
        const header = {
            name: user.name ?? '',
            email: user.email ?? '',
            title: user.occupation ?? '',
            summary: user.bio ?? '',
            linkedin: toOptionalString(linkedin),
            github: toOptionalString(github),
            website: toOptionalString(website),
            portfolio: toOptionalString(portfolio),
            phone: undefined,
            location: undefined,
        }

        // ── 5. Map experience ─────────────────────────────────────────────────
        const experience: ResumeExperienceEntry[] = (user.experiences ?? []).map((e: any) => {
            let bullets: string[] = e.bulletPoints ?? []
            if (!bullets.length && e.description) {
                bullets = e.description
                    .split('\n')
                    .map((b: string) => b.trim())
                    .filter(Boolean)
            }
            if (!bullets.length && e.description) {
                bullets = [e.description]
            }
            return {
                id: e.id,
                company: e.companyName,
                role: e.roleTitle,
                location: undefined,
                startDate: e.startDate.toISOString(),
                endDate: e.endDate?.toISOString(),
                current: e.isCurrentlyWorking,
                bullets,
            }
        })

        // ── 6. Map portfolio projects ─────────────────────────────────────────
        type ProjectLink = { linkType: string; url: string }
        const portfolioProjectsMapped: ResumeProjectEntry[] = (user.portfolioProjects ?? []).map((p: any) => {
            let bullets: string[] = p.bulletPoints ?? []
            if (!bullets.length && p.description) {
                bullets = [p.description]
            }
            const githubLink =
                p.projectLinks.find(
                    (l: ProjectLink) =>
                        l.linkType.toUpperCase() === 'GITHUB' ||
                        l.linkType.toUpperCase() === 'GITHUB_REPO'
                )?.url ?? undefined
            const liveLink =
                p.projectLinks.find(
                    (l: ProjectLink) =>
                        l.linkType.toUpperCase() === 'LIVE_SITE' ||
                        l.linkType.toUpperCase() === 'DEMO' ||
                        l.linkType.toUpperCase() === 'LIVE'
                )?.url ?? undefined
            return {
                id: p.id,
                name: p.projectName,
                description: p.description ?? '',
                technologies: p.technologies ?? [],
                github: githubLink,
                liveUrl: liveLink,
                bullets,
            }
        })

        // ── 7. Map BuildrHQ platform project submissions ──────────────────────
        const platformProjectsMapped: ResumeProjectEntry[] = projectSubmissions.map((sub: any) => ({
            id: shortId(),
            name: sub.project.title,
            description: sub.project.shortDescription ?? 'Built on BuildrHQ',
            technologies: sub.project.technologies ?? [],
            github: sub.githubUrl ?? undefined,
            liveUrl: sub.liveUrl ?? undefined,
            bullets: ['Built on BuildrHQ'],
        }))

        const projects: ResumeProjectEntry[] = [
            ...portfolioProjectsMapped,
            ...platformProjectsMapped,
        ]

        // ── 8. Map education ──────────────────────────────────────────────────
        const education: ResumeEducationEntry[] = (user.educations ?? []).map((e: any) => ({
            id: e.id,
            institution: e.institution,
            degree: e.degree ?? undefined,
            field: undefined,
            startDate: e.startDate?.toISOString() ?? '',
            endDate: e.endDate?.toISOString(),
            bullets: e.bulletPoints ?? [],
        }))

        // ── 9. Map skills ─────────────────────────────────────────────────────
        const skills: ResumeSkillGroup[] = buildSkillGroups(user.skills ?? [])

        // ── 10. Map certifications ────────────────────────────────────────────
        const certifications: ResumeCertificationEntry[] = (user.certifications ?? []).map((c: any) => ({
            id: c.id,
            name: c.name,
            issuer: c.issuer ?? undefined,
            date: c.issuedDate ? c.issuedDate.toISOString().slice(0, 10) : undefined,
            url: c.link ?? undefined,
        }))

        // ── 11. Compose final content ─────────────────────────────────────────
        const mappedContent: ResumeDraftContent = {
            header,
            experience,
            projects,
            education,
            skills,
            certifications,
        }

        // ── 12. Optionally persist to an existing draft ───────────────────────
        if (draftId) {
            await db.update(resumeDraft)
                .set({ content: JSON.parse(JSON.stringify(mappedContent)) })
                .where(eq(resumeDraft.id, draftId))
        }

        return { success: true, content: mappedContent }
    } catch (err: unknown) {
        console.error('[syncProfileToResumeDraft] error:', err)
        return {
            success: false,
            error:
                err instanceof Error
                    ? err.message
                    : 'Failed to sync profile data.',
        }
    }
}
