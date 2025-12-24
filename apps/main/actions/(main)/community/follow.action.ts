'use server'

import prisma from "@repo/prisma"
import { auth, authOptions, getServerSession } from '@repo/auth'
import { revalidatePath } from "next/cache"

// ==================== FOLLOW REQUESTS (NEW CHAT SYSTEM) ====================

/**
 * Send a follow request to another user
 */
export async function sendFollowRequest(targetUserId: string) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: "Not authenticated" }
        }

        if (session.user.id === targetUserId) {
            return { success: false, error: "Cannot follow yourself" }
        }

        // Check if already following
        const existingFollow = await prisma.follow.findUnique({
            where: {
                followerId_followingId: {
                    followerId: session.user.id,
                    followingId: targetUserId
                }
            }
        })

        if (existingFollow) {
            return { success: false, error: "Already following this user" }
        }

        // Check if request already exists
        const existingRequest = await prisma.followRequest.findUnique({
            where: {
                senderId_receiverId: {
                    senderId: session.user.id,
                    receiverId: targetUserId
                }
            }
        })

        if (existingRequest) {
            return { success: false, error: "Follow request already sent" }
        }

        // Create follow request
        await prisma.followRequest.create({
            data: {
                senderId: session.user.id,
                receiverId: targetUserId
            }
        })

        revalidatePath("/chat")
        revalidatePath("/chat/requests")

        return { success: true, message: "Follow request sent" }
    } catch (error) {
        console.error("Send follow request error:", error)
        return { success: false, error: "Failed to send follow request" }
    }
}

/**
 * Accept a follow request
 */
export async function acceptFollowRequest(requestId: string) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: "Not authenticated" }
        }

        const request = await prisma.followRequest.findUnique({
            where: { id: requestId }
        })

        if (!request) {
            return { success: false, error: "Request not found" }
        }

        if (request.receiverId !== session.user.id) {
            return { success: false, error: "Not authorized" }
        }

        // Create follow relationship
        await prisma.$transaction([
            prisma.follow.create({
                data: {
                    followerId: request.senderId,
                    followingId: request.receiverId
                }
            }),
            prisma.followRequest.update({
                where: { id: requestId },
                data: { status: "ACCEPTED" }
            })
        ])

        revalidatePath("/chat")
        revalidatePath("/chat/requests")

        return { success: true, message: "Follow request accepted" }
    } catch (error) {
        console.error("Accept follow request error:", error)
        return { success: false, error: "Failed to accept follow request" }
    }
}

/**
 * Reject a follow request
 */
export async function rejectFollowRequest(requestId: string) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: "Not authenticated" }
        }

        const request = await prisma.followRequest.findUnique({
            where: { id: requestId }
        })

        if (!request) {
            return { success: false, error: "Request not found" }
        }

        if (request.receiverId !== session.user.id) {
            return { success: false, error: "Not authorized" }
        }

        await prisma.followRequest.update({
            where: { id: requestId },
            data: { status: "REJECTED" }
        })

        revalidatePath("/chat")
        revalidatePath("/chat/requests")

        return { success: true, message: "Follow request rejected" }
    } catch (error) {
        console.error("Reject follow request error:", error)
        return { success: false, error: "Failed to reject follow request" }
    }
}

/**
 * Get received follow requests
 */
export async function getFollowRequests() {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: "Not authenticated", requests: [] }
        }

        const requests = await prisma.followRequest.findMany({
            where: {
                receiverId: session.user.id,
                status: "PENDING"
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        image: true,
                        bio: true
                    }
                }
            },
            orderBy: { createdAt: "desc" }
        })

        return { success: true, requests }
    } catch (error) {
        console.error("Get follow requests error:", error)
        return { success: false, error: "Failed to fetch follow requests", requests: [] }
    }
}

/**
 * Get sent follow requests
 */
export async function getSentFollowRequests() {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: "Not authenticated", requests: [] }
        }

        const requests = await prisma.followRequest.findMany({
            where: {
                senderId: session.user.id
            },
            include: {
                receiver: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        image: true,
                        bio: true
                    }
                }
            },
            orderBy: { createdAt: "desc" }
        })

        return { success: true, requests }
    } catch (error) {
        console.error("Get sent follow requests error:", error)
        return { success: false, error: "Failed to fetch sent requests", requests: [] }
    }
}

