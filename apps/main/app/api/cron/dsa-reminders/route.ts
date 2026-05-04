// app/api/cron/dsa-reminders/route.ts
//
// Spaced-repetition reminder cron route.
//
// NOTE: This route is designed for a `UserDSATrackingEntry` model that tracks
// spaced-repetition state (nextDueAt, status) per user+problem. That model is
// not yet present in the Prisma schema. Until it is added, the route falls back
// to querying `PracticeUserSession` for DSA problems that are IN_PROGRESS and
// have not been updated in the past 24 hours — a reasonable proxy.
//
// Once the `UserDSATrackingEntry` model is added to the schema and migrated,
// swap the query block labelled "FALLBACK" for the block labelled "PRIMARY".
//
// Trigger this route via a cron job (e.g. Vercel Cron or an external scheduler)
// with the Authorization header set to: Bearer <CRON_SECRET>

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@repo/prisma'
import { NotificationType, Platform, PracticeModule, PracticeSessionStatus } from '@repo/prisma/client'

// ─────────────────────────────────────────────────────────────────────────────
// Auth guard
// ─────────────────────────────────────────────────────────────────────────────
function isAuthorized(req: NextRequest): boolean {
    const authHeader = req.headers.get('authorization')
    if (!authHeader) return false
    const secret = process.env.CRON_SECRET
    if (!secret) return false
    return authHeader === `Bearer ${secret}`
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────


/** Start of today in UTC (midnight). */
function todayUTCStart(): Date {
    const d = new Date()
    d.setUTCHours(0, 0, 0, 0)
    return d
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/cron/dsa-reminders
// ─────────────────────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
    // 1. Verify cron secret
    if (!isAuthorized(req)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const now = new Date()
        const todayStart = todayUTCStart()

        // ── PRIMARY (uncomment once UserDSATrackingEntry is in schema) ─────────
        //
        // const dueEntries = await prisma.userDSATrackingEntry.findMany({
        //     where: {
        //         nextDueAt: { lte: now },
        //         status: { not: 'COMPLETED' },
        //     },
        //     select: {
        //         id: true,
        //         userId: true,
        //         problemId: true,
        //         problem: { select: { title: true, slug: true } },
        //         nextDueAt: true,
        //         status: true,
        //     },
        // })
        //
        // ── FALLBACK: use PracticeUserSession (DSA module, IN_PROGRESS) ────────
        //
        // Find DSA sessions that are IN_PROGRESS and were last updated > 24 h ago.
        // These are the most natural "due for review" entries currently in the DB.
        const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

        const dueEntries = await prisma.practiceUserSession.findMany({
            where: {
                module: PracticeModule.DSA,
                status: PracticeSessionStatus.IN_PROGRESS,
                updatedAt: { lte: twentyFourHoursAgo },
            },
            select: {
                id: true,
                userId: true,
                problemId: true,
                problem: { select: { title: true, slug: true } },
                updatedAt: true,
            },
        })

        if (!dueEntries.length) {
            return NextResponse.json({ success: true, processed: 0 })
        }

        // 2. Fetch notifications already created today to avoid duplicates.
        //    We key by userId + actionUrl (which encodes the problemId).
        const existingToday = await prisma.notification.findMany({
            where: {
                createdAt: { gte: todayStart },
                platform: Platform.MAIN,
                // title prefix shared by all dsa-reminder notifications
                title: { startsWith: '🧠 Time to review' },
            },
            select: { userId: true, actionUrl: true },
        })

        // Build a set of "userId::problemId" already notified today
        const alreadyNotified = new Set<string>(
            existingToday.map((n) => {
                // actionUrl format: /practice/dsa/<slug>  or  /practice/dsa?problem=<problemId>
                // We stored userId+actionUrl together, so key off both
                return `${n.userId}::${n.actionUrl ?? ''}`
            })
        )

        // 3. Create notifications for each due entry that hasn't been notified yet.
        const toCreate: Array<{
            userId: string
            title: string
            message: string
            type: NotificationType
            platform: Platform
            actionUrl: string
        }> = []

        for (const entry of dueEntries) {
            const actionUrl = `/practice/dsa/${entry.problem.slug}`
            const key = `${entry.userId}::${actionUrl}`

            if (alreadyNotified.has(key)) continue

            toCreate.push({
                userId: entry.userId,
                title: `🧠 Time to review: ${entry.problem.title}`,
                message: `Your spaced-repetition schedule says it's time to revisit "${entry.problem.title}". Keep your streak going!`,
                type: NotificationType.INFO,
                platform: Platform.MAIN,
                actionUrl,
            })

            // Mark as seen within this batch to avoid duplicates inside the loop
            alreadyNotified.add(key)
        }

        if (!toCreate.length) {
            return NextResponse.json({ success: true, processed: 0 })
        }

        // 4. Bulk-insert notifications
        await prisma.notification.createMany({ data: toCreate })

        return NextResponse.json({ success: true, processed: toCreate.length })
    } catch (err: unknown) {
        console.error('[cron/dsa-reminders] error:', err)
        return NextResponse.json(
            {
                success: false,
                error: err instanceof Error ? err.message : 'Internal server error',
            },
            { status: 500 }
        )
    }
}
