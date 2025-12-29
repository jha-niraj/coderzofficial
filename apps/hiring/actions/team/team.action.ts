"use server"

import { prisma } from "@repo/prisma";
import { auth } from "@repo/auth";
import type {
    Permission, TeamMember, UpdateTeamMemberPayload, InviteTeamMemberPayload, 
    CompanyMemberRole, CompanyMemberJobTitle, MemberInviteStatus
} from "@/types";

// ============================================
// TEAM MEMBER FETCHING ACTIONS
// ============================================

/**
 * Get all team members of the current user's company
 */
export async function getTeamMembers() {
    const session = await auth();

    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        // Get user's company
        const currentMember = await prisma.companyMember.findFirst({
            where: { userId: session.user.id },
            select: { companyId: true, role: true },
        });

        if (!currentMember) {
            return { success: false, error: "Not a member of any company" };
        }

        // Fetch all members
        const members = await prisma.companyMember.findMany({
            where: { companyId: currentMember.companyId },
            orderBy: [
                { role: "asc" }, // HEAD first
                { createdAt: "asc" },
            ],
        });

        // Transform to TeamMember type
        const teamMembers: TeamMember[] = members.map((member) => {
            // Parse permissions
            let permissions: Permission[] = [];
            if (member.permissions) {
                try {
                    const parsed = typeof member.permissions === "string"
                        ? JSON.parse(member.permissions)
                        : member.permissions;
                    if (Array.isArray(parsed)) {
                        permissions = parsed as Permission[];
                    }
                } catch {
                    permissions = [];
                }
            }

            return {
                id: member.id,
                userId: member.userId,
                companyId: member.companyId,
                role: member.role as CompanyMemberRole,
                jobTitle: member.jobTitle as CompanyMemberJobTitle,
                jobTitleCustom: member.jobTitleCustom,
                displayName: member.displayName,
                email: member.email,
                phone: member.phone,
                permissions,
                inviteStatus: member.inviteStatus as MemberInviteStatus,
                isActive: member.isActive,
                lastActiveAt: member.lastActiveAt,
                createdAt: member.createdAt,
                updatedAt: member.updatedAt,
            };
        });

        return {
            success: true,
            data: teamMembers,
            isHead: currentMember.role === "HEAD",
        };
    } catch (error) {
        console.error("Get team members error:", error);
        return { success: false, error: "Failed to fetch team members" };
    }
}

/**
 * Get a single team member by ID
 */
export async function getTeamMember(memberId: string) {
    const session = await auth();

    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const currentMember = await prisma.companyMember.findFirst({
            where: { userId: session.user.id },
            select: { companyId: true, role: true },
        });

        if (!currentMember) {
            return { success: false, error: "Not a member of any company" };
        }

        const member = await prisma.companyMember.findFirst({
            where: {
                id: memberId,
                companyId: currentMember.companyId,
            },
        });

        if (!member) {
            return { success: false, error: "Member not found" };
        }

        // Parse permissions
        let permissions: Permission[] = [];
        if (member.permissions) {
            try {
                const parsed = typeof member.permissions === "string"
                    ? JSON.parse(member.permissions)
                    : member.permissions;
                if (Array.isArray(parsed)) {
                    permissions = parsed as Permission[];
                }
            } catch {
                permissions = [];
            }
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
            permissions,
            inviteStatus: member.inviteStatus as MemberInviteStatus,
            isActive: member.isActive,
            lastActiveAt: member.lastActiveAt,
            createdAt: member.createdAt,
            updatedAt: member.updatedAt,
        };

        return {
            success: true,
            data: teamMember,
            isHead: currentMember.role === "HEAD",
        };
    } catch (error) {
        console.error("Get team member error:", error);
        return { success: false, error: "Failed to fetch team member" };
    }
}

// ============================================
// TEAM MEMBER UPDATE ACTIONS (HEAD ONLY)
// ============================================

