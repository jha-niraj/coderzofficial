"use server"

import { prisma } from "@repo/prisma"
import { auth } from "@repo/auth"
import { revalidatePath } from "next/cache"

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
// CANDIDATE STATUS MANAGEMENT
// ============================================

// Update candidate status
export async function updateCandidateStatus(
    applicationId: string, 
    newStatus: "INTERESTED" | "PREPARING" | "APPLIED" | "UNDER_REVIEW" | "SHORTLISTED" | "ASSIGNMENT_SENT" | "ASSIGNMENT_SUBMITTED" | "INTERVIEW_SCHEDULED" | "INTERVIEWED" | "OFFER_EXTENDED" | "HIRED" | "REJECTED" | "WITHDRAWN", 
    notes?: string
) {
    try {
        const member = await getUserCompany()
        if (!member) {
            return { success: false, error: "Unauthorized" }
        }

        // Verify this application belongs to our company
        const application = await prisma.jobApplication.findFirst({
            where: {
                id: applicationId,
                job: {
                    companyId: member.companyId
                }
            }
        })

        if (!application) {
            return { success: false, error: "Application not found" }
        }

        // Update application status
        const updated = await prisma.jobApplication.update({
            where: { id: applicationId },
            data: {
                status: newStatus,
                reviewedById: member.id,
                reviewedAt: new Date(),
                hrNotes: notes || undefined
            }
        })

        revalidatePath("/candidates")
        revalidatePath("/applications")

        return { success: true, data: updated }
    } catch (error) {
        console.error("Error updating candidate status:", error)
        return { success: false, error: "Failed to update status" }
    }
}

// Add note to candidate
export async function addCandidateNote(applicationId: string, note: string) {
    try {
        const member = await getUserCompany()
        if (!member) {
            return { success: false, error: "Unauthorized" }
        }

        // Verify this application belongs to our company
        const application = await prisma.jobApplication.findFirst({
            where: {
                id: applicationId,
                job: {
                    companyId: member.companyId
                }
            }
        })

        if (!application) {
            return { success: false, error: "Application not found" }
        }

        // Add note to hrNotes field, appending to existing notes
        const existingNotes = application.hrNotes || ""
        const timestamp = new Date().toISOString()
        const newNoteEntry = `[${timestamp}] ${note}`
        const updatedNotes = existingNotes 
            ? `${existingNotes}\n${newNoteEntry}` 
            : newNoteEntry

        await prisma.jobApplication.update({
            where: { id: applicationId },
            data: { hrNotes: updatedNotes }
        })

        revalidatePath("/candidates")

        return { success: true }
    } catch (error) {
        console.error("Error adding note:", error)
        return { success: false, error: "Failed to add note" }
    }
}

// Reject candidate with mandatory feedback
export async function rejectCandidate(applicationId: string, feedback: string, reason: string) {
    try {
        const member = await getUserCompany()
        if (!member) {
            return { success: false, error: "Unauthorized" }
        }

        if (!feedback || feedback.trim().length < 20) {
            return { success: false, error: "Feedback must be at least 20 characters" }
        }

        // Verify this application belongs to our company
        const application = await prisma.jobApplication.findFirst({
            where: {
                id: applicationId,
                job: {
                    companyId: member.companyId
                }
            }
        })

        if (!application) {
            return { success: false, error: "Application not found" }
        }

        // Update application with rejection
        // Store feedback in hrNotes and reason in rejectionReason
        const existingNotes = application.hrNotes || ""
        const timestamp = new Date().toISOString()
        const rejectionNote = `[${timestamp}] REJECTED - Reason: ${reason}\nFeedback: ${feedback}`
        const updatedNotes = existingNotes 
            ? `${existingNotes}\n${rejectionNote}` 
            : rejectionNote

        const updated = await prisma.jobApplication.update({
            where: { id: applicationId },
            data: {
                status: "REJECTED",
                rejectionReason: reason,
                hrNotes: updatedNotes,
                reviewedById: member.id,
                reviewedAt: new Date()
            }
        })

        revalidatePath("/candidates")
        revalidatePath("/applications")

        return { success: true, data: updated }
    } catch (error) {
        console.error("Error rejecting candidate:", error)
        return { success: false, error: "Failed to reject candidate" }
    }
}
