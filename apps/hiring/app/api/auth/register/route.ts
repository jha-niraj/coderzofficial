import { db, users } from "@repo/db"
import { eq } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"
import bcryptjs from "bcryptjs"
import { sendEmail } from "@/utils/mail"

interface RegisterRequestBody {
    name: string
    email: string
    password: string
    companyName?: string
}

export async function POST(request: NextRequest) {
    console.log('=== HIRING PLATFORM REGISTRATION START ===')
    try {
        const body: RegisterRequestBody = await request.json()
        const { name, email, password, companyName } = body
        console.log('Received registration data:', { name, email, hasCompanyName: !!companyName })

        if (!name || !email || !password) {
            console.log('❌ Missing required fields')
            return NextResponse.json(
                { success: false, error: "Missing required fields" },
                { status: 400 }
            )
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { success: false, error: "Invalid email format" },
                { status: 400 }
            )
        }

        // Validate password strength
        if (password.length < 8) {
            return NextResponse.json(
                { success: false, error: "Password must be at least 8 characters" },
                { status: 400 }
            )
        }

        console.log('Checking for existing user...')
        const existingUser = await db.query.users.findFirst({
            where: eq(users.email, email),
            columns: { id: true }
        })

        if (existingUser) {
            console.log('❌ User already exists')
            return NextResponse.json(
                { success: false, error: "An account with this email already exists" },
                { status: 409 }
            )
        }

        console.log('Creating new user...')
        const hashedPassword = await bcryptjs.hash(password, 10)

        // Generate 6-digit OTP for email verification
        const verifyOTP = Math.floor(100000 + Math.random() * 900000).toString()
        const verifyOTPExpiry = new Date()
        verifyOTPExpiry.setMinutes(verifyOTPExpiry.getMinutes() + 10) // 10 minutes expiry

        const insertedUsers = await db.insert(users).values({
            name,
            email,
            hashedPassword,
            verifyOTP,
            verifyOTPExpiry,
            role: "HR", // Set HR role for hiring platform users
            onboardingCompleted: false,
            company: companyName || null // Store company name from registration
        }).returning()

        const user = insertedUsers[0]
        if (!user) {
            return NextResponse.json(
                { success: false, error: "Failed to create user" },
                { status: 500 }
            )
        }

        console.log('✅ User created successfully:', user.id)

        // Send verification email
        console.log('Sending verification email...')
        try {
            await sendEmail({
                name: user.name || "",
                email: user.email,
                emailType: "VERIFY_OTP",
                otp: verifyOTP
            })
            console.log('✅ Verification email sent successfully')
        } catch (emailError) {
            console.error("❌ Failed to send verification email:", emailError)
            // Don't fail the registration if email fails - user can resend
        }

        console.log('✅ Registration completed successfully')
        return NextResponse.json(
            {
                success: true,
                message: "Account created successfully. Please check your email for the verification code.",
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email
                }
            },
            { status: 200 }
        )
    } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error('Unknown error')
        console.error("❌ Registration API error:", error)
        console.error("❌ Error stack:", error.stack)
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        )
    } finally {
        console.log('=== HIRING PLATFORM REGISTRATION END ===')
    }
}
