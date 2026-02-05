"use server"

import { prisma } from "@repo/prisma"
import { auth } from "@repo/auth"
import { revalidatePath } from "next/cache"

async function getUserCompany() {
    const session = await auth()
    if (!session?.user?.id) return null

    const member = await prisma.companyMember.findFirst({
        where: { userId: session.user.id },
        include: { company: true }
    })
    return member
}

export interface TeamMember {
    id: string
    userId: string
    role: string
    status: string
    user: {
        id: string
        name: string | null
        email: string
        image: string | null
    }
    createdAt: Date
    jobsPosted?: number
}

export interface PendingInvite {
    id: string
    email: string
    role: string
    status: string
    createdAt: Date
    expiresAt: Date
    invitedBy: {
        name: string | null
    }
}

// Get all team members
export async function getTeamMembers() {
    try {
        const member = await getUserCompany()
        if (!member) return { success: false, error: "Unauthorized" }

        const members = await prisma.companyMember.findMany({
            where: { companyId: member.companyId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true
                    }
                },
                _count: {
                    select: {
                        jobsPosted: true
                    }
                }
            },
            orderBy: { createdAt: "asc" }
        })

        const formatted: TeamMember[] = members.map(m => ({
            id: m.id,
            userId: m.userId,
            role: m.role,
            status: m.status,
            user: m.user,
            createdAt: m.createdAt,
            jobsPosted: m._count.jobsPosted
        }))

        return { success: true, data: formatted }
    } catch (error) {
        console.error("Error fetching team members:", error)
        return { success: false, error: "Failed to fetch team members" }
    }
}

// Get pending invitations
export async function getPendingInvites() {
    try {
        const member = await getUserCompany()
        if (!member) return { success: false, error: "Unauthorized" }

        const invites = await prisma.companyInvitation.findMany({
            where: { 
                companyId: member.companyId,
                status: "PENDING"
            },
            include: {
                invitedBy: {
                    select: { 
                        name: true 
                    }
                }
            },
            orderBy: { 
                createdAt: "desc" 
            }
        })

        return { 
            success: true, 
            data: invites 
        }
    } catch (error) {
        console.error("Error fetching invites:", error)
        return { success: false, error: "Failed to fetch invites" }
    }
}

// Invite a new team member
export async function inviteTeamMember(email: string, role: "FOUNDER" | "RECRUITER") {
    try {
        const member = await getUserCompany()
        if (!member) return { success: false, error: "Unauthorized" }

        // Check if user is HEAD (only HEAD can invite)
        if (member.role !== "FOUNDER") {
            return { success: false, error: "Only team heads can invite new members" }
        }

        // Check if email already has pending invite
        const existingInvite = await prisma.companyInvitation.findFirst({
            where: {
                companyId: member.companyId,
                email: email.toLowerCase(),
                status: "PENDING"
            }
        })

        if (existingInvite) {
            return { success: false, error: "An invitation for this email is already pending" }
        }

        // Check if user is already a member
        const existingMember = await prisma.companyMember.findFirst({
            where: {
                companyId: member.companyId,
                user: { email: email.toLowerCase() }
            }
        })

        if (existingMember) {
            return { success: false, error: "This user is already a team member" }
        }

        // Create invitation
        const expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + 7) // 7 days expiry

        const invitation = await prisma.companyInvitation.create({
            data: {
                companyId: member.companyId,
                email: email.toLowerCase(),
                role,
                status: "PENDING",
                invitedById: member.id,
                expiresAt
            }
        })

        // TODO: Send email invitation

        revalidatePath("/team")
        return { success: true, data: invitation }
    } catch (error) {
        console.error("Error inviting team member:", error)
        return { success: false, error: "Failed to send invitation" }
    }
}

