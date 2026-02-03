"use server"

import { prisma } from "@repo/prisma"
import { auth } from "@repo/auth"
import { revalidatePath } from "next/cache"

async function getCompanyMember() {
    const session = await auth()
    if (!session?.user?.id) return null

    const member = await prisma.companyMember.findFirst({ where: { userId: session.user.id }, include: { company: true } })
    return member
}

export async function createMockSession(input: {
    userId: string
    companyId: string
    roundId: string
    jobId?: string
    sessionType?: string
    scheduledFor?: Date
}) {
    try {
        const member = await getCompanyMember()
        if (!member) return { success: false, error: "Unauthorized" }

        // Verify round belongs to company
        const round = await prisma.interviewRound.findFirst({ where: { id: input.roundId }, include: { process: true } })
        if (!round || round.process.companyId !== member.companyId) {
            return { success: false, error: "Invalid round or permission denied" }
        }

        const session = await prisma.jobMockSession.create({
            data: {
                userId: input.userId,
                companyId: member.companyId,
                roundId: input.roundId,
                jobId: input.jobId,
                sessionType: input.sessionType as any || "VOICE",
                scheduledFor: input.scheduledFor,
                status: "SCHEDULED"
            }
        })

        revalidatePath(`/companies/${member.company.slug}/mock`)
        return { success: true, data: session }
    } catch (error) {
        console.error("Error creating mock session:", error)
        return { success: false, error: "Failed to create mock session" }
    }
}

export async function listCompanyMockSessions(companyId: string, filters: { userId?: string, status?: string } = {}) {
    try {
        const member = await getCompanyMember()
        if (!member) return { success: false, error: "Unauthorized" }
        if (member.companyId !== companyId) return { success: false, error: "Permission denied" }

        const where: any = { companyId }
        if (filters.userId) where.userId = filters.userId
        if (filters.status) where.status = filters.status

        const sessions = await prisma.jobMockSession.findMany({
            where,
            include: {
                round: true,
                company: true,
                job: true
            },
            orderBy: { scheduledFor: "desc" }
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

        const session = await prisma.jobMockSession.findFirst({ where: { id: sessionId, companyId: member.companyId }, include: { round: true, company: true, job: true } })
        if (!session) return { success: false, error: "Session not found" }

        return { success: true, data: session }
    } catch (error) {
        console.error("Error fetching mock session:", error)
        return { success: false, error: "Failed to fetch session" }
    }
}

export async function updateMockSession(sessionId: string, data: Partial<any>) {
    try {
        const member = await getCompanyMember()
        if (!member) return { success: false, error: "Unauthorized" }

        const existing = await prisma.jobMockSession.findFirst({ where: { id: sessionId } })
        if (!existing || existing.companyId !== member.companyId) return { success: false, error: "Not found or permission denied" }

        const updated = await prisma.jobMockSession.update({ where: { id: sessionId }, data })
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

        const sessions = await prisma.jobMockSession.findMany({
            where: { companyId: member.companyId },
            include: {
                round: {
                    select: { title: true, roundType: true }
                },
                job: {
                    select: { title: true }
                }
            },
            orderBy: { createdAt: "desc" },
            take: 100
        })

        // Get user info for each session
        const userIds = [...new Set(sessions.map(s => s.userId))]
        const users = await prisma.user.findMany({
            where: { id: { in: userIds } },
            select: { id: true, name: true, email: true, image: true }
        })
        const userMap = new Map(users.map(u => [u.id, u]))

        const formatted = sessions.map(s => ({
            id: s.id,
            userId: s.userId,
            userName: userMap.get(s.userId)?.name || null,
            userEmail: userMap.get(s.userId)?.email || null,
            userImage: userMap.get(s.userId)?.image || null,
            roundId: s.roundId,
            roundTitle: s.round.title,
            roundType: s.round.roundType,
            jobId: s.jobId,
            jobTitle: s.job?.title || null,
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

        const [totalSessions, completedSessions, sessionsThisWeek, scoreData, roundCounts] = await Promise.all([
            prisma.jobMockSession.count({ where: { companyId: member.companyId } }),
            prisma.jobMockSession.count({ where: { companyId: member.companyId, status: "COMPLETED" } }),
            prisma.jobMockSession.count({ where: { companyId: member.companyId, createdAt: { gte: weekAgo } } }),
            prisma.jobMockSession.aggregate({
                where: { companyId: member.companyId, status: "COMPLETED", overallScore: { not: null } },
                _avg: { overallScore: true }
            }),
            prisma.jobMockSession.groupBy({
                by: ["roundId"],
                where: { companyId: member.companyId },
                _count: true
            })
        ])

        const topPerformers = await prisma.jobMockSession.count({
            where: { companyId: member.companyId, status: "COMPLETED", overallScore: { gte: 80 } }
        })

        // Get round types for the counts
        const roundIds = roundCounts.map(r => r.roundId)
        const rounds = await prisma.interviewRound.findMany({
            where: { id: { in: roundIds } },
            select: { id: true, roundType: true }
        })
        const roundTypeMap = new Map(rounds.map(r => [r.id, r.roundType]))

        const sessionsByRound = roundCounts.map(r => ({
            roundType: roundTypeMap.get(r.roundId) || "UNKNOWN",
            count: r._count
        }))

        return {
            success: true,
            data: {
                totalSessions,
                completedSessions,
                averageScore: Math.round(scoreData._avg.overallScore || 0),
                topPerformers,
                sessionsThisWeek,
                sessionsByRound
            }
        }
    } catch (error) {
        console.error("Error fetching mock stats:", error)
        return { success: false, error: "Failed to fetch stats" }
    }
}