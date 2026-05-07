"use server"

import { db, companyMembers, interviewRounds, jobMockSessions, users, jobs } from "@repo/db"
import { eq, and, count, avg, gte, inArray, desc } from "drizzle-orm"
import { getSession } from "@repo/auth"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import type {
    CreateMockSessionInput,
    MockSessionFilters,
    UpdateMockSessionData,
    JobMockStatus
} from "@/types"

async function getCompanyMember() {
    const session = await getSession(headers())
    if (!session?.user?.id) return null

    const member = await db.query.companyMembers.findFirst({
        where: eq(companyMembers.userId, session.user.id),
        with: { company: true }
    })
    return member
}

export async function createMockSession(input: CreateMockSessionInput) {
    try {
        const member = await getCompanyMember()
        if (!member) return { success: false, error: "Unauthorized" }

        // Verify round belongs to company
        const round = await db.query.interviewRounds.findFirst({
            where: eq(interviewRounds.id, input.roundId),
            with: { process: { columns: { companyId: true } } }
        })
        if (!round || round.process.companyId !== member.companyId) {
            return { success: false, error: "Invalid round or permission denied" }
        }

        const [session] = await db.insert(jobMockSessions).values({
            userId: input.userId,
            companyId: member.companyId,
            roundId: input.roundId,
            jobId: input.jobId,
            sessionType: input.sessionType || "VOICE",
            scheduledFor: input.scheduledFor,
            status: "SCHEDULED"
        }).returning()

        revalidatePath(`/companies/${member.company.slug}/mock`)
        return { success: true, data: session }
    } catch (error) {
        console.error("Error creating mock session:", error)
        return { success: false, error: "Failed to create mock session" }
    }
}

export async function listCompanyMockSessions(companyId: string, filters: MockSessionFilters = {}) {
    try {
        const member = await getCompanyMember()
        if (!member) return { success: false, error: "Unauthorized" }
        if (member.companyId !== companyId) return { success: false, error: "Permission denied" }

        const conditions = [eq(jobMockSessions.companyId, companyId)]
        if (filters.userId) conditions.push(eq(jobMockSessions.userId, filters.userId))
        if (filters.status) conditions.push(eq(jobMockSessions.status, filters.status as JobMockStatus))

        const sessions = await db.query.jobMockSessions.findMany({
            where: and(...conditions),
            with: {
                round: true,
                company: true
            },
            orderBy: [desc(jobMockSessions.scheduledFor)]
        })

        return { success: true, data: sessions }
    } catch (error) {
        console.error("Error listing mock sessions:", error)
        return { success: false, error: "Failed to list mock sessions" }
    }
}

export async function getMockSession(sessionId: string) {
    try {
        const member = await getCompanyMember()
        if (!member) return { success: false, error: "Unauthorized" }

        const session = await db.query.jobMockSessions.findFirst({
            where: and(
                eq(jobMockSessions.id, sessionId),
                eq(jobMockSessions.companyId, member.companyId)
            ),
            with: { round: true, company: true }
        })
        if (!session) return { success: false, error: "Session not found" }

        return { success: true, data: session }
    } catch (error) {
        console.error("Error fetching mock session:", error)
        return { success: false, error: "Failed to fetch session" }
    }
}

export async function updateMockSession(sessionId: string, data: UpdateMockSessionData) {
    try {
        const member = await getCompanyMember()
        if (!member) return { success: false, error: "Unauthorized" }

        const existing = await db.query.jobMockSessions.findFirst({
            where: eq(jobMockSessions.id, sessionId),
            columns: { companyId: true }
        })
        if (!existing || existing.companyId !== member.companyId) return { success: false, error: "Not found or permission denied" }

        const [updated] = await db.update(jobMockSessions)
            .set(data)
            .where(eq(jobMockSessions.id, sessionId))
            .returning()

        revalidatePath(`/companies/${member.company.slug}/mock`)
        return { success: true, data: updated }
    } catch (error) {
        console.error("Error updating mock session:", error)
        return { success: false, error: "Failed to update session" }
    }
}

