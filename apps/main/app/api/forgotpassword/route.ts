import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/utils/mail";
import { prisma } from "@repo/prisma";

export async function POST(request: NextRequest) {
    const { email, emailType } = await request.json();
    try {
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        if (emailType === "RESET_PASSWORD_OTP") {
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
        } else {
            // Legacy token-based reset (keep for backward compatibility)
            const token = Math.random().toString(36).substring(2);
            const expiration = new Date();
            expiration.setHours(expiration.getHours() + 72);

            await prisma.user.update({
                where: { email },
                data: {
                    resetToken: token,
                    restTokenExpiry: expiration,
                },
            });

            await sendEmail({ 
                name: user.name || "",
                email, 
                emailType, 
                token 
            });
        }

        return NextResponse.json({ message: "Email sent successfully." }, { status: 200 });
    } catch (error) {
        console.error("Error sending password reset email:", error);
        return NextResponse.json(
            { message: "Internal Server Error" },
            { status: 500 }
        );
    }
}