"use server"

import { db, companyMembers, memberInvitations } from "@repo/db"
import { eq, and, desc } from "drizzle-orm"
import { getSession } from "@repo/auth"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { randomBytes } from "crypto"
import { sendHiringEmail } from "@/lib/emails/hiringemail"
import type {
    InviteTeamMemberPayload, CompanyMemberRole, PendingInvite,
    CompanyMemberJobTitle
} from "@/types"

// ============================================
// HELPER FUNCTIONS
// ============================================

async function getUserCompany() {
    const session = await getSession(headers())
    if (!session?.user?.id) return null

    const member = await db.query.companyMembers.findFirst({
        where: eq(companyMembers.userId, session.user.id),
        with: { company: true }
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
    const session = await getSession(headers())

    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" }
    }

    try {
        const currentMember = await db.query.companyMembers.findFirst({
            where: eq(companyMembers.userId, session.user.id),
            columns: { id: true, companyId: true, role: true }
        })

        if (!currentMember) {
            return { success: false, error: "Not a member of any company" }
        }

        if (currentMember.role !== "FOUNDER") {
            return { success: false, error: "Only HEAD can invite team members" }
        }

        // Check if user with this email already exists in the company
        const existingMember = await db.query.companyMembers.findFirst({
            where: and(
                eq(companyMembers.companyId, currentMember.companyId),
                eq(companyMembers.email, payload.email)
            )
        })

        if (existingMember) {
            return { success: false, error: "User is already a member of your company" }
        }

        // Check for existing pending invitation
        const existingInvitation = await db.query.memberInvitations.findFirst({
            where: and(
                eq(memberInvitations.companyId, currentMember.companyId),
                eq(memberInvitations.email, payload.email),
                eq(memberInvitations.status, "PENDING")
            )
        })

        if (existingInvitation) {
            return { success: false, error: "An invitation is already pending for this email" }
        }

        const inviteCode = generateInviteCode()
        const company = await db.query.companyMembers.findFirst({
            where: eq(companyMembers.id, currentMember.id),
            with: { company: true },
        })

        // Create invitation
        await db.insert(memberInvitations).values({
            companyId: currentMember.companyId,
            email: payload.email,
            role: payload.role || "RECRUITER",
            jobTitle: payload.jobTitle || "RECRUITER",
            inviteCode,
            invitedById: currentMember.id,
            message: payload.message,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        })

        const inviteUrl = `${process.env.NEXT_PUBLIC_HIRING_URL || "http://localhost:3002"}/invite?code=${inviteCode}`
        try {
            await sendHiringEmail({
                email: payload.email,
                emailType: "MEMBER_INVITATION",
                inviterName: session.user.name || session.user.email || "A team member",
                companyName: company?.company?.name || "the company",
                name: payload.role || "Recruiter",
                inviteUrl,
                message: payload.message ?? undefined,
            })
        } catch (emailError) {
            console.error("Failed to send invitation email:", emailError)
        }

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

        const invites = await db.query.memberInvitations.findMany({
            where: and(
                eq(memberInvitations.companyId, member.companyId),
                eq(memberInvitations.status, "PENDING")
            ),
            orderBy: [desc(memberInvitations.createdAt)]
        })

        // Fetch invitedBy member info separately
        const invitedByIds = [...new Set(invites.map(i => i.invitedById).filter(Boolean))] as string[]
        const invitedByMembers = invitedByIds.length > 0
            ? await db.query.companyMembers.findMany({
                where: (m, { inArray }) => inArray(m.id, invitedByIds),
                columns: { id: true, displayName: true, userId: true }
              })
            : []
        const { inArray: inArrayFn } = await import("drizzle-orm")
        const { users } = await import("@repo/db")
        const inviterUserIds = [...new Set(invitedByMembers.map(m => m.userId))]
        const inviterUsers = inviterUserIds.length > 0
            ? await db.select({ id: users.id, name: users.name, email: users.email })
                .from(users)
                .where(inArrayFn(users.id, inviterUserIds))
            : []
        const inviterUserMap = new Map(inviterUsers.map(u => [u.id, u]))
        const invitedByMap = new Map(invitedByMembers.map(m => [m.id, {
            id: m.id,
            displayName: m.displayName,
            user: inviterUserMap.get(m.userId) ?? { name: null, email: "" }
        }]))

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
            invitedBy: invitedByMap.get(inv.invitedById) ?? { id: inv.invitedById, displayName: null, user: { name: null, email: "" } }
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
    const session = await getSession(headers())

    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" }
    }

    try {
        const currentMember = await db.query.companyMembers.findFirst({
            where: eq(companyMembers.userId, session.user.id),
            columns: { companyId: true, role: true }
        })

        if (!currentMember) {
            return { success: false, error: "Not a member of any company" }
        }

        const invitations = await db.query.memberInvitations.findMany({
            where: and(
                eq(memberInvitations.companyId, currentMember.companyId),
                eq(memberInvitations.status, "PENDING")
            ),
            orderBy: [desc(memberInvitations.createdAt)]
        })

        // Fetch invitedBy member info separately
        const invitedByIds2 = [...new Set(invitations.map(i => i.invitedById).filter(Boolean))] as string[]
        const invitedByMembers2 = invitedByIds2.length > 0
            ? await db.query.companyMembers.findMany({
                where: (m, { inArray }) => inArray(m.id, invitedByIds2),
                columns: { id: true, displayName: true, userId: true }
              })
            : []
        const { inArray: inArrayFn2 } = await import("drizzle-orm")
        const { users: usersTable } = await import("@repo/db")
        const inviterUserIds2 = [...new Set(invitedByMembers2.map(m => m.userId))]
        const inviterUsers2 = inviterUserIds2.length > 0
            ? await db.select({ id: usersTable.id, name: usersTable.name, email: usersTable.email })
                .from(usersTable)
                .where(inArrayFn2(usersTable.id, inviterUserIds2))
            : []
        const inviterUserMap2 = new Map(inviterUsers2.map(u => [u.id, u]))
        const invitedByMap2 = new Map(invitedByMembers2.map(m => [m.id, {
            id: m.id,
            displayName: m.displayName,
            user: inviterUserMap2.get(m.userId) ?? { name: null, email: "" }
        }]))

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
                invitedBy: invitedByMap2.get(inv.invitedById) ?? { id: inv.invitedById, displayName: null, user: { name: null, email: "" } }
            })),
            isHead: currentMember.role === "FOUNDER"
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

        const invitation = await db.query.memberInvitations.findFirst({
            where: and(
                eq(memberInvitations.id, invitationId),
                eq(memberInvitations.companyId, member.companyId)
            )
        })

        if (!invitation) {
            return { success: false, error: "Invitation not found" }
        }

        await db.update(memberInvitations)
            .set({ status: "REVOKED" })
            .where(eq(memberInvitations.id, invitationId))

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

        const invitation = await db.query.memberInvitations.findFirst({
            where: and(
                eq(memberInvitations.id, invitationId),
                eq(memberInvitations.companyId, member.companyId)
            )
        })

        if (!invitation) {
            return { success: false, error: "Invitation not found" }
        }

        // Update expiration date
        await db.update(memberInvitations)
            .set({ expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) })
            .where(eq(memberInvitations.id, invitationId))

        const inviteUrl = `${process.env.NEXT_PUBLIC_HIRING_URL || "http://localhost:3002"}/invite?code=${invitation.inviteCode}`
        try {
            await sendHiringEmail({
                email: invitation.email,
                emailType: "MEMBER_INVITATION",
                companyName: member.company?.name || "the company",
                name: invitation.role,
                inviteUrl,
                message: invitation.message ?? undefined,
            })
        } catch (emailError) {
            console.error("Failed to resend invitation email:", emailError)
        }

        revalidatePath("/team")
        return { success: true }
    } catch (error) {
        console.error("Error resending invitation:", error)
        return { success: false, error: "Failed to resend invitation" }
    }
}
