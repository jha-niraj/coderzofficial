'use server'

import { auth } from '@repo/auth'
import { prisma } from '@repo/prisma'
import { revalidatePath } from 'next/cache'
import { ResumeDraftContent, emptyResumeDraftContent, PLATFORM_TEMPLATES } from '@/types/resume-draft'
import { openai } from '@/lib/openai-client'

// ─────────────────────────────────────────────────────────────────────────────
// Seed platform templates (call once or on demand)
// ─────────────────────────────────────────────────────────────────────────────
export async function ensurePlatformTemplates() {
    for (const tpl of PLATFORM_TEMPLATES) {
        await prisma.resumeTemplate.upsert({
            where: { slug: tpl.slug },
            update: {
                name: tpl.name,
                description: tpl.description,
                tags: tpl.tags,
                sectionOrder: tpl.sectionOrder,
                config: tpl.config as any,
                isPlatform: true,
                isDefault: tpl.slug === 'clean-minimal',
                creditsCost: 0,
                isMarketplace: false,
                previewImageUrl: '',
            },
            create: {
                slug: tpl.slug,
                name: tpl.name,
                description: tpl.description,
                tags: tpl.tags,
                sectionOrder: tpl.sectionOrder,
                config: tpl.config as any,
                isPlatform: true,
                isDefault: tpl.slug === 'clean-minimal',
                creditsCost: 0,
                isMarketplace: false,
                previewImageUrl: '',
            },
        })
    }
    return { success: true }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET all templates (platform + marketplace + user's own)
// ─────────────────────────────────────────────────────────────────────────────
export async function getResumeTemplates() {
    await ensurePlatformTemplates()
    const templates = await prisma.resumeTemplate.findMany({
        orderBy: [{ isPlatform: 'desc' }, { totalSales: 'desc' }, { createdAt: 'asc' }],
        include: { createdBy: { select: { name: true, username: true, image: true } } },
    })
    return { success: true, templates }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET all resume drafts for current user
// ─────────────────────────────────────────────────────────────────────────────
export async function getResumeDrafts() {
    const session = await auth()
    if (!session?.user?.id) return { success: false, error: 'Unauthorized' }

    const drafts = await prisma.resumeDraft.findMany({
        where: { userId: session.user.id },
        orderBy: { updatedAt: 'desc' },
    })
    return { success: true, drafts }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET single draft
// ─────────────────────────────────────────────────────────────────────────────
export async function getResumeDraft(id: string) {
    const session = await auth()
    if (!session?.user?.id) return { success: false, error: 'Unauthorized' }

    const draft = await prisma.resumeDraft.findFirst({
        where: { id, userId: session.user.id },
    })
    if (!draft) return { success: false, error: 'Not found' }
    return { success: true, draft }
}

// GET by share slug (public)
export async function getResumeDraftBySlug(slug: string) {
    const draft = await prisma.resumeDraft.findUnique({
        where: { shareSlug: slug, isPublic: true },
        include: { user: { select: { name: true, username: true, image: true } } },
    })
    if (!draft) return { success: false, error: 'Not found or private' }
    // Increment view count
    await prisma.resumeDraft.update({ where: { id: draft.id }, data: { viewCount: { increment: 1 } } })
    return { success: true, draft }
}

// ─────────────────────────────────────────────────────────────────────────────
// CREATE a new draft
// ─────────────────────────────────────────────────────────────────────────────
export async function createResumeDraft(input: {
    name: string
    templateSlug?: string
    content?: ResumeDraftContent
    importedFrom?: string
    importedUrl?: string
}) {
    const session = await auth()
    if (!session?.user?.id) return { success: false, error: 'Unauthorized' }

    const draft = await prisma.resumeDraft.create({
        data: {
            userId: session.user.id,
            name: input.name,
            templateSlug: input.templateSlug ?? 'clean-minimal',
            content: (input.content ?? emptyResumeDraftContent()) as any,
            importedFrom: input.importedFrom,
            importedUrl: input.importedUrl,
        },
    })
    revalidatePath('/ai/resume')
    return { success: true, draft }
}

// ─────────────────────────────────────────────────────────────────────────────
// CREATE draft from current user profile
// ─────────────────────────────────────────────────────────────────────────────
export async function createDraftFromProfile(name: string, templateSlug = 'clean-minimal') {
    const session = await auth()
    if (!session?.user?.id) return { success: false, error: 'Unauthorized' }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: {
            experiences: { orderBy: { startDate: 'desc' } },
            portfolioProjects: { orderBy: { startDate: 'desc' }, include: { projectLinks: true } },
            educations: { orderBy: { startDate: 'desc' } },
            skills: true,
            socialLinks: true,
        },
    })
    if (!user) return { success: false, error: 'User not found' }

    const content: ResumeDraftContent = {
        header: {
            name: user.name ?? '',
            email: user.email ?? '',
            title: user.occupation ?? '',
            location: user.location ?? '',
            summary: user.bio ?? '',
            github: user.socialLinks.find(s => s.platform === 'GITHUB')?.url,
            linkedin: user.socialLinks.find(s => s.platform === 'LINKEDIN')?.url,
            portfolio: user.socialLinks.find(s => s.platform === 'PORTFOLIO')?.url,
            website: user.socialLinks.find(s => s.platform === 'WEBSITE')?.url,
        },
        experience: user.experiences.map(e => ({
            id: e.id,
            company: e.companyName,
            role: e.roleTitle,
            startDate: e.startDate.toISOString(),
            endDate: e.endDate?.toISOString(),
            current: e.isCurrentlyWorking,
            bullets: e.bulletPoints ?? [],
        })),
        projects: user.portfolioProjects.map(p => ({
            id: p.id,
            name: p.projectName,
            description: p.description ?? '',
            technologies: p.technologies ?? [],
            github: p.projectLinks.find(l => l.linkType === 'GITHUB')?.url,
            liveUrl: p.projectLinks.find(l => l.linkType === 'LIVE_SITE' || l.linkType === 'DEMO')?.url,
            bullets: p.bulletPoints ?? [],
        })),
        education: user.educations.map(e => ({
            id: e.id,
            institution: e.institution,
            degree: e.degree ?? '',
            startDate: e.startDate?.toISOString() ?? '',
            endDate: e.endDate?.toISOString(),
            bullets: e.bulletPoints ?? [],
        })),
        skills: buildSkillGroups(user.skills),
        certifications: [],
    }

    // Collect missing fields so the caller can show toasts
    const missingFields: string[] = []
    if (!user.experiences.length) missingFields.push('Work Experience')
    if (!user.portfolioProjects.length) missingFields.push('Projects')
    if (!user.skills.length) missingFields.push('Skills')
    if (!user.educations.length) missingFields.push('Education')
    if (!user.name) missingFields.push('Full Name')
    if (!user.occupation) missingFields.push('Job Title')

    const result = await createResumeDraft({ name, templateSlug, content, importedFrom: 'profile' })
    if (!result.success) return result
    return { ...result, missingFields }
}

function buildSkillGroups(skills: { name: string; category: string }[]) {
    const map = new Map<string, string[]>()
    for (const s of skills) {
        if (!map.has(s.category)) map.set(s.category, [])
        map.get(s.category)!.push(s.name)
    }
    return Array.from(map.entries()).map(([category, items]) => ({ category, items }))
}

// ─────────────────────────────────────────────────────────────────────────────
// UPDATE a draft
// ─────────────────────────────────────────────────────────────────────────────
export async function updateResumeDraft(id: string, data: {
    name?: string
    templateSlug?: string
    content?: ResumeDraftContent
    isPublic?: boolean
    tailoredFor?: string
    jdSnapshot?: string
    atsScore?: number
}) {
    const session = await auth()
    if (!session?.user?.id) return { success: false, error: 'Unauthorized' }

    const draft = await prisma.resumeDraft.updateMany({
        where: { id, userId: session.user.id },
        data: {
            ...(data.name !== undefined && { name: data.name }),
            ...(data.templateSlug !== undefined && { templateSlug: data.templateSlug }),
            ...(data.content !== undefined && { content: data.content as any }),
            ...(data.isPublic !== undefined && { isPublic: data.isPublic }),
            ...(data.tailoredFor !== undefined && { tailoredFor: data.tailoredFor }),
            ...(data.jdSnapshot !== undefined && { jdSnapshot: data.jdSnapshot }),
            ...(data.atsScore !== undefined && { atsScore: data.atsScore }),
        },
    })
    revalidatePath('/ai/resume')
    return { success: true, updated: draft.count > 0 }
}

// ─────────────────────────────────────────────────────────────────────────────
// DELETE a draft
// ─────────────────────────────────────────────────────────────────────────────
export async function deleteResumeDraft(id: string) {
    const session = await auth()
    if (!session?.user?.id) return { success: false, error: 'Unauthorized' }

    await prisma.resumeDraft.deleteMany({ where: { id, userId: session.user.id } })
    revalidatePath('/ai/resume')
    return { success: true }
}

// ─────────────────────────────────────────────────────────────────────────────
// DUPLICATE a draft
// ─────────────────────────────────────────────────────────────────────────────
export async function duplicateResumeDraft(id: string) {
    const session = await auth()
    if (!session?.user?.id) return { success: false, error: 'Unauthorized' }

    const original = await prisma.resumeDraft.findFirst({ where: { id, userId: session.user.id } })
    if (!original) return { success: false, error: 'Not found' }

    const copy = await prisma.resumeDraft.create({
        data: {
            userId: session.user.id,
            name: `${original.name} (Copy)`,
            templateSlug: original.templateSlug,
            content: original.content ?? {},
            tailoredFor: original.tailoredFor,
        },
    })
    revalidatePath('/ai/resume')
    return { success: true, draft: copy }
}

// ─────────────────────────────────────────────────────────────────────────────
// AI: Score resume against a job description
// ─────────────────────────────────────────────────────────────────────────────
export async function scoreResumeAgainstJD(draftId: string, jobDescription: string) {
    const session = await auth()
    if (!session?.user?.id) return { success: false, error: 'Unauthorized' }

    const draft = await prisma.resumeDraft.findFirst({ where: { id: draftId, userId: session.user.id } })
    if (!draft) return { success: false, error: 'Draft not found' }

    const content = draft.content as unknown as ResumeDraftContent
    const resumeText = JSON.stringify(content)

    const res = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
            {
                role: 'system',
                content: 'You are an ATS expert. Score a resume against a job description 0-100. Return JSON only.',
            },
            {
                role: 'user',
                content: `Job Description:\n${jobDescription}\n\nResume:\n${resumeText}\n\nReturn: {"score": number, "missing_keywords": string[], "matched_keywords": string[], "suggestions": string[]}`,
            },
        ],
        response_format: { type: 'json_object' },
    })

    const result = JSON.parse(res.choices[0]?.message?.content ?? '{}')
    await prisma.resumeDraft.update({ where: { id: draftId }, data: { atsScore: result.score, jdSnapshot: jobDescription } })
    revalidatePath('/ai/resume')
    return { success: true, ...result }
}

