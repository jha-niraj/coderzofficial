"use server"

import { db, follow, followRequest, users } from "@repo/db"
import { getSession } from "@repo/auth"
import { headers } from "next/headers"
import { eq, and } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export async function toggleFollow(targetUserId: string) {
    try {
        const session = await getSession(headers())
        if (!session?.user?.id) return { success: false, error: "Unauthorized" }

        const currentUserId = session.user.id
        if (currentUserId === targetUserId) return { success: false, error: "Cannot follow yourself" }

        const existing = await db.query.follow.findFirst({
            where: and(eq(follow.followerId, currentUserId), eq(follow.followingId, targetUserId)),
        })

        if (existing) {
            await db.delete(follow).where(
                and(eq(follow.followerId, currentUserId), eq(follow.followingId, targetUserId))
            )
            revalidatePath("/profile")
            return { success: true, isFollowing: false }
        }

        // Check if target user has a private profile — send request instead
        const target = await db.query.users.findFirst({
            where: eq(users.id, targetUserId),
            columns: { isPublicProfile: true },
        })

        if (!target?.isPublicProfile) {
            const existingReq = await db.query.followRequest.findFirst({
                where: and(eq(followRequest.senderId, currentUserId), eq(followRequest.receiverId, targetUserId)),
            })
            if (existingReq) return { success: true, isPending: true }

            await db.insert(followRequest).values({
                senderId: currentUserId,
                receiverId: targetUserId,
            })
            return { success: true, isPending: true }
        }

        await db.insert(follow).values({
            followerId: currentUserId,
            followingId: targetUserId,
        })
        revalidatePath("/profile")
        return { success: true, isFollowing: true }
    } catch (error) {
        console.error("toggleFollow error:", error)
        return { success: false, error: "Failed to update follow status" }
    }
}

export async function getFollowRequests() {
    try {
        const session = await getSession(headers())
        if (!session?.user?.id) return { success: false, requests: [] }

        const requests = await db.query.followRequest.findMany({
            where: eq(followRequest.receiverId, session.user.id),
            with: { sender: { columns: { id: true, name: true, image: true, username: true, headline: true, bio: true } } },
        })
        return { success: true, requests }
    } catch {
        return { success: false, requests: [] }
    }
}

export async function getSentFollowRequests() {
    try {
        const session = await getSession(headers())
        if (!session?.user?.id) return { success: false, requests: [] }

        const requests = await db.query.followRequest.findMany({
            where: eq(followRequest.senderId, session.user.id),
            with: { receiver: { columns: { id: true, name: true, image: true, username: true, headline: true, bio: true } } },
        })
        return { success: true, requests }
    } catch {
        return { success: false, requests: [] }
    }
}

export async function acceptFollowRequest(requestId: string) {
    try {
        const session = await getSession(headers())
        if (!session?.user?.id) return { success: false, error: "Unauthorized" }

        const req = await db.query.followRequest.findFirst({
            where: and(eq(followRequest.id, requestId), eq(followRequest.receiverId, session.user.id)),
        })
        if (!req) return { success: false, error: "Request not found" }

        await db.transaction(async (tx) => {
            await tx.delete(followRequest).where(eq(followRequest.id, requestId))
            await tx.insert(follow).values({
                followerId: req.senderId,
                followingId: req.receiverId,
            })
        })
        revalidatePath("/inbox/requests")
        return { success: true }
    } catch {
        return { success: false, error: "Failed to accept request" }
    }
}

export async function rejectFollowRequest(requestId: string) {
    try {
        const session = await getSession(headers())
        if (!session?.user?.id) return { success: false, error: "Unauthorized" }

        await db.delete(followRequest).where(
            and(eq(followRequest.id, requestId), eq(followRequest.receiverId, session.user.id))
        )
        revalidatePath("/inbox/requests")
        return { success: true }
    } catch {
        return { success: false, error: "Failed to reject request" }
    }
}

export async function cancelFollowRequest(requestId: string) {
    try {
        const session = await getSession(headers())
        if (!session?.user?.id) return { success: false, error: "Unauthorized" }

        await db.delete(followRequest).where(
            and(eq(followRequest.id, requestId), eq(followRequest.senderId, session.user.id))
        )
        return { success: true }
    } catch {
        return { success: false, error: "Failed to cancel request" }
    }
}

export async function checkFollowStatus(targetUserId: string) {
    try {
        const session = await getSession(headers())
        if (!session?.user?.id) return { isFollowing: false, isPending: false }

        const [isFollowing, isPending] = await Promise.all([
            db.query.follow.findFirst({
                where: and(eq(follow.followerId, session.user.id), eq(follow.followingId, targetUserId)),
            }),
            db.query.followRequest.findFirst({
                where: and(eq(followRequest.senderId, session.user.id), eq(followRequest.receiverId, targetUserId)),
            }),
        ])
        return { isFollowing: !!isFollowing, isPending: !!isPending }
    } catch {
        return { isFollowing: false, isPending: false }
    }
}
