"use server"

import { prisma } from "@repo/prisma"
import { sendEmail } from "@/utils/mail"
import bcryptjs from "bcryptjs"

interface AuthResponse {
    success: boolean
    message?: string
    error?: string
}

export async function sendVerificationOTP(email: string): Promise<AuthResponse> {
    try {
        const user = await prisma.user.findUnique({
            where: { email }
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
        await prisma.user.update({
            where: { email },
            data: {
                verifyOTP: otp,
                verifyOTPExpiry: expiry
            }
        })

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
        const user = await prisma.user.findUnique({
            where: { email }
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
        await prisma.user.update({
            where: { email },
            data: {
                emailVerified: true,
                verifyOTP: null,
                verifyOTPExpiry: null,
                verifyToken: null,
                verifyTokenExpiry: null
            }
        })

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
        const user = await prisma.user.findUnique({
            where: { email }
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
        await prisma.user.update({
            where: { email },
            data: {
                verifyOTP: otp,
                verifyOTPExpiry: expiry
            }
        })

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
        const user = await prisma.user.findUnique({
            where: { email }
        })

        if (!user) {
            return { success: false, error: "User not found" }
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString()
        const expiry = new Date()
        expiry.setMinutes(expiry.getMinutes() + 10) // 10 minutes expiry

        // Update user with reset OTP
        await prisma.user.update({
            where: { email },
            data: {
                resetOTP: otp,
                resetOTPExpiry: expiry
            }
        })

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
        const user = await prisma.user.findUnique({
            where: { email }
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
        await prisma.user.update({
            where: { email },
            data: {
                hashedPassword,
                resetOTP: null,
                resetOTPExpiry: null,
                resetToken: null,
                restTokenExpiry: null
            }
        })

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
