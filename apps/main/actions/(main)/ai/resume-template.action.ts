"use server"

import { getSession } from '@repo/auth'
import { headers } from 'next/headers'
import {
    db,
    resumeTemplate,
    resumeTemplateGeneration,
    templatePurchase,
    users,
    creditTransactions,
    earnings,
} from '@repo/db'
import { eq, and, desc, sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

// ========================================
// HELPERS
// ========================================

async function getCurrentUser() {
    const session = await getSession(headers())
    if (!session?.user?.id) throw new Error("Not authenticated")
    const user = await db.query.users.findFirst({ where: eq(users.id, session.user.id) })
    if (!user) throw new Error("User not found")
    return user
}

async function deductCredits(userId: string, amount: number, description: string) {
    const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
        columns: { credits: true },
    })

    if (!user || (user.credits ?? 0) < amount) {
        throw new Error("Insufficient credits")
    }

    await db.transaction(async (tx) => {
        await tx.update(users)
            .set({ credits: sql`${users.credits} - ${amount}` })
            .where(eq(users.id, userId));
        await tx.insert(creditTransactions).values({
            userId,
            amount: -amount,
            type: "SPEND",
            currency: "NA",
            description,
        });
    })
}

// ========================================
// GET ALL RESUME TEMPLATES
// ========================================
export async function getResumeTemplates() {
    try {
        const templates = await db.query.resumeTemplate.findMany({
            orderBy: [resumeTemplate.createdAt],
            with: {
                generations: {
                    columns: { id: true },
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

        const generations = await db.query.resumeTemplateGeneration.findMany({
            where: eq(resumeTemplateGeneration.userId, user.id),
            with: {
                template: true,
            },
            orderBy: [desc(resumeTemplateGeneration.createdAt)],
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

        const generation = await db.query.resumeTemplateGeneration.findFirst({
            where: and(
                eq(resumeTemplateGeneration.userId, user.id),
                eq(resumeTemplateGeneration.templateId, templateId)
            ),
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
        const existing = await db.query.resumeTemplateGeneration.findFirst({
            where: and(
                eq(resumeTemplateGeneration.userId, user.id),
                eq(resumeTemplateGeneration.templateId, templateId)
            ),
        })
        if (existing) {
            return { success: true, alreadyOwned: true, data: existing }
        }

        // Get template to know the cost
        const template = await db.query.resumeTemplate.findFirst({
            where: eq(resumeTemplate.id, templateId),
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
        const [generation] = await db.insert(resumeTemplateGeneration).values({
            userId: user.id,
            templateId: template.id,
        }).returning()

        const generationWithTemplate = await db.query.resumeTemplateGeneration.findFirst({
            where: eq(resumeTemplateGeneration.id, generation!.id),
            with: { template: true },
        })

        revalidatePath("/ai/resume")

        return { success: true, alreadyOwned: false, data: generationWithTemplate }
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

        const [workExpCount, coverLetterCount, templateGenCount, totalTemplateCount] = await Promise.all([
            db.select({ count: sql<number>`count(*)` })
                .from(await import('@repo/db').then(m => m.workExperiences ?? m.experiences))
                .where(sql`"userId" = ${user.id}`).catch(() => [{ count: 0 }]),
            db.select({ count: sql<number>`count(*)` })
                .from(await import('@repo/db').then(m => m.coverLetter ?? m.coverLetters))
                .where(sql`"userId" = ${user.id}`).catch(() => [{ count: 0 }]),
            db.select({ count: sql<number>`count(*)` })
                .from(resumeTemplateGeneration)
                .where(eq(resumeTemplateGeneration.userId, user.id)),
            db.select({ count: sql<number>`count(*)` })
                .from(resumeTemplate),
        ])

        return {
            success: true,
            data: {
                resumeSections: Number((workExpCount[0] as any)?.count ?? 0),
                coverLetters: Number((coverLetterCount[0] as any)?.count ?? 0),
                templatesUsed: Number((templateGenCount[0] as any)?.count ?? 0),
                totalTemplates: Number((totalTemplateCount[0] as any)?.count ?? 0),
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
