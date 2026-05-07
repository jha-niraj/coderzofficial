'use server'

import { revalidatePath } from 'next/cache'
import { getSession } from "@repo/auth";
import { headers } from "next/headers";
import {
    db,
    users,
    projectsV2,
    projectV2Members,
    projectV2Invitations,
} from "@repo/db";
import { eq, and, or } from "drizzle-orm";

// ============================================================================
// Helper Functions
// ============================================================================

async function getCurrentUser() {
    const session = await getSession(headers());
    if (!session?.user?.email) throw new Error('Not authenticated')
    const [user] = await db.select().from(users).where(eq(users.email, session.user.email));
    if (!user) throw new Error('User not found')
    return user
}

// ============================================================================
// Types
// ============================================================================

interface ActionResult<T = void> {
    success: boolean
    data?: T
    error?: string
}

// ============================================================================
// Team Member Actions
// ============================================================================

/**
 * Invite a user to a project by email
 */
export async function inviteToProject(
    projectId: string,
    email: string,
    role: 'ADMIN' | 'MEMBER' = 'MEMBER'
): Promise<ActionResult<{ invitationId: string }>> {
    try {
        const user = await getCurrentUser()

        const project = await db.query.projectsV2.findFirst({
            where: eq(projectsV2.id, projectId),
            with: {
                members: {
                    where: eq(projectV2Members.userId, user.id)
                }
            }
        });

        if (!project) {
            return { success: false, error: 'Project not found' }
        }

        const isCreator = project.createdBy === user.id
        const isAdmin = project.members?.some((m: any) => m.role === 'ADMIN')

        if (!isCreator && !isAdmin) {
            return { success: false, error: 'You do not have permission to invite members' }
        }

        const invitedUser = await db.query.users.findFirst({
            where: eq(users.email, email.toLowerCase())
        });

        if (invitedUser) {
            const existingMember = await db.query.projectV2Members.findFirst({
                where: and(
                    eq(projectV2Members.projectId, projectId),
                    eq(projectV2Members.userId, invitedUser.id)
                )
            });

            if (existingMember) {
                return { success: false, error: 'User is already a member of this project' }
            }
        }

        const existingInvitation = await db.query.projectV2Invitations.findFirst({
            where: and(
                eq(projectV2Invitations.projectId, projectId),
                eq(projectV2Invitations.status, 'PENDING'),
                invitedUser
                    ? or(
                        eq(projectV2Invitations.invitedEmail, email.toLowerCase()),
                        eq(projectV2Invitations.invitedUserId, invitedUser.id)
                    )
                    : eq(projectV2Invitations.invitedEmail, email.toLowerCase())
            )
        });

        if (existingInvitation) {
            return { success: false, error: 'An invitation is already pending for this user' }
        }

        const [invitation] = await db.insert(projectV2Invitations).values({
            projectId,
            invitedEmail: email.toLowerCase(),
            invitedUserId: invitedUser?.id,
            invitedById: user.id,
            role,
            status: 'PENDING',
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }).returning();

        revalidatePath(`/projects/${project.slug}`)

        return { success: true, data: { invitationId: invitation!.id } }
    } catch (error) {
        console.error('Error inviting to project:', error)
        return { success: false, error: 'Failed to send invitation' }
    }
}

/**
 * Accept a project invitation
 */
export async function acceptInvitation(
    invitationId: string
): Promise<ActionResult> {
    try {
        const user = await getCurrentUser()

        const invitation = await db.query.projectV2Invitations.findFirst({
            where: eq(projectV2Invitations.id, invitationId),
            with: { project: true }
        });

        if (!invitation) {
            return { success: false, error: 'Invitation not found' }
        }

        if (invitation.invitedUserId !== user.id &&
            invitation.invitedEmail?.toLowerCase() !== user.email?.toLowerCase()) {
            return { success: false, error: 'This invitation is not for you' }
        }

        if (invitation.status !== 'PENDING') {
            return { success: false, error: 'This invitation has already been processed' }
        }

        if (invitation.expiresAt && new Date() > invitation.expiresAt) {
            await db.update(projectV2Invitations)
                .set({ status: 'EXPIRED' })
                .where(eq(projectV2Invitations.id, invitationId));
            return { success: false, error: 'This invitation has expired' }
        }

        await db.transaction(async (tx) => {
            await tx.insert(projectV2Members).values({
                projectId: invitation.projectId,
                userId: user.id,
                role: invitation.role,
                invitedBy: invitation.invitedById
            });
            await tx.update(projectV2Invitations)
                .set({
                    status: 'ACCEPTED',
                    respondedAt: new Date()
                })
                .where(eq(projectV2Invitations.id, invitationId));
        });

        revalidatePath(`/projects/${invitation.project.slug}`)

        return { success: true }
    } catch (error) {
        console.error('Error accepting invitation:', error)
        return { success: false, error: 'Failed to accept invitation' }
    }
}

