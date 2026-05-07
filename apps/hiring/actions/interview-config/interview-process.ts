"use server"

import { db, companyMembers, jobs, interviewProcesses, interviewRounds } from "@repo/db"
import { eq, and, desc, count, isNotNull, ne, asc } from "drizzle-orm"
import { getSession } from "@repo/auth"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import type { InterviewProcessInput } from "@/types"

// Re-export types for backwards compatibility
export type { InterviewProcessInput } from "@/types"

// ============================================
// HELPERS
// ============================================

export async function getCompanyMember() {
    const session = await getSession(headers())
    if (!session?.user?.id) {
        throw new Error("Unauthorized")
    }

    const member = await db.query.companyMembers.findFirst({
        where: eq(companyMembers.userId, session.user.id),
        with: { company: true }
    })

    if (!member) {
        throw new Error("Not a company member")
    }

    return member
}

function canManageInterviewConfig(role: string): boolean {
    return ["FOUNDER", "ADMIN", "HIRING_MANAGER"].includes(role)
}

// ============================================
// INTERVIEW PROCESS CRUD
// ============================================

// Get all interview processes for a company
export async function getInterviewProcesses() {
    try {
        const member = await getCompanyMember()

        const processes = await db.query.interviewProcesses.findMany({
            where: eq(interviewProcesses.companyId, member.companyId),
            with: {
                rounds: {
                    orderBy: [asc(interviewRounds.roundNumber)]
                }
            },
            orderBy: [
                desc(interviewProcesses.isDefault),
                desc(interviewProcesses.createdAt)
            ]
        })

        // Get job counts per process separately since interviewProcesses relation doesn't have jobs
        const processIds = processes.map(p => p.id)
        const jobCountsMap = new Map<string, number>()
        if (processIds.length > 0) {
            const jobRows = await db
                .select({ interviewProcessId: jobs.interviewProcessId, id: jobs.id })
                .from(jobs)
                .where(eq(jobs.companyId, member.companyId))
            for (const row of jobRows) {
                if (row.interviewProcessId) {
                    jobCountsMap.set(row.interviewProcessId, (jobCountsMap.get(row.interviewProcessId) ?? 0) + 1)
                }
            }
        }

        const processesWithCount = processes.map(p => ({
            ...p,
            _count: { jobs: jobCountsMap.get(p.id) ?? 0 }
        }))

        return { success: true, data: processesWithCount }
    } catch (error) {
        console.error("Error fetching interview processes:", error)
        return { success: false, error: "Failed to fetch interview processes" }
    }
}

// Get a single interview process by ID
export async function getInterviewProcess(processId: string) {
    try {
        const member = await getCompanyMember()

        const process = await db.query.interviewProcesses.findFirst({
            where: and(
                eq(interviewProcesses.id, processId),
                eq(interviewProcesses.companyId, member.companyId)
            ),
            with: {
                rounds: {
                    orderBy: [asc(interviewRounds.roundNumber)]
                }
            }
        })

        if (!process) {
            return { success: false, error: "Interview process not found" }
        }

        // Get linked jobs separately
        const linkedJobs = await db
            .select({ id: jobs.id, title: jobs.title, slug: jobs.slug, status: jobs.status })
            .from(jobs)
            .where(and(eq(jobs.interviewProcessId, processId), eq(jobs.companyId, member.companyId)))

        return { success: true, data: { ...process, jobs: linkedJobs } }
    } catch (error) {
        console.error("Error fetching interview process:", error)
        return { success: false, error: "Failed to fetch interview process" }
    }
}

