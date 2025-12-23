// app/api/worker-token/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@repo/auth'
import crypto from 'crypto'
import { authOptions } from '@repo/auth'

// Secret only exists on server - NEVER expose as NEXT_PUBLIC_
const WORKER_SECRET = process.env.WORKER_SECRET!

interface TokenPayload {
    userId: string
    action: 'generate_project' | 'check_job'
    jobId?: string
    iat: number  // issued at
    exp: number  // expires at
}

function signPayload(payload: TokenPayload): string {
    const data = JSON.stringify(payload)
    const signature = crypto
        .createHmac('sha256', WORKER_SECRET)
        .update(data)
        .digest('base64url')

    // Token format: base64url(payload).signature
    const encodedPayload = Buffer.from(data).toString('base64url')
    return `${encodedPayload}.${signature}`
}

export async function POST(req: NextRequest) {
    try {
        // 1. Verify user is authenticated
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const body = await req.json()
        const { action, jobId } = body

        // 2. Validate action
        if (!['generate_project', 'check_job'].includes(action)) {
            return NextResponse.json(
                { error: 'Invalid action' },
                { status: 400 }
            )
        }

        // 3. Create payload with 5-minute expiration
        const now = Math.floor(Date.now() / 1000)
        const payload: TokenPayload = {
            userId: session.user.id,
            action,
            ...(jobId && { jobId }),
            iat: now,
            exp: now + 300, // 5 minutes
        }

        // 4. Sign and return token
        const token = signPayload(payload)

        return NextResponse.json({ token })
    } catch (error) {
        console.error('Token generation error:', error)
        return NextResponse.json(
            { error: 'Failed to generate token' },
            { status: 500 }
        )
    }
}