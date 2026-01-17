'use server'

import { revalidatePath } from 'next/cache'
import prisma from '@repo/prisma'
import { auth } from '@repo/auth'

// ============================================================================
// Helper Functions
// ============================================================================

async function getCurrentUser() {
    const session = await auth()
    if (!session?.user?.email) throw new Error('Not authenticated')
    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
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

        // Verify user is project creator or admin
        const project = await prisma.projectV2.findUnique({
            where: { id: projectId },
            include: {
                members: {
                    where: { userId: user.id }
                }
            }
        })

        if (!project) {
            return { success: false, error: 'Project not found' }
        }

        const isCreator = project.createdBy === user.id
        const isAdmin = project.members?.some(m => m.role === 'ADMIN')

        if (!isCreator && !isAdmin) {
            return { success: false, error: 'You do not have permission to invite members' }
        }

        // Check if user exists with this email
        const invitedUser = await prisma.user.findFirst({
            where: { email: email.toLowerCase() }
        })

        // Check if already a member
        if (invitedUser) {
            const existingMember = await prisma.projectV2Member.findFirst({
                where: {
                    projectId,
                    userId: invitedUser.id
                }
            })

            if (existingMember) {
                return { success: false, error: 'User is already a member of this project' }
            }
        }

        // Check for existing pending invitation
        const existingInvitation = await prisma.projectV2Invitation.findFirst({
            where: {
                projectId,
                OR: [
                    { invitedEmail: email.toLowerCase() },
                    { invitedUserId: invitedUser?.id }
                ],
                status: 'PENDING'
            }
        })

        if (existingInvitation) {
            return { success: false, error: 'An invitation is already pending for this user' }
        }

        // Create invitation
        const invitation = await prisma.projectV2Invitation.create({
            data: {
                projectId,
                invitedEmail: email.toLowerCase(),
                invitedUserId: invitedUser?.id,
                invitedById: user.id,
                role,
                status: 'PENDING',
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
            }
        })

        // TODO: Send email notification

        revalidatePath(`/projects/${project.slug}`)

        return { success: true, data: { invitationId: invitation.id } }
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

        const invitation = await prisma.projectV2Invitation.findUnique({
            where: { id: invitationId },
            include: { project: true }
        })

        if (!invitation) {
            return { success: false, error: 'Invitation not found' }
        }

        // Verify invitation is for this user
        if (invitation.invitedUserId !== user.id &&
            invitation.invitedEmail?.toLowerCase() !== user.email?.toLowerCase()) {
            return { success: false, error: 'This invitation is not for you' }
        }

        if (invitation.status !== 'PENDING') {
            return { success: false, error: 'This invitation has already been processed' }
        }

        if (invitation.expiresAt && new Date() > invitation.expiresAt) {
            await prisma.projectV2Invitation.update({
                where: { id: invitationId },
                data: { status: 'EXPIRED' }
            })
            return { success: false, error: 'This invitation has expired' }
        }

        // Add user as member and update invitation
        await prisma.$transaction([
            prisma.projectV2Member.create({
                data: {
                    projectId: invitation.projectId,
                    userId: user.id,
                    role: invitation.role,
                    invitedBy: invitation.invitedById
                }
            }),
            prisma.projectV2Invitation.update({
                where: { id: invitationId },
                data: {
                    status: 'ACCEPTED',
                    respondedAt: new Date()
                }
            })
        ])

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

        const invitation = await prisma.projectV2Invitation.findUnique({
            where: { id: invitationId }
        })

        if (!invitation) {
            return { success: false, error: 'Invitation not found' }
        }

        if (invitation.invitedUserId !== user.id &&
            invitation.invitedEmail?.toLowerCase() !== user.email?.toLowerCase()) {
            return { success: false, error: 'This invitation is not for you' }
        }

        await prisma.projectV2Invitation.update({
            where: { id: invitationId },
            data: {
                status: 'DECLINED',
                respondedAt: new Date()
            }
        })

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

        const invitation = await prisma.projectV2Invitation.findUnique({
            where: { id: invitationId },
            include: { project: true }
        })

        if (!invitation) {
            return { success: false, error: 'Invitation not found' }
        }

        const isCreator = invitation.project.createdBy === user.id
        const isInviter = invitation.invitedById === user.id

        if (!isCreator && !isInviter) {
            return { success: false, error: 'You cannot cancel this invitation' }
        }

        await prisma.projectV2Invitation.delete({
            where: { id: invitationId }
        })

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

        const project = await prisma.projectV2.findUnique({
            where: { id: projectId }
        })

        if (!project) {
            return { success: false, error: 'Project not found' }
        }

        if (project.createdBy !== user.id) {
            return { success: false, error: 'Only the project creator can remove members' }
        }

        const member = await prisma.projectV2Member.findUnique({
            where: { id: memberId }
        })

        if (!member || member.projectId !== projectId) {
            return { success: false, error: 'Member not found' }
        }

        // Cannot remove self (creator)
        if (member.userId === user.id) {
            return { success: false, error: 'You cannot remove yourself from the project' }
        }

        await prisma.projectV2Member.delete({
            where: { id: memberId }
        })

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

        const member = await prisma.projectV2Member.findUnique({
            where: { id: memberId },
            include: { project: true }
        })

        if (!member) {
            return { success: false, error: 'Member not found' }
        }

        if (member.project.createdBy !== user.id) {
            return { success: false, error: 'Only the project creator can update roles' }
        }

        await prisma.projectV2Member.update({
            where: { id: memberId },
            data: { role }
        })

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
        const members = await prisma.projectV2Member.findMany({
            where: { projectId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        email: true,
                        image: true
                    }
                }
            },
            orderBy: { joinedAt: 'asc' }
        })

        return {
            success: true,
            data: members.map(m => ({
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

        const project = await prisma.projectV2.findUnique({
            where: { id: projectId }
        })

        if (!project) {
            return { success: false, error: 'Project not found' }
        }

        if (project.createdBy !== user.id) {
            return { success: false, error: 'Only the project creator can view invitations' }
        }

        const invitations = await prisma.projectV2Invitation.findMany({
            where: {
                projectId,
                status: 'PENDING'
            },
            include: {
                invitedUser: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        image: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        })

        return {
            success: true,
            data: invitations.map(i => ({
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

        const invitations = await prisma.projectV2Invitation.findMany({
            where: {
                OR: [
                    { invitedUserId: user.id },
                    { invitedEmail: user.email?.toLowerCase() }
                ],
                status: 'PENDING'
            },
            include: {
                project: {
                    select: {
                        id: true,
                        title: true,
                        slug: true,
                        shortDescription: true
                    }
                },
                invitedBy: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        image: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        })

        return {
            success: true,
            data: invitations.map(i => ({
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

        const project = await prisma.projectV2.findUnique({
            where: { id: projectId }
        })

        if (!project) {
            return { success: false, error: 'Project not found' }
        }

        if (project.createdBy !== user.id) {
            return { success: false, error: 'Only the project creator can update visibility' }
        }

        await prisma.projectV2.update({
            where: { id: projectId },
            data: { visibility }
        })

        revalidatePath(`/projects/${project.slug}`)

        return { success: true }
    } catch (error) {
        console.error('Error updating visibility:', error)
        return { success: false, error: 'Failed to update visibility' }
    }
}
