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