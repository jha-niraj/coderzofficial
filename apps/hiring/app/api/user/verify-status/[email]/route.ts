import { NextRequest, NextResponse } from 'next/server'
import { db, users } from '@repo/db'
import { eq } from 'drizzle-orm'

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ email: string }> }
) {
    try {
        const { email } = await params

        if (!email) {
            return NextResponse.json(
                { success: false, error: 'Email is required' },
                { status: 400 }
            )
        }

        const decodedEmail = decodeURIComponent(email)

        const user = await db.query.users.findFirst({
            where: eq(users.email, decodedEmail),
            columns: {
                id: true,
                email: true,
                name: true,
                emailVerified: true,
                onboardingCompleted: true
            }
        })

        if (!user) {
            return NextResponse.json(
                { success: false, error: 'User not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            ...user
        }, { status: 200 })
    } catch (error) {
        console.error('Error checking verification status:', error)
        return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500 }
        )
    }
}