// Create a new interview process
export async function createInterviewProcess(input: InterviewProcessInput) {
    try {
        const member = await getCompanyMember()

        if (!canManageInterviewConfig(member.role)) {
            return { success: false, error: "You don't have permission to create interview processes" }
        }

        // If this is set as default, unset other defaults
        if (input.isDefault) {
            await db.update(interviewProcesses)
                .set({ isDefault: false })
                .where(and(
                    eq(interviewProcesses.companyId, member.companyId),
                    eq(interviewProcesses.isDefault, true)
                ))
        }

        const insertedProcesses = await db.insert(interviewProcesses).values({
            companyId: member.companyId,
            name: input.name,
            description: input.description,
            isDefault: input.isDefault ?? false,
            estimatedDurationWeeks: input.estimatedDurationWeeks
        }).returning()

        const process = insertedProcesses[0]
        if (!process) {
            return { success: false, error: "Failed to create process" }
        }

        // Insert rounds
        if (input.rounds && input.rounds.length > 0) {
            await db.insert(interviewRounds).values(
                input.rounds.map((round) => ({
                    processId: process.id,
                    roundNumber: round.roundNumber,
                    roundType: round.roundType,
                    title: round.title,
                    durationMinutes: round.durationMinutes,
                    format: round.format ?? "VIDEO",
                    description: round.description,
                    whatToExpect: round.whatToExpect ?? [],
                    sampleQuestions: round.sampleQuestions ?? [],
                    evaluationCriteria: round.evaluationCriteria ?? [],
                    topicsCovered: round.topicsCovered ?? [],
                    tipsForCandidates: round.tipsForCandidates ?? [],
                    passRatePercent: round.passRatePercent,
                    daysToNextRound: round.daysToNextRound,
                    hasMockInterview: round.hasMockInterview ?? true,
                    mockKnowledgeBase: round.mockKnowledgeBase
                }))
            )
        }

        const fullProcess = await db.query.interviewProcesses.findFirst({
            where: eq(interviewProcesses.id, process.id),
            with: {
                rounds: {
                    orderBy: [asc(interviewRounds.roundNumber)]
                }
            }
        })

        revalidatePath("/interview-config")
        return { success: true, data: fullProcess }
    } catch (error) {
        console.error("Error creating interview process:", error)
        return { success: false, error: "Failed to create interview process" }
    }
}

// Update an interview process
export async function updateInterviewProcess(processId: string, input: Partial<InterviewProcessInput>) {
    try {
        const member = await getCompanyMember()

        if (!canManageInterviewConfig(member.role)) {
            return { success: false, error: "You don't have permission to update interview processes" }
        }

        // Verify the process belongs to this company
        const existingProcess = await db.query.interviewProcesses.findFirst({
            where: and(
                eq(interviewProcesses.id, processId),
                eq(interviewProcesses.companyId, member.companyId)
            )
        })

        if (!existingProcess) {
            return { success: false, error: "Interview process not found" }
        }

        // If this is set as default, unset other defaults
        if (input.isDefault) {
            await db.update(interviewProcesses)
                .set({ isDefault: false })
                .where(and(
                    eq(interviewProcesses.companyId, member.companyId),
                    eq(interviewProcesses.isDefault, true),
                    ne(interviewProcesses.id, processId)
                ))
        }

        const updatedProcessRows = await db.update(interviewProcesses)
            .set({
                name: input.name,
                description: input.description,
                isDefault: input.isDefault,
                estimatedDurationWeeks: input.estimatedDurationWeeks
            })
            .where(eq(interviewProcesses.id, processId))
            .returning()

        const updatedProcess = updatedProcessRows[0]
        if (!updatedProcess) {
            return { success: false, error: "Failed to update process" }
        }

        const fullProcess = await db.query.interviewProcesses.findFirst({
            where: eq(interviewProcesses.id, updatedProcess.id),
            with: {
                rounds: {
                    orderBy: [asc(interviewRounds.roundNumber)]
                }
            }
        })

        revalidatePath("/interview-config")
        return { success: true, data: fullProcess }
    } catch (error) {
        console.error("Error updating interview process:", error)
        return { success: false, error: "Failed to update interview process" }
    }
}

// Delete an interview process
export async function deleteInterviewProcess(processId: string) {
    try {
        const member = await getCompanyMember()

        if (!canManageInterviewConfig(member.role)) {
            return { success: false, error: "You don't have permission to delete interview processes" }
        }

        // Verify the process belongs to this company
        const existingProcess = await db.query.interviewProcesses.findFirst({
            where: and(
                eq(interviewProcesses.id, processId),
                eq(interviewProcesses.companyId, member.companyId)
            )
        })

        if (!existingProcess) {
            return { success: false, error: "Interview process not found" }
        }

        // Check if any jobs are linked to this process
        const linkedJobs = await db
            .select({ id: jobs.id })
            .from(jobs)
            .where(eq(jobs.interviewProcessId, processId))

        if (linkedJobs.length > 0) {
            return { success: false, error: "Cannot delete: This process is linked to active jobs" }
        }

        await db.delete(interviewProcesses).where(eq(interviewProcesses.id, processId))

        revalidatePath("/interview-config")
        return { success: true }
    } catch (error) {
        console.error("Error deleting interview process:", error)
        return { success: false, error: "Failed to delete interview process" }
    }
}