// Cancel an invitation
export async function cancelInvitation(invitationId: string) {
    try {
        const member = await getUserCompany()
        if (!member) return { success: false, error: "Unauthorized" }

        if (member.role !== "FOUNDER") {
            return { success: false, error: "Only team heads can cancel invitations" }
        }

        const invitation = await prisma.companyInvitation.findFirst({
            where: { id: invitationId, companyId: member.companyId }
        })

        if (!invitation) {
            return { success: false, error: "Invitation not found" }
        }

        await prisma.companyInvitation.delete({ where: { id: invitationId } })

        revalidatePath("/team")
        return { success: true }
    } catch (error) {
        console.error("Error canceling invitation:", error)
        return { success: false, error: "Failed to cancel invitation" }
    }
}

// Resend invitation
export async function resendInvitation(invitationId: string) {
    try {
        const member = await getUserCompany()
        if (!member) return { success: false, error: "Unauthorized" }

        const invitation = await prisma.companyInvitation.findFirst({
            where: { id: invitationId, companyId: member.companyId }
        })

        if (!invitation) {
            return { success: false, error: "Invitation not found" }
        }

        // Update expiry
        const expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + 7)

        await prisma.companyInvitation.update({
            where: { id: invitationId },
            data: { expiresAt }
        })

        // TODO: Resend email

        revalidatePath("/team")
        return { success: true }
    } catch (error) {
        console.error("Error resending invitation:", error)
        return { success: false, error: "Failed to resend invitation" }
    }
}

// Update member role
export async function updateMemberRole(memberId: string, newRole: "FOUNDER" | "RECRUITER") {
    try {
        const currentMember = await getUserCompany()
        if (!currentMember) return { success: false, error: "Unauthorized" }

        if (currentMember.role !== "FOUNDER") {
            return { success: false, error: "Only team heads can change roles" }
        }

        // Cannot change own role
        if (currentMember.id === memberId) {
            return { success: false, error: "You cannot change your own role" }
        }

        const targetMember = await prisma.companyMember.findFirst({
            where: { id: memberId, companyId: currentMember.companyId }
        })

        if (!targetMember) {
            return { success: false, error: "Member not found" }
        }

        await prisma.companyMember.update({
            where: { id: memberId },
            data: { role: newRole }
        })

        revalidatePath("/team")
        return { success: true }
    } catch (error) {
        console.error("Error updating member role:", error)
        return { success: false, error: "Failed to update role" }
    }
}

// Remove team member
export async function removeTeamMember(memberId: string) {
    try {
        const currentMember = await getUserCompany()
        if (!currentMember) return { success: false, error: "Unauthorized" }

        if (currentMember.role !== "FOUNDER") {
            return { success: false, error: "Only team heads can remove members" }
        }

        if (currentMember.id === memberId) {
            return { success: false, error: "You cannot remove yourself" }
        }

        const targetMember = await prisma.companyMember.findFirst({
            where: { id: memberId, companyId: currentMember.companyId }
        })

        if (!targetMember) {
            return { success: false, error: "Member not found" }
        }

        await prisma.companyMember.delete({ where: { id: memberId } })

        revalidatePath("/team")
        return { success: true }
    } catch (error) {
        console.error("Error removing member:", error)
        return { success: false, error: "Failed to remove member" }
    }
}

// Get team stats
export async function getTeamStats() {
    try {
        const member = await getUserCompany()
        if (!member) return { success: false, error: "Unauthorized" }

        const [membersCount, pendingInvites, jobsPosted, candidatesProcessed] = await Promise.all([
            prisma.companyMember.count({ where: { companyId: member.companyId } }),
            prisma.companyInvitation.count({ where: { companyId: member.companyId, status: "PENDING" } }),
            prisma.job.count({ where: { companyId: member.companyId } }),
            prisma.jobApplication.count({
                where: {
                    job: { companyId: member.companyId },
                    reviewedById: { not: null }
                }
            })
        ])

        return {
            success: true,
            data: {
                totalMembers: membersCount,
                pendingInvites,
                jobsPosted,
                candidatesProcessed
            }
        }
    } catch (error) {
        console.error("Error fetching team stats:", error)
        return { success: false, error: "Failed to fetch stats" }
    }
}
