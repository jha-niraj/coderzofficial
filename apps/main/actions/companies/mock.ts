"use server"

import { getSession } from "@repo/auth"
import { headers } from "next/headers"
import {
    db,
    companies,
    jobs,
    interviewProcesses,
    interviewRounds,
    jobMockSessions,
} from "@repo/db"
import { eq, and, inArray, desc } from "drizzle-orm"

// Get mock hub data for a company (public data + user progress)
export async function getCompanyMockHub(companySlug: string) {
    try {
        const session = await getSession(headers())
        const userId = session?.user?.id

        const company = await db.query.companies.findFirst({
            where: eq(companies.slug, companySlug),
            columns: { id: true },
        })

        if (!company) {
            return { success: false, error: "Company not found" }
        }

        // Get jobs with interview processes that have mock-enabled rounds
        // Step 1: Get all active processes for this company that have mock-enabled rounds
        const allProcesses = await db.query.interviewProcesses.findMany({
            where: and(
                eq(interviewProcesses.companyId, company.id),
                eq(interviewProcesses.isActive, true)
            ),
            with: {
                rounds: {
                    orderBy: (r: any, { asc }: any) => [asc(r.roundNumber)],
                    columns: {
                        id: true,
                        roundNumber: true,
                        title: true,
                        roundType: true,
                        description: true,
                        durationMinutes: true,
                        hasMockInterview: true,
                        tipsForCandidates: true,
                    },
                },
            },
            orderBy: desc(interviewProcesses.createdAt),
        })

        // Filter to processes that have at least one mock-enabled round
        const processesWithMock = allProcesses.filter(p => p.rounds.some(r => r.hasMockInterview))

        // Get the process IDs
        const processIds = processesWithMock.map(p => p.id)

        // Get jobs that have these interview processes
        const jobRows = processIds.length > 0
            ? await db.query.jobs.findMany({
                where: and(
                    eq(jobs.companyId, company.id),
                    eq(jobs.status, "ACTIVE"),
                    inArray(jobs.interviewProcessId, processIds)
                ),
                columns: {
                    id: true,
                    title: true,
                    slug: true,
                    location: true,
                    locationType: true,
                    employmentType: true,
                    applicationsCount: true,
                    interviewProcessId: true,
                    createdAt: true,
                },
                orderBy: desc(jobs.createdAt),
            })
            : []

        const processMap = new Map(processesWithMock.map(p => [p.id, p]))

        // Get user progress if logged in
        let userProgress: any[] = []
        let stats = {
            totalSessions: 0,
            averageScore: 0,
            roundsAttempted: 0
        }

        if (userId) {
            // Collect all round IDs across all processes with mocks
            const allRoundIds = processesWithMock.flatMap(p => p.rounds.map(r => r.id))

            const sessions = allRoundIds.length > 0
                ? await db.query.jobMockSessions.findMany({
                    where: and(
                        eq(jobMockSessions.userId, userId),
                        eq(jobMockSessions.companyId, company.id),
                        inArray(jobMockSessions.roundId, allRoundIds)
                    ),
                    columns: {
                        roundId: true,
                        status: true,
                        overallScore: true,
                        completedAt: true,
                    },
                })
                : []

            // Calculate progress per round
            const progressByRound = new Map<string, {
                sessionsCompleted: number
                bestScore: number | null
                lastPracticedAt: Date | null
            }>()

            for (const roundId of allRoundIds) {
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
                jobs: jobRows.map(j => ({
                    id: j.id,
                    title: j.title,
                    slug: j.slug,
                    location: j.location,
                    locationType: j.locationType,
                    employmentType: j.employmentType,
                    applicationsCount: j.applicationsCount,
                    interviewProcess: j.interviewProcessId ? (processMap.get(j.interviewProcessId) ?? null) : null,
                })),
                processes: processesWithMock.map(p => ({
                    id: p.id,
                    name: p.name,
                    description: p.description,
                    estimatedDurationWeeks: p.estimatedDurationWeeks,
                    rounds: p.rounds
                        .filter(r => r.hasMockInterview)
                        .map(r => ({
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
        const session = await getSession(headers())
        if (!session?.user?.id) {
            return { success: false, error: "Please sign in to practice" }
        }

        const company = await db.query.companies.findFirst({
            where: eq(companies.slug, companySlug),
            columns: { id: true },
        })

        if (!company) {
            return { success: false, error: "Company not found" }
        }

        // Verify round belongs to company and has mock enabled
        const round = await db.query.interviewRounds.findFirst({
            where: and(
                eq(interviewRounds.id, roundId),
                eq(interviewRounds.hasMockInterview, true)
            ),
            with: {
                process: {
                    columns: { companyId: true },
                },
            },
        })

        if (!round || round.process.companyId !== company.id) {
            return { success: false, error: "Invalid round or mock not available" }
        }

        const [mockSession] = await db.insert(jobMockSessions).values({
            userId: session.user.id,
            companyId: company.id,
            roundId,
            jobId,
            sessionType: "VOICE",
            status: "SCHEDULED",
        }).returning()

        return { success: true, data: mockSession }
    } catch (error) {
        console.error("Error starting mock session:", error)
        return { success: false, error: "Failed to start mock session" }
    }
}

// Get user's mock history for a company
export async function getUserCompanyMockHistory(companySlug: string) {
    try {
        const session = await getSession(headers())
        if (!session?.user?.id) {
            return { success: false, error: "Please sign in" }
        }

        const company = await db.query.companies.findFirst({
            where: eq(companies.slug, companySlug),
            columns: { id: true },
        })

        if (!company) {
            return { success: false, error: "Company not found" }
        }

        const sessions = await db.query.jobMockSessions.findMany({
            where: and(
                eq(jobMockSessions.userId, session.user.id),
                eq(jobMockSessions.companyId, company.id)
            ),
            with: {
                round: {
                    columns: {
                        title: true,
                        roundType: true,
                        roundNumber: true,
                    },
                },
            },
            orderBy: desc(jobMockSessions.createdAt),
            limit: 20,
        })

        // Load job info separately (jobMockSessions.jobId is a plain nullable text field)
        const jobIds = sessions
            .map(s => s.jobId)
            .filter((id): id is string => !!id)

        const jobRows = jobIds.length > 0
            ? await db.query.jobs.findMany({
                where: inArray(jobs.id, jobIds),
                columns: { id: true, title: true, slug: true },
            })
            : []

        const jobMap = new Map(jobRows.map(j => [j.id, j]))

        const enrichedSessions = sessions.map(s => ({
            ...s,
            job: s.jobId ? (jobMap.get(s.jobId) ?? null) : null,
        }))

        return { success: true, data: enrichedSessions }
    } catch (error) {
        console.error("Error fetching mock history:", error)
        return { success: false, error: "Failed to fetch mock history" }
    }
}