// Get all mock sessions for the company with user info
export async function getMockSessionsOverview() {
    try {
        const member = await getCompanyMember()
        if (!member) return { success: false, error: "Unauthorized" }

        const sessions = await db.query.jobMockSessions.findMany({
            where: eq(jobMockSessions.companyId, member.companyId),
            with: {
                round: {
                    columns: { title: true, roundType: true }
                }
            },
            orderBy: [desc(jobMockSessions.createdAt)],
            limit: 100
        })

        // Get user info for each session
        const userIds = [...new Set(sessions.map(s => s.userId))]
        const userList = userIds.length > 0
            ? await db
                .select({ id: users.id, name: users.name, email: users.email, image: users.image })
                .from(users)
                .where(inArray(users.id, userIds))
            : []
        const userMap = new Map(userList.map(u => [u.id, u]))

        // Get job titles for sessions that have a jobId
        const jobIds = [...new Set(sessions.map(s => s.jobId).filter(Boolean))] as string[]
        const jobList = jobIds.length > 0
            ? await db.select({ id: jobs.id, title: jobs.title }).from(jobs).where(inArray(jobs.id, jobIds))
            : []
        const jobMap = new Map(jobList.map(j => [j.id, j]))

        const formatted = sessions.map(s => ({
            id: s.id,
            userId: s.userId,
            userName: userMap.get(s.userId)?.name || null,
            userEmail: userMap.get(s.userId)?.email || null,
            userImage: userMap.get(s.userId)?.image || null,
            roundId: s.roundId,
            roundTitle: s.round?.title ?? null,
            roundType: s.round?.roundType ?? null,
            jobId: s.jobId,
            jobTitle: s.jobId ? (jobMap.get(s.jobId)?.title ?? null) : null,
            sessionType: s.sessionType,
            status: s.status,
            scheduledFor: s.scheduledFor,
            startedAt: s.startedAt,
            completedAt: s.completedAt,
            durationSeconds: s.durationSeconds,
            overallScore: s.overallScore,
            createdAt: s.createdAt
        }))

        return { success: true, data: formatted }
    } catch (error) {
        console.error("Error fetching mock sessions overview:", error)
        return { success: false, error: "Failed to fetch sessions" }
    }
}

// Get mock interview stats for the company
export async function getMockStats() {
    try {
        const member = await getCompanyMember()
        if (!member) return { success: false, error: "Unauthorized" }

        const now = new Date()
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

        const totalSessionsRows = await db
            .select({ count: count() })
            .from(jobMockSessions)
            .where(eq(jobMockSessions.companyId, member.companyId))

        const completedSessionsRows = await db
            .select({ count: count() })
            .from(jobMockSessions)
            .where(and(
                eq(jobMockSessions.companyId, member.companyId),
                eq(jobMockSessions.status, "COMPLETED")
            ))

        const sessionsThisWeekRows = await db
            .select({ count: count() })
            .from(jobMockSessions)
            .where(and(
                eq(jobMockSessions.companyId, member.companyId),
                gte(jobMockSessions.createdAt, weekAgo)
            ))

        const scoreDataResult = await db
            .select({ avg: avg(jobMockSessions.overallScore) })
            .from(jobMockSessions)
            .where(and(
                eq(jobMockSessions.companyId, member.companyId),
                eq(jobMockSessions.status, "COMPLETED")
            ))

        const topPerformersRows = await db
            .select({ count: count() })
            .from(jobMockSessions)
            .where(and(
                eq(jobMockSessions.companyId, member.companyId),
                eq(jobMockSessions.status, "COMPLETED"),
                gte(jobMockSessions.overallScore, 80)
            ))

        // Get session counts by round
        const roundCounts = await db.query.jobMockSessions.findMany({
            where: eq(jobMockSessions.companyId, member.companyId),
            columns: { roundId: true },
            with: { round: { columns: { roundType: true } } }
        })

        const roundTypeCountMap = new Map<string, number>()
        for (const s of roundCounts) {
            const rt = s.round?.roundType ?? "UNKNOWN"
            roundTypeCountMap.set(rt, (roundTypeCountMap.get(rt) || 0) + 1)
        }

        const sessionsByRound = Array.from(roundTypeCountMap.entries()).map(([roundType, cnt]) => ({
            roundType,
            count: cnt
        }))

        return {
            success: true,
            data: {
                totalSessions: totalSessionsRows[0]?.count ?? 0,
                completedSessions: completedSessionsRows[0]?.count ?? 0,
                averageScore: Math.round(Number(scoreDataResult[0]?.avg) || 0),
                topPerformers: topPerformersRows[0]?.count ?? 0,
                sessionsThisWeek: sessionsThisWeekRows[0]?.count ?? 0,
                sessionsByRound
            }
        }
    } catch (error) {
        console.error("Error fetching mock stats:", error)
        return { success: false, error: "Failed to fetch stats" }
    }
}
