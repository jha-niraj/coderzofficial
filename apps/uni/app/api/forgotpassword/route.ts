import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/utils/mail";
import { db, users } from "@repo/db";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json(
                { success: false, error: "Email is required" },
                { status: 400 }
            );
        }

        const user = await db.query.users.findFirst({
            where: eq(users.email, email),
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
        expiration.setMinutes(expiration.getMinutes() + 10);

        await db.update(users).set({
            resetOTP: otp,
            resetOTPExpiry: expiration,
        }).where(eq(users.email, email));

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