/**
 * Update a team member's role and permissions
 */
export async function updateTeamMember(memberId: string, payload: UpdateTeamMemberPayload) {
    const session = await auth();

    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        // Check if user is HEAD
        const currentMember = await prisma.companyMember.findFirst({
            where: { userId: session.user.id },
            select: { id: true, companyId: true, role: true },
        });

        if (!currentMember) {
            return { success: false, error: "Not a member of any company" };
        }

        if (currentMember.role !== "HEAD") {
            return { success: false, error: "Only HEAD can update team members" };
        }

        // Check if target member exists in same company
        const targetMember = await prisma.companyMember.findFirst({
            where: {
                id: memberId,
                companyId: currentMember.companyId,
            },
        });

        if (!targetMember) {
            return { success: false, error: "Member not found" };
        }

        // Prevent changing own role (prevents lockout)
        if (targetMember.id === currentMember.id && payload.role && payload.role !== "HEAD") {
            return { success: false, error: "Cannot demote yourself" };
        }

        // Build update data
        const updateData: Record<string, unknown> = {};
        if (payload.role !== undefined) updateData.role = payload.role;
        if (payload.jobTitle !== undefined) updateData.jobTitle = payload.jobTitle;
        if (payload.jobTitleCustom !== undefined) updateData.jobTitleCustom = payload.jobTitleCustom;
        if (payload.isActive !== undefined) updateData.isActive = payload.isActive;
        if (payload.permissions !== undefined) {
            updateData.permissions = JSON.stringify(payload.permissions);
        }

        if (Object.keys(updateData).length > 0) {
            await prisma.companyMember.update({
                where: { id: memberId },
                data: updateData,
            });
        }

        return { success: true, message: "Team member updated successfully" };
    } catch (error) {
        console.error("Update team member error:", error);
        return { success: false, error: "Failed to update team member" };
    }
}

/**
 * Deactivate a team member (soft delete)
 */
export async function deactivateTeamMember(memberId: string) {
    const session = await auth();

    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        // Check if user is HEAD
        const currentMember = await prisma.companyMember.findFirst({
            where: { userId: session.user.id },
            select: { id: true, companyId: true, role: true },
        });

        if (!currentMember) {
            return { success: false, error: "Not a member of any company" };
        }

        if (currentMember.role !== "HEAD") {
            return { success: false, error: "Only HEAD can deactivate team members" };
        }

        // Cannot deactivate self
        if (currentMember.id === memberId) {
            return { success: false, error: "Cannot deactivate yourself" };
        }

        // Check if target member exists in same company
        const targetMember = await prisma.companyMember.findFirst({
            where: {
                id: memberId,
                companyId: currentMember.companyId,
            },
        });

        if (!targetMember) {
            return { success: false, error: "Member not found" };
        }

        await prisma.companyMember.update({
            where: { id: memberId },
            data: { isActive: false },
        });

        return { success: true, message: "Team member deactivated" };
    } catch (error) {
        console.error("Deactivate team member error:", error);
        return { success: false, error: "Failed to deactivate team member" };
    }
}

/**
 * Reactivate a team member
 */
export async function reactivateTeamMember(memberId: string) {
    const session = await auth();

    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const currentMember = await prisma.companyMember.findFirst({
            where: { userId: session.user.id },
            select: { companyId: true, role: true },
        });

        if (!currentMember) {
            return { success: false, error: "Not a member of any company" };
        }

        if (currentMember.role !== "HEAD") {
            return { success: false, error: "Only HEAD can reactivate team members" };
        }

        const targetMember = await prisma.companyMember.findFirst({
            where: {
                id: memberId,
                companyId: currentMember.companyId,
            },
        });

        if (!targetMember) {
            return { success: false, error: "Member not found" };
        }

        await prisma.companyMember.update({
            where: { id: memberId },
            data: { isActive: true },
        });

        return { success: true, message: "Team member reactivated" };
    } catch (error) {
        console.error("Reactivate team member error:", error);
        return { success: false, error: "Failed to reactivate team member" };
    }
}

