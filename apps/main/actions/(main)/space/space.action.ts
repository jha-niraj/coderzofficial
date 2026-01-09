"use server";

import { auth } from '@repo/auth';
import { prisma } from '@repo/prisma';
import { revalidatePath } from 'next/cache';
import {
    SpaceVisibility,
    SpaceMemberRole,
    SpaceStepContentType,
    SpaceStepStatus
} from '@repo/prisma/client';
import type {
    SpaceFormData,
    SpaceFilters,
    ActionResponse,
    SpacesListResponse,
    SpaceWithDetails,
    PaginationInfo
} from '@/types/space';
import { SpaceCategory } from '@repo/prisma/client';

// ==========================================
// HELPER FUNCTIONS
// ==========================================

function generateSlug(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
}

function generateAccessCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

async function checkAuth() {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error('Unauthorized');
    }
    return session.user.id;
}

async function checkSpaceAccess(spaceId: string, userId: string) {
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
        throw new Error('Space not found');
    }

    // Creator always has access
    if (space.creatorId === userId) {
        return { hasAccess: true, role: SpaceMemberRole.CREATOR };
    }

    // Check visibility
    if (space.visibility === SpaceVisibility.PUBLIC) {
        return { hasAccess: true, role: member?.role || null };
    }

    if (space.visibility === SpaceVisibility.PRIVATE && !member) {
        return { hasAccess: false, role: null };
    }

    if (space.visibility === SpaceVisibility.PROTECTED && !member) {
        return { hasAccess: false, role: null };
    }

    return { hasAccess: true, role: member?.role || null };
}

// ==========================================
// SPACE CRUD OPERATIONS
// ==========================================

export async function createSpace(data: SpaceFormData): Promise<ActionResponse<{ id: string; slug: string }>> {
    try {
        const userId = await checkAuth();

        const slug = generateSlug(data.title);
        const existingSpace = await prisma.space.findUnique({
            where: { slug }
        });

        if (existingSpace) {
            return {
                success: false,
                error: 'A space with this title already exists'
            };
        }

        const accessCode = data.visibility === SpaceVisibility.PROTECTED
            ? generateAccessCode()
            : null;

        const space = await prisma.space.create({
            data: {
                slug,
                title: data.title,
                description: data.description,
                emoji: data.emoji,
                coverImage: data.coverImage,
                category: data.category || 'GENERAL',
                tags: data.tags || [],
                visibility: data.visibility,
                accessCode,
                allowMemberContent: data.allowMemberContent,
                isAssignmentMode: data.isAssignmentMode,
                enableProgressTracking: data.enableProgressTracking,
                enableBranches: data.enableBranches,
                enableComments: data.enableComments,
                enableLikes: data.enableLikes,
                creatorId: userId,
                members: {
                    create: {
                        userId,
                        role: SpaceMemberRole.CREATOR
                    }
                }
            },
            select: {
                id: true,
                slug: true
            }
        });

        // Update member count
        await prisma.space.update({
            where: { id: space.id },
            data: { memberCount: 1 }
        });

        revalidatePath('/space');
        return {
            success: true,
            data: space
        };
    } catch (error) {
        console.error('Error creating space:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to create space'
        };
    }
}

export async function getSpaces(filters: SpaceFilters = {}): Promise<ActionResponse<SpacesListResponse>> {
    try {
        const {
            search,
            visibility,
            creatorId,
            category,
            sortBy = 'latest',
            page = 1,
            limit = 12
        } = filters;

        const where: {
            visibility?: SpaceVisibility;
            creatorId?: string;
            category?: SpaceCategory;
            OR?: Array<{
                title?: { contains: string; mode: 'insensitive' };
                description?: { contains: string; mode: 'insensitive' };
            }>;
        } = {};

        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } }
            ];
        }

        if (visibility) {
            where.visibility = visibility;
        }

        if (creatorId) {
            where.creatorId = creatorId;
        }

        if (category) {
            where.category = category as SpaceCategory;
        }

        const orderBy: Record<string, string> = {};
        switch (sortBy) {
            case 'popular':
                orderBy.memberCount = 'desc';
                break;
            case 'members':
                orderBy.memberCount = 'desc';
                break;
            case 'views':
                orderBy.viewCount = 'desc';
                break;
            case 'latest':
            default:
                orderBy.createdAt = 'desc';
                break;
        }

        const skip = (page - 1) * limit;

        const [spaces, total] = await Promise.all([
            prisma.space.findMany({
                where,
                orderBy,
                skip,
                take: limit,
                include: {
                    creator: {
                        select: {
                            id: true,
                            name: true,
                            username: true,
                            image: true
                        }
                    }
                }
            }),
            prisma.space.count({ where })
        ]);

        const totalPages = Math.ceil(total / limit);

        return {
            success: true,
            data: {
                spaces: spaces as unknown as SpacesListResponse['spaces'],
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages
                }
            }
        };
    } catch (error) {
        console.error('Error fetching spaces:', error);
        return {
            success: false,
            error: 'Failed to fetch spaces'
        };
    }
}

