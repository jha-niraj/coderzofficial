"use server"

import { prisma } from "@repo/prisma"
import { auth } from "@repo/auth"
import { revalidatePath } from "next/cache"
import type { BestScores, RecommendedResource } from "@/types"

// ============================================
// HELPERS
// ============================================

async function getUserCompany() {
    const session = await auth()
    if (!session?.user?.id) {
        return null
    }

    const member = await prisma.companyMember.findFirst({
        where: { userId: session.user.id },
        include: { company: true }
    })

    return member
}

// ============================================
// ASSIGNMENT MANAGEMENT
// ============================================

// Submit assignment for an application
export async function submitAssignment(applicationId: string, submission: {
    codeSubmission?: string
    codeLanguage?: string
    submissionUrl?: string
    score?: number
    feedback?: string
}) {
    try {
        const member = await getUserCompany()
        if (!member) {
            return { success: false, error: "Unauthorized" }
        }

        const application = await prisma.jobApplication.findFirst({
            where: {
                id: applicationId,
                job: { companyId: member.companyId }
            }
        })

        if (!application) {
            return { success: false, error: "Application not found" }
        }

        const updated = await prisma.jobApplication.update({
            where: { id: applicationId },
            data: {
                assignmentSubmittedAt: new Date(),
                assignmentScore: submission.score ?? undefined,
                assignmentFeedback: submission.feedback ?? undefined,
                status: "ASSIGNMENT_SUBMITTED",
                activities: {
                    create: {
                        activityType: "ASSIGNMENT_SUBMISSION",
                        userId: application.userId,
                        metadata: {
                            submissionUrl: submission.submissionUrl,
                            codeLanguage: submission.codeLanguage,
                            description: "Candidate submitted assignment"
                        },
                        completedAt: new Date()
                    }
                }
            }
        })

        revalidatePath("/candidates")
        revalidatePath("/applications")

        return { success: true, data: updated }
    } catch (error) {
        console.error("Error submitting assignment:", error)
        return { success: false, error: "Failed to submit assignment" }
    }
}

// Update assignment progress (e.g., save incremental progress or studio link)
export async function updateAssignmentProgress(applicationId: string, progress: { 
    notes?: string
    percentComplete?: number
    timeSpentMinutes?: number
    submissionUrl?: string 
}) {
    try {
        const member = await getUserCompany()
        if (!member) return { success: false, error: "Unauthorized" }

        const application = await prisma.jobApplication.findFirst({ 
            where: { id: applicationId, job: { companyId: member.companyId } } 
        })
        if (!application) return { success: false, error: "Application not found" }

        await prisma.applicationActivity.create({
            data: {
                applicationId,
                userId: application.userId,
                activityType: "ASSIGNMENT_PROGRESS",
                metadata: {
                    notes: progress.notes ?? "Assignment progress update",
                    percentComplete: progress.percentComplete,
                    timeSpentMinutes: progress.timeSpentMinutes,
                    submissionUrl: progress.submissionUrl
                }
            }
        })

        revalidatePath("/candidates")

        return { success: true }
    } catch (error) {
        console.error("Error updating assignment progress:", error)
        return { success: false, error: "Failed to update assignment progress" }
    }
}

// ============================================
// INTERVIEW PREP PROGRESS
// ============================================

// Get interview preparation progress for an application
export async function getPrepProgress(applicationId: string) {
    try {
        const member = await getUserCompany()
        if (!member) return { success: false, error: "Unauthorized" }

        const progress = await prisma.interviewPrepProgress.findFirst({ where: { applicationId } })
        if (!progress) return { success: false, data: null }

        return { success: true, data: progress }
    } catch (error) {
        console.error("Error fetching prep progress:", error)
        return { success: false, error: "Failed to fetch prep progress" }
    }
}

// Upsert interview preparation progress
export async function upsertPrepProgress(applicationId: string, data: Partial<{
    overallReadinessScore: number
    roundsCompleted: number
    totalRounds: number
    lastPracticedAt: Date
    totalPracticeSessionsIncrement: number
    totalPracticeMinutesIncrement: number
    bestScores: BestScores
    nextRecommendedRound: string
    recommendedResources: RecommendedResource[]
}>) {
    try {
        const member = await getUserCompany()
        if (!member) return { success: false, error: "Unauthorized" }

        const application = await prisma.jobApplication.findFirst({ 
            where: { id: applicationId, job: { companyId: member.companyId } } 
        })
        if (!application) return { success: false, error: "Application not found" }

        // Try to find existing
        const existing = await prisma.interviewPrepProgress.findFirst({ where: { applicationId } })
        if (existing) {
            const updated = await prisma.interviewPrepProgress.update({
                where: { id: existing.id },
                data: {
                    overallReadinessScore: data.overallReadinessScore ?? existing.overallReadinessScore,
                    roundsCompleted: data.roundsCompleted ?? existing.roundsCompleted,
                    totalRounds: data.totalRounds ?? existing.totalRounds,
                    lastPracticedAt: data.lastPracticedAt ?? existing.lastPracticedAt,
                    totalPracticeSessions: data.totalPracticeSessionsIncrement ? { increment: data.totalPracticeSessionsIncrement } : undefined,
                    totalPracticeMinutes: data.totalPracticeMinutesIncrement ? { increment: data.totalPracticeMinutesIncrement } : undefined,
                    // For JSON fields, use provided data or keep existing value (which is already JSON)
                    bestScores: data.bestScores !== undefined ? data.bestScores : existing.bestScores ?? undefined,
                    nextRecommendedRound: data.nextRecommendedRound ?? existing.nextRecommendedRound,
                    recommendedResources: data.recommendedResources !== undefined ? data.recommendedResources : existing.recommendedResources ?? undefined
                }
            })

            return { success: true, data: updated }
        }

        // Create new
        const created = await prisma.interviewPrepProgress.create({
            data: {
                applicationId,
                userId: application.userId,
                overallReadinessScore: data.overallReadinessScore ?? 0,
                targetReadinessScore: 80,
                roundsCompleted: data.roundsCompleted ?? 0,
                totalRounds: data.totalRounds ?? 0,
                lastPracticedAt: data.lastPracticedAt,
                totalPracticeSessions: data.totalPracticeSessionsIncrement ?? 0,
                totalPracticeMinutes: data.totalPracticeMinutesIncrement ?? 0,
                bestScores: data.bestScores,
                nextRecommendedRound: data.nextRecommendedRound,
                recommendedResources: data.recommendedResources
            }
        })

        return { success: true, data: created }
    } catch (error) {
        console.error("Error upserting prep progress:", error)
        return { success: false, error: "Failed to upsert prep progress" }
    }
}
