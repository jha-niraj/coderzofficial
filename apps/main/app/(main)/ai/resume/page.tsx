import { 
    getResumeHubStats, getResumeTemplates, getUserTemplateGenerations 
} from "@/actions/(main)/ai/resume-template.action"
import { ResumeHubClient } from "./_components/resume-hub-client"

// Demo templates — used as fallback when no DB templates exist yet
const demoTemplates = [
    {
        slug: "modern-minimal",
        name: "Modern Minimal",
        description: "A clean, minimal resume template focused on readability and ATS compatibility. Perfect for tech and startup roles.",
        previewImageUrl: "/images/templates/modern-minimal.png",
        creditsCost: 10,
        sectionOrder: ["header", "summary", "experience", "skills", "education", "projects"],
    },
    {
        slug: "developer-pro",
        name: "Developer Pro",
        description: "Designed for software engineers — highlights projects, tech stack, and contributions front and center.",
        previewImageUrl: "/images/templates/developer-pro.png",
        creditsCost: 10,
        sectionOrder: ["header", "skills", "experience", "projects", "education", "certifications"],
    },
    {
        slug: "executive-classic",
        name: "Executive Classic",
        description: "A polished, professional template for leadership and senior roles. Emphasizes impact and results.",
        previewImageUrl: "/images/templates/executive-classic.png",
        creditsCost: 10,
        sectionOrder: ["header", "summary", "experience", "education", "skills", "certifications"],
    },
]

export default async function ResumeHubPage() {
    const [statsResult, templatesResult, userGenerationsResult] = await Promise.all([
        getResumeHubStats(),
        getResumeTemplates(),
        getUserTemplateGenerations(),
    ])

    const stats = statsResult.data ?? {
        resumeSections: 0,
        coverLetters: 0,
        templatesUsed: 0,
        totalTemplates: 0,
    }

    const dbTemplates = templatesResult.success ? templatesResult.data ?? [] : []
    const userGenerations = userGenerationsResult.success ? userGenerationsResult.data ?? [] : []

    // Use DB templates if available, otherwise show demo templates
    const templates = dbTemplates.length > 0
        ? dbTemplates.map((t: any) => ({
            id: t.id,
            slug: t.slug,
            name: t.name,
            description: t.description,
            previewImageUrl: t.previewImageUrl,
            creditsCost: t.creditsCost,
            sectionOrder: t.sectionOrder,
            usageCount: t._count?.generations ?? 0,
            isPurchased: userGenerations.some((g: any) => g.templateId === t.id),
        }))
        : demoTemplates.map((t, i) => ({
            id: `demo-${i}`,
            slug: t.slug,
            name: t.name,
            description: t.description,
            previewImageUrl: t.previewImageUrl,
            creditsCost: t.creditsCost,
            sectionOrder: t.sectionOrder,
            usageCount: 0,
            isPurchased: false,
            isDemo: true,
        }))

    return (
        <ResumeHubClient
            stats={stats}
            templates={templates}
        />
    )
}
