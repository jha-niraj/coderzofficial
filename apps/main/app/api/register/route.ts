import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { RequestBody } from "@/types";
import { ActivityType } from "@prisma/client";
import { Resend } from "resend";
import { 
    createSignupActivity, generateReferralCode, processReferral 
} from "@/utils/referral";
import { sendEmail } from "@/utils/mail";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
    console.log('=== API REGISTRATION START ===');
    try {
        const body: RequestBody = await request.json();
        const { name, email, password, referralCode } = body;
        console.log('Received registration data:', { name, email, referralCode: !!referralCode });

        if (!name || !email || !password) {
            console.log('❌ Missing required fields');
            return NextResponse.json(
                { message: "Missing required fields" },
                { status: 400 }
            );
        }

        console.log('Checking for existing user...');
        const existingUser = await prisma.user.findUnique({
            where: {
                email
            }
        })

        if (existingUser) {
            console.log('❌ User already exists');
            return NextResponse.json({ message: "User already exists with this email" }, { status: 501 });
        }

        console.log('Creating new user...');
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUserReferralCode = await generateReferralCode(name);

        const verifyOTP = Math.floor(100000 + Math.random() * 900000).toString();
        const verifyOTPExpiry = new Date();
        verifyOTPExpiry.setMinutes(verifyOTPExpiry.getMinutes() + 10); // 10 minutes expiry

        console.log('Generated referral code:', newUserReferralCode);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                hashedPassword,
                referralCode: newUserReferralCode,
                verifyOTP,
                verifyOTPExpiry,
                onboardingCompleted: false // User needs to complete onboarding
            }
        })
        console.log('✅ User created successfully:', user.id);

        if (referralCode) {
            console.log('Processing referral...');
            await processReferral(referralCode, user.id, name);
        } else {
            console.log('Creating signup activity...');
            await createSignupActivity(user.id);
        }

        // Send verification email
        console.log('Sending verification email...');
        try {
            await sendEmail({ 
                name: user.name || "", 
                email: user.email, 
                emailType: "VERIFY_OTP", 
                otp: verifyOTP 
            });
            console.log('✅ Verification email sent successfully');
        } catch (emailError) {
            console.error("❌ Failed to send verification email:", emailError);
            // Don't fail the registration if email fails
        }

        console.log('✅ Registration completed successfully');
        return NextResponse.json(
            {
                message: "User created successfully. Please check your email for the verification code.",
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                },
            },
            { status: 200 }
        );
    } catch (error: any) {
        console.error("❌ Registration API error:", error);
        console.error("❌ Error stack:", error.stack);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    } finally {
        console.log('=== API REGISTRATION END ===');
    }
}