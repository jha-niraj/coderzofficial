import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/prisma";
import { sendEmail } from "@/utils/mail";

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
            where: { email }
        });

        if (!user) {
            return NextResponse.json(
                { success: false, error: "User not found" },
                { status: 404 }
            );
        }

        if (user.emailVerified) {
            return NextResponse.json(
                { success: false, error: "Email is already verified" },
                { status: 400 }
            );
        }

        // Generate new OTP
        const verifyOTP = Math.floor(100000 + Math.random() * 900000).toString();
        const verifyOTPExpiry = new Date();
        verifyOTPExpiry.setMinutes(verifyOTPExpiry.getMinutes() + 10); // 10 minutes expiry

        // Update user with new OTP
        await prisma.user.update({
            where: { id: user.id },
            data: {
                verifyOTP,
                verifyOTPExpiry
            }
        });

        // Send verification email
        try {
            await sendEmail({
                name: user.name || "",
                email: user.email,
                emailType: "VERIFY_OTP",
                otp: verifyOTP
            });
        } catch (emailError) {
            console.error("Failed to send verification email:", emailError);
            return NextResponse.json(
                { success: false, error: "Failed to send verification email" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Verification email sent successfully"
        }, { status: 200 });
    } catch (err: unknown) {
        console.error("Resend verification error:", err);
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}
