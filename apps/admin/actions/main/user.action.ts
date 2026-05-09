"use server"
/* eslint-disable @typescript-eslint/no-explicit-any */

import { db, users, creditTransactions, adminAuditLogs } from "@repo/db"
import { eq, and, gte, lte, ilike, or, count, inArray, sql } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { checkAdminAccess } from "../admin.action"
import { adminSendEmail as sendAdminEmail } from "@/lib/emails/adminemail"

// Types
interface UserFilters {
    search?: string
    role?: "all" | "Student" | "Admin"
    status?: "all" | "active" | "inactive"
    dateFrom?: Date
    dateTo?: Date
}

interface PaginationParams {
    page?: number
    limit?: number
}

interface AdminResponse<T = unknown> {
    success: boolean
    data?: T
    error?: string
}

// Get all users with filters and pagination
export async function getAllUsers(
    filters?: UserFilters,
    pagination?: PaginationParams
): Promise<AdminResponse<{ users: any[]; total: number; pages: number }>> {
    try {
        const { success, error } = await checkAdminAccess()
        if (!success) return { success: false, error }

        const page = pagination?.page || 1
        const limit = pagination?.limit || 10
        const offset = (page - 1) * limit

        const whereConditions = []

        if (filters?.search) {
            whereConditions.push(
                or(
                    ilike(users.name, `%${filters.search}%`),
                    ilike(users.email, `%${filters.search}%`),
                    ilike(users.username, `%${filters.search}%`)
                )
            )
        }

        if (filters?.role && filters.role !== "all") {
            whereConditions.push(eq(users.role, filters.role))
        }

        if (filters?.dateFrom) {
            whereConditions.push(gte(users.createdAt, filters.dateFrom))
        }
        if (filters?.dateTo) {
            whereConditions.push(lte(users.createdAt, filters.dateTo))
        }

        const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined

        const [userList, totalResult] = await Promise.all([
            db.query.users.findMany({
                where: whereClause,
                columns: {
                    id: true,
                    name: true,
                    email: true,
                    username: true,
                    image: true,
                    role: true,
                    credits: true,
                    currentXp: true,
                    currentLevel: true,
                    emailVerified: true,
                    createdAt: true,
                    onboardingCompleted: true,
                },
                orderBy: (t, { desc }) => [desc(t.createdAt)],
                limit,
                offset
            }),
            db.select({ total: count() }).from(users).where(whereClause)
        ])
        const total = totalResult[0]?.total ?? 0

        // Map to include status
        const usersWithStatus = userList.map(user => ({
            ...user,
            status: user.emailVerified ? "active" : "inactive",
        }))

        return {
            success: true,
            data: {
                users: usersWithStatus,
                total,
                pages: Math.ceil(total / limit),
            },
        }
    } catch (error) {
        console.error("Get all users error:", error)
        return { success: false, error: "Failed to fetch users" }
    }
}

// Get user by ID with full details
export async function getUserById(userId: string): Promise<AdminResponse<any>> {
    try {
        const { success, error } = await checkAdminAccess()
        if (!success) return { success: false, error }

        const user = await db.query.users.findFirst({
            where: eq(users.id, userId),
            with: {
                userSkills: true,
            }
        })

        if (!user) {
            return { success: false, error: "User not found" }
        }

        return { success: true, data: user }
    } catch (error) {
        console.error("Get user by ID error:", error)
        return { success: false, error: "Failed to fetch user" }
    }
}

// Update user role
export async function updateUserRole(
    userId: string,
    role: "Student" | "Admin"
): Promise<AdminResponse> {
    try {
        const accessCheck = await checkAdminAccess()
        if (!accessCheck.success) return { success: false, error: accessCheck.error }

        const adminRecord = accessCheck.data?.adminAccess

        // Only SUPER_ADMIN can change roles
        if (!adminRecord || adminRecord.adminRole !== "SUPER_ADMIN") {
            return { success: false, error: "Only super admins can change user roles" }
        }

        const [user] = await db.update(users)
            .set({ role })
            .where(eq(users.id, userId))
            .returning()

        // Create audit log
        await db.insert(adminAuditLogs).values({
            adminId: adminRecord.id,
            action: "UPDATE",
            module: "users",
            resourceType: "User",
            resourceId: userId,
            description: `Changed user role to ${role}`,
            changes: { role },
        })

        revalidatePath("/users")
        revalidatePath(`/users/${userId}`)

        return { success: true, data: user }
    } catch (error) {
        console.error("Update user role error:", error)
        return { success: false, error: "Failed to update user role" }
    }
}

