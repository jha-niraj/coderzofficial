"use server"
/* eslint-disable @typescript-eslint/no-explicit-any */

import { db, users, adminAccess, adminInvitations, adminAuditLogs } from "@repo/db"
import { eq, gte, count } from "drizzle-orm"
import { getSession } from "@repo/auth"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import bcrypt from "bcryptjs"

// Types
interface CreateInvitationInput {
    email: string
    name?: string
    adminRole: "SUPER_ADMIN" | "CONTENT_ADMIN" | "FINANCE_ADMIN" | "COMMUNITY_ADMIN" | "MODULE_MANAGER" | "VIEWER"
    permissions?: Record<string, string[]>
}

interface AdminResponse<T = unknown> {
    success: boolean
    data?: T
    error?: string
}

// Generate a unique access code
function generateAccessCode(): string {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789" // Removed ambiguous chars
    let code = "ADMIN-"
    for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return code
}

// Check if current user is admin
export async function checkAdminAccess(): Promise<AdminResponse<{ isAdmin: boolean; adminAccess: any }>> {
    try {
        const session = await getSession(headers())

        if (!session?.user?.id) {
            return { success: false, error: "Not authenticated" }
        }

        const adminRecord = await db.query.adminAccess.findFirst({
            where: eq(adminAccess.userId, session.user.id)
        })

        if (!adminRecord || adminRecord.status !== "ACTIVE") {
            return { success: false, error: "Not authorized" }
        }

        return {
            success: true,
            data: {
                isAdmin: true,
                adminAccess: adminRecord
            }
        }
    } catch (error) {
        console.error("Admin access check error:", error)
        return { success: false, error: "Failed to check admin access" }
    }
}

// Get current admin info
export async function getCurrentAdmin(): Promise<AdminResponse<any>> {
    try {
        const session = await getSession(headers())

        if (!session?.user?.id) {
            return { success: false, error: "Not authenticated" }
        }

        const adminRecord = await db.query.adminAccess.findFirst({
            where: eq(adminAccess.userId, session.user.id),
            columns: { permissions: true }
        })

        if (!adminRecord) {
            return { success: false, error: "Not an admin" }
        }

        const user = await db.query.users.findFirst({
            where: eq(users.id, session.user.id),
            columns: { id: true, name: true, email: true, image: true }
        })

        return {
            success: true,
            data: {
                ...adminRecord,
                user
            }
        }
    } catch (error) {
        console.error("Get current admin error:", error)
        return { success: false, error: "Failed to get admin info" }
    }
}

// Get all admin users
export async function getAdminUsers(): Promise<AdminResponse<any[]>> {
    try {
        const { success, error } = await checkAdminAccess()
        if (!success) return { success: false, error }

        const admins = await db.query.adminAccess.findMany({
            with: {
                invitations: true,
            },
            orderBy: (t, { desc }) => [desc(t.createdAt)]
        })

        // Get user details for each admin
        const adminWithUsers = await Promise.all(
            admins.map(async (admin) => {
                const user = await db.query.users.findFirst({
                    where: eq(users.id, admin.userId),
                    columns: { id: true, name: true, email: true, image: true }
                })
                return { ...admin, user }
            })
        )

        return { success: true, data: adminWithUsers }
    } catch (error) {
        console.error("Get admin users error:", error)
        return { success: false, error: "Failed to fetch admin users" }
    }
}

