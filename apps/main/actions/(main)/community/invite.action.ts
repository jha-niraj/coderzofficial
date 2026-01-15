'use server'

import { prisma } from "@repo/prisma"
import { getServerSession } from '@repo/auth'
import { authOptions } from '@repo/auth'
import { CommunityRole } from "@repo/prisma/client"
import { revalidatePath } from "next/cache"
import { Resend } from 'resend'

// Helper to get Resend instance
function getResend(): Resend | null {
    if (!process.env.RESEND_API_KEY) {
        console.warn('RESEND_API_KEY not set, emails will not be sent')
        return null
    }
    return new Resend(process.env.RESEND_API_KEY)
}

// Send invite email
async function sendInviteEmail(options: {
    to: string
    subject: string
    html: string
}) {
    const resend = getResend()
    if (!resend) return

    try {
        await resend.emails.send({
            from: 'TheCoderz <noreply@thecoderz.com>',
            ...options
        })
    } catch (error) {
        console.error('Failed to send email:', error)
    }
}

// ==================== TYPES ====================
export interface CreateInviteInput {
    email: string
    communityId: string
    expiresInDays?: number
}

export interface InviteData {
    id: string
    code: string
    inviteeEmail: string | null
    isUsed: boolean
    usedAt: Date | null
    expiresAt: Date | null
    createdAt: Date
    inviter: {
        id: string
        name: string | null
        image: string | null
    }
}

// ==================== CREATE INVITE ====================
export async function createCommunityInvite(input: CreateInviteInput) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" }
        }

        // Check if user is admin of the community
        const membership = await prisma.communityMember.findUnique({
            where: {
                communityId_userId: {
                    communityId: input.communityId,
                    userId: session.user.id
                }
            },
            include: { community: true }
        })

        if (!membership || !['OWNER', 'ADMIN'].includes(membership.role)) {
            return { success: false, error: "Only admins can send invites" }
        }

        // Check if email already has a pending invite
        const existingInvite = await prisma.communityInvite.findFirst({
            where: {
                communityId: input.communityId,
                inviteeEmail: input.email.toLowerCase(),
                isUsed: false,
                OR: [
                    { expiresAt: null },
                    { expiresAt: { gt: new Date() } }
                ]
            }
        })

        if (existingInvite) {
            return { success: false, error: "An invite has already been sent to this email" }
        }

        // Check if user is already a member
        const existingUser = await prisma.user.findUnique({
            where: { email: input.email.toLowerCase() }
        })

        if (existingUser) {
            const existingMembership = await prisma.communityMember.findUnique({
                where: {
                    communityId_userId: {
                        communityId: input.communityId,
                        userId: existingUser.id
                    }
                }
            })

            if (existingMembership) {
                return { success: false, error: "This user is already a member" }
            }
        }

        // Calculate expiry
        const expiresAt = input.expiresInDays
            ? new Date(Date.now() + input.expiresInDays * 24 * 60 * 60 * 1000)
            : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Default 7 days

        // Create invite
        const invite = await prisma.communityInvite.create({
            data: {
                communityId: input.communityId,
                inviterId: session.user.id,
                inviteeEmail: input.email.toLowerCase(),
                inviteeId: existingUser?.id,
                expiresAt
            },
            include: {
                community: true,
                inviter: {
                    select: {
                        name: true
                    }
                }
            }
        })

        // Send email invitation
        try {
            await sendInviteEmail({
                to: input.email.toLowerCase(),
                subject: `You're invited to join ${invite.community.name}!`,
                html: `
                    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2>You're invited to join ${invite.community.name}!</h2>
                        <p>${invite.inviter.name || 'Someone'} has invited you to join the ${invite.community.name} community on OpenNote.</p>
                        <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/communities/${invite.community.slug}/join?code=${invite.code}" style="display: inline-block; background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 8px;">Accept Invitation</a></p>
                        <p>This invitation will expire on ${expiresAt.toLocaleDateString()}.</p>
                        <p>If you don't have an account, you'll be able to create one after clicking the link.</p>
                    </div>
                `
            })
        } catch (emailError) {
            console.error('Failed to send invite email:', emailError)
            // Don't fail the invite creation if email fails
        }

        revalidatePath(`/communities/${invite.community.slug}`)
        return { success: true, data: invite }
    } catch (error) {
        console.error('Error creating invite:', error)
        return { success: false, error: "Failed to create invite" }
    }
}