// ============================================
// TEAM INVITATION ACTIONS (HEAD ONLY)
// ============================================

/**
 * Invite a new team member
 */
export async function inviteTeamMember(payload: InviteTeamMemberPayload) {
    const session = await auth();

    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        // Check if user is HEAD
        const currentMember = await prisma.companyMember.findFirst({
            where: { userId: session.user.id },
            select: { id: true, companyId: true, role: true },
        });

        if (!currentMember) {
            return { success: false, error: "Not a member of any company" };
        }

        if (currentMember.role !== "HEAD") {
            return { success: false, error: "Only HEAD can invite team members" };
        }

        // Check if email already exists in company
        const existingMember = await prisma.companyMember.findFirst({
            where: {
                companyId: currentMember.companyId,
                email: payload.email,
            },
        });

        if (existingMember) {
            return { success: false, error: "This email is already a team member" };
        }

        // Check for existing pending invitation
        const existingInvite = await prisma.memberInvitation.findFirst({
            where: {
                companyId: currentMember.companyId,
                email: payload.email,
                status: "PENDING",
            },
        });

        if (existingInvite) {
            return { success: false, error: "An invitation is already pending for this email" };
        }

        // Generate invite code
        const inviteCode = Math.random().toString(36).substring(2, 10) +
            Math.random().toString(36).substring(2, 10);

        // Create invitation
        await prisma.memberInvitation.create({
            data: {
                companyId: currentMember.companyId,
                email: payload.email,
                name: payload.name || null,
                role: payload.role,
                jobTitle: payload.jobTitle,
                inviteCode,
                invitedById: currentMember.id,
                status: "PENDING",
                message: payload.message || null,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
            },
        });

        // TODO: Send invitation email

        return { success: true, message: "Invitation sent successfully", inviteCode };
    } catch (error) {
        console.error("Invite team member error:", error);
        return { success: false, error: "Failed to send invitation" };
    }
}

/**
 * Revoke a pending invitation
 */
export async function revokeInvitation(inviteId: string) {
    const session = await auth();

    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const currentMember = await prisma.companyMember.findFirst({
            where: { userId: session.user.id },
            select: { companyId: true, role: true },
        });

        if (!currentMember) {
            return { success: false, error: "Not a member of any company" };
        }

        if (currentMember.role !== "HEAD") {
            return { success: false, error: "Only HEAD can revoke invitations" };
        }

        const invitation = await prisma.memberInvitation.findFirst({
            where: {
                id: inviteId,
                companyId: currentMember.companyId,
                status: "PENDING",
            },
        });

        if (!invitation) {
            return { success: false, error: "Invitation not found" };
        }

        await prisma.memberInvitation.update({
            where: { id: inviteId },
            data: { status: "REVOKED" },
        });

        return { success: true, message: "Invitation revoked" };
    } catch (error) {
        console.error("Revoke invitation error:", error);
        return { success: false, error: "Failed to revoke invitation" };
    }
}

/**
 * Get all pending invitations for the company
 */
export async function getPendingInvitations() {
    const session = await auth();

    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const currentMember = await prisma.companyMember.findFirst({
            where: { userId: session.user.id },
            select: { companyId: true, role: true },
        });

        if (!currentMember) {
            return { success: false, error: "Not a member of any company" };
        }

        if (currentMember.role !== "HEAD") {
            return { success: false, error: "Only HEAD can view invitations" };
        }

        const invitations = await prisma.memberInvitation.findMany({
            where: {
                companyId: currentMember.companyId,
                status: "PENDING",
            },
            orderBy: { createdAt: "desc" },
        });

        return { success: true, data: invitations };
    } catch (error) {
        console.error("Get invitations error:", error);
        return { success: false, error: "Failed to fetch invitations" };
    }
}
