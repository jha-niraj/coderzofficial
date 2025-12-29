import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/prisma";

export async function POST(request: NextRequest) {
    try {
        const { email, otp } = await request.json();

        if (!email || !otp) {
            return NextResponse.json(
                { success: false, error: "Email and OTP are required" },
                { status: 400 }
            );
        }

        const user = await prisma.user.findFirst({
            where: {
                email,
                verifyOTP: otp,
                verifyOTPExpiry: {
                    gt: new Date()
                }
            }
        });

        if (!user) {
            return NextResponse.json(
                { success: false, error: "Invalid or expired verification code" },
                { status: 400 }
            );
        }

        // Mark email as verified
        await prisma.user.update({
            where: { id: user.id },
            data: {
                emailVerified: true,
                verifyOTP: null,
                verifyOTPExpiry: null
            }
        });

        return NextResponse.json({
            success: true,
            message: "Email verified successfully",
            user: {
                id: user.id,
                email: user.email,
                name: user.name
            }
        }, { status: 200 });
    } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        console.error("Verify OTP error:", error);
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}
