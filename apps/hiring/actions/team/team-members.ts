"use server"

import { prisma } from "@repo/prisma"
import { auth } from "@repo/auth"
import { revalidatePath } from "next/cache"
import type {
    Permission, TeamMember, UpdateTeamMemberPayload,
    CompanyMemberRole, CompanyMemberJobTitle, MemberInviteStatus
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

function parsePermissions(permissions: unknown): Permission[] {
    if (!permissions) return []
    try {
        const parsed = typeof permissions === "string"
            ? JSON.parse(permissions)
            : permissions
        return Array.isArray(parsed) ? parsed as Permission[] : []
    } catch {
        return []
    }
}

// ============================================
// TEAM MEMBER FETCHING ACTIONS
// ============================================

/**
 * Get all team members of the current user's company
 */
export async function getTeamMembers() {
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

        const members = await prisma.companyMember.findMany({
            where: { companyId: currentMember.companyId },
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
                        postedJobs: true
                    }
                }
            },
            orderBy: [
                { role: "asc" },
                { createdAt: "asc" },
            ],
        })

        const teamMembers: TeamMember[] = members.map((member) => ({
            id: member.id,
            userId: member.userId,
            companyId: member.companyId,
            role: member.role as CompanyMemberRole,
            jobTitle: member.jobTitle as CompanyMemberJobTitle,
            jobTitleCustom: member.jobTitleCustom,
            displayName: member.displayName,
            email: member.email,
            phone: member.phone,
            permissions: parsePermissions(member.permissions),
            inviteStatus: member.inviteStatus as MemberInviteStatus,
            isActive: member.isActive,
            lastActiveAt: member.lastActiveAt,
            createdAt: member.createdAt,
            updatedAt: member.updatedAt,
            user: member.user,
            jobsPosted: member._count.postedJobs
        }))

        return {
            success: true,
            data: teamMembers,
            isHead: currentMember.role === "FOUNDER",
        }
    } catch (error) {
        console.error("Get team members error:", error)
        return { success: false, error: "Failed to fetch team members" }
    }
}

/**
 * Get a single team member by ID
 */
export async function getTeamMember(memberId: string) {
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

        const member = await prisma.companyMember.findFirst({
            where: {
                id: memberId,
                companyId: currentMember.companyId,
            },
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
                        postedJobs: true
                    }
                }
            }
        })

        if (!member) {
            return { success: false, error: "Member not found" }
        }

        const teamMember: TeamMember = {
            id: member.id,
            userId: member.userId,
            companyId: member.companyId,
            role: member.role as CompanyMemberRole,
            jobTitle: member.jobTitle as CompanyMemberJobTitle,
            jobTitleCustom: member.jobTitleCustom,
            displayName: member.displayName,
            email: member.email,
            phone: member.phone,
            permissions: parsePermissions(member.permissions),
            inviteStatus: member.inviteStatus as MemberInviteStatus,
            isActive: member.isActive,
            lastActiveAt: member.lastActiveAt,
            createdAt: member.createdAt,
            updatedAt: member.updatedAt,
            user: member.user,
            jobsPosted: member._count.postedJobs
        }

        return {
            success: true,
            data: teamMember,
            isHead: currentMember.role === "FOUNDER",
        }
    } catch (error) {
        console.error("Get team member error:", error)
        return { success: false, error: "Failed to fetch team member" }
    }
}

// ============================================
// TEAM MEMBER UPDATE ACTIONS (HEAD ONLY)
// ============================================

/**
 * Update a team member's role and permissions
 */
export async function updateTeamMember(memberId: string, payload: UpdateTeamMemberPayload) {
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
            return { success: false, error: "Only HEAD can update team members" }
        }

        const targetMember = await prisma.companyMember.findFirst({
            where: {
                id: memberId,
                companyId: currentMember.companyId,
            },
        })

        if (!targetMember) {
            return { success: false, error: "Member not found" }
        }

        if (targetMember.id === currentMember.id && payload.role && payload.role !== "FOUNDER") {
            return { success: false, error: "Cannot demote yourself" }
        }

        const updateData: Record<string, unknown> = {}
        if (payload.role !== undefined) updateData.role = payload.role
        if (payload.jobTitle !== undefined) updateData.jobTitle = payload.jobTitle
        if (payload.jobTitleCustom !== undefined) updateData.jobTitleCustom = payload.jobTitleCustom
        if (payload.isActive !== undefined) updateData.isActive = payload.isActive
        if (payload.permissions !== undefined) {
            updateData.permissions = JSON.stringify(payload.permissions)
        }

        if (Object.keys(updateData).length > 0) {
            await prisma.companyMember.update({
                where: { id: memberId },
                data: updateData,
            })
        }

        revalidatePath("/team")
        return { success: true, message: "Team member updated successfully" }
    } catch (error) {
        console.error("Update team member error:", error)
        return { success: false, error: "Failed to update team member" }
    }
}

/**
 * Update member role (simplified version)
 */
export async function updateMemberRole(memberId: string, newRole: CompanyMemberRole) {
    try {
        const currentMember = await getUserCompany()
        if (!currentMember) return { success: false, error: "Unauthorized" }

        if (currentMember.role !== "FOUNDER") {
            return { success: false, error: "Only team heads can change roles" }
        }

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

/**
 * Deactivate a team member (soft delete)
 */
export async function deactivateTeamMember(memberId: string) {
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
            return { success: false, error: "Only HEAD can deactivate team members" }
        }

        if (currentMember.id === memberId) {
            return { success: false, error: "Cannot deactivate yourself" }
        }

        const targetMember = await prisma.companyMember.findFirst({
            where: {
                id: memberId,
                companyId: currentMember.companyId,
            },
        })

        if (!targetMember) {
            return { success: false, error: "Member not found" }
        }

        await prisma.companyMember.update({
            where: { id: memberId },
            data: { isActive: false },
        })

        revalidatePath("/team")
        return { success: true, message: "Team member deactivated" }
    } catch (error) {
        console.error("Deactivate team member error:", error)
        return { success: false, error: "Failed to deactivate team member" }
    }
}

/**
 * Reactivate a team member
 */
export async function reactivateTeamMember(memberId: string) {
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

        if (currentMember.role !== "FOUNDER") {
            return { success: false, error: "Only HEAD can reactivate team members" }
        }

        const targetMember = await prisma.companyMember.findFirst({
            where: {
                id: memberId,
                companyId: currentMember.companyId,
            },
        })

        if (!targetMember) {
            return { success: false, error: "Member not found" }
        }

        await prisma.companyMember.update({
            where: { id: memberId },
            data: { isActive: true },
        })

        revalidatePath("/team")
        return { success: true, message: "Team member reactivated" }
    } catch (error) {
        console.error("Reactivate team member error:", error)
        return { success: false, error: "Failed to reactivate team member" }
    }
}

/**
 * Remove team member (hard delete)
 */
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

// ============================================
// TEAM STATS
// ============================================

/**
 * Get team statistics
 */
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