// ==================== FOLLOW/UNFOLLOW (LEGACY + NEW) ====================

/**
 * Follow a user directly (for community features without request system)
 * For chat system, use sendFollowRequest instead
 */
export async function followUser(targetUserId: string) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" }
        }

        if (session.user.id === targetUserId) {
            return { success: false, error: "You cannot follow yourself" }
        }

        // Check if already following (new Follow model)
        const existingFollow = await prisma.follow.findUnique({
            where: {
                followerId_followingId: {
                    followerId: session.user.id,
                    followingId: targetUserId
                }
            }
        })

        if (existingFollow) {
            return { success: false, error: "Already following this user" }
        }

        // Check for legacy UserFollow
        const legacyFollow = await prisma.userFollow.findUnique({
            where: {
                followerId_followingId: {
                    followerId: session.user.id,
                    followingId: targetUserId
                }
            }
        })

        if (legacyFollow) {
            // Migrate to new Follow model
            await prisma.follow.create({
                data: {
                    followerId: session.user.id,
                    followingId: targetUserId
                }
            })
        } else {
            // Create new follow
            await prisma.follow.create({
                data: {
                    followerId: session.user.id,
                    followingId: targetUserId
                }
            })
        }

        revalidatePath("/chat")
        return { success: true, following: true }
    } catch (error) {
        console.error('Error following user:', error)
        return { success: false, error: "Failed to follow user" }
    }
}

/**
 * Unfollow a user
 */
export async function unfollowUser(targetUserId: string) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" }
        }

        // Try to delete from new Follow model
        try {
            await prisma.follow.delete({
                where: {
                    followerId_followingId: {
                        followerId: session.user.id,
                        followingId: targetUserId
                    }
                }
            })
        } catch (e) {
            // If not found in Follow, try legacy UserFollow
            await prisma.userFollow.delete({
                where: {
                    followerId_followingId: {
                        followerId: session.user.id,
                        followingId: targetUserId
                    }
                }
            })
        }

        revalidatePath("/chat")
        return { success: true, following: false }
    } catch (error) {
        console.error('Error unfollowing user:', error)
        return { success: false, error: "Failed to unfollow user" }
    }
}

// Toggle follow
export async function toggleFollow(targetUserId: string) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" }
        }

        if (session.user.id === targetUserId) {
            return { success: false, error: "You cannot follow yourself" }
        }

        const existingFollow = await prisma.userFollow.findUnique({
            where: {
                followerId_followingId: {
                    followerId: session.user.id,
                    followingId: targetUserId
                }
            }
        })

        if (existingFollow) {
            await prisma.userFollow.delete({
                where: { id: existingFollow.id }
            })
            return { success: true, following: false }
        } else {
            await prisma.userFollow.create({
                data: {
                    followerId: session.user.id,
                    followingId: targetUserId
                }
            })
            return { success: true, following: true }
        }
    } catch (error) {
        console.error('Error toggling follow:', error)
        return { success: false, error: "Failed to update follow status" }
    }
}

