import { NextRequest, NextResponse } from "next/server"
import { db, users } from "@repo/db"
import { eq, and, gt } from "drizzle-orm"

export async function POST(request: NextRequest) {
    try {
        const { email, otp } = await request.json()

        if (!email || !otp) {
            return NextResponse.json(
                { success: false, error: "Email and OTP are required" },
                { status: 400 }
            )
        }

        const user = await db.query.users.findFirst({
            where: and(
                eq(users.email, email),
                eq(users.verifyOTP, otp),
                gt(users.verifyOTPExpiry, new Date())
            ),
            columns: { id: true, email: true, name: true }
        })

        if (!user) {
            return NextResponse.json(
                { success: false, error: "Invalid or expired verification code" },
                { status: 400 }
            )
        }

        // Mark email as verified
        await db.update(users)
            .set({
                emailVerified: true,
                verifyOTP: null,
                verifyOTPExpiry: null
            })
            .where(eq(users.id, user.id))

        return NextResponse.json({
            success: true,
            message: "Email verified successfully",
            user: {
                id: user.id,
                email: user.email,
                name: user.name
            }
        }, { status: 200 })
    } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error('Unknown error')
        console.error("Verify OTP error:", error)
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        )
    }
}
