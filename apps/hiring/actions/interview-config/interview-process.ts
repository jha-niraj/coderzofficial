"use server"

import { prisma } from "@repo/prisma"
import { auth } from "@repo/auth"
import { revalidatePath } from "next/cache"
import type { InterviewProcessInput } from "@/types"

// Re-export types for backwards compatibility
export type { InterviewProcessInput } from "@/types"

// ============================================
// HELPERS
// ============================================

export async function getCompanyMember() {
    const session = await auth()
    if (!session?.user?.id) {
        throw new Error("Unauthorized")
    }

    const member = await prisma.companyMember.findFirst({
        where: { userId: session.user.id },
        include: { company: true }
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

        const processes = await prisma.interviewProcess.findMany({
            where: { companyId: member.companyId },
            include: {
                rounds: {
                    orderBy: { roundNumber: "asc" }
                },
                _count: {
                    select: { jobs: true }
                }
            },
            orderBy: [
                { isDefault: "desc" },
                { createdAt: "desc" }
            ]
        })

        return { success: true, data: processes }
    } catch (error) {
        console.error("Error fetching interview processes:", error)
        return { success: false, error: "Failed to fetch interview processes" }
    }
}

// Get a single interview process by ID
export async function getInterviewProcess(processId: string) {
    try {
        const member = await getCompanyMember()

        const process = await prisma.interviewProcess.findFirst({
            where: {
                id: processId,
                companyId: member.companyId
            },
            include: {
                rounds: {
                    orderBy: { roundNumber: "asc" }
                },
                jobs: {
                    select: {
                        id: true,
                        title: true,
                        slug: true,
                        status: true
                    }
                }
            }
        })

        if (!process) {
            return { success: false, error: "Interview process not found" }
        }

        return { success: true, data: process }
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
            await prisma.interviewProcess.updateMany({
                where: {
                    companyId: member.companyId,
                    isDefault: true
                },
                data: { isDefault: false }
            })
        }

        const process = await prisma.interviewProcess.create({
            data: {
                companyId: member.companyId,
                name: input.name,
                description: input.description,
                isDefault: input.isDefault ?? false,
                estimatedDurationWeeks: input.estimatedDurationWeeks,
                rounds: {
                    create: input.rounds.map((round) => ({
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
                }
            },
            include: {
                rounds: {
                    orderBy: { roundNumber: "asc" }
                }
            }
        })

        revalidatePath("/interview-config")
        return { success: true, data: process }
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
        const existingProcess = await prisma.interviewProcess.findFirst({
            where: {
                id: processId,
                companyId: member.companyId
            }
        })

        if (!existingProcess) {
            return { success: false, error: "Interview process not found" }
        }

        // If this is set as default, unset other defaults
        if (input.isDefault) {
            await prisma.interviewProcess.updateMany({
                where: {
                    companyId: member.companyId,
                    isDefault: true,
                    id: { not: processId }
                },
                data: { isDefault: false }
            })
        }

        const process = await prisma.interviewProcess.update({
            where: { id: processId },
            data: {
                name: input.name,
                description: input.description,
                isDefault: input.isDefault,
                estimatedDurationWeeks: input.estimatedDurationWeeks
            },
            include: {
                rounds: {
                    orderBy: { roundNumber: "asc" }
                }
            }
        })

        revalidatePath("/interview-config")
        return { success: true, data: process }
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
        const existingProcess = await prisma.interviewProcess.findFirst({
            where: {
                id: processId,
                companyId: member.companyId
            },
            include: {
                _count: { select: { jobs: true } }
            }
        })

        if (!existingProcess) {
            return { success: false, error: "Interview process not found" }
        }

        if (existingProcess._count.jobs > 0) {
            return { success: false, error: "Cannot delete: This process is linked to active jobs" }
        }

        await prisma.interviewProcess.delete({
            where: { id: processId }
        })

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
        const originalProcess = await prisma.interviewProcess.findFirst({
            where: {
                id: processId,
                companyId: member.companyId
            },
            include: {
                rounds: {
                    orderBy: { roundNumber: "asc" }
                }
            }
        })

        if (!originalProcess) {
            return { success: false, error: "Interview process not found" }
        }

        // Create the new process with cloned rounds
        const clonedProcess = await prisma.interviewProcess.create({
            data: {
                companyId: member.companyId,
                name: newName || `${originalProcess.name} (Copy)`,
                description: originalProcess.description,
                isDefault: false, // Never clone as default
                estimatedDurationWeeks: originalProcess.estimatedDurationWeeks,
                avgTimeToHireDays: originalProcess.avgTimeToHireDays,
                responseRatePercent: originalProcess.responseRatePercent,
                applicationToInterviewPercent: originalProcess.applicationToInterviewPercent,
                interviewToOfferPercent: originalProcess.interviewToOfferPercent,
                rounds: {
                    create: originalProcess.rounds.map(round => ({
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
                }
            },
            include: {
                rounds: {
                    orderBy: { roundNumber: "asc" }
                }
            }
        })

        revalidatePath("/interview-config")
        return { success: true, data: clonedProcess }
    } catch (error) {
        console.error("Error cloning interview process:", error)
        return { success: false, error: "Failed to clone interview process" }
    }
}

// Check if company has any interview processes configured
export async function hasInterviewProcessConfigured() {
    try {
        const member = await getCompanyMember()

        const count = await prisma.interviewProcess.count({
            where: {
                companyId: member.companyId,
                isActive: true
            }
        })

        return { success: true, hasConfig: count > 0 }
    } catch (error) {
        console.error("Error checking interview config:", error)
        return { success: false, hasConfig: false }
    }
}

// Get interview process statistics
export async function getInterviewProcessStats() {
    try {
        const member = await getCompanyMember()

        const [processCount, totalRounds, jobsWithProcess] = await Promise.all([
            prisma.interviewProcess.count({
                where: { companyId: member.companyId, isActive: true }
            }),
            prisma.interviewRound.count({
                where: {
                    process: { companyId: member.companyId }
                }
            }),
            prisma.job.count({
                where: {
                    companyId: member.companyId,
                    interviewProcessId: { not: null }
                }
            })
        ])

        return {
            success: true,
            data: {
                processCount,
                totalRounds,
                jobsWithProcess
            }
        }
    } catch (error) {
        console.error("Error fetching interview stats:", error)
        return { success: false, error: "Failed to fetch statistics" }
    }
}
