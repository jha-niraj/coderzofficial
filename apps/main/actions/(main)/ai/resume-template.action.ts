"use server"

import { auth } from "@repo/auth"
import prisma from "@repo/prisma"
import { revalidatePath } from "next/cache"

// ========================================
// HELPERS
// ========================================

async function getCurrentUser() {
    const session = await auth()
    if (!session?.user?.email) throw new Error("Not authenticated")
    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user) throw new Error("User not found")
    return user
}

async function deductCredits(userId: string, amount: number, description: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { credits: true },
    })

    if (!user || user.credits < amount) {
        throw new Error("Insufficient credits")
    }

    await prisma.$transaction([
        prisma.user.update({
            where: { id: userId },
            data: { credits: { decrement: amount } },
        }),
        prisma.creditTransaction.create({
            data: {
                userId,
                amount: -amount,
                type: "SPEND",
                currency: "NA",
                description,
            },
        }),
    ])
}

// ========================================
// GET ALL RESUME TEMPLATES
// ========================================
export async function getResumeTemplates() {
    try {
        const templates = await prisma.resumeTemplate.findMany({
            orderBy: { createdAt: "asc" },
            include: {
                _count: {
                    select: { generations: true },
                },
            },
        })

        return { success: true, data: templates }
    } catch (error) {
        console.error("Error fetching resume templates:", error)
        return { success: false, error: "Failed to fetch templates" }
    }
}

// ========================================
// GET USER'S TEMPLATE GENERATIONS
// ========================================
export async function getUserTemplateGenerations() {
    try {
        const user = await getCurrentUser()

        const generations = await prisma.resumeTemplateGeneration.findMany({
            where: { userId: user.id },
            include: {
                template: true,
            },
            orderBy: { createdAt: "desc" },
        })

        return { success: true, data: generations }
    } catch (error) {
        console.error("Error fetching user template generations:", error)
        return { success: false, error: "Failed to fetch generations" }
    }
}

// ========================================
// CHECK IF USER HAS PURCHASED A TEMPLATE
// ========================================
export async function hasUserPurchasedTemplate(templateId: string) {
    try {
        const user = await getCurrentUser()

        const generation = await prisma.resumeTemplateGeneration.findFirst({
            where: { userId: user.id, templateId },
        })

        return { success: true, purchased: !!generation }
    } catch (error) {
        console.error("Error checking template purchase:", error)
        return { success: false, purchased: false }
    }
}

// ========================================
// PURCHASE / UNLOCK A TEMPLATE
// ========================================
export async function purchaseResumeTemplate(templateId: string) {
    try {
        const user = await getCurrentUser()

        // Check if already purchased
        const existing = await prisma.resumeTemplateGeneration.findFirst({
            where: { userId: user.id, templateId },
        })
        if (existing) {
            return { success: true, alreadyOwned: true, data: existing }
        }

        // Get template to know the cost
        const template = await prisma.resumeTemplate.findUnique({
            where: { id: templateId },
        })
        if (!template) {
            return { success: false, error: "Template not found" }
        }

        // Deduct credits
        await deductCredits(
            user.id,
            template.creditsCost,
            `Resume Template: ${template.name}`
        )

        // Create generation record
        const generation = await prisma.resumeTemplateGeneration.create({
            data: {
                userId: user.id,
                templateId: template.id,
            },
            include: { template: true },
        })

        // Log recent activity
        await prisma.recentActivity.create({
            data: {
                userId: user.id,
                activityType: "AI_TOOL_USED",
                description: `Unlocked resume template: ${template.name}`,
            },
        })

        revalidatePath("/ai/resume")

        return { success: true, alreadyOwned: false, data: generation }
    } catch (error: any) {
        console.error("Error purchasing template:", error)
        if (error.message === "Insufficient credits") {
            return { success: false, error: "Insufficient credits. You need 10 credits to unlock this template." }
        }
        return { success: false, error: "Failed to purchase template" }
    }
}

// ========================================
// GET RESUME HUB STATS (REAL DATA)
// ========================================
export async function getResumeHubStats() {
    try {
        const user = await getCurrentUser()

        const [
            resumeCount,
            coverLetterCount,
            templateGenerationCount,
            totalTemplates,
        ] = await Promise.all([
            // Count resumes created — users who have experiences/projects filled via resume creator
            prisma.workExperience.count({
                where: { userId: user.id },
            }),
            prisma.coverLetter.count({
                where: { userId: user.id },
            }),
            prisma.resumeTemplateGeneration.count({
                where: { userId: user.id },
            }),
            prisma.resumeTemplate.count(),
        ])

        return {
            success: true,
            data: {
                resumeSections: resumeCount,
                coverLetters: coverLetterCount,
                templatesUsed: templateGenerationCount,
                totalTemplates,
            },
        }
    } catch (error) {
        console.error("Error fetching resume stats:", error)
        return {
            success: false,
            data: {
                resumeSections: 0,
                coverLetters: 0,
                templatesUsed: 0,
                totalTemplates: 0,
            },
        }
    }
}
