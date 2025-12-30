"use server"

import { prisma } from "@repo/prisma";
import { auth } from "@repo/auth";
import type {
    UniversityPermission, TeamMember, UpdateTeamMemberPayload, InviteTeamMemberPayload,
    UniversityMemberRole, UniversityMemberJobTitle, MemberInviteStatus, Department
} from "@/types";

// ============================================
// TEAM MEMBER FETCHING ACTIONS
// ============================================

/**
 * Get all team members of the current user's university
 */
export async function getTeamMembers() {
    const session = await auth();

    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        // Get user's university
        const currentMember = await prisma.universityMember.findFirst({
            where: { userId: session.user.id },
            select: { universityId: true, role: true },
        });

        if (!currentMember) {
            return { success: false, error: "Not a member of any university" };
        }

        // Fetch all members
        const members = await prisma.universityMember.findMany({
            where: { universityId: currentMember.universityId },
            include: {
                department: {
                    select: {
                        id: true,
                        name: true,
                        code: true,
                    },
                },
            },
            orderBy: [
                { role: "asc" }, // HEAD first
                { createdAt: "asc" },
            ],
        });

        // Transform to TeamMember type
        const teamMembers: TeamMember[] = members.map((member) => {
            // Parse permissions
            let permissions: UniversityPermission[] = [];
            if (member.permissions) {
                try {
                    const parsed = typeof member.permissions === "string"
                        ? JSON.parse(member.permissions)
                        : member.permissions;
                    if (Array.isArray(parsed)) {
                        permissions = parsed as UniversityPermission[];
                    }
                } catch {
                    permissions = [];
                }
            }

            return {
                id: member.id,
                userId: member.userId,
                universityId: member.universityId,
                departmentId: member.departmentId,
                role: member.role as UniversityMemberRole,
                jobTitle: member.jobTitle as UniversityMemberJobTitle,
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
                department: member.department,
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
        const currentMember = await prisma.universityMember.findFirst({
            where: { userId: session.user.id },
            select: { universityId: true, role: true },
        });

        if (!currentMember) {
            return { success: false, error: "Not a member of any university" };
        }

        const member = await prisma.universityMember.findFirst({
            where: {
                id: memberId,
                universityId: currentMember.universityId,
            },
            include: {
                department: {
                    select: {
                        id: true,
                        name: true,
                        code: true,
                    },
                },
            },
        });

        if (!member) {
            return { success: false, error: "Member not found" };
        }

        // Parse permissions
        let permissions: UniversityPermission[] = [];
        if (member.permissions) {
            try {
                const parsed = typeof member.permissions === "string"
                    ? JSON.parse(member.permissions)
                    : member.permissions;
                if (Array.isArray(parsed)) {
                    permissions = parsed as UniversityPermission[];
                }
            } catch {
                permissions = [];
            }
        }

        const teamMember: TeamMember = {
            id: member.id,
            userId: member.userId,
            universityId: member.universityId,
            departmentId: member.departmentId,
            role: member.role as UniversityMemberRole,
            jobTitle: member.jobTitle as UniversityMemberJobTitle,
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
            department: member.department,
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

/**
 * Get all departments in the university
 */
export async function getDepartments() {
    const session = await auth();

    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const currentMember = await prisma.universityMember.findFirst({
            where: { userId: session.user.id },
            select: { universityId: true },
        });

        if (!currentMember) {
            return { success: false, error: "Not a member of any university" };
        }

        const departments = await prisma.department.findMany({
            where: { universityId: currentMember.universityId },
            orderBy: { name: "asc" },
        });

        const deptList: Department[] = departments.map((dept) => ({
            id: dept.id,
            universityId: dept.universityId,
            name: dept.name,
            code: dept.code,
            description: dept.description,
            headUserId: dept.headUserId,
            createdAt: dept.createdAt,
            updatedAt: dept.updatedAt,
        }));

        return { success: true, data: deptList };
    } catch (error) {
        console.error("Get departments error:", error);
        return { success: false, error: "Failed to fetch departments" };
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
        const currentMember = await prisma.universityMember.findFirst({
            where: { userId: session.user.id },
            select: { id: true, universityId: true, role: true },
        });

        if (!currentMember) {
            return { success: false, error: "Not a member of any university" };
        }

        if (currentMember.role !== "HEAD") {
            return { success: false, error: "Only HEAD can update team members" };
        }

        // Check if target member exists in same university
        const targetMember = await prisma.universityMember.findFirst({
            where: {
                id: memberId,
                universityId: currentMember.universityId,
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
        if (payload.departmentId !== undefined) updateData.departmentId = payload.departmentId;
        if (payload.isActive !== undefined) updateData.isActive = payload.isActive;
        if (payload.permissions !== undefined) {
            updateData.permissions = JSON.stringify(payload.permissions);
        }

        if (Object.keys(updateData).length > 0) {
            await prisma.universityMember.update({
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
        const currentMember = await prisma.universityMember.findFirst({
            where: { userId: session.user.id },
            select: { id: true, universityId: true, role: true },
        });

        if (!currentMember) {
            return { success: false, error: "Not a member of any university" };
        }

        if (currentMember.role !== "HEAD") {
            return { success: false, error: "Only HEAD can deactivate team members" };
        }

        // Cannot deactivate self
        if (currentMember.id === memberId) {
            return { success: false, error: "Cannot deactivate yourself" };
        }

        // Check if target member exists in same university
        const targetMember = await prisma.universityMember.findFirst({
            where: {
                id: memberId,
                universityId: currentMember.universityId,
            },
        });

        if (!targetMember) {
            return { success: false, error: "Member not found" };
        }

        await prisma.universityMember.update({
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
        const currentMember = await prisma.universityMember.findFirst({
            where: { userId: session.user.id },
            select: { universityId: true, role: true },
        });

        if (!currentMember) {
            return { success: false, error: "Not a member of any university" };
        }

        if (currentMember.role !== "HEAD") {
            return { success: false, error: "Only HEAD can reactivate team members" };
        }

        const targetMember = await prisma.universityMember.findFirst({
            where: {
                id: memberId,
                universityId: currentMember.universityId,
            },
        });

        if (!targetMember) {
            return { success: false, error: "Member not found" };
        }

        await prisma.universityMember.update({
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
        const currentMember = await prisma.universityMember.findFirst({
            where: { userId: session.user.id },
            select: { id: true, universityId: true, role: true },
        });

        if (!currentMember) {
            return { success: false, error: "Not a member of any university" };
        }

        if (currentMember.role !== "HEAD") {
            return { success: false, error: "Only HEAD can invite team members" };
        }

        // Check if email already exists in university
        const existingMember = await prisma.universityMember.findFirst({
            where: {
                universityId: currentMember.universityId,
                email: payload.email,
            },
        });

        if (existingMember) {
            return { success: false, error: "This email is already a team member" };
        }

        // Check for existing pending invitation
        const existingInvite = await prisma.universityMemberInvitation.findFirst({
            where: {
                universityId: currentMember.universityId,
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
        await prisma.universityMemberInvitation.create({
            data: {
                universityId: currentMember.universityId,
                email: payload.email,
                name: payload.name || null,
                role: payload.role,
                jobTitle: payload.jobTitle,
                departmentId: payload.departmentId || null,
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
        const currentMember = await prisma.universityMember.findFirst({
            where: { userId: session.user.id },
            select: { universityId: true, role: true },
        });

        if (!currentMember) {
            return { success: false, error: "Not a member of any university" };
        }

        if (currentMember.role !== "HEAD") {
            return { success: false, error: "Only HEAD can revoke invitations" };
        }

        const invitation = await prisma.universityMemberInvitation.findFirst({
            where: {
                id: inviteId,
                universityId: currentMember.universityId,
                status: "PENDING",
            },
        });

        if (!invitation) {
            return { success: false, error: "Invitation not found" };
        }

        await prisma.universityMemberInvitation.update({
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
 * Get all pending invitations for the university
 */
export async function getPendingInvitations() {
    const session = await auth();

    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const currentMember = await prisma.universityMember.findFirst({
            where: { userId: session.user.id },
            select: { universityId: true, role: true },
        });

        if (!currentMember) {
            return { success: false, error: "Not a member of any university" };
        }

        if (currentMember.role !== "HEAD") {
            return { success: false, error: "Only HEAD can view invitations" };
        }

        const invitations = await prisma.universityMemberInvitation.findMany({
            where: {
                universityId: currentMember.universityId,
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