// Update user credits
export async function updateUserCredits(
    userId: string,
    amount: number,
    reason: string
): Promise<AdminResponse> {
    try {
        const accessCheck = await checkAdminAccess()
        if (!accessCheck.success) return { success: false, error: accessCheck.error }

        const adminRecord = accessCheck.data?.adminAccess
        if (!adminRecord) return { success: false, error: "Admin record not found" }

        const user = await db.query.users.findFirst({
            where: eq(users.id, userId),
            columns: { credits: true, name: true, email: true }
        })

        if (!user) {
            return { success: false, error: "User not found" }
        }

        const newCredits = user.credits + amount

        if (newCredits < 0) {
            return { success: false, error: "Insufficient credits" }
        }

        // Update user credits
        const [updatedUser] = await db.update(users)
            .set({ credits: newCredits })
            .where(eq(users.id, userId))
            .returning()

        // Create credit transaction
        await db.insert(creditTransactions).values({
            userId,
            amount: Math.abs(amount),
            type: amount > 0 ? "BONUS" : "SPEND",
            description: reason,
            currency: "INR",
        })

        // Create audit log
        await db.insert(adminAuditLogs).values({
            adminId: adminRecord.id,
            action: "UPDATE",
            module: "users",
            resourceType: "User",
            resourceId: userId,
            description: `${amount > 0 ? "Added" : "Deducted"} ${Math.abs(amount)} credits: ${reason}`,
            changes: {
                before: user.credits,
                after: newCredits,
            },
        })

        revalidatePath("/users")
        revalidatePath(`/users/${userId}`)
        revalidatePath("/credits/transactions")

        return { success: true, data: updatedUser }
    } catch (error) {
        console.error("Update user credits error:", error)
        return { success: false, error: "Failed to update user credits" }
    }
}

// Suspend user (mark email as unverified)
export async function suspendUser(
    userId: string,
    reason: string
): Promise<AdminResponse> {
    try {
        const accessCheck = await checkAdminAccess()
        if (!accessCheck.success) return { success: false, error: accessCheck.error }

        const adminRecord = accessCheck.data?.adminAccess
        if (!adminRecord) return { success: false, error: "Admin record not found" }

        const [user] = await db.update(users)
            .set({ emailVerified: false })
            .where(eq(users.id, userId))
            .returning()

        // Create audit log
        await db.insert(adminAuditLogs).values({
            adminId: adminRecord.id,
            action: "UPDATE",
            module: "users",
            resourceType: "User",
            resourceId: userId,
            description: `Suspended user: ${reason}`,
        })

        revalidatePath("/users")
        revalidatePath(`/users/${userId}`)

        return { success: true, data: user }
    } catch (error) {
        console.error("Suspend user error:", error)
        return { success: false, error: "Failed to suspend user" }
    }
}

// Activate user
export async function activateUser(userId: string): Promise<AdminResponse> {
    try {
        const accessCheck = await checkAdminAccess()
        if (!accessCheck.success) return { success: false, error: accessCheck.error }

        const adminRecord = accessCheck.data?.adminAccess
        if (!adminRecord) return { success: false, error: "Admin record not found" }

        const [user] = await db.update(users)
            .set({ emailVerified: true })
            .where(eq(users.id, userId))
            .returning()

        // Create audit log
        await db.insert(adminAuditLogs).values({
            adminId: adminRecord.id,
            action: "UPDATE",
            module: "users",
            resourceType: "User",
            resourceId: userId,
            description: "Activated user account",
        })

        revalidatePath("/users")
        revalidatePath(`/users/${userId}`)

        return { success: true, data: user }
    } catch (error) {
        console.error("Activate user error:", error)
        return { success: false, error: "Failed to activate user" }
    }
}

// Delete user
export async function deleteUser(userId: string): Promise<AdminResponse> {
    try {
        const accessCheck = await checkAdminAccess()
        if (!accessCheck.success) return { success: false, error: accessCheck.error }

        const adminRecord = accessCheck.data?.adminAccess

        // Only SUPER_ADMIN can delete users
        if (!adminRecord || adminRecord.adminRole !== "SUPER_ADMIN") {
            return { success: false, error: "Only super admins can delete users" }
        }

        const user = await db.query.users.findFirst({
            where: eq(users.id, userId),
            columns: { email: true, name: true }
        })

        await db.delete(users).where(eq(users.id, userId))

        // Create audit log
        await db.insert(adminAuditLogs).values({
            adminId: adminRecord.id,
            action: "DELETE",
            module: "users",
            resourceType: "User",
            resourceId: userId,
            description: `Deleted user: ${user?.email}`,
        })

        revalidatePath("/users")

        return { success: true }
    } catch (error) {
        console.error("Delete user error:", error)
        return { success: false, error: "Failed to delete user" }
    }
}

