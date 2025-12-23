'use server'

import { prisma } from "@/lib/prisma"
import { getServerSession } from '@repo/auth'
import { revalidatePath } from "next/cache"
import { CommunityVisibility, CommunityType, CommunityRole } from "@prisma/client"
import { authOptions } from '@repo/auth'

// ==================== TYPES ====================
export interface CreateCommunityInput {
    name: string
    slug: string
    description: string
    shortDescription?: string
    category: string
    visibility: CommunityVisibility
    enabledSections: string[]
    rules: string[]
    tags?: string[]
    coverImage?: string
    logo?: string
    themeColor?: string
    verificationReason?: string
}

export interface UpdateCommunityInput {
    name?: string
    description?: string
    shortDescription?: string
    coverImage?: string
    logo?: string
    themeColor?: string
    visibility?: CommunityVisibility
    enabledSections?: string[]
    rules?: string[]
    tags?: string[]
    settings?: Record<string, unknown>
}

// ==================== COMMUNITY CRUD ====================

// Create a new community
export async function createCommunity(input: CreateCommunityInput) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" }
        }

        // Check if slug is already taken
        const existingCommunity = await prisma.community.findUnique({
            where: { slug: input.slug }
        })

        if (existingCommunity) {
            return { success: false, error: "Community URL is already taken" }
        }

        // Create the community
        const community = await prisma.community.create({
            data: {
                name: input.name,
                slug: input.slug.toLowerCase().replace(/\s+/g, '-'),
                description: input.description,
                shortDescription: input.shortDescription,
                category: input.category,
                visibility: input.visibility,
                enabledSections: input.enabledSections,
                rules: input.rules,
                tags: input.tags || [],
                coverImage: input.coverImage,
                logo: input.logo,
                themeColor: input.themeColor || '#3B82F6',
                verificationReason: input.verificationReason,
                creatorId: session.user.id,
                memberCount: 1, // Creator is first member
            }
        })

        // Add creator as owner
        await prisma.communityMember.create({
            data: {
                communityId: community.id,
                userId: session.user.id,
                role: CommunityRole.OWNER,
                isApproved: true
            }
        })

        // Create default channels based on enabled sections
        const defaultChannels = []
        if (input.enabledSections.includes('FEED')) {
            defaultChannels.push({
                communityId: community.id,
                name: 'General',
                slug: 'general',
                description: 'General discussions',
                icon: '💬',
                type: 'DISCUSSION' as const,
                isDefault: true,
                orderIndex: 0
            })
        }
        if (input.enabledSections.includes('ANNOUNCEMENTS')) {
            defaultChannels.push({
                communityId: community.id,
                name: 'Announcements',
                slug: 'announcements',
                description: 'Important announcements',
                icon: '📢',
                type: 'ANNOUNCEMENTS' as const,
                allowedRoles: [CommunityRole.OWNER, CommunityRole.ADMIN],
                orderIndex: 1
            })
        }

        if (defaultChannels.length > 0) {
            await prisma.communityChannel.createMany({
                data: defaultChannels
            })
        }

        revalidatePath('/community')
        return { success: true, data: community }
    } catch (error) {
        console.error('Error creating community:', error)
        return { success: false, error: "Failed to create community" }
    }
}

// Get community by slug
export async function getCommunityBySlug(slug: string) {
    try {
        const session = await getServerSession(authOptions)
        
        const community = await prisma.community.findUnique({
            where: { slug },
            include: {
                creator: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        image: true
                    }
                },
                channels: {
                    orderBy: { orderIndex: 'asc' }
                },
                _count: {
                    select: {
                        members: true,
                        posts: true,
                        resources: true,
                        events: true
                    }
                }
            }
        })

        if (!community) {
            return { success: false, error: "Community not found" }
        }

        // Check if user is a member (if logged in)
        let membership = null
        if (session?.user?.id) {
            membership = await prisma.communityMember.findUnique({
                where: {
                    communityId_userId: {
                        communityId: community.id,
                        userId: session.user.id
                    }
                }
            })
        }

        // Check visibility
        if (community.visibility === 'PRIVATE' && !membership) {
            return { success: false, error: "This community is private" }
        }

        return { 
            success: true, 
            data: {
                ...community,
                isMember: !!membership,
                userRole: membership?.role
            }
        }
    } catch (error) {
        console.error('Error fetching community:', error)
        return { success: false, error: "Failed to fetch community" }
    }
}

// Update community
export async function updateCommunity(communityId: string, input: UpdateCommunityInput) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" }
        }

        // Check if user is admin/owner
        const membership = await prisma.communityMember.findUnique({
            where: {
                communityId_userId: {
                    communityId,
                    userId: session.user.id
                }
            }
        })

        if (!membership || !['OWNER', 'ADMIN'].includes(membership.role)) {
            return { success: false, error: "You don't have permission to update this community" }
        }

        const community = await prisma.community.update({
            where: { id: communityId },
            data: {
                ...input,
                settings: input.settings as any
            }
        })

        revalidatePath(`/community/${community.slug}`)
        return { success: true, data: community }
    } catch (error) {
        console.error('Error updating community:', error)
        return { success: false, error: "Failed to update community" }
    }
}