// Clone/Duplicate an interview process
export async function cloneInterviewProcess(processId: string, newName?: string) {
    try {
        const member = await getCompanyMember()

        if (!canManageInterviewConfig(member.role)) {
            return { success: false, error: "You don't have permission to clone interview processes" }
        }

        // Get the original process with all rounds
        const originalProcess = await db.query.interviewProcesses.findFirst({
            where: and(
                eq(interviewProcesses.id, processId),
                eq(interviewProcesses.companyId, member.companyId)
            ),
            with: {
                rounds: {
                    orderBy: [asc(interviewRounds.roundNumber)]
                }
            }
        })

        if (!originalProcess) {
            return { success: false, error: "Interview process not found" }
        }

        // Create the new process
        const clonedProcessRows = await db.insert(interviewProcesses).values({
            companyId: member.companyId,
            name: newName || `${originalProcess.name} (Copy)`,
            description: originalProcess.description,
            isDefault: false,
            estimatedDurationWeeks: originalProcess.estimatedDurationWeeks,
            avgTimeToHireDays: originalProcess.avgTimeToHireDays,
            responseRatePercent: originalProcess.responseRatePercent,
            applicationToInterviewPercent: originalProcess.applicationToInterviewPercent,
            interviewToOfferPercent: originalProcess.interviewToOfferPercent
        }).returning()

        const clonedProcess = clonedProcessRows[0]
        if (!clonedProcess) {
            return { success: false, error: "Failed to clone process" }
        }

        // Clone rounds
        if (originalProcess.rounds.length > 0) {
            await db.insert(interviewRounds).values(
                originalProcess.rounds.map(round => ({
                    processId: clonedProcess.id,
                    roundNumber: round.roundNumber,
                    roundType: round.roundType,
                    title: round.title,
                    durationMinutes: round.durationMinutes,
                    format: round.format,
                    description: round.description,
                    whatToExpect: round.whatToExpect as string[],
                    sampleQuestions: round.sampleQuestions as string[],
                    evaluationCriteria: round.evaluationCriteria as string[],
                    topicsCovered: round.topicsCovered as string[],
                    tipsForCandidates: round.tipsForCandidates as string[],
                    passRatePercent: round.passRatePercent,
                    daysToNextRound: round.daysToNextRound,
                    hasMockInterview: round.hasMockInterview,
                    mockKnowledgeBase: round.mockKnowledgeBase
                }))
            )
        }

        const fullProcess = await db.query.interviewProcesses.findFirst({
            where: eq(interviewProcesses.id, clonedProcess.id),
            with: {
                rounds: {
                    orderBy: [asc(interviewRounds.roundNumber)]
                }
            }
        })

        revalidatePath("/interview-config")
        return { success: true, data: fullProcess }
    } catch (error) {
        console.error("Error cloning interview process:", error)
        return { success: false, error: "Failed to clone interview process" }
    }
}

// Check if company has any interview processes configured
export async function hasInterviewProcessConfigured() {
    try {
        const member = await getCompanyMember()

        const result = await db
            .select({ count: count() })
            .from(interviewProcesses)
            .where(and(
                eq(interviewProcesses.companyId, member.companyId),
                eq(interviewProcesses.isActive, true)
            ))

        return { success: true, hasConfig: (result[0]?.count ?? 0) > 0 }
    } catch (error) {
        console.error("Error checking interview config:", error)
        return { success: false, hasConfig: false }
    }
}

// Get interview process statistics
export async function getInterviewProcessStats() {
    try {
        const member = await getCompanyMember()

        const processCountRows = await db
            .select({ count: count() })
            .from(interviewProcesses)
            .where(and(
                eq(interviewProcesses.companyId, member.companyId),
                eq(interviewProcesses.isActive, true)
            ))

        // Count rounds belonging to company processes
        const companyProcessIds = await db
            .select({ id: interviewProcesses.id })
            .from(interviewProcesses)
            .where(eq(interviewProcesses.companyId, member.companyId))
        const processIds = companyProcessIds.map(p => p.id)

        let totalRounds = 0
        if (processIds.length > 0) {
            const { inArray } = await import("drizzle-orm")
            const roundsRows = await db
                .select({ count: count() })
                .from(interviewRounds)
                .where(inArray(interviewRounds.processId, processIds))
            totalRounds = roundsRows[0]?.count ?? 0
        }

        const jobsWithProcessRows = await db
            .select({ count: count() })
            .from(jobs)
            .where(and(
                eq(jobs.companyId, member.companyId),
                isNotNull(jobs.interviewProcessId)
            ))

        return {
            success: true,
            data: {
                processCount: processCountRows[0]?.count ?? 0,
                totalRounds,
                jobsWithProcess: jobsWithProcessRows[0]?.count ?? 0
            }
        }
    } catch (error) {
        console.error("Error fetching interview stats:", error)
        return { success: false, error: "Failed to fetch statistics" }
    }
}
