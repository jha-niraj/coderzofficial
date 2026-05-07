'use server'

import { getSession } from '@repo/auth'
import { headers } from 'next/headers'
import {
    db,
    resumeTemplate,
    templatePurchase,
    users,
    creditTransactions,
    earnings,
} from '@repo/db'
import { eq, and, desc, sql, or, ilike } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

// ─────────────────────────────────────────────────────────────────────────────
// GET marketplace templates (public listing)
// ─────────────────────────────────────────────────────────────────────────────
export async function getForgeTemplates(opts?: {
    search?: string
    tag?: string
    sort?: 'popular' | 'newest' | 'price_asc' | 'price_desc'
}) {
    const session = await getSession(headers())
    const userId = session?.user?.id

    // Build conditions
    let whereCondition: any = or(
        eq(resumeTemplate.isMarketplace, true),
        eq(resumeTemplate.isPlatform, true)
    )

    if (opts?.search) {
        whereCondition = and(
            or(eq(resumeTemplate.isMarketplace, true), eq(resumeTemplate.isPlatform, true)),
            or(
                ilike(resumeTemplate.name, `%${opts.search}%`),
                ilike(resumeTemplate.description, `%${opts.search}%`)
            )
        )
    }

    const orderBy =
        opts?.sort === 'newest' ? [desc(resumeTemplate.createdAt)]
        : opts?.sort === 'price_asc' ? [resumeTemplate.marketplacePrice]
        : opts?.sort === 'price_desc' ? [desc(resumeTemplate.marketplacePrice)]
        : [desc(resumeTemplate.totalSales)]

    const templates = await db.query.resumeTemplate.findMany({
        where: whereCondition,
        orderBy: [desc(resumeTemplate.isPlatform), desc(resumeTemplate.isFeatured), ...orderBy],
        with: {
            createdBy: { columns: { name: true, username: true, image: true } },
            purchases: { columns: { id: true } },
        },
    })

    // Mark which ones the current user owns
    let ownedIds = new Set<string>()
    if (userId) {
        const purchases = await db.query.templatePurchase.findMany({
            where: eq(templatePurchase.buyerId, userId),
            columns: { templateId: true },
        })
        ownedIds = new Set(purchases.map(p => p.templateId))
    }

    return {
        success: true,
        templates: templates.map(t => ({
            ...t,
            owned: t.isPlatform || ownedIds.has(t.id),
        })),
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// BUY a template from the marketplace
// ─────────────────────────────────────────────────────────────────────────────
export async function purchaseTemplate(templateId: string) {
    const session = await getSession(headers())
    if (!session?.user?.id) return { success: false, error: 'Unauthorized' }
    const userId = session.user.id

    const template = await db.query.resumeTemplate.findFirst({ where: eq(resumeTemplate.id, templateId) })
    if (!template) return { success: false, error: 'Template not found' }
    if (template.isPlatform) return { success: false, error: 'Platform templates are free' }

    const price = template.marketplacePrice
    if (price <= 0) return { success: false, error: 'This template is free' }

    // Check if already owned
    const existing = await db.query.templatePurchase.findFirst({
        where: and(
            eq(templatePurchase.buyerId, userId),
            eq(templatePurchase.templateId, templateId)
        ),
    })
    if (existing) return { success: false, error: 'You already own this template' }

    // Check credits
    const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
        columns: { credits: true },
    })
    if (!user || (user.credits ?? 0) < price) {
        return { success: false, error: `Insufficient credits. Need ${price}, have ${user?.credits ?? 0}` }
    }

    const platformFee = Math.ceil(price * 0.1)
    const creatorEarning = price - platformFee

    await db.transaction(async tx => {
        // Deduct from buyer
        await tx.update(users)
            .set({ credits: sql`${users.credits} - ${price}` })
            .where(eq(users.id, userId))

        // Credit creator (if user-created)
        if (template.createdById) {
            await tx.update(users)
                .set({ credits: sql`${users.credits} + ${creatorEarning}` })
                .where(eq(users.id, template.createdById))

            // Record earning
            await tx.insert(earnings).values({
                userId: template.createdById,
                module: 'RESUME_TEMPLATE',
                referenceId: template.id,
                amount: creatorEarning,
                sourceUserId: userId,
            })
        }

        // Record purchase
        await tx.insert(templatePurchase).values({
            buyerId: userId,
            templateId,
            pricePaid: price,
            creatorEarning,
            platformFee,
        })

        // Update template stats
        await tx.update(resumeTemplate)
            .set({
                totalSales: sql`${resumeTemplate.totalSales} + 1`,
                totalRevenue: sql`${resumeTemplate.totalRevenue} + ${price}`,
            })
            .where(eq(resumeTemplate.id, templateId))

        // Record credit transactions
        await tx.insert(creditTransactions).values({
            userId,
            currency: 'INR',
            amount: -price,
            type: 'SPEND',
            description: `Purchased resume template: ${template.name}`,
        })
    })

    revalidatePath('/blueprint/resume')
    revalidatePath('/ai/resume')
    return { success: true }
}

// ─────────────────────────────────────────────────────────────────────────────
// LIST a user template on the marketplace
// ─────────────────────────────────────────────────────────────────────────────
export async function listTemplateOnMarketplace(templateId: string, price: number) {
    const session = await getSession(headers())
    if (!session?.user?.id) return { success: false, error: 'Unauthorized' }
    if (price < 5) return { success: false, error: 'Minimum price is 5 credits' }

    await db.update(resumeTemplate)
        .set({ isMarketplace: true, marketplacePrice: price })
        .where(and(
            eq(resumeTemplate.id, templateId),
            eq(resumeTemplate.createdById, session.user.id)
        ))
    revalidatePath('/blueprint/resume')
    return { success: true }
}

// ─────────────────────────────────────────────────────────────────────────────
// DELIST from marketplace
// ─────────────────────────────────────────────────────────────────────────────
export async function delistTemplate(templateId: string) {
    const session = await getSession(headers())
    if (!session?.user?.id) return { success: false, error: 'Unauthorized' }

    await db.update(resumeTemplate)
        .set({ isMarketplace: false })
        .where(and(
            eq(resumeTemplate.id, templateId),
            eq(resumeTemplate.createdById, session.user.id)
        ))
    revalidatePath('/blueprint/resume')
    return { success: true }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET user's created templates + earnings
// ─────────────────────────────────────────────────────────────────────────────
export async function getMyTemplateStats() {
    const session = await getSession(headers())
    if (!session?.user?.id) return { success: false, error: 'Unauthorized' }

    const templates = await db.query.resumeTemplate.findMany({
        where: eq(resumeTemplate.createdById, session.user.id),
        with: { purchases: { columns: { id: true } } },
    })

    const earningsData = await db.query.earnings.findMany({
        where: and(
            eq(earnings.userId, session.user.id),
            eq(earnings.module, 'RESUME_TEMPLATE')
        ),
        orderBy: [desc(earnings.createdAt)],
        limit: 20,
    })

    const totalEarned = earningsData.reduce((sum, e) => sum + e.amount, 0)

    return { success: true, templates, earnings: earningsData, totalEarned }
}
