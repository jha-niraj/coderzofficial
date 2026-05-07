"use server"

import { db, users } from "@repo/db"
import { getSession } from "@repo/auth"
import { headers } from "next/headers"
import { sendEmail } from "@/utils/mail"
import bcryptjs from "bcryptjs"
import { eq } from "drizzle-orm"

interface AuthResponse {
    success: boolean
    message?: string
    error?: string
}

export async function sendVerificationOTP(email: string): Promise<AuthResponse> {
    try {
        const user = await db.query.users.findFirst({
            where: eq(users.email, email)
        })

        if (!user) {
            return { success: false, error: "User not found" }
        }

        if (user.emailVerified) {
            return { success: false, error: "Email already verified" }
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString()
        const expiry = new Date()
        expiry.setMinutes(expiry.getMinutes() + 10) // 10 minutes expiry

        // Update user with OTP
        await db.update(users).set({
            verifyOTP: otp,
            verifyOTPExpiry: expiry
        }).where(eq(users.email, email))

        // Send OTP email
        await sendEmail({
            name: user.name || "",
            email: user.email,
            emailType: "VERIFY_OTP",
            otp: otp
        })

        return { success: true, message: "Verification code sent to your email" }
    } catch (error) {
        console.error("Send verification OTP error:", error)
        return { success: false, error: "Failed to send verification code" }
    }
}

export async function verifyOTP(email: string, otp: string): Promise<AuthResponse> {
    try {
        const user = await db.query.users.findFirst({
            where: eq(users.email, email)
        })

        if (!user) {
            return { success: false, error: "User not found" }
        }

        if (user.emailVerified) {
            return { success: false, error: "Email already verified" }
        }

        if (!user.verifyOTP || !user.verifyOTPExpiry) {
            return { success: false, error: "No verification code found. Please request a new one." }
        }

        if (new Date() > user.verifyOTPExpiry) {
            return { success: false, error: "Verification code has expired. Please request a new one." }
        }

        if (user.verifyOTP !== otp) {
            return { success: false, error: "Invalid verification code" }
        }

        // Verify the user
        await db.update(users).set({
            emailVerified: true,
            verifyOTP: null,
            verifyOTPExpiry: null,
            verifyToken: null,
            verifyTokenExpiry: null
        }).where(eq(users.email, email))

        // Send welcome email
        await sendEmail({
            name: user.name || "",
            email: user.email,
            emailType: "WELCOME"
        })

        return { success: true, message: "Email verified successfully" }
    } catch (error) {
        console.error("Verify OTP error:", error)
        return { success: false, error: "Failed to verify code" }
    }
}

export async function resendVerificationOTP(email: string): Promise<AuthResponse> {
    try {
        const user = await db.query.users.findFirst({
            where: eq(users.email, email)
        })

        if (!user) {
            return { success: false, error: "User not found" }
        }

        if (user.emailVerified) {
            return { success: false, error: "Email already verified" }
        }

        // Generate new 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString()
        const expiry = new Date()
        expiry.setMinutes(expiry.getMinutes() + 10) // 10 minutes expiry

        // Update user with new OTP
        await db.update(users).set({
            verifyOTP: otp,
            verifyOTPExpiry: expiry
        }).where(eq(users.email, email))

        // Send OTP email
        await sendEmail({
            name: user.name || "",
            email: user.email,
            emailType: "VERIFY_OTP",
            otp: otp
        })

        return { success: true, message: "New verification code sent to your email" }
    } catch (error) {
        console.error("Resend verification OTP error:", error)
        return { success: false, error: "Failed to resend verification code" }
    }
}

export async function sendPasswordResetOTP(email: string): Promise<AuthResponse> {
    try {
        const user = await db.query.users.findFirst({
            where: eq(users.email, email)
        })

        if (!user) {
            return { success: false, error: "User not found" }
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString()
        const expiry = new Date()
        expiry.setMinutes(expiry.getMinutes() + 10) // 10 minutes expiry

        // Update user with reset OTP
        await db.update(users).set({
            resetOTP: otp,
            resetOTPExpiry: expiry
        }).where(eq(users.email, email))

        // Send reset OTP email
        await sendEmail({
            name: user.name || "",
            email: user.email,
            emailType: "RESET_PASSWORD_OTP",
            otp: otp
        })

        return { success: true, message: "Password reset code sent to your email" }
    } catch (error) {
        console.error("Send password reset OTP error:", error)
        return { success: false, error: "Failed to send password reset code" }
    }
}

export async function resetPasswordWithOTP(email: string, otp: string, newPassword: string): Promise<AuthResponse> {
    try {
        const user = await db.query.users.findFirst({
            where: eq(users.email, email)
        })

        if (!user) {
            return { success: false, error: "User not found" }
        }

        if (!user.resetOTP || !user.resetOTPExpiry) {
            return { success: false, error: "No password reset code found. Please request a new one." }
        }

        if (new Date() > user.resetOTPExpiry) {
            return { success: false, error: "Password reset code has expired. Please request a new one." }
        }

        if (user.resetOTP !== otp) {
            return { success: false, error: "Invalid password reset code" }
        }

        // Hash new password
        const hashedPassword = await bcryptjs.hash(newPassword, 10)

        // Update password and clear reset OTP
        await db.update(users).set({
            hashedPassword,
            resetOTP: null,
            resetOTPExpiry: null,
            resetToken: null,
            restTokenExpiry: null
        }).where(eq(users.email, email))

        // Send confirmation email
        await sendEmail({
            name: user.name || "",
            email: user.email,
            emailType: "CONFORMATION_MAIL"
        })

        return { success: true, message: "Password reset successfully" }
    } catch (error) {
        console.error("Reset password with OTP error:", error)
        return { success: false, error: "Failed to reset password" }
    }
}

export async function changePassword(
    currentPassword: string,
    newPassword: string
): Promise<AuthResponse> {
    try {
        const session = await getSession(headers())
        if (!session?.user?.email) {
            return { success: false, error: "Not authenticated" }
        }

        const user = await db.query.users.findFirst({
            where: eq(users.email, session.user.email)
        })

        if (!user) {
            return { success: false, error: "User not found" }
        }

        if (!user.hashedPassword) {
            return { success: false, error: "You signed up with a social account. Set a password first or use the provider to sign in." }
        }

        const isValid = await bcryptjs.compare(currentPassword, user.hashedPassword)
        if (!isValid) {
            return { success: false, error: "Current password is incorrect" }
        }

        if (newPassword.length < 8) {
            return { success: false, error: "New password must be at least 8 characters" }
        }

        const hashedPassword = await bcryptjs.hash(newPassword, 10)
        await db.update(users).set({
            hashedPassword,
            mustChangePassword: false,
        }).where(eq(users.email, session.user.email))

        return { success: true, message: "Password updated successfully" }
    } catch (error) {
        console.error("Change password error:", error)
        return { success: false, error: "Failed to update password" }
    }
}
