"use server"

import { prisma } from "@repo/prisma"
import { auth } from "@repo/auth"
import { revalidatePath } from "next/cache"
import { randomBytes } from "crypto"
import type {
    InviteTeamMemberPayload, CompanyMemberRole, PendingInvite, 
    CompanyMemberJobTitle
} from "@/types"

// ============================================
// HELPER FUNCTIONS
// ============================================

async function getUserCompany() {
    const session = await auth()
    if (!session?.user?.id) return null

    const member = await prisma.companyMember.findFirst({
        where: { userId: session.user.id },
        include: { company: true }
    })
    return member
}

function generateInviteCode(): string {
    return randomBytes(16).toString("hex")
}

// ============================================
// INVITATION ACTIONS
// ============================================

/**
 * Invite a team member to the company
 */
export async function inviteTeamMember(payload: InviteTeamMemberPayload) {
    const session = await auth()

    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" }
    }

    try {
        const currentMember = await prisma.companyMember.findFirst({
            where: { userId: session.user.id },
            select: { id: true, companyId: true, role: true },
        })

        if (!currentMember) {
            return { success: false, error: "Not a member of any company" }
        }

        if (currentMember.role !== "FOUNDER") {
            return { success: false, error: "Only HEAD can invite team members" }
        }

        // Check if user with this email already exists in the company
        const existingMember = await prisma.companyMember.findFirst({
            where: {
                companyId: currentMember.companyId,
                email: payload.email
            }
        })

        if (existingMember) {
            return { success: false, error: "User is already a member of your company" }
        }

        // Check for existing pending invitation
        const existingInvitation = await prisma.memberInvitation.findFirst({
            where: {
                companyId: currentMember.companyId,
                email: payload.email,
                status: "PENDING"
            }
        })

        if (existingInvitation) {
            return { success: false, error: "An invitation is already pending for this email" }
        }

        // Create invitation
        await prisma.memberInvitation.create({
            data: {
                companyId: currentMember.companyId,
                email: payload.email,
                role: payload.role || "RECRUITER",
                jobTitle: payload.jobTitle || "RECRUITER",
                inviteCode: generateInviteCode(),
                invitedById: currentMember.id,
                message: payload.message,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
            }
        })

        // TODO: Send invitation email

        revalidatePath("/team")
        return { success: true, message: "Invitation sent successfully" }
    } catch (error) {
        console.error("Invite team member error:", error)
        return { success: false, error: "Failed to send invitation" }
    }
}

/**
 * Invite team member (simplified: email and role only)
 */
export async function inviteTeamMemberSimple(email: string, role: CompanyMemberRole) {
    return inviteTeamMember({ email, role })
}

/**
 * Get pending invitations for the company
 */
export async function getPendingInvites(): Promise<{ success: boolean; data?: PendingInvite[]; error?: string }> {
    try {
        const member = await getUserCompany()
        if (!member) return { success: false, error: "Unauthorized" }

        const invites = await prisma.memberInvitation.findMany({
            where: {
                companyId: member.companyId,
                status: "PENDING"
            },
            include: {
                invitedBy: {
                    select: {
                        id: true,
                        displayName: true,
                        user: {
                            select: {
                                name: true,
                                email: true
                            }
                        }
                    }
                }
            },
            orderBy: { createdAt: "desc" }
        })

        const pendingInvites: PendingInvite[] = invites.map(inv => ({
            id: inv.id,
            email: inv.email,
            name: inv.name,
            role: inv.role as CompanyMemberRole,
            jobTitle: inv.jobTitle as CompanyMemberJobTitle,
            inviteCode: inv.inviteCode,
            status: inv.status as "PENDING" | "ACCEPTED" | "REVOKED" | "EXPIRED",
            message: inv.message,
            invitedAt: inv.createdAt,
            expiresAt: inv.expiresAt,
            invitedBy: inv.invitedBy
        }))

        return { success: true, data: pendingInvites }
    } catch (error) {
        console.error("Error fetching pending invites:", error)
        return { success: false, error: "Failed to fetch invites" }
    }
}

/**
 * Get pending invitations with extended info
 */
export async function getPendingInvitations() {
    const session = await auth()

    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" }
    }

    try {
        const currentMember = await prisma.companyMember.findFirst({
            where: { userId: session.user.id },
            select: { companyId: true, role: true },
        })

        if (!currentMember) {
            return { success: false, error: "Not a member of any company" }
        }

        const invitations = await prisma.memberInvitation.findMany({
            where: {
                companyId: currentMember.companyId,
                status: "PENDING",
            },
            include: {
                invitedBy: {
                    select: {
                        id: true,
                        displayName: true,
                        user: {
                            select: {
                                name: true,
                                email: true
                            }
                        }
                    }
                }
            },
            orderBy: { createdAt: "desc" },
        })

        return {
            success: true,
            data: invitations.map(inv => ({
                id: inv.id,
                email: inv.email,
                name: inv.name,
                role: inv.role,
                jobTitle: inv.jobTitle,
                inviteCode: inv.inviteCode,
                status: inv.status,
                message: inv.message,
                invitedAt: inv.createdAt,
                expiresAt: inv.expiresAt,
                invitedBy: inv.invitedBy
            })),
            isHead: currentMember.role === "FOUNDER",
        }
    } catch (error) {
        console.error("Get pending invitations error:", error)
        return { success: false, error: "Failed to fetch invitations" }
    }
}

/**
 * Cancel/revoke an invitation
 */
export async function cancelInvitation(invitationId: string) {
    try {
        const member = await getUserCompany()
        if (!member) return { success: false, error: "Unauthorized" }

        if (member.role !== "FOUNDER") {
            return { success: false, error: "Only team heads can cancel invitations" }
        }

        const invitation = await prisma.memberInvitation.findFirst({
            where: { id: invitationId, companyId: member.companyId }
        })

        if (!invitation) {
            return { success: false, error: "Invitation not found" }
        }

        await prisma.memberInvitation.update({
            where: { id: invitationId },
            data: { status: "REVOKED" }
        })

        revalidatePath("/team")
        return { success: true }
    } catch (error) {
        console.error("Error canceling invitation:", error)
        return { success: false, error: "Failed to cancel invitation" }
    }
}

/**
 * Revoke invitation (alias for cancelInvitation)
 */
export async function revokeInvitation(invitationId: string) {
    return cancelInvitation(invitationId)
}

/**
 * Resend an invitation email
 */
export async function resendInvitation(invitationId: string) {
    try {
        const member = await getUserCompany()
        if (!member) return { success: false, error: "Unauthorized" }

        if (member.role !== "FOUNDER") {
            return { success: false, error: "Only team heads can resend invitations" }
        }

        const invitation = await prisma.memberInvitation.findFirst({
            where: { id: invitationId, companyId: member.companyId }
        })

        if (!invitation) {
            return { success: false, error: "Invitation not found" }
        }

        // Update expiration date
        await prisma.memberInvitation.update({
            where: { id: invitationId },
            data: {
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            }
        })

        // TODO: Send invitation email

        revalidatePath("/team")
        return { success: true }
    } catch (error) {
        console.error("Error resending invitation:", error)
        return { success: false, error: "Failed to resend invitation" }
    }
}