// Delete community
export async function deleteCommunity(communityId: string) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" }
        }

        // Check if user is owner
        const membership = await prisma.communityMember.findUnique({
            where: {
                communityId_userId: {
                    communityId,
                    userId: session.user.id
                }
            }
        })

        if (!membership || membership.role !== 'OWNER') {
            return { success: false, error: "Only the owner can delete this community" }
        }

        await prisma.community.delete({
            where: { id: communityId }
        })

        revalidatePath('/community')
        return { success: true }
    } catch (error) {
        console.error('Error deleting community:', error)
        return { success: false, error: "Failed to delete community" }
    }
}

// ==================== DISCOVERY ====================

// Get all public communities
export async function getPublicCommunities(options?: {
    category?: string
    search?: string
    limit?: number
    offset?: number
    sortBy?: 'memberCount' | 'postCount' | 'createdAt'
}) {
    try {
        const { category, search, limit = 20, offset = 0, sortBy = 'memberCount' } = options || {}

        const where = {
            visibility: CommunityVisibility.PUBLIC,
            ...(category && category !== 'All' && { category }),
            ...(search && {
                OR: [
                    { name: { contains: search, mode: 'insensitive' as const } },
                    { description: { contains: search, mode: 'insensitive' as const } },
                    { tags: { has: search } }
                ]
            })
        }

        const [communities, total] = await Promise.all([
            prisma.community.findMany({
                where,
                include: {
                    creator: {
                        select: {
                            id: true,
                            name: true,
                            username: true,
                            image: true
                        }
                    },
                    _count: {
                        select: { members: true, posts: true }
                    }
                },
                orderBy: { [sortBy]: 'desc' },
                take: limit,
                skip: offset
            }),
            prisma.community.count({ where })
        ])

        return { success: true, data: communities, total }
    } catch (error) {
        console.error('Error fetching communities:', error)
        return { success: false, error: "Failed to fetch communities" }
    }
}

// Get featured communities
export async function getFeaturedCommunities(limit = 6) {
    try {
        const communities = await prisma.community.findMany({
            where: {
                visibility: CommunityVisibility.PUBLIC,
                isFeatured: true
            },
            include: {
                creator: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        image: true
                    }
                },
                _count: {
                    select: { members: true, posts: true }
                }
            },
            orderBy: { featuredAt: 'desc' },
            take: limit
        })

        return { success: true, data: communities }
    } catch (error) {
        console.error('Error fetching featured communities:', error)
        return { success: false, error: "Failed to fetch featured communities" }
    }
}

// Get user's communities
export async function getUserCommunities() {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" }
        }

        const memberships = await prisma.communityMember.findMany({
            where: {
                userId: session.user.id,
                isApproved: true
            },
            include: {
                community: {
                    include: {
                        _count: {
                            select: { members: true, posts: true }
                        }
                    }
                }
            },
            orderBy: { joinedAt: 'desc' }
        })

        const communities = memberships.map(m => ({
            ...m.community,
            userRole: m.role,
            joinedAt: m.joinedAt
        }))

        return { success: true, data: communities }
    } catch (error) {
        console.error('Error fetching user communities:', error)
        return { success: false, error: "Failed to fetch communities" }
    }
}

// ==================== MEMBERSHIP ====================

// Join a community
export async function joinCommunity(communityId: string) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" }
        }

        const community = await prisma.community.findUnique({
            where: { id: communityId }
        })

        if (!community) {
            return { success: false, error: "Community not found" }
        }

        // Check if already a member
        const existingMembership = await prisma.communityMember.findUnique({
            where: {
                communityId_userId: {
                    communityId,
                    userId: session.user.id
                }
            }
        })

        if (existingMembership) {
            return { success: false, error: "You're already a member" }
        }

        // For restricted communities, set isApproved to false
        const isApproved = community.visibility !== 'RESTRICTED'

        const membership = await prisma.communityMember.create({
            data: {
                communityId,
                userId: session.user.id,
                role: CommunityRole.MEMBER,
                isApproved
            }
        })

        // Update member count if approved
        if (isApproved) {
            await prisma.community.update({
                where: { id: communityId },
                data: { memberCount: { increment: 1 } }
            })
        }

        revalidatePath(`/community/${community.slug}`)
        return { 
            success: true, 
            data: membership,
            message: isApproved ? "Joined successfully!" : "Join request sent!"
        }
    } catch (error) {
        console.error('Error joining community:', error)
        return { success: false, error: "Failed to join community" }
    }
}

// Leave a community
export async function leaveCommunity(communityId: string) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" }
        }

        const membership = await prisma.communityMember.findUnique({
            where: {
                communityId_userId: {
                    communityId,
                    userId: session.user.id
                }
            },
            include: { community: true }
        })

        if (!membership) {
            return { success: false, error: "You're not a member" }
        }

        if (membership.role === 'OWNER') {
            return { success: false, error: "Owners cannot leave. Transfer ownership first." }
        }

        await prisma.communityMember.delete({
            where: {
                communityId_userId: {
                    communityId,
                    userId: session.user.id
                }
            }
        })

        // Update member count
        if (membership.isApproved) {
            await prisma.community.update({
                where: { id: communityId },
                data: { memberCount: { decrement: 1 } }
            })
        }

        revalidatePath(`/community/${membership.community.slug}`)
        return { success: true }
    } catch (error) {
        console.error('Error leaving community:', error)
        return { success: false, error: "Failed to leave community" }
    }
}

