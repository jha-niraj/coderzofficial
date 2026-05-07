"use server"

import { db, adminAccess, adminAuditLogs, mockInterviewVoice, mockVoiceSession, mockVoiceRating } from "@repo/db"
import { eq, and, ilike, or, count, inArray, avg } from "drizzle-orm"
import { getSession } from "@repo/auth"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { hasPermission, type AdminPermissions, type AdminPermission, type PermissionLevel } from "@/lib/navigation"

interface Response<T = unknown> {
    success: boolean
    data?: T
    error?: string
}

// Helper to check admin access
async function checkAdminAccess(requiredModule: AdminPermission, requiredLevel: PermissionLevel) {
    const session = await getSession(headers())
    if (!session?.user?.id) {
        return { authorized: false, error: "Not authenticated" }
    }

    const adminRecord = await db.query.adminAccess.findFirst({
        where: eq(adminAccess.userId, session.user.id),
        with: { user: true }
    })

    if (!adminRecord || !hasPermission(adminRecord.permissions as AdminPermissions, requiredModule, requiredLevel)) {
        return { authorized: false, error: "Not authorized" }
    }

    return { authorized: true, adminAccess: adminRecord }
}

// Get all mock interviews with filters and pagination
export async function getAllMockInterviews(params?: {
    page?: number
    limit?: number
    search?: string
    status?: string
}): Promise<Response> {
    try {
        const check = await checkAdminAccess("mocks", "read")
        if (!check.authorized) {
            return { success: false, error: check.error }
        }

        const page = params?.page || 1
        const limit = params?.limit || 20
        const offset = (page - 1) * limit

        const whereConditions = []

        if (params?.search) {
            whereConditions.push(
                or(
                    ilike(mockInterviewVoice.title, `%${params.search}%`),
                    ilike(mockInterviewVoice.description, `%${params.search}%`)
                )
            )
        }

        const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined

        const [mocks, totalResult] = await Promise.all([
            db.query.mockInterviewVoice.findMany({
                where: whereClause,
                with: {
                    createdBy: {
                        columns: { id: true, name: true, username: true, image: true }
                    }
                },
                orderBy: (t, { desc }) => [desc(t.createdAt)],
                limit,
                offset
            }),
            db.select({ total: count() }).from(mockInterviewVoice).where(whereClause)
        ])
        const total = totalResult[0]?.total ?? 0

        return {
            success: true,
            data: {
                mocks,
                pagination: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit)
                }
            }
        }
    } catch (error) {
        console.error("Get mock interviews error:", error)
        return { success: false, error: "Failed to fetch mock interviews" }
    }
}

// Get mock interview by ID
export async function getMockInterviewById(id: string): Promise<Response> {
    try {
        const check = await checkAdminAccess("mocks", "read")
        if (!check.authorized) {
            return { success: false, error: check.error }
        }

        const mock = await db.query.mockInterviewVoice.findFirst({
            where: eq(mockInterviewVoice.id, id),
            with: {
                createdBy: {
                    columns: { id: true, name: true, username: true, image: true }
                }
            }
        })

        if (!mock) {
            return { success: false, error: "Mock interview not found" }
        }

        return { success: true, data: mock }
    } catch (error) {
        console.error("Get mock interview error:", error)
        return { success: false, error: "Failed to fetch mock interview" }
    }
}

// Delete mock interview
export async function deleteMockInterview(id: string): Promise<Response> {
    try {
        const check = await checkAdminAccess("mocks", "delete")
        if (!check.authorized) {
            return { success: false, error: check.error }
        }

        const mock = await db.query.mockInterviewVoice.findFirst({ where: eq(mockInterviewVoice.id, id) })
        if (!mock) {
            return { success: false, error: "Mock interview not found" }
        }

        await db.delete(mockInterviewVoice).where(eq(mockInterviewVoice.id, id))

        await db.insert(adminAuditLogs).values({
            adminId: check.adminAccess!.id,
            action: "DELETE",
            module: "mocks",
            resourceType: "MockInterview",
            resourceId: id,
            description: `Deleted mock interview: ${mock.title}`
        })

        revalidatePath("/mock")

        return { success: true, data: null }
    } catch (error) {
        console.error("Delete mock interview error:", error)
        return { success: false, error: "Failed to delete mock interview" }
    }
}

// Bulk delete mock interviews
export async function bulkDeleteMockInterviews(ids: string[]): Promise<Response> {
    try {
        const check = await checkAdminAccess("mocks", "delete")
        if (!check.authorized) {
            return { success: false, error: check.error }
        }

        await db.delete(mockInterviewVoice).where(inArray(mockInterviewVoice.id, ids))

        await db.insert(adminAuditLogs).values({
            adminId: check.adminAccess!.id,
            action: "DELETE",
            module: "mocks",
            resourceType: "MockInterview",
            resourceId: ids.join(","),
            description: `Bulk deleted ${ids.length} mock interviews`
        })

        revalidatePath("/mock")

        return { success: true, data: null }
    } catch (error) {
        console.error("Bulk delete mock interviews error:", error)
        return { success: false, error: "Failed to delete mock interviews" }
    }
}

// Get mock interview stats
export async function getMockInterviewStats(): Promise<Response> {
    try {
        const check = await checkAdminAccess("mocks", "read")
        if (!check.authorized) {
            return { success: false, error: check.error }
        }

        const [
            totalResult,
            completedResult,
            inProgressResult,
            cancelledResult,
            avgRatingResult,
        ] = await Promise.all([
            db.select({ total: count() }).from(mockInterviewVoice),
            db.select({ completed: count() }).from(mockVoiceSession).where(eq(mockVoiceSession.status, "COMPLETED")),
            db.select({ inProgress: count() }).from(mockVoiceSession).where(eq(mockVoiceSession.status, "IN_PROGRESS")),
            db.select({ cancelled: count() }).from(mockVoiceSession).where(eq(mockVoiceSession.status, "CANCELLED")),
            db.select({ avgRating: avg(mockVoiceRating.rating) }).from(mockVoiceRating),
        ])
        const total = totalResult[0]?.total ?? 0
        const completed = completedResult[0]?.completed ?? 0
        const inProgress = inProgressResult[0]?.inProgress ?? 0
        const cancelled = cancelledResult[0]?.cancelled ?? 0

        return {
            success: true,
            data: {
                total,
                completed,
                inProgress,
                cancelled,
                averageRating: avgRatingResult[0]?.avgRating ? Number(avgRatingResult[0].avgRating) : 0
            }
        }
    } catch (error) {
        console.error("Get mock interview stats error:", error)
        return { success: false, error: "Failed to fetch mock interview stats" }
    }
}
