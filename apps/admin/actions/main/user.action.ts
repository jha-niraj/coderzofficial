"use server"

import { Currency } from "@repo/prisma/client"
import { revalidatePath } from "next/cache"
import { checkAdminAccess } from "../admin.action"
import { Resend } from "resend";
import { prisma } from "@repo/prisma"

const resend = new Resend(process.env.RESEND_API_KEY);

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
        const skip = (page - 1) * limit

        // Build where clause
        const where: any = {}

        if (filters?.search) {
            where.OR = [
                { name: { contains: filters.search, mode: "insensitive" } },
                { email: { contains: filters.search, mode: "insensitive" } },
                { username: { contains: filters.search, mode: "insensitive" } },
            ]
        }

        if (filters?.role && filters.role !== "all") {
            where.role = filters.role
        }

        if (filters?.dateFrom || filters?.dateTo) {
            where.createdAt = {}
            if (filters.dateFrom) where.createdAt.gte = filters.dateFrom
            if (filters.dateTo) where.createdAt.lte = filters.dateTo
        }

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                select: {
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
                orderBy: { createdAt: "desc" },
                skip,
                take: limit,
            }),
            prisma.user.count({ where }),
        ])

        // Map to include status
        const usersWithStatus = users.map(user => ({
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

        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                skills: true,
                certifications: true,
                recentActivity: {
                    take: 10,
                    orderBy: { createdAt: "desc" },
                },
                portfolioProjects: {
                    take: 5,
                    orderBy: { createdAt: "desc" },
                },
                creditTransactions: {
                    take: 10,
                    orderBy: { createdAt: "desc" },
                },
                achievements: true,
                adminAccess: true,
            },
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

        const adminAccess = accessCheck.data?.adminAccess

        // Only SUPER_ADMIN can change roles
        if (adminAccess.adminRole !== "SUPER_ADMIN") {
            return { success: false, error: "Only super admins can change user roles" }
        }

        const user = await prisma.user.update({
            where: { id: userId },
            data: { role },
        })

        // Create audit log
        await prisma.adminAuditLog.create({
            data: {
                adminId: adminAccess.id,
                action: "UPDATE",
                module: "users",
                resourceType: "User",
                resourceId: userId,
                description: `Changed user role to ${role}`,
                changes: { role },
            },
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

        const adminAccess = accessCheck.data?.adminAccess

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { credits: true, name: true, email: true },
        })

        if (!user) {
            return { success: false, error: "User not found" }
        }

        const newCredits = user.credits + amount

        if (newCredits < 0) {
            return { success: false, error: "Insufficient credits" }
        }

        // Update user credits
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { credits: newCredits },
        })

        // Create credit transaction
        await prisma.creditTransaction.create({
            data: {
                userId,
                amount: Math.abs(amount),
                type: amount > 0 ? "BONUS" : "SPEND",
                description: reason,
                currency: Currency.INR,
            },
        })

        // Create audit log
        await prisma.adminAuditLog.create({
            data: {
                adminId: adminAccess.id,
                action: "UPDATE",
                module: "users",
                resourceType: "User",
                resourceId: userId,
                description: `${amount > 0 ? "Added" : "Deducted"} ${Math.abs(amount)} credits: ${reason}`,
                changes: {
                    before: user.credits,
                    after: newCredits,
                },
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

        const adminAccess = accessCheck.data?.adminAccess

        const user = await prisma.user.update({
            where: { id: userId },
            data: { emailVerified: false },
        })

        // Create audit log
        await prisma.adminAuditLog.create({
            data: {
                adminId: adminAccess.id,
                action: "UPDATE",
                module: "users",
                resourceType: "User",
                resourceId: userId,
                description: `Suspended user: ${reason}`,
            },
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

        const adminAccess = accessCheck.data?.adminAccess

        const user = await prisma.user.update({
            where: { id: userId },
            data: { emailVerified: true },
        })

        // Create audit log
        await prisma.adminAuditLog.create({
            data: {
                adminId: adminAccess.id,
                action: "UPDATE",
                module: "users",
                resourceType: "User",
                resourceId: userId,
                description: "Activated user account",
            },
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

        const adminAccess = accessCheck.data?.adminAccess

        // Only SUPER_ADMIN can delete users
        if (adminAccess.adminRole !== "SUPER_ADMIN") {
            return { success: false, error: "Only super admins can delete users" }
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { email: true, name: true },
        })

        await prisma.user.delete({
            where: { id: userId },
        })

        // Create audit log
        await prisma.adminAuditLog.create({
            data: {
                adminId: adminAccess.id,
                action: "DELETE",
                module: "users",
                resourceType: "User",
                resourceId: userId,
                description: `Deleted user: ${user?.email}`,
            },
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

        const adminAccess = accessCheck.data?.adminAccess

        const updateData: any = {}
        if (updates.emailVerified !== undefined) {
            updateData.emailVerified = updates.emailVerified
        }
        if (updates.credits !== undefined) {
            updateData.credits = updates.credits
        }
        if (updates.addCredits !== undefined) {
            // Increment credits
            await prisma.$transaction(
                userIds.map(userId =>
                    prisma.user.update({
                        where: { id: userId },
                        data: { credits: { increment: updates.addCredits } },
                    })
                )
            )
        } else if (Object.keys(updateData).length > 0) {
            await prisma.user.updateMany({
                where: { id: { in: userIds } },
                data: updateData,
            })
        }

        // Create audit log
        await prisma.adminAuditLog.create({
            data: {
                adminId: adminAccess.id,
                action: "UPDATE",
                module: "users",
                resourceType: "User",
                resourceId: userIds.join(","),
                description: `Bulk updated ${userIds.length} users`,
                changes: updates,
            },
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

        // Build where clause
        const where: any = {}

        if (filters?.search) {
            where.OR = [
                { name: { contains: filters.search, mode: "insensitive" } },
                { email: { contains: filters.search, mode: "insensitive" } },
            ]
        }

        if (filters?.role && filters.role !== "all") {
            where.role = filters.role
        }

        const users = await prisma.user.findMany({
            where,
            select: {
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
            orderBy: { createdAt: "desc" },
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
        const rows = users.map(user => [
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
            totalUsers,
            verifiedUsers,
            adminUsers,
            newUsersThisMonth,
            activeToday,
            totalCredits,
            totalXP,
        ] = await Promise.all([
            prisma.user.count(),
            prisma.user.count({ where: { emailVerified: true } }),
            prisma.user.count({ where: { role: "Admin" } }),
            prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
            prisma.user.count({ where: { createdAt: { gte: today } } }),
            prisma.user.aggregate({ _sum: { credits: true } }),
            prisma.user.aggregate({ _sum: { currentXp: true } }),
        ])

        return {
            success: true,
            data: {
                totalUsers,
                verifiedUsers,
                adminUsers,
                newUsersThisMonth,
                activeToday,
                totalCredits: totalCredits._sum.credits || 0,
                totalXP: totalXP._sum.currentXp || 0,
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
    try {
        const { success, error } = await checkAdminAccess();
        if (!success) return { success: false, error };

        const result = await resend.emails.send({
            from: "The Coder'z <noreply@coderzai.xyz>",
            to,
            subject,
            text,
        });
        if (result.error) {
            return { success: false, error: result.error.message || "Failed to send email" };
        }
        return { success: true };
    } catch (err: any) {
        return { success: false, error: err.message || "Failed to send email" };
    }
}