// Create admin invitation
export async function createAdminInvitation(input: CreateInvitationInput): Promise<AdminResponse<any>> {
    try {
        const accessCheck = await checkAdminAccess()
        if (!accessCheck.success) return { success: false, error: accessCheck.error }

        const adminRecord = accessCheck.data?.adminAccess

        // Only SUPER_ADMIN can create invitations
        if (!adminRecord || adminRecord.adminRole !== "SUPER_ADMIN") {
            return { success: false, error: "Only super admins can create invitations" }
        }

        // Check if email already has admin access
        const existingUser = await db.query.users.findFirst({
            where: eq(users.email, input.email)
        })

        if (existingUser) {
            const existingAdmin = await db.query.adminAccess.findFirst({
                where: eq(adminAccess.userId, existingUser.id)
            })
            if (existingAdmin) {
                return { success: false, error: "User already has admin access" }
            }
        }

        // Check for existing pending invitation
        const existingInvite = await db.query.adminInvitations.findFirst({
            where: (t, { and, eq: eqOp }) => and(eqOp(t.email, input.email), eqOp(t.status, "PENDING"))
        })

        if (existingInvite) {
            return { success: false, error: "Pending invitation already exists for this email" }
        }

        // Create invitation
        const invitations = await db.insert(adminInvitations).values({
            email: input.email,
            name: input.name,
            code: generateAccessCode(),
            adminRole: input.adminRole,
            permissions: input.permissions || {},
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
            createdById: adminRecord.id
        }).returning()
        const invitation = invitations[0]
        if (!invitation) return { success: false, error: "Failed to create invitation" }

        // Log the action
        await db.insert(adminAuditLogs).values({
            adminId: adminRecord.id,
            action: "CREATE",
            module: "admin_management",
            resourceType: "AdminInvitation",
            resourceId: invitation.id,
            description: `Created invitation for ${input.email} with role ${input.adminRole}`
        })

        revalidatePath("/admins")
        revalidatePath("/admins/invitations")

        return { success: true, data: invitation }
    } catch (error) {
        console.error("Create invitation error:", error)
        return { success: false, error: "Failed to create invitation" }
    }
}

// Verify access code and create admin
export async function verifyAccessCode(email: string, accessCode: string): Promise<AdminResponse<any>> {
    try {
        // Find the invitation
        const invitation = await db.query.adminInvitations.findFirst({
            where: (t, { and, eq: eqOp }) => and(
                eqOp(t.email, email.toLowerCase()),
                eqOp(t.code, accessCode.toUpperCase()),
                eqOp(t.status, "PENDING")
            )
        })

        if (!invitation) {
            return { success: false, error: "Invalid access code" }
        }

        // Check if expired
        if (new Date() > invitation.expiresAt) {
            await db.update(adminInvitations)
                .set({ status: "EXPIRED" })
                .where(eq(adminInvitations.id, invitation.id))
            return { success: false, error: "Access code has expired" }
        }

        // Find or create user
        let user = await db.query.users.findFirst({
            where: eq(users.email, email.toLowerCase())
        })

        if (!user) {
            // Create user with temporary password (access code)
            const tempPassword = await bcrypt.hash(accessCode, 10)
            const newUsers = await db.insert(users).values({
                email: email.toLowerCase(),
                name: invitation.name || email.split("@")[0],
                hashedPassword: tempPassword,
                emailVerified: true,
                role: "Admin"
            }).returning()
            user = newUsers[0]
        }

        if (!user) {
            return { success: false, error: "Failed to create user" }
        }

        // Check if admin access already exists
        let adminAccessRecord = await db.query.adminAccess.findFirst({
            where: eq(adminAccess.userId, user.id)
        })

        if (!adminAccessRecord) {
            // Create admin access
            const newAdminAccesses = await db.insert(adminAccess).values({
                userId: user.id,
                adminRole: invitation.adminRole,
                permissions: invitation.permissions || {},
                status: "ACTIVE",
                inviteCode: accessCode
            }).returning()
            adminAccessRecord = newAdminAccesses[0]
        }

        if (!adminAccessRecord) {
            return { success: false, error: "Failed to create admin access" }
        }

        // Update invitation status
        await db.update(adminInvitations)
            .set({ status: "USED", usedBy: user.id, usedAt: new Date() })
            .where(eq(adminInvitations.id, invitation.id))

        // Create audit log
        await db.insert(adminAuditLogs).values({
            adminId: adminAccessRecord.id,
            action: "LOGIN",
            module: "admin_management",
            resourceType: "AdminAccess",
            resourceId: adminAccessRecord.id,
            description: `New admin ${email} activated via access code`
        })

        return {
            success: true,
            data: {
                user,
                adminAccess: adminAccessRecord,
                needsPasswordSetup: true
            }
        }
    } catch (error) {
        console.error("Verify access code error:", error)
        return { success: false, error: "Failed to verify access code" }
    }
}

// Get pending invitations
export async function getPendingInvitations(): Promise<AdminResponse<any[]>> {
    try {
        const { success, error } = await checkAdminAccess()
        if (!success) return { success: false, error }

        const invitations = await db.query.adminInvitations.findMany({
            where: eq(adminInvitations.status, "PENDING"),
            orderBy: (t, { desc }) => [desc(t.createdAt)]
        })

        return { success: true, data: invitations }
    } catch (error) {
        console.error("Get invitations error:", error)
        return { success: false, error: "Failed to fetch invitations" }
    }
}

