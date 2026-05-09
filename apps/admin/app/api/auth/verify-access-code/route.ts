import { NextRequest, NextResponse } from "next/server"
import { db, users, adminAccess, adminInvitations, adminAuditLogs } from "@repo/db"
import { eq, and } from "drizzle-orm"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
    try {
        const { email, accessCode } = await request.json()

        if (!email || !accessCode) {
            return NextResponse.json(
                { success: false, message: "Email and access code are required" },
                { status: 400 }
            )
        }

        // Find the invitation
        const invitation = await db.query.adminInvitations.findFirst({
            where: and(
                eq(adminInvitations.email, email.toLowerCase()),
                eq(adminInvitations.code, accessCode.toUpperCase()),
                eq(adminInvitations.status, "PENDING")
            )
        })

        if (!invitation) {
            return NextResponse.json(
                { success: false, message: "Invalid access code or email" },
                { status: 401 }
            )
        }

        // Check if expired
        if (new Date() > invitation.expiresAt) {
            await db.update(adminInvitations)
                .set({ status: "EXPIRED" })
                .where(eq(adminInvitations.id, invitation.id))
            return NextResponse.json(
                { success: false, message: "Access code has expired" },
                { status: 401 }
            )
        }

        // Find or create user
        let user = await db.query.users.findFirst({
            where: eq(users.email, email.toLowerCase())
        })

        if (!user) {
            // Create user with the access code as temporary password
            const hashedPassword = await bcrypt.hash(accessCode, 12)
            const newUsers = await db.insert(users).values({
                email: email.toLowerCase(),
                name: invitation.name || email.split("@")[0],
                hashedPassword,
                emailVerified: true,
                role: "Admin"
            }).returning()
            user = newUsers[0]
        } else {
            // Update password to access code for this login
            const hashedPassword = await bcrypt.hash(accessCode, 12)
            await db.update(users)
                .set({ hashedPassword, role: "Admin" })
                .where(eq(users.id, user.id))
        }

        if (!user) {
            return NextResponse.json({ success: false, message: "Failed to create user" }, { status: 500 })
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
            return NextResponse.json({ success: false, message: "Failed to create admin access" }, { status: 500 })
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
            description: `Admin ${email} logged in via access code`
        })

        return NextResponse.json({
            success: true,
            message: "Access code verified successfully",
            needsPasswordSetup: true
        })

    } catch (error) {
        console.error("Verify access code error:", error)
        return NextResponse.json(
            { success: false, message: "An error occurred" },
            { status: 500 }
        )
    }
}