// Get user's followers
export async function getUserFollowers(userId: string, options?: {
    limit?: number
    offset?: number
}) {
    try {
        const session = await getServerSession(authOptions)
        const { limit = 30, offset = 0 } = options || {}

        const [followers, total] = await Promise.all([
            prisma.userFollow.findMany({
                where: { followingId: userId },
                include: {
                    follower: {
                        select: {
                            id: true,
                            name: true,
                            username: true,
                            image: true,
                            bio: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                take: limit,
                skip: offset
            }),
            prisma.userFollow.count({ where: { followingId: userId } })
        ])

        // Check if current user follows each follower
        let followingStatus: Record<string, boolean> = {}
        if (session?.user?.id) {
            const myFollowing = await prisma.userFollow.findMany({
                where: {
                    followerId: session.user.id,
                    followingId: { in: followers.map(f => f.followerId) }
                },
                select: { followingId: true }
            })
            followingStatus = Object.fromEntries(
                myFollowing.map(f => [f.followingId, true])
            )
        }

        const followersWithStatus = followers.map(f => ({
            ...f.follower,
            isFollowing: followingStatus[f.followerId] || false,
            followedAt: f.createdAt
        }))

        return { success: true, data: followersWithStatus, total }
    } catch (error) {
        console.error('Error fetching followers:', error)
        return { success: false, error: "Failed to fetch followers" }
    }
}

// Get users that a user is following
export async function getUserFollowing(userId: string, options?: {
    limit?: number
    offset?: number
}) {
    try {
        const session = await getServerSession(authOptions)
        const { limit = 30, offset = 0 } = options || {}

        const [following, total] = await Promise.all([
            prisma.userFollow.findMany({
                where: { followerId: userId },
                include: {
                    following: {
                        select: {
                            id: true,
                            name: true,
                            username: true,
                            image: true,
                            bio: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                take: limit,
                skip: offset
            }),
            prisma.userFollow.count({ where: { followerId: userId } })
        ])

        // Check if current user follows each user
        let followingStatus: Record<string, boolean> = {}
        if (session?.user?.id && session.user.id !== userId) {
            const myFollowing = await prisma.userFollow.findMany({
                where: {
                    followerId: session.user.id,
                    followingId: { in: following.map(f => f.followingId) }
                },
                select: { followingId: true }
            })
            followingStatus = Object.fromEntries(
                myFollowing.map(f => [f.followingId, true])
            )
        } else if (session?.user?.id === userId) {
            // Current user is viewing their own following - all are followed
            followingStatus = Object.fromEntries(
                following.map(f => [f.followingId, true])
            )
        }

        const followingWithStatus = following.map(f => ({
            ...f.following,
            isFollowing: followingStatus[f.followingId] || false,
            followedAt: f.createdAt
        }))

        return { success: true, data: followingWithStatus, total }
    } catch (error) {
        console.error('Error fetching following:', error)
        return { success: false, error: "Failed to fetch following" }
    }
}

// Check if current user follows a specific user
export async function checkFollowStatus(targetUserId: string) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return { success: true, isFollowing: false }
        }

        const follow = await prisma.userFollow.findUnique({
            where: {
                followerId_followingId: {
                    followerId: session.user.id,
                    followingId: targetUserId
                }
            }
        })

        return { success: true, isFollowing: !!follow }
    } catch (error) {
        console.error('Error checking follow status:', error)
        return { success: false, error: "Failed to check follow status" }
    }
}

// Get follow counts for a user
export async function getFollowCounts(userId: string) {
    try {
        const [followers, following] = await Promise.all([
            prisma.userFollow.count({ where: { followingId: userId } }),
            prisma.userFollow.count({ where: { followerId: userId } })
        ])

        return { 
            success: true, 
            data: { 
                followers, 
                following 
            } 
        }
    } catch (error) {
        console.error('Error fetching follow counts:', error)
        return { success: false, error: "Failed to fetch counts" }
    }
}

// Get suggested users to follow
export async function getSuggestedUsers(limit = 10) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" }
        }

        // Get users the current user is already following
        const currentFollowing = await prisma.userFollow.findMany({
            where: { followerId: session.user.id },
            select: { followingId: true }
        })
        const followingIds = currentFollowing.map(f => f.followingId)

        // Get users with most followers who current user isn't following
        const suggestedUsers = await prisma.user.findMany({
            where: {
                id: { 
                    notIn: [...followingIds, session.user.id] 
                }
            },
            select: {
                id: true,
                name: true,
                username: true,
                image: true,
                bio: true,
                _count: {
                    select: {
                        followers: true
                    }
                }
            },
            orderBy: {
                followers: {
                    _count: 'desc'
                }
            },
            take: limit
        })

        const usersWithFollowerCount = suggestedUsers.map(user => ({
            id: user.id,
            name: user.name,
            username: user.username,
            image: user.image,
            bio: user.bio,
            followerCount: user._count.followers,
            isFollowing: false
        }))

        return { success: true, data: usersWithFollowerCount }
    } catch (error) {
        console.error('Error fetching suggested users:', error)
        return { success: false, error: "Failed to fetch suggestions" }
    }
}