export async function getSpace(slug: string): Promise<ActionResponse<SpaceWithDetails>> {
    try {
        const userId = await checkAuth();

        const space = await prisma.space.findUnique({
            where: { slug },
            include: {
                creator: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        image: true,
                        email: true
                    }
                },
                members: {
                    where: { userId },
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                username: true,
                                image: true
                            }
                        },
                        currentStep: true
                    },
                    take: 1
                },
                steps: {
                    orderBy: { order: 'asc' },
                    where: { status: SpaceStepStatus.ACTIVE }
                },
                branches: {
                    take: 10,
                    orderBy: { createdAt: 'desc' },
                    include: {
                        creator: {
                            select: {
                                id: true,
                                name: true,
                                username: true,
                                image: true
                            }
                        }
                    }
                },
                activities: {
                    take: 20,
                    orderBy: { createdAt: 'desc' },
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                username: true,
                                image: true
                            }
                        }
                    }
                }
            }
        });

        if (!space) {
            return {
                success: false,
                error: 'Space not found'
            };
        }

        // Check access
        const access = await checkSpaceAccess(space.id, userId);
        if (!access.hasAccess) {
            return {
                success: false,
                error: 'You do not have access to this space'
            };
        }

        // Increment view count
        await prisma.space.update({
            where: { id: space.id },
            data: { viewCount: { increment: 1 } }
        });

        return {
            success: true,
            data: space as unknown as SpaceWithDetails
        };
    } catch (error) {
        console.error('Error fetching space:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to fetch space'
        };
    }
}

export async function updateSpace(
    spaceId: string,
    data: Partial<SpaceFormData>
): Promise<ActionResponse<{ id: string }>> {
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
                error: 'Only the creator can update this space'
            };
        }

        const updateData: Parameters<typeof prisma.space.update>[0]['data'] = {};

        if (data.title) {
            const slug = generateSlug(data.title);
            const existingSpace = await prisma.space.findUnique({
                where: { slug }
            });

            if (existingSpace && existingSpace.id !== spaceId) {
                return {
                    success: false,
                    error: 'A space with this title already exists'
                };
            }
            updateData.slug = slug;
            updateData.title = data.title;
        }

        if (data.description !== undefined) updateData.description = data.description;
        if (data.emoji !== undefined) updateData.emoji = data.emoji;
        if (data.coverImage !== undefined) updateData.coverImage = data.coverImage;
        if (data.visibility !== undefined) {
            updateData.visibility = data.visibility;
            if (data.visibility === SpaceVisibility.PROTECTED && !space.accessCode) {
                updateData.accessCode = generateAccessCode();
            }
        }
        if (data.allowMemberContent !== undefined) updateData.allowMemberContent = data.allowMemberContent;
        if (data.isAssignmentMode !== undefined) updateData.isAssignmentMode = data.isAssignmentMode;
        if (data.enableProgressTracking !== undefined) updateData.enableProgressTracking = data.enableProgressTracking;
        if (data.enableBranches !== undefined) updateData.enableBranches = data.enableBranches;
        if (data.enableComments !== undefined) updateData.enableComments = data.enableComments;
        if (data.enableLikes !== undefined) updateData.enableLikes = data.enableLikes;

        await prisma.space.update({
            where: { id: spaceId },
            data: updateData
        });

        revalidatePath(`/space/${space.slug}`);
        return {
            success: true,
            data: { id: spaceId }
        };
    } catch (error) {
        console.error('Error updating space:', error);
        return {
            success: false,
            error: 'Failed to update space'
        };
    }
}

export async function deleteSpace(spaceId: string): Promise<ActionResponse> {
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
                error: 'Only the creator can delete this space'
            };
        }

        await prisma.space.delete({
            where: { id: spaceId }
        });

        revalidatePath('/space');
        return {
            success: true
        };
    } catch (error) {
        console.error('Error deleting space:', error);
        return {
            success: false,
            error: 'Failed to delete space'
        };
    }
}

export async function getSpaceStats(): Promise<ActionResponse<{
    totalSpaces: number;
    totalLearners: number;
    averageCompletion: number;
}>> {
    try {
        const [totalSpaces, totalLearners, avgProgress] = await Promise.all([
            prisma.space.count({
                where: { visibility: SpaceVisibility.PUBLIC }
            }),
            prisma.spaceMember.count(),
            prisma.spaceMember.aggregate({
                _avg: { progressPercent: true }
            })
        ]);

        return {
            success: true,
            data: {
                totalSpaces,
                totalLearners,
                averageCompletion: Math.round(avgProgress._avg.progressPercent || 0)
            }
        };
    } catch (error) {
        console.error('Error fetching space stats:', error);
        return {
            success: false,
            error: 'Failed to fetch stats'
        };
    }
}

export async function getUserSpaces(): Promise<ActionResponse<SpacesListResponse>> {
    try {
        const userId = await checkAuth();

        const [createdSpaces, memberSpaces] = await Promise.all([
            prisma.space.findMany({
                where: { creatorId: userId },
                include: {
                    creator: {
                        select: {
                            id: true,
                            name: true,
                            username: true,
                            image: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            }),
            prisma.space.findMany({
                where: {
                    members: {
                        some: {
                            userId,
                            role: SpaceMemberRole.MEMBER
                        }
                    }
                },
                include: {
                    creator: {
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
        ]);

        return {
            success: true,
            data: {
                spaces: [...createdSpaces, ...memberSpaces] as unknown as SpacesListResponse['spaces'],
                pagination: {
                    page: 1,
                    limit: createdSpaces.length + memberSpaces.length,
                    total: createdSpaces.length + memberSpaces.length,
                    totalPages: 1
                }
            }
        };
    } catch (error) {
        console.error('Error fetching user spaces:', error);
        return {
            success: false,
            error: 'Failed to fetch user spaces'
        };
    }
}


