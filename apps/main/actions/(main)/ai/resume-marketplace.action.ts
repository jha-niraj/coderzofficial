'use server'

import { auth } from '@repo/auth'
import { prisma } from '@repo/prisma'
import { revalidatePath } from 'next/cache'

// ─────────────────────────────────────────────────────────────────────────────
// GET marketplace templates (public listing)
// ─────────────────────────────────────────────────────────────────────────────
export async function getForgeTemplates(opts?: {
    search?: string
    tag?: string
    sort?: 'popular' | 'newest' | 'price_asc' | 'price_desc'
}) {
    const session = await auth()
    const userId = session?.user?.id

    const where: Record<string, unknown> = {
        OR: [{ isMarketplace: true }, { isPlatform: true }],
    }
    if (opts?.search) {
        where.OR = undefined
        Object.assign(where, {
            AND: [
                { OR: [{ isMarketplace: true }, { isPlatform: true }] },
                { OR: [
                    { name: { contains: opts.search, mode: 'insensitive' } },
                    { description: { contains: opts.search, mode: 'insensitive' } },
                ]},
            ],
        })
    }
    if (opts?.tag) {
        (where as any).tags = { has: opts.tag }
    }

    const orderBy = opts?.sort === 'newest' ? { createdAt: 'desc' as const }
        : opts?.sort === 'price_asc' ? { marketplacePrice: 'asc' as const }
        : opts?.sort === 'price_desc' ? { marketplacePrice: 'desc' as const }
        : { totalSales: 'desc' as const }

    const templates = await prisma.resumeTemplate.findMany({
        where: where as any,
        orderBy: [{ isPlatform: 'desc' }, { isFeatured: 'desc' }, orderBy],
        include: {
            createdBy: { select: { name: true, username: true, image: true } },
            _count: { select: { purchases: true } },
        },
    })

    // Mark which ones the current user owns
    let ownedIds = new Set<string>()
    if (userId) {
        const purchases = await prisma.templatePurchase.findMany({
            where: { buyerId: userId },
            select: { templateId: true },
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
    const session = await auth()
    if (!session?.user?.id) return { success: false, error: 'Unauthorized' }
    const userId = session.user.id

    const template = await prisma.resumeTemplate.findUnique({ where: { id: templateId } })
    if (!template) return { success: false, error: 'Template not found' }
    if (template.isPlatform) return { success: false, error: 'Platform templates are free' }

    const price = template.marketplacePrice
    if (price <= 0) return { success: false, error: 'This template is free' }

    // Check if already owned
    const existing = await prisma.templatePurchase.findUnique({
        where: { buyerId_templateId: { buyerId: userId, templateId } },
    })
    if (existing) return { success: false, error: 'You already own this template' }

    // Check credits
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { credits: true } })
    if (!user || user.credits < price) {
        return { success: false, error: `Insufficient credits. Need ${price}, have ${user?.credits ?? 0}` }
    }

    const platformFee = Math.ceil(price * 0.1)
    const creatorEarning = price - platformFee

    await prisma.$transaction(async tx => {
        // Deduct from buyer
        await tx.user.update({ where: { id: userId }, data: { credits: { decrement: price } } })

        // Credit creator (if user-created)
        if (template.createdById) {
            await tx.user.update({
                where: { id: template.createdById },
                data: { credits: { increment: creatorEarning } },
            })
            // Record earning
            await tx.earning.create({
                data: {
                    userId: template.createdById,
                    module: 'RESUME_TEMPLATE',
                    referenceId: template.id,
                    amount: creatorEarning,
                    sourceUserId: userId,
                },
            })
        }

        // Record purchase
        await tx.templatePurchase.create({
            data: { buyerId: userId, templateId, pricePaid: price, creatorEarning, platformFee },
        })

        // Update template stats
        await tx.resumeTemplate.update({
            where: { id: templateId },
            data: { totalSales: { increment: 1 }, totalRevenue: { increment: price } },
        })

        // Record credit transactions
        await tx.creditTransaction.create({
            data: {
                userId,
                currency: 'INR',
                amount: -price,
                type: 'SPEND',
                description: `Purchased resume template: ${template.name}`,
            },
        })
    })

    revalidatePath('/forge/resume')
    revalidatePath('/ai/resume')
    return { success: true }
}

// ─────────────────────────────────────────────────────────────────────────────
// LIST a user template on the marketplace
// ─────────────────────────────────────────────────────────────────────────────
export async function listTemplateOnMarketplace(templateId: string, price: number) {
    const session = await auth()
    if (!session?.user?.id) return { success: false, error: 'Unauthorized' }
    if (price < 5) return { success: false, error: 'Minimum price is 5 credits' }

    await prisma.resumeTemplate.updateMany({
        where: { id: templateId, createdById: session.user.id },
        data: { isMarketplace: true, marketplacePrice: price },
    })
    revalidatePath('/forge/resume')
    return { success: true }
}

// ─────────────────────────────────────────────────────────────────────────────
// DELIST from marketplace
// ─────────────────────────────────────────────────────────────────────────────
export async function delistTemplate(templateId: string) {
    const session = await auth()
    if (!session?.user?.id) return { success: false, error: 'Unauthorized' }

    await prisma.resumeTemplate.updateMany({
        where: { id: templateId, createdById: session.user.id },
        data: { isMarketplace: false },
    })
    revalidatePath('/forge/resume')
    return { success: true }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET user's created templates + earnings
// ─────────────────────────────────────────────────────────────────────────────
export async function getMyTemplateStats() {
    const session = await auth()
    if (!session?.user?.id) return { success: false, error: 'Unauthorized' }

    const templates = await prisma.resumeTemplate.findMany({
        where: { createdById: session.user.id },
        include: { _count: { select: { purchases: true } } },
    })

    const earnings = await prisma.earning.findMany({
        where: { userId: session.user.id, module: 'RESUME_TEMPLATE' },
        orderBy: { createdAt: 'desc' },
        take: 20,
    })

    const totalEarned = earnings.reduce((sum, e) => sum + e.amount, 0)

    return { success: true, templates, earnings, totalEarned }
}
