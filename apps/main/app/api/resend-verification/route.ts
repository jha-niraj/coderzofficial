import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/prisma";
import { sendEmail } from "@/utils/mail";

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json({ message: "Email is required" }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        if (user.emailVerified) {
            return NextResponse.json({ message: "Email is already verified" }, { status: 400 });
        }

        // Generate new verification token
        const verifyToken = Math.random().toString(36).substring(2);
        const verifyTokenExpiry = new Date();
        verifyTokenExpiry.setHours(verifyTokenExpiry.getHours() + 72);

        // Update user with new token
        await prisma.user.update({
            where: { id: user.id },
            data: {
                verifyToken,
                verifyTokenExpiry
            }
        });

        // Send verification email
        try {
            await sendEmail({ 
                name: user.name || "", 
                email: user.email, 
                emailType: "VERIFY", 
                token: verifyToken 
            });
        } catch (emailError) {
            console.error("Failed to send verification email:", emailError);
            return NextResponse.json({ message: "Failed to send verification email" }, { status: 500 });
        }

        return NextResponse.json({ message: "Verification email sent successfully" }, { status: 200 });
    } catch (error: any) {
        console.error("Resend verification error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
} 