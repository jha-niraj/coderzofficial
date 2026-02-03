// Company Actions - Server actions for company management
"use server"

import { prisma } from "@repo/prisma"
import { auth } from "@repo/auth"
import { revalidatePath } from "next/cache"

async function getUserCompany() {
    const session = await auth()
    if (!session?.user?.id) return null

    const member = await prisma.companyMember.findFirst({
        where: { userId: session.user.id },
        include: { company: true }
    })
    return member
}

export interface CompanyProfile {
    id: string
    name: string
    slug: string
    logo: string | null
    coverImage: string | null
    tagline: string | null
    description: string | null
    website: string | null
    industry: string | null
    size: string | null
    founded: number | null
    headquarters: string | null
    locations: string[]
    techStack: string[]
    benefits: string[]
    culture: any
    mediaGallery: any[]
    socialLinks: any
    isVerified: boolean
}

// Get company profile
export async function getCompanyProfile() {
    try {
        const member = await getUserCompany()
        if (!member) return { success: false, error: "Unauthorized" }

        const company = await prisma.company.findUnique({
            where: { id: member.companyId },
            include: {
                _count: {
                    select: {
                        jobs: true,
                        members: true
                    }
                }
            }
        })

        if (!company) return { success: false, error: "Company not found" }

        return {
            success: true,
            data: {
                ...company,
                jobsCount: company._count.jobs,
                membersCount: company._count.members
            }
        }
    } catch (error) {
        console.error("Error fetching company profile:", error)
        return { success: false, error: "Failed to fetch company profile" }
    }
}

// Update company profile
export async function updateCompanyProfile(data: {
    name?: string
    tagline?: string
    description?: string
    website?: string
    industry?: string
    size?: string
    founded?: number
    headquarters?: string
    locations?: string[]
    techStack?: string[]
    benefits?: string[]
    culture?: any
    socialLinks?: any
}) {
    try {
        const member = await getUserCompany()
        if (!member) return { success: false, error: "Unauthorized" }

        if (member.role !== "HEAD") {
            return { success: false, error: "Only company heads can update the profile" }
        }

        const updated = await prisma.company.update({
            where: { id: member.companyId },
            data: {
                name: data.name,
                tagline: data.tagline,
                description: data.description,
                website: data.website,
                industry: data.industry,
                size: data.size,
                founded: data.founded,
                headquarters: data.headquarters,
                locations: data.locations,
                techStack: data.techStack,
                benefits: data.benefits,
                culture: data.culture,
                socialLinks: data.socialLinks
            }
        })

        revalidatePath("/company")
        revalidatePath(`/companies/${updated.slug}`)
        return { success: true, data: updated }
    } catch (error) {
        console.error("Error updating company profile:", error)
        return { success: false, error: "Failed to update profile" }
    }
}

// Update company logo
export async function updateCompanyLogo(logoUrl: string) {
    try {
        const member = await getUserCompany()
        if (!member) return { success: false, error: "Unauthorized" }

        if (member.role !== "HEAD") {
            return { success: false, error: "Only company heads can update the logo" }
        }

        const updated = await prisma.company.update({
            where: { id: member.companyId },
            data: { logo: logoUrl }
        })

        revalidatePath("/company")
        return { success: true, data: updated }
    } catch (error) {
        console.error("Error updating logo:", error)
        return { success: false, error: "Failed to update logo" }
    }
}

// Update company cover image
export async function updateCompanyCover(coverUrl: string) {
    try {
        const member = await getUserCompany()
        if (!member) return { success: false, error: "Unauthorized" }

        if (member.role !== "HEAD") {
            return { success: false, error: "Only company heads can update the cover" }
        }

        const updated = await prisma.company.update({
            where: { id: member.companyId },
            data: { coverImage: coverUrl }
        })

        revalidatePath("/company")
        return { success: true, data: updated }
    } catch (error) {
        console.error("Error updating cover:", error)
        return { success: false, error: "Failed to update cover" }
    }
}

// Add media to gallery
export async function addMediaToGallery(media: { url: string; type: string; caption?: string }) {
    try {
        const member = await getUserCompany()
        if (!member) return { success: false, error: "Unauthorized" }

        const company = await prisma.company.findUnique({ where: { id: member.companyId } })
        if (!company) return { success: false, error: "Company not found" }

        const currentGallery = (company.mediaGallery as any[]) || []
        const newGallery = [...currentGallery, { ...media, id: Date.now().toString() }]

        const updated = await prisma.company.update({
            where: { id: member.companyId },
            data: { mediaGallery: newGallery }
        })

        revalidatePath("/company")
        return { success: true, data: updated }
    } catch (error) {
        console.error("Error adding media:", error)
        return { success: false, error: "Failed to add media" }
    }
}

// Remove media from gallery
export async function removeMediaFromGallery(mediaId: string) {
    try {
        const member = await getUserCompany()
        if (!member) return { success: false, error: "Unauthorized" }

        const company = await prisma.company.findUnique({ where: { id: member.companyId } })
        if (!company) return { success: false, error: "Company not found" }

        const currentGallery = (company.mediaGallery as any[]) || []
        const newGallery = currentGallery.filter((m: any) => m.id !== mediaId)

        const updated = await prisma.company.update({
            where: { id: member.companyId },
            data: { mediaGallery: newGallery }
        })

        revalidatePath("/company")
        return { success: true, data: updated }
    } catch (error) {
        console.error("Error removing media:", error)
        return { success: false, error: "Failed to remove media" }
    }
}

// Get company public stats
export async function getCompanyPublicStats() {
    try {
        const member = await getUserCompany()
        if (!member) return { success: false, error: "Unauthorized" }

        const [activeJobs, totalHires, avgTimeToHire] = await Promise.all([
            prisma.job.count({ where: { companyId: member.companyId, status: "ACTIVE" } }),
            prisma.jobApplication.count({ where: { job: { companyId: member.companyId }, status: "HIRED" } }),
            prisma.company.findUnique({ where: { id: member.companyId }, select: { avgTimeToHireDays: true } })
        ])

        return {
            success: true,
            data: {
                activeJobs,
                totalHires,
                avgTimeToHireDays: avgTimeToHire?.avgTimeToHireDays || 0
            }
        }
    } catch (error) {
        console.error("Error fetching stats:", error)
        return { success: false, error: "Failed to fetch stats" }
    }
}