// ─────────────────────────────────────────────────────────────────────────────
// AI: Tailor resume bullets for a specific JD
// ─────────────────────────────────────────────────────────────────────────────
export async function tailorResumeForJD(draftId: string, jobDescription: string, jobTitle: string) {
    const session = await auth()
    if (!session?.user?.id) return { success: false, error: 'Unauthorized' }

    const draft = await prisma.resumeDraft.findFirst({ where: { id: draftId, userId: session.user.id } })
    if (!draft) return { success: false, error: 'Draft not found' }

    const content = draft.content as unknown as ResumeDraftContent

    const res = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
            {
                role: 'system',
                content: `You are an expert resume coach. Given a resume and a job description, do two things:
1. Rewrite the experience bullet points to better match the JD language and keywords. Keep all facts accurate — only rephrase and reframe.
2. Identify what important skills or experiences mentioned in the JD are MISSING from this resume and list them as suggestions.

Return JSON in this exact format:
{
  "updatedContent": { ...full updated resume content matching the original structure... },
  "suggestions": ["Missing: Kubernetes experience", "Add: mention of CI/CD pipelines", ...],
  "keywordsAdded": ["React", "TypeScript", ...],
  "summary": "Tailored 3 bullet points and updated skills order to match the JD."
}`,
            },
            {
                role: 'user',
                content: `Job Title: ${jobTitle}\n\nJob Description:\n${jobDescription}\n\nCurrent Resume:\n${JSON.stringify(content, null, 2)}`,
            },
        ],
        response_format: { type: 'json_object' },
    })

    const result = JSON.parse(res.choices[0]?.message?.content ?? '{}')
    const updated = result.updatedContent as ResumeDraftContent

    // Update THIS draft in place — do not create a new one
    await prisma.resumeDraft.update({
        where: { id: draftId },
        data: {
            content: updated as any,
            tailoredFor: jobTitle,
            jdSnapshot: jobDescription,
        },
    })
    revalidatePath('/ai/resume')
    return {
        success: true,
        updatedContent: updated,
        suggestions: (result.suggestions ?? []) as string[],
        keywordsAdded: (result.keywordsAdded ?? []) as string[],
        summary: (result.summary ?? '') as string,
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// User template upload (save config to DB)
// ─────────────────────────────────────────────────────────────────────────────
export async function uploadUserTemplate(input: {
    name: string
    description: string
    config: Record<string, unknown>
    sectionOrder: string[]
    tags: string[]
    marketplacePrice?: number
}) {
    const session = await auth()
    if (!session?.user?.id) return { success: false, error: 'Unauthorized' }

    const slug = `user-${session.user.id.slice(0, 8)}-${Date.now()}`
    const template = await prisma.resumeTemplate.create({
        data: {
            slug,
            name: input.name,
            description: input.description,
            previewImageUrl: '',
            sectionOrder: input.sectionOrder,
            config: input.config as any,
            tags: input.tags,
            isPlatform: false,
            isMarketplace: (input.marketplacePrice ?? 0) > 0,
            marketplacePrice: input.marketplacePrice ?? 0,
            creditsCost: 0,
            createdById: session.user.id,
        },
    })
    revalidatePath('/ai/resume')
    revalidatePath('/blueprint/resume')
    return { success: true, template }
}