// Revoke invitation
export async function revokeInvitation(invitationId: string): Promise<AdminResponse> {
    try {
        const accessCheck = await checkAdminAccess()
        if (!accessCheck.success) return { success: false, error: accessCheck.error }

        const adminRecord = accessCheck.data?.adminAccess

        if (!adminRecord || adminRecord.adminRole !== "SUPER_ADMIN") {
            return { success: false, error: "Only super admins can revoke invitations" }
        }

        await db.update(adminInvitations)
            .set({ status: "REVOKED" })
            .where(eq(adminInvitations.id, invitationId))

        await db.insert(adminAuditLogs).values({
            adminId: adminRecord.id,
            action: "DELETE",
            module: "admin_management",
            resourceType: "AdminInvitation",
            resourceId: invitationId,
            description: "Revoked admin invitation"
        })

        revalidatePath("/admins/invitations")

        return { success: true }
    } catch (error) {
        console.error("Revoke invitation error:", error)
        return { success: false, error: "Failed to revoke invitation" }
    }
}

// Update admin status
export async function updateAdminStatus(adminId: string, status: "ACTIVE" | "INACTIVE" | "SUSPENDED"): Promise<AdminResponse> {
    try {
        const accessCheck = await checkAdminAccess()
        if (!accessCheck.success) return { success: false, error: accessCheck.error }

        const adminRecord = accessCheck.data?.adminAccess

        if (!adminRecord || adminRecord.adminRole !== "SUPER_ADMIN") {
            return { success: false, error: "Only super admins can update admin status" }
        }

        await db.update(adminAccess)
            .set({ status })
            .where(eq(adminAccess.id, adminId))

        await db.insert(adminAuditLogs).values({
            adminId: adminRecord.id,
            action: "UPDATE",
            module: "admin_management",
            resourceType: "AdminAccess",
            resourceId: adminId,
            description: `Updated admin status to ${status}`
        })

        revalidatePath("/admins")

        return { success: true }
    } catch (error) {
        console.error("Update admin status error:", error)
        return { success: false, error: "Failed to update admin status" }
    }
}

// Update admin permissions
export async function updateAdminPermissions(adminId: string, permissions: Record<string, string[]>): Promise<AdminResponse> {
    try {
        const accessCheck = await checkAdminAccess()
        if (!accessCheck.success) return { success: false, error: accessCheck.error }

        const adminRecord = accessCheck.data?.adminAccess

        if (!adminRecord || adminRecord.adminRole !== "SUPER_ADMIN") {
            return { success: false, error: "Only super admins can update permissions" }
        }

        const previousAdmin = await db.query.adminAccess.findFirst({
            where: eq(adminAccess.id, adminId)
        })

        await db.update(adminAccess)
            .set({ permissions })
            .where(eq(adminAccess.id, adminId))

        await db.insert(adminAuditLogs).values({
            adminId: adminRecord.id,
            action: "UPDATE",
            module: "admin_management",
            resourceType: "AdminAccess",
            resourceId: adminId,
            description: "Updated admin permissions",
            changes: {
                before: previousAdmin?.permissions,
                after: permissions
            }
        })

        revalidatePath("/admins")

        return { success: true }
    } catch (error) {
        console.error("Update admin permissions error:", error)
        return { success: false, error: "Failed to update permissions" }
    }
}

