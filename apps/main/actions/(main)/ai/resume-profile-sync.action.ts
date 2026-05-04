'use server'

import { auth } from '@repo/auth'
import { prisma } from '@repo/prisma'
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
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: 'Unauthorized. Please sign in.' }
        }

        const userId = session.user.id

        // ── 1. Fetch user and all profile data in one go ──────────────────────
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                name: true,
                email: true,
                username: true,
                bio: true,
                occupation: true, // used as "current role / title"
                website: true,
                // Social links hold github, linkedin, etc.
                socialLinks: {
                    select: { platform: true, url: true },
                },
                // Work experience
                experiences: {
                    orderBy: { startDate: 'desc' },
                    select: {
                        id: true,
                        companyName: true,
                        roleTitle: true,
                        startDate: true,
                        endDate: true,
                        isCurrentlyWorking: true,
                        bulletPoints: true,
                        description: true,
                    },
                },
                // Portfolio projects
                portfolioProjects: {
                    orderBy: { startDate: 'desc' },
                    select: {
                        id: true,
                        projectName: true,
                        description: true,
                        bulletPoints: true,
                        technologies: true,
                        projectLinks: {
                            select: { linkType: true, url: true },
                        },
                    },
                },
                // Education
                educations: {
                    orderBy: { startDate: 'desc' },
                    select: {
                        id: true,
                        institution: true,
                        degree: true,
                        startDate: true,
                        endDate: true,
                        bulletPoints: true,
                    },
                },
                // Skills
                skills: {
                    orderBy: [{ category: 'asc' }, { order: 'asc' }],
                    select: { name: true, level: true, category: true },
                },
                // Certifications
                certifications: {
                    orderBy: { issuedDate: 'desc' },
                    select: {
                        id: true,
                        name: true,
                        issuer: true,
                        issuedDate: true,
                        link: true,
                    },
                },
            },
        })

        if (!user) {
            return { success: false, error: 'User not found.' }
        }

        // ── 2. Fetch ProjectV2 submissions via UserProjectV2Progress ──────────
        const projectSubmissions = await prisma.projectV2Submission.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                githubUrl: true,
                liveUrl: true,
                project: {
                    select: {
                        title: true,
                        slug: true,
                        technologies: true,
                        shortDescription: true,
                    },
                },
            },
        })

        // ── 3. Resolve social links ───────────────────────────────────────────
        const socialMap = new Map<string, string | null>(
            user.socialLinks.map((s: { platform: string; url: string | null }) => [s.platform.toUpperCase(), s.url])
        )
        const github =
            socialMap.get('GITHUB') ?? null
        const linkedin =
            socialMap.get('LINKEDIN') ?? null
        const portfolio =
            socialMap.get('PORTFOLIO') ?? null
        const website =
            user.website ??
            socialMap.get('WEBSITE') ??
            null

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
        const experience: ResumeExperienceEntry[] = user.experiences.map((e: {
            id: string; companyName: string; roleTitle: string; startDate: Date;
            endDate: Date | null; isCurrentlyWorking: boolean; bulletPoints: string[] | null;
            description: string | null;
        }) => {
            // Prefer bulletPoints; fall back to splitting description by newline
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
        const portfolioProjectsMapped: ResumeProjectEntry[] =
            user.portfolioProjects.map((p: {
                id: string; projectName: string; description: string | null;
                bulletPoints: string[] | null; technologies: string[] | null;
                projectLinks: ProjectLink[];
            }) => {
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
        type ProjectSub = { id: string; githubUrl: string | null; liveUrl: string | null; project: { title: string; slug: string; technologies: string[] | null; shortDescription: string | null } }
        const platformProjectsMapped: ResumeProjectEntry[] = projectSubmissions.map(
            (sub: ProjectSub) => ({
                id: shortId(),
                name: sub.project.title,
                description:
                    sub.project.shortDescription ??
                    'Built on BuildrHQ',
                technologies: sub.project.technologies ?? [],
                github: sub.githubUrl ?? undefined,
                liveUrl: sub.liveUrl ?? undefined,
                bullets: ['Built on BuildrHQ'],
            })
        )

        const projects: ResumeProjectEntry[] = [
            ...portfolioProjectsMapped,
            ...platformProjectsMapped,
        ]

        // ── 8. Map education ──────────────────────────────────────────────────
        const education: ResumeEducationEntry[] = user.educations.map((e: {
            id: string; institution: string; degree: string | null;
            startDate: Date | null; endDate: Date | null; bulletPoints: string[] | null;
        }) => ({
            id: e.id,
            institution: e.institution,
            degree: e.degree ?? undefined,
            field: undefined,
            startDate: e.startDate?.toISOString() ?? '',
            endDate: e.endDate?.toISOString(),
            bullets: e.bulletPoints ?? [],
        }))

        // ── 9. Map skills ─────────────────────────────────────────────────────
        const skills: ResumeSkillGroup[] = buildSkillGroups(user.skills)

        // ── 10. Map certifications ────────────────────────────────────────────
        const certifications: ResumeCertificationEntry[] = user.certifications.map(
            (c: { id: string; name: string; issuer: string | null; issuedDate: Date | null; link: string | null }) => ({
                id: c.id,
                name: c.name,
                issuer: c.issuer ?? undefined,
                date: c.issuedDate
                    ? c.issuedDate.toISOString().slice(0, 10)
                    : undefined,
                url: c.link ?? undefined,
            })
        )

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
            await prisma.resumeDraft.update({
                where: { id: draftId },
                data: { content: JSON.parse(JSON.stringify(mappedContent)) },
            })
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
