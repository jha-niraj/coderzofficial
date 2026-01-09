"use server";

import { auth } from '@repo/auth';
import { prisma } from '@repo/prisma';
import { revalidatePath } from 'next/cache';
import { SpaceVisibility, SpaceMemberRole, SpaceActivityType } from '@repo/prisma/client';
import type { ActionResponse, SpaceMembersResponse, SpaceMemberWithProgress } from '@/types/space';

async function checkAuth() {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error('Unauthorized');
    }
    return session.user.id;
}

export async function joinSpace(
    spaceIdOrSlug: string,
    accessCode?: string
): Promise<ActionResponse<{ id: string }>> {
    try {
        const userId = await checkAuth();

        // Try to find by slug first, then by id
        const space = await prisma.space.findFirst({
            where: {
                OR: [
                    { id: spaceIdOrSlug },
                    { slug: spaceIdOrSlug }
                ]
            }
        });

        if (!space) {
            return {
                success: false,
                error: 'Space not found'
            };
        }

        // Check if already a member
        const existingMember = await prisma.spaceMember.findUnique({
            where: {
                spaceId_userId: {
                    spaceId: space.id,
                    userId
                }
            }
        });

        if (existingMember) {
            return {
                success: false,
                error: 'You are already a member of this space'
            };
        }

        // Check access requirements
        if (space.visibility === SpaceVisibility.PROTECTED) {
            if (!accessCode || accessCode !== space.accessCode) {
                return {
                    success: false,
                    error: 'Invalid access code'
                };
            }
        }

        if (space.visibility === SpaceVisibility.PRIVATE) {
            return {
                success: false,
                error: 'This space is private. You need an invitation to join.'
            };
        }

        // Create member
        await prisma.spaceMember.create({
            data: {
                spaceId: space.id,
                userId,
                role: SpaceMemberRole.MEMBER
            }
        });

        // Update member count
        await prisma.space.update({
            where: { id: space.id },
            data: { memberCount: { increment: 1 } }
        });

        // Create activity
        await prisma.spaceActivity.create({
            data: {
                spaceId: space.id,
                userId,
                type: SpaceActivityType.MEMBER_JOINED
            }
        });

        revalidatePath(`/space/${space.slug}`);
        return {
            success: true,
            data: { id: space.id }
        };
    } catch (error) {
        console.error('Error joining space:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to join space'
        };
    }
}

export async function leaveSpace(spaceId: string): Promise<ActionResponse> {
    try {
        const userId = await checkAuth();

        const member = await prisma.spaceMember.findUnique({
            where: {
                spaceId_userId: {
                    spaceId,
                    userId
                }
            },
            include: {
                space: true
            }
        });

        if (!member) {
            return {
                success: false,
                error: 'You are not a member of this space'
            };
        }

        // Creator cannot leave
        if (member.role === SpaceMemberRole.CREATOR) {
            return {
                success: false,
                error: 'Creator cannot leave the space. Transfer ownership or delete the space instead.'
            };
        }

        await prisma.spaceMember.delete({
            where: {
                spaceId_userId: {
                    spaceId,
                    userId
                }
            }
        });

        // Update member count
        await prisma.space.update({
            where: { id: spaceId },
            data: { memberCount: { decrement: 1 } }
        });

        revalidatePath(`/space/${member.space.slug}`);
        return {
            success: true
        };
    } catch (error) {
        console.error('Error leaving space:', error);
        return {
            success: false,
            error: 'Failed to leave space'
        };
    }
}

export async function getSpaceMembers(
    spaceId: string,
    page: number = 1,
    limit: number = 50
): Promise<ActionResponse<SpaceMembersResponse>> {
    try {
        const userId = await checkAuth();

        // Check access
        const member = await prisma.spaceMember.findUnique({
            where: {
                spaceId_userId: {
                    spaceId,
                    userId
                }
            }
        });

        const space = await prisma.space.findUnique({
            where: { id: spaceId }
        });

        if (!space) {
            return {
                success: false,
                error: 'Space not found'
            };
        }

        if (space.creatorId !== userId && !member) {
            return {
                success: false,
                error: 'You do not have access to view members'
            };
        }

        const skip = (page - 1) * limit;

        const [members, total] = await Promise.all([
            prisma.spaceMember.findMany({
                where: { spaceId },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            username: true,
                            image: true
                        }
                    },
                    currentStep: true,
                    personalBranch: true
                },
                orderBy: [
                    { role: 'asc' }, // Creators first
                    { joinedAt: 'asc' }
                ],
                skip,
                take: limit
            }),
            prisma.spaceMember.count({
                where: { spaceId }
            })
        ]);

        const totalPages = Math.ceil(total / limit);

        return {
            success: true,
            data: {
                members: members as unknown as SpaceMemberWithProgress[],
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages
                }
            }
        };
    } catch (error) {
        console.error('Error fetching members:', error);
        return {
            success: false,
            error: 'Failed to fetch members'
        };
    }
}

