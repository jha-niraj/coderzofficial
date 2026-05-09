"use server"

import { db, users, universityMembers, departments, universityMemberInvitations } from "@repo/db"
import { eq, and, desc, asc } from "drizzle-orm"
import { getSession } from "@repo/auth"
import { headers } from "next/headers"
import bcrypt from "bcryptjs";
import { sendUniEmail } from "@/lib/emails/uniemail";
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
    const session = await getSession(headers());

    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        // Get user's university
        const currentMember = await db.query.universityMembers.findFirst({
            where: eq(universityMembers.userId, session.user.id),
            columns: { universityId: true, role: true },
        });

        if (!currentMember) {
            return { success: false, error: "Not a member of any university" };
        }

        // Fetch all members with department
        const members = await db.query.universityMembers.findMany({
            where: eq(universityMembers.universityId, currentMember.universityId),
            with: {
                department: {
                    columns: { id: true, name: true, code: true },
                },
            },
            orderBy: [asc(universityMembers.role), asc(universityMembers.createdAt)],
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
    const session = await getSession(headers());

    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const currentMember = await db.query.universityMembers.findFirst({
            where: eq(universityMembers.userId, session.user.id),
            columns: { universityId: true, role: true },
        });

        if (!currentMember) {
            return { success: false, error: "Not a member of any university" };
        }

        const member = await db.query.universityMembers.findFirst({
            where: and(
                eq(universityMembers.id, memberId),
                eq(universityMembers.universityId, currentMember.universityId),
            ),
            with: {
                department: {
                    columns: { id: true, name: true, code: true },
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
    const session = await getSession(headers());

    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const currentMember = await db.query.universityMembers.findFirst({
            where: eq(universityMembers.userId, session.user.id),
            columns: { universityId: true },
        });

        if (!currentMember) {
            return { success: false, error: "Not a member of any university" };
        }

        const deptRows = await db.query.departments.findMany({
            where: eq(departments.universityId, currentMember.universityId),
            orderBy: asc(departments.name),
        });

        const deptList: Department[] = deptRows.map((dept) => ({
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
    const session = await getSession(headers());

    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        // Check if user is HEAD
        const currentMember = await db.query.universityMembers.findFirst({
            where: eq(universityMembers.userId, session.user.id),
            columns: { id: true, universityId: true, role: true },
        });

        if (!currentMember) {
            return { success: false, error: "Not a member of any university" };
        }

        if (currentMember.role !== "HEAD") {
            return { success: false, error: "Only HEAD can update team members" };
        }

        // Check if target member exists in same university
        const targetMember = await db.query.universityMembers.findFirst({
            where: and(
                eq(universityMembers.id, memberId),
                eq(universityMembers.universityId, currentMember.universityId),
            ),
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
            await db.update(universityMembers).set(updateData).where(eq(universityMembers.id, memberId));
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
    const session = await getSession(headers());

    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        // Check if user is HEAD
        const currentMember = await db.query.universityMembers.findFirst({
            where: eq(universityMembers.userId, session.user.id),
            columns: { id: true, universityId: true, role: true },
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
        const targetMember = await db.query.universityMembers.findFirst({
            where: and(
                eq(universityMembers.id, memberId),
                eq(universityMembers.universityId, currentMember.universityId),
            ),
        });

        if (!targetMember) {
            return { success: false, error: "Member not found" };
        }

        await db.update(universityMembers).set({ isActive: false }).where(eq(universityMembers.id, memberId));

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
    const session = await getSession(headers());

    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const currentMember = await db.query.universityMembers.findFirst({
            where: eq(universityMembers.userId, session.user.id),
            columns: { universityId: true, role: true },
        });

        if (!currentMember) {
            return { success: false, error: "Not a member of any university" };
        }

        if (currentMember.role !== "HEAD") {
            return { success: false, error: "Only HEAD can reactivate team members" };
        }

        const targetMember = await db.query.universityMembers.findFirst({
            where: and(
                eq(universityMembers.id, memberId),
                eq(universityMembers.universityId, currentMember.universityId),
            ),
        });

        if (!targetMember) {
            return { success: false, error: "Member not found" };
        }

        await db.update(universityMembers).set({ isActive: true }).where(eq(universityMembers.id, memberId));

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
    const session = await getSession(headers());

    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        // Check if user is HEAD
        const currentMember = await db.query.universityMembers.findFirst({
            where: eq(universityMembers.userId, session.user.id),
            columns: { id: true, universityId: true, role: true },
        });

        if (!currentMember) {
            return { success: false, error: "Not a member of any university" };
        }

        if (currentMember.role !== "HEAD") {
            return { success: false, error: "Only HEAD can invite team members" };
        }

        // Check if email already exists in university
        const existingMember = await db.query.universityMembers.findFirst({
            where: and(
                eq(universityMembers.universityId, currentMember.universityId),
                eq(universityMembers.email, payload.email),
            ),
        });

        if (existingMember) {
            return { success: false, error: "This email is already a team member" };
        }

        // Check for existing pending invitation
        const existingInvite = await db.query.universityMemberInvitations.findFirst({
            where: and(
                eq(universityMemberInvitations.universityId, currentMember.universityId),
                eq(universityMemberInvitations.email, payload.email),
                eq(universityMemberInvitations.status, "PENDING"),
            ),
        });

        if (existingInvite) {
            return { success: false, error: "An invitation is already pending for this email" };
        }

        // Generate invite code
        const inviteCode = Math.random().toString(36).substring(2, 10) +
            Math.random().toString(36).substring(2, 10);

        // Create invitation
        await db.insert(universityMemberInvitations).values({
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
        });

        const inviteUrl = `${process.env.NEXT_PUBLIC_UNI_URL || "http://localhost:3001"}/invite?code=${inviteCode}`
        try {
            const university = await db.query.universityMembers.findFirst({
                where: eq(universityMembers.id, currentMember.id),
                with: { university: true },
            });
            await sendUniEmail({
                email: payload.email,
                emailType: "MEMBER_INVITATION",
                universityName: university?.university?.name || "your university",
                roleName: payload.role,
                inviterName: session.user.name || session.user.email || undefined,
                inviteUrl,
                message: payload.message ?? undefined,
            });
        } catch (emailError) {
            console.error("Failed to send invitation email:", emailError);
        }

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
    const session = await getSession(headers());

    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const currentMember = await db.query.universityMembers.findFirst({
            where: eq(universityMembers.userId, session.user.id),
            columns: { universityId: true, role: true },
        });

        if (!currentMember) {
            return { success: false, error: "Not a member of any university" };
        }

        if (currentMember.role !== "HEAD") {
            return { success: false, error: "Only HEAD can revoke invitations" };
        }

        const invitation = await db.query.universityMemberInvitations.findFirst({
            where: and(
                eq(universityMemberInvitations.id, inviteId),
                eq(universityMemberInvitations.universityId, currentMember.universityId),
                eq(universityMemberInvitations.status, "PENDING"),
            ),
        });

        if (!invitation) {
            return { success: false, error: "Invitation not found" };
        }

        await db.update(universityMemberInvitations).set({ status: "REVOKED" }).where(eq(universityMemberInvitations.id, inviteId));

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
    const session = await getSession(headers());

    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const currentMember = await db.query.universityMembers.findFirst({
            where: eq(universityMembers.userId, session.user.id),
            columns: { universityId: true, role: true },
        });

        if (!currentMember) {
            return { success: false, error: "Not a member of any university" };
        }

        if (currentMember.role !== "HEAD") {
            return { success: false, error: "Only HEAD can view invitations" };
        }

        const invitations = await db.query.universityMemberInvitations.findMany({
            where: and(
                eq(universityMemberInvitations.universityId, currentMember.universityId),
                eq(universityMemberInvitations.status, "PENDING"),
            ),
            orderBy: desc(universityMemberInvitations.createdAt),
        });

        return { success: true, data: invitations };
    } catch (error) {
        console.error("Get invitations error:", error);
        return { success: false, error: "Failed to fetch invitations" };
    }
}

// ============================================
// TYPES FOR DIRECT TEACHER CREATION
// ============================================

interface InviteTeacherWithCredentialsPayload {
    email: string;
    name: string;
    role: UniversityMemberRole;
    jobTitle: UniversityMemberJobTitle;
    departmentId?: string;
    permissions?: UniversityPermission[];
}

// Default permissions for FACULTY role
const DEFAULT_FACULTY_PERMISSIONS: UniversityPermission[] = [
    "view_classes",
    "create_assignments",
    "edit_assignments",
    "grade_submissions",
    "view_students",
];

// Default permissions for DEPARTMENT_HEAD role
const DEFAULT_DEPARTMENT_HEAD_PERMISSIONS: UniversityPermission[] = [
    "view_classes",
    "create_classes",
    "edit_classes",
    "create_assignments",
    "edit_assignments",
    "delete_assignments",
    "grade_submissions",
    "view_students",
    "manage_departments",
];

// Role display mapping
const ROLE_LABELS: Record<UniversityMemberRole, string> = {
    HEAD: "University Admin",
    DEPARTMENT_HEAD: "Department Head",
    PLACEMENT_OFFICER: "Placement Officer",
    FINANCE_OFFICER: "Finance Officer",
    FACULTY: "Faculty",
    TEACHING_ASSISTANT: "Teaching Assistant",
};

/**
 * Generate a random temporary password
 */
function generateTemporaryPassword(): string {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
    let password = "";
    for (let i = 0; i < 12; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
}

/**
 * Invite a teacher/faculty member with temporary credentials
 */
export async function inviteTeacherWithCredentials(payload: InviteTeacherWithCredentialsPayload) {
    const session = await getSession(headers());

    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        // Check if user is HEAD
        const currentMember = await db.query.universityMembers.findFirst({
            where: eq(universityMembers.userId, session.user.id),
            with: {
                university: { columns: { id: true, name: true } },
            },
        });

        if (!currentMember) {
            return { success: false, error: "Not a member of any university" };
        }

        if (currentMember.role !== "HEAD") {
            return { success: false, error: "Only HEAD can invite team members" };
        }

        // Check if a user already exists with this email
        const existingUser = await db.query.users.findFirst({
            where: eq(users.email, payload.email),
        });

        if (existingUser) {
            // Check if they're already a member of this university
            const existingMember = await db.query.universityMembers.findFirst({
                where: and(
                    eq(universityMembers.userId, existingUser.id),
                    eq(universityMembers.universityId, currentMember.universityId),
                ),
            });

            if (existingMember) {
                return { success: false, error: "This user is already a team member of this university" };
            }

            return { success: false, error: "A user with this email already exists. They can request to join your university through the normal flow." };
        }

        // Check if email is already in university members
        const existingMemberEmail = await db.query.universityMembers.findFirst({
            where: and(
                eq(universityMembers.universityId, currentMember.universityId),
                eq(universityMembers.email, payload.email),
            ),
        });

        if (existingMemberEmail) {
            return { success: false, error: "This email is already associated with a team member" };
        }

        // Generate temporary password
        const temporaryPassword = generateTemporaryPassword();
        const hashedPassword = await bcrypt.hash(temporaryPassword, 12);

        // Determine permissions based on role if not provided
        let permissions = payload.permissions;
        if (!permissions || permissions.length === 0) {
            if (payload.role === "FACULTY" || payload.role === "TEACHING_ASSISTANT") {
                permissions = DEFAULT_FACULTY_PERMISSIONS;
            } else if (payload.role === "DEPARTMENT_HEAD") {
                permissions = DEFAULT_DEPARTMENT_HEAD_PERMISSIONS;
            } else {
                permissions = DEFAULT_FACULTY_PERMISSIONS;
            }
        }

        // Create user and university member in a transaction
        const result = await db.transaction(async (tx) => {
            // Create the user with UNI role and temporary password
            const newUserRows = await tx.insert(users).values({
                email: payload.email,
                name: payload.name,
                role: "UNI",
                hashedPassword: hashedPassword,
                emailVerified: true,
                onboardingCompleted: true,
                mustChangePassword: true,
            }).returning();

            const newUser = newUserRows[0];
            if (!newUser) {
                throw new Error("Failed to create user");
            }

            // Create the university member
            const newMemberRows = await tx.insert(universityMembers).values({
                userId: newUser.id,
                universityId: currentMember.universityId,
                email: payload.email,
                displayName: payload.name,
                role: payload.role,
                jobTitle: payload.jobTitle,
                departmentId: payload.departmentId || null,
                inviteStatus: "ACCEPTED",
                acceptedAt: new Date(),
                permissions: JSON.stringify(permissions),
                isActive: true,
                invitedById: currentMember.id,
            }).returning();

            const newMember = newMemberRows[0];
            if (!newMember) {
                throw new Error("Failed to create university member");
            }

            return { user: newUser, member: newMember };
        });

        // Send email with credentials
        try {
            await sendUniEmail({
                email: payload.email,
                name: payload.name,
                emailType: "TEACHER_CREDENTIALS",
                temporaryPassword: temporaryPassword,
                universityName: currentMember.university.name,
                roleName: ROLE_LABELS[payload.role] || payload.role,
            });
        } catch (emailError) {
            console.error("Failed to send credentials email:", emailError);
        }

        return {
            success: true,
            message: "Teacher account created and credentials sent",
            memberId: result.member.id,
            temporaryPassword: temporaryPassword,
        };
    } catch (error) {
        console.error("Invite teacher with credentials error:", error);
        return { success: false, error: "Failed to create teacher account" };
    }
}