// ==================== GET INVITES ====================
export async function getCommunityInvites(communityId: string) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" }
        }

        // Check if user is admin
        const membership = await prisma.communityMember.findUnique({
            where: {
                communityId_userId: {
                    communityId,
                    userId: session.user.id
                }
            }
        })

        if (!membership || !['OWNER', 'ADMIN'].includes(membership.role)) {
            return { success: false, error: "Unauthorized" }
        }

        const invites = await prisma.communityInvite.findMany({
            where: { communityId },
            include: {
                inviter: {
                    select: {
                        id: true,
                        name: true,
                        image: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        })

        // Categorize invites
        const now = new Date()
        const categorizedInvites = invites.map(invite => ({
            ...invite,
            status: invite.isUsed
                ? 'accepted'
                : invite.expiresAt && invite.expiresAt < now
                    ? 'expired'
                    : 'pending'
        }))

        return { success: true, data: categorizedInvites }
    } catch (error) {
        console.error('Error fetching invites:', error)
        return { success: false, error: "Failed to fetch invites" }
    }
}

// ==================== ACCEPT INVITE ====================
export async function acceptCommunityInvite(code: string) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return { success: false, error: "Please sign in to accept the invitation" }
        }

        const invite = await prisma.communityInvite.findUnique({
            where: { code },
            include: { community: true }
        })

        if (!invite) {
            return { success: false, error: "Invalid invitation" }
        }

        if (invite.isUsed) {
            return { success: false, error: "This invitation has already been used" }
        }

        if (invite.expiresAt && invite.expiresAt < new Date()) {
            return { success: false, error: "This invitation has expired" }
        }

        // Check if already a member
        const existingMembership = await prisma.communityMember.findUnique({
            where: {
                communityId_userId: {
                    communityId: invite.communityId,
                    userId: session.user.id
                }
            }
        })

        if (existingMembership) {
            return { success: false, error: "You're already a member of this community" }
        }

        // Create membership
        await prisma.communityMember.create({
            data: {
                communityId: invite.communityId,
                userId: session.user.id,
                role: CommunityRole.MEMBER,
                isApproved: true
            }
        })

        // Mark invite as used
        await prisma.communityInvite.update({
            where: { id: invite.id },
            data: {
                isUsed: true,
                usedAt: new Date()
            }
        })

        // Update member count
        await prisma.community.update({
            where: { id: invite.communityId },
            data: { memberCount: { increment: 1 } }
        })

        revalidatePath(`/communities/${invite.community.slug}`)
        return {
            success: true,
            data: {
                communitySlug: invite.community.slug,
                communityName: invite.community.name
            }
        }
    } catch (error) {
        console.error('Error accepting invite:', error)
        return { success: false, error: "Failed to accept invitation" }
    }
}

// ==================== CANCEL INVITE ====================
export async function cancelCommunityInvite(inviteId: string) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" }
        }

        const invite = await prisma.communityInvite.findUnique({
            where: { id: inviteId },
            include: { community: true }
        })

        if (!invite) {
            return { success: false, error: "Invite not found" }
        }

        // Check if user is admin
        const membership = await prisma.communityMember.findUnique({
            where: {
                communityId_userId: {
                    communityId: invite.communityId,
                    userId: session.user.id
                }
            }
        })

        if (!membership || !['OWNER', 'ADMIN'].includes(membership.role)) {
            return { success: false, error: "Unauthorized" }
        }

        await prisma.communityInvite.delete({
            where: { id: inviteId }
        })

        revalidatePath(`/communities/${invite.community.slug}`)
        return { success: true }
    } catch (error) {
        console.error('Error canceling invite:', error)
        return { success: false, error: "Failed to cancel invite" }
    }
}

// ==================== RESEND INVITE ====================
export async function resendCommunityInvite(inviteId: string) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" }
        }

        const invite = await prisma.communityInvite.findUnique({
            where: { id: inviteId },
            include: {
                community: true,
                inviter: { select: { name: true } }
            }
        })

        if (!invite || !invite.inviteeEmail) {
            return { success: false, error: "Invite not found" }
        }

        if (invite.isUsed) {
            return { success: false, error: "This invitation has already been used" }
        }

        // Check if user is admin
        const membership = await prisma.communityMember.findUnique({
            where: {
                communityId_userId: {
                    communityId: invite.communityId,
                    userId: session.user.id
                }
            }
        })

        if (!membership || !['OWNER', 'ADMIN'].includes(membership.role)) {
            return { success: false, error: "Unauthorized" }
        }

        // Update expiry and resend
        const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

        await prisma.communityInvite.update({
            where: { id: inviteId },
            data: { expiresAt: newExpiresAt }
        })

        // Resend email
        await sendInviteEmail({
            to: invite.inviteeEmail,
            subject: `Reminder: You're invited to join ${invite.community.name}!`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>Reminder: You're invited to join ${invite.community.name}!</h2>
                    <p>${invite.inviter.name || 'Someone'} has invited you to join the ${invite.community.name} community on OpenNote.</p>
                    <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/communities/${invite.community.slug}/join?code=${invite.code}" style="display: inline-block; background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 8px;">Accept Invitation</a></p>
                    <p>This invitation will expire on ${newExpiresAt.toLocaleDateString()}.</p>
                </div>
            `
        })

        return { success: true }
    } catch (error) {
        console.error('Error resending invite:', error)
        return { success: false, error: "Failed to resend invite" }
    }
}