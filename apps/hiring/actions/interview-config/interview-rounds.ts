"use server"

import { prisma } from "@repo/prisma"
import { auth } from "@repo/auth"
import { revalidatePath } from "next/cache"
import type { InterviewRoundInput } from "@/types"

// Re-export types for backwards compatibility
export type { InterviewRoundInput } from "@/types"

// ============================================
// HELPERS
// ============================================

async function getCompanyMember() {
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
// INTERVIEW ROUND MANAGEMENT
// ============================================

// Add a round to an interview process
export async function addInterviewRound(processId: string, round: InterviewRoundInput) {
    try {
        const member = await getCompanyMember()

        if (!canManageInterviewConfig(member.role)) {
            return { success: false, error: "You don't have permission to modify interview rounds" }
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

        const newRound = await prisma.interviewRound.create({
            data: {
                processId: processId,
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
            }
        })

        revalidatePath("/interview-config")
        return { success: true, data: newRound }
    } catch (error) {
        console.error("Error adding interview round:", error)
        return { success: false, error: "Failed to add interview round" }
    }
}

// Update an interview round
export async function updateInterviewRound(roundId: string, input: Partial<InterviewRoundInput>) {
    try {
        const member = await getCompanyMember()

        if (!canManageInterviewConfig(member.role)) {
            return { success: false, error: "You don't have permission to modify interview rounds" }
        }

        // Verify the round belongs to this company
        const existingRound = await prisma.interviewRound.findFirst({
            where: { id: roundId },
            include: {
                process: {
                    select: { companyId: true }
                }
            }
        })

        if (!existingRound || existingRound.process.companyId !== member.companyId) {
            return { success: false, error: "Interview round not found" }
        }

        const round = await prisma.interviewRound.update({
            where: { id: roundId },
            data: {
                roundNumber: input.roundNumber,
                roundType: input.roundType,
                title: input.title,
                durationMinutes: input.durationMinutes,
                format: input.format,
                description: input.description,
                whatToExpect: input.whatToExpect,
                sampleQuestions: input.sampleQuestions,
                evaluationCriteria: input.evaluationCriteria,
                topicsCovered: input.topicsCovered,
                tipsForCandidates: input.tipsForCandidates,
                passRatePercent: input.passRatePercent,
                daysToNextRound: input.daysToNextRound,
                hasMockInterview: input.hasMockInterview,
                mockKnowledgeBase: input.mockKnowledgeBase
            }
        })

        revalidatePath("/interview-config")
        return { success: true, data: round }
    } catch (error) {
        console.error("Error updating interview round:", error)
        return { success: false, error: "Failed to update interview round" }
    }
}

// Delete an interview round
export async function deleteInterviewRound(roundId: string) {
    try {
        const member = await getCompanyMember()

        if (!canManageInterviewConfig(member.role)) {
            return { success: false, error: "You don't have permission to delete interview rounds" }
        }

        // Verify the round belongs to this company
        const existingRound = await prisma.interviewRound.findFirst({
            where: { id: roundId },
            include: {
                process: {
                    select: { companyId: true }
                }
            }
        })

        if (!existingRound || existingRound.process.companyId !== member.companyId) {
            return { success: false, error: "Interview round not found" }
        }

        await prisma.interviewRound.delete({
            where: { id: roundId }
        })

        revalidatePath("/interview-config")
        return { success: true }
    } catch (error) {
        console.error("Error deleting interview round:", error)
        return { success: false, error: "Failed to delete interview round" }
    }
}

// Reorder interview rounds
export async function reorderInterviewRounds(processId: string, roundIds: string[]) {
    try {
        const member = await getCompanyMember()

        if (!canManageInterviewConfig(member.role)) {
            return { success: false, error: "You don't have permission to reorder interview rounds" }
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

        // Update each round with new order
        await Promise.all(
            roundIds.map((roundId, index) =>
                prisma.interviewRound.update({
                    where: { id: roundId },
                    data: { roundNumber: index + 1 }
                })
            )
        )

        revalidatePath("/interview-config")
        return { success: true }
    } catch (error) {
        console.error("Error reordering interview rounds:", error)
        return { success: false, error: "Failed to reorder rounds" }
    }
}