// Get dashboard stats
export async function getDashboardStats(): Promise<AdminResponse<any>> {
    try {
        const { success, error } = await checkAdminAccess()
        if (!success) return { success: false, error }

        const now = new Date()
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        const today = new Date(now.setHours(0, 0, 0, 0))

        const [
            totalUsersResult,
            newUsersThisMonthResult,
            totalAdminsResult,
            activeTodayResult,
        ] = await Promise.all([
            db.select({ totalUsers: count() }).from(users),
            db.select({ newUsersThisMonth: count() }).from(users).where(gte(users.createdAt, thirtyDaysAgo)),
            db.select({ totalAdmins: count() }).from(adminAccess).where(eq(adminAccess.status, "ACTIVE")),
            db.select({ activeToday: count() }).from(users).where(gte(users.createdAt, today)),
        ])
        const totalUsers = totalUsersResult[0]?.totalUsers ?? 0
        const newUsersThisMonth = newUsersThisMonthResult[0]?.newUsersThisMonth ?? 0
        const totalAdmins = totalAdminsResult[0]?.totalAdmins ?? 0
        const activeToday = activeTodayResult[0]?.activeToday ?? 0

        // Calculate total credits
        let totalCredits = 0
        try {
            const result = await db.query.users.findMany({ columns: { credits: true } })
            totalCredits = result.reduce((sum, u) => sum + (u.credits || 0), 0)
        } catch {
            // ignore
        }

        return {
            success: true,
            data: {
                totalUsers,
                newUsersThisMonth,
                activeToday,
                totalAdmins,
                totalCredits,
                growthRate: totalUsers > 0 ? Math.round((newUsersThisMonth / totalUsers) * 100) : 0
            }
        }
    } catch (error) {
        console.error("Get dashboard stats error:", error)
        return { success: false, error: "Failed to fetch dashboard stats" }
    }
}

// Get audit logs
export async function getAuditLogs(page: number = 1, limit: number = 20): Promise<AdminResponse<any>> {
    try {
        const { success, error } = await checkAdminAccess()
        if (!success) return { success: false, error }

        const [logs, totalResult] = await Promise.all([
            db.query.adminAuditLogs.findMany({
                limit,
                offset: (page - 1) * limit,
                orderBy: (t, { desc }) => [desc(t.createdAt)],
                with: {
                    admin: {
                        columns: { userId: true }
                    }
                }
            }),
            db.select({ total: count() }).from(adminAuditLogs)
        ])
        const total = totalResult[0]?.total ?? 0

        // Get user details for each log
        const logsWithUser = await Promise.all(
            logs.map(async (log) => {
                const user = await db.query.users.findFirst({
                    where: eq(users.id, log.admin.userId),
                    columns: { name: true, email: true, image: true }
                })
                return { ...log, adminUser: user }
            })
        )

        return {
            success: true,
            data: {
                logs: logsWithUser,
                total,
                pages: Math.ceil(total / limit),
                currentPage: page
            }
        }
    } catch (error) {
        console.error("Get audit logs error:", error)
        return { success: false, error: "Failed to fetch audit logs" }
    }
}

// Set admin password (after initial access code login)
export async function setAdminPassword(newPassword: string): Promise<AdminResponse> {
    try {
        const session = await getSession(headers())

        if (!session?.user?.id) {
            return { success: false, error: "Not authenticated" }
        }

        const hashedPassword = await bcrypt.hash(newPassword, 12)

        await db.update(adminAccess)
            .set({ hashedPassword, accessCode: null, accessCodeExpiry: null })
            .where(eq(adminAccess.userId, session.user.id))

        // Also update user password
        await db.update(users)
            .set({ hashedPassword })
            .where(eq(users.id, session.user.id))

        return { success: true }
    } catch (error) {
        console.error("Set admin password error:", error)
        return { success: false, error: "Failed to set password" }
    }
}

// Change password with current password verification
export async function changeAdminPassword(currentPassword: string, newPassword: string): Promise<AdminResponse> {
    try {
        const session = await getSession(headers())
        if (!session?.user?.id) {
            return { success: false, error: "Not authenticated" }
        }

        const user = await db.query.users.findFirst({
            where: eq(users.id, session.user.id),
            columns: { id: true, hashedPassword: true }
        })
        if (!user || !user.hashedPassword) {
            return { success: false, error: "User not found" }
        }

        const valid = await bcrypt.compare(currentPassword, user.hashedPassword)
        if (!valid) {
            return { success: false, error: "Current password is incorrect" }
        }

        const hashedNew = await bcrypt.hash(newPassword, 12)
        await db.update(users).set({ hashedPassword: hashedNew }).where(eq(users.id, user.id))

        const adminRecord = await db.query.adminAccess.findFirst({ where: eq(adminAccess.userId, user.id) })
        if (adminRecord) {
            await db.insert(adminAuditLogs).values({
                adminId: adminRecord.id,
                action: "UPDATE",
                module: "admin_management",
                resourceType: "User",
                resourceId: user.id,
                description: "Changed password"
            })
        }

        return { success: true }
    } catch (error) {
        console.error("Change password error:", error)
        return { success: false, error: "Failed to change password" }
    }
}
