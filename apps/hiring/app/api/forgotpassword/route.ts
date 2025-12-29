import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/utils/mail";
import { prisma } from "@repo/prisma";

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json(
                { success: false, error: "Email is required" },
                { status: 400 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            // For security, don't reveal if user exists or not
            return NextResponse.json(
                { success: true, message: "If the email exists, a reset code has been sent." },
                { status: 200 }
            );
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiration = new Date();
        expiration.setMinutes(expiration.getMinutes() + 10); // 10 minutes expiry

        await prisma.user.update({
            where: { email },
            data: {
                resetOTP: otp,
                resetOTPExpiry: expiration,
            },
        });

        await sendEmail({
            name: user.name || "",
            email,
            emailType: "RESET_PASSWORD_OTP",
            otp: otp
        });

        return NextResponse.json({
            success: true,
            message: "Reset code sent to your email."
        }, { status: 200 });
    } catch (error) {
        console.error("Error sending password reset email:", error);
        return NextResponse.json(
            { success: false, error: "Failed to send reset email" },
            { status: 500 }
        );
    }
}