/**
 * Decline a project invitation
 */
export async function declineInvitation(
    invitationId: string
): Promise<ActionResult> {
    try {
        const user = await getCurrentUser()

        const invitation = await db.query.projectV2Invitations.findFirst({
            where: eq(projectV2Invitations.id, invitationId)
        });

        if (!invitation) {
            return { success: false, error: 'Invitation not found' }
        }

        if (invitation.invitedUserId !== user.id &&
            invitation.invitedEmail?.toLowerCase() !== user.email?.toLowerCase()) {
            return { success: false, error: 'This invitation is not for you' }
        }

        await db.update(projectV2Invitations)
            .set({
                status: 'DECLINED',
                respondedAt: new Date()
            })
            .where(eq(projectV2Invitations.id, invitationId));

        return { success: true }
    } catch (error) {
        console.error('Error declining invitation:', error)
        return { success: false, error: 'Failed to decline invitation' }
    }
}

/**
 * Cancel a pending invitation (by the inviter)
 */
export async function cancelInvitation(
    invitationId: string
): Promise<ActionResult> {
    try {
        const user = await getCurrentUser()

        const invitation = await db.query.projectV2Invitations.findFirst({
            where: eq(projectV2Invitations.id, invitationId),
            with: { project: true }
        });

        if (!invitation) {
            return { success: false, error: 'Invitation not found' }
        }

        const isCreator = invitation.project.createdBy === user.id
        const isInviter = invitation.invitedById === user.id

        if (!isCreator && !isInviter) {
            return { success: false, error: 'You cannot cancel this invitation' }
        }

        await db.delete(projectV2Invitations).where(eq(projectV2Invitations.id, invitationId));

        revalidatePath(`/projects/${invitation.project.slug}`)

        return { success: true }
    } catch (error) {
        console.error('Error canceling invitation:', error)
        return { success: false, error: 'Failed to cancel invitation' }
    }
}

/**
 * Remove a member from a project
 */
export async function removeMember(
    projectId: string,
    memberId: string
): Promise<ActionResult> {
    try {
        const user = await getCurrentUser()

        const project = await db.query.projectsV2.findFirst({
            where: eq(projectsV2.id, projectId)
        });

        if (!project) {
            return { success: false, error: 'Project not found' }
        }

        if (project.createdBy !== user.id) {
            return { success: false, error: 'Only the project creator can remove members' }
        }

        const member = await db.query.projectV2Members.findFirst({
            where: eq(projectV2Members.id, memberId)
        });

        if (!member || member.projectId !== projectId) {
            return { success: false, error: 'Member not found' }
        }

        if (member.userId === user.id) {
            return { success: false, error: 'You cannot remove yourself from the project' }
        }

        await db.delete(projectV2Members).where(eq(projectV2Members.id, memberId));

        revalidatePath(`/projects/${project.slug}`)

        return { success: true }
    } catch (error) {
        console.error('Error removing member:', error)
        return { success: false, error: 'Failed to remove member' }
    }
}

/**
 * Update a member's role
 */
export async function updateMemberRole(
    memberId: string,
    role: 'ADMIN' | 'MEMBER'
): Promise<ActionResult> {
    try {
        const user = await getCurrentUser()

        const member = await db.query.projectV2Members.findFirst({
            where: eq(projectV2Members.id, memberId),
            with: { project: true }
        });

        if (!member) {
            return { success: false, error: 'Member not found' }
        }

        if (member.project.createdBy !== user.id) {
            return { success: false, error: 'Only the project creator can update roles' }
        }

        await db.update(projectV2Members)
            .set({ role })
            .where(eq(projectV2Members.id, memberId));

        revalidatePath(`/projects/${member.project.slug}`)

        return { success: true }
    } catch (error) {
        console.error('Error updating member role:', error)
        return { success: false, error: 'Failed to update role' }
    }
}

/**
 * Get team members for a project
 */