// Bulk update users
export async function bulkUpdateUsers(
    userIds: string[],
    updates: {
        credits?: number
        addCredits?: number
        emailVerified?: boolean
    }
): Promise<AdminResponse> {
    try {
        const accessCheck = await checkAdminAccess()
        if (!accessCheck.success) return { success: false, error: accessCheck.error }

        const adminRecord = accessCheck.data?.adminAccess
        if (!adminRecord) return { success: false, error: "Admin record not found" }

        if (updates.addCredits !== undefined) {
            // Increment credits for each user individually
            await Promise.all(
                userIds.map(userId =>
                    db.update(users)
                        .set({ credits: sql`${users.credits} + ${updates.addCredits}` })
                        .where(eq(users.id, userId))
                )
            )
        } else {
            const updateData: any = {}
            if (updates.emailVerified !== undefined) {
                updateData.emailVerified = updates.emailVerified
            }
            if (updates.credits !== undefined) {
                updateData.credits = updates.credits
            }
            if (Object.keys(updateData).length > 0) {
                await db.update(users)
                    .set(updateData)
                    .where(inArray(users.id, userIds))
            }
        }

        // Create audit log
        await db.insert(adminAuditLogs).values({
            adminId: adminRecord.id,
            action: "UPDATE",
            module: "users",
            resourceType: "User",
            resourceId: userIds.join(","),
            description: `Bulk updated ${userIds.length} users`,
            changes: updates,
        })

        revalidatePath("/users")

        return { success: true }
    } catch (error) {
        console.error("Bulk update users error:", error)
        return { success: false, error: "Failed to bulk update users" }
    }
}

// Export users to CSV
export async function exportUsers(filters?: UserFilters): Promise<AdminResponse<string>> {
    try {
        const { success, error } = await checkAdminAccess()
        if (!success) return { success: false, error }

        const whereConditions = []

        if (filters?.search) {
            whereConditions.push(
                or(
                    ilike(users.name, `%${filters.search}%`),
                    ilike(users.email, `%${filters.search}%`)
                )
            )
        }

        if (filters?.role && filters.role !== "all") {
            whereConditions.push(eq(users.role, filters.role))
        }

        const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined

        const userList = await db.query.users.findMany({
            where: whereClause,
            columns: {
                id: true,
                name: true,
                email: true,
                username: true,
                role: true,
                credits: true,
                currentXp: true,
                currentLevel: true,
                emailVerified: true,
                createdAt: true,
            },
            orderBy: (t, { desc }) => [desc(t.createdAt)]
        })

        // Convert to CSV
        const headers = [
            "ID",
            "Name",
            "Email",
            "Username",
            "Role",
            "Credits",
            "XP",
            "Level",
            "Verified",
            "Joined",
        ]
        const rows = userList.map(user => [
            user.id,
            user.name || "",
            user.email,
            user.username || "",
            user.role,
            user.credits,
            user.currentXp,
            user.currentLevel,
            user.emailVerified ? "Yes" : "No",
            user.createdAt.toISOString(),
        ])

        const csv = [
            headers.join(","),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(",")),
        ].join("\n")

        return { success: true, data: csv }
    } catch (error) {
        console.error("Export users error:", error)
        return { success: false, error: "Failed to export users" }
    }
}

// Get user statistics
export async function getUserStats(): Promise<AdminResponse<any>> {
    try {
        const { success, error } = await checkAdminAccess()
        if (!success) return { success: false, error }

        const now = new Date()
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        const today = new Date(now.setHours(0, 0, 0, 0))

        const [
            totalUsersResult,
            verifiedUsersResult,
            adminUsersResult,
            newUsersThisMonthResult,
            activeTodayResult,
            allUsers,
        ] = await Promise.all([
            db.select({ totalUsers: count() }).from(users),
            db.select({ verifiedUsers: count() }).from(users).where(eq(users.emailVerified, true)),
            db.select({ adminUsers: count() }).from(users).where(eq(users.role, "Admin")),
            db.select({ newUsersThisMonth: count() }).from(users).where(gte(users.createdAt, thirtyDaysAgo)),
            db.select({ activeToday: count() }).from(users).where(gte(users.createdAt, today)),
            db.query.users.findMany({ columns: { credits: true, currentXp: true } }),
        ])
        const totalUsers = totalUsersResult[0]?.totalUsers ?? 0
        const verifiedUsers = verifiedUsersResult[0]?.verifiedUsers ?? 0
        const adminUsers = adminUsersResult[0]?.adminUsers ?? 0
        const newUsersThisMonth = newUsersThisMonthResult[0]?.newUsersThisMonth ?? 0
        const activeToday = activeTodayResult[0]?.activeToday ?? 0

        const totalCredits = allUsers.reduce((sum, u) => sum + (u.credits || 0), 0)
        const totalXP = allUsers.reduce((sum, u) => sum + (u.currentXp || 0), 0)

        return {
            success: true,
            data: {
                totalUsers,
                verifiedUsers,
                adminUsers,
                newUsersThisMonth,
                activeToday,
                totalCredits,
                totalXP,
                growthRate:
                    totalUsers > 0
                        ? Math.round((newUsersThisMonth / totalUsers) * 100)
                        : 0,
            },
        }
    } catch (error) {
        console.error("Get user stats error:", error)
        return { success: false, error: "Failed to fetch user statistics" }
    }
}

export async function adminSendEmail({ to, subject, text }: { to: string; subject: string; text: string }): Promise<AdminResponse> {
    const { success, error } = await checkAdminAccess()
    if (!success) return { success: false, error }

    return sendAdminEmail({ to, subject, text })
}