export async function updateMemberRole(
    spaceId: string,
    targetUserId: string,
    role: SpaceMemberRole
): Promise<ActionResponse> {
    try {
        const userId = await checkAuth();

        const space = await prisma.space.findUnique({
            where: { id: spaceId }
        });

        if (!space) {
            return {
                success: false,
                error: 'Space not found'
            };
        }

        // Only creator can change roles
        if (space.creatorId !== userId) {
            return {
                success: false,
                error: 'Only the creator can change member roles'
            };
        }

        // Cannot change creator role
        if (role === SpaceMemberRole.CREATOR) {
            return {
                success: false,
                error: 'Cannot assign creator role. Use transfer ownership instead.'
            };
        }

        // Cannot change own role
        if (targetUserId === userId) {
            return {
                success: false,
                error: 'Cannot change your own role'
            };
        }

        await prisma.spaceMember.update({
            where: {
                spaceId_userId: {
                    spaceId,
                    userId: targetUserId
                }
            },
            data: { role }
        });

        revalidatePath(`/space/${space.slug}`);
        return {
            success: true
        };
    } catch (error) {
        console.error('Error updating member role:', error);
        return {
            success: false,
            error: 'Failed to update member role'
        };
    }
}

export async function removeMember(
    spaceId: string,
    targetUserId: string
): Promise<ActionResponse> {
    try {
        const userId = await checkAuth();

        const space = await prisma.space.findUnique({
            where: { id: spaceId }
        });

        if (!space) {
            return {
                success: false,
                error: 'Space not found'
            };
        }

        // Only creator can remove members
        if (space.creatorId !== userId) {
            return {
                success: false,
                error: 'Only the creator can remove members'
            };
        }

        // Cannot remove creator
        if (targetUserId === space.creatorId) {
            return {
                success: false,
                error: 'Cannot remove the creator'
            };
        }

        await prisma.spaceMember.delete({
            where: {
                spaceId_userId: {
                    spaceId,
                    userId: targetUserId
                }
            }
        });

        // Update member count
        await prisma.space.update({
            where: { id: spaceId },
            data: { memberCount: { decrement: 1 } }
        });

        revalidatePath(`/space/${space.slug}`);
        return {
            success: true
        };
    } catch (error) {
        console.error('Error removing member:', error);
        return {
            success: false,
            error: 'Failed to remove member'
        };
    }
}

export async function transferOwnership(
    spaceId: string,
    newCreatorId: string
): Promise<ActionResponse> {
    try {
        const userId = await checkAuth();

        const space = await prisma.space.findUnique({
            where: { id: spaceId }
        });

        if (!space) {
            return {
                success: false,
                error: 'Space not found'
            };
        }

        if (space.creatorId !== userId) {
            return {
                success: false,
                error: 'Only the creator can transfer ownership'
            };
        }

        // Check if new creator is a member
        const newCreatorMember = await prisma.spaceMember.findUnique({
            where: {
                spaceId_userId: {
                    spaceId,
                    userId: newCreatorId
                }
            }
        });

        if (!newCreatorMember) {
            return {
                success: false,
                error: 'New creator must be a member of the space'
            };
        }

        // Update space creator
        await prisma.space.update({
            where: { id: spaceId },
            data: { creatorId: newCreatorId }
        });

        // Update member roles
        await Promise.all([
            // Old creator becomes member
            prisma.spaceMember.update({
                where: {
                    spaceId_userId: {
                        spaceId,
                        userId
                    }
                },
                data: { role: SpaceMemberRole.MEMBER }
            }),
            // New creator gets creator role
            prisma.spaceMember.update({
                where: {
                    spaceId_userId: {
                        spaceId,
                        userId: newCreatorId
                    }
                },
                data: { role: SpaceMemberRole.CREATOR }
            })
        ]);

        revalidatePath(`/space/${space.slug}`);
        return {
            success: true
        };
    } catch (error) {
        console.error('Error transferring ownership:', error);
        return {
            success: false,
            error: 'Failed to transfer ownership'
        };
    }
}