export async function getProjectMembers(
    projectId: string
): Promise<ActionResult<Array<{
    id: string
    userId: string
    role: 'ADMIN' | 'MEMBER'
    joinedAt: Date
    user: {
        id: string
        name: string | null
        username: string | null
        email: string
        image: string | null
    }
}>>> {
    try {
        const members = await db.query.projectV2Members.findMany({
            where: eq(projectV2Members.projectId, projectId),
            with: {
                user: {
                    columns: {
                        id: true,
                        name: true,
                        username: true,
                        email: true,
                        image: true
                    }
                }
            },
            orderBy: (members: any, { asc }: any) => [asc(members.joinedAt)]
        });

        return {
            success: true,
            data: members.map((m: any) => ({
                id: m.id,
                userId: m.userId,
                role: m.role as 'ADMIN' | 'MEMBER',
                joinedAt: m.joinedAt,
                user: m.user
            }))
        }
    } catch (error) {
        console.error('Error getting project members:', error)
        return { success: false, error: 'Failed to get members' }
    }
}

/**
 * Get pending invitations for a project
 */
export async function getProjectInvitations(
    projectId: string
): Promise<ActionResult<Array<{
    id: string
    invitedEmail: string | null
    role: 'ADMIN' | 'MEMBER'
    status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED'
    createdAt: Date
    invitedUser: {
        id: string
        name: string | null
        username: string | null
        image: string | null
    } | null
}>>> {
    try {
        const user = await getCurrentUser()

        const project = await db.query.projectsV2.findFirst({
            where: eq(projectsV2.id, projectId)
        });

        if (!project) {
            return { success: false, error: 'Project not found' }
        }

        if (project.createdBy !== user.id) {
            return { success: false, error: 'Only the project creator can view invitations' }
        }

        const invitations = await db.query.projectV2Invitations.findMany({
            where: and(
                eq(projectV2Invitations.projectId, projectId),
                eq(projectV2Invitations.status, 'PENDING')
            ),
            with: {
                invitedUser: {
                    columns: {
                        id: true,
                        name: true,
                        username: true,
                        image: true
                    }
                }
            },
            orderBy: (invitations: any, { desc }: any) => [desc(invitations.createdAt)]
        });

        return {
            success: true,
            data: invitations.map((i: any) => ({
                id: i.id,
                invitedEmail: i.invitedEmail,
                role: i.role as 'ADMIN' | 'MEMBER',
                status: i.status as 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED',
                createdAt: i.createdAt,
                invitedUser: i.invitedUser
            }))
        }
    } catch (error) {
        console.error('Error getting invitations:', error)
        return { success: false, error: 'Failed to get invitations' }
    }
}

/**
 * Get invitations for the current user
 */
export async function getMyInvitations(): Promise<ActionResult<Array<{
    id: string
    role: 'ADMIN' | 'MEMBER'
    status: 'PENDING'
    createdAt: Date
    project: {
        id: string
        title: string
        slug: string
        shortDescription: string | null
    }
    invitedBy: {
        id: string
        name: string | null
        username: string | null
        image: string | null
    }
}>>> {
    try {
        const user = await getCurrentUser()

        const invitations = await db.query.projectV2Invitations.findMany({
            where: and(
                eq(projectV2Invitations.status, 'PENDING'),
                or(
                    eq(projectV2Invitations.invitedUserId, user.id),
                    eq(projectV2Invitations.invitedEmail, user.email?.toLowerCase() || '')
                )
            ),
            with: {
                project: {
                    columns: {
                        id: true,
                        title: true,
                        slug: true,
                        shortDescription: true
                    }
                },
                invitedBy: {
                    columns: {
                        id: true,
                        name: true,
                        username: true,
                        image: true
                    }
                }
            },
            orderBy: (invitations: any, { desc }: any) => [desc(invitations.createdAt)]
        });

        return {
            success: true,
            data: invitations.map((i: any) => ({
                id: i.id,
                role: i.role as 'ADMIN' | 'MEMBER',
                status: 'PENDING' as const,
                createdAt: i.createdAt,
                project: i.project,
                invitedBy: i.invitedBy
            }))
        }
    } catch (error) {
        console.error('Error getting my invitations:', error)
        return { success: false, error: 'Failed to get invitations' }
    }
}

/**
 * Update project visibility
 */
export async function updateProjectVisibility(
    projectId: string,
    visibility: 'PUBLIC' | 'PRIVATE'
): Promise<ActionResult> {
    try {
        const user = await getCurrentUser()

        const project = await db.query.projectsV2.findFirst({
            where: eq(projectsV2.id, projectId)
        });

        if (!project) {
            return { success: false, error: 'Project not found' }
        }

        if (project.createdBy !== user.id) {
            return { success: false, error: 'Only the project creator can update visibility' }
        }

        await db.update(projectsV2)
            .set({ visibility })
            .where(eq(projectsV2.id, projectId));

        revalidatePath(`/projects/${project.slug}`)

        return { success: true }
    } catch (error) {
        console.error('Error updating visibility:', error)
        return { success: false, error: 'Failed to update visibility' }
    }
}