// Get community members
export async function getCommunityMembers(communityId: string, options?: {
    role?: CommunityRole
    limit?: number
    offset?: number
}) {
    try {
        const { role, limit = 50, offset = 0 } = options || {}

        const members = await prisma.communityMember.findMany({
            where: {
                communityId,
                isApproved: true,
                ...(role && { role })
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        image: true,
                        bio: true
                    }
                }
            },
            orderBy: [
                { role: 'asc' }, // OWNER first, then ADMIN, etc.
                { joinedAt: 'asc' }
            ],
            take: limit,
            skip: offset
        })

        return { success: true, data: members }
    } catch (error) {
        console.error('Error fetching members:', error)
        return { success: false, error: "Failed to fetch members" }
    }
}

// Update member role (admin only)
export async function updateMemberRole(communityId: string, userId: string, newRole: CommunityRole) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" }
        }

        // Check if current user is admin/owner
        const currentUserMembership = await prisma.communityMember.findUnique({
            where: {
                communityId_userId: {
                    communityId,
                    userId: session.user.id
                }
            }
        })

        if (!currentUserMembership || !['OWNER', 'ADMIN'].includes(currentUserMembership.role)) {
            return { success: false, error: "You don't have permission" }
        }

        // Only owner can create other owners/admins
        if (newRole === 'OWNER' && currentUserMembership.role !== 'OWNER') {
            return { success: false, error: "Only owners can transfer ownership" }
        }

        const membership = await prisma.communityMember.update({
            where: {
                communityId_userId: {
                    communityId,
                    userId
                }
            },
            data: { role: newRole }
        })

        return { success: true, data: membership }
    } catch (error) {
        console.error('Error updating member role:', error)
        return { success: false, error: "Failed to update role" }
    }
}

// Kick member (admin only)
export async function kickMember(communityId: string, userId: string) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" }
        }

        // Check permissions
        const [currentUserMembership, targetMembership] = await Promise.all([
            prisma.communityMember.findUnique({
                where: { communityId_userId: { communityId, userId: session.user.id } }
            }),
            prisma.communityMember.findUnique({
                where: { communityId_userId: { communityId, userId } }
            })
        ])

        if (!currentUserMembership || !['OWNER', 'ADMIN', 'MODERATOR'].includes(currentUserMembership.role)) {
            return { success: false, error: "You don't have permission" }
        }

        if (!targetMembership) {
            return { success: false, error: "User is not a member" }
        }

        // Can't kick owner or higher role
        const roleHierarchy = { OWNER: 0, ADMIN: 1, MODERATOR: 2, MEMBER: 3 }
        if (roleHierarchy[targetMembership.role] <= roleHierarchy[currentUserMembership.role]) {
            return { success: false, error: "Cannot kick user with equal or higher role" }
        }

        await prisma.communityMember.delete({
            where: { communityId_userId: { communityId, userId } }
        })

        await prisma.community.update({
            where: { id: communityId },
            data: { memberCount: { decrement: 1 } }
        })

        return { success: true }
    } catch (error) {
        console.error('Error kicking member:', error)
        return { success: false, error: "Failed to kick member" }
    }
}

// Get community categories
export async function getCommunityCategories() {
    return [
        'General',
        'Tech',
        'Study',
        'Career',
        'DSA & Algorithms',
        'Web Development',
        'Mobile Development',
        'AI & Machine Learning',
        'DevOps & Cloud',
        'Open Source',
        'Gaming',
        'Design',
        'College',
        'Company',
        'Other'
    ]
}

// Get available sections for community creation
export async function getAvailableSections() {
    return [
        { id: 'FEED', name: 'Feed', description: 'General posts and discussions', icon: '📰', default: true },
        { id: 'ANNOUNCEMENTS', name: 'Announcements', description: 'Admin-only announcements', icon: '📢', default: false },
        { id: 'RESOURCES', name: 'Resources', description: 'Share files, PDFs, links', icon: '📚', default: true },
        { id: 'QA', name: 'Q&A', description: 'Questions and answers', icon: '❓', default: false },
        { id: 'SHOWCASE', name: 'Showcase', description: 'Share completed projects', icon: '🎨', default: false },
        { id: 'EVENTS', name: 'Events', description: 'Community events', icon: '📅', default: false },
        { id: 'CHALLENGES', name: 'Challenges', description: 'Weekly/Monthly challenges', icon: '🏆', default: false },
        { id: 'JOBS', name: 'Jobs', description: 'Job postings and referrals', icon: '💼', default: false },
        { id: 'HELP', name: 'Help Room', description: 'Real-time help requests', icon: '🆘', default: false },
        { id: 'CODE_REVIEW', name: 'Code Review', description: 'Request code reviews', icon: '👀', default: false },
    ]
}

