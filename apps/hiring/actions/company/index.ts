// Company Actions - Server actions for company management
"use server"

import { prisma } from "@repo/prisma"
import { auth } from "@repo/auth"
import { revalidatePath } from "next/cache"
import type { 
    CompanySocialLinks, MediaItem, AddMediaInput 
} from "@/types"

async function getUserCompany() {
    const session = await auth()
    if (!session?.user?.id) return null

    const member = await prisma.companyMember.findFirst({
        where: { userId: session.user.id },
        include: { company: true }
    })
    return member
}

// Note: CompanyProfile is imported from @/types

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
    description?: string
    website?: string
    industry?: string
    companySize?: string
    foundedYear?: number
    headquarters?: string
    techStack?: string[]
    benefits?: string[]
    culture?: string
    socialLinks?: CompanySocialLinks
}) {
    try {
        const member = await getUserCompany()
        if (!member) return { success: false, error: "Unauthorized" }

        if (member.role !== "FOUNDER") {
            return { success: false, error: "Only company heads can update the profile" }
        }

        const updated = await prisma.company.update({
            where: { id: member.companyId },
            data: {
                name: data.name,
                description: data.description,
                website: data.website,
                industry: data.industry,
                companySize: data.companySize,
                foundedYear: data.foundedYear,
                headquarters: data.headquarters,
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

        if (member.role !== "FOUNDER") {
            return { success: false, error: "Only company heads can update the logo" }
        }

        const updated = await prisma.company.update({
            where: { 
                id: member.companyId 
            },
            data: { 
                logoUrl: logoUrl 
            }
        })

        revalidatePath("/company")
        return { success: true, data: updated }
    } catch (error) {
        console.error("Error updating logo:", error)
        return { success: false, error: "Failed to update logo" }
    }
}

// Update company cover image - stores in mediaGallery with type "cover"
export async function updateCompanyCover(coverUrl: string) {
    try {
        const member = await getUserCompany()
        if (!member) return { success: false, error: "Unauthorized" }

        if (member.role !== "FOUNDER") {
            return { success: false, error: "Only company heads can update the cover" }
        }

        // Get existing media gallery and update/add cover image
        const company = await prisma.company.findUnique({ where: { id: member.companyId } })
        if (!company) return { success: false, error: "Company not found" }

        const existingGallery = (company.mediaGallery as MediaItem[] | null) ?? []
        
        // Filter out existing cover and add new one
        const updatedGallery = existingGallery.filter((item: MediaItem) => item.type !== "cover")
        updatedGallery.unshift({ url: coverUrl, type: "cover", caption: "Company cover image" })

        const updated = await prisma.company.update({
            where: { id: member.companyId },
            data: { mediaGallery: updatedGallery }
        })

        revalidatePath("/company")
        return { success: true, data: updated }
    } catch (error) {
        console.error("Error updating cover:", error)
        return { success: false, error: "Failed to update cover" }
    }
}

// Add media to gallery
export async function addMediaToGallery(media: AddMediaInput) {
    try {
        const member = await getUserCompany()
        if (!member) return { success: false, error: "Unauthorized" }

        const company = await prisma.company.findUnique({ where: { id: member.companyId } })
        if (!company) return { success: false, error: "Company not found" }

        const currentGallery = (company.mediaGallery as MediaItem[]) || []
        const newItem: MediaItem = { ...media, id: Date.now().toString() }
        const newGallery = [...currentGallery, newItem]

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

        const currentGallery = (company.mediaGallery as MediaItem[]) || []
        const newGallery = currentGallery.filter((m) => m.id !== mediaId)

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
