"use server"

import { prisma } from "@repo/prisma"
import { auth } from "@repo/auth"

// Get mock hub data for a company (public data + user progress)
export async function getCompanyMockHub(companySlug: string) {
    try {
        const session = await auth()
        const userId = session?.user?.id

        const company = await prisma.company.findUnique({
            where: { slug: companySlug },
            select: { id: true }
        })

        if (!company) {
            return { success: false, error: "Company not found" }
        }

        // Get interview processes with mock-enabled rounds
        const processes = await prisma.interviewProcess.findMany({
            where: {
                companyId: company.id,
                isActive: true,
                rounds: {
                    some: {
                        hasMockInterview: true
                    }
                }
            },
            include: {
                rounds: {
                    where: { hasMockInterview: true },
                    orderBy: { roundNumber: "asc" },
                    select: {
                        id: true,
                        roundNumber: true,
                        title: true,
                        roundType: true,
                        description: true,
                        durationMinutes: true,
                        hasMockInterview: true,
                        tipsForCandidates: true
                    }
                }
            },
            orderBy: { createdAt: "desc" }
        })

        // Get user progress if logged in
        let userProgress: any[] = []
        let stats = {
            totalSessions: 0,
            averageScore: 0,
            roundsAttempted: 0
        }

        if (userId) {
            const roundIds = processes.flatMap(p => p.rounds.map(r => r.id))
            
            const sessions = await prisma.jobMockSession.findMany({
                where: {
                    userId,
                    companyId: company.id,
                    roundId: { in: roundIds }
                },
                select: {
                    roundId: true,
                    status: true,
                    overallScore: true,
                    completedAt: true
                }
            })

            // Calculate progress per round
            const progressByRound = new Map<string, {
                sessionsCompleted: number
                bestScore: number | null
                lastPracticedAt: Date | null
            }>()

            for (const roundId of roundIds) {
                const roundSessions = sessions.filter(s => s.roundId === roundId && s.status === "COMPLETED")
                const scores = roundSessions.filter(s => s.overallScore !== null).map(s => s.overallScore!)
                const dates = roundSessions.filter(s => s.completedAt !== null).map(s => s.completedAt!)
                
                progressByRound.set(roundId, {
                    sessionsCompleted: roundSessions.length,
                    bestScore: scores.length > 0 ? Math.max(...scores) : null,
                    lastPracticedAt: dates.length > 0 ? new Date(Math.max(...dates.map(d => d.getTime()))) : null
                })
            }

            userProgress = Array.from(progressByRound.entries()).map(([roundId, progress]) => ({
                roundId,
                ...progress
            }))

            // Calculate overall stats
            const completedSessions = sessions.filter(s => s.status === "COMPLETED")
            const scores = completedSessions.filter(s => s.overallScore !== null).map(s => s.overallScore!)
            const attemptedRounds = new Set(completedSessions.map(s => s.roundId))

            stats = {
                totalSessions: completedSessions.length,
                averageScore: scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
                roundsAttempted: attemptedRounds.size
            }
        }

        return {
            success: true,
            data: {
                processes: processes.map(p => ({
                    id: p.id,
                    name: p.name,
                    description: p.description,
                    estimatedDurationWeeks: p.estimatedDurationWeeks,
                    rounds: p.rounds.map(r => ({
                        ...r,
                        tipsForCandidates: r.tipsForCandidates as string[] | null
                    }))
                })),
                userProgress,
                stats
            }
        }
    } catch (error) {
        console.error("Error fetching company mock hub:", error)
        return { success: false, error: "Failed to fetch mock hub data" }
    }
}

// Start a new mock session for a company round
export async function startCompanyMockSession(companySlug: string, roundId: string, jobId?: string) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: "Please sign in to practice" }
        }

        const company = await prisma.company.findUnique({
            where: { slug: companySlug },
            select: { id: true }
        })

        if (!company) {
            return { success: false, error: "Company not found" }
        }

        // Verify round belongs to company and has mock enabled
        const round = await prisma.interviewRound.findFirst({
            where: {
                id: roundId,
                hasMockInterview: true,
                process: {
                    companyId: company.id
                }
            }
        })

        if (!round) {
            return { success: false, error: "Invalid round or mock not available" }
        }

        // Create mock session
        const mockSession = await prisma.jobMockSession.create({
            data: {
                userId: session.user.id,
                companyId: company.id,
                roundId,
                jobId,
                sessionType: "VOICE",
                status: "SCHEDULED"
            }
        })

        return { success: true, data: mockSession }
    } catch (error) {
        console.error("Error starting mock session:", error)
        return { success: false, error: "Failed to start mock session" }
    }
}

// Get user's mock history for a company
export async function getUserCompanyMockHistory(companySlug: string) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: "Please sign in" }
        }

        const company = await prisma.company.findUnique({
            where: { slug: companySlug },
            select: { id: true }
        })

        if (!company) {
            return { success: false, error: "Company not found" }
        }

        const sessions = await prisma.jobMockSession.findMany({
            where: {
                userId: session.user.id,
                companyId: company.id
            },
            include: {
                round: {
                    select: {
                        title: true,
                        roundType: true,
                        roundNumber: true
                    }
                },
                job: {
                    select: {
                        title: true,
                        slug: true
                    }
                }
            },
            orderBy: { createdAt: "desc" },
            take: 20
        })

        return { success: true, data: sessions }
    } catch (error) {
        console.error("Error fetching mock history:", error)
        return { success: false, error: "Failed to fetch mock history" }
    }
}
