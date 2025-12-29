import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/prisma";
import bcryptjs from "bcryptjs";

export async function POST(request: NextRequest) {
    try {
        const { email, otp, password } = await request.json();

        if (!email || !otp || !password) {
            return NextResponse.json(
                { success: false, error: "Email, OTP, and new password are required" },
                { status: 400 }
            );
        }

        // Validate password
        if (password.length < 6) {
            return NextResponse.json(
                { success: false, error: "Password must be at least 6 characters" },
                { status: 400 }
            );
        }

        const user = await prisma.user.findFirst({
            where: {
                email,
                resetOTP: otp,
                resetOTPExpiry: {
                    gt: new Date()
                }
            }
        });

        if (!user) {
            return NextResponse.json(
                { success: false, error: "Invalid or expired reset code" },
                { status: 400 }
            );
        }

        // Hash new password
        const hashedPassword = await bcryptjs.hash(password, 10);

        // Update password and clear reset tokens
        await prisma.user.update({
            where: { id: user.id },
            data: {
                hashedPassword,
                resetOTP: null,
                resetOTPExpiry: null,
                resetToken: null,
                restTokenExpiry: null
            }
        });

        return NextResponse.json({
            success: true,
            message: "Password reset successfully"
        }, { status: 200 });
    } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        console.error("Reset password error:", error);
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